import type { Patient, MedicalRecord, Registration } from '../types';

const isLegacyRM = (raw: string, digits: string) =>
  !digits || digits.startsWith('2024') || digits.startsWith('24') || digits.startsWith('9988') || raw.includes('RM-');

const rmNumber = (noRM: string) => parseInt(noRM.replace(/\D/g, '') || '0', 10);

export function sanitizePatientList(list: Patient[]): Patient[] {
  const mapped = list.map((p, idx) => {
    const raw = p.noRM || '';
    const digits = raw.replace(/\D/g, '');
    if (isLegacyRM(raw, digits)) return { ...p, noRM: String(idx + 1).padStart(6, '0') };
    return { ...p, noRM: digits.padStart(6, '0') };
  });
  return mapped.sort((a, b) => rmNumber(a.noRM) - rmNumber(b.noRM));
}

export function sanitizeMedicalRecords(list: MedicalRecord[]): MedicalRecord[] {
  return list
    .map((m, idx) => {
      const raw = m.noRM || '';
      const digits = raw.replace(/\D/g, '');
      if (raw.includes('2024') || isLegacyRM(raw, digits)) return { ...m, noRM: String(idx + 1).padStart(6, '0') };
      return { ...m, noRM: digits.padStart(6, '0') };
    })
    .sort((a, b) => rmNumber(a.noRM) - rmNumber(b.noRM));
}

export function buildTodayRegistrations(todayStr: string, todayCompact = todayStr.replace(/-/g, '')): Registration[] {
  return [
    {
      id: 'REG-TODAY-IGD', patientId: 'P001', date: todayStr, type: 'IGD',
      poli: 'Instalasi Gawat Darurat (IGD)', dpjp: 'U002', status: 'Dirawat',
      sepNo: `0010R001${todayCompact}V001`, room: 'Bed Resusitasi 01',
      triageLevel: 'Kuning (Emergensi)', reasonForVisit: 'Nyeri dada kiri menjalar & sesak napas akut',
    },
    {
      id: 'REG-TODAY-RALAN', patientId: 'P002', date: todayStr, type: 'Rawat Jalan',
      poli: 'Poli Penyakit Dalam', dpjp: 'U002', status: 'Dirawat',
      sepNo: `0010R001${todayCompact}V002`, room: null,
      reasonForVisit: 'Kontrol rutin hipertensi dan keluhan lemas',
    },
    {
      id: 'REG-TODAY-RANAP', patientId: 'P003', date: todayStr, type: 'Rawat Inap',
      poli: 'Bangsal Perawatan Melati', dpjp: 'U002', status: 'Dirawat',
      sepNo: `0010R001${todayCompact}V003`, room: 'Kamar Melati 204 (Bed A)',
      reasonForVisit: 'Demam tifoid hari ke-5 & dehidrasi sedang',
    },
  ] as Registration[];
}

export function ensureTodayRegistrations(list: Registration[], todayStr: string): Registration[] {
  if (list.some(r => r.date === todayStr)) return list;
  return [...buildTodayRegistrations(todayStr), ...list];
}
