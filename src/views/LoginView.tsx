import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { RoleId } from '../types';
import { Building2, Eye, EyeOff, LogIn, ShieldAlert, FileText, Activity, GraduationCap, HelpCircle, CheckCircle2, UserCheck, Lock } from 'lucide-react';

export const LoginView: React.FC = () => {
  const { login } = useApp();
  const [username, setUsername] = useState('20240306044');
  const [selectedRole, setSelectedRole] = useState<RoleId>('R09'); // Default: Mahasiswa Coding
  const [password, setPassword] = useState('mhs123');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPass, setShowPass] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showForgotModal, setShowForgotModal] = useState(false);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setErrorMsg('Username/NIM dan password wajib diisi');
      return;
    }
    const res = login(username.trim(), password.trim(), selectedRole);
    if (!res.success) {
      setErrorMsg(res.error || 'Login gagal. Periksa kembali Username/NIM & password');
    }
  };

  const handlePresetFill = (u: string, p: string, r: RoleId) => {
    setUsername(u);
    setPassword(p);
    setSelectedRole(r);
    setErrorMsg('');
    login(u, p, r);
  };

  const roleOptions: { id: RoleId; label: string; desc: string }[] = [
    { id: 'R07', label: 'Mahasiswa Pendaftaran', desc: 'Akses Edit: Pasien, Registrasi, SEP, General Consent' },
    { id: 'R06', label: 'Mahasiswa Perawat', desc: 'Akses Edit: Asesmen Keperawatan, CPPT, SOAP, SDKI/SLKI/SIKI' },
    { id: 'R09', label: 'Mahasiswa Coding', desc: 'Akses Edit: Coding ICD-10, ICD-9-CM, Grouping INA-CBG' },
    { id: 'R13', label: 'Mahasiswa Pelaporan', desc: 'Akses Edit: Laporan RL 1-5, Indikator RS & Export' },
    { id: 'R03', label: 'Dosen', desc: 'Akses Penuh: Seluruh Modul, Penilaian & Koreksi Praktikum' },
    { id: 'R01', label: 'Admin', desc: 'Super User: Manajemen User, Audit Trail & System' },
    { id: 'R04', label: 'Mahasiswa (All Modul)', desc: 'Akses Penuh Seluruh Modul untuk Latihan Bebas' },
  ];

  const demoAccounts = [
    { label: 'Mahasiswa Coding (NIM 20240306044)', u: '20240306044', p: 'mhs123', roleId: 'R09' as RoleId },
    { label: 'Mahasiswa Pendaftaran', u: 'mhs.pendaftaran', p: 'pendaftaran123', roleId: 'R07' as RoleId },
    { label: 'Mahasiswa Perawat', u: 'mhs.perawat', p: 'perawat123', roleId: 'R06' as RoleId },
    { label: 'Mahasiswa Pelaporan', u: 'mhs.pelaporan', p: 'pelaporan123', roleId: 'R13' as RoleId },
    { label: 'Dosen Pengampu (Dr. Wati)', u: 'dsn.dr.wati', p: 'dosen123', roleId: 'R03' as RoleId },
    { label: 'Super Administrator', u: 'admin', p: 'admin123', roleId: 'R01' as RoleId },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-100 text-slate-800 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background Ornaments */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-sky-200/40 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-200/40 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-4xl grid lg:grid-cols-12 gap-8 items-center z-10">
        {/* Left Branding */}
        <div className="lg:col-span-6 text-slate-800 space-y-6 text-center lg:text-left">
          <div className="inline-flex items-center gap-3 bg-white/90 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-sky-200 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-xs">
              <Building2 className="w-6 h-6" />
            </div>
            <div className="text-left">
              <span className="text-xs font-black text-blue-950 block leading-none tracking-tight">
                SIMRS ESA UNGGUL
              </span>
              <span className="text-[10px] text-slate-600 font-semibold">
                Prodi Rekam Medis & Informasi Kesehatan
              </span>
            </div>
          </div>

          <div>
            <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-blue-950 leading-tight">
              Sistem Informasi Manajemen Rumah Sakit
            </h1>
            <p className="mt-3 text-xs sm:text-sm text-slate-600 leading-relaxed max-w-md">
              Platform SIMRS 3.0 Edukasi RMIK Universitas Esa Unggul dengan sistem <strong className="text-blue-900">Role-Based Access Control (RBAC)</strong>. Seluruh mahasiswa dapat membaca (View Only) semua modul RS, dan mengedit sesuai role praktikum yang dipilih saat login.
            </p>
          </div>

          {/* Quick Access Card for Students */}
          <div className="p-4 bg-gradient-to-r from-blue-700 to-indigo-800 text-white rounded-2xl shadow-lg border border-blue-400 text-left space-y-2">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-amber-300 shrink-0" />
              <span className="font-extrabold text-xs tracking-wide uppercase">Konsep Satu Akun Multi-Role</span>
            </div>
            <p className="text-[11px] text-blue-100 leading-snug">
              Satu NIM / akun mahasiswa dapat digunakan untuk berbagai praktikum. Pilih role yang ingin Anda jalankan saat login.
            </p>
            <button
              type="button"
              onClick={() => handlePresetFill('20240306044', 'mhs123', 'R09')}
              className="w-full py-2.5 px-3 bg-amber-400 hover:bg-amber-300 text-slate-900 rounded-xl font-black text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogIn className="w-4 h-4" /> Masuk NIM 20240306044 (Role Coding)
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-1">
            <div className="p-3 bg-white/90 rounded-xl border border-sky-200 backdrop-blur-sm text-center shadow-2xs">
              <UserCheck className="w-5 h-5 text-blue-600 mx-auto mb-1" />
              <span className="text-[11px] font-bold text-slate-800 block">Single Sign-On</span>
              <span className="text-[9px] text-slate-500 font-medium">1 Akun Banyak Role</span>
            </div>
            <div className="p-3 bg-white/90 rounded-xl border border-sky-200 backdrop-blur-sm text-center shadow-2xs">
              <FileText className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
              <span className="text-[11px] font-bold text-slate-800 block">Akses Read-Only</span>
              <span className="text-[9px] text-slate-500 font-medium">Semua Modul Terbuka</span>
            </div>
            <div className="p-3 bg-white/90 rounded-xl border border-sky-200 backdrop-blur-sm text-center shadow-2xs">
              <Activity className="w-5 h-5 text-purple-600 mx-auto mb-1" />
              <span className="text-[11px] font-bold text-slate-800 block">Audit Log</span>
              <span className="text-[9px] text-slate-500 font-medium">Nilai & Jejak Dosen</span>
            </div>
          </div>
        </div>

        {/* Right Form */}
        <div className="lg:col-span-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">Masuk ke SIMRS</h2>
                <p className="text-xs text-slate-500 mt-0.5">Silakan isi NIM / Username dan pilih Role praktikum.</p>
              </div>
              <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 font-bold">
                <Lock className="w-4 h-4" />
              </div>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {/* Field 1: Username / NIM */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Username / NIM <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="Masukkan NIM atau Username (contoh: 20240306044)"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-600 focus:bg-white font-semibold text-slate-800 transition-all"
                  required
                />
              </div>

              {/* Field 2: Pilihan Role (Dropdown) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Login Sebagai (Pilih Hak Akses Role) <span className="text-rose-500">*</span>
                </label>
                <select
                  value={selectedRole}
                  onChange={e => setSelectedRole(e.target.value as RoleId)}
                  className="w-full px-4 py-2.5 bg-sky-50/80 border border-sky-300 rounded-xl text-xs font-bold text-blue-950 focus:outline-none focus:border-blue-600 focus:bg-white transition-all cursor-pointer"
                >
                  {roleOptions.map(r => (
                    <option key={r.id} value={r.id}>
                      ▼ {r.label}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-500 mt-1 font-medium italic">
                  {roleOptions.find(r => r.id === selectedRole)?.desc}
                </p>
              </div>

              {/* Field 3: Password */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Password <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(true)}
                    className="text-[11px] font-bold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                  >
                    Lupa Password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Masukkan password Anda"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-600 focus:bg-white transition-all pr-10 font-medium"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    title={showPass ? 'Sembunyikan Password' : 'Tampilkan Password'}
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 cursor-pointer"
                />
                <label htmlFor="rememberMe" className="text-xs text-slate-600 font-medium cursor-pointer">
                  Ingat Sesi Login Saya
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white rounded-xl text-xs font-black shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <LogIn className="w-4 h-4" /> Masuk ke SIMRS
              </button>
            </form>

            {/* Quick Demo Login */}
            <div className="mt-5 pt-4 border-t border-slate-100">
              <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-2">
                Preset Akun Demo Praktikum (Klik Langsung Masuk):
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {demoAccounts.map((acc, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handlePresetFill(acc.u, acc.p, acc.roleId)}
                    className="text-left p-2.5 bg-slate-50 hover:bg-blue-50/90 hover:border-blue-300 border border-slate-200/80 rounded-xl transition-all text-[11px] cursor-pointer group shadow-2xs"
                  >
                    <div className="font-bold text-slate-800 group-hover:text-blue-900 truncate flex items-center justify-between">
                      <span>{acc.label}</span>
                    </div>
                    <div className="flex items-center justify-between mt-1 text-[10px]">
                      <span className="text-blue-700 font-mono font-bold">{acc.u}</span>
                      <span className="px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded font-mono text-[9px] font-bold">
                        {acc.p}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-left space-y-4">
            <div className="flex items-center gap-3 text-blue-900">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                <HelpCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-sm">Petunjuk Lupa Password</h3>
                <p className="text-xs text-slate-500">Informasi Akses & Bantuan Akun SIMRS</p>
              </div>
            </div>

            <div className="p-3 bg-sky-50 border border-sky-200 rounded-xl text-xs text-slate-700 space-y-2">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Mahasiswa Baru / NIM:</strong> Gunakan password default <code className="bg-white px-1 py-0.5 rounded text-blue-700 font-mono font-bold">mhs123</code>.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Satu Akun Multi-Role:</strong> Anda tidak perlu membuat akun baru untuk role berbeda. Cukup pilih Role yang diinginkan pada dropdown login.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Bantuan Kendala Login:</strong> Jika akun terkunci atau password telah diubah, hubungi Dosen Pengampu Mata Kuliah Praktikum RMIK atau Admin SIMRS Esa Unggul.
                </span>
              </div>
            </div>

            <button
              onClick={() => setShowForgotModal(false)}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              Saya Mengerti & Kembali
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

