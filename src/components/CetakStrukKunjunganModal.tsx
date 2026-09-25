import React from 'react';
import { Modal } from './Modal';
import { Patient, Registration, User } from '../types';
import { Printer, CheckCircle2, Building2, Calendar, Clock, QrCode } from 'lucide-react';
import { EsaUnggulLogo } from './Logos';

interface CetakStrukKunjunganModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient | null;
  registration: Registration | null;
  doctor: User | null;
}

export const CetakStrukKunjunganModal: React.FC<CetakStrukKunjunganModalProps> = ({
  isOpen,
  onClose,
  patient,
  registration,
  doctor
}) => {
  if (!isOpen || !patient || !registration) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Cetak Bukti Kunjungan / Struk Registrasi Pasien" maxWidth="max-w-lg">
      <div className="space-y-4">
        {/* Printable Struk Card */}
        <div id="printable-struk-kunjungan" className="bg-white p-6 rounded-2xl border-2 border-dashed border-slate-300 shadow-sm space-y-4 text-slate-800 font-sans">
          {/* Header Struk */}
          <div className="text-center pb-3 border-b-2 border-slate-800 space-y-1">
            <div className="flex justify-center mb-1">
              <EsaUnggulLogo size="sm" showText={true} />
            </div>
            <div className="font-black text-xs uppercase tracking-wider text-slate-900">
              RS UNIVERSITAS ESA UNGGUL JAKARTA
            </div>
            <div className="text-[10px] text-slate-500">
              Jl. Arjuna Utara No.9, Kebon Jeruk, Jakarta Barat 11510 &bull; Telp: (021) 5678-9999
            </div>
            <div className="font-mono font-bold text-xs bg-slate-100 py-1 px-3 rounded-lg inline-block mt-1">
              BUKTI KUNJUNGAN & REGISTRASI RAWAT
            </div>
          </div>

          {/* Nomor Antrean Besar */}
          <div className="text-center py-2 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Nomor Antrean Pelayanan</span>
            <span className="text-3xl font-black text-blue-900 font-mono tracking-tight">
              {registration.type === 'IGD' ? 'IGD-' : registration.type === 'Rawat Inap' ? 'RANAP-' : 'POLI-'}
              {registration.id.slice(-3)}
            </span>
          </div>

          {/* Rincian Kunjungan */}
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between border-b border-slate-100 py-1">
              <span className="text-slate-500">No. Registrasi:</span>
              <span className="font-mono font-bold text-blue-800">{registration.id}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 py-1">
              <span className="text-slate-500">Waktu / Tanggal:</span>
              <span className="font-semibold">{registration.date} &bull; 08:30 WIB</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 py-1">
              <span className="text-slate-500">No. Rekam Medis (RM):</span>
              <span className="font-mono font-black text-slate-900">{patient.noRM}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 py-1">
              <span className="text-slate-500">Nama Pasien:</span>
              <span className="font-bold text-slate-900">{patient.name}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 py-1">
              <span className="text-slate-500">NIK Pasien:</span>
              <span className="font-mono text-slate-700">{patient.nik}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 py-1">
              <span className="text-slate-500">Unit / Tipe Layanan:</span>
              <span className="font-bold text-slate-800">{registration.type}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 py-1">
              <span className="text-slate-500">Tujuan Poli / Ruangan:</span>
              <span className="font-bold text-blue-900">{registration.room || registration.poli}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 py-1">
              <span className="text-slate-500">Dokter DPJP:</span>
              <span className="font-semibold text-slate-800">{doctor?.name || 'dr. DPJP Spesialis'}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 py-1">
              <span className="text-slate-500">Cara Pembayaran:</span>
              <span className="font-bold text-emerald-700">{patient.insuranceType}</span>
            </div>
            {registration.sepNo && (
              <div className="flex justify-between border-b border-slate-100 py-1">
                <span className="text-slate-500">No. SEP BPJS:</span>
                <span className="font-mono font-bold text-emerald-800">{registration.sepNo}</span>
              </div>
            )}
          </div>

          {/* Footer Barcode & Keterangan */}
          <div className="pt-3 border-t-2 border-slate-800 text-center space-y-2">
            <div className="flex justify-center items-center gap-2 text-slate-500 text-[10px]">
              <QrCode className="w-8 h-8 text-slate-800" />
              <div className="text-left font-mono">
                <div>E-TRACER RME ACTIVE</div>
                <div className="text-[9px] text-slate-400">Validasi Digital Kemenkes RI</div>
              </div>
            </div>
            <p className="text-[10px] text-slate-500 italic">
              Simpan bukti kunjungan ini. Silakan menuju ke ruang pelayanan dan serahkan pada perawat/petugas terkait.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            Tutup
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak Struk (Print)</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
