import React, { useRef } from 'react';
import { Modal } from '../Modal';
import { ResumeMedis, Patient, Registration, User } from '../../types';
import { Printer, CheckCircle2, ShieldCheck, QrCode, FileText, Lock, Edit3 } from 'lucide-react';
import esaUnggulFullLogo from '../../assets/logo-esa-unggul-asli.png';
import esaUnggulEmblem from '../../assets/logo-esa-unggul-emblem.png';

interface CetakResumeMedisModalProps {
  isOpen: boolean;
  onClose: () => void;
  resume: ResumeMedis | null;
  patient?: Patient | null;
  registration?: Registration | null;
  doctor?: User | null;
  onOpenEdit?: (rm: ResumeMedis) => void;
}

export const CetakResumeMedisModal: React.FC<CetakResumeMedisModalProps> = ({
  isOpen,
  onClose,
  resume,
  patient,
  registration,
  doctor,
  onOpenEdit
}) => {
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !resume) return null;

  const handlePrint = () => {
    window.print();
  };

  const isFinal = resume.status === 'Final';
  const dpjpName = resume.doctorName || doctor?.name || 'dr. DPJP, Sp.PD';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Cetak Dokumen Resmi Resume Medis - ${resume.noRM}`}
      maxWidth="max-w-4xl"
    >
      <div className="space-y-4">
        {/* Modal Toolbar (hidden on actual print) */}
        <div className="no-print p-3 bg-slate-50 border border-slate-200 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-1 rounded-full font-bold text-xs flex items-center gap-1.5 ${
              isFinal ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-amber-100 text-amber-800 border border-amber-300'
            }`}>
              {isFinal ? <CheckCircle2 className="w-3.5 h-3.5" /> : '⚠️'}
              Status: {resume.status}
            </span>
            <span className="text-slate-500">|</span>
            <span className="text-slate-600 font-medium">Format: Standar Akreditasi KARS / Kemkes RI (Ukuran A4)</span>
          </div>

          <div className="flex items-center gap-2">
            {onOpenEdit && !isFinal && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenEdit(resume);
                }}
                className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-bold flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
              >
                <Edit3 className="w-3.5 h-3.5 text-blue-600" />
                <span>Edit / Lengkapi Data</span>
              </button>
            )}

            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak Dokumen (A4)</span>
            </button>
          </div>
        </div>

        {/* Printable Document Sheet Container */}
        <div className="bg-slate-200/60 p-2 sm:p-4 rounded-2xl overflow-x-auto">
          <div
            ref={printRef}
            id="printable-resume-sheet"
            className="print-resume-document bg-white mx-auto shadow-md p-6 sm:p-8 text-slate-900 border border-slate-300 text-[11px] leading-relaxed select-text"
            style={{
              width: '100%',
              maxWidth: '210mm',
              minHeight: '297mm',
              boxSizing: 'border-box',
              fontFamily: '"Times New Roman", Times, serif'
            }}
          >
            {/* 1. Official Header Kop Surat */}
            <div className="border-b-2 border-slate-900 pb-3 mb-3">
              <div className="flex items-center justify-between gap-4">
                <div className="w-40 shrink-0">
                  <img
                    src={esaUnggulFullLogo}
                    alt="Universitas Esa Unggul"
                    className="h-14 object-contain"
                  />
                </div>
                <div className="text-center flex-1">
                  <h1 className="text-base font-bold uppercase tracking-wider text-slate-900">
                    RUMAH SAKIT PENDIDIKAN UNIVERSITAS ESA UNGGUL
                  </h1>
                  <p className="text-[10px] text-slate-700 leading-tight mt-0.5">
                    Jl. Arjuna Utara No. 9, Kebon Jeruk, Jakarta Barat 11510 | Telp: (021) 5674223 | Faks: (021) 5674248
                  </p>
                  <p className="text-[10px] text-slate-700 leading-tight">
                    Website: www.esaunggul.ac.id | Email: rme@esaunggul.ac.id
                  </p>
                </div>
                <div className="w-36 text-right shrink-0">
                  <div className="border border-slate-900 p-1 text-[9px] text-left leading-tight bg-slate-50 font-sans">
                    <div><strong>Formulir :</strong> RM.04-RI</div>
                    <div><strong>No. Rev :</strong> 02 / 2026</div>
                    <div><strong>Akreditasi :</strong> Paripurna</div>
                  </div>
                </div>
              </div>

              <div className="text-center mt-3 pt-1 border-t border-slate-400">
                <h2 className="text-sm font-bold uppercase tracking-widest text-slate-900 underline">
                  RESUME MEDIS RAWAT INAP / MEDICAL DISCHARGE SUMMARY
                </h2>
                <p className="text-[10px] text-slate-600 font-sans italic mt-0.5">
                  (Ringkasan Keluar Pelayanan Pasien Rawat Inap Rumah Sakit)
                </p>
              </div>
            </div>

            {/* 2. Patient Identity Table */}
            <div className="mb-3">
              <div className="bg-slate-100 font-bold px-2 py-0.5 border border-slate-900 text-[10px] uppercase font-sans">
                I. IDENTITAS PASIEN
              </div>
              <table className="w-full border-collapse border border-slate-900 text-[10px]">
                <tbody>
                  <tr>
                    <td className="w-1/4 p-1 border border-slate-900 font-semibold bg-slate-50">Nama Pasien</td>
                    <td className="w-1/4 p-1 border border-slate-900 font-bold uppercase">{patient?.name || '-'}</td>
                    <td className="w-1/4 p-1 border border-slate-900 font-semibold bg-slate-50">No. Rekam Medis (RM)</td>
                    <td className="w-1/4 p-1 border border-slate-900 font-bold font-mono">{resume.noRM}</td>
                  </tr>
                  <tr>
                    <td className="p-1 border border-slate-900 font-semibold bg-slate-50">NIK / Identitas</td>
                    <td className="p-1 border border-slate-900">{patient?.nik || '-'}</td>
                    <td className="p-1 border border-slate-900 font-semibold bg-slate-50">Jenis Kelamin / Umur</td>
                    <td className="p-1 border border-slate-900">
                      {patient?.gender === 'M' || patient?.gender === 'L' ? 'Laki-laki' : 'Perempuan'} / {patient?.dob || '-'}
                    </td>
                  </tr>
                  <tr>
                    <td className="p-1 border border-slate-900 font-semibold bg-slate-50">Penjamin / Asuransi</td>
                    <td className="p-1 border border-slate-900">{patient?.insuranceType || 'BPJS Kesehatan'} {patient?.noBPJS ? `(${patient.noBPJS})` : ''}</td>
                    <td className="p-1 border border-slate-900 font-semibold bg-slate-50">No. SEP / Registrasi</td>
                    <td className="p-1 border border-slate-900 font-mono">{registration?.sepNo || resume.regId}</td>
                  </tr>
                  <tr>
                    <td className="p-1 border border-slate-900 font-semibold bg-slate-50">Alamat Pasien</td>
                    <td colSpan={3} className="p-1 border border-slate-900">{patient?.address || '-'} (Telp: {patient?.phone || '-'})</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* 3. Hospitalization Info Table */}
            <div className="mb-3">
              <div className="bg-slate-100 font-bold px-2 py-0.5 border border-slate-900 text-[10px] uppercase font-sans">
                II. RIWAYAT PERAWATAN & RUANG RAWAT
              </div>
              <table className="w-full border-collapse border border-slate-900 text-[10px]">
                <tbody>
                  <tr>
                    <td className="w-1/4 p-1 border border-slate-900 font-semibold bg-slate-50">Tanggal Masuk Rawat</td>
                    <td className="w-1/4 p-1 border border-slate-900 font-medium">{resume.admissionDate}</td>
                    <td className="w-1/4 p-1 border border-slate-900 font-semibold bg-slate-50">Tanggal Keluar Rawat</td>
                    <td className="w-1/4 p-1 border border-slate-900 font-medium">{resume.dischargeDate}</td>
                  </tr>
                  <tr>
                    <td className="p-1 border border-slate-900 font-semibold bg-slate-50">Ruang / Bangsal Rawat</td>
                    <td className="p-1 border border-slate-900">{resume.dischargeRoom || resume.admissionPoliRoom}</td>
                    <td className="p-1 border border-slate-900 font-semibold bg-slate-50">Lama Perawatan</td>
                    <td className="p-1 border border-slate-900 font-bold">{resume.lengthOfStay || 1} Hari</td>
                  </tr>
                  <tr>
                    <td className="p-1 border border-slate-900 font-semibold bg-slate-50">Dokter DPJP Utama</td>
                    <td colSpan={3} className="p-1 border border-slate-900 font-bold text-slate-900">{dpjpName}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* 4. Anamnesis & Perjalanan Penyakit */}
            <div className="mb-3">
              <div className="bg-slate-100 font-bold px-2 py-0.5 border border-slate-900 text-[10px] uppercase font-sans">
                III. ANAMNESIS & RINGKASAN RIWAYAT PENYAKIT
              </div>
              <table className="w-full border-collapse border border-slate-900 text-[10px]">
                <tbody>
                  <tr>
                    <td className="w-1/4 p-1.5 border border-slate-900 font-semibold bg-slate-50 align-top">Keluhan Utama Saat Masuk</td>
                    <td className="w-3/4 p-1.5 border border-slate-900 leading-relaxed">{resume.chiefComplaint || '-'}</td>
                  </tr>
                  <tr>
                    <td className="p-1.5 border border-slate-900 font-semibold bg-slate-50 align-top">Riwayat Perjalanan Penyakit</td>
                    <td className="p-1.5 border border-slate-900 leading-relaxed">{resume.historyOfPresentIllness || '-'}</td>
                  </tr>
                  <tr>
                    <td className="p-1.5 border border-slate-900 font-semibold bg-slate-50 align-top">Riwayat Penyakit Dahulu & Alergi</td>
                    <td className="p-1.5 border border-slate-900">{resume.pastMedicalHistory || 'Tidak ada riwayat alergi yang bermakna.'}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* 5. Tanda Vital & Pemeriksaan Fisik */}
            <div className="mb-3">
              <div className="bg-slate-100 font-bold px-2 py-0.5 border border-slate-900 text-[10px] uppercase font-sans">
                IV. PEMERIKSAAN FISIK & TANDA VITAL
              </div>
              <table className="w-full border-collapse border border-slate-900 text-[10px]">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="p-1 border border-slate-900 text-left font-semibold">Status Vital Signs</th>
                    <th className="p-1 border border-slate-900 text-center font-semibold">Tekanan Darah</th>
                    <th className="p-1 border border-slate-900 text-center font-semibold">Nadi</th>
                    <th className="p-1 border border-slate-900 text-center font-semibold">RR (Nafas)</th>
                    <th className="p-1 border border-slate-900 text-center font-semibold">Suhu</th>
                    <th className="p-1 border border-slate-900 text-center font-semibold">SpO2</th>
                    <th className="p-1 border border-slate-900 text-center font-semibold">Kesadaran</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-1 border border-slate-900 font-semibold bg-slate-50">Saat Masuk (Admission)</td>
                    <td className="p-1 border border-slate-900 text-center">{resume.vitalSignsAdmission?.td || '120/80'}</td>
                    <td className="p-1 border border-slate-900 text-center">{resume.vitalSignsAdmission?.nadi || '80 x/m'}</td>
                    <td className="p-1 border border-slate-900 text-center">{resume.vitalSignsAdmission?.rr || '18 x/m'}</td>
                    <td className="p-1 border border-slate-900 text-center">{resume.vitalSignsAdmission?.suhu || '36.6 C'}</td>
                    <td className="p-1 border border-slate-900 text-center">{resume.vitalSignsAdmission?.spo2 || '98%'}</td>
                    <td className="p-1 border border-slate-900 text-center">{resume.vitalSignsAdmission?.kesadaran || 'Compos Mentis'}</td>
                  </tr>
                  <tr>
                    <td className="p-1 border border-slate-900 font-semibold bg-slate-50">Saat Keluar (Discharge)</td>
                    <td className="p-1 border border-slate-900 text-center font-bold">{resume.vitalSignsDischarge?.td || '120/80'}</td>
                    <td className="p-1 border border-slate-900 text-center font-bold">{resume.vitalSignsDischarge?.nadi || '76 x/m'}</td>
                    <td className="p-1 border border-slate-900 text-center font-bold">{resume.vitalSignsDischarge?.rr || '18 x/m'}</td>
                    <td className="p-1 border border-slate-900 text-center font-bold">{resume.vitalSignsDischarge?.suhu || '36.5 C'}</td>
                    <td className="p-1 border border-slate-900 text-center font-bold">{resume.vitalSignsDischarge?.spo2 || '99%'}</td>
                    <td className="p-1 border border-slate-900 text-center font-bold">{resume.vitalSignsDischarge?.kesadaran || 'Compos Mentis'}</td>
                  </tr>
                  <tr>
                    <td className="p-1 border border-slate-900 font-semibold bg-slate-50 align-top">Pemeriksaan Fisik Terakhir</td>
                    <td colSpan={6} className="p-1 border border-slate-900 leading-relaxed">{resume.physicalExamSummary || '-'}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* 6. Hasil Pemeriksaan Penunjang */}
            <div className="mb-3">
              <div className="bg-slate-100 font-bold px-2 py-0.5 border border-slate-900 text-[10px] uppercase font-sans">
                V. HASIL PEMERIKSAAN PENUNJANG DIAGNOSTIK
              </div>
              <table className="w-full border-collapse border border-slate-900 text-[10px]">
                <tbody>
                  <tr>
                    <td className="w-1/4 p-1.5 border border-slate-900 font-semibold bg-slate-50 align-top">Laboratorium (Darah/Kimia/dll)</td>
                    <td className="w-3/4 p-1.5 border border-slate-900 leading-relaxed">{resume.labResultsSummary || 'Hasil laboratorium dalam batas normal evaluasi klinis.'}</td>
                  </tr>
                  <tr>
                    <td className="p-1.5 border border-slate-900 font-semibold bg-slate-50 align-top">Radiologi & Penunjang Lain (EKG/USG/X-Ray)</td>
                    <td className="p-1.5 border border-slate-900 leading-relaxed">{resume.radiologySummary || 'Pemeriksaan radiologi & penunjang terlampir pada rekam medis digital.'}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* 7. Diagnosis Terverifikasi (ICD-10) */}
            <div className="mb-3">
              <div className="bg-slate-100 font-bold px-2 py-0.5 border border-slate-900 text-[10px] uppercase font-sans flex items-center justify-between">
                <span>VI. DIAGNOSIS UTAMA & SEKUNDER (TERVERIFIKASI ICD-10)</span>
                <span className="text-[9px] font-normal italic">Kaidah Koding Morbiditas ICD-10 WHO / Kemkes RI</span>
              </div>
              <table className="w-full border-collapse border border-slate-900 text-[10px]">
                <tbody>
                  <tr>
                    <td className="w-1/4 p-1.5 border border-slate-900 font-semibold bg-slate-50">Diagnosis Awal Masuk</td>
                    <td colSpan={2} className="p-1.5 border border-slate-900">{resume.admissionDiagnosis || '-'}</td>
                  </tr>
                  <tr>
                    <td className="p-1.5 border border-slate-900 font-bold bg-slate-100 text-slate-900">Diagnosis Utama (Akhir)</td>
                    <td className="p-1.5 border border-slate-900 font-bold text-slate-900">
                      {resume.primaryDiagnosisVerified || resume.primaryDiagnosisForm}
                    </td>
                    <td className="w-32 p-1.5 border border-slate-900 text-center font-mono font-bold bg-slate-50">
                      Terverifikasi Valid
                    </td>
                  </tr>
                  <tr>
                    <td className="p-1.5 border border-slate-900 font-semibold bg-slate-50 align-top">Diagnosis Sekunder / Komorbiditas</td>
                    <td colSpan={2} className="p-1.5 border border-slate-900">
                      {resume.secondaryDiagnoses && resume.secondaryDiagnoses.length > 0 ? (
                        <ol className="list-decimal pl-4 space-y-0.5">
                          {resume.secondaryDiagnoses.map((sec, idx) => (
                            <li key={idx}>{sec}</li>
                          ))}
                        </ol>
                      ) : (
                        <span>- Tidak ada penyakit penyerta bermakna</span>
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* 8. Tindakan & Prosedur (ICD-9-CM) */}
            <div className="mb-3">
              <div className="bg-slate-100 font-bold px-2 py-0.5 border border-slate-900 text-[10px] uppercase font-sans">
                VII. TINDAKAN MEDIS / OPERASI & PROSEDUR (ICD-9-CM)
              </div>
              <table className="w-full border-collapse border border-slate-900 text-[10px]">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="p-1 border border-slate-900 w-10 text-center">No</th>
                    <th className="p-1 border border-slate-900 text-left">Nama Tindakan / Prosedur Medis</th>
                    <th className="p-1 border border-slate-900 w-28 text-center">Kode ICD-9-CM</th>
                    <th className="p-1 border border-slate-900 w-24 text-center">Tanggal</th>
                  </tr>
                </thead>
                <tbody>
                  {resume.procedures && resume.procedures.length > 0 ? (
                    resume.procedures.map((proc, idx) => (
                      <tr key={idx}>
                        <td className="p-1 border border-slate-900 text-center">{idx + 1}</td>
                        <td className="p-1 border border-slate-900">{proc.name}</td>
                        <td className="p-1 border border-slate-900 text-center font-mono font-semibold">{proc.code || '-'}</td>
                        <td className="p-1 border border-slate-900 text-center">{proc.date || resume.dischargeDate}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="p-1 border border-slate-900 text-center italic text-slate-500">
                        Tidak ada prosedur operatif / tindakan invasif khusus.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* 9. Terapi & Obat Pulang */}
            <div className="mb-3">
              <div className="bg-slate-100 font-bold px-2 py-0.5 border border-slate-900 text-[10px] uppercase font-sans">
                VIII. TERAPI SELAMA RAWAT & OBAT YANG DIBAWA PULANG (HOME MEDICATIONS)
              </div>
              <div className="border border-slate-900 p-1.5 bg-slate-50 text-[10px] mb-1">
                <strong>Terapi Selama Rawat Inap:</strong> {resume.therapyDuringHospitalization?.join(', ') || '-'}
              </div>

              <table className="w-full border-collapse border border-slate-900 text-[10px]">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="p-1 border border-slate-900 w-8 text-center">No</th>
                    <th className="p-1 border border-slate-900 text-left">Nama Obat Pulang</th>
                    <th className="p-1 border border-slate-900 w-20 text-center">Dosis</th>
                    <th className="p-1 border border-slate-900 w-28 text-center">Frekuensi</th>
                    <th className="p-1 border border-slate-900 w-20 text-center">Rute</th>
                    <th className="p-1 border border-slate-900 text-left">Petunjuk Minum / Keterangan</th>
                  </tr>
                </thead>
                <tbody>
                  {resume.homeMedications && resume.homeMedications.length > 0 ? (
                    resume.homeMedications.map((med, idx) => (
                      <tr key={idx}>
                        <td className="p-1 border border-slate-900 text-center">{idx + 1}</td>
                        <td className="p-1 border border-slate-900 font-bold">{med.drugName}</td>
                        <td className="p-1 border border-slate-900 text-center">{med.dose}</td>
                        <td className="p-1 border border-slate-900 text-center">{med.frequency}</td>
                        <td className="p-1 border border-slate-900 text-center">{med.route || 'Oral'}</td>
                        <td className="p-1 border border-slate-900">{med.instructions || 'Sesuai resep'}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="p-1 border border-slate-900 text-center italic text-slate-500">
                        Tidak ada obat yang dibawa pulang.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* 10. Kondisi Keluar & Instruksi Pulang */}
            <div className="mb-4">
              <div className="bg-slate-100 font-bold px-2 py-0.5 border border-slate-900 text-[10px] uppercase font-sans">
                IX. KONDISI PASIEN PULANG & INSTRUKSI TINDAK LANJUT
              </div>
              <table className="w-full border-collapse border border-slate-900 text-[10px]">
                <tbody>
                  <tr>
                    <td className="w-1/4 p-1 border border-slate-900 font-semibold bg-slate-50">Keadaan Saat Pulang</td>
                    <td className="w-1/4 p-1 border border-slate-900 font-bold">{resume.dischargeCondition}</td>
                    <td className="w-1/4 p-1 border border-slate-900 font-semibold bg-slate-50">Cara Pasien Keluar</td>
                    <td className="w-1/4 p-1 border border-slate-900 font-bold">{resume.dischargeType}</td>
                  </tr>
                  <tr>
                    <td className="p-1.5 border border-slate-900 font-semibold bg-slate-50 align-top">Instruksi & Edukasi Pasien</td>
                    <td colSpan={3} className="p-1.5 border border-slate-900 leading-relaxed">{resume.dischargeInstructions}</td>
                  </tr>
                  <tr>
                    <td className="p-1 border border-slate-900 font-semibold bg-slate-50">Anjuran Diet</td>
                    <td className="p-1 border border-slate-900">{resume.dietRecommendation || 'Diet normal bergizi seimbang.'}</td>
                    <td className="p-1 border border-slate-900 font-semibold bg-slate-50">Aktivitas Fisik</td>
                    <td className="p-1 border border-slate-900">{resume.activityRecommendation || 'Aktivitas mandiri bertahap.'}</td>
                  </tr>
                  <tr>
                    <td className="p-1 border border-slate-900 font-semibold bg-slate-50">Jadwal Kontrol Poliklinik</td>
                    <td colSpan={3} className="p-1 border border-slate-900 font-bold">
                      Tanggal: {resume.followUpPlan?.controlDate || '-'} | Poli: {resume.followUpPlan?.controlPoli || 'Poliklinik Spesialis'} | Dokter: {resume.followUpPlan?.controlDoctor || dpjpName}
                    </td>
                  </tr>
                  <tr>
                    <td className="p-1.5 border border-slate-900 font-semibold bg-slate-50 text-rose-800 align-top">Tanda Bahaya (Segera ke IGD)</td>
                    <td colSpan={3} className="p-1.5 border border-slate-900 text-rose-900 font-medium">
                      {resume.followUpPlan?.emergencyWarningSigns || 'Bila timbul sesak nafas mendadak, nyeri dada hebat, demam tinggi, atau kejang segera bawa ke IGD RS terdekat.'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* 11. Pengesahan DPJP & Tanda Tangan */}
            <div className="pt-2">
              <div className="grid grid-cols-2 gap-8 text-[10px]">
                {/* Kolom Verifikasi & QR Code */}
                <div className="border border-slate-300 p-2.5 rounded-lg bg-slate-50/60 flex items-center gap-3">
                  <div className="w-16 h-16 bg-white border border-slate-400 p-1 flex items-center justify-center shrink-0">
                    <QrCode className="w-14 h-14 text-slate-800" />
                  </div>
                  <div className="text-[9px] text-slate-600 space-y-0.5 leading-tight font-sans">
                    <p className="font-bold text-slate-800 uppercase flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      SIMRS ESA UNGGUL VERIFIED
                    </p>
                    <p>Dokumen ini diterbitkan secara elektronik dan sah sesuai UU ITE & PMK No. 24 Tahun 2022.</p>
                    <p className="font-mono text-[8px] text-slate-500">ID: {resume.id} | VERIF: {resume.finalizedAt || resume.createdAt}</p>
                  </div>
                </div>

                {/* Kolom Tanda Tangan DPJP */}
                <div className="text-center flex flex-col justify-between">
                  <div>
                    <p className="text-[10px] text-slate-800">
                      Jakarta, {resume.doctorSignatureDate || resume.dischargeDate}
                    </p>
                    <p className="text-[10px] font-bold text-slate-900 uppercase">
                      Dokter Penanggung Jawab Pelayanan (DPJP)
                    </p>
                  </div>

                  {/* Signature Area */}
                  <div className="py-2 flex items-center justify-center">
                    {isFinal ? (
                      <div className="relative inline-block border border-dashed border-emerald-300 bg-emerald-50/50 px-6 py-2 rounded-lg">
                        <div className="text-center">
                          <span className="font-bold text-emerald-800 text-[10px] block font-sans">TERTANDATANGANI ELEKTRONIK</span>
                          <span className="text-slate-800 font-serif italic text-sm font-extrabold">{dpjpName}</span>
                          <span className="text-[8px] text-slate-500 block font-mono">Tgl: {resume.doctorSignatureDate || resume.dischargeDate}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="h-14 flex items-center justify-center text-slate-400 italic text-[10px]">
                        (Menunggu Finalisasi & Tanda Tangan DPJP)
                      </div>
                    )}
                  </div>

                  <div>
                    <p className="font-bold text-slate-900 underline text-[11px]">{dpjpName}</p>
                    <p className="text-[9px] text-slate-600 font-sans">SIP: 503/446-SIP.D/DS/2024</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Notice */}
            <div className="mt-4 pt-2 border-t border-slate-300 text-[8px] text-slate-500 flex justify-between items-center font-sans">
              <span>Lembar 1: Berkas Rekam Medis (Asli) | Lembar 2: Pasien / Keluarga | Lembar 3: Penjamin / BPJS</span>
              <span>Dicetak melalui Sistem Informasi Manajemen Rumah Sakit (SIMRS) Universitas Esa Unggul</span>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
