import { existsSync } from 'node:fs';
import { createPool } from '../../server/src/db';
import { migrate } from '../../server/src/migrate';

/** Rebuilds the test database from db/migrations and db/seed.sql before the run. */
export default async function setup() {
  if (existsSync('.env.test.local')) process.loadEnvFile('.env.test.local');
  const url = process.env.TEST_DATABASE_URL;
  if (!url) throw new Error('Missing TEST_DATABASE_URL (a database the test may wipe; see docs/operations/development.md)');
  const db = createPool(url);
  try {
    await db.query('drop schema if exists public, private, auth, simrs_meta cascade; create schema public;');
    await migrate(db, 'db', { seed: true });
  } finally {
    await db.end();
  }
}
