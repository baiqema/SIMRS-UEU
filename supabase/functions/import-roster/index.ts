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
  const { data: existing } = await admin.from('profiles').select('id, full_name').eq('username', uname).maybeSingle();
  if (existing) return { id: existing.id as string, username: uname, name: existing.full_name as string, status: 'existing' as const, tempPassword: null };
  const pw = tempPassword();
  const { data, error } = await admin.auth.admin.createUser({ email: `${uname}@${EMAIL_DOMAIN}`, password: pw, email_confirm: true });
  if (error || !data.user) throw new Error(error?.message ?? 'createUser failed');
  const { error: pErr } = await admin.from('profiles').insert({
    id: data.user.id, username: uname, full_name: name.trim(), account_type: type, must_change_password: true,
  });
  if (pErr) { await admin.auth.admin.deleteUser(data.user.id); throw new Error(pErr.message); }
  return { id: data.user.id, username: uname, name: name.trim(), status: 'created' as const, tempPassword: pw };
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
      const { id: _id, ...pub } = acc;
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
      const accounts = [];
      for (const r of rows) {
        const acc = await ensureAccount(admin, r.nim, r.name, 'mahasiswa');
        const { error } = await admin.from('class_members').upsert(
          { class_id: classId, user_id: acc.id, member_role: 'mahasiswa', active: true },
          { onConflict: 'class_id,user_id' },
        );
        if (error) throw new Error(error.message);
        const { id: _id, ...pub } = acc;
        accounts.push(pub);
      }
      return json(200, { accounts });
    }

    return json(400, { error: 'Aksi tidak dikenal' });
  } catch (e) {
    return json(400, { error: (e as Error).message });
  }
});
