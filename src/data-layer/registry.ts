import type { SliceName } from './slices';

export type RemoteChange = { type: 'upsert'; row: { id: string } } | { type: 'delete'; id: string };
export interface SliceHandle { hydrate(rows: unknown[]): void; applyRemote(change: RemoteChange): void }

export function applyRemoteChange<T extends { id: string }>(list: T[], change: RemoteChange): T[] {
  if (change.type === 'delete') return list.filter(r => r.id !== change.id);
  const idx = list.findIndex(r => r.id === change.row.id);
  if (idx === -1) return [change.row as T, ...list];
  const copy = list.slice();
  copy[idx] = change.row as T;
  return copy;
}

const handles = new Map<SliceName, SliceHandle>();

export const sliceRegistry = {
  register(name: SliceName, handle: SliceHandle): () => void {
    handles.set(name, handle);
    return () => { if (handles.get(name) === handle) handles.delete(name); };
  },
  hydrateAll(rows: Partial<Record<SliceName, unknown[]>>): void {
    for (const [name, handle] of handles) handle.hydrate(rows[name] ?? []);
  },
  applyRemote(name: SliceName, change: RemoteChange): void {
    handles.get(name)?.applyRemote(change);
  },
};
