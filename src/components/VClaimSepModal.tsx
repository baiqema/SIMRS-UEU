import React from 'react';
import { Modal } from './Modal';
import { Patient, Registration, User } from '../types';
import { Printer, ShieldCheck, CheckCircle2, QrCode, FileText, Activity } from 'lucide-react';

interface VClaimSepModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient | null;
  registration: Registration | null;
  doctor?: User | null;
}

export const VClaimSepModal: React.FC<VClaimSepModalProps> = ({
  isOpen,
  onClose,
  patient,
  registration,
  doctor
}) => {
  if (!patient || !registration) return null;

  const handlePrint = () => {
    window.print();
  };

  const sepNo = registration.sepNo && registration.sepNo !== '-'
    ? registration.sepNo
    : `0012R0010826V${Math.floor(100000 + Math.random() * 900000)}`;

  const noBpjs = patient.noBPJS && patient.noBPJS !== '-' ? patient.noBPJS : '0001829384912';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" maxWidth="max-w-3xl">
      {/* Action Buttons Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4 print:hidden">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-black text-xs shadow-xs">
            BPJS
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-1.5">
              Bridging VClaim BPJS Kesehatan <span className="text-[10px] px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full font-bold">ONLINE 200 OK</span>
            </h3>
            <p className="text-[11px] text-slate-500">Preview & Cetak Surat Eligibilitas Peserta (SEP) SIMRS</p>
          </div>
        </div>
        <button
          type="button"
          onClick={handlePrint}
          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer transition-all"
        >
          <Printer className="w-3.5 h-3.5" /> Cetak SEP BPJS
        </button>
      </div>

      {/* Official BPJS SEP Printable Document Container */}
      <div id="printable-sep-card" className="p-6 bg-white border border-slate-300 rounded-xl font-sans text-slate-900 text-[11px] leading-tight space-y-4 shadow-xs">
        {/* Header SEP */}
        <div className="flex items-start justify-between border-b-2 border-emerald-700 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-emerald-700 text-white font-black text-lg flex items-center justify-center tracking-tighter shrink-0 border border-emerald-800 shadow-2xs">
              BPJS
            </div>
            <div>
              <h2 className="font-black text-sm uppercase text-emerald-900 tracking-wide">BPJS KESEHATAN</h2>
              <p className="font-extrabold text-[12px] text-slate-800">SURAT ELIGIBILITAS PESERTA (SEP)</p>
              <p className="text-[10px] text-slate-600">RSUD DR. SOETOMO / RS SEHAT SEJAHTERA UTAMA</p>
            </div>
          </div>
          <div className="text-right">
            <div className="font-mono font-extrabold text-sm text-slate-900 bg-slate-100 px-2.5 py-1 rounded border border-slate-300">
              {sepNo}
            </div>
            <p className="text-[9px] text-slate-500 mt-0.5">Tgl. Terbit SEP: {registration.date} WIB</p>
          </div>
        </div>

        {/* SEP Details Grid */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-[11px]">
          <div className="space-y-1.5">
            <div className="flex">
              <span className="w-28 text-slate-500 shrink-0">No. SEP</span>
              <span className="font-bold text-slate-900">: {sepNo}</span>
            </div>
            <div className="flex">
              <span className="w-28 text-slate-500 shrink-0">Tgl. SEP</span>
              <span className="font-medium text-slate-800">: {registration.date}</span>
            </div>
            <div className="flex">
              <span className="w-28 text-slate-500 shrink-0">No. Kartu BPJS</span>
              <span className="font-mono font-bold text-emerald-800">: {noBpjs} ( NIK: {patient.nik} )</span>
            </div>
            <div className="flex">
              <span className="w-28 text-slate-500 shrink-0">Nama Peserta</span>
              <span className="font-bold text-slate-900 uppercase">: {patient.name}</span>
            </div>
            <div className="flex">
              <span className="w-28 text-slate-500 shrink-0">Tgl. Lahir / JKel</span>
              <span className="font-medium text-slate-800">: {patient.dob} / {patient.gender === 'M' ? 'Laki-Laki' : 'Perempuan'}</span>
            </div>
            <div className="flex">
              <span className="w-28 text-slate-500 shrink-0">No. Telepon Pasien</span>
              <span className="font-medium text-slate-800">: {patient.phone}</span>
            </div>
            <div className="flex">
              <span className="w-28 text-slate-500 shrink-0">Sub/Spesialis</span>
              <span className="font-bold text-blue-900">: {registration.poli}</span>
            </div>
            <div className="flex">
              <span className="w-28 text-slate-500 shrink-0">Dokter DPJP</span>
              <span className="font-medium text-slate-800">: {doctor?.name || 'dr. Sari Dewi, Sp.PD'}</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex">
              <span className="w-28 text-slate-500 shrink-0">Faskes Perujuk</span>
              <span className="font-medium text-slate-800">: Puskesmas Kebon Jeruk (0112001)</span>
            </div>
            <div className="flex">
              <span className="w-28 text-slate-500 shrink-0">No. Rujukan</span>
              <span className="font-mono font-medium text-slate-800">: RUK-2026-008219</span>
            </div>
            <div className="flex">
              <span className="w-28 text-slate-500 shrink-0">Diagnosa Awal</span>
              <span className="font-bold text-slate-900">: I10 - Hipertensi Esensial (Primer)</span>
            </div>
            <div className="flex">
              <span className="w-28 text-slate-500 shrink-0">Jenis Peserta</span>
              <span className="font-medium text-slate-800">: PBI APBN / NON-PBI (Aktif)</span>
            </div>
            <div className="flex">
              <span className="w-28 text-slate-500 shrink-0">COB / Denda</span>
              <span className="font-medium text-emerald-700">: - / Rp 0 (Bebas Denda)</span>
            </div>
            <div className="flex">
              <span className="w-28 text-slate-500 shrink-0">Jenis Rawat</span>
              <span className="font-bold text-slate-900">: {registration.type}</span>
            </div>
            <div className="flex">
              <span className="w-28 text-slate-500 shrink-0">Kelas Hak / Rawat</span>
              <span className="font-bold text-slate-900">: Kelas 1 / Kelas 2</span>
            </div>
            <div className="flex">
              <span className="w-28 text-slate-500 shrink-0">Penjamin / Catatan</span>
              <span className="font-medium text-slate-800">: BPJS KESEHATAN / -</span>
            </div>
          </div>
        </div>

        {/* Disclaimer Notes & Verification Barcode */}
        <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-[9px] text-slate-600 flex items-center justify-between gap-4">
          <div>
            <p className="font-bold text-slate-700">* Catatan Penting SEP VClaim BPJS:</p>
            <p>1. SEP bukan bukti penjaminan peserta. Penjaminan sesuai regulasi BPJS Kesehatan.</p>
            <p>2. Dilarang melakukan pungutan biaya di luar ketentuan yang berlaku.</p>
          </div>
          <div className="text-center shrink-0">
            <div className="w-16 h-16 bg-white border border-slate-300 rounded flex items-center justify-center p-1 mx-auto shadow-2xs">
              <QrCode className="w-12 h-12 text-slate-800" />
            </div>
            <span className="text-[8px] font-mono text-slate-500 block mt-0.5">VClaim Auth Valid</span>
          </div>
        </div>

        {/* Signatures Row */}
        <div className="grid grid-cols-2 gap-8 text-center pt-2 text-[10px]">
          <div>
            <p className="text-slate-500">Pasien / Keluarga Pasien</p>
            <div className="h-12 flex items-end justify-center">
              <span className="font-bold text-slate-800 uppercase border-b border-slate-400 pb-0.5">
                ( {patient.name} )
              </span>
            </div>
          </div>
          <div>
            <p className="text-slate-500">Petugas BPJS Kesehatan / RS</p>
            <div className="h-12 flex items-end justify-center">
              <span className="font-bold text-slate-800 uppercase border-b border-slate-400 pb-0.5 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-600" /> ( Petugas VClaim Admisim )
              </span>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
