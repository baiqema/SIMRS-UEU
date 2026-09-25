import React, { useState } from 'react';
import { Patient, Registration, User as UserType } from '../../types';
import {
  LembarIdentitasSection,
  CaraPembayaranSection,
  GeneralConsentSection,
  initialGeneralConsentState,
  GeneralConsentState,
  BODY_PARTS_28
} from './FormSharedSections';
import {
  Stethoscope, Activity, HeartPulse, ShieldCheck, Printer,
  Save, CheckCircle2, AlertTriangle, Plus, Trash2, FileText,
  UserCheck, ClipboardList, Info, HelpCircle
} from 'lucide-react';
import Swal from 'sweetalert2';
import { SequentialHospitalLogos } from '../Logos';

interface FormRawatJalanProps {
  patient: Patient;
  registration?: Registration;
  user?: UserType | null;
  onSaveSuccess?: () => void;
}

export const FormRawatJalan: React.FC<FormRawatJalanProps> = ({
  patient,
  registration,
  user,
  onSaveSuccess
}) => {
  // State Pembayaran & Consent
  const [caraBayar, setCaraBayar] = useState<'JKN' | 'Mandiri' | 'Asuransi lainnya'>('JKN');
  const [gcState, setGcState] = useState<GeneralConsentState>(initialGeneralConsentState);

  // 1. ANAMNESIS
  const [keluhanUtama, setKeluhanUtama] = useState(
    'Pasien mengeluhkan demam naik turun sejak 3 hari yang lalu disertai nyeri kepala, lemas, mual, dan nafsu makan menurun.'
  );
  const [riwayatPenyakit, setRiwayatPenyakit] = useState(
    'Riwayat gastritis berulang sejak 1 tahun lalu. Riwayat hipertensi dan diabetes melitus disangkal.'
  );
  const [riwayatAlergiObat, setRiwayatAlergiObat] = useState('Tidak Ada (Disangkal)');
  const [riwayatAlergiMakanan, setRiwayatAlergiMakanan] = useState('Udang / Seafood (Gatal ringan)');
  const [riwayatAlergiUdara, setRiwayatAlergiUdara] = useState('Debu dingin (Bersin)');
  const [riwayatAlergiLain, setRiwayatAlergiLain] = useState('Tidak Ada');
  const [riwayatPengobatan, setRiwayatPengobatan] = useState(
    'Paracetamol 500mg 3x1 tablet (swamedikasi) dan Antasida sirup 3x1 cth saat mual.'
  );

  // 2. PEMERIKSAAN FISIK
  const [tingkatKesadaran, setTingkatKesadaran] = useState('Sadar Baik / Alert');
  const [vitalSign, setVitalSign] = useState({
    denyutJantung: '84',
    pernapasan: '18',
    sistole: '120',
    diastole: '80',
    suhuTubuh: '37.8'
  });

  // Anatomi Marker Points (3D Muscular Anatomy Model)
  const [bodyMarks, setBodyMarks] = useState<{ x: number; y: number; note: string }[]>([
    { x: 28, y: 13, note: '[Anterior] Cephalgia regio frontal' },
    { x: 28, y: 38, note: '[Anterior] Nyeri tekan regio epigastrium' }
  ]);
  const [selectedBodyPartForMark, setSelectedBodyPartForMark] = useState('Kepala');

  // 28 Bagian Tubuh State
  const [bodyPartStatus, setBodyPartStatus] = useState<Record<string, { status: string; desc: string }>>(() => {
    const initial: Record<string, { status: string; desc: string }> = {};
    BODY_PARTS_28.forEach(part => {
      if (part === 'Kepala') {
        initial[part] = { status: 'Kelainan', desc: 'Cephalgia regio frontal' };
      } else if (part === 'Perut') {
        initial[part] = { status: 'Kelainan', desc: 'Nyeri tekan epigastrium (+), bising usus normal' };
      } else {
        initial[part] = { status: 'TAK', desc: 'Dalam batas normal' };
      }
    });
    return initial;
  });

  // 3. PSIKOLOGIS, SOSIAL EKONOMI, SPIRITUAL
  const [statusPsikologis, setStatusPsikologis] = useState('Cemas');
  const [statusPsikologisLain, setStatusPsikologisLain] = useState('');
  const [sosialEkonomi, setSosialEkonomi] = useState(
    'Pasien tinggal bersama keluarga, hubungan harmonis. Pembiayaan kesehatan didukung oleh asuransi BPJS / JKN.'
  );
  const [spiritual, setSpiritual] = useState(
    'Pasien beragama Islam, taat beribadah, membutuhkan waktu sholat di sela tindakan medis.'
  );

  // 4. PEMERIKSAAN SPESIALISTIK
  const [obatList, setObatList] = useState<{ nama: string; dosis: string; waktu: string }[]>([
    { nama: 'Paracetamol', dosis: '500 mg', waktu: 'Tiap 8 jam saat demam' },
    { nama: 'Omeprazole', dosis: '20 mg', waktu: 'Sebelum makan pagi (1x sehari)' }
  ]);
  const [newObat, setNewObat] = useState({ nama: '', dosis: '', waktu: '' });

  const [rencanaRawat, setRencanaRawat] = useState(
    'Rawat Jalan Poliklinik Penyakit Dalam. Edukasi hidrasi cairan oral 2-2.5L/hari, diet lambung lunak, kontrol ulang 3 hari jika demam menetap.'
  );
  const [instruksiMedik, setInstruksiMedik] = useState(
    'Tirah baring cukup, monitoring suhu berkala per 4 jam, segera ke IGD bila ada tanda dehidrasi atau muntah hebat.'
  );

  // Pemeriksaan Penunjang
  const [penunjang, setPenunjang] = useState({
    jam: '10:15',
    tanggal: new Date().toISOString().substring(0, 10),
    statusPuasa: 'Tidak Puasa',
    laboratorium: 'Hematologi Rutin (Darah Lengkap: Hb, Ht, Leukosit, Trombosit), Widal Test',
    radiologi: 'Foto Thorax AP/PA (Evaluasi Paru & Jantung)',
    diagnosis: 'Febris H-3 ec Suspect Demam Tifoid dd DHF + Dispepsia Sindrom',
    catatanPermintaan: 'Cito pemeriksaan darah lengkap untuk skrining trombositopenia',
    hasilPemeriksaan: 'Hb: 13.8 g/dL, Leukosit: 4.800 /uL, Trombosit: 185.000 /uL, Ht: 41%'
  });

  const handleAddObat = () => {
    if (!newObat.nama) return;
    setObatList([...obatList, newObat]);
    setNewObat({ nama: '', dosis: '', waktu: '' });
  };

  const handleRemoveObat = (index: number) => {
    setObatList(obatList.filter((_, i) => i !== index));
  };

  const handleBodyPartChange = (part: string, field: 'status' | 'desc', val: string) => {
    setBodyPartStatus(prev => ({
      ...prev,
      [part]: {
        ...prev[part],
        [field]: val
      }
    }));
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const rawX = ((e.clientX - rect.left) / rect.width) * 100;
    const rawY = ((e.clientY - rect.top) / rect.height) * 100;
    const x = Math.min(98, Math.max(2, Math.round(rawX)));
    const y = Math.min(98, Math.max(2, Math.round(rawY)));
    const regioSide = x <= 50 ? 'Anterior (Tampak Depan)' : 'Posterior (Tampak Belakang)';
    setBodyMarks(prev => [...prev, { x, y, note: `[${regioSide}] Regio ${selectedBodyPartForMark}` }]);
  };

  const handleSaveForm = (isFinal = false) => {
    Swal.fire({
      icon: 'success',
      title: isFinal ? 'Formulir Rawat Jalan Terverifikasi!' : 'Draft Formulir Tersimpan',
      html: `
        <div class="text-left text-xs space-y-1 text-slate-600">
          <p><strong>Pasien:</strong> ${patient.name} (${patient.noRM})</p>
          <p><strong>Status:</strong> ${isFinal ? 'Final & Tervalidasi DPJP' : 'Draft Tersimpan'}</p>
          <p><strong>Waktu:</strong> ${new Date().toLocaleString('id-ID')}</p>
          <p><strong>Pemeriksa:</strong> ${user?.name || 'dr. DPJP Spesialis'}</p>
        </div>
      `,
      confirmButtonText: 'Tutup',
      confirmButtonColor: '#2563eb'
    });
    if (onSaveSuccess) onSaveSuccess();
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 font-sans text-slate-800">
      {/* HEADER KOP RESMI FORMULIR MEDIS RAWAT JALAN */}
      <div className="bg-white border-2 border-slate-300 rounded-3xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <SequentialHospitalLogos size="md" showSubtitle={true} />
        <div className="text-right shrink-0">
          <div className="inline-block px-3 py-1 bg-blue-600 text-white font-mono font-black text-xs rounded-xl uppercase tracking-wider">
            FORMULIR ASESMEN AWAL RAWAT JALAN
          </div>
          <div className="text-xs font-bold text-slate-600 mt-1">
            Standar Akreditasi & KMK 1423 Kemenkes RI
          </div>
        </div>
      </div>

      {/* BAGIAN I — LEMBAR IDENTITAS PASIEN */}
      <LembarIdentitasSection patient={patient} />

      {/* BAGIAN II — CARA PEMBAYARAN */}
      <CaraPembayaranSection
        caraBayar={caraBayar}
        setCaraBayar={setCaraBayar}
        noKartu={patient?.nik || '3173012345670001'}
      />

      {/* BAGIAN III — GENERAL CONSENT */}
      <GeneralConsentSection
        gcState={gcState}
        setGcState={setGcState}
        patient={patient}
      />

      {/* BAGIAN IV — ASESMEN AWAL RAWAT JALAN */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-6 shadow-xs">
        <div className="border-b border-slate-200 pb-3 flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-sm">
            IV
          </div>
          <div>
            <h4 className="text-sm font-black text-slate-900 uppercase tracking-wide">
              BAGIAN IV — ASESMEN AWAL RAWAT JALAN
            </h4>
            <p className="text-[11px] text-slate-500 font-medium">
              Anamnesis, Pemeriksaan Fisik 28 Regio Tubuh, Psikososial Spiritual & Spesialistik
            </p>
          </div>
        </div>

        {/* 1. ANAMNESIS */}
        <div className="space-y-4">
          <div className="text-xs font-black text-indigo-900 uppercase tracking-wider flex items-center gap-2 border-b border-indigo-100 pb-1.5">
            <ClipboardList className="w-4 h-4 text-indigo-600" />
            <span>1. ANAMNESIS KLINIS</span>
          </div>

          <div className="grid grid-cols-1 gap-4 text-xs">
            {/* a. Keluhan Utama */}
            <div className="space-y-1">
              <label className="font-bold text-slate-800 uppercase block text-[11px]">
                a. Keluhan Utama Pasien:
              </label>
              <textarea
                value={keluhanUtama}
                onChange={e => setKeluhanUtama(e.target.value)}
                rows={2}
                className="w-full p-2.5 bg-slate-50 rounded-xl border border-slate-200 font-medium text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500"
                placeholder="Tuliskan keluhan utama pasien..."
              />
            </div>

            {/* b. Riwayat Penyakit Sekarang & Dahulu */}
            <div className="space-y-1">
              <label className="font-bold text-slate-800 uppercase block text-[11px]">
                b. Riwayat Penyakit (Sekarang, Dahulu, & Keluarga):
              </label>
              <textarea
                value={riwayatPenyakit}
                onChange={e => setRiwayatPenyakit(e.target.value)}
                rows={2}
                className="w-full p-2.5 bg-slate-50 rounded-xl border border-slate-200 font-medium text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500"
                placeholder="Tuliskan riwayat penyakit..."
              />
            </div>

            {/* c. Riwayat Alergi (Obat, Makanan, Udara, Lain-lain) */}
            <div className="space-y-1.5 p-3 bg-rose-50/50 rounded-xl border border-rose-200">
              <label className="font-bold text-rose-900 uppercase block text-[11px]">
                c. Riwayat Alergi Pasien:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Alergi Obat:</span>
                  <input
                    type="text"
                    value={riwayatAlergiObat}
                    onChange={e => setRiwayatAlergiObat(e.target.value)}
                    className="w-full p-2 bg-white rounded-lg border border-slate-300 font-medium text-slate-800"
                  />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Alergi Makanan:</span>
                  <input
                    type="text"
                    value={riwayatAlergiMakanan}
                    onChange={e => setRiwayatAlergiMakanan(e.target.value)}
                    className="w-full p-2 bg-white rounded-lg border border-slate-300 font-medium text-slate-800"
                  />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Alergi Udara / Suhu:</span>
                  <input
                    type="text"
                    value={riwayatAlergiUdara}
                    onChange={e => setRiwayatAlergiUdara(e.target.value)}
                    className="w-full p-2 bg-white rounded-lg border border-slate-300 font-medium text-slate-800"
                  />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Alergi Lain-lain:</span>
                  <input
                    type="text"
                    value={riwayatAlergiLain}
                    onChange={e => setRiwayatAlergiLain(e.target.value)}
                    className="w-full p-2 bg-white rounded-lg border border-slate-300 font-medium text-slate-800"
                  />
                </div>
              </div>
            </div>

            {/* d. Riwayat Pengobatan */}
            <div className="space-y-1">
              <label className="font-bold text-slate-800 uppercase block text-[11px]">
                d. Riwayat Pengobatan Sebelumnya:
              </label>
              <textarea
                value={riwayatPengobatan}
                onChange={e => setRiwayatPengobatan(e.target.value)}
                rows={2}
                className="w-full p-2.5 bg-slate-50 rounded-xl border border-slate-200 font-medium text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500"
                placeholder="Obat yang pernah diminum sebelum periksa..."
              />
            </div>
          </div>
        </div>

        {/* 2. PEMERIKSAAN FISIK */}
        <div className="space-y-4 pt-4 border-t border-slate-200">
          <div className="text-xs font-black text-indigo-900 uppercase tracking-wider flex items-center gap-2 border-b border-indigo-100 pb-1.5">
            <Stethoscope className="w-4 h-4 text-indigo-600" />
            <span>2. PEMERIKSAAN FISIK & TANDA VITAL</span>
          </div>

          {/* Tingkat Kesadaran & Vital Signs */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Tingkat Kesadaran */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
              <label className="text-[11px] font-bold text-slate-800 uppercase block">
                Tingkat Kesadaran (AVPU / Confusional):
              </label>
              <select
                value={tingkatKesadaran}
                onChange={e => setTingkatKesadaran(e.target.value)}
                className="w-full p-2 bg-white rounded-lg border border-slate-300 font-bold text-slate-800"
              >
                <option value="Sadar Baik / Alert">Sadar Baik / Alert (Compos Mentis)</option>
                <option value="Berespon dengan kata-kata / Voice">Berespon dengan kata-kata / Voice (Somnolen)</option>
                <option value="Hanya berespons jika dirangsang nyeri / Pain">Hanya berespons jika dirangsang nyeri / Pain (Sopor)</option>
                <option value="Pasien tidak sadar / Unresponsive">Pasien tidak sadar / Unresponsive (Koma)</option>
                <option value="Gelisah atau bingung">Gelisah atau bingung</option>
                <option value="Acute Confusional States">Acute Confusional States / Delirium</option>
              </select>
            </div>

            {/* Vital Signs Grid */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
              <label className="text-[11px] font-bold text-slate-800 uppercase block">
                Tanda-Tanda Vital (Vital Signs):
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                <div>
                  <span className="text-[9px] font-bold text-slate-500 uppercase">HR (bpm):</span>
                  <input
                    type="text"
                    value={vitalSign.denyutJantung}
                    onChange={e => setVitalSign({ ...vitalSign, denyutJantung: e.target.value })}
                    className="w-full p-1.5 bg-white rounded-lg border border-slate-300 font-mono font-bold text-center"
                  />
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-500 uppercase">RR (x/mnt):</span>
                  <input
                    type="text"
                    value={vitalSign.pernapasan}
                    onChange={e => setVitalSign({ ...vitalSign, pernapasan: e.target.value })}
                    className="w-full p-1.5 bg-white rounded-lg border border-slate-300 font-mono font-bold text-center"
                  />
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-500 uppercase">Sistole:</span>
                  <input
                    type="text"
                    value={vitalSign.sistole}
                    onChange={e => setVitalSign({ ...vitalSign, sistole: e.target.value })}
                    className="w-full p-1.5 bg-white rounded-lg border border-slate-300 font-mono font-bold text-center"
                  />
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-500 uppercase">Diastole:</span>
                  <input
                    type="text"
                    value={vitalSign.diastole}
                    onChange={e => setVitalSign({ ...vitalSign, diastole: e.target.value })}
                    className="w-full p-1.5 bg-white rounded-lg border border-slate-300 font-mono font-bold text-center"
                  />
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-500 uppercase">Suhu (°C):</span>
                  <input
                    type="text"
                    value={vitalSign.suhuTubuh}
                    onChange={e => setVitalSign({ ...vitalSign, suhuTubuh: e.target.value })}
                    className="w-full p-1.5 bg-white rounded-lg border border-slate-300 font-mono font-bold text-center text-rose-600"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* a. Gambar Anatomi Tubuh Interaktif */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-xs font-bold text-slate-800 uppercase flex items-center gap-1.5">
                <Info className="w-4 h-4 text-blue-600" />
                <span>a. Gambar Anatomi Tubuh (Klik area gambar untuk menandai kelainan)</span>
              </span>
              <div className="flex items-center gap-2">
                <select
                  value={selectedBodyPartForMark}
                  onChange={e => setSelectedBodyPartForMark(e.target.value)}
                  className="p-1 text-xs bg-white rounded-lg border border-slate-300 font-bold"
                >
                  {BODY_PARTS_28.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setBodyMarks([])}
                  className="text-[11px] font-bold text-rose-600 hover:underline cursor-pointer"
                >
                  Reset Tanda
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
              {/* Interactive 3D Muscular Anatomical Canvas */}
              <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-3 shadow-xs space-y-2">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 px-1">
                  <span className="flex items-center gap-1.5 text-blue-800">
                    <Activity className="w-3.5 h-3.5 text-blue-600" />
                    <span>Model Anatomi 3D (Anterior & Posterior)</span>
                  </span>
                  <span className="text-[10px] text-slate-500 italic">
                    Klik pada otot/organ tubuh untuk menempatkan pin kelainan
                  </span>
                </div>

                <div
                  onClick={handleCanvasClick}
                  className="relative w-full h-80 sm:h-96 bg-white rounded-xl border-2 border-dashed border-slate-300 flex items-center justify-center cursor-crosshair overflow-hidden group select-none transition-all hover:border-blue-400"
                >
                  {/* Realistic 3D Muscular Anatomy Image (Anterior & Posterior Side-by-Side) */}
                  <img
                    src="/images/anatomy_3d_human.jpg"
                    alt="3D Human Muscular Anatomy Anterior and Posterior"
                    className="h-full w-full object-contain pointer-events-none select-none"
                    onError={(e) => {
                      // Fallback if needed
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=800&q=80';
                    }}
                  />

                  {/* Anatomical Orientation Overlays */}
                  <div className="absolute top-2 left-3 pointer-events-none">
                    <span className="px-2 py-0.5 bg-slate-900/75 backdrop-blur-xs text-white text-[10px] font-bold rounded-md shadow-xs border border-white/20">
                      ANTERIOR (Tampak Depan)
                    </span>
                  </div>
                  <div className="absolute top-2 right-3 pointer-events-none">
                    <span className="px-2 py-0.5 bg-slate-900/75 backdrop-blur-xs text-white text-[10px] font-bold rounded-md shadow-xs border border-white/20">
                      POSTERIOR (Tampak Belakang)
                    </span>
                  </div>

                  {/* Vertical Dividing Guide */}
                  <div className="absolute top-0 bottom-0 left-1/2 w-px border-r border-dashed border-slate-300/60 pointer-events-none" />

                  {/* Markers on 3D Body */}
                  {bodyMarks.map((m, idx) => (
                    <div
                      key={idx}
                      style={{ left: `${m.x}%`, top: `${m.y}%` }}
                      className="absolute -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-rose-600 hover:bg-rose-700 text-white rounded-full flex items-center justify-center text-xs font-black shadow-lg ring-2 ring-white transition-transform hover:scale-125 cursor-pointer z-10"
                      title={`#${idx + 1}: ${m.note}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        Swal.fire({
                          title: `Titik #${idx + 1}`,
                          input: 'text',
                          inputValue: m.note,
                          showCancelButton: true,
                          showDenyButton: true,
                          denyButtonText: 'Hapus Titik',
                          confirmButtonText: 'Simpan Catatan',
                          confirmButtonColor: '#2563eb',
                          denyButtonColor: '#e11d48'
                        }).then((res) => {
                          if (res.isConfirmed && res.value) {
                            setBodyMarks(prev => prev.map((bm, i) => i === idx ? { ...bm, note: res.value } : bm));
                          } else if (res.isDenied) {
                            setBodyMarks(prev => prev.filter((_, i) => i !== idx));
                          }
                        });
                      }}
                    >
                      {idx + 1}
                    </div>
                  ))}
                </div>

                {/* Quick Presets for Anatomy Regio */}
                <div className="pt-1 flex flex-wrap items-center gap-1.5 text-[10px]">
                  <span className="font-bold text-slate-600">Preset Cepat:</span>
                  <button
                    type="button"
                    onClick={() => setBodyMarks(prev => [...prev, { x: 28, y: 13, note: '[Anterior] Regio Kepala / Cephalgia' }])}
                    className="px-2 py-0.5 bg-slate-100 hover:bg-blue-100 text-slate-700 rounded-md border border-slate-200 cursor-pointer"
                  >
                    + Kepala (Depan)
                  </button>
                  <button
                    type="button"
                    onClick={() => setBodyMarks(prev => [...prev, { x: 28, y: 28, note: '[Anterior] Regio Thoraks / Dada' }])}
                    className="px-2 py-0.5 bg-slate-100 hover:bg-blue-100 text-slate-700 rounded-md border border-slate-200 cursor-pointer"
                  >
                    + Dada (Thoraks)
                  </button>
                  <button
                    type="button"
                    onClick={() => setBodyMarks(prev => [...prev, { x: 28, y: 40, note: '[Anterior] Regio Epigastrium / Perut' }])}
                    className="px-2 py-0.5 bg-slate-100 hover:bg-blue-100 text-slate-700 rounded-md border border-slate-200 cursor-pointer"
                  >
                    + Epigastrium (Perut)
                  </button>
                  <button
                    type="button"
                    onClick={() => setBodyMarks(prev => [...prev, { x: 73, y: 32, note: '[Posterior] Regio Punggung / Torakal' }])}
                    className="px-2 py-0.5 bg-slate-100 hover:bg-blue-100 text-slate-700 rounded-md border border-slate-200 cursor-pointer"
                  >
                    + Punggung (Belakang)
                  </button>
                  <button
                    type="button"
                    onClick={() => setBodyMarks(prev => [...prev, { x: 73, y: 46, note: '[Posterior] Regio Lumbal / Pinggang' }])}
                    className="px-2 py-0.5 bg-slate-100 hover:bg-blue-100 text-slate-700 rounded-md border border-slate-200 cursor-pointer"
                  >
                    + Pinggang (Lumbal)
                  </button>
                </div>
              </div>

              {/* Marker list & Finding Details */}
              <div className="lg:col-span-5 space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                    <ClipboardList className="w-4 h-4 text-rose-600" />
                    <span>Daftar Titik Kelainan 3D ({bodyMarks.length})</span>
                  </span>
                  <span className="text-[10px] text-slate-500">Klik titik untuk edit</span>
                </div>

                {bodyMarks.length > 0 ? (
                  <div className="space-y-2 max-h-80 sm:max-h-96 overflow-y-auto pr-1">
                    {bodyMarks.map((m, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-1.5"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 bg-rose-600 text-white rounded-full flex items-center justify-center text-[10px] font-black shrink-0">
                              {idx + 1}
                            </span>
                            <span className="font-bold text-slate-800 text-xs">
                              {m.note}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setBodyMarks(bodyMarks.filter((_, i) => i !== idx))}
                            className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                            title="Hapus Penanda"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-100">
                          <span className="font-mono">
                            Koordinat: X={m.x}%, Y={m.y}%
                          </span>
                          <span className={`font-semibold px-1.5 py-0.5 rounded text-[9px] ${
                            m.x <= 50 ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'
                          }`}>
                            {m.x <= 50 ? 'Anterior (Depan)' : 'Posterior (Belakang)'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center text-slate-400 bg-white rounded-xl border border-dashed border-slate-200 space-y-2">
                    <Info className="w-6 h-6 text-slate-300 mx-auto" />
                    <p className="text-xs">
                      Belum ada titik kelainan ditandai pada model 3D.
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Klik pada model anatomi tubuh 3D di sebelah kiri untuk meletakkan titik penanda fisik.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* c. Pemeriksaan Fisik 28 Bagian Tubuh Berurutan Sesuai Metadata KMK 1423 */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-800 uppercase">
                c. Pemeriksaan Fisik 28 Bagian Tubuh (Sesuai Metadata KMK 1423):
              </span>
              <span className="text-[11px] text-slate-500 font-bold">28 Regio Tubuh</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-96 overflow-y-auto pr-1">
              {BODY_PARTS_28.map((part, index) => {
                const cur = bodyPartStatus[part] || { status: 'TAK', desc: 'Dalam batas normal' };
                return (
                  <div key={part} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">
                        {index + 1}. {part}
                      </span>
                      <div className="flex items-center gap-2">
                        {['TAK', 'Kelainan', 'Tidak diperiksa'].map(st => (
                          <label key={st} className="flex items-center gap-1 cursor-pointer text-[10px] font-bold">
                            <input
                              type="radio"
                              name={`part_${part}`}
                              value={st}
                              checked={cur.status === st}
                              onChange={() => handleBodyPartChange(part, 'status', st)}
                              className="w-3 h-3 text-blue-600"
                            />
                            <span className={cur.status === st ? (st === 'Kelainan' ? 'text-rose-600' : 'text-emerald-700') : 'text-slate-500'}>
                              {st}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                    {cur.status === 'Kelainan' && (
                      <input
                        type="text"
                        value={cur.desc}
                        onChange={e => handleBodyPartChange(part, 'desc', e.target.value)}
                        placeholder={`Jelaskan kelainan pada ${part}...`}
                        className="w-full p-1.5 bg-white rounded-lg border border-rose-300 text-xs font-semibold text-rose-900 focus:outline-none"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 3. PEMERIKSAAN PSIKOLOGIS, SOSIAL EKONOMI, SPIRITUAL */}
        <div className="space-y-4 pt-4 border-t border-slate-200">
          <div className="text-xs font-black text-indigo-900 uppercase tracking-wider flex items-center gap-2 border-b border-indigo-100 pb-1.5">
            <HeartPulse className="w-4 h-4 text-indigo-600" />
            <span>3. PEMERIKSAAN PSIKOLOGIS, SOSIAL EKONOMI, SPIRITUAL</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            {/* a. Status Psikologis */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <label className="font-bold text-slate-800 uppercase block text-[11px]">
                a. Status Psikologis:
              </label>
              <div className="space-y-1.5">
                {['Tidak ada kelainan', 'Cemas', 'Takut', 'Marah', 'Sedih', 'Lain-lain'].map(opt => (
                  <label key={opt} className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                    <input
                      type="radio"
                      name="statusPsikologis"
                      value={opt}
                      checked={statusPsikologis === opt}
                      onChange={() => setStatusPsikologis(opt)}
                      className="w-3.5 h-3.5 text-indigo-600"
                    />
                    <span>{opt}</span>
                  </label>
                ))}
                {statusPsikologis === 'Lain-lain' && (
                  <input
                    type="text"
                    value={statusPsikologisLain}
                    onChange={e => setStatusPsikologisLain(e.target.value)}
                    placeholder="Sebutkan status psikologis..."
                    className="w-full p-1.5 bg-white rounded-lg border border-slate-300 text-xs"
                  />
                )}
              </div>
            </div>

            {/* b. Sosial Ekonomi */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <label className="font-bold text-slate-800 uppercase block text-[11px]">
                b. Sosial Ekonomi:
              </label>
              <textarea
                value={sosialEkonomi}
                onChange={e => setSosialEkonomi(e.target.value)}
                rows={5}
                className="w-full p-2 bg-white rounded-lg border border-slate-300 font-medium text-slate-800 text-xs focus:outline-none"
                placeholder="Kondisi sosial, keluarga, dan kemampuan finansial..."
              />
            </div>

            {/* c. Spiritual */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <label className="font-bold text-slate-800 uppercase block text-[11px]">
                c. Spiritual & Nilai Kepercayaan:
              </label>
              <textarea
                value={spiritual}
                onChange={e => setSpiritual(e.target.value)}
                rows={5}
                className="w-full p-2 bg-white rounded-lg border border-slate-300 font-medium text-slate-800 text-xs focus:outline-none"
                placeholder="Kebutuhan bimbingan rohani, nilai keagamaan khusus..."
              />
            </div>
          </div>
        </div>

        {/* 4. PEMERIKSAAN SPESIALISTIK */}
        <div className="space-y-4 pt-4 border-t border-slate-200">
          <div className="text-xs font-black text-indigo-900 uppercase tracking-wider flex items-center gap-2 border-b border-indigo-100 pb-1.5">
            <Activity className="w-4 h-4 text-indigo-600" />
            <span>4. PEMERIKSAAN SPESIALISTIK & PENUNJANG</span>
          </div>

          {/* a. Riwayat Penggunaan Obat */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 uppercase block text-[11px]">
                a. Riwayat Penggunaan Obat Saat Ini (Rekonsiliasi Obat):
              </span>
            </div>

            {/* Obat Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left divide-y divide-slate-200">
                <thead className="bg-slate-200/70 text-[10px] font-bold text-slate-700 uppercase">
                  <tr>
                    <th className="p-2">Nama Obat</th>
                    <th className="p-2">Dosis</th>
                    <th className="p-2">Waktu Penggunaan</th>
                    <th className="p-2 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {obatList.map((ob, idx) => (
                    <tr key={idx}>
                      <td className="p-2 font-bold text-slate-800">{ob.nama}</td>
                      <td className="p-2 font-medium text-slate-700">{ob.dosis}</td>
                      <td className="p-2 text-slate-600">{ob.waktu}</td>
                      <td className="p-2 text-right">
                        <button
                          type="button"
                          onClick={() => handleRemoveObat(idx)}
                          className="text-slate-400 hover:text-rose-600"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {/* Add Row */}
                  <tr className="bg-slate-50">
                    <td className="p-1.5">
                      <input
                        type="text"
                        placeholder="Contoh: Amoxicillin"
                        value={newObat.nama}
                        onChange={e => setNewObat({ ...newObat, nama: e.target.value })}
                        className="w-full p-1.5 bg-white rounded border border-slate-300 text-xs font-semibold"
                      />
                    </td>
                    <td className="p-1.5">
                      <input
                        type="text"
                        placeholder="Contoh: 500 mg"
                        value={newObat.dosis}
                        onChange={e => setNewObat({ ...newObat, dosis: e.target.value })}
                        className="w-full p-1.5 bg-white rounded border border-slate-300 text-xs"
                      />
                    </td>
                    <td className="p-1.5">
                      <input
                        type="text"
                        placeholder="Contoh: Tiap 8 jam"
                        value={newObat.waktu}
                        onChange={e => setNewObat({ ...newObat, waktu: e.target.value })}
                        className="w-full p-1.5 bg-white rounded border border-slate-300 text-xs"
                      />
                    </td>
                    <td className="p-1.5 text-right">
                      <button
                        type="button"
                        onClick={handleAddObat}
                        className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded text-xs cursor-pointer"
                      >
                        + Tambah
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* b. Rencana Rawat & c. Instruksi Medik */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
              <label className="font-bold text-slate-800 uppercase block text-[11px]">
                b. Rencana Rawat & Tindak Lanjut:
              </label>
              <textarea
                value={rencanaRawat}
                onChange={e => setRencanaRawat(e.target.value)}
                rows={3}
                className="w-full p-2 bg-white rounded-lg border border-slate-300 font-medium text-slate-800"
                placeholder="Rencana penatalaksanaan klinis..."
              />
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
              <label className="font-bold text-slate-800 uppercase block text-[11px]">
                c. Instruksi Medik dan Keperawatan:
              </label>
              <textarea
                value={instruksiMedik}
                onChange={e => setInstruksiMedik(e.target.value)}
                rows={3}
                className="w-full p-2 bg-white rounded-lg border border-slate-300 font-medium text-slate-800"
                placeholder="Instruksi medis dan asuhan..."
              />
            </div>
          </div>

          {/* d. Pemeriksaan Penunjang */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 text-xs">
            <span className="font-bold text-slate-800 uppercase block text-[11px]">
              d. Pemeriksaan Penunjang (Laboratorium & Radiologi Terintegrasi):
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase">Status Puasa Pasien:</span>
                <select
                  value={penunjang.statusPuasa}
                  onChange={e => setPenunjang({ ...penunjang, statusPuasa: e.target.value })}
                  className="w-full p-2 bg-white rounded-lg border border-slate-300 font-bold"
                >
                  <option value="Tidak Puasa">Tidak Puasa</option>
                  <option value="Puasa 8-10 Jam">Puasa 8-10 Jam (Glukosa / Profil Lipid)</option>
                  <option value="Puasa 12 Jam">Puasa 12 Jam</option>
                </select>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase">Pemeriksaan Laboratorium:</span>
                <input
                  type="text"
                  value={penunjang.laboratorium}
                  onChange={e => setPenunjang({ ...penunjang, laboratorium: e.target.value })}
                  className="w-full p-2 bg-white rounded-lg border border-slate-300 font-medium"
                />
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase">Pemeriksaan Radiologi:</span>
                <input
                  type="text"
                  value={penunjang.radiologi}
                  onChange={e => setPenunjang({ ...penunjang, radiologi: e.target.value })}
                  className="w-full p-2 bg-white rounded-lg border border-slate-300 font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase">Diagnosis / Masalah Klinis:</span>
                <input
                  type="text"
                  value={penunjang.diagnosis}
                  onChange={e => setPenunjang({ ...penunjang, diagnosis: e.target.value })}
                  className="w-full p-2 bg-white rounded-lg border border-slate-300 font-bold text-blue-900"
                />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase">Catatan Permintaan Dokter:</span>
                <input
                  type="text"
                  value={penunjang.catatanPermintaan}
                  onChange={e => setPenunjang({ ...penunjang, catatanPermintaan: e.target.value })}
                  className="w-full p-2 bg-white rounded-lg border border-slate-300 font-medium"
                />
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM ACTION BAR */}
        <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500 font-medium">
            Dokter DPJP Pemeriksa: <strong className="text-slate-800">{user?.name || 'dr. Sari Dewi, Sp.PD'}</strong>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Formulir</span>
            </button>
            <button
              type="button"
              onClick={() => handleSaveForm(false)}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Draft</span>
            </button>
            <button
              type="button"
              onClick={() => handleSaveForm(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Finalisasi & TTE Asesmen</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
