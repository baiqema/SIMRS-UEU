import { Registration, RegistrationType } from '../types';

export const PENGECUALIAN_FRAGMENTASI = [
  'Dalam kondisi kegawatdaruratan sesuai regulasi yang berlaku',
  'Penyakit kronis',
  'Rangkaian tindakan/prosedur/post prosedur yang terjadwal oleh dokter/fasilitas kesehatan sesuai indikasi medis dan tidak dapat dilakukan dalam satu episode',
  'Konsultasi hasil pemeriksaan penunjang yang tidak dapat dilakukan dalam satu episode'
] as const;

export const PENGECUALIAN_READMISI = [
  'Dalam kondisi kegawatdaruratan sesuai regulasi yang berlaku',
  'Penyakit kronis',
  'Tindakan/prosedur/post prosedur yang terjadwal oleh dokter/fasilitas kesehatan sesuai indikasi medis dan tidak dapat dilakukan dalam satu episode',
  'Kunjungan pada FKRTL yang berbeda atau kelas FKRTL yang lebih tinggi'
] as const;

export interface FragmentationCheckResult {
  isPotential: boolean;
  type?: 'kunjungan_ulang_poli' | 'perpindahan_poli' | 'readmisi_ranap';
  previousVisit?: Registration;
  diffDays?: number;
  reason?: string;
  recommendation?: string;
  isReadmisi?: boolean;
}

export interface RawatJalanLimitResult {
  isExceeded: boolean;
  diffDays: number;
  maxDays: number;
  message: string;
  canBypassWithApproval: boolean;
}

export interface RawatInapLimitResult {
  isExceeded: boolean;
  losDays: number;
  maxDays: number;
  status: 'normal' | 'pemantauan' | 'kritis_terlampaui';
  message: string;
  requiresSpecialApproval: boolean;
}

/**
 * Menghitung selisih hari antara dua tanggal string (YYYY-MM-DD)
 */
export function calculateDaysDifference(dateAStr: string, dateBStr: string): number {
  if (!dateAStr || !dateBStr) return 0;
  const dA = new Date(dateAStr);
  const dB = new Date(dateBStr);
  if (isNaN(dA.getTime()) || isNaN(dB.getTime())) return 0;
  
  // Normalisasi waktu ke jam 00:00:00
  const utc1 = Date.UTC(dA.getFullYear(), dA.getMonth(), dA.getDate());
  const utc2 = Date.UTC(dB.getFullYear(), dB.getMonth(), dB.getDate());
  
  const diffTime = Math.abs(utc2 - utc1);
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Deteksi Potensi Fragmentasi & Readmisi Sesuai Regulasi BPJS / Permenkes:
 *
 * 1. Fragmentasi (Rawat Jalan):
 *    Kunjungan rawat jalan berulang di FKRTL yang sama pada kasus dengan diagnosis yang sama
 *    dari episode rawat jalan sebelumnya dalam waktu KURANG ATAU SAMA DENGAN 7 HARI (≤ 7 Hari).
 *
 * 2. Readmisi (Rawat Inap):
 *    Kunjungan rawat inap berulang di FKRTL yang sama dengan diagnosis utama yang sama
 *    dari episode rawat inap sebelumnya dalam waktu KURANG ATAU SAMA DENGAN 30 HARI (≤ 30 Hari).
 */
export function checkPotentialFragmentation(
  patientId: string,
  targetPoli: string,
  targetType: RegistrationType,
  visitDate: string,
  allRegistrations: Registration[],
  excludeRegId?: string
): FragmentationCheckResult {
  if (!patientId || !targetPoli) {
    return { isPotential: false };
  }

  const patientVisits = allRegistrations.filter(r => 
    r.patientId === patientId && 
    r.id !== excludeRegId && 
    r.status !== 'Batal'
  );

  if (patientVisits.length === 0) {
    return { isPotential: false };
  }

  // A. KASUS RAWAT JALAN: Cek Fragmentasi (≤ 7 Hari)
  if (targetType === 'Rawat Jalan') {
    const ralanVisits = patientVisits.filter(r => r.type === 'Rawat Jalan');
    
    for (const prev of ralanVisits) {
      const diffDays = calculateDaysDifference(prev.date, visitDate);
      const cleanTargetPoli = targetPoli.trim().toLowerCase();
      const cleanPrevPoli = prev.poli.trim().toLowerCase();

      // Kunjungan ulang ke poli yang sama persis dalam ≤ 7 hari
      if (cleanTargetPoli === cleanPrevPoli && diffDays <= 7) {
        return {
          isPotential: true,
          type: 'kunjungan_ulang_poli',
          previousVisit: prev,
          diffDays,
          reason: `Terdeteksi Fragmentasi: Pasien tercatat melakukan kunjungan rawat jalan berulang ke ${prev.poli} dalam waktu ≤ 7 hari (${diffDays} hari yang lalu pada tgl ${prev.date}, No. Reg: ${prev.id}).`,
          recommendation: `Sesuai ketentuan, fragmentasi adalah kunjungan rawat jalan berulang di FKRTL yang sama pada kasus dengan diagnosis yang sama dalam waktu ≤ 7 hari. Pastikan kasus memenuhi kondisi pengecualian (kegawatdaruratan, penyakit kronis, prosedur terjadwal, atau konsultasi hasil penunjang) sebelum melanjutkan.`
        };
      }

      // Perpindahan antar poli spesialis dalam ≤ 7 hari
      if (cleanTargetPoli !== cleanPrevPoli && diffDays <= 7) {
        return {
          isPotential: true,
          type: 'perpindahan_poli',
          previousVisit: prev,
          diffDays,
          reason: `Terdeteksi Alur Rujukan Antar-Poli: Pasien tercatat berpindah dari ${prev.poli} ke ${targetPoli} dalam selang ${diffDays} hari (${prev.date}).`,
          recommendation: `Pastikan perpindahan poli telah melalui konsul internal antar-bagian DPJP atau rangkaian prosedur terjadwal untuk mencegah dispute klaim fragmentasi.`
        };
      }
    }
  }

  // B. KASUS RAWAT INAP: Cek Readmisi (≤ 30 Hari)
  if (targetType === 'Rawat Inap') {
    const ranapVisits = patientVisits.filter(r => r.type === 'Rawat Inap');

    for (const prev of ranapVisits) {
      const diffDays = calculateDaysDifference(prev.date, visitDate);

      if (diffDays <= 30) {
        return {
          isPotential: true,
          isReadmisi: true,
          type: 'readmisi_ranap',
          previousVisit: prev,
          diffDays,
          reason: `Terdeteksi Potensi Readmisi: Kunjungan rawat inap berulang di FKRTL yang sama dengan diagnosis sebelumnya dalam waktu ≤ 30 hari (${diffDays} hari pasca admisi ${prev.date}, No. Reg: ${prev.id}).`,
          recommendation: `Sesuai ketentuan, readmisi adalah kunjungan rawat inap berulang di FKRTL yang sama dengan diagnosis utama yang sama dalam waktu ≤ 30 hari. Evaluasi apakah memenuhi kondisi pengecualian (kegawatdaruratan, penyakit kronis, tindakan terjadwal, atau faskes/kelas lebih tinggi).`
        };
      }
    }
  }

  return { isPotential: false };
}

/**
 * 2. Penerapan Batas Waktu Pelayanan Rawat Jalan:
 * Batas waktu kunjungan atau kontrol rawat jalan ditetapkan maksimal selama 7 hari.
 */
export function checkRawatJalanLimit(
  rujukanOrControlDate: string,
  visitDate: string = new Date().toISOString().split('T')[0]
): RawatJalanLimitResult {
  const maxDays = 7;
  if (!rujukanOrControlDate) {
    return {
      isExceeded: false,
      diffDays: 0,
      maxDays,
      message: 'Tanggal kontrol/rujukan valid.',
      canBypassWithApproval: false
    };
  }

  const diffDays = calculateDaysDifference(rujukanOrControlDate, visitDate);
  const isExceeded = diffDays > maxDays;

  return {
    isExceeded,
    diffDays,
    maxDays,
    message: isExceeded
      ? `Batas waktu kunjungan/kontrol rawat jalan terlampaui (${diffDays} hari > Maksimal 7 Hari). Surat kontrol atau rujukan telah kedaluwarsa sesuai regulasi.`
      : `Masa berlaku rujukan/kontrol aktif (${diffDays}/${maxDays} hari).`,
    canBypassWithApproval: true
  };
}

/**
 * 3. Penerapan Batas Waktu Pelayanan Rawat Inap:
 * Batas waktu perawatan untuk pasien rawat inap ditetapkan maksimal selama 30 hari.
 */
export function checkRawatInapLimit(
  admissionDate: string,
  currentDate: string = new Date().toISOString().split('T')[0]
): RawatInapLimitResult {
  const maxDays = 30;
  if (!admissionDate) {
    return {
      isExceeded: false,
      losDays: 0,
      maxDays,
      status: 'normal',
      message: 'Tanggal admisi rawat inap belum ditentukan.',
      requiresSpecialApproval: false
    };
  }

  const losDays = calculateDaysDifference(admissionDate, currentDate);
  const isExceeded = losDays > maxDays;

  let status: 'normal' | 'pemantauan' | 'kritis_terlampaui' = 'normal';
  if (isExceeded) {
    status = 'kritis_terlampaui';
  } else if (losDays >= 20) {
    status = 'pemantauan';
  }

  return {
    isExceeded,
    losDays,
    maxDays,
    status,
    message: isExceeded
      ? `Batas waktu perawatan rawat inap terlampaui (${losDays} hari > Maksimal 30 Hari). Regulasi kendali mutu membatasi masa rawat maksimal 30 hari.`
      : `Durasi perawatan rawat inap: ${losDays} hari (Maks. 30 hari).`,
    requiresSpecialApproval: isExceeded
  };
}
