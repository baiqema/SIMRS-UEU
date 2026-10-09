import type { RoleId } from '../types';

export const DEMO_ACCOUNTS: { label: string; u: string; p: string; roleId: RoleId; accountType: 'admin' | 'dosen' | 'mahasiswa' }[] = [
  { label: 'Mahasiswa Coding (NIM 20240306044)', u: '20240306044', p: 'mhs123', roleId: 'R09', accountType: 'mahasiswa' },
  { label: 'Mahasiswa Pendaftaran', u: 'mhs.pendaftaran', p: 'pendaftaran123', roleId: 'R07', accountType: 'mahasiswa' },
  { label: 'Mahasiswa Perawat', u: 'mhs.perawat', p: 'perawat123', roleId: 'R06', accountType: 'mahasiswa' },
  { label: 'Mahasiswa Pelaporan', u: 'mhs.pelaporan', p: 'pelaporan123', roleId: 'R13', accountType: 'mahasiswa' },
  { label: 'Dosen Pengampu (Dr. Wati)', u: 'dsn.dr.wati', p: 'dosen123', roleId: 'R03', accountType: 'dosen' },
  { label: 'Super Administrator', u: 'admin', p: 'admin123', roleId: 'R01', accountType: 'admin' },
];
