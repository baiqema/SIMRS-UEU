// SIRS REVISI 6.3 - DATA MASTER & INITIAL ROWS FOR RL 3
// Sesuai Pedoman Petunjuk Teknis Pelaporan SIRS Revisi 6.3 Kementerian Kesehatan Republik Indonesia

// ============================================================================
// 1. RL 3.1 INDIKATOR PELAYANAN (Bulanan, bersumber dari RL 3.2)
// ============================================================================
export interface SirsRl31Row {
  no: string;
  jenisPelayanan: string;
  bor: number;
  alos: number;
  bto: number;
  toi: number;
  ndr: number;
  gdr: number;
  isTotal?: boolean;
}

export const INITIAL_RL31_DATA: SirsRl31Row[] = [
  { no: '1', jenisPelayanan: 'Non Intensif', bor: 72.0, alos: 3.8, bto: 4.8, toi: 1.5, ndr: 1.2, gdr: 2.4 },
  { no: '2', jenisPelayanan: 'ICU', bor: 68.5, alos: 4.2, bto: 3.9, toi: 1.8, ndr: 4.5, gdr: 8.2 },
  { no: '3', jenisPelayanan: 'NICU', bor: 62.0, alos: 5.1, bto: 3.2, toi: 2.1, ndr: 2.8, gdr: 5.1 },
  { no: '4', jenisPelayanan: 'PICU', bor: 60.0, alos: 4.0, bto: 3.5, toi: 2.2, ndr: 2.0, gdr: 4.0 },
  { no: '5', jenisPelayanan: 'Intensif lainnya', bor: 58.0, alos: 3.5, bto: 3.0, toi: 2.5, ndr: 1.8, gdr: 3.5 },
  { no: '77', jenisPelayanan: 'Rata-rata', bor: 70.4, alos: 3.9, bto: 4.5, toi: 1.7, ndr: 1.6, gdr: 3.1, isTotal: true }
];

// ============================================================================
// 2. RL 3.2 REKAPITULASI KEGIATAN PELAYANAN RAWAT INAP (Bulanan)
// 36 Jenis Pelayanan Standar Kemenkes RI + 99 TOTAL
// ============================================================================
export interface SirsRl32Row {
  no: string;
  jenisPelayanan: string;
  pasienAwal: number;
  pasienMasuk: number;
  pasienPindahan: number;
  pasienDipindahkan: number;
  keluarHidup: number;
  keluarMatiL_lt48: number;
  keluarMatiL_gte48: number;
  keluarMatiP_lt48: number;
  keluarMatiP_gte48: number;
  lamaDirawat: number; // Greyed column
  pasienAkhir: number;
  hariPerawatan: number;
  kelasVVIP: number;
  kelasVIP: number;
  kelas1: number;
  kelas2: number;
  kelas3: number;
  kelasKhusus: number;
  alokasiTTAwal: number;
  isTotal?: boolean;
}

export const INITIAL_RL32_SERVICES: { no: string; name: string; match?: string[] }[] = [
  { no: '1', name: 'Umum', match: ['umum'] },
  { no: '2', name: 'Penyakit Dalam', match: ['penyakit dalam', 'internis', 'mawar'] },
  { no: '3', name: 'Kesehatan Anak', match: ['anak', 'pediatri', 'melati'] },
  { no: '4', name: 'Kesehatan Remaja', match: ['remaja'] },
  { no: '5', name: 'Obstetri', match: ['obstetri', 'kebidanan', 'maternal', 'anggrek'] },
  { no: '6', name: 'Ginekologi', match: ['ginekologi', 'obgyn'] },
  { no: '7', name: 'Bedah', match: ['bedah', 'teratai'] },
  { no: '8', name: 'Bedah Orthopedi', match: ['orthopedi', 'tulang'] },
  { no: '9', name: 'Bedah Saraf', match: ['bedah saraf'] },
  { no: '10', name: 'Luka Bakar', match: ['luka bakar', 'burn'] },
  { no: '11', name: 'Saraf', match: ['saraf', 'neurologi'] },
  { no: '12', name: 'Jiwa', match: ['jiwa', 'psikiatri'] },
  { no: '13', name: 'Psikologi', match: ['psikologi'] },
  { no: '14', name: 'Penatalaksana Penyalahgunaan NAPZA', match: ['napza', 'narkoba'] },
  { no: '15', name: 'THT', match: ['tht'] },
  { no: '16', name: 'Mata', match: ['mata', 'oftalmologi'] },
  { no: '17', name: 'Kulit dan Kelamin', match: ['kulit', 'dermatologi'] },
  { no: '18', name: 'Kardiologi', match: ['kardiologi', 'jantung'] },
  { no: '19', name: 'Paru', match: ['paru', 'pulmonologi'] },
  { no: '20', name: 'Kanker', match: ['kanker', 'onkologi'] },
  { no: '21', name: 'Uronefrologi', match: ['uronefrologi', 'urologi', 'ginjal'] },
  { no: '22', name: 'Geriatri', match: ['geriatri', 'lansia'] },
  { no: '23', name: 'Kusta', match: ['kusta'] },
  { no: '24', name: 'Radioterapi', match: ['radioterapi'] },
  { no: '25', name: 'Kedokteran Nuklir', match: ['kedokteran nuklir'] },
  { no: '26', name: 'Rehabilitasi Medik', match: ['rehabilitasi', 'fisioterapi'] },
  { no: '27', name: 'ICU', match: ['icu'] },
  { no: '28', name: 'HCU', match: ['hcu'] },
  { no: '29', name: 'ICCU/ICVCU', match: ['iccu', 'icvcu'] },
  { no: '30', name: 'RICU', match: ['ricu'] },
  { no: '31', name: 'NICU', match: ['nicu'] },
  { no: '32', name: 'PICU', match: ['picu'] },
  { no: '33', name: 'Isolasi', match: ['isolasi'] },
  { no: '34', name: 'Gigi dan Mulut', match: ['gigi'] },
  { no: '35', name: 'Pelayanan Rawat Darurat', match: ['igd', 'darurat'] },
  { no: '36', name: 'Perinatologi', match: ['perinatologi', 'perina'] }
];

// ============================================================================
// 3. RL 3.3 REKAPITULASI KEGIATAN PELAYANAN RAWAT DARURAT (Bulanan)
// ============================================================================
export interface SirsRl33Row {
  no: string;
  jenisPelayanan: string;
  isHeader?: boolean;
  isTotal?: boolean;
  totalRujukan: number;
  totalNonRujukan: number;
  dirawat: number;
  dirujuk: number;
  pulang: number;
  matiL: number;
  matiP: number;
  doaL: number;
  doaP: number;
  lukaL: number;
  lukaP: number;
  falseEmergency: number;
  // Blackout flags for standard cells that are disabled (blacked out in SIRS format)
  disabledFalseEmergency?: boolean;
  disabledMaleColumns?: boolean; // Mati L, DOA L, Luka L disabled for Perempuan-only rows
}

export const INITIAL_RL33_DATA: SirsRl33Row[] = [
  {
    no: '1',
    jenisPelayanan: 'Bedah di Instalasi Gawat Darurat',
    isHeader: true,
    totalRujukan: 4,
    totalNonRujukan: 8,
    dirawat: 7,
    dirujuk: 1,
    pulang: 4,
    matiL: 0,
    matiP: 0,
    doaL: 0,
    doaP: 0,
    lukaL: 8,
    lukaP: 4,
    falseEmergency: 0,
    disabledFalseEmergency: true
  },
  {
    no: '1.1',
    jenisPelayanan: 'Kecelakaan lalu lintas darat',
    totalRujukan: 3,
    totalNonRujukan: 5,
    dirawat: 5,
    dirujuk: 1,
    pulang: 2,
    matiL: 0,
    matiP: 0,
    doaL: 0,
    doaP: 0,
    lukaL: 6,
    lukaP: 2,
    falseEmergency: 0,
    disabledFalseEmergency: true
  },
  {
    no: '1.2',
    jenisPelayanan: 'Kecelakaan lalu lintas perairan',
    totalRujukan: 0,
    totalNonRujukan: 0,
    dirawat: 0,
    dirujuk: 0,
    pulang: 0,
    matiL: 0,
    matiP: 0,
    doaL: 0,
    doaP: 0,
    lukaL: 0,
    lukaP: 0,
    falseEmergency: 0,
    disabledFalseEmergency: true
  },
  {
    no: '1.3',
    jenisPelayanan: 'Kecelakaan lalu lintas udara',
    totalRujukan: 0,
    totalNonRujukan: 0,
    dirawat: 0,
    dirujuk: 0,
    pulang: 0,
    matiL: 0,
    matiP: 0,
    doaL: 0,
    doaP: 0,
    lukaL: 0,
    lukaP: 0,
    falseEmergency: 0,
    disabledFalseEmergency: true
  },
  {
    no: '1.4',
    jenisPelayanan: 'Bedah lainnya (non kecelakaan)',
    totalRujukan: 1,
    totalNonRujukan: 3,
    dirawat: 2,
    dirujuk: 0,
    pulang: 2,
    matiL: 0,
    matiP: 0,
    doaL: 0,
    doaP: 0,
    lukaL: 2,
    lukaP: 2,
    falseEmergency: 0,
    disabledFalseEmergency: true
  },
  {
    no: '2',
    jenisPelayanan: 'Non Bedah',
    isHeader: true,
    totalRujukan: 8,
    totalNonRujukan: 18,
    dirawat: 14,
    dirujuk: 2,
    pulang: 10,
    matiL: 0,
    matiP: 0,
    doaL: 0,
    doaP: 0,
    lukaL: 1,
    lukaP: 1,
    falseEmergency: 3
  },
  {
    no: '2.1',
    jenisPelayanan: 'Kekerasan terhadap Perempuan (≥18 tahun)',
    totalRujukan: 0,
    totalNonRujukan: 2,
    dirawat: 1,
    dirujuk: 0,
    pulang: 1,
    matiL: 0,
    matiP: 0,
    doaL: 0,
    doaP: 0,
    lukaL: 0,
    lukaP: 2,
    falseEmergency: 0,
    disabledMaleColumns: true
  },
  {
    no: '2.2',
    jenisPelayanan: 'Kekerasan terhadap Anak (<18 tahun)',
    totalRujukan: 0,
    totalNonRujukan: 1,
    dirawat: 0,
    dirujuk: 0,
    pulang: 1,
    matiL: 0,
    matiP: 0,
    doaL: 0,
    doaP: 0,
    lukaL: 1,
    lukaP: 0,
    falseEmergency: 0
  },
  {
    no: '2.3',
    jenisPelayanan: 'Kekerasan lainnya',
    totalRujukan: 0,
    totalNonRujukan: 1,
    dirawat: 1,
    dirujuk: 0,
    pulang: 0,
    matiL: 0,
    matiP: 0,
    doaL: 0,
    doaP: 0,
    lukaL: 1,
    lukaP: 0,
    falseEmergency: 0
  },
  {
    no: '2.4',
    jenisPelayanan: 'Non bedah lainnya',
    totalRujukan: 8,
    totalNonRujukan: 14,
    dirawat: 12,
    dirujuk: 2,
    pulang: 8,
    matiL: 0,
    matiP: 0,
    doaL: 0,
    doaP: 0,
    lukaL: 0,
    lukaP: 0,
    falseEmergency: 3
  },
  {
    no: '3',
    jenisPelayanan: 'Kebidanan',
    totalRujukan: 2,
    totalNonRujukan: 5,
    dirawat: 5,
    dirujuk: 0,
    pulang: 2,
    matiL: 0,
    matiP: 0,
    doaL: 0,
    doaP: 0,
    lukaL: 0,
    lukaP: 0,
    falseEmergency: 1,
    disabledMaleColumns: true
  },
  {
    no: '4',
    jenisPelayanan: 'Psikiatrik',
    totalRujukan: 1,
    totalNonRujukan: 2,
    dirawat: 1,
    dirujuk: 1,
    pulang: 1,
    matiL: 0,
    matiP: 0,
    doaL: 0,
    doaP: 0,
    lukaL: 0,
    lukaP: 0,
    falseEmergency: 0
  },
  {
    no: '5',
    jenisPelayanan: 'Bayi',
    totalRujukan: 1,
    totalNonRujukan: 3,
    dirawat: 3,
    dirujuk: 0,
    pulang: 1,
    matiL: 0,
    matiP: 0,
    doaL: 0,
    doaP: 0,
    lukaL: 0,
    lukaP: 0,
    falseEmergency: 0
  },
  {
    no: '6',
    jenisPelayanan: 'Anak',
    totalRujukan: 2,
    totalNonRujukan: 6,
    dirawat: 4,
    dirujuk: 0,
    pulang: 4,
    matiL: 0,
    matiP: 0,
    doaL: 0,
    doaP: 0,
    lukaL: 1,
    lukaP: 0,
    falseEmergency: 1
  },
  {
    no: '7',
    jenisPelayanan: 'Geriatri',
    totalRujukan: 3,
    totalNonRujukan: 4,
    dirawat: 5,
    dirujuk: 1,
    pulang: 1,
    matiL: 0,
    matiP: 0,
    doaL: 0,
    doaP: 0,
    lukaL: 0,
    lukaP: 0,
    falseEmergency: 0
  },
  {
    no: '99',
    jenisPelayanan: 'TOTAL',
    isTotal: true,
    totalRujukan: 21,
    totalNonRujukan: 46,
    dirawat: 39,
    dirujuk: 5,
    pulang: 23,
    matiL: 0,
    matiP: 0,
    doaL: 0,
    doaP: 0,
    lukaL: 10,
    lukaP: 5,
    falseEmergency: 5
  }
];

// ============================================================================
// 4. RL 3.5 REKAPITULASI KUNJUNGAN (Bulanan)
// 34 Jenis Kegiatan Standar Kemenkes RI + 99 TOTAL + 66 + 77
// ============================================================================
export interface SirsRl35Row {
  no: string;
  jenisKegiatan: string;
  dalamKabL: number;
  dalamKabP: number;
  luarKabL: number;
  luarKabP: number;
  totalKunjungan: number;
  isTotal?: boolean;
  isSpecialRow?: boolean;
}

export const INITIAL_RL35_ACTIVITIES: { no: string; name: string; match?: string[] }[] = [
  { no: '1', name: 'Penyakit Dalam', match: ['penyakit dalam', 'internis'] },
  { no: '2', name: 'Bedah', match: ['bedah', 'bedah umum'] },
  { no: '3', name: 'Kesehatan Anak (Neonatal)', match: ['neonatal', 'bayi baru lahir'] },
  { no: '4', name: 'Kesehatan Anak (Lainnya)', match: ['anak', 'pediatri'] },
  { no: '5', name: 'Obstetri & Ginekologi (Ibu Hamil)', match: ['obstetri', 'ibu hamil', 'antenatal'] },
  { no: '6', name: 'Obstetri & Ginekologi (Lainnya)', match: ['ginekologi', 'obgyn', 'kebidanan'] },
  { no: '7', name: 'Keluarga Berencana', match: ['kb', 'keluarga berencana'] },
  { no: '8', name: 'Jiwa', match: ['jiwa', 'psikiatri'] },
  { no: '9', name: 'Napza', match: ['napza', 'adiksi'] },
  { no: '10', name: 'Psikologi', match: ['psikologi'] },
  { no: '11', name: 'THT', match: ['tht'] },
  { no: '12', name: 'Mata', match: ['mata', 'oftalmologi'] },
  { no: '13', name: 'Kulit dan Kelamin', match: ['kulit', 'kelamin', 'dermatologi'] },
  { no: '14', name: 'Gigi & Mulut', match: ['gigi', 'mulut', 'dental'] },
  { no: '15', name: 'Geriatri', match: ['geriatri', 'lansia'] },
  { no: '16', name: 'Kardiologi', match: ['kardiologi', 'jantung'] },
  { no: '17', name: 'Radiologi', match: ['radiologi'] },
  { no: '18', name: 'Bedah Orthopedi', match: ['orthopedi'] },
  { no: '19', name: 'Paru - Paru', match: ['paru', 'pulmonologi'] },
  { no: '20', name: 'Kanker', match: ['kanker', 'onkologi'] },
  { no: '21', name: 'Uronefrologi', match: ['uronefrologi', 'urologi', 'nefrologi'] },
  { no: '22', name: 'Kusta', match: ['kusta'] },
  { no: '23', name: 'Umum', match: ['umum'] },
  { no: '24', name: 'Rawat Darurat', match: ['igd', 'darurat'] },
  { no: '25', name: 'Rehabilitasi Medik', match: ['rehabilitasi medik', 'fisioterapi'] },
  { no: '26', name: 'Akupungtur Medik', match: ['akupungtur'] },
  { no: '27', name: 'Konsultasi Gizi', match: ['gizi'] },
  { no: '28', name: 'Day Care', match: ['day care'] },
  { no: '29', name: 'Medical Check Up', match: ['mcu', 'medical check up'] },
  { no: '30', name: 'Bedah Saraf (Stroke)', match: ['bedah saraf stroke'] },
  { no: '31', name: 'Bedah Saraf (Lainnya)', match: ['bedah saraf'] },
  { no: '32', name: 'Saraf (Stroke)', match: ['saraf stroke', 'neuro stroke'] },
  { no: '33', name: 'Saraf (Lainnya)', match: ['saraf', 'neurologi'] },
  { no: '34', name: 'Lain – Lain', match: ['lain'] }
];

// ============================================================================
// 5. RL 3.6 REKAPITULASI KEGIATAN PELAYANAN KEBIDANAN (Bulanan)
// ============================================================================
export interface SirsRl36Row {
  no: string;
  jenisKegiatan: string;
  isHeader?: boolean;
  // Rujukan Medis
  rujukanRS: number;
  rujukanBidan: number;
  rujukanPuskesmas: number;
  rujukanFaskesLain: number;
  rujukanHidup: number;
  rujukanMati: number;
  totalRujukanMedis: number;
  // Rujukan Non Medis
  nonMedisHidup: number;
  nonMedisMati: number;
  totalRujukanNonMedis: number;
  // Non Rujukan
  nonRujukanHidup: number;
  nonRujukanMati: number;
  totalNonRujukan: number;
  // Dirujuk
  dirujuk: number;
  // Blackout cell flags per official form
  disabledDeathColumns?: boolean;
  disabledDirujuk?: boolean;
}

export const INITIAL_RL36_DATA: SirsRl36Row[] = [
  {
    no: '1',
    jenisKegiatan: 'Pemberian Buku KIA pada Ibu Hamil',
    rujukanRS: 2,
    rujukanBidan: 5,
    rujukanPuskesmas: 8,
    rujukanFaskesLain: 1,
    rujukanHidup: 16,
    rujukanMati: 0,
    totalRujukanMedis: 16,
    nonMedisHidup: 4,
    nonMedisMati: 0,
    totalRujukanNonMedis: 4,
    nonRujukanHidup: 12,
    nonRujukanMati: 0,
    totalNonRujukan: 12,
    dirujuk: 0,
    disabledDeathColumns: true,
    disabledDirujuk: true
  },
  {
    no: '2',
    jenisKegiatan: 'Pelayanan Antenatal',
    rujukanRS: 4,
    rujukanBidan: 12,
    rujukanPuskesmas: 18,
    rujukanFaskesLain: 3,
    rujukanHidup: 37,
    rujukanMati: 0,
    totalRujukanMedis: 37,
    nonMedisHidup: 8,
    nonMedisMati: 0,
    totalRujukanNonMedis: 8,
    nonRujukanHidup: 25,
    nonRujukanMati: 0,
    totalNonRujukan: 25,
    dirujuk: 0,
    disabledDirujuk: true
  },
  {
    no: '3',
    jenisKegiatan: 'Persalinan:',
    isHeader: true,
    rujukanRS: 0,
    rujukanBidan: 0,
    rujukanPuskesmas: 0,
    rujukanFaskesLain: 0,
    rujukanHidup: 0,
    rujukanMati: 0,
    totalRujukanMedis: 0,
    nonMedisHidup: 0,
    nonMedisMati: 0,
    totalRujukanNonMedis: 0,
    nonRujukanHidup: 0,
    nonRujukanMati: 0,
    totalNonRujukan: 0,
    dirujuk: 0
  },
  {
    no: '3.1',
    jenisKegiatan: 'Persalinan pervaginam tanpa penyulit (normal)',
    rujukanRS: 1,
    rujukanBidan: 8,
    rujukanPuskesmas: 6,
    rujukanFaskesLain: 1,
    rujukanHidup: 16,
    rujukanMati: 0,
    totalRujukanMedis: 16,
    nonMedisHidup: 3,
    nonMedisMati: 0,
    totalRujukanNonMedis: 3,
    nonRujukanHidup: 14,
    nonRujukanMati: 0,
    totalNonRujukan: 14,
    dirujuk: 0
  },
  {
    no: '3.2',
    jenisKegiatan: 'Persalinan pervaginam spontan dengan penyulit',
    rujukanRS: 2,
    rujukanBidan: 4,
    rujukanPuskesmas: 3,
    rujukanFaskesLain: 0,
    rujukanHidup: 9,
    rujukanMati: 0,
    totalRujukanMedis: 9,
    nonMedisHidup: 1,
    nonMedisMati: 0,
    totalRujukanNonMedis: 1,
    nonRujukanHidup: 4,
    nonRujukanMati: 0,
    totalNonRujukan: 4,
    dirujuk: 1
  },
  {
    no: '3.3',
    jenisKegiatan: 'Persalinan pervaginam dengan bantuan',
    rujukanRS: 1,
    rujukanBidan: 2,
    rujukanPuskesmas: 2,
    rujukanFaskesLain: 0,
    rujukanHidup: 5,
    rujukanMati: 0,
    totalRujukanMedis: 5,
    nonMedisHidup: 0,
    nonMedisMati: 0,
    totalRujukanNonMedis: 0,
    nonRujukanHidup: 2,
    nonRujukanMati: 0,
    totalNonRujukan: 2,
    dirujuk: 0
  },
  {
    no: '3.4',
    jenisKegiatan: 'Persalinan Sectio caesaria',
    rujukanRS: 3,
    rujukanBidan: 5,
    rujukanPuskesmas: 4,
    rujukanFaskesLain: 1,
    rujukanHidup: 13,
    rujukanMati: 0,
    totalRujukanMedis: 13,
    nonMedisHidup: 2,
    nonMedisMati: 0,
    totalRujukanNonMedis: 2,
    nonRujukanHidup: 8,
    nonRujukanMati: 0,
    totalNonRujukan: 8,
    dirujuk: 0
  },
  {
    no: '4',
    jenisKegiatan: 'Komplikasi obstetri pada ibu hamil, bersalin, dan nifas',
    isHeader: true,
    rujukanRS: 0,
    rujukanBidan: 0,
    rujukanPuskesmas: 0,
    rujukanFaskesLain: 0,
    rujukanHidup: 0,
    rujukanMati: 0,
    totalRujukanMedis: 0,
    nonMedisHidup: 0,
    nonMedisMati: 0,
    totalRujukanNonMedis: 0,
    nonRujukanHidup: 0,
    nonRujukanMati: 0,
    totalNonRujukan: 0,
    dirujuk: 0
  },
  {
    no: '4.1',
    jenisKegiatan: 'Perdarahan sebelum persalinan',
    rujukanRS: 1,
    rujukanBidan: 2,
    rujukanPuskesmas: 1,
    rujukanFaskesLain: 0,
    rujukanHidup: 4,
    rujukanMati: 0,
    totalRujukanMedis: 4,
    nonMedisHidup: 1,
    nonMedisMati: 0,
    totalRujukanNonMedis: 1,
    nonRujukanHidup: 2,
    nonRujukanMati: 0,
    totalNonRujukan: 2,
    dirujuk: 0
  },
  {
    no: '4.2',
    jenisKegiatan: 'Perdarahan setelah persalinan',
    rujukanRS: 1,
    rujukanBidan: 2,
    rujukanPuskesmas: 2,
    rujukanFaskesLain: 0,
    rujukanHidup: 5,
    rujukanMati: 0,
    totalRujukanMedis: 5,
    nonMedisHidup: 1,
    nonMedisMati: 0,
    totalRujukanNonMedis: 1,
    nonRujukanHidup: 2,
    nonRujukanMati: 0,
    totalNonRujukan: 2,
    dirujuk: 1
  },
  {
    no: '4.3',
    jenisKegiatan: 'Pre eklamsia',
    rujukanRS: 2,
    rujukanBidan: 3,
    rujukanPuskesmas: 4,
    rujukanFaskesLain: 1,
    rujukanHidup: 10,
    rujukanMati: 0,
    totalRujukanMedis: 10,
    nonMedisHidup: 1,
    nonMedisMati: 0,
    totalRujukanNonMedis: 1,
    nonRujukanHidup: 3,
    nonRujukanMati: 0,
    totalNonRujukan: 3,
    dirujuk: 0
  },
  {
    no: '4.4',
    jenisKegiatan: 'Eklamsia',
    rujukanRS: 1,
    rujukanBidan: 1,
    rujukanPuskesmas: 1,
    rujukanFaskesLain: 0,
    rujukanHidup: 3,
    rujukanMati: 0,
    totalRujukanMedis: 3,
    nonMedisHidup: 0,
    nonMedisMati: 0,
    totalRujukanNonMedis: 0,
    nonRujukanHidup: 1,
    nonRujukanMati: 0,
    totalNonRujukan: 1,
    dirujuk: 1
  },
  {
    no: '4.5',
    jenisKegiatan: 'Infeksi',
    rujukanRS: 0,
    rujukanBidan: 1,
    rujukanPuskesmas: 1,
    rujukanFaskesLain: 0,
    rujukanHidup: 2,
    rujukanMati: 0,
    totalRujukanMedis: 2,
    nonMedisHidup: 0,
    nonMedisMati: 0,
    totalRujukanNonMedis: 0,
    nonRujukanHidup: 1,
    nonRujukanMati: 0,
    totalNonRujukan: 1,
    dirujuk: 0
  },
  {
    no: '4.6',
    jenisKegiatan: 'Abortus',
    rujukanRS: 1,
    rujukanBidan: 2,
    rujukanPuskesmas: 2,
    rujukanFaskesLain: 0,
    rujukanHidup: 5,
    rujukanMati: 0,
    totalRujukanMedis: 5,
    nonMedisHidup: 1,
    nonMedisMati: 0,
    totalRujukanNonMedis: 1,
    nonRujukanHidup: 3,
    nonRujukanMati: 0,
    totalNonRujukan: 3,
    dirujuk: 0
  },
  {
    no: '4.7',
    jenisKegiatan: 'Komplikasi lainnya',
    rujukanRS: 0,
    rujukanBidan: 1,
    rujukanPuskesmas: 1,
    rujukanFaskesLain: 0,
    rujukanHidup: 2,
    rujukanMati: 0,
    totalRujukanMedis: 2,
    nonMedisHidup: 0,
    nonMedisMati: 0,
    totalRujukanNonMedis: 0,
    nonRujukanHidup: 2,
    nonRujukanMati: 0,
    totalNonRujukan: 2,
    dirujuk: 0
  },
  {
    no: '5',
    jenisKegiatan: 'Aborsi',
    isHeader: true,
    rujukanRS: 0,
    rujukanBidan: 0,
    rujukanPuskesmas: 0,
    rujukanFaskesLain: 0,
    rujukanHidup: 0,
    rujukanMati: 0,
    totalRujukanMedis: 0,
    nonMedisHidup: 0,
    nonMedisMati: 0,
    totalRujukanNonMedis: 0,
    nonRujukanHidup: 0,
    nonRujukanMati: 0,
    totalNonRujukan: 0,
    dirujuk: 0
  },
  {
    no: '5.1',
    jenisKegiatan: 'Aborsi atas indikasi kedaruratan medis',
    rujukanRS: 1,
    rujukanBidan: 0,
    rujukanPuskesmas: 0,
    rujukanFaskesLain: 0,
    rujukanHidup: 1,
    rujukanMati: 0,
    totalRujukanMedis: 1,
    nonMedisHidup: 0,
    nonMedisMati: 0,
    totalRujukanNonMedis: 0,
    nonRujukanHidup: 0,
    nonRujukanMati: 0,
    totalNonRujukan: 0,
    dirujuk: 0
  },
  {
    no: '5.2',
    jenisKegiatan: 'Aborsi atas indikasi kehamilan akibat perkosaan',
    rujukanRS: 0,
    rujukanBidan: 0,
    rujukanPuskesmas: 0,
    rujukanFaskesLain: 0,
    rujukanHidup: 0,
    rujukanMati: 0,
    totalRujukanMedis: 0,
    nonMedisHidup: 0,
    nonMedisMati: 0,
    totalRujukanNonMedis: 0,
    nonRujukanHidup: 0,
    nonRujukanMati: 0,
    totalNonRujukan: 0,
    dirujuk: 0
  },
  {
    no: '6',
    jenisKegiatan: 'Skrining Status Imunisasi Tetanus',
    rujukanRS: 2,
    rujukanBidan: 4,
    rujukanPuskesmas: 6,
    rujukanFaskesLain: 1,
    rujukanHidup: 13,
    rujukanMati: 0,
    totalRujukanMedis: 13,
    nonMedisHidup: 2,
    nonMedisMati: 0,
    totalRujukanNonMedis: 2,
    nonRujukanHidup: 10,
    nonRujukanMati: 0,
    totalNonRujukan: 10,
    dirujuk: 0,
    disabledDeathColumns: true,
    disabledDirujuk: true
  },
  {
    no: '7',
    jenisKegiatan: 'Komplikasi non obstetri pada ibu hamil, bersalin, dan nifas:',
    isHeader: true,
    rujukanRS: 0,
    rujukanBidan: 0,
    rujukanPuskesmas: 0,
    rujukanFaskesLain: 0,
    rujukanHidup: 0,
    rujukanMati: 0,
    totalRujukanMedis: 0,
    nonMedisHidup: 0,
    nonMedisMati: 0,
    totalRujukanNonMedis: 0,
    nonRujukanHidup: 0,
    nonRujukanMati: 0,
    totalNonRujukan: 0,
    dirujuk: 0
  },
  {
    no: '7.1',
    jenisKegiatan: 'HIV',
    rujukanRS: 1,
    rujukanBidan: 0,
    rujukanPuskesmas: 1,
    rujukanFaskesLain: 0,
    rujukanHidup: 2,
    rujukanMati: 0,
    totalRujukanMedis: 2,
    nonMedisHidup: 0,
    nonMedisMati: 0,
    totalRujukanNonMedis: 0,
    nonRujukanHidup: 1,
    nonRujukanMati: 0,
    totalNonRujukan: 1,
    dirujuk: 0
  },
  {
    no: '7.2',
    jenisKegiatan: 'Hepatitis B',
    rujukanRS: 1,
    rujukanBidan: 1,
    rujukanPuskesmas: 2,
    rujukanFaskesLain: 0,
    rujukanHidup: 4,
    rujukanMati: 0,
    totalRujukanMedis: 4,
    nonMedisHidup: 0,
    nonMedisMati: 0,
    totalRujukanNonMedis: 0,
    nonRujukanHidup: 2,
    nonRujukanMati: 0,
    totalNonRujukan: 2,
    dirujuk: 0
  },
  {
    no: '7.3',
    jenisKegiatan: 'Sifilis',
    rujukanRS: 0,
    rujukanBidan: 0,
    rujukanPuskesmas: 1,
    rujukanFaskesLain: 0,
    rujukanHidup: 1,
    rujukanMati: 0,
    totalRujukanMedis: 1,
    nonMedisHidup: 0,
    nonMedisMati: 0,
    totalRujukanNonMedis: 0,
    nonRujukanHidup: 0,
    nonRujukanMati: 0,
    totalNonRujukan: 0,
    dirujuk: 0
  },
  {
    no: '7.4',
    jenisKegiatan: 'Tuberkulosis',
    rujukanRS: 1,
    rujukanBidan: 0,
    rujukanPuskesmas: 1,
    rujukanFaskesLain: 0,
    rujukanHidup: 2,
    rujukanMati: 0,
    totalRujukanMedis: 2,
    nonMedisHidup: 0,
    nonMedisMati: 0,
    totalRujukanNonMedis: 0,
    nonRujukanHidup: 1,
    nonRujukanMati: 0,
    totalNonRujukan: 1,
    dirujuk: 0
  },
  {
    no: '7.5',
    jenisKegiatan: 'Penyakit jantung',
    rujukanRS: 2,
    rujukanBidan: 1,
    rujukanPuskesmas: 1,
    rujukanFaskesLain: 0,
    rujukanHidup: 4,
    rujukanMati: 0,
    totalRujukanMedis: 4,
    nonMedisHidup: 0,
    nonMedisMati: 0,
    totalRujukanNonMedis: 0,
    nonRujukanHidup: 1,
    nonRujukanMati: 0,
    totalNonRujukan: 1,
    dirujuk: 1
  },
  {
    no: '7.6',
    jenisKegiatan: 'Anemia',
    rujukanRS: 1,
    rujukanBidan: 4,
    rujukanPuskesmas: 5,
    rujukanFaskesLain: 1,
    rujukanHidup: 11,
    rujukanMati: 0,
    totalRujukanMedis: 11,
    nonMedisHidup: 2,
    nonMedisMati: 0,
    totalRujukanNonMedis: 2,
    nonRujukanHidup: 6,
    nonRujukanMati: 0,
    totalNonRujukan: 6,
    dirujuk: 0
  },
  {
    no: '7.7',
    jenisKegiatan: 'Diabetes Melitus',
    rujukanRS: 1,
    rujukanBidan: 1,
    rujukanPuskesmas: 2,
    rujukanFaskesLain: 0,
    rujukanHidup: 4,
    rujukanMati: 0,
    totalRujukanMedis: 4,
    nonMedisHidup: 1,
    nonMedisMati: 0,
    totalRujukanNonMedis: 1,
    nonRujukanHidup: 2,
    nonRujukanMati: 0,
    totalNonRujukan: 2,
    dirujuk: 0
  },
  {
    no: '7.8',
    jenisKegiatan: 'Terkonfirmasi COVID-19',
    rujukanRS: 0,
    rujukanBidan: 0,
    rujukanPuskesmas: 0,
    rujukanFaskesLain: 0,
    rujukanHidup: 0,
    rujukanMati: 0,
    totalRujukanMedis: 0,
    nonMedisHidup: 0,
    nonMedisMati: 0,
    totalRujukanNonMedis: 0,
    nonRujukanHidup: 0,
    nonRujukanMati: 0,
    totalNonRujukan: 0,
    dirujuk: 0
  },
  {
    no: '7.9',
    jenisKegiatan: 'Komplikasi lainnya',
    rujukanRS: 0,
    rujukanBidan: 1,
    rujukanPuskesmas: 1,
    rujukanFaskesLain: 0,
    rujukanHidup: 2,
    rujukanMati: 0,
    totalRujukanMedis: 2,
    nonMedisHidup: 0,
    nonMedisMati: 0,
    totalRujukanNonMedis: 0,
    nonRujukanHidup: 1,
    nonRujukanMati: 0,
    totalNonRujukan: 1,
    dirujuk: 0
  },
  {
    no: '8',
    jenisKegiatan: 'Ibu Hamil berisiko mempunyai bayi prematur',
    isHeader: true,
    rujukanRS: 0,
    rujukanBidan: 0,
    rujukanPuskesmas: 0,
    rujukanFaskesLain: 0,
    rujukanHidup: 0,
    rujukanMati: 0,
    totalRujukanMedis: 0,
    nonMedisHidup: 0,
    nonMedisMati: 0,
    totalRujukanNonMedis: 0,
    nonRujukanHidup: 0,
    nonRujukanMati: 0,
    totalNonRujukan: 0,
    dirujuk: 0
  },
  {
    no: '8.1',
    jenisKegiatan: 'Diberikan antenatal kortikosteroid',
    rujukanRS: 2,
    rujukanBidan: 2,
    rujukanPuskesmas: 2,
    rujukanFaskesLain: 0,
    rujukanHidup: 6,
    rujukanMati: 0,
    totalRujukanMedis: 6,
    nonMedisHidup: 1,
    nonMedisMati: 0,
    totalRujukanNonMedis: 1,
    nonRujukanHidup: 2,
    nonRujukanMati: 0,
    totalNonRujukan: 2,
    dirujuk: 0,
    disabledDeathColumns: true,
    disabledDirujuk: true
  },
  {
    no: '8.2',
    jenisKegiatan: 'Tidak diberikan antenatal kortikosteroid',
    rujukanRS: 0,
    rujukanBidan: 1,
    rujukanPuskesmas: 1,
    rujukanFaskesLain: 0,
    rujukanHidup: 2,
    rujukanMati: 0,
    totalRujukanMedis: 2,
    nonMedisHidup: 0,
    nonMedisMati: 0,
    totalRujukanNonMedis: 0,
    nonRujukanHidup: 1,
    nonRujukanMati: 0,
    totalNonRujukan: 1,
    dirujuk: 0,
    disabledDeathColumns: true,
    disabledDirujuk: true
  },
  {
    no: '9',
    jenisKegiatan: 'Pelayanan Nifas',
    rujukanRS: 2,
    rujukanBidan: 6,
    rujukanPuskesmas: 8,
    rujukanFaskesLain: 1,
    rujukanHidup: 17,
    rujukanMati: 0,
    totalRujukanMedis: 17,
    nonMedisHidup: 3,
    nonMedisMati: 0,
    totalRujukanNonMedis: 3,
    nonRujukanHidup: 14,
    nonRujukanMati: 0,
    totalNonRujukan: 14,
    dirujuk: 0,
    disabledDeathColumns: true,
    disabledDirujuk: true
  },
  {
    no: '10',
    jenisKegiatan: 'Ibu Nifas mendapat vitamin A',
    rujukanRS: 2,
    rujukanBidan: 5,
    rujukanPuskesmas: 8,
    rujukanFaskesLain: 1,
    rujukanHidup: 16,
    rujukanMati: 0,
    totalRujukanMedis: 16,
    nonMedisHidup: 3,
    nonMedisMati: 0,
    totalRujukanNonMedis: 3,
    nonRujukanHidup: 13,
    nonRujukanMati: 0,
    totalNonRujukan: 13,
    dirujuk: 0,
    disabledDeathColumns: true,
    disabledDirujuk: true
  }
];
