import { afterAll, describe, expect, it } from 'vitest';
import { addMember, cleanupUsers, insertClassDirect, makeUser } from './helpers';

afterAll(cleanupUsers);

describe('identity helpers', () => {
  it('account_type returns the caller type, and null for inactive accounts', async () => {
    const d = await makeUser('dosen');
    const x = await makeUser('mahasiswa', { active: false });
    expect((await d.client.rpc('account_type')).data).toBe('dosen');
    expect((await x.client.rpc('account_type')).data).toBeNull();
  });

  it('class membership controls can_read_class', async () => {
    const cls = await insertClassDirect();
    const m = await makeUser('mahasiswa');
    const outsider = await makeUser('mahasiswa');
    await addMember(cls, m.id, 'mahasiswa');
    expect((await m.client.rpc('can_read_class', { p_class: cls })).data).toBe(true);
    expect((await outsider.client.rpc('can_read_class', { p_class: cls })).data).toBe(false);
  });

  it('students cannot read other students\' profiles outside their classes', async () => {
    const a = await makeUser('mahasiswa');
    const b = await makeUser('mahasiswa');
    const { data } = await a.client.from('profiles').select('id').eq('id', b.id);
    expect(data).toEqual([]);
  });
});
