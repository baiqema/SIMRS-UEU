import { describe, expect, it, vi } from 'vitest';
import { installFocusRefresh } from './focusRefresh';

function target() {
  const handlers = new Map<string, () => void>();
  return {
    handlers,
    addEventListener: vi.fn((t: string, h: () => void) => { handlers.set(t, h); }),
    removeEventListener: vi.fn((t: string) => { handlers.delete(t); }),
  };
}

function setup(throttleMs = 15_000) {
  let t = 0;
  const win = target();
  const doc = { ...target(), visibilityState: 'visible' };
  const refresh = vi.fn().mockResolvedValue(undefined);
  const off = installFocusRefresh({ win, doc, refresh, throttleMs, now: () => t });
  return { win, doc, refresh, off, advance: (ms: number) => { t += ms; } };
}

describe('installFocusRefresh', () => {
  it('refetches when the tab becomes visible, at most once per throttle window', async () => {
    const s = setup();
    s.advance(16_000);
    s.doc.handlers.get('visibilitychange')!();
    expect(s.refresh).toHaveBeenCalledTimes(1);
    await new Promise(r => setTimeout(r, 0));
    s.advance(1_000);
    s.doc.handlers.get('visibilitychange')!();
    expect(s.refresh).toHaveBeenCalledTimes(1);
    s.advance(15_000);
    s.win.handlers.get('online')!();
    expect(s.refresh).toHaveBeenCalledTimes(2);
  });

  it('ignores hidden transitions and the first 15 s after loading', () => {
    const s = setup();
    s.doc.handlers.get('visibilitychange')!();
    expect(s.refresh).not.toHaveBeenCalled();
    s.advance(20_000);
    s.doc.visibilityState = 'hidden';
    s.doc.handlers.get('visibilitychange')!();
    expect(s.refresh).not.toHaveBeenCalled();
  });

  it('removes its listeners on teardown', () => {
    const s = setup();
    s.off();
    expect(s.doc.handlers.size).toBe(0);
    expect(s.win.handlers.size).toBe(0);
  });

  it('reports refresh failures without throwing', async () => {
    const onError = vi.fn();
    const win = target();
    const doc = { ...target(), visibilityState: 'visible' };
    let t = 0;
    installFocusRefresh({ win, doc, refresh: vi.fn().mockRejectedValue(new Error('x')), now: () => t, onError });
    t = 20_000;
    doc.handlers.get('visibilitychange')!();
    await new Promise(r => setTimeout(r, 0));
    expect(onError).toHaveBeenCalledOnce();
  });
});
