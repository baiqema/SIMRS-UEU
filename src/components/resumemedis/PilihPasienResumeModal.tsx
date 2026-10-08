import React, { useState } from 'react';
import { Modal } from '../Modal';
import { useApp } from '../../context/AppContext';
import { Registration, Patient } from '../../types';
import { Search, UserCheck, Calendar, ArrowRight, CheckCircle2, Bed, Stethoscope, Sparkles } from 'lucide-react';

interface PilihPasienResumeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectRegistration: (regId: string) => void;
}

export const PilihPasienResumeModal: React.FC<PilihPasienResumeModalProps> = ({
  isOpen,
  onClose,
  onSelectRegistration
}) => {
  const { registrations, patients, medicalRecords, resumeMedisList, getUser } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'Rawat Inap' | 'IGD' | 'Rawat Jalan'>('ALL');

  if (!isOpen) return null;

  // Filter registrations
  const filteredRegs = registrations.filter(reg => {
    if (typeFilter !== 'ALL' && reg.type !== typeFilter) return false;

    const patient = patients.find(p => p.id === reg.patientId);
    if (!searchTerm.trim()) return true;

    const q = searchTerm.toLowerCase();
    const pName = (patient?.name || '').toLowerCase();
    const pRM = (patient?.noRM || '').toLowerCase();
    const regId = reg.id.toLowerCase();
    const poli = (reg.poli || '').toLowerCase();

    return pName.includes(q) || pRM.includes(q) || regId.includes(q) || poli.includes(q);
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Tarik Data Otomatis & Buat Resume Medis Pasien"
      maxWidth="max-w-2xl"
    >
      <div className="space-y-4">
        {/* Notice Info */}
        <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-2xl flex items-start gap-3 text-xs text-blue-900 shadow-2xs">
          <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-extrabold text-blue-950">Integrasi Tarik Data Otomatis (Medical Discharge Summary)</h4>
            <p className="text-[11px] text-blue-800 mt-0.5 leading-relaxed">
              Seluruh data rekam medis, anamnesis, pemeriksaan fisik, CPPT, hasil laboratorium, radiologi, koding ICD-10, tindakan ICD-9, dan terapi akan ditarik secara otomatis dari sistem tanpa input ulang.
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari nama pasien, No. RM, atau poliklinik..."
              className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            {(['ALL', 'Rawat Inap', 'IGD', 'Rawat Jalan'] as const).map(t => (
              <button
                key={t}
                type="button"
                onClick={() => setTypeFilter(t)}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                  typeFilter === t
                    ? 'bg-white text-blue-600 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t === 'ALL' ? 'Semua' : t}
              </button>
            ))}
          </div>
        </div>

        {/* List of Registrations */}
        <div className="max-h-[50vh] overflow-y-auto space-y-2 pr-1">
          {filteredRegs.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              Tidak ada data kunjungan/pendaftaran pasien yang cocok.
            </div>
          ) : (
            filteredRegs.map(reg => {
              const patient = patients.find(p => p.id === reg.patientId);
              const mr = medicalRecords.find(m => m.regId === reg.id);
              const dpjpUser = getUser(reg.dpjp);
              const existingResume = resumeMedisList.find(r => r.regId === reg.id);

              return (
                <div
                  key={reg.id}
                  className="p-3 bg-white border border-slate-200/90 hover:border-blue-400 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs transition-all"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                        {patient?.noRM || '-'}
                      </span>
                      <h4 className="text-xs font-extrabold text-slate-800">{patient?.name || 'Pasien'}</h4>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-slate-100 text-slate-700">
                        {reg.type}
                      </span>
                      {existingResume && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          Resume Ada: {existingResume.status}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
                      <span>Tgl: <strong>{reg.date}</strong></span>
                      <span>Ruang: <strong>{reg.room || reg.poli}</strong></span>
                      <span>DPJP: <strong>{dpjpUser?.name || 'dr. DPJP'}</strong></span>
                    </div>

                    {mr?.diagnosis && (
                      <p className="text-[11px] text-slate-700 font-medium">
                        Diagnosis: <em>{mr.diagnosis}</em>
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onSelectRegistration(reg.id);
                    }}
                    className={`px-3.5 py-2 font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
                      existingResume
                        ? 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    <span>{existingResume ? 'Buka Resume' : 'Tarik Otomatis'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        <div className="flex items-center justify-end pt-3 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 transition-colors"
          >
            Batal
          </button>
        </div>
      </div>
    </Modal>
  );
};
