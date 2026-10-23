import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import type { Db } from './db';

/**
 * Applies db/migrations/*.sql in name order, each in its own transaction, recording
 * applied versions in simrs_meta.schema_migrations. With seed, also (re)loads db/seed.sql,
 * which only rewrites the template class.
 */
export async function migrate(db: Db, dbDir: string, opts: { seed?: boolean; log?: (m: string) => void } = {}) {
  const log = opts.log ?? (() => {});
  await db.query(`create schema if not exists simrs_meta;
    create table if not exists simrs_meta.schema_migrations (version text primary key, applied_at timestamptz not null default now())`);
  const done = new Set((await db.query('select version from simrs_meta.schema_migrations')).rows.map(r => r.version));
  const files = readdirSync(path.join(dbDir, 'migrations')).filter(f => f.endsWith('.sql')).sort();
  for (const f of files) {
    const version = f.replace(/\.sql$/, '');
    if (done.has(version)) continue;
    const sql = readFileSync(path.join(dbDir, 'migrations', f), 'utf8');
    const tx = await db.connect();
    try {
      await tx.query('begin');
      await tx.query(sql);
      await tx.query('insert into simrs_meta.schema_migrations (version) values ($1)', [version]);
      await tx.query('commit');
      log(`applied ${f}`);
    } catch (e) {
      await tx.query('rollback');
      throw new Error(`${f}: ${(e as Error).message}`);
    } finally {
      tx.release();
    }
  }
  if (opts.seed) {
    await db.query(readFileSync(path.join(dbDir, 'seed.sql'), 'utf8'));
    log('loaded seed.sql');
  }
}
