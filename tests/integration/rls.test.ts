import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { count, insertClassDirect, makeUser, openSession, owner, save, startApi, stopApi, type TestUser } from './helpers';

const CLASS_TABLES = ['patients', 'registrations', 'general_consents', 'informed_consents', 'medical_records', 'cppt',
  'asuhan_keperawatan', 'resume_medis', 'coding', 'claims', 'billing', 'beds', 'dokumen_berkas', 'staff_directory'];
const MASTER_TABLES = ['master_ruangan', 'master_bed', 'master_dokter', 'master_poli', 'doctor_poli_mappings'];

let classA: string, classB: string;
let coder: TestUser, registrar: TestUser, doctor: TestUser, allRole: TestUser, dosen: TestUser, admin: TestUser;

beforeAll(async () => {
  await startApi();
  classA = await insertClassDirect();
  classB = await insertClassDirect();
  [coder, registrar, doctor, allRole, dosen, admin] = await Promise.all([
    makeUser('mahasiswa', { classId: classA }), makeUser('mahasiswa', { classId: classA }),
    makeUser('mahasiswa', { classId: classA }), makeUser('mahasiswa', { classId: classA }),
    makeUser('dosen', { classId: classA }), makeUser('admin'),
  ]);
  await openSession(coder, classA, 'R09');
  await openSession(registrar, classA, 'R07');
  await openSession(doctor, classA, 'R05');
  await openSession(allRole, classA, 'R04');
});
afterAll(stopApi);

describe('class data permissions', () => {
  it('a coding student cannot write patients but can write coding and claims', async () => {
    expect((await save(coder, classA, 'patients', [{ id: 'P-x1' }])).status).toBe(403);
    expect((await save(coder, classA, 'coding', [{ id: 'C-1' }])).status).toBe(200);
    expect((await save(coder, classA, 'claims', [{ id: 'K-1' }])).status).toBe(200);
  });

  it('allows the cross-module writes listed in table_modules', async () => {
    for (const t of ['medical_records', 'billing', 'coding', 'cppt']) {
      expect((await save(doctor, classA, t, [{ id: `${t}-d1` }])).status, t).toBe(200);
    }
    for (const t of ['patients', 'registrations', 'general_consents', 'beds']) {
      expect((await save(registrar, classA, t, [{ id: `${t}-r1` }])).status, t).toBe(200);
    }
  });

  it('R04 writes every class table but not master data', async () => {
    for (const t of CLASS_TABLES) expect((await save(allRole, classA, t, [{ id: `${t}-all` }])).status, t).toBe(200);
    for (const t of MASTER_TABLES) expect((await save(allRole, classA, t, [{ id: `${t}-all` }])).status, t).toBe(403);
  });

  it('only admin accounts write master data; members read it', async () => {
    expect((await save(dosen, classA, 'master_poli', [{ id: 'MP-dsn' }])).status).toBe(403);
    expect((await save(admin, classA, 'master_poli', [{ id: 'MP-adm', nama: 'Poli Uji' }])).status).toBe(200);
    const read = await coder.call('GET', `/classes/${classA}/data/master_poli`);
    expect(read.body).toContainEqual({ id: 'MP-adm', nama: 'Poli Uji' });
  });

  it('a refused delete fails the whole save and removes nothing', async () => {
    await save(allRole, classA, 'patients', [{ id: 'P-keep' }]);
    const res = await save(coder, classA, 'patients', [], ['P-keep']);
    expect(res.status).toBe(403);
    expect(res.body.error).toMatch(/42501/);
    expect((await owner().query("select 1 from public.patients where class_id = $1 and id = 'P-keep'", [classA])).rowCount).toBe(1);
  });

  it('nobody reads or writes another class', async () => {
    await owner().query("insert into public.patients (class_id, id, data) values ($1, 'P-b1', '{\"id\":\"P-b1\"}')", [classB]);
    expect((await allRole.call('GET', `/classes/${classB}/data/patients`)).body).toEqual([]);
    expect((await save(allRole, classB, 'patients', [{ id: 'P-b2' }])).status).toBe(403);
    expect(await count('patients', classB)).toBe(1);
  });

  it('a class dosen writes clinical data without a practice session', async () => {
    expect((await save(dosen, classA, 'claims', [{ id: 'K-dsn' }])).status).toBe(200);
  });

  it('rejects unknown tables and malformed rows', async () => {
    expect((await save(allRole, classA, 'profiles', [{ id: 'x' }])).status).toBe(404);
    expect((await save(allRole, classA, 'coding', [{ name: 'no id' }])).status).toBe(400);
    expect((await allRole.call('POST', `/classes/${classA}/data/coding`, { upserts: 'x' })).status).toBe(400);
  });

  it('class_id and id cannot be changed by an update', async () => {
    await save(coder, classA, 'coding', [{ id: 'C-move' }]);
    await expect(owner().query("update public.coding set class_id = $1 where class_id = $2 and id = 'C-move'", [classB, classA]))
      .rejects.toThrow(/cannot change/);
  });

  it('users cannot touch login or session tables directly', async () => {
    expect((await save(allRole, classA, 'practice_sessions', [{ id: '1' }])).status).toBe(404);
  });
});
