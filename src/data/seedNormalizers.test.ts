import { describe, expect, it } from 'vitest';
import { sanitizePatientList, sanitizeMedicalRecords } from './seedNormalizers';
import type { Patient, MedicalRecord } from '../types';

describe('sanitizePatientList', () => {
  it('replaces legacy RM numbers with the 1-based position and sorts ascending', () => {
    const list = [
      { id: 'P2', noRM: '000007' },
      { id: 'P1', noRM: 'RM-2024-01' },
    ] as Patient[];
    const out = sanitizePatientList(list);
    expect(out.map(p => p.noRM)).toEqual(['000002', '000007']);
  });
});

describe('sanitizeMedicalRecords', () => {
  it('pads RM digits to six characters', () => {
    const out = sanitizeMedicalRecords([{ id: 'M1', noRM: '42' }] as MedicalRecord[]);
    expect(out[0].noRM).toBe('000042');
  });
});
