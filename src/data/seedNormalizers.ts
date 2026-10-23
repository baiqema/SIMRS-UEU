import type { Patient, MedicalRecord } from '../types';

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
