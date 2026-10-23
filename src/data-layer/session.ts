import { api, ApiError, tokenStore } from '../lib/apiClient';

export type AccountType = 'admin' | 'dosen' | 'mahasiswa';

export interface Profile {
  id: string; username: string; full_name: string; account_type: AccountType;
  must_change_password: boolean; active: boolean;
}
export interface ClassInfo { id: string; name: string }
export interface PracticeSession { id: number | string; class_id: string; role_id: string }

export function normalizeUsername(username: string): string {
  const u = username.trim().toLowerCase();
  if (!/^[a-z0-9._-]+$/.test(u)) {
    throw new Error('Username hanya boleh huruf, angka, titik, garis bawah, atau tanda hubung');
  }
  return u;
}

export async function signIn(
  username: string, password: string,
): Promise<{ profile: Profile; classes: ClassInfo[] } | { error: string }> {
  let u: string;
  try { u = normalizeUsername(username); } catch (e) { return { error: (e as Error).message }; }
  try {
    const res = await api<{ token: string; profile: Profile; classes: ClassInfo[] }>('POST', '/auth/login', { username: u, password });
    tokenStore.set(res.token);
    return { profile: res.profile, classes: res.classes };
  } catch (e) {
    tokenStore.clear();
    if (e instanceof ApiError && e.status > 0 && e.status < 500) return { error: e.message };
    return { error: e instanceof ApiError && e.status === 0 ? e.message : 'Gagal memuat data akun. Coba lagi.' };
  }
}

export async function startPractice(classId: string, roleId: string): Promise<PracticeSession> {
  return api<PracticeSession>('POST', '/practice-session', { classId, roleId });
}

export async function restoreSession(): Promise<{ profile: Profile; session: PracticeSession | null; classes: ClassInfo[] } | null> {
  if (!tokenStore.get()) return null;
  try {
    return await api('GET', '/auth/me');
  } catch (e) {
    // An expired or revoked token: start from the login form.
    if (e instanceof ApiError && (e.status === 401 || e.status === 403)) { tokenStore.clear(); return null; }
    throw e;
  }
}

export async function endPractice(): Promise<void> {
  try {
    if (tokenStore.get()) await api('DELETE', '/practice-session');
  } finally {
    tokenStore.clear();
  }
}

export async function changePassword(newPassword: string): Promise<void> {
  await api('POST', '/auth/password', { password: newPassword });
}
