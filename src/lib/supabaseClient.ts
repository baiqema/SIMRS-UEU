import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { getBackendMode } from '../data-layer/config';

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (getBackendMode() !== 'supabase') throw new Error('Supabase is not configured (local mode)');
  if (!client) {
    client = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY, {
      auth: { persistSession: true, autoRefreshToken: true },
    });
  }
  return client;
}
