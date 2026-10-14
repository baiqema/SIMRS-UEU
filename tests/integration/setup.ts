import { existsSync } from 'node:fs';

if (existsSync('.env.test.local')) process.loadEnvFile('.env.test.local');
for (const k of ['SUPABASE_TEST_URL', 'SUPABASE_TEST_ANON_KEY', 'SUPABASE_TEST_SERVICE_ROLE_KEY']) {
  if (!process.env[k]) throw new Error(`Missing ${k}; see docs/superpowers/plans (Phase 4 intro)`);
}
