import React from 'react';
import { useApp } from '../context/AppContext';
import { Radio, CheckCircle2 } from 'lucide-react';

export const RadiologiView: React.FC = () => {
  const { radiology, getReg, getPatient, getUser, canEditPage } = useApp();
  const isEditable = canEditPage('radiologi');

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
                Anda dapat melihat eksaminasi Radiologi & PACS. Penginputan & eksplanasi foto khusus untuk **Dokter / Radiografer Radiologi**.
              </p>
            </div>
          </div>
        </div>
      )}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Radiologi & Diagnostic Imaging</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Hasil eksaminasi radiologi (X-Ray, EKG, USG) beserta eksaminasi LOINC dan eksplanasi radiolog.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200/80 text-slate-500 uppercase tracking-wider font-bold">
                <th className="p-3.5">ID Radiologi</th>
                <th className="p-3.5">Nama Pasien</th>
                <th className="p-3.5">Pemeriksaan Imaging</th>
                <th className="p-3.5">Kode LOINC</th>
                <th className="p-3.5">Hasil & Eksplanasi Radiolog</th>
                <th className="p-3.5">Dokter Radiologi</th>
                <th className="p-3.5">Tanggal</th>
                <th className="p-3.5 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {radiology.map(rad => {
                const r = getReg(rad.regId);
                const p = r ? getPatient(r.patientId) : null;
                const rlog = getUser(rad.radiologist);

                return (
                  <tr key={rad.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5 font-bold text-blue-600">{rad.id}</td>
                    <td className="p-3.5 font-bold text-slate-800">{p?.name || '-'}</td>
                    <td className="p-3.5 font-bold text-slate-900">{rad.exam}</td>
                    <td className="p-3.5 font-mono text-purple-700 font-bold">{rad.loinc}</td>
                    <td className="p-3.5 max-w-md text-slate-700 font-medium leading-relaxed">{rad.result}</td>
                    <td className="p-3.5 text-slate-600">{rlog?.name || '-'}</td>
                    <td className="p-3.5 text-slate-500">{rad.date}</td>
                    <td className="p-3.5 text-center">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> {rad.status}
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
