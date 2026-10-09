import { createClient, type SupabaseClient } from 'npm:@supabase/supabase-js@2';
import { validateRows } from './validate.ts';

const EMAIL_DOMAIN = 'users.simrs-ueu.invalid';
const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } });

function tempPassword(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  return Array.from(crypto.getRandomValues(new Uint8Array(10)), b => alphabet[b % alphabet.length]).join('');
}

async function ensureAccount(admin: SupabaseClient, username: string, name: string, type: 'dosen' | 'mahasiswa') {
  const uname = username.trim().toLowerCase();
  const { data: existing } = await admin.from('profiles').select('id, full_name, account_type').eq('username', uname).maybeSingle();
  if (existing) return { id: existing.id as string, username: uname, name: existing.full_name as string, accountType: existing.account_type as string, status: 'existing' as const, tempPassword: null };
  const pw = tempPassword();
  const { data, error } = await admin.auth.admin.createUser({ email: `${uname}@${EMAIL_DOMAIN}`, password: pw, email_confirm: true });
  if (error || !data.user) throw new Error(error?.message ?? 'createUser failed');
  const { error: pErr } = await admin.from('profiles').insert({
    id: data.user.id, username: uname, full_name: name.trim(), account_type: type, must_change_password: true,
  });
  if (pErr) {
    const { error: dErr } = await admin.auth.admin.deleteUser(data.user.id);
    if (dErr) console.error('rollback deleteUser failed', data.user.id, dErr.message);
    throw new Error(pErr.message);
  }
  return { id: data.user.id, username: uname, name: name.trim(), accountType: type, status: 'created' as const, tempPassword: pw };
}

Deno.serve(async req => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return json(405, { error: 'Method not allowed' });

  const url = Deno.env.get('SUPABASE_URL')!;
  const caller = createClient(url, Deno.env.get('SUPABASE_ANON_KEY')!, {
    global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } },
  });
  const { data: { user } } = await caller.auth.getUser();
  if (!user) return json(401, { error: 'Belum masuk' });

  const admin = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { auth: { persistSession: false } });
  const { data: me } = await admin.from('profiles').select('account_type, active').eq('id', user.id).maybeSingle();
  if (!me?.active) return json(403, { error: 'Akun tidak aktif' });

  let body: any;
  try { body = await req.json(); } catch { return json(400, { error: 'Body bukan JSON' }); }

  try {
    if (body.action === 'create_dosen') {
      if (me.account_type !== 'admin') return json(403, { error: 'Hanya admin yang dapat membuat akun dosen' });
      const acc = await ensureAccount(admin, String(body.username ?? ''), String(body.name ?? ''), 'dosen');
      const { id: _id, accountType: _t, ...pub } = acc;
      return json(200, { accounts: [pub] });
    }

    if (body.action === 'import_roster') {
      const classId = String(body.classId ?? '');
      if (me.account_type !== 'admin') {
        const { data: m } = await admin.from('class_members').select('member_role, active')
          .eq('class_id', classId).eq('user_id', user.id).maybeSingle();
        if (!m?.active || m.member_role !== 'dosen') return json(403, { error: 'Hanya dosen kelas ini yang dapat mengimpor' });
      }
      const rows = validateRows(body.rows);
      const { data: cls } = await admin.from('classes').select('id, is_template').eq('id', classId).maybeSingle();
      if (!cls || cls.is_template) return json(400, { error: 'Kelas tidak ditemukan' });

      type Out = { username: string; name: string; status: 'created' | 'existing' | 'skipped' | 'failed'; tempPassword: string | null; message?: string };
      const accounts: Out[] = [];
      for (const r of rows) {
        try {
          const acc = await ensureAccount(admin, r.nim, r.name, 'mahasiswa');
          const pub = { username: acc.username, name: acc.name, tempPassword: acc.tempPassword };
          if (acc.accountType !== 'mahasiswa') {
            accounts.push({ ...pub, status: 'skipped', message: 'Akun ini bukan akun mahasiswa' });
            continue;
          }
          const { data: mem, error: mErr } = await admin.from('class_members').select('member_role, active')
            .eq('class_id', classId).eq('user_id', acc.id).maybeSingle();
          if (mErr) throw new Error(mErr.message);
          if (mem) {
            if (mem.member_role === 'dosen') accounts.push({ ...pub, status: 'skipped', message: 'Akun ini dosen di kelas ini' });
            else if (!mem.active) accounts.push({ ...pub, status: 'skipped', message: 'Anggota nonaktif — aktifkan secara manual' });
            else accounts.push({ ...pub, status: 'existing' });
            continue;
          }
          const { error } = await admin.from('class_members').insert(
            { class_id: classId, user_id: acc.id, member_role: 'mahasiswa', active: true },
          );
          if (error) {
            console.error('membership insert failed', r.nim, error.message);
            // Account exists now; keep its one-time password so it is not lost.
            accounts.push({ ...pub, status: 'failed', message: 'Gagal menambahkan ke kelas' });
            continue;
          }
          accounts.push({ ...pub, status: acc.status });
        } catch (e) {
          console.error('import row failed', r.nim, (e as Error).message);
          accounts.push({ username: r.nim, name: r.name, status: 'failed', tempPassword: null, message: 'Gagal memproses baris ini' });
        }
      }
      return json(200, { accounts });
    }

    return json(400, { error: 'Aksi tidak dikenal' });
  } catch (e) {
    return json(400, { error: (e as Error).message });
  }
});
