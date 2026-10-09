import type { SupabaseClient } from '@supabase/supabase-js';
import { sanitizeMedicalRecords, sanitizePatientList } from '../data/seedNormalizers';
import type { MedicalRecord, Patient } from '../types';
import { sliceRegistry } from './registry';
import { SLICE_BY_TABLE, SLICE_NAMES, SLICES, type SliceName } from './slices';
import type { SlicePersistence } from './useSlice';

const CHUNK = 500;
const PAGE = 1000;

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
    const all: unknown[] = [];
    for (let from = 0; ; from += PAGE) {
      const { data, error } = await client
        .from(SLICES[name].table)
        .select('data')
        .eq('class_id', classId)
        .order('created_at', { ascending: false })
        .order('seq', { ascending: true })
        .range(from, from + PAGE - 1);
      if (error) throw new Error(error.message);
      const page = data ?? [];
      for (const r of page) all.push(r.data);
      if (page.length < PAGE) break;
    }
    return normalizeLoaded(name, all);
  }

  return {
    async push(name, diff) {
      const table = SLICES[name].table;
      for (let i = 0; i < diff.upserts.length; i += CHUNK) {
        const rows = diff.upserts.slice(i, i + CHUNK).map(o => toRow(classId, o));
        const { error } = await client.from(table).upsert(rows, { onConflict: 'class_id,id' });
        if (error) throw new Error(error.message);
      }
      for (let i = 0; i < diff.deletes.length; i += CHUNK) {
        const { error } = await client.from(table).delete().eq('class_id', classId).in('id', diff.deletes.slice(i, i + CHUNK));
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
              const old = payload.old as { id?: string; class_id?: string } | undefined;
              if (old?.id && old.class_id === classId) sliceRegistry.applyRemote(slice, { type: 'delete', id: old.id });
            } else {
              const row = payload.new as { class_id?: string; data?: { id: string } } | undefined;
              if (row?.data && row.class_id === classId) sliceRegistry.applyRemote(slice, { type: 'upsert', row: row.data });
            }
          },
        );
      }
      channel.subscribe();
      return () => { void client.removeChannel(channel); };
    },
  };
}
