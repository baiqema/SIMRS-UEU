import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Modal } from '../components/Modal';
import { VClaimSepModal } from '../components/VClaimSepModal';
import { ModalCekBpjs } from '../components/ModalCekBpjs';
import Swal from 'sweetalert2';
import {
  ShieldAlert, Plus, CheckCircle2, DollarSign, Printer,
  ShieldCheck, RefreshCw, AlertTriangle, Search, UserCheck,
  Calendar, Filter, FileText, Check, XCircle, ArrowRight, Activity
} from 'lucide-react';

interface VClaimSyncLogItem {
  id: string;
  timestamp: string;
  noBPJS: string;
  nik: string;
  patientName: string;
  noRM: string;
  status: 'Aktif' | 'Tidak Aktif';
  statusDesc: string;
  hakKelas: string;
  faskes1: string;
  sepNo?: string;
  responseCode: string;
  dbSynced: boolean;
}

export const KlaimView: React.FC = () => {
  const {
    claims, coding, patients, registrations, addClaim,
    getMR, getReg, getPatient, getUser, canEditPage
  } = useApp();

  const isEditable = canEditPage('klaim');

  // Tabs: 'vclaim' (Log & Verifikasi VClaim) | 'eklaim' (Pengajuan E-Klaim INA-CBGs)
  const [activeTab, setActiveTab] = useState<'vclaim' | 'eklaim'>('vclaim');

  // State Modal Cek BPJS (+)
  const [showCekBpjsModal, setShowCekBpjsModal] = useState(false);
  const [sepModalRegId, setSepModalRegId] = useState<string | null>(null);

  // State Modal Form Klaim INA-CBG Baru
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [codingId, setCodingId] = useState('');
  const [groupCode, setGroupCode] = useState('C-04-01');
  const [tariff, setTariff] = useState('1250000');

  // Quick Inline Check BPJS states inside VClaim tab
  const [quickNoBpjs, setQuickNoBpjs] = useState('');
  const [quickChecking, setQuickChecking] = useState(false);

  // LOG PEMANTAUAN SINKRONISASI VCLAIM BPJS & DATABASE PASIEN LOKAL
  const [vclaimSyncLogs, setVclaimSyncLogs] = useState<VClaimSyncLogItem[]>(() => {
    try {
      const saved = localStorage.getItem('simrs_vclaim_sync_logs');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return [
      {
        id: 'VC-001',
        timestamp: '2026-09-23 09:15:22',
        noBPJS: '0001234567891',
        nik: '3174011505920001',
        patientName: 'Tn. Ahmad Fauzi',
        noRM: '000001',
        status: 'Aktif',
        statusDesc: 'Peserta Mandiri Kelas 1 (Iuran Lunas)',
        hakKelas: 'Kelas 1',
        faskes1: 'Puskesmas Gambir (0114001)',
        sepNo: '0012R0010826V000128',
        responseCode: '200 OK',
        dbSynced: true
      },
      {
        id: 'VC-002',
        timestamp: '2026-09-23 10:02:40',
        noBPJS: '0001234567892',
        nik: '3174022408850002',
        patientName: 'Ny. Siti Rahma',
        noRM: '000002',
        status: 'Aktif',
        statusDesc: 'Peserta PBI APBN (Pemerintah)',
        hakKelas: 'Kelas 3',
        faskes1: 'Klinik Pratama Sehat (0114005)',
        sepNo: '0012R0010826V000129',
        responseCode: '200 OK',
        dbSynced: true
      },
      {
        id: 'VC-003',
        timestamp: '2026-09-23 11:30:15',
        noBPJS: '0001234567894',
        nik: '3174041812180004',
        patientName: 'An. Rizky Pratama',
        noRM: '000004',
        status: 'Tidak Aktif',
        statusDesc: 'Tunggakan Iuran 2 Bulan (Non-Aktif sejak 01/08/2026)',
        hakKelas: 'Kelas 2',
        faskes1: 'Puskesmas Kebon Jeruk (0112001)',
        sepNo: '-',
        responseCode: '201 Not Active',
        dbSynced: true
      }
    ];
  });

  const [vclaimLogFilter, setVclaimLogFilter] = useState<'all' | 'Aktif' | 'Tidak Aktif'>('all');
  const [showVclaimLogPanel, setShowVclaimLogPanel] = useState(true);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('simrs_vclaim_sync_logs', JSON.stringify(vclaimSyncLogs));
    } catch {
      // ignore
    }
  }, [vclaimSyncLogs]);

  // Listener to keep sync across other tabs/views (e.g. PendaftaranView)
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'simrs_vclaim_sync_logs' && e.newValue) {
        try {
          setVclaimSyncLogs(JSON.parse(e.newValue));
        } catch {
          // ignore
        }
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const groups = [
    { code: 'C-04-01', desc: 'Sistem Muskuloskeletal & Jaringan Ikat', defaultTariff: 1250000 },
    { code: 'C-07-01', desc: 'Sistem Sirkulasi & Kardiovaskular', defaultTariff: 8500000 },
    { code: 'C-09-01', desc: 'Sistem Pencernaan & Gastrointestinal', defaultTariff: 3400000 },
    { code: 'C-11-01', desc: 'Sistem Saluran Kemih & Nefrologi', defaultTariff: 4200000 },
    { code: 'C-13-01', desc: 'Sistem Respirasi & Paru', defaultTariff: 2800000 },
    { code: 'C-15-01', desc: 'Sistem Saraf & Neurologi', defaultTariff: 3900000 },
  ];

  // Only locked codings without an existing submitted claim
  const lockedCodings = coding.filter(c =>
    c.status === 'Locked' && !claims.some(cl => cl.codingId === c.id)
  );

  const formatCurrency = (n: number) => {
    return 'Rp ' + new Intl.NumberFormat('id-ID').format(n);
  };

  const handleSaveClaim = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEditable) {
      Swal.fire({
        icon: 'warning',
        title: 'Akses Terbatas (Mode Lihat)',
        text: 'Anda berada dalam Mode Lihat (Read-Only) untuk pengajuan Klaim BPJS. Silakan login dengan akun Petugas Klaim / Casemix.',
        confirmButtonColor: '#d97706'
      });
      return;
    }
    if (!codingId || !groupCode || !tariff) {
      Swal.fire({
        icon: 'warning',
        title: 'Validasi',
        text: 'Pilih data koding locked dan tarif INA-CBG',
        confirmButtonColor: '#2563eb'
      });
      return;
    }

    const grp = groups.find(g => g.code === groupCode);
    const newClaim = addClaim({
      codingId,
      groupCode,
      groupDesc: grp?.desc || 'Group INA-CBG',
      tariff: parseInt(tariff) || 0
    });

    setIsClaimModalOpen(false);
    Swal.fire({
      icon: 'success',
      title: 'Klaim BPJS Submitted',
      text: `No. Klaim: ${newClaim.id}. Tariff INA-CBG: ${formatCurrency(newClaim.tariff)}. Berhasil dikirim ke E-Klaim BPJS.`,
      confirmButtonColor: '#2563eb'
    });
  };

  // Quick Direct Check in tab
  const handleRunQuickCheck = (statusSim: 'Aktif' | 'Tidak Aktif' = 'Aktif') => {
    const rawDigits = quickNoBpjs.replace(/\D/g, '');
    if (!rawDigits || rawDigits.length !== 13) {
      Swal.fire({
        icon: 'warning',
        title: 'Nomor Kartu BPJS Wajib 13 Digit',
        text: `Nomor kartu BPJS harus tepat 13 digit angka (saat ini: ${rawDigits.length} digit).`,
        confirmButtonColor: '#2563eb'
      });
      return;
    }

    setQuickChecking(true);
    setTimeout(() => {
      setQuickChecking(false);
      const isAktif = statusSim === 'Aktif';
      const matched = patients.find(p => p.noBPJS === rawDigits);
      const patientName = matched ? matched.name : (rawDigits === '0001234567891' ? 'Tn. Ahmad Fauzi' : 'Peserta BPJS Terdaftar');
      const noRM = matched ? matched.noRM : '000001';
      const nik = matched ? matched.nik : '3174011505920001';
      const hakKelas = matched?.bpjsClass || 'Kelas 1';
      const statusDesc = isAktif
        ? 'Peserta Mandiri / PBI Aktif (Iuran Terbayar Lunas)'
        : 'Tunggakan Iuran 2 Bulan (Non-Aktif sejak 01/08/2026)';
      const sepNo = isAktif ? `0012R0010826V${Math.floor(100000 + Math.random() * 900000)}` : '-';
      const respCode = isAktif ? '200 OK' : '201 Not Active';

      const newLog: VClaimSyncLogItem = {
        id: `VC-${Date.now().toString().slice(-4)}`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        noBPJS: rawDigits,
        nik,
        patientName,
        noRM,
        status: isAktif ? 'Aktif' : 'Tidak Aktif',
        statusDesc,
        hakKelas,
        faskes1: 'Puskesmas Kebon Jeruk (0112001)',
        sepNo,
        responseCode: respCode,
        dbSynced: true
      };

      setVclaimSyncLogs(prev => [newLog, ...prev]);

      Swal.fire({
        icon: isAktif ? 'success' : 'error',
        title: isAktif ? 'Status BPJS: AKTIF (200 OK)' : 'Status BPJS: TIDAK AKTIF (201)',
        html: `
          <div class="text-left text-xs space-y-2">
            <p><strong>Nama:</strong> ${patientName} (${noRM})</p>
            <p><strong>No. BPJS:</strong> ${rawDigits} | <strong>NIK:</strong> ${nik}</p>
            <p><strong>Status:</strong> <span class="font-bold ${isAktif ? 'text-emerald-600' : 'text-rose-600'}">${newLog.status} (${respCode})</span></p>
            <p><strong>Keterangan:</strong> ${statusDesc}</p>
            ${isAktif ? `<p><strong>Nomor SEP:</strong> <span class="font-mono text-blue-600 font-bold">${sepNo}</span></p>` : ''}
          </div>
        `,
        confirmButtonColor: isAktif ? '#10b981' : '#e11d48'
      });
    }, 450);
  };

  const countTotal = vclaimSyncLogs.length;
  const countAktif = vclaimSyncLogs.filter(l => l.status === 'Aktif').length;
  const countTidakAktif = vclaimSyncLogs.filter(l => l.status === 'Tidak Aktif').length;

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
                Anda dapat melihat seluruh data integrasi VClaim, log sinkronisasi database, dan berkas klaim BPJS.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Header & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900">Modul Coding & BPJS: Klaim & VClaim Health</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
              VClaim v2.1 Live
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Sinkronisasi data kepesertaan VClaim, validasi status aktif/non-aktif, penerbitan SEP, dan grouping E-Klaim INA-CBG's.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setShowCekBpjsModal(true)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-2 cursor-pointer transition-all"
            title="Buka Pengecekan Kartu BPJS (+ Cek BPJS)"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>+ Cek BPJS</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (lockedCodings.length > 0) setCodingId(lockedCodings[0].id);
              setIsClaimModalOpen(true);
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-2 cursor-pointer transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Pengajuan Klaim Baru</span>
          </button>
        </div>
      </div>

      {/* Navigation Tab Bar */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab('vclaim')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'vclaim'
              ? 'border-emerald-600 text-emerald-800 bg-emerald-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Log & Integrasi VClaim BPJS (Live Sync)</span>
          <span className="px-2 py-0.2 rounded-full text-[10px] bg-emerald-100 text-emerald-800 font-bold">
            {countTotal}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('eklaim')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'eklaim'
              ? 'border-blue-600 text-blue-800 bg-blue-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
          }`}
        >
          <DollarSign className="w-4 h-4 text-blue-600" />
          <span>Pengajuan E-Klaim INA-CBG's & Grouping</span>
          <span className="px-2 py-0.2 rounded-full text-[10px] bg-blue-100 text-blue-800 font-bold">
            {claims.length}
          </span>
        </button>
      </div>

      {/* TAB CONTENT 1: VCLAIM BRIDGING & LOG PEMANTAUAN SINKRONISASI */}
      {activeTab === 'vclaim' && (
        <div className="space-y-6 animate-fade-in">
          {/* KPI Statistics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="text-[10px] font-bold text-slate-400 uppercase">Total Cek VClaim</div>
              <div className="text-xl font-black text-slate-900 mt-1">{countTotal}</div>
              <span className="text-[10px] text-slate-500 mt-0.5 block">Histori Bridging</span>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-emerald-200 shadow-xs">
              <div className="text-[10px] font-bold text-emerald-600 uppercase">Peserta Aktif (200 OK)</div>
              <div className="text-xl font-black text-emerald-900 mt-1">{countAktif}</div>
              <span className="text-[10px] text-emerald-600 mt-0.5 block">Eligible Pelayanan</span>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-rose-200 shadow-xs">
              <div className="text-[10px] font-bold text-rose-600 uppercase">Tidak Aktif (201)</div>
              <div className="text-xl font-black text-rose-900 mt-1">{countTidakAktif}</div>
              <span className="text-[10px] text-rose-600 mt-0.5 block">Tunggakan / Mutasi</span>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-blue-200 shadow-xs">
              <div className="text-[10px] font-bold text-blue-600 uppercase">Database Pasien SIMRS</div>
              <div className="text-xl font-black text-blue-900 mt-1">{patients.length} Pasien</div>
              <span className="text-[10px] text-emerald-600 font-semibold mt-0.5 block">✓ 100% Tersinkronisasi</span>
            </div>
          </div>

          {/* QUICK INLINE VALIDATOR BAR */}
          <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 border border-emerald-300 p-4 rounded-2xl shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-200 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-emerald-950 block">Pengecekan Cepat VClaim Langsung (13 Digit Angka)</span>
                  <span className="text-[10px] text-emerald-700">Verifikasi instan status aktif & penjaminan kartu BPJS Kesehatan</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCekBpjsModal(true)}
                className="text-xs text-emerald-800 font-bold hover:underline flex items-center gap-1 cursor-pointer self-start sm:self-auto"
              >
                <span>Buka Form Cek Lengkap (NIK & Pasien)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2">
              <div className="relative flex-1 w-full">
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={13}
                  value={quickNoBpjs}
                  onChange={e => setQuickNoBpjs(e.target.value.replace(/\D/g, '').slice(0, 13))}
                  placeholder="Ketik 13 digit nomor BPJS (contoh: 0001234567891)..."
                  className="w-full pl-3.5 pr-24 py-2.5 bg-white border border-emerald-300 rounded-xl text-xs font-mono font-bold text-slate-900 placeholder:font-sans placeholder:font-normal placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 shadow-2xs"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono font-bold text-emerald-700">
                  {quickNoBpjs.length}/13 Digit
                </span>
              </div>

              <div className="flex items-center gap-1.5 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => handleRunQuickCheck('Aktif')}
                  disabled={quickChecking}
                  className="flex-1 sm:flex-none px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                  title="Cek ke Server VClaim (Simulasi Respon AKTIF 200)"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${quickChecking ? 'animate-spin' : ''}`} />
                  <span>{quickChecking ? 'Validasi...' : '+ Cek BPJS (Aktif)'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleRunQuickCheck('Tidak Aktif')}
                  disabled={quickChecking}
                  className="px-3 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5 active:scale-95 transition-all"
                  title="Cek ke Server VClaim (Simulasi Respon TIDAK AKTIF 201)"
                >
                  <span>▲ Cek (Tidak Aktif)</span>
                </button>
              </div>
            </div>
          </div>

          {/* LOG PEMANTAUAN SINKRONISASI VCLAIM BPJS & DATABASE PASIEN LOKAL */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                    <span>Log Pemantauan Sinkronisasi VClaim & Database Pasien Lokal</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                      Live Sync
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Memantau histori verifikasi status kepesertaan BPJS (Aktif & Tidak Aktif) secara real-time dengan database lokal.
                  </p>
                </div>
              </div>

              {/* Filter Buttons & + Cek BPJS Action (Matching Image 1) */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => setShowCekBpjsModal(true)}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5 transition-all"
                  title="Cek Status Kartu BPJS Baru (+ Cek BPJS)"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>+ Cek BPJS</span>
                </button>

                <button
                  type="button"
                  onClick={() => setVclaimLogFilter('all')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    vclaimLogFilter === 'all'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Semua ({vclaimSyncLogs.length})
                </button>

                <button
                  type="button"
                  onClick={() => setVclaimLogFilter('Aktif')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    vclaimLogFilter === 'Aktif'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-white text-emerald-700 border border-emerald-200 hover:bg-emerald-50'
                  }`}
                >
                  Aktif ({vclaimSyncLogs.filter(l => l.status === 'Aktif').length})
                </button>

                <button
                  type="button"
                  onClick={() => setVclaimLogFilter('Tidak Aktif')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    vclaimLogFilter === 'Tidak Aktif'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'bg-white text-rose-700 border border-rose-200 hover:bg-rose-50'
                  }`}
                >
                  Tidak Aktif ({vclaimSyncLogs.filter(l => l.status === 'Tidak Aktif').length})
                </button>

                <button
                  type="button"
                  onClick={() => setShowVclaimLogPanel(!showVclaimLogPanel)}
                  className="px-2 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-bold cursor-pointer"
                >
                  {showVclaimLogPanel ? 'Sembunyikan' : 'Tampilkan'}
                </button>
              </div>
            </div>

            {showVclaimLogPanel && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3.5">Waktu Sinkron</th>
                      <th className="py-2.5 px-3.5">No. BPJS (13 Digit)</th>
                      <th className="py-2.5 px-3.5">Nama Pasien & RM</th>
                      <th className="py-2.5 px-3.5 text-center">Status VClaim</th>
                      <th className="py-2.5 px-3.5">Respon Bridging</th>
                      <th className="py-2.5 px-3.5">Keterangan / Alasan</th>
                      <th className="py-2.5 px-3.5 text-center">Database Lokal</th>
                      <th className="py-2.5 px-3.5 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {vclaimSyncLogs
                      .filter(log => vclaimLogFilter === 'all' || log.status === vclaimLogFilter)
                      .map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-2.5 px-3.5 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                            {item.timestamp}
                          </td>
                          <td className="py-2.5 px-3.5 font-mono font-bold text-slate-900">
                            {item.noBPJS}
                          </td>
                          <td className="py-2.5 px-3.5">
                            <div className="font-bold text-slate-900">{item.patientName}</div>
                            <div className="text-[10px] text-slate-500 font-mono">
                              RM: {item.noRM} | NIK: {item.nik}
                            </div>
                          </td>
                          <td className="py-2.5 px-3.5 text-center whitespace-nowrap">
                            {item.status === 'Aktif' ? (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 inline-flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                                AKTIF
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300 inline-flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-600"></span>
                                TIDAK AKTIF
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3.5 font-mono text-[11px] font-semibold whitespace-nowrap">
                            <span className={item.status === 'Aktif' ? 'text-emerald-700' : 'text-rose-700'}>
                              {item.responseCode}
                            </span>
                          </td>
                          <td className="py-2.5 px-3.5 text-slate-700 max-w-xs text-[11px]">
                            {item.statusDesc}
                          </td>
                          <td className="py-2.5 px-3.5 text-center whitespace-nowrap">
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 inline-flex items-center gap-1">
                              ✓ Tersinkron
                            </span>
                          </td>
                          <td className="py-2.5 px-3.5 text-center whitespace-nowrap">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  // Re-check
                                  Swal.fire({
                                    icon: 'info',
                                    title: 'Verifikasi VClaim Ulang',
                                    text: `Kartu ${item.noBPJS} atas nama ${item.patientName} berhasil disinkronisasi ulang dengan BPJS Health Server.`,
                                    timer: 1500,
                                    showConfirmButton: false
                                  });
                                }}
                                className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-bold transition-all cursor-pointer"
                                title="Sinkronisasi ulang"
                              >
                                <RefreshCw className="w-3.5 h-3.5" />
                              </button>

                              {item.sepNo && item.sepNo !== '-' ? (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const reg = registrations.find(r => r.sepNo === item.sepNo) || registrations[0];
                                    if (reg) setSepModalRegId(reg.id);
                                  }}
                                  className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-all"
                                  title="Cetak Bukti SEP"
                                >
                                  <Printer className="w-3 h-3 text-blue-600" />
                                  <span>SEP</span>
                                </button>
                              ) : null}
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Footer status indicator */}
            <div className="p-3 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-500 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 font-semibold text-emerald-700">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  Status Bridging: Online (BPJS Health API v2.1)
                </span>
                <span className="text-slate-300">•</span>
                <span>Integrasi: VClaim BPJS & SatuSehat Kemenkes</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  Swal.fire({
                    title: 'Reset Histori Log VClaim?',
                    text: 'Data histori sinkronisasi akan dikembalikan ke status awal.',
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonText: 'Ya, Reset',
                    cancelButtonText: 'Batal',
                    confirmButtonColor: '#2563eb'
                  }).then(res => {
                    if (res.isConfirmed) {
                      localStorage.removeItem('simrs_vclaim_sync_logs');
                      window.location.reload();
                    }
                  });
                }}
                className="text-slate-400 hover:text-slate-600 text-[10px] underline cursor-pointer"
              >
                Reset Histori Log
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 2: PENGAJUAN E-KLAIM INA-CBGS */}
      {activeTab === 'eklaim' && (
        <div className="space-y-6 animate-fade-in">
          <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-2xl text-xs text-blue-900 flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 text-blue-600 shrink-0" />
            <div>
              <strong>Aturan Bisnis E-Klaim:</strong> Pengajuan klaim hanya dapat diproses apabila koding diagnosis dan tindakan telah berstatus <strong>Locked</strong> oleh koder medis.
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200/80 text-slate-500 uppercase tracking-wider font-bold">
                    <th className="p-3.5">ID Klaim</th>
                    <th className="p-3.5">No. SEP BPJS</th>
                    <th className="p-3.5">Nama Pasien</th>
                    <th className="p-3.5">Group Code</th>
                    <th className="p-3.5">Deskripsi Group INA-CBG</th>
                    <th className="p-3.5">Tarif Klaim</th>
                    <th className="p-3.5">Tanggal Submit</th>
                    <th className="p-3.5 text-center">Status Klaim</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                  {[...claims].sort((a, b) => {
                    const codA = coding.find(cd => cd.id === a.codingId);
                    const mrA = codA ? getMR(codA.mrId) : null;
                    const rA = mrA ? getReg(mrA.regId) : null;
                    const pA = rA ? getPatient(rA.patientId) : null;
                    const numA = parseInt((mrA?.noRM || pA?.noRM || '').replace(/\D/g, '') || '0', 10);

                    const codB = coding.find(cd => cd.id === b.codingId);
                    const mrB = codB ? getMR(codB.mrId) : null;
                    const rB = mrB ? getReg(mrB.regId) : null;
                    const pB = rB ? getPatient(rB.patientId) : null;
                    const numB = parseInt((mrB?.noRM || pB?.noRM || '').replace(/\D/g, '') || '0', 10);

                    return numA - numB;
                  }).map(c => {
                    const cod = coding.find(cd => cd.id === c.codingId);
                    const mr = cod ? getMR(cod.mrId) : null;
                    const r = mr ? getReg(mr.regId) : null;
                    const p = r ? getPatient(r.patientId) : null;
                    return (
                      <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3.5 font-bold text-blue-600">{c.id}</td>
                        <td className="p-3.5 font-mono text-slate-600">
                          <div className="flex items-center gap-1.5">
                            <span>{c.sepNo}</span>
                            {r && (
                              <button
                                type="button"
                                onClick={() => setSepModalRegId(r.id)}
                                className="px-2 py-0.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 rounded text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                                title="Cetak SEP BPJS"
                              >
                                <Printer className="w-3 h-3 text-emerald-700" /> Cetak SEP
                              </button>
                            )}
                          </div>
                        </td>
                        <td className="p-3.5 font-bold text-slate-800">{p?.name || '-'}</td>
                        <td className="p-3.5 font-mono font-bold text-indigo-600">{c.groupCode}</td>
                        <td className="p-3.5 max-w-xs truncate text-slate-700 font-medium">{c.description}</td>
                        <td className="p-3.5 font-bold text-emerald-600">{formatCurrency(c.tariff)}</td>
                        <td className="p-3.5 text-slate-500">{c.dateSubmitted}</td>
                        <td className="p-3.5 text-center">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> {c.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CEK BPJS (+) */}
      {showCekBpjsModal && (
        <ModalCekBpjs
          isOpen={showCekBpjsModal}
          onClose={() => setShowCekBpjsModal(false)}
          patients={patients}
          onAddToLog={(logItem) => {
            setVclaimSyncLogs(prev => [logItem, ...prev]);
          }}
        />
      )}

      {/* Modal Klaim Baru */}
      <Modal
        isOpen={isClaimModalOpen}
        onClose={() => setIsClaimModalOpen(false)}
        title="Form Grouping & Pengajuan Klaim BPJS"
      >
        <form onSubmit={handleSaveClaim} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Pilih Data Koding (Status: Locked) *
            </label>
            <select
              value={codingId}
              onChange={e => setCodingId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              required
            >
              {lockedCodings.map(c => {
                const mr = getMR(c.mrId);
                const r = mr ? getReg(mr.regId) : null;
                const p = r ? getPatient(r.patientId) : null;
                return (
                  <option key={c.id} value={c.id}>
                    {c.id} - {p?.name} [ICD-10: {c.icd10}]
                  </option>
                );
              })}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Group Code INA-CBG's *</label>
              <select
                value={groupCode}
                onChange={e => {
                  const code = e.target.value;
                  setGroupCode(code);
                  const grp = groups.find(g => g.code === code);
                  if (grp) setTariff(String(grp.defaultTariff));
                }}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              >
                {groups.map(g => (
                  <option key={g.code} value={g.code}>
                    {g.code} - {g.desc}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Tarif INA-CBG's (Rp) *</label>
              <input
                type="number"
                value={tariff}
                onChange={e => setTariff(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                required
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsClaimModalOpen(false)}
              className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <DollarSign className="w-4 h-4" /> Submit E-Klaim BPJS
            </button>
          </div>
        </form>
      </Modal>

      {/* VCLAIM SEP BPJS MODAL */}
      {sepModalRegId && (() => {
        const sReg = getReg(sepModalRegId);
        const sPatient = sReg ? getPatient(sReg.patientId) : null;
        const sDoctor = sReg ? getUser(sReg.dpjp) : null;
        return (
          <VClaimSepModal
            isOpen={!!sepModalRegId}
            onClose={() => setSepModalRegId(null)}
            patient={sPatient}
            registration={sReg || null}
            doctor={sDoctor}
          />
        );
      })()}
    </div>
  );
};
