export type BackendMode = 'local' | 'server';
type Env = Record<string, string | boolean | undefined>;

/** Server mode when VITE_API_URL points at the SIMRS API (e.g. "/api"); otherwise browser-only local mode. */
export function getBackendMode(env: Env = import.meta.env): BackendMode {
  return typeof env.VITE_API_URL === 'string' && env.VITE_API_URL.trim() !== '' ? 'server' : 'local';
}

export function getApiUrl(env: Env = import.meta.env): string {
  return String(env.VITE_API_URL ?? '').trim().replace(/\/+$/, '');
}

/** Preset demo accounts are shown in local mode (prototype) and on demo deployments. */
export function isDemoMode(env: Env = import.meta.env): boolean {
  return getBackendMode(env) === 'local' || env.VITE_DEMO_MODE === 'true';
}
