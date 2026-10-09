import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { admin, cleanupUsers, makeUser, type TestUser } from './helpers';

const TEMPLATE = '00000000-0000-0000-0000-000000000001';
let d: TestUser, m: TestUser, cls: string;

const count = async (table: string, classId: string) =>
  (await admin().from(table).select('id', { count: 'exact', head: true }).eq('class_id', classId)).count;

beforeAll(async () => {
  d = await makeUser('dosen');
  m = await makeUser('mahasiswa');
  const { data, error } = await d.client.rpc('create_class', { p_name: `TEST-lifecycle-${Date.now()}` });
  if (error) throw error;
  cls = data as string;
});
afterAll(cleanupUsers);

describe('create_class', () => {
  it('only dosen or admin can create classes', async () => {
    expect((await m.client.rpc('create_class', { p_name: 'nope' })).error).not.toBeNull();
  });

  it('copies every template table, including staff_directory', async () => {
    const { data: tables } = await admin().rpc('clinical_table_names');
    for (const t of tables as string[]) expect(await count(t, cls), t).toBe(await count(t, TEMPLATE));
    expect(await count('staff_directory', cls)).toBeGreaterThan(0);
  });

  it('template copies staff_directory with the DPJP doctor U002', async () => {
    const { data } = await admin().from('staff_directory').select('id').eq('class_id', cls).eq('id', 'U002');
    expect(data).toHaveLength(1);
  });

  it('replaces date placeholders with today', async () => {
    const today = new Date().toISOString().slice(0, 10);
    const { data } = await admin().from('registrations').select('data').eq('class_id', cls).eq('id', 'REG-TODAY-IGD').single();
    expect(data!.data.date).toBe(today);
    expect(data!.data.sepNo).toBe(`0010R001${today.replace(/-/g, '')}V001`);
  });

  it('makes the creating dosen a dosen member', async () => {
    const { data } = await admin().from('class_members').select('member_role').eq('class_id', cls).eq('user_id', d.id).single();
    expect(data!.member_role).toBe('dosen');
  });
});

describe('reset_class', () => {
  it('restores template data and keeps the audit history', async () => {
    await d.client.from('patients').insert({ class_id: cls, id: 'P-extra', data: { id: 'P-extra' } });
    const auditBefore = (await admin().from('audit_log').select('id', { count: 'exact', head: true }).eq('class_id', cls)).count!;
    expect((await d.client.rpc('reset_class', { p_class: cls })).error).toBeNull();
    expect(await count('patients', cls)).toBe(await count('patients', TEMPLATE));
    const { data: resets } = await admin().from('audit_log').select('action').eq('class_id', cls).eq('action', 'RESET');
    expect(resets).toHaveLength(1);
    const auditAfter = (await admin().from('audit_log').select('id', { count: 'exact', head: true }).eq('class_id', cls)).count!;
    expect(auditAfter).toBe(auditBefore + 1);
  });

  it('students cannot reset', async () => {
    expect((await m.client.rpc('reset_class', { p_class: cls })).error).not.toBeNull();
  });
});
