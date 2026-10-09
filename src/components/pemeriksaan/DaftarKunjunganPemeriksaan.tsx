import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Registration, RegistrationType } from '../../types';
import {
  Users,
  Search,
  Calendar,
  Filter,
  CheckCircle2,
  Clock,
  Stethoscope,
  Eye,
  AlertCircle,
  RefreshCw,
  PlusCircle,
  ArrowRight,
  UserCheck,
  Building2,
  Activity,
  FileCheck2
} from 'lucide-react';

interface DaftarKunjunganPemeriksaanProps {
  onSelectPatient: (patientId: string, regId: string, targetTab: 'rawatjalan' | 'igd' | 'rawatinap' | 'identitas') => void;
}

export const DaftarKunjunganPemeriksaan: React.FC<DaftarKunjunganPemeriksaanProps> = ({
  onSelectPatient
}) => {
  const { registrations, patients, medicalRecords, getUser, navigate } = useApp();

  // Filter States
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [isAllDates, setIsAllDates] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<'SEMUA' | 'IGD' | 'Rawat Jalan' | 'Rawat Inap'>('SEMUA');
  const [statusFilter, setStatusFilter] = useState<'SEMUA' | 'Siap Diperiksa' | 'Selesai Diperiksa'>('SEMUA');
  const [searchQuery, setSearchQuery] = useState('');

  // Map patient helper
  const patientMap = useMemo(() => {
    const map = new Map<string, typeof patients[0]>();
    patients.forEach(p => map.set(p.id, p));
    return map;
  }, [patients]);

  // Set of regIds that have medical records saved
  const regWithMedicalRecord = useMemo(() => {
    const set = new Set<string>();
    medicalRecords.forEach(mr => {
      if (mr.regId) set.add(mr.regId);
    });
    return set;
  }, [medicalRecords]);

  // Helper to determine accurate status
  const resolveStatus = (r: Registration): 'Siap Diperiksa' | 'Selesai Diperiksa' => {
    if (r.examinationStatus === 'Selesai Diperiksa' || r.status === 'Selesai Diperiksa') {
      return 'Selesai Diperiksa';
    }
    if (r.examinationStatus === 'Siap Diperiksa') {
      return 'Siap Diperiksa';
    }
    if (regWithMedicalRecord.has(r.id)) {
      return 'Selesai Diperiksa';
    }
    if (r.status === 'Selesai') {
      return 'Selesai Diperiksa';
    }
    return 'Siap Diperiksa';
  };

  // Base list of registrations
  const filteredRegistrations = useMemo(() => {
    return registrations.filter(r => {
      // 1. Filter by Date (unless isAllDates)
      if (!isAllDates && r.date !== selectedDate) {
        return false;
      }

      // 2. Filter by Category
      if (selectedCategory !== 'SEMUA') {
        if (r.type !== selectedCategory) return false;
      }

      // 3. Filter by Status
      const currentStatus = resolveStatus(r);
      if (statusFilter !== 'SEMUA') {
        if (currentStatus !== statusFilter) return false;
      }

      // 4. Filter by Search Query (No. RM & Nama Pasien)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const p = patientMap.get(r.patientId);
        const name = (p?.name || '').toLowerCase();
        const noRM = (p?.noRM || '').toLowerCase();
        const cleanRM = (p?.noRM || '').replace(/\D/g, '');
        const id = (r.id || '').toLowerCase();
        const poli = (r.poli || '').toLowerCase();
        const doc = (getUser(r.dpjp)?.name || '').toLowerCase();

        const match =
          name.includes(q) ||
          noRM.includes(q) ||
          cleanRM.includes(q) ||
          id.includes(q) ||
          poli.includes(q) ||
          doc.includes(q);

        if (!match) return false;
      }

      return true;
    });
  }, [registrations, isAllDates, selectedDate, selectedCategory, statusFilter, searchQuery, patientMap, regWithMedicalRecord, getUser]);

  // Summary statistics for selected date (or all dates)
  const stats = useMemo(() => {
    const list = registrations.filter(r => isAllDates || r.date === selectedDate);
    const total = list.length;
    let siap = 0;
    let selesai = 0;
    let igd = 0;
    let rawatJalan = 0;
    let rawatInap = 0;

    list.forEach(r => {
      const st = resolveStatus(r);
      if (st === 'Siap Diperiksa') siap++;
      else selesai++;

      if (r.type === 'IGD') igd++;
      else if (r.type === 'Rawat Jalan') rawatJalan++;
      else if (r.type === 'Rawat Inap') rawatInap++;
    });

    return { total, siap, selesai, igd, rawatJalan, rawatInap };
  }, [registrations, isAllDates, selectedDate, regWithMedicalRecord]);

  const handleExamineClick = (r: Registration) => {
    // Map registration type to corresponding form tab
    let targetTab: 'rawatjalan' | 'igd' | 'rawatinap' | 'identitas' = 'rawatjalan';
    if (r.type === 'IGD') {
      targetTab = 'igd';
    } else if (r.type === 'Rawat Inap') {
      targetTab = 'rawatinap';
    } else if (r.type === 'Rawat Jalan') {
      targetTab = 'rawatjalan';
    } else {
      targetTab = 'rawatjalan';
    }

    onSelectPatient(r.patientId, r.id, targetTab);
  };

  return (
    <div className="space-y-6">
      {/* HEADER BANNER KUNJUNGAN */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 rounded-3xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-xs text-blue-100 text-xs font-bold border border-white/20">
              <Users className="w-3.5 h-3.5 text-blue-200" />
              <span>Halaman Depan: Daftar Kunjungan Pasien</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Antrean & Kunjungan Pemeriksaan
            </h2>
            <p className="text-xs sm:text-sm text-blue-100/90 max-w-2xl leading-relaxed">
              Daftar pasien yang telah berhasil didaftarkan di loket pendaftaran dan siap dilakukan pemeriksaan medis oleh dokter/DPJP. Pilih pasien untuk langsung membuka formulir pemeriksaan.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => navigate('pendaftaran', { tab: 'daftar' })}
              className="px-4 py-2.5 bg-white text-blue-800 hover:bg-blue-50 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <PlusCircle className="w-4 h-4 text-blue-600" />
              <span>Pendaftaran Baru</span>
            </button>
          </div>
        </div>

        {/* Decorative background circle */}
        <div className="absolute -right-16 -bottom-24 w-72 h-72 rounded-full bg-white/5 pointer-events-none blur-xl"></div>
      </div>

      {/* SUMMARY STATS CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Pasien */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {isAllDates ? 'Total Semua Kunjungan' : 'Total Kunjungan Hari Ini'}
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900">{stats.total}</div>
          <div className="mt-1 text-[11px] text-slate-500 flex items-center gap-2">
            <span>RJ: <strong>{stats.rawatJalan}</strong></span>
            <span>•</span>
            <span>IGD: <strong>{stats.igd}</strong></span>
            <span>•</span>
            <span>Ranap: <strong>{stats.rawatInap}</strong></span>
          </div>
        </div>

        {/* Siap Diperiksa */}
        <div
          onClick={() => setStatusFilter('Siap Diperiksa')}
          className={`bg-white border rounded-2xl p-4 shadow-xs cursor-pointer transition-all hover:border-amber-400 ${
            statusFilter === 'Siap Diperiksa' ? 'border-amber-500 ring-2 ring-amber-200' : 'border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-700 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
              Siap Diperiksa
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-amber-900">{stats.siap}</div>
          <div className="mt-1 text-[11px] text-amber-700 font-medium">
            Pasien menunggu pemeriksaan dokter
          </div>
        </div>

        {/* Selesai Diperiksa */}
        <div
          onClick={() => setStatusFilter('Selesai Diperiksa')}
          className={`bg-white border rounded-2xl p-4 shadow-xs cursor-pointer transition-all hover:border-emerald-400 ${
            statusFilter === 'Selesai Diperiksa' ? 'border-emerald-500 ring-2 ring-emerald-200' : 'border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Selesai Diperiksa
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-emerald-900">{stats.selesai}</div>
          <div className="mt-1 text-[11px] text-emerald-700 font-medium">
            Pemeriksaan rampung & data tersimpan
          </div>
        </div>

        {/* Persentase Selesai */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Kemajuan Pemeriksaan
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900">
            {stats.total > 0 ? `${Math.round((stats.selesai / stats.total) * 100)}%` : '0%'}
          </div>
          <div className="mt-2 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${stats.total > 0 ? (stats.selesai / stats.total) * 100 : 0}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* FILTER & KATEGORI SECTION */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
        {/* ROW 1: KATEGORI TAB (IGD | RAWAT JALAN | RAWAT INAP) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-1 overflow-x-auto p-1 bg-slate-100 rounded-xl">
            {(
              [
                { id: 'SEMUA', label: 'SEMUA KUNJUNGAN', count: stats.total },
                { id: 'IGD', label: 'IGD', count: stats.igd },
                { id: 'Rawat Jalan', label: 'RAWAT JALAN', count: stats.rawatJalan },
                { id: 'Rawat Inap', label: 'RAWAT INAP', count: stats.rawatInap }
              ] as const
            ).map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedCategory(tab.id)}
                className={`px-3 sm:px-4 py-2 rounded-lg text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 ${
                  selectedCategory === tab.id
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    selectedCategory === tab.id
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Status Quick Filter Radio */}
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
            <span className="text-[11px] text-slate-400 uppercase font-black mr-1">Status:</span>
            <button
              type="button"
              onClick={() => setStatusFilter('SEMUA')}
              className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                statusFilter === 'SEMUA' ? 'bg-slate-800 text-white font-black' : 'bg-slate-100 hover:bg-slate-200'
              }`}
            >
              Semua
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('Siap Diperiksa')}
              className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                statusFilter === 'Siap Diperiksa'
                  ? 'bg-amber-500 text-white font-black'
                  : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
              }`}
            >
              <span>🟡</span>
              <span>Siap Diperiksa</span>
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('Selesai Diperiksa')}
              className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                statusFilter === 'Selesai Diperiksa'
                  ? 'bg-emerald-600 text-white font-black'
                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
              }`}
            >
              <span>🟢</span>
              <span>Selesai Diperiksa</span>
            </button>
          </div>
        </div>

        {/* ROW 2: SEARCH & DATE FILTER */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Pencarian No. RM dan Nama Pasien */}
          <div className="md:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari berdasarkan No. RM, Nama Pasien, Poli, atau Dokter..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all shadow-inner"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            )}
          </div>

          {/* Filter Tanggal */}
          <div className="md:col-span-4 flex items-center gap-2">
            <div className="relative flex-1">
              <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setIsAllDates(false);
                }}
                disabled={isAllDates}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all disabled:opacity-50"
              />
            </div>
            <button
              type="button"
              onClick={() => {
                setSelectedDate(todayStr);
                setIsAllDates(false);
              }}
              className={`px-3 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer shrink-0 ${
                !isAllDates && selectedDate === todayStr
                  ? 'bg-blue-50 text-blue-700 border-blue-200 font-black'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
              title="Filter ke hari ini"
            >
              Hari Ini
            </button>
          </div>

          {/* Toggle Semua Tanggal */}
          <div className="md:col-span-2 flex justify-end">
            <button
              type="button"
              onClick={() => setIsAllDates(!isAllDates)}
              className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                isAllDates
                  ? 'bg-blue-600 text-white border-blue-700 shadow-xs'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isAllDates ? 'text-white' : 'text-slate-500'}`} />
              <span>{isAllDates ? 'Semua Tanggal' : 'Filter Tanggal'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* TABEL KUNJUNGAN PASIEN */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-50/70">
          <div>
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              <span>Daftar Pasien Kunjungan ({filteredRegistrations.length})</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Pilih pasien untuk membuka formulir pemeriksaan medis (Rawat Jalan / IGD / Rawat Inap).
            </p>
          </div>
          <div className="text-xs font-bold text-slate-500 flex items-center gap-2">
            <span>Tanggal: <strong className="text-slate-800">{isAllDates ? 'Semua Tanggal' : selectedDate}</strong></span>
            <span>•</span>
            <span>Kategori: <strong className="text-slate-800">{selectedCategory}</strong></span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100/90 text-slate-700 border-b border-slate-200 font-extrabold uppercase text-[11px] tracking-wider">
                <th className="p-3.5 w-12 text-center">No</th>
                <th className="p-3.5">No. RM</th>
                <th className="p-3.5">Nama Pasien</th>
                <th className="p-3.5">Jenis Kunjungan</th>
                <th className="p-3.5">Poli / Ruangan</th>
                <th className="p-3.5">Dokter / DPJP</th>
                <th className="p-3.5 text-center">Waktu Daftar</th>
                <th className="p-3.5 text-center">Status</th>
                <th className="p-3.5 text-center w-28">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredRegistrations.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-12 text-center">
                    <div className="max-w-md mx-auto space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 mx-auto flex items-center justify-center">
                        <AlertCircle className="w-6 h-6" />
                      </div>
                      <h4 className="text-sm font-black text-slate-800">
                        Tidak Ada Pasien Kunjungan
                      </h4>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        {searchQuery
                          ? `Tidak ditemukan pasien yang sesuai dengan kata kunci "${searchQuery}".`
                          : isAllDates
                          ? 'Belum ada data kunjungan pasien terdaftar.'
                          : `Belum ada pasien yang terdaftar pada tanggal ${selectedDate} untuk kategori ${selectedCategory}. Pasien hanya muncul setelah proses pendaftaran berhasil.`}
                      </p>
                      <div className="pt-2 flex items-center justify-center gap-2">
                        {searchQuery && (
                          <button
                            type="button"
                            onClick={() => setSearchQuery('')}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold cursor-pointer"
                          >
                            Reset Pencarian
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setIsAllDates(true)}
                          className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-bold cursor-pointer"
                        >
                          Tampilkan Semua Tanggal
                        </button>
                        <button
                          type="button"
                          onClick={() => navigate('pendaftaran', { tab: 'daftar' })}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold cursor-pointer shadow-xs flex items-center gap-1"
                        >
                          <PlusCircle className="w-3.5 h-3.5" />
                          <span>Daftarkan Pasien</span>
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRegistrations.map((r, index) => {
                  const p = patientMap.get(r.patientId);
                  const doc = getUser(r.dpjp);
                  const status = resolveStatus(r);
                  const isSiap = status === 'Siap Diperiksa';

                  // Badge type styling
                  const typeBadgeClass =
                    r.type === 'IGD'
                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                      : r.type === 'Rawat Inap'
                      ? 'bg-purple-50 text-purple-700 border-purple-200'
                      : 'bg-blue-50 text-blue-700 border-blue-200';

                  // Format display time
                  const displayTime = r.registrationTime || '08.00';

                  return (
                    <tr
                      key={r.id}
                      className="hover:bg-blue-50/40 transition-colors group"
                    >
                      {/* 1. NO */}
                      <td className="p-3.5 text-center font-bold text-slate-500">
                        {index + 1}
                      </td>

                      {/* 2. NO. RM */}
                      <td className="p-3.5">
                        <span className="font-mono font-black text-xs text-blue-700 bg-blue-50/80 px-2 py-0.5 rounded border border-blue-200">
                          {p?.noRM || '-'}
                        </span>
                      </td>

                      {/* 3. NAMA PASIEN */}
                      <td className="p-3.5">
                        <div className="font-extrabold text-slate-900 group-hover:text-blue-700 transition-colors text-xs sm:text-sm">
                          {p?.name || 'Pasien Tidak Diketahui'}
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                          <span>
                            {p?.gender === 'M' ? 'L' : 'P'},{' '}
                            {p?.dob ? new Date().getFullYear() - new Date(p.dob).getFullYear() : 30} thn
                          </span>
                          <span>•</span>
                          <span className="font-semibold text-slate-600">
                            {p?.insuranceType || 'BPJS'}
                          </span>
                          <span>•</span>
                          <span className="font-mono text-slate-400 text-[10px]">
                            ID: {r.id}
                          </span>
                        </div>
                      </td>

                      {/* 4. JENIS KUNJUNGAN */}
                      <td className="p-3.5">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg font-black text-[11px] border ${typeBadgeClass}`}>
                          {r.type === 'IGD' && <Activity className="w-3 h-3" />}
                          {r.type === 'Rawat Jalan' && <Users className="w-3 h-3" />}
                          {r.type === 'Rawat Inap' && <Building2 className="w-3 h-3" />}
                          <span>{r.type}</span>
                        </span>
                      </td>

                      {/* 5. POLI / RUANGAN */}
                      <td className="p-3.5 font-bold text-slate-800">
                        <div>{r.poli || '-'}</div>
                        {r.room && (
                          <div className="text-[11px] text-purple-700 font-medium">
                            Kamar: {r.room}
                          </div>
                        )}
                      </td>

                      {/* 6. DOKTER / DPJP */}
                      <td className="p-3.5">
                        <div className="font-bold text-slate-800">
                          {doc?.name || 'dr. Budi Santoso, Sp.PD'}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {doc?.specialization || 'Dokter Penanggung Jawab Pelayanan'}
                        </div>
                      </td>

                      {/* 7. WAKTU DAFTAR */}
                      <td className="p-3.5 text-center">
                        <div className="inline-flex items-center gap-1 font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-xs">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{displayTime}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {r.date}
                        </div>
                      </td>

                      {/* 8. STATUS (SIAP DIPERIKSA / SELESAI DIPERIKSA) */}
                      <td className="p-3.5 text-center">
                        {isSiap ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-black text-[11px] bg-amber-50 text-amber-800 border border-amber-300 shadow-2xs">
                            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                            <span>Siap Diperiksa</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-black text-[11px] bg-emerald-50 text-emerald-800 border border-emerald-300">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Selesai Diperiksa</span>
                          </span>
                        )}
                      </td>

                      {/* 9. AKSI (PERIKSA) */}
                      <td className="p-3.5 text-center">
                        {isSiap ? (
                          <button
                            type="button"
                            onClick={() => handleExamineClick(r)}
                            className="w-full px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-xs transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 group-hover:shadow-md"
                            title={`Buka formulir pemeriksaan ${r.type}`}
                          >
                            <Stethoscope className="w-3.5 h-3.5" />
                            <span>Periksa</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleExamineClick(r)}
                            className="w-full px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1 cursor-pointer active:scale-95"
                            title={`Lihat atau edit rekam medis pemeriksaan ${r.type}`}
                          >
                            <Eye className="w-3.5 h-3.5 text-emerald-700" />
                            <span>Lihat</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* FOOTER INFO */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
              <strong>Siap Diperiksa:</strong> Pasien yang baru mendaftar hari ini dan menunggu pemeriksaan.
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <strong>Selesai Diperiksa:</strong> Pasien yang telah selesai diperiksa oleh dokter/petugas.
            </span>
          </div>
          <div className="text-slate-400 font-mono text-[11px]">
            Terintegrasi dengan Modul Pendaftaran & Rekam Medis (KMK 1423)
          </div>
        </div>
      </div>
    </div>
  );
};
