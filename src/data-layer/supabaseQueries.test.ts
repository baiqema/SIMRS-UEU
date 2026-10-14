import { describe, expect, it } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import { loadMembers, mapAuditRow, mergeStaffAndMembers } from './supabaseQueries';
import type { User } from '../types';

describe('mapAuditRow', () => {
  it('maps a database row to Ema\'s AuditEntry shape', () => {
    const e = mapAuditRow({
      id: 42, at: '2026-10-09T01:00:00Z', class_id: 'c', actor_id: 'u1', actor_name: 'Budi',
      practice_role_id: 'R09', action: 'UPDATE', entity: 'coding', entity_id: 'C1', module: 'coding',
      old_data: { id: 'C1', s: 'a' }, new_data: { id: 'C1', s: 'b' }, details: null,
    });
    expect(e).toMatchObject({
      id: '42', timestamp: '2026-10-09T01:00:00Z', userId: 'u1', userName: 'Budi (R09)',
      action: 'UPDATE', entity: 'coding', entityId: 'C1', module: 'coding', ip: '-',
    });
    expect(e.old_value).toBe('{"id":"C1","s":"a"}');
  });

  it('truncates long values to 300 characters', () => {
    const big = { id: 'x', t: 'a'.repeat(1000) };
    const e = mapAuditRow({ id: 1, at: '', class_id: null, actor_id: null, actor_name: null, practice_role_id: null,
      action: 'CREATE', entity: 'cppt', entity_id: 'x', module: null, old_data: null, new_data: big, details: null });
    expect(e.new_value!.length).toBe(300);
    expect(e.userName).toBe('System');
  });
});

describe('mergeStaffAndMembers', () => {
  it('members merge after staff without replacing staff', () => {
    const staff = [{ id: 'U002', name: 'dr. A', roleId: 'R05' }] as User[];
    const members = [{ id: 'uuid-1', name: 'Budi', roleId: 'R04' }, { id: 'U002', name: 'collision', roleId: 'R04' }] as User[];
    const out = mergeStaffAndMembers(staff, members);
    expect(out.map(u => u.id)).toEqual(['U002', 'uuid-1']);
    expect(out[0].name).toBe('dr. A');
  });
});

describe('loadMembers', () => {
  it('skips memberships whose profile is hidden', async () => {
    const rows = [
      { member_role: 'mahasiswa', active: true, profiles: null },
      { member_role: 'dosen', active: true, profiles: { id: 'p1', username: 'd', full_name: 'Dosen' } },
    ];
    const client = { from: () => ({ select: () => ({ eq: () => Promise.resolve({ data: rows, error: null }) }) }) } as unknown as SupabaseClient;
    const out = await loadMembers(client, 'c');
    expect(out).toEqual([{ id: 'p1', username: 'd', name: 'Dosen', roleId: 'R03', active: true }]);
  });
});
