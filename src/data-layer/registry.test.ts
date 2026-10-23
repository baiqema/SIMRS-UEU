import { describe, expect, it, vi } from 'vitest';
import { applyRemoteChange, sliceRegistry } from './registry';

describe('applyRemoteChange', () => {
  it('replaces an existing row in place', () => {
    const out = applyRemoteChange([{ id: 'a', v: 1 }, { id: 'b', v: 1 }], { type: 'upsert', row: { id: 'b', v: 2 } as any });
    expect(out).toEqual([{ id: 'a', v: 1 }, { id: 'b', v: 2 }]);
  });
  it('prepends a new row', () => {
    const out = applyRemoteChange([{ id: 'a' }], { type: 'upsert', row: { id: 'z' } });
    expect(out.map(r => r.id)).toEqual(['z', 'a']);
  });
  it('removes a deleted row', () => {
    expect(applyRemoteChange([{ id: 'a' }, { id: 'b' }], { type: 'delete', id: 'a' })).toEqual([{ id: 'b' }]);
  });
});

describe('sliceRegistry', () => {
  it('hydrates every registered slice and gives empty arrays to slices without rows', () => {
    const p = vi.fn(), c = vi.fn();
    const offP = sliceRegistry.register('patients', { hydrate: p, applyRemote: vi.fn() });
    const offC = sliceRegistry.register('cppt', { hydrate: c, applyRemote: vi.fn() });
    sliceRegistry.hydrateAll({ patients: [{ id: 'P1' }] });
    expect(p).toHaveBeenCalledWith([{ id: 'P1' }]);
    expect(c).toHaveBeenCalledWith([]);
    offP(); offC();
  });
});
