import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { addMember, admin, anon, cleanupUsers, EMAIL_DOMAIN, insertClassDirect, makeUser, type TestUser } from './helpers';

let cls: string, m: TestUser, d: TestUser, a: TestUser, inactive: TestUser;

beforeAll(async () => {
  cls = await insertClassDirect();
  [m, d, a, inactive] = await Promise.all([makeUser('mahasiswa'), makeUser('dosen'), makeUser('admin'), makeUser('mahasiswa')]);
  await addMember(cls, m.id, 'mahasiswa');
  await addMember(cls, d.id, 'dosen');
  await addMember(cls, inactive.id, 'mahasiswa', false);
});
afterAll(cleanupUsers);

describe('start_practice_session', () => {
  it('students may pick operational roles including R04 but not R01 or R03', async () => {
    expect((await m.client.rpc('start_practice_session', { p_class: cls, p_role: 'R09' })).error).toBeNull();
    expect((await m.client.rpc('start_practice_session', { p_class: cls, p_role: 'R04' })).error).toBeNull();
    expect((await m.client.rpc('start_practice_session', { p_class: cls, p_role: 'R01' })).error).not.toBeNull();
    expect((await m.client.rpc('start_practice_session', { p_class: cls, p_role: 'R03' })).error).not.toBeNull();
  });

  it('dosen may pick R03 and admin may pick R01 in any class', async () => {
    expect((await d.client.rpc('start_practice_session', { p_class: cls, p_role: 'R03' })).error).toBeNull();
    expect((await a.client.rpc('start_practice_session', { p_class: cls, p_role: 'R01' })).error).toBeNull();
  });

  it('inactive members and non-members are refused', async () => {
    expect((await inactive.client.rpc('start_practice_session', { p_class: cls, p_role: 'R09' })).error).not.toBeNull();
    const other = await insertClassDirect();
    expect((await m.client.rpc('start_practice_session', { p_class: other, p_role: 'R09' })).error).not.toBeNull();
  });

  it('switching role keeps exactly one open session', async () => {
    expect((await m.client.rpc('start_practice_session', { p_class: cls, p_role: 'R07' })).error).toBeNull();
    expect((await m.client.rpc('start_practice_session', { p_class: cls, p_role: 'R06' })).error).toBeNull();
    const { data: logouts } = await admin().from('audit_log').select('details')
      .eq('class_id', cls).eq('actor_id', m.id).eq('action', 'LOGOUT');
    expect(logouts!.map(l => l.details.roleId)).toContain('R07');
    const { data } = await m.client.rpc('my_practice_session');
    expect(data).toHaveLength(1);
    expect(data[0].role_id).toBe('R06');
  });

  it('my_practice_session returns the open session after re-login', async () => {
    await m.client.rpc('start_practice_session', { p_class: cls, p_role: 'R13' });
    const fresh = anon();
    await fresh.auth.signInWithPassword({ email: `${m.username}@${EMAIL_DOMAIN}`, password: m.password });
    const { data } = await fresh.rpc('my_practice_session');
    expect(data[0]).toMatchObject({ class_id: cls, role_id: 'R13' });
  });

  it('end_practice_session closes it and logs LOGOUT', async () => {
    const before = (await admin().from('audit_log').select('id', { count: 'exact', head: true })
      .eq('class_id', cls).eq('actor_id', m.id).eq('action', 'LOGOUT')).count!;
    expect((await m.client.rpc('end_practice_session')).error).toBeNull();
    const after = (await admin().from('audit_log').select('id', { count: 'exact', head: true })
      .eq('class_id', cls).eq('actor_id', m.id).eq('action', 'LOGOUT')).count!;
    expect(after).toBe(before + 1);
    expect((await m.client.rpc('my_practice_session')).data).toEqual([]);
  });

  it('my_classes lists active memberships only', async () => {
    const { data } = await m.client.rpc('my_classes');
    expect(data.map((c: { id: string }) => c.id)).toContain(cls);
    expect((await inactive.client.rpc('my_classes')).data).toEqual([]);
  });
});
