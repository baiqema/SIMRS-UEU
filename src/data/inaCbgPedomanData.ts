export interface InaCbgPedomanItem {
  id: number;
  category: 'KODING' | 'ADMINISTRASI' | 'MEDIS';
  chapter: string;
  diagnosaTitle: string;
  prosedurTitle?: string;
  aspekKoding?: string;
  aspekMedis?: string;
  perhatianKhusus?: string;
  keywords: string[];
  recommendedCodes?: string[];
}

export const INA_CBG_PEDOMAN_EDISI_2: InaCbgPedomanItem[] = [
  // BAB I: KODING
  {
    id: 1,
    category: 'KODING',
    chapter: 'I. Penyakit-Penyakit Infeksi dan Parasit Tertentu',
    diagnosaTitle: 'Typhoid Fever (A01)',
    prosedurTitle: '-',
    aspekKoding: 'Salmonella typhi A01.0; Paratyphoid A (A01.1), B (A01.2), C (A01.3). Typhoid pada kehamilan dikode O98.8 sebagai diagnosis utama dan A01.0 sebagai diagnosis sekunder (PMK No. 76/2016).',
    perhatianKhusus: 'Penegakan diagnosis sesuai KMK RI No. HK.02.02/MENKES/514/2015. Perhatikan sistem Dagger dan Asterisk.',
    keywords: ['tifoid', 'typhoid', 'salmonella', 'a01', 'a01.0', 'demam tifoid']
  },
  {
    id: 3,
    category: 'KODING',
    chapter: 'I. Penyakit-Penyakit Infeksi dan Parasit Tertentu',
    diagnosaTitle: 'Typhoid Fever (A01) dengan Diare/Gastroenteritis (A09)',
    prosedurTitle: '-',
    aspekKoding: 'Sesuai instruksi Excludes pada ICD-10 Vol. 1 sub bab A09, diare akibat organisme spesifik dikode pada penyebabnya. Kode A09 TIDAK dikoding lagi apabila sudah ada typhoid fever (A01.0). Gunakan kode tunggal A01.0.',
    perhatianKhusus: 'Diare yang merupakan gejala/bagian dari infeksi tifoid tidak perlu dikoding terpisah.',
    keywords: ['typhoid', 'tifoid', 'diare', 'a09', 'gastroenteritis', 'salmonella']
  },
  {
    id: 5,
    category: 'KODING',
    chapter: 'I. Penyakit-Penyakit Infeksi dan Parasit Tertentu',
    diagnosaTitle: 'TB Paru dengan Pneumonia / Bronkopneumonia',
    prosedurTitle: '-',
    aspekKoding: 'Secara kaidah ICD-10 terdapat kode A16.2 (Tuberculosis of lung) dengan penjelasan bahwa tuberculous pneumonia sudah termasuk (include) dalam kode A16.2. Tidak dikoding terpisah.',
    perhatianKhusus: 'Gunakan kode gabungan A15 / A16 sesuai hasil pemeriksaan penunjang.',
    keywords: ['tb', 'tuberkulosis', 'pneumonia', 'bronkopneumonia', 'a15', 'a16', 'a16.2']
  },
  {
    id: 15,
    category: 'KODING',
    chapter: 'I. Penyakit-Penyakit Infeksi dan Parasit Tertentu',
    diagnosaTitle: 'Sepsis dengan Syok Sepsis (A41.9 + R57.2)',
    prosedurTitle: '-',
    aspekKoding: 'Sesuai ICD-10 Vol. 1, kode Sepsis, unspecified (A41.9) disertai catatan "Use additional code (R57.2), if desired, to identify septic shock". Kode R57.2 digunakan sebagai diagnosis sekunder.',
    perhatianKhusus: 'Pasien datang dengan kondisi klinis syok sepsis, ada penatalaksanaan resusitasi cairan/vasopresor.',
    keywords: ['sepsis', 'syok sepsis', 'septic shock', 'a41.9', 'r57.2']
  },
  {
    id: 25,
    category: 'KODING',
    chapter: 'I. Penyakit-Penyakit Infeksi dan Parasit Tertentu',
    diagnosaTitle: 'Diagnosa Utama HIV dengan Diagnosa Sekunder TB',
    prosedurTitle: '-',
    aspekKoding: 'Menggunakan kode kombinasi B20.0 (HIV disease resulting in mycobacterial infection) sebagai diagnosa utama. TB tidak dikoding terpisah sebagai diagnosa sekunder.',
    perhatianKhusus: 'Sesuai kaidah koding PMK 76/2016.',
    keywords: ['hiv', 'tb', 'b20.0', 'tuberculosis', 'b20']
  },
  {
    id: 36,
    category: 'KODING',
    chapter: 'II. Neoplasma',
    diagnosaTitle: 'Soft Tissue Tumor (STT) & Prosedur Eksisi',
    prosedurTitle: 'Eksisi Jaringan (83.39 / 86.3)',
    aspekKoding: 'Kriteria STT rawat inap: narkose umum, meluas ke struktur vital, dimensi > 4 cm, keganasan, perlu rekonstruksi. Jika superfisial (subkutis) gunakan kode 86.3, jika dalam (otot/fascia/tendon) gunakan 83.39.',
    perhatianKhusus: 'Bila ada hasil patologi anatomi/biopsi gunakan kode 86.11 / 83.21.',
    keywords: ['stt', 'soft tissue', 'tumor', 'eksisi', '83.39', '86.3', 'lipoma']
  },
  {
    id: 48,
    category: 'KODING',
    chapter: 'IV. Penyakit-Penyakit Endokrin, Nutrisi dan Metabolik',
    diagnosaTitle: 'Diabetes Melitus dengan Gangguan Sirkulasi Perifer, Ulkus, atau Gangren',
    prosedurTitle: '-',
    aspekKoding: 'Sesuai kaidah ICD-10 sub bab E10-E14, gunakan kode kombinasi Diabetes with peripheral circulatory complications (karakter keempat .5, misal E11.5). Gangren dan ulkus tidak dikode terpisah sebagai diagnosis sekunder.',
    perhatianKhusus: 'Ulkus dekubitus murni yang bukan dipicu DM dikode tersendiri L89.',
    keywords: ['diabetes', 'dm', 'gangren', 'ulkus', 'e11.5', 'e10.5', 'diabetik']
  },
  {
    id: 50,
    category: 'KODING',
    chapter: 'IV. Penyakit-Penyakit Endokrin, Nutrisi dan Metabolik',
    diagnosaTitle: 'Diabetes Melitus dengan Gagal Ginjal Akut (AKI)',
    prosedurTitle: '-',
    aspekKoding: 'Tidak ada instruksi gabungan antara sub bab renal failure (N17-N19) dengan Diabetes (E10-E14). Tidak ada kode kombinasi antara DM dan AKI (N17.9). Keduanya dikoding terpisah.',
    perhatianKhusus: 'Diperlukan konfirmasi DPJP dan bukti kreatinin serum.',
    keywords: ['diabetes', 'dm', 'aki', 'gagal ginjal akut', 'n17', 'n17.9', 'e11']
  },
  {
    id: 53,
    category: 'KODING',
    chapter: 'IV. Penyakit-Penyakit Endokrin, Nutrisi dan Metabolik',
    diagnosaTitle: 'Kaidah Kode Dagger (†) dan Asterisk (*)',
    prosedurTitle: '-',
    aspekKoding: 'Kode dagger dan asterisk dikoding secara bersamaan. Kode dagger sebagai diagnosis utama, asterisk sebagai diagnosis sekunder. Contoh: Neuropati diabetik = E14.4† dan G63.2*.',
    perhatianKhusus: 'Dagger dan asterisk adalah kode dual classification resmi ICD-10.',
    keywords: ['dagger', 'asterisk', 'nefropati diabetik', 'retinopati', 'e11.2', 'n08.3']
  },
  {
    id: 61,
    category: 'KODING',
    chapter: 'VI. Penyakit-Penyakit Sistem Sirkulasi',
    diagnosaTitle: 'Hipertensi dengan Gagal Ginjal dan Gagal Jantung',
    prosedurTitle: '-',
    aspekKoding: 'Hipertensi dengan gagal ginjal dan gagal jantung dikode I13.2 (Hypertensive heart and renal disease with both heart and renal failure). Edema paru (J81) tidak dikoding terpisah karena sudah termasuk di dalamnya.',
    perhatianKhusus: 'Kriteria edema paru: sesak napas, ronki, takikardi, terapi diuretik dan oksigen.',
    keywords: ['hipertensi', 'gagal jantung', 'gagal ginjal', 'i13.2', 'edem paru', 'edema paru']
  },
  {
    id: 62,
    category: 'KODING',
    chapter: 'VI. Penyakit-Penyakit Sistem Sirkulasi',
    diagnosaTitle: 'Hypertensive Heart Disease dengan Gagal Jantung (HHD with CHF)',
    prosedurTitle: '-',
    aspekKoding: 'Kondisi gagal jantung (I50) yang disebabkan oleh hipertensi dikode I11.0 (Hypertensive heart disease with heart failure). CHF tidak dikode terpisah.',
    perhatianKhusus: 'Pastikan ada hubungan kausal antara hipertensi dan pembesaran/kelemahan jantung.',
    keywords: ['hhd', 'chf', 'i11.0', 'hipertensi heart disease', 'gagal jantung']
  },
  {
    id: 71,
    category: 'KODING',
    chapter: 'VI. Penyakit-Penyakit Sistem Sirkulasi',
    diagnosaTitle: 'Congestive Heart Failure (CHF) dengan Edema Paru',
    prosedurTitle: '-',
    aspekKoding: 'Apabila ditemukan tanda-tanda edema paru pada kasus gagal jantung kongestif (CHF), gunakan kode tunggal I50.1 (Left ventricular failure). Tidak perlu kode dobel I50.0 + J81.',
    perhatianKhusus: 'I50.1 mencakup cardiac asthma, pulmonary oedema with mention of heart failure.',
    keywords: ['chf', 'edema paru', 'i50.0', 'i50.1', 'left ventricular failure']
  },
  {
    id: 75,
    category: 'KODING',
    chapter: 'VI. Penyakit-Penyakit Sistem Sirkulasi',
    diagnosaTitle: 'Stroke Non-Hemorrhagic (I63) vs Hemorrhagic (I61) vs Sequelae (I69)',
    prosedurTitle: '-',
    aspekKoding: 'Stroke infark dikode I63 (Cerebral infarction) berdasarkan bukti CT Scan (+). Stroke perdarahan dikode I61. Riwayat stroke lama yang gejalanya menetap lebih dari 1 tahun dikode I69 (Sequelae of cerebrovascular disease).',
    perhatianKhusus: 'Kode I64 hanya digunakan jika tidak ada hasil penunjang imaging CT Scan/MRI.',
    keywords: ['stroke', 'infark', 'i63', 'i61', 'i64', 'i69', 'cva']
  },
  {
    id: 79,
    category: 'KODING',
    chapter: 'VII. Penyakit-Penyakit Sistem Pernafasan',
    diagnosaTitle: 'PPOK dengan Pneumonia / Infeksi Saluran Napas Bawah',
    prosedurTitle: '-',
    aspekKoding: 'Lebih tepat menggunakan kode kombinasi J44.0 (Chronic obstructive pulmonary disease with acute lower respiratory infection). Pneumonia tidak dikoding terpisah.',
    perhatianKhusus: 'Kode J44.0 sudah menggambarkan PPOK dengan infeksi sekunder saluran napas bawah.',
    keywords: ['ppok', 'pneumonia', 'j44.0', 'copd', 'infeksi saluran napas']
  },
  {
    id: 80,
    category: 'KODING',
    chapter: 'VII. Penyakit-Penyakit Sistem Pernafasan',
    diagnosaTitle: 'PPOK Eksaserbasi Akut dengan Pneumonia',
    prosedurTitle: '-',
    aspekKoding: 'Keadaan eksaserbasi akut (J44.1) dan pneumonia (J18.9) merupakan dua kondisi klinis berbeda yang membutuhkan tata laksana mandiri, sehingga dikoding terpisah J44.1 dan J18.9.',
    perhatianKhusus: 'Sesuai kesepakatan Tim Tarif Kemenkes dan Organisasi Profesi Paru.',
    keywords: ['ppok eksaserbasi', 'j44.1', 'pneumonia', 'j18.9', 'copd acute']
  },
  {
    id: 94,
    category: 'KODING',
    chapter: 'VIII. Penyakit-Penyakit Sistem Pencernaan',
    diagnosaTitle: 'Appendisitis Akut dengan Peritonitis / Perforasi (K35)',
    prosedurTitle: '-',
    aspekKoding: 'Apendisitis dengan peritonitis umum/perforasi dikode K35.2; dengan peritonitis lokal/abses dikode K35.3. Peritonitis tidak dikode terpisah sebagai diagnosis sekunder.',
    perhatianKhusus: 'Cukup menggunakan kode gabungan K35.- yang sesuai.',
    keywords: ['appendicitis', 'apendisitis', 'peritonitis', 'k35', 'k35.2', 'k35.3']
  },
  {
    id: 102,
    category: 'KODING',
    chapter: 'X. Penyakit-Penyakit Sistem Genitourinarius',
    diagnosaTitle: 'Batu Saluran Kemih dengan Infeksi Saluran Kemih (ISK) dan Hidronefrosis',
    prosedurTitle: '-',
    aspekKoding: 'Hydronephrosis with renal and ureteral calculous obstruction (N13.2) jika disertai infeksi (ISK) mengarah pada kode Pyonephrosis (N13.6). Jika hanya batu dan ISK tanpa hidronefrosis, cukup dikode N20-N23 (ISK exclude).',
    perhatianKhusus: 'Kode N13.6 menggabungkan hidronefrosis, batu, dan infeksi.',
    keywords: ['batu ginjal', 'hidronefrosis', 'isk', 'n13.6', 'n20', 'pyonephrosis']
  },
  {
    id: 126,
    category: 'KODING',
    chapter: 'XI. Kehamilan, Melahirkan, dan Nifas',
    diagnosaTitle: 'Kaidah Koding Kasus Persalinan (Normal & Sesar)',
    prosedurTitle: 'Persalinan Normal (73.59) / SC (74.0-74.99)',
    aspekKoding: 'Diagnosa penyulit/komplikasi menjadi diagnosis utama. Metode persalinan (O80/O82) dan hasil persalinan (Z37.-) menjadi diagnosis sekunder. Episiotomi dikode 73.6 (penjahitan include).',
    perhatianKhusus: 'Pada semua kasus persalinan wajib ditambahkan kode Z37.- (Outcome of delivery).',
    keywords: ['persalinan', 'sectio', 'sc', 'o80', 'o82', 'z37', 'episiotomi']
  },

  // BAB II: ADMINISTRASI
  {
    id: 201,
    category: 'ADMINISTRASI',
    chapter: 'Bab II. Administrasi Klaim INA-CBG',
    diagnosaTitle: 'Kelas Rawat Pasien di Ruang IGD / Observasi / Antara',
    prosedurTitle: '-',
    aspekKoding: 'Peserta yang dirawat di ruangan IGD atau ruang non-kelas seperti ruang observasi/peralihan dibayarkan setara dengan tarif Kelas 3.',
    perhatianKhusus: 'Sesuai regulasi administrasi klaim BPJS Kesehatan.',
    keywords: ['ruang igd', 'observasi', 'kelas 3', 'rawat inap igd', 'transit']
  },
  {
    id: 202,
    category: 'ADMINISTRASI',
    chapter: 'Bab II. Administrasi Klaim INA-CBG',
    diagnosaTitle: 'Obat Khusus Pembayaran Tambahan (Top Up INA-CBG)',
    prosedurTitle: '-',
    aspekKoding: 'Sesuai PMK No. 76 Tahun 2016, salah satu obat yang mendapat pembayaran tambahan (Top Up) dalam sistem INA-CBG adalah Streptokinase. Obat Alteplase, Reteplase, Tenecteplase tidak masuk top-up.',
    perhatianKhusus: 'Harus melampirkan bukti batch obat dan lembar observasi medis.',
    keywords: ['top up', 'streptokinase', 'alteplase', 'obat khusus', 'special drugs']
  },

  // BAB III: MEDIS / KLINIS
  {
    id: 301,
    category: 'MEDIS',
    chapter: 'Bab III. Kasus Medis & Kriteria Klinis',
    diagnosaTitle: 'Kriteria Klinis Syok Kardiogenik (R57.0)',
    prosedurTitle: '-',
    aspekMedis: 'Syok kardiogenik dapat ditegakkan sebagai diagnosis sekunder bila ada bukti: 1) Penurunan TD: TD < 90 mmHg tanpa inotropik atau TD < 80 mmHg dengan inotropik; 2) Penurunan Ejection Fraction (EF < 50%).',
    perhatianKhusus: 'Tidak boleh dikoding bila tidak ada bukti klinis tertulis dan tindakan inotropik/resusitasi.',
    keywords: ['syok kardiogenik', 'cardiogenic shock', 'r57.0', 'inotropik', 'ejection fraction']
  },
  {
    id: 303,
    category: 'MEDIS',
    chapter: 'Bab III. Kasus Medis & Kriteria Klinis',
    diagnosaTitle: 'Kriteria Penegakan Diagnosis Pneumonia (KMK 514/2015)',
    prosedurTitle: '-',
    aspekMedis: 'Pneumonia ditegakkan jika pada foto toraks terdapat infiltrat baru/progresif ditambah minimal 2 gejala: 1) Batuk bertambah; 2) Dahak purulen; 3) Suhu > 38°C; 4) Ronki/suara bronkial; 5) Leukosit > 10.000 atau < 4.500.',
    perhatianKhusus: 'Foto toraks PA/AP wajib dilampirkan sebagai bukti berkas penunjang klaim.',
    keywords: ['pneumonia', 'infiltrat', 'foto toraks', 'ronki', 'purulen', 'leukosit']
  },
  {
    id: 304,
    category: 'MEDIS',
    chapter: 'Bab III. Kasus Medis & Kriteria Klinis',
    diagnosaTitle: 'Kriteria Penegakan TB Paru (A15 vs A16)',
    prosedurTitle: '-',
    aspekMedis: 'TB Paru A15.- digunakan bila hasil pemeriksaan bakteriologis (BTA mikroskopis, Tes Cepat Molekuler/TCM, Kultur) positif. Jika hasil BTA/TCM negatif namun klinis dan radiologis mendukung, gunakan A16.-.',
    perhatianKhusus: 'Pasien wajib mendapatkan tata laksana Obat Anti Tuberkulosis (OAT).',
    keywords: ['tb paru', 'bta', 'tcm', 'a15', 'a16', 'oat', 'tuberkulosis']
  },
  {
    id: 307,
    category: 'MEDIS',
    chapter: 'Bab III. Kasus Medis & Kriteria Klinis',
    diagnosaTitle: 'Kriteria Penegakan Gagal Ginjal Akut (AKI - N17)',
    prosedurTitle: '-',
    aspekMedis: 'Kriteria AKI (KDIGO): Peningkatan kreatinin serum >= 0.3 mg/dl dalam 48 jam, atau peningkatan >= 1.5 kali dari baseline, atau volume urine < 0.5 ml/kg BB/jam selama > 6 jam.',
    perhatianKhusus: 'Diperlukan pemeriksaan kreatinin serial dan catatan output urine.',
    keywords: ['aki', 'gagal ginjal akut', 'kreatinin', 'n17', 'oliguria']
  },
  {
    id: 316,
    category: 'MEDIS',
    chapter: 'Bab III. Kasus Medis & Kriteria Klinis',
    diagnosaTitle: 'Kriteria Penegakan Efusi Pleura (J90)',
    prosedurTitle: 'Pungsi Pleura / Torakosentesis (34.91)',
    aspekMedis: 'Efusi pleura dapat dikoding bila: 1) Terbukti ada cairan lewat tindakan pungsi pleura / torakosentesis; atau 2) Imaging (foto toraks lateral dekubitus / CT Scan) menunjukkan ketebalan cairan >= 10 mm disertai tatalaksana khusus.',
    perhatianKhusus: 'Efusi minimal tanpa tindakan dan tanpa tatalaksana tidak dikoding tersendiri.',
    keywords: ['efusi pleura', 'pungsi', 'torakosentesis', 'j90', 'cairan pleura']
  },
  {
    id: 317,
    category: 'MEDIS',
    chapter: 'Bab III. Kasus Medis & Kriteria Klinis',
    diagnosaTitle: 'Kriteria Penegakan Gagal Napas Akut (J96.0)',
    prosedurTitle: 'Ventilasi Oksigen / CPAP / Ventilator (96.71)',
    aspekMedis: 'Kriteria gagal napas akut (AGDA): 1) pO2 < 60 mmHg dan/atau SaO2 < 91%; 2) Pulse oksimetri SpO2 < 91%; 3) Rasio P/F < 300; 4) pCO2 > 50 mmHg dengan pH < 7.35.',
    perhatianKhusus: 'Wajib ada bukti analisis gas darah (AGD) atau rekaman saturasi serial beserta terapi oksigen/ventilator.',
    keywords: ['gagal napas', 'respiratory failure', 'j96.0', 'agda', 'spo2', 'ventilator']
  },
  {
    id: 343,
    category: 'MEDIS',
    chapter: 'Bab III. Kasus Medis & Kriteria Klinis',
    diagnosaTitle: 'Kriteria Penegakan Sepsis (SIRS + Infeksi)',
    prosedurTitle: '-',
    aspekMedis: 'Sepsis ditegakkan bila memenuhi minimal 2 kriteria SIRS: 1) Suhu > 38.5°C atau < 36°C; 2) HR > 90 x/m; 3) RR > 20 x/m atau PaCO2 < 32 mmHg; 4) Leukositosis > 12.000 atau leukopenia < 4.000, serta bukti infeksi dan kultur darah bakterimia.',
    perhatianKhusus: 'Wajib ada pemberian antibiotik empiris/definitif parenteral.',
    keywords: ['sepsis', 'sirs', 'septikemia', 'a41.9', 'kultur darah']
  }
];

/**
 * Mencocokkan teks diagnosis dan prosedur dengan Panduan Manual Verifikasi Klaim INA-CBG Edisi 2
 */
export const findMatchingInaCbgPedoman = (
  diagnosisText: string,
  procedureText?: string
): InaCbgPedomanItem[] => {
  if (!diagnosisText && !procedureText) return [];

  const textToScan = `${diagnosisText || ''} ${procedureText || ''}`.toLowerCase();

  return INA_CBG_PEDOMAN_EDISI_2.filter(item => {
    return item.keywords.some(kw => textToScan.includes(kw.toLowerCase()));
  });
};
