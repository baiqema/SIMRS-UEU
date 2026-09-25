export type RoleId = 
  | 'R01' // Super Admin
  | 'R02' // Laboran / Radiologi
  | 'R03' // Dosen
  | 'R04' // Mahasiswa (Umum)
  | 'R05' // Dokter
  | 'R06' // Perawat
  | 'R07' // Petugas Pendaftaran
  | 'R08' // Petugas Rekam Medis
  | 'R09' // Petugas Coding
  | 'R10' // Keuangan / Farmasi
  | 'R11' // Petugas Klaim BPJS
  | 'R12' // Kepala Rekam Medis
  | 'R13' // Petugas Pelaporan
  | 'R14'; // Mahasiswa Keperawatan

export interface User {
  id: string;
  username: string;
  password?: string;
  name: string;
  roleId: RoleId;
  active: boolean;
}

export interface Role {
  id: RoleId;
  name: string;
  access: string[]; // page IDs or 'all'
}

export interface GuarantorInfo {
  name: string;
  phone: string;
  relation: string; // 'Suami' | 'Istri' | 'Ayah' | 'Ibu' | 'Anak' | 'Kakak' | 'Adik' | 'Saudara/Keluarga' | 'Kerabat' | 'Teman'
  country?: string;
  province?: string;
  regency?: string;
  district?: string;
  subDistrict?: string;
  addressStreet?: string;
}

export interface Patient {
  id: string;
  noRM: string;
  nik: string;
  name: string;
  dob: string;
  gender: 'M' | 'F' | '1' | '2' | '0' | '3' | '4' | 'L' | 'P' | string;
  address: string;
  phone: string;
  bloodType: string;
  allergy: string;
  insuranceType: 'BPJS' | 'Umum' | 'Asuransi';
  noBPJS: string;
  bpjsStatus?: 'Aktif' | 'Tidak Aktif';
  bpjsClass?: string;
  bpjsNotes?: string;
  country?: string;
  province?: string;
  regency?: string;
  district?: string;
  subDistrict?: string;
  addressStreet?: string;
  guarantor?: GuarantorInfo;
  motherNoRM?: string;
  motherName?: string;
  birthWeight?: number | string;
  birthLength?: number | string;
  headCircumference?: number | string;
  apgarScore?: string;
  deliveryMethod?: string;
}

export type RegistrationType = 'Rawat Jalan' | 'Rawat Inap' | 'IGD' | 'Bayi Baru Lahir';
export type RegistrationStatus = 'Dirawat' | 'Selesai' | 'Dirujuk' | 'Batal';

export interface Registration {
  id: string;
  patientId: string;
  date: string;
  type: RegistrationType;
  poli: string;
  dpjp: string; // User ID
  status: RegistrationStatus;
  sepNo: string;
  room?: string | null;
  triageLevel?: 'Merah (Resusitasi)' | 'Kuning (Emergensi)' | 'Hijau (Non-Emergensi)' | 'Hitam (Meninggal)';
  admissionSource?: string;
  reasonForVisit?: string;
  gcs?: string;
}

export interface GeneralConsent {
  id: string;
  regId: string;
  date: string;
  patientSign: string;
  witnessSign: string;
  status: 'Signed' | 'Pending';
}

export interface MedicalRecord {
  id: string;
  regId: string;
  noRM: string;
  anamnesis: string;
  physicalExam: string;
  diagnosis: string;
  plan?: string;
  nurseNotes?: string;
  diagnosisStatus: 'Verified' | 'Draft' | 'Pending';
  doctorId: string;
  doctorName?: string;
  doctorSignature?: string;
  nurseId?: string;
  nurseName?: string;
  nurseSignature?: string;
  date: string;
  updatedAt?: string;
}

export interface CPPTMedicineInstruction {
  id?: string;
  drugName: string;
  qty: number | string;
  signa: string;
}

export interface CPPT {
  id: string;
  mrId: string;
  regId?: string;
  date: string;
  time: string;
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  doctorId: string;
  nurseId?: string | null;
  profession?: string;
  staffName?: string;
  unit?: string;
  verified?: boolean;
  vitalSigns?: {
    systolic?: string;
    diastolic?: string;
    heartRate?: string;
    respRate?: string;
    temp?: string;
    spo2?: string;
  };
  instructionPPA?: string;
  medicines?: CPPTMedicineInstruction[];
  implementation?: string;
  criticalValue?: string;
  formatType?: 'SOAP' | 'SBAR' | 'ADIME';
  isDeleted?: boolean;
}

export interface InformedConsent {
  id: string;
  cpptId: string;
  action: string;
  risk: string;
  complication: string;
  doctorId: string;
  date: string;
  status: 'Approved' | 'Pending';
}

export interface Coding {
  id: string;
  mrId: string;
  regId?: string;
  icd10: string[] | string;
  icd10Desc: string[] | string;
  icd9cm: string[] | string;
  icd9cmDesc: string[] | string;
  coderId: string;
  date: string;
  status: 'Draft' | 'Locked';
  note?: string;
}

export interface Claim {
  id: string;
  regId: string;
  codingId: string;
  sepNo: string;
  groupCode: string;
  description: string;
  tariff: number;
  dateSubmitted: string;
  status: 'Submitted' | 'Verified' | 'Rejected';
}

export interface ServiceItem {
  name: string;
  qty: number;
  price: number;
}

export interface Billing {
  id: string;
  regId: string;
  services: ServiceItem[];
  total: number;
  paid: number;
  status: 'Unpaid' | 'Paid';
}

export interface PharmacyItem {
  drug: string;
  qty: number;
  dose: string;
  status: 'Dispensed' | 'Pending';
}

export interface PharmacyRecord {
  id: string;
  regId: string;
  items: PharmacyItem[];
  pharmacist: string;
  date: string;
  status: 'Completed' | 'Pending';
}

export interface LabTestItem {
  name: string;
  loinc: string;
  result: string;
  status: 'Final' | 'Pending';
}

export interface LabRecord {
  id: string;
  regId: string;
  tests: LabTestItem[];
  techId: string;
  date: string;
  status: 'Completed' | 'Pending';
}

export interface RadiologyRecord {
  id: string;
  regId: string;
  exam: string;
  loinc: string;
  result: string;
  radiologist: string;
  date: string;
  status: 'Completed' | 'Pending';
}

export interface ICD10 {
  code: string;
  desc: string;
}

export interface ICD9CM {
  code: string;
  desc: string;
}

export interface AuditEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'NAVIGATE';
  entity: string;
  entityId: string;
  field_name?: string | null;
  old_value?: string | null;
  new_value?: string | null;
  ip: string;
  device: string;
  module?: string;
}

export interface Bed {
  id: string;
  room: string;
  floor: string;
  class: 'VVIP' | 'VIP' | 'Kelas 1' | 'Kelas 2' | 'Kelas 3' | 'IGD' | 'ICU';
  status: 'Occupied' | 'Available' | 'Maintenance' | 'Cleaning';
  patientId: string | null;
  roomName?: string;
  bedNumber?: string;
  note?: string;
  maintenanceReason?: string;
  occupiedSince?: string;
}

export interface PraktikumModule {
  id: string;
  title: string;
  desc: string;
  modul: string;
  status: string;
}

export interface DokumenBerkas {
  id: string;
  patientId: string;
  regId?: string;
  type: 'Radiologi' | 'CPPT' | 'Resume Medis' | 'Hasil Laboratorium' | 'Surat Rujukan' | 'Lainnya';
  title: string;
  filename: string;
  fileSize?: string;
  uploadedBy: string;
  uploadedRole?: string;
  uploadedAt: string;
  url?: string;
  notes?: string;
}

export interface AsuhanKeperawatan {
  id: string;
  regId: string;
  patientId: string;
  nurseId: string;
  nurseName: string;
  date: string;
  time: string;
  status: 'Draft' | 'Final';
  // Pengkajian
  keluhanUtama: string;
  riwayatPenyakit: string;
  alergi: string;
  // TTV
  tekananDarah: string;
  nadi: string;
  suhu: string;
  pernapasan: string;
  spo2: string;
  // SDKI - Diagnosa
  diagnosaSDKI: string[];
  // SIKI - Intervensi
  intervensiSIKI: string[];
  // SLKI - Luaran & Evaluasi
  luaranSLKI: string;
  implementasi: string;
  evaluasiSOAP: {
    s: string;
    o: string;
    a: string;
    p: string;
  };
}

export interface ExamScenario {
  id: string;
  title: string;
  category: 'RMIK' | 'Keperawatan';
  description: string;
  durationMinutes: number;
  status: 'Aktif' | 'Draft' | 'Arsip';
  pdfFileName: string;
  pdfFileUrl?: string;
  pdfContentText: string;
  extractedPatient: {
    name: string;
    noRM: string;
    nik: string;
    birthDate: string;
    gender: 'L' | 'P';
    age: number;
    address: string;
    insurance: string;
  };
  extractedEncounter: {
    regId: string;
    poli: string;
    dpjpName: string;
    date: string;
    subjective: string;
    objective: string;
    vitalSigns: {
      td: string;
      nadi: string;
      suhu: string;
      rr: string;
      spo2: string;
    };
    assessment: string;
    plan: string;
    penunjang?: {
      lab?: string;
      radiologi?: string;
      tindakan?: string;
    };
  };
  answerKey: {
    // For RMIK:
    icd10Primary: string;
    icd10Secondary: string[];
    icd9Procedures: string[];
    // For Keperawatan:
    diagnosaSDKI: string[];
    luaranSLKI: string;
    intervensiSIKI: string[];
    rubrikPenilaian?: string;
  };
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface ExamSubmission {
  id: string;
  scenarioId: string;
  studentId: string;
  studentName: string;
  submittedAt: string;
  timeSpentSeconds: number;
  autoSubmitted: boolean;
  studentAnswer: {
    // For RMIK:
    icd10Primary: string;
    icd10Secondary: string[];
    icd9Procedures: string[];
    coderNotes: string;
    // For Keperawatan:
    diagnosaSDKI: string[];
    luaranSLKI: string;
    intervensiSIKI: string[];
    catatanImplementasi: string;
  };
  score: number;
  scoreDetails: {
    icd10PrimaryMatch: boolean;
    icd10SecondaryMatches: string[];
    icd10SecondaryMissing: string[];
    icd10SecondaryExtra: string[];
    icd9Matches: string[];
    icd9Missing: string[];
    icd9Extra: string[];
    sdkiMatches: string[];
    sdkiMissing: string[];
    sikiMatches: string[];
    sikiMissing: string[];
    slkiScore: number;
    feedback: string;
  };
}
