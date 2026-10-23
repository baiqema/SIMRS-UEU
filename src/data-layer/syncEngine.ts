import { sanitizeMedicalRecords, sanitizePatientList } from '../data/seedNormalizers';
import { api } from '../lib/apiClient';
import type { MedicalRecord, Patient } from '../types';
import { sliceRegistry } from './registry';
import type { AuditRow } from './serverQueries';
import { SLICE_BY_TABLE, SLICE_NAMES, SLICES, type SliceName } from './slices';
import type { SlicePersistence } from './useSlice';

type Call = <T>(method: string, path: string, body?: unknown) => Promise<T>;

const CHUNK = 500;

export function normalizeLoaded(name: SliceName, rows: unknown[]): unknown[] {
  if (name === 'patients') return sanitizePatientList(rows as Patient[]);
  if (name === 'medicalRecords') return sanitizeMedicalRecords(rows as MedicalRecord[]);
  return rows;
}

export type SyncEngine = Omit<SlicePersistence, 'onSaveError'> & {
  loadAll(): Promise<Record<SliceName, unknown[]>>;
  /**
   * Applies other users' changes from audit log rows (newest first, as polled).
   * Returns true when a class reset was seen and the caller must reload everything.
   */
  applyChanges(rows: AuditRow[], myUserId: string): boolean;
};

export function createSyncEngine(classId: string, call: Call = api): SyncEngine {
  const base = `/classes/${classId}/data`;
  return {
    async push(name, diff) {
      const path = `${base}/${SLICES[name].table}`;
      for (let i = 0; i < diff.upserts.length; i += CHUNK) {
        await call('POST', path, { upserts: diff.upserts.slice(i, i + CHUNK), deletes: [] });
      }
      for (let i = 0; i < diff.deletes.length; i += CHUNK) {
        await call('POST', path, { upserts: [], deletes: diff.deletes.slice(i, i + CHUNK) });
      }
    },
    async refetch(name) {
      return normalizeLoaded(name, await call<unknown[]>('GET', `${base}/${SLICES[name].table}`));
    },
    async loadAll() {
      const byTable = await call<Record<string, unknown[]>>('GET', base);
      return Object.fromEntries(SLICE_NAMES.map(n => [n, normalizeLoaded(n, byTable[SLICES[n].table] ?? [])])) as Record<SliceName, unknown[]>;
    },
    applyChanges(rows, myUserId) {
      let reload = false;
      // Oldest first so later edits win.
      for (const r of [...rows].reverse()) {
        if (r.class_id !== classId) continue;
        if (r.action === 'RESET') { reload = true; continue; }
        // Own saves are already in local state; replaying them could undo a newer local edit.
        if (r.actor_id === myUserId) continue;
        const slice = SLICE_BY_TABLE[r.entity];
        if (!slice || !r.entity_id) continue;
        if (r.action === 'DELETE') sliceRegistry.applyRemote(slice, { type: 'delete', id: r.entity_id });
        else if ((r.action === 'CREATE' || r.action === 'UPDATE') && r.new_data && typeof r.new_data === 'object') {
          sliceRegistry.applyRemote(slice, { type: 'upsert', row: r.new_data as { id: string } });
        }
      }
      return reload;
    },
  };
}
