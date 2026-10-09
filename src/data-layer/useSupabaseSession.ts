import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from 'react';
import { getSupabase } from '../lib/supabaseClient';
import type { AuditEntry, Role, RoleId, User } from '../types';
import { getBackendMode } from './config';
import { notifySaveError } from './notify';
import { sliceRegistry } from './registry';
import {
  changePassword as changePw, endPractice, restoreSession, signIn, startPractice,
  type AccountType, type ClassInfo, type PracticeSession, type Profile,
} from './session';
import { loadAudit, loadMembers, loadPracticeRoles, subscribeAudit } from './supabaseQueries';
import { createSyncEngine } from './syncEngine';
import { setSlicePersistence } from './useSlice';

interface Deps {
  setUser: Dispatch<SetStateAction<User | null>>;
  setRoles: Dispatch<SetStateAction<Role[]>>;
  setAuditTrail: Dispatch<SetStateAction<AuditEntry[]>>;
  onExit: () => void;
}

type Result = { success: boolean; error?: string };

export function useSupabaseSession(deps: Deps) {
  const enabled = getBackendMode() === 'supabase';
  const [booting, setBooting] = useState(enabled);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [classOptions, setClassOptions] = useState<ClassInfo[] | null>(null);
  const [activeClass, setActiveClass] = useState<ClassInfo | null>(null);
  const [members, setMembers] = useState<User[]>([]);
  const pending = useRef<{ profile: Profile; roleId: RoleId } | null>(null);
  const teardown = useRef<(() => void) | null>(null);

  async function enterClass(p: Profile, cls: ClassInfo, roleId: RoleId, existing?: PracticeSession) {
    const client = getSupabase();
    const session = existing ?? await startPractice(client, cls.id, roleId);
    const engine = createSyncEngine(client, cls.id);
    setSlicePersistence({ ...engine, onSaveError: notifySaveError });
    const [rows, roles, memberUsers, audit] = await Promise.all([
      engine.loadAll(), loadPracticeRoles(client), loadMembers(client, cls.id), loadAudit(client, cls.id),
    ]);
    sliceRegistry.hydrateAll(rows);
    deps.setRoles(roles);
    deps.setAuditTrail(audit);
    setMembers(memberUsers);
    const offData = engine.subscribe();
    const offAudit = subscribeAudit(client, cls.id, e => deps.setAuditTrail(prev => [e, ...prev].slice(0, 500)));
    teardown.current = () => { offData(); offAudit(); };
    setProfile(p);
    setActiveClass(cls);
    setClassOptions(null);
    deps.setUser({ id: p.id, username: p.username, name: p.full_name, roleId: session.role_id as RoleId, active: true });
  }

  function clearLocal() {
    teardown.current?.();
    teardown.current = null;
    setSlicePersistence(null);
    sliceRegistry.hydrateAll({});
    deps.setAuditTrail([]);
    setMembers([]);
    setProfile(null);
    setActiveClass(null);
    setClassOptions(null);
    pending.current = null;
    deps.setUser(null);
    deps.onExit();
  }

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    (async () => {
      try {
        const restored = await restoreSession(getSupabase());
        if (cancelled || !restored?.session) return;
        const cls = restored.classes.find(c => c.id === restored.session!.class_id);
        if (cls) await enterClass(restored.profile, cls, restored.session.role_id as RoleId, restored.session);
      } catch (e) {
        notifySaveError(e);
      } finally {
        if (!cancelled) setBooting(false);
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  async function login(username: string, password: string, roleId: RoleId): Promise<Result & { needsClassChoice?: boolean }> {
    const res = await signIn(getSupabase(), username, password);
    if ('error' in res) return { success: false, error: res.error };
    if (res.classes.length > 1) {
      pending.current = { profile: res.profile, roleId };
      setClassOptions(res.classes);
      return { success: true, needsClassChoice: true };
    }
    try {
      await enterClass(res.profile, res.classes[0], roleId);
      return { success: true };
    } catch (e) {
      await getSupabase().auth.signOut();
      return { success: false, error: (e as Error).message };
    }
  }

  async function chooseClass(classId: string): Promise<Result> {
    const p = pending.current;
    const cls = classOptions?.find(c => c.id === classId);
    if (!p || !cls) return { success: false, error: 'Sesi login kedaluwarsa. Silakan masuk kembali.' };
    try {
      await enterClass(p.profile, cls, p.roleId);
      pending.current = null;
      return { success: true };
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  }

  async function logout(): Promise<void> {
    try { await endPractice(getSupabase()); } finally { clearLocal(); }
  }

  async function changePassword(newPassword: string): Promise<Result> {
    if (newPassword.length < 8) return { success: false, error: 'Password minimal 8 karakter' };
    try {
      await changePw(getSupabase(), newPassword);
      setProfile(prev => (prev ? { ...prev, must_change_password: false } : prev));
      return { success: true };
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  }

  async function resetActiveClass(): Promise<Result> {
    if (!activeClass || !profile) return { success: false, error: 'Tidak ada kelas aktif' };
    const { error } = await getSupabase().rpc('reset_class', { p_class: activeClass.id });
    if (error) return { success: false, error: error.message };
    const rows = await createSyncEngine(getSupabase(), activeClass.id).loadAll();
    sliceRegistry.hydrateAll(rows);
    return { success: true };
  }

  return {
    enabled, booting, members, classOptions, activeClass,
    accountType: (profile?.account_type ?? null) as AccountType | null,
    mustChangePassword: profile?.must_change_password ?? false,
    login, chooseClass, logout, changePassword, resetActiveClass,
  };
}
