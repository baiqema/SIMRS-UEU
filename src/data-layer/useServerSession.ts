import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from 'react';
import type { AuditEntry, Role, RoleId, User } from '../types';
import { getBackendMode } from './config';
import { installFocusRefresh } from './focusRefresh';
import { notifySaveError } from './notify';
import { sliceRegistry } from './registry';
import {
  changePassword as changePw, endPractice, restoreSession, signIn, startPractice,
  type AccountType, type ClassInfo, type PracticeSession, type Profile,
} from './session';
import {
  loadAuditRows, loadMembers, loadPracticeRoles, mapAuditRow, resetClass, setMemberActive as setMemberActiveApi,
  type AuditRow,
} from './serverQueries';
import { createSyncEngine } from './syncEngine';
import { setSlicePersistence } from './useSlice';

interface Deps {
  setUser: Dispatch<SetStateAction<User | null>>;
  setRoles: Dispatch<SetStateAction<Role[]>>;
  setAuditTrail: Dispatch<SetStateAction<AuditEntry[]>>;
  onExit: () => void;
}

type Result = { success: boolean; error?: string };

/** How often other users' changes are fetched while the tab is visible. */
export const POLL_MS = 5_000;

const maxId = (rows: AuditRow[]) => rows.reduce((m, r) => Math.max(m, Number(r.id)), 0);

export function useServerSession(deps: Deps) {
  const enabled = getBackendMode() === 'server';
  const [booting, setBooting] = useState(enabled);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [classOptions, setClassOptions] = useState<ClassInfo[] | null>(null);
  const [activeClass, setActiveClass] = useState<ClassInfo | null>(null);
  const [members, setMembers] = useState<User[]>([]);
  const pending = useRef<{ profile: Profile; roleId: RoleId } | null>(null);
  const teardown = useRef<(() => void) | null>(null);

  async function enterClass(p: Profile, cls: ClassInfo, roleId: RoleId, existing?: PracticeSession) {
    try {
      const session = existing ?? await startPractice(cls.id, roleId);
      const engine = createSyncEngine(cls.id);
      setSlicePersistence({ ...engine, onSaveError: notifySaveError });
      const [rows, roles, memberUsers, auditRows] = await Promise.all([
        engine.loadAll(), loadPracticeRoles(), loadMembers(cls.id), loadAuditRows(cls.id),
      ]);
      sliceRegistry.hydrateAll(rows);
      deps.setRoles(roles);
      deps.setAuditTrail(auditRows.map(mapAuditRow));
      setMembers(memberUsers);

      let live = true;
      let lastAudit = maxId(auditRows);
      const reloadAll = async () => {
        const [freshRows, freshMembers, freshAudit] = await Promise.all([
          engine.loadAll(), loadMembers(cls.id), loadAuditRows(cls.id),
        ]);
        if (!live) return;
        sliceRegistry.hydrateAll(freshRows);
        setMembers(freshMembers);
        deps.setAuditTrail(freshAudit.map(mapAuditRow));
        lastAudit = Math.max(lastAudit, maxId(freshAudit));
      };

      // Other users' changes arrive through the class audit log, which every write lands in.
      let polling = false;
      const poll = async () => {
        if (polling || document.visibilityState !== 'visible') return;
        polling = true;
        try {
          const fresh = await loadAuditRows(cls.id, lastAudit);
          if (!live || fresh.length === 0) return;
          lastAudit = Math.max(lastAudit, maxId(fresh));
          deps.setAuditTrail(prev => [...fresh.map(mapAuditRow), ...prev].slice(0, 500));
          if (engine.applyChanges(fresh, p.id)) await reloadAll();
        } catch { /* transient network error: try again next tick */ } finally {
          polling = false;
        }
      };
      const timer = window.setInterval(() => { void poll(); }, POLL_MS);
      const offFocus = installFocusRefresh({ win: window, doc: document, refresh: reloadAll });
      teardown.current = () => { live = false; window.clearInterval(timer); offFocus(); };

      setProfile(p);
      setActiveClass(cls);
      setClassOptions(null);
      deps.setUser({ id: p.id, username: p.username, name: p.full_name, roleId: session.role_id as RoleId, active: true });
    } catch (e) {
      // Leave nothing behind: no polling, no slice persistence, no open practice
      // session, and no signed-in token without an app user.
      teardown.current?.();
      teardown.current = null;
      setSlicePersistence(null);
      // A restored session is left open (a transient load failure should not end it);
      // one we just started (or are about to) is ended, which also signs out.
      if (!existing) {
        try { await endPractice(); } catch { /* best effort */ }
      }
      throw e;
    }
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
        const restored = await restoreSession();
        if (cancelled || !restored?.session) return;
        const cls = restored.classes.find(c => c.id === restored.session!.class_id);
        if (cls) await enterClass(restored.profile, cls, restored.session.role_id as RoleId, restored.session);
      } catch (e) {
        notifySaveError(e);
      } finally {
        if (!cancelled) setBooting(false);
      }
    })();
    return () => { cancelled = true; teardown.current?.(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  async function login(username: string, password: string, roleId: RoleId): Promise<Result & { needsClassChoice?: boolean }> {
    const res = await signIn(username, password);
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
      // enterClass already ended the practice session and signed out.
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
      // enterClass signed the user out; drop the picker so they restart from the login form.
      notifySaveError(e);
      pending.current = null;
      setClassOptions(null);
      return { success: false, error: (e as Error).message };
    }
  }

  async function logout(): Promise<void> {
    try { await endPractice(); } finally { clearLocal(); }
  }

  async function changePassword(newPassword: string): Promise<Result> {
    if (newPassword.length < 8) return { success: false, error: 'Password minimal 8 karakter' };
    try {
      await changePw(newPassword);
      setProfile(prev => (prev ? { ...prev, must_change_password: false } : prev));
      return { success: true };
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  }

  async function resetActiveClass(): Promise<Result> {
    if (!activeClass || !profile) return { success: false, error: 'Tidak ada kelas aktif' };
    try {
      await resetClass(activeClass.id);
      sliceRegistry.hydrateAll(await createSyncEngine(activeClass.id).loadAll());
      return { success: true };
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  }

  async function reloadMembers(): Promise<void> {
    if (!activeClass) return;
    try { setMembers(await loadMembers(activeClass.id)); } catch { /* the next focus refresh retries */ }
  }

  async function setMemberActive(userId: string, active: boolean): Promise<Result> {
    if (!activeClass) return { success: false, error: 'Tidak ada kelas aktif' };
    try {
      await setMemberActiveApi(activeClass.id, userId, active);
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
    setMembers(prev => prev.map(m => (m.id === userId ? { ...m, active } : m)));
    return { success: true };
  }

  return {
    enabled, booting, members, classOptions, activeClass, setMemberActive, reloadMembers,
    accountType: (profile?.account_type ?? null) as AccountType | null,
    mustChangePassword: profile?.must_change_password ?? false,
    login, chooseClass, logout, changePassword, resetActiveClass,
  };
}
