import type { AddressInfo } from 'node:net';
import type { Server } from 'node:http';
import { existsSync } from 'node:fs';
import { createApp } from '../../server/src/app';
import { createPool, type Db } from '../../server/src/db';
import { hashPassword } from '../../server/src/passwords';

if (existsSync('.env.test.local')) process.loadEnvFile('.env.test.local');

export const TEMPLATE = '00000000-0000-0000-0000-000000000001';

let db: Db | null = null;
let server: Server | null = null;
let base = '';

/** Owner connection to the test database (no RLS). */
export const owner = (): Db => (db ??= createPool(process.env.TEST_DATABASE_URL!));

export async function startApi(): Promise<void> {
  if (server) return;
  server = createApp({ db: owner(), jwtSecret: 'integration-test-secret-integration-test-secret' }).listen(0);
  await new Promise(r => server!.once('listening', r));
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}/api`;
}

export async function stopApi(): Promise<void> {
  await new Promise(r => (server ? server.close(r) : r(null)));
  server = null;
  await db?.end();
  db = null;
}

export interface Res<T = any> { status: number; body: T }

export async function call<T = any>(token: string | null, method: string, path: string, body?: unknown): Promise<Res<T>> {
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  const r = await fetch(`${base}${path}`, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) });
  const text = await r.text();
  return { status: r.status, body: text ? JSON.parse(text) : null };
}

export interface TestUser {
  id: string; username: string; password: string; token: string;
  call: <T = any>(method: string, path: string, body?: unknown) => Promise<Res<T>>;
}

const uniq = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;

/** Creates an account directly in the database. Accounts without a class cannot log in, so the token is minted by the API only when asked. */
export async function makeUser(
  type: 'admin' | 'dosen' | 'mahasiswa',
  opts: { active?: boolean; classId?: string; memberActive?: boolean } = {},
): Promise<TestUser> {
  const username = `t${uniq()}`;
  const password = `Pw-${uniq()}A1`;
  const { rows: [u] } = await owner().query('insert into auth.users (password_hash) values ($1) returning id', [await hashPassword(password)]);
  await owner().query(
    'insert into public.profiles (id, username, full_name, account_type, active) values ($1, $2, $3, $4, $5)',
    [u.id, username, `Test ${type} ${username}`, type, opts.active ?? true]);
  if (opts.classId && type !== 'admin') await addMember(opts.classId, u.id, type, opts.memberActive ?? true);
  const user: TestUser = { id: u.id, username, password, token: '', call: (m, p, b) => call(user.token, m, p, b) };
  if (type === 'admin' || opts.classId) await signIn(user);
  return user;
}

export async function signIn(u: TestUser): Promise<Res> {
  const res = await call(null, 'POST', '/auth/login', { username: u.username, password: u.password });
  if (res.status === 200) u.token = res.body.token;
  return res;
}

export async function insertClassDirect(name = `Kelas uji ${uniq()}`): Promise<string> {
  const { rows: [c] } = await owner().query('insert into public.classes (name) values ($1) returning id', [name]);
  return c.id;
}

export async function addMember(classId: string, userId: string, role: 'dosen' | 'mahasiswa', active = true) {
  await owner().query(
    'insert into public.class_members (class_id, user_id, member_role, active) values ($1, $2, $3, $4)',
    [classId, userId, role, active]);
}

export async function openSession(u: TestUser, classId: string, roleId: string) {
  await owner().query('update public.practice_sessions set ended_at = now() where user_id = $1 and ended_at is null', [u.id]);
  await owner().query('insert into public.practice_sessions (user_id, class_id, role_id) values ($1, $2, $3)', [u.id, classId, roleId]);
}

export const save = (u: TestUser, classId: string, table: string, upserts: object[], deletes: string[] = []) =>
  u.call('POST', `/classes/${classId}/data/${table}`, { upserts, deletes });

export async function count(table: string, classId: string): Promise<number> {
  return Number((await owner().query(`select count(*) from public.${table} where class_id = $1`, [classId])).rows[0].count);
}
