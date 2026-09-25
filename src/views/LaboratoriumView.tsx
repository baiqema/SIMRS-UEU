import React from 'react';
import { useApp } from '../context/AppContext';
import { FlaskConical, CheckCircle2 } from 'lucide-react';

export const LaboratoriumView: React.FC = () => {
  const { lab, getReg, getPatient, getUser, canEditPage } = useApp();
  const isEditable = canEditPage('laboratorium');

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
                Anda dapat melihat hasil pemeriksaan Laboratorium LOINC. Penginputan & verifikasi sampel lab khusus untuk **Petugas Analis Laboratorium**.
              </p>
            </div>
          </div>
        </div>
      )}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Laboratorium Klinik & LOINC</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Hasil pemeriksaan laboratorium dengan pemetaan standar internasional LOINC (Logical Observation Identifiers Names and Codes).
          </p>
        </div>
      </div>

      <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-2xl text-xs text-blue-900 flex items-center gap-3">
        <FlaskConical className="w-5 h-5 text-blue-600 shrink-0" />
        <div>
          <strong>Standar Interoperabilitas LOINC:</strong> Kode LOINC digunakan pada seluruh hasil laboratorium untuk mendukung pertukaran data medis nasional (SATUSEHAT) secara seamless.
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200/80 text-slate-500 uppercase tracking-wider font-bold">
                <th className="p-3.5">ID Lab</th>
                <th className="p-3.5">Nama Pasien</th>
                <th className="p-3.5">Pemeriksaan</th>
                <th className="p-3.5">Kode LOINC</th>
                <th className="p-3.5">Hasil Pemeriksaan</th>
                <th className="p-3.5">Analis Lab</th>
                <th className="p-3.5">Tanggal</th>
                <th className="p-3.5 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {lab.map(l => {
                const r = getReg(l.regId);
                const p = r ? getPatient(r.patientId) : null;
                const tech = getUser(l.techId);

                return l.tests.map((t, idx) => (
                  <tr key={`${l.id}-${idx}`} className="hover:bg-slate-50/80 transition-colors">
                    {idx === 0 && (
                      <td rowSpan={l.tests.length} className="p-3.5 font-bold text-blue-600 border-r border-slate-100 align-top">
                        {l.id}
                      </td>
                    )}
                    {idx === 0 && (
                      <td rowSpan={l.tests.length} className="p-3.5 font-bold text-slate-800 border-r border-slate-100 align-top">
                        {p?.name || '-'}
                      </td>
                    )}
                    <td className="p-3.5 font-bold text-slate-800">{t.name}</td>
                    <td className="p-3.5 font-mono text-purple-700 font-bold">{t.loinc}</td>
                    <td className="p-3.5 font-semibold text-slate-900">{t.result}</td>
                    {idx === 0 && (
                      <td rowSpan={l.tests.length} className="p-3.5 text-slate-600 border-l border-slate-100 align-top">
                        {tech?.name || '-'}
                      </td>
                    )}
                    {idx === 0 && (
                      <td rowSpan={l.tests.length} className="p-3.5 text-slate-500 border-l border-slate-100 align-top">
                        {l.date}
                      </td>
                    )}
                    {idx === 0 && (
                      <td rowSpan={l.tests.length} className="p-3.5 text-center border-l border-slate-100 align-top">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> {l.status}
                        </span>
                      </td>
                    )}
                  </tr>
                ));
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
