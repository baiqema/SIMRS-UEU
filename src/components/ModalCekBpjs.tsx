import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { Patient } from '../types';
import Swal from 'sweetalert2';
import {
  Plus, CheckCircle2, XCircle, RefreshCw, ShieldCheck,
  Search, ArrowRight, UserCheck, AlertTriangle, FileCheck, Check
} from 'lucide-react';

interface ModalCekBpjsProps {
  isOpen: boolean;
  onClose: () => void;
  patients: Patient[];
  initialNoBpjs?: string;
  initialNik?: string;
  onApplyToForm?: (data: {
    noBPJS: string;
    nik: string;
    name: string;
    hakKelas: string;
    status: 'Aktif' | 'Tidak Aktif';
    statusDesc: string;
    sepNo: string;
  }) => void;
  onAddToLog?: (logItem: {
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
  }) => void;
}

export const ModalCekBpjs: React.FC<ModalCekBpjsProps> = ({
  isOpen,
  onClose,
  patients,
  initialNoBpjs = '',
  initialNik = '',
  onApplyToForm,
  onAddToLog
}) => {
  const [searchMethod, setSearchMethod] = useState<'noBpjs' | 'nik' | 'patientList'>('noBpjs');
  const [inputNoBpjs, setInputNoBpjs] = useState(initialNoBpjs || '0001234567891');
  const [inputNik, setInputNik] = useState(initialNik || '3174011505920001');
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [tanggalPelayanan, setTanggalPelayanan] = useState<string>(() => new Date().toISOString().substring(0, 10));
  
  // Status simulation: 'Aktif' | 'Tidak Aktif'
  const [simulatedStatus, setSimulatedStatus] = useState<'Aktif' | 'Tidak Aktif'>('Aktif');
  const [checking, setChecking] = useState(false);
  const [checkResult, setCheckResult] = useState<{
    noBPJS: string;
    nik: string;
    nama: string;
    noRM: string;
    status: 'Aktif' | 'Tidak Aktif';
    statusDesc: string;
    hakKelas: string;
    jenisPeserta: string;
    faskes1: string;
    noRujukan: string;
    sepNo: string;
    tglLahir: string;
    gender: string;
    denda: string;
    responseCode: string;
  } | null>(null);

  // Sync initial props
  useEffect(() => {
    if (initialNoBpjs) setInputNoBpjs(initialNoBpjs);
    if (initialNik) setInputNik(initialNik);
  }, [initialNoBpjs, initialNik, isOpen]);

  // Handle No. BPJS change: only digits, max 13
  const handleBpjsChange = (val: string) => {
    const digitsOnly = val.replace(/\D/g, '').slice(0, 13);
    setInputNoBpjs(digitsOnly);
  };

  // Handle NIK change: only digits, max 16
  const handleNikChange = (val: string) => {
    const digitsOnly = val.replace(/\D/g, '').slice(0, 16);
    setInputNik(digitsOnly);
  };

  // Quick Select Patient
  const handleSelectPatient = (pId: string) => {
    setSelectedPatientId(pId);
    const p = patients.find(item => item.id === pId);
    if (p) {
      if (p.noBPJS && p.noBPJS !== '-') {
        setInputNoBpjs(p.noBPJS.replace(/\D/g, '').slice(0, 13));
      }
      if (p.nik) {
        setInputNik(p.nik.replace(/\D/g, '').slice(0, 16));
      }
      if (p.bpjsStatus === 'Tidak Aktif') {
        setSimulatedStatus('Tidak Aktif');
      } else {
        setSimulatedStatus('Aktif');
      }
    }
  };

  // Run Check BPJS
  const handlePerformCheck = () => {
    if (searchMethod === 'noBpjs') {
      if (!inputNoBpjs || inputNoBpjs.length !== 13) {
        Swal.fire({
          icon: 'warning',
          title: 'Validasi No. Kartu BPJS',
          text: `Nomor Kartu BPJS Kesehatan harus tepat 13 digit angka (saat ini ${inputNoBpjs.length} digit).`,
          confirmButtonColor: '#2563eb'
        });
        return;
      }
    } else if (searchMethod === 'nik') {
      if (!inputNik || inputNik.length !== 16) {
        Swal.fire({
          icon: 'warning',
          title: 'Validasi NIK KTP',
          text: `Nomor Induk Kependudukan (NIK) harus tepat 16 digit angka (saat ini ${inputNik.length} digit).`,
          confirmButtonColor: '#2563eb'
        });
        return;
      }
    }

    setChecking(true);
    setTimeout(() => {
      setChecking(false);

      // Match patient in local database
      const matched = patients.find(p => 
        (searchMethod === 'noBpjs' && p.noBPJS === inputNoBpjs) ||
        (searchMethod === 'nik' && p.nik === inputNik) ||
        (selectedPatientId && p.id === selectedPatientId)
      );

      const resolvedName = matched ? matched.name : (inputNoBpjs === '0001234567891' ? 'Tn. Ahmad Fauzi' : inputNoBpjs === '0001234567894' ? 'An. Rizky Pratama' : 'Peserta BPJS Terdaftar');
      const resolvedRM = matched ? matched.noRM : '000001';
      const resolvedNik = matched ? matched.nik : (inputNik || '3174011505920001');
      const resolvedBpjs = matched && matched.noBPJS !== '-' ? matched.noBPJS : (inputNoBpjs || '0001234567891');
      
      const isAktif = simulatedStatus === 'Aktif';
      const statusDesc = isAktif
        ? 'Peserta Mandiri / PBI Aktif (Iuran Terbayar Lunas)'
        : 'Tunggakan Iuran 2 Bulan (Non-Aktif sejak 01/08/2026)';
      const hakKelas = matched?.bpjsClass || 'Kelas 1';
      const sepNo = isAktif ? `0012R0010826V${Math.floor(100000 + Math.random() * 900000)}` : '-';
      const faskes1 = 'Puskesmas Kebon Jeruk (0112001)';
      const respCode = isAktif ? '200 OK' : '201 Not Active';

      const result = {
        noBPJS: resolvedBpjs,
        nik: resolvedNik,
        nama: resolvedName,
        noRM: resolvedRM,
        status: isAktif ? ('Aktif' as const) : ('Tidak Aktif' as const),
        statusDesc,
        hakKelas,
        jenisPeserta: isAktif ? 'PEKERJA BUKAN PENERIMA UPAH (PBPU) / MANDIRI' : 'PENERIMA BANTUAN IURAN (PBI NON-AKTIF)',
        faskes1,
        noRujukan: `RUK-2026-${Math.floor(100000 + Math.random() * 900000)}`,
        sepNo,
        tglLahir: matched?.birthDate || '1992-05-15',
        gender: matched?.gender === 'L' ? 'Laki-laki' : 'Perempuan',
        denda: isAktif ? 'Rp 0 (Bebas Denda)' : 'Penangguhan Klaim',
        responseCode: respCode
      };

      setCheckResult(result);

      // Automatically add to Sync Logs if handler provided
      if (onAddToLog) {
        onAddToLog({
          id: `VC-${Date.now().toString().slice(-4)}`,
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
          noBPJS: resolvedBpjs,
          nik: resolvedNik,
          patientName: resolvedName,
          noRM: resolvedRM,
          status: result.status,
          statusDesc,
          hakKelas,
          faskes1,
          sepNo,
          responseCode: respCode,
          dbSynced: true
        });
      }
    }, 500);
  };

  const handleApply = () => {
    if (!checkResult) return;
    if (onApplyToForm) {
      onApplyToForm({
        noBPJS: checkResult.noBPJS,
        nik: checkResult.nik,
        name: checkResult.nama,
        hakKelas: checkResult.hakKelas,
        status: checkResult.status,
        statusDesc: checkResult.statusDesc,
        sepNo: checkResult.sepNo
      });
    }
    Swal.fire({
      icon: 'success',
      title: 'Data BPJS Diterapkan',
      text: `Data peserta ${checkResult.nama} (${checkResult.noBPJS}) telah dimasukkan ke formulir pendaftaran.`,
      timer: 1500,
      showConfirmButton: false
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Cek Validasi & Kepesertaan Kartu BPJS (Bridging VClaim)"
      maxWidth="max-w-3xl"
    >
      <div className="space-y-5 text-xs">
        {/* Header Feature Badge */}
        <div className="p-3.5 bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-2xl flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center font-black">
              <Plus className="w-5 h-5 text-white stroke-[3]" />
            </div>
            <div>
              <div className="font-bold text-sm flex items-center gap-1.5">
                <span>+ Cek Validasi Kepesertaan BPJS</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-400/30 text-emerald-100 border border-white/20">
                  Online Bridging v2.1
                </span>
              </div>
              <p className="text-[11px] text-emerald-100">
                Pengecekan nomor kartu BPJS 13 digit atau NIK 16 digit secara real-time ke BPJS Health Server.
              </p>
            </div>
          </div>
          <span className="hidden sm:inline-block px-3 py-1 bg-white/10 rounded-xl text-[11px] font-mono font-bold">
            Live VClaim
          </span>
        </div>

        {/* Search Method Selector */}
        <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
          <button
            type="button"
            onClick={() => setSearchMethod('noBpjs')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              searchMethod === 'noBpjs'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Cari No. BPJS (13 Digit)</span>
          </button>
          <button
            type="button"
            onClick={() => setSearchMethod('nik')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              searchMethod === 'nik'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Cari NIK KTP (16 Digit)</span>
          </button>
          <button
            type="button"
            onClick={() => setSearchMethod('patientList')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              searchMethod === 'patientList'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Pilih Cepat Pasien Terdaftar</span>
          </button>
        </div>

        {/* Input Form Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5 bg-slate-50 p-4 rounded-2xl border border-slate-200">
          {searchMethod === 'noBpjs' && (
            <div className="sm:col-span-8 space-y-1">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-800">
                  Nomor Kartu BPJS Kesehatan (13 Digit Angka) *
                </label>
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                  inputNoBpjs.length === 13
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-amber-100 text-amber-900 border border-amber-300'
                }`}>
                  {inputNoBpjs.length} / 13 Digit
                </span>
              </div>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={13}
                value={inputNoBpjs}
                onChange={e => handleBpjsChange(e.target.value)}
                placeholder="Masukkan 13 digit angka kartu BPJS"
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </div>
          )}

          {searchMethod === 'nik' && (
            <div className="sm:col-span-8 space-y-1">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-800">
                  Nomor Induk Kependudukan / NIK KTP (16 Digit) *
                </label>
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                  inputNik.length === 16
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-amber-100 text-amber-900 border border-amber-300'
                }`}>
                  {inputNik.length} / 16 Digit
                </span>
              </div>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={16}
                value={inputNik}
                onChange={e => handleNikChange(e.target.value)}
                placeholder="Masukkan 16 digit angka NIK"
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </div>
          )}

          {searchMethod === 'patientList' && (
            <div className="sm:col-span-8 space-y-1">
              <label className="font-bold text-slate-800 block">
                Pilih Pasien Terdaftar SIMRS
              </label>
              <select
                value={selectedPatientId}
                onChange={e => handleSelectPatient(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:border-emerald-500"
              >
                <option value="">-- Pilih Nama Pasien --</option>
                {patients.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.noRM} - {p.name} ({p.insuranceType} - BPJS: {p.noBPJS || '-'})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="sm:col-span-4 space-y-1">
            <label className="font-bold text-slate-800 block">
              Tanggal Pelayanan
            </label>
            <input
              type="date"
              value={tanggalPelayanan}
              onChange={e => setTanggalPelayanan(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900"
            />
          </div>

          {/* Quick Simulation Status Switch */}
          <div className="sm:col-span-12 flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-700">Simulasi Respon Server:</span>
              <button
                type="button"
                onClick={() => setSimulatedStatus('Aktif')}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                  simulatedStatus === 'Aktif'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white text-emerald-700 border border-emerald-200 hover:bg-emerald-50'
                }`}
              >
                ● Status AKTIF (200 OK)
              </button>
              <button
                type="button"
                onClick={() => setSimulatedStatus('Tidak Aktif')}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                  simulatedStatus === 'Tidak Aktif'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-white text-rose-700 border border-rose-200 hover:bg-rose-50'
                }`}
              >
                ▲ Status TIDAK AKTIF (201)
              </button>
            </div>

            <button
              type="button"
              onClick={handlePerformCheck}
              disabled={checking}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold rounded-xl shadow-xs flex items-center gap-2 transition-all cursor-pointer ml-auto"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${checking ? 'animate-spin' : ''}`} />
              <span>{checking ? 'Memproses Bridging...' : 'Validasi ke VClaim BPJS'}</span>
            </button>
          </div>
        </div>

        {/* Result Container */}
        {checkResult && (
          <div className={`p-4 rounded-2xl border-2 space-y-3 shadow-xs animate-fade-in ${
            checkResult.status === 'Aktif'
              ? 'bg-emerald-50/70 border-emerald-300'
              : 'bg-rose-50/80 border-rose-300'
          }`}>
            {/* Header Result */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-200">
              <div className="flex items-center gap-2">
                {checkResult.status === 'Aktif' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-rose-600" />
                )}
                <div>
                  <div className="font-black text-sm text-slate-900 flex items-center gap-2">
                    <span>{checkResult.nama}</span>
                    <span className="font-mono text-xs text-slate-500 font-semibold">(RM: {checkResult.noRM})</span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono">
                    BPJS: {checkResult.noBPJS} | NIK: {checkResult.nik}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                  checkResult.status === 'Aktif'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-rose-600 text-white shadow-xs'
                }`}>
                  {checkResult.status === 'Aktif' ? '✓ STATUS: AKTIF (200)' : '⚠ STATUS: TIDAK AKTIF (201)'}
                </span>
              </div>
            </div>

            {/* Grid Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 text-[11px] text-slate-700 bg-white p-3.5 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-400 block text-[10px]">Jenis Peserta:</span>
                <span className="font-bold text-slate-900">{checkResult.jenisPeserta}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Hak Kelas Perawatan:</span>
                <span className="font-bold text-emerald-700">{checkResult.hakKelas}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Faskes Tingkat 1:</span>
                <span className="font-bold text-slate-900">{checkResult.faskes1}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">No. Rujukan FKTP:</span>
                <span className="font-mono font-bold text-slate-900">{checkResult.noRujukan}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Nomor SEP Otomatis:</span>
                <span className="font-mono font-bold text-blue-700">{checkResult.sepNo}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Denda Pelayanan:</span>
                <span className="font-bold text-emerald-700">{checkResult.denda}</span>
              </div>
            </div>

            {/* Status note */}
            <div className={`p-2.5 rounded-xl text-[11px] font-medium border ${
              checkResult.status === 'Aktif'
                ? 'bg-emerald-100/60 border-emerald-300 text-emerald-900'
                : 'bg-rose-100/60 border-rose-300 text-rose-900'
            }`}>
              <strong>Keterangan Bridging:</strong> {checkResult.statusDesc}
            </div>

            {/* Bottom Actions */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200">
              <span className="text-[10px] text-slate-500 font-mono">
                Log telah dicatat otomatis ke riwayat sinkronisasi VClaim.
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-bold cursor-pointer"
                >
                  Tutup
                </button>
                <button
                  type="button"
                  onClick={handleApply}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95 transition-all"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                  <span>Terapkan ke Formulir Pendaftaran</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
