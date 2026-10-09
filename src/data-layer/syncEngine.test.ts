import { describe, expect, it, vi } from 'vitest';
import { sliceRegistry } from './registry';
import { createSyncEngine, normalizeLoaded, toRow } from './syncEngine';

describe('toRow', () => {
  it('wraps the object as data with class and id', () => {
    expect(toRow('c1', { id: 'P1', name: 'x' } as any)).toEqual({ class_id: 'c1', id: 'P1', data: { id: 'P1', name: 'x' } });
  });
});

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

function fakeClient() {
  const calls: any[] = [];
  const builder = (table: string) => {
    const b: any = {
      upsert: (rows: any, opts: any) => { calls.push(['upsert', table, rows, opts]); return Promise.resolve({ error: null }); },
      delete: () => b,
      eq: (c: string, v: string) => { calls.push(['eq', table, c, v]); return b; },
      in: (c: string, v: string[]) => { calls.push(['in', table, c, v]); return Promise.resolve({ error: null }); },
    };
    return b;
  };
  return { calls, client: { from: vi.fn(builder) } as any };
}

describe('createSyncEngine.push', () => {
  it('upserts on (class_id,id) and deletes by id within the class', async () => {
    const { calls, client } = fakeClient();
    const engine = createSyncEngine(client, 'c1');
    await engine.push('patients', { upserts: [{ id: 'P1' }], deletes: ['P2'] });
    expect(calls).toContainEqual(['upsert', 'patients', [{ class_id: 'c1', id: 'P1', data: { id: 'P1' } }], { onConflict: 'class_id,id' }]);
    expect(calls).toContainEqual(['eq', 'patients', 'class_id', 'c1']);
    expect(calls).toContainEqual(['in', 'patients', 'id', ['P2']]);
  });

  it('throws when Supabase returns an error', async () => {
    const client = { from: () => ({ upsert: () => Promise.resolve({ error: { message: 'new row violates row-level security policy' } }) }) } as any;
    await expect(createSyncEngine(client, 'c1').push('coding', { upserts: [{ id: 'x' }], deletes: [] })).rejects.toThrow('row-level security');
  });
});

describe('createSyncEngine.subscribe', () => {
  function setup() {
    const handlers: Array<(p: any) => void> = [];
    const channel: any = { on: (_t: string, _f: any, h: any) => { handlers.push(h); return channel; }, subscribe: vi.fn() };
    const client = { channel: () => channel, removeChannel: vi.fn() } as any;
    const applyRemote = vi.fn();
    const unregister = sliceRegistry.register('patients', { hydrate: vi.fn(), applyRemote });
    createSyncEngine(client, 'c1').subscribe();
    const fire = (p: any) => handlers.forEach(h => h(p));
    return { fire, applyRemote, unregister };
  }

  it('ignores deletes from other classes, applies own', () => {
    const { fire, applyRemote, unregister } = setup();
    fire({ eventType: 'DELETE', table: 'patients', old: { class_id: 'other', id: 'P1' } });
    expect(applyRemote).not.toHaveBeenCalled();
    fire({ eventType: 'DELETE', table: 'patients', old: { class_id: 'c1', id: 'P1' } });
    expect(applyRemote).toHaveBeenCalledWith({ type: 'delete', id: 'P1' });
    unregister();
  });

  it('applies own upserts and ignores payloads without data or from other classes', () => {
    const { fire, applyRemote, unregister } = setup();
    fire({ eventType: 'INSERT', table: 'patients', new: { class_id: 'c1', id: 'P2', data: { id: 'P2' } } });
    expect(applyRemote).toHaveBeenCalledTimes(1);
    expect(applyRemote).toHaveBeenCalledWith({ type: 'upsert', row: { id: 'P2' } });
    fire({ eventType: 'UPDATE', table: 'patients', new: { class_id: 'c1', id: 'P3' } });
    fire({ eventType: 'UPDATE', table: 'patients', new: { class_id: 'other', id: 'P4', data: { id: 'P4' } } });
    expect(applyRemote).toHaveBeenCalledTimes(1);
    unregister();
  });
});

describe('createSyncEngine.refetch pagination', () => {
  it('pages through all rows', async () => {
    const ranges: Array<[number, number]> = [];
    const q: any = {
      select: () => q, eq: () => q, order: () => q,
      range: (a: number, b: number) => {
        ranges.push([a, b]);
        const n = a === 0 ? 1000 : 3;
        return Promise.resolve({ data: Array.from({ length: n }, (_, i) => ({ data: { id: `r${a + i}` } })), error: null });
      },
    };
    const out = await createSyncEngine({ from: () => q } as any, 'c1').refetch('cppt');
    expect(out).toHaveLength(1003);
    expect(ranges).toEqual([[0, 999], [1000, 1999]]);
  });
});
