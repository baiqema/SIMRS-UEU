import { createApp } from './app';
import { createPool } from './db';
import { migrate } from './migrate';

function required(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing environment variable ${name} (see .env.example)`);
  return v;
}

const jwtSecret = required('JWT_SECRET');
if (jwtSecret.length < 32) throw new Error('JWT_SECRET must be at least 32 characters');

const db = createPool(required('DATABASE_URL'));
const port = Number(process.env.PORT ?? 8080);

if (process.env.MIGRATE_ON_START === 'true') {
  await migrate(db, process.env.DB_DIR ?? 'db', { seed: true, log: m => console.log(`[migrate] ${m}`) });
}

createApp({
  db,
  jwtSecret,
  tokenTtl: process.env.TOKEN_TTL ?? '12h',
  staticDir: process.env.STATIC_DIR ?? 'dist',
  trustProxy: process.env.TRUST_PROXY,
}).listen(port, () => console.log(`SIMRS API listening on :${port}`));
