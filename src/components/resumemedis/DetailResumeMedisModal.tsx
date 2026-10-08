import React, { useState, useEffect } from 'react';
import { Modal } from '../Modal';
import { useApp } from '../../context/AppContext';
import { ResumeMedis, ResumeMedisHomeMed, ResumeMedisProcedure, Patient, Registration, User } from '../../types';
import { getResumeDeadlineStatus } from '../../utils/resumeMedisHelper';
import { findMatchingInaCbgPedoman, InaCbgPedomanItem } from '../../data/inaCbgPedomanData';
import { PedomanInaCbgModal } from './PedomanInaCbgModal';
import {
  FileText, CheckCircle2, AlertTriangle, ShieldCheck, Printer,
  Lock, Save, RefreshCw, Plus, Trash2, Calendar, Stethoscope,
  Pill, Activity, Info, HeartPulse, UserCheck, Check, ArrowRight,
  BookOpen, Clock, Sparkles, ExternalLink
} from 'lucide-react';
import Swal from 'sweetalert2';

interface DetailResumeMedisModalProps {
  isOpen: boolean;
  onClose: () => void;
  resume: ResumeMedis | null;
  patient?: Patient | null;
  registration?: Registration | null;
  onOpenPrint: (rm: ResumeMedis) => void;
  onOpenFinalizeConfirm: (rm: ResumeMedis) => void;
}

export const DetailResumeMedisModal: React.FC<DetailResumeMedisModalProps> = ({
  isOpen,
  onClose,
  resume,
  patient,
  registration,
  onOpenPrint,
  onOpenFinalizeConfirm
}) => {
  const { updateResumeMedis, syncDiagnosisWithVerification, canEditPage, user } = useApp();
  const isEditable = canEditPage('resumemedis');

  // Active sub-tab
  const [activeTab, setActiveTab] = useState<'diagnosis' | 'clinical' | 'therapy' | 'discharge'>('diagnosis');
  const [isPedomanModalOpen, setIsPedomanModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState<Partial<ResumeMedis>>({});
  const [homeMeds, setHomeMeds] = useState<ResumeMedisHomeMed[]>([]);
  const [procedures, setProcedures] = useState<ResumeMedisProcedure[]>([]);
  const [newMed, setNewMed] = useState<ResumeMedisHomeMed>({
    drugName: '',
    dose: '',
    frequency: '',
    route: 'Oral (PO)',
    instructions: ''
  });

  useEffect(() => {
    if (resume) {
      setFormData({ ...resume });
      setHomeMeds(resume.homeMedications ? [...resume.homeMedications] : []);
      setProcedures(resume.procedures ? [...resume.procedures] : []);
    }
  }, [resume]);

  if (!isOpen || !resume) return null;

  const isFinal = resume.status === 'Final';
  const isLocked = isFinal || !isEditable;

  // Deadline calculation (2x24 jam untuk Rawat Inap, 1x24 jam untuk Rawat Jalan & IGD)
  const deadlineInfo = getResumeDeadlineStatus(resume.reminderDeadline, resume.serviceType);

  // Matched INA-CBG rules from official manual
  const matchedPedomanRules = findMatchingInaCbgPedoman(
    `${formData.primaryDiagnosisForm || resume.primaryDiagnosisForm || ''} ${formData.primaryDiagnosisVerified || resume.primaryDiagnosisVerified || ''}`,
    procedures.map(p => p.name).join(' ')
  );

  // Check if field is in missingFields
  const isFieldMissing = (fieldKeyword: string) => {
    if (!resume.missingFields) return false;
    return resume.missingFields.some(f => f.toLowerCase().includes(fieldKeyword.toLowerCase()));
  };

  const handleInputChange = (field: keyof ResumeMedis, value: any) => {
    if (isLocked) return;
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFollowUpChange = (field: string, value: string) => {
    if (isLocked) return;
    setFormData(prev => ({
      ...prev,
      followUpPlan: {
        ...prev.followUpPlan,
        [field]: value
      }
    }));
  };

  const handleAddMedication = () => {
    if (isLocked || !newMed.drugName.trim()) return;
    const updated = [...homeMeds, { ...newMed }];
    setHomeMeds(updated);
    setFormData(prev => ({ ...prev, homeMedications: updated }));
    setNewMed({ drugName: '', dose: '', frequency: '', route: 'Oral (PO)', instructions: '' });
  };

  const handleRemoveMedication = (index: number) => {
    if (isLocked) return;
    const updated = homeMeds.filter((_, i) => i !== index);
    setHomeMeds(updated);
    setFormData(prev => ({ ...prev, homeMedications: updated }));
  };

  const handleSave = () => {
    if (isLocked) return;
    updateResumeMedis(resume.id, {
      ...formData,
      homeMedications: homeMeds,
      procedures: procedures
    });

    Swal.fire({
      icon: 'success',
      title: 'Perubahan Disimpan',
      text: 'Data Resume Medis berhasil diperbarui dan sistem telah memeriksa kelengkapan otomatis.',
      timer: 1500,
      showConfirmButton: false
    });
  };

  const handleSyncDiagnosis = () => {
    if (isLocked) return;
    Swal.fire({
      title: 'Sinkronkan Diagnosis?',
      html: `Diagnosis formulir DPJP akan disesuaikan dengan dokumen verifikasi koding:<br/><strong class="text-blue-600">${resume.primaryDiagnosisVerified}</strong>`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#2563eb',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Ya, Sinkronkan',
      cancelButtonText: 'Batal'
    }).then(result => {
      if (result.isConfirmed) {
        syncDiagnosisWithVerification(resume.id);
        setFormData(prev => ({
          ...prev,
          primaryDiagnosisForm: resume.primaryDiagnosisVerified,
          isDiagnosisMatched: true
        }));
        Swal.fire({
          icon: 'success',
          title: 'Diagnosis Sesuai',
          text: 'Diagnosis formulir DPJP telah disinkronkan dan diverifikasi sesuai dokumen koding.',
          timer: 1500,
          showConfirmButton: false
        });
      }
    });
  };

  const canFinalize = resume.missingFields.length === 0 && resume.isDiagnosisMatched && !isFinal;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Resume Medis / Discharge Summary - ${patient?.name || resume.noRM}`}
      maxWidth="max-w-5xl"
    >
      <div className="space-y-4 max-h-[82vh] overflow-y-auto pr-1">
        {/* Patient Identity Top Bar */}
        <div className="p-3.5 bg-slate-50 border border-slate-200/90 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
              {patient?.name?.charAt(0) || 'P'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-slate-800 text-sm">{patient?.name || '-'}</h3>
                <span className="font-mono text-xs px-2 py-0.5 bg-blue-100 text-blue-800 rounded-md font-bold">
                  {resume.noRM}
                </span>
                <span className="text-slate-400">|</span>
                <span className="text-slate-600 font-medium">
                  {patient?.gender === 'M' || patient?.gender === 'L' ? 'Laki-laki' : 'Perempuan'}, {patient?.dob || '-'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Ruang: <strong>{resume.dischargeRoom || resume.admissionPoliRoom}</strong> | Tgl Masuk: <strong>{resume.admissionDate}</strong> | Keluar: <strong>{resume.dischargeDate}</strong> ({resume.lengthOfStay || 1} Hari Rawat)
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Deadline Pill */}
            <div className={`px-2.5 py-1 rounded-xl text-[11px] font-bold flex items-center gap-1.5 shadow-2xs ${
              deadlineInfo.isOverdue
                ? 'bg-rose-100 text-rose-900 border border-rose-300'
                : 'bg-slate-100 text-slate-800 border border-slate-300'
            }`}>
              <Clock className="w-3.5 h-3.5 text-slate-600" />
              <span>{deadlineInfo.label}:</span>
              <strong className={deadlineInfo.isOverdue ? 'text-rose-700' : 'text-blue-700'}>
                {deadlineInfo.statusBadge}
              </strong>
            </div>

            {/* Pedoman INA-CBG Button */}
            <button
              type="button"
              onClick={() => setIsPedomanModalOpen(true)}
              className="px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            >
              <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
              <span>Panduan INA-CBG Edisi 2</span>
            </button>

            <span className={`px-3 py-1 rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-2xs ${
              resume.status === 'Final'
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                : resume.status === 'Siap Difinalisasi'
                ? 'bg-blue-100 text-blue-800 border border-blue-300'
                : resume.status === 'Menunggu Verifikasi'
                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                : 'bg-rose-100 text-rose-800 border border-rose-300'
            }`}>
              {resume.status === 'Final' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />}
              {resume.status}
            </span>
          </div>
        </div>

        {/* Automatic Completeness Checking Notification */}
        {resume.missingFields.length > 0 && !isFinal && (
          <div className="p-3.5 bg-amber-50 border-2 border-amber-300 rounded-2xl flex items-start gap-3 shadow-2xs">
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-sm shrink-0">
              ⚠️
            </div>
            <div className="flex-1 space-y-1">
              <h4 className="text-xs font-extrabold text-amber-950 flex items-center gap-2">
                <span>Pemeriksaan Kelengkapan Otomatis (Automatic Completeness Checking)</span>
                <span className="text-[10px] px-2 py-0.5 bg-amber-200 text-amber-900 rounded-full font-bold">
                  ⚠️ Belum Lengkap ({resume.missingFields.length} Data)
                </span>
              </h4>
              <p className="text-[11px] text-amber-900 font-medium leading-relaxed">
                Resume Medis belum dapat difinalisasi karena masih ada data wajib yang belum diisi atau verifikasi belum sesuai:
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {resume.missingFields.map((field, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-amber-200/90 text-amber-950 border border-amber-400"
                  >
                    <span>⚠️ Belum Lengkap:</span>
                    <span>{field}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 gap-1 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('diagnosis')}
            className={`px-4 py-2.5 font-bold rounded-t-xl transition-colors flex items-center gap-2 cursor-pointer ${
              activeTab === 'diagnosis'
                ? 'border-b-2 border-blue-600 text-blue-600 bg-blue-50/50'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Stethoscope className="w-4 h-4" />
            <span>Diagnosis & Penunjang</span>
            {!resume.isDiagnosisMatched && (
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('clinical')}
            className={`px-4 py-2.5 font-bold rounded-t-xl transition-colors flex items-center gap-2 cursor-pointer ${
              activeTab === 'clinical'
                ? 'border-b-2 border-blue-600 text-blue-600 bg-blue-50/50'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Riwayat & Pemeriksaan Fisik</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('therapy')}
            className={`px-4 py-2.5 font-bold rounded-t-xl transition-colors flex items-center gap-2 cursor-pointer ${
              activeTab === 'therapy'
                ? 'border-b-2 border-blue-600 text-blue-600 bg-blue-50/50'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Pill className="w-4 h-4" />
            <span>Terapi & Obat Pulang</span>
            {isFieldMissing('Terapi') && (
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('discharge')}
            className={`px-4 py-2.5 font-bold rounded-t-xl transition-colors flex items-center gap-2 cursor-pointer ${
              activeTab === 'discharge'
                ? 'border-b-2 border-blue-600 text-blue-600 bg-blue-50/50'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <HeartPulse className="w-4 h-4" />
            <span>Kondisi & Instruksi Pulang</span>
            {(isFieldMissing('Instruksi') || isFieldMissing('Jadwal Kontrol')) && (
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            )}
          </button>
        </div>

        {/* Tab 1: Diagnosis & Penunjang */}
        {activeTab === 'diagnosis' && (
          <div className="space-y-4">
            {/* Diagnosis Matching Validation Card */}
            <div className={`p-4 rounded-2xl border-2 space-y-3 transition-colors ${
              resume.isDiagnosisMatched
                ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
                : 'bg-rose-50 border-rose-300 text-rose-950'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0 ${
                    resume.isDiagnosisMatched ? 'bg-emerald-600' : 'bg-rose-600'
                  }`}>
                    {resume.isDiagnosisMatched ? '✓' : '!'}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-xs">
                      Validasi & Pencocokan Diagnosis dengan Dokumen Verifikasi (ICD-10)
                    </h4>
                    <p className="text-[11px] text-slate-600">
                      Diagnosis yang ditampilkan pada Resume Medis DPJP harus sesuai dengan diagnosis yang telah diverifikasi.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-extrabold flex items-center gap-1.5 ${
                    resume.isDiagnosisMatched
                      ? 'bg-emerald-200/80 text-emerald-900'
                      : 'bg-rose-200 text-rose-900'
                  }`}>
                    {resume.isDiagnosisMatched ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                    {resume.isDiagnosisMatched ? 'Terverifikasi & Sesuai' : '⚠️ Perbedaan Diagnosis'}
                  </span>

                  {!resume.isDiagnosisMatched && !isLocked && (
                    <button
                      type="button"
                      onClick={handleSyncDiagnosis}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Sinkronkan Sesuai Verifikasi</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Discrepancy Note text */}
              {resume.diagnosisDiscrepancyNotes && (
                <div className={`p-2.5 rounded-xl text-xs font-medium border ${
                  resume.isDiagnosisMatched
                    ? 'bg-emerald-100/60 border-emerald-300 text-emerald-900'
                    : 'bg-rose-100/80 border-rose-300 text-rose-900'
                }`}>
                  {resume.diagnosisDiscrepancyNotes}
                </div>
              )}

              {/* Side-by-Side Comparison */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                <div className="p-3 bg-white border border-slate-300 rounded-xl space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                      Diagnosis Formulir DPJP
                    </span>
                    {!resume.isDiagnosisMatched && (
                      <span className="text-[10px] text-rose-700 font-bold">⚠️ Perlu Diperbaiki</span>
                    )}
                  </div>
                  <input
                    type="text"
                    disabled={isLocked}
                    value={formData.primaryDiagnosisForm || ''}
                    onChange={(e) => handleInputChange('primaryDiagnosisForm', e.target.value)}
                    className="w-full px-3 py-2 text-xs font-bold rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
                    placeholder="Diagnosis formulir DPJP..."
                  />
                  <p className="text-[10px] text-slate-500">Teks diagnosis yang dicatat pada lembar rekam medis / formulir awal.</p>
                </div>

                <div className="p-3 bg-white border border-emerald-300 rounded-xl space-y-1.5 bg-emerald-50/20">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      Dokumen Verifikasi Diagnosis Koding (ICD-10)
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-md font-bold bg-emerald-100 text-emerald-800">
                      Standar KARS
                    </span>
                  </div>
                  <div className="px-3 py-2 text-xs font-bold text-slate-800 bg-white border border-emerald-300 rounded-lg">
                    {resume.primaryDiagnosisVerified || 'Belum Ada Dokumen Koding'}
                  </div>
                  <p className="text-[10px] text-slate-500">Hasil verifikasi koder / rekam medis sesuai regulasi terminologi ICD-10.</p>
                </div>
              </div>
            </div>

            {/* Matched INA-CBG Pedoman Guidelines */}
            {matchedPedomanRules.length > 0 && (
              <div className="p-3.5 bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 border border-emerald-300 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold text-emerald-950 flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-emerald-700" />
                    <span>Pedoman Verifikasi Klaim INA-CBG Edisi 2 untuk Kasus Ini</span>
                  </h4>
                  <button
                    type="button"
                    onClick={() => setIsPedomanModalOpen(true)}
                    className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Buka Panduan Lengkap ({matchedPedomanRules.length} Aturan)</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>

                <div className="space-y-2">
                  {matchedPedomanRules.map((rule) => (
                    <div key={rule.id} className="p-2.5 bg-white border border-emerald-200 rounded-xl text-xs space-y-1 shadow-2xs">
                      <div className="flex items-center justify-between">
                        <strong className="text-slate-800 font-extrabold flex items-center gap-1.5">
                          <span className="w-5 h-5 rounded-md bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-[10px]">
                            #{rule.id}
                          </span>
                          <span>{rule.diagnosaTitle}</span>
                        </strong>
                        <span className="text-[10px] px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md font-bold">
                          {rule.chapter}
                        </span>
                      </div>
                      {rule.aspekKoding && (
                        <p className="text-slate-700 text-[11px] leading-relaxed">
                          <strong>Kaidah Koding:</strong> {rule.aspekKoding}
                        </p>
                      )}
                      {rule.aspekMedis && (
                        <p className="text-slate-700 text-[11px] leading-relaxed">
                          <strong>Kriteria Klinis:</strong> {rule.aspekMedis}
                        </p>
                      )}
                      {rule.perhatianKhusus && rule.perhatianKhusus !== '-' && (
                        <p className="text-amber-900 text-[10px] font-medium bg-amber-50 p-1.5 rounded-lg border border-amber-200">
                          ⚠️ <strong>Perhatian Verifikator:</strong> {rule.perhatianKhusus}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Diagnosis Masuk & Sekunder */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <span>Diagnosis Masuk (Admission Diagnosis):</span>
                  {isFieldMissing('Diagnosis Masuk') && (
                    <span className="text-[10px] text-rose-600 font-bold">⚠️ Belum Lengkap</span>
                  )}
                </label>
                <input
                  type="text"
                  disabled={isLocked}
                  value={formData.admissionDiagnosis || ''}
                  onChange={(e) => handleInputChange('admissionDiagnosis', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  placeholder="Diagnosis saat pasien pertama masuk..."
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Diagnosis Sekunder / Komorbiditas:</label>
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
                  {resume.secondaryDiagnoses && resume.secondaryDiagnoses.length > 0 ? (
                    resume.secondaryDiagnoses.map((sec, i) => (
                      <div key={i} className="flex items-center gap-1.5 font-medium text-slate-800">
                        <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-600 text-[10px] font-bold flex items-center justify-center">{i + 1}</span>
                        <span>{sec}</span>
                      </div>
                    ))
                  ) : (
                    <span className="text-slate-400 italic">Tidak ada diagnosis sekunder.</span>
                  )}
                </div>
              </div>
            </div>

            {/* Tindakan & Prosedur (ICD-9-CM) */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                <span>Tindakan / Prosedur Medis Selama Dirawat (ICD-9-CM):</span>
                <span className="text-[10px] text-slate-500 font-normal italic">Ditarik otomatis dari form koding & CPPT</span>
              </label>
              <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                    <tr>
                      <th className="p-2.5 w-10 text-center">No</th>
                      <th className="p-2.5">Nama Prosedur / Tindakan</th>
                      <th className="p-2.5 w-32 text-center">Kode ICD-9-CM</th>
                      <th className="p-2.5 w-28 text-center">Tanggal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {procedures.map((proc, i) => (
                      <tr key={i} className="hover:bg-slate-50/50">
                        <td className="p-2.5 text-center font-bold text-slate-500">{i + 1}</td>
                        <td className="p-2.5 font-medium text-slate-800">{proc.name}</td>
                        <td className="p-2.5 text-center font-mono font-bold text-blue-600">{proc.code || '-'}</td>
                        <td className="p-2.5 text-center text-slate-500">{proc.date || resume.dischargeDate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Penunjang (Lab & Radiologi) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Ringkasan Hasil Laboratorium:</label>
                <textarea
                  rows={3}
                  disabled={isLocked}
                  value={formData.labResultsSummary || ''}
                  onChange={(e) => handleInputChange('labResultsSummary', e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  placeholder="Hasil lab darah lengkap, kimia darah, profil lipid..."
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Ringkasan Hasil Radiologi & Penunjang Lain:</label>
                <textarea
                  rows={3}
                  disabled={isLocked}
                  value={formData.radiologySummary || ''}
                  onChange={(e) => handleInputChange('radiologySummary', e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  placeholder="Hasil EKG, Foto Thorax, USG, CT Scan..."
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Riwayat & Pemeriksaan Fisik */}
        {activeTab === 'clinical' && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                <span>Keluhan Utama Saat Masuk:</span>
                {isFieldMissing('Keluhan Utama') && (
                  <span className="text-[10px] text-rose-600 font-bold">⚠️ Belum Lengkap</span>
                )}
              </label>
              <textarea
                rows={2}
                disabled={isLocked}
                value={formData.chiefComplaint || ''}
                onChange={(e) => handleInputChange('chiefComplaint', e.target.value)}
                className="w-full p-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                placeholder="Keluhan utama saat pasien masuk rumah sakit..."
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                <span>Riwayat Perjalanan Penyakit (Anamnesis Ringkas):</span>
                {isFieldMissing('Perjalanan Penyakit') && (
                  <span className="text-[10px] text-rose-600 font-bold">⚠️ Belum Lengkap</span>
                )}
              </label>
              <textarea
                rows={4}
                disabled={isLocked}
                value={formData.historyOfPresentIllness || ''}
                onChange={(e) => handleInputChange('historyOfPresentIllness', e.target.value)}
                className="w-full p-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                placeholder="Perjalanan penyakit dan perkembangan kondisi klinis selama perawatan..."
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Riwayat Penyakit Dahulu & Riwayat Alergi:</label>
              <input
                type="text"
                disabled={isLocked}
                value={formData.pastMedicalHistory || ''}
                onChange={(e) => handleInputChange('pastMedicalHistory', e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                placeholder="Riwayat penyakit kronis, riwayat operasi, atau alergi obat/makanan..."
              />
            </div>

            {/* Vital Signs Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-blue-600" />
                  <span>Tanda Vital Saat Masuk (Admission)</span>
                </h4>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 block">TD:</span>
                    <span className="font-bold">{resume.vitalSignsAdmission?.td || '120/80'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Nadi:</span>
                    <span className="font-bold">{resume.vitalSignsAdmission?.nadi || '80 x/m'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">RR:</span>
                    <span className="font-bold">{resume.vitalSignsAdmission?.rr || '18 x/m'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Suhu:</span>
                    <span className="font-bold">{resume.vitalSignsAdmission?.suhu || '36.6 C'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">SpO2:</span>
                    <span className="font-bold">{resume.vitalSignsAdmission?.spo2 || '98%'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Kesadaran:</span>
                    <span className="font-bold truncate">{resume.vitalSignsAdmission?.kesadaran || 'Compos Mentis'}</span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-emerald-50/50 border border-emerald-200 rounded-xl space-y-2">
                <h4 className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Tanda Vital Saat Pulang (Discharge)</span>
                </h4>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 block">TD:</span>
                    <span className="font-bold text-emerald-950">{resume.vitalSignsDischarge?.td || '120/80'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Nadi:</span>
                    <span className="font-bold text-emerald-950">{resume.vitalSignsDischarge?.nadi || '76 x/m'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">RR:</span>
                    <span className="font-bold text-emerald-950">{resume.vitalSignsDischarge?.rr || '18 x/m'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Suhu:</span>
                    <span className="font-bold text-emerald-950">{resume.vitalSignsDischarge?.suhu || '36.5 C'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">SpO2:</span>
                    <span className="font-bold text-emerald-950">{resume.vitalSignsDischarge?.spo2 || '99%'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Kesadaran:</span>
                    <span className="font-bold text-emerald-950 truncate">{resume.vitalSignsDischarge?.kesadaran || 'Compos Mentis'}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Pemeriksaan Fisik Terakhir / Saat Pulang:</label>
              <textarea
                rows={3}
                disabled={isLocked}
                value={formData.physicalExamSummary || ''}
                onChange={(e) => handleInputChange('physicalExamSummary', e.target.value)}
                className="w-full p-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                placeholder="Pemeriksaan fisik saat pulang (Cor, pulmo, abdomen, ekstremitas)..."
              />
            </div>
          </div>
        )}

        {/* Tab 3: Terapi & Obat Pulang */}
        {activeTab === 'therapy' && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Terapi / Pengobatan Selama Rawat Inap:</label>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
                {resume.therapyDuringHospitalization && resume.therapyDuringHospitalization.length > 0 ? (
                  resume.therapyDuringHospitalization.map((t, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-slate-800">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                      <span>{t}</span>
                    </div>
                  ))
                ) : (
                  <span className="text-slate-400 italic">Tidak ada catatan terapi parenteral khusus.</span>
                )}
              </div>
            </div>

            {/* Home Medications Table */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <span>Daftar Obat yang Dibawa Pulang (Home Medications):</span>
                  {isFieldMissing('Terapi') && (
                    <span className="text-[10px] text-rose-600 font-bold">⚠️ Wajib Diisi</span>
                  )}
                </label>
                <span className="text-[10px] text-slate-500">{homeMeds.length} Obat Terdaftar</span>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                    <tr>
                      <th className="p-2.5 w-8 text-center">No</th>
                      <th className="p-2.5">Nama Obat</th>
                      <th className="p-2.5 w-24">Dosis</th>
                      <th className="p-2.5 w-32">Frekuensi</th>
                      <th className="p-2.5 w-24">Rute</th>
                      <th className="p-2.5">Petunjuk Minum / Keterangan</th>
                      {!isLocked && <th className="p-2.5 w-12 text-center">Aksi</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {homeMeds.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-4 text-center text-slate-400 italic">
                          Belum ada obat pulang. Silakan tambahkan obat yang harus dilanjutkan pasien.
                        </td>
                      </tr>
                    ) : (
                      homeMeds.map((med, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="p-2.5 text-center font-bold text-slate-500">{idx + 1}</td>
                          <td className="p-2.5 font-bold text-slate-800">{med.drugName}</td>
                          <td className="p-2.5 text-slate-700">{med.dose}</td>
                          <td className="p-2.5 text-slate-700">{med.frequency}</td>
                          <td className="p-2.5 text-slate-600">{med.route || 'Oral'}</td>
                          <td className="p-2.5 text-slate-600">{med.instructions}</td>
                          {!isLocked && (
                            <td className="p-2.5 text-center">
                              <button
                                type="button"
                                onClick={() => handleRemoveMedication(idx)}
                                className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          )}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Add Medicine Mini-form */}
              {!isLocked && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <span className="text-[11px] font-bold text-slate-700 block">Tambah Obat Pulang Baru:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-xs">
                    <input
                      type="text"
                      placeholder="Nama Obat..."
                      value={newMed.drugName}
                      onChange={(e) => setNewMed({ ...newMed, drugName: e.target.value })}
                      className="px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white sm:col-span-2"
                    />
                    <input
                      type="text"
                      placeholder="Dosis (mis. 500mg)"
                      value={newMed.dose}
                      onChange={(e) => setNewMed({ ...newMed, dose: e.target.value })}
                      className="px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
                    />
                    <input
                      type="text"
                      placeholder="Frekuensi (mis. 3x1)"
                      value={newMed.frequency}
                      onChange={(e) => setNewMed({ ...newMed, frequency: e.target.value })}
                      className="px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
                    />
                    <button
                      type="button"
                      onClick={handleAddMedication}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg flex items-center justify-center gap-1 cursor-pointer transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Tambah</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 4: Kondisi & Instruksi Pulang */}
        {activeTab === 'discharge' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>Kondisi Pasien Saat Pulang:</span>
                  {isFieldMissing('Kondisi Pasien') && (
                    <span className="text-[10px] text-rose-600 font-bold">⚠️ Belum Lengkap</span>
                  )}
                </label>
                <select
                  disabled={isLocked}
                  value={formData.dischargeCondition || 'Membaik'}
                  onChange={(e) => handleInputChange('dischargeCondition', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="Sembuh">Sembuh</option>
                  <option value="Membaik">Membaik</option>
                  <option value="Perbaikan Klinis">Perbaikan Klinis</option>
                  <option value="Belum Sembuh">Belum Sembuh</option>
                  <option value="Meninggal < 48 Jam">Meninggal &lt; 48 Jam</option>
                  <option value="Meninggal >= 48 Jam">Meninggal &gt;= 48 Jam</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>Cara Keluar / Alasan Pulang:</span>
                  {isFieldMissing('Cara / Alasan') && (
                    <span className="text-[10px] text-rose-600 font-bold">⚠️ Belum Lengkap</span>
                  )}
                </label>
                <select
                  disabled={isLocked}
                  value={formData.dischargeType || 'Persetujuan Dokter'}
                  onChange={(e) => handleInputChange('dischargeType', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="Persetujuan Dokter">Persetujuan Dokter (Izin Pulang)</option>
                  <option value="Pulang Paksa (APS)">Pulang Paksa (Atas Permintaan Sendiri / APS)</option>
                  <option value="Rujuk ke RS Lain">Rujuk ke RS Lain</option>
                  <option value="Meninggal Dunia">Meninggal Dunia</option>
                  <option value="Melarikan Diri">Melarikan Diri</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                <span>Instruksi & Edukasi Pulang:</span>
                {isFieldMissing('Instruksi') && (
                  <span className="text-[10px] text-rose-600 font-bold">⚠️ Belum Lengkap</span>
                )}
              </label>
              <textarea
                rows={3}
                disabled={isLocked}
                value={formData.dischargeInstructions || ''}
                onChange={(e) => handleInputChange('dischargeInstructions', e.target.value)}
                className="w-full p-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                placeholder="Petunjuk minum obat, pembatasan aktivitas, edukasi gizi dan gaya hidup..."
              />
            </div>

            {/* Jadwal Kontrol */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <span>Rencana Tindak Lanjut & Jadwal Kontrol Poliklinik</span>
                </h4>
                {isFieldMissing('Jadwal Kontrol') && (
                  <span className="text-[10px] text-rose-600 font-bold">⚠️ Wajib Ditentukan</span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">Tanggal Kontrol:</label>
                  <input
                    type="date"
                    disabled={isLocked}
                    value={formData.followUpPlan?.controlDate || ''}
                    onChange={(e) => handleFollowUpChange('controlDate', e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">Poliklinik Tujuan:</label>
                  <input
                    type="text"
                    disabled={isLocked}
                    value={formData.followUpPlan?.controlPoli || ''}
                    onChange={(e) => handleFollowUpChange('controlPoli', e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white"
                    placeholder="Poli Penyakit Dalam / Jantung..."
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">Dokter Pemeriksa:</label>
                  <input
                    type="text"
                    disabled={isLocked}
                    value={formData.followUpPlan?.controlDoctor || ''}
                    onChange={(e) => handleFollowUpChange('controlDoctor', e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white"
                    placeholder="Nama DPJP..."
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-rose-800 block mb-1">
                  Tanda Bahaya (Kapan Pasien Harus Segera Kembali ke IGD):
                </label>
                <input
                  type="text"
                  disabled={isLocked}
                  value={formData.followUpPlan?.emergencyWarningSigns || ''}
                  onChange={(e) => handleFollowUpChange('emergencyWarningSigns', e.target.value)}
                  className="w-full px-3 py-1.5 border border-rose-200 rounded-lg bg-white text-rose-900"
                  placeholder="Gejala darurat seperti sesak nafas mendadak, nyeri dada hebat, demam tinggi..."
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Anjuran Diet & Nutrisi:</label>
                <input
                  type="text"
                  disabled={isLocked}
                  value={formData.dietRecommendation || ''}
                  onChange={(e) => handleInputChange('dietRecommendation', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  placeholder="Diet rendah garam, rendah lemak, dll..."
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Rekomendasi Aktivitas Fisik:</label>
                <input
                  type="text"
                  disabled={isLocked}
                  value={formData.activityRecommendation || ''}
                  onChange={(e) => handleInputChange('activityRecommendation', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  placeholder="Istirahat cukup, jalan santai mandiri..."
                />
              </div>
            </div>
          </div>
        )}

        {/* Modal Footer Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>DPJP: <strong>{resume.doctorName || 'dr. DPJP'}</strong></span>
            {isFinal && (
              <span className="font-bold text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Difinalisasi pada: {resume.finalizedAt}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Tutup
            </button>

            {!isLocked && (
              <button
                type="button"
                onClick={handleSave}
                className="px-4 py-2 text-xs font-bold rounded-xl border border-blue-300 bg-blue-50 hover:bg-blue-100 text-blue-700 flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Simpan Perubahan</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => onOpenPrint(resume)}
              className="px-4 py-2 text-xs font-bold rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-800 flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5 text-blue-600" />
              <span>Cetak Resume (A4)</span>
            </button>

            {!isFinal && (
              <button
                type="button"
                onClick={() => onOpenFinalizeConfirm(resume)}
                disabled={!canFinalize || !isEditable}
                title={
                  !canFinalize
                    ? 'Resume Medis belum lengkap atau diagnosis belum sesuai verifikasi koding'
                    : 'Finalisasi Dokumen Resume Medis'
                }
                className={`px-4 py-2 text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition-all ${
                  canFinalize && isEditable
                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-500/25 cursor-pointer'
                    : 'bg-slate-200 text-slate-400 border border-slate-300 cursor-not-allowed'
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Finalisasi Resume Medis</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {isPedomanModalOpen && (
        <PedomanInaCbgModal
          isOpen={isPedomanModalOpen}
          onClose={() => setIsPedomanModalOpen(false)}
          initialSearch={formData.primaryDiagnosisForm || resume.primaryDiagnosisForm || ''}
          onSelectPedomanRule={(rule) => {
            if (rule.diagnosaTitle) {
              Swal.fire({
                icon: 'info',
                title: rule.diagnosaTitle,
                html: `<div class="text-left text-xs space-y-2">
                  <p><strong>Bab:</strong> ${rule.chapter}</p>
                  ${rule.aspekKoding ? `<p><strong>Kaidah Koding:</strong> ${rule.aspekKoding}</p>` : ''}
                  ${rule.aspekMedis ? `<p><strong>Kriteria Medis:</strong> ${rule.aspekMedis}</p>` : ''}
                  ${rule.perhatianKhusus ? `<p class="text-amber-800"><strong>Catatan Verifikasi:</strong> ${rule.perhatianKhusus}</p>` : ''}
                </div>`,
                confirmButtonColor: '#2563eb'
              });
            }
          }}
        />
      )}
    </Modal>
  );
};
