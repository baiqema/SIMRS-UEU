export interface RosterRow { nim: string; name: string }
const NIM = /^[0-9a-z._-]{3,40}$/;
export const MAX_ROWS = 300;

export function parseRoster(text: string): { rows: RosterRow[]; errors: string[] } {
  const rows: RosterRow[] = [];
  const errors: string[] = [];
  const seen = new Set<string>();
  text.split(/\r?\n/).forEach((line, i) => {
    const trimmed = line.trim();
    if (!trimmed) return;
    const [rawNim, ...rest] = trimmed.split(/[,;\t]/);
    const nim = rawNim.trim().toLowerCase();
    const name = rest.join(' ').trim();
    if (i === 0 && /^nim$/i.test(nim)) return;
    if (!NIM.test(nim)) { errors.push(`Baris ${i + 1}: NIM tidak valid`); return; }
    if (!name || name.length > 120) { errors.push(`Baris ${i + 1}: Nama wajib diisi (maks. 120 karakter)`); return; }
    if (seen.has(nim)) { errors.push(`Baris ${i + 1}: NIM duplikat`); return; }
    seen.add(nim);
    rows.push({ nim, name });
  });
  return { rows, errors };
}

export function validateRows(rows: unknown): RosterRow[] {
  if (!Array.isArray(rows) || rows.length === 0) throw new Error('Daftar mahasiswa kosong');
  if (rows.length > MAX_ROWS) throw new Error(`Daftar terlalu panjang (maksimal ${MAX_ROWS} baris)`);
  return rows.map((r, i) => {
    const nim = String((r as RosterRow)?.nim ?? '').trim().toLowerCase();
    const name = String((r as RosterRow)?.name ?? '').trim();
    if (!NIM.test(nim) || !name || name.length > 120) throw new Error(`Baris ${i + 1} tidak valid`);
    return { nim, name };
  });
}
