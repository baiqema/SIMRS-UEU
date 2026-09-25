import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { Registration, User } from '../types';
import { Edit3, Save, Stethoscope, Building2, Layers, CheckCircle2 } from 'lucide-react';
import Swal from 'sweetalert2';

interface EditKunjunganModalProps {
  isOpen: boolean;
  onClose: () => void;
  registration: Registration | null;
  patientName?: string;
  doctors: User[];
  onSave: (regId: string, updates: { poli: string; dpjp: string; status: Registration['status']; room: string | null }) => void;
}

export const EditKunjunganModal: React.FC<EditKunjunganModalProps> = ({
  isOpen,
  onClose,
  registration,
  patientName,
  doctors,
  onSave
}) => {
  const [poli, setPoli] = useState('');
  const [dpjp, setDpjp] = useState('');
  const [status, setStatus] = useState<Registration['status']>('Selesai');
  const [room, setRoom] = useState('');

  useEffect(() => {
    if (registration) {
      setPoli(registration.poli || 'Poli Penyakit Dalam');
      setDpjp(registration.dpjp || (doctors[0]?.id || ''));
      setStatus(registration.status || 'Selesai');
      setRoom(registration.room || '');
    }
  }, [registration, doctors]);

  if (!isOpen || !registration) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(registration.id, {
      poli,
      dpjp,
      status,
      room: room.trim() || null
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Edit Data Kunjungan Pasien (${registration.id})`} maxWidth="max-w-md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1">
          <div className="font-bold text-slate-800">Pasien: {patientName || '-'}</div>
          <div className="text-slate-500 font-mono">Tipe Kunjungan: <strong className="text-blue-700">{registration.type}</strong></div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Poli / Unit Tujuan</label>
          <select
            value={poli}
            onChange={e => setPoli(e.target.value)}
            className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="Poli Penyakit Dalam">Poli Penyakit Dalam</option>
            <option value="Poli Jantung & Pembuluh Darah">Poli Jantung & Pembuluh Darah</option>
            <option value="Poli Bedah Umum">Poli Bedah Umum</option>
            <option value="Poli Anak (Pediatri)">Poli Anak (Pediatri)</option>
            <option value="Poli Kebidanan & Kandungan (Obgyn)">Poli Kebidanan & Kandungan (Obgyn)</option>
            <option value="Poli Saraf (Neurologi)">Poli Saraf (Neurologi)</option>
            <option value="Poli Mata">Poli Mata</option>
            <option value="Poli THT-KL">Poli THT-KL</option>
            <option value="IGD (Instalasi Gawat Darurat)">IGD (Instalasi Gawat Darurat)</option>
            <option value="Ruang Bersalin / VK">Ruang Bersalin / VK</option>
            <option value="Kamar Bedah (OK)">Kamar Bedah (OK)</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Dokter DPJP</label>
          <select
            value={dpjp}
            onChange={e => setDpjp(e.target.value)}
            className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            {doctors.map(d => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.username})
              </option>
            ))}
          </select>
        </div>

        {registration.type === 'Rawat Inap' && (
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Ruangan / Bed Rawat Inap</label>
            <input
              type="text"
              value={room}
              onChange={e => setRoom(e.target.value)}
              placeholder="Contoh: R. Mawar 03 - Bed A"
              className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Status Kunjungan</label>
          <select
            value={status}
            onChange={e => setStatus(e.target.value as Registration['status'])}
            className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="Menunggu">Menunggu</option>
            <option value="Pemeriksaan">Pemeriksaan</option>
            <option value="Selesai">Selesai</option>
            <option value="Batal">Batal (Dibatalkan)</option>
          </select>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Simpan Perubahan</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
