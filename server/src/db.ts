import pg from 'pg';

export type Db = pg.Pool;
export type Tx = pg.PoolClient;

export function createPool(connectionString: string): Db {
  return new pg.Pool({ connectionString, max: Number(process.env.DB_POOL_MAX ?? 10) });
}

async function inTransaction<T>(db: Db, setup: (tx: Tx) => Promise<void>, fn: (tx: Tx) => Promise<T>): Promise<T> {
  const tx = await db.connect();
  try {
    await tx.query('begin');
    await setup(tx);
    const out = await fn(tx);
    await tx.query('commit');
    return out;
  } catch (e) {
    try { await tx.query('rollback'); } catch { /* connection already broken */ }
    throw e;
  } finally {
    tx.release();
  }
}

/**
 * Runs fn as the signed-in user: row-level security and security definer
 * functions see them through auth.uid(), and the owner's privileges are dropped.
 */
export function asUser<T>(db: Db, userId: string, fn: (tx: Tx) => Promise<T>): Promise<T> {
  return inTransaction(db, async tx => {
    await tx.query("select set_config('simrs.user_id', $1, true)", [userId]);
    await tx.query('set local role simrs_user');
  }, fn);
}

/** Runs fn with the owner's privileges (no RLS). Only for login, account creation and tooling. */
export function asOwner<T>(db: Db, fn: (tx: Tx) => Promise<T>): Promise<T> {
  return inTransaction(db, async () => {}, fn);
}
