import { describe, expect, it } from 'vitest';
import { parseRoster, validateRows } from './validate';

describe('parseRoster', () => {
  it('accepts comma, semicolon or tab separated "NIM, Nama" lines and skips a header', () => {
    const { rows, errors } = parseRoster('NIM,Nama\n20240306044, Budi Santoso\n20240306045;Siti\n20240306046\tAni Lestari\n');
    expect(errors).toEqual([]);
    expect(rows).toEqual([
      { nim: '20240306044', name: 'Budi Santoso' },
      { nim: '20240306045', name: 'Siti' },
      { nim: '20240306046', name: 'Ani Lestari' },
    ]);
  });

  it('reports bad lines with their line number and drops duplicate NIMs', () => {
    const { rows, errors } = parseRoster('20240306044,Budi\nbukan nim!,X\n20240306044,Budi lagi');
    expect(rows).toHaveLength(1);
    expect(errors).toEqual(['Baris 2: NIM tidak valid', 'Baris 3: NIM duplikat']);
  });
});

describe('validateRows', () => {
  it('rejects more than 300 rows', () => {
    const rows = Array.from({ length: 301 }, (_, i) => ({ nim: `n${i}`, name: 'x' }));
    expect(() => validateRows(rows)).toThrow(/maksimal 300/);
  });
});
