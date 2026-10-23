import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { call, insertClassDirect, makeUser, owner, startApi, stopApi, type TestUser } from './helpers';

let cls: string, m: TestUser, m2: TestUser, d: TestUser, d2: TestUser, a: TestUser;

const setActive = (u: TestUser, user: string, active: boolean) =>
  u.call('PUT', `/classes/${cls}/members/${user}`, { active });

beforeAll(async () => {
  await startApi();
  cls = await insertClassDirect();
  [m, m2, d, d2, a] = await Promise.all([
    makeUser('mahasiswa', { classId: cls }), makeUser('mahasiswa', { classId: cls }),
    makeUser('dosen', { classId: cls }), makeUser('dosen', { classId: cls }), makeUser('admin'),
  ]);
});
afterAll(stopApi);

describe('member activation', () => {
  it('dosen deactivates a student: open session ends, new sessions refused, event audited', async () => {
    expect((await m.call('POST', '/practice-session', { classId: cls, roleId: 'R09' })).status).toBe(200);
    expect((await setActive(d, m.id, false)).status).toBe(200);
    expect((await m.call('GET', '/auth/me')).body.session).toBeNull();
    expect((await m.call('POST', '/practice-session', { classId: cls, roleId: 'R09' })).status).toBe(403);
    const { rows } = await owner().query(
      "select action, details from public.audit_log where class_id = $1 and entity = 'ClassMember' and entity_id = $2", [cls, m.id]);
    expect(rows).toContainEqual({ action: 'UPDATE', details: { active: false } });
    expect((await setActive(d, m.id, true)).status).toBe(200);
    expect((await m.call('POST', '/practice-session', { classId: cls, roleId: 'R09' })).status).toBe(200);
  });

  it('students cannot change membership status', async () => {
    expect((await setActive(m2, m.id, false)).status).toBe(403);
  });

  it('dosen cannot deactivate a co-dosen or themselves; admin can deactivate a dosen', async () => {
    expect((await setActive(d, d2.id, false)).status).toBe(403);
    expect((await setActive(d, d.id, false)).status).toBe(403);
    expect((await setActive(a, d2.id, false)).status).toBe(200);
    const { rows: [r] } = await owner().query('select active from public.class_members where class_id = $1 and user_id = $2', [cls, d2.id]);
    expect(r.active).toBe(false);
  });

  it('anonymous callers are refused', async () => {
    expect((await call(null, 'PUT', `/classes/${cls}/members/${m.id}`, { active: false })).status).toBe(401);
  });

  it('members list shows names and status to the class', async () => {
    const list = (await m2.call('GET', `/classes/${cls}/members`)).body;
    expect(list.find((x: { id: string }) => x.id === d.id)).toMatchObject({ member_role: 'dosen', active: true });
  });
});
