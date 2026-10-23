import { randomUUID } from 'node:crypto';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { call, insertClassDirect, makeUser, owner, startApi, stopApi, type TestUser } from './helpers';

let d: TestUser, m: TestUser, a: TestUser, cls: string;
const stamp = Date.now().toString().slice(-8);
const nim = `9${stamp}`, ghost = `8${stamp}`, dsn = `dsn${stamp}`;

const importRows = (u: TestUser, classId: string, rows: { nim: string; name: string }[]) =>
  u.call('POST', `/classes/${classId}/roster`, { rows });

beforeAll(async () => {
  await startApi();
  const home = await insertClassDirect();
  d = await makeUser('dosen', { classId: home });
  m = await makeUser('mahasiswa', { classId: home });
  a = await makeUser('admin');
  cls = (await d.call('POST', '/classes', { name: 'Kelas roster' })).body.id;
});
afterAll(stopApi);

describe('roster import', () => {
  it('creates a student who must change password, joins the class and can log in', async () => {
    const res = await importRows(d, cls, [{ nim, name: 'Budi Uji' }]);
    expect(res.status).toBe(200);
    const acc = res.body.accounts[0];
    expect(acc).toMatchObject({ username: nim, status: 'created' });
    expect(acc.tempPassword).toHaveLength(10);
    const { rows: [p] } = await owner().query('select id, must_change_password, account_type from public.profiles where username = $1', [nim]);
    expect(p).toMatchObject({ must_change_password: true, account_type: 'mahasiswa' });
    const login = await call(null, 'POST', '/auth/login', { username: nim, password: acc.tempPassword });
    expect(login.status).toBe(200);
    expect(login.body.profile.must_change_password).toBe(true);
  });

  it('re-importing the same NIM does not create a duplicate', async () => {
    const res = await importRows(d, cls, [{ nim, name: 'Budi Uji' }]);
    expect(res.body.accounts[0]).toMatchObject({ status: 'existing', tempPassword: null });
  });

  it('students cannot import', async () => {
    expect((await importRows(m, cls, [{ nim: 'x123', name: 'X' }])).status).toBe(403);
  });

  it('a dosen of another class cannot import here', async () => {
    const other = await makeUser('dosen', { classId: await insertClassDirect() });
    expect((await importRows(other, cls, [{ nim: 'x456', name: 'X' }])).status).toBe(403);
  });

  it('skips staff usernames and leaves their membership untouched', async () => {
    const res = await importRows(d, cls, [{ nim: d.username, name: 'Dosen' }]);
    expect(res.body.accounts[0]).toMatchObject({ status: 'skipped', tempPassword: null });
    const { rows: [mem] } = await owner().query('select member_role, active from public.class_members where class_id = $1 and user_id = $2', [cls, d.id]);
    expect(mem).toMatchObject({ member_role: 'dosen', active: true });
  });

  it('rejects invalid rows before creating anything', async () => {
    expect((await importRows(d, cls, [{ nim: 'bad nim!', name: 'X' }])).status).toBe(400);
    expect((await importRows(d, cls, [])).status).toBe(400);
  });

  it('import into a non-existent class fails before creating accounts', async () => {
    expect((await importRows(a, randomUUID(), [{ nim: ghost, name: 'Hantu' }])).status).toBe(400);
    expect((await owner().query('select 1 from public.profiles where username = $1', [ghost])).rowCount).toBe(0);
  });
});

describe('dosen accounts', () => {
  it('only admin creates dosen accounts', async () => {
    expect((await d.call('POST', '/accounts/dosen', { username: 'dsn.coba', name: 'Coba' })).status).toBe(403);
  });

  it('admin creates a dosen account that must change password', async () => {
    const res = await a.call('POST', '/accounts/dosen', { username: dsn, name: 'Dosen Uji' });
    expect(res.status).toBe(200);
    expect(res.body.accounts[0]).toMatchObject({ username: dsn, status: 'created' });
    const { rows: [p] } = await owner().query('select account_type, must_change_password from public.profiles where username = $1', [dsn]);
    expect(p).toMatchObject({ account_type: 'dosen', must_change_password: true });
  });
});
