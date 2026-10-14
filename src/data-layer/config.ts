export type BackendMode = 'local' | 'supabase';
type Env = Record<string, string | boolean | undefined>;

export function getBackendMode(env: Env = import.meta.env): BackendMode {
  return env.VITE_SUPABASE_URL && env.VITE_SUPABASE_ANON_KEY ? 'supabase' : 'local';
}

/** Preset demo accounts are shown in local mode (prototype) and on the Vercel demo. */
export function isDemoMode(env: Env = import.meta.env): boolean {
  return getBackendMode(env) === 'local' || env.VITE_DEMO_MODE === 'true';
}
