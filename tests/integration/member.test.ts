import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { addMember, admin, anon, cleanupUsers, insertClassDirect, makeUser, type TestUser } from './helpers';

let cls: string, m: TestUser, m2: TestUser, d: TestUser, d2: TestUser, a: TestUser;

const setActive = (u: TestUser, user: string, active: boolean) =>
  u.client.rpc('set_member_active', { p_class: cls, p_user: user, p_active: active });

beforeAll(async () => {
  cls = await insertClassDirect(`TEST-member-${Date.now()}`);
  [m, m2, d, d2, a] = await Promise.all([
    makeUser('mahasiswa'), makeUser('mahasiswa'), makeUser('dosen'), makeUser('dosen'), makeUser('admin'),
  ]);
  await addMember(cls, m.id, 'mahasiswa');
  await addMember(cls, m2.id, 'mahasiswa');
  await addMember(cls, d.id, 'dosen');
  await addMember(cls, d2.id, 'dosen');
});
afterAll(cleanupUsers);

describe('set_member_active', () => {
  it('dosen deactivates a student: open session ends, new sessions refused, event audited', async () => {
    expect((await m.client.rpc('start_practice_session', { p_class: cls, p_role: 'R09' })).error).toBeNull();
    expect((await setActive(d, m.id, false)).error).toBeNull();
    expect((await m.client.rpc('my_practice_session')).data).toEqual([]);
    const again = await m.client.rpc('start_practice_session', { p_class: cls, p_role: 'R09' });
    expect(again.error).not.toBeNull();
    const { data: ev } = await admin().from('audit_log').select('action, entity, details')
      .eq('class_id', cls).eq('entity', 'ClassMember').eq('entity_id', m.id);
    expect(ev).toContainEqual({ action: 'UPDATE', entity: 'ClassMember', details: { active: false } });
    expect((await setActive(d, m.id, true)).error).toBeNull();
    expect((await m.client.rpc('start_practice_session', { p_class: cls, p_role: 'R09' })).error).toBeNull();
  });

  it('students cannot change membership status', async () => {
    const res = await setActive(m2, m.id, false);
    expect(res.error?.code).toBe('42501');
  });

  it('dosen cannot deactivate a co-dosen or themselves; admin can deactivate a dosen', async () => {
    expect((await setActive(d, d2.id, false)).error?.code).toBe('42501');
    expect((await setActive(d, d.id, false)).error?.code).toBe('42501');
    expect((await setActive(a, d2.id, false)).error).toBeNull();
    const { data } = await admin().from('class_members').select('active').eq('class_id', cls).eq('user_id', d2.id).single();
    expect(data!.active).toBe(false);
  });

  it('anonymous callers cannot execute it', async () => {
    const res = await anon().rpc('set_member_active', { p_class: cls, p_user: m.id, p_active: false });
    expect(res.error).not.toBeNull();
  });
});
