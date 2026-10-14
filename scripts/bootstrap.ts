import { createClient } from '@supabase/supabase-js';
import { parseArgs } from 'node:util';
import { DEMO_ACCOUNTS } from '../src/data/demoAccounts';

const DOMAIN = 'users.simrs-ueu.invalid';
const { values } = parseArgs({
  options: {
    env: { type: 'string', default: '.env.bootstrap.local' },
    'admin-username': { type: 'string', default: 'admin' },
    'admin-password': { type: 'string' },
    class: { type: 'string', default: 'Kelas Demo RMIK' },
    demo: { type: 'boolean', default: false },
  },
});

process.loadEnvFile(values.env!);
const url = process.env.SUPABASE_URL ?? process.env.SUPABASE_TEST_URL;
const service = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_TEST_SERVICE_ROLE_KEY;
const anonKey = process.env.SUPABASE_ANON_KEY ?? process.env.SUPABASE_TEST_ANON_KEY;
if (!url || !service || !anonKey) throw new Error('Env file must define SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY');

const admin = createClient(url, service, { auth: { persistSession: false } });

async function ensure(username: string, password: string, name: string, type: 'admin' | 'dosen' | 'mahasiswa') {
  const { data: existing } = await admin.from('profiles').select('id').eq('username', username).maybeSingle();
  if (existing) return existing.id as string;
  const { data, error } = await admin.auth.admin.createUser({ email: `${username}@${DOMAIN}`, password, email_confirm: true });
  if (error) throw error;
  const { error: pErr } = await admin.from('profiles').insert({ id: data.user.id, username, full_name: name, account_type: type });
  if (pErr) throw pErr;
  return data.user.id;
}

const adminUsername = values['admin-username']!;
const adminPassword = values['admin-password'];
// Always required, also with --demo: the real admin must never use the public demo password.
if (!adminPassword) throw new Error('--admin-password is required');
if (DEMO_ACCOUNTS.some(a => a.p === adminPassword)) throw new Error('--admin-password must not be a demo preset password');
await ensure(adminUsername, adminPassword, 'Super Administrator', 'admin');

const asAdmin = createClient(url, anonKey, { auth: { persistSession: false } });
const { error: sErr } = await asAdmin.auth.signInWithPassword({ email: `${adminUsername}@${DOMAIN}`, password: adminPassword });
if (sErr) throw sErr;
const { data: classId, error: cErr } = await asAdmin.rpc('create_class', { p_name: values.class });
if (cErr) throw cErr;
console.log(`Class "${values.class}" created: ${classId}`);

if (values.demo) {
  // The admin preset is not created: in Supabase mode the admin is the real account above.
  for (const acc of DEMO_ACCOUNTS.filter(a => a.accountType !== 'admin' && a.u !== adminUsername)) {
    const id = await ensure(acc.u, acc.p, acc.label, acc.accountType);
    // Presets must log in with the published password: reset it on every run.
    const { error: uErr } = await admin.auth.admin.updateUserById(id, { password: acc.p });
    if (uErr) throw uErr;
    const { error: mErr } = await admin.from('profiles').update({ must_change_password: false, active: true }).eq('id', id);
    if (mErr) throw mErr;
    const { error: cmErr } = await admin.from('class_members').upsert(
      { class_id: classId, user_id: id, member_role: acc.accountType, active: true },
      { onConflict: 'class_id,user_id' },
    );
    if (cmErr) throw cmErr;
    console.log(`demo account ready: ${acc.u}`);
  }
}
