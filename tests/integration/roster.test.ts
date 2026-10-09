import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { admin, cleanupUsers, makeUser, type TestUser } from './helpers';

let d: TestUser, m: TestUser, cls: string;
const nim = `9${Date.now()}`.slice(0, 12);

beforeAll(async () => {
  d = await makeUser('dosen');
  m = await makeUser('mahasiswa');
  cls = (await d.client.rpc('create_class', { p_name: `TEST-roster-${Date.now()}` })).data as string;
});
afterAll(async () => {
  const { data } = await admin().from('profiles').select('id').eq('username', nim).maybeSingle();
  if (data) await admin().auth.admin.deleteUser(data.id);
  await cleanupUsers();
});

describe('import-roster', () => {
  it('creates a student who must change password and joins the class', async () => {
    const { data, error } = await d.client.functions.invoke('import-roster', {
      body: { action: 'import_roster', classId: cls, rows: [{ nim, name: 'Budi Uji' }] },
    });
    expect(error).toBeNull();
    expect(data.accounts[0]).toMatchObject({ username: nim, status: 'created' });
    expect(data.accounts[0].tempPassword).toHaveLength(10);
    const { data: p } = await admin().from('profiles').select('id, must_change_password, account_type').eq('username', nim).single();
    expect(p).toMatchObject({ must_change_password: true, account_type: 'mahasiswa' });
    const { data: mem } = await admin().from('class_members').select('member_role').eq('class_id', cls).eq('user_id', p!.id).single();
    expect(mem!.member_role).toBe('mahasiswa');
  });

  it('re-importing the same NIM does not create a duplicate', async () => {
    const { data } = await d.client.functions.invoke('import-roster', {
      body: { action: 'import_roster', classId: cls, rows: [{ nim, name: 'Budi Uji' }] },
    });
    expect(data.accounts[0]).toMatchObject({ status: 'existing', tempPassword: null });
  });

  it('students cannot import', async () => {
    const { error } = await m.client.functions.invoke('import-roster', {
      body: { action: 'import_roster', classId: cls, rows: [{ nim: 'x123', name: 'X' }] },
    });
    expect(error).not.toBeNull();
  });

  it('only admin creates dosen accounts', async () => {
    const { error } = await d.client.functions.invoke('import-roster', {
      body: { action: 'create_dosen', username: 'dsn.coba', name: 'Coba' },
    });
    expect(error).not.toBeNull();
  });
});
