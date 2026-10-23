import { parseArgs } from 'node:util';
import { DEMO_ACCOUNTS } from '../../src/data/demoAccounts';
import { ensureAccount, setPassword } from './accounts';
import { asOwner, asUser, createPool } from './db';
import { migrate } from './migrate';
import { MIN_PASSWORD_LENGTH } from './passwords';

const usage = `Usage:
  node server/dist/cli.js migrate [--no-seed]
  node server/dist/cli.js bootstrap --admin-password <pw> [--admin-username admin] [--class "Kelas RMIK"] [--demo]

DATABASE_URL must point at the SIMRS database.`;

const [command, ...rest] = process.argv.slice(2);
const { values } = parseArgs({
  args: rest,
  options: {
    'no-seed': { type: 'boolean', default: false },
    'admin-username': { type: 'string', default: 'admin' },
    'admin-password': { type: 'string' },
    class: { type: 'string', default: 'Kelas RMIK' },
    demo: { type: 'boolean', default: false },
  },
});

if (!process.env.DATABASE_URL) throw new Error('Missing DATABASE_URL');
const db = createPool(process.env.DATABASE_URL);

try {
  if (command === 'migrate') {
    await migrate(db, process.env.DB_DIR ?? 'db', { seed: !values['no-seed'], log: console.log });
  } else if (command === 'bootstrap') {
    const password = values['admin-password'];
    if (!password || password.length < MIN_PASSWORD_LENGTH) throw new Error(`--admin-password of at least ${MIN_PASSWORD_LENGTH} characters is required`);
    // The real admin must never use a published demo password, also with --demo.
    if (DEMO_ACCOUNTS.some(a => a.p === password)) throw new Error('--admin-password must not be a demo preset password');
    const admin = await asOwner(db, tx => ensureAccount(tx, values['admin-username']!, 'Super Administrator', 'admin', password));
    console.log(`admin account "${admin.username}" ${admin.status}`);

    const existing = await asUser(db, admin.id, async tx =>
      (await tx.query('select id from public.my_classes() where name = $1', [values.class])).rows[0]?.id as string | undefined);
    const classId = existing ?? await asUser(db, admin.id, async tx =>
      (await tx.query('select public.create_class($1) as id', [values.class])).rows[0].id as string);
    console.log(`class "${values.class}" ${existing ? 'exists' : 'created'}: ${classId}`);

    if (values.demo) {
      // Demo presets (shown on the login screen when VITE_DEMO_MODE=true). Never for the real campus install.
      for (const acc of DEMO_ACCOUNTS.filter(a => a.accountType !== 'admin')) {
        await asOwner(db, async tx => {
          const a = await ensureAccount(tx, acc.u, acc.label, acc.accountType, acc.p);
          await setPassword(tx, a.id, acc.p);
          await tx.query('update public.profiles set must_change_password = false, active = true where id = $1', [a.id]);
          await tx.query(
            `insert into public.class_members (class_id, user_id, member_role, active) values ($1, $2, $3, true)
             on conflict (class_id, user_id) do update set active = true`,
            [classId, a.id, acc.accountType]);
        });
        console.log(`demo account ${acc.u}`);
      }
    }
  } else {
    console.log(usage);
    process.exitCode = command ? 1 : 0;
  }
} finally {
  await db.end();
}
