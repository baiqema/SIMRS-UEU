import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { call, insertClassDirect, makeUser, owner, signIn, startApi, stopApi } from './helpers';

let cls: string;
beforeAll(async () => { await startApi(); cls = await insertClassDirect(); });
afterAll(stopApi);

describe('login', () => {
  it('returns a token, the profile and the classes', async () => {
    const m = await makeUser('mahasiswa', { classId: cls });
    const res = await signIn(m);
    expect(res.status).toBe(200);
    expect(res.body.profile).toMatchObject({ id: m.id, username: m.username, account_type: 'mahasiswa' });
    expect(res.body.profile.password_hash).toBeUndefined();
    expect(res.body.classes.map((c: { id: string }) => c.id)).toContain(cls);
  });

  it('gives the same answer for a wrong password and an unknown user', async () => {
    const m = await makeUser('mahasiswa', { classId: cls });
    const wrong = await call(null, 'POST', '/auth/login', { username: m.username, password: 'salah-sekali' });
    const unknown = await call(null, 'POST', '/auth/login', { username: 'tidak.ada', password: 'salah-sekali' });
    expect(wrong).toEqual({ status: 401, body: { error: 'Username/NIM atau password salah' } });
    expect(unknown).toEqual(wrong);
  });

  it('accepts the username in any case', async () => {
    const m = await makeUser('mahasiswa', { classId: cls });
    expect((await call(null, 'POST', '/auth/login', { username: m.username.toUpperCase(), password: m.password })).status).toBe(200);
  });

  it('refuses inactive accounts and accounts without a class', async () => {
    const off = await makeUser('mahasiswa', { classId: cls, active: false });
    expect((await signIn(off)).status).toBe(403);
    const lonely = await makeUser('mahasiswa');
    const res = await signIn(lonely);
    expect(res.status).toBe(403);
    expect(res.body.error).toMatch(/belum terdaftar di kelas/);
  });

  it('locks a username after 10 failed attempts', async () => {
    const m = await makeUser('mahasiswa', { classId: cls });
    for (let i = 0; i < 10; i++) await call(null, 'POST', '/auth/login', { username: m.username, password: `bad-${i}` });
    const res = await signIn(m);
    expect(res.status).toBe(429);
  });
});

describe('tokens', () => {
  it('protects every endpoint except login and health', async () => {
    expect((await call(null, 'GET', '/health')).status).toBe(200);
    expect((await call(null, 'GET', '/auth/me')).status).toBe(401);
    expect((await call('not-a-token', 'GET', '/classes')).status).toBe(401);
    expect((await call(null, 'GET', `/classes/${cls}/data`)).status).toBe(401);
  });

  it('/auth/me returns the profile and open practice session', async () => {
    const m = await makeUser('mahasiswa', { classId: cls });
    expect((await m.call('POST', '/practice-session', { classId: cls, roleId: 'R13' })).status).toBe(200);
    const me = await m.call('GET', '/auth/me');
    expect(me.status).toBe(200);
    expect(me.body.session).toMatchObject({ class_id: cls, role_id: 'R13' });
  });

  it('a deactivated account loses access with its old token', async () => {
    const m = await makeUser('mahasiswa', { classId: cls });
    await owner().query('update public.profiles set active = false where id = $1', [m.id]);
    expect((await m.call('GET', '/auth/me')).status).toBe(401);
  });
});

describe('password change', () => {
  it('needs 8 characters, then works and clears must_change_password', async () => {
    const m = await makeUser('mahasiswa', { classId: cls });
    await owner().query('update public.profiles set must_change_password = true where id = $1', [m.id]);
    expect((await m.call('POST', '/auth/password', { password: 'pendek' })).status).toBe(400);
    expect((await m.call('POST', '/auth/password', { password: 'Password-Baru-1' })).status).toBe(200);
    const { rows: [p] } = await owner().query('select must_change_password from public.profiles where id = $1', [m.id]);
    expect(p.must_change_password).toBe(false);
    expect((await signIn(m)).status).toBe(401);
    m.password = 'Password-Baru-1';
    expect((await signIn(m)).status).toBe(200);
  });

  it('stores scrypt hashes, never the password', async () => {
    const m = await makeUser('mahasiswa', { classId: cls });
    const { rows: [u] } = await owner().query('select password_hash from auth.users where id = $1', [m.id]);
    expect(u.password_hash).toMatch(/^scrypt\$/);
    expect(u.password_hash).not.toContain(m.password);
  });
});
