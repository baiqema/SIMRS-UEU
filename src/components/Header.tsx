import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Menu, Search, LogOut, Lock, User, Check, X, Home
} from 'lucide-react';

export const Header: React.FC = () => {
  const { user, logout, toggleSidebar, activePage, getRole, navigate } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  if (!user) return null;

  const role = getRole(user.roleId);

  const getBreadcrumb = () => {
    const map: Record<string, string> = {
      dashboard: 'Dashboard Eksekutif',
      pendaftaran: 'Pelayanan / Pendaftaran Pasien',
      generalconsent: 'Pelayanan / General Consent',
      rekammedis: 'Rekam Medis / Rekam Medis Elektronik',
      cppt: 'Rekam Medis / CPPT',
      informedconsent: 'Rekam Medis / Informed Consent',
      resumemedis: 'Rekam Medis / Resume Medis',
      coding: 'Coding & Klaim / Coding ICD-10 & ICD-9-CM',
      klaim: 'Coding & Klaim / Klaim BPJS',
      billing: 'Keuangan / Billing',
      pembayaran: 'Keuangan / Pembayaran',
      farmasi: 'Penunjang / Farmasi',
      laboratorium: 'Penunjang / Laboratorium',
      radiologi: 'Penunjang / Radiologi',
      manajemenuser: 'Administrasi / Manajemen Pengguna',
      praktikum: 'Administrasi / Praktikum RMIK',
      audit: 'Administrasi / Audit Trail',
      logaktivitas: 'Administrasi / Log Aktivitas',
      pelaporan: 'Pelaporan / Indikator & Laporan RS',
      metadata: 'Standar & Regulasi / Kamus Metadata KMK 1423'
    };
    return map[activePage] || activePage;
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    const term = searchTerm.toLowerCase();
    const modules = [
      { key: 'pendaftaran', keywords: ['pendaftaran', 'pasien', 'daftar', 'register', 'igd', 'rawat inap', 'bayi'] },
      { key: 'rekammedis', keywords: ['rekam', 'medis', 'rme', 'diagnosis', 'anamnesis', 'soap', 'tracer'] },
      { key: 'cppt', keywords: ['cppt', 'soap', 'dokter', 'perawat', 'ppa'] },
      { key: 'coding', keywords: ['coding', 'icd', 'koding', 'diagnosa', 'icd 10', 'icd 9'] },
      { key: 'klaim', keywords: ['klaim', 'bpjs', 'ina-cbg', 'cbg'] },
      { key: 'billing', keywords: ['billing', 'tagihan', 'keuangan'] },
      { key: 'pembayaran', keywords: ['pembayaran', 'bayar', 'kasir'] },
      { key: 'farmasi', keywords: ['farmasi', 'obat', 'resep'] },
      { key: 'laboratorium', keywords: ['lab', 'laboratorium', 'loinc'] },
      { key: 'radiologi', keywords: ['radiologi', 'x-ray', 'ekg', 'usg'] },
      { key: 'audit', keywords: ['audit', 'trail', 'log'] },
      { key: 'pelaporan', keywords: ['laporan', 'indikator', 'bor', 'los', 'rl', 'sirs'] },
      { key: 'metadata', keywords: ['metadata', 'kmk', 'standar', 'kamus', '1423', 'variabel'] }
    ];

    const match = modules.find(m => m.keywords.some(k => k.includes(term) || term.includes(k)));
    if (match) {
      navigate(match.key);
      setSearchTerm('');
    }
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword !== confirmPassword) {
      alert('Password baru tidak cocok!');
      return;
    }
    setPasswordSuccess(true);
    setTimeout(() => {
      setPasswordSuccess(false);
      setShowPasswordModal(false);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }, 1200);
  };

  const displayName = user.name;

  return (
    <>
      <header className="sticky top-0 z-30 bg-[#0B5ED7] border-b border-[#0852bc] h-17 sm:h-18 flex items-center justify-between px-3 sm:px-6 shadow-md gap-2 select-none">
        {/* LEFT: Toggle Sidebar & Breadcrumbs */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleSidebar}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer shrink-0"
            title="Toggle Menu Navigasi"
          >
            <Menu className="w-5 h-5 text-white" />
          </button>

          <div className="hidden sm:flex items-center text-xs text-blue-100 gap-1.5 font-medium">
            <Home className="w-3.5 h-3.5 text-blue-200" />
            <span className="text-blue-300">/</span>
            <span className="text-white font-semibold">{getBreadcrumb()}</span>
          </div>
        </div>

        {/* RIGHT: Quick Search, User Profile, Ganti Password, & Keluar */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Quick Search */}
          <form onSubmit={handleSearch} className="relative hidden lg:block">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-white/60" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Cari modul SIMRS..."
              className="pl-8 pr-3 py-1.5 bg-white/15 hover:bg-white/20 focus:bg-white text-white focus:text-slate-900 placeholder:text-white/70 focus:placeholder:text-slate-400 border border-white/30 focus:border-white rounded-full text-xs w-40 focus:w-48 transition-all outline-none"
            />
          </form>

          {/* User Profile Pill Button */}
          <button
            onClick={() => navigate('manajemenuser')}
            className="flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-full border border-white/35 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold cursor-pointer transition-colors"
            title={`Pengguna: ${displayName} (${role?.name || 'Mahasiswa'})`}
          >
            <User className="w-3.5 h-3.5 text-white shrink-0" />
            <span className="truncate max-w-[130px] sm:max-w-[160px]">{displayName}</span>
          </button>

          {/* Ganti Password Button (Orange) */}
          <button
            onClick={() => setShowPasswordModal(true)}
            className="bg-[#FF7A00] hover:bg-[#E66E00] active:scale-95 text-white font-semibold text-xs px-3 sm:px-3.5 py-1.5 rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap"
            title="Ganti Password Akun"
          >
            <Lock className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">Ganti Password</span>
          </button>

          {/* Keluar Button (Red) */}
          <button
            onClick={logout}
            className="bg-[#C53030] hover:bg-[#A82828] active:scale-95 text-white font-semibold text-xs px-3 sm:px-3.5 py-1.5 rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap"
            title="Keluar dari Sistem"
          >
            <LogOut className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">Keluar</span>
          </button>
        </div>
      </header>

      {/* MODAL GANTI PASSWORD */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-100 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2 text-slate-800 font-bold">
                <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
                  <Lock className="w-4 h-4" />
                </div>
                <span>Ganti Password Akun SIM</span>
              </div>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {passwordSuccess ? (
              <div className="py-8 text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                  <Check className="w-6 h-6" />
                </div>
                <div className="font-bold text-slate-800">Password Berhasil Diperbarui!</div>
                <p className="text-xs text-slate-500">Gunakan password baru Anda untuk login berikutnya.</p>
              </div>
            ) : (
              <form onSubmit={handleChangePassword} className="mt-4 space-y-3.5 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Password Lama</label>
                  <input
                    type="password"
                    required
                    value={oldPassword}
                    onChange={e => setOldPassword(e.target.value)}
                    placeholder="Masukkan password saat ini"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Password Baru</label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="Minimal 6 karakter"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Konfirmasi Password Baru</label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Ulangi password baru"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 text-slate-800"
                  />
                </div>

                <div className="pt-3 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowPasswordModal(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-[#FF7A00] hover:bg-[#E66E00] text-white font-semibold cursor-pointer shadow-xs"
                  >
                    Simpan Password
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
};
