import React, { useState } from 'react';
import { Modal } from '../Modal';
import { ResumeMedis, Patient } from '../../types';
import { AlertTriangle, CheckCircle2, ShieldCheck, Lock, FileSignature, ArrowRight, X } from 'lucide-react';

interface KonfirmasiFinalisasiResumeModalProps {
  isOpen: boolean;
  onClose: () => void;
  resume: ResumeMedis | null;
  patient?: Patient;
  onConfirmFinalize: (doctorSignName: string) => void;
}

export const KonfirmasiFinalisasiResumeModal: React.FC<KonfirmasiFinalisasiResumeModalProps> = ({
  isOpen,
  onClose,
  resume,
  patient,
  onConfirmFinalize
}) => {
  if (!isOpen || !resume) return null;

  const [doctorSignName, setDoctorSignName] = useState(resume.doctorName || 'dr. Sari Dewi, Sp.PD');
  const [agreementChecked, setAgreementChecked] = useState(false);

  const handleConfirm = () => {
    if (!agreementChecked) return;
    onConfirmFinalize(doctorSignName);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Konfirmasi Finalisasi Resume Medis"
      maxWidth="max-w-xl"
    >
      <div className="space-y-5">
        {/* Warning Banner */}
        <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-2xl flex items-start gap-3.5 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-xl shrink-0 shadow-xs">
            ⚠️
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-extrabold text-amber-950 flex items-center gap-2">
              Konfirmasi Finalisasi Resume Medis
            </h3>
            <p className="text-xs text-amber-900 leading-relaxed font-medium">
              Apakah Anda yakin Resume Medis ini sudah lengkap, benar, dan siap untuk difinalisasi? Setelah difinalisasi, perubahan data memerlukan proses sesuai kewenangan.
            </p>
          </div>
        </div>

        {/* Patient & Summary Details */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Pasien</p>
              <h4 className="text-sm font-extrabold text-slate-800">{patient?.name || resume.noRM}</h4>
            </div>
            <div className="text-right">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">No. Rekam Medis</p>
              <span className="font-mono font-bold text-xs px-2.5 py-1 bg-blue-100 text-blue-800 rounded-lg">
                {resume.noRM}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-slate-500 block">DPJP Penanggung Jawab:</span>
              <span className="font-bold text-slate-800">{resume.doctorName || 'dr. DPJP'}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Tanggal Masuk / Keluar:</span>
              <span className="font-semibold text-slate-700">{resume.admissionDate} s/d {resume.dischargeDate}</span>
            </div>
            <div className="col-span-2">
              <span className="text-slate-500 block">Diagnosis Utama Terverifikasi:</span>
              <span className="font-bold text-emerald-800 flex items-center gap-1.5 mt-0.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                {resume.primaryDiagnosisVerified || resume.primaryDiagnosisForm}
              </span>
            </div>
          </div>
        </div>

        {/* Verification Check Notice */}
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2.5 text-xs text-emerald-900">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
          <p className="font-medium">
            Sistem telah melakukan pemeriksaan kelengkapan otomatis. Seluruh data wajib dan kesesuaian diagnosis dengan dokumen verifikasi telah valid.
          </p>
        </div>

        {/* Signature Confirmation */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <FileSignature className="w-4 h-4 text-blue-600" />
            Nama Dokter Penanggung Jawab Pelayanan (DPJP) yang Memfinalisasi:
          </label>
          <input
            type="text"
            value={doctorSignName}
            onChange={(e) => setDoctorSignName(e.target.value)}
            className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            placeholder="Nama Dokter DPJP..."
          />
        </div>

        {/* Confirmation Checkbox */}
        <label className="flex items-start gap-3 p-3 bg-slate-50 hover:bg-slate-100/70 border border-slate-200 rounded-xl cursor-pointer transition-colors">
          <input
            type="checkbox"
            checked={agreementChecked}
            onChange={(e) => setAgreementChecked(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
          />
          <span className="text-xs text-slate-700 leading-relaxed font-medium select-none">
            Saya menyatakan bahwa resume medis ini telah saya periksa, lengkap, benar secara klinis, dan siap untuk difinalisasi secara resmi sebagai dokumen rekam medis sah.
          </span>
        </label>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 transition-colors"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!agreementChecked || !doctorSignName.trim()}
            className={`px-4 py-2 text-xs font-bold rounded-xl flex items-center gap-2 shadow-sm transition-all ${
              agreementChecked && doctorSignName.trim()
                ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-500/25 cursor-pointer'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>Ya, Finalisasi Resume Medis</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
