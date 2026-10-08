import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ResumeMedis, Patient, Registration } from '../../src/types';
import { DetailResumeMedisModal } from '../components/resumemedis/DetailResumeMedisModal';
import { KonfirmasiFinalisasiResumeModal } from '../components/resumemedis/KonfirmasiFinalisasiResumeModal';
import { ReminderResumeMedisModal } from '../components/resumemedis/ReminderResumeMedisModal';
import { CetakResumeMedisModal } from '../components/resumemedis/CetakResumeMedisModal';
import { PilihPasienResumeModal } from '../components/resumemedis/PilihPasienResumeModal';
import { PedomanInaCbgModal } from '../components/resumemedis/PedomanInaCbgModal';
import { getResumeDeadlineStatus } from '../utils/resumeMedisHelper';
import {
  FileText, CheckCircle2, AlertTriangle, ShieldCheck, Printer,
  Lock, Search, Plus, Filter, Bell, Clock, RefreshCw, Eye, Edit3,
  Calendar, Stethoscope, ChevronRight, Check, Activity, Sparkles, BookOpen
} from 'lucide-react';
import Swal from 'sweetalert2';

export const ResumeMedisView: React.FC = () => {
  const {
    resumeMedisList,
    finalizeResumeMedis,
    syncDiagnosisWithVerification,
    autoPullResumeFromEncounter,
    getPatient,
    getReg,
    getUser,
    canEditPage,
    user
  } = useApp();

  const isEditable = canEditPage('resumemedis');

  // Search and Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'Belum Lengkap' | 'Menunggu Verifikasi' | 'Siap Difinalisasi' | 'Final'>('ALL');
  const [roomFilter, setRoomFilter] = useState<'ALL' | 'Rawat Inap' | 'IGD' | 'Rawat Jalan'>('ALL');

  // Modals state
  const [selectedResumeForDetail, setSelectedResumeForDetail] = useState<ResumeMedis | null>(null);
  const [selectedResumeForPrint, setSelectedResumeForPrint] = useState<ResumeMedis | null>(null);
  const [selectedResumeForFinalize, setSelectedResumeForFinalize] = useState<ResumeMedis | null>(null);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [isPilihPasienModalOpen, setIsPilihPasienModalOpen] = useState(false);
  const [isPedomanModalOpen, setIsPedomanModalOpen] = useState(false);

  // Filtered Resume Medis List - Sorted ascending by noRM (000001 on top)
  const filteredList = resumeMedisList.filter(rm => {
    if (statusFilter !== 'ALL' && rm.status !== statusFilter) return false;

    if (roomFilter !== 'ALL') {
      const roomStr = (rm.dischargeRoom || rm.admissionPoliRoom || '').toLowerCase();
      if (roomFilter === 'Rawat Inap' && !roomStr.includes('inap') && !roomStr.includes('vvip') && !roomStr.includes('bangsal') && !roomStr.includes('melati') && !roomStr.includes('mawar') && !roomStr.includes('ruang')) return false;
      if (roomFilter === 'IGD' && !roomStr.includes('igd')) return false;
      if (roomFilter === 'Rawat Jalan' && !roomStr.includes('jalan') && !roomStr.includes('poli')) return false;
    }

    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    const patient = getPatient(rm.patientId);
    const pName = (patient?.name || '').toLowerCase();
    const pRM = (rm.noRM || '').toLowerCase();
    const diag = (rm.primaryDiagnosisForm || '').toLowerCase();
    const diagVerif = (rm.primaryDiagnosisVerified || '').toLowerCase();
    const dpjp = (rm.doctorName || '').toLowerCase();

    return pName.includes(q) || pRM.includes(q) || diag.includes(q) || diagVerif.includes(q) || dpjp.includes(q);
  }).sort((a, b) => {
    const numA = parseInt((a.noRM || '').replace(/\D/g, '') || '0', 10);
    const numB = parseInt((b.noRM || '').replace(/\D/g, '') || '0', 10);
    return numA - numB;
  });

  // Calculate Statistics
  const totalCount = resumeMedisList.length;
  const belumLengkapList = resumeMedisList.filter(r => r.status === 'Belum Lengkap');
  const menungguVerifList = resumeMedisList.filter(r => r.status === 'Menunggu Verifikasi');
  const siapFinalList = resumeMedisList.filter(r => r.status === 'Siap Difinalisasi');
  const finalList = resumeMedisList.filter(r => r.status === 'Final');

  // Incomplete list for Reminder (includes Belum Lengkap & Menunggu Verifikasi)
  const allIncompleteResumes = resumeMedisList.filter(r => r.status !== 'Final');

  const handleSelectRegistrationForNewResume = (regId: string) => {
    try {
      const newResume = autoPullResumeFromEncounter(regId);
      setSelectedResumeForDetail(newResume);
      Swal.fire({
        icon: 'success',
        title: 'Data Ditarik Otomatis',
        text: 'Seluruh riwayat rekam medis, diagnosis, CPPT, lab, dan terapi berhasil diintegrasikan ke Resume Medis.',
        timer: 1800,
        showConfirmButton: false
      });
    } catch (err: any) {
      Swal.fire({
        icon: 'error',
        title: 'Gagal Menarik Data',
        text: err?.message || 'Terjadi kesalahan saat memproses data pendaftaran.'
      });
    }
  };

  const handleConfirmFinalize = (doctorSignName: string) => {
    if (!selectedResumeForFinalize) return;

    const res = finalizeResumeMedis(selectedResumeForFinalize.id, doctorSignName);
    if (res.success) {
      Swal.fire({
        icon: 'success',
        title: 'Resume Medis Difinalisasi!',
        html: `Dokumen resume medis pasien <strong>${selectedResumeForFinalize.noRM}</strong> telah resmi berstatus <strong>FINAL</strong> dan ditandatangani oleh <strong>${doctorSignName}</strong>.`,
        confirmButtonColor: '#2563eb'
      });
      setSelectedResumeForFinalize(null);
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Finalisasi Gagal',
        text: res.message,
        confirmButtonColor: '#ef4444'
      });
    }
  };

  const handleQuickSync = (rm: ResumeMedis) => {
    Swal.fire({
      title: 'Sinkronkan Diagnosis?',
      html: `Diagnosis DPJP pada formulir akan disamakan dengan Dokumen Verifikasi Koding:<br/><strong class="text-blue-600">${rm.primaryDiagnosisVerified}</strong>`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#2563eb',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Ya, Sinkronkan',
      cancelButtonText: 'Batal'
    }).then(result => {
      if (result.isConfirmed) {
        syncDiagnosisWithVerification(rm.id);
        Swal.fire({
          icon: 'success',
          title: 'Diagnosis Sesuai',
          text: 'Diagnosis telah diverifikasi dan disinkronkan sesuai kaidah koding ICD-10.',
          timer: 1500,
          showConfirmButton: false
        });
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Read-Only Mode Banner */}
      {!isEditable && (
        <div className="p-3.5 bg-amber-50 border border-amber-200/90 rounded-2xl flex items-center justify-between text-xs text-amber-900 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-2xs">
              🔒
            </div>
            <div>
              <p className="font-extrabold text-amber-950 flex items-center gap-2">
                <span>Mode Lihat (Read-Only)</span>
                <span className="text-[10px] px-2 py-0.5 bg-amber-200/80 text-amber-900 rounded-full font-bold">Akses Terbatas</span>
              </p>
              <p className="text-[11px] text-amber-800">
                Anda dapat melihat seluruh dokumen Resume Medis. Pengisian data klinis, sinkronisasi verifikasi, dan finalisasi dokumen khusus untuk <strong>Dokter DPJP / Petugas Rekam Medis</strong>.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-blue-600" />
            <span>Resume Medis / Medical Discharge Summary</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Ringkasan akhir pelayanan pasien rawat inap yang terintegrasi otomatis dengan rekam medis & verifikasi diagnosis ICD-10.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Pedoman INA-CBG Edisi 2 Trigger Button */}
          <button
            type="button"
            onClick={() => setIsPedomanModalOpen(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-2 transition-all cursor-pointer shadow-xs"
          >
            <BookOpen className="w-4 h-4 text-emerald-600" />
            <span>Pedoman INA-CBG (2x24 & 1x24 Jam)</span>
          </button>

          {/* Reminder Trigger Button */}
          {allIncompleteResumes.length > 0 && (
            <button
              type="button"
              onClick={() => setIsReminderModalOpen(true)}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-300 flex items-center gap-2 transition-all cursor-pointer shadow-xs"
            >
              <div className="relative">
                <Bell className="w-4 h-4 text-amber-700" />
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
              </div>
              <span>Reminder DPJP</span>
              <span className="px-2 py-0.5 bg-rose-600 text-white rounded-full text-[10px] font-extrabold">
                {allIncompleteResumes.length}
              </span>
            </button>
          )}

          {/* Tarik Data Otomatis Button */}
          {isEditable && (
            <button
              type="button"
              onClick={() => setIsPilihPasienModalOpen(true)}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 transition-all cursor-pointer shadow-sm shadow-blue-500/25"
            >
              <Sparkles className="w-4 h-4" />
              <span>Tarik Data Otomatis / Buat Resume</span>
            </button>
          )}
        </div>
      </div>

      {/* Stat KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
        <div
          onClick={() => setStatusFilter('ALL')}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'ALL'
              ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
              : 'bg-white text-slate-800 border-slate-200/90 hover:border-slate-300 shadow-2xs'
          }`}
        >
          <span className="text-[11px] font-bold opacity-75 block">Total Resume</span>
          <div className="text-xl font-extrabold mt-1">{totalCount}</div>
          <span className="text-[10px] opacity-70">Semua Pasien</span>
        </div>

        <div
          onClick={() => setStatusFilter('Belum Lengkap')}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'Belum Lengkap'
              ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
              : 'bg-white text-rose-950 border-rose-200 hover:border-rose-300 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold opacity-80">Belum Lengkap</span>
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
          </div>
          <div className="text-xl font-extrabold text-rose-700 mt-1">{belumLengkapList.length}</div>
          <span className="text-[10px] text-rose-600 font-semibold">⚠️ Perlu Diisi</span>
        </div>

        <div
          onClick={() => setStatusFilter('Menunggu Verifikasi')}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'Menunggu Verifikasi'
              ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
              : 'bg-white text-amber-950 border-amber-200 hover:border-amber-300 shadow-2xs'
          }`}
        >
          <span className="text-[11px] font-bold opacity-80 block">Menunggu Verifikasi</span>
          <div className="text-xl font-extrabold text-amber-700 mt-1">{menungguVerifList.length}</div>
          <span className="text-[10px] text-amber-700 font-semibold">Pencocokan Koding</span>
        </div>

        <div
          onClick={() => setStatusFilter('Siap Difinalisasi')}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'Siap Difinalisasi'
              ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
              : 'bg-white text-blue-950 border-blue-200 hover:border-blue-300 shadow-2xs'
          }`}
        >
          <span className="text-[11px] font-bold opacity-80 block">Siap Difinalisasi</span>
          <div className="text-xl font-extrabold text-blue-700 mt-1">{siapFinalList.length}</div>
          <span className="text-[10px] text-blue-700 font-semibold">Lengkap & Valid</span>
        </div>

        <div
          onClick={() => setStatusFilter('Final')}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'Final'
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
              : 'bg-white text-emerald-950 border-emerald-200 hover:border-emerald-300 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold opacity-80">Final</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-xl font-extrabold text-emerald-700 mt-1">{finalList.length}</div>
          <span className="text-[10px] text-emerald-700 font-semibold">Telah Terverifikasi</span>
        </div>
      </div>

      {/* Prominent Reminder Notice Banner if incomplete items exist */}
      {allIncompleteResumes.length > 0 && (
        <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-300 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-lg shrink-0 shadow-xs">
              🔔
            </div>
            <div>
              <h4 className="text-xs font-extrabold text-amber-950 flex items-center gap-2">
                <span>Reminder Resume Medis DPJP Aktif</span>
                <span className="px-2 py-0.5 bg-rose-600 text-white rounded-full text-[10px] font-extrabold">
                  {allIncompleteResumes.length} Dokumen Perlu Penyelesaian
                </span>
              </h4>
              <p className="text-[11px] text-amber-900 mt-0.5">
                Terdapat resume medis yang masih belum lengkap atau memiliki perbedaan diagnosis dengan dokumen verifikasi. Mohon segera dilengkapi sebelum difinalisasi.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsReminderModalOpen(true)}
            className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0"
          >
            <span>Lihat Rincian Reminder</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari No. RM, nama pasien, diagnosis, atau DPJP..."
            className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-2xs"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {/* Room Filter */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs">
            {(['ALL', 'Rawat Inap', 'IGD', 'Rawat Jalan'] as const).map(rf => (
              <button
                key={rf}
                type="button"
                onClick={() => setRoomFilter(rf)}
                className={`px-3 py-1 font-bold rounded-lg transition-colors cursor-pointer ${
                  roomFilter === rf
                    ? 'bg-white text-blue-600 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {rf === 'ALL' ? 'Semua Ruang' : rf}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Resume Medis Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200/80 text-slate-500 uppercase tracking-wider font-bold">
                <th className="p-3.5">No. RM & Pasien</th>
                <th className="p-3.5">Ruang & Tgl Masuk/Keluar</th>
                <th className="p-3.5">Diagnosis Utama & Verifikasi</th>
                <th className="p-3.5">Pemeriksaan Kelengkapan</th>
                <th className="p-3.5">DPJP</th>
                <th className="p-3.5 text-center">Status Resume</th>
                <th className="p-3.5 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400 italic">
                    Tidak ada data Resume Medis yang cocok dengan kriteria pencarian.
                  </td>
                </tr>
              ) : (
                filteredList.map(rm => {
                  const patient = getPatient(rm.patientId);
                  const isFinal = rm.status === 'Final';
                  const isMatched = rm.isDiagnosisMatched;
                  const isReadyToFinalize = rm.missingFields.length === 0 && isMatched && !isFinal;

                  return (
                    <tr key={rm.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Patient & RM */}
                      <td className="p-3.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md text-[11px]">
                            {rm.noRM}
                          </span>
                          <span className="font-bold text-slate-800">{patient?.name || '-'}</span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-0.5">
                          ID: {rm.id} | {patient?.gender === 'M' || patient?.gender === 'L' ? 'L' : 'P'}, {patient?.dob || '-'}
                        </p>
                      </td>

                      {/* Ruang & Tanggal */}
                      <td className="p-3.5">
                        <div className="font-bold text-slate-800">{rm.dischargeRoom || rm.admissionPoliRoom}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          {rm.admissionDate} s/d {rm.dischargeDate} ({rm.lengthOfStay || 1} Hari)
                        </div>
                      </td>

                      {/* Diagnosis & Matching */}
                      <td className="p-3.5 max-w-xs">
                        <div className="font-semibold text-slate-800 line-clamp-1">
                          {rm.primaryDiagnosisForm || '-'}
                        </div>
                        <div className="mt-1 flex items-center gap-1.5">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1 ${
                            isMatched
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-rose-100 text-rose-800 border border-rose-300'
                          }`}>
                            {isMatched ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <AlertTriangle className="w-3 h-3 text-rose-600" />}
                            {isMatched ? 'ICD-10 Terverifikasi' : '⚠️ Perbedaan Diagnosis'}
                          </span>

                          {!isMatched && isEditable && (
                            <button
                              type="button"
                              onClick={() => handleQuickSync(rm)}
                              title="Sinkronkan dengan Dokumen Verifikasi Koding"
                              className="p-0.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded cursor-pointer"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>

                      {/* Kelengkapan Otomatis */}
                      <td className="p-3.5 max-w-xs">
                        {rm.missingFields.length === 0 ? (
                          <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-xs">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span>100% Lengkap</span>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-[11px] font-bold text-rose-600">
                              <span>⚠️ Belum Lengkap ({rm.missingFields.length})</span>
                            </div>
                            <div className="text-[10px] text-slate-600 line-clamp-1">
                              {rm.missingFields.join(', ')}
                            </div>
                          </div>
                        )}
                      </td>

                      {/* DPJP */}
                      <td className="p-3.5">
                        <div className="font-bold text-slate-800">{rm.doctorName || 'dr. DPJP'}</div>
                        <span className="text-[10px] text-slate-500">Spesialis Penanggung Jawab</span>
                      </td>

                      {/* Status */}
                      <td className="p-3.5 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold inline-flex items-center gap-1 ${
                          rm.status === 'Final'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : rm.status === 'Siap Difinalisasi'
                            ? 'bg-blue-100 text-blue-800 border border-blue-300'
                            : rm.status === 'Menunggu Verifikasi'
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : 'bg-rose-100 text-rose-800 border border-rose-300'
                        }`}>
                          {rm.status === 'Final' ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <AlertTriangle className="w-3 h-3" />}
                          {rm.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="p-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedResumeForDetail(rm)}
                            className="px-2.5 py-1 text-xs font-bold rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 flex items-center gap-1 cursor-pointer transition-colors"
                            title="Buka Form Resume Medis"
                          >
                            <Eye className="w-3.5 h-3.5 text-blue-600" />
                            <span>Detail</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setSelectedResumeForPrint(rm)}
                            className="p-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 cursor-pointer transition-colors"
                            title="Cetak Dokumen Resmi A4"
                          >
                            <Printer className="w-3.5 h-3.5 text-slate-700" />
                          </button>

                          {!isFinal && isEditable && (
                            <button
                              type="button"
                              onClick={() => setSelectedResumeForFinalize(rm)}
                              disabled={!isReadyToFinalize}
                              title={
                                !isReadyToFinalize
                                  ? 'Data wajib belum lengkap atau diagnosis belum terverifikasi'
                                  : 'Finalisasi Dokumen Resume Medis'
                              }
                              className={`px-2 py-1 text-xs font-bold rounded-lg flex items-center gap-1 transition-all ${
                                isReadyToFinalize
                                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-2xs cursor-pointer'
                                  : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                              }`}
                            >
                              <Lock className="w-3.5 h-3.5" />
                              <span>Finalisasi</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals Mounting */}
      {selectedResumeForDetail && (
        <DetailResumeMedisModal
          isOpen={Boolean(selectedResumeForDetail)}
          onClose={() => setSelectedResumeForDetail(null)}
          resume={selectedResumeForDetail}
          patient={getPatient(selectedResumeForDetail.patientId)}
          registration={getReg(selectedResumeForDetail.regId)}
          onOpenPrint={(rm) => setSelectedResumeForPrint(rm)}
          onOpenFinalizeConfirm={(rm) => setSelectedResumeForFinalize(rm)}
        />
      )}

      {selectedResumeForPrint && (
        <CetakResumeMedisModal
          isOpen={Boolean(selectedResumeForPrint)}
          onClose={() => setSelectedResumeForPrint(null)}
          resume={selectedResumeForPrint}
          patient={getPatient(selectedResumeForPrint.patientId)}
          registration={getReg(selectedResumeForPrint.regId)}
          doctor={getUser(selectedResumeForPrint.doctorId)}
          onOpenEdit={(rm) => {
            setSelectedResumeForPrint(null);
            setSelectedResumeForDetail(rm);
          }}
        />
      )}

      {selectedResumeForFinalize && (
        <KonfirmasiFinalisasiResumeModal
          isOpen={Boolean(selectedResumeForFinalize)}
          onClose={() => setSelectedResumeForFinalize(null)}
          resume={selectedResumeForFinalize}
          patient={getPatient(selectedResumeForFinalize.patientId)}
          onConfirmFinalize={handleConfirmFinalize}
        />
      )}

      {isReminderModalOpen && (
        <ReminderResumeMedisModal
          isOpen={isReminderModalOpen}
          onClose={() => setIsReminderModalOpen(false)}
          incompleteResumes={allIncompleteResumes}
          getPatient={getPatient}
          onOpenDetail={(rm) => setSelectedResumeForDetail(rm)}
        />
      )}

      {isPilihPasienModalOpen && (
        <PilihPasienResumeModal
          isOpen={isPilihPasienModalOpen}
          onClose={() => setIsPilihPasienModalOpen(false)}
          onSelectRegistration={handleSelectRegistrationForNewResume}
        />
      )}

      {isPedomanModalOpen && (
        <PedomanInaCbgModal
          isOpen={isPedomanModalOpen}
          onClose={() => setIsPedomanModalOpen(false)}
        />
      )}
    </div>
  );
};
