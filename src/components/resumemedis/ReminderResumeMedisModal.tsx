import React from 'react';
import { Modal } from '../Modal';
import { ResumeMedis, Patient } from '../../types';
import { getResumeDeadlineStatus } from '../../utils/resumeMedisHelper';
import { Bell, AlertTriangle, ArrowRight, Clock, User, CheckCircle2, FileText, ChevronRight, BookOpen } from 'lucide-react';

interface ReminderResumeMedisModalProps {
  isOpen: boolean;
  onClose: () => void;
  incompleteResumes: ResumeMedis[];
  getPatient: (id: string) => Patient | undefined;
  onOpenDetail: (resume: ResumeMedis) => void;
}

export const ReminderResumeMedisModal: React.FC<ReminderResumeMedisModalProps> = ({
  isOpen,
  onClose,
  incompleteResumes,
  getPatient,
  onOpenDetail
}) => {
  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Daftar Reminder Kelengkapan Resume Medis (DPJP)"
      maxWidth="max-w-2xl"
    >
      <div className="space-y-4">
        {/* Header alert with Pedoman Rules */}
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-xs text-rose-900 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-rose-500 text-white flex items-center justify-center font-bold text-base shrink-0 shadow-2xs">
            🔔
          </div>
          <div className="space-y-0.5">
            <h4 className="font-extrabold text-rose-950 flex items-center gap-2">
              <span>Peringatan Kelengkapan Resume Medis DPJP</span>
              <span className="px-2 py-0.5 rounded-full bg-rose-200 text-rose-900 font-bold text-[10px]">
                {incompleteResumes.length} Pasien Tertunda
              </span>
            </h4>
            <p className="text-[11px] text-rose-900 leading-relaxed">
              <strong>Pedoman Batas Waktu Penyelesaian:</strong> Untuk <strong>Rawat Inap adalah 2x24 Jam (48 jam)</strong>, sedangkan untuk <strong>Rawat Jalan dan IGD adalah 1x24 Jam (24 jam)</strong> sejak pelayanan selesai.
            </p>
          </div>
        </div>

        {incompleteResumes.length === 0 ? (
          <div className="text-center py-10 bg-slate-50 border border-slate-200/80 rounded-2xl">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-slate-800">Semua Resume Medis Lengkap</h4>
            <p className="text-xs text-slate-500 mt-1">Tidak ada dokumen resume medis yang tertunda pengisian atau verifikasinya saat ini.</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
            {incompleteResumes.map((rm) => {
              const patient = getPatient(rm.patientId);
              const patientName = patient?.name || `Pasien (${rm.noRM})`;
              const missingList = rm.missingFields.length > 0
                ? rm.missingFields.join(', ')
                : 'Pencocokan verifikasi diagnosis belum tuntas';

              const deadlineInfo = getResumeDeadlineStatus(rm.reminderDeadline, rm.serviceType);

              return (
                <div
                  key={rm.id}
                  className="bg-white border-2 border-amber-200 hover:border-amber-300 rounded-2xl p-4 shadow-xs transition-all space-y-3"
                >
                  {/* Reminder Card Header */}
                  <div className="flex items-start justify-between gap-3 pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs shrink-0">
                        🔔
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] uppercase font-bold tracking-wider text-amber-800">
                            Reminder Resume Medis
                          </span>
                          <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 text-[10px] font-bold">
                            {rm.serviceType === 'Rawat Inap' ? 'Rawat Inap (Target 2x24 Jam)' : `${rm.serviceType || 'Rajal/IGD'} (Target 1x24 Jam)`}
                          </span>
                        </div>
                        <h4 className="text-xs font-extrabold text-slate-800 flex items-center gap-2 mt-0.5">
                          <span>{patientName}</span>
                          <span className="font-mono text-[11px] px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded font-bold">
                            {rm.noRM}
                          </span>
                        </h4>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        deadlineInfo.isOverdue
                          ? 'bg-rose-100 text-rose-800 border border-rose-300'
                          : 'bg-blue-100 text-blue-800 border border-blue-200'
                      }`}>
                        {deadlineInfo.statusBadge}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                        {rm.status}
                      </span>
                    </div>
                  </div>

                  {/* Standard Template Notification Message from user brief */}
                  <div className="p-3 bg-amber-50/80 border border-amber-200/90 rounded-xl text-xs space-y-1">
                    <p className="font-semibold text-amber-950">
                      Resume Medis pasien <span className="font-bold underline">{patientName}</span> masih belum lengkap.
                    </p>
                    <p className="text-amber-900 flex items-start gap-1.5">
                      <span className="font-bold text-rose-700 shrink-0">Bagian yang perlu dilengkapi:</span>
                      <span className="font-medium text-slate-800">{missingList}</span>
                    </p>
                    <p className="text-[11px] text-amber-800 italic pt-0.5">
                      Mohon segera dilengkapi dan diverifikasi sebelum Resume Medis difinalisasi.
                    </p>
                  </div>

                  {/* Metadata and Quick Action */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 text-[11px] text-slate-500">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        DPJP: <strong className="text-slate-700">{rm.doctorName || 'dr. DPJP'}</strong>
                      </span>
                      <span className="flex items-center gap-1 text-slate-600 font-semibold">
                        <Clock className="w-3.5 h-3.5 text-blue-600" />
                        Tenggat: <strong className={deadlineInfo.isOverdue ? 'text-rose-600' : 'text-slate-800'}>{rm.reminderDeadline || 'Segera'}</strong>
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenDetail(rm);
                      }}
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                    >
                      <span>Lengkapi Sekarang</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="flex items-center justify-end pt-3 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </Modal>
  );
};

