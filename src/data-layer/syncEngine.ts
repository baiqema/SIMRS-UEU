import type { SupabaseClient } from '@supabase/supabase-js';
import { sanitizeMedicalRecords, sanitizePatientList } from '../data/seedNormalizers';
import type { MedicalRecord, Patient } from '../types';
import { sliceRegistry } from './registry';
import { SLICE_BY_TABLE, SLICE_NAMES, SLICES, type SliceName } from './slices';
import type { SlicePersistence } from './useSlice';

const CHUNK = 500;

export const toRow = (classId: string, obj: { id: string }) => ({ class_id: classId, id: obj.id, data: obj });

export function normalizeLoaded(name: SliceName, rows: unknown[]): unknown[] {
  if (name === 'patients') return sanitizePatientList(rows as Patient[]);
  if (name === 'medicalRecords') return sanitizeMedicalRecords(rows as MedicalRecord[]);
  return rows;
}

export type SyncEngine = Omit<SlicePersistence, 'onSaveError'> & {
  loadAll(): Promise<Record<SliceName, unknown[]>>;
  subscribe(): () => void;
};

export function createSyncEngine(client: SupabaseClient, classId: string): SyncEngine {
  async function fetchSlice(name: SliceName): Promise<unknown[]> {
    const { data, error } = await client
      .from(SLICES[name].table)
      .select('data')
      .eq('class_id', classId)
      .order('created_at', { ascending: false })
      .order('seq', { ascending: true });
    if (error) throw new Error(error.message);
    return normalizeLoaded(name, (data ?? []).map(r => r.data));
  }

  return {
    async push(name, diff) {
      const table = SLICES[name].table;
      for (let i = 0; i < diff.upserts.length; i += CHUNK) {
        const rows = diff.upserts.slice(i, i + CHUNK).map(o => toRow(classId, o));
        const { error } = await client.from(table).upsert(rows, { onConflict: 'class_id,id' });
        if (error) throw new Error(error.message);
      }
      if (diff.deletes.length > 0) {
        const { error } = await client.from(table).delete().eq('class_id', classId).in('id', diff.deletes);
        if (error) throw new Error(error.message);
      }
    },
    refetch: fetchSlice,
    async loadAll() {
      const entries = await Promise.all(SLICE_NAMES.map(async n => [n, await fetchSlice(n)] as const));
      return Object.fromEntries(entries) as Record<SliceName, unknown[]>;
    },
    subscribe() {
      const channel = client.channel(`class-${classId}`);
      for (const name of SLICE_NAMES) {
        channel.on(
          'postgres_changes',
          { event: '*', schema: 'public', table: SLICES[name].table, filter: `class_id=eq.${classId}` },
          payload => {
            const slice = SLICE_BY_TABLE[payload.table];
            if (payload.eventType === 'DELETE') {
              const id = (payload.old as { id?: string }).id;
              if (id) sliceRegistry.applyRemote(slice, { type: 'delete', id });
            } else {
              sliceRegistry.applyRemote(slice, { type: 'upsert', row: (payload.new as { data: { id: string } }).data });
            }
          },
        );
      }
      channel.subscribe();
      return () => { void client.removeChannel(channel); };
    },
  };
}
