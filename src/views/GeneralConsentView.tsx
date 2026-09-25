import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { FileSignature, CheckCircle2, Printer, Search, Eye } from 'lucide-react';
import { CetakGeneralConsentModal } from '../components/CetakGeneralConsentModal';
import { GeneralConsent } from '../types';

export const GeneralConsentView: React.FC = () => {
  const { generalConsents, getReg, getPatient, getUser, canEditPage } = useApp();
  const isEditable = canEditPage('generalconsent');

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedConsentForPrint, setSelectedConsentForPrint] = useState<GeneralConsent | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  const handleOpenPrint = (gc: GeneralConsent) => {
    setSelectedConsentForPrint(gc);
    setIsPrintModalOpen(true);
  };

  const filteredConsents = generalConsents.filter(gc => {
    if (!searchTerm.trim()) return true;
    const r = getReg(gc.regId);
    const p = r ? getPatient(r.patientId) : null;
    const query = searchTerm.toLowerCase();

    return (
      gc.id.toLowerCase().includes(query) ||
      gc.regId.toLowerCase().includes(query) ||
      (p?.name && p.name.toLowerCase().includes(query)) ||
      (p?.noRM && p.noRM.toLowerCase().includes(query)) ||
      (gc.patientSign && gc.patientSign.toLowerCase().includes(query))
    );
  }).sort((a, b) => {
    const rA = getReg(a.regId);
    const pA = rA ? getPatient(rA.patientId) : null;
    const numA = parseInt((pA?.noRM || '').replace(/\D/g, '') || '0', 10);

    const rB = getReg(b.regId);
    const pB = rB ? getPatient(rB.patientId) : null;
    const numB = parseInt((pB?.noRM || '').replace(/\D/g, '') || '0', 10);

    return numA - numB;
  });

  const selectedReg = selectedConsentForPrint ? getReg(selectedConsentForPrint.regId) : null;
  const selectedPatient = selectedReg ? getPatient(selectedReg.patientId) : null;
  const selectedDoctor = selectedReg ? getUser(selectedReg.dpjp) : null;

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
                Anda dapat melihat dokumen General Consent pasien. Pengisian consent dilakukan saat pendaftaran pasien oleh **Petugas Pendaftaran**.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">General Consent (Persetujuan Umum)</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Dokumen persetujuan umum pelayanan kesehatan saat admisi / registrasi pasien.
          </p>
        </div>

        {generalConsents.length > 0 && (
          <button
            onClick={() => handleOpenPrint(generalConsents[0])}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer transition-all self-start sm:self-auto"
            title="Cetak Dokumen General Consent Terakhir"
          >
            <Printer className="w-4 h-4 text-blue-600" />
            <span>Cetak Dokumen Terakhir</span>
          </button>
        )}
      </div>

      <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-2xl text-xs text-blue-900 flex items-center gap-3">
        <FileSignature className="w-5 h-5 text-blue-600 shrink-0" />
        <div>
          <strong>Standar Akreditasi STARKES:</strong> General Consent mencakup hak dan kewajiban pasien, persetujuan pelepasan informasi medis, persetujuan umum tindakan medis non-invasif, dan tata tertib RS.
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
            placeholder="Cari pasien, No. RM, atau No. Registrasi..."
            className="w-full pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none placeholder:text-slate-400"
          />
        </div>
        <div className="text-xs text-slate-500 font-medium">
          Menampilkan <strong className="text-slate-800">{filteredConsents.length}</strong> dokumen General Consent
        </div>
      </div>

      {/* Table with Print Action Column */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200/80 text-slate-500 uppercase tracking-wider font-bold">
                <th className="p-3.5">ID Consent</th>
                <th className="p-3.5">No. Registrasi</th>
                <th className="p-3.5">Nama Pasien</th>
                <th className="p-3.5">Tanggal TT</th>
                <th className="p-3.5">Tanda Tangan Pasien / Wali</th>
                <th className="p-3.5">Petugas / Saksi RS</th>
                <th className="p-3.5 text-center">Status</th>
                <th className="p-3.5 text-center">Cetak Formulir</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {filteredConsents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400 text-xs">
                    Tidak ada dokumen General Consent yang sesuai dengan kata kunci pencarian.
                  </td>
                </tr>
              ) : (
                filteredConsents.map(gc => {
                  const r = getReg(gc.regId);
                  const p = r ? getPatient(r.patientId) : null;
                  return (
                    <tr key={gc.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5 font-bold text-blue-600">{gc.id}</td>
                      <td className="p-3.5 font-mono text-slate-600">{gc.regId}</td>
                      <td className="p-3.5 font-bold text-slate-800">
                        <div>{p?.name || '-'}</div>
                        {p?.noRM && <div className="text-[10px] text-slate-400 font-mono">No. RM: {p.noRM}</div>}
                      </td>
                      <td className="p-3.5 text-slate-500">{gc.date}</td>
                      <td className="p-3.5 font-semibold text-slate-800">{gc.patientSign}</td>
                      <td className="p-3.5 text-slate-600">{gc.witnessSign}</td>
                      <td className="p-3.5 text-center">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> {gc.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-center">
                        <button
                          onClick={() => handleOpenPrint(gc)}
                          className="px-3 py-1.5 bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white border border-blue-200 hover:border-blue-600 rounded-xl text-xs font-bold transition-all inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
                          title="Cetak Dokumen General Consent Resmi (PDF / Print)"
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

      {/* Modal Cetak Dokumen General Consent Resmi */}
      <CetakGeneralConsentModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        consent={selectedConsentForPrint}
        patient={selectedPatient}
        registration={selectedReg}
        doctor={selectedDoctor}
      />
    </div>
  );
};
