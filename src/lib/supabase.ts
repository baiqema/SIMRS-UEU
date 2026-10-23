import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

/**
 * Validasi apakah konfigurasi Supabase tersedia.
 * Jika tidak diisi (misal dalam AI Studio atau mode offline), aplikasi berjalan dalam Local Mode.
 */
export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.trim().startsWith('http') &&
  supabaseAnonKey.trim().length > 10
);

/**
 * Instance Supabase Client (singleton).
 * Null jika dalam Local Mode.
 */
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    })
  : null;

/**
 * Helper informasi status mode operasional saat ini
 */
export const getOperationalMode = (): 'Local Mode' | 'Supabase Mode' => {
  return isSupabaseConfigured ? 'Supabase Mode' : 'Local Mode';
};
