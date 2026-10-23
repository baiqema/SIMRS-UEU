import express, { type NextFunction, type Request, type Response } from 'express';
import { existsSync } from 'node:fs';
import path from 'node:path';
import jwt from 'jsonwebtoken';
import { SLICES } from '../../src/data-layer/slices';
import { validateRows } from '../../src/data-layer/roster';
import { ensureAccount, normalizeUsername, setPassword, USERNAME } from './accounts';
import { asOwner, asUser, type Db, type Tx } from './db';
import { errorHandler, HttpError } from './errors';
import { DUMMY_HASH, MIN_PASSWORD_LENGTH, verifyPassword } from './passwords';

export interface AppOptions {
  db: Db;
  jwtSecret: string;
  tokenTtl?: string;
  /** Folder with the built web app (vite build). Served with an SPA fallback when present. */
  staticDir?: string;
  /** Express "trust proxy" value: which reverse proxies may set X-Forwarded-For. */
  trustProxy?: string;
}

const TABLES = new Set<string>(Object.values(SLICES).map(s => s.table));
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAX_ROWS_PER_SAVE = 2000;

type Authed = Request & { userId: string };
type Handler = (req: Authed, res: Response) => Promise<unknown>;

// Async handlers: forward rejections to the error handler.
const h = (fn: Handler) => (req: Request, res: Response, next: NextFunction) =>
  fn(req as Authed, res).catch(next);

const uuidParam = (v: unknown, what = 'id'): string => {
  if (typeof v !== 'string' || !UUID.test(v)) throw new HttpError(400, `${what} tidak valid`);
  return v;
};

const tableParam = (v: unknown): string => {
  if (typeof v !== 'string' || !TABLES.has(v)) throw new HttpError(404, 'Tabel tidak dikenal');
  return v;
};

/**
 * Small in-memory limiter for failed logins. Per username it stops password guessing; per IP
 * the limit is much higher because a whole computer lab can share one address.
 */
function createLoginLimiter(limits = { user: 10, ip: 200 }, windowMs = 15 * 60_000) {
  const hits = new Map<string, { n: number; until: number }>();
  const max = (k: string) => (k.startsWith('ip:') ? limits.ip : limits.user);
  return {
    blocked(keys: string[]): boolean {
      const now = Date.now();
      return keys.some(k => { const e = hits.get(k); return !!e && e.until > now && e.n >= max(k); });
    },
    fail(keys: string[]): void {
      const now = Date.now();
      for (const k of keys) {
        const e = hits.get(k);
        if (!e || e.until <= now) hits.set(k, { n: 1, until: now + windowMs });
        else e.n += 1;
      }
      if (hits.size > 10_000) for (const [k, e] of hits) if (e.until <= now) hits.delete(k);
    },
    reset(keys: string[]): void { for (const k of keys) hits.delete(k); },
  };
}

async function loadProfile(tx: Tx, userId: string) {
  const { rows } = await tx.query(
    'select id, username, full_name, account_type, must_change_password, active from public.profiles where id = $1', [userId]);
  return rows[0] ?? null;
}

const myClasses = async (tx: Tx) => (await tx.query('select id, name from public.my_classes()')).rows;

async function loadSlices(tx: Tx, classId: string, tables: string[]) {
  const out: Record<string, unknown[]> = {};
  for (const t of tables) {
    const { rows } = await tx.query(
      `select data from public.${t} where class_id = $1 order by created_at desc, seq asc`, [classId]);
    out[t] = rows.map(r => r.data);
  }
  return out;
}

export function createApp(opts: AppOptions) {
  const { db, jwtSecret, tokenTtl = '12h' } = opts;
  const app = express();
  const limiter = createLoginLimiter();
  app.disable('x-powered-by');
  app.set('trust proxy', opts.trustProxy ?? 'loopback');

  const api = express.Router();
  api.use(express.json({ limit: '10mb' }));

  api.get('/health', h(async (_req, res) => {
    await db.query('select 1');
    res.json({ ok: true });
  }));

  // ---- Authentication -------------------------------------------------------

  api.post('/auth/login', h(async (req, res) => {
    const username = normalizeUsername(String(req.body?.username ?? ''));
    const password = String(req.body?.password ?? '');
    const keys = [`u:${username}`, `ip:${req.ip}`];
    if (limiter.blocked(keys)) throw new HttpError(429, 'Terlalu banyak percobaan masuk. Coba lagi dalam 15 menit.');
    if (!USERNAME.test(username) || !password) throw new HttpError(401, 'Username/NIM atau password salah');

    const row = await asOwner(db, async tx => (await tx.query(
      `select p.id, p.active, u.password_hash from public.profiles p join auth.users u on u.id = p.id
       where p.username = $1`, [username])).rows[0]);
    const ok = await verifyPassword(password, row?.password_hash ?? DUMMY_HASH);
    if (!row || !ok) { limiter.fail(keys); throw new HttpError(401, 'Username/NIM atau password salah'); }
    limiter.reset([`u:${username}`]);
    if (!row.active) throw new HttpError(403, 'Akun non-aktif. Hubungi dosen atau admin.');

    const { profile, classes } = await asUser(db, row.id, async tx => ({
      profile: await loadProfile(tx, row.id), classes: await myClasses(tx),
    }));
    if (classes.length === 0) throw new HttpError(403, 'Akun Anda belum terdaftar di kelas mana pun. Hubungi dosen.');
    const token = jwt.sign({}, jwtSecret, { subject: row.id, expiresIn: tokenTtl as jwt.SignOptions['expiresIn'], algorithm: 'HS256' });
    res.json({ token, profile, classes });
  }));

  // Everything below needs a valid token.
  api.use((req, _res, next) => {
    const m = /^Bearer (.+)$/.exec(req.headers.authorization ?? '');
    if (!m) { next(new HttpError(401, 'Belum masuk')); return; }
    try {
      const claims = jwt.verify(m[1], jwtSecret, { algorithms: ['HS256'] }) as jwt.JwtPayload;
      if (!claims.sub || !UUID.test(claims.sub)) throw new Error('bad subject');
      (req as Authed).userId = claims.sub;
      next();
    } catch {
      next(new HttpError(401, 'Sesi berakhir. Silakan masuk kembali.'));
    }
  });

  api.get('/auth/me', h(async (req, res) => {
    const out = await asUser(db, req.userId, async tx => {
      const profile = await loadProfile(tx, req.userId);
      if (!profile?.active) return null;
      const { rows } = await tx.query('select id, class_id, role_id from public.my_practice_session()');
      return { profile, session: rows[0] ?? null, classes: await myClasses(tx) };
    });
    if (!out) throw new HttpError(401, 'Akun non-aktif');
    res.json(out);
  }));

  api.post('/auth/password', h(async (req, res) => {
    const password = String(req.body?.password ?? '');
    if (password.length < MIN_PASSWORD_LENGTH) throw new HttpError(400, `Password minimal ${MIN_PASSWORD_LENGTH} karakter`);
    await asOwner(db, tx => setPassword(tx, req.userId, password));
    await asUser(db, req.userId, tx => tx.query('select public.clear_must_change_password()'));
    res.json({ ok: true });
  }));

  // ---- Practice sessions ----------------------------------------------------

  api.post('/practice-session', h(async (req, res) => {
    const classId = uuidParam(req.body?.classId, 'Kelas');
    const roleId = String(req.body?.roleId ?? '');
    const session = await asUser(db, req.userId, async tx => (await tx.query(
      'select id, class_id, role_id from public.start_practice_session($1::uuid, $2)', [classId, roleId])).rows[0]);
    res.json(session);
  }));

  api.delete('/practice-session', h(async (req, res) => {
    await asUser(db, req.userId, tx => tx.query('select public.end_practice_session()'));
    res.json({ ok: true });
  }));

  api.post('/events', h(async (req, res) => {
    const { action, entity, entityId, details } = req.body ?? {};
    await asUser(db, req.userId, tx => tx.query('select public.log_event($1, $2, $3, $4::jsonb)',
      [String(action ?? ''), String(entity ?? ''), String(entityId ?? ''), details == null ? null : JSON.stringify(details)]));
    res.json({ ok: true });
  }));

  // ---- Roles ----------------------------------------------------------------

  api.get('/practice-roles', h(async (req, res) => {
    res.json(await asUser(db, req.userId, async tx =>
      (await tx.query('select id, name, access from public.practice_roles order by id')).rows));
  }));

  api.put('/practice-roles/:id', h(async (req, res) => {
    const access = req.body?.access;
    if (!Array.isArray(access) || !access.every(a => typeof a === 'string')) throw new HttpError(400, 'access harus berupa daftar modul');
    const updated = await asUser(db, req.userId, async tx => (await tx.query(
      'update public.practice_roles set access = $2 where id = $1 returning id', [req.params.id, access])).rowCount);
    if (!updated) throw new HttpError(403, '42501: hanya admin yang dapat mengubah hak akses');
    res.json({ ok: true });
  }));

  // ---- Classes --------------------------------------------------------------

  api.get('/classes', h(async (req, res) => {
    res.json(await asUser(db, req.userId, myClasses));
  }));

  api.post('/classes', h(async (req, res) => {
    const name = String(req.body?.name ?? '').trim();
    if (!name) throw new HttpError(400, 'Nama kelas wajib diisi');
    const id = await asUser(db, req.userId, async tx =>
      (await tx.query('select public.create_class($1) as id', [name])).rows[0].id);
    res.json({ id });
  }));

  api.post('/classes/:classId/reset', h(async (req, res) => {
    const classId = uuidParam(req.params.classId, 'Kelas');
    await asUser(db, req.userId, tx => tx.query('select public.reset_class($1::uuid)', [classId]));
    res.json({ ok: true });
  }));

  api.get('/classes/:classId/members', h(async (req, res) => {
    const classId = uuidParam(req.params.classId, 'Kelas');
    res.json(await asUser(db, req.userId, async tx => (await tx.query(
      `select p.id, p.username, p.full_name, m.member_role, m.active
       from public.class_members m join public.profiles p on p.id = m.user_id
       where m.class_id = $1 order by p.full_name`, [classId])).rows));
  }));

  api.put('/classes/:classId/members/:userId', h(async (req, res) => {
    const classId = uuidParam(req.params.classId, 'Kelas');
    const userId = uuidParam(req.params.userId, 'Anggota');
    if (typeof req.body?.active !== 'boolean') throw new HttpError(400, 'active harus true atau false');
    await asUser(db, req.userId, tx => tx.query('select public.set_member_active($1::uuid, $2::uuid, $3)',
      [classId, userId, req.body.active]));
    res.json({ ok: true });
  }));

  api.get('/classes/:classId/audit', h(async (req, res) => {
    const classId = uuidParam(req.params.classId, 'Kelas');
    const after = req.query.after === undefined ? null : Number(req.query.after);
    if (after !== null && !Number.isSafeInteger(after)) throw new HttpError(400, 'after tidak valid');
    res.json(await asUser(db, req.userId, async tx => (await tx.query(
      `select * from public.audit_log where class_id = $1 and ($2::bigint is null or id > $2)
       order by id desc limit 500`, [classId, after])).rows));
  }));

  // ---- Class data (one table per app list) ----------------------------------

  api.get('/classes/:classId/data', h(async (req, res) => {
    const classId = uuidParam(req.params.classId, 'Kelas');
    res.json(await asUser(db, req.userId, tx => loadSlices(tx, classId, [...TABLES])));
  }));

  api.get('/classes/:classId/data/:table', h(async (req, res) => {
    const classId = uuidParam(req.params.classId, 'Kelas');
    const table = tableParam(req.params.table);
    res.json((await asUser(db, req.userId, tx => loadSlices(tx, classId, [table])))[table]);
  }));

  // Saves the difference the app computed: rows to upsert and ids to delete, all or nothing.
  api.post('/classes/:classId/data/:table', h(async (req, res) => {
    const classId = uuidParam(req.params.classId, 'Kelas');
    const table = tableParam(req.params.table);
    const upserts: unknown = req.body?.upserts ?? [];
    const deletes: unknown = req.body?.deletes ?? [];
    if (!Array.isArray(upserts) || !Array.isArray(deletes)) throw new HttpError(400, 'upserts dan deletes harus berupa daftar');
    if (upserts.length + deletes.length > MAX_ROWS_PER_SAVE) throw new HttpError(413, 'Terlalu banyak baris dalam satu simpan');
    for (const r of upserts) {
      if (!r || typeof r !== 'object' || Array.isArray(r) || typeof (r as { id?: unknown }).id !== 'string') {
        throw new HttpError(400, 'Setiap baris harus objek dengan id teks');
      }
    }
    if (!deletes.every(d => typeof d === 'string')) throw new HttpError(400, 'deletes harus berupa daftar id');

    await asUser(db, req.userId, async tx => {
      if (upserts.length > 0) {
        await tx.query(
          `insert into public.${table} (class_id, id, data)
           select $1, x->>'id', x from jsonb_array_elements($2::jsonb) x
           on conflict (class_id, id) do update set data = excluded.data`,
          [classId, JSON.stringify(upserts)]);
      }
      if (deletes.length > 0) {
        const { rowCount } = await tx.query(
          `delete from public.${table} where class_id = $1 and id = any($2::text[])`, [classId, deletes]);
        // RLS hides rows the role may not delete instead of raising; a short count means refused.
        if ((rowCount ?? 0) < new Set(deletes).size) throw new HttpError(403, '42501: hapus ditolak');
      }
    });
    res.json({ ok: true });
  }));

  // ---- Accounts and rosters -------------------------------------------------

  async function caller(userId: string) {
    const me = await asOwner(db, tx => loadProfile(tx, userId));
    if (!me?.active) throw new HttpError(403, 'Akun tidak aktif');
    return me as { account_type: string };
  }

  api.post('/accounts/dosen', h(async (req, res) => {
    const me = await caller(req.userId);
    if (me.account_type !== 'admin') throw new HttpError(403, 'Hanya admin yang dapat membuat akun dosen');
    const username = String(req.body?.username ?? '');
    const name = String(req.body?.name ?? '').trim();
    if (!name || name.length > 120) throw new HttpError(400, 'Nama wajib diisi (maks. 120 karakter)');
    const acc = await asOwner(db, tx => ensureAccount(tx, username, name, 'dosen'))
      .catch(e => { throw e instanceof HttpError ? e : new HttpError(400, (e as Error).message); });
    res.json({ accounts: [{ username: acc.username, name: acc.name, status: acc.status, tempPassword: acc.tempPassword }] });
  }));

  api.post('/classes/:classId/roster', h(async (req, res) => {
    const classId = uuidParam(req.params.classId, 'Kelas');
    const me = await caller(req.userId);
    let rows;
    try { rows = validateRows(req.body?.rows); } catch (e) { throw new HttpError(400, (e as Error).message); }

    const accounts = await asOwner(db, async tx => {
      const { rows: [cls] } = await tx.query('select id, is_template from public.classes where id = $1', [classId]);
      if (!cls || cls.is_template) throw new HttpError(400, 'Kelas tidak ditemukan');
      if (me.account_type !== 'admin') {
        const { rows: [m] } = await tx.query(
          'select member_role, active from public.class_members where class_id = $1 and user_id = $2', [classId, req.userId]);
        if (!m?.active || m.member_role !== 'dosen') throw new HttpError(403, 'Hanya dosen kelas ini yang dapat mengimpor');
      }

      type Out = { username: string; name: string; status: 'created' | 'existing' | 'skipped' | 'failed'; tempPassword: string | null; message?: string };
      const out: Out[] = [];
      for (const r of rows) {
        await tx.query('savepoint roster_row');
        try {
          const acc = await ensureAccount(tx, r.nim, r.name, 'mahasiswa');
          const pub = { username: acc.username, name: acc.name, tempPassword: acc.tempPassword };
          if (acc.accountType !== 'mahasiswa') {
            out.push({ ...pub, status: 'skipped', message: 'Akun ini bukan akun mahasiswa' });
          } else {
            const { rows: [mem] } = await tx.query(
              'select member_role, active from public.class_members where class_id = $1 and user_id = $2', [classId, acc.id]);
            if (mem?.member_role === 'dosen') out.push({ ...pub, status: 'skipped', message: 'Akun ini dosen di kelas ini' });
            else if (mem && !mem.active) out.push({ ...pub, status: 'skipped', message: 'Anggota nonaktif — aktifkan secara manual' });
            else if (mem) out.push({ ...pub, status: 'existing' });
            else {
              await tx.query(
                `insert into public.class_members (class_id, user_id, member_role, active) values ($1, $2, 'mahasiswa', true)`,
                [classId, acc.id]);
              out.push({ ...pub, status: acc.status });
            }
          }
          await tx.query('release savepoint roster_row');
        } catch (e) {
          await tx.query('rollback to savepoint roster_row');
          console.error('roster row failed', r.nim, (e as Error).message);
          out.push({ username: r.nim, name: r.name, status: 'failed', tempPassword: null, message: 'Gagal memproses baris ini' });
        }
      }
      await tx.query(
        `insert into public.audit_log (class_id, actor_id, actor_name, action, entity, entity_id, module, details)
         select $1::uuid, p.id, p.full_name, 'CREATE', 'RosterImport', $1::text, 'manajemenuser', $3::jsonb
         from public.profiles p where p.id = $2`,
        [classId, req.userId, JSON.stringify({ created: out.filter(a => a.status === 'created').length, rows: out.length })]);
      return out;
    });
    res.json({ accounts });
  }));

  api.use((_req, _res, next) => next(new HttpError(404, 'Tidak ditemukan')));
  api.use(errorHandler);
  app.use('/api', api);

  if (opts.staticDir && existsSync(path.join(opts.staticDir, 'index.html'))) {
    const dir = path.resolve(opts.staticDir);
    app.use(express.static(dir, { index: false, maxAge: '1h' }));
    app.get('*', (_req, res) => res.sendFile(path.join(dir, 'index.html')));
  }
  return app;
}
