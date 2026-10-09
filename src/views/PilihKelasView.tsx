import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Building2, LogIn } from 'lucide-react';

export const PilihKelasView: React.FC = () => {
  const { classOptions, chooseClass } = useApp();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState('');

  const pick = async (id: string) => {
    setBusy(id);
    setError('');
    const res = await chooseClass(id);
    if (!res.success) setError(res.error || 'Gagal masuk ke kelas');
    setBusy(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4 font-sans">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4">
        <div className="flex items-center gap-3 text-blue-900">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-sm font-black">Pilih Kelas</h2>
            <p className="text-xs text-slate-500">Anda terdaftar di lebih dari satu kelas. Pilih rumah sakit simulasi yang akan dibuka.</p>
          </div>
        </div>
        <div className="space-y-2">
          {(classOptions ?? []).map(c => (
            <button
              key={c.id}
              type="button"
              disabled={busy !== null}
              onClick={() => pick(c.id)}
              className="w-full text-left p-3 bg-slate-50 hover:bg-blue-50/90 hover:border-blue-300 border border-slate-200/80 rounded-xl text-xs font-bold text-slate-800 flex items-center justify-between cursor-pointer disabled:opacity-60"
            >
              <span>{c.name}</span>
              <LogIn className="w-4 h-4 text-blue-600" />
            </button>
          ))}
        </div>
        {error && <p className="text-xs text-rose-600 font-semibold">{error}</p>}
      </div>
    </div>
  );
};
