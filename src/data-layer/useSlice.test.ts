import { describe, expect, it, vi } from 'vitest';
import { notifyInfo } from './notify';
import { createSliceSetter, setSlicePersistence } from './useSlice';

vi.mock('./notify', () => ({ notifyInfo: vi.fn(), notifySaveError: vi.fn() }));

const flush = () => new Promise(r => setTimeout(r, 0));

function harness(initial: { id: string; v: number }[], mode: 'local' | 'supabase') {
  const ref = { current: initial };
  const setState = vi.fn((next: typeof initial) => { ref.current = next; });
  const set = createSliceSetter('patients', mode, ref, setState);
  return { ref, setState, set };
}

describe('createSliceSetter', () => {
  it('chains function updaters against the latest value', () => {
    const h = harness([], 'local');
    h.set(prev => [...prev, { id: 'a', v: 1 }]);
    h.set(prev => [...prev, { id: 'b', v: 1 }]);
    expect(h.ref.current.map(r => r.id)).toEqual(['a', 'b']);
  });

  it('pushes only the diff in supabase mode', async () => {
    const push = vi.fn().mockResolvedValue(undefined);
    setSlicePersistence({ push, refetch: vi.fn(), onSaveError: vi.fn() });
    const h = harness([{ id: 'a', v: 1 }], 'supabase');
    h.set(prev => prev.map(r => ({ ...r, v: 2 })));
    await flush();
    expect(push).toHaveBeenCalledWith('patients', { upserts: [{ id: 'a', v: 2 }], deletes: [] });
    setSlicePersistence(null);
  });

  it('failed push rolls back to refetched rows and notifies', async () => {
    const onSaveError = vi.fn();
    const server = [{ id: 'a', v: 1 }];
    setSlicePersistence({ push: vi.fn().mockRejectedValue(new Error('rls')), refetch: vi.fn().mockResolvedValue(server), onSaveError });
    const h = harness([{ id: 'a', v: 1 }], 'supabase');
    h.set([{ id: 'a', v: 9 }]);
    await flush(); await flush();
    expect(onSaveError).toHaveBeenCalledOnce();
    expect(h.ref.current).toEqual(server);
    setSlicePersistence(null);
  });

  it('never pushes in local mode', async () => {
    const push = vi.fn();
    setSlicePersistence({ push, refetch: vi.fn(), onSaveError: vi.fn() });
    harness([], 'local').set([{ id: 'a', v: 1 }]);
    await flush();
    expect(push).not.toHaveBeenCalled();
    setSlicePersistence(null);
  });

  it('a failed rollback refetch notifies instead of rejecting', async () => {
    const onSaveError = vi.fn();
    const unhandled = vi.fn();
    process.on('unhandledRejection', unhandled);
    setSlicePersistence({
      push: vi.fn().mockRejectedValue(new Error('rls')),
      refetch: vi.fn().mockRejectedValue(new Error('offline')),
      onSaveError,
    });
    const h = harness([{ id: 'a', v: 1 }], 'supabase');
    h.set([{ id: 'a', v: 9 }]);
    await flush(); await flush(); await flush();
    expect(onSaveError).toHaveBeenCalledOnce();
    expect(notifyInfo).toHaveBeenCalledWith('Koneksi bermasalah. Muat ulang halaman untuk melihat data terbaru.');
    expect(unhandled).not.toHaveBeenCalled();
    process.off('unhandledRejection', unhandled);
    setSlicePersistence(null);
  });

  it('serializes pushes per slice so a later save cannot land first', async () => {
    const order: string[] = [];
    let releaseFirst!: () => void;
    const push = vi.fn((_n: string, diff: { upserts: { id: string; v: number }[] }) => {
      const v = diff.upserts[0].v;
      order.push(`start ${v}`);
      if (v === 2) return new Promise<void>(r => { releaseFirst = () => { order.push('end 2'); r(); }; });
      order.push(`end ${v}`);
      return Promise.resolve();
    });
    setSlicePersistence({ push: push as any, refetch: vi.fn(), onSaveError: vi.fn() });
    const h = harness([{ id: 'a', v: 1 }], 'supabase');
    h.set([{ id: 'a', v: 2 }]);
    h.set([{ id: 'a', v: 3 }]);
    await flush();
    expect(order).toEqual(['start 2']);
    releaseFirst();
    await flush(); await flush();
    expect(order).toEqual(['start 2', 'end 2', 'start 3', 'end 3']);
    setSlicePersistence(null);
  });
});
