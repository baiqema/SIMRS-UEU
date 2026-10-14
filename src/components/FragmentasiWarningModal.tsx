import React, { useState } from 'react';
import { Modal } from './Modal';
import { AlertTriangle, Clock, Calendar, CheckCircle2, ShieldAlert, Check } from 'lucide-react';
import { Registration, Patient } from '../types';
import { PENGECUALIAN_FRAGMENTASI, PENGECUALIAN_READMISI } from '../utils/visitValidation';

interface FragmentasiWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProceedWithJustification?: (reason: string) => void;
  patient?: Patient;
  targetPoli: string;
  targetDate: string;
  previousVisit?: Registration;
  diffDays?: number;
  reason?: string;
  recommendation?: string;
  isReadmisi?: boolean;
}

export const FragmentasiWarningModal: React.FC<FragmentasiWarningModalProps> = ({
  isOpen,
  onClose,
  onProceedWithJustification,
  patient,
  targetPoli,
  targetDate,
  previousVisit,
  diffDays = 0,
  reason,
  recommendation,
  isReadmisi = false
}) => {
  const [selectedException, setSelectedException] = useState<string>('');
  const [customNotes, setCustomNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const exceptionList = isReadmisi ? PENGECUALIAN_READMISI : PENGECUALIAN_FRAGMENTASI;

  const handleConfirm = () => {
    if (!onProceedWithJustification) return;
    setIsSubmitting(true);
    const finalReason = selectedException 
      ? `[Pengecualian: ${selectedException}] ${customNotes ? `- ${customNotes}` : ''}`
      : (customNotes || 'Justifikasi klinis terverifikasi oleh DPJP / Tim Kendali Mutu.');
    onProceedWithJustification(finalReason);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isReadmisi ? "Peringatan Regulasi: Deteksi Potensi Readmisi Rawat Inap (≤ 30 Hari)" : "Peringatan Regulasi: Deteksi Potensi Fragmentasi Rawat Jalan (≤ 7 Hari)"}
      maxWidth="max-w-2xl"
    >
      <div className="space-y-4 text-slate-800">
        {/* Banner Alert */}
        <div className="bg-amber-50 border-2 border-amber-400 rounded-2xl p-4 flex items-start gap-3 text-amber-950 shadow-xs">
          <div className="p-2 bg-amber-500 text-white rounded-xl shrink-0 mt-0.5 shadow-xs">
            <AlertTriangle className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div className="space-y-1 text-xs">
            <h4 className="font-black text-sm text-amber-950 flex items-center gap-1.5">
              <span>{isReadmisi ? 'Potensi Readmisi Rawat Inap Terdeteksi!' : 'Potensi Fragmentasi Riwayat Kunjungan Terdeteksi!'}</span>
            </h4>
            <p className="leading-relaxed text-amber-900 font-medium">
              {isReadmisi
                ? 'Pasien tercatat kembali melakukan admisi rawat inap berulang dalam rentang waktu ≤ 30 hari dari episode rawat inap sebelumnya.'
                : 'Pasien tercatat melakukan kunjungan rawat jalan berulang di FKRTL pada kasus yang sama dalam waktu ≤ 7 hari dari episode rawat jalan sebelumnya.'}
            </p>
          </div>
        </div>

        {/* Patient Info Card */}
        {patient && (
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-bold">Nama Pasien</span>
              <span className="font-bold text-slate-900">{patient.name}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block uppercase font-bold">No. Rekam Medis (RM)</span>
              <span className="font-mono font-bold text-blue-700">{patient.noRM}</span>
            </div>
          </div>
        )}

        {/* Visual Timeline of Visits */}
        <div className="p-4 bg-gradient-to-br from-slate-50 to-blue-50/50 rounded-2xl border border-slate-200 space-y-3">
          <div className="text-[10px] font-black uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            <span>Alur Riwayat Kunjungan Pasien</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
            {/* Previous Visit */}
            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs space-y-1">
              <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold">
                <span>Kunjungan Sebelumnya</span>
                <span className="font-mono text-slate-600">{previousVisit?.id || '-'}</span>
              </div>
              <div className="font-black text-xs text-slate-800 truncate">
                {previousVisit?.poli || previousVisit?.room || 'Episode Sebelumnya'}
              </div>
              <div className="flex items-center gap-1 text-[11px] text-slate-600">
                <Calendar className="w-3 h-3 text-slate-400" />
                <span>{previousVisit?.date || '-'}</span>
              </div>
            </div>

            {/* Current Visit */}
            <div className="bg-white p-3 rounded-xl border-2 border-amber-400 shadow-2xs space-y-1 relative">
              <div className="flex items-center justify-between text-[10px] text-amber-700 font-bold">
                <span>Kunjungan Baru (Saat Ini)</span>
                <span className="bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-mono font-bold">
                  Selang {diffDays} Hari ({diffDays <= 7 ? '≤ 7 Hari' : '≤ 30 Hari'})
                </span>
              </div>
              <div className="font-black text-xs text-amber-950 truncate">
                {targetPoli}
              </div>
              <div className="flex items-center gap-1 text-[11px] text-slate-600">
                <Calendar className="w-3 h-3 text-slate-400" />
                <span>{targetDate}</span>
              </div>
            </div>
          </div>

          {/* Explanation Text */}
          <div className="text-xs text-slate-700 space-y-1.5 pt-1 border-t border-slate-200">
            <p className="font-semibold text-slate-900">{reason}</p>
            <p className="text-[11px] text-slate-600 leading-relaxed italic">{recommendation}</p>
          </div>
        </div>

        {/* REGULATORY EXCEPTION PICKER (SESUAI DOKUMEN REGULASI RESMI) */}
        <div className="bg-blue-50/70 p-3.5 rounded-2xl border border-blue-200 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase text-blue-900 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-blue-600" />
              Pilih Kondisi yang Dikecualikan dari {isReadmisi ? 'Readmisi' : 'Fragmentasi'}:
            </span>
            <span className="text-[10px] font-semibold text-blue-700">Regulasi Kemenkes / BPJS</span>
          </div>

          <div className="space-y-1.5">
            {exceptionList.map((exc, idx) => {
              const isSelected = selectedException === exc;
              const charLabel = String.fromCharCode(97 + idx); // a, b, c, d
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedException(isSelected ? '' : exc)}
                  className={`w-full text-left p-2.5 rounded-xl border text-xs transition-all flex items-start gap-2.5 cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-700 shadow-xs font-semibold'
                      : 'bg-white text-slate-700 border-blue-200 hover:bg-blue-100/70'
                  }`}
                >
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
                    isSelected ? 'bg-white text-blue-600' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {charLabel}
                  </span>
                  <span className="flex-1 leading-snug">{exc}</span>
                  {isSelected && <Check className="w-4 h-4 text-white shrink-0 mt-0.5" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Additional Clinical Justification Input */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700">
            Catatan Tambahan DPJP / Keterangan Klinis (Opsional):
          </label>
          <textarea
            value={customNotes}
            onChange={e => setCustomNotes(e.target.value)}
            placeholder="Contoh: Jadwal hemodialisa rutin / Kemoterapi siklus lanjutan / Evaluasi lab darah post-op..."
            rows={2}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:bg-white focus:border-blue-500 focus:outline-none"
          />
        </div>

        {/* Modal Buttons */}
        <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer transition-colors"
          >
            Batal & Evaluasi Alur
          </button>

          {onProceedWithJustification && (
            <button
              type="button"
              disabled={isSubmitting || (!selectedException && !customNotes.trim())}
              onClick={handleConfirm}
              className={`px-4 py-2 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-all ${
                selectedException || customNotes.trim()
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-slate-300 text-slate-500 cursor-not-allowed'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Simpan Otorisasi & Lanjutkan Pendaftaran</span>
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
};
