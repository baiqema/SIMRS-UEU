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
  Bed, Stethoscope, Activity, HeartPulse, ShieldCheck, Printer,
  Save, CheckCircle2, AlertTriangle, Plus, Trash2, FileText,
  Clock, Calendar, UserCheck, CheckSquare, Layers, History, ClipboardList
} from 'lucide-react';
import Swal from 'sweetalert2';
import { SequentialHospitalLogos } from '../Logos';

interface FormRawatInapProps {
  patient: Patient;
  registration?: Registration;
  user?: UserType | null;
  onSaveSuccess?: () => void;
}

export const FormRawatInap: React.FC<FormRawatInapProps> = ({
  patient,
  registration,
  user,
  onSaveSuccess
}) => {
  const [caraBayar, setCaraBayar] = useState<'JKN' | 'Mandiri' | 'Asuransi lainnya'>('JKN');
  const [gcState, setGcState] = useState<GeneralConsentState>(initialGeneralConsentState);

  // 1. ANAMNESIS RAWAT INAP
  const [keluhanUtama, setKeluhanUtama] = useState('Demam tinggi hari ke-4, nyeri ulu hati, mual hebat, lemas tidak bisa makan minum sejak 2 hari SMRS.');
  const [riwayatPenyakit, setRiwayatPenyakit] = useState('Riwayat gastritis kronis. Riwayat rawat inap 1 tahun lalu karena demam berdarah dengue.');
  const [riwayatAlergiObat, setRiwayatAlergiObat] = useState('Ampicillin (Ruam kemerahan)');
  const [riwayatAlergiMakanan, setRiwayatAlergiMakanan] = useState('Tidak Ada');
  const [riwayatAlergiUdara, setRiwayatAlergiUdara] = useState('Tidak Ada');
  const [riwayatAlergiLain, setRiwayatAlergiLain] = useState('Tidak Ada');
  const [riwayatPengobatan, setRiwayatPengobatan] = useState('Paracetamol 500mg, Sucralfate sirup.');

  // 2. PEMERIKSAAN FISIK
  const [tingkatKesadaran, setTingkatKesadaran] = useState('Sadar Baik / Alert');
  const [vitalSign, setVitalSign] = useState({
    denyutJantung: '92',
    pernapasan: '20',
    sistole: '110',
    diastole: '70',
    suhuTubuh: '38.6'
  });

  // 3. PSIKOLOGIS, SOSIAL, SPIRITUAL
  const [statusPsikologis, setStatusPsikologis] = useState('Cemas');
  const [sosialEkonomi, setSosialEkonomi] = useState('Pasien didampingi keluarga, dukungan sosial keluarga sangat baik, kelas rawat BPJS Kelas 1.');
  const [spiritual, setSpiritual] = useState('Pasien rutin beribadah di tempat tidur (tayamum dan sholat sambil duduk).');

  // BAGIAN V — SPESIALISTIK
  const [obatList, setObatList] = useState<{ nama: string; dosis: string; waktu: string }[]>([
    { nama: 'IVFD Ringer Laktat (RL)', dosis: '20 tpm (500 ml / 6 jam)', waktu: 'Intravena Kontinu' },
    { nama: 'Inj. Ceftriaxone', dosis: '1 gram / 12 jam', waktu: 'Intravena Vial' },
    { nama: 'Inj. Ranitidine / Omeprazole', dosis: '1 ampul / 12 jam', waktu: 'Intravena Bolus' },
    { nama: 'Inj. Ondansetron', dosis: '4 mg / 8 jam k/p', waktu: 'Intravena k/p Mual' }
  ]);
  const [newObat, setNewObat] = useState({ nama: '', dosis: '', waktu: '' });

  // Discharge Planning Checklist
  const [dischargePlanning, setDischargePlanning] = useState({
    lansia: false,
    anggotaGerak: false,
    perawatanPanjang: true,
    bantuanAdl: true,
    tidakMasukKriteria: false
  });

  const [rencanaRawat, setRencanaRawat] = useState('Rawat inap Ruang Melati Bed 03. Terapi cairan rehidrasi intensif, antibiotik empiris, pemantauan tanda vital per 4 jam, serial darah rutin tiap 24 jam.');
  const [instruksiMedik, setInstruksiMedik] = useState('Diet lunak rendah serat bertahap, tirah baring, observasi intake-output urin, lapor dokter jaga bila suhu > 39°C atau tanda perdarahan.');

  // Pemeriksaan Penunjang Spesifik Rawat Inap
  const [penunjangRanap, setPenunjangRanap] = useState({
    noPermintaan: 'LAB-RANAP-2026-0042',
    tglPermintaan: new Date().toISOString().substring(0, 10),
    jamPermintaan: '08:00',
    dokterPengirim: 'dr. Sari Dewi, Sp.PD',
    telpDokter: '081298765432',
    fasyankesPengirim: 'RS Esa Unggul Medical Center',
    unitPengirim: 'Rawat Inap - Bangsal Melati Bed 03',
    prioritas: 'Prioritas Tinggi / Rutin Rawat Inap',
    namaPemeriksaan: 'Darah Lengkap Serial (Hb, Ht, Leukosit, Trombosit), SGOT, SGPT, Tubex TF Titer',
    statusPuasa: 'Tidak Puasa',
    metodePengiriman: 'Elektronik SIMRS & Lembar Cetak Hasil Lab',
    diagnosis: 'Demam Tifoid H-4 dd DHF Derajat I + Dispepsia Berat'
  });

  // Longitudinal Notes (Pencatatan Berulang Harian Rawat Inap)
  const [longitudinalNotes, setLongitudinalNotes] = useState<
    { id: string; tanggal: string; jam: string; petugas: string; role: string; unit: string; catatan: string; status: string }[]
  >([
    {
      id: 'L01',
      tanggal: new Date().toISOString().substring(0, 10),
      jam: '06:30',
      petugas: 'Ns. Fitriani, S.Kep',
      role: 'Perawat Jaga Pagi',
      unit: 'Bangsal Melati',
      catatan: 'Vital sign: BP 110/70 mmHg, HR 88 bpm, T 37.6°C, RR 18x/m. Pasien menyatakan mual berkurang, infus lancar 20 tpm, tidak ada flebitis.',
      status: 'Terverifikasi'
    },
    {
      id: 'L02',
      tanggal: new Date().toISOString().substring(0, 10),
      jam: '09:15',
      petugas: 'dr. Sari Dewi, Sp.PD',
      role: 'Dokter DPJP',
      unit: 'Bangsal Melati',
      catatan: 'Visite DPJP: Keadaan umum membaik, bising usus normal, nyeri tekan epigastrium menurun. Lanjutkan antibiotik Ceftriaxone hari ke-2. Diet bubur halus.',
      status: 'Terverifikasi DPJP'
    }
  ]);

  const [newNote, setNewNote] = useState('');

  const handleAddLongitudinalNote = () => {
    if (!newNote.trim()) return;
    const item = {
      id: `L0${longitudinalNotes.length + 1}`,
      tanggal: new Date().toISOString().substring(0, 10),
      jam: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      petugas: user?.name || 'Dokter/Perawat Jaga',
      role: 'PPA Bertugas',
      unit: 'Bangsal Melati Bed 03',
      catatan: newNote,
      status: 'Tercatat'
    };
    setLongitudinalNotes([item, ...longitudinalNotes]);
    setNewNote('');
    Swal.fire({
      icon: 'success',
      title: 'Catatan Longitudinal Tersimpan',
      text: 'Data terintegrasi ke rekam medis rawat inap tanpa menduplikasi data identitas pasien.',
      timer: 1500,
      showConfirmButton: false
    });
  };

  const handleSaveForm = (isFinal = false) => {
    Swal.fire({
      icon: 'success',
      title: isFinal ? 'Formulir Asesmen Rawat Inap Terverifikasi!' : 'Draft Rawat Inap Tersimpan',
      html: `
        <div class="text-left text-xs space-y-1 text-slate-600">
          <p><strong>Pasien:</strong> ${patient.name} (${patient.noRM})</p>
          <p><strong>Bangsal:</strong> Melati Bed 03</p>
          <p><strong>Status:</strong> ${isFinal ? 'Final & Tervalidasi DPJP' : 'Draft Tersimpan'}</p>
          <p><strong>Waktu:</strong> ${new Date().toLocaleString('id-ID')}</p>
        </div>
      `,
      confirmButtonText: 'Tutup',
      confirmButtonColor: '#0284c7'
    });
    if (onSaveSuccess) onSaveSuccess();
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 font-sans text-slate-800">
      {/* HEADER KOP RESMI FORMULIR MEDIS RAWAT INAP */}
      <div className="bg-white border-2 border-slate-300 rounded-3xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <SequentialHospitalLogos size="md" showSubtitle={true} />
        <div className="text-right shrink-0">
          <div className="inline-block px-3 py-1 bg-sky-700 text-white font-mono font-black text-xs rounded-xl uppercase tracking-wider">
            FORMULIR ASESMEN AWAL RAWAT INAP
          </div>
          <div className="text-xs font-bold text-sky-800 mt-1">
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

      {/* BAGIAN IV — FORMULIR RAWAT INAP (ANAMNESIS, FISIK, PSIKOLOGIS) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-6 shadow-xs">
        <div className="border-b border-slate-200 pb-3 flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-sky-700 text-white flex items-center justify-center font-black text-sm">
            IV
          </div>
          <div>
            <h4 className="text-sm font-black text-slate-900 uppercase tracking-wide">
              BAGIAN IV — FORMULIR RAWAT INAP (ASESMEN KLINIS)
            </h4>
            <p className="text-[11px] text-slate-500 font-medium">
              Anamnesis, Pemeriksaan Fisik 28 Regio Tubuh, & Pemeriksaan Psikososial Spiritual
            </p>
          </div>
        </div>

        {/* 1. ANAMNESIS */}
        <div className="space-y-3 text-xs">
          <div className="text-xs font-black text-sky-900 uppercase tracking-wider flex items-center gap-2 border-b border-sky-100 pb-1.5">
            <ClipboardList className="w-4 h-4 text-sky-700" />
            <span>1. ANAMNESIS RAWAT INAP</span>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Keluhan Utama:</span>
              <textarea
                rows={2}
                value={keluhanUtama}
                onChange={e => setKeluhanUtama(e.target.value)}
                className="w-full p-2 bg-slate-50 rounded-xl border border-slate-200 font-medium"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Riwayat Penyakit:</span>
                <textarea
                  rows={2}
                  value={riwayatPenyakit}
                  onChange={e => setRiwayatPenyakit(e.target.value)}
                  className="w-full p-2 bg-slate-50 rounded-xl border border-slate-200 font-medium"
                />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Riwayat Pengobatan:</span>
                <textarea
                  rows={2}
                  value={riwayatPengobatan}
                  onChange={e => setRiwayatPengobatan(e.target.value)}
                  className="w-full p-2 bg-slate-50 rounded-xl border border-slate-200 font-medium"
                />
              </div>
            </div>

            <div className="p-2.5 bg-rose-50 rounded-xl border border-rose-200 grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div>
                <span className="text-[9px] font-bold text-rose-800 uppercase">Alergi Obat:</span>
                <input type="text" value={riwayatAlergiObat} onChange={e => setRiwayatAlergiObat(e.target.value)} className="w-full p-1 bg-white rounded border border-rose-200 text-xs font-semibold" />
              </div>
              <div>
                <span className="text-[9px] font-bold text-rose-800 uppercase">Alergi Makanan:</span>
                <input type="text" value={riwayatAlergiMakanan} onChange={e => setRiwayatAlergiMakanan(e.target.value)} className="w-full p-1 bg-white rounded border border-rose-200 text-xs font-semibold" />
              </div>
              <div>
                <span className="text-[9px] font-bold text-rose-800 uppercase">Alergi Udara:</span>
                <input type="text" value={riwayatAlergiUdara} onChange={e => setRiwayatAlergiUdara(e.target.value)} className="w-full p-1 bg-white rounded border border-rose-200 text-xs font-semibold" />
              </div>
              <div>
                <span className="text-[9px] font-bold text-rose-800 uppercase">Alergi Lain:</span>
                <input type="text" value={riwayatAlergiLain} onChange={e => setRiwayatAlergiLain(e.target.value)} className="w-full p-1 bg-white rounded border border-rose-200 text-xs font-semibold" />
              </div>
            </div>
          </div>
        </div>

        {/* 2. PEMERIKSAAN FISIK & 28 BAGIAN TUBUH */}
        <div className="space-y-3 text-xs pt-3 border-t border-slate-200">
          <div className="flex items-center justify-between border-b border-slate-200 pb-1">
            <span className="font-black uppercase text-slate-800 flex items-center gap-1.5">
              <Stethoscope className="w-4 h-4 text-sky-700" />
              <span>2. PEMERIKSAAN FISIK & 28 REGIO TUBUH</span>
            </span>
            <div className="text-[11px] font-mono font-bold text-slate-700">
              HR: {vitalSign.denyutJantung} | BP: {vitalSign.sistole}/{vitalSign.diastole} | RR: {vitalSign.pernapasan} | T: {vitalSign.suhuTubuh}°C
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-1.5">
            {BODY_PARTS_28.map((part, idx) => (
              <div key={part} className="p-1.5 bg-slate-50 rounded-lg border border-slate-200 text-center">
                <div className="text-[9px] text-slate-500 font-bold">{idx + 1}. {part}</div>
                <div className="text-[10px] font-black text-emerald-700">TAK</div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. PSIKOLOGIS, SOSIAL, SPIRITUAL */}
        <div className="space-y-2 text-xs pt-3 border-t border-slate-200">
          <span className="font-black uppercase text-slate-800 block">3. Asesmen Psikososial & Spiritual:</span>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Status Psikologis:</span>
              <div className="font-bold text-slate-800 mt-1">{statusPsikologis} (Responsif)</div>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Sosial Ekonomi:</span>
              <div className="font-medium text-slate-800 mt-1">{sosialEkonomi}</div>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Kebutuhan Rohani:</span>
              <div className="font-medium text-slate-800 mt-1">{spiritual}</div>
            </div>
          </div>
        </div>
      </div>

      {/* BAGIAN V — PEMERIKSAAN SPESIALISTIK RAWAT INAP */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-5 shadow-xs">
        <div className="border-b border-slate-200 pb-3 flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-blue-700 text-white flex items-center justify-center font-black text-sm">
            V
          </div>
          <div>
            <h4 className="text-sm font-black text-slate-900 uppercase tracking-wide">
              BAGIAN V — PEMERIKSAAN SPESIALISTIK & DISCHARGE PLANNING
            </h4>
            <p className="text-[11px] text-slate-500 font-medium">
              Obat Ranap, Rencana Pemulangan, Instruksi Medik, & Pemeriksaan Penunjang Spesifik
            </p>
          </div>
        </div>

        {/* 1. Riwayat Penggunaan Obat Ranap */}
        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
          <span className="font-bold text-slate-900 uppercase text-[11px] block">
            1. Terapi Medikamentosa & Penggunaan Obat Selama Dirawat:
          </span>
          <div className="space-y-1 divide-y divide-slate-200 bg-white rounded-lg border border-slate-200 p-2">
            {obatList.map((ob, i) => (
              <div key={i} className="py-1.5 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900">{ob.nama}</span>
                  <span className="text-slate-500 ml-2">({ob.dosis})</span>
                </div>
                <span className="text-[11px] font-mono text-blue-700">{ob.waktu}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 2. Perencanaan Pemulangan Pasien / Discharge Planning */}
        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
          <span className="font-bold text-slate-900 uppercase text-[11px] block">
            2. Perencanaan Pemulangan Pasien (Discharge Planning Criteria):
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {[
              { key: 'lansia', label: 'Pasien Usia Lanjut (>60 th)' },
              { key: 'anggotaGerak', label: 'Gangguan Anggota Gerak / Mobilitas' },
              { key: 'perawatanPanjang', label: 'Pasien Perawatan Berkelanjutan / Panjang' },
              { key: 'bantuanAdl', label: 'Memerlukan Bantuan Aktivitas Sehari-hari (ADL)' },
              { key: 'tidakMasukKriteria', label: 'Tidak Masuk Kriteria Khusus (Mandiri)' }
            ].map(item => (
              <label key={item.key} className="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={(dischargePlanning as any)[item.key]}
                  onChange={e => setDischargePlanning({ ...dischargePlanning, [item.key]: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span className="font-medium text-slate-800 text-[11px]">{item.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* 3 & 4: Rencana Rawat & Instruksi Medik */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <span className="font-bold text-slate-800 uppercase block">3. Rencana Rawat Inap:</span>
            <textarea rows={3} value={rencanaRawat} onChange={e => setRencanaRawat(e.target.value)} className="w-full p-2 bg-white rounded border border-slate-300 font-medium" />
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <span className="font-bold text-slate-800 uppercase block">4. Instruksi Medik dan Keperawatan:</span>
            <textarea rows={3} value={instruksiMedik} onChange={e => setInstruksiMedik(e.target.value)} className="w-full p-2 bg-white rounded border border-slate-300 font-medium" />
          </div>
        </div>

        {/* 5. Pemeriksaan Penunjang Spesifik Sesuai Metadata Lengkap */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 text-xs">
          <div className="flex items-center justify-between border-b border-slate-200 pb-1">
            <span className="font-bold text-slate-900 uppercase">
              5. Formulir Permintaan Pemeriksaan Penunjang Terintegrasi
            </span>
            <span className="font-mono text-[10px] text-blue-700 font-bold">No. Order: {penunjangRanap.noPermintaan}</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div>
              <span className="text-[9px] font-bold text-slate-500 uppercase">Dokter Pengirim:</span>
              <div className="font-bold text-slate-800">{penunjangRanap.dokterPengirim}</div>
            </div>
            <div>
              <span className="text-[9px] font-bold text-slate-500 uppercase">Unit Pengirim:</span>
              <div className="font-bold text-slate-800">{penunjangRanap.unitPengirim}</div>
            </div>
            <div>
              <span className="text-[9px] font-bold text-slate-500 uppercase">Prioritas Order:</span>
              <div className="font-bold text-emerald-800">{penunjangRanap.prioritas}</div>
            </div>
            <div>
              <span className="text-[9px] font-bold text-slate-500 uppercase">Status Puasa:</span>
              <div className="font-bold text-slate-800">{penunjangRanap.statusPuasa}</div>
            </div>
          </div>

          <div>
            <span className="text-[9px] font-bold text-slate-500 uppercase">Nama Pemeriksaan Penunjang:</span>
            <div className="font-bold text-blue-900 p-2 bg-white rounded border border-slate-300">{penunjangRanap.namaPemeriksaan}</div>
          </div>
        </div>
      </div>

      {/* MODUL PENCATATAN BERULANG LONGITUDINAL RAWAT INAP */}
      <div className="bg-white border-2 border-sky-300 rounded-2xl p-5 space-y-4 shadow-xs">
        <div className="border-b border-sky-200 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-sky-700 text-white flex items-center justify-center font-black text-sm">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-black text-slate-900 uppercase tracking-wide">
                PENCATATAN BERULANG (LONGITUDINAL) SELAMA RAWAT INAP
              </h4>
              <p className="text-[11px] text-slate-500 font-medium">
                Pencatatan perkembangan harian / shift tanpa menduplikasi data identitas pasien (Audit Trail Terintegrasi)
              </p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-sky-800 bg-sky-50 px-2.5 py-1 rounded-lg border border-sky-200">
            {longitudinalNotes.length} Catatan Longitudinal
          </span>
        </div>

        {/* Input New Longitudinal Note */}
        <div className="p-3 bg-sky-50/60 rounded-xl border border-sky-200 space-y-2 text-xs">
          <label className="font-bold text-sky-950 block">
            + Tambah Catatan Perkembangan Harian / Catatan Visite DPJP / Catatan Perawat:
          </label>
          <textarea
            rows={2}
            value={newNote}
            onChange={e => setNewNote(e.target.value)}
            placeholder="Tuliskan perkembangan klinis, respon terapi, tanda vital, atau instruksi shift baru..."
            className="w-full p-2 bg-white rounded-lg border border-sky-300 font-medium text-slate-800 focus:outline-none focus:border-sky-600"
          />
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleAddLongitudinalNote}
              className="px-3.5 py-1.5 bg-sky-700 hover:bg-sky-800 text-white font-bold rounded-lg text-xs flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Simpan Catatan Longitudinal</span>
            </button>
          </div>
        </div>

        {/* Longitudinal History List */}
        <div className="space-y-2.5">
          {longitudinalNotes.map(item => (
            <div key={item.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">{item.petugas}</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-sky-100 text-sky-800">{item.role}</span>
                  <span className="text-slate-400">&bull;</span>
                  <span className="text-slate-500 font-mono">{item.unit}</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500">
                  <span>{item.tanggal}</span> &bull; <span>{item.jam} WIB</span>
                  <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                    {item.status}
                  </span>
                </div>
              </div>
              <p className="text-slate-800 font-medium pl-2 border-l-2 border-sky-500 leading-relaxed">
                {item.catatan}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* BOTTOM ACTION BAR */}
      <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="text-xs text-slate-500 font-medium">
          DPJP Rawat Inap: <strong className="text-slate-800">{user?.name || 'dr. Sari Dewi, Sp.PD'}</strong>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Form Rawat Inap</span>
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
            className="px-4 py-2 bg-sky-700 hover:bg-sky-800 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Verifikasi & TTE DPJP</span>
          </button>
        </div>
      </div>
    </div>
  );
};
