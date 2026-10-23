import { describe, expect, it } from 'vitest';
import { getApiUrl, getBackendMode, isDemoMode } from './config';

describe('getBackendMode', () => {
  it('is local unless VITE_API_URL is set', () => {
    expect(getBackendMode({})).toBe('local');
    expect(getBackendMode({ VITE_API_URL: '  ' })).toBe('local');
    expect(getBackendMode({ VITE_API_URL: '/api' })).toBe('server');
  });
});

describe('getApiUrl', () => {
  it('drops trailing slashes', () => {
    expect(getApiUrl({ VITE_API_URL: 'https://simrs.esaunggul.ac.id/api/' })).toBe('https://simrs.esaunggul.ac.id/api');
  });
});

describe('isDemoMode', () => {
  it('is always true in local mode and follows VITE_DEMO_MODE in server mode', () => {
    expect(isDemoMode({})).toBe(true);
    const server = { VITE_API_URL: '/api' };
    expect(isDemoMode(server)).toBe(false);
    expect(isDemoMode({ ...server, VITE_DEMO_MODE: 'true' })).toBe(true);
  });
});
