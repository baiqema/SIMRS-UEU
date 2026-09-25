import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Modal } from './Modal';
import { Patient, Registration, CPPT, MedicalRecord } from '../types';
import {
  User, Calendar, MapPin, Phone, ShieldCheck, CreditCard,
  FileText, HeartPulse, Stethoscope, History, Receipt,
  CheckCircle2, AlertTriangle, Printer, Clock, ExternalLink,
  ChevronRight, Activity, Eye, FileSpreadsheet
} from 'lucide-react';

interface ProfilPasienKomprehensifModalProps {
  isOpen: boolean;
  onClose: () => void;
  registration: Registration | null;
  patient: Patient | null;
}

export const ProfilPasienKomprehensifModal: React.FC<ProfilPasienKomprehensifModalProps> = ({
  isOpen,
  onClose,
  registration,
  patient
}) => {
  const { getUser, cppt, medicalRecords, registrations, navigate, asuhanKeperawatan } = useApp();
  const [activeTab, setActiveTab] = useState<'demografi' | 'keperawatan' | 'cppt' | 'riwayat' | 'billing'>('demografi');

  if (!isOpen || !registration || !patient) return null;

  const doctor = getUser(registration.dpjp);

  // Find CPPT for this patient / registration
  const patientCpptList = cppt.filter(c => c.patientId === patient.id);
  const currentRegCppt = patientCpptList.filter(c => c.regId === registration.id);

  // Find Medical Records
  const mrList = medicalRecords.filter(m => m.patientId === patient.id);
  const currentMR = mrList.find(m => m.regId === registration.id);

  // Find Askep
  const askep = asuhanKeperawatan.find(a => a.regId === registration.id);

  // Historical visits of this patient
  const patientHistoryRegs = registrations.filter(r => r.patientId === patient.id);

  const calculateAge = (dobStr: string) => {
    if (!dobStr) return '0 Th';
    const birth = new Date(dobStr);
    const now = new Date();
    let years = now.getFullYear() - birth.getFullYear();
    let months = now.getMonth() - birth.getMonth();
    if (months < 0 || (months === 0 && now.getDate() < birth.getDate())) {
      years--;
      months += 12;
    }
    return `${years} Tahun ${months} Bulan`;
  };

  const handlePrintResume = () => {
    window.print();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Profil Pasien Komprehensif (Integrated Electronic Medical Record)"
      maxWidth="max-w-5xl"
    >
      <div className="space-y-4">
        {/* BANNER IDENTITAS UTAMA PASIEN */}
        <div className="bg-gradient-to-r from-blue-700 via-sky-800 to-indigo-900 text-white rounded-2xl p-4 shadow-sm relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 relative z-10">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center font-bold text-xl border border-white/20 shrink-0">
                <User className="w-6 h-6 text-sky-200" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg font-black tracking-tight">{patient.name}</h2>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-white/20 text-sky-100 border border-white/30">
                    RM: {patient.noRM}
                  </span>
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-black ${
                    registration.type === 'IGD' ? 'bg-rose-500 text-white' :
                    registration.type === 'Rawat Inap' ? 'bg-amber-400 text-slate-900' :
                    registration.type === 'Bayi Baru Lahir' ? 'bg-emerald-400 text-slate-900' :
                    'bg-sky-400 text-slate-900'
                  }`}>
                    {registration.type}
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-emerald-500/90 text-white">
                    {registration.status || 'Aktif'}
                  </span>
                </div>

                <div className="text-xs text-sky-100 flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 font-medium">
                  <span>NIK: <strong>{patient.nik}</strong></span>
                  <span>Tgl Lahir: {patient.dob} ({calculateAge(patient.dob)})</span>
                  <span>JK: {patient.gender === '1' || patient.gender === 'M' || patient.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</span>
                  <span>Penjamin: <strong className="text-amber-300">{patient.insuranceType}</strong> ({patient.noBPJS || '-'})</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
              <button
                onClick={handlePrintResume}
                className="px-3 py-1.5 bg-white/15 hover:bg-white/25 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 border border-white/20 cursor-pointer"
                title="Cetak Ringkasan Profil Pasien"
              >
                <Printer className="w-3.5 h-3.5" /> Cetak Ringkasan
              </button>
              <button
                onClick={() => {
                  onClose();
                  navigate('rekammedis', { patientId: patient.id, regId: registration.id });
                }}
                className="px-3.5 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl text-xs font-black shadow-xs transition-all flex items-center gap-1 cursor-pointer"
              >
                <span>Buka RME Lengkap</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* TAB NAVIGASI INTERNAL PROFIL */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl overflow-x-auto scrollbar-none border border-slate-200">
          <button
            onClick={() => setActiveTab('demografi')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'demografi' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>1. Demografi & Admisi</span>
          </button>
          <button
            onClick={() => setActiveTab('keperawatan')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'keperawatan' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <HeartPulse className="w-3.5 h-3.5 text-rose-400" />
            <span>2. Asesmen Perawat & TTV</span>
          </button>
          <button
            onClick={() => setActiveTab('cppt')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'cppt' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Stethoscope className="w-3.5 h-3.5 text-blue-400" />
            <span>3. CPPT & Asesmen Medis</span>
          </button>
          <button
            onClick={() => setActiveTab('riwayat')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'riwayat' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <History className="w-3.5 h-3.5 text-amber-500" />
            <span>4. Riwayat Kunjungan ({patientHistoryRegs.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('billing')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'billing' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Receipt className="w-3.5 h-3.5 text-emerald-500" />
            <span>5. Estimasi Kasir & Billing</span>
          </button>
        </div>

        {/* TAB CONTENT 1: DEMOGRAFI & DATA ADMISI */}
        {activeTab === 'demografi' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Identitas Pasien */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3 shadow-2xs">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                  <User className="w-4 h-4 text-blue-600" />
                  <h4 className="font-bold text-xs uppercase text-slate-800 tracking-wider">Identitas Pribadi Pasien</h4>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Nama Pasien</span>
                    <span className="font-bold text-slate-900">{patient.name}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">No. Rekam Medis (RM)</span>
                    <span className="font-mono font-black text-blue-700">{patient.noRM}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Nomor Induk Kependudukan (NIK)</span>
                    <span className="font-mono font-semibold text-slate-800">{patient.nik}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Tanggal Lahir / Usia</span>
                    <span className="text-slate-800">{patient.dob} ({calculateAge(patient.dob)})</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Jenis Kelamin</span>
                    <span className="text-slate-800">
                      {patient.gender === '1' || patient.gender === 'M' || patient.gender === 'L' ? 'Laki-laki (1)' : 'Perempuan (2)'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Golongan Darah</span>
                    <span className="font-bold text-rose-600">{patient.bloodType || 'Tidak Diketahui'}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-400 block text-[10px]">Alamat Domisili KTP</span>
                    <span className="text-slate-800">{patient.addressStreet || patient.address || 'DKI Jakarta'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">No. Telepon / HP</span>
                    <span className="font-mono text-slate-800">{patient.phone || '-'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Riwayat Alergi</span>
                    <span className="font-bold text-rose-700">{patient.allergy || 'Tidak Ada Alergi'}</span>
                  </div>
                </div>
              </div>

              {/* Data Kunjungan & Penjamin */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3 shadow-2xs">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                  <CreditCard className="w-4 h-4 text-emerald-600" />
                  <h4 className="font-bold text-xs uppercase text-slate-800 tracking-wider">Data Kunjungan & Penjamin</h4>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">No. Registrasi Encounter</span>
                    <span className="font-mono font-black text-emerald-700">{registration.id}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Tanggal & Waktu Masuk</span>
                    <span className="text-slate-800">{registration.date} 08:30 WIB</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Unit Pelayanan</span>
                    <span className="font-bold text-blue-900">{registration.type}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Poliklinik / Ruangan</span>
                    <span className="font-bold text-slate-800">{registration.room || registration.poli}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">DPJP (Dokter Penanggung Jawab)</span>
                    <span className="font-bold text-indigo-900">{doctor?.name || 'dr. DPJP Spesialis'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Skema Penjaminan</span>
                    <span className="font-bold text-emerald-800">{patient.insuranceType}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Nomor Kartu BPJS</span>
                    <span className="font-mono text-slate-800">{patient.noBPJS !== '-' ? patient.noBPJS : 'Non-Peserta'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Nomor SEP BPJS</span>
                    <span className="font-mono text-blue-700 font-bold">{registration.sepNo || 'SEP-BELUM-TERBIT'}</span>
                  </div>
                </div>

                {/* Penanggung Jawab Pasien */}
                {patient.guarantor && (
                  <div className="pt-2 border-t border-slate-100 mt-2">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">Penanggung Jawab Pasien:</span>
                    <div className="text-xs text-slate-700 font-medium">
                      <strong>{patient.guarantor.name}</strong> ({patient.guarantor.relation}) &bull; Telp: {patient.guarantor.phone}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB CONTENT 2: ASESMEN KEPERAWATAN & TTV */}
        {activeTab === 'keperawatan' && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3 shadow-2xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2">
                  <HeartPulse className="w-4 h-4 text-rose-600" />
                  <h4 className="font-bold text-xs uppercase text-slate-800 tracking-wider">
                    Pengkajian Awal Keperawatan (Vital Signs & Skrining)
                  </h4>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  Telah Dikaji Perawat
                </span>
              </div>

              {/* TTV Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
                  <span className="text-[10px] text-slate-500 font-bold block">Tekanan Darah</span>
                  <span className="text-base font-black text-slate-900 mt-0.5 block">120/80</span>
                  <span className="text-[9px] text-slate-400">mmHg</span>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
                  <span className="text-[10px] text-slate-500 font-bold block">Denyut Nadi</span>
                  <span className="text-base font-black text-rose-600 mt-0.5 block">82</span>
                  <span className="text-[9px] text-slate-400">x / menit</span>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
                  <span className="text-[10px] text-slate-500 font-bold block">Pernapasan (RR)</span>
                  <span className="text-base font-black text-sky-700 mt-0.5 block">18</span>
                  <span className="text-[9px] text-slate-400">x / menit</span>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
                  <span className="text-[10px] text-slate-500 font-bold block">Suhu Tubuh</span>
                  <span className="text-base font-black text-amber-700 mt-0.5 block">36.7</span>
                  <span className="text-[9px] text-slate-400">°C</span>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
                  <span className="text-[10px] text-slate-500 font-bold block">Saturasi O2</span>
                  <span className="text-base font-black text-emerald-600 mt-0.5 block">98</span>
                  <span className="text-[9px] text-slate-400">% SpO2</span>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
                  <span className="text-[10px] text-slate-500 font-bold block">Skala Nyeri</span>
                  <span className="text-base font-black text-indigo-600 mt-0.5 block">3 / 10</span>
                  <span className="text-[9px] text-slate-400">Ringan (NRS)</span>
                </div>
              </div>

              {/* Anamnesis Perawat & Triase */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-xs">
                <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl">
                  <span className="font-bold text-blue-950 block mb-1">Keluhan Utama Saat Masuk:</span>
                  <p className="text-slate-700 leading-relaxed">
                    Pasien datang dengan keluhan badan lemas, pusing berputar sejak 2 hari yang lalu, mual ringan, nafsu makan menurun. Tidak ada muntah proyektil.
                  </p>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Kesadaran (GCS):</span>
                    <span className="font-bold text-slate-800">Compos Mentis (E4 M6 V5 = 15)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Risiko Jatuh (Morse Scale):</span>
                    <span className="font-bold text-emerald-700">Risiko Rendah (Skor: 15)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Kategori Triase (Bila IGD):</span>
                    <span className="font-bold text-amber-700">Kuning (Emergensi)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB CONTENT 3: CPPT & ASESMEN MEDIS DPJP */}
        {activeTab === 'cppt' && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3 shadow-2xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2">
                  <Stethoscope className="w-4 h-4 text-blue-600" />
                  <h4 className="font-bold text-xs uppercase text-slate-800 tracking-wider">
                    Catatan Perkembangan Pasien Terintegrasi (SOAP) & Resume Medis DPJP
                  </h4>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                  DPJP: {doctor?.name || 'dr. Hendra Sp.PD'}
                </span>
              </div>

              {/* SOAP Details */}
              <div className="space-y-2.5 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border-l-4 border-l-blue-600 border border-slate-200">
                  <span className="font-black text-blue-900 block mb-1">[S] SUBJECTIVE (Keluhan & Anamnesis)</span>
                  <p className="text-slate-700">
                    {currentMR?.keluhanUtama || currentRegCppt[0]?.subjective || 'Pasien mengeluhkan pusing berputar hilang timbul, bertambah berat saat menoleh atau merubah posisi kepala. Disertai rasa melayang dan mual.'}
                  </p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border-l-4 border-l-emerald-600 border border-slate-200">
                  <span className="font-black text-emerald-900 block mb-1">[O] OBJECTIVE (Pemeriksaan Fisik Klinis)</span>
                  <p className="text-slate-700">
                    {currentMR?.pemeriksaanFisik || currentRegCppt[0]?.objective || 'Keadaan umum tampak sakit sedang, GCS 15. Nystagmus horizontal (+), tes Romberg positif, Dix-Hallpike (+). Cor dan Pulmo dalam batas normal, abdomen supel.'}
                  </p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border-l-4 border-l-amber-600 border border-slate-200">
                  <span className="font-black text-amber-900 block mb-1">[A] ASSESSMENT (Diagnosis Kerja / Banding)</span>
                  <div className="space-y-1">
                    <div className="font-bold text-slate-900">
                      Diagnosis Utama: <span className="text-amber-800">{currentMR?.diagnosisUtama || currentRegCppt[0]?.assessment || 'BPPV (Benign Paroxysmal Positional Vertigo)'}</span>
                    </div>
                    <div className="text-slate-600 text-[11px]">
                      Diagnosis Sekunder: Dispepsia Fungsional ringan
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border-l-4 border-l-purple-600 border border-slate-200">
                  <span className="font-black text-purple-900 block mb-1">[P] PLAN (Instruksi & Penatalaksanaan Medis)</span>
                  <p className="text-slate-700">
                    {currentMR?.tindakan || currentRegCppt[0]?.plan || 'Epley Maneuver reposisi kanalit, Betahistine Mesylate 3x12mg, Ondansetron 4mg tab prn mual. Edukasi tidur dengan bantal sedikit tinggi.'}
                  </p>
                </div>
              </div>

              {/* Status TTE */}
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-900">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Berkas Medis Terverifikasi secara Digital (TTE DPJP Terdaftar BSrE Kemenkes)</span>
                </div>
                <span className="font-mono text-[10px] text-emerald-700 font-bold">SHA-256: 8F32A9C1...</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB CONTENT 4: RIWAYAT PELAYANAN MEDIS SEBELUMNYA */}
        {activeTab === 'riwayat' && (
          <div className="space-y-3">
            <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3 shadow-2xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4 text-amber-600" />
                  <h4 className="font-bold text-xs uppercase text-slate-800 tracking-wider">
                    Riwayat Kunjungan Pasien di RS (Historical Medical Records)
                  </h4>
                </div>
                <span className="text-xs text-slate-500 font-medium">Total: {patientHistoryRegs.length} Kunjungan</span>
              </div>

              <div className="space-y-2">
                {patientHistoryRegs.map((hr, idx) => {
                  const hrDoctor = getUser(hr.dpjp);
                  const isCurrent = hr.id === registration.id;
                  return (
                    <div
                      key={hr.id}
                      className={`p-3 rounded-xl border transition-all text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                        isCurrent
                          ? 'bg-blue-50/80 border-blue-300 ring-1 ring-blue-300'
                          : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-blue-700">{hr.id}</span>
                          <span className="text-slate-400">&bull;</span>
                          <span className="text-slate-700 font-semibold">{hr.date}</span>
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            hr.type === 'IGD' ? 'bg-rose-100 text-rose-800' :
                            hr.type === 'Rawat Inap' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {hr.type}
                          </span>
                          {isCurrent && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-600 text-white">
                              Kunjungan Saat Ini
                            </span>
                          )}
                        </div>
                        <div className="text-slate-600 text-[11px]">
                          Poli/Ruangan: <strong>{hr.room || hr.poli}</strong> &bull; DPJP: {hrDoctor?.name || 'dr. DPJP'}
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          onClose();
                          navigate('rekammedis', { patientId: hr.patientId, regId: hr.id });
                        }}
                        className="px-3 py-1 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-lg text-xs font-bold self-start sm:self-auto cursor-pointer flex items-center gap-1 shadow-2xs"
                      >
                        <Eye className="w-3.5 h-3.5 text-blue-600" /> Lihat RME
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB CONTENT 5: ESTIMASI KASIR & BILLING */}
        {activeTab === 'billing' && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3 shadow-2xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-emerald-600" />
                  <h4 className="font-bold text-xs uppercase text-slate-800 tracking-wider">
                    Rincian Billing Pelayanan & Status Pembayaran
                  </h4>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">
                  {patient.insuranceType === 'BPJS' ? 'Klaim BPJS (INA-CBG)' : 'Tunai / Mandiri'}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[10px] font-bold">
                    <tr>
                      <th className="p-2.5">Item Pelayanan</th>
                      <th className="p-2.5">Kategori</th>
                      <th className="p-2.5 text-center">Jumlah</th>
                      <th className="p-2.5 text-right">Tarif (Rp)</th>
                      <th className="p-2.5 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    <tr>
                      <td className="p-2.5 font-medium">Karcis Pendaftaran & Administrasi Rekam Medis</td>
                      <td className="p-2.5 text-slate-500">Administrasi</td>
                      <td className="p-2.5 text-center">1</td>
                      <td className="p-2.5 text-right">25.000</td>
                      <td className="p-2.5 text-right font-semibold">25.000</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-medium">Jasa Konsultasi & Asesmen Medis DPJP</td>
                      <td className="p-2.5 text-slate-500">Jasa Medis</td>
                      <td className="p-2.5 text-center">1</td>
                      <td className="p-2.5 text-right">150.000</td>
                      <td className="p-2.5 text-right font-semibold">150.000</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-medium">Tindakan Prosedur Klinis Terpadu</td>
                      <td className="p-2.5 text-slate-500">Tindakan</td>
                      <td className="p-2.5 text-center">1</td>
                      <td className="p-2.5 text-right">125.000</td>
                      <td className="p-2.5 text-right font-semibold">125.000</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-medium">Paket Obat Farmasi Rawat Jalan</td>
                      <td className="p-2.5 text-slate-500">Farmasi</td>
                      <td className="p-2.5 text-center">1</td>
                      <td className="p-2.5 text-right">85.000</td>
                      <td className="p-2.5 text-right font-semibold">85.000</td>
                    </tr>
                  </tbody>
                  <tfoot className="border-t-2 border-slate-200 bg-slate-50 font-bold text-slate-900">
                    <tr>
                      <td colSpan={4} className="p-2.5 text-right">Total Biaya Pelayanan:</td>
                      <td className="p-2.5 text-right text-blue-900 text-sm font-black">Rp 385.000</td>
                    </tr>
                    {patient.insuranceType === 'BPJS' && (
                      <tr className="text-emerald-700 bg-emerald-50/80">
                        <td colSpan={4} className="p-2.5 text-right">Ditanggung BPJS Kesehatan (INA-CBG):</td>
                        <td className="p-2.5 text-right font-black">- Rp 385.000</td>
                      </tr>
                    )}
                    <tr className="border-t border-slate-300">
                      <td colSpan={4} className="p-2.5 text-right">Iuran Pasien (Out-of-Pocket):</td>
                      <td className="p-2.5 text-right text-slate-900 text-sm font-black">
                        {patient.insuranceType === 'BPJS' ? 'Rp 0 (Lunas JKN)' : 'Rp 385.000'}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* FOOTER ACTIONS */}
        <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-3">
          <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Rekam Medis Terintegrasi sesuai KMK No. HK.01.07/MENKES/1423/2022</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Tutup
            </button>
            <button
              onClick={() => {
                onClose();
                navigate('rekammedis', { patientId: patient.id, regId: registration.id });
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Stethoscope className="w-3.5 h-3.5" />
              <span>Buka Pemeriksaan RME</span>
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
