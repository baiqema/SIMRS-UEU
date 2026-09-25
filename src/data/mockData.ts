import {
  User, Role, Patient, Registration, GeneralConsent, MedicalRecord,
  CPPT, InformedConsent, Coding, Claim, Billing, PharmacyRecord, LabRecord,
  RadiologyRecord, ICD10, ICD9CM, Bed, AuditEntry, PraktikumModule, DokumenBerkas, AsuhanKeperawatan
} from '../types';

export const INITIAL_USERS: User[] = [
  { id: 'U001', username: 'admin', password: 'admin123', name: 'Super Administrator', roleId: 'R01', active: true },
  { id: 'U008', username: 'dosen', password: 'dosen123', name: 'Dr. Wati Susanti, M.Kes (Dosen RMIK)', roleId: 'R03', active: true },
  { id: 'U008B', username: 'dsn.dr.wati', password: 'dosen123', name: 'Dr. Wati Susanti, M.Kes (Dosen RMIK)', roleId: 'R03', active: true },
  
  // Mahasiswa RMIK Kategori
  { id: 'U007_PENDAFTARAN', username: 'mhs.pendaftaran', password: 'pendaftaran123', name: 'Mahasiswa RMIK - Pendaftaran & VClaim', roleId: 'R07', active: true },
  { id: 'U007_KEPERAWATAN', username: 'mhs.keperawatan', password: 'keperawatan123', name: 'Mahasiswa RMIK - Keperawatan & Asuhan', roleId: 'R14', active: true },
  { id: 'U007_PERAWAT', username: 'mhs.perawat', password: 'perawat123', name: 'Mahasiswa RMIK - Perawat & Triase', roleId: 'R06', active: true },
  { id: 'U007_KODING', username: 'mhs.koding', password: 'koding123', name: 'Mahasiswa RMIK - Koding & Casemix', roleId: 'R09', active: true },
  { id: 'U007_PELAPORAN', username: 'mhs.pelaporan', password: 'pelaporan123', name: 'Mahasiswa RMIK - Pelaporan & Statistik', roleId: 'R13', active: true },
  { id: 'U007_RME', username: 'mhs.rme', password: 'rme123', name: 'Mahasiswa RMIK - Rekam Medis & CPPT', roleId: 'R08', active: true },
  { id: 'U007_UMUM', username: 'mhs.umum', password: 'mhs123', name: 'Mahasiswa RMIK - Umum (All Modul)', roleId: 'R04', active: true },
  { id: 'U007', username: 'mahasiswa', password: 'mhs123', name: 'Mahasiswa SIMRS (All Modul)', roleId: 'R04', active: true },
  { id: 'U007B', username: 'mhs.john', password: 'mhs123', name: 'Mahasiswa RMIK Esa Unggul', roleId: 'R04', active: true },

  { id: 'U002', username: 'dr.sari', password: 'dokter123', name: 'dr. Sari Dewi, Sp.PD', roleId: 'R05', active: true },
  { id: 'U003', username: 'ns.budi', password: 'perawat123', name: 'Ns. Budi Hartono, S.Kep', roleId: 'R06', active: true },
  { id: 'U004', username: 'reg.rina', password: 'reg123', name: 'Rina Wulandari, A.Md', roleId: 'R07', active: true },
  { id: 'U005', username: 'rm.ana', password: 'rm123', name: 'Ana Ratnasari, S.IKM', roleId: 'R08', active: true },
  { id: 'U006', username: 'coder.dina', password: 'coder123', name: 'Dina Permata, A.Md', roleId: 'R09', active: true },
  { id: 'U009', username: 'lab.wati', password: 'lab123', name: 'Wati Laboratorium, A.Md', roleId: 'R02', active: true },
  { id: 'U010', username: 'kepala.rm', password: 'kepala123', name: 'Drs. Hendra Kusuma, M.Kes', roleId: 'R12', active: true },
  { id: 'U011', username: 'farmasi.adi', password: 'farmasi123', name: 'Adi Nugroho, S.Farm', roleId: 'R10', active: true },
  { id: 'U012', username: 'rad.siti', password: 'rad123', name: 'Siti Aminah, A.Md.Rad', roleId: 'R02', active: true },
  { id: 'U013', username: 'klaim.budi', password: 'klaim123', name: 'Budi Setiawan, A.Md', roleId: 'R11', active: true },
  { id: 'U014', username: 'keu.yuli', password: 'keu123', name: 'Yuliana Dewi, S.E', roleId: 'R10', active: true },
  { id: 'U015', username: 'laporan.rina', password: 'laporan123', name: 'Rina Fitriani, S.IKM', roleId: 'R13', active: true },
];

export const INITIAL_ROLES: Role[] = [
  { id: 'R01', name: 'Super Admin', access: ['all'] },
  { id: 'R02', name: 'Laboran/Radiologi', access: ['dashboard', 'laboratorium', 'radiologi', 'audit'] },
  { 
    id: 'R03', 
    name: 'Dosen', 
    access: [
      'dashboard', 'portal', 'pendaftaran', 'generalconsent', 'rekammedis', 'cppt', 
      'keperawatan', 'informedconsent', 'resumemedis', 'farmasi', 'laboratorium', 
      'radiologi', 'coding', 'klaim', 'pelaporan', 'billing', 'pembayaran', 
      'praktikum', 'audit', 'logaktivitas'
    ] 
  },
  { id: 'R04', name: 'Mahasiswa (All Modul)', access: ['all'] },
  { id: 'R05', name: 'Dokter', access: ['dashboard', 'rekammedis', 'cppt', 'informedconsent', 'resumemedis', 'laboratorium', 'radiologi'] },
  { id: 'R06', name: 'Mahasiswa Perawat', access: ['dashboard', 'rekammedis', 'cppt', 'keperawatan', 'informedconsent', 'resumemedis', 'laboratorium', 'radiologi'] },
  { id: 'R07', name: 'Mahasiswa Pendaftaran', access: ['dashboard', 'pendaftaran', 'generalconsent', 'vclaim', 'sep'] },
  { id: 'R08', name: 'Petugas Rekam Medis', access: ['dashboard', 'rekammedis', 'cppt', 'resumemedis', 'coding', 'pelaporan'] },
  { id: 'R09', name: 'Mahasiswa Coding', access: ['dashboard', 'coding', 'klaim', 'eklaim'] },
  { id: 'R10', name: 'Keuangan/Farmasi', access: ['dashboard', 'billing', 'pembayaran', 'farmasi'] },
  { id: 'R11', name: 'Petugas Klaim BPJS', access: ['dashboard', 'klaim', 'coding', 'billing'] },
  { id: 'R12', name: 'Kepala Rekam Medis', access: ['dashboard', 'rekammedis', 'coding', 'pelaporan', 'audit', 'manajemenuser'] },
  { id: 'R13', name: 'Mahasiswa Pelaporan', access: ['dashboard', 'pelaporan', 'audit'] },
  { id: 'R14', name: 'Mahasiswa Keperawatan', access: ['dashboard', 'rekammedis', 'cppt', 'keperawatan', 'resumemedis'] },
];

export const INITIAL_DOKUMEN_BERKAS: DokumenBerkas[] = [
  {
    id: 'DOC001',
    patientId: 'P001',
    regId: 'REG001',
    type: 'Radiologi',
    title: 'Hasil Foto Thorax PA Pasien',
    filename: 'Thorax_PA_P001_2026.pdf',
    fileSize: '2.4 MB',
    uploadedBy: 'Dr. Wati Susanti, M.Kes',
    uploadedRole: 'Dosen RMIK',
    uploadedAt: '2026-08-28 10:30',
    notes: 'Kardiomegali ringan dengan CTR 54%, sinus kostofrenikus tajam.'
  },
  {
    id: 'DOC002',
    patientId: 'P002',
    regId: 'REG002',
    type: 'Hasil Laboratorium',
    title: 'Pemeriksaan Darah Lengkap & Troponin T',
    filename: 'Lab_Troponin_T_P002.pdf',
    fileSize: '1.1 MB',
    uploadedBy: 'Dr. Wati Susanti, M.Kes',
    uploadedRole: 'Dosen RMIK',
    uploadedAt: '2026-08-29 14:15',
    notes: 'Troponin T positif 0.85 ng/mL, indikasi ACS / NSTEMI.'
  },
  {
    id: 'DOC003',
    patientId: 'P001',
    regId: 'REG001',
    type: 'CPPT',
    title: 'Lembar Terintegrasi CPPT & Catatan Klinis',
    filename: 'CPPT_Terintegrasi_P001.pdf',
    fileSize: '850 KB',
    uploadedBy: 'Dr. Wati Susanti, M.Kes',
    uploadedRole: 'Dosen RMIK',
    uploadedAt: '2026-08-30 09:00',
    notes: 'Catatan perkembangan terintegrasi DPJP & PPA.'
  }
];

export const INITIAL_PATIENTS: Patient[] = [
  {
    id: 'P001',
    noRM: '000001',
    nik: '3174011505920001',
    name: 'Tn. Ahmad Fauzi',
    dob: '1992-05-15',
    gender: 'M',
    address: 'Jl. Kebon Jeruk Raya No. 45, Jakarta Barat',
    phone: '081234567890',
    bloodType: 'O',
    allergy: 'Penisilin',
    insuranceType: 'BPJS',
    noBPJS: '0001234567891',
    bpjsStatus: 'Aktif',
    bpjsClass: 'Kelas 1',
    country: 'INDONESIA',
    province: 'DKI JAKARTA',
    regency: 'KOTA JAKARTA BARAT',
    district: 'KEBON JERUK',
    subDistrict: 'DURI KEPA',
    addressStreet: 'Jl. Kebon Jeruk Raya No. 45',
    guarantor: {
      name: 'Siti Rahma',
      phone: '081234567891',
      relation: 'Istri',
      addressStreet: 'Jl. Kebon Jeruk Raya No. 45'
    }
  },
  {
    id: 'P002',
    noRM: '000002',
    nik: '3174022408850002',
    name: 'Ny. Siti Rahma',
    dob: '1985-08-24',
    gender: 'F',
    address: 'Jl. Palmerah Barat No. 12, Jakarta Barat',
    phone: '081398765432',
    bloodType: 'A',
    allergy: 'Tidak Ada',
    insuranceType: 'BPJS',
    noBPJS: '0001234567892',
    bpjsStatus: 'Aktif',
    bpjsClass: 'Kelas 2',
    country: 'INDONESIA',
    province: 'DKI JAKARTA',
    regency: 'KOTA JAKARTA BARAT',
    district: 'PALMERAH',
    subDistrict: 'PALMERAH',
    addressStreet: 'Jl. Palmerah Barat No. 12',
    guarantor: {
      name: 'Ahmad Fauzi',
      phone: '081234567890',
      relation: 'Suami',
      addressStreet: 'Jl. Palmerah Barat No. 12'
    }
  },
  {
    id: 'P003',
    noRM: '000003',
    nik: '3174031003780003',
    name: 'Tn. Budi Santoso',
    dob: '1978-03-10',
    gender: 'M',
    address: 'Jl. Kemanggisan Utama No. 8, Jakarta Barat',
    phone: '085611223344',
    bloodType: 'B',
    allergy: 'Sulfa',
    insuranceType: 'Umum',
    noBPJS: '',
    country: 'INDONESIA',
    province: 'DKI JAKARTA',
    regency: 'KOTA JAKARTA BARAT',
    district: 'PALMERAH',
    subDistrict: 'KEMANGGISAN',
    addressStreet: 'Jl. Kemanggisan Utama No. 8'
  },
  {
    id: 'P004',
    noRM: '000004',
    nik: '3174041812180004',
    name: 'An. Rizky Pratama',
    dob: '2018-12-18',
    gender: 'M',
    address: 'Jl. Arjuna Utara No. 9, Jakarta Barat',
    phone: '081299887766',
    bloodType: 'AB',
    allergy: 'Tidak Ada',
    insuranceType: 'BPJS',
    noBPJS: '0001234567894',
    bpjsStatus: 'Tidak Aktif',
    bpjsClass: 'Kelas 3',
    bpjsNotes: 'Tunggakan Iuran 2 Bulan (Non-Aktif sejak 01/08/2026)',
    country: 'INDONESIA',
    province: 'DKI JAKARTA',
    regency: 'KOTA JAKARTA BARAT',
    district: 'KEBON JERUK',
    subDistrict: 'DURI KEPA',
    addressStreet: 'Jl. Arjuna Utara No. 9',
    guarantor: {
      name: 'Hendra Pratama',
      phone: '081299887766',
      relation: 'Ayah'
    }
  },
  {
    id: 'P005',
    noRM: '000005',
    nik: '3174052506950005',
    name: 'Ny. Dewi Lestari',
    dob: '1995-06-25',
    gender: 'F',
    address: 'Jl. Tomang Raya No. 18, Jakarta Barat',
    phone: '087812345678',
    bloodType: 'O',
    allergy: 'Debu',
    insuranceType: 'BPJS',
    noBPJS: '0001234567895',
    bpjsStatus: 'Aktif',
    bpjsClass: 'Kelas 1',
    country: 'INDONESIA',
    province: 'DKI JAKARTA',
    regency: 'KOTA JAKARTA BARAT',
    district: 'GROGOL PETAMBURAN',
    subDistrict: 'TOMANG',
    addressStreet: 'Jl. Tomang Raya No. 18'
  }
];

export const INITIAL_REGISTRATIONS: Registration[] = [
  {
    id: 'REG001',
    patientId: 'P001',
    date: '2026-08-28',
    type: 'IGD',
    poli: 'IGD',
    dpjp: 'U002',
    status: 'Dirawat',
    sepNo: '0010R0010826V000001',
    room: 'IGD-01'
  },
  {
    id: 'REG002',
    patientId: 'P002',
    date: '2026-08-29',
    type: 'Rawat Inap',
    poli: 'Penyakit Dalam',
    dpjp: 'U002',
    status: 'Dirawat',
    sepNo: '0010R0010826V000002',
    room: 'VVIP-201'
  },
  {
    id: 'REG003',
    patientId: 'P003',
    date: '2026-08-30',
    type: 'Rawat Jalan',
    poli: 'Poli Jantung',
    dpjp: 'U002',
    status: 'Selesai',
    sepNo: '-',
    room: null
  },
  {
    id: 'REG004',
    patientId: 'P004',
    date: '2026-08-30',
    type: 'IGD',
    poli: 'IGD',
    dpjp: 'U002',
    status: 'Selesai',
    sepNo: '0010R0010826V000004',
    room: null
  },
  {
    id: 'REG005',
    patientId: 'P005',
    date: '2026-08-30',
    type: 'Rawat Jalan',
    poli: 'Poli Penyakit Dalam',
    dpjp: 'U002',
    status: 'Selesai',
    sepNo: '0010R0010826V000005',
    room: null
  },
  {
    id: 'REG006',
    patientId: 'P001',
    date: '2026-09-11',
    type: 'Rawat Jalan',
    poli: 'Poli Penyakit Dalam',
    dpjp: 'U002',
    status: 'Selesai',
    sepNo: '0010R0010826V000006',
    room: null
  },
  {
    id: 'REG007',
    patientId: 'P002',
    date: '2026-09-11',
    type: 'Rawat Jalan',
    poli: 'Poli Jantung & Pembuluh Darah',
    dpjp: 'U002',
    status: 'Selesai',
    sepNo: '0010R0010826V000007',
    room: null
  }
];

export const INITIAL_GENERAL_CONSENTS: GeneralConsent[] = [
  { id: 'GC001', regId: 'REG001', date: '2026-08-28', patientSign: 'Tn. Ahmad Fauzi', witnessSign: 'Rina Wulandari', status: 'Signed' },
  { id: 'GC002', regId: 'REG002', date: '2026-08-29', patientSign: 'Ny. Siti Rahma', witnessSign: 'Rina Wulandari', status: 'Signed' },
  { id: 'GC003', regId: 'REG003', date: '2026-08-30', patientSign: 'Tn. Budi Santoso', witnessSign: 'Rina Wulandari', status: 'Signed' }
];

export const INITIAL_MEDICAL_RECORDS: MedicalRecord[] = [
  {
    id: 'MR001',
    regId: 'REG001',
    noRM: '000001',
    anamnesis: 'Pasien datang dengan keluhan pusing berputar, tengkuk terasa berat sejak 2 hari yang lalu. Mual (+), muntah (-). Riwayat tekanan darah tinggi tidak terkontrol.',
    physicalExam: 'Keadaan Umum: Sedang, Kesadaran: Compos Mentis. TD: 160/100 mmHg, Nadi: 88 x/menit, RR: 20 x/menit, Suhu: 36.8 C, SpO2: 98%. Cor/Pulmo dalam batas normal.',
    diagnosis: 'I10 - Hipertensi Esensial (Primer)',
    diagnosisStatus: 'Verified',
    doctorId: 'U002',
    date: '2026-08-28'
  },
  {
    id: 'MR002',
    regId: 'REG002',
    noRM: '000002',
    anamnesis: 'Nyeri dada kiri menjalar ke bahu kiri sejak 3 jam SMRS. Rasa seperti tertindih beban berat, keringat dingin (+), sesak nafas (+).',
    physicalExam: 'KU: Lemah, Kesadaran: CM. TD: 140/90 mmHg, Nadi: 96 x/m, RR: 24 x/m, Suhu: 37.0 C, SpO2: 96%. EKG: ST deviasi di lead V1-V4.',
    diagnosis: 'I25.1 - Penyakit Jantung Iskemik',
    diagnosisStatus: 'Verified',
    doctorId: 'U002',
    date: '2026-08-29'
  },
  {
    id: 'MR003',
    regId: 'REG003',
    noRM: '000003',
    anamnesis: 'Kontrol rutin penyakit jantung, mengeluh cepat lelah jika beraktivitas berat.',
    physicalExam: 'TD: 130/80 mmHg, Nadi: 76 x/m, RR: 18 x/m, Suhu: 36.5 C. Murmur (-), Gallop (-).',
    diagnosis: 'I25.1 - Penyakit Jantung Iskemik',
    diagnosisStatus: 'Verified',
    doctorId: 'U002',
    date: '2026-08-30'
  },
  {
    id: 'MR006',
    regId: 'REG006',
    noRM: '000001',
    anamnesis: 'Pasien datang untuk kontrol rutin hipertensi bulanan dan keluhan tengkuk terasa kaku ringan setelah beraktivitas. Pusing (-), mual (-).',
    physicalExam: 'KU: Baik, Kesadaran: Compos Mentis. TD: 140/90 mmHg, Nadi: 80 x/menit reguler, RR: 18 x/menit, Suhu: 36.6 C, SpO2: 99%. JVP tidak meningkat, bising jantung (-).',
    diagnosis: 'I10 - Hipertensi Esensial Stage 1 & E78.5 - Dislipidemia Campuran',
    diagnosisStatus: 'Verified',
    doctorId: 'U002',
    date: '2026-09-11'
  },
  {
    id: 'MR007',
    regId: 'REG007',
    noRM: '000002',
    anamnesis: 'Kontrol rutin pasca rawat inap jantung 2 minggu lalu. Nyeri dada terkontrol, sesak saat istirahat (-), aktivitas ringan mandiri baik.',
    physicalExam: 'KU: Sedang, Kesadaran: Compos Mentis. TD: 125/80 mmHg, Nadi: 76 x/menit, RR: 18 x/menit, Suhu: 36.5 C, SpO2: 99%. S1-S2 murni, murmur (-).',
    diagnosis: 'I25.1 - Penyakit Jantung Iskemik Kronik (CAD Post NSTEMI) & I10 - Hipertensi Terkontrol',
    diagnosisStatus: 'Verified',
    doctorId: 'U002',
    date: '2026-09-11'
  }
];

export const INITIAL_CPPT: CPPT[] = [
  {
    id: 'CPPT001',
    mrId: 'MR001',
    regId: 'REG001',
    date: '2026-08-28',
    time: '10:30',
    subjective: 'Pasien masih merasa pusing berkurang setelah istirahat.',
    objective: 'TD: 145/90 mmHg, N: 82x/m, RR: 18x/m, S: 36.6 C.',
    assessment: 'Hipertensi stage 2 terkontrol sebagian.',
    plan: 'Amlodipine 10mg 1x1 tab PO malam. Observasi tanda vital tiap 4 jam. Edukasi diet rendah garam.',
    doctorId: 'U002',
    nurseId: 'U003',
    profession: 'Dokter Spesialis Penyakit Dalam',
    staffName: 'dr. Sari Dewi, Sp.PD',
    unit: 'IGD',
    verified: true,
    vitalSigns: { systolic: '145', diastolic: '90', heartRate: '82', respRate: '18', temp: '36.6', spo2: '98' }
  },
  {
    id: 'CPPT002',
    mrId: 'MR002',
    regId: 'REG002',
    date: '2026-08-29',
    time: '14:00',
    subjective: 'Nyeri dada berkurang dengan pemberian ISDN sublingual.',
    objective: 'TD: 130/85 mmHg, N: 84x/m, SpO2: 98% on nasal kanul 3 lpm.',
    assessment: 'NSTEMI Teratasi, CAD 2VD.',
    plan: 'Lanjut Clopidogrel 75mg 1x1, Atorvastatin 20mg 1x1, Rawat VVIP.',
    doctorId: 'U002',
    nurseId: 'U003',
    profession: 'Dokter Spesialis Kardiologi',
    staffName: 'dr. Sari Dewi, Sp.PD',
    unit: 'Rawat Inap',
    verified: true,
    vitalSigns: { systolic: '130', diastolic: '85', heartRate: '84', respRate: '20', temp: '36.7', spo2: '98' }
  },
  {
    id: 'CPPT006',
    mrId: 'MR006',
    regId: 'REG006',
    date: '2026-09-11',
    time: '09:45',
    subjective: 'Pasien datang untuk kontrol rutin tensi bulanan. Mengeluh tengkuk agak tegang terutama sore hari, riwayat minum obat rutin Amlodipine.',
    objective: 'KU: Baik, Kesadaran: CM. TD: 140/90 mmHg, HR: 80x/m reguler, RR: 18x/m, Suhu: 36.6 C, SpO2: 99%. Suara nafas vesikuler, edema tungkai (-).',
    assessment: 'Hipertensi Esensial Stage 1 Terkontrol Sebagian & Dislipidemia Campuran.',
    plan: '1. Amlodipine 10mg 1x1 tab PO malam. 2. Atorvastatin 20mg 1x1 tab PO malam. 3. Tindakan: Rekam Elektrokardiogram (EKG 12-Lead) & Cek Profil Lipid Darah Lengkap. 4. Edukasi pola diet rendah garam & olahraga aerobik teratur.',
    doctorId: 'U002',
    nurseId: 'U003',
    profession: 'Dokter Spesialis Penyakit Dalam',
    staffName: 'dr. Sari Dewi, Sp.PD',
    unit: 'Poli Penyakit Dalam',
    verified: true,
    vitalSigns: { systolic: '140', diastolic: '90', heartRate: '80', respRate: '18', temp: '36.6', spo2: '99' }
  },
  {
    id: 'CPPT007',
    mrId: 'MR007',
    regId: 'REG007',
    date: '2026-09-11',
    time: '10:15',
    subjective: 'Pasien kontrol berkala pasca perawatan NSTEMI. Nyeri dada (-) saat istirahat, keluhan sesak nafas berkurang signifikan.',
    objective: 'KU: Sedang, CM. TD: 125/80 mmHg, HR: 76x/m kuat angkat, RR: 18x/m, Suhu: 36.5 C, SpO2: 99%. Jantung S1-S2 normal, murmur (-), gallop (-).',
    assessment: 'Penyakit Jantung Iskemik Kronik (CAD Post NSTEMI Stabil) & Hipertensi Terkontrol.',
    plan: '1. Clopidogrel 75mg 1x1 tab PO. 2. Bisoprolol 2.5mg 1x1 tab PO pagi. 3. Tindakan Medis: Pemeriksaan Echocardiography berkala & Rekam EKG Evaluasi. 4. Kontrol ulang 1 bulan.',
    doctorId: 'U002',
    nurseId: 'U003',
    profession: 'Dokter Spesialis Kardiologi',
    staffName: 'dr. Sari Dewi, Sp.PD',
    unit: 'Poli Jantung & Pembuluh Darah',
    verified: true,
    vitalSigns: { systolic: '125', diastolic: '80', heartRate: '76', respRate: '18', temp: '36.5', spo2: '99' }
  }
];

export const INITIAL_INFORMED_CONSENTS: InformedConsent[] = [
  {
    id: 'IC001',
    cpptId: 'CPPT002',
    action: 'Pemberian Terapi Trombolitik & Tindakan Kateterisasi Jantung',
    risk: 'Risiko perdarahan, reaksi alergi kontras, aritmia transien.',
    complication: 'Hematoma pada area tusukan arteri femoralis.',
    doctorId: 'U002',
    date: '2026-08-29',
    status: 'Approved'
  }
];

export const INITIAL_CODING: Coding[] = [
  {
    id: 'COD001',
    mrId: 'MR001',
    regId: 'REG001',
    icd10: ['I10', 'E78.5'],
    icd10Desc: ['Hipertensi Esensial (Primer)', 'Hiperlipidemia, Tidak Ditetapkan'],
    icd9cm: ['89.13', '99.21'],
    icd9cmDesc: ['Elektrokardiogram (EKG)', 'Injeksi Intramuskular'],
    coderId: 'U006',
    date: '2026-08-28',
    status: 'Locked',
    note: 'Koding terverifikasi sesuai resume klinis DPJP.'
  },
  {
    id: 'COD002',
    mrId: 'MR002',
    regId: 'REG002',
    icd10: ['I25.1', 'I10'],
    icd10Desc: ['Penyakit Jantung Iskemik', 'Hipertensi Esensial (Primer)'],
    icd9cm: ['88.56', '89.13'],
    icd9cmDesc: ['Arteriografi Koroner', 'Elektrokardiogram (EKG)'],
    coderId: 'U006',
    date: '2026-08-29',
    status: 'Locked',
    note: 'Koding terkunci untuk proses klaim BPJS.'
  }
];

export const INITIAL_CLAIMS: Claim[] = [
  {
    id: 'CLM001',
    regId: 'REG001',
    codingId: 'COD001',
    sepNo: '0010R0010826V000001',
    groupCode: 'I-4-10-I',
    description: 'HIPERTENSI DENGAN KOMPLIKASI RINGAN',
    tariff: 3450000,
    status: 'Submitted',
    dateSubmitted: '2026-08-28 15:00'
  },
  {
    id: 'CLM002',
    regId: 'REG002',
    codingId: 'COD002',
    sepNo: '0010R0010826V000002',
    groupCode: 'I-1-04-I',
    description: 'PENYAKIT JANTUNG ISKEMIK BERAT',
    tariff: 14850000,
    status: 'Submitted',
    dateSubmitted: '2026-08-29 16:30'
  }
];

export const INITIAL_BILLING: Billing[] = [
  {
    id: 'BIL001',
    regId: 'REG001',
    services: [
      { name: 'Konsultasi Dokter Spesialis IGD', qty: 1, price: 150000 },
      { name: 'Pemeriksaan EKG 12 Lead', qty: 1, price: 120000 },
      { name: 'Obat & Farmasi', qty: 1, price: 180000 }
    ],
    total: 450000,
    paid: 450000,
    status: 'Paid'
  }
];

export const INITIAL_PHARMACY: PharmacyRecord[] = [
  { id: 'PH001', regId: 'REG001', items: [{ drug: 'Amlodipin 5mg', qty: 30, dose: '1x1', status: 'Dispensed' }, { drug: 'Captopril 12.5mg', qty: 60, dose: '2x1', status: 'Dispensed' }], pharmacist: 'U011', date: '2026-03-10', status: 'Completed' },
  { id: 'PH002', regId: 'REG002', items: [{ drug: 'NTG Sublingual 0.5mg', qty: 10, dose: 'PRN', status: 'Dispensed' }, { drug: 'Clopidogrel 75mg', qty: 30, dose: '1x1', status: 'Dispensed' }], pharmacist: 'U011', date: '2026-03-10', status: 'Completed' },
];

export const INITIAL_LAB: LabRecord[] = [
  { id: 'LAB001', regId: 'REG001', tests: [{ name: 'Darah Lengkap', loinc: '57021-8', result: 'Hb 13.2, Leu 7800, Trom 250000', status: 'Final' }, { name: 'Gula Darah Sewaktu', loinc: '2345-7', result: '142 mg/dL', status: 'Final' }], techId: 'U009', date: '2026-03-10', status: 'Completed' },
  { id: 'LAB002', regId: 'REG002', tests: [{ name: 'Troponin T', loinc: '43251-5', result: '0.85 ng/mL (high)', status: 'Final' }, { name: 'CK-MB', loinc: '3254-7', result: '45 U/L (elevated)', status: 'Final' }, { name: 'Lipid Profile', loinc: '57698-3', result: 'Total Chol 265, LDL 168, HDL 38, TG 180', status: 'Final' }], techId: 'U009', date: '2026-03-10', status: 'Completed' },
];

export const INITIAL_RADIOLOGY: RadiologyRecord[] = [
  { id: 'RAD001', regId: 'REG002', exam: 'EKG 12 Lead', loinc: '34534-8', result: 'ST depression V3-V5, inverted T wave lead I, aVL. Impression: Ischemia anterolateral.', radiologist: 'U012', date: '2026-03-10', status: 'Completed' },
  { id: 'RAD002', regId: 'REG004', exam: 'X-Ray Dada PA', loinc: '24627-2', result: 'Cardiomegaly. increased bronchovascular marking bilateral. No infiltrate. Impression: Cardiomegaly dengan kemungkinan CHF.', radiologist: 'U012', date: '2026-03-11', status: 'Completed' },
];

export const INITIAL_ICD10: ICD10[] = [
  { code: 'I10', desc: 'Hipertensi Esensial (Primer)' },
  { code: 'I25.1', desc: 'Penyakit Jantung Iskemik' },
  { code: 'E11.9', desc: 'Diabetes Mellitus Tipe 2 Tanpa Komplikasi' },
  { code: 'J18.9', desc: 'Pneumonia, Spesifikasi Tidak Disebutkan' },
  { code: 'K29.7', desc: 'Gastritis, Tidak Ditetapkan' },
  { code: 'N18.5', desc: 'Penyakit Ginjal Kronik Tahap 5' },
  { code: 'G43.9', desc: 'Migrain, Tidak Ditetapkan' },
  { code: 'M54.5', desc: 'Nyeri Punggung Bawah' },
  { code: 'K35.8', desc: 'Apendisitis Akut, Lainnya' },
  { code: 'S72.0', desc: 'Fraktur Leher Femur' },
  { code: 'J06.9', desc: 'Infeksi Saluran Pernapasan Atas, Lokasi Tidak Ditetapkan' },
  { code: 'E78.5', desc: 'Hiperlipidemia, Tidak Ditetapkan' },
  { code: 'I50.9', desc: 'Gagal Jantung, Tidak Ditetapkan' },
  { code: 'N39.0', desc: 'Infeksi Saluran Kemih, Lokasi Tidak Ditetapkan' },
  { code: 'B82.9', desc: 'Helminthiasis Usus, Tidak Ditetapkan' },
];

export const INITIAL_ICD9CM: ICD9CM[] = [
  { code: '88.56', desc: 'Arteriografi Koroner' },
  { code: '36.06', desc: 'Insertion Stent Koroner' },
  { code: '45.13', desc: 'Endoskopi Saluran Cerna Atas' },
  { code: '81.51', desc: 'Artroplasti Total Lutut' },
  { code: '47.0', desc: 'Apendiktomi' },
  { code: '86.22', desc: 'Eksisi Tumor Kulit Berbahaya' },
  { code: '93.83', desc: 'Fisioterapi' },
  { code: '89.13', desc: 'Elektrokardiogram (EKG)' },
  { code: '87.41', desc: 'X-Ray Dada' },
  { code: '88.79', desc: 'USG Abdomen' },
  { code: '38.93', desc: 'Pemasangan Kateter Intravena' },
  { code: '99.21', desc: 'Injeksi Intramuskular' },
  { code: '96.07', desc: 'Intubasi Endotrakeal' },
  { code: '99.60', desc: 'Resusitasi Kardiopulmoner' },
  { code: '54.11', desc: 'Laparotomi Eksplorasi' },
];

export const INITIAL_BEDS: Bed[] = [
  // Bangsal Mawar (Penyakit Dalam)
  { id: 'MWR-101-A', room: 'Bangsal Mawar - Penyakit Dalam', floor: '2', class: 'Kelas 1', status: 'Occupied', patientId: '000001', roomName: 'Kamar 101', bedNumber: 'Bed A', occupiedSince: '2026-09-20' },
  { id: 'MWR-101-B', room: 'Bangsal Mawar - Penyakit Dalam', floor: '2', class: 'Kelas 1', status: 'Available', patientId: null, roomName: 'Kamar 101', bedNumber: 'Bed B' },
  { id: 'MWR-102-A', room: 'Bangsal Mawar - Penyakit Dalam', floor: '2', class: 'Kelas 1', status: 'Available', patientId: null, roomName: 'Kamar 102', bedNumber: 'Bed A' },
  { id: 'MWR-102-B', room: 'Bangsal Mawar - Penyakit Dalam', floor: '2', class: 'Kelas 1', status: 'Maintenance', patientId: null, roomName: 'Kamar 102', bedNumber: 'Bed B', maintenanceReason: 'Sterilisasi kamar & pembersihan menyeluruh pasca discharge' },
  { id: 'MWR-201-A', room: 'Bangsal Mawar - Penyakit Dalam', floor: '2', class: 'Kelas 2', status: 'Occupied', patientId: '000002', roomName: 'Kamar 201', bedNumber: 'Bed A', occupiedSince: '2026-09-21' },
  { id: 'MWR-201-B', room: 'Bangsal Mawar - Penyakit Dalam', floor: '2', class: 'Kelas 2', status: 'Available', patientId: null, roomName: 'Kamar 201', bedNumber: 'Bed B' },
  { id: 'MWR-202-A', room: 'Bangsal Mawar - Penyakit Dalam', floor: '2', class: 'Kelas 2', status: 'Available', patientId: null, roomName: 'Kamar 202', bedNumber: 'Bed A' },
  { id: 'MWR-202-B', room: 'Bangsal Mawar - Penyakit Dalam', floor: '2', class: 'Kelas 2', status: 'Available', patientId: null, roomName: 'Kamar 202', bedNumber: 'Bed B' },

  // Bangsal Melati (Bedah Umum)
  { id: 'MLT-201-A', room: 'Bangsal Melati - Bedah Umum', floor: '3', class: 'Kelas 2', status: 'Occupied', patientId: '000003', roomName: 'Kamar 201', bedNumber: 'Bed A', occupiedSince: '2026-09-22' },
  { id: 'MLT-201-B', room: 'Bangsal Melati - Bedah Umum', floor: '3', class: 'Kelas 2', status: 'Available', patientId: null, roomName: 'Kamar 201', bedNumber: 'Bed B' },
  { id: 'MLT-301-A', room: 'Bangsal Melati - Bedah Umum', floor: '3', class: 'Kelas 3', status: 'Available', patientId: null, roomName: 'Kamar 301', bedNumber: 'Bed A' },
  { id: 'MLT-301-B', room: 'Bangsal Melati - Bedah Umum', floor: '3', class: 'Kelas 3', status: 'Available', patientId: null, roomName: 'Kamar 301', bedNumber: 'Bed B' },
  { id: 'MLT-301-C', room: 'Bangsal Melati - Bedah Umum', floor: '3', class: 'Kelas 3', status: 'Maintenance', patientId: null, roomName: 'Kamar 301', bedNumber: 'Bed C', maintenanceReason: 'Perbaikan panel oksigen sentral & tuas hidrolik tempat tidur' },

  // Bangsal Anggrek (Kebidanan & Obgyn)
  { id: 'AGR-101-A', room: 'Bangsal Anggrek - Kebidanan & Kandungan', floor: '2', class: 'Kelas 1', status: 'Occupied', patientId: '000004', roomName: 'Kamar 101', bedNumber: 'Bed A', occupiedSince: '2026-09-22' },
  { id: 'AGR-101-B', room: 'Bangsal Anggrek - Kebidanan & Kandungan', floor: '2', class: 'Kelas 1', status: 'Available', patientId: null, roomName: 'Kamar 101', bedNumber: 'Bed B' },
  { id: 'AGR-201-A', room: 'Bangsal Anggrek - Kebidanan & Kandungan', floor: '2', class: 'Kelas 2', status: 'Available', patientId: null, roomName: 'Kamar 201', bedNumber: 'Bed A' },

  // Bangsal Dahlia (Anak)
  { id: 'DHL-201-A', room: 'Bangsal Dahlia - Anak (Pediatrik)', floor: '3', class: 'Kelas 2', status: 'Occupied', patientId: '000005', roomName: 'Kamar 201', bedNumber: 'Bed A', occupiedSince: '2026-09-23' },
  { id: 'DHL-201-B', room: 'Bangsal Dahlia - Anak (Pediatrik)', floor: '3', class: 'Kelas 2', status: 'Available', patientId: null, roomName: 'Kamar 201', bedNumber: 'Bed B' },

  // Bangsal Cempaka (Saraf & Jantung)
  { id: 'CMP-101-A', room: 'Bangsal Cempaka - Saraf & Jantung', floor: '4', class: 'Kelas 1', status: 'Available', patientId: null, roomName: 'Kamar 101', bedNumber: 'Bed A' },
  { id: 'CMP-201-A', room: 'Bangsal Cempaka - Saraf & Jantung', floor: '4', class: 'Kelas 2', status: 'Maintenance', patientId: null, roomName: 'Kamar 201', bedNumber: 'Bed A', maintenanceReason: 'Dalam proses sterilisasi UV ruangan' },

  // VIP & VVIP
  { id: 'VIP-EDL-01', room: 'Ruang VIP Edelweiss', floor: '5', class: 'VIP', status: 'Occupied', patientId: '000006', roomName: 'Kamar VIP 501', bedNumber: 'Bed Tunggal', occupiedSince: '2026-09-21' },
  { id: 'VIP-EDL-02', room: 'Ruang VIP Edelweiss', floor: '5', class: 'VIP', status: 'Available', patientId: null, roomName: 'Kamar VIP 502', bedNumber: 'Bed Tunggal' },
  { id: 'VVIP-WJK-01', room: 'Ruang VVIP Wijayakusuma', floor: '5', class: 'VVIP', status: 'Available', patientId: null, roomName: 'Suite VVIP 508', bedNumber: 'Bed Elektrik' },

  // ICU & Isolasi
  { id: 'ICU-01', room: 'Ruang Perawatan Intensif (ICU)', floor: '2', class: 'ICU', status: 'Available', patientId: null, roomName: 'ICU Unit', bedNumber: 'Bed 01' },
  { id: 'ICU-02', room: 'Ruang Perawatan Intensif (ICU)', floor: '2', class: 'ICU', status: 'Available', patientId: null, roomName: 'ICU Unit', bedNumber: 'Bed 02' },
  { id: 'ISO-01', room: 'Ruang Isolasi Tekanan Negatif', floor: '2', class: 'Kelas 1', status: 'Available', patientId: null, roomName: 'Isolasi 01', bedNumber: 'Bed Isolasi' },
];

export const INITIAL_PRAKTIKUM: PraktikumModule[] = [
  { id: 'PRK001', title: 'Pendaftaran Pasien & General Consent', desc: 'Mempelajari alur pendaftaran pasien baru dan pembuatan General Consent sesuai standar rumah sakit.', modul: 'Pendaftaran', status: 'Active' },
  { id: 'PRK002', title: 'Pengelolaan Rekam Medis Elektronik', desc: 'Praktik pengisian anamnesis, pemeriksaan fisik, dan penulisan diagnosis menggunakan ICD-10.', modul: 'Rekam Medis', status: 'Active' },
  { id: 'PRK003', title: 'Pencatatan CPPT (SOAP)', desc: 'Latihan menulis catatan progress pasien dengan format Subjective, Objective, Assessment, Plan.', modul: 'CPPT', status: 'Active' },
  { id: 'PRK004', title: 'Coding ICD-10 dan ICD-9-CM', desc: 'Praktik koding diagnosis dan tindakan medis sesuai standar WHO dan kemkes RI.', modul: 'Coding', status: 'Active' },
  { id: 'PRK005', title: 'Klaim BPJS & Grouping INA-CBG\'s', desc: 'Simulasi proses klaim BPJS melalui alur coding, locking, grouping, dan submission.', modul: 'Klaim', status: 'Active' },
  { id: 'PRK006', title: 'Audit Trail & Keamanan Informasi', desc: 'Mempelajari pentingnya audit trail dalam menjaga integritas dan akuntabilitas data medis.', modul: 'Audit', status: 'Active' },
];

export const INITIAL_AUDIT_TRAIL: AuditEntry[] = [
  {
    id: 'AT001',
    timestamp: new Date().toISOString(),
    userId: 'U001',
    userName: 'Super Administrator',
    action: 'LOGIN',
    entity: 'User',
    entityId: 'U001',
    field_name: 'status',
    old_value: 'offline',
    new_value: 'online',
    ip: '192.168.1.10',
    device: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0',
    module: 'dashboard'
  }
];
