import React from 'react';
import { useApp } from '../context/AppContext';
import { Pill, CheckCircle2 } from 'lucide-react';

export const FarmasiView: React.FC = () => {
  const { pharmacy, getReg, getPatient, getUser, canEditPage } = useApp();
  const isEditable = canEditPage('farmasi');

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
                Anda dapat melihat status e-resep dan dispensing obat. Proses peracikan & penyerahan obat khusus untuk **Petugas Apoteker & Depo Farmasi**.
              </p>
            </div>
          </div>
        </div>
      )}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Farmasi & Dispensing Obat</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Pengelolaan resep elektronik, stok obat, dan status penyerahan resep obat pasien.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200/80 text-slate-500 uppercase tracking-wider font-bold">
                <th className="p-3.5">ID Resep</th>
                <th className="p-3.5">No. Registrasi</th>
                <th className="p-3.5">Nama Pasien</th>
                <th className="p-3.5">Daftar Obat & Dosis</th>
                <th className="p-3.5">Apoteker Penanggung Jawab</th>
                <th className="p-3.5">Tanggal Dispensing</th>
                <th className="p-3.5 text-center">Status Resep</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {pharmacy.map(ph => {
                const r = getReg(ph.regId);
                const p = r ? getPatient(r.patientId) : null;
                const apoteker = getUser(ph.pharmacist);
                return (
                  <tr key={ph.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5 font-bold text-blue-600">{ph.id}</td>
                    <td className="p-3.5 font-mono text-slate-600">{ph.regId}</td>
                    <td className="p-3.5 font-bold text-slate-800">{p?.name || '-'}</td>
                    <td className="p-3.5 space-y-1">
                      {ph.items.map((item, idx) => (
                        <div key={idx} className="inline-block mr-2 mb-1 px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-lg text-[11px]">
                          <strong className="text-slate-800">{item.drug}</strong> ({item.qty} pcs) &bull; <span className="text-blue-600 font-bold">{item.dose}</span>
                        </div>
                      ))}
                    </td>
                    <td className="p-3.5 text-slate-600">{apoteker?.name || '-'}</td>
                    <td className="p-3.5 text-slate-500">{ph.date}</td>
                    <td className="p-3.5 text-center">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> {ph.status}
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
  );
};
