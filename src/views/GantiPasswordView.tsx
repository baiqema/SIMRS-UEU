import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { KeyRound } from 'lucide-react';

export const GantiPasswordView: React.FC = () => {
  const { changePassword, logout, user } = useApp();
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pw !== pw2) { setError('Konfirmasi password tidak sama'); return; }
    setBusy(true);
    const res = await changePassword(pw);
    setBusy(false);
    if (!res.success) setError(res.error || 'Gagal mengganti password');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4 font-sans">
      <form onSubmit={submit} className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4">
        <div className="flex items-center gap-3 text-blue-900">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
            <KeyRound className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-sm font-black">Ganti Password</h2>
            <p className="text-xs text-slate-500">Halo {user?.name}. Ini login pertama Anda; buat password baru (minimal 8 karakter).</p>
          </div>
        </div>
        <input type="password" value={pw} onChange={e => setPw(e.target.value)} placeholder="Password baru"
          className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none" />
        <input type="password" value={pw2} onChange={e => setPw2(e.target.value)} placeholder="Ulangi password baru"
          className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none" />
        {error && <p className="text-xs text-rose-600 font-semibold">{error}</p>}
        <button type="submit" disabled={busy}
          className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white rounded-xl text-xs font-black shadow-lg shadow-blue-600/30 cursor-pointer disabled:opacity-60">
          Simpan Password Baru
        </button>
        <button type="button" onClick={logout} className="w-full text-xs text-slate-500 hover:text-slate-700 cursor-pointer">
          Keluar
        </button>
      </form>
    </div>
  );
};
