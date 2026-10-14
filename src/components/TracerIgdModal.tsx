import React, { useRef } from 'react';
import { Modal } from './Modal';
import { Patient, Registration, User } from '../types';
import {
  Printer, ShieldAlert, CheckCircle2, Clock,
  Building2, MapPin, QrCode, ArrowRight, UserCheck, Tag
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
      title: 'Berkas RM Diterima di Poliklinik/Ruangan!',
      text: `Tracer berkas No. RM ${patient.noRM} terkonfirmasi diterima oleh Petugas di ${registration.poli || registration.room || registration.type}.`,
      timer: 1800,
      showConfirmButton: false
    });
    onClose();
  };

  const currentTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

  // Helper mapping jenis kelamin yang akurat dan konsisten
  const formatGender = (gender?: string) => {
    if (!gender) return '-';
    const g = gender.trim().toUpperCase();
    if (g === 'M' || g === 'L' || g === '1' || g.startsWith('LAKI')) {
      return 'Laki-Laki (L)';
    }
    if (g === 'F' || g === 'P' || g === '2' || g.startsWith('PEREMPUAN')) {
      return 'Perempuan (P)';
    }
    return gender;
  };

  const unitTypeUpper = (registration.type || 'RAWAT JALAN').toUpperCase();
  const isIgd = registration.type === 'IGD';
  const isRanap = registration.type === 'Rawat Inap';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Tracer Rekam Medis ${registration.type} (Outguide Pelacakan Berkas)`}
    >
      <div className="space-y-4 text-slate-800">
        {/* Printable Tracer Area - Murni Lembar Pelacakan Berkas (Outguide) Tanpa SOAP */}
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
                <ShieldAlert className={`w-5 h-5 ${isIgd ? 'text-rose-600' : 'text-blue-600'} shrink-0`} />
                TRACER REKAM MEDIS PASIEN {unitTypeUpper}
              </h2>
              <p className="text-[11px] font-medium text-slate-600">
                Lembar Pengganti / Outguide Pelacakan Berkas RM di Ruang Storage Filing
              </p>
            </div>
            <div className="text-right shrink-0">
              <span className={`px-2.5 py-1 ${isIgd ? 'bg-rose-600' : isRanap ? 'bg-amber-600' : 'bg-blue-600'} text-white font-black text-xs rounded-lg uppercase tracking-wider inline-block`}>
                PRIORITAS {unitTypeUpper}
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

          {/* Patient Details Grid (Mapping Jenis Kelamin Akurat & Bebas Bug) */}
          <div className="grid grid-cols-2 gap-3 text-xs border-b border-slate-200 pb-3">
            <div>
              <span className="text-[10px] text-slate-500 font-bold block">NAMA PASIEN:</span>
              <strong className="text-sm font-extrabold text-slate-900">{patient.name}</strong>
            </div>

            <div>
              <span className="text-[10px] text-slate-500 font-bold block">JENIS KELAMIN / TGL LAHIR:</span>
              <strong className="font-bold text-slate-800">
                {formatGender(patient.gender)} &bull; {patient.dob}
              </strong>
            </div>

            <div>
              <span className="text-[10px] text-slate-500 font-bold block">NIK / NO. KTP:</span>
              <span className="font-mono font-bold text-slate-800">{patient.nik || '-'}</span>
            </div>

            <div>
              <span className="text-[10px] text-slate-500 font-bold block">PENJAMIN / PEMBAYARAN:</span>
              <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block">
                {patient.insuranceType} {patient.noBPJS && patient.noBPJS !== '-' ? `(${patient.noBPJS})` : ''}
              </span>
            </div>
          </div>

          {/* Routing & DPJP Info - Murni Pelacakan Berkas Outguide */}
          <div className="bg-sky-50/60 p-3.5 rounded-xl border border-sky-200 space-y-2 text-xs">
            <div className="flex items-center justify-between font-bold text-blue-900 border-b border-sky-200 pb-1">
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4 text-blue-600" /> ALUR TRACER BERKAS REKAM MEDIS
              </span>
              <span className="text-[10px] font-mono text-blue-700 bg-white px-2 py-0.5 rounded border border-blue-200">
                PELACAKAN BERKAS (OUTGUIDE)
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white p-2 rounded-lg border border-sky-200">
                <div className="text-[10px] font-bold text-slate-500">RUANG ASAL (FILING):</div>
                <div className="font-extrabold text-slate-800">Storage Depo Rekam Medis Utama (Rak Filing)</div>
              </div>

              <div className="bg-white p-2 rounded-lg border border-sky-200">
                <div className="text-[10px] font-bold text-slate-500">UNIT TUJUAN TRACER:</div>
                <div className="font-extrabold text-blue-900">{(registration.poli || registration.room || registration.type).toUpperCase()}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-slate-700 pt-1">
              <div>
                <span className="text-[10px] font-bold text-slate-500 block">DOKTER DPJP PELAYANAN:</span>
                <strong className="text-slate-800">{doctor?.name || 'Dokter Spesialis DPJP'}</strong>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-500 block">PENANGGUNG JAWAB PASIEN:</span>
                <strong className="text-slate-800">
                  {patient.guarantor?.name || 'Keluarga Pasien'} ({patient.guarantor?.relation || 'Wali/Kerabat'})
                </strong>
              </div>
            </div>
          </div>

          {/* Signature Verification Footer */}
          <div className="grid grid-cols-2 gap-4 text-center text-xs pt-2 font-medium border-t border-slate-200">
            <div className="space-y-8">
              <div className="text-[10px] font-bold text-slate-500 uppercase">Petugas Filing / Kurir RM</div>
              <div className="border-b border-slate-400 w-3/4 mx-auto"></div>
              <div className="text-[10px] text-slate-600">Bagian Pengelolaan Rekam Medis</div>
            </div>

            <div className="space-y-8">
              <div className="text-[10px] font-bold text-slate-500 uppercase">Penerima Berkas di Poliklinik/Ruangan</div>
              <div className="border-b border-slate-400 w-3/4 mx-auto"></div>
              <div className="text-[10px] text-slate-600">Perawat / Petugas Admisi Poliklinik</div>
            </div>
          </div>

          <div className="text-center text-[9px] text-slate-400 italic pt-1">
            Formulir Tracer ini dihasilkan otomatis oleh SIMRS 3.0 UEU &bull; Harap segera diselipkan di Rak Filing sebagai Outguide
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div className="flex items-center justify-between gap-3 pt-2 print:hidden">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer transition-colors"
          >
            Tutup
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleConfirmReceived}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer shadow-xs transition-colors flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" /> Konfirmasi Berkas Diterima
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold cursor-pointer shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" /> Cetak Tracer Berkas (Outguide)
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
