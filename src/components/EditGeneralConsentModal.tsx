import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { DigitalSignaturePad } from './DigitalSignaturePad';
import { useApp } from '../context/AppContext';
import { GeneralConsent, Patient, Registration, User } from '../types';
import Swal from 'sweetalert2';
import {
  FileSignature, CheckCircle2, UserCheck, ShieldCheck, Printer,
  Save, AlertCircle, Phone, Calendar, User as UserIcon, Clock, FileCheck
} from 'lucide-react';

interface EditGeneralConsentModalProps {
  isOpen: boolean;
  onClose: () => void;
  consent: GeneralConsent | null;
  patient: Patient | null;
  registration: Registration | null;
  doctor?: User | null;
  onOpenPrint?: (gc: GeneralConsent) => void;
}

export const EditGeneralConsentModal: React.FC<EditGeneralConsentModalProps> = ({
  isOpen,
  onClose,
  consent,
  patient,
  registration,
  doctor,
  onOpenPrint
}) => {
  const { updateGeneralConsent, user } = useApp();

  const [date, setDate] = useState('');
  const [signerName, setSignerName] = useState('');
  const [signerRelation, setSignerRelation] = useState('Pasien Sendiri');
  const [signerPhone, setSignerPhone] = useState('');
  const [witnessName, setWitnessName] = useState('');
  const [status, setStatus] = useState<'Signed' | 'Pending'>('Signed');
  const [catatanKhusus, setCatatanKhusus] = useState('');

  // Signatures
  const [patientSignatureImage, setPatientSignatureImage] = useState('');
  const [witnessSignatureImage, setWitnessSignatureImage] = useState('');

  useEffect(() => {
    if (consent && isOpen) {
      setDate(consent.date || new Date().toISOString().split('T')[0]);
      setSignerName(consent.signerName || consent.patientSign || patient?.name || '');
      setSignerRelation(consent.signerRelation || (consent.patientSign === patient?.name ? 'Pasien Sendiri' : 'Wali / Keluarga'));
      setSignerPhone(consent.signerPhone || patient?.phone || '');
      setWitnessName(consent.witnessName || consent.witnessSign || user?.name || 'Petugas Admisi RME');
      setStatus(consent.status || 'Signed');
      setCatatanKhusus(consent.catatanKhusus || '');
      setPatientSignatureImage(consent.patientSignatureImage || '');
      setWitnessSignatureImage(consent.witnessSignatureImage || '');
    }
  }, [consent, isOpen, patient, user]);

  if (!consent || !patient) return null;

  const handleSave = (andPrint: boolean = false) => {
    if (!signerName.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Nama Penandatangan Kosong',
        text: 'Harap isi nama pasien atau keluarga yang menandatangani persetujuan.',
        confirmButtonColor: '#2563eb'
      });
      return;
    }

    const updatedData: Partial<GeneralConsent> = {
      date,
      patientSign: signerName,
      signerName,
      signerRelation,
      signerPhone,
      witnessSign: witnessName,
      witnessName,
      status: patientSignatureImage ? 'Signed' : status,
      catatanKhusus,
      patientSignatureImage,
      witnessSignatureImage
    };

    updateGeneralConsent(consent.id, updatedData);

    const mergedConsent: GeneralConsent = {
      ...consent,
      ...updatedData
    };

    Swal.fire({
      icon: 'success',
      title: 'General Consent Disimpan',
      text: 'Data persetujuan umum dan tanda tangan elektronik berhasil diperbarui.',
      timer: 1600,
      showConfirmButton: false
    });

    onClose();

    if (andPrint && onOpenPrint) {
      setTimeout(() => {
        onOpenPrint(mergedConsent);
      }, 250);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit & Tanda Tangan Elektronik General Consent"
      size="2xl"
    >
      <div className="space-y-5 text-slate-800">
        {/* Info Banner Pasien */}
        <div className="p-4 bg-blue-50/70 border border-blue-200/90 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shrink-0 shadow-xs">
              <FileSignature className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-sm">{patient.name}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 bg-blue-100 text-blue-800 rounded-md font-bold">
                  {patient.noRM}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                No. Registrasi: <span className="font-mono font-medium text-slate-700">{consent.regId}</span> &bull; 
                NIK: <span className="font-mono text-slate-600">{patient.nik || '-'}</span> &bull; 
                Layanan: <span className="font-medium text-blue-700">{registration?.type || 'Rawat Jalan'}</span>
              </p>
            </div>
          </div>
          <div className="text-right sm:border-l sm:border-blue-200 sm:pl-3">
            <span className="text-[10px] text-slate-500 block uppercase font-bold">ID Dokumen</span>
            <span className="font-mono font-bold text-blue-700">{consent.id}</span>
          </div>
        </div>

        {/* Form Inputs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50/70 p-4 rounded-2xl border border-slate-200/80">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              Tanggal Persetujuan <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Calendar className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              Hubungan Penandatangan dengan Pasien <span className="text-rose-500">*</span>
            </label>
            <select
              value={signerRelation}
              onChange={e => {
                setSignerRelation(e.target.value);
                if (e.target.value === 'Pasien Sendiri') {
                  setSignerName(patient.name);
                }
              }}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium"
            >
              <option value="Pasien Sendiri">Pasien Sendiri (Dewasa/Sadar Penuh)</option>
              <option value="Suami">Suami Pasien</option>
              <option value="Istri">Istri Pasien</option>
              <option value="Orang Tua (Ayah)">Orang Tua (Ayah Kandung)</option>
              <option value="Orang Tua (Ibu)">Orang Tua (Ibu Kandung)</option>
              <option value="Anak Kandung">Anak Kandung</option>
              <option value="Saudara Kandung">Saudara Kandung</option>
              <option value="Wali Sah">Wali Sah / Pengampu Hukum</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              Nama Lengkap Penandatangan (Pasien / Wali) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <UserIcon className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={signerName}
                onChange={e => setSignerName(e.target.value)}
                placeholder="Nama lengkap sesuai KTP..."
                className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              No. Handphone / WhatsApp Penandatangan
            </label>
            <div className="relative">
              <Phone className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="tel"
                value={signerPhone}
                onChange={e => setSignerPhone(e.target.value)}
                placeholder="Contoh: 081234567890"
                className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              Petugas Admisi / Saksi RS <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <ShieldCheck className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={witnessName}
                onChange={e => setWitnessName(e.target.value)}
                placeholder="Nama petugas admisi/RME..."
                className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              Status Persetujuan Dokumen
            </label>
            <select
              value={status}
              onChange={e => setStatus(e.target.value as 'Signed' | 'Pending')}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none font-bold text-emerald-800"
            >
              <option value="Signed">✓ Signed (Sudah Ditandatangani & Sah)</option>
              <option value="Pending">⏳ Pending (Menunggu Penandatanganan)</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              Catatan / Permintaan Khusus Pasien (Opsional)
            </label>
            <input
              type="text"
              value={catatanKhusus}
              onChange={e => setCatatanKhusus(e.target.value)}
              placeholder="Contoh: Pasien meminta agar riwayat pengobatan tidak disampaikan ke pihak kantor/perusahaan tertentu."
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>

        {/* AREA TANDA TANGAN ELEKTRONIK (CANVAS SIGNATURE PAD) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <FileSignature className="w-4 h-4 text-blue-600" />
                Tanda Tangan Elektronik (Digital Signature)
              </h2>
              <p className="text-[11px] text-slate-500">
                Goreskan tanda tangan langsung pada kanvas di bawah menggunakan mouse, stylus, atau layar sentuh.
              </p>
            </div>
            {patientSignatureImage && (
              <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full flex items-center gap-1 border border-emerald-200">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> TTD Pasien Tersimpan
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* TTD Pasien / Wali */}
            <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
              <DigitalSignaturePad
                title="Tanda Tangan Pasien / Wali Sah"
                roleLabel="Pasien / Keluarga"
                personName={signerName || patient.name}
                onNameChange={setSignerName}
                signatureValue={patientSignatureImage}
                onSignatureChange={setPatientSignatureImage}
                signedDate={date}
              />
            </div>

            {/* TTD Petugas Admisi / Saksi RS */}
            <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
              <DigitalSignaturePad
                title="Tanda Tangan Saksi Petugas RS"
                roleLabel="Petugas Medis"
                personName={witnessName || 'Petugas Admisi RMIK'}
                onNameChange={setWitnessName}
                identifierNumber="NIP. 19920311202001"
                signatureValue={witnessSignatureImage}
                onSignatureChange={setWitnessSignatureImage}
                signedDate={date}
              />
            </div>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
          >
            Batal
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleSave(true)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Simpan dan Buka Formulir Cetak General Consent"
            >
              <Printer className="w-4 h-4 text-blue-400" />
              <span>Simpan & Cetak</span>
            </button>

            <button
              type="button"
              onClick={() => handleSave(false)}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-md shadow-blue-600/20"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Perubahan</span>
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
