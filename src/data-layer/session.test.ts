import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { normalizeUsername, signIn } from './session';

describe('normalizeUsername', () => {
  it('lowercases and trims', () => {
    expect(normalizeUsername('  DSN.Dr.Wati ')).toBe('dsn.dr.wati');
    expect(normalizeUsername('20240306044')).toBe('20240306044');
  });
  it('rejects characters a username cannot contain', () => {
    expect(() => normalizeUsername('budi santoso')).toThrow(/Username hanya boleh/);
    expect(() => normalizeUsername('')).toThrow(/Username hanya boleh/);
  });
});

describe('signIn', () => {
  const store = new Map<string, string>();
  beforeEach(() => {
    vi.stubGlobal('localStorage', {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => { store.set(k, v); },
      removeItem: (k: string) => { store.delete(k); },
    });
  });
  afterEach(() => { vi.unstubAllGlobals(); store.clear(); });

  const respond = (status: number, body: unknown) =>
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify(body), { status })));

  it('stores the token and returns profile and classes', async () => {
    respond(200, { token: 't1', profile: { id: 'u1' }, classes: [{ id: 'c1', name: 'A' }] });
    const res = await signIn('A', 'pw');
    expect(res).toEqual({ profile: { id: 'u1' }, classes: [{ id: 'c1', name: 'A' }] });
    expect(store.get('simrs_api_token')).toBe('t1');
  });

  it('returns the server message for a refused login and keeps no token', async () => {
    store.set('simrs_api_token', 'old');
    respond(401, { error: 'Username/NIM atau password salah' });
    expect(await signIn('a', 'bad')).toEqual({ error: 'Username/NIM atau password salah' });
    expect(store.has('simrs_api_token')).toBe(false);
  });

  it('hides server errors behind a generic message', async () => {
    respond(500, { error: 'Kesalahan server' });
    expect(await signIn('a', 'pw')).toEqual({ error: 'Gagal memuat data akun. Coba lagi.' });
  });
});
