export interface QuizOption {
  key: 'A' | 'B' | 'C' | 'D';
  text: string;
}

export interface QuizQuestion {
  id: number;
  category: 'Pemahaman Dasar' | 'Regulasi & Legalitas' | 'Alur SIMRS & Klinis' | 'Pengodean ICD' | 'Analisis Kasus';
  question: string;
  caseContext?: string;
  options: QuizOption[];
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  explanation: string;
  conceptNote: string;
}

export interface MateriPraktikumSection {
  id: string;
  title: string;
  tujuan: {
    umum: string;
    khusus: string[];
  };
  dasarTeori: {
    ringkasan: string;
    poinPenting: { judul: string; deskripsi: string }[];
    regulasiTerkait: string[];
  };
  alatDanBahan: {
    perangkatKeras: string[];
    perangkatLunak: string[];
    dokumenDanFormulir: string[];
  };
  langkahPraktikum: {
    tahap: string;
    langkah: string[];
    tipsKlinis: string;
  }[];
}

export const MATERI_PRAKTIKUM: MateriPraktikumSection = {
  id: 'MODUL_SIMRS_RMIK_2026',
  title: 'Praktikum Sistem Informasi Manajemen Rumah Sakit (SIMRS) & Rekam Medis Elektronik (RME)',
  tujuan: {
    umum: 'Mahasiswa mampu memahami, mengoperasikan, dan mengevaluasi alur pelayanan pasien berbasis Rekam Medis Elektronik (RME) yang terintegrasi di rumah sakit sesuai standar regulasi Kemenkes RI dan STARKES.',
    khusus: [
      'Memahami regulasi penyelenggaraan RME berdasarkan Permenkes No. 24 Tahun 2022 dan KMK No. HK.01.07/MENKES/1423/2022.',
      'Mampu melaksanakan alur pendaftaran pasien baru dan lama (Rawat Jalan, IGD, dan Rawat Inap).',
      'Memahami dan menerapkan pengisian persetujuan umum (General Consent) dan persetujuan tindakan medis (Informed Consent) beserta tanda tangan elektronik.',
      'Mengoperasikan pencatatan integrasi klinis CPPT dengan format SOAP/SBAR/ADIME.',
      'Melakukan pengodean diagnosis utama dan sekunder menggunakan ICD-10 serta pengodean prosedur medis menggunakan ICD-9-CM.',
      'Mampu menganalisis alur penjaminan pembiayaan (BPJS Kesehatan/VClaim) dan pelaporan rumah sakit.'
    ]
  },
  dasarTeori: {
    ringkasan: 'SIMRS adalah sistem teknologi informasi komunikasi yang memproses dan mengintegrasikan seluruh alur proses pelayanan rumah sakit. Penyelenggaraan RME bersifat wajib bagi seluruh fasilitas pelayanan kesehatan sesuai Permenkes No. 24 Tahun 2022.',
    poinPenting: [
      {
        judul: 'Pemberian Nomor Rekam Medis Unik (Unit Numbering System)',
        deskripsi: 'Setiap pasien hanya memiliki satu Nomor Rekam Medis seumur hidup yang digunakan untuk seluruh kunjungan pelayanan (Rawat Jalan, IGD, Rawat Inap).'
      },
      {
        judul: 'Legalitas General Consent vs Informed Consent',
        deskripsi: 'General Consent (Persetujuan Umum) disetujui saat admisi/pendaftaran untuk tindakan rutin non-invasif. Informed Consent (Persetujuan Tindakan Medis) wajib diperoleh khusus sebelum tindakan kedokteran invasif dan berisiko tinggi oleh DPJP.'
      },
      {
        judul: 'Catatan Perkembangan Pasien Terintegrasi (CPPT)',
        deskripsi: 'Dokumentasi asuhan interprofesional (Dokter, Perawat, Bidan, Ahli Gizi, Farmasis) secara terintegrasi berurutan kronologis menggunakan metode SOAP.'
      },
      {
        judul: 'Kaidah Morbiditas ICD-10 & Tindakan ICD-9-CM',
        deskripsi: 'Diagnosis utama adalah diagnosis yang ditegakkan pada akhir episode perawatan yang menjadi alasan utama pasien dirawat. Diagnosis sekunder mencakup komorbiditas dan komplikasi.'
      },
      {
        judul: 'Keamanan, Kerahasiaan & Tanda Tangan Elektronik',
        deskripsi: 'Akses sistem diatur menggunakan Role-Based Access Control (RBAC). Setiap entri klinis dan persetujuan wajib dilengkapi penandaan tangan digital yang tersimpan dalam jejak audit (audit trail).'
      }
    ],
    regulasiTerkait: [
      'Undang-Undang RI No. 17 Tahun 2023 tentang Kesehatan',
      'Permenkes RI No. 24 Tahun 2022 tentang Rekam Medis',
      'KMK No. HK.01.07/MENKES/1423/2022 tentang Variabel dan Metadata Rekam Medis Elektronik',
      'Standar Akreditasi Rumah Sakit (STARKES) Kemenkes RI'
    ]
  },
  alatDanBahan: {
    perangkatKeras: [
      'Komputer PC / Laptop dengan spesifikasi minimal RAM 4GB dan prosesor multi-core',
      'Koneksi Jaringan Komputer Intranet RS / Internet Berkecepatan Stabil',
      'Perangkat Penunjuk (Mouse / Touchpad / Stylus Pen / Layar Sentuh untuk Tanda Tangan Digital)',
      'Printer Dokumen / Thermal Printer untuk Tracer, Barcode Pasien & Gelang Identitas'
    ],
    perangkatLunak: [
      'Web Browser Modern (Google Chrome / Mozilla Firefox / Microsoft Edge)',
      'Aplikasi SIMRS Terintegrasi Laboratorium RMIK Esa Unggul',
      'Modul Kamus Pencarian ICD-10 & ICD-9-CM Terintegrasi',
      'Simulator Bridging VClaim BPJS & SatuSehat Kemenkes'
    ],
    dokumenDanFormulir: [
      'Kartu Identitas Kependudukan (KTP / KIA / Kartu Keluarga) Pasien Simulasi',
      'Kartu Kepesertaan Asuransi / BPJS Kesehatan Digital',
      'Surat Rujukan FKTP / Surat Perintah Rawat Inap (SPRI)',
      'Lembar Pengkajian Asuhan Medis & Keperawatan (Formulir Elektronik)'
    ]
  },
  langkahPraktikum: [
    {
      tahap: '1. Login Pengguna & Penyesuaian Peran Hak Akses (RBAC)',
      langkah: [
        'Buka aplikasi SIMRS Esa Unggul melalui web browser.',
        'Pilih peran pengguna sesuai skenario praktikum (contoh: Petugas Pendaftaran, Dokter DPJP, Perawat, atau Perekam Medis/Coder).',
        'Verifikasi bahwa menu bilah sisi (sidebar) telah menyesuaikan dengan batasan kewenangan peran yang dipilih.'
      ],
      tipsKlinis: 'Perhatikan prinsip need-to-know: pengguna hanya dapat mengakses data medis yang relevan dengan tugas profesinya.'
    },
    {
      tahap: '2. Registrasi Pasien & Penandatanganan General Consent',
      langkah: [
        'Akses menu "Pendaftaran & IGD" -> Pilih jenis pasien (Pasien Baru atau Pasien Lama).',
        'Lakukan pencarian NIK/Nama untuk mencegah duplikasi No. RM.',
        'Lengkapi formulir registrasi sesuai KMK 1423 (data sosial, alamat berjenjang KTP, penanggung jawab, dan cara bayar).',
        'Buka dokumen General Consent, mintakan tanda tangan elektronik pasien/wali pada kanvas digital, simpan, dan cetak struk kunjungan.'
      ],
      tipsKlinis: 'Pastikan 16 digit NIK dan tanggal lahir divalidasi dengan cermat guna bridging SatuSehat ID yang valid.'
    },
    {
      tahap: '3. Pemeriksaan Klinis & Dokumentasi Asesmen CPPT (SOAP)',
      langkah: [
        'Akses menu "Pemeriksaan Rawat Jalan" atau "CPPT / Asesmen SOAP".',
        'Pilih pasien dari daftar antrean poliklinik.',
        'Lakukan pengkajian subjektif (Anamnesis/Keluhan Utama), objektif (TTV & Pemeriksaan Fisik), asesmen diagnosis kerja, dan rencana penatalaksanaan (Planning).',
        'Verifikasi dan tandatangani lembar pemeriksaan secara digital.'
      ],
      tipsKlinis: 'Setiap entri SOAP yang telah divalidasi akan otomatis mencatat ID tenaga medis, tanggal, jam, dan tercatat dalam Audit Trail.'
    },
    {
      tahap: '4. Pelaksanaan Informed Consent Tindakan Kedokteran',
      langkah: [
        'Jika pasien memerlukan tindakan operatif/invasif berisiko tinggi, akses menu "Informed Consent".',
        'Pilih referensi CPPT pasien dan klik "Buat Informed Consent".',
        'Isi rencana tindakan medis, diagnosis indikasi, tata cara prosedur, potensi risiko, komplikasi, dan prognosis.',
        'Goreskan tanda tangan elektronik dokter DPJP, pasien/wali, dan saksi perawat pada modal edit tanda tangan.',
        'Simpan dan cetak formulir resmi bukti persetujuan tindakan.'
      ],
      tipsKlinis: 'Informed consent wajib dilakukan sebelum tindakan dilakukan, bukan setelah tindakan selesai, kecuali dalam kondisi gawat darurat yang mengancam nyawa.'
    },
    {
      tahap: '5. Pengodean Diagnosis (ICD-10) & Tindakan Medis (ICD-9-CM)',
      langkah: [
        'Buka menu "Coding ICD-10 & ICD-9".',
        'Pilih berkas rekam medis pasien yang telah selesai dilayani.',
        'Pelajari diagnosis dokter pada resume medis atau CPPT.',
        'Gunakan fasilitas pencarian kode: tetapkan kode diagnosis utama (primary) dan diagnosis sekunder (komorbid/komplikasi) sesuai kaidah ICD-10.',
        'Tetapkan kode prosedur/operasi yang dilakukan sesuai kaidah ICD-9-CM.',
        'Kunci (Lock) status koding untuk mencegah perubahan data tanpa otorisasi.'
      ],
      tipsKlinis: 'Perhatikan kaidah dagger-asterisk: diagnosis penyebab utama menggunakan kode dagger (†) dan manifestasi organ menggunakan kode asterisk (*).'
    },
    {
      tahap: '6. Evaluasi Pelayanan, Resume Medis & Klaim Pembiayaan',
      langkah: [
        'Akses menu "Resume Medis" untuk meninjau ringkasan pulang pasien.',
        'Akses menu "Klaim & VClaim BPJS" untuk simulasi pengelompokan tarif INA-CBG berdasarkan diagnosis dan prosedur.',
        'Pastikan seluruh berkas pendukung terverifikasi lengkap.'
      ],
      tipsKlinis: 'Kelengkapan resume medis dan keakuratan kode ICD menentukan kecepatan proses verifikasi klaim BPJS Kesehatan.'
    }
  ]
};

export const QUIZ_SOAL_20: QuizQuestion[] = [
  {
    id: 1,
    category: 'Pemahaman Dasar',
    question: 'Berdasarkan Peraturan Menteri Kesehatan RI No. 24 Tahun 2022, kewajiban penyelenggaraan Rekam Medis Elektronik (RME) berlaku bagi:',
    options: [
      { key: 'A', text: 'Hanya Rumah Sakit Pemerintah kelas A dan B' },
      { key: 'B', text: 'Seluruh Fasilitas Pelayanan Kesehatan (Faskes) di Indonesia' },
      { key: 'C', text: 'Hanya fasilitas pelayanan kesehatan yang bekerjasama dengan BPJS Kesehatan' },
      { key: 'D', text: 'Puskesmas dan Klinik Pratama perkotaan saja' }
    ],
    correctAnswer: 'B',
    explanation: 'Permenkes No. 24 Tahun 2022 Pasal 3 secara tegas mewajibkan seluruh fasilitas pelayanan kesehatan (Rumah Sakit, Puskesmas, Klinik, Praktik Mandiri, Laboratorium, dan Apotek) untuk menyelenggarakan Rekam Medis Elektronik.',
    conceptNote: 'Permenkes 24/2022 berlaku universal untuk semua jenis Fasyankes tanpa memandang kelas atau kepemilikan.'
  },
  {
    id: 2,
    category: 'Pemahaman Dasar',
    question: 'Sistem penomoran rekam medis di mana seorang pasien memperoleh satu nomor rekam medis saat kunjungan pertama dan nomor tersebut digunakan terus untuk seluruh kunjungan berikutnya disebut:',
    options: [
      { key: 'A', text: 'Serial Numbering System (SNS)' },
      { key: 'B', text: 'Unit Numbering System (UNS)' },
      { key: 'C', text: 'Serial-Unit Numbering System (SUNS)' },
      { key: 'D', text: 'Alphabetical Numbering System (ANS)' }
    ],
    correctAnswer: 'B',
    explanation: 'Unit Numbering System (UNS) memberikan satu nomor rekam medis tetap untuk satu pasien yang digunakan seumur hidup untuk rawat jalan, rawat inap, maupun gawat darurat.',
    conceptNote: 'Serial Numbering System memberikan nomor baru pada tiap kunjungan, sedangkan Unit Numbering System mempertahankan satu nomor unik per pasien.'
  },
  {
    id: 3,
    category: 'Regulasi & Legalitas',
    question: 'Perbedaan mendasar yang paling tepat antara General Consent (Persetujuan Umum) dan Informed Consent (Persetujuan Tindakan Kedokteran) adalah:',
    options: [
      { key: 'A', text: 'General Consent ditandatangani oleh dokter penanggung jawab, sedangkan Informed Consent ditandatangani oleh perawat' },
      { key: 'B', text: 'General Consent mencakup persetujuan pelayanan umum saat admisi, sedangkan Informed Consent wajib untuk tindakan invasif/berisiko tinggi' },
      { key: 'C', text: 'General Consent hanya berlaku untuk pasien BPJS, sedangkan Informed Consent berlaku untuk pasien umum' },
      { key: 'D', text: 'General Consent dibuat setelah pasien pulang, sedangkan Informed Consent dibuat saat pendaftaran' }
    ],
    correctAnswer: 'B',
    explanation: 'General Consent diberikan saat pendaftaran untuk pemeriksaan diagnostik rutin dan asuhan umum. Informed Consent diwajibkan secara hukum sebelum tindakan medis operatif/invasif berisiko tinggi setelah dokter memberikan penjelasan lengkap.',
    conceptNote: 'General Consent = persetujuan umum admisi; Informed Consent = persetujuan khusus tindakan medis berisiko.'
  },
  {
    id: 4,
    category: 'Regulasi & Legalitas',
    question: 'Seorang pasien gawat darurat tiba di IGD dalam kondisi tidak sadar (koma) tanpa didampingi keluarga dan memerlukan tindakan resusitasi bedah darurat segera untuk menyelamatkan nyawa. Bagaimanakah ketentuan persetujuan tindakan medis (Informed Consent) dalam kondisi tersebut?',
    options: [
      { key: 'A', text: 'Tindakan medis tidak boleh dilakukan sampai ada keluarga yang menandatangani persetujuan' },
      { key: 'B', text: 'Dokter dapat langsung melakukan tindakan medis darurat demi keselamatan nyawa pasien tanpa persetujuan terlebih dahulu' },
      { key: 'C', text: 'Tindakan medis harus menunggu persetujuan tertulis dari Direktur Rumah Sakit terlebih dahulu' },
      { key: 'D', text: 'Pasien harus dipulangkan atau dirujuk karena tidak ada penanggung jawab keluarga' }
    ],
    correctAnswer: 'B',
    explanation: 'Dalam keadaan gawat darurat medis yang mengancam nyawa (life-saving) dan pasien tidak kompeten/keluarga tidak ada, dokter berwenang melakukan tindakan medis demi penyelamatan nyawa tanpa menunggu persetujuan (doktrin presumed consent / implied in law). Penjelasan diberikan setelah kondisi pasien stabil atau keluarga tiba.',
    conceptNote: 'Prinsip penyelamatan nyawa (life-saving) mengesampingkan keharusan persetujuan tertulis terlebih dahulu.'
  },
  {
    id: 5,
    category: 'Alur SIMRS & Klinis',
    question: 'Dalam pendokumentasian Catatan Perkembangan Pasien Terintegrasi (CPPT), komponen "O" (Objective) pada metode SOAP berisi data berupa:',
    options: [
      { key: 'A', text: 'Keluhan utama dan riwayat penyakit yang disampaikan langsung oleh pasien atau keluarga' },
      { key: 'B', text: 'Hasil pemeriksaan fisik, tanda-tanda vital (TTV), dan hasil pemeriksaan penunjang (Laboratorium/Radiologi)' },
      { key: 'C', text: 'Diagnosis kerja dan kesimpulan analisis klinis dari tenaga medis' },
      { key: 'D', text: 'Instruksi pemberian resep obat dan jadwal tindakan pemeriksaan lanjutan' }
    ],
    correctAnswer: 'B',
    explanation: 'S (Subjective) = keluhan pasien; O (Objective) = fakta terukur/hasil observasi klinis (tensi, nadi, lab, rontgen); A (Assessment) = analisis/diagnosis klinis; P (Plan) = rencana tindakan/terapi.',
    conceptNote: 'Objektif selalu berisi parameter fisik terukur dan data laboratorium/pemeriksaan penunjang.'
  },
  {
    id: 6,
    category: 'Alur SIMRS & Klinis',
    question: 'Metode komunikasi operan / serah terima pasien yang sangat direkomendasikan dalam keselamatan pasien dan standar akreditasi rumah sakit (STARKES) adalah:',
    options: [
      { key: 'A', text: 'SBAR (Situation, Background, Assessment, Recommendation)' },
      { key: 'B', text: 'SWOT (Strengths, Weaknesses, Opportunities, Threats)' },
      { key: 'C', text: 'FIFO (First In, First Out)' },
      { key: 'D', text: 'POS (Problem, Objective, Solution)' }
    ],
    correctAnswer: 'A',
    explanation: 'SBAR (Situation, Background, Assessment, Recommendation) merupakan kerangka komunikasi terstruktur yang diakui secara internasional untuk operan dinas (handover) antar tenaga kesehatan guna mencegah Kejadian Tidak Diharapkan (KTD).',
    conceptNote: 'SBAR adalah standar komunikasi efektif antar profesi kesehatan.'
  },
  {
    id: 7,
    category: 'Pengodean ICD',
    question: 'Kaidah dasar penentuan Diagnosis Utama (Primary Diagnosis) pada rekam medis pasien rawat inap menurut panduan ICD-10 WHO adalah:',
    options: [
      { key: 'A', text: 'Penyakit yang pertama kali ditulis dokter pada lembar riwayat masuk IGD' },
      { key: 'B', text: 'Kondisi yang ditegakkan pada akhir episode perawatan yang menjadi alasan utama pasien dirawat' },
      { key: 'C', text: 'Penyakit komplikasi dengan biaya perawatan atau pemakaian obat paling mahal' },
      { key: 'D', text: 'Penyakit kronis bawaan yang sudah diderita pasien selama bertahun-tahun' }
    ],
    correctAnswer: 'B',
    explanation: 'Sesuai volume 2 ICD-10 WHO, diagnosis utama adalah kondisi yang ditegakkan pada akhir episode perawatan yang bertanggung jawab paling utama atas kebutuhan pengobatan atau penyelidikan klinis pasien.',
    conceptNote: 'Diagnosis utama dinilai pada akhir episode perawatan (setelah seluruh pemeriksaan selesai), bukan sekadar keluhan awal.'
  },
  {
    id: 8,
    category: 'Pengodean ICD',
    question: 'Dalam sistem pengodean ICD-10, sistem "Dagger (†) and Asterisk (*)" digunakan untuk:',
    options: [
      { key: 'A', text: 'Menandakan tingkat keparahan penyakit gawat darurat dan non-darurat' },
      { key: 'B', text: 'Menghubungkan kode etiologi/penyebab penyakit dasar (†) dengan kode manifestasi organ klinis (*)' },
      { key: 'C', text: 'Membedakan antara pasien rawat jalan dengan pasien rawat inap' },
      { key: 'D', text: 'Menandai klaim BPJS yang disetujui dan yang ditolak verifikator' }
    ],
    correctAnswer: 'B',
    explanation: 'Sistem Dagger (†) menandakan penyakit penyebab/etiologi dasar (sebagai diagnosis utama), sedangkan Asterisk (*) menandakan manifestasi organ spesifik penyakit tersebut (tidak boleh berdiri sendiri sebagai diagnosis utama).',
    conceptNote: 'Kode Dagger (†) = etiologi primer; Kode Asterisk (*) = manifestasi klinis.'
  },
  {
    id: 9,
    category: 'Pengodean ICD',
    question: 'Sistem klasifikasi medis yang digunakan untuk mengode tindakan operatif, prosedur bedah, dan pemeriksaan diagnostik di fasilitas pelayanan kesehatan adalah:',
    options: [
      { key: 'A', text: 'ICD-10' },
      { key: 'B', text: 'ICD-9-CM (Clinical Modification Bagian Prosedur)' },
      { key: 'C', text: 'ICPC-2' },
      { key: 'D', text: 'SNOMED CT' }
    ],
    correctAnswer: 'B',
    explanation: 'ICD-10 digunakan untuk klasifikasi diagnosis penyakit, sedangkan ICD-9-CM (khususnya Volume 3) digunakan untuk pengodean prosedur tindakan medis/operasi.',
    conceptNote: 'ICD-10 = Diagnosis Penyakit; ICD-9-CM = Prosedur & Tindakan Medis.'
  },
  {
    id: 10,
    category: 'Alur SIMRS & Klinis',
    question: 'Indikator efisiensi pelayanan rawat inap yang mengukur persentase pemakaian tempat tidur pada periode waktu tertentu di rumah sakit disebut:',
    options: [
      { key: 'A', text: 'ALOS (Average Length of Stay)' },
      { key: 'B', text: 'BOR (Bed Occupancy Rate)' },
      { key: 'C', text: 'TOI (Turn Over Interval)' },
      { key: 'D', text: 'BTO (Bed Turn Over)' }
    ],
    correctAnswer: 'B',
    explanation: 'Bed Occupancy Rate (BOR) adalah persentase pemakaian tempat tidur pada satuan waktu tertentu (standar ideal Barber Johnson: 60% – 85%).',
    conceptNote: 'BOR mengukur okupansi tempat tidur, ALOS mengukur lama rawat, TOI mengukur hari kosong tempat tidur.'
  },
  {
    id: 11,
    category: 'Regulasi & Legalitas',
    question: 'Sesuai UU Kesehatan No. 17 Tahun 2023 dan Permenkes No. 24 Tahun 2022, kepemilikan isi rekam medis dan berkas fisik/elektronik rekam medis adalah:',
    options: [
      { key: 'A', text: 'Seluruh berkas dan isinya adalah milik dokter yang merawat sepenuhnya' },
      { key: 'B', text: 'Isi rekam medis milik pasien, sedangkan fisik/media dokumen rekam medis milik fasilitas pelayanan kesehatan' },
      { key: 'C', text: 'Seluruh data rekam medis adalah milik BPJS Kesehatan' },
      { key: 'D', text: 'Pasien tidak memiliki hak sama sekali atas isi rekam medisnya' }
    ],
    correctAnswer: 'B',
    explanation: 'Pasien berhak atas isi rekam medisnya (berhak memperoleh ringkasan medis, salinan resume, hasil lab). Media penyimpanan dokumen rekam medis (baik fisik maupun sistem elektronik) adalah milik fasyankes.',
    conceptNote: 'Isi informasi rekam medis = milik pasien; media / sistem penyimpanan = milik Faskes.'
  },
  {
    id: 12,
    category: 'Alur SIMRS & Klinis',
    question: 'Dalam sistem triase Instalasi Gawat Darurat (IGD) metode ATS/ESI, kategori pasien dengan prioritas tertinggi yang membutuhkan penanganan resusitasi segera tanpa penundaan (Immediate) ditandai dengan kode warna:',
    options: [
      { key: 'A', text: 'Hijau (Green)' },
      { key: 'B', text: 'Kuning (Yellow)' },
      { key: 'C', text: 'Merah (Red)' },
      { key: 'D', text: 'Hitam (Black)' }
    ],
    correctAnswer: 'C',
    explanation: 'Merah (P1/Resusitasi/Immediate) = kondisi kritis mengancam nyawa/jalan nafas; Kuning (P2/Urgent) = darurat non-ancaman nyawa segera; Hijau (P3/Non-Urgent) = cedera ringan; Hitam (P0/Meninggal).',
    conceptNote: 'Triase Merah mengindikasikan ancaman kegagalan sirkulasi/nafas yang wajib ditangani seketika.'
  },
  {
    id: 13,
    category: 'Alur SIMRS & Klinis',
    question: 'Pada modul SIMRS, dokumen ringkasan yang wajib dibuat oleh dokter penanggung jawab pelayanan (DPJP) saat pasien keluar dari rumah sakit yang berisi diagnosis akhir, ringkasan pengobatan, dan instruksi tindak lanjut disebut:',
    options: [
      { key: 'A', text: 'Tracer Rekam Medis' },
      { key: 'B', text: 'Resume Medis (Discharge Summary)' },
      { key: 'C', text: 'Surat Kematian' },
      { key: 'D', text: 'Buku Registrasi Harian' }
    ],
    correctAnswer: 'B',
    explanation: 'Resume Medis (Discharge Summary) adalah ringkasan seluruh riwayat asuhan pasien selama masa perawatan yang merangkum alasan dirawat, temuan penting, diagnosis akhir, tindakan, dan instruksi perawatan di rumah.',
    conceptNote: 'Resume Medis adalah dokumen penutup episode rawat yang menjadi acuan pengodean dan klaim.'
  },
  {
    id: 14,
    category: 'Pengodean ICD',
    question: 'Jika dalam berkas rekam medis tertulis diagnosis: "Demam Berdarah Dengue dengan Syok (Dengue Shock Syndrome)", manakah kode ICD-10 yang paling spesifik dan tepat?',
    options: [
      { key: 'A', text: 'R50.9 (Fever, unspecified)' },
      { key: 'B', text: 'A90 (Dengue fever / classical dengue)' },
      { key: 'C', text: 'A91 (Dengue haemorrhagic fever)' },
      { key: 'D', text: 'B34.9 (Viral infection, unspecified)' }
    ],
    correctAnswer: 'C',
    explanation: 'A91 adalah kode ICD-10 spesifik untuk Demam Berdarah Dengue (termasuk Dengue Shock Syndrome/DSS grade III & IV). A90 diperuntukkan bagi Dengue Fever klasik tanpa hemoragik.',
    conceptNote: 'Pilihlah selalu kode pada derajat spesifisitas tertinggi (DHF/DSS dikode A91).'
  },
  {
    id: 15,
    category: 'Regulasi & Legalitas',
    question: 'Keabsahan tanda tangan elektronik (Digital Signature) pada lembar Rekam Medis Elektronik diatur dalam peraturan perundang-undangan dengan syarat utama:',
    options: [
      { key: 'A', text: 'Harus berupa foto tanda tangan basah di atas kertas yang ditempel ke sistem' },
      { key: 'B', text: 'Memiliki data identitas penandatangan yang terverifikasi dan dapat menjamin keutuhan integritas data dari perubahan' },
      { key: 'C', text: 'Hanya boleh dibuat dengan cap jempol basah' },
      { key: 'D', text: 'Hanya berlaku jika disahkan oleh notaris publik' }
    ],
    correctAnswer: 'B',
    explanation: 'Menurut UU ITE dan Permenkes 24/2022, tanda tangan elektronik sah apabila memuat identitas penandatangan yang terverifikasi dan menjamin tidak ada perubahan data tanpa jejak sejak penandatanganan dilakukan.',
    conceptNote: 'Tanda tangan digital menjamin integritas (tidak diubah) dan autentisitas (keaslian penandatangan).'
  },
  {
    id: 16,
    category: 'Alur SIMRS & Klinis',
    question: 'Fungsi utama dari fitur "Audit Trail" (Jejak Audit) pada sistem Rekam Medis Elektronik adalah:',
    options: [
      { key: 'A', text: 'Menghitung total tagihan biaya rawat pasien secara otomatis' },
      { key: 'B', text: 'Merekam jejak riwayat aktivitas pengguna (siapa, kapan, apa yang diubah/dilihat/dihapus) untuk keamanan dan akuntabilitas hukum' },
      { key: 'C', text: 'Menyimpan salinan resep obat yang sudah diambil di apotek' },
      { key: 'D', text: 'Mengirimkan pesan pengingat jadwal kontrol ke nomor WhatsApp pasien' }
    ],
    correctAnswer: 'B',
    explanation: 'Audit Trail mencatat log keamanan setiap interaksi (User ID, IP Address, Timestamp, Operasi CREATE/READ/UPDATE/DELETE) sehingga menjamin akuntabilitas kepatuhan hukum dan mencegah manipulasi data rekam medis.',
    conceptNote: 'Audit Trail adalah pilar utama integritas hukum dan keamanan data RME.'
  },
  {
    id: 17,
    category: 'Analisis Kasus',
    question: 'Pasien rawat inap dengan diagnosis masuk: "Hipertensi Urgensi". Selama perawatan hari ke-3, pasien mengalami infeksi saluran kemih (ISK) akibat pemasangan kateter urine (CAUTI). Bagaimanakah penentuan kedudukan ISK dalam pengodean berkas rekam medis?',
    options: [
      { key: 'A', text: 'Diagnosis Utama' },
      { key: 'B', text: 'Diagnosis Komplikasi (Sekunder)' },
      { key: 'C', text: 'Tidak perlu dikode karena bukan keluhan saat masuk' },
      { key: 'D', text: 'Digabungkan menjadi satu kode dengan Hipertensi' }
    ],
    correctAnswer: 'B',
    explanation: 'ISK yang timbul selama masa rawat inap akibat tindakan medis diklasifikasikan sebagai Komplikasi (Diagnosis Sekunder). Diagnosis utama tetap kondisi yang menjadi alasan utama dirawat (Hipertensi Urgensi).',
    conceptNote: 'Komplikasi adalah kondisi yang muncul selama perawatan yang memperpanjang hari rawat atau menambah terapi.'
  },
  {
    id: 18,
    category: 'Alur SIMRS & Klinis',
    question: 'Dalam penjaminan pembiayaan BPJS Kesehatan melalui SIMRS, dokumen Surat Eligibilitas Peserta (SEP) diterbitkan berdasarkan:',
    options: [
      { key: 'A', text: 'Hanya formulir persetujuan umum pasien tanpa verifikasi data kepesertaan' },
      { key: 'B', text: 'Hasil bridging validasi nomor kartu BPJS/NIK, status keaktifan iuran, surat rujukan faskes tingkat pertama, dan hak kelas rawat' },
      { key: 'C', text: 'Bukti pembayaran tunai di kasir rumah sakit' },
      { key: 'D', text: 'Surat rekomendasi dari pihak kepolisian setempat' }
    ],
    correctAnswer: 'B',
    explanation: 'Penerbitan SEP memerlukan bridging VClaim untuk memastikan kepesertaan BPJS aktif, nomor rujukan FKTP masih berlaku (< 90 hari), kesesuaian diagnosis rujukan, dan penentuan hak kelas rawat inap.',
    conceptNote: 'SEP adalah bukti sah bahwa penjaminan biaya pelayanan pasien telah disetujui BPJS Kesehatan.'
  },
  {
    id: 19,
    category: 'Analisis Kasus',
    question: 'Seorang pasien wanita berusia 28 tahun melahirkan bayi tunggal secara Sectio Caesarea (SC) darurat karena indikasi Gawat Janin (Fetal Distress). Bagaimanakah pengodean tindakan SC tersebut dalam ICD-9-CM?',
    options: [
      { key: 'A', text: 'Dikode pada kategori 74.x (Cesarean section and removal of fetus)' },
      { key: 'B', text: 'Dikode pada kategori 88.x (Diagnostic radiology)' },
      { key: 'C', text: 'Dikode pada kategori 99.x (Other nonoperative procedures)' },
      { key: 'D', text: 'Cukup dikode diagnosis ICD-10 tanpa perlu kode ICD-9-CM' }
    ],
    correctAnswer: 'A',
    explanation: 'Dalam ICD-9-CM Bab 12 (Obstetrical Procedures), kode kategori 74 (seperti 74.1 Low cervical cesarean section) adalah kode resmi untuk prosedur persalinan seksio sesarea.',
    conceptNote: 'Sectio Caesarea merupakan prosedur bedah obstetri yang wajib dikode dalam kategori 74 pada ICD-9-CM.'
  },
  {
    id: 20,
    category: 'Pemahaman Dasar',
    question: 'Berdasarkan Keputusan Menteri Kesehatan No. 1423 Tahun 2022 tentang Variabel dan Metadata RME, data identitas pasien yang menjadi pengenal tunggal antar faskes terintegrasi platform SATUSEHAT adalah:',
    options: [
      { key: 'A', text: 'Nomor Rekam Medis Lokal Rumah Sakit' },
      { key: 'B', text: 'Nomor Induk Kependudukan (NIK) dan SATUSEHAT Patient ID' },
      { key: 'C', text: 'Nomor Plat Kendaraan Pasien' },
      { key: 'D', text: 'Nomor Kartu Keluarga semata' }
    ],
    correctAnswer: 'B',
    explanation: 'Platform SatuSehat Kemenkes menggunakan NIK (KTP/KIA) sebagai data referensi tunggal kependudukan nasional untuk menggenerate SATUSEHAT ID unik pasien yang menghubungkan rekam medis antar faskes di seluruh Indonesia.',
    conceptNote: 'NIK dan SatuSehat ID menjamin interoperabilitas data rekam medis lintas fasilitas kesehatan nasional.'
  }
];
