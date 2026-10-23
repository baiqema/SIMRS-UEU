import type { ErrorRequestHandler } from 'express';

export class HttpError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

/**
 * PostgreSQL errors keep their SQLSTATE in the message (e.g. "42501: ...") so the app's
 * save-error notice can tell a permission refusal from a network problem.
 */
export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof HttpError) {
    res.status(err.status).json({ error: err.message });
    return;
  }
  const code: string | undefined = err?.code;
  if (code === '42501') { res.status(403).json({ error: `42501: ${err.message}` }); return; }
  if (code && /^(22|23|P0|55)/.test(code)) { res.status(400).json({ error: `${code}: ${err.message}` }); return; }
  if (err?.type === 'entity.parse.failed') { res.status(400).json({ error: 'Body bukan JSON' }); return; }
  if (err?.type === 'entity.too.large') { res.status(413).json({ error: 'Data terlalu besar' }); return; }
  console.error(err);
  res.status(500).json({ error: 'Kesalahan server' });
};
