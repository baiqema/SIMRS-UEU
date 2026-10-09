import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { addMember, admin, cleanupUsers, insertClassDirect, makeUser, type TestUser } from './helpers';

let cls: string, u: TestUser;

beforeAll(async () => {
  await admin().from('practice_roles').upsert([{ id: 'R04', name: 'Mahasiswa (All Modul)', access: ['all'] }]);
  cls = await insertClassDirect();
  u = await makeUser('mahasiswa');
  await addMember(cls, u.id, 'mahasiswa');
  await admin().from('practice_sessions').insert({ user_id: u.id, class_id: cls, role_id: 'R04' });
});
afterAll(cleanupUsers);

describe('audit_log', () => {
  it('records create, update and delete with actor and practice role', async () => {
    await u.client.from('cppt').insert({ class_id: cls, id: 'CP1', data: { id: 'CP1', s: 'a' } });
    await u.client.from('cppt').update({ data: { id: 'CP1', s: 'b' } }).eq('class_id', cls).eq('id', 'CP1');
    await u.client.from('cppt').delete().eq('class_id', cls).eq('id', 'CP1');
    const { data } = await admin().from('audit_log').select('*').eq('class_id', cls).eq('entity_id', 'CP1').order('id');
    expect(data!.map(r => r.action)).toEqual(['CREATE', 'UPDATE', 'DELETE']);
    expect(data![1].old_data).toEqual({ id: 'CP1', s: 'a' });
    expect(data![1].new_data).toEqual({ id: 'CP1', s: 'b' });
    expect(data![0].actor_id).toBe(u.id);
    expect(data![0].practice_role_id).toBe('R04');
    expect(data![0].entity).toBe('cppt');
  });

  it('rejects update and delete even for the service role', async () => {
    const { data } = await admin().from('audit_log').select('id').eq('class_id', cls).limit(1).single();
    expect((await admin().from('audit_log').update({ action: 'DELETE' }).eq('id', data!.id)).error).not.toBeNull();
    expect((await admin().from('audit_log').delete().eq('id', data!.id)).error).not.toBeNull();
  });

  it('clients cannot insert audit rows directly', async () => {
    const { error } = await u.client.from('audit_log').insert({ action: 'LOGIN', entity: 'User' });
    expect(error).not.toBeNull();
  });

  it('log_event accepts NAVIGATE and refuses other actions', async () => {
    expect((await u.client.rpc('log_event', { p_action: 'NAVIGATE', p_entity: 'Page', p_entity_id: 'coding', p_details: { module: 'coding' } })).error).toBeNull();
    expect((await u.client.rpc('log_event', { p_action: 'DELETE', p_entity: 'X', p_entity_id: '1', p_details: null })).error).not.toBeNull();
  });

  it('class members read their class audit; outsiders do not', async () => {
    const outsider = await makeUser('mahasiswa');
    expect((await u.client.from('audit_log').select('id').eq('class_id', cls)).data!.length).toBeGreaterThan(0);
    expect((await outsider.client.from('audit_log').select('id').eq('class_id', cls)).data).toEqual([]);
  });
});
