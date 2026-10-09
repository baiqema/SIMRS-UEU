import { describe, it, expect } from 'vitest';
import { csvCell, buildRosterCsv } from './rosterCsv';

describe('csvCell', () => {
  it('prefixes formula triggers', () => {
    expect(csvCell('=1+1')).toBe(`"'=1+1"`);
    expect(csvCell('-x')).toBe(`"'-x"`);
    expect(csvCell('@a')).toBe(`"'@a"`);
    expect(csvCell('+1')).toBe(`"'+1"`);
  });
  it('escapes quotes and commas', () => {
    expect(csvCell('a"b')).toBe('"a""b"');
    expect(csvCell('a,b')).toBe('"a,b"');
  });
  it('leaves normal names', () => { expect(csvCell('Budi Santoso')).toBe('"Budi Santoso"'); });
});

describe('buildRosterCsv', () => {
  it('starts with BOM and header', () => {
    const out = buildRosterCsv([{ username: '1', name: '=x', statusLabel: 'Akun baru', tempPassword: null }]);
    expect(out.startsWith('﻿NIM,Nama')).toBe(true);
    expect(out).toContain(`"'=x"`);
  });
});
