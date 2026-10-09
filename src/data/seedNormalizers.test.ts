import { describe, expect, it } from 'vitest';
import {
  sanitizePatientList, sanitizeMedicalRecords,
  buildTodayRegistrations, ensureTodayRegistrations,
} from './seedNormalizers';
import type { Patient, MedicalRecord, Registration } from '../types';

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

describe('buildTodayRegistrations', () => {
  it('builds IGD, Rawat Jalan and Rawat Inap seeds for the given day', () => {
    const regs = buildTodayRegistrations('2026-10-09');
    expect(regs.map(r => r.type)).toEqual(['IGD', 'Rawat Jalan', 'Rawat Inap']);
    expect(regs[0].sepNo).toBe('0010R00120261009V001');
  });

  it('accepts placeholders for seed generation', () => {
    const regs = buildTodayRegistrations('__TODAY__', '__TODAYCOMPACT__');
    expect(regs[0].date).toBe('__TODAY__');
    expect(regs[0].sepNo).toBe('0010R001__TODAYCOMPACT__V001');
  });
});

describe('ensureTodayRegistrations', () => {
  it('prepends today seeds only when no registration exists for today', () => {
    const existing = [{ id: 'R1', date: '2026-01-01' }] as Registration[];
    expect(ensureTodayRegistrations(existing, '2026-10-09')).toHaveLength(4);
    const withToday = [{ id: 'R1', date: '2026-10-09' }] as Registration[];
    expect(ensureTodayRegistrations(withToday, '2026-10-09')).toBe(withToday);
  });
});
