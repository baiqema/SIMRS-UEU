import React from 'react';
import { useApp } from '../context/AppContext';
import { ShieldAlert, Eye } from 'lucide-react';

interface ReadOnlyBannerProps {
  moduleName: string;
}

export const ReadOnlyBanner: React.FC<ReadOnlyBannerProps> = ({ moduleName }) => {
  const { user, getRole } = useApp();
  if (!user) return null;

  const role = getRole(user.roleId);

  return (
    <div className="mb-5 p-3.5 bg-amber-50/95 border border-amber-300/80 rounded-2xl shadow-xs text-amber-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-amber-100 border border-amber-300 text-amber-800 flex items-center justify-center shrink-0 font-bold">
          <Eye className="w-5 h-5 text-amber-700" />
        </div>
        <div>
          <div className="font-extrabold text-amber-950 flex items-center gap-2 flex-wrap">
            <span>Mode Lihat Saja (Read-Only) — Modul {moduleName}</span>
            <span className="px-2 py-0.5 bg-amber-200 text-amber-900 rounded-full font-mono text-[10px]">
              Role: {role?.name || 'Mahasiswa'}
            </span>
          </div>
          <p className="text-[11px] text-amber-800 font-medium mt-0.5">
            Anda dapat melihat & membaca seluruh data untuk mempelajari alur kerja antar unit. Penginputan, pengubahan (Edit), dan penghapusan data dikunci khusus untuk role wewenang terkait.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-amber-300 rounded-xl font-bold text-[11px] text-amber-900 shadow-2xs">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-600" /> Hak Akses Terbatas
        </span>
      </div>
    </div>
  );
};
