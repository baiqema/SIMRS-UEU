// Extended Database of ICD-10 and ICD-9-CM for instant automatic search
import { ICD10, ICD9CM } from '../types';

export interface ExtendedICD10 extends ICD10 {
  chapter?: string;
  category?: string;
}

export interface ExtendedICD9CM extends ICD9CM {
  category?: string;
}

export const EXTENDED_ICD10: ExtendedICD10[] = [
  // A00 - B99 : Penyakit Infeksi & Parasit
  { code: 'A09', desc: 'Diare dan Gastroenteritis Oleh Infeksi / GEA', chapter: 'I', category: 'Infeksi Saluran Cerna' },
  { code: 'A01.0', desc: 'Demam Tifoid / Typhoid Fever', chapter: 'I', category: 'Infeksi Saluran Cerna' },
  { code: 'A01.1', desc: 'Demam Paratifoid A', chapter: 'I', category: 'Infeksi Saluran Cerna' },
  { code: 'A06.0', desc: 'Disentri Amuba Akut', chapter: 'I', category: 'Infeksi Saluran Cerna' },
  { code: 'A15.0', desc: 'Tuberkulosis Paru BTA Positif Tanpa Konfirmasi Biakan', chapter: 'I', category: 'Infeksi Saluran Napas' },
  { code: 'A16.2', desc: 'Tuberkulosis Paru Klinis / BTA Negatif', chapter: 'I', category: 'Infeksi Saluran Napas' },
  { code: 'A90', desc: 'Demam Dengue / Dengue Fever (DF)', chapter: 'I', category: 'Infeksi Virus' },
  { code: 'A91', desc: 'Demam Berdarah Dengue / Dengue Haemorrhagic Fever (DHF)', chapter: 'I', category: 'Infeksi Virus' },
  { code: 'B01.9', desc: 'Varicella / Cacar Air Tanpa Komplikasi', chapter: 'I', category: 'Infeksi Virus' },
  { code: 'B05.9', desc: 'Campak / Measles Tanpa Komplikasi', chapter: 'I', category: 'Infeksi Virus' },
  { code: 'B20', desc: 'Penyakit Human Immunodeficiency Virus (HIV)', chapter: 'I', category: 'Infeksi Virus' },
  { code: 'B34.9', desc: 'Infeksi Virus, Tidak Ditetapkan', chapter: 'I', category: 'Infeksi Virus' },
  { code: 'B50.9', desc: 'Malaria Falciparum, Tanpa Komplikasi', chapter: 'I', category: 'Infeksi Parasit' },
  { code: 'B82.9', desc: 'Helminthiasis Usus / Infeksi Cacing Usus', chapter: 'I', category: 'Infeksi Parasit' },

  // C00 - D48 : Neoplasma / Kanker & Tumor
  { code: 'C50.9', desc: 'Neoplasma Ganas Payudara, Tidak Ditetapkan', chapter: 'II', category: 'Neoplasma Ganas' },
  { code: 'C53.9', desc: 'Neoplasma Ganas Serviks Uteri', chapter: 'II', category: 'Neoplasma Ganas' },
  { code: 'C34.9', desc: 'Neoplasma Ganas Bronkus atau Paru', chapter: 'II', category: 'Neoplasma Ganas' },
  { code: 'C18.9', desc: 'Neoplasma Ganas Kolon / Usus Besar', chapter: 'II', category: 'Neoplasma Ganas' },
  { code: 'D24', desc: 'Neoplasma Jinak Payudara / FAM (Fibroadenoma Mammae)', chapter: 'II', category: 'Neoplasma Jinak' },
  { code: 'D25.9', desc: 'Leiomioma Uterus / Mioma Uteri, Tidak Ditetapkan', chapter: 'II', category: 'Neoplasma Jinak' },
  { code: 'D17.9', desc: 'Lipoma Jinak, Lokasi Tidak Ditetapkan', chapter: 'II', category: 'Neoplasma Jinak' },

  // D50 - D89 : Penyakit Darah
  { code: 'D50.9', desc: 'Anemia Defisiensi Besi, Tidak Ditetapkan', chapter: 'III', category: 'Penyakit Darah' },
  { code: 'D64.9', desc: 'Anemia, Tidak Ditetapkan', chapter: 'III', category: 'Penyakit Darah' },
  { code: 'D69.3', desc: 'Immune Thrombocytopenic Purpura (ITP)', chapter: 'III', category: 'Penyakit Darah' },

  // E00 - E90 : Endokrin, Nutrisi & Metabolik
  { code: 'E11.9', desc: 'Diabetes Melitus Tipe 2 Tanpa Komplikasi', chapter: 'IV', category: 'Endokrin & Metabolik' },
  { code: 'E11.5', desc: 'Diabetes Melitus Tipe 2 dengan Komplikasi Sirkulasi Perifer / Gangren', chapter: 'IV', category: 'Endokrin & Metabolik' },
  { code: 'E10.9', desc: 'Diabetes Melitus Tipe 1 Tanpa Komplikasi', chapter: 'IV', category: 'Endokrin & Metabolik' },
  { code: 'E05.9', desc: 'Tirotoksikosis / Hipertiroidisme, Tidak Ditetapkan', chapter: 'IV', category: 'Endokrin & Metabolik' },
  { code: 'E03.9', desc: 'Hipotiroidisme, Tidak Ditetapkan', chapter: 'IV', category: 'Endokrin & Metabolik' },
  { code: 'E78.5', desc: 'Hiperlipidemia / Dislipidemia, Tidak Ditetapkan', chapter: 'IV', category: 'Endokrin & Metabolik' },
  { code: 'E79.0', desc: 'Hiperurisemia / Asam Urat Tinggi Tanpa Artritis', chapter: 'IV', category: 'Endokrin & Metabolik' },
  { code: 'E66.9', desc: 'Obesitas, Tidak Ditetapkan', chapter: 'IV', category: 'Nutrisi' },
  { code: 'E86', desc: 'Dehidrasi / Penipisan Volume Cairan', chapter: 'IV', category: 'Metabolik & Cairan' },

  // F00 - F99 : Gangguan Jiwa & Perilaku
  { code: 'F20.9', desc: 'Skizofrenia, Tidak Ditetapkan', chapter: 'V', category: 'Kesehatan Jiwa' },
  { code: 'F32.9', desc: 'Episode Depresif, Tidak Ditetapkan', chapter: 'V', category: 'Kesehatan Jiwa' },
  { code: 'F41.9', desc: 'Gangguan Cemas (Anxiety Disorder), Tidak Ditetapkan', chapter: 'V', category: 'Kesehatan Jiwa' },
  { code: 'F45.9', desc: 'Gangguan Somatoform, Tidak Ditetapkan', chapter: 'V', category: 'Kesehatan Jiwa' },

  // G00 - G99 : Sistem Saraf
  { code: 'G40.9', desc: 'Epilepsi, Tidak Ditetapkan', chapter: 'VI', category: 'Sistem Saraf' },
  { code: 'G43.9', desc: 'Migrain, Tidak Ditetapkan', chapter: 'VI', category: 'Sistem Saraf' },
  { code: 'G44.2', desc: 'Tension-Type Headache (TTH) / Sakit Kepala Tegang', chapter: 'VI', category: 'Sistem Saraf' },
  { code: 'G51.0', desc: "Bell's Palsy / Kelumpuhan Saraf Fasialis", chapter: 'VI', category: 'Sistem Saraf' },
  { code: 'G45.9', desc: 'Transient Ischaemic Attack (TIA), Tidak Ditetapkan', chapter: 'VI', category: 'Sistem Saraf' },

  // H00 - H59 : Mata & Adneksa
  { code: 'H10.9', desc: 'Konjungtivitis, Tidak Ditetapkan', chapter: 'VII', category: 'Mata' },
  { code: 'H26.9', desc: 'Katarak Senilis, Tidak Ditetapkan', chapter: 'VII', category: 'Mata' },
  { code: 'H52.1', desc: 'Miopia / Rabun Jauh', chapter: 'VII', category: 'Mata' },
  { code: 'H52.4', desc: 'Presbiopia / Mata Tua', chapter: 'VII', category: 'Mata' },

  // H60 - H95 : Telinga & Mastoid
  { code: 'H66.9', desc: 'Otitis Media, Tidak Ditetapkan', chapter: 'VIII', category: 'THT' },
  { code: 'H60.9', desc: 'Otitis Eksterna, Tidak Ditetapkan', chapter: 'VIII', category: 'THT' },
  { code: 'H81.0', desc: "Penyakit Meniere / Vertigo Perifer", chapter: 'VIII', category: 'THT' },
  { code: 'R42', desc: 'Vertigo dan Pusing (Dizziness)', chapter: 'XVIII', category: 'Gejala Umum' },

  // I00 - I99 : Sistem Sirkulasi / Jantung & Pembuluh Darah
  { code: 'I10', desc: 'Hipertensi Esensial (Primer)', chapter: 'IX', category: 'Kardiovaskular' },
  { code: 'I11.9', desc: 'Penyakit Jantung Hipertensi Tanpa Gagal Jantung', chapter: 'IX', category: 'Kardiovaskular' },
  { code: 'I20.9', desc: 'Angina Pectoris, Tidak Ditetapkan', chapter: 'IX', category: 'Kardiovaskular' },
  { code: 'I21.9', desc: 'Infark Miokard Akut (IMA / STEMI / NSTEMI)', chapter: 'IX', category: 'Kardiovaskular' },
  { code: 'I25.9', desc: 'Penyakit Jantung Iskemik Kronik / CAD / PJK', chapter: 'IX', category: 'Kardiovaskular' },
  { code: 'I50.9', desc: 'Gagal Jantung Kongestif (CHF), Tidak Ditetapkan', chapter: 'IX', category: 'Kardiovaskular' },
  { code: 'I64', desc: 'Stroke, Tidak Ditetapkan sebagai Perdarahan atau Infark', chapter: 'IX', category: 'Serebrovaskular' },
  { code: 'I63.9', desc: 'Stroke Infark Serebral / Iskemik', chapter: 'IX', category: 'Serebrovaskular' },
  { code: 'I61.9', desc: 'Stroke Perdarahan Intraserebral (PIS)', chapter: 'IX', category: 'Serebrovaskular' },
  { code: 'I84.9', desc: 'Hemoroid / Wasir Tanpa Komplikasi', chapter: 'IX', category: 'Vaskular' },

  // J00 - J99 : Sistem Pernapasan
  { code: 'J00', desc: 'Nasofaringitis Akut (Common Cold / Flu)', chapter: 'X', category: 'Respirasi' },
  { code: 'J02.9', desc: 'Faringitis Akut, Tidak Ditetapkan', chapter: 'X', category: 'Respirasi' },
  { code: 'J03.9', desc: 'Tonsilitis Akut, Tidak Ditetapkan', chapter: 'X', category: 'Respirasi' },
  { code: 'J06.9', desc: 'Infeksi Saluran Pernapasan Atas Akut (ISPA)', chapter: 'X', category: 'Respirasi' },
  { code: 'J18.9', desc: 'Pneumonia, Mikroorganisme Tidak Ditetapkan', chapter: 'X', category: 'Respirasi' },
  { code: 'J20.9', desc: 'Bronkitis Akut, Tidak Ditetapkan', chapter: 'X', category: 'Respirasi' },
  { code: 'J44.9', desc: 'Penyakit Paru Obstruktif Kronik (PPOK)', chapter: 'X', category: 'Respirasi' },
  { code: 'J45.9', desc: 'Asma Bronkiale, Tidak Ditetapkan', chapter: 'X', category: 'Respirasi' },
  { code: 'J90', desc: 'Efusi Pleura, Tidak Ditetapkan', chapter: 'X', category: 'Respirasi' },

  // K00 - K93 : Sistem Pencernaan
  { code: 'K21.9', desc: 'Gastro-Oesophageal Reflux Disease (GERD)', chapter: 'XI', category: 'Pencernaan' },
  { code: 'K29.7', desc: 'Gastritis, Tidak Ditetapkan (Maag / Dispepsia)', chapter: 'XI', category: 'Pencernaan' },
  { code: 'K30', desc: 'Dispepsia Fungsional', chapter: 'XI', category: 'Pencernaan' },
  { code: 'K35.8', desc: 'Apendisitis Akut Lainnya dan Tidak Ditetapkan', chapter: 'XI', category: 'Pencernaan' },
  { code: 'K40.9', desc: 'Hernia Inguinalis Unilateral / Bilateral', chapter: 'XI', category: 'Pencernaan' },
  { code: 'K80.2', desc: 'Kolelitiasis / Batu Empedu Tanpa Kolesistitis', chapter: 'XI', category: 'Pencernaan' },
  { code: 'K70.3', desc: 'Sirosis Hati Alkoholik / Sirosis Hepatis', chapter: 'XI', category: 'Pencernaan' },
  { code: 'K92.2', desc: 'Perdarahan Saluran Cerna (Hematemesis Melena)', chapter: 'XI', category: 'Pencernaan' },

  // L00 - L99 : Kulit & Jaringan Subkutan
  { code: 'L02.9', desc: 'Karbunkel dan Abses Kulit, Tidak Ditetapkan', chapter: 'XII', category: 'Kulit' },
  { code: 'L03.9', desc: 'Selulitis, Tidak Ditetapkan', chapter: 'XII', category: 'Kulit' },
  { code: 'L20.9', desc: 'Dermatitis Atopik, Tidak Ditetapkan', chapter: 'XII', category: 'Kulit' },
  { code: 'L23.9', desc: 'Dermatitis Kontak Alergi, Penyebab Tidak Ditetapkan', chapter: 'XII', category: 'Kulit' },
  { code: 'L50.9', desc: 'Urtikaria / Biduran, Tidak Ditetapkan', chapter: 'XII', category: 'Kulit' },

  // M00 - M99 : Sistem Muskuloskeletal & Jaringan Ikat
  { code: 'M54.5', desc: 'Nyeri Punggung Bawah / Low Back Pain (LBP)', chapter: 'XIII', category: 'Muskuloskeletal' },
  { code: 'M17.9', desc: 'Osteoartritis Lutut, Tidak Ditetapkan', chapter: 'XIII', category: 'Muskuloskeletal' },
  { code: 'M10.9', desc: 'Gout Artritis / Asam Urat Akut', chapter: 'XIII', category: 'Muskuloskeletal' },
  { code: 'M79.1', desc: 'Mialgia / Nyeri Otot', chapter: 'XIII', category: 'Muskuloskeletal' },

  // N00 - N99 : Sistem Genitourinaria / Ginjal & Saluran Kemih
  { code: 'N18.5', desc: 'Penyakit Ginjal Kronik Stadium 5 (ESRD / GGK)', chapter: 'XIV', category: 'Ginjal & Urologi' },
  { code: 'N18.9', desc: 'Penyakit Ginjal Kronik, Tidak Ditetapkan', chapter: 'XIV', category: 'Ginjal & Urologi' },
  { code: 'N17.9', desc: 'Gagal Ginjal Akut (GGA / AKI), Tidak Ditetapkan', chapter: 'XIV', category: 'Ginjal & Urologi' },
  { code: 'N20.0', desc: 'Batu Ginjal (Nefrolitiasis)', chapter: 'XIV', category: 'Ginjal & Urologi' },
  { code: 'N20.1', desc: 'Batu Ureter (Ureterolitiasis)', chapter: 'XIV', category: 'Ginjal & Urologi' },
  { code: 'N39.0', desc: 'Infeksi Saluran Kemih (ISK), Lokasi Tidak Ditetapkan', chapter: 'XIV', category: 'Ginjal & Urologi' },
  { code: 'N40', desc: 'Benign Prostatic Hyperplasia (BPH / Pembesaran Prostat)', chapter: 'XIV', category: 'Ginjal & Urologi' },

  // O00 - O99 : Kehamilan, Persalinan & Nifas
  { code: 'O80.0', desc: 'Persalinan Normal Tunggal Spontan Kepala', chapter: 'XV', category: 'Kebidanan' },
  { code: 'O82.9', desc: 'Persalinan Melalui Seksio Sesaria / Caesar', chapter: 'XV', category: 'Kebidanan' },
  { code: 'O14.9', desc: 'Preeklamsia Sedang / Berat, Tidak Ditetapkan', chapter: 'XV', category: 'Kebidanan' },
  { code: 'O21.0', desc: 'Hiperemesis Gravidarum Ringan / Sedang', chapter: 'XV', category: 'Kebidanan' },
  { code: 'O03.9', desc: 'Abortus Spontan Lengkap / Tidak Lengkap', chapter: 'XV', category: 'Kebidanan' },

  // P00 - P96 : Kondisi Perinatal (Bayi Baru Lahir)
  { code: 'P07.3', desc: 'Bayi Lahir Prematur / Preterm Lainnya', chapter: 'XVI', category: 'Bayi Baru Lahir / Neonatus' },
  { code: 'P07.1', desc: 'Bayi Berat Lahir Rendah (BBLR 1000 - 2499 gram)', chapter: 'XVI', category: 'Bayi Baru Lahir / Neonatus' },
  { code: 'P21.9', desc: 'Asfiksia Lahir, Tidak Ditetapkan', chapter: 'XVI', category: 'Bayi Baru Lahir / Neonatus' },
  { code: 'P59.9', desc: 'Ikterus Neonatorum / Bayi Kuning, Tidak Ditetapkan', chapter: 'XVI', category: 'Bayi Baru Lahir / Neonatus' },
  { code: 'P22.0', desc: 'Respiratory Distress Syndrome (RDS) pada Bayi Baru Lahir', chapter: 'XVI', category: 'Bayi Baru Lahir / Neonatus' },
  { code: 'P36.9', desc: 'Sepsis Bakteri pada Bayi Baru Lahir, Tidak Ditetapkan', chapter: 'XVI', category: 'Bayi Baru Lahir / Neonatus' },
  { code: 'P00.0', desc: 'Janin dan Bayi Baru Lahir Terpengaruh Gangguan Hipertensi Ibu', chapter: 'XVI', category: 'Bayi Baru Lahir / Neonatus' },

  // S00 - T98 : Cedera & Keracunan
  { code: 'S00.9', desc: 'Cedera Dangkal Kepala, Bagian Tidak Ditetapkan', chapter: 'XIX', category: 'Trauma & Fraktur' },
  { code: 'S06.0', desc: 'Gegar Otak / Concussion / Cedera Kepala Ringan (CKR)', chapter: 'XIX', category: 'Trauma & Fraktur' },
  { code: 'S72.0', desc: 'Fraktur Leher Femur / Patah Tulang Paha', chapter: 'XIX', category: 'Trauma & Fraktur' },
  { code: 'S52.5', desc: 'Fraktur Ujung Bawah Radius (Colles Fracture)', chapter: 'XIX', category: 'Trauma & Fraktur' },
  { code: 'T14.0', desc: 'Luka Lecet / Vulnus Excoriatum, Tidak Ditetapkan', chapter: 'XIX', category: 'Trauma & Luka' },
  { code: 'T14.1', desc: 'Luka Terbuka / Vulnus Laceratum, Tidak Ditetapkan', chapter: 'XIX', category: 'Trauma & Luka' },
  { code: 'T30.0', desc: 'Luka Bakar, Luas dan Derajat Tidak Ditetapkan', chapter: 'XIX', category: 'Luka Bakar' },

  // Z00 - Z99 : Faktor Pelayanan Kesehatan
  { code: 'Z00.0', desc: 'Pemeriksaan Medis Umum / General Medical Check Up', chapter: 'XXI', category: 'Medical Check Up' },
  { code: 'Z30.0', desc: 'Konseling dan Pengelolaan Kontrasepsi / KB', chapter: 'XXI', category: 'Keluarga Berencana' },
  { code: 'Z49.1', desc: 'Hemodialisis Ekstrakorporeal / Terapi Cuci Darah', chapter: 'XXI', category: 'Tindakan Terjadwal' },
  { code: 'Z48.0', desc: 'Perawatan Jahitan / Penggantian Balutan Pasca Bedah', chapter: 'XXI', category: 'Kontrol Pasca Bedah' },
  { code: 'Z34.9', desc: 'Pengawasan Kehamilan Normal, Tidak Ditetapkan (ANC)', chapter: 'XXI', category: 'Kebidanan' },
];

export const EXTENDED_ICD9CM: ExtendedICD9CM[] = [
  // Prosedur Diagnostik & Monitoring
  { code: '89.52', desc: 'Elektrokardiogram (EKG 12 Sandapan)', category: 'Diagnostik Kardio' },
  { code: '89.13', desc: 'Pemeriksaan Saraf Lengkap (Neurological Exam)', category: 'Diagnostik Saraf' },
  { code: '88.72', desc: 'Ekokardiografi Diagnostik (USG Jantung)', category: 'USG' },
  { code: '88.79', desc: 'Ultrasonografi Abdomen (USG Abdomen)', category: 'USG' },
  { code: '88.78', desc: 'USG Kebidanan / Kandungan (Gravid Uterus)', category: 'USG' },
  { code: '87.44', desc: 'Rontgen Foto Thorax Rutin / Dada (X-Ray)', category: 'Radiologi' },
  { code: '87.41', desc: 'CT Scan Thorax', category: 'Radiologi' },
  { code: '87.03', desc: 'CT Scan Kepala / Otak', category: 'Radiologi' },
  { code: '88.38', desc: 'CT Scan Abdomen', category: 'Radiologi' },
  { code: '88.91', desc: 'Magnetic Resonance Imaging (MRI) Otak & Batang Otak', category: 'Radiologi' },
  { code: '88.56', desc: 'Arteriografi Koroner / Kateterisasi Jantung (CAG)', category: 'Kardiologi Intervensi' },
  { code: '45.13', desc: 'Endoskopi Saluran Cerna Atas (EGD / Gastroskopi)', category: 'Endoskopi' },
  { code: '45.23', desc: 'Kolonoskopi Fleksibel', category: 'Endoskopi' },

  // Prosedur Bedah & Operasi
  { code: '47.0', desc: 'Apendiktomi Terbuka / Pengangkatan Usus Buntu', category: 'Bedah Digestif' },
  { code: '47.01', desc: 'Apendiktomi Laparoskopi', category: 'Bedah Digestif' },
  { code: '53.00', desc: 'Perbaikan Hernia Inguinalis Unilateral (Herniotomi)', category: 'Bedah Digestif' },
  { code: '51.22', desc: 'Kolesistektomi Terbuka (Pengangkatan Kantung Empedu)', category: 'Bedah Digestif' },
  { code: '51.23', desc: 'Kolesistektomi Laparoskopi', category: 'Bedah Digestif' },
  { code: '54.11', desc: 'Laparotomi Eksplorasi', category: 'Bedah Digestif' },
  { code: '74.1', desc: 'Seksio Sesaria / Operasi Caesar Segmen Bawah', category: 'Bedah Kebidanan' },
  { code: '73.59', desc: 'Pertolongan Persalinan Spontan Manual', category: 'Kebidanan' },
  { code: '69.02', desc: 'Kuretase Uterus Pasca Abortus / Kuret', category: 'Kebidanan' },
  { code: '85.21', desc: 'Eksisi Lesi Payudara / Lumpektomi / Biopsi Mammae', category: 'Bedah Umum' },
  { code: '86.04', desc: 'Insisi dan Drainase Abses Kulit', category: 'Bedah Minor' },
  { code: '86.59', desc: 'Penjahitan Luka Kulit / Hecting Luka Terbuka', category: 'Bedah Minor' },
  { code: '86.22', desc: 'Debridement Eksisi Luka / Nekrotomi Luka Gangren', category: 'Bedah Minor' },
  { code: '79.35', desc: 'Reduksi Terbuka Fraktur Femur dengan Fiksasi Internal (ORIF Femur)', category: 'Bedah Ortopedi' },
  { code: '79.32', desc: 'Reduksi Terbuka Fraktur Radius/Ulna dengan Fiksasi Internal (ORIF)', category: 'Bedah Ortopedi' },
  { code: '81.51', desc: 'Artroplasti Total Lutut (Total Knee Replacement - TKR)', category: 'Bedah Ortopedi' },
  { code: '36.06', desc: 'Pemasangan Stent Koroner Jantung (Stenting)', category: 'Kardiologi Intervensi' },

  // Prosedur Terapi & Keperawatan / Tindakan Klinis
  { code: '38.93', desc: 'Pemasangan Kateter Intravena (Infus)', category: 'Tindakan Keperawatan' },
  { code: '38.97', desc: 'Pemasangan Central Venous Access (CVC)', category: 'Tindakan Intensif' },
  { code: '57.94', desc: 'Pemasangan Kateter Urin Menetap (Foley Catheter)', category: 'Tindakan Keperawatan' },
  { code: '96.07', desc: 'Pemasangan Pipa Nasogastrik (NGT)', category: 'Tindakan Keperawatan' },
  { code: '96.04', desc: 'Intubasi Endotrakeal (ETT)', category: 'Tindakan Gawat Darurat' },
  { code: '96.71', desc: 'Ventilasi Mekanik Kontinu < 96 Jam (Ventilator)', category: 'Tindakan Intensif' },
  { code: '99.60', desc: 'Resusitasi Jantung Paru (RJP / CPR)', category: 'Gawat Darurat' },
  { code: '99.62', desc: 'Kardioversi / Defibrilasi DC Shock', category: 'Gawat Darurat' },
  { code: '93.94', desc: 'Terapi Nebulisasi / Aerosol Saluran Napas', category: 'Terapi Respirasi' },
  { code: '93.96', desc: 'Oksigenasi / Terapi O2 Kanula / Masker', category: 'Terapi Respirasi' },
  { code: '99.04', desc: 'Transfusi Sel Darah Merah Pekat (Packed Red Cells / PRC)', category: 'Transfusi' },
  { code: '99.05', desc: 'Transfusi Trombosit Pekat (Thrombocyte Concentrate / TC)', category: 'Transfusi' },
  { code: '99.21', desc: 'Injeksi Antibiotik / Obat Intramuskular', category: 'Injeksi' },
  { code: '99.23', desc: 'Injeksi Steroid / Obat Intravena', category: 'Injeksi' },
  { code: '39.95', desc: 'Hemodialisis / Cuci Darah', category: 'Renal Dialisis' },
  { code: '93.83', desc: 'Fisioterapi / Rehabilitasi Medik', category: 'Rehabilitasi' },
  { code: '93.11', desc: 'Latihan Rentang Gerak Sendi (ROM)', category: 'Rehabilitasi' },
  { code: '96.59', desc: 'Perawatan & Pembersihan Luka / Wound Care', category: 'Keperawatan' },
  { code: '89.07', desc: 'Konsultasi Medis Spesialis (Visite Dokter)', category: 'Konsultasi' },
  { code: '90.59', desc: 'Pemeriksaan Mikroskopis Darah Lengkap', category: 'Laboratorium' },
];
