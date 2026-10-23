import { describe, expect, it, vi } from 'vitest';
import { sliceRegistry } from './registry';
import type { AuditRow } from './serverQueries';
import { createSyncEngine, normalizeLoaded } from './syncEngine';

describe('normalizeLoaded', () => {
  it('applies Ema\'s patient RM normalization on load', () => {
    const out = normalizeLoaded('patients', [{ id: 'b', noRM: '000002' }, { id: 'a', noRM: '000001' }]) as any[];
    expect(out.map(p => p.id)).toEqual(['a', 'b']);
  });
  it('leaves other slices in server order', () => {
    const rows = [{ id: 'z' }, { id: 'a' }];
    expect(normalizeLoaded('cppt', rows)).toBe(rows);
  });
});

describe('createSyncEngine.push', () => {
  it('posts upserts and deletes to the slice table of the class', async () => {
    const call = vi.fn().mockResolvedValue({ ok: true });
    await createSyncEngine('c1', call).push('patients', { upserts: [{ id: 'P1' }], deletes: ['P2'] });
    expect(call).toHaveBeenCalledWith('POST', '/classes/c1/data/patients', { upserts: [{ id: 'P1' }], deletes: [] });
    expect(call).toHaveBeenCalledWith('POST', '/classes/c1/data/patients', { upserts: [], deletes: ['P2'] });
  });

  it('sends large saves in chunks of 500', async () => {
    const call = vi.fn().mockResolvedValue({ ok: true });
    const upserts = Array.from({ length: 1001 }, (_, i) => ({ id: `r${i}` }));
    await createSyncEngine('c1', call).push('cppt', { upserts, deletes: [] });
    expect(call.mock.calls.map(c => c[2].upserts.length)).toEqual([500, 500, 1]);
  });

  it('propagates server refusals', async () => {
    const call = vi.fn().mockRejectedValue(new Error('42501: hapus ditolak'));
    await expect(createSyncEngine('c1', call).push('patients', { upserts: [], deletes: ['P2'] })).rejects.toThrow('42501');
  });
});

describe('createSyncEngine.loadAll', () => {
  it('maps tables to slices and fills missing tables with empty lists', async () => {
    const call = vi.fn().mockResolvedValue({ cppt: [{ id: 'x' }], master_poli: [{ id: 'p' }] });
    const out = await createSyncEngine('c1', call).loadAll();
    expect(call).toHaveBeenCalledWith('GET', '/classes/c1/data');
    expect(out.cppt).toEqual([{ id: 'x' }]);
    expect(out.masterPoli).toEqual([{ id: 'p' }]);
    expect(out.billing).toEqual([]);
  });
});

describe('createSyncEngine.applyChanges', () => {
  const row = (over: Partial<AuditRow>): AuditRow => ({
    id: 1, at: '', class_id: 'c1', actor_id: 'other', actor_name: 'B', practice_role_id: 'R04',
    action: 'UPDATE', entity: 'patients', entity_id: 'P1', module: 'patients', old_data: null, new_data: { id: 'P1' }, details: null,
    ...over,
  });

  function setup() {
    const applyRemote = vi.fn();
    const unregister = sliceRegistry.register('patients', { hydrate: vi.fn(), applyRemote });
    return { applyRemote, unregister, engine: createSyncEngine('c1', vi.fn()) };
  }

  it('applies other users\' upserts and deletes oldest first', () => {
    const { applyRemote, unregister, engine } = setup();
    engine.applyChanges([row({ id: 2, action: 'DELETE', new_data: null }), row({ id: 1, action: 'CREATE' })], 'me');
    expect(applyRemote.mock.calls.map(c => c[0].type)).toEqual(['upsert', 'delete']);
    unregister();
  });

  it('skips own changes, other classes, events and rows without data', () => {
    const { applyRemote, unregister, engine } = setup();
    const reload = engine.applyChanges([
      row({ actor_id: 'me' }),
      row({ class_id: 'other' }),
      row({ action: 'LOGIN', entity: 'User' }),
      row({ new_data: null }),
    ], 'me');
    expect(applyRemote).not.toHaveBeenCalled();
    expect(reload).toBe(false);
    unregister();
  });

  it('asks for a full reload after a class reset', () => {
    const { unregister, engine } = setup();
    expect(engine.applyChanges([row({ action: 'RESET', entity: 'Class' })], 'me')).toBe(true);
    unregister();
  });
});
