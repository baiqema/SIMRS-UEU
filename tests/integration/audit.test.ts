import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { insertClassDirect, makeUser, openSession, owner, save, startApi, stopApi, type TestUser } from './helpers';

let cls: string, u: TestUser;

beforeAll(async () => {
  await startApi();
  cls = await insertClassDirect();
  u = await makeUser('mahasiswa', { classId: cls });
  await openSession(u, cls, 'R04');
});
afterAll(stopApi);

describe('audit_log', () => {
  it('records create, update and delete with actor and practice role', async () => {
    await save(u, cls, 'cppt', [{ id: 'CP1', s: 'a' }]);
    await save(u, cls, 'cppt', [{ id: 'CP1', s: 'b' }]);
    await save(u, cls, 'cppt', [], ['CP1']);
    const { rows } = await owner().query(
      "select * from public.audit_log where class_id = $1 and entity_id = 'CP1' order by id", [cls]);
    expect(rows.map(r => r.action)).toEqual(['CREATE', 'UPDATE', 'DELETE']);
    expect(rows[1].old_data).toEqual({ id: 'CP1', s: 'a' });
    expect(rows[1].new_data).toEqual({ id: 'CP1', s: 'b' });
    expect(rows[0]).toMatchObject({ actor_id: u.id, practice_role_id: 'R04', entity: 'cppt' });
  });

  it('cannot be changed or deleted, even by the owner', async () => {
    const { rows: [r] } = await owner().query('select id from public.audit_log where class_id = $1 limit 1', [cls]);
    await expect(owner().query("update public.audit_log set action = 'DELETE' where id = $1", [r.id])).rejects.toThrow(/append-only/);
    await expect(owner().query('delete from public.audit_log where id = $1', [r.id])).rejects.toThrow(/append-only/);
  });

  it('the events endpoint accepts NAVIGATE and refuses other actions', async () => {
    expect((await u.call('POST', '/events', { action: 'NAVIGATE', entity: 'Page', entityId: 'coding', details: { module: 'coding' } })).status).toBe(200);
    expect((await u.call('POST', '/events', { action: 'DELETE', entity: 'X', entityId: '1' })).status).toBe(403);
  });

  it('class members read their class audit; outsiders do not', async () => {
    const otherClass = await insertClassDirect();
    const outsider = await makeUser('mahasiswa', { classId: otherClass });
    expect((await u.call('GET', `/classes/${cls}/audit`)).body.length).toBeGreaterThan(0);
    expect((await outsider.call('GET', `/classes/${cls}/audit`)).body).toEqual([]);
  });

  it('polling with after returns only newer entries', async () => {
    const all = (await u.call('GET', `/classes/${cls}/audit`)).body;
    const newest = Number(all[0].id);
    await save(u, cls, 'cppt', [{ id: 'CP2' }]);
    const fresh = (await u.call('GET', `/classes/${cls}/audit?after=${newest}`)).body;
    expect(fresh.map((r: { entity_id: string }) => r.entity_id)).toEqual(['CP2']);
  });
});
