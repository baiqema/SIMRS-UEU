import React, { useState } from 'react';
import { Modal } from './Modal';
import { AlertCircle, ShieldAlert, CheckCircle2, User, Clock, FileText, Check } from 'lucide-react';
import { Patient, Registration } from '../types';
import { PENGECUALIAN_READMISI } from '../utils/visitValidation';

interface EvaluasiRawatInapModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient?: Patient;
  registration?: Registration;
  losDays: number;
  onApproveOverride: (data: { reason: string; doctorName: string; targetDischargeDate: string }) => void;
}

export const EvaluasiRawatInapModal: React.FC<EvaluasiRawatInapModalProps> = ({
  isOpen,
  onClose,
  patient,
  registration,
  losDays,
  onApproveOverride
}) => {
  const [selectedException, setSelectedException] = useState<string>('');
  const [reason, setReason] = useState('Komplikasi medis membutuhkan stabilisasi lanjut / Terapi antibiotik lini kedua');
  const [doctorName, setDoctorName] = useState('dr. Andika Pratama, Sp.PD');
  const [targetDischargeDate, setTargetDischargeDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 5);
    return d.toISOString().split('T')[0];
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim() || !doctorName.trim()) return;
    const finalReason = selectedException 
      ? `[Pengecualian: ${selectedException}] ${reason}`
      : reason;

    onApproveOverride({
      reason: finalReason,
      doctorName,
      targetDischargeDate
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Evaluasi & Verifikasi Batas Waktu Rawat Inap (> 30 Hari)"
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-slate-800">
        {/* Warning Banner */}
        <div className="bg-rose-50 border-2 border-rose-300 rounded-2xl p-4 flex items-start gap-3 text-rose-950 shadow-xs">
          <div className="p-2 bg-rose-600 text-white rounded-xl shrink-0 mt-0.5">
            <ShieldAlert className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div className="space-y-1 text-xs">
            <h4 className="font-black text-sm text-rose-950 flex items-center gap-1.5">
              <span>Batas Waktu Perawatan Maksimal 30 Hari Terlampaui!</span>
            </h4>
            <p className="leading-relaxed text-rose-900 font-medium">
              Pasien telah dirawat selama <strong className="font-mono text-rose-950 underline font-black">{losDays} Hari</strong> (Maksimum regulasi kendali mutu & biaya: 30 Hari). Input transaksi perawatan dibatasi hingga evaluasi komite medik dan persetujuan perpanjangan diverifikasi.
            </p>
          </div>
        </div>

        {/* Patient Summary Card */}
        <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs grid grid-cols-2 gap-2">
          <div>
            <span className="text-[10px] text-slate-400 block uppercase font-bold">Nama Pasien</span>
            <span className="font-bold text-slate-900">{patient?.name || 'Pasien Anonim'}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block uppercase font-bold">No. Rekam Medis</span>
            <span className="font-mono font-bold text-blue-700">{patient?.noRM || '-'}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block uppercase font-bold">Ruang & Kamar</span>
            <span className="font-bold text-slate-800">{registration?.room || 'Rawat Inap'}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block uppercase font-bold">Tanggal Masuk (Admisi)</span>
            <span className="font-mono font-bold text-slate-800">{registration?.date || '-'}</span>
          </div>
        </div>

        {/* Official Regulatory Exceptions Selector */}
        <div className="bg-rose-50/60 p-3 rounded-2xl border border-rose-200 space-y-2">
          <span className="text-[11px] font-black uppercase text-rose-950 block">
            Kondisi yang Dikecualikan Sesuai Regulasi BPJS / Permenkes (Pilih Satu):
          </span>
          <div className="space-y-1.5">
            {PENGECUALIAN_READMISI.map((exc, idx) => {
              const isSelected = selectedException === exc;
              const charLabel = String.fromCharCode(97 + idx);
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedException(isSelected ? '' : exc)}
                  className={`w-full text-left p-2 rounded-xl border text-xs transition-all flex items-start gap-2 cursor-pointer ${
                    isSelected
                      ? 'bg-rose-600 text-white border-rose-700 shadow-xs font-semibold'
                      : 'bg-white text-slate-700 border-rose-200 hover:bg-rose-100/60'
                  }`}
                >
                  <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
                    isSelected ? 'bg-white text-rose-700' : 'bg-rose-100 text-rose-900'
                  }`}>
                    {charLabel}
                  </span>
                  <span className="flex-1 leading-snug">{exc}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-white shrink-0 mt-0.5" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Override Form */}
        <div className="space-y-3 pt-1">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Indikasi Medis & Alasan Klinis Perpanjangan Perawatan *
            </label>
            <textarea
              value={reason}
              onChange={e => setReason(e.target.value)}
              rows={2}
              required
              placeholder="Jelaskan alasan perpanjangan rawat inap (komplikasi klinis, evaluasi kultur, step-down ICU, dll)..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:bg-white focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Dokter DPJP / Verifikator *
              </label>
              <input
                type="text"
                value={doctorName}
                onChange={e => setDoctorName(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:bg-white focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Target Rencana Pemulangan (Discharge Plan) *
              </label>
              <input
                type="date"
                value={targetDischargeDate}
                onChange={e => setTargetDischargeDate(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:bg-white focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Modal Buttons */}
        <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer transition-colors"
          >
            Tutup
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-all"
          >
            <Check className="w-4 h-4" />
            <span>Setujui Perpanjangan Rawat Inap & Buka Kunci</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
