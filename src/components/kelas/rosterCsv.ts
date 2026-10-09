export type RosterCsvRow = { username: string; name: string; statusLabel: string; message?: string; tempPassword: string | null };

export const csvCell = (v: string): string => {
  const safe = /^[=+\-@\t\r]/.test(v) ? `'${v}` : v;
  return `"${safe.replace(/"/g, '""')}"`;
};

export const buildRosterCsv = (rows: RosterCsvRow[]): string => {
  const lines = [
    'NIM,Nama,Status,Keterangan,Password Sementara',
    ...rows.map(r => [r.username, r.name, r.statusLabel, r.message ?? '', r.tempPassword ?? '-'].map(csvCell).join(',')),
  ];
  return '﻿' + lines.join('\n');
};
