import { MasterRuangan, MasterBed, MasterDokter, MasterPoli, DoctorPoliMapping } from '../types';
import { MASTER_POLIKLINIK } from './poliklinikData';

// ============================================================
// 1. INITIAL MASTER RUANGAN (10 RUANGAN RS LENGKAP)
// ============================================================
export const INITIAL_MASTER_RUANGAN: MasterRuangan[] = [
  {
    id: 'RNG-MWR',
    kode: 'RNG-MWR-01',
    nama: 'Bangsal Mawar (Penyakit Dalam)',
    jenis: 'Rawat Inap',
    lokasi: 'Gedung A - Lantai 2',
    kapasitas: 8,
    status: 'Aktif',
    deskripsi: 'Ruang perawatan rawat inap penyakit dalam & metabolik dewasa',
    fasilitas: ['Oksigen Sentral', 'Nurse Call', 'Kamar Mandi Dalam', 'AC', 'Bedside Cabinet']
  },
  {
    id: 'RNG-MLT',
    kode: 'RNG-MLT-02',
    nama: 'Bangsal Melati (Bedah Umum)',
    jenis: 'Rawat Inap',
    lokasi: 'Gedung B - Lantai 3',
    kapasitas: 6,
    status: 'Aktif',
    deskripsi: 'Ruang perawatan pasien pre & post operasi bedah umum',
    fasilitas: ['Suction Unit', 'Oksigen Sentral', 'Infus Pump', 'AC', 'Nurse Call']
  },
  {
    id: 'RNG-AGR',
    kode: 'RNG-AGR-03',
    nama: 'Bangsal Anggrek (Kebidanan & Kandungan)',
    jenis: 'Rawat Inap',
    lokasi: 'Gedung A - Lantai 2',
    kapasitas: 4,
    status: 'Aktif',
    deskripsi: 'Ruang perawatan maternal, nifas, dan kandungan (Obgyn)',
    fasilitas: ['Baby Bassinet', 'Kamar Mandi Air Hangat', 'Oksigen Sentral', 'AC']
  },
  {
    id: 'RNG-DHL',
    kode: 'RNG-DHL-04',
    nama: 'Bangsal Dahlia (Pediatrik / Anak)',
    jenis: 'Rawat Inap',
    lokasi: 'Gedung C - Lantai 3',
    kapasitas: 4,
    status: 'Aktif',
    deskripsi: 'Ruang perawatan khusus anak ramah lingkungan & bermain',
    fasilitas: ['Bed Pediatrik', 'Area Bermain Anak', 'Oksigen Sentral', 'Nebulizer Set']
  },
  {
    id: 'RNG-CMP',
    kode: 'RNG-CMP-05',
    nama: 'Bangsal Cempaka (Saraf & Jantung)',
    jenis: 'Rawat Inap',
    lokasi: 'Gedung B - Lantai 4',
    kapasitas: 4,
    status: 'Aktif',
    deskripsi: 'Ruang perawatan neurologi & monitoring kardiovaskular sub-akut',
    fasilitas: ['Bedside Monitor', 'Defibrillator Ready', 'Oksigen Sentral', 'AC']
  },
  {
    id: 'RNG-VIP',
    kode: 'RNG-VIP-06',
    nama: 'Ruang VIP Edelweiss',
    jenis: 'Rawat Inap',
    lokasi: 'Gedung Utama - Lantai 5',
    kapasitas: 4,
    status: 'Aktif',
    deskripsi: 'Kamar perawatan privat eksekutif fasilitas lengkap bintang lima',
    fasilitas: ['Smart TV', 'Kulkas Mini', 'Sofa Bed Keluarga', 'Kamar Mandi Mewah', 'Wi-Fi']
  },
  {
    id: 'RNG-VVIP',
    kode: 'RNG-VVIP-07',
    nama: 'Ruang VVIP Wijayakusuma',
    jenis: 'Rawat Inap',
    lokasi: 'Gedung Utama - Lantai 5',
    kapasitas: 2,
    status: 'Aktif',
    deskripsi: 'Presidential Suite Room dengan ruang tamu terpisah & pantry privat',
    fasilitas: ['Living Room', 'Microwave', 'Dining Table', 'Smart Bed Elektrik', 'Balkon Pribadi']
  },
  {
    id: 'RNG-ICU',
    kode: 'RNG-ICU-08',
    nama: 'Ruang Perawatan Intensif (ICU)',
    jenis: 'ICU',
    lokasi: 'Gedung Medik Sentral - Lantai 2',
    kapasitas: 4,
    status: 'Aktif',
    deskripsi: 'Intensive Care Unit dengan dukungan ventilator invasif & hemodinamik',
    fasilitas: ['Ventilator Mekanik', 'Syringe Pump', 'Hemodialisis Point', 'Defibrillator', 'CCTV 24 Jam']
  },
  {
    id: 'RNG-NICU',
    kode: 'RNG-NICU-09',
    nama: 'Ruang Perawatan Intensif Neonatus (NICU)',
    jenis: 'NICU',
    lokasi: 'Gedung Medik Sentral - Lantai 2',
    kapasitas: 3,
    status: 'Aktif',
    deskripsi: 'Perawatan intensif bayi baru lahir kritis dan prematur',
    fasilitas: ['Inkubator Transport & Statis', 'CPAP Neonatus', 'Phototherapy Unit', 'Infant Warmer']
  },
  {
    id: 'RNG-ISO',
    kode: 'RNG-ISO-10',
    nama: 'Ruang Isolasi Tekanan Negatif',
    jenis: 'Isolasi',
    lokasi: 'Gedung Khusus Infeksi - Lantai 1',
    kapasitas: 2,
    status: 'Aktif',
    deskripsi: 'Kamar isolasi penyakit infeksius airborne dengan HEPA filter bertekanan negatif',
    fasilitas: ['HEPA Filter Sentral', 'Anteroom Air Lock', 'Intercom Medis', 'Pressure Gauge Digital']
  }
];

// ============================================================
// 2. INITIAL MASTER POLI (21 POLIKLINIK DARI SISTEM RS)
// ============================================================
export const INITIAL_MASTER_POLI: MasterPoli[] = MASTER_POLIKLINIK.map((p, idx) => {
  const poliCodeMap: Record<string, string> = {
    'Poliklinik Penyakit Dalam': 'POL-PD',
    'Poliklinik Anak': 'POL-ANAK',
    'Poliklinik Bedah Umum': 'POL-BEDAH',
    'Poliklinik Obstetri dan Ginekologi': 'POL-OBGYN',
    'Poliklinik Mata': 'POL-MATA',
    'Poliklinik THT-KL': 'POL-THT',
    'Poliklinik Jantung dan Pembuluh Darah': 'POL-JANTUNG',
    'Poliklinik Paru': 'POL-PARU',
    'Poliklinik Saraf': 'POL-SARAF',
    'Poliklinik Kulit dan Kelamin': 'POL-DV',
    'Poliklinik Kedokteran Jiwa': 'POL-JIWA',
    'Poliklinik Ortopedi dan Traumatologi': 'POL-OT',
    'Poliklinik Urologi': 'POL-URO',
    'Poliklinik Bedah Saraf': 'POL-BS',
    'Poliklinik Bedah Mulut dan Maksilofasial': 'POL-BMM',
    'Poliklinik Konservasi Gigi': 'POL-KG',
    'Poliklinik Periodonsia': 'POL-PERIO',
    'Poliklinik Rehabilitasi Medik': 'POL-KFR',
    'Pelayanan Anestesiologi dan Terapi Intensif': 'POL-ANESTESI',
    'Pelayanan Radiologi': 'POL-RAD',
    'Pelayanan Patologi Klinik': 'POL-PK'
  };

  const code = poliCodeMap[p.name] || `POL-${String(idx + 1).padStart(2, '0')}`;
  const lokasiFloor = idx < 6 ? 'Gedung Rawat Jalan - Lantai 1' : idx < 14 ? 'Gedung Rawat Jalan - Lantai 2' : 'Gedung Diagnostik & Penunjang - Lantai 1';

  return {
    id: code,
    kode: code,
    nama: p.name,
    kelompokLayanan: p.kelompokLayanan,
    lokasi: lokasiFloor,
    jamPelayanan: 'Senin - Sabtu (08:00 - 16:00 WIB)',
    status: 'Aktif',
    deskripsi: `Layanan spesialisasi ${p.name} dengan dokter subspesialis dan peralatan diagnostik modern.`
  };
});

// ============================================================
// 3. INITIAL MASTER DOKTER (63 DOKTER SPESIALIS RESMI RS)
// ============================================================
export const INITIAL_MASTER_DOKTER: MasterDokter[] = (() => {
  const doctorList: MasterDokter[] = [];
  const nikBase = 3174051000000000;
  const strBase = 1122334455;
  const phoneBase = 81280001000;
  let counter = 1;

  MASTER_POLIKLINIK.forEach(p => {
    p.doctors.forEach(d => {
      const isFemale = d.name.toLowerCase().includes('ratna') ||
        d.name.toLowerCase().includes('nabila') ||
        d.name.toLowerCase().includes('sinta') ||
        d.name.toLowerCase().includes('maya') ||
        d.name.toLowerCase().includes('dewi') ||
        d.name.toLowerCase().includes('citra') ||
        d.name.toLowerCase().includes('rachel') ||
        d.name.toLowerCase().includes('dian') ||
        d.name.toLowerCase().includes('kartika') ||
        d.name.toLowerCase().includes('nadia') ||
        d.name.toLowerCase().includes('claudia') ||
        d.name.toLowerCase().includes('tiara') ||
        d.name.toLowerCase().includes('putri') ||
        d.name.toLowerCase().includes('hana') ||
        d.name.toLowerCase().includes('ayu') ||
        d.name.toLowerCase().includes('rossa') ||
        d.name.toLowerCase().includes('wulan') ||
        d.name.toLowerCase().includes('intan') ||
        d.name.toLowerCase().includes('fani') ||
        d.name.toLowerCase().includes('niken') ||
        d.name.toLowerCase().includes('hani') ||
        d.name.toLowerCase().includes('amalia') ||
        d.name.toLowerCase().includes('diah') ||
        d.name.toLowerCase().includes('monica');

      doctorList.push({
        id: d.id,
        nama: d.name,
        nik: String(nikBase + counter),
        strSip: `STR-${strBase + counter}/KONSIL/2026`,
        spesialisasi: d.specialty,
        telepon: `0${phoneBase + counter}`,
        email: `${d.id.toLowerCase().replace(/_/g, '.')}@rs.esaunggul.ac.id`,
        status: 'Aktif',
        gender: isFemale ? 'P' : 'L',
        jadwalUmum: 'Pagi & Siang'
      });
      counter++;
    });
  });

  return doctorList;
})();

// ============================================================
// 4. INITIAL PENEMPATAN DOKTER KE POLI (MAPPING MANY-TO-MANY)
// ============================================================
export const INITIAL_DOCTOR_POLI_MAPPINGS: DoctorPoliMapping[] = (() => {
  const mappings: DoctorPoliMapping[] = [];
  let mapIdCounter = 1;

  const schedules = [
    { days: ['Senin', 'Rabu', 'Jumat'], start: '08:00', end: '12:00' },
    { days: ['Selasa', 'Kamis', 'Sabtu'], start: '08:00', end: '12:00' },
    { days: ['Senin', 'Selasa', 'Kamis'], start: '13:00', end: '16:00' }
  ];

  MASTER_POLIKLINIK.forEach(p => {
    const poliCodeMap: Record<string, string> = {
      'Poliklinik Penyakit Dalam': 'POL-PD',
      'Poliklinik Anak': 'POL-ANAK',
      'Poliklinik Bedah Umum': 'POL-BEDAH',
      'Poliklinik Obstetri dan Ginekologi': 'POL-OBGYN',
      'Poliklinik Mata': 'POL-MATA',
      'Poliklinik THT-KL': 'POL-THT',
      'Poliklinik Jantung dan Pembuluh Darah': 'POL-JANTUNG',
      'Poliklinik Paru': 'POL-PARU',
      'Poliklinik Saraf': 'POL-SARAF',
      'Poliklinik Kulit dan Kelamin': 'POL-DV',
      'Poliklinik Kedokteran Jiwa': 'POL-JIWA',
      'Poliklinik Ortopedi dan Traumatologi': 'POL-OT',
      'Poliklinik Urologi': 'POL-URO',
      'Poliklinik Bedah Saraf': 'POL-BS',
      'Poliklinik Bedah Mulut dan Maksilofasial': 'POL-BMM',
      'Poliklinik Konservasi Gigi': 'POL-KG',
      'Poliklinik Periodonsia': 'POL-PERIO',
      'Poliklinik Rehabilitasi Medik': 'POL-KFR',
      'Pelayanan Anestesiologi dan Terapi Intensif': 'POL-ANESTESI',
      'Pelayanan Radiologi': 'POL-RAD',
      'Pelayanan Patologi Klinik': 'POL-PK'
    };
    const poliId = poliCodeMap[p.name] || 'POL-PD';

    p.doctors.forEach((doc, dIdx) => {
      const sched = schedules[dIdx % schedules.length];
      mappings.push({
        id: `MAP-${String(mapIdCounter).padStart(3, '0')}`,
        doctorId: doc.id,
        doctorName: doc.name,
        poliId: poliId,
        poliName: p.name,
        jadwalPraktik: `${sched.days.join(', ')} (${sched.start} - ${sched.end} WIB)`,
        hariPraktik: sched.days,
        jamMulai: sched.start,
        jamSelesai: sched.end,
        status: 'Aktif',
        catatan: 'Penugasan reguler poliklinik rawat jalan'
      });
      mapIdCounter++;
    });
  });

  // Contoh penempatan multi-poli (1 dokter di 2 poli):
  // dr. Andika Pratama Sp.PD juga praktik di Poliklinik Geriatri / Penyakit Dalam Khusus
  mappings.push({
    id: `MAP-${String(mapIdCounter).padStart(3, '0')}`,
    doctorId: 'DOC_PD_1',
    doctorName: 'dr. Andika Pratama, Sp.PD',
    poliId: 'POL-JANTUNG',
    poliName: 'Poliklinik Jantung dan Pembuluh Darah',
    jadwalPraktik: 'Selasa & Kamis (13:00 - 16:00 WIB)',
    hariPraktik: ['Selasa', 'Kamis'],
    jamMulai: '13:00',
    jamSelesai: '16:00',
    status: 'Aktif',
    catatan: 'Konsultasi kardiometabolik & hipertensi terpadu'
  });

  return mappings;
})();

// ============================================================
// 5. INITIAL MASTER BEDS (25 BEDS DENGAN BOR IDEAL KEMENKES 72%)
// ============================================================
// Total 25 beds: 18 Terisi (Occupied), 5 Tersedia, 2 Maintenance
// 18 / 25 = 72% BOR -> Tepat di rentang ideal Kemenkes (60% - 85%)
export const INITIAL_MASTER_BEDS: MasterBed[] = [
  // Bangsal Mawar (8 Beds) - Kapasitas: 8
  {
    id: 'MWR-101-A',
    kode: 'MWR-101-A',
    nama: 'Kamar 101 - Bed A',
    ruanganId: 'RNG-MWR',
    ruanganNama: 'Bangsal Mawar (Penyakit Dalam)',
    kelas: 'Kelas 1',
    statusOperasional: 'Terisi',
    patientId: '000001',
    pasienNama: 'Tn. Budi Santoso',
    status: 'Aktif',
    catatan: 'Kamar lantai 2 sisi timur'
  },
  {
    id: 'MWR-101-B',
    kode: 'MWR-101-B',
    nama: 'Kamar 101 - Bed B',
    ruanganId: 'RNG-MWR',
    ruanganNama: 'Bangsal Mawar (Penyakit Dalam)',
    kelas: 'Kelas 1',
    statusOperasional: 'Terisi',
    patientId: '000007',
    pasienNama: 'Tn. Ahmad Fauzi',
    status: 'Aktif'
  },
  {
    id: 'MWR-102-A',
    kode: 'MWR-102-A',
    nama: 'Kamar 102 - Bed A',
    ruanganId: 'RNG-MWR',
    ruanganNama: 'Bangsal Mawar (Penyakit Dalam)',
    kelas: 'Kelas 1',
    statusOperasional: 'Tersedia',
    patientId: null,
    pasienNama: null,
    status: 'Aktif'
  },
  {
    id: 'MWR-102-B',
    kode: 'MWR-102-B',
    nama: 'Kamar 102 - Bed B',
    ruanganId: 'RNG-MWR',
    ruanganNama: 'Bangsal Mawar (Penyakit Dalam)',
    kelas: 'Kelas 1',
    statusOperasional: 'Dalam Perbaikan',
    patientId: null,
    pasienNama: null,
    status: 'Aktif',
    catatan: 'Sterilisasi kamar & pembersihan menyeluruh pasca discharge'
  },
  {
    id: 'MWR-201-A',
    kode: 'MWR-201-A',
    nama: 'Kamar 201 - Bed A',
    ruanganId: 'RNG-MWR',
    ruanganNama: 'Bangsal Mawar (Penyakit Dalam)',
    kelas: 'Kelas 2',
    statusOperasional: 'Terisi',
    patientId: '000002',
    pasienNama: 'Ny. Siti Aminah',
    status: 'Aktif'
  },
  {
    id: 'MWR-201-B',
    kode: 'MWR-201-B',
    nama: 'Kamar 201 - Bed B',
    ruanganId: 'RNG-MWR',
    ruanganNama: 'Bangsal Mawar (Penyakit Dalam)',
    kelas: 'Kelas 2',
    statusOperasional: 'Terisi',
    patientId: '000008',
    pasienNama: 'Ny. Halimah Dewi',
    status: 'Aktif'
  },
  {
    id: 'MWR-202-A',
    kode: 'MWR-202-A',
    nama: 'Kamar 202 - Bed A',
    ruanganId: 'RNG-MWR',
    ruanganNama: 'Bangsal Mawar (Penyakit Dalam)',
    kelas: 'Kelas 2',
    statusOperasional: 'Terisi',
    patientId: '000009',
    pasienNama: 'Tn. Hendra Gunawan',
    status: 'Aktif'
  },
  {
    id: 'MWR-202-B',
    kode: 'MWR-202-B',
    nama: 'Kamar 202 - Bed B',
    ruanganId: 'RNG-MWR',
    ruanganNama: 'Bangsal Mawar (Penyakit Dalam)',
    kelas: 'Kelas 2',
    statusOperasional: 'Terisi',
    patientId: '000010',
    pasienNama: 'Ny. Ratna Sari',
    status: 'Aktif'
  },

  // Bangsal Melati (5 Beds) - Kapasitas: 6
  {
    id: 'MLT-201-A',
    kode: 'MLT-201-A',
    nama: 'Kamar 201 - Bed A',
    ruanganId: 'RNG-MLT',
    ruanganNama: 'Bangsal Melati (Bedah Umum)',
    kelas: 'Kelas 2',
    statusOperasional: 'Terisi',
    patientId: '000003',
    pasienNama: 'Tn. Joko Widodo',
    status: 'Aktif'
  },
  {
    id: 'MLT-201-B',
    kode: 'MLT-201-B',
    nama: 'Kamar 201 - Bed B',
    ruanganId: 'RNG-MLT',
    ruanganNama: 'Bangsal Melati (Bedah Umum)',
    kelas: 'Kelas 2',
    statusOperasional: 'Terisi',
    patientId: '000011',
    pasienNama: 'Tn. Dedi Mulyadi',
    status: 'Aktif'
  },
  {
    id: 'MLT-301-A',
    kode: 'MLT-301-A',
    nama: 'Kamar 301 - Bed A',
    ruanganId: 'RNG-MLT',
    ruanganNama: 'Bangsal Melati (Bedah Umum)',
    kelas: 'Kelas 3',
    statusOperasional: 'Terisi',
    patientId: '000012',
    pasienNama: 'Tn. Bambang Soeprapto',
    status: 'Aktif'
  },
  {
    id: 'MLT-301-B',
    kode: 'MLT-301-B',
    nama: 'Kamar 301 - Bed B',
    ruanganId: 'RNG-MLT',
    ruanganNama: 'Bangsal Melati (Bedah Umum)',
    kelas: 'Kelas 3',
    statusOperasional: 'Tersedia',
    patientId: null,
    pasienNama: null,
    status: 'Aktif'
  },
  {
    id: 'MLT-301-C',
    kode: 'MLT-301-C',
    nama: 'Kamar 301 - Bed C',
    ruanganId: 'RNG-MLT',
    ruanganNama: 'Bangsal Melati (Bedah Umum)',
    kelas: 'Kelas 3',
    statusOperasional: 'Dalam Perbaikan',
    patientId: null,
    pasienNama: null,
    status: 'Aktif',
    catatan: 'Perbaikan panel oksigen sentral & tuas hidrolik'
  },

  // Bangsal Anggrek (3 Beds) - Kapasitas: 4
  {
    id: 'AGR-101-A',
    kode: 'AGR-101-A',
    nama: 'Kamar 101 - Bed A',
    ruanganId: 'RNG-AGR',
    ruanganNama: 'Bangsal Anggrek (Kebidanan & Kandungan)',
    kelas: 'Kelas 1',
    statusOperasional: 'Terisi',
    patientId: '000004',
    pasienNama: 'Ny. Maria Magdalena',
    status: 'Aktif'
  },
  {
    id: 'AGR-101-B',
    kode: 'AGR-101-B',
    nama: 'Kamar 101 - Bed B',
    ruanganId: 'RNG-AGR',
    ruanganNama: 'Bangsal Anggrek (Kebidanan & Kandungan)',
    kelas: 'Kelas 1',
    statusOperasional: 'Terisi',
    patientId: '000013',
    pasienNama: 'Ny. Nurhayati',
    status: 'Aktif'
  },
  {
    id: 'AGR-201-A',
    kode: 'AGR-201-A',
    nama: 'Kamar 201 - Bed A',
    ruanganId: 'RNG-AGR',
    ruanganNama: 'Bangsal Anggrek (Kebidanan & Kandungan)',
    kelas: 'Kelas 2',
    statusOperasional: 'Tersedia',
    patientId: null,
    pasienNama: null,
    status: 'Aktif'
  },

  // Bangsal Dahlia (2 Beds) - Kapasitas: 4
  {
    id: 'DHL-201-A',
    kode: 'DHL-201-A',
    nama: 'Kamar 201 - Bed A',
    ruanganId: 'RNG-DHL',
    ruanganNama: 'Bangsal Dahlia (Pediatrik / Anak)',
    kelas: 'Kelas 2',
    statusOperasional: 'Terisi',
    patientId: '000005',
    pasienNama: 'An. Kevin Pratama',
    status: 'Aktif'
  },
  {
    id: 'DHL-201-B',
    kode: 'DHL-201-B',
    nama: 'Kamar 201 - Bed B',
    ruanganId: 'RNG-DHL',
    ruanganNama: 'Bangsal Dahlia (Pediatrik / Anak)',
    kelas: 'Kelas 2',
    statusOperasional: 'Terisi',
    patientId: '000014',
    pasienNama: 'An. Salsabila Khairani',
    status: 'Aktif'
  },

  // Bangsal Cempaka (2 Beds) - Kapasitas: 4
  {
    id: 'CMP-101-A',
    kode: 'CMP-101-A',
    nama: 'Kamar 101 - Bed A',
    ruanganId: 'RNG-CMP',
    ruanganNama: 'Bangsal Cempaka (Saraf & Jantung)',
    kelas: 'Kelas 1',
    statusOperasional: 'Terisi',
    patientId: '000015',
    pasienNama: 'Tn. Hadi Prabowo',
    status: 'Aktif'
  },
  {
    id: 'CMP-201-A',
    kode: 'CMP-201-A',
    nama: 'Kamar 201 - Bed A',
    ruanganId: 'RNG-CMP',
    ruanganNama: 'Bangsal Cempaka (Saraf & Jantung)',
    kelas: 'Kelas 2',
    statusOperasional: 'Terisi',
    patientId: '000016',
    pasienNama: 'Ny. Endang Triastuti',
    status: 'Aktif'
  },

  // VIP Edelweiss (2 Beds) - Kapasitas: 4
  {
    id: 'VIP-EDL-01',
    kode: 'VIP-EDL-01',
    nama: 'Kamar VIP 501 - Bed Tunggal',
    ruanganId: 'RNG-VIP',
    ruanganNama: 'Ruang VIP Edelweiss',
    kelas: 'VIP',
    statusOperasional: 'Terisi',
    patientId: '000006',
    pasienNama: 'Tn. Robert Davis',
    status: 'Aktif'
  },
  {
    id: 'VIP-EDL-02',
    kode: 'VIP-EDL-02',
    nama: 'Kamar VIP 502 - Bed Tunggal',
    ruanganId: 'RNG-VIP',
    ruanganNama: 'Ruang VIP Edelweiss',
    kelas: 'VIP',
    statusOperasional: 'Terisi',
    patientId: '000017',
    pasienNama: 'Ny. Christine Kusuma',
    status: 'Aktif'
  },

  // VVIP Wijayakusuma (1 Bed) - Kapasitas: 2
  {
    id: 'VVIP-WJK-01',
    kode: 'VVIP-WJK-01',
    nama: 'Suite VVIP 508 - Bed Elektrik',
    ruanganId: 'RNG-VVIP',
    ruanganNama: 'Ruang VVIP Wijayakusuma',
    kelas: 'VVIP',
    statusOperasional: 'Tersedia',
    patientId: null,
    pasienNama: null,
    status: 'Aktif'
  },

  // ICU Unit (2 Beds) - Kapasitas: 4
  {
    id: 'ICU-01',
    kode: 'ICU-01',
    nama: 'ICU Unit - Bed 01',
    ruanganId: 'RNG-ICU',
    ruanganNama: 'Ruang Perawatan Intensif (ICU)',
    kelas: 'ICU',
    statusOperasional: 'Terisi',
    patientId: '000018',
    pasienNama: 'Tn. Sugiono Martono',
    status: 'Aktif'
  },
  {
    id: 'ICU-02',
    kode: 'ICU-02',
    nama: 'ICU Unit - Bed 02',
    ruanganId: 'RNG-ICU',
    ruanganNama: 'Ruang Perawatan Intensif (ICU)',
    kelas: 'ICU',
    statusOperasional: 'Tersedia',
    patientId: null,
    pasienNama: null,
    status: 'Aktif'
  }
];
