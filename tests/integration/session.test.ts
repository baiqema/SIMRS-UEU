import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { insertClassDirect, makeUser, owner, signIn, startApi, stopApi, type TestUser } from './helpers';

let cls: string, m: TestUser, d: TestUser, a: TestUser;

const start = (u: TestUser, roleId: string, classId = cls) => u.call('POST', '/practice-session', { classId, roleId });

beforeAll(async () => {
  await startApi();
  cls = await insertClassDirect();
  [m, d, a] = await Promise.all([makeUser('mahasiswa', { classId: cls }), makeUser('dosen', { classId: cls }), makeUser('admin')]);
});
afterAll(stopApi);

describe('practice sessions', () => {
  it('students may pick operational roles including R04 but not R01 or R03', async () => {
    expect((await start(m, 'R09')).status).toBe(200);
    expect((await start(m, 'R04')).status).toBe(200);
    expect((await start(m, 'R01')).status).toBe(403);
    expect((await start(m, 'R03')).status).toBe(403);
    expect((await start(m, 'R99')).status).toBe(400);
  });

  it('dosen may pick R03 and admin may pick R01 in any class', async () => {
    expect((await start(d, 'R03')).status).toBe(200);
    expect((await start(a, 'R01')).status).toBe(200);
  });

  it('inactive members and non-members are refused', async () => {
    const other = await insertClassDirect();
    expect((await start(m, 'R09', other)).status).toBe(403);
    const both = await makeUser('mahasiswa', { classId: cls });
    await owner().query('insert into public.class_members (class_id, user_id, member_role, active) values ($1, $2, $3, false)', [other, both.id, 'mahasiswa']);
    expect((await start(both, 'R09', other)).status).toBe(403);
  });

  it('switching role keeps exactly one open session and logs the old one out', async () => {
    await start(m, 'R07');
    await start(m, 'R06');
    const { rows } = await owner().query(
      "select details from public.audit_log where class_id = $1 and actor_id = $2 and action = 'LOGOUT'", [cls, m.id]);
    expect(rows.map(r => r.details?.roleId)).toContain('R07');
    const { rows: open } = await owner().query('select role_id from public.practice_sessions where user_id = $1 and ended_at is null', [m.id]);
    expect(open).toEqual([{ role_id: 'R06' }]);
  });

  it('a new login finds the open session again', async () => {
    await start(m, 'R13');
    await signIn(m);
    expect((await m.call('GET', '/auth/me')).body.session).toMatchObject({ class_id: cls, role_id: 'R13' });
  });

  it('ending the session closes it and logs LOGOUT', async () => {
    const q = "select count(*)::int as n from public.audit_log where class_id = $1 and actor_id = $2 and action = 'LOGOUT'";
    const before = (await owner().query(q, [cls, m.id])).rows[0].n;
    expect((await m.call('DELETE', '/practice-session')).status).toBe(200);
    expect((await owner().query(q, [cls, m.id])).rows[0].n).toBe(before + 1);
    expect((await m.call('GET', '/auth/me')).body.session).toBeNull();
  });

  it('class list shows active memberships only', async () => {
    const extra = await insertClassDirect();
    const off = await makeUser('mahasiswa', { classId: cls });
    await owner().query('insert into public.class_members (class_id, user_id, member_role, active) values ($1, $2, $3, true)', [extra, m.id, 'mahasiswa']);
    await owner().query('insert into public.class_members (class_id, user_id, member_role, active) values ($1, $2, $3, false)', [extra, off.id, 'mahasiswa']);
    expect((await m.call('GET', '/classes')).body.map((c: { id: string }) => c.id)).toEqual(expect.arrayContaining([cls, extra]));
    expect((await off.call('GET', '/classes')).body.map((c: { id: string }) => c.id)).toEqual([cls]);
  });
});
