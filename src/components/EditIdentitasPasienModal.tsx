import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { Patient } from '../types';
import { User, Save, ShieldCheck, Phone, MapPin, Calendar, HeartPulse, AlertCircle } from 'lucide-react';
import Swal from 'sweetalert2';

interface EditIdentitasPasienModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient | null;
  onSave: (patientId: string, updates: Partial<Patient>) => void;
}

export const EditIdentitasPasienModal: React.FC<EditIdentitasPasienModalProps> = ({
  isOpen,
  onClose,
  patient,
  onSave
}) => {
  const [name, setName] = useState('');
  const [nik, setNik] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('1');
  const [motherName, setMotherName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [bloodType, setBloodType] = useState('O');
  const [insuranceType, setInsuranceType] = useState<'BPJS' | 'Umum' | 'Asuransi'>('Umum');
  const [noBPJS, setNoBPJS] = useState('');
  const [allergy, setAllergy] = useState('');

  useEffect(() => {
    if (patient) {
      setName(patient.name || '');
      setNik(patient.nik || '');
      setDob(patient.dob || '');
      setGender(
        patient.gender === 'M' || patient.gender === 'L' || patient.gender === '1' ? '1' :
        patient.gender === 'F' || patient.gender === 'P' || patient.gender === '2' ? '2' :
        patient.gender || '1'
      );
      setMotherName(patient.motherName || '');
      setPhone(patient.phone || '');
      setAddress(patient.addressStreet || patient.address || '');
      setBloodType(patient.bloodType || 'O');
      setInsuranceType(patient.insuranceType || (patient.noBPJS && patient.noBPJS !== '-' ? 'BPJS' : 'Umum'));
      setNoBPJS(patient.noBPJS && patient.noBPJS !== '-' ? patient.noBPJS : '');
      setAllergy(patient.allergy && patient.allergy !== '-' ? patient.allergy : '');
    }
  }, [patient]);

  if (!isOpen || !patient) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedName = name.trim();
    if (!trimmedName) {
      Swal.fire({
        icon: 'warning',
        title: 'Nama Pasien Wajib Diisi',
        text: 'Nama lengkap pasien tidak boleh kosong.',
        confirmButtonColor: '#2563eb'
      });
      return;
    }

    if (nik && nik.length !== 16) {
      Swal.fire({
        icon: 'warning',
        title: 'Validasi NIK',
        text: `Nomor Induk Kependudukan (NIK) harus 16 digit angka (saat ini ${nik.length} digit).`,
        confirmButtonColor: '#2563eb'
      });
      return;
    }

    const updates: Partial<Patient> = {
      name: trimmedName,
      nik: nik.trim() || patient.nik,
      dob: dob || patient.dob,
      gender: gender === '1' ? '1' : '2',
      motherName: motherName.trim() || patient.motherName,
      phone: phone.trim() || patient.phone,
      address: address.trim() || patient.address,
      addressStreet: address.trim() || patient.addressStreet,
      bloodType,
      insuranceType,
      noBPJS: noBPJS.trim() || (insuranceType === 'BPJS' ? patient.noBPJS : '-'),
      allergy: allergy.trim() || '-'
    };

    onSave(patient.id, updates);

    Swal.fire({
      icon: 'success',
      title: 'Identitas Pasien Diperbarui',
      text: `Perubahan data identitas pasien ${trimmedName} (No. RM: ${patient.noRM}) berhasil disimpan ke database.`,
      timer: 1800,
      showConfirmButton: false
    });

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Edit Identitas Pasien (No. RM: ${patient.noRM})`}
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* Banner Info */}
        <div className="p-3 bg-blue-50/80 border border-blue-200 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-blue-700 shrink-0" />
            <div>
              <span className="font-bold text-blue-950 block">Perbaikan Data Identitas & Rekam Medis Pasien</span>
              <span className="text-[11px] text-blue-700">Perubahan nama & data akan otomatis disinkronkan ke seluruh riwayat pendaftaran dan modul klinis.</span>
            </div>
          </div>
          <span className="font-mono font-bold text-xs bg-white px-2.5 py-1 rounded-lg border border-blue-300 text-blue-800">
            RM: {patient.noRM}
          </span>
        </div>

        {/* Form Fields */}
        <div className="space-y-3">
          {/* 1. Nama Lengkap Pasien (Mandatory) */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Nama Lengkap Pasien <span className="text-rose-600">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Masukkan nama lengkap pasien yang benar"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              required
            />
          </div>

          {/* 2. NIK KTP (16 Digit) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                NIK KTP (16 Digit)
              </label>
              <input
                type="text"
                value={nik}
                onChange={e => setNik(e.target.value.replace(/\D/g, ''))}
                maxLength={16}
                placeholder="16 Digit NIK KTP Pasien"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-medium focus:bg-white focus:outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Nama Ibu Kandung
              </label>
              <input
                type="text"
                value={motherName}
                onChange={e => setMotherName(e.target.value)}
                placeholder="Nama lengkap ibu kandung"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>

          {/* 3. Jenis Kelamin & Tanggal Lahir */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Jenis Kelamin
              </label>
              <select
                value={gender}
                onChange={e => setGender(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:border-blue-600"
              >
                <option value="1">1: Laki-laki (L)</option>
                <option value="2">2: Perempuan (P)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Tanggal Lahir
              </label>
              <input
                type="date"
                value={dob}
                onChange={e => setDob(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Golongan Darah
              </label>
              <select
                value={bloodType}
                onChange={e => setBloodType(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-rose-700 focus:bg-white focus:outline-none focus:border-blue-600"
              >
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="AB">AB</option>
                <option value="O">O</option>
                <option value="Tidak Tahu">Tidak Tahu</option>
              </select>
            </div>
          </div>

          {/* 4. Nomor HP & Alamat */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                No. HP / Telepon
              </label>
              <input
                type="text"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="Contoh: 081234567890"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Riwayat Alergi
              </label>
              <input
                type="text"
                value={allergy}
                onChange={e => setAllergy(e.target.value)}
                placeholder="Cth: Alergi Amoksisilin, Debu, dll"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Alamat Lengkap Domisili / KTP
            </label>
            <textarea
              rows={2}
              value={address}
              onChange={e => setAddress(e.target.value)}
              placeholder="Alamat lengkap pasien beserta RT / RW"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:border-blue-600"
            />
          </div>

          {/* 5. Jenis Penjamin & No. Kartu BPJS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Jenis Penjamin Pembayaran
              </label>
              <select
                value={insuranceType}
                onChange={e => setInsuranceType(e.target.value as any)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold focus:outline-none focus:border-blue-600"
              >
                <option value="BPJS">BPJS Kesehatan (JKN-KIS)</option>
                <option value="Umum">Umum / Mandiri / Cash</option>
                <option value="Asuransi">Asuransi Swasta</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Nomor Kartu BPJS / Polis Asuransi
              </label>
              <input
                type="text"
                value={noBPJS}
                onChange={e => setNoBPJS(e.target.value)}
                placeholder="13 Digit Kartu BPJS atau No Polis"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono font-medium focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>
        </div>

        {/* Modal Buttons */}
        <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            type="submit"
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            Simpan Perubahan Identitas
          </button>
        </div>
      </form>
    </Modal>
  );
};
