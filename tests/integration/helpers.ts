import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = () => process.env.SUPABASE_TEST_URL!;
const anonKey = () => process.env.SUPABASE_TEST_ANON_KEY!;
export const EMAIL_DOMAIN = 'users.simrs-ueu.invalid';

export const admin = (): SupabaseClient =>
  createClient(url(), process.env.SUPABASE_TEST_SERVICE_ROLE_KEY!, { auth: { persistSession: false } });

export const anon = (): SupabaseClient => createClient(url(), anonKey(), { auth: { persistSession: false } });

const created: string[] = [];

export interface TestUser { id: string; username: string; password: string; client: SupabaseClient }

export async function makeUser(
  type: 'admin' | 'dosen' | 'mahasiswa',
  opts: { active?: boolean } = {},
): Promise<TestUser> {
  const username = `t${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
  const password = `Pw-${Math.random().toString(36).slice(2)}A1`;
  const { data, error } = await admin().auth.admin.createUser({
    email: `${username}@${EMAIL_DOMAIN}`, password, email_confirm: true,
  });
  if (error) throw error;
  created.push(data.user.id);
  const { error: pErr } = await admin().from('profiles').insert({
    id: data.user.id, username, full_name: `Test ${type} ${username}`, account_type: type, active: opts.active ?? true,
  });
  if (pErr) throw pErr;
  const client = anon();
  const { error: sErr } = await client.auth.signInWithPassword({ email: `${username}@${EMAIL_DOMAIN}`, password });
  if (sErr) throw sErr;
  return { id: data.user.id, username, password, client };
}

export async function insertClassDirect(name = `TEST-${Date.now()}`): Promise<string> {
  const { data, error } = await admin().from('classes').insert({ name }).select('id').single();
  if (error) throw error;
  return data.id as string;
}

export async function addMember(classId: string, userId: string, role: 'dosen' | 'mahasiswa', active = true) {
  const { error } = await admin().from('class_members').insert({ class_id: classId, user_id: userId, member_role: role, active });
  if (error) throw error;
}

export async function cleanupUsers() {
  while (created.length) {
    const id = created.pop()!;
    await admin().auth.admin.deleteUser(id);
  }
}
