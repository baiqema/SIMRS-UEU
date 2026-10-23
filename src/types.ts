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

export interface SimClass {
  id: string; // e.g. 'RMIK-2024-A'
  name: string; // 'RMIK 2024 - Kelas A (Reguler Pagi)'
  dosenId?: string;
  dosenName?: string;
  semester?: string;
  academicYear?: string;
  createdAt: string;
  active: boolean;
  description?: string;
}

export interface User {
  id: string;
  username: string;
  password?: string;
  name: string;
  roleId: RoleId;
  active: boolean;
  classId?: string;
  nim?: string;
  tempPassword?: string;
  isFirstLogin?: boolean;
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
export type RegistrationStatus = 'Dirawat' | 'Selesai' | 'Dirujuk' | 'Batal' | 'Siap Diperiksa' | 'Selesai Diperiksa';
export type ExaminationStatus = 'Siap Diperiksa' | 'Selesai Diperiksa';

export interface Registration {
  id: string;
  patientId: string;
  date: string;
  registrationTime?: string;
  type: RegistrationType;
  poli: string;
  dpjp: string; // User ID
  status: RegistrationStatus;
  examinationStatus?: ExaminationStatus;
  sepNo: string;
  room?: string | null;
  bedId?: string;
  naikKelas?: { isNaik: boolean; dari?: string; ke?: string };
  triageLevel?: 'Merah (Resusitasi)' | 'Kuning (Emergensi)' | 'Hijau (Non-Emergensi)' | 'Hitam (Meninggal)';
  reasonForVisit?: string;
  gcs?: string;
  // Validasi Alur Pelayanan, Potensi Fragmentasi & Batasan Waktu
  potensiFragmentasi?: boolean;
  fragmentasiReason?: string;
  rujukanDate?: string; // Tanggal surat rujukan / jadwal kontrol (maks 7 hari)
  durasiHari?: number; // Durasi hari rawat inap / umur episode
  batasWaktuTerlampaui?: boolean; // True jika Rawat Jalan > 7 hari atau Rawat Inap > 30 hari
  batasWaktuKeterangan?: string;
  overrideBatasWaktu?: {
    approved: boolean;
    approvedBy?: string;
    approvedAt?: string;
    reason?: string;
  };
}

export interface GeneralConsent {
  id: string;
  regId: string;
  date: string;
  patientSign: string;
  witnessSign: string;
  status: 'Signed' | 'Pending';
  patientSignatureImage?: string;
  witnessSignatureImage?: string;
  signerRelation?: string;
  signerName?: string;
  signerPhone?: string;
  witnessName?: string;
  pelepasanInformasiKhusus?: string[];
  catatanKhusus?: string;
  updatedAt?: string;
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
  informedConsentType?: 'Persetujuan' | 'Penolakan';
  diagnosisInfo?: string;
  tataCaraTindakan?: string;
  tujuanTindakan?: string;
  prognosis?: string;
  alternatifRisiko?: string;
  patientSignName?: string;
  patientRelation?: string;
  patientSignatureImage?: string;
  doctorSignatureImage?: string;
  witnessName?: string;
  witnessSignatureImage?: string;
  updatedAt?: string;
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
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'NAVIGATE' | 'RESET';
  entity: string;
  entityId: string;
  field_name?: string | null;
  old_value?: string | null;
  new_value?: string | null;
  ip: string;
  device: string;
  module?: string;
  classId?: string;
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

export type ResumeMedisStatus = 'Belum Lengkap' | 'Menunggu Verifikasi' | 'Siap Difinalisasi' | 'Final';

export interface ResumeMedisProcedure {
  code?: string;
  name: string;
  date?: string;
}

export interface ResumeMedisHomeMed {
  drugName: string;
  dose: string;
  frequency: string;
  route?: string;
  instructions?: string;
}

export interface ResumeMedis {
  id: string;
  regId: string;
  noRM: string;
  patientId: string;
  doctorId: string; // DPJP ID
  doctorName?: string;
  admissionDate: string;
  dischargeDate: string;
  lengthOfStay?: number; // Hari rawat
  admissionPoliRoom?: string;
  dischargeRoom?: string;
  dischargeType: 'Persetujuan Dokter' | 'Pulang Paksa (APS)' | 'Rujuk ke RS Lain' | 'Meninggal Dunia' | 'Melarikan Diri' | string;
  dischargeCondition: 'Sembuh' | 'Membaik' | 'Belum Sembuh' | 'Perbaikan Klinis' | 'Meninggal < 48 Jam' | 'Meninggal >= 48 Jam' | string;
  
  // Riwayat & Pemeriksaan
  chiefComplaint: string; // Keluhan utama
  historyOfPresentIllness: string; // Riwayat perjalanan penyakit / anamnesis
  pastMedicalHistory?: string;
  vitalSignsAdmission?: {
    td?: string;
    nadi?: string;
    rr?: string;
    suhu?: string;
    spo2?: string;
    kesadaran?: string;
  };
  vitalSignsDischarge?: {
    td?: string;
    nadi?: string;
    rr?: string;
    suhu?: string;
    spo2?: string;
    kesadaran?: string;
  };
  physicalExamSummary?: string;

  // Penunjang
  labResultsSummary?: string;
  radiologySummary?: string;
  otherDiagnosticSummary?: string;

  // Diagnosis (dengan validasi pencocokan dokumen verifikasi)
  admissionDiagnosis: string;
  primaryDiagnosisForm: string; // Diagnosis DPJP formulir
  primaryDiagnosisVerified: string; // Diagnosis dari dokumen verifikasi / koding
  isDiagnosisMatched: boolean; // Validasi kesesuaian
  diagnosisDiscrepancyNotes?: string;
  secondaryDiagnoses: string[];
  secondaryDiagnosesVerified?: string[];

  // Tindakan
  procedures: ResumeMedisProcedure[];

  // Terapi
  therapyDuringHospitalization: string[];
  homeMedications: ResumeMedisHomeMed[];

  // Instruksi & Edukasi
  dischargeInstructions: string;
  followUpPlan: {
    controlDate?: string;
    controlPoli?: string;
    controlDoctor?: string;
    emergencyWarningSigns?: string;
  };
  dietRecommendation?: string;
  activityRecommendation?: string;

  // Status & Kelengkapan
  status: ResumeMedisStatus;
  missingFields: string[]; // Automatic completeness checking checklist
  serviceType?: 'Rawat Inap' | 'Rawat Jalan' | 'IGD';
  resolutionTargetHours?: number; // 48 jam (Rawat Inap) vs 24 jam (Rawat Jalan & IGD)
  deadlineTimestamp?: string;
  inaCbgPedomanNotes?: string[]; // Catatan pedoman verifikasi klaim INA-CBG Edisi 2
  doctorSignature?: string;
  doctorSignatureDate?: string;
  finalizedAt?: string;
  finalizedBy?: string;
  reminderDeadline?: string;
  createdAt?: string;
  updatedAt?: string;
}

// ==========================================
// MASTER DATA MANAGEMENT (SUPERADMIN ROLE R01)
// ==========================================

export type JenisRuangan = 
  | 'Rawat Inap' 
  | 'ICU' 
  | 'NICU' 
  | 'PICU' 
  | 'HCU' 
  | 'Isolasi' 
  | 'VK / Bersalin' 
  | 'Bedah / OK' 
  | 'Perawatan Khusus'
  | string;

export interface MasterRuangan {
  id: string; // Unique ID (e.g. RNG-MWR-01)
  kode: string; // Unique Room Code
  nama: string; // Room Name (e.g. Bangsal Mawar)
  jenis: JenisRuangan;
  lokasi: string; // Building, Floor (e.g. Gedung A Lantai 2)
  kapasitas: number; // Bed capacity (non-negative)
  status: 'Aktif' | 'Nonaktif';
  deskripsi?: string;
  fasilitas?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export type StatusBedOperasional = 
  | 'Tersedia' 
  | 'Terisi' 
  | 'Dibersihkan' 
  | 'Dalam Perbaikan' 
  | 'Tidak Aktif';

export interface MasterBed {
  id: string; // Unique Bed ID / Code (e.g. MWR-101-A)
  kode: string; // Unique Bed Code
  nama: string; // Bed Name/Number (e.g. Bed A, Kamar 101 - Bed 01)
  ruanganId: string; // Relasi ke ID Ruangan
  ruanganNama: string; // Denormalized Room Name
  kelas: 'VVIP' | 'VIP' | 'Kelas 1' | 'Kelas 2' | 'Kelas 3' | 'ICU' | 'Isolasi' | string;
  statusOperasional: StatusBedOperasional;
  patientId?: string | null;
  pasienNama?: string | null;
  status: 'Aktif' | 'Nonaktif';
  catatan?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MasterDokter {
  id: string; // Unique Doctor ID (e.g. DOC-001)
  nama: string; // Full Name with titles (e.g. dr. Andika Pratama, Sp.PD)
  nik: string; // 16-digit NIK
  strSip: string; // STR / SIP number
  spesialisasi: string; // Specialty (e.g. Penyakit Dalam)
  telepon: string; // Phone number
  email?: string;
  status: 'Aktif' | 'Nonaktif';
  gender?: 'L' | 'P';
  jadwalUmum?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type KelompokLayananPoli = 
  | 'Spesialis Dasar' 
  | 'Spesialis Lain' 
  | 'Gigi Spesialis' 
  | 'Penunjang Medik' 
  | 'Layanan Umum'
  | string;

export interface MasterPoli {
  id: string; // Unique Poli ID / Code (e.g. POL-PD)
  kode: string; // Unique Poli Code
  nama: string; // Poli Name (e.g. Poliklinik Penyakit Dalam)
  kelompokLayanan: KelompokLayananPoli;
  lokasi: string; // Building & Floor location
  jamPelayanan: string; // Service hours (e.g. 08:00 - 15:00 WIB)
  status: 'Aktif' | 'Nonaktif';
  deskripsi?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DoctorPoliMapping {
  id: string; // Unique Mapping ID
  doctorId: string; // Doctor ID from MasterDokter
  doctorName: string;
  poliId: string; // Poli ID from MasterPoli
  poliName: string;
  jadwalPraktik?: string; // Formatted schedule string
  hariPraktik: string[]; // e.g. ['Senin', 'Rabu', 'Jumat']
  jamMulai: string; // e.g. "08:00"
  jamSelesai: string; // e.g. "12:00"
  status: 'Aktif' | 'Nonaktif';
  catatan?: string;
  createdAt?: string;
  updatedAt?: string;
}


