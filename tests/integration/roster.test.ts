import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { admin, cleanupUsers, makeUser, type TestUser } from './helpers';

let d: TestUser, m: TestUser, a: TestUser, cls: string;
const dsn = `dsn${Date.now().toString(36)}`;
const ghost = `8${Date.now()}`.slice(0, 12);
const nim = `9${Date.now()}`.slice(0, 12);

beforeAll(async () => {
  d = await makeUser('dosen');
  m = await makeUser('mahasiswa');
  a = await makeUser('admin');
  cls = (await d.client.rpc('create_class', { p_name: `TEST-roster-${Date.now()}` })).data as string;
});
afterAll(async () => {
  const { data } = await admin().from('profiles').select('id').eq('username', nim).maybeSingle();
  if (data) await admin().auth.admin.deleteUser(data.id);
  const { data: dp } = await admin().from('profiles').select('id').eq('username', dsn).maybeSingle();
  if (dp) await admin().auth.admin.deleteUser(dp.id);
  const { data: gp } = await admin().from('profiles').select('id').eq('username', ghost).maybeSingle();
  if (gp) await admin().auth.admin.deleteUser(gp.id);
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

  it('a dosen of another class cannot import here', async () => {
    const other = await makeUser('dosen');
    const { error } = await other.client.functions.invoke('import-roster', {
      body: { action: 'import_roster', classId: cls, rows: [{ nim: 'x456', name: 'X' }] },
    });
    expect(error).not.toBeNull();
  });

  it('skips staff usernames and leaves their membership untouched', async () => {
    const { data } = await d.client.functions.invoke('import-roster', {
      body: { action: 'import_roster', classId: cls, rows: [{ nim: d.username, name: 'Dosen' }] },
    });
    expect(data.accounts[0]).toMatchObject({ status: 'skipped', tempPassword: null });
    const { data: mem } = await admin().from('class_members').select('member_role, active').eq('class_id', cls).eq('user_id', d.id).single();
    expect(mem).toMatchObject({ member_role: 'dosen', active: true });
  });

  it('admin creates a dosen account that must change password', async () => {
    const { data, error } = await a.client.functions.invoke('import-roster', {
      body: { action: 'create_dosen', username: dsn, name: 'Dosen Uji' },
    });
    expect(error).toBeNull();
    expect(data.accounts[0]).toMatchObject({ username: dsn, status: 'created' });
    const { data: p } = await admin().from('profiles').select('account_type, must_change_password').eq('username', dsn).single();
    expect(p).toMatchObject({ account_type: 'dosen', must_change_password: true });
  });

  it('import into a non-existent class fails before creating accounts', async () => {
    const { error } = await a.client.functions.invoke('import-roster', {
      body: { action: 'import_roster', classId: crypto.randomUUID(), rows: [{ nim: ghost, name: 'Hantu' }] },
    });
    expect(error).not.toBeNull();
    const { data: p } = await admin().from('profiles').select('id').eq('username', ghost).maybeSingle();
    expect(p).toBeNull();
  });
});
