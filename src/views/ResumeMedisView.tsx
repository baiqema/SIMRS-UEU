import React from 'react';
import { useApp } from '../context/AppContext';
import { FileText, Eye } from 'lucide-react';

export const ResumeMedisView: React.FC = () => {
  const { medicalRecords, registrations, getPatient, getUser, canEditPage } = useApp();
  const isEditable = canEditPage('resumemedis');

  const inpatientMRs = medicalRecords
    .filter(mr => {
      const reg = registrations.find(r => r.id === mr.regId);
      return reg?.type === 'Rawat Inap';
    })
    .sort((a, b) => {
      const numA = parseInt(a.noRM.replace(/\D/g, '') || '0', 10);
      const numB = parseInt(b.noRM.replace(/\D/g, '') || '0', 10);
      return numA - numB;
    });

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
                Anda dapat melihat dokumen Resume Medis Pemulangan Pasien. Pengisian & verifikasi ringkasan pulang khusus untuk **Dokter DPJP / Perawat**.
              </p>
            </div>
          </div>
        </div>
      )}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Resume Medis Pasien Discharced (Rawat Inap)</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Ringkasan akhir pelayanan medis pasien rawat inap saat pulang.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200/80 text-slate-500 uppercase tracking-wider font-bold">
                <th className="p-3.5">No. RM</th>
                <th className="p-3.5">Nama Pasien</th>
                <th className="p-3.5">Tanggal Masuk</th>
                <th className="p-3.5">Tanggal Keluar</th>
                <th className="p-3.5">Diagnosis Utama</th>
                <th className="p-3.5">Pemeriksaan Fisik Akhir</th>
                <th className="p-3.5">DPJP</th>
                <th className="p-3.5 text-center">Status Resume</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {inpatientMRs.map(mr => {
                const reg = registrations.find(r => r.id === mr.regId);
                const p = reg ? getPatient(reg.patientId) : null;
                const d = getUser(mr.doctorId);
                return (
                  <tr key={mr.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5 font-bold font-mono text-blue-600">{mr.noRM}</td>
                    <td className="p-3.5 font-bold text-slate-800">{p?.name || '-'}</td>
                    <td className="p-3.5 text-slate-500">{reg?.date}</td>
                    <td className="p-3.5 text-slate-500">{reg?.status === 'Selesai' ? '2026-08-15' : 'Masih Dirawat'}</td>
                    <td className="p-3.5 font-semibold text-slate-800">{mr.diagnosis}</td>
                    <td className="p-3.5 max-w-xs truncate text-slate-600">{mr.physicalExam}</td>
                    <td className="p-3.5 text-slate-600">{d?.name || '-'}</td>
                    <td className="p-3.5 text-center">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                        {reg?.status === 'Selesai' ? 'Final Verified' : 'Draft Inpatient'}
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
