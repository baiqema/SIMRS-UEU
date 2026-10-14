import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { addMember, admin, cleanupUsers, insertClassDirect, makeUser, type TestUser } from './helpers';

const ROLES = [
  { id: 'R04', name: 'Mahasiswa (All Modul)', access: ['all'] },
  { id: 'R05', name: 'Dokter', access: ['dashboard', 'rekammedis', 'cppt', 'informedconsent', 'resumemedis', 'laboratorium', 'radiologi'] },
  { id: 'R07', name: 'Mahasiswa Pendaftaran', access: ['dashboard', 'pendaftaran', 'generalconsent', 'vclaim', 'sep'] },
  { id: 'R09', name: 'Mahasiswa Coding', access: ['dashboard', 'coding', 'klaim', 'eklaim'] },
];

async function openSession(u: TestUser, classId: string, roleId: string) {
  await admin().from('practice_sessions').update({ ended_at: new Date().toISOString() }).eq('user_id', u.id).is('ended_at', null);
  const { error } = await admin().from('practice_sessions').insert({ user_id: u.id, class_id: classId, role_id: roleId });
  if (error) throw error;
}

const row = (classId: string, id: string) => ({ class_id: classId, id, data: { id } });

let classA: string, classB: string, coder: TestUser, registrar: TestUser, doctor: TestUser, allRole: TestUser, dosen: TestUser;

beforeAll(async () => {
  await admin().from('practice_roles').upsert(ROLES);
  classA = await insertClassDirect();
  classB = await insertClassDirect();
  [coder, registrar, doctor, allRole, dosen] = await Promise.all([
    makeUser('mahasiswa'), makeUser('mahasiswa'), makeUser('mahasiswa'), makeUser('mahasiswa'), makeUser('dosen'),
  ]);
  for (const u of [coder, registrar, doctor, allRole]) await addMember(classA, u.id, 'mahasiswa');
  await addMember(classA, dosen.id, 'dosen');
  await openSession(coder, classA, 'R09');
  await openSession(registrar, classA, 'R07');
  await openSession(doctor, classA, 'R05');
  await openSession(allRole, classA, 'R04');
});
afterAll(cleanupUsers);

describe('clinical table RLS', () => {
  it('a coding student cannot write patients but can write coding and claims', async () => {
    expect((await coder.client.from('patients').insert(row(classA, 'P-x1'))).error).not.toBeNull();
    expect((await coder.client.from('coding').insert(row(classA, 'C-1'))).error).toBeNull();
    expect((await coder.client.from('claims').insert(row(classA, 'K-1'))).error).toBeNull();
  });

  it('cross-module writes allowed by table_modules', async () => {
    // Doctor (rekammedis) saving an exam also writes billing, coding and cppt.
    for (const t of ['medical_records', 'billing', 'coding', 'cppt']) {
      expect((await doctor.client.from(t).insert(row(classA, `${t}-d1`))).error, t).toBeNull();
    }
    // Registration also writes general consent and beds.
    for (const t of ['patients', 'registrations', 'general_consents', 'beds']) {
      expect((await registrar.client.from(t).insert(row(classA, `${t}-r1`))).error, t).toBeNull();
    }
  });

  it('R04 can write every clinical table', async () => {
    const { data: tables } = await admin().rpc('clinical_table_names');
    for (const t of tables as string[]) {
      expect((await allRole.client.from(t).insert(row(classA, `${t}-all`))).error, t).toBeNull();
    }
  });

  it('nobody reads or writes another class', async () => {
    await admin().from('patients').insert(row(classB, 'P-b1'));
    expect((await allRole.client.from('patients').select('id').eq('class_id', classB)).data).toEqual([]);
    expect((await allRole.client.from('patients').insert(row(classB, 'P-b2'))).error).not.toBeNull();
  });

  it('a class dosen writes anything in their class without a practice session', async () => {
    expect((await dosen.client.from('claims').insert(row(classA, 'K-dsn'))).error).toBeNull();
  });

  it('data.id must match the row id', async () => {
    const bad = { class_id: classA, id: 'C-2', data: { id: 'other' } };
    expect((await coder.client.from('coding').insert(bad)).error).not.toBeNull();
  });

  it('class_id cannot be changed by update', async () => {
    await coder.client.from('coding').insert(row(classA, 'C-move'));
    const { error } = await admin().from('coding').update({ class_id: classB }).eq('class_id', classA).eq('id', 'C-move');
    expect(error).not.toBeNull();
  });
});
