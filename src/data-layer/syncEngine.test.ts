import { describe, expect, it, vi } from 'vitest';
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
