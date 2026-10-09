import type { SupabaseClient } from '@supabase/supabase-js';
import type { AuditEntry, Role, RoleId, User } from '../types';

export interface AuditRow {
  id: number; at: string; class_id: string | null; actor_id: string | null; actor_name: string | null;
  practice_role_id: string | null; action: AuditEntry['action']; entity: string; entity_id: string | null;
  module: string | null; old_data: unknown; new_data: unknown; details: Record<string, unknown> | null;
}

const MAX_VALUE = 300;
const compact = (v: unknown): string | null => (v == null ? null : JSON.stringify(v).slice(0, MAX_VALUE));

export function mapAuditRow(r: AuditRow): AuditEntry {
  const who = r.actor_name ?? 'System';
  return {
    id: String(r.id),
    timestamp: r.at,
    userId: r.actor_id ?? 'SYSTEM',
    userName: r.practice_role_id ? `${who} (${r.practice_role_id})` : who,
    action: r.action,
    entity: r.entity,
    entityId: r.entity_id ?? '',
    field_name: null,
    old_value: compact(r.old_data),
    new_value: compact(r.new_data ?? r.details),
    ip: '-',
    device: '-',
    module: r.module ?? undefined,
  };
}

export async function loadAudit(client: SupabaseClient, classId: string): Promise<AuditEntry[]> {
  const { data, error } = await client.from('audit_log').select('*').eq('class_id', classId)
    .order('at', { ascending: false }).limit(500);
  if (error) throw new Error(error.message);
  return (data as AuditRow[]).map(mapAuditRow);
}

export function subscribeAudit(client: SupabaseClient, classId: string, onEntry: (e: AuditEntry) => void): () => void {
  const channel = client.channel(`audit-${classId}`).on(
    'postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'audit_log', filter: `class_id=eq.${classId}` },
    payload => onEntry(mapAuditRow(payload.new as AuditRow)),
  );
  channel.subscribe();
  return () => { void client.removeChannel(channel); };
}

export async function loadPracticeRoles(client: SupabaseClient): Promise<Role[]> {
  const { data, error } = await client.from('practice_roles').select('id, name, access').order('id');
  if (error) throw new Error(error.message);
  return data as Role[];
}

export async function updateRoleAccess(client: SupabaseClient, roleId: string, access: string[]): Promise<void> {
  const { data, error } = await client.from('practice_roles').update({ access }).eq('id', roleId).select('id');
  if (error) throw new Error(error.message);
  if (!data || data.length === 0) throw new Error('42501: hanya admin yang dapat mengubah hak akses');
}

export async function loadMembers(client: SupabaseClient, classId: string): Promise<User[]> {
  const { data, error } = await client.from('class_members')
    .select('member_role, active, profiles(id, username, full_name)')
    .eq('class_id', classId);
  if (error) throw new Error(error.message);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data ?? []).map((m: any) => ({
    id: m.profiles.id,
    username: m.profiles.username,
    name: m.profiles.full_name,
    roleId: (m.member_role === 'dosen' ? 'R03' : 'R04') as RoleId,
    active: m.active,
  }));
}

export function mergeStaffAndMembers(staff: User[], members: User[]): User[] {
  const ids = new Set(staff.map(u => u.id));
  return [...staff, ...members.filter(m => !ids.has(m.id))];
}

export function logNavigate(client: SupabaseClient, page: string): void {
  void client.rpc('log_event', { p_action: 'NAVIGATE', p_entity: 'Page', p_entity_id: page, p_details: { module: page } });
}
