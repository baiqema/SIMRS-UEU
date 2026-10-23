import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { count, insertClassDirect, makeUser, owner, save, startApi, stopApi, TEMPLATE, type TestUser } from './helpers';

let d: TestUser, m: TestUser, cls: string;

beforeAll(async () => {
  await startApi();
  const home = await insertClassDirect();
  d = await makeUser('dosen', { classId: home });
  m = await makeUser('mahasiswa', { classId: home });
  const res = await d.call('POST', '/classes', { name: 'Kelas siklus' });
  expect(res.status).toBe(200);
  cls = res.body.id;
});
afterAll(stopApi);

describe('create_class', () => {
  it('only dosen or admin can create classes', async () => {
    expect((await m.call('POST', '/classes', { name: 'nope' })).status).toBe(403);
  });

  it('copies every template table, including master data and staff_directory', async () => {
    const { rows: [{ t }] } = await owner().query('select public.clinical_table_names() as t');
    expect(t).toEqual(expect.arrayContaining(['master_poli', 'master_dokter', 'doctor_poli_mappings', 'staff_directory']));
    for (const table of t as string[]) expect(await count(table, cls), table).toBe(await count(table, TEMPLATE));
    expect(await count('master_dokter', cls)).toBeGreaterThan(0);
  });

  it('copies the DPJP doctor U002 into staff_directory', async () => {
    expect((await owner().query("select 1 from public.staff_directory where class_id = $1 and id = 'U002'", [cls])).rowCount).toBe(1);
  });

  it('replaces date placeholders with today', async () => {
    const today = new Date().toLocaleDateString('en-CA', { timeZone: process.env.TZ });
    const { rows: [r] } = await owner().query("select data from public.registrations where class_id = $1 and id = 'REG001'", [cls]);
    const { rows: [{ d: dbToday }] } = await owner().query("select to_char(current_date, 'YYYY-MM-DD') as d");
    expect([today, dbToday]).toContain(r.data.date);
  });

  it('makes the creating dosen a dosen member and lists the class for them', async () => {
    const { rows: [mem] } = await owner().query('select member_role from public.class_members where class_id = $1 and user_id = $2', [cls, d.id]);
    expect(mem.member_role).toBe('dosen');
    expect((await d.call('GET', '/classes')).body.map((c: { id: string }) => c.id)).toContain(cls);
  });

  it('never lists the template class', async () => {
    const a = await makeUser('admin');
    expect((await a.call('GET', '/classes')).body.map((c: { id: string }) => c.id)).not.toContain(TEMPLATE);
  });
});

describe('reset_class', () => {
  it('restores template data and keeps the audit history', async () => {
    expect((await save(d, cls, 'patients', [{ id: 'P-extra' }])).status).toBe(200);
    const before = await count('audit_log', cls);
    expect((await d.call('POST', `/classes/${cls}/reset`)).status).toBe(200);
    expect(await count('patients', cls)).toBe(await count('patients', TEMPLATE));
    const { rows } = await owner().query("select 1 from public.audit_log where class_id = $1 and action = 'RESET'", [cls]);
    expect(rows).toHaveLength(1);
    expect(await count('audit_log', cls)).toBe(before + 1);
  });

  it('students cannot reset', async () => {
    expect((await m.call('POST', `/classes/${cls}/reset`)).status).toBe(403);
  });
});
