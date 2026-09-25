import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Modal } from '../components/Modal';
import { CetakInformedConsentModal } from '../components/CetakInformedConsentModal';
import Swal from 'sweetalert2';
import {
  Handshake, Plus, CheckCircle2, ShieldAlert, Printer, Search, FileText, Eye
} from 'lucide-react';
import { InformedConsent } from '../types';

export const InformedConsentView: React.FC = () => {
  const { informedConsents, cppt, addInformedConsent, getMR, getReg, getPatient, getUser, canEditPage } = useApp();
  const isEditable = canEditPage('informedconsent');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cpptId, setCpptId] = useState('');
  const [action, setAction] = useState('');
  const [risk, setRisk] = useState('');
  const [complication, setComplication] = useState('');

  // State untuk Cetak Formulir
  const [selectedConsentForPrint, setSelectedConsentForPrint] = useState<InformedConsent | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleOpenPrint = (ic: InformedConsent) => {
    setSelectedConsentForPrint(ic);
    setIsPrintModalOpen(true);
  };

  const handleSaveIC = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEditable) {
      Swal.fire({
        icon: 'warning',
        title: 'Akses Terbatas (Mode Lihat)',
        text: 'Anda berada dalam Mode Lihat (Read-Only) untuk modul Informed Consent. Silakan login dengan akun Dokter/Perawat/RME.',
        confirmButtonColor: '#d97706'
      });
      return;
    }
    if (!cpptId || !action.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Validasi',
        text: 'Pilih CPPT dan sebutkan tindakan medis',
        confirmButtonColor: '#2563eb'
      });
      return;
    }

    addInformedConsent({
      cpptId,
      action,
      risk,
      complication
    });

    setIsModalOpen(false);
    setAction('');
    setRisk('');
    setComplication('');

    // Cari atau jadwalkan buka cetak formulir
    Swal.fire({
      icon: 'success',
      title: 'Informed Consent Disetujui',
      text: 'Persetujuan tindakan medis berhasil dicatat. Ingin mencetak formulir informed consent sekarang?',
      showCancelButton: true,
      confirmButtonText: '🖨️ Cetak Formulir',
      cancelButtonText: 'Selesai',
      confirmButtonColor: '#2563eb',
      cancelButtonColor: '#64748b'
    }).then((res) => {
      if (res.isConfirmed) {
        // Ambil item informed consent paling baru
        setTimeout(() => {
          if (informedConsents.length > 0) {
            setSelectedConsentForPrint(informedConsents[0]);
            setIsPrintModalOpen(true);
          }
        }, 100);
      }
    });
  };

  // Filter informed consent berdasarkan kata kunci pencarian - diurutkan mulai dari 000001
  const filteredConsents = informedConsents.filter(ic => {
    if (!searchTerm.trim()) return true;
    const c = cppt.find(item => item.id === ic.cpptId);
    const mr = c ? getMR(c.mrId) : null;
    const r = mr ? getReg(mr.regId) : null;
    const p = r ? getPatient(r.patientId) : null;
    const query = searchTerm.toLowerCase();

    return (
      ic.id.toLowerCase().includes(query) ||
      ic.action.toLowerCase().includes(query) ||
      (p?.name && p.name.toLowerCase().includes(query)) ||
      (p?.noRM && p.noRM.toLowerCase().includes(query))
    );
  }).sort((a, b) => {
    const cA = cppt.find(item => item.id === a.cpptId);
    const mrA = cA ? getMR(cA.mrId) : null;
    const rA = mrA ? getReg(mrA.regId) : null;
    const pA = rA ? getPatient(rA.patientId) : null;
    const numA = parseInt((mrA?.noRM || pA?.noRM || '').replace(/\D/g, '') || '0', 10);

    const cB = cppt.find(item => item.id === b.cpptId);
    const mrB = cB ? getMR(cB.mrId) : null;
    const rB = mrB ? getReg(mrB.regId) : null;
    const pB = rB ? getPatient(rB.patientId) : null;
    const numB = parseInt((mrB?.noRM || pB?.noRM || '').replace(/\D/g, '') || '0', 10);

    return numA - numB;
  });

  // Data pasien & kunjungan terkait untuk modal cetak
  const selectedCPPT = selectedConsentForPrint ? cppt.find(item => item.id === selectedConsentForPrint.cpptId) : null;
  const selectedMR = selectedCPPT ? getMR(selectedCPPT.mrId) : null;
  const selectedReg = selectedMR ? getReg(selectedMR.regId) : null;
  const selectedPatient = selectedReg ? getPatient(selectedReg.patientId) : null;
  const selectedDoctor = selectedConsentForPrint ? getUser(selectedConsentForPrint.doctorId) : null;

  return (
    <div className="space-y-6">
      {/* Read-Only Mode Banner */}
      {!isEditable && (
        <div className="p-3.5 bg-amber-50 border border-amber-200/90 rounded-2xl flex items-center justify-between text-xs text-amber-900 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-2xs">
              🔒
            </div>
            <div>
              <p className="font-extrabold text-amber-950 flex items-center gap-2">
                <span>Mode Lihat (Read-Only)</span>
                <span className="text-[10px] px-2 py-0.5 bg-amber-200/80 text-amber-900 rounded-full font-bold">Akses Terbatas</span>
              </p>
              <p className="text-[11px] text-amber-800">
                Anda dapat membaca dokumen Informed Consent. Pembuatan persetujuan tindakan medis khusus untuk **Dokter DPJP / Perawat**.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header & Action Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Informed Consent (Persetujuan Tindakan Medis)</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Persetujuan tertulis pasien / keluarga sebelum pelaksanaan tindakan medis berisiko tinggi.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {informedConsents.length > 0 && (
            <button
              onClick={() => handleOpenPrint(informedConsents[0])}
              className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer transition-all"
              title="Cetak Formulir Informed Consent Terakhir"
            >
              <Printer className="w-4 h-4 text-blue-600" />
              <span>Cetak Formulir Terakhir</span>
            </button>
          )}

          <button
            onClick={() => {
              if (cppt.length > 0) setCpptId(cppt[0].id);
              setIsModalOpen(true);
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-2 cursor-pointer transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" /> Buat Informed Consent
          </button>
        </div>
      </div>

      {/* Aturan Bisnis Banner */}
      <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 flex items-center gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
        <div>
          <strong>Aturan Bisnis:</strong> Informed Consent hanya dapat dibuat berdasarkan instruksi tindakan dalam catatan SOAP/CPPT. Wajib mencantumkan potensi risiko dan komplikasi tindakan.
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Cari pasien, No. RM, atau tindakan..."
            className="w-full pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none placeholder:text-slate-400"
          />
        </div>
        <div className="text-xs text-slate-500 font-medium">
          Menampilkan <strong className="text-slate-800">{filteredConsents.length}</strong> dokumen Informed Consent
        </div>
      </div>

      {/* Tabel Data Informed Consent */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200/80 text-slate-500 uppercase tracking-wider font-bold">
                <th className="p-3.5">ID Consent</th>
                <th className="p-3.5">Ref. CPPT</th>
                <th className="p-3.5">Nama Pasien</th>
                <th className="p-3.5">Rencana Tindakan Medis</th>
                <th className="p-3.5">Risiko Dijelaskan</th>
                <th className="p-3.5">Komplikasi</th>
                <th className="p-3.5">Dokter Penanggung Jawab</th>
                <th className="p-3.5 text-center">Status</th>
                <th className="p-3.5 text-center">Cetak Formulir</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {filteredConsents.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-400 text-xs">
                    Tidak ada data dokumen Informed Consent yang sesuai pencarian.
                  </td>
                </tr>
              ) : (
                filteredConsents.map(ic => {
                  const c = cppt.find(item => item.id === ic.cpptId);
                  const mr = c ? getMR(c.mrId) : null;
                  const r = mr ? getReg(mr.regId) : null;
                  const p = r ? getPatient(r.patientId) : null;
                  const doc = getUser(ic.doctorId);
                  return (
                    <tr key={ic.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5 font-bold text-blue-600">{ic.id}</td>
                      <td className="p-3.5 font-mono text-slate-600">{ic.cpptId}</td>
                      <td className="p-3.5 font-bold text-slate-800">
                        <div>{p?.name || '-'}</div>
                        {p?.noRM && <div className="text-[10px] text-slate-400 font-mono">No. RM: {p.noRM}</div>}
                      </td>
                      <td className="p-3.5 font-bold text-slate-900">{ic.action}</td>
                      <td className="p-3.5 max-w-xs truncate text-slate-600" title={ic.risk}>{ic.risk}</td>
                      <td className="p-3.5 max-w-xs truncate text-slate-600" title={ic.complication}>{ic.complication}</td>
                      <td className="p-3.5 text-slate-600">{doc?.name || '-'}</td>
                      <td className="p-3.5 text-center">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> {ic.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-center">
                        <button
                          onClick={() => handleOpenPrint(ic)}
                          className="px-3 py-1.5 bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white border border-blue-200 hover:border-blue-600 rounded-xl text-xs font-bold transition-all inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
                          title="Cetak Formulir Informed Consent Resmi (PDF / Print)"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Cetak</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Cetak Formulir Informed Consent Resmi */}
      <CetakInformedConsentModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        consent={selectedConsentForPrint}
        patient={selectedPatient}
        registration={selectedReg}
        cpptItem={selectedCPPT}
        mrItem={selectedMR}
        doctor={selectedDoctor}
      />

      {/* Modal Form Buat Informed Consent */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Form Persetujuan Informed Consent"
      >
        <form onSubmit={handleSaveIC} className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Pilih Referensi CPPT *</label>
            <select
              value={cpptId}
              onChange={e => setCpptId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              required
            >
              {cppt.map(c => {
                const mr = getMR(c.mrId);
                const r = mr ? getReg(mr.regId) : null;
                const p = r ? getPatient(r.patientId) : null;
                return (
                  <option key={c.id} value={c.id}>
                    {c.id} - {p?.name} ({c.assessment})
                  </option>
                );
              })}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Rencana Tindakan Medis *</label>
            <input
              type="text"
              value={action}
              onChange={e => setAction(e.target.value)}
              placeholder="Contoh: Arteriografi Koroner / Pemasangan Stent..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Risiko yang Dijelaskan ke Pasien</label>
            <textarea
              value={risk}
              onChange={e => setRisk(e.target.value)}
              rows={2}
              placeholder="Potensi pendarahan, nyeri local, reaksi alergi..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Komplikasi yang Mungkin Terjadi</label>
            <textarea
              value={complication}
              onChange={e => setComplication(e.target.value)}
              rows={2}
              placeholder="Hipotensi, hematoma, gangguan irama jantung..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 shadow-md"
            >
              Simpan Informed Consent
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
