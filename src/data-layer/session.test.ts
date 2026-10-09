import { describe, expect, it, vi } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import { signIn, usernameToEmail } from './session';

describe('usernameToEmail', () => {
  it('lowercases and trims, then appends the internal domain', () => {
    expect(usernameToEmail('  DSN.Dr.Wati ')).toBe('dsn.dr.wati@users.simrs-ueu.invalid');
    expect(usernameToEmail('20240306044')).toBe('20240306044@users.simrs-ueu.invalid');
  });
  it('rejects characters that cannot form an email local part', () => {
    expect(() => usernameToEmail('budi santoso')).toThrow(/Username hanya boleh/);
    expect(() => usernameToEmail('')).toThrow(/Username hanya boleh/);
  });
});

describe('signIn', () => {
  it('signs out and returns an error when post-login loading fails', async () => {
    const signOut = vi.fn().mockResolvedValue({});
    const client = {
      auth: { signInWithPassword: vi.fn().mockResolvedValue({ data: { user: { id: 'u1' } }, error: null }), signOut },
      from: () => ({ select: () => ({ eq: () => ({ maybeSingle: () => Promise.resolve({
        data: { id: 'u1', username: 'a', full_name: 'A', account_type: 'mahasiswa', must_change_password: false, active: true }, error: null }) }) }) }),
      rpc: vi.fn().mockResolvedValue({ data: null, error: { message: 'boom' } }),
    } as unknown as SupabaseClient;
    const res = await signIn(client, 'a', 'pw');
    expect(res).toEqual({ error: 'Gagal memuat data akun. Coba lagi.' });
    expect(signOut).toHaveBeenCalledTimes(1);
  });
});
