import { useEffect, useMemo, useRef, useState, type Dispatch, type SetStateAction } from 'react';
import { getBackendMode, type BackendMode } from './config';
import { diffById, type SliceDiff } from './diff';
import { notifyInfo } from './notify';
import { applyRemoteChange, sliceRegistry } from './registry';
import { SLICES, type SliceName } from './slices';

export interface SlicePersistence {
  push(name: SliceName, diff: SliceDiff<{ id: string }>): Promise<void>;
  refetch(name: SliceName): Promise<unknown[]>;
  onSaveError(err: unknown): void;
}

let persistence: SlicePersistence | null = null;
export function setSlicePersistence(p: SlicePersistence | null): void { persistence = p; }

// One push chain per slice: saves reach the server in the order they were made.
const queues = new Map<SliceName, Promise<void>>();

export function createSliceSetter<T extends { id: string }>(
  name: SliceName,
  mode: BackendMode,
  ref: { current: T[] },
  setState: (next: T[]) => void,
): Dispatch<SetStateAction<T[]>> {
  return action => {
    const prev = ref.current;
    const next = typeof action === 'function' ? (action as (p: T[]) => T[])(prev) : action;
    if (next === prev) return;
    ref.current = next;
    setState(next);
    const p = persistence;
    if (mode !== 'supabase' || !p) return;
    const diff = diffById(prev, next);
    if (diff.upserts.length === 0 && diff.deletes.length === 0) return;
    const run = (queues.get(name) ?? Promise.resolve())
      .then(() => p.push(name, diff))
      .catch(async err => {
        p.onSaveError(err);
        try {
          const rows = (await p.refetch(name)) as T[];
          ref.current = rows;
          setState(rows);
        } catch {
          notifyInfo('Koneksi bermasalah. Muat ulang halaman untuk melihat data terbaru.');
        }
      });
    queues.set(name, run);
    void run.then(() => { if (queues.get(name) === run) queues.delete(name); });
  };
}

export function useSlice<T extends { id: string }>(
  name: SliceName,
  localInit: () => T[],
): [T[], Dispatch<SetStateAction<T[]>>] {
  const mode = getBackendMode();
  const [state, setState] = useState<T[]>(() => (mode === 'local' ? localInit() : []));
  const ref = useRef(state);

  useEffect(() => {
    if (mode === 'local') localStorage.setItem(SLICES[name].localKey, JSON.stringify(state));
  }, [mode, name, state]);

  useEffect(() => sliceRegistry.register(name, {
    hydrate: rows => { ref.current = rows as T[]; setState(rows as T[]); },
    applyRemote: change => {
      const next = applyRemoteChange(ref.current, change);
      ref.current = next;
      setState(next);
    },
  }), [name]);

  const set = useMemo(() => createSliceSetter<T>(name, mode, ref, setState), [name, mode]);
  return [state, set];
}
