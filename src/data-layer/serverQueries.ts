import { api } from '../lib/apiClient';
import type { AuditEntry, Role, RoleId, User } from '../types';

export interface AuditRow {
  id: number | string; at: string; class_id: string | null; actor_id: string | null; actor_name: string | null;
  practice_role_id: string | null; action: AuditEntry['action'] | 'RESET'; entity: string; entity_id: string | null;
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
    action: r.action as AuditEntry['action'],
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

/** Newest first. With `after`, only entries with a larger id (used for polling). */
export async function loadAuditRows(classId: string, after?: number): Promise<AuditRow[]> {
  return api<AuditRow[]>('GET', `/classes/${classId}/audit${after === undefined ? '' : `?after=${after}`}`);
}

export async function loadAudit(classId: string): Promise<AuditEntry[]> {
  return (await loadAuditRows(classId)).map(mapAuditRow);
}

export async function loadPracticeRoles(): Promise<Role[]> {
  return api<Role[]>('GET', '/practice-roles');
}

export async function updateRoleAccess(roleId: string, access: string[]): Promise<void> {
  await api('PUT', `/practice-roles/${encodeURIComponent(roleId)}`, { access });
}

interface MemberRow { id: string; username: string; full_name: string; member_role: 'dosen' | 'mahasiswa'; active: boolean }

export function mapMembers(rows: MemberRow[]): User[] {
  return rows.map(m => ({
    id: m.id,
    username: m.username,
    name: m.full_name,
    roleId: (m.member_role === 'dosen' ? 'R03' : 'R04') as RoleId,
    active: m.active,
  }));
}

export async function loadMembers(classId: string): Promise<User[]> {
  return mapMembers(await api<MemberRow[]>('GET', `/classes/${classId}/members`));
}

export function mergeStaffAndMembers(staff: User[], members: User[]): User[] {
  const ids = new Set(staff.map(u => u.id));
  return [...staff, ...members.filter(m => !ids.has(m.id))];
}

export function logNavigate(page: string): void {
  void api('POST', '/events', { action: 'NAVIGATE', entity: 'Page', entityId: page, details: { module: page } }).catch(() => {});
}

export type RosterStatus = 'created' | 'existing' | 'skipped' | 'failed';
export interface RosterAccount { username: string; name: string; status: RosterStatus; tempPassword: string | null; message?: string }

export async function importRoster(classId: string, rows: { nim: string; name: string }[]): Promise<RosterAccount[]> {
  return (await api<{ accounts: RosterAccount[] }>('POST', `/classes/${classId}/roster`, { rows })).accounts;
}

export async function createDosenAccount(username: string, name: string): Promise<RosterAccount> {
  return (await api<{ accounts: RosterAccount[] }>('POST', '/accounts/dosen', { username, name })).accounts[0];
}

export async function createClass(name: string): Promise<string> {
  return (await api<{ id: string }>('POST', '/classes', { name })).id;
}

export async function resetClass(classId: string): Promise<void> {
  await api('POST', `/classes/${classId}/reset`);
}

export async function setMemberActive(classId: string, userId: string, active: boolean): Promise<void> {
  await api('PUT', `/classes/${classId}/members/${userId}`, { active });
}
