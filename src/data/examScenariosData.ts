import { ExamScenario } from '../types';

export const INITIAL_EXAM_SCENARIOS: ExamScenario[] = [
  {
    id: 'SCEN-RMIK-001',
    title: 'Ujian Praktik Kodifikasi Klinis: Hipertensi Urgensi & Dislipidemia (IGD & Rawat Jalan)',
    category: 'RMIK',
    description: 'Skenario kasus pasien datang ke IGD dengan krisis hipertensi derajat III disertai dislipidemia campuran, pemeriksaan EKG 12 lead, dan pemasangan jalur intravena infus.',
    durationMinutes: 45,
    status: 'Aktif',
    pdfFileName: 'SKENARIO_RMIK_001_HIPERTENSI_URGENSI.pdf',
    pdfContentText: `RUMAH SAKIT UNIVERSITAS ESA UNGGUL
Jl. Arjuna Utara No.9, Kebon Jeruk, Jakarta Barat 11510
Telp: (021) 567-4223 | Akreditasi KARS Paripurna
================================================================================
LEMBAR REKAM MEDIS & CATATAN PERKEMBANGAN PASIEN TERINTEGRASI (CPPT)
SKENARIO UJIAN PRAKTIK SIMULASI KODIFIKASI (ICD-10 & ICD-9-CM)
================================================================================

I. IDENTITAS PASIEN
--------------------------------------------------------------------------------
Nama Pasien           : Tn. Anwar Baskoro
Nomor Rekam Medis (RM): 000001
Nomor Registrasi (Reg): REG-SIM-001
Tanggal Lahir / Umur  : 1985-03-29 (39 Tahun)
Jenis Kelamin         : Laki-laki (L)
Nomor Induk Kependudukan (NIK): 3174012903850001
Alamat                : Jl. Kemanggisan Utama No. 42, Palmerah, Jakarta Barat
Penjamin Biaya        : BPJS Kesehatan (No: 0001827364512)
Unit Pelayanan        : Instalasi Gawat Darurat (IGD) & Poli Penyakit Dalam
Dokter DPJP           : dr. Sari Dewi, Sp.PD
Tanggal Pelayanan     : 2026-09-12 08:30 WIB

II. CATATAN MEDIS (SOAP)
--------------------------------------------------------------------------------
[S] SUBJEKTIF (ANAMNESIS):
Pasien datang ke IGD diantar keluarga dengan keluhan nyeri kepala hebat berdenyut pada tengkuk belakang sejak 2 hari terakhir, semakin memberat pagi ini. Pasien juga mengeluhkan pandangan terkadang berkunang-kunang, leher kaku, dan rasa mual tanpa muntah. Riwayat hipertensi diketahui sejak 3 tahun lalu namun tidak teratur minum obat karena merasa sudah sehat. Riwayat konsumsi makanan tinggi kolesterol/santan sering. Riwayat alergi: Tidak ada alergi obat/makanan.

[O] OBJEKTIF (PEMERIKSAAN FISIK & TANDA VITAL):
Keadaan Umum : Tampak sakit sedang, compos mentis (GCS E4M6V5)
Tanda Vital  :
- Tekanan Darah (TD) : 195/110 mmHg (Krisis Hipertensi / Urgensi)
- Frekuensi Nadi (HR) : 96 x/menit, regular, isi cukup
- Frekuensi Napas (RR): 22 x/menit
- Suhu Tubuh         : 36.8 °C
- SpO2               : 98% room air
Pemeriksaan Fisik:
- Kepala / Leher : Konjungtiva anemis (-), sklera ikterik (-), kaku kuduk (-), JVP normal
- Toraks : Jantung: S1-S2 murni reguler, murmur (-), gallop (-). Paru: Vesikuler +/+, ronkhi -/-, wheezing -/-
- Abdomen: Supel, bising usus normal, nyeri tekan epigastrium (-), hepar/lien tidak teraba
- Ekstremitas : Akral hangat, CRT < 2 detik, edema pretibial bilateral (-)

HASIL PEMERIKSAAN PENUNJANG:
1. Elektrokardiogram (EKG 12 Lead):
   - Sinus rhythm 96 bpm, Left Ventricular Hypertrophy (LVH) kriteria Sokolow-Lyon (+), ST depresi minimal di V5-V6.
2. Laboratorium Darah Cito:
   - Hemoglobin : 14.8 g/dL
   - Leukosit   : 7.800 /uL
   - Trombosit  : 265.000 /uL
   - Gula Darah Sewaktu : 118 mg/dL
   - Kolesterol Total   : 268 mg/dL (Meningkat)
   - Trigliserida       : 215 mg/dL (Meningkat)
   - LDL Kolesterol     : 172 mg/dL (Meningkat)
   - Ureum / Kreatinin  : 28 mg/dL / 0.9 mg/dL

[A] ASESMEN (DIAGNOSIS KERJA DPJP):
1. Diagnosis Primer : Hipertensi Esensial Primer (Krisis Hipertensi - Urgensi)
2. Diagnosis Sekunder: Dislipidemia Campuran (Hiperkolesterolemia & Hipertrigliseridemia)
3. Gejala Penyerta   : Cephalea / Nyeri Kepala Tengkuk

[P] PLAN (RENCANA PENATALAKSANAAN & TINDAKAN):
1. Medikamentosa Cito:
   - Injeksi Furosemid 20 mg IV bolus lambat (di IGD)
   - Kaptopril 25 mg sublingual diulang bila perlu
   - Amlodipin 10 mg 1x1 tab PO malam
   - Atorvastatin 20 mg 1x1 tab PO malam
2. Tindakan Medis di IGD:
   - Pemasangan Kateter Intravena (Infus NaCl 0.9% 500 ml / 12 jam)
   - Perekaman Elektrokardiogram (EKG 12 Lead)
   - Injeksi obat intravena/intramuskular
3. Edukasi & Rencana:
   - Bed rest posisi semi fowler, observasi tekanan darah tiap 30 menit
   - Diet rendah garam dan rendah lemak, rujuk konseling gizi`,
    extractedPatient: {
      name: 'Tn. Anwar Baskoro',
      noRM: '000001',
      nik: '3174012903850001',
      birthDate: '1985-03-29',
      gender: 'L',
      age: 39,
      address: 'Jl. Kemanggisan Utama No. 42, Palmerah, Jakarta Barat',
      insurance: 'BPJS Kesehatan'
    },
    extractedEncounter: {
      regId: 'REG-SIM-001',
      poli: 'Instalasi Gawat Darurat (IGD)',
      dpjpName: 'dr. Sari Dewi, Sp.PD',
      date: '2026-09-12',
      subjective: 'Nyeri kepala hebat berdenyut pada tengkuk belakang sejak 2 hari terakhir, pandangan berkunang-kunang, leher kaku, mual. Riwayat hipertensi 3 tahun tidak patuh obat.',
      objective: 'Tampak sakit sedang, compos mentis. TD 195/110 mmHg, HR 96 x/m, RR 22 x/m, Suhu 36.8 C, SpO2 98%. EKG LVH (+), Kolesterol Total 268 mg/dL, Trigliserida 215 mg/dL, LDL 172 mg/dL.',
      vitalSigns: {
        td: '195/110',
        nadi: '96',
        suhu: '36.8',
        rr: '22',
        spo2: '98'
      },
      assessment: 'Hipertensi Esensial Primer (Krisis Hipertensi - Urgensi) dengan Dislipidemia Campuran dan Cephalea.',
      plan: 'Inj Furosemid 20mg IV, Kaptopril 25mg SL, Amlodipin 10mg, Atorvastatin 20mg. Perekaman EKG 12 Lead, Pemasangan IV Line NaCl 0.9%, Observasi TTV per 30 menit.',
      penunjang: {
        lab: 'Kolesterol Total 268 mg/dL, Trigliserida 215 mg/dL, LDL 172 mg/dL, GDS 118 mg/dL',
        radiologi: 'EKG 12 lead: LVH Sokolow-Lyon (+), ST depresi minimal V5-V6',
        tindakan: 'EKG (89.13), Pemasangan IV Line (38.93), Injeksi Obat IV (99.21)'
      }
    },
    answerKey: {
      icd10Primary: 'I10',
      icd10Secondary: ['E78.5', 'R51'],
      icd9Procedures: ['89.13', '38.93', '99.21'],
      diagnosaSDKI: [],
      luaranSLKI: '',
      intervensiSIKI: [],
      rubrikPenilaian: 'Diagnosis Primer harus I10 (Hipertensi Esensial). Diagnosis Sekunder mencakup E78.5 (Dislipidemia) dan R51 (Nyeri Kepala). Prosedur mencakup 89.13 (EKG), 38.93 (Infus IV Catheter), dan 99.21 (Injeksi Obat).'
    },
    createdAt: '2026-09-10T10:00:00Z',
    updatedAt: '2026-09-11T12:00:00Z',
    createdBy: 'Dr. Wati Susanti, M.Kes (Dosen RMIK)'
  },
  {
    id: 'SCEN-KEP-002',
    title: 'Ujian Praktik Asuhan Keperawatan: DHF Grade II dengan Dehidrasi & Hipertermia',
    category: 'Keperawatan',
    description: 'Skenario asuhan keperawatan pada pasien perempuan dengan Demam Berdarah Dengue hari ke-4, tanda dehidrasi, trombositopenia, hipertermia, dan nyeri ulu hati.',
    durationMinutes: 45,
    status: 'Aktif',
    pdfFileName: 'SKENARIO_KEP_002_DHF_HIPERTERMIA.pdf',
    pdfContentText: `RUMAH SAKIT UNIVERSITAS ESA UNGGUL
Jl. Arjuna Utara No.9, Kebon Jeruk, Jakarta Barat 11510
Telp: (021) 567-4223 | Akreditasi KARS Paripurna
================================================================================
LEMBAR PENGKAJIAN & ASUHAN KEPERAWATAN (SDKI - SLKI - SIKI)
SKENARIO UJIAN PRAKTIK SIMULASI ASUHAN KEPERAWATAN ELEKTRONIK
================================================================================

I. IDENTITAS PASIEN
--------------------------------------------------------------------------------
Nama Pasien           : Nn. Clarissa Maharani
Nomor Rekam Medis (RM): 000002
Nomor Registrasi (Reg): REG-SIM-002
Tanggal Lahir / Umur  : 1998-10-14 (26 Tahun)
Jenis Kelamin         : Perempuan (P)
Nomor Induk Kependudukan (NIK): 3175024410980002
Alamat                : Jl. Kemuning Indah No. 18, Kebon Jeruk, Jakarta Barat
Penjamin Biaya        : BPJS Kesehatan (No: 0002938475610)
Ruang Rawat           : Ruang Rawat Inap Melati - Bed 203
Perawat Penanggung    : Ns. Budi Hartono, S.Kep
Tanggal Pengkajian    : 2026-09-12 09:00 WIB

II. PENGKAJIAN KEPERAWATAN & DATA KLINIS
--------------------------------------------------------------------------------
KELUHAN UTAMA:
Demam tinggi mendadak sejak 4 hari SMRS, naik turun, disertai nyeri seluruh persendian, sakit kepala di belakang bola mata, dan nyeri ulu hati. Badan terasa sangat lemas dan tidak nafsu makan.

PEMERIKSAAN FISIK & TANDA VITAL:
- Keadaan Umum : Lemah, turgor kulit menurun, mukosa bibir kering
- Tanda Vital :
  * Suhu Tubuh         : 38.9 °C (Hipertermia)
  * Tekanan Darah (TD) : 100/70 mmHg
  * Frekuensi Nadi (HR): 104 x/menit, teraba cepat dan lemah
  * Frekuensi Napas(RR): 22 x/menit
  * SpO2               : 98%
- Manifestasi Perdarahan: Rumple Leede / Uji Tourniquet Positif (+), ptekie di volar lengan bawah. Epistaksis (-), melena (-).
- Abdomen: Nyeri tekan pada regio epigastrium skala nyeri VAS 5/10.

HASIL LABORATORIUM SERIAL:
- Trombosit  : 68.000 /uL (Trombositopenia Berat, Normal: 150.000 - 450.000)
- Hematokrit : 46% (Hemokonsentrasi Meningkat, Normal Wanita: 37-43%)
- Leukosit   : 3.200 /uL (Leukopenia)
- NS1 Ag     : Reaktif Positif (+)

MASALAH KEPERAWATAN UTAMA:
1. Kekurangan volume cairan intravascular akibat kebocoran plasma (Hipovolemia)
2. Peningkatan suhu tubuh di atas nilai normal (Hipertermia)
3. Rasa tidak nyaman / sensasi nyeri ulu hati (Nyeri Akut)`,
    extractedPatient: {
      name: 'Nn. Clarissa Maharani',
      noRM: '000002',
      nik: '3175024410980002',
      birthDate: '1998-10-14',
      gender: 'P',
      age: 26,
      address: 'Jl. Kemuning Indah No. 18, Kebon Jeruk, Jakarta Barat',
      insurance: 'BPJS Kesehatan'
    },
    extractedEncounter: {
      regId: 'REG-SIM-002',
      poli: 'Ruang Rawat Inap Melati - Bed 203',
      dpjpName: 'dr. Sari Dewi, Sp.PD',
      date: '2026-09-12',
      subjective: 'Demam mendadak tinggi 4 hari, badan lemas, mual, nyeri sendi dan nyeri ulu hati skala 5/10, nafsu makan menurun.',
      objective: 'Keadaan umum lemah, turgor kulit menurun, mukosa bibir kering. Suhu 38.9 C, TD 100/70 mmHg, Nadi 104 x/m lemah, RR 22 x/m. Uji tourniquet (+), ptekie volar lengan bawah. Trombosit 68.000 /uL, Ht 46%, Leukosit 3.200 /uL.',
      vitalSigns: {
        td: '100/70',
        nadi: '104',
        suhu: '38.9',
        rr: '22',
        spo2: '98'
      },
      assessment: 'Dengue Haemorrhagic Fever (DHF) Grade II dengan tanda kebocoran plasma dan risiko syok hipovolemik.',
      plan: 'Rehidrasi cairan kristaloid Ringer Laktat 2000 ml/24 jam, kompres hangat, monitor balance cairan tiap 4 jam, cek trombosit & hematokrit serial per 12 jam.',
      penunjang: {
        lab: 'Trombosit 68.000/uL, Hematokrit 46%, Leukosit 3.200/uL, NS1 Reaktif (+)',
        tindakan: 'Pemasangan infus RL 20 tpm, uji tourniquet, kompres hangat'
      }
    },
    answerKey: {
      icd10Primary: 'A91',
      icd10Secondary: ['R50.9', 'R10.1'],
      icd9Procedures: ['38.93', '99.21'],
      diagnosaSDKI: [
        'D.0023: Hipovolemia',
        'D.0130: Hipertermia',
        'D.0077: Nyeri Akut'
      ],
      luaranSLKI: 'L.03028: Status Cairan Membaik & L.14134: Termoregulasi Membaik',
      intervensiSIKI: [
        'I.03119: Manajemen Hipovolemia',
        'I.15506: Manajemen Hipertermia',
        'I.02084: Pemantauan Tanda Vital'
      ],
      rubrikPenilaian: 'Mahasiswa wajib mengangkat diagnosa utama D.0023 (Hipovolemia) karena kebocoran plasma dan trombositopenia, disusul D.0130 (Hipertermia). Intervensi prioritas adalah Manajemen Hipovolemia (I.03119) dan Manajemen Hipertermia (I.15506).'
    },
    createdAt: '2026-09-09T08:00:00Z',
    updatedAt: '2026-09-11T14:00:00Z',
    createdBy: 'Dr. Wati Susanti, M.Kes (Dosen RMIK)'
  },
  {
    id: 'SCEN-RMIK-003',
    title: 'Ujian Praktik Kodifikasi Kasus Bedah: Apendisitis Akut dengan Tindakan Apendiktomi',
    category: 'RMIK',
    description: 'Skenario kodifikasi rekam medis bedah: Pasien laki-laki 23 tahun dengan keluhan nyeri perut kanan bawah akut, leukositosis, pemeriksaan USG abdomen, dan operasi apendiktomi cito.',
    durationMinutes: 45,
    status: 'Aktif',
    pdfFileName: 'SKENARIO_RMIK_003_APENDISITIS_BEDAH.pdf',
    pdfContentText: `RUMAH SAKIT UNIVERSITAS ESA UNGGUL
Jl. Arjuna Utara No.9, Kebon Jeruk, Jakarta Barat 11510
Telp: (021) 567-4223 | Akreditasi KARS Paripurna
================================================================================
LAPORAN OPERASI & RESUME MEDIS RAWAT INAP BEDAH
SKENARIO UJIAN PRAKTIK KODIFIKASI RME (ICD-10 & ICD-9-CM)
================================================================================

I. IDENTITAS PASIEN
--------------------------------------------------------------------------------
Nama Pasien           : Sdr. Farhan Ramadhan
Nomor Rekam Medis (RM): 000003
Nomor Registrasi (Reg): REG-SIM-003
Tanggal Lahir / Umur  : 2001-08-15 (23 Tahun)
Jenis Kelamin         : Laki-laki (L)
Nomor Induk Kependudukan (NIK): 3276011508010003
Alamat                : Jl. Pesanggrahan Indah Blok B-4, Jakarta Barat
Penjamin Biaya        : Umum / Mandiri
Ruang Rawat           : Ruang Rawat Bedah Cendana - Bed 302
Dokter Bedah DPJP     : dr. Hendra Bedah, Sp.B
Tanggal Tindakan      : 2026-09-12 11:30 WIB

II. RINGKASAN KLINIS & CATATAN OPERASI
--------------------------------------------------------------------------------
ANAMNESIS & KELUHAN:
Pasien datang rujukan puskesmas dengan nyeri perut kanan bawah hebat mendadak sejak 18 jam SMRS, awalnya nyeri dirasakan di sekitar pusar kemudian berpindah dan menetap di perut kanan bawah. Disertai mual, muntah 3 kali, dan demam sumeng-sumeng.

PEMERIKSAAN FISIK:
- Keadaan Umum: Sakit sedang, posisi membungkuk menahan sakit
- Tanda Vital : TD 120/80 mmHg, Nadi 92 x/m, Suhu 38.1 °C, RR 20 x/m
- Abdomen     : Nyeri tekan dan nyeri lepas titik McBurney (+), Rovsing sign (+), Psoas sign (+), defans muskular lokal (+) di kuadran kanan bawah.

HASIL PEMERIKSAAN PENUNJANG:
1. Laboratorium Cito : Leukosit 17.200 /uL (Leukositosis Berat), Hb 14.2 g/dL, Trombosit 310.000 /uL
2. USG Abdomen Cito  : Tampak gambaran target sign / tubular non-compressible blind-ended loop diameter > 6 mm di fossa iliaka kanan, kesan Apendisitis Akut Supuratif.

TINDAKAN OPERASI (ICD-9-CM):
- Dilakukan operasi: Apendiktomi Terbuka (Open Appendectomy) dengan insisi Gridiron / McBurney.
- Temuan Operasi : Apendiks tampak hiperemis, edema tegang berdiameter 1.2 cm, eksudat seropurulen minimal, tidak tampak perforasi bebas. Basis apendiks diligasi ganda dan diamputasi.

DIAGNOSIS PASCA OPERASI:
- Diagnosis Utama   : Apendisitis Akut Supuratif (Acute appendicitis without perforation)
- Diagnosis Sekunder: Nyeri Perut Akut Lokalisata (Abdominal pain, lower right quadrant)`,
    extractedPatient: {
      name: 'Sdr. Farhan Ramadhan',
      noRM: '000003',
      nik: '3276011508010003',
      birthDate: '2001-08-15',
      gender: 'L',
      age: 23,
      address: 'Jl. Pesanggrahan Indah Blok B-4, Jakarta Barat',
      insurance: 'Umum / Mandiri'
    },
    extractedEncounter: {
      regId: 'REG-SIM-003',
      poli: 'Kamar Operasi (OK) & Rawat Bedah Cendana',
      dpjpName: 'dr. Hendra Bedah, Sp.B',
      date: '2026-09-12',
      subjective: 'Nyeri perut kanan bawah mendadak 18 jam SMRS, mual, muntah 3x, demam sumeng. Nyeri berpindah dari periumbilikal ke fosa iliaka kanan.',
      objective: 'Nyeri tekan & lepas McBurney (+), Rovsing (+), Psoas (+). Leukosit 17.200 /uL. USG Abdomen: Tubular structure diameter >6mm non-compressible (Apendisitis Akut).',
      vitalSigns: {
        td: '120/80',
        nadi: '92',
        suhu: '38.1',
        rr: '20',
        spo2: '99'
      },
      assessment: 'Apendisitis Akut Supuratif tanpa Perforasi Umum (Acute Appendicitis).',
      plan: 'Apendiktomi Terbuka Cito (Open Appendectomy), Infus RL, Cefoperazone 1g IV pre-op, Analgesik Ketorolac IV.',
      penunjang: {
        lab: 'Leukosit 17.200/uL, Hb 14.2 g/dL',
        radiologi: 'USG Abdomen: Apendisitis Akut Supuratif (88.79)',
        tindakan: 'Apendiktomi (47.0), Pemasangan IV Line (38.93), USG Abdomen (88.79)'
      }
    },
    answerKey: {
      icd10Primary: 'K35.8',
      icd10Secondary: ['R10.3', 'R50.9'],
      icd9Procedures: ['47.0', '88.79', '38.93'],
      diagnosaSDKI: [],
      luaranSLKI: '',
      intervensiSIKI: [],
      rubrikPenilaian: 'Diagnosis Primer ICD-10 harus K35.8 (Acute appendicitis, other and unspecified). Prosedur ICD-9-CM utama adalah 47.0 (Appendectomy) dan pemeriksaan USG 88.79.'
    },
    createdAt: '2026-09-08T11:00:00Z',
    updatedAt: '2026-09-11T16:00:00Z',
    createdBy: 'Dr. Wati Susanti, M.Kes (Dosen RMIK)'
  }
];

export const NURSING_SDKI_LIST = [
  { code: 'D.0001', name: 'Bersihan Jalan Napas Tidak Efektif', category: 'Fisiologis - Respirasi' },
  { code: 'D.0005', name: 'Pola Napas Tidak Efektif', category: 'Fisiologis - Respirasi' },
  { code: 'D.0008', name: 'Penurunan Curah Jantung', category: 'Fisiologis - Sirkulasi' },
  { code: 'D.0009', name: 'Perfusi Perifer Tidak Efektif', category: 'Fisiologis - Sirkulasi' },
  { code: 'D.0019', name: 'Defisit Nutrisi', category: 'Fisiologis - Nutrisi' },
  { code: 'D.0022', name: 'Hipervolemia', category: 'Fisiologis - Nutrisi & Cairan' },
  { code: 'D.0023', name: 'Hipovolemia', category: 'Fisiologis - Nutrisi & Cairan' },
  { code: 'D.0077', name: 'Nyeri Akut', category: 'Psikologis - Nyeri & Kenyamanan' },
  { code: 'D.0078', name: 'Nyeri Kronis', category: 'Psikologis - Nyeri & Kenyamanan' },
  { code: 'D.0130', name: 'Hipertermia', category: 'Lingkungan - Keamanan & Proteksi' },
  { code: 'D.0142', name: 'Risiko Infeksi', category: 'Lingkungan - Keamanan & Proteksi' },
  { code: 'D.0149', name: 'Risiko Jatuh', category: 'Lingkungan - Keamanan & Proteksi' },
  { code: 'D.0056', name: 'Intoleransi Aktivitas', category: 'Fisiologis - Aktivitas' }
];

export const NURSING_SLKI_LIST = [
  { code: 'L.01001', name: 'Bersihan Jalan Napas Meningkat' },
  { code: 'L.02008', name: 'Curah Jantung Meningkat' },
  { code: 'L.02011', name: 'Perfusi Perifer Membaik' },
  { code: 'L.03028', name: 'Status Cairan Membaik' },
  { code: 'L.08066', name: 'Tingkat Nyeri Menurun' },
  { code: 'L.14134', name: 'Termoregulasi Membaik' },
  { code: 'L.14128', name: 'Kontrol Risiko Meningkat' },
  { code: 'L.05047', name: 'Toleransi Aktivitas Meningkat' }
];

export const NURSING_SIKI_LIST = [
  { code: 'I.01011', name: 'Manajemen Jalan Napas' },
  { code: 'I.02075', name: 'Perawatan Jantung' },
  { code: 'I.02084', name: 'Pemantauan Tanda Vital' },
  { code: 'I.03119', name: 'Manajemen Hipovolemia' },
  { code: 'I.03114', name: 'Manajemen Hipervolemia' },
  { code: 'I.08238', name: 'Manajemen Nyeri' },
  { code: 'I.09314', name: 'Terapi Oksigen' },
  { code: 'I.14537', name: 'Pencegahan Infeksi' },
  { code: 'I.14539', name: 'Pencegahan Jatuh' },
  { code: 'I.15506', name: 'Manajemen Hipertermia' }
];
