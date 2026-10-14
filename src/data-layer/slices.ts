export const SLICES = {
  patients: { table: 'patients', localKey: 'simrs_patients' },
  registrations: { table: 'registrations', localKey: 'simrs_registrations' },
  generalConsents: { table: 'general_consents', localKey: 'simrs_generalConsents' },
  medicalRecords: { table: 'medical_records', localKey: 'simrs_medicalRecords' },
  cppt: { table: 'cppt', localKey: 'simrs_cppt' },
  informedConsents: { table: 'informed_consents', localKey: 'simrs_informedConsents' },
  coding: { table: 'coding', localKey: 'simrs_coding' },
  claims: { table: 'claims', localKey: 'simrs_claims' },
  billing: { table: 'billing', localKey: 'simrs_billing' },
  beds: { table: 'beds', localKey: 'simrs_beds' },
  dokumenBerkas: { table: 'dokumen_berkas', localKey: 'simrs_dokumenBerkas' },
  asuhanKeperawatan: { table: 'asuhan_keperawatan', localKey: 'simrs_asuhanKeperawatan' },
  resumeMedisList: { table: 'resume_medis', localKey: 'simrs_resume_medis' },
  staff: { table: 'staff_directory', localKey: 'simrs_users' },
} as const satisfies Record<string, { table: string; localKey: string }>;

export type SliceName = keyof typeof SLICES;
export const SLICE_NAMES = Object.keys(SLICES) as SliceName[];
export const SLICE_BY_TABLE = Object.fromEntries(
  SLICE_NAMES.map(n => [SLICES[n].table, n]),
) as Record<string, SliceName>;
