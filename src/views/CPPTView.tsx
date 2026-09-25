import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CPPTInputTable } from '../components/CPPTInputTable';
import { Activity, ExternalLink, ShieldCheck } from 'lucide-react';

export const CPPTView: React.FC = () => {
  const { patients, medicalRecords, getReg, getPatient, navigate, canEditPage } = useApp();
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');

  const isEditable = canEditPage('cppt');

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
                Anda dapat membaca seluruh Catatan Perkembangan Pasien Terintegrasi (CPPT/SOAP). Pengisian catatan SOAP khusus untuk **Dokter, Perawat, atau Petugas Rekam Medis**.
              </p>
            </div>
          </div>
        </div>
      )}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-600" /> Catatan Perkembangan Pasien Terintegrasi (CPPT)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Mekanisme Longitudinal Record (STARKES/KARS): Setiap entri tersimpan kronologis dengan format S-O-A-P, instruksi PPA, & vital signs.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => navigate('rekammedis', { initialTab: 'cppt' })}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
          >
            <ExternalLink className="w-4 h-4" /> Buka Rekam Medis Longitudinal
          </button>
        </div>
      </div>

      {/* Patient Selector */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <span className="text-xs font-bold text-slate-700 shrink-0">Pilih Pasien Aktif:</span>
          <select
            value={selectedPatientId}
            onChange={e => setSelectedPatientId(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[280px]"
          >
            <option value="">-- Semua Pasien Terdaftar --</option>
            {[...patients].sort((a, b) => parseInt(a.noRM.replace(/\D/g, '') || '0', 10) - parseInt(b.noRM.replace(/\D/g, '') || '0', 10)).map(p => (
              <option key={p.id} value={p.id}>
                [{p.noRM}] - {p.name}
              </option>
            ))}
          </select>
        </div>

        <div className="text-xs text-slate-500 flex items-center gap-1 font-medium">
          <ShieldCheck className="w-4 h-4 text-emerald-600" /> SIMRS RME Validated Entry
        </div>
      </div>

      {/* CPPT Form & History Table (Exact SIMRS Layout from Screenshot) */}
      <CPPTInputTable patientId={selectedPatientId || undefined} />
    </div>
  );
};

