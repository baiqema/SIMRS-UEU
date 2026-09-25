import React, { useState } from 'react';
import { Patient, Registration, User } from '../types';
import {
  CheckCircle2, AlertTriangle, Activity, HeartPulse, FileText, Stethoscope,
  Clock, Save, Sparkles, Printer, UserCheck, ShieldCheck, Scale, Thermometer,
  FileSpreadsheet, ClipboardList, BookOpen, Layers, Check, ArrowUpRight,
  Plus, Edit3, Eye, X, RotateCcw, PenTool, CheckSquare, Maximize2
} from 'lucide-react';
import Swal from 'sweetalert2';
import { DigitalSignaturePad } from './DigitalSignaturePad';

interface AsuhanKeperawatanIgdModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient | null;
  registration: Registration | null;
  nurse?: User | null;
}

export const AsuhanKeperawatanIgdModal: React.FC<AsuhanKeperawatanIgdModalProps> = ({
  isOpen,
  onClose,
  patient,
  registration,
  nurse
}) => {
  // FORM MODE: 'view' | 'edit' | 'create'
  const [formMode, setFormMode] = useState<'view' | 'edit' | 'create'>('edit');

  // DIGITAL SIGNATURE STATE
  const [nurseSignName, setNurseSignName] = useState(nurse?.name || 'Ns. Rina Wulandari, S.Kep');
  const [nurseSignId, setNurseSignId] = useState('STR: 12.04.5.2.1.20.78912');
  const [nurseSignature, setNurseSignature] = useState('');

  const [doctorSignName, setDoctorSignName] = useState('dr. Budi Santoso, Sp.PD');
  const [doctorSignId, setDoctorSignId] = useState('SIP: 446/1029/DISKES/2023');
  const [doctorSignature, setDoctorSignature] = useState('');

  // PENGKAJIAN GENERAL DATA
  const [tglPengkajian, setTglPengkajian] = useState(() => new Date().toISOString().substring(0, 10));
  const [jamPengkajian, setJamPengkajian] = useState(() => new Date().toTimeString().substring(0, 5));
  const [sumberData, setSumberData] = useState<'Pasien' | 'Keluarga' | 'Lainnya'>('Pasien');
  const [sumberDataLain, setSumberDataLain] = useState('');
  const [ruangan, setRuangan] = useState('IGD / Bangsal Dahlia');
  const [tglMasuk, setTglMasuk] = useState(() => new Date().toISOString().substring(0, 10));
  const [jamMasuk, setJamMasuk] = useState('08:00');
  const [dikirimDari, setDikirimDari] = useState<'IGD' | 'Poliklinik' | 'Ruangan Lain'>('IGD');

  // IDENTITAS PASIEN LENGKAP (PDF Page 1)
  const [agama, setAgama] = useState('Islam');
  const [pendidikan, setPendidikan] = useState('SMA');
  const [pekerjaan, setPekerjaan] = useState('Swasta');
  const [statusPerkawinan, setStatusPerkawinan] = useState('Kawin');
  const [suku, setSuku] = useState('Jawa');
  const [kewarganegaraan, setKewarganegaraan] = useState('WNI');
  const [pembiayaan, setPembiayaan] = useState('BPJS');
  
  // PENANGGUNG JAWAB
  const [namaPJ, setNamaPJ] = useState('Siti Rahma');
  const [pekerjaanPJ, setPekerjaanPJ] = useState('Ibu Rumah Tangga');
  const [jenisKelaminPJ, setJenisKelaminPJ] = useState('Perempuan');
  const [alamatPJ, setAlamatPJ] = useState('Jl. Merdeka No. 45 Jakarta');
  const [hubunganPJ, setHubunganPJ] = useState('Istri');

  // RIWAYAT KESEHATAN
  const [alasanMasukRS, setAlasanMasukRS] = useState('Pasien mengeluh nyeri dada sebelah kiri menjalar ke lengan kiri dan leher sejak 2 jam sebelum masuk RS. Nyeri dirasakan seperti tertindih beban berat.');
  const [diagnosaMasukRS, setDiagnosaMasukRS] = useState('Acute Coronary Syndrome (ACS) / Nyeri Dada ec Susp. NAMI');
  const [diagnosaSaatIni, setDiagnosaSaatIni] = useState('STEMI Anteroseptal, Hipertensi Grade II');
  const [keluhanSaatIni, setKeluhanSaatIni] = useState('Nyeri dada berkurang dengan pemberian ISDN sublingual dan oksigen, masih terasa lemas dan sesak ringan saat bergerak.');

  // KEADAAN UMUM & VITAL SIGNS (PDF Page 2)
  const [keadaanUmum, setKeadaanUmum] = useState<'Sakit Ringan' | 'Sedang' | 'Berat'>('Sedang');
  const [keadaanAlasan, setKeadaanAlasan] = useState<string[]>(['berbaring lemah', 'sesak nafas']);
  const [kesadaran, setKesadaran] = useState('Compos mentis');
  const [gcsE, setGcsE] = useState('4');
  const [gcsV, setGcsV] = useState('5');
  const [gcsM, setGcsM] = useState('6');
  const [td, setTd] = useState('140/90');
  const [nadi, setNadi] = useState('88');
  const [rr, setRr] = useState('22');
  const [suhu, setSuhu] = useState('36.7');
  const [spo2, setSpo2] = useState('97');
  const [tb, setTb] = useState('168');
  const [bb, setBb] = useState('65');

  // RIWAYAT PENYAKIT TERDAHULU & PROSEDUR INVASIF
  const [riwayatPenyakit, setRiwayatPenyakit] = useState('Hipertensi sejak 3 tahun lalu, berobat rutin Amlodipine.');
  const [tindakanSebelumnya, setTindakanSebelumnya] = useState('Minum obat antihipertensi dari faskes 1.');
  const [alergi, setAlergi] = useState('Tidak ada (Alergi makanan/obat disangkal)');
  const [imunisasiDasar, setImunisasiDasar] = useState('Lengkap');
  const [imunisasiTambahan, setImunisasiTambahan] = useState('Vaksin Covid-19 Booster 2');
  const [obatRutin, setObatRutin] = useState('Amlodipine 10mg 1x1');
  const [kebiasaan, setKebiasaan] = useState('Merokok 1 bungkus/hari');

  // PROSEDUR INVASIF TERPASANG
  const [o2Jenis, setO2Jenis] = useState('Nasal Canula');
  const [o2Lpm, setO2Lpm] = useState('3');
  const [kateterUrine, setKateterUrine] = useState('Terpasang, 500 cc/8jam');
  const [infusLokasi, setInfusLokasi] = useState('Tangan Kanan');
  const [infusCairan, setInfusCairan] = useState('RL 20 tts/menit');

  // PSIKOSOSIAL & SPIRITUAL (PDF Page 2 & 3)
  const [bahasa, setBahasa] = useState('Indonesia / Jawa');
  const [bicara, setBicara] = useState('Jelas');
  const [persepsiSakit, setPersepsiSakit] = useState('Pasien memahami penyakitnya dan berharap cepat sembuh');
  const [ibadah, setIbadah] = useState('Sholat 5 waktu di atas tempat tidur');
  const [perluRohaniawan, setPerluRohaniawan] = useState('Ya');

  // POLA KEBIASAAN SAAT INI (PDF Page 3 & 4)
  const [nafsuMakan, setNafsuMakan] = useState('Berkurang');
  const [frekuensiMakan, setFrekuensiMakan] = useState('3x sehari');
  const [porsiMakan, setPorsiMakan] = useState('1/2 porsi');
  const [minumSebanyak, setMinumSebanyak] = useState('1500 cc / hari');
  const [eliminasiBAB, setEliminasiBAB] = useState('1x / hari, konsistensi lunak, warna kuning kecoklatan');
  const [eliminasiBAK, setEliminasiBAK] = useState('4-5x / hari via kateter, warna kuning jernih');
  const [polaIstirahat, setPolaIstirahat] = useState('Tidur malam 6 jam, sering terbangun karena nyeri dada');
  const [aktivitas, setAktivitas] = useState('Ditolong dengan bantuan minimum');
  const [kebersihan, setKebersihan] = useState('Diseka 2x sehari oleh keluarga & perawat');

  // PENGKAJIAN NYERI (PDF Page 4)
  const [nyeriAda, setNyeriAda] = useState('Ya');
  const [nyeriSkala, setNyeriSkala] = useState('5');
  const [nyeriLokasi, setNyeriLokasi] = useState('Dada Kiri');
  const [nyeriFrekuensi, setNyeriFrekuensi] = useState('Hilang timbul');
  const [nyeriLama, setNyeriLama] = useState('15-30 menit');
  const [nyeriMenjalar, setNyeriMenjalar] = useState('Ya, ke lengan kiri');
  const [nyeriKualitas, setNyeriKualitas] = useState('Seperti tertindih beban berat');
  const [nyeriPemicu, setNyeriPemicu] = useState('Aktivitas fisik');
  const [nyeriPereda, setNyeriPereda] = useState('Istirahat baring & ISDN');

  // PEMERIKSAAN FISIK HEAD TO TOE (PDF Page 4, 5, 6, 7)
  const [pMata, setPMata] = useState('Pupil isokor 3mm/3mm, Sclera tidak ikterik, Konjungtiva tidak anemis');
  const [pHidung, setPHidung] = useState('Bersih, tidak ada polip, tidak ada perdarahan');
  const [pTelinga, setPTelinga] = useState('Bersih, tidak ada cairan/serumen berlebih');
  const [pMulut, setPMulut] = useState('Mukosa bibir agak kering, tidak ada sariawan/caries');
  const [pLeher, setPLeher] = useState('JVP 5+2 cmH2O, Kelenjar tiroid tidak membengkak');
  const [pThoraxPernapasan, setPThoraxPernapasan] = useState('Bentuk dadan Nomochest, simetris, vesikuler (+/+), ronkhi (-/-), wheezing (-/-)');
  const [pKardiovaskuler, setPKardiovaskuler] = useState('S1 S2 tunggal reguler, murmur (-), gallop (-), CRT < 2 detik, akral hangat');
  const [pGastrointestinal, setPGastrointestinal] = useState('Abdomen datar, supel, bising usus 12x/mnt, nyeri tekan ulu hati (+)');
  const [pMuskuloskeletal, setPMuskuloskeletal] = useState('Tidak ada fraktur, mobilitas dibantu, kekuatan otot 5/5/5/5 pada 4 ekstremitas');
  const [pNeurologi, setPNeurologi] = useState('Tidak ada kesulitan bicara, tidak ada tremor, kelemahan anggota gerak (-)');
  const [pIntegumen, setPIntegumen] = useState('Warna kulit agak pucat, turgor kulit elastis, tidak ada dekubitus');

  // SKRINING NUTRISI MST & RUMUS MIFFLIN (PDF Page 7)
  const [mstPenurunanBB, setMstPenurunanBB] = useState('0'); // 0 to 4
  const [mstNafsuMakan, setMstNafsuMakan] = useState('1'); // 0 or 1
  const [mstSakitBerat, setMstSakitBerat] = useState('1'); // 0 or 1

  // PENILAIAN RESIKO JATUH SKALA MORSE (PDF Page 7 & 8)
  const [morseRiwayatJatuh, setMorseRiwayatJatuh] = useState('0');
  const [morseDiagnosaSekunder, setMorseDiagnosaSekunder] = useState('15');
  const [morseAlatBantu, setMorseAlatBantu] = useState('0');
  const [morseTerapiIV, setMorseTerapiIV] = useState('20');
  const [morseGayaBerjalan, setMorseGayaBerjalan] = useState('10');
  const [morseStatusMental, setMorseStatusMental] = useState('0');

  // BRADEN SCALE - PRESSURE ULCER (PDF Page 8)
  const [bradenSensori, setBradenSensori] = useState('4');
  const [bradenKelembaban, setBradenKelembaban] = useState('3');
  const [bradenAktivitas, setBradenAktivitas] = useState('2');
  const [bradenMobilisasi, setBradenMobilisasi] = useState('3');
  const [bradenNutrisi, setBradenNutrisi] = useState('3');
  const [bradenFriksi, setBradenFriksi] = useState('2');

  // ASSESSMEN FUNGSIONAL BARTHEL INDEX (PDF Page 8 & 9)
  const [barthelBab, setBarthelBab] = useState('2');
  const [barthelBak, setBarthelBak] = useState('2');
  const [barthelDiri, setBarthelDiri] = useState('1');
  const [barthelToilet, setBarthelToilet] = useState('1');
  const [barthelMakan, setBarthelMakan] = useState('2');
  const [barthelPindah, setBarthelPindah] = useState('2');
  const [barthelMobil, setBarthelMobil] = useState('2');
  const [barthelBaju, setBarthelBaju] = useState('2');
  const [barthelTangga, setBarthelTangga] = useState('1');
  const [barthelMandi, setBarthelMandi] = useState('1');

  // EDUKASI, DISCHARGE PLANNING, ORIENTASI (PDF Page 9 & 10)
  const [edukasiPenyakit, setEdukasiPenyakit] = useState('Edukasi pencegahan serangan jantung berulang & diet rendah garam/kolesterol');
  const [orientasiRuangan, setOrientasiRuangan] = useState(true);

  // DIAGNOSA KEPERAWATAN (SDKI/SLKI/SIKI)
  const [diagKeperawatan, setDiagKeperawatan] = useState('Nyeri Akut b.d Agen Pencedera Fisiologis (Iskemia Miokard)');
  const [diagTujuan, setDiagTujuan] = useState('Setelah dilakukan tindakan keperawatan 1x24 jam, tingkat nyeri menurun dengan kriteria keluhan nyeri meringis berkurang, frekuensi nadi membaik.');
  const [diagIntervensi, setDiagIntervensi] = useState('1. Identifikasi lokasi, karakteristik, durasi, frekuensi, kualitas, dan intensitas nyeri\n2. Berikan teknik nonfarmakologis (relaksasi napas dalam)\n3. Kontrol lingkungan yang memperberat rasa nyeri\n4. Kolaborasi pemberian analgetik & antiangina sesuai advis DPJP');

  if (!patient || !registration) return null;

  // CALCULATED SCORES
  const totalMst = parseInt(mstPenurunanBB) + parseInt(mstNafsuMakan) + parseInt(mstSakitBerat);
  const totalMorse = parseInt(morseRiwayatJatuh) + parseInt(morseDiagnosaSekunder) + parseInt(morseAlatBantu) + parseInt(morseTerapiIV) + parseInt(morseGayaBerjalan) + parseInt(morseStatusMental);
  const totalBraden = parseInt(bradenSensori) + parseInt(bradenKelembaban) + parseInt(bradenAktivitas) + parseInt(bradenMobilisasi) + parseInt(bradenNutrisi) + parseInt(bradenFriksi);
  const totalBarthel = parseInt(barthelBab) + parseInt(barthelBak) + parseInt(barthelDiri) + parseInt(barthelToilet) + parseInt(barthelMakan) + parseInt(barthelPindah) + parseInt(barthelMobil) + parseInt(barthelBaju) + parseInt(barthelTangga) + parseInt(barthelMandi);

  // IMT Calculation
  const heightM = parseFloat(tb) / 100 || 1.68;
  const weightKg = parseFloat(bb) || 65;
  const imtValue = (weightKg / (heightM * heightM)).toFixed(1);

  // TEE Mifflin calculation sample
  const bmrMifflin = Math.round((10 * weightKg) + (6.25 * (parseFloat(tb) || 168)) - (5 * 45) + (patient.gender === 'M' ? 5 : -161));
  const teeMifflin = Math.round(bmrMifflin * 1.375);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleAddNewRecord = () => {
    setFormMode('create');
    setTglPengkajian(new Date().toISOString().substring(0, 10));
    setJamPengkajian(new Date().toTimeString().substring(0, 5));
    setAlasanMasukRS('');
    setDiagnosaMasukRS('');
    setDiagnosaSaatIni('');
    setKeluhanSaatIni('');
    setKeadaanUmum('Sedang');
    setGcsE('4');
    setGcsM('6');
    setGcsV('5');
    setTd('120/80');
    setNadi('80');
    setRr('20');
    setSuhu('36.5');
    setSpo2('99');
    setDiagKeperawatan('');
    setDiagTujuan('');
    setDiagIntervensi('');
    setNurseSignature('');
    setDoctorSignature('');
    Swal.fire({
      icon: 'info',
      title: 'Formulir Baru Dimuat',
      text: 'Mode tambah pengkajian keperawatan baru aktif. Silakan lengkapi formulir.',
      timer: 1500,
      showConfirmButton: false,
    });
  };

  const handleEditRecord = () => {
    setFormMode('edit');
    Swal.fire({
      icon: 'info',
      title: 'Mode Edit Diaktifkan',
      text: 'Semua isian formulir asuhan keperawatan dapat diubah sekarang.',
      timer: 1500,
      showConfirmButton: false,
    });
  };

  const handleViewMode = () => {
    setFormMode('view');
  };

  const handleSaveAll = () => {
    setFormMode('view');
    Swal.fire({
      icon: 'success',
      title: formMode === 'create' ? 'Pengkajian Keperawatan Baru Berhasil Disimpan!' : 'Perubahan Pengkajian Keperawatan Berhasil Diperbarui!',
      text: 'Seluruh data 10 sub-modul Pengkajian Keperawatan Individu dan Tanda Tangan berhasil disimpan ke Rekam Medis Pasien.',
      confirmButtonColor: '#0284c7'
    });
  };

  const handlePrint = () => {
    window.print();
  };

  if (!isOpen || !patient || !registration) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex flex-col w-screen h-screen overflow-hidden animate-fade-in text-slate-800 text-xs">
      <div className="flex flex-col w-full h-full bg-slate-100 overflow-hidden">
        
        {/* TOP APPLICATION HEADER (FULL PAGE) */}
        <header className="bg-white border-b border-slate-200 px-4 py-2.5 shrink-0 flex items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3">
            <img
              src="/logo-esaunggul.png"
              alt="Logo Universitas Esa Unggul"
              className="h-9 w-auto object-contain bg-white rounded-lg p-0.5 border border-slate-200 shadow-2xs"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
                  Formulir Pengkajian & Asuhan Keperawatan Individu (Full Halaman SIMRS)
                </h1>
                {formMode === 'create' && (
                  <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 font-black text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Plus className="w-3 h-3" /> Mode Tambah Baru
                  </span>
                )}
                {formMode === 'edit' && (
                  <span className="bg-amber-100 text-amber-800 border border-amber-300 font-black text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Edit3 className="w-3 h-3" /> Mode Edit Aktif
                  </span>
                )}
                {formMode === 'view' && (
                  <span className="bg-slate-100 text-slate-700 border border-slate-300 font-black text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Eye className="w-3 h-3" /> Mode Lihat / Terkunci
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500">
                Dokumentasi RME 10 Sub-Modul KMK HK.01.07/MENKES/1423/2022 & Standar SDKI-SLKI-SIKI
              </p>
            </div>
          </div>

          {/* MENU TAMBAH/EDIT & ACTIONS */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Mode Switcher Buttons */}
            <div className="bg-slate-100 p-1 rounded-xl border border-slate-200 flex items-center gap-1">
              <button
                type="button"
                onClick={handleAddNewRecord}
                className={`px-2.5 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                  formMode === 'create'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-700 hover:bg-white'
                }`}
                title="Tambah Pengkajian Keperawatan Baru"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Tambah Baru</span>
              </button>

              <button
                type="button"
                onClick={handleEditRecord}
                className={`px-2.5 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                  formMode === 'edit'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'text-slate-700 hover:bg-white'
                }`}
                title="Buka Mode Edit untuk Mengubah Data"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Pengkajian</span>
              </button>

              <button
                type="button"
                onClick={handleViewMode}
                className={`px-2.5 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                  formMode === 'view'
                    ? 'bg-slate-700 text-white shadow-xs'
                    : 'text-slate-700 hover:bg-white'
                }`}
                title="Kunci Form (Mode Lihat / Read-Only)"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Mode Lihat</span>
              </button>
            </div>

            <button
              type="button"
              onClick={handlePrint}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold flex items-center gap-1.5 border border-slate-300 transition-all cursor-pointer text-xs"
              title="Cetak Formulir Pengkajian"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cetak</span>
            </button>

            <button
              type="button"
              onClick={handleSaveAll}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer text-xs"
              title="Simpan Semua Perubahan"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Simpan</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-600 rounded-xl border border-slate-200 transition-all cursor-pointer"
              title="Tutup Halaman (Kembali)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* SCROLLABLE FULL PAGE BODY */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
          
          {/* BANNER NOTIFIKASI MODE */}
          {formMode === 'view' && (
            <div className="bg-amber-50 border border-amber-300 text-amber-900 px-4 py-2.5 rounded-xl flex items-center justify-between shadow-2xs">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <div>
                  <span className="font-bold text-xs">Mode Pratinjau (Data Terkunci):</span>
                  <span className="text-[11px] text-amber-800 ml-1.5">
                    Formulir saat ini dalam mode lihat. Untuk mengubah isian atau tanda tangan, klik menu <strong>Edit Pengkajian</strong> di atas.
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleEditRecord}
                className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-bold text-xs flex items-center gap-1 shadow-xs cursor-pointer shrink-0"
              >
                <Edit3 className="w-3 h-3" /> Edit Sekarang
              </button>
            </div>
          )}

          {formMode === 'edit' && (
            <div className="bg-blue-50 border border-blue-200 text-blue-950 px-4 py-2.5 rounded-xl flex items-center justify-between shadow-2xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                <div>
                  <span className="font-bold text-xs">Mode Edit Aktif:</span>
                  <span className="text-[11px] text-blue-800 ml-1.5">
                    Silakan lakukan perubahan data pada 10 sub-modul pengkajian keperawatan di bawah, lalu klik <strong>Simpan</strong>.
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleSaveAll}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs flex items-center gap-1 shadow-xs cursor-pointer shrink-0"
              >
                <Save className="w-3 h-3" /> Simpan Perubahan
              </button>
            </div>
          )}

          {formMode === 'create' && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-950 px-4 py-2.5 rounded-xl flex items-center justify-between shadow-2xs">
              <div className="flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <span className="font-bold text-xs">Mode Tambah Pengkajian Baru:</span>
                  <span className="text-[11px] text-emerald-800 ml-1.5">
                    Lengkapi data pengkajian asuhan keperawatan baru untuk pasien ini, pastikan tanda tangan perawat & dokter terisi.
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleSaveAll}
                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs flex items-center gap-1 shadow-xs cursor-pointer shrink-0"
              >
                <Save className="w-3 h-3" /> Simpan Pengkajian Baru
              </button>
            </div>
          )}

          {/* HEADER BAR PASIEN */}
          <div className="bg-gradient-to-r from-sky-700 via-blue-800 to-indigo-900 text-white p-4 rounded-2xl shadow-md flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-white/20 border border-white/30 text-white flex items-center justify-center font-black text-lg shrink-0 shadow-inner">
                RME
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-black text-base tracking-wide">{patient.name}</span>
                  <span className="bg-sky-400/30 text-sky-100 border border-sky-300/40 px-2.5 py-0.5 rounded-md font-mono font-bold text-xs">
                    No. RM: {patient.noRM}
                  </span>
                  <span className="bg-emerald-500/30 text-emerald-200 border border-emerald-400/40 px-2.5 py-0.5 rounded-md font-extrabold text-xs">
                    {patient.insuranceType || 'BPJS KESEHATAN'}
                  </span>
                </div>
                <p className="text-xs text-sky-100/90 font-medium mt-1">
                  {patient.gender === 'M' ? 'Laki-Laki' : 'Perempuan'} &bull; Lahir: {patient.dob} &bull; No Reg: <strong className="font-mono text-amber-300">{registration.id}</strong> &bull; Ruang: <strong className="text-white">{ruangan}</strong>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrint}
                className="px-3.5 py-2 bg-white/20 hover:bg-white/30 text-white rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer border border-white/30"
              >
                <Printer className="w-4 h-4" /> Cetak Form
              </button>
              <button
                type="button"
                onClick={handleSaveAll}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
              >
                <Save className="w-4 h-4" /> Simpan Pengkajian
              </button>
            </div>
          </div>

        {/* QUICK JUMPER BAR (SINGLE VIEW - EVERYTHING DISPLAYED ON ONE PAGE) */}
        <div className="bg-slate-100 p-2 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-[11px] font-extrabold text-slate-700 px-2">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-sky-600" /> NAVIGASI CEPAT (PENGKAJIAN TAMPIL FULL SATU HALAMAN):
            </span>
            <span className="text-sky-700 font-mono font-bold">10 Sub-Modul Lengkap Terbuka All-in-One</span>
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px] font-bold text-slate-700">
            <button type="button" onClick={() => scrollToSection('sec-1')} className="px-2.5 py-1 bg-white hover:bg-sky-50 rounded-lg border border-slate-200 shrink-0 cursor-pointer">1. Identitas & Riwayat</button>
            <button type="button" onClick={() => scrollToSection('sec-2')} className="px-2.5 py-1 bg-white hover:bg-sky-50 rounded-lg border border-slate-200 shrink-0 cursor-pointer">2. Keadaan Umum & TTV</button>
            <button type="button" onClick={() => scrollToSection('sec-3')} className="px-2.5 py-1 bg-white hover:bg-sky-50 rounded-lg border border-slate-200 shrink-0 cursor-pointer">3. Penyakit & Prosedur Invasif</button>
            <button type="button" onClick={() => scrollToSection('sec-4')} className="px-2.5 py-1 bg-white hover:bg-sky-50 rounded-lg border border-slate-200 shrink-0 cursor-pointer">4. Psikososial & Kebiasaan</button>
            <button type="button" onClick={() => scrollToSection('sec-5')} className="px-2.5 py-1 bg-white hover:bg-sky-50 rounded-lg border border-slate-200 shrink-0 cursor-pointer">5. Nyeri & Fisik Head-to-Toe</button>
            <button type="button" onClick={() => scrollToSection('sec-6')} className="px-2.5 py-1 bg-white hover:bg-sky-50 rounded-lg border border-slate-200 shrink-0 cursor-pointer">6. Skrining MST, Morse & Braden</button>
            <button type="button" onClick={() => scrollToSection('sec-7')} className="px-2.5 py-1 bg-white hover:bg-sky-50 rounded-lg border border-slate-200 shrink-0 cursor-pointer">7. Barthel Indeks</button>
            <button type="button" onClick={() => scrollToSection('sec-8')} className="px-2.5 py-1 bg-white hover:bg-sky-50 rounded-lg border border-slate-200 shrink-0 cursor-pointer">8. Penunjang & Terapi</button>
            <button type="button" onClick={() => scrollToSection('sec-9')} className="px-2.5 py-1 bg-white hover:bg-sky-50 rounded-lg border border-slate-200 shrink-0 cursor-pointer">9. Discharge & Orientasi</button>
            <button type="button" onClick={() => scrollToSection('sec-10')} className="px-2.5 py-1 bg-sky-600 text-white hover:bg-sky-700 rounded-lg shrink-0 cursor-pointer">10. Diagnosa SDKI/SIKI</button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SINGLE CONTINUOUS FULL-VIEW FORM CONTAINER */}
        {/* ========================================================================= */}
        <div className="space-y-6">

          {/* SECTION 1: IDENTITAS PASIEN & PENGKAJIAN (PDF PAGE 1) */}
          <div id="sec-1" className="bg-white p-4 rounded-2xl border border-sky-200 space-y-4 shadow-xs">
            <div className="bg-sky-50 -mx-4 -mt-4 p-3 rounded-t-2xl border-b border-sky-200 flex items-center justify-between">
              <span className="font-black text-sky-950 text-sm flex items-center gap-2 uppercase tracking-wide">
                <ClipboardList className="w-5 h-5 text-sky-600" /> 1. FORMAT PENGKAJIAN INDIVIDU & IDENTITAS PASIEN
              </span>
              <span className="bg-sky-200 text-sky-900 text-[10px] font-extrabold px-2 py-0.5 rounded">Halaman 1/10</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Tanggal Pengkajian</label>
                <input type="date" value={tglPengkajian} onChange={e => setTglPengkajian(e.target.value)} className="w-full p-2 bg-slate-50 border rounded-xl font-medium" />
              </div>
              <div>
                <label className="block text-slate-700 font-bold mb-1">Jam Pengkajian</label>
                <input type="text" value={jamPengkajian} onChange={e => setJamPengkajian(e.target.value)} className="w-full p-2 bg-slate-50 border rounded-xl font-mono" />
              </div>
              <div>
                <label className="block text-slate-700 font-bold mb-1">Sumber Data</label>
                <select value={sumberData} onChange={e => setSumberData(e.target.value as any)} className="w-full p-2 bg-slate-50 border rounded-xl font-bold">
                  <option value="Pasien">Pasien</option>
                  <option value="Keluarga">Keluarga</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-700 font-bold mb-1">Ruangan Perawatan</label>
                <input type="text" value={ruangan} onChange={e => setRuangan(e.target.value)} className="w-full p-2 bg-slate-50 border rounded-xl font-bold text-sky-900" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 border-t border-slate-100">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Tanggal Masuk RS</label>
                <input type="date" value={tglMasuk} onChange={e => setTglMasuk(e.target.value)} className="w-full p-2 bg-slate-50 border rounded-xl" />
              </div>
              <div>
                <label className="block text-slate-700 font-bold mb-1">Jam Masuk RS</label>
                <input type="text" value={jamMasuk} onChange={e => setJamMasuk(e.target.value)} className="w-full p-2 bg-slate-50 border rounded-xl font-mono" />
              </div>
              <div>
                <label className="block text-slate-700 font-bold mb-1">Dikirim Dari</label>
                <select value={dikirimDari} onChange={e => setDikirimDari(e.target.value as any)} className="w-full p-2 bg-slate-50 border rounded-xl font-bold">
                  <option value="IGD">IGD (Gawat Darurat)</option>
                  <option value="Poliklinik">Poliklinik Rawat Jalan</option>
                  <option value="Ruangan Lain">Ruangan Lain / Rujukan</option>
                </select>
              </div>
            </div>

            {/* IDENTITAS SOSIAL & PJ */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <span className="font-extrabold text-slate-800 text-xs block border-b pb-1">IDENTITAS DEMOGRAFI & PENANGGUNG JAWAB (PJ)</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600">Agama</label>
                  <input type="text" value={agama} onChange={e => setAgama(e.target.value)} className="w-full p-1.5 bg-white border rounded-lg font-bold" />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600">Pendidikan</label>
                  <input type="text" value={pendidikan} onChange={e => setPendidikan(e.target.value)} className="w-full p-1.5 bg-white border rounded-lg font-bold" />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600">Pekerjaan</label>
                  <input type="text" value={pekerjaan} onChange={e => setPekerjaan(e.target.value)} className="w-full p-1.5 bg-white border rounded-lg font-bold" />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600">Status Perkawinan</label>
                  <input type="text" value={statusPerkawinan} onChange={e => setStatusPerkawinan(e.target.value)} className="w-full p-1.5 bg-white border rounded-lg font-bold" />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600">Suku</label>
                  <input type="text" value={suku} onChange={e => setSuku(e.target.value)} className="w-full p-1.5 bg-white border rounded-lg font-bold" />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600">Kewarganegaraan</label>
                  <input type="text" value={kewarganegaraan} onChange={e => setKewarganegaraan(e.target.value)} className="w-full p-1.5 bg-white border rounded-lg font-bold" />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600">Pembiayaan Kesehatan</label>
                  <input type="text" value={pembiayaan} onChange={e => setPembiayaan(e.target.value)} className="w-full p-1.5 bg-white border rounded-lg font-bold text-emerald-700" />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600">Nama Penanggung Jawab (PJ)</label>
                  <input type="text" value={namaPJ} onChange={e => setNamaPJ(e.target.value)} className="w-full p-1.5 bg-white border rounded-lg font-bold" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600">Hubungan dengan Pasien</label>
                  <input type="text" value={hubunganPJ} onChange={e => setHubunganPJ(e.target.value)} className="w-full p-1.5 bg-white border rounded-lg font-bold" />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600">Pekerjaan PJ</label>
                  <input type="text" value={pekerjaanPJ} onChange={e => setPekerjaanPJ(e.target.value)} className="w-full p-1.5 bg-white border rounded-lg" />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600">Alamat PJ</label>
                  <input type="text" value={alamatPJ} onChange={e => setAlamatPJ(e.target.value)} className="w-full p-1.5 bg-white border rounded-lg truncate" />
                </div>
              </div>
            </div>

            {/* RIWAYAT KESEHATAN TEXTAREAS */}
            <div className="space-y-3 pt-1">
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Alasan Masuk Rumah Sakit (Keluhan Utama) & Ilustrasi Kronologi *
                </label>
                <textarea
                  value={alasanMasukRS}
                  onChange={e => setAlasanMasukRS(e.target.value)}
                  rows={2}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Diagnosa Medis Saat Masuk RS (IGD/Poli)</label>
                  <input type="text" value={diagnosaMasukRS} onChange={e => setDiagnosaMasukRS(e.target.value)} className="w-full p-2 bg-slate-50 border rounded-xl font-bold text-blue-900" />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Diagnosa Medis Saat Ini (Di Ruangan)</label>
                  <input type="text" value={diagnosaSaatIni} onChange={e => setDiagnosaSaatIni(e.target.value)} className="w-full p-2 bg-slate-50 border rounded-xl font-bold text-emerald-900" />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Keluhan Saat Ini (Yang Memperberat & Meringankan)</label>
                <textarea
                  value={keluhanSaatIni}
                  onChange={e => setKeluhanSaatIni(e.target.value)}
                  rows={2}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: KEADAAN UMUM, VITAL SIGNS & STATUS KESADARAN (PDF PAGE 2) */}
          <div id="sec-2" className="bg-white p-4 rounded-2xl border border-sky-200 space-y-4 shadow-xs">
            <div className="bg-sky-50 -mx-4 -mt-4 p-3 rounded-t-2xl border-b border-sky-200 flex items-center justify-between">
              <span className="font-black text-sky-950 text-sm flex items-center gap-2 uppercase tracking-wide">
                <HeartPulse className="w-5 h-5 text-rose-600" /> 2. KEADAAN UMUM PASIEN, VITAL SIGNS & GCS
              </span>
              <span className="bg-sky-200 text-sky-900 text-[10px] font-extrabold px-2 py-0.5 rounded">Halaman 2/10</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Keadaan Umum Pasien</label>
                <select value={keadaanUmum} onChange={e => setKeadaanUmum(e.target.value as any)} className="w-full p-2 bg-slate-50 border rounded-xl font-extrabold">
                  <option value="Sakit Ringan">Sakit Ringan</option>
                  <option value="Sedang">Sakit Sedang</option>
                  <option value="Berat">Sakit Berat</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Kesadaran Pasien</label>
                <select value={kesadaran} onChange={e => setKesadaran(e.target.value)} className="w-full p-2 bg-slate-50 border rounded-xl font-extrabold">
                  <option value="Compos mentis">Compos mentis</option>
                  <option value="Apatis">Apatis</option>
                  <option value="Somnolen">Somnolen</option>
                  <option value="Soporocoma">Soporocoma</option>
                  <option value="Coma">Coma</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">GCS (E / V / M)</label>
                <div className="flex items-center gap-1.5">
                  <input type="text" value={gcsE} onChange={e => setGcsE(e.target.value)} placeholder="E" className="w-12 p-2 bg-slate-50 border rounded-lg text-center font-bold" />
                  <input type="text" value={gcsV} onChange={e => setGcsV(e.target.value)} placeholder="V" className="w-12 p-2 bg-slate-50 border rounded-lg text-center font-bold" />
                  <input type="text" value={gcsM} onChange={e => setGcsM(e.target.value)} placeholder="M" className="w-12 p-2 bg-slate-50 border rounded-lg text-center font-bold" />
                  <span className="font-extrabold text-blue-900 text-xs">Total: {parseInt(gcsE||'0')+parseInt(gcsV||'0')+parseInt(gcsM||'0')}</span>
                </div>
              </div>
            </div>

            {/* VITAL SIGNS GRID */}
            <div className="p-3 bg-sky-50/70 border border-sky-200 rounded-xl space-y-2">
              <span className="font-extrabold text-blue-950 text-xs block">TANDA-TANDA VITAL (TTV) & ANTROPOMETRI</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5 text-xs font-bold">
                <div>
                  <label className="block text-[10px] text-slate-500 font-semibold">TD (mmHg)</label>
                  <input type="text" value={td} onChange={e => setTd(e.target.value)} className="w-full p-1.5 bg-white border rounded-lg font-mono text-center" />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 font-semibold">Nadi (x/m)</label>
                  <input type="text" value={nadi} onChange={e => setNadi(e.target.value)} className="w-full p-1.5 bg-white border rounded-lg font-mono text-center" />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 font-semibold">RR (x/m)</label>
                  <input type="text" value={rr} onChange={e => setRr(e.target.value)} className="w-full p-1.5 bg-white border rounded-lg font-mono text-center" />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 font-semibold">Suhu (°C)</label>
                  <input type="text" value={suhu} onChange={e => setSuhu(e.target.value)} className="w-full p-1.5 bg-white border rounded-lg font-mono text-center" />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 font-semibold">SpO2 (%)</label>
                  <input type="text" value={spo2} onChange={e => setSpo2(e.target.value)} className="w-full p-1.5 bg-white border rounded-lg font-mono text-center text-emerald-800" />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 font-semibold">TB (cm) / BB (kg)</label>
                  <div className="flex items-center gap-1">
                    <input type="text" value={tb} onChange={e => setTb(e.target.value)} className="w-full p-1.5 bg-white border rounded-lg font-mono text-center" />
                    <input type="text" value={bb} onChange={e => setBb(e.target.value)} className="w-full p-1.5 bg-white border rounded-lg font-mono text-center" />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 font-semibold">Indeks IMT</label>
                  <div className="p-1.5 bg-white border rounded-lg text-center font-black text-sky-800">
                    {imtValue} kg/m²
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3: RIWAYAT PENYAKIT & PROSEDUR INVASIF (PDF PAGE 2 & 3) */}
          <div id="sec-3" className="bg-white p-4 rounded-2xl border border-sky-200 space-y-4 shadow-xs">
            <div className="bg-sky-50 -mx-4 -mt-4 p-3 rounded-t-2xl border-b border-sky-200 flex items-center justify-between">
              <span className="font-black text-sky-950 text-sm flex items-center gap-2 uppercase tracking-wide">
                <Activity className="w-5 h-5 text-blue-600" /> 3. RIWAYAT TERDAHULU, ALERGI & PROSEDUR INVASIF
              </span>
              <span className="bg-sky-200 text-sky-900 text-[10px] font-extrabold px-2 py-0.5 rounded">Halaman 3/10</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">1. Penyakit Yang Pernah Dialami</label>
                <textarea value={riwayatPenyakit} onChange={e => setRiwayatPenyakit(e.target.value)} rows={2} className="w-full p-2 bg-slate-50 border rounded-xl" />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">2. Tindakan / Pengobatan Yang Pernah Dilakukan</label>
                <textarea value={tindakanSebelumnya} onChange={e => setTindakanSebelumnya(e.target.value)} rows={2} className="w-full p-2 bg-slate-50 border rounded-xl" />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">3. Alergi (Obat / Makanan)</label>
                <input type="text" value={alergi} onChange={e => setAlergi(e.target.value)} className="w-full p-2 bg-slate-50 border rounded-xl font-bold text-rose-800" />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">4. Riwayat Imunisasi Dasar</label>
                <input type="text" value={imunisasiDasar} onChange={e => setImunisasiDasar(e.target.value)} className="w-full p-2 bg-slate-50 border rounded-xl font-bold" />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">5. Obat Rutin Dikonsumsi</label>
                <input type="text" value={obatRutin} onChange={e => setObatRutin(e.target.value)} className="w-full p-2 bg-slate-50 border rounded-xl font-bold" />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">6. Kebiasaan (Rokok/Alkohol/Kopi)</label>
                <input type="text" value={kebiasaan} onChange={e => setKebiasaan(e.target.value)} className="w-full p-2 bg-slate-50 border rounded-xl font-bold" />
              </div>
            </div>

            {/* PROSEDUR INVASIF TERPASANG */}
            <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-xl space-y-2">
              <span className="font-extrabold text-amber-950 text-xs block">PROSEDUR INVASIF / ALAT MEDIS TERPASANG SAAT INI</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700">Terpasang Oksigen</label>
                  <div className="flex items-center gap-2 mt-0.5">
                    <input type="text" value={o2Jenis} onChange={e => setO2Jenis(e.target.value)} placeholder="Jenis" className="w-full p-1.5 bg-white border rounded-lg font-medium" />
                    <input type="text" value={o2Lpm} onChange={e => setO2Lpm(e.target.value)} placeholder="Lpm" className="w-20 p-1.5 bg-white border rounded-lg font-mono text-center" />
                    <span className="text-slate-500 text-[10px]">L/mnt</span>
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700">Kateter Urine</label>
                  <input type="text" value={kateterUrine} onChange={e => setKateterUrine(e.target.value)} className="w-full p-1.5 bg-white border rounded-lg font-medium mt-0.5" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700">Infus Terpasang</label>
                  <div className="flex items-center gap-2 mt-0.5">
                    <input type="text" value={infusLokasi} onChange={e => setInfusLokasi(e.target.value)} placeholder="Lokasi" className="w-full p-1.5 bg-white border rounded-lg font-medium" />
                    <input type="text" value={infusCairan} onChange={e => setInfusCairan(e.target.value)} placeholder="Cairan" className="w-full p-1.5 bg-white border rounded-lg font-medium" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 4: PSIKOSOSIAL, SPIRITUAL & POLA KEBIASAAN (PDF PAGE 3 & 4) */}
          <div id="sec-4" className="bg-white p-4 rounded-2xl border border-sky-200 space-y-4 shadow-xs">
            <div className="bg-sky-50 -mx-4 -mt-4 p-3 rounded-t-2xl border-b border-sky-200 flex items-center justify-between">
              <span className="font-black text-sky-950 text-sm flex items-center gap-2 uppercase tracking-wide">
                <BookOpen className="w-5 h-5 text-indigo-600" /> 4. PSIKOSOSIAL, SPIRITUAL & POLA KEBIASAAN SEHARI-HARI
              </span>
              <span className="bg-sky-200 text-sky-900 text-[10px] font-extrabold px-2 py-0.5 rounded">Halaman 4/10</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Bahasa Yang Digunakan</label>
                <input type="text" value={bahasa} onChange={e => setBahasa(e.target.value)} className="w-full p-2 bg-slate-50 border rounded-xl font-medium" />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Bicara</label>
                <select value={bicara} onChange={e => setBicara(e.target.value)} className="w-full p-2 bg-slate-50 border rounded-xl font-bold">
                  <option value="Jelas">Jelas & Relevan</option>
                  <option value="Lambat">Lambat</option>
                  <option value="Tidak Sesuai">Tidak Sesuai / Pelo</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Pendampingan Rohaniawan</label>
                <select value={perluRohaniawan} onChange={e => setPerluRohaniawan(e.target.value)} className="w-full p-2 bg-slate-50 border rounded-xl font-bold text-indigo-900">
                  <option value="Ya">Ya, Membutuhkan Bimbingan Rohani</option>
                  <option value="Tidak">Tidak Perlu</option>
                </select>
              </div>
            </div>

            {/* POLA KEBIASAAN TABULAR */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <span className="font-extrabold text-slate-800 text-xs block border-b pb-1">POLA KEBIASAAN SAAT INI (NUTRISI, ELIMINASI, ISTIRAHAT, AKTIVITAS)</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                <div className="p-2.5 bg-white border rounded-xl space-y-1.5">
                  <span className="font-bold text-sky-900 block">A. NUTRISI & MINUM</span>
                  <div>Nafsu makan: <strong className="text-slate-800">{nafsuMakan}</strong></div>
                  <div>Frekuensi: <strong className="text-slate-800">{frekuensiMakan}</strong></div>
                  <div>Porsi dihabiskan: <strong className="text-slate-800">{porsiMakan}</strong></div>
                  <div>Banyaknya minum: <strong className="text-slate-800">{minumSebanyak}</strong></div>
                </div>

                <div className="p-2.5 bg-white border rounded-xl space-y-1.5">
                  <span className="font-bold text-emerald-900 block">B. ELIMINASI BAB & BAK</span>
                  <div>Eliminasi BAB: <strong className="text-slate-800">{eliminasiBAB}</strong></div>
                  <div>Eliminasi BAK: <strong className="text-slate-800">{eliminasiBAK}</strong></div>
                </div>

                <div className="p-2.5 bg-white border rounded-xl space-y-1.5">
                  <span className="font-bold text-indigo-900 block">C. ISTIRAHAT & AKTIVITAS</span>
                  <div>Pola Istirahat: <strong className="text-slate-800">{polaIstirahat}</strong></div>
                  <div>Tingkat Aktivitas: <strong className="text-slate-800">{aktivitas}</strong></div>
                  <div>Kebersihan Diri: <strong className="text-slate-800">{kebersihan}</strong></div>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 5: PENGKAJIAN NYERI & PEMERIKSAAN FISIK HEAD TO TOE (PDF PAGE 4, 5, 6) */}
          <div id="sec-5" className="bg-white p-4 rounded-2xl border border-sky-200 space-y-4 shadow-xs">
            <div className="bg-sky-50 -mx-4 -mt-4 p-3 rounded-t-2xl border-b border-sky-200 flex items-center justify-between">
              <span className="font-black text-sky-950 text-sm flex items-center gap-2 uppercase tracking-wide">
                <Stethoscope className="w-5 h-5 text-rose-600" /> 5. PENGKAJIAN NYERI & PEMERIKSAAN FISIK HEAD TO TOE
              </span>
              <span className="bg-sky-200 text-sky-900 text-[10px] font-extrabold px-2 py-0.5 rounded">Halaman 5/10</span>
            </div>

            {/* PAIN ASSESSMENT */}
            <div className="p-3 bg-rose-50/70 border border-rose-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-rose-950 text-xs">PENGKAJIAN NYERI (NUMERIC RATING SCALE / WONG-BAKER 0-10)</span>
                <span className="font-bold text-rose-800 text-xs">Skala Nyeri: <strong className="font-mono text-sm">{nyeriSkala}/10</strong></span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600">Lokasi Nyeri</label>
                  <input type="text" value={nyeriLokasi} onChange={e => setNyeriLokasi(e.target.value)} className="w-full p-1.5 bg-white border rounded-lg font-bold" />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600">Frekuensi</label>
                  <input type="text" value={nyeriFrekuensi} onChange={e => setNyeriFrekuensi(e.target.value)} className="w-full p-1.5 bg-white border rounded-lg font-bold" />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600">Menjalar</label>
                  <input type="text" value={nyeriMenjalar} onChange={e => setNyeriMenjalar(e.target.value)} className="w-full p-1.5 bg-white border rounded-lg font-bold" />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600">Kualitas Nyeri</label>
                  <input type="text" value={nyeriKualitas} onChange={e => setNyeriKualitas(e.target.value)} className="w-full p-1.5 bg-white border rounded-lg font-bold" />
                </div>
              </div>
            </div>

            {/* HEAD TO TOE GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 bg-slate-50 border rounded-xl space-y-1">
                <span className="font-extrabold text-slate-900 block border-b pb-0.5">MATA, HIDUNG & TELINGA</span>
                <div>Mata: <input type="text" value={pMata} onChange={e => setPMata(e.target.value)} className="w-full p-1 bg-white border rounded mt-0.5" /></div>
                <div>Hidung: <input type="text" value={pHidung} onChange={e => setPHidung(e.target.value)} className="w-full p-1 bg-white border rounded mt-0.5" /></div>
                <div>Telinga: <input type="text" value={pTelinga} onChange={e => setPTelinga(e.target.value)} className="w-full p-1 bg-white border rounded mt-0.5" /></div>
              </div>

              <div className="p-2.5 bg-slate-50 border rounded-xl space-y-1">
                <span className="font-extrabold text-slate-900 block border-b pb-0.5">MULUT, TENGGOROKAN & LEHER</span>
                <div>Mulut: <input type="text" value={pMulut} onChange={e => setPMulut(e.target.value)} className="w-full p-1 bg-white border rounded mt-0.5" /></div>
                <div>Leher: <input type="text" value={pLeher} onChange={e => setPLeher(e.target.value)} className="w-full p-1 bg-white border rounded mt-0.5" /></div>
              </div>

              <div className="p-2.5 bg-slate-50 border rounded-xl space-y-1">
                <span className="font-extrabold text-slate-900 block border-b pb-0.5">PERNAPASAN / THORAX</span>
                <textarea value={pThoraxPernapasan} onChange={e => setPThoraxPernapasan(e.target.value)} rows={2} className="w-full p-1.5 bg-white border rounded font-medium" />
              </div>

              <div className="p-2.5 bg-slate-50 border rounded-xl space-y-1">
                <span className="font-extrabold text-slate-900 block border-b pb-0.5">KARDIOVASKULER / JANTUNG</span>
                <textarea value={pKardiovaskuler} onChange={e => setPKardiovaskuler(e.target.value)} rows={2} className="w-full p-1.5 bg-white border rounded font-medium" />
              </div>

              <div className="p-2.5 bg-slate-50 border rounded-xl space-y-1">
                <span className="font-extrabold text-slate-900 block border-b pb-0.5">GASTROINTESTINAL / ABDOMEN</span>
                <textarea value={pGastrointestinal} onChange={e => setPGastrointestinal(e.target.value)} rows={2} className="w-full p-1.5 bg-white border rounded font-medium" />
              </div>

              <div className="p-2.5 bg-slate-50 border rounded-xl space-y-1">
                <span className="font-extrabold text-slate-900 block border-b pb-0.5">MUSKULOSKELETAL & INTEGUMEN</span>
                <textarea value={pMuskuloskeletal} onChange={e => setPMuskuloskeletal(e.target.value)} rows={2} className="w-full p-1.5 bg-white border rounded font-medium" />
              </div>
            </div>
          </div>

          {/* SECTION 6: SKRINING NUTRISI MST, MIFFLIN, MORSE & BRADEN (PDF PAGE 7 & 8) */}
          <div id="sec-6" className="bg-white p-4 rounded-2xl border border-sky-200 space-y-4 shadow-xs">
            <div className="bg-sky-50 -mx-4 -mt-4 p-3 rounded-t-2xl border-b border-sky-200 flex items-center justify-between">
              <span className="font-black text-sky-950 text-sm flex items-center gap-2 uppercase tracking-wide">
                <FileSpreadsheet className="w-5 h-5 text-emerald-600" /> 6. SKRINING NUTRISI (MST), KALORI MIFFLIN & SKALA MORSE / BRADEN
              </span>
              <span className="bg-sky-200 text-sky-900 text-[10px] font-extrabold px-2 py-0.5 rounded">Halaman 6/10</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              {/* SKRINING NUTRISI MST */}
              <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2">
                <span className="font-extrabold text-emerald-950 block">A. MALNUTRITION SCREENING TOOL (MST)</span>
                <div>Total Skor MST: <strong className="font-mono text-base text-emerald-800">{totalMst}</strong></div>
                <div className="text-[11px] font-semibold text-slate-700">
                  {totalMst <= 1 ? '✓ Risiko Rendah (Skrinning Ulang 7 Hari)' : '⚠️ Risiko Sedang / Tinggi (Konsul Ahli Gizi)'}
                </div>
                <div className="pt-1 border-t text-[10px] text-slate-600">
                  Est. TEE Mifflin: <strong>{teeMifflin} kkal/hari</strong> (BMR: {bmrMifflin} kkal)
                </div>
              </div>

              {/* SKALA MORSE RESIKO JATUH */}
              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2">
                <span className="font-extrabold text-amber-950 block">B. PENILAIAN RESIKO JATUH (MORSE)</span>
                <div>Total Skor Morse: <strong className="font-mono text-base text-amber-900">{totalMorse}</strong></div>
                <div className="text-[11px] font-bold text-amber-800">
                  {totalMorse >= 50 ? '🔴 Risiko Tinggi (Pasang Gelang Kuning & Pagar)' : totalMorse >= 25 ? '🟡 Risiko Sedang' : '🟢 Risiko Rendah'}
                </div>
              </div>

              {/* BRADEN SCALE */}
              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl space-y-2">
                <span className="font-extrabold text-blue-950 block">C. BRADEN SCALE (PRESSURE ULCER)</span>
                <div>Total Skor Braden: <strong className="font-mono text-base text-blue-900">{totalBraden}</strong></div>
                <div className="text-[11px] font-bold text-blue-800">
                  {totalBraden <= 12 ? '⚠️ Risiko Tinggi Dekubitus' : '✓ Risiko Rendah / Tidak Berisiko'}
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 7: ASSESSMEN FUNGSIONAL BARTHEL INDEX (PDF PAGE 8 & 9) */}
          <div id="sec-7" className="bg-white p-4 rounded-2xl border border-sky-200 space-y-4 shadow-xs">
            <div className="bg-sky-50 -mx-4 -mt-4 p-3 rounded-t-2xl border-b border-sky-200 flex items-center justify-between">
              <span className="font-black text-sky-950 text-sm flex items-center gap-2 uppercase tracking-wide">
                <Scale className="w-5 h-5 text-purple-600" /> 7. ASSESSMEN FUNGSIONAL (BARTHEL INDEX - 10 FUNGSI MANDIRI)
              </span>
              <span className="bg-sky-200 text-sky-900 text-[10px] font-extrabold px-2 py-0.5 rounded">Halaman 7/10</span>
            </div>

            <div className="p-3 bg-purple-50/60 border border-purple-200 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-purple-950 text-xs">SKOR TOTAL BARTHEL INDEX:</span>
                <span className="px-3 py-1 bg-purple-600 text-white font-mono font-black rounded-lg text-sm">
                  {totalBarthel} / 20 ({totalBarthel >= 12 ? 'Mandiri / Ketergantungan Ringan' : 'Ketergantungan Sedang / Berat'})
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                <div className="p-2 bg-white border rounded-lg">1. BAB: <strong>{barthelBab}</strong></div>
                <div className="p-2 bg-white border rounded-lg">2. BAK: <strong>{barthelBak}</strong></div>
                <div className="p-2 bg-white border rounded-lg">3. Diri: <strong>{barthelDiri}</strong></div>
                <div className="p-2 bg-white border rounded-lg">4. Toilet: <strong>{barthelToilet}</strong></div>
                <div className="p-2 bg-white border rounded-lg">5. Makan: <strong>{barthelMakan}</strong></div>
                <div className="p-2 bg-white border rounded-lg">6. Pindah: <strong>{barthelPindah}</strong></div>
                <div className="p-2 bg-white border rounded-lg">7. Mobilisasi: <strong>{barthelMobil}</strong></div>
                <div className="p-2 bg-white border rounded-lg">8. Baju: <strong>{barthelBaju}</strong></div>
                <div className="p-2 bg-white border rounded-lg">9. Tangga: <strong>{barthelTangga}</strong></div>
                <div className="p-2 bg-white border rounded-lg">10. Mandi: <strong>{barthelMandi}</strong></div>
              </div>
            </div>
          </div>

          {/* SECTION 8: PEMERIKSAAN PENUNJANG & TERAPI OBAT (PDF PAGE 9) */}
          <div id="sec-8" className="bg-white p-4 rounded-2xl border border-sky-200 space-y-4 shadow-xs">
            <div className="bg-sky-50 -mx-4 -mt-4 p-3 rounded-t-2xl border-b border-sky-200 flex items-center justify-between">
              <span className="font-black text-sky-950 text-sm flex items-center gap-2 uppercase tracking-wide">
                <Layers className="w-5 h-5 text-teal-600" /> 8. PEMERIKSAAN PENUNJANG & TERAPI OBAT
              </span>
              <span className="bg-sky-200 text-sky-900 text-[10px] font-extrabold px-2 py-0.5 rounded">Halaman 8/10</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 border rounded-xl space-y-2">
                <span className="font-extrabold text-slate-800 block">PEMERIKSAAN PENUNJANG (LAB / EKG / RADIOLOGI)</span>
                <div className="space-y-1 font-mono text-[11px] text-slate-700">
                  <div className="flex justify-between border-b pb-0.5"><span>EKG 12 Lead:</span> <strong className="text-rose-700">ST Elevasi V1-V4 Anteroseptal</strong></div>
                  <div className="flex justify-between border-b pb-0.5"><span>Troponin I:</span> <strong className="text-rose-700">2.45 ng/mL (&lt;0.04)</strong></div>
                  <div className="flex justify-between border-b pb-0.5"><span>Hemoglobin:</span> <strong>14.2 g/dL (13-17)</strong></div>
                  <div className="flex justify-between"><span>Gula Darah Sewaktu:</span> <strong>135 mg/dL (&lt;200)</strong></div>
                </div>
              </div>

              <div className="p-3 bg-slate-50 border rounded-xl space-y-2">
                <span className="font-extrabold text-slate-800 block">TERAPI / OBAT-OBATAN SAAT INI</span>
                <div className="space-y-1 font-mono text-[11px] text-slate-700">
                  <div className="flex justify-between border-b pb-0.5"><span>ISDN 5mg Sublingual:</span> <strong>1 Tab bila nyeri dada</strong></div>
                  <div className="flex justify-between border-b pb-0.5"><span>Aspirin 160mg:</span> <strong>1x1 Tab Oral</strong></div>
                  <div className="flex justify-between border-b pb-0.5"><span>Clopidogrel 300mg:</span> <strong>Loading dose 1x</strong></div>
                  <div className="flex justify-between"><span>Oksigen Nasal Canula:</span> <strong>3 Liters/Minute</strong></div>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 9: DISCHARGE PLANNING & ORIENTASI PASIEN BARU (PDF PAGE 10) */}
          <div id="sec-9" className="bg-white p-4 rounded-2xl border border-sky-200 space-y-4 shadow-xs">
            <div className="bg-sky-50 -mx-4 -mt-4 p-3 rounded-t-2xl border-b border-sky-200 flex items-center justify-between">
              <span className="font-black text-sky-950 text-sm flex items-center gap-2 uppercase tracking-wide">
                <UserCheck className="w-5 h-5 text-emerald-600" /> 9. DISCHARGE PLANNING & ORIENTASI PASIEN BARU
              </span>
              <span className="bg-sky-200 text-sky-900 text-[10px] font-extrabold px-2 py-0.5 rounded">Halaman 9/10</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-1">
                <span className="font-extrabold text-emerald-950 block">DISCHARGE PLANNING (PERENCANAAN PULANG)</span>
                <div className="text-[11px] text-slate-700">Kriteria pemulangan: Memerlukan perawatan lanjutan di rumah & edukasi obat rutin.</div>
              </div>

              <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-xl space-y-1">
                <span className="font-extrabold text-blue-950 block">ORIENTASI PASIEN BARU</span>
                <div className="text-[11px] text-slate-700">✓ Penjelasan tata tertib ruangan, jam berkunjung, fasilitas, dan jadwal visite dokter telah diberikan kepada keluarga pasien.</div>
              </div>
            </div>
          </div>

          {/* SECTION 10: RENCANA ASUHAN KEPERAWATAN (SDKI / SLKI / SIKI) */}
          <div id="sec-10" className="bg-white p-4 rounded-2xl border border-sky-200 space-y-4 shadow-xs">
            <div className="bg-sky-50 -mx-4 -mt-4 p-3 rounded-t-2xl border-b border-sky-200 flex items-center justify-between">
              <span className="font-black text-sky-950 text-sm flex items-center gap-2 uppercase tracking-wide">
                <FileText className="w-5 h-5 text-sky-600" /> 10. FORMULIR RENCANA ASUHAN KEPERAWATAN (SDKI / SLKI / SIKI)
              </span>
              <span className="bg-sky-200 text-sky-900 text-[10px] font-extrabold px-2 py-0.5 rounded">Halaman 10/10</span>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-800 mb-1">Diagnosa Keperawatan Utama (SDKI) *</label>
              <textarea
                value={diagKeperawatan}
                onChange={e => setDiagKeperawatan(e.target.value)}
                rows={2}
                className="w-full p-2.5 bg-sky-50/50 border border-sky-300 rounded-xl text-xs font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-slate-800 mb-1">Tujuan & Kriteria Hasil (SLKI) *</label>
              <textarea
                value={diagTujuan}
                onChange={e => setDiagTujuan(e.target.value)}
                rows={2}
                className="w-full p-2.5 bg-sky-50/50 border border-sky-300 rounded-xl text-xs font-medium text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-slate-800 mb-1">Rencana Intervensi Tindakan Keperawatan (SIKI) *</label>
              <textarea
                value={diagIntervensi}
                onChange={e => setDiagIntervensi(e.target.value)}
                rows={4}
                className="w-full p-2.5 bg-sky-50/50 border border-sky-300 rounded-xl text-xs font-medium text-slate-800 font-mono"
              />
            </div>

            {/* TANDA TANGAN DIGITAL PERAWAT & DOKTER SESUAI PENGISI */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-4">
              <div className="border-b border-slate-200 pb-2">
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <PenTool className="w-4 h-4 text-sky-600" />
                  Bagian Tanda Tangan (TTD) Digital Perawat & Dokter Penanggung Jawab
                </h4>
                <p className="text-[11px] text-slate-500">
                  Wajib diverifikasi dan ditandatangani oleh Perawat Pengkaji dan Dokter DPJP Penanggung Jawab Asuhan Pasien sesuai KMK 1423/2022.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* TTD Perawat */}
                <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
                  <DigitalSignaturePad
                    title="Tanda Tangan Perawat Pengkaji"
                    roleLabel="Perawat Penanggung Jawab Asuhan (PPJA)"
                    personName={nurseSignName}
                    onNameChange={setNurseSignName}
                    identifierNumber={nurseSignId}
                    onIdentifierChange={setNurseSignId}
                    signatureValue={nurseSignature}
                    onSignatureChange={setNurseSignature}
                    signedDate={tglPengkajian}
                  />
                </div>

                {/* TTD Dokter DPJP */}
                <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
                  <DigitalSignaturePad
                    title="Verifikasi & Tanda Tangan Dokter DPJP"
                    roleLabel="Dokter DPJP / Verifikator Asuhan"
                    personName={doctorSignName}
                    onNameChange={setDoctorSignName}
                    identifierNumber={doctorSignId}
                    onIdentifierChange={setDoctorSignId}
                    signatureValue={doctorSignature}
                    onSignatureChange={setDoctorSignature}
                    signedDate={tglPengkajian}
                  />
                </div>
              </div>
            </div>

            {/* VERIFICATION & BOTTOM SAVE BAR */}
            <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs text-emerald-950">
              <div className="flex items-center gap-2 font-bold">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <span>Status Verifikasi: <strong className="text-slate-900 font-extrabold">{nurseSignName} &bull; {doctorSignName}</strong></span>
              </div>
              <span className="font-mono text-[11px] bg-white px-2.5 py-1 rounded-lg border border-emerald-200 font-bold text-emerald-800">
                Verified E-Signature SIMRS KMK 1423/2022
              </span>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition-colors cursor-pointer"
              >
                Tutup Halaman
              </button>

              <button
                type="button"
                onClick={handleSaveAll}
                className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black transition-all shadow-lg flex items-center gap-2 cursor-pointer scale-100 hover:scale-[1.02]"
              >
                <CheckCircle2 className="w-5 h-5" /> SIMPAN SELURUH FORMULIR PENGKAJIAN KEPERAWATAN
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  </div>
  );
};
