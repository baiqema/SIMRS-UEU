// Pedoman Variabel dan Metadata Penyelenggaraan Rekam Medis Elektronik
// Berdasarkan Keputusan Menteri Kesehatan RI Nomor HK.01.07/MENKES/1423/2022

export interface KmkVariableItem {
  id: string;
  dataset: 'IGD' | 'Rawat Jalan' | 'Rawat Inap' | 'Bayi Baru Lahir' | 'Laboratorium' | 'Apotek';
  section: string;
  subSection?: string;
  no: string;
  variableName: string;
  dataType: 'karakter' | 'numerik' | 'alphanumerik' | 'tanggal, waktu' | 'alphabet' | 'file' | 'file/longblob/blob/varchar';
  formatValue: string;
  operationalDefinition: string;
  reference: string;
  required?: boolean;
}

export const KMK_METADATA_1423: KmkVariableItem[] = [
  // =========================================================================
  // A. INSTALASI GAWAT DARURAT (IGD) - I. LEMBAR IDENTITAS - 1. IDENTITAS UMUM PASIEN
  // =========================================================================
  {
    id: 'igd_id_01',
    dataset: 'IGD',
    section: 'I. LEMBAR IDENTITAS',
    subSection: '1. Identitas Umum Pasien',
    no: 'I.1.a',
    variableName: 'Nama Lengkap',
    dataType: 'karakter',
    formatValue: 'sesuai identitas',
    operationalDefinition: 'Nama lengkap sesuai dengan kartu identitas, KTP, KK, SIM, Paspor, KITAS, Akta Lahir',
    reference: 'Kemenkes / Dukcapil',
    required: true
  },
  {
    id: 'igd_id_02',
    dataset: 'IGD',
    section: 'I. LEMBAR IDENTITAS',
    subSection: '1. Identitas Umum Pasien',
    no: 'I.1.b',
    variableName: 'Nomor Rekam Medis',
    dataType: 'karakter',
    formatValue: 'sistem penomoran unit (6 digit angka)',
    operationalDefinition: 'Nomor rekam medis yang tercatat di Rumah Sakit secara unik dan berurutan',
    reference: 'PMK No. 24 Tahun 2022',
    required: true
  },
  {
    id: 'igd_id_03',
    dataset: 'IGD',
    section: 'I. LEMBAR IDENTITAS',
    subSection: '1. Identitas Umum Pasien',
    no: 'I.1.c',
    variableName: 'Nomor Induk Kependudukan (NIK)',
    dataType: 'numerik',
    formatValue: '16 digit sesuai NIK / 9999999999999999',
    operationalDefinition: 'Nomor Induk Kependudukan sesuai dengan yang tercatat di Dinas Kependudukan dan Catatan Sipil (Dukcapil)',
    reference: 'Ditjen Dukcapil Kemendagri',
    required: true
  },
  {
    id: 'igd_id_04',
    dataset: 'IGD',
    section: 'I. LEMBAR IDENTITAS',
    subSection: '1. Identitas Umum Pasien',
    no: 'I.1.d',
    variableName: 'Nomor Identitas Lain (Khusus WNA) / Paspor / KITAS',
    dataType: 'alphanumerik',
    formatValue: 'sesuai identitas paspor/KITAS',
    operationalDefinition: 'Nomor identitas selain NIK yang tercatat dalam dokumen resmi kenegaraan',
    reference: 'Imigrasi / Kemenkumham'
  },
  {
    id: 'igd_id_05',
    dataset: 'IGD',
    section: 'I. LEMBAR IDENTITAS',
    subSection: '1. Identitas Umum Pasien',
    no: 'I.1.e',
    variableName: 'Nama Ibu Kandung',
    dataType: 'karakter',
    formatValue: 'sesuai identitas',
    operationalDefinition: 'Nama lengkap ibu kandung sesuai dengan kartu identitas, KTP, KK, Akta Lahir',
    reference: 'Dukcapil',
    required: true
  },
  {
    id: 'igd_id_06',
    dataset: 'IGD',
    section: 'I. LEMBAR IDENTITAS',
    subSection: '1. Identitas Umum Pasien',
    no: 'I.1.f',
    variableName: 'Tempat Lahir',
    dataType: 'karakter',
    formatValue: 'sesuai identitas kota/kabupaten',
    operationalDefinition: 'Kota/Kabupaten tempat pasien dilahirkan',
    reference: 'Dukcapil'
  },
  {
    id: 'igd_id_07',
    dataset: 'IGD',
    section: 'I. LEMBAR IDENTITAS',
    subSection: '1. Identitas Umum Pasien',
    no: 'I.1.g',
    variableName: 'Tanggal Lahir',
    dataType: 'tanggal, waktu',
    formatValue: 'DD/MM/YYYY',
    operationalDefinition: 'Tanggal lahir pasien',
    reference: 'Dukcapil',
    required: true
  },
  {
    id: 'igd_id_08',
    dataset: 'IGD',
    section: 'I. LEMBAR IDENTITAS',
    subSection: '1. Identitas Umum Pasien',
    no: 'I.1.h',
    variableName: 'Jenis Kelamin',
    dataType: 'numerik',
    formatValue: '0: Tidak diketahui, 1: Laki-laki, 2: Perempuan, 3: Tidak dapat ditentukan, 4: Tidak mengisi',
    operationalDefinition: 'Jenis kelamin pasien sesuai standar data Kemenkes',
    reference: 'Standar Kemenkes RI',
    required: true
  },
  {
    id: 'igd_id_09',
    dataset: 'IGD',
    section: 'I. LEMBAR IDENTITAS',
    subSection: '1. Identitas Umum Pasien',
    no: 'I.1.i',
    variableName: 'Agama',
    dataType: 'alphanumerik',
    formatValue: '1: Islam, 2: Kristen (Protestan), 3: Katolik, 4: Hindu, 5: Budha, 6: Konghucu, 7: Penghayat, 8: Lain-lain',
    operationalDefinition: 'Agama atau kepercayaan yang dianut dan diakui',
    reference: 'Kementerian Agama RI'
  },
  {
    id: 'igd_id_10',
    dataset: 'IGD',
    section: 'I. LEMBAR IDENTITAS',
    subSection: '1. Identitas Umum Pasien',
    no: 'I.1.j',
    variableName: 'Suku',
    dataType: 'karakter',
    formatValue: 'free text',
    operationalDefinition: 'Suku bangsa pasien',
    reference: 'BPS'
  },
  {
    id: 'igd_id_11',
    dataset: 'IGD',
    section: 'I. LEMBAR IDENTITAS',
    subSection: '1. Identitas Umum Pasien',
    no: 'I.1.k',
    variableName: 'Bahasa yang Dikuasai',
    dataType: 'karakter',
    formatValue: 'free text (Indonesia / Daerah / Asing)',
    operationalDefinition: 'Bahasa komunikasi sehari-hari yang dikuasai oleh pasien',
    reference: 'Standar Komunikasi Pasien'
  },
  {
    id: 'igd_id_12',
    dataset: 'IGD',
    section: 'I. LEMBAR IDENTITAS',
    subSection: '1. Identitas Umum Pasien',
    no: 'I.1.l',
    variableName: 'Alamat KTP / Lengkap',
    dataType: 'alphanumerik',
    formatValue: 'nama jalan, nomor rumah / tidak ada tempat tinggal',
    operationalDefinition: 'Alamat resmi tempat tinggal pasien sesuai identitas KTP/KK',
    reference: 'Dukcapil Kemendagri'
  },
  {
    id: 'igd_id_13',
    dataset: 'IGD',
    section: 'I. LEMBAR IDENTITAS',
    subSection: '1. Identitas Umum Pasien',
    no: 'I.1.m',
    variableName: 'Rukun Tetangga (RT)',
    dataType: 'numerik',
    formatValue: '3 digit angka',
    operationalDefinition: 'Nomor RT tempat tinggal pasien',
    reference: 'Dukcapil'
  },
  {
    id: 'igd_id_14',
    dataset: 'IGD',
    section: 'I. LEMBAR IDENTITAS',
    subSection: '1. Identitas Umum Pasien',
    no: 'I.1.n',
    variableName: 'Rukun Warga (RW)',
    dataType: 'numerik',
    formatValue: '3 digit angka',
    operationalDefinition: 'Nomor RW tempat tinggal pasien',
    reference: 'Dukcapil'
  },
  {
    id: 'igd_id_15',
    dataset: 'IGD',
    section: 'I. LEMBAR IDENTITAS',
    subSection: '1. Identitas Umum Pasien',
    no: 'I.1.o',
    variableName: 'Kelurahan / Desa',
    dataType: 'numerik',
    formatValue: 'Kode Wilayah Kemendagri',
    operationalDefinition: 'Kelurahan atau Desa tempat tinggal pasien',
    reference: 'Kode Wilayah Kemendagri'
  },
  {
    id: 'igd_id_16',
    dataset: 'IGD',
    section: 'I. LEMBAR IDENTITAS',
    subSection: '1. Identitas Umum Pasien',
    no: 'I.1.p',
    variableName: 'Kecamatan',
    dataType: 'numerik',
    formatValue: 'Kode Wilayah Kemendagri',
    operationalDefinition: 'Kecamatan tempat tinggal pasien',
    reference: 'Kode Wilayah Kemendagri'
  },
  {
    id: 'igd_id_17',
    dataset: 'IGD',
    section: 'I. LEMBAR IDENTITAS',
    subSection: '1. Identitas Umum Pasien',
    no: 'I.1.q',
    variableName: 'Kota / Kabupaten',
    dataType: 'numerik',
    formatValue: 'Kode Wilayah Kemendagri',
    operationalDefinition: 'Kabupaten atau Kota tempat tinggal pasien',
    reference: 'Kode Wilayah Kemendagri'
  },
  {
    id: 'igd_id_18',
    dataset: 'IGD',
    section: 'I. LEMBAR IDENTITAS',
    subSection: '1. Identitas Umum Pasien',
    no: 'I.1.r',
    variableName: 'Kode Pos',
    dataType: 'numerik',
    formatValue: '5 digit angka',
    operationalDefinition: 'Kode pos wilayah tempat tinggal pasien',
    reference: 'PT Pos Indonesia / Kemendagri'
  },
  {
    id: 'igd_id_19',
    dataset: 'IGD',
    section: 'I. LEMBAR IDENTITAS',
    subSection: '1. Identitas Umum Pasien',
    no: 'I.1.s',
    variableName: 'Provinsi',
    dataType: 'numerik',
    formatValue: 'Kode Wilayah Kemendagri',
    operationalDefinition: 'Provinsi tempat tinggal pasien',
    reference: 'Kode Wilayah Kemendagri'
  },
  {
    id: 'igd_id_20',
    dataset: 'IGD',
    section: 'I. LEMBAR IDENTITAS',
    subSection: '1. Identitas Umum Pasien',
    no: 'I.1.t',
    variableName: 'Negara',
    dataType: 'alphanumerik',
    formatValue: 'Kode ISO 3166',
    operationalDefinition: 'Kewarganegaraan / negara asal pasien',
    reference: 'ISO 3166'
  },
  {
    id: 'igd_id_21',
    dataset: 'IGD',
    section: 'I. LEMBAR IDENTITAS',
    subSection: '1. Identitas Umum Pasien',
    no: 'I.1.u',
    variableName: 'Alamat Domisili',
    dataType: 'alphanumerik',
    formatValue: 'sesuai standar wilayah',
    operationalDefinition: 'Alamat dimana pasien berdomisili atau tinggal saat ini jika berbeda dengan KTP',
    reference: 'Dukcapil'
  },
  {
    id: 'igd_id_22',
    dataset: 'IGD',
    section: 'I. LEMBAR IDENTITAS',
    subSection: '1. Identitas Umum Pasien',
    no: 'I.1.ae',
    variableName: 'Nomor Telepon Selular Pasien',
    dataType: 'numerik',
    formatValue: '+(kode negara) (no. telepon)',
    operationalDefinition: 'Nomor kontak pribadi (HP/WhatsApp) yang dapat dihubungi oleh RS',
    reference: 'Standar Telekomunikasi',
    required: true
  },
  {
    id: 'igd_id_23',
    dataset: 'IGD',
    section: 'I. LEMBAR IDENTITAS',
    subSection: '1. Identitas Umum Pasien',
    no: 'I.1.af',
    variableName: 'Pendidikan Terakhir',
    dataType: 'numerik',
    formatValue: '0: Tidak sekolah, 1: SD, 2: SLTP, 3: SLTA, 4: D1-D3, 5: D4, 6: S1, 7: S2, 8: S3',
    operationalDefinition: 'Pendidikan formal terakhir yang diselesaikan pasien',
    reference: 'ISCED UNESCO / BPS'
  },
  {
    id: 'igd_id_24',
    dataset: 'IGD',
    section: 'I. LEMBAR IDENTITAS',
    subSection: '1. Identitas Umum Pasien',
    no: 'I.1.ag',
    variableName: 'Pekerjaan',
    dataType: 'numerik',
    formatValue: '0: Tidak bekerja, 1: PNS, 2: TNI/POLRI, 3: BUMN, 4: Pegawai Swasta/Wirausaha, 5: Lain-lain',
    operationalDefinition: 'Pekerjaan yang sedang ditekuni pasien',
    reference: 'KBJI (Klasifikasi Baku Jabatan Indonesia)'
  },
  {
    id: 'igd_id_25',
    dataset: 'IGD',
    section: 'I. LEMBAR IDENTITAS',
    subSection: '1. Identitas Umum Pasien',
    no: 'I.1.ah',
    variableName: 'Status Pernikahan',
    dataType: 'numerik',
    formatValue: '1: Belum Kawin, 2: Kawin, 3: Cerai Hidup, 4: Cerai Mati',
    operationalDefinition: 'Status perkawinan pasien',
    reference: 'Pengadilan Agama / Dukcapil'
  },

  // =========================================================================
  // A. IGD - I. LEMBAR IDENTITAS - 2. IDENTITAS PASIEN TIDAK DIKENAL
  // =========================================================================
  {
    id: 'igd_un_01',
    dataset: 'IGD',
    section: 'I. LEMBAR IDENTITAS',
    subSection: '2. Identitas Pasien Tidak Dikenal',
    no: 'I.2.a',
    variableName: 'Perkiraan Umur',
    dataType: 'numerik',
    formatValue: '1: 0-5, 2: 6-11, 3: 12-17, 4: 18-40, 5: 41-65, 6: >65',
    operationalDefinition: 'Perkiraan rentang umur berdasarkan kondisi fisiologis pasien yang ditemukan tanpa identitas',
    reference: 'WHO Guidelines'
  },
  {
    id: 'igd_un_02',
    dataset: 'IGD',
    section: 'I. LEMBAR IDENTITAS',
    subSection: '2. Identitas Pasien Tidak Dikenal',
    no: 'I.2.b',
    variableName: 'Lokasi Ditemukan',
    dataType: 'alphabet',
    formatValue: 'nama jalan; daerah administrasi',
    operationalDefinition: 'Lokasi dimana pasien ditemukan oleh penolong/pengantar',
    reference: 'Standar Laporan Kepolisian / SAR'
  },
  {
    id: 'igd_un_03',
    dataset: 'IGD',
    section: 'I. LEMBAR IDENTITAS',
    subSection: '2. Identitas Pasien Tidak Dikenal',
    no: 'I.2.c',
    variableName: 'Tanggal & Waktu Ditemukan',
    dataType: 'tanggal, waktu',
    formatValue: 'DD/MM/YYYY jam:menit:detik',
    operationalDefinition: 'Waktu saat pasien ditemukan oleh penolong/pengantar',
    reference: 'Catatan Medis Gawat Darurat'
  },
  {
    id: 'igd_un_04',
    dataset: 'IGD',
    section: 'I. LEMBAR IDENTITAS',
    subSection: '2. Identitas Pasien Tidak Dikenal',
    no: 'I.2.d.1',
    variableName: 'Nama Penanggung Jawab Pasien',
    dataType: 'karakter',
    formatValue: 'sesuai identitas / belum ada',
    operationalDefinition: 'Nama lengkap orang yang bertanggung jawab terhadap pembiayaan dan persetujuan tindakan pasien',
    reference: 'Kemenkes'
  },
  {
    id: 'igd_un_05',
    dataset: 'IGD',
    section: 'I. LEMBAR IDENTITAS',
    subSection: '2. Identitas Pasien Tidak Dikenal',
    no: 'I.2.d.3',
    variableName: 'Hubungan Penanggung Jawab dengan Pasien',
    dataType: 'numerik',
    formatValue: '1: Diri Sendiri, 2: Orang Tua, 3: Anak, 4: Suami/Istri, 5: Kerabat/Saudara, 6: Lain-lain',
    operationalDefinition: 'Status hubungan penanggung jawab dengan pasien',
    reference: 'Standar Administrasi RS'
  },
  {
    id: 'igd_un_06',
    dataset: 'IGD',
    section: 'I. LEMBAR IDENTITAS',
    subSection: '2. Identitas Pasien Tidak Dikenal',
    no: 'I.2.e.1',
    variableName: 'Nama & No Kontak Pengantar Pasien',
    dataType: 'karakter',
    formatValue: 'nama & +(kode negara) (no. telp)',
    operationalDefinition: 'Nama lengkap orang yang mengantar pasien ke IGD dan nomor telepon yang dapat dihubungi',
    reference: 'Prosedur Gawat Darurat'
  },

  // =========================================================================
  // BAYI BARU LAHIR (NEONATUS)
  // =========================================================================
  {
    id: 'bbl_01',
    dataset: 'Bayi Baru Lahir',
    section: 'I. LEMBAR IDENTITAS',
    subSection: '3. Identitas Bayi Baru Lahir',
    no: 'I.3.a',
    variableName: 'Nama Bayi',
    dataType: 'karakter',
    formatValue: 'bayi diikuti nama ibu (bayi Ny. ...)',
    operationalDefinition: 'Nama sementara berupa keterangan tulisan "bayi" yang diikuti nama lengkap ibu sesuai KTP',
    reference: 'Standar RME Neonatal',
    required: true
  },
  {
    id: 'bbl_02',
    dataset: 'Bayi Baru Lahir',
    section: 'I. LEMBAR IDENTITAS',
    subSection: '3. Identitas Bayi Baru Lahir',
    no: 'I.3.b',
    variableName: 'NIK Ibu Kandung',
    dataType: 'numerik',
    formatValue: '16 digit sesuai NIK / 9999999999999999',
    operationalDefinition: 'Nomor Induk Kependudukan ibu kandung yang melahirkan',
    reference: 'Dukcapil',
    required: true
  },
  {
    id: 'bbl_03',
    dataset: 'Bayi Baru Lahir',
    section: 'I. LEMBAR IDENTITAS',
    subSection: '3. Identitas Bayi Baru Lahir',
    no: 'I.3.c',
    variableName: 'Nomor Rekam Medis Bayi',
    dataType: 'karakter',
    formatValue: 'sistem penomoran unit RS (6 digit)',
    operationalDefinition: 'Nomor rekam medis tersendiri untuk bayi baru lahir',
    reference: 'PMK No. 24/2022',
    required: true
  },
  {
    id: 'bbl_04',
    dataset: 'Bayi Baru Lahir',
    section: 'I. LEMBAR IDENTITAS',
    subSection: '3. Identitas Bayi Baru Lahir',
    no: 'I.3.d',
    variableName: 'Tanggal Lahir Bayi',
    dataType: 'tanggal, waktu',
    formatValue: 'DD/MM/YYYY',
    operationalDefinition: 'Tanggal kelahiran bayi baru lahir',
    reference: 'Akta Kelahiran / Partograf',
    required: true
  },
  {
    id: 'bbl_05',
    dataset: 'Bayi Baru Lahir',
    section: 'I. LEMBAR IDENTITAS',
    subSection: '3. Identitas Bayi Baru Lahir',
    no: 'I.3.e',
    variableName: 'Jam Lahir',
    dataType: 'numerik',
    formatValue: 'jam:menit:detik (24 jam)',
    operationalDefinition: 'Waktu presisi saat bayi lahir',
    reference: 'Partograf',
    required: true
  },
  {
    id: 'bbl_06',
    dataset: 'Bayi Baru Lahir',
    section: 'I. LEMBAR IDENTITAS',
    subSection: '3. Identitas Bayi Baru Lahir',
    no: 'I.3.f',
    variableName: 'Jenis Kelamin Bayi',
    dataType: 'alphanumerik',
    formatValue: '0: Tidak diketahui, 1: Laki-laki, 2: Perempuan, 3: Ambiguous/Tidak dapat ditentukan',
    operationalDefinition: 'Jenis kelamin fisik bayi baru lahir',
    reference: 'Standar WHO / Kemenkes',
    required: true
  },

  // =========================================================================
  // II. CARA PEMBAYARAN & III. GENERAL CONSENT
  // =========================================================================
  {
    id: 'pay_01',
    dataset: 'IGD',
    section: 'II. CARA PEMBAYARAN',
    subSection: 'Metode Penjaminan',
    no: 'II.1',
    variableName: 'Cara Pembayaran',
    dataType: 'alphanumerik',
    formatValue: '1: JKN / BPJS, 2: Mandiri (Umum), 3: Asuransi Lainnya / Perusahaan',
    operationalDefinition: 'Metode pembiayaan yang digunakan pasien untuk pelayanan rawat jalan, IGD, atau rawat inap',
    reference: 'BPJS Kesehatan / Permenkes',
    required: true
  },
  {
    id: 'gc_01',
    dataset: 'IGD',
    section: 'III. GENERAL CONSENT',
    subSection: 'Persetujuan Umum Pelayanan',
    no: 'III.4.a-f',
    variableName: 'Persetujuan Informasi & Tata Tertib Pasien',
    dataType: 'alphabet',
    formatValue: 'Setuju / Tidak Setuju (Ya/Tidak)',
    operationalDefinition: 'Pernyataan persetujuan atas hak & kewajiban, ketentuan pembayaran, tata tertib, rohaniawan, penerjemah, dan pelepasan rahasia medis',
    reference: 'PMK No. 24 Tahun 2022',
    required: true
  },
  {
    id: 'gc_02',
    dataset: 'IGD',
    section: 'III. GENERAL CONSENT',
    subSection: 'Pelepasan Informasi Medis',
    no: 'III.4.f.1-4',
    variableName: 'Pelepasan Informasi Penjamin & Rujukan',
    dataType: 'alphabet',
    formatValue: 'Setuju / Tidak Setuju',
    operationalDefinition: 'Persetujuan pelepasan resume medis kepada penjamin BPJS/Asuransi, peserta didik kedokteran, keluarga yang ditunjuk, dan faskes rujukan',
    reference: 'UU Kesehatan & PMK 24/2022'
  },

  // =========================================================================
  // A. IGD - IV. FORMULIR IGD & TRIASE
  // =========================================================================
  {
    id: 'igd_tr_01',
    dataset: 'IGD',
    section: 'IV. FORMULIR IGD',
    subSection: 'Triase & Gawat Darurat',
    no: 'IV.3',
    variableName: 'Sarana Transportasi Kedatangan',
    dataType: 'alphanumerik',
    formatValue: '1: Ambulans, 2: Mobil, 3: Motor, 4: Lain-lain',
    operationalDefinition: 'Jenis kendaraan yang digunakan untuk mengantar pasien tiba di IGD',
    reference: 'Standar Pelayanan IGD'
  },
  {
    id: 'igd_tr_02',
    dataset: 'IGD',
    section: 'IV. FORMULIR IGD',
    subSection: 'Triase & Gawat Darurat',
    no: 'IV.5',
    variableName: 'Kondisi Pasien Tiba (Kategori Triase CTAS)',
    dataType: 'numerik',
    formatValue: '1: Resusitasi (Merah), 2: Emergency (Kuning), 3: Urgent, 4: Less Urgent (Hijau), 5: Non Urgent, 6: Death on Arrival (Hitam)',
    operationalDefinition: 'Deskripsi kegawatan klinis pasien saat tiba di IGD berdasarkan Canadian Triage and Acuity Scale (CTAS)',
    reference: 'PMK No. 47 Tahun 2018 / Modifikasi CTAS',
    required: true
  },
  {
    id: 'igd_an_01',
    dataset: 'IGD',
    section: 'IV. FORMULIR IGD',
    subSection: 'Anamnesis',
    no: 'IV.7.a-d',
    variableName: 'Anamnesis (Keluhan Utama, Riwayat Penyakit, Alergi, Obat)',
    dataType: 'karakter',
    formatValue: 'free text & kode alergi',
    operationalDefinition: 'Pencatatan keluhan utama, riwayat penyakit dahulu/sekarang, riwayat alergi obat/makanan/udara, dan obat yang sedang dikonsumsi',
    reference: 'Standar SOAP Kemenkes',
    required: true
  },
  {
    id: 'igd_as_01',
    dataset: 'IGD',
    section: 'IV. FORMULIR IGD',
    subSection: 'Asesmen Awal IGD',
    no: 'IV.8.a',
    variableName: 'Asesmen Nyeri (NRS / BPS / NIPS / VAS)',
    dataType: 'alphanumerik',
    formatValue: 'Skala 0 - 10, lokasi, penyebab, durasi, frekuensi',
    operationalDefinition: 'Konversi derajat nyeri pasien ke dalam skala terukur terstandar (Numeric Rating Scale / Baker Pain Scale / Neonatal Infant Pain Scale)',
    reference: 'Numeric Rating Scale (NRS) / WHO'
  },
  {
    id: 'igd_as_02',
    dataset: 'IGD',
    section: 'IV. FORMULIR IGD',
    subSection: 'Asesmen Awal IGD',
    no: 'IV.8.b',
    variableName: 'Kajian Risiko Jatuh (Morse / Humpty Dumpty / Edmonson)',
    dataType: 'alphanumerik',
    formatValue: 'Morse (0-24 Rendah, 25-44 Sedang, >45 Tinggi) / Humpty Dumpty (7-11 Rendah, >12 Tinggi)',
    operationalDefinition: 'Penilaian risiko jatuh pasien dengan parameter riwayat jatuh, diagnosis sekunder, alat bantu jalan, terapi IV, gaya berjalan, status mental',
    reference: 'Morse Fall Scale / Humpty Dumpty'
  },
  {
    id: 'igd_as_03',
    dataset: 'IGD',
    section: 'IV. FORMULIR IGD',
    subSection: 'Pemeriksaan Fisik 32 Regio',
    no: 'IV.8.c (1-32)',
    variableName: 'Pemeriksaan Fisik Anatomi Tubuh (32 Regio Lengkap)',
    dataType: 'alphanumerik',
    formatValue: 'sebutkan kelainan / TAK (Tidak Ada Kelainan) / Tidak Diperiksa',
    operationalDefinition: 'Inspeksi, palpasi, perkusi, auskultasi 32 bagian tubuh: Kepala, Mata, Telinga, Hidung, Rambut, Bibir, Gigi, Lidah, Langit-langit, Leher, Tenggorokan, Tonsil, Dada, Payudara, Punggung, Perut, Genital, Anus, Lengan atas/bawah, Jari tangan, Kuku, Sendi tangan, Tungkai atas/bawah, Jari kaki, Sendi kaki',
    reference: 'Kamus Data Pusdatin / SISRUTE',
    required: true
  },
  {
    id: 'igd_as_04',
    dataset: 'IGD',
    section: 'IV. FORMULIR IGD',
    subSection: 'Tanda-Tanda Vital & Kesadaran',
    no: 'IV.8.c.2',
    variableName: 'Keadaan Umum, Tingkat Kesadaran EWS & Vital Sign',
    dataType: 'alphanumerik',
    formatValue: 'Kesadaran EWS 0-5, HR (x/mnt), RR (x/mnt), Sistole (mmHg), Diastole (mmHg), Suhu (°C), SpO2 (%)',
    operationalDefinition: 'Pemeriksaan fungsi fisiologis tubuh utama untuk Early Warning System dan deteksi kegawatan dini',
    reference: 'National Early Warning Score (NEWS 2)',
    required: true
  },
  {
    id: 'igd_dx_01',
    dataset: 'IGD',
    section: 'IV. FORMULIR IGD',
    subSection: 'Diagnosis Medis',
    no: 'IV.17.a-b',
    variableName: 'Diagnosis Awal / Masuk & Kerja (ICD-10 & ICD-9-CM)',
    dataType: 'karakter',
    formatValue: 'free text & kode resmi ICD-10 / ICD-9-CM',
    operationalDefinition: 'Keputusan klinis DPJP dalam menentukan diagnosis primer, sekunder, dan tindakan medis terstandardisasi',
    reference: 'ICD-10 & ICD-9-CM WHO / Kemenkes',
    required: true
  },
  {
    id: 'igd_ic_01',
    dataset: 'IGD',
    section: 'IV. FORMULIR IGD',
    subSection: 'Informed Consent',
    no: 'IV.18.a-j',
    variableName: 'Persetujuan / Penolakan Tindakan Medis Kedokteran',
    dataType: 'alphanumerik',
    formatValue: 'Tindakan, konsekuensi, Setuju/Tolak, TTD Dokter, Pasien/Keluarga, Saksi 1 & Saksi 2',
    operationalDefinition: 'Dokumen bukti penjelasan risiko/keuntungan dan persetujuan/penolakan atas tindakan invasif/operatif yang akan dilakukan',
    reference: 'PMK No. 290 Tahun 2008',
    required: true
  },
  {
    id: 'igd_rx_01',
    dataset: 'IGD',
    section: 'IV. FORMULIR IGD',
    subSection: 'Terapi & Peresepan Obat',
    no: 'IV.19.b (1-20)',
    variableName: 'Peresepan Elektronik & Pengkajian Resep 7 Tepat',
    dataType: 'alphanumerik',
    formatValue: 'ID Resep, Nama Obat, ID Obat KFA, Sediaan, Jumlah, Rute, Dosis, Frekuensi, Skrining Farmasi',
    operationalDefinition: 'Pemberian obat terintegrasi rekam medis dengan verifikasi 7 benar/tepat kefarmasian, interaksi obat, dan pencegahan ROTD',
    reference: 'PMK No. 72 Tahun 2016 (Standar Pelayanan Kefarmasian)',
    required: true
  },

  // =========================================================================
  // B. RAWAT JALAN & C. RAWAT INAP
  // =========================================================================
  {
    id: 'rj_01',
    dataset: 'Rawat Jalan',
    section: 'IV. ASESMEN AWAL RAWAT JALAN',
    subSection: 'Anamnesis & Fisik Poliklinik',
    no: 'IV.1-2',
    variableName: 'Asesmen Medis & Keperawatan Rawat Jalan Poliklinik',
    dataType: 'alphanumerik',
    formatValue: 'Keluhan, Riwayat, Fisik 32 regio, Vital Sign, Psikososial-Spiritual',
    operationalDefinition: 'Asesmen komprehensif pasien poliklinik rawat jalan untuk penegakan diagnosis kerja spesialis',
    reference: 'PMK No. 24 Tahun 2022',
    required: true
  },
  {
    id: 'rj_02',
    dataset: 'Rawat Jalan',
    section: 'V. PEMERIKSAAN SPESIALISTIK',
    subSection: 'Rencana Tata Laksana & Edukasi',
    no: 'V.1-8',
    variableName: 'Pemeriksaan Spesialistik, Diagnosis Akhir Primer/Sekunder & Rencana Rawat',
    dataType: 'alphanumerik',
    formatValue: 'Diagnosis ICD-10, ICD-9-CM, Rencana Terapi, Edukasi Pasien, Discharge Plan',
    operationalDefinition: 'Diagnosis spesialis akhir dan perencanaan tindak lanjut rawat jalan atau rujukan ke rawat inap',
    reference: 'Standar Pelayanan Medis / P2JK'
  },
  {
    id: 'ri_01',
    dataset: 'Rawat Inap',
    section: 'IV. FORMULIR RAWAT INAP',
    subSection: 'Catatan Perkembangan Terintegrasi (CPPT)',
    no: 'IV.1-15',
    variableName: 'Asesmen Rawat Inap & CPPT Terintegrasi (SOAP DPJP / Perawat / PPA)',
    dataType: 'karakter',
    formatValue: 'Subjective, Objective, Assessment, Plan, Instruksi PPA, Tanda Tangan Digital',
    operationalDefinition: 'Dokumentasi perkembangan klinis pasien rawat inap yang diisi secara kolaboratif oleh DPJP, perawat, apoteker, dan gizi',
    reference: 'Standar Akreditasi KARS / Kemkes',
    required: true
  },
  {
    id: 'ri_02',
    dataset: 'Rawat Inap',
    section: 'IV. FORMULIR RAWAT INAP',
    subSection: 'Perencanaan Pulang Pasien',
    no: 'IV.2',
    variableName: 'Discharge Planning (Perencanaan Pemulangan Pasien)',
    dataType: 'alphanumerik',
    formatValue: '1: Lansia, 2: Gangguan gerak, 3: Perawatan panjang, 4: Bantuan harian, 5: Tidak masuk kriteria',
    operationalDefinition: 'Serangkaian keputusan dan koordinasi asuhan keperawatan dan medis berkelanjutan ketika pasien pulang dari RS',
    reference: 'SNARS / Kemenkes'
  },

  // =========================================================================
  // D. LABORATORIUM (33 VARIABEL LENGKAP)
  // =========================================================================
  {
    id: 'lab_01',
    dataset: 'Laboratorium',
    section: '1. LABORATORIUM',
    subSection: 'Identifikasi Permintaan Lab',
    no: '1.a-d',
    variableName: 'Nomor Registrasi Lab, Nomor IHS Pasien, NIK & ID Pelanggan',
    dataType: 'alphanumerik',
    formatValue: 'No Reg, IHS (P+11 digit), 16 digit NIK, ID Lab',
    operationalDefinition: 'Identitas resmi pasien dan registrasi spesimen laboratorium yang terhubung dengan platform SatuSehat Kemenkes',
    reference: 'SatuSehat / Kemenkes RI',
    required: true
  },
  {
    id: 'lab_02',
    dataset: 'Laboratorium',
    section: '1. LABORATORIUM',
    subSection: 'Spesimen Klinis',
    no: '1.i.12-16',
    variableName: 'Asal Sumber Spesimen & Metode Pengambilan',
    dataType: 'numerik',
    formatValue: '1: Darah, 2: Urin, 3: Feses, 4: Jaringan, 5: Cairan tubuh / sekret. Eksisi, biopsi, aspirasi',
    operationalDefinition: 'Jenis spesimen biologis, volume (ml), lokasi pengambilan, dan teknik pengambilan sampel pasien',
    reference: 'Standar Laboratorium Kesehatan'
  },
  {
    id: 'lab_03',
    dataset: 'Laboratorium',
    section: '1. LABORATORIUM',
    subSection: 'Hasil Pemeriksaan & Validasi',
    no: '1.i.27-30',
    variableName: 'Hasil Pemeriksaan, Nilai Rujukan, Nilai Kritis & Validasi Dokter Sp.PK',
    dataType: 'alphanumerik',
    formatValue: 'Nilai hasil, Nilai Rujukan, Normal / Tidak Normal, Nilai Kritis (<30 mnt), TTD Dokter Sp.PK',
    operationalDefinition: 'Hasil kuantitatif/kualitatif tes laboratorium dengan pelaporan otomatis nilai kritis darurat dan verifikasi dokter spesialis patologi klinik',
    reference: 'SOP Nilai Kritis RS / Kemenkes',
    required: true
  },

  // =========================================================================
  // E. APOTEK / FARMASI (PERESEPAN & DISPENSING)
  // =========================================================================
  {
    id: 'apt_01',
    dataset: 'Apotek',
    section: '1. PERESEPAN',
    subSection: 'Identitas Obat & Dosis Pasien',
    no: '1.a-o',
    variableName: 'Data Peresepan Obat Lengkap (KFA, BSA, Sediaan, Aturan Pakai)',
    dataType: 'alphanumerik',
    formatValue: 'No RM, IHS, ID Resep, Nama Obat, ID Obat KFA, BSA (m2), Sediaan, Rute, Dosis, Frekuensi',
    operationalDefinition: 'Resep obat elektronik terstruktur yang terintegrasi dengan Kamus Farmasi dan Alat Kesehatan (KFA) Kemenkes',
    reference: 'Kamus Farmasi dan Alkes (KFA) Kemenkes',
    required: true
  },
  {
    id: 'apt_02',
    dataset: 'Apotek',
    section: '1. PERESEPAN',
    subSection: 'Pengkajian Resep 7 Tepat',
    no: '1.ad.1-3',
    variableName: 'Pengkajian Resep (Administrasi, Farmasetik, Klinis)',
    dataType: 'numerik',
    formatValue: 'Skrining Administrasi, Farmasetik (Dosis/Stabilitas), Klinis (Interaksi Obat, Duplikasi, ROTD, Kontraindikasi)',
    operationalDefinition: 'Kajian aspek farmasi oleh Apoteker terkait keselamatan peresepan sebelum dispensing obat',
    reference: 'PMK No. 72 Tahun 2016',
    required: true
  },
  {
    id: 'apt_03',
    dataset: 'Apotek',
    section: '2. DISPENSING',
    subSection: 'Penyerahan Obat & Etiket',
    no: '2.a-e',
    variableName: 'Dispensing, Etiket Obat & Waktu Penyerahan Pasien',
    dataType: 'alphanumerik',
    formatValue: 'Waktu penyiapan, Waktu penyerahan, Petugas Dispensing, Etiket Pasien 5 Elemen',
    operationalDefinition: 'Dokumentasi penyiapan racikan, pelabelan etiket (Nama, Tgl Lahir, Obat, Aturan Pakai), dan penyerahan obat kepada pasien',
    reference: 'Standar Pelayanan Kefarmasian'
  }
];
