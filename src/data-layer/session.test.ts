import { describe, expect, it } from 'vitest';
import { usernameToEmail } from './session';

describe('usernameToEmail', () => {
  it('lowercases and trims, then appends the internal domain', () => {
    expect(usernameToEmail('  DSN.Dr.Wati ')).toBe('dsn.dr.wati@users.simrs-ueu.invalid');
    expect(usernameToEmail('20240306044')).toBe('20240306044@users.simrs-ueu.invalid');
  });
  it('rejects characters that cannot form an email local part', () => {
    expect(() => usernameToEmail('budi santoso')).toThrow(/Username hanya boleh/);
    expect(() => usernameToEmail('')).toThrow(/Username hanya boleh/);
  });
});
