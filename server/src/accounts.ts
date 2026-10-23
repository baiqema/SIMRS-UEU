import type { Tx } from './db';
import { hashPassword, tempPassword } from './passwords';

export type AccountType = 'admin' | 'dosen' | 'mahasiswa';

export interface EnsuredAccount {
  id: string;
  username: string;
  name: string;
  accountType: AccountType;
  status: 'created' | 'existing';
  tempPassword: string | null;
}

export const normalizeUsername = (u: string) => u.trim().toLowerCase();
export const USERNAME = /^[a-z0-9._-]+$/;

/**
 * Returns the account with this username, creating it when missing. A new account gets
 * `password` if given, otherwise a one-time temporary password it must change at first login.
 * Owner transaction only.
 */
export async function ensureAccount(
  tx: Tx,
  username: string,
  name: string,
  type: AccountType,
  password?: string,
): Promise<EnsuredAccount> {
  const uname = normalizeUsername(username);
  if (!USERNAME.test(uname)) throw new Error('Username hanya boleh huruf, angka, titik, garis bawah, atau tanda hubung');
  const { rows } = await tx.query(
    'select id, full_name, account_type from public.profiles where username = $1', [uname]);
  if (rows[0]) {
    return { id: rows[0].id, username: uname, name: rows[0].full_name, accountType: rows[0].account_type, status: 'existing', tempPassword: null };
  }
  const temp = password ? null : tempPassword();
  const hash = await hashPassword(password ?? temp!);
  const { rows: [u] } = await tx.query('insert into auth.users (password_hash) values ($1) returning id', [hash]);
  await tx.query(
    `insert into public.profiles (id, username, full_name, account_type, must_change_password)
     values ($1, $2, $3, $4, $5)`,
    [u.id, uname, name.trim(), type, temp !== null]);
  return { id: u.id, username: uname, name: name.trim(), accountType: type, status: 'created', tempPassword: temp };
}

export async function setPassword(tx: Tx, userId: string, password: string): Promise<void> {
  await tx.query('update auth.users set password_hash = $2, updated_at = now() where id = $1', [userId, await hashPassword(password)]);
}
