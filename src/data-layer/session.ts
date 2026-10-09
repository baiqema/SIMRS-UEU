import type { SupabaseClient } from '@supabase/supabase-js';

export const LOGIN_EMAIL_DOMAIN = 'users.simrs-ueu.invalid';
export type AccountType = 'admin' | 'dosen' | 'mahasiswa';

export interface Profile {
  id: string; username: string; full_name: string; account_type: AccountType;
  must_change_password: boolean; active: boolean;
}
export interface ClassInfo { id: string; name: string }
export interface PracticeSession { id: number; class_id: string; role_id: string }

export function usernameToEmail(username: string): string {
  const u = username.trim().toLowerCase();
  if (!/^[a-z0-9._-]+$/.test(u)) {
    throw new Error('Username hanya boleh huruf, angka, titik, garis bawah, atau tanda hubung');
  }
  return `${u}@${LOGIN_EMAIL_DOMAIN}`;
}

async function loadProfile(client: SupabaseClient, userId: string): Promise<Profile | null> {
  const { data, error } = await client.from('profiles').select('*').eq('id', userId).maybeSingle();
  if (error) throw new Error(error.message);
  return (data as Profile) ?? null;
}

async function loadClasses(client: SupabaseClient): Promise<ClassInfo[]> {
  const { data, error } = await client.rpc('my_classes');
  if (error) throw new Error(error.message);
  return (data ?? []) as ClassInfo[];
}

export async function signIn(
  client: SupabaseClient, username: string, password: string,
): Promise<{ profile: Profile; classes: ClassInfo[] } | { error: string }> {
  let email: string;
  try { email = usernameToEmail(username); } catch (e) { return { error: (e as Error).message }; }
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error || !data.user) return { error: 'Username/NIM atau password salah' };
  try {
    const profile = await loadProfile(client, data.user.id);
    if (!profile || !profile.active) {
      await client.auth.signOut();
      return { error: 'Akun non-aktif. Hubungi dosen atau admin.' };
    }
    const classes = await loadClasses(client);
    if (classes.length === 0) {
      await client.auth.signOut();
      return { error: 'Akun Anda belum terdaftar di kelas mana pun. Hubungi dosen.' };
    }
    return { profile, classes };
  } catch {
    try { await client.auth.signOut(); } catch { /* ignore */ }
    return { error: 'Gagal memuat data akun. Coba lagi.' };
  }
}

export async function startPractice(client: SupabaseClient, classId: string, roleId: string): Promise<PracticeSession> {
  const { data, error } = await client.rpc('start_practice_session', { p_class: classId, p_role: roleId });
  if (error) throw new Error(error.message);
  return data as PracticeSession;
}

export async function restoreSession(
  client: SupabaseClient,
): Promise<{ profile: Profile; session: PracticeSession | null; classes: ClassInfo[] } | null> {
  const { data } = await client.auth.getSession();
  const userId = data.session?.user.id;
  if (!userId) return null;
  const profile = await loadProfile(client, userId);
  if (!profile || !profile.active) { await client.auth.signOut(); return null; }
  const { data: open } = await client.rpc('my_practice_session');
  const session = ((open ?? []) as PracticeSession[])[0] ?? null;
  return { profile, session, classes: await loadClasses(client) };
}

export async function endPractice(client: SupabaseClient): Promise<void> {
  await client.rpc('end_practice_session');
  await client.auth.signOut();
}

export async function changePassword(client: SupabaseClient, newPassword: string): Promise<void> {
  const { error } = await client.auth.updateUser({ password: newPassword });
  if (error) throw new Error(error.message);
  const { error: e2 } = await client.rpc('clear_must_change_password');
  if (e2) throw new Error(e2.message);
}
