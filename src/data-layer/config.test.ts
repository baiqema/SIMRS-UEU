import { describe, expect, it } from 'vitest';
import { getBackendMode, isDemoMode } from './config';

describe('getBackendMode', () => {
  it('is local unless both Supabase variables are present', () => {
    expect(getBackendMode({})).toBe('local');
    expect(getBackendMode({ VITE_SUPABASE_URL: 'https://x.supabase.co' })).toBe('local');
    expect(getBackendMode({ VITE_SUPABASE_URL: 'https://x.supabase.co', VITE_SUPABASE_ANON_KEY: 'k' })).toBe('supabase');
  });
});

describe('isDemoMode', () => {
  it('is always true in local mode and follows VITE_DEMO_MODE in supabase mode', () => {
    expect(isDemoMode({})).toBe(true);
    const sb = { VITE_SUPABASE_URL: 'u', VITE_SUPABASE_ANON_KEY: 'k' };
    expect(isDemoMode(sb)).toBe(false);
    expect(isDemoMode({ ...sb, VITE_DEMO_MODE: 'true' })).toBe(true);
  });
});
