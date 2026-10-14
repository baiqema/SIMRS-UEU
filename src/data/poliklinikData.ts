export interface PoliklinikItem {
  no: number;
  kelompokLayanan: 'Spesialis Dasar' | 'Spesialis Lain' | 'Gigi Spesialis' | 'Penunjang Medik';
  name: string;
  kodeSpesialis: string;
  doctors: {
    id: string;
    name: string;
    specialty: string;
  }[];
}

export const MASTER_POLIKLINIK: PoliklinikItem[] = [
  {
    no: 1,
    kelompokLayanan: 'Spesialis Dasar',
    name: 'Poliklinik Penyakit Dalam',
    kodeSpesialis: 'Sp.PD',
    doctors: [
      { id: 'DOC_PD_1', name: 'dr. Andika Pratama, Sp.PD', specialty: 'Penyakit Dalam' },
      { id: 'DOC_PD_2', name: 'dr. Ratna Kusumawati, Sp.PD', specialty: 'Penyakit Dalam' },
      { id: 'DOC_PD_3', name: 'dr. Bima Adinugraha, Sp.PD', specialty: 'Penyakit Dalam' }
    ]
  },
  {
    no: 2,
    kelompokLayanan: 'Spesialis Dasar',
    name: 'Poliklinik Anak',
    kodeSpesialis: 'Sp.A',
    doctors: [
      { id: 'DOC_A_1', name: 'dr. Nabila Putri, Sp.A', specialty: 'Anak' },
      { id: 'DOC_A_2', name: 'dr. Fajar Mahendra, Sp.A', specialty: 'Anak' },
      { id: 'DOC_A_3', name: 'dr. Sinta Larasati, Sp.A', specialty: 'Anak' }
    ]
  },
  {
    no: 3,
    kelompokLayanan: 'Spesialis Dasar',
    name: 'Poliklinik Bedah Umum',
    kodeSpesialis: 'Sp.B',
    doctors: [
      { id: 'DOC_B_1', name: 'dr. Arief Wicaksana, Sp.B', specialty: 'Bedah Umum' },
      { id: 'DOC_B_2', name: 'dr. Maya Puspitasari, Sp.B', specialty: 'Bedah Umum' },
      { id: 'DOC_B_3', name: 'dr. Reza Kurniawan, Sp.B', specialty: 'Bedah Umum' }
    ]
  },
  {
    no: 4,
    kelompokLayanan: 'Spesialis Dasar',
    name: 'Poliklinik Obstetri dan Ginekologi',
    kodeSpesialis: 'Sp.OG',
    doctors: [
      { id: 'DOC_OG_1', name: 'dr. Dewi Anggraini, Sp.OG', specialty: 'Obstetri dan Ginekologi' },
      { id: 'DOC_OG_2', name: 'dr. Yoga Pranata, Sp.OG', specialty: 'Obstetri dan Ginekologi' },
      { id: 'DOC_OG_3', name: 'dr. Citra Maharani, Sp.OG', specialty: 'Obstetri dan Ginekologi' }
    ]
  },
  {
    no: 5,
    kelompokLayanan: 'Spesialis Lain',
    name: 'Poliklinik Mata',
    kodeSpesialis: 'Sp.M',
    doctors: [
      { id: 'DOC_M_1', name: 'dr. Raka Permana, Sp.M', specialty: 'Mata' },
      { id: 'DOC_M_2', name: 'dr. Indah Safitri, Sp.M', specialty: 'Mata' },
      { id: 'DOC_M_3', name: 'dr. Gita Paramesti, Sp.M', specialty: 'Mata' }
    ]
  },
  {
    no: 6,
    kelompokLayanan: 'Spesialis Lain',
    name: 'Poliklinik THT',
    kodeSpesialis: 'Sp.T.H.T',
    doctors: [
      { id: 'DOC_THT_1', name: 'dr. Dimas Nugroho, Sp.T.H.T', specialty: 'THT' },
      { id: 'DOC_THT_2', name: 'dr. Shafira Aulia, Sp.T.H.T', specialty: 'THT' },
      { id: 'DOC_THT_3', name: 'dr. Kevin Santoso, Sp.T.H.T.', specialty: 'THT' }
    ]
  },
  {
    no: 7,
    kelompokLayanan: 'Spesialis Lain',
    name: 'Poliklinik Saraf',
    kodeSpesialis: 'Sp.N',
    doctors: [
      { id: 'DOC_N_1', name: 'dr. Bagus Wiratama, Sp.N', specialty: 'Saraf' },
      { id: 'DOC_N_2', name: 'dr. Laila Rahmawati, Sp.N', specialty: 'Saraf' },
      { id: 'DOC_N_3', name: 'dr. Hendra Saputra, Sp.N', specialty: 'Saraf' }
    ]
  },
  {
    no: 8,
    kelompokLayanan: 'Spesialis Lain',
    name: 'Poliklinik Jantung dan Pembuluh Darah',
    kodeSpesialis: 'Sp.JP',
    doctors: [
      { id: 'DOC_JP_1', name: 'dr. Aditya Ramadhan, Sp.JP', specialty: 'Jantung dan Pembuluh Darah' },
      { id: 'DOC_JP_2', name: 'dr. Melati Wulandari, Sp.JP', specialty: 'Jantung dan Pembuluh Darah' },
      { id: 'DOC_JP_3', name: 'dr. Surya Dharmawan, Sp.JP', specialty: 'Jantung dan Pembuluh Darah' }
    ]
  },
  {
    no: 9,
    kelompokLayanan: 'Spesialis Lain',
    name: 'Poliklinik Dermatologi, Venereologi, dan Estetika',
    kodeSpesialis: 'Sp.D.V.E',
    doctors: [
      { id: 'DOC_DVE_1', name: 'dr. Karin Amelia, Sp.D.V.E', specialty: 'Dermatologi, Venereologi, dan Estetika' },
      { id: 'DOC_DVE_2', name: 'dr. Taufik Hidayat, Sp.D.V.E', specialty: 'Dermatologi, Venereologi, dan Estetika' },
      { id: 'DOC_DVE_3', name: 'dr. Nadia Febriani, Sp.D.V.E', specialty: 'Dermatologi, Venereologi, dan Estetika' }
    ]
  },
  {
    no: 10,
    kelompokLayanan: 'Spesialis Lain',
    name: 'Poliklinik Kedokteran Jiwa/Psikiatri',
    kodeSpesialis: 'Sp.KJ',
    doctors: [
      { id: 'DOC_KJ_1', name: 'dr. Rina Handayani, Sp.KJ', specialty: 'Kedokteran Jiwa/Psikiatri' },
      { id: 'DOC_KJ_2', name: 'dr. Ahmad Firdaus, Sp.KJ', specialty: 'Kedokteran Jiwa/Psikiatri' },
      { id: 'DOC_KJ_3', name: 'dr. Sarah Anindita, Sp.KJ', specialty: 'Kedokteran Jiwa/Psikiatri' }
    ]
  },
  {
    no: 11,
    kelompokLayanan: 'Spesialis Lain',
    name: 'Poliklinik Paru',
    kodeSpesialis: 'Sp.P',
    doctors: [
      { id: 'DOC_P_1', name: 'dr. Yudi Hartono, Sp.P', specialty: 'Paru' },
      { id: 'DOC_P_2', name: 'dr. Fitri Oktaviani, Sp.P', specialty: 'Paru' },
      { id: 'DOC_P_3', name: 'dr. Galih Pamungkas, Sp.P', specialty: 'Paru' }
    ]
  },
  {
    no: 12,
    kelompokLayanan: 'Spesialis Lain',
    name: 'Poliklinik Orthopedi dan Traumatologi',
    kodeSpesialis: 'Sp.OT',
    doctors: [
      { id: 'DOC_OT_1', name: 'dr. Doni Setiawan, Sp.OT', specialty: 'Orthopedi dan Traumatologi' },
      { id: 'DOC_OT_2', name: 'dr. Vina Marlina, Sp.OT', specialty: 'Orthopedi dan Traumatologi' },
      { id: 'DOC_OT_3', name: 'dr. Rangga Prakoso, Sp.OT', specialty: 'Orthopedi dan Traumatologi' }
    ]
  },
  {
    no: 13,
    kelompokLayanan: 'Spesialis Lain',
    name: 'Poliklinik Urologi',
    kodeSpesialis: 'Sp.U',
    doctors: [
      { id: 'DOC_U_1', name: 'dr. Eko Prasetyo, Sp.U', specialty: 'Urologi' },
      { id: 'DOC_U_2', name: 'dr. Tiara Maharani, Sp.U', specialty: 'Urologi' },
      { id: 'DOC_U_3', name: 'dr. Wahyu Kuncoro, Sp.U', specialty: 'Urologi' }
    ]
  },
  {
    no: 14,
    kelompokLayanan: 'Spesialis Lain',
    name: 'Poliklinik Bedah Saraf',
    kodeSpesialis: 'Sp.BS',
    doctors: [
      { id: 'DOC_BS_1', name: 'dr. Irfan Maulana, Sp.BS', specialty: 'Bedah Saraf' },
      { id: 'DOC_BS_2', name: 'dr. Putri Ayuningtyas, Sp.BS', specialty: 'Bedah Saraf' },
      { id: 'DOC_BS_3', name: 'dr. Bayu Herlambang, Sp.BS', specialty: 'Bedah Saraf' }
    ]
  },
  {
    no: 15,
    kelompokLayanan: 'Gigi Spesialis',
    name: 'Poliklinik Bedah Mulut dan Maksilofasial',
    kodeSpesialis: 'Sp.B.M.M',
    doctors: [
      { id: 'DOC_BMM_1', name: 'drg. Rizky Alamsyah, Sp.B.M.M', specialty: 'Bedah Mulut dan Maksilofasial' },
      { id: 'DOC_BMM_2', name: 'drg. Hana Lestari, Sp.B.M.M', specialty: 'Bedah Mulut dan Maksilofasial' },
      { id: 'DOC_BMM_3', name: 'drg. Marco Wijaya, Sp.B.M.M', specialty: 'Bedah Mulut dan Maksilofasial' }
    ]
  },
  {
    no: 16,
    kelompokLayanan: 'Gigi Spesialis',
    name: 'Poliklinik Konservasi Gigi',
    kodeSpesialis: 'Sp.KG',
    doctors: [
      { id: 'DOC_KG_1', name: 'drg. Ayu Pertiwi, Sp.KG', specialty: 'Konservasi Gigi' },
      { id: 'DOC_KG_2', name: 'drg. Denny Firmansyah, Sp.KG', specialty: 'Konservasi Gigi' },
      { id: 'DOC_KG_3', name: 'drg. Rossa Meilani, Sp.KG', specialty: 'Konservasi Gigi' }
    ]
  },
  {
    no: 17,
    kelompokLayanan: 'Gigi Spesialis',
    name: 'Poliklinik Periodonsia',
    kodeSpesialis: 'Sp.Perio',
    doctors: [
      { id: 'DOC_PERIO_1', name: 'drg. Luthfi Hakim, Sp.Perio', specialty: 'Periodonsia' },
      { id: 'DOC_PERIO_2', name: 'drg. Wulan Cahyani, Sp.Perio', specialty: 'Periodonsia' },
      { id: 'DOC_PERIO_3', name: 'drg. Steven Gunawan, Sp.Perio', specialty: 'Periodonsia' }
    ]
  },
  {
    no: 18,
    kelompokLayanan: 'Penunjang Medik',
    name: 'Poliklinik Rehabilitasi Medik',
    kodeSpesialis: 'Sp.K.F.R',
    doctors: [
      { id: 'DOC_KFR_1', name: 'dr. Intan Prameswari, Sp.K.F.R', specialty: 'Rehabilitasi Medik' },
      { id: 'DOC_KFR_2', name: 'dr. Yohan Kurnia, Sp.K.F.R', specialty: 'Rehabilitasi Medik' },
      { id: 'DOC_KFR_3', name: 'dr. Fani Kusuma, Sp.K.F.R', specialty: 'Rehabilitasi Medik' }
    ]
  },
  {
    no: 19,
    kelompokLayanan: 'Penunjang Medik',
    name: 'Pelayanan Anestesiologi dan Terapi Intensif',
    kodeSpesialis: 'Sp.An-TI',
    doctors: [
      { id: 'DOC_ANTI_1', name: 'dr. Damar Wisesa, Sp.An-TI', specialty: 'Anestesiologi dan Terapi Intensif' },
      { id: 'DOC_ANTI_2', name: 'dr. Niken Larasati, Sp.An-TI', specialty: 'Anestesiologi dan Terapi Intensif' },
      { id: 'DOC_ANTI_3', name: 'dr. Aldi Syahputra, Sp.An-TI', specialty: 'Anestesiologi dan Terapi Intensif' }
    ]
  },
  {
    no: 20,
    kelompokLayanan: 'Penunjang Medik',
    name: 'Pelayanan Radiologi',
    kodeSpesialis: 'Sp.Rad',
    doctors: [
      { id: 'DOC_RAD_1', name: 'dr. Hani Purnamasari, Sp.Rad', specialty: 'Radiologi' },
      { id: 'DOC_RAD_2', name: 'dr. Rio Adiputra, Sp.Rad', specialty: 'Radiologi' },
      { id: 'DOC_RAD_3', name: 'dr. Amalia Khairunnisa, Sp.Rad', specialty: 'Radiologi' }
    ]
  },
  {
    no: 21,
    kelompokLayanan: 'Penunjang Medik',
    name: 'Pelayanan Patologi Klinik',
    kodeSpesialis: 'Sp.PK',
    doctors: [
      { id: 'DOC_PK_1', name: 'dr. Diah Puspaningrum, Sp.PK', specialty: 'Patologi Klinik' },
      { id: 'DOC_PK_2', name: 'dr. Fikri Anwar, Sp.PK', specialty: 'Patologi Klinik' },
      { id: 'DOC_PK_3', name: 'dr. Monica Wijayanti, Sp.PK', specialty: 'Patologi Klinik' }
    ]
  }
];

// Helper untuk mendapatkan dokter berdasarkan nama poliklinik
export function getDoctorsByPoliklinik(poliName: string) {
  if (!poliName) return MASTER_POLIKLINIK[0].doctors;
  const found = MASTER_POLIKLINIK.find(p => 
    p.name.toLowerCase() === poliName.toLowerCase() ||
    poliName.toLowerCase().includes(p.name.toLowerCase()) ||
    p.name.toLowerCase().includes(poliName.toLowerCase())
  );
  return found ? found.doctors : MASTER_POLIKLINIK[0].doctors;
}
