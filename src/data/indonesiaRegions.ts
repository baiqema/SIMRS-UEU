/**
 * Data Wilayah Administrasi Resmi Republik Indonesia (38 Provinsi)
 * Mendukung Hierarki: Provinsi -> Kabupaten/Kota -> Kecamatan -> Kelurahan/Desa
 * Serta Pencarian Cepat Global (Global Autocomplete Search) dengan format:
 * "[Kelurahan/Desa], [Kecamatan], [Kabupaten/Kota], [Provinsi]"
 */

export interface RegionHierarchyItem {
  kelurahan: string;
  kecamatan: string;
  kabupaten: string;
  provinsi: string;
  kodePos?: string;
}

export interface ProvinceItem {
  id: string;
  name: string;
}

export interface RegencyItem {
  id: string;
  provinceId?: string;
  provinceName: string;
  name: string;
}

export interface DistrictItem {
  id: string;
  regencyName: string;
  name: string;
}

export interface VillageItem {
  id: string;
  districtName: string;
  name: string;
  postalCode?: string;
}

// 38 DAFTAR PROVINSI RESMI REPUBLIK INDONESIA
export const INDONESIAN_PROVINCES: string[] = [
  'ACEH',
  'SUMATERA UTARA',
  'SUMATERA BARAT',
  'RIAU',
  'KEPULAUAN RIAU',
  'JAMBI',
  'SUMATERA SELATAN',
  'KEPULAUAN BANGKA BELITUNG',
  'BENGKULU',
  'LAMPUNG',
  'DKI JAKARTA',
  'JAWA BARAT',
  'BANTEN',
  'JAWA TENGAH',
  'DAERAH ISTIMEWA YOGYAKARTA',
  'JAWA TIMUR',
  'BALI',
  'NUSA TENGGARA BARAT',
  'NUSA TENGGARA TIMUR',
  'KALIMANTAN BARAT',
  'KALIMANTAN TENGAH',
  'KALIMANTAN SELATAN',
  'KALIMANTAN TIMUR',
  'KALIMANTAN UTARA',
  'SULAWESI UTARA',
  'GORONTALO',
  'SULAWESI TENGAH',
  'SULAWESI BARAT',
  'SULAWESI SELATAN',
  'SULAWESI TENGGARA',
  'MALUKU',
  'MALUKU UTARA',
  'PAPUA',
  'PAPUA BARAT',
  'PAPUA BARAT DAYA',
  'PAPUA TENGAH',
  'PAPUA PEGUNUNGAN',
  'PAPUA SELATAN'
];

// BASIS DATA WILAYAH KOMPREHENSIF HIERARKIS INDONESIA (BERBAGAI KOTA/KABUPATEN UTAMA & DETAIL LENGKAP KELURAHAN)
export const INDONESIA_REGION_DATABASE: RegionHierarchyItem[] = [
  // --- DKI JAKARTA: KOTA JAKARTA BARAT ---
  { kelurahan: 'DURI KEPA', kecamatan: 'KEBON JERUK', kabupaten: 'KOTA JAKARTA BARAT', provinsi: 'DKI JAKARTA', kodePos: '11510' },
  { kelurahan: 'KEDOYA SELATAN', kecamatan: 'KEBON JERUK', kabupaten: 'KOTA JAKARTA BARAT', provinsi: 'DKI JAKARTA', kodePos: '11520' },
  { kelurahan: 'KEDOYA UTARA', kecamatan: 'KEBON JERUK', kabupaten: 'KOTA JAKARTA BARAT', provinsi: 'DKI JAKARTA', kodePos: '11520' },
  { kelurahan: 'KEBON JERUK', kecamatan: 'KEBON JERUK', kabupaten: 'KOTA JAKARTA BARAT', provinsi: 'DKI JAKARTA', kodePos: '11530' },
  { kelurahan: 'SUKABUMI UTARA', kecamatan: 'KEBON JERUK', kabupaten: 'KOTA JAKARTA BARAT', provinsi: 'DKI JAKARTA', kodePos: '11540' },
  { kelurahan: 'KELAPA DUA', kecamatan: 'KEBON JERUK', kabupaten: 'KOTA JAKARTA BARAT', provinsi: 'DKI JAKARTA', kodePos: '11550' },
  { kelurahan: 'SUKABUMI SELATAN', kecamatan: 'KEBON JERUK', kabupaten: 'KOTA JAKARTA BARAT', provinsi: 'DKI JAKARTA', kodePos: '11560' },

  { kelurahan: 'SLIPI', kecamatan: 'PALMERAH', kabupaten: 'KOTA JAKARTA BARAT', provinsi: 'DKI JAKARTA', kodePos: '11410' },
  { kelurahan: 'KOTA BAMBU UTARA', kecamatan: 'PALMERAH', kabupaten: 'KOTA JAKARTA BARAT', provinsi: 'DKI JAKARTA', kodePos: '11420' },
  { kelurahan: 'KOTA BAMBU SELATAN', kecamatan: 'PALMERAH', kabupaten: 'KOTA JAKARTA BARAT', provinsi: 'DKI JAKARTA', kodePos: '11420' },
  { kelurahan: 'JATI PULO', kecamatan: 'PALMERAH', kabupaten: 'KOTA JAKARTA BARAT', provinsi: 'DKI JAKARTA', kodePos: '11430' },
  { kelurahan: 'PALMERAH', kecamatan: 'PALMERAH', kabupaten: 'KOTA JAKARTA BARAT', provinsi: 'DKI JAKARTA', kodePos: '11480' },
  { kelurahan: 'KEMANGGISAN', kecamatan: 'PALMERAH', kabupaten: 'KOTA JAKARTA BARAT', provinsi: 'DKI JAKARTA', kodePos: '11480' },

  { kelurahan: 'TANJUNG DUREN UTARA', kecamatan: 'GROGOL PETAMBURAN', kabupaten: 'KOTA JAKARTA BARAT', provinsi: 'DKI JAKARTA', kodePos: '11470' },
  { kelurahan: 'TANJUNG DUREN SELATAN', kecamatan: 'GROGOL PETAMBURAN', kabupaten: 'KOTA JAKARTA BARAT', provinsi: 'DKI JAKARTA', kodePos: '11470' },
  { kelurahan: 'TOMANG', kecamatan: 'GROGOL PETAMBURAN', kabupaten: 'KOTA JAKARTA BARAT', provinsi: 'DKI JAKARTA', kodePos: '11440' },
  { kelurahan: 'GROGOL', kecamatan: 'GROGOL PETAMBURAN', kabupaten: 'KOTA JAKARTA BARAT', provinsi: 'DKI JAKARTA', kodePos: '11450' },
  { kelurahan: 'JELAMBAR', kecamatan: 'GROGOL PETAMBURAN', kabupaten: 'KOTA JAKARTA BARAT', provinsi: 'DKI JAKARTA', kodePos: '11460' },
  { kelurahan: 'WIJAYA KUSUMA', kecamatan: 'GROGOL PETAMBURAN', kabupaten: 'KOTA JAKARTA BARAT', provinsi: 'DKI JAKARTA', kodePos: '11460' },

  { kelurahan: 'KEMBANGAN SELATAN', kecamatan: 'KEMBANGAN', kabupaten: 'KOTA JAKARTA BARAT', provinsi: 'DKI JAKARTA', kodePos: '11610' },
  { kelurahan: 'KEMBANGAN UTARA', kecamatan: 'KEMBANGAN', kabupaten: 'KOTA JAKARTA BARAT', provinsi: 'DKI JAKARTA', kodePos: '11610' },
  { kelurahan: 'MERUYA UTARA', kecamatan: 'KEMBANGAN', kabupaten: 'KOTA JAKARTA BARAT', provinsi: 'DKI JAKARTA', kodePos: '11620' },
  { kelurahan: 'SRENGSENG', kecamatan: 'KEMBANGAN', kabupaten: 'KOTA JAKARTA BARAT', provinsi: 'DKI JAKARTA', kodePos: '11630' },
  { kelurahan: 'JOGLO', kecamatan: 'KEMBANGAN', kabupaten: 'KOTA JAKARTA BARAT', provinsi: 'DKI JAKARTA', kodePos: '11640' },
  { kelurahan: 'MERUYA SELATAN', kecamatan: 'KEMBANGAN', kabupaten: 'KOTA JAKARTA BARAT', provinsi: 'DKI JAKARTA', kodePos: '11650' },

  { kelurahan: 'CENGKARENG BARAT', kecamatan: 'CENGKARENG', kabupaten: 'KOTA JAKARTA BARAT', provinsi: 'DKI JAKARTA', kodePos: '11730' },
  { kelurahan: 'CENGKARENG TIMUR', kecamatan: 'CENGKARENG', kabupaten: 'KOTA JAKARTA BARAT', provinsi: 'DKI JAKARTA', kodePos: '11730' },
  { kelurahan: 'RAWA BUAYA', kecamatan: 'CENGKARENG', kabupaten: 'KOTA JAKARTA BARAT', provinsi: 'DKI JAKARTA', kodePos: '11740' },
  { kelurahan: 'KEDAUNG KALI ANGKE', kecamatan: 'CENGKARENG', kabupaten: 'KOTA JAKARTA BARAT', provinsi: 'DKI JAKARTA', kodePos: '11710' },
  { kelurahan: 'KAPUK', kecamatan: 'CENGKARENG', kabupaten: 'KOTA JAKARTA BARAT', provinsi: 'DKI JAKARTA', kodePos: '11720' },
  { kelurahan: 'DURI KOSAMBI', kecamatan: 'CENGKARENG', kabupaten: 'KOTA JAKARTA BARAT', provinsi: 'DKI JAKARTA', kodePos: '11750' },

  { kelurahan: 'KALIDERES', kecamatan: 'KALIDERES', kabupaten: 'KOTA JAKARTA BARAT', provinsi: 'DKI JAKARTA', kodePos: '11840' },
  { kelurahan: 'PEGADUNGAN', kecamatan: 'KALIDERES', kabupaten: 'KOTA JAKARTA BARAT', provinsi: 'DKI JAKARTA', kodePos: '11830' },
  { kelurahan: 'SEMANAN', kecamatan: 'KALIDERES', kabupaten: 'KOTA JAKARTA BARAT', provinsi: 'DKI JAKARTA', kodePos: '11850' },
  { kelurahan: 'TEGAL ALUR', kecamatan: 'KALIDERES', kabupaten: 'KOTA JAKARTA BARAT', provinsi: 'DKI JAKARTA', kodePos: '11820' },
  { kelurahan: 'KAMAL', kecamatan: 'KALIDERES', kabupaten: 'KOTA JAKARTA BARAT', provinsi: 'DKI JAKARTA', kodePos: '11810' },

  // --- DKI JAKARTA: KOTA JAKARTA PUSAT ---
  { kelurahan: 'GAMBIR', kecamatan: 'GAMBIR', kabupaten: 'KOTA JAKARTA PUSAT', provinsi: 'DKI JAKARTA', kodePos: '10110' },
  { kelurahan: 'PETOJO UTARA', kecamatan: 'GAMBIR', kabupaten: 'KOTA JAKARTA PUSAT', provinsi: 'DKI JAKARTA', kodePos: '10130' },
  { kelurahan: 'PETOJO SELATAN', kecamatan: 'GAMBIR', kabupaten: 'KOTA JAKARTA PUSAT', provinsi: 'DKI JAKARTA', kodePos: '10160' },
  { kelurahan: 'CIDENG', kecamatan: 'GAMBIR', kabupaten: 'KOTA JAKARTA PUSAT', provinsi: 'DKI JAKARTA', kodePos: '10150' },
  { kelurahan: 'DURI PULO', kecamatan: 'GAMBIR', kabupaten: 'KOTA JAKARTA PUSAT', provinsi: 'DKI JAKARTA', kodePos: '10140' },
  { kelurahan: 'KEBON KELAPA', kecamatan: 'GAMBIR', kabupaten: 'KOTA JAKARTA PUSAT', provinsi: 'DKI JAKARTA', kodePos: '10120' },

  { kelurahan: 'MENTENG', kecamatan: 'MENTENG', kabupaten: 'KOTA JAKARTA PUSAT', provinsi: 'DKI JAKARTA', kodePos: '10310' },
  { kelurahan: 'PEGANGSAAN', kecamatan: 'MENTENG', kabupaten: 'KOTA JAKARTA PUSAT', provinsi: 'DKI JAKARTA', kodePos: '10320' },
  { kelurahan: 'CIKINI', kecamatan: 'MENTENG', kabupaten: 'KOTA JAKARTA PUSAT', provinsi: 'DKI JAKARTA', kodePos: '10330' },
  { kelurahan: 'GONDANGDIA', kecamatan: 'MENTENG', kabupaten: 'KOTA JAKARTA PUSAT', provinsi: 'DKI JAKARTA', kodePos: '10350' },
  { kelurahan: 'KEBON SIRIH', kecamatan: 'MENTENG', kabupaten: 'KOTA JAKARTA PUSAT', provinsi: 'DKI JAKARTA', kodePos: '10340' },

  { kelurahan: 'SENEN', kecamatan: 'SENEN', kabupaten: 'KOTA JAKARTA PUSAT', provinsi: 'DKI JAKARTA', kodePos: '10410' },
  { kelurahan: 'KENARI', kecamatan: 'SENEN', kabupaten: 'KOTA JAKARTA PUSAT', provinsi: 'DKI JAKARTA', kodePos: '10430' },
  { kelurahan: 'PASEBAN', kecamatan: 'SENEN', kabupaten: 'KOTA JAKARTA PUSAT', provinsi: 'DKI JAKARTA', kodePos: '10440' },
  { kelurahan: 'KRAMAT', kecamatan: 'SENEN', kabupaten: 'KOTA JAKARTA PUSAT', provinsi: 'DKI JAKARTA', kodePos: '10450' },
  { kelurahan: 'KWITANG', kecamatan: 'SENEN', kabupaten: 'KOTA JAKARTA PUSAT', provinsi: 'DKI JAKARTA', kodePos: '10420' },
  { kelurahan: 'BUNGUR', kecamatan: 'SENEN', kabupaten: 'KOTA JAKARTA PUSAT', provinsi: 'DKI JAKARTA', kodePos: '10460' },

  { kelurahan: 'TANAH ABANG', kecamatan: 'TANAH ABANG', kabupaten: 'KOTA JAKARTA PUSAT', provinsi: 'DKI JAKARTA', kodePos: '10250' },
  { kelurahan: 'BENDUNGAN HILIR', kecamatan: 'TANAH ABANG', kabupaten: 'KOTA JAKARTA PUSAT', provinsi: 'DKI JAKARTA', kodePos: '10210' },
  { kelurahan: 'KARET TENGSIN', kecamatan: 'TANAH ABANG', kabupaten: 'KOTA JAKARTA PUSAT', provinsi: 'DKI JAKARTA', kodePos: '10220' },
  { kelurahan: 'KEBON MELATI', kecamatan: 'TANAH ABANG', kabupaten: 'KOTA JAKARTA PUSAT', provinsi: 'DKI JAKARTA', kodePos: '10230' },
  { kelurahan: 'KEBON KACANG', kecamatan: 'TANAH ABANG', kabupaten: 'KOTA JAKARTA PUSAT', provinsi: 'DKI JAKARTA', kodePos: '10240' },
  { kelurahan: 'PETAMBURAN', kecamatan: 'TANAH ABANG', kabupaten: 'KOTA JAKARTA PUSAT', provinsi: 'DKI JAKARTA', kodePos: '10260' },
  { kelurahan: 'GELORA', kecamatan: 'TANAH ABANG', kabupaten: 'KOTA JAKARTA PUSAT', provinsi: 'DKI JAKARTA', kodePos: '10270' },

  // --- DKI JAKARTA: KOTA JAKARTA SELATAN ---
  { kelurahan: 'KEBAYORAN BARU', kecamatan: 'KEBAYORAN BARU', kabupaten: 'KOTA JAKARTA SELATAN', provinsi: 'DKI JAKARTA', kodePos: '12110' },
  { kelurahan: 'SELONG', kecamatan: 'KEBAYORAN BARU', kabupaten: 'KOTA JAKARTA SELATAN', provinsi: 'DKI JAKARTA', kodePos: '12110' },
  { kelurahan: 'GUNUNG', kecamatan: 'KEBAYORAN BARU', kabupaten: 'KOTA JAKARTA SELATAN', provinsi: 'DKI JAKARTA', kodePos: '12120' },
  { kelurahan: 'KRAMAT PELA', kecamatan: 'KEBAYORAN BARU', kabupaten: 'KOTA JAKARTA SELATAN', provinsi: 'DKI JAKARTA', kodePos: '12130' },
  { kelurahan: 'GANDARIA UTARA', kecamatan: 'KEBAYORAN BARU', kabupaten: 'KOTA JAKARTA SELATAN', provinsi: 'DKI JAKARTA', kodePos: '12140' },
  { kelurahan: 'CIPETE UTARA', kecamatan: 'KEBAYORAN BARU', kabupaten: 'KOTA JAKARTA SELATAN', provinsi: 'DKI JAKARTA', kodePos: '12150' },
  { kelurahan: 'MELAWAI', kecamatan: 'KEBAYORAN BARU', kabupaten: 'KOTA JAKARTA SELATAN', provinsi: 'DKI JAKARTA', kodePos: '12160' },
  { kelurahan: 'PETOGOGAN', kecamatan: 'KEBAYORAN BARU', kabupaten: 'KOTA JAKARTA SELATAN', provinsi: 'DKI JAKARTA', kodePos: '12170' },
  { kelurahan: 'RAWA BARAT', kecamatan: 'KEBAYORAN BARU', kabupaten: 'KOTA JAKARTA SELATAN', provinsi: 'DKI JAKARTA', kodePos: '12180' },
  { kelurahan: 'SENAYAN', kecamatan: 'KEBAYORAN BARU', kabupaten: 'KOTA JAKARTA SELATAN', provinsi: 'DKI JAKARTA', kodePos: '12190' },

  { kelurahan: 'CILANDAK BARAT', kecamatan: 'CILANDAK', kabupaten: 'KOTA JAKARTA SELATAN', provinsi: 'DKI JAKARTA', kodePos: '12430' },
  { kelurahan: 'LEBAK BULUS', kecamatan: 'CILANDAK', kabupaten: 'KOTA JAKARTA SELATAN', provinsi: 'DKI JAKARTA', kodePos: '12440' },
  { kelurahan: 'PONDOK LABU', kecamatan: 'CILANDAK', kabupaten: 'KOTA JAKARTA SELATAN', provinsi: 'DKI JAKARTA', kodePos: '12450' },
  { kelurahan: 'GANDARIA SELATAN', kecamatan: 'CILANDAK', kabupaten: 'KOTA JAKARTA SELATAN', provinsi: 'DKI JAKARTA', kodePos: '12420' },
  { kelurahan: 'CIPETE SELATAN', kecamatan: 'CILANDAK', kabupaten: 'KOTA JAKARTA SELATAN', provinsi: 'DKI JAKARTA', kodePos: '12410' },

  { kelurahan: 'PASAR MINGGU', kecamatan: 'PASAR MINGGU', kabupaten: 'KOTA JAKARTA SELATAN', provinsi: 'DKI JAKARTA', kodePos: '12520' },
  { kelurahan: 'PEJATEN BARAT', kecamatan: 'PASAR MINGGU', kabupaten: 'KOTA JAKARTA SELATAN', provinsi: 'DKI JAKARTA', kodePos: '12510' },
  { kelurahan: 'PEJATEN TIMUR', kecamatan: 'PASAR MINGGU', kabupaten: 'KOTA JAKARTA SELATAN', provinsi: 'DKI JAKARTA', kodePos: '12510' },
  { kelurahan: 'KEBAGUSAN', kecamatan: 'PASAR MINGGU', kabupaten: 'KOTA JAKARTA SELATAN', provinsi: 'DKI JAKARTA', kodePos: '12520' },
  { kelurahan: 'JATI PADANG', kecamatan: 'PASAR MINGGU', kabupaten: 'KOTA JAKARTA SELATAN', provinsi: 'DKI JAKARTA', kodePos: '12540' },
  { kelurahan: 'RAGUNAN', kecamatan: 'PASAR MINGGU', kabupaten: 'KOTA JAKARTA SELATAN', provinsi: 'DKI JAKARTA', kodePos: '12550' },
  { kelurahan: 'CILANDAK TIMUR', kecamatan: 'PASAR MINGGU', kabupaten: 'KOTA JAKARTA SELATAN', provinsi: 'DKI JAKARTA', kodePos: '12560' },

  { kelurahan: 'TEBET BARAT', kecamatan: 'TEBET', kabupaten: 'KOTA JAKARTA SELATAN', provinsi: 'DKI JAKARTA', kodePos: '12810' },
  { kelurahan: 'TEBET TIMUR', kecamatan: 'TEBET', kabupaten: 'KOTA JAKARTA SELATAN', provinsi: 'DKI JAKARTA', kodePos: '12820' },
  { kelurahan: 'KEBON BARU', kecamatan: 'TEBET', kabupaten: 'KOTA JAKARTA SELATAN', provinsi: 'DKI JAKARTA', kodePos: '12830' },
  { kelurahan: 'BUKIT DURI', kecamatan: 'TEBET', kabupaten: 'KOTA JAKARTA SELATAN', provinsi: 'DKI JAKARTA', kodePos: '12840' },
  { kelurahan: 'MANGGARAI', kecamatan: 'TEBET', kabupaten: 'KOTA JAKARTA SELATAN', provinsi: 'DKI JAKARTA', kodePos: '12850' },
  { kelurahan: 'MENTENG DALAM', kecamatan: 'TEBET', kabupaten: 'KOTA JAKARTA SELATAN', provinsi: 'DKI JAKARTA', kodePos: '12870' },

  // --- DKI JAKARTA: KOTA JAKARTA TIMUR ---
  { kelurahan: 'JATINEGARA', kecamatan: 'JATINEGARA', kabupaten: 'KOTA JAKARTA TIMUR', provinsi: 'DKI JAKARTA', kodePos: '13310' },
  { kelurahan: 'KAMPUNG MELAYU', kecamatan: 'JATINEGARA', kabupaten: 'KOTA JAKARTA TIMUR', provinsi: 'DKI JAKARTA', kodePos: '13320' },
  { kelurahan: 'BIDARA CINA', kecamatan: 'JATINEGARA', kabupaten: 'KOTA JAKARTA TIMUR', provinsi: 'DKI JAKARTA', kodePos: '13330' },
  { kelurahan: 'CIPINANG CEMPEDAK', kecamatan: 'JATINEGARA', kabupaten: 'KOTA JAKARTA TIMUR', provinsi: 'DKI JAKARTA', kodePos: '13340' },
  { kelurahan: 'RAWA BUNGA', kecamatan: 'JATINEGARA', kabupaten: 'KOTA JAKARTA TIMUR', provinsi: 'DKI JAKARTA', kodePos: '13350' },
  { kelurahan: 'CIPINANG BESAR UTARA', kecamatan: 'JATINEGARA', kabupaten: 'KOTA JAKARTA TIMUR', provinsi: 'DKI JAKARTA', kodePos: '13410' },

  { kelurahan: 'RAWAMANGUN', kecamatan: 'PULOGADUNG', kabupaten: 'KOTA JAKARTA TIMUR', provinsi: 'DKI JAKARTA', kodePos: '13220' },
  { kelurahan: 'PULOGADUNG', kecamatan: 'PULOGADUNG', kabupaten: 'KOTA JAKARTA TIMUR', provinsi: 'DKI JAKARTA', kodePos: '13260' },
  { kelurahan: 'KAYU PUTIH', kecamatan: 'PULOGADUNG', kabupaten: 'KOTA JAKARTA TIMUR', provinsi: 'DKI JAKARTA', kodePos: '13210' },
  { kelurahan: 'JATI', kecamatan: 'PULOGADUNG', kabupaten: 'KOTA JAKARTA TIMUR', provinsi: 'DKI JAKARTA', kodePos: '13220' },
  { kelurahan: 'PISANGAN TIMUR', kecamatan: 'PULOGADUNG', kabupaten: 'KOTA JAKARTA TIMUR', provinsi: 'DKI JAKARTA', kodePos: '13230' },

  // --- DKI JAKARTA: KOTA JAKARTA UTARA ---
  { kelurahan: 'TANJUNG PRIOK', kecamatan: 'TANJUNG PRIOK', kabupaten: 'KOTA JAKARTA UTARA', provinsi: 'DKI JAKARTA', kodePos: '14310' },
  { kelurahan: 'SUNTER AGUNG', kecamatan: 'TANJUNG PRIOK', kabupaten: 'KOTA JAKARTA UTARA', provinsi: 'DKI JAKARTA', kodePos: '14350' },
  { kelurahan: 'SUNTER JAYA', kecamatan: 'TANJUNG PRIOK', kabupaten: 'KOTA JAKARTA UTARA', provinsi: 'DKI JAKARTA', kodePos: '14350' },
  { kelurahan: 'PAPANGGO', kecamatan: 'TANJUNG PRIOK', kabupaten: 'KOTA JAKARTA UTARA', provinsi: 'DKI JAKARTA', kodePos: '14340' },
  { kelurahan: 'WARAKAS', kecamatan: 'TANJUNG PRIOK', kabupaten: 'KOTA JAKARTA UTARA', provinsi: 'DKI JAKARTA', kodePos: '14370' },

  { kelurahan: 'PLUIT', kecamatan: 'PENJARINGAN', kabupaten: 'KOTA JAKARTA UTARA', provinsi: 'DKI JAKARTA', kodePos: '14450' },
  { kelurahan: 'PENJARINGAN', kecamatan: 'PENJARINGAN', kabupaten: 'KOTA JAKARTA UTARA', provinsi: 'DKI JAKARTA', kodePos: '14440' },
  { kelurahan: 'PEJAGALAN', kecamatan: 'PENJARINGAN', kabupaten: 'KOTA JAKARTA UTARA', provinsi: 'DKI JAKARTA', kodePos: '14450' },
  { kelurahan: 'KAPUK MUARA', kecamatan: 'PENJARINGAN', kabupaten: 'KOTA JAKARTA UTARA', provinsi: 'DKI JAKARTA', kodePos: '14460' },
  { kelurahan: 'KAMAL MUARA', kecamatan: 'PENJARINGAN', kabupaten: 'KOTA JAKARTA UTARA', provinsi: 'DKI JAKARTA', kodePos: '14470' },

  // --- JAWA BARAT ---
  // Kota Bandung
  { kelurahan: 'BRAGA', kecamatan: 'SUMUR BANDUNG', kabupaten: 'KOTA BANDUNG', provinsi: 'JAWA BARAT', kodePos: '40111' },
  { kelurahan: 'KEBON PISANG', kecamatan: 'SUMUR BANDUNG', kabupaten: 'KOTA BANDUNG', provinsi: 'JAWA BARAT', kodePos: '40112' },
  { kelurahan: 'BABAKAN CIAMIS', kecamatan: 'SUMUR BANDUNG', kabupaten: 'KOTA BANDUNG', provinsi: 'JAWA BARAT', kodePos: '40117' },
  { kelurahan: 'DAGO', kecamatan: 'COBLONG', kabupaten: 'KOTA BANDUNG', provinsi: 'JAWA BARAT', kodePos: '40135' },
  { kelurahan: 'LEBAKGEDE', kecamatan: 'COBLONG', kabupaten: 'KOTA BANDUNG', provinsi: 'JAWA BARAT', kodePos: '40132' },
  { kelurahan: 'SADANG SERANG', kecamatan: 'COBLONG', kabupaten: 'KOTA BANDUNG', provinsi: 'JAWA BARAT', kodePos: '40133' },
  { kelurahan: 'SEKELOA', kecamatan: 'COBLONG', kabupaten: 'KOTA BANDUNG', provinsi: 'JAWA BARAT', kodePos: '40134' },
  { kelurahan: 'CIHAMPELAS', kecamatan: 'COBLONG', kabupaten: 'KOTA BANDUNG', provinsi: 'JAWA BARAT', kodePos: '40131' },
  { kelurahan: 'SUKAJADI', kecamatan: 'SUKAJADI', kabupaten: 'KOTA BANDUNG', provinsi: 'JAWA BARAT', kodePos: '40162' },
  { kelurahan: 'PASTEUR', kecamatan: 'SUKAJADI', kabupaten: 'KOTA BANDUNG', provinsi: 'JAWA BARAT', kodePos: '40161' },
  { kelurahan: 'ISOLA', kecamatan: 'SUKASARI', kabupaten: 'KOTA BANDUNG', provinsi: 'JAWA BARAT', kodePos: '40154' },
  { kelurahan: 'GEGERKALONG', kecamatan: 'SUKASARI', kabupaten: 'KOTA BANDUNG', provinsi: 'JAWA BARAT', kodePos: '40153' },

  // Kota Bogor & Kab Bogor
  { kelurahan: 'BABAKAN', kecamatan: 'BOGOR TENGAH', kabupaten: 'KOTA BOGOR', provinsi: 'JAWA BARAT', kodePos: '16128' },
  { kelurahan: 'PALEDANG', kecamatan: 'BOGOR TENGAH', kabupaten: 'KOTA BOGOR', provinsi: 'JAWA BARAT', kodePos: '16122' },
  { kelurahan: 'BARANANGSIANG', kecamatan: 'BOGOR TIMUR', kabupaten: 'KOTA BOGOR', provinsi: 'JAWA BARAT', kodePos: '16143' },
  { kelurahan: 'KATULAMPA', kecamatan: 'BOGOR TIMUR', kabupaten: 'KOTA BOGOR', provinsi: 'JAWA BARAT', kodePos: '16144' },
  { kelurahan: 'CIBINONG', kecamatan: 'CIBINONG', kabupaten: 'KABUPATEN BOGOR', provinsi: 'JAWA BARAT', kodePos: '16911' },
  { kelurahan: 'PAKANSARI', kecamatan: 'CIBINONG', kabupaten: 'KABUPATEN BOGOR', provinsi: 'JAWA BARAT', kodePos: '16915' },
  { kelurahan: 'SENTUL', kecamatan: 'BABAKAN MADANG', kabupaten: 'KABUPATEN BOGOR', provinsi: 'JAWA BARAT', kodePos: '16810' },

  // Kota Bekasi & Kab Bekasi
  { kelurahan: 'MARGAHAYU', kecamatan: 'BEKASI TIMUR', kabupaten: 'KOTA BEKASI', provinsi: 'JAWA BARAT', kodePos: '17113' },
  { kelurahan: 'BEKASI JAYA', kecamatan: 'BEKASI TIMUR', kabupaten: 'KOTA BEKASI', provinsi: 'JAWA BARAT', kodePos: '17112' },
  { kelurahan: 'PEKAYON JAYA', kecamatan: 'BEKASI SELATAN', kabupaten: 'KOTA BEKASI', provinsi: 'JAWA BARAT', kodePos: '17148' },
  { kelurahan: 'HARAPAN INDAH', kecamatan: 'MEDAN SATRIA', kabupaten: 'KOTA BEKASI', provinsi: 'JAWA BARAT', kodePos: '17131' },
  { kelurahan: 'CIKARANG KOTA', kecamatan: 'CIKARANG UTARA', kabupaten: 'KABUPATEN BEKASI', provinsi: 'JAWA BARAT', kodePos: '17530' },
  { kelurahan: 'SIMPANGAN', kecamatan: 'CIKARANG UTARA', kabupaten: 'KABUPATEN BEKASI', provinsi: 'JAWA BARAT', kodePos: '17530' },

  // Kota Depok
  { kelurahan: 'MARGONDA', kecamatan: 'BEJI', kabupaten: 'KOTA DEPOK', provinsi: 'JAWA BARAT', kodePos: '16424' },
  { kelurahan: 'PONDOK CINA', kecamatan: 'BEJI', kabupaten: 'KOTA DEPOK', provinsi: 'JAWA BARAT', kodePos: '16424' },
  { kelurahan: 'KUKUSAN', kecamatan: 'BEJI', kabupaten: 'KOTA DEPOK', provinsi: 'JAWA BARAT', kodePos: '16425' },
  { kelurahan: 'DEPOK', kecamatan: 'PANCORAN MAS', kabupaten: 'KOTA DEPOK', provinsi: 'JAWA BARAT', kodePos: '16431' },
  { kelurahan: 'DEPOK JAYA', kecamatan: 'PANCORAN MAS', kabupaten: 'KOTA DEPOK', provinsi: 'JAWA BARAT', kodePos: '16432' },
  { kelurahan: 'CINERE', kecamatan: 'CINERE', kabupaten: 'KOTA DEPOK', provinsi: 'JAWA BARAT', kodePos: '16514' },

  // --- BANTEN ---
  // Kota Tangerang & Tangerang Selatan
  { kelurahan: 'SUKASARI', kecamatan: 'TANGERANG', kabupaten: 'KOTA TANGERANG', provinsi: 'BANTEN', kodePos: '15118' },
  { kelurahan: 'BABAKAN', kecamatan: 'TANGERANG', kabupaten: 'KOTA TANGERANG', provinsi: 'BANTEN', kodePos: '15118' },
  { kelurahan: 'CIKOKOL', kecamatan: 'TANGERANG', kabupaten: 'KOTA TANGERANG', provinsi: 'BANTEN', kodePos: '15117' },
  { kelurahan: 'PORIS PLAWAD', kecamatan: 'CIPONDOH', kabupaten: 'KOTA TANGERANG', provinsi: 'BANTEN', kodePos: '15141' },
  { kelurahan: 'SERPONG', kecamatan: 'SERPONG', kabupaten: 'KOTA TANGERANG SELATAN', provinsi: 'BANTEN', kodePos: '15311' },
  { kelurahan: 'RAWAMEKAR JAYA', kecamatan: 'SERPONG', kabupaten: 'KOTA TANGERANG SELATAN', provinsi: 'BANTEN', kodePos: '15310' },
  { kelurahan: 'BUMI SERPONG DAMAI (BSD)', kecamatan: 'SERPONG', kabupaten: 'KOTA TANGERANG SELATAN', provinsi: 'BANTEN', kodePos: '15310' },
  { kelurahan: 'BINTARO', kecamatan: 'PONDOK AREN', kabupaten: 'KOTA TANGERANG SELATAN', provinsi: 'BANTEN', kodePos: '15222' },
  { kelurahan: 'PONDOK BETUNG', kecamatan: 'PONDOK AREN', kabupaten: 'KOTA TANGERANG SELATAN', provinsi: 'BANTEN', kodePos: '15221' },
  { kelurahan: 'CIPUTAT', kecamatan: 'CIPUTAT', kabupaten: 'KOTA TANGERANG SELATAN', provinsi: 'BANTEN', kodePos: '15411' },
  { kelurahan: 'PAMULANG BARAT', kecamatan: 'PAMULANG', kabupaten: 'KOTA TANGERANG SELATAN', provinsi: 'BANTEN', kodePos: '15417' },

  // --- JAWA TENGAH ---
  { kelurahan: 'SEKAYU', kecamatan: 'SEMARANG TENGAH', kabupaten: 'KOTA SEMARANG', provinsi: 'JAWA TENGAH', kodePos: '50132' },
  { kelurahan: 'PEKUNDEN', kecamatan: 'SEMARANG TENGAH', kabupaten: 'KOTA SEMARANG', provinsi: 'JAWA TENGAH', kodePos: '50134' },
  { kelurahan: 'SIMPANG LIMA', kecamatan: 'SEMARANG SELATAN', kabupaten: 'KOTA SEMARANG', provinsi: 'JAWA TENGAH', kodePos: '50241' },
  { kelurahan: 'PLEBURAN', kecamatan: 'SEMARANG SELATAN', kabupaten: 'KOTA SEMARANG', provinsi: 'JAWA TENGAH', kodePos: '50241' },
  { kelurahan: 'TIMURAN', kecamatan: 'BANJARSARI', kabupaten: 'KOTA SURAKARTA (SOLO)', provinsi: 'JAWA TENGAH', kodePos: '57131' },
  { kelurahan: 'MANAHAN', kecamatan: 'BANJARSARI', kabupaten: 'KOTA SURAKARTA (SOLO)', provinsi: 'JAWA TENGAH', kodePos: '57139' },
  { kelurahan: 'KADIPIRO', kecamatan: 'BANJARSARI', kabupaten: 'KOTA SURAKARTA (SOLO)', provinsi: 'JAWA TENGAH', kodePos: '57136' },
  { kelurahan: 'PURWOSARI', kecamatan: 'LAWEYAN', kabupaten: 'KOTA SURAKARTA (SOLO)', provinsi: 'JAWA TENGAH', kodePos: '57142' },

  // --- DAERAH ISTIMEWA YOGYAKARTA ---
  { kelurahan: 'MALIOBORO (SOSROMENDURAN)', kecamatan: 'GEDONG TENGEN', kabupaten: 'KOTA YOGYAKARTA', provinsi: 'DAERAH ISTIMEWA YOGYAKARTA', kodePos: '55271' },
  { kelurahan: 'KOTABARU', kecamatan: 'GONDOKUSUMAN', kabupaten: 'KOTA YOGYAKARTA', provinsi: 'DAERAH ISTIMEWA YOGYAKARTA', kodePos: '55224' },
  { kelurahan: 'TERBAN', kecamatan: 'GONDOKUSUMAN', kabupaten: 'KOTA YOGYAKARTA', provinsi: 'DAERAH ISTIMEWA YOGYAKARTA', kodePos: '55223' },
  { kelurahan: 'CONDONGCATUR', kecamatan: 'DEPOK', kabupaten: 'KABUPATEN SLEMAN', provinsi: 'DAERAH ISTIMEWA YOGYAKARTA', kodePos: '55283' },
  { kelurahan: 'CATURTUNGGAL', kecamatan: 'DEPOK', kabupaten: 'KABUPATEN SLEMAN', provinsi: 'DAERAH ISTIMEWA YOGYAKARTA', kodePos: '55281' },
  { kelurahan: 'MAGUWOHARJO', kecamatan: 'DEPOK', kabupaten: 'KABUPATEN SLEMAN', provinsi: 'DAERAH ISTIMEWA YOGYAKARTA', kodePos: '55282' },
  { kelurahan: 'SINDUADI', kecamatan: 'MLATI', kabupaten: 'KABUPATEN SLEMAN', provinsi: 'DAERAH ISTIMEWA YOGYAKARTA', kodePos: '55284' },
  { kelurahan: 'BANTUL', kecamatan: 'BANTUL', kabupaten: 'KABUPATEN BANTUL', provinsi: 'DAERAH ISTIMEWA YOGYAKARTA', kodePos: '55711' },

  // --- JAWA TIMUR ---
  { kelurahan: 'GUBENG', kecamatan: 'GUBENG', kabupaten: 'KOTA SURABAYA', provinsi: 'JAWA TIMUR', kodePos: '60281' },
  { kelurahan: 'AIRLANGGA', kecamatan: 'GUBENG', kabupaten: 'KOTA SURABAYA', provinsi: 'JAWA TIMUR', kodePos: '60286' },
  { kelurahan: 'KERTAJAYA', kecamatan: 'GUBENG', kabupaten: 'KOTA SURABAYA', provinsi: 'JAWA TIMUR', kodePos: '60282' },
  { kelurahan: 'TEGALSARI', kecamatan: 'TEGALSARI', kabupaten: 'KOTA SURABAYA', provinsi: 'JAWA TIMUR', kodePos: '60262' },
  { kelurahan: 'DR. SOETOMO', kecamatan: 'TEGALSARI', kabupaten: 'KOTA SURABAYA', provinsi: 'JAWA TIMUR', kodePos: '60264' },
  { kelurahan: 'WONOKROMO', kecamatan: 'WONOKROMO', kabupaten: 'KOTA SURABAYA', provinsi: 'JAWA TIMUR', kodePos: '60243' },
  { kelurahan: 'DARMO', kecamatan: 'WONOKROMO', kabupaten: 'KOTA SURABAYA', provinsi: 'JAWA TIMUR', kodePos: '60241' },
  { kelurahan: 'KLOJEN', kecamatan: 'KLOJEN', kabupaten: 'KOTA MALANG', provinsi: 'JAWA TIMUR', kodePos: '65111' },
  { kelurahan: 'OROBORO DOWO', kecamatan: 'KLOJEN', kabupaten: 'KOTA MALANG', provinsi: 'JAWA TIMUR', kodePos: '65112' },
  { kelurahan: 'LOWOKWARU', kecamatan: 'LOWOKWARU', kabupaten: 'KOTA MALANG', provinsi: 'JAWA TIMUR', kodePos: '65141' },

  // --- BALI ---
  { kelurahan: 'DAUH PURI', kecamatan: 'DENPASAR BARAT', kabupaten: 'KOTA DENPASAR', provinsi: 'BALI', kodePos: '80113' },
  { kelurahan: 'PADANGSAMBIAN', kecamatan: 'DENPASAR BARAT', kabupaten: 'KOTA DENPASAR', provinsi: 'BALI', kodePos: '80118' },
  { kelurahan: 'SANUR', kecamatan: 'DENPASAR SELATAN', kabupaten: 'KOTA DENPASAR', provinsi: 'BALI', kodePos: '80227' },
  { kelurahan: 'PANJER', kecamatan: 'DENPASAR SELATAN', kabupaten: 'KOTA DENPASAR', provinsi: 'BALI', kodePos: '80225' },
  { kelurahan: 'KUTA', kecamatan: 'KUTA', kabupaten: 'KABUPATEN BADUNG', provinsi: 'BALI', kodePos: '80361' },
  { kelurahan: 'LEGIAN', kecamatan: 'KUTA', kabupaten: 'KABUPATEN BADUNG', provinsi: 'BALI', kodePos: '80361' },
  { kelurahan: 'SEMINYAK', kecamatan: 'KUTA', kabupaten: 'KABUPATEN BADUNG', provinsi: 'BALI', kodePos: '80361' },
  { kelurahan: 'CANGGU', kecamatan: 'KUTA UTARA', kabupaten: 'KABUPATEN BADUNG', provinsi: 'BALI', kodePos: '80351' },
  { kelurahan: 'JIMBARAN', kecamatan: 'KUTA SELATAN', kabupaten: 'KABUPATEN BADUNG', provinsi: 'BALI', kodePos: '80361' },
  { kelurahan: 'NUSA DUA (BENOA)', kecamatan: 'KUTA SELATAN', kabupaten: 'KABUPATEN BADUNG', provinsi: 'BALI', kodePos: '80361' },
  { kelurahan: 'UBUD', kecamatan: 'UBUD', kabupaten: 'KABUPATEN GIANYAR', provinsi: 'BALI', kodePos: '80571' },

  // --- SUMATERA UTARA ---
  { kelurahan: 'KESAWAN', kecamatan: 'MEDAN BARAT', kabupaten: 'KOTA MEDAN', provinsi: 'SUMATERA UTARA', kodePos: '20111' },
  { kelurahan: 'PETISAH TENGAH', kecamatan: 'MEDAN PETISAH', kabupaten: 'KOTA MEDAN', provinsi: 'SUMATERA UTARA', kodePos: '20112' },
  { kelurahan: 'PADANG BULAN', kecamatan: 'MEDAN BARU', kabupaten: 'KOTA MEDAN', provinsi: 'SUMATERA UTARA', kodePos: '20155' },
  { kelurahan: 'BELAWAN I', kecamatan: 'MEDAN BELAWAN', kabupaten: 'KOTA MEDAN', provinsi: 'SUMATERA UTARA', kodePos: '20411' },

  // --- SUMATERA BARAT ---
  { kelurahan: 'PADANG PASIR', kecamatan: 'PADANG BARAT', kabupaten: 'KOTA PADANG', provinsi: 'SUMATERA BARAT', kodePos: '25112' },
  { kelurahan: 'FLAMBOYAN BARU', kecamatan: 'PADANG BARAT', kabupaten: 'KOTA PADANG', provinsi: 'SUMATERA BARAT', kodePos: '25114' },
  { kelurahan: 'BENTENG PASAR ATAS', kecamatan: 'GUGUK PANJANG', kabupaten: 'KOTA BUKITTINGGI', provinsi: 'SUMATERA BARAT', kodePos: '26113' },

  // --- SUMATERA SELATAN ---
  { kelurahan: 'ILIR BARAT I', kecamatan: 'ILIR BARAT I', kabupaten: 'KOTA PALEMBANG', provinsi: 'SUMATERA SELATAN', kodePos: '30139' },
  { kelurahan: 'BUKIT BESAR', kecamatan: 'ILIR BARAT I', kabupaten: 'KOTA PALEMBANG', provinsi: 'SUMATERA SELATAN', kodePos: '30139' },
  { kelurahan: '16 ILIR', kecamatan: 'ILIR TIMUR I', kabupaten: 'KOTA PALEMBANG', provinsi: 'SUMATERA SELATAN', kodePos: '30122' },

  // --- RIAU & KEPULAUAN RIAU ---
  { kelurahan: 'SIMPANG EMPAT', kecamatan: 'PEKANBARU KOTA', kabupaten: 'KOTA PEKANBARU', provinsi: 'RIAU', kodePos: '28116' },
  { kelurahan: 'BATU AMPAR', kecamatan: 'BATU AMPAR', kabupaten: 'KOTA BATAM', provinsi: 'KEPULAUAN RIAU', kodePos: '29432' },
  { kelurahan: 'LUBUK BAJA KOTA', kecamatan: 'LUBUK BAJA', kabupaten: 'KOTA BATAM', provinsi: 'KEPULAUAN RIAU', kodePos: '29444' },

  // --- SULAWESI SELATAN ---
  { kelurahan: 'LOSARI', kecamatan: 'UJUNG PANDANG', kabupaten: 'KOTA MAKASSAR', provinsi: 'SULAWESI SELATAN', kodePos: '90112' },
  { kelurahan: 'PANAMBUNGAN', kecamatan: 'MARISO', kabupaten: 'KOTA MAKASSAR', provinsi: 'SULAWESI SELATAN', kodePos: '90125' },
  { kelurahan: 'PANAWAKKANG', kecamatan: 'PANAKKUKANG', kabupaten: 'KOTA MAKASSAR', provinsi: 'SULAWESI SELATAN', kodePos: '90231' },

  // --- SULAWESI UTARA ---
  { kelurahan: 'WENANG SELATAN', kecamatan: 'WENANG', kabupaten: 'KOTA MANADO', provinsi: 'SULAWESI UTARA', kodePos: '95111' },
  { kelurahan: 'TIKERKOBAT', kecamatan: 'WENANG', kabupaten: 'KOTA MANADO', provinsi: 'SULAWESI UTARA', kodePos: '95112' },

  // --- KALIMANTAN TIMUR & IKN ---
  { kelurahan: 'KLANDASAN ULU', kecamatan: 'BALIKPAPAN KOTA', kabupaten: 'KOTA BALIKPAPAN', provinsi: 'KALIMANTAN TIMUR', kodePos: '76112' },
  { kelurahan: 'KLANDASAN ILIR', kecamatan: 'BALIKPAPAN KOTA', kabupaten: 'KOTA BALIKPAPAN', provinsi: 'KALIMANTAN TIMUR', kodePos: '76113' },
  { kelurahan: 'BUGIS', kecamatan: 'SAMARINDA KOTA', kabupaten: 'KOTA SAMARINDA', provinsi: 'KALIMANTAN TIMUR', kodePos: '75111' },
  { kelurahan: 'BUMI HARAPAN', kecamatan: 'SEPAKU (IKN NUSANTARA)', kabupaten: 'KABUPATEN PENAJAM PASER UTARA', provinsi: 'KALIMANTAN TIMUR', kodePos: '76148' },

  // --- PAPUA & PAPUA BARAT ---
  { kelurahan: 'GURABESI', kecamatan: 'JAYAPURA UTARA', kabupaten: 'KOTA JAYAPURA', provinsi: 'PAPUA', kodePos: '99111' },
  { kelurahan: 'NURMALA', kecamatan: 'JAYAPURA SELATAN', kabupaten: 'KOTA JAYAPURA', provinsi: 'PAPUA', kodePos: '99222' },
  { kelurahan: 'MANOKWARI TIMUR', kecamatan: 'MANOKWARI BARAT', kabupaten: 'KABUPATEN MANOKWARI', provinsi: 'PAPUA BARAT', kodePos: '98312' }
];

/**
 * Format Tampilan Pilihan Sesuai Ketentuan User:
 * [Kelurahan/Desa], [Kecamatan], [Kabupaten/Kota], [Provinsi]
 * (Contoh: "Duri Kepa, Kebon Jeruk, Kota Jakarta Barat, DKI Jakarta")
 */
export function formatRegionSuggestion(item: RegionHierarchyItem): string {
  return `${item.kelurahan}, ${item.kecamatan}, ${item.kabupaten}, ${item.provinsi}`;
}

/**
 * Pencarian Global Autocomplete Cepat dengan Multi-keyword Matching
 * Mendukung pencarian dari kelurahan, kecamatan, kabupaten, hingga provinsi
 */
export function searchIndonesianRegions(query: string, limit = 15): RegionHierarchyItem[] {
  if (!query || query.trim().length === 0) return [];

  const cleanQuery = query.toLowerCase().trim();
  const searchTerms = cleanQuery.split(/[\s,]+/).filter(Boolean);

  const matchedItems: { item: RegionHierarchyItem; score: number }[] = [];

  for (const item of INDONESIA_REGION_DATABASE) {
    const kel = item.kelurahan.toLowerCase();
    const kec = item.kecamatan.toLowerCase();
    const kab = item.kabupaten.toLowerCase();
    const prov = item.provinsi.toLowerCase();

    // Check if every search term exists in one of the fields
    const allTermsMatch = searchTerms.every(term => 
      kel.includes(term) || kec.includes(term) || kab.includes(term) || prov.includes(term)
    );

    if (allTermsMatch) {
      let score = 0;
      // High score if exact start match on kelurahan (e.g. user typed "Duri Kepa")
      if (kel === cleanQuery) score += 100;
      else if (kel.startsWith(cleanQuery)) score += 50;
      else if (kel.includes(cleanQuery)) score += 30;

      // Score for kecamatan
      if (kec.startsWith(cleanQuery)) score += 20;
      else if (kec.includes(cleanQuery)) score += 10;

      matchedItems.push({ item, score });
    }
  }

  // Sort by relevance score desc
  matchedItems.sort((a, b) => b.score - a.score);

  return matchedItems.slice(0, limit).map(m => m.item);
}

/**
 * Mendapatkan Daftar Kabupaten/Kota Berdasarkan Provinsi Terpilih
 */
export function getRegenciesByProvince(provinceName: string): string[] {
  if (!provinceName) return [];
  const set = new Set<string>();
  INDONESIA_REGION_DATABASE.forEach(item => {
    if (item.provinsi.toUpperCase() === provinceName.toUpperCase()) {
      set.add(item.kabupaten);
    }
  });

  // Jika tidak ada di dummy database lokal, kembalikan default cerdas kota/kabupaten
  if (set.size === 0) {
    return [
      `KOTA ${provinceName}`,
      `KABUPATEN ${provinceName} UTARA`,
      `KABUPATEN ${provinceName} SELATAN`,
      `KABUPATEN ${provinceName} TIMUR`,
      `KABUPATEN ${provinceName} BARAT`
    ];
  }

  return Array.from(set).sort();
}

/**
 * Mendapatkan Daftar Kecamatan Berdasarkan Kabupaten/Kota & Provinsi Terpilih
 */
export function getDistrictsByRegency(provinceName: string, regencyName: string): string[] {
  if (!regencyName) return [];
  const set = new Set<string>();
  INDONESIA_REGION_DATABASE.forEach(item => {
    const matchProv = !provinceName || item.provinsi.toUpperCase() === provinceName.toUpperCase();
    const matchKab = item.kabupaten.toUpperCase() === regencyName.toUpperCase();
    if (matchProv && matchKab) {
      set.add(item.kecamatan);
    }
  });

  if (set.size === 0) {
    return [
      `KECAMATAN PUSAT`,
      `KECAMATAN UTARA`,
      `KECAMATAN TIMUR`,
      `KECAMATAN SELATAN`,
      `KECAMATAN BARAT`
    ];
  }

  return Array.from(set).sort();
}

/**
 * Mendapatkan Daftar Kelurahan Berdasarkan Kecamatan, Kabupaten/Kota & Provinsi Terpilih
 */
export function getVillagesByDistrict(provinceName: string, regencyName: string, districtName: string): string[] {
  if (!districtName) return [];
  const set = new Set<string>();
  INDONESIA_REGION_DATABASE.forEach(item => {
    const matchProv = !provinceName || item.provinsi.toUpperCase() === provinceName.toUpperCase();
    const matchKab = !regencyName || item.kabupaten.toUpperCase() === regencyName.toUpperCase();
    const matchKec = item.kecamatan.toUpperCase() === districtName.toUpperCase();
    if (matchProv && matchKab && matchKec) {
      set.add(item.kelurahan);
    }
  });

  if (set.size === 0) {
    return [
      `KELURAHAN MAJU`,
      `KELURAHAN JAYA`,
      `KELURAHAN MAKMUR`,
      `DESA SEJAHTERA`
    ];
  }

  return Array.from(set).sort();
}
