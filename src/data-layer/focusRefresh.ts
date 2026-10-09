interface Listenable {
  addEventListener(type: string, handler: () => void): void;
  removeEventListener(type: string, handler: () => void): void;
}

export interface FocusRefreshOptions {
  win: Listenable;
  doc: Listenable & { visibilityState: string };
  refresh: () => Promise<void>;
  throttleMs?: number;
  now?: () => number;
  onError?: (err: unknown) => void;
}

/**
 * Spec §6.2: re-read the whole class when the tab becomes visible again or the
 * network comes back, so changes missed by realtime are picked up. Throttled.
 */
export function installFocusRefresh(opts: FocusRefreshOptions): () => void {
  const { win, doc, refresh, throttleMs = 15_000, now = Date.now, onError } = opts;
  let last = now();
  let running = false;
  const trigger = () => {
    if (doc.visibilityState !== 'visible' || running) return;
    if (now() - last < throttleMs) return;
    last = now();
    running = true;
    refresh().catch(err => onError?.(err)).finally(() => { running = false; });
  };
  doc.addEventListener('visibilitychange', trigger);
  win.addEventListener('online', trigger);
  return () => {
    doc.removeEventListener('visibilitychange', trigger);
    win.removeEventListener('online', trigger);
  };
}
