import React, { useRef } from 'react';
import { Modal } from './Modal';
import { Patient, Registration, User } from '../types';
import {
  Printer, ShieldAlert, FileText, CheckCircle2, Clock, UserCheck,
  Building2, MapPin, QrCode, HeartPulse, Tag, ArrowRight
} from 'lucide-react';
import Swal from 'sweetalert2';

interface TracerIgdModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient | null;
  registration: Registration | null;
  doctor?: User | null;
}

export const TracerIgdModal: React.FC<TracerIgdModalProps> = ({
  isOpen,
  onClose,
  patient,
  registration,
  doctor
}) => {
  const printRef = useRef<HTMLDivElement | null>(null);

  if (!patient || !registration) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleConfirmReceived = () => {
    Swal.fire({
      icon: 'success',
      title: 'Berkas RM IGD Diterima!',
      text: `Tracer berkas No. RM ${patient.noRM} terkonfirmasi diterima oleh Perawat Jaga IGD.`,
      timer: 1800,
      showConfirmButton: false
    });
    onClose();
  };

  const currentTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Tracer Rekam Medis IGD (Outguide Pelacakan Berkas)"
    >
      <div className="space-y-4 text-slate-800">
        {/* Printable Tracer Area */}
        <div
          ref={printRef}
          className="p-5 bg-white border-2 border-sky-300 rounded-2xl space-y-4 shadow-sm text-slate-800 font-sans print:border-sky-300 print:p-0"
        >
          {/* Header Banner */}
          <div className="border-b-2 border-sky-300 pb-3 flex items-start justify-between">
            <div>
              <div className="text-[10px] font-extrabold uppercase tracking-widest text-sky-700">
                SIMRS 3.0 &bull; UNIVERSITAS ESA UNGGUL
              </div>
              <h2 className="text-base font-black tracking-tight text-slate-800 flex items-center gap-1.5">
                <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />
                TRACER REKAM MEDIS PASIEN IGD
              </h2>
              <p className="text-[11px] font-medium text-slate-600">
                Lembar Pengganti / Outguide Pelacakan Berkas RM di Ruang Storage Filing
              </p>
            </div>
            <div className="text-right shrink-0">
              <span className="px-2.5 py-1 bg-rose-600 text-white font-black text-xs rounded-lg uppercase tracking-wider inline-block">
                PRIORITAS IGD
              </span>
              <div className="text-[10px] font-mono font-bold text-slate-500 mt-1">
                {registration.date} {currentTime} WIB
              </div>
            </div>
          </div>

          {/* Large NO. RM & Barcode Box */}
          <div className="bg-sky-50/80 p-3.5 rounded-xl border border-sky-200 flex items-center justify-between">
            <div>
              <div className="text-[10px] font-bold text-sky-800 uppercase">NO. REKAM MEDIS (RM)</div>
              <div className="text-2xl font-black font-mono text-blue-700 tracking-wider">
                {patient.noRM}
              </div>
              <div className="text-[11px] font-bold text-slate-700">
                No. Reg: <span className="font-mono text-blue-700">{registration.id}</span>
              </div>
            </div>

            {/* Visual Barcode Simulation */}
            <div className="text-right flex flex-col items-end">
              <div className="bg-white p-1.5 border border-sky-200 rounded-lg flex items-center justify-center">
                <QrCode className="w-10 h-10 text-blue-600" />
              </div>
              <div className="text-[9px] font-mono font-bold tracking-widest text-slate-600 mt-1">
                *{patient.noRM}*
              </div>
            </div>
          </div>

          {/* Patient Details Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs border-b border-slate-200 pb-3">
            <div>
              <span className="text-[10px] text-slate-500 font-bold block">NAMA PASIEN:</span>
              <strong className="text-sm font-extrabold text-slate-900">{patient.name}</strong>
            </div>

            <div>
              <span className="text-[10px] text-slate-500 font-bold block">JENIS KELAMIN / UMUR:</span>
              <strong className="font-bold text-slate-800">
                {patient.gender === 'M' ? 'Laki-Laki (L)' : 'Perempuan (P)'} &bull; {patient.dob}
              </strong>
            </div>

            <div>
              <span className="text-[10px] text-slate-500 font-bold block">NIK / NO. KTP:</span>
              <span className="font-mono font-bold text-slate-800">{patient.nik}</span>
            </div>

            <div>
              <span className="text-[10px] text-slate-500 font-bold block">PENJAMIN / PEMBAYARAN:</span>
              <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block">
                {patient.insuranceType} {patient.noBPJS !== '-' ? `(${patient.noBPJS})` : ''}
              </span>
            </div>
          </div>

          {/* RINGKASAN REKAM MEDIS SOAP (IGD EMERGENCY ASSESSMENT) */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-300 space-y-2 text-xs">
            <div className="flex items-center justify-between font-extrabold text-blue-900 border-b border-slate-200 pb-1.5">
              <span className="flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-blue-600" /> RINGKASAN PENGKAJIAN REKAM MEDIS (SOAP) IGD
              </span>
              <span className="text-[10px] font-mono text-blue-700 bg-blue-100 px-2 py-0.5 rounded border border-blue-200">
                Format SOAP Murni
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-slate-800">
              <div className="bg-white p-2 rounded-lg border border-slate-200 space-y-0.5">
                <span className="text-[10px] font-extrabold text-blue-800 block">S - SUBJEKTIF (Anamnesis / Keluhan Utama):</span>
                <p className="text-[11px] leading-snug font-medium text-slate-700">
                  Pasien datang ke IGD dengan keluhan nyeri dada kiri terasa tertindih beban berat, pusing, dan lemas sejak 2 jam SBRS.
                </p>
              </div>

              <div className="bg-white p-2 rounded-lg border border-slate-200 space-y-0.5">
                <span className="text-[10px] font-extrabold text-blue-800 block">O - OBJEKTIF (Pemeriksaan Fisik & Tanda Vital):</span>
                <p className="text-[11px] leading-snug font-medium text-slate-700">
                  GCS E4V5M6 (Compos Mentis). TD: 140/90 mmHg, HR: 88x/mnt, RR: 20x/mnt, Suhu: 36.7°C, SpO2: 98% room air.
                </p>
              </div>

              <div className="bg-white p-2 rounded-lg border border-slate-200 space-y-0.5">
                <span className="text-[10px] font-extrabold text-blue-800 block">A - ASESMEN (Diagnosa Kerja / Masalah Medis):</span>
                <p className="text-[11px] leading-snug font-semibold text-rose-900">
                  Observation Chest Pain e.c. Suspect Suspect ACS / Angina Pektoris Unstable + Hipertensi Grade I
                </p>
              </div>

              <div className="bg-white p-2 rounded-lg border border-slate-200 space-y-0.5">
                <span className="text-[10px] font-extrabold text-blue-800 block">P - PLAN (Penatalaksanaan & Instruksi DPJP):</span>
                <p className="text-[11px] leading-snug font-medium text-slate-700">
                  O2 nasal kanul 3 Lpm, IVFD RL 20 tpm, Cek EKG 12 Lead, Cek Lab Troponin I & Rutin, Inj. Ranitidin 1 amp IV.
                </p>
              </div>
            </div>
          </div>

          {/* Routing & DPJP Info */}
          <div className="bg-rose-50/70 p-3 rounded-xl border border-rose-200 space-y-2 text-xs">
            <div className="flex items-center justify-between font-bold text-rose-900 border-b border-rose-200 pb-1">
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4 text-rose-600" /> ALUR TRACER BERKAS REKAM MEDIS
              </span>
              <span className="text-[10px] font-mono text-rose-700 bg-white px-2 py-0.5 rounded border border-rose-200">
                EMERGENCY ROUTE
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white p-2 rounded-lg border border-rose-200">
                <div className="text-[10px] font-bold text-slate-500">RUANG ASAL (FILLING):</div>
                <div className="font-extrabold text-slate-800">Storage Depo Rekam Medis Utama</div>
              </div>

              <div className="bg-white p-2 rounded-lg border border-rose-200">
                <div className="text-[10px] font-bold text-slate-500">UNIT TUJUAN TRACER:</div>
                <div className="font-extrabold text-rose-800">INSTALASI GAWAT DARURAT (IGD)</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-slate-700 pt-1">
              <div>
                <span className="text-[10px] font-bold text-slate-500 block">DOKTER DPJP / TRIAGE:</span>
                <strong className="text-slate-800">{doctor?.name || 'dr. Sari Dewi, Sp.PD'}</strong>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-500 block">PENANGGUNG JAWAB:</span>
                <strong className="text-slate-800">
                  {patient.guarantor?.name || 'Keluarga Pasien'} ({patient.guarantor?.relation || 'Kerabat'})
                </strong>
              </div>
            </div>
          </div>

          {/* Signature Verification Footer */}
          <div className="grid grid-cols-2 gap-4 text-center text-xs pt-2 font-medium border-t border-slate-200">
            <div className="space-y-8">
              <div className="text-[10px] font-bold text-slate-500 uppercase">Petugas Filing / Kurir RM</div>
              <div className="border-b border-slate-400 w-3/4 mx-auto"></div>
              <div className="text-[10px] font-bold text-slate-700">( Staff Unit Rekam Medis )</div>
            </div>

            <div className="space-y-8">
              <div className="text-[10px] font-bold text-slate-500 uppercase">Perawat Penerima IGD</div>
              <div className="border-b border-slate-400 w-3/4 mx-auto"></div>
              <div className="text-[10px] font-bold text-slate-700">( Perawat Jaga Triase IGD )</div>
            </div>
          </div>

          {/* System Footer Note */}
          <div className="text-[9px] text-center text-slate-400 font-mono">
            Formulir Tracer ini dihasilkan otomatis oleh SIMRS 3.0 UEU &bull; Harap segera diselipkan di Rak Filing sebagai Outguide
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            Tutup
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleConfirmReceived}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" /> Konfirmasi Diterima IGD
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4" /> Cetak Tracer IGD
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
