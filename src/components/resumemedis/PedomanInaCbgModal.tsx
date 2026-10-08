import React, { useState } from 'react';
import { Modal } from '../Modal';
import { INA_CBG_PEDOMAN_EDISI_2, InaCbgPedomanItem } from '../../data/inaCbgPedomanData';
import { BookOpen, Search, ShieldCheck, AlertCircle, CheckCircle2, ChevronRight, Stethoscope, FileText } from 'lucide-react';

interface PedomanInaCbgModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSearch?: string;
  onSelectPedomanRule?: (rule: InaCbgPedomanItem) => void;
}

export const PedomanInaCbgModal: React.FC<PedomanInaCbgModalProps> = ({
  isOpen,
  onClose,
  initialSearch = '',
  onSelectPedomanRule
}) => {
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [activeCategory, setActiveCategory] = useState<'ALL' | 'KODING' | 'MEDIS' | 'ADMINISTRASI'>('ALL');

  if (!isOpen) return null;

  const filteredItems = INA_CBG_PEDOMAN_EDISI_2.filter(item => {
    if (activeCategory !== 'ALL' && item.category !== activeCategory) return false;
    if (!searchTerm.trim()) return true;

    const q = searchTerm.toLowerCase();
    const titleMatch = item.diagnosaTitle.toLowerCase().includes(q);
    const chapterMatch = item.chapter.toLowerCase().includes(q);
    const kodingMatch = (item.aspekKoding || '').toLowerCase().includes(q);
    const medisMatch = (item.aspekMedis || '').toLowerCase().includes(q);
    const keywordMatch = item.keywords.some(k => k.toLowerCase().includes(q));

    return titleMatch || chapterMatch || kodingMatch || medisMatch || keywordMatch;
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Panduan Manual Verifikasi Klaim INA-CBG Edisi 2"
      maxWidth="max-w-4xl"
    >
      <div className="space-y-4">
        {/* Banner with Official Reference */}
        <div className="p-3.5 bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 border border-emerald-200 rounded-2xl flex items-start gap-3 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-base shrink-0 shadow-xs">
            <BookOpen className="w-5 h-5" />
          </div>
          <div className="space-y-0.5 text-xs">
            <h4 className="font-extrabold text-emerald-950 flex items-center gap-2">
              <span>Berita Acara Kesepakatan Bersama Kemenkes RI & BPJS Kesehatan</span>
              <span className="text-[10px] px-2 py-0.5 bg-emerald-200 text-emerald-900 rounded-full font-bold">
                Edisi 2 Resmi
              </span>
            </h4>
            <p className="text-[11px] text-emerald-900 leading-relaxed">
              Panduan Penatalaksanaan Solusi Permasalahan Klaim INA-CBG: Batas waktu penyelesaian <strong>Rawat Inap 2x24 Jam</strong>, <strong>Rawat Jalan & IGD 1x24 Jam</strong>, serta kaidah koding morbiditas ICD-10 & ICD-9-CM.
            </p>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari diagnosis (Typhoid, Sepsis, TB, DM, PPOK, Hipertensi, Batu Ginjal)..."
              className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            />
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs">
            {(['ALL', 'KODING', 'MEDIS', 'ADMINISTRASI'] as const).map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1 font-bold rounded-lg transition-colors cursor-pointer ${
                  activeCategory === cat
                    ? 'bg-white text-emerald-700 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {cat === 'ALL' ? 'Semua Bab' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* List of Guidelines */}
        <div className="max-h-[58vh] overflow-y-auto space-y-3 pr-1">
          {filteredItems.length === 0 ? (
            <div className="p-10 text-center text-slate-400 text-xs">
              Tidak ditemukan pedoman koding atau klinis yang cocok dengan kata kunci "{searchTerm}".
            </div>
          ) : (
            filteredItems.map(item => (
              <div
                key={item.id}
                className="bg-white border border-slate-200 hover:border-emerald-300 rounded-2xl p-4 shadow-2xs transition-all space-y-2.5 text-xs"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 pb-1.5 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-[11px]">
                      #{item.id}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      {item.chapter}
                    </span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    item.category === 'KODING'
                      ? 'bg-blue-100 text-blue-800 border border-blue-200'
                      : item.category === 'MEDIS'
                      ? 'bg-purple-100 text-purple-800 border border-purple-200'
                      : 'bg-amber-100 text-amber-800 border border-amber-200'
                  }`}>
                    Bab {item.category}
                  </span>
                </div>

                <div>
                  <h4 className="font-extrabold text-slate-900 text-xs">
                    {item.diagnosaTitle}
                  </h4>
                  {item.prosedurTitle && item.prosedurTitle !== '-' && (
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      Prosedur Terkait: <strong>{item.prosedurTitle}</strong>
                    </p>
                  )}
                </div>

                {item.aspekKoding && (
                  <div className="p-2.5 bg-blue-50/70 border border-blue-200 rounded-xl space-y-1">
                    <span className="text-[10px] uppercase font-bold text-blue-900 tracking-wider block">
                      Aspek Koding & Kaidah ICD-10 / ICD-9-CM:
                    </span>
                    <p className="text-slate-800 leading-relaxed font-medium">
                      {item.aspekKoding}
                    </p>
                  </div>
                )}

                {item.aspekMedis && (
                  <div className="p-2.5 bg-purple-50/70 border border-purple-200 rounded-xl space-y-1">
                    <span className="text-[10px] uppercase font-bold text-purple-900 tracking-wider block">
                      Kriteria Klinis & Indikasi Medis (PPK / Clinical Pathway):
                    </span>
                    <p className="text-slate-800 leading-relaxed font-medium">
                      {item.aspekMedis}
                    </p>
                  </div>
                )}

                {item.perhatianKhusus && item.perhatianKhusus !== '-' && (
                  <div className="p-2 bg-amber-50/70 border border-amber-200/90 rounded-xl text-[11px] text-amber-900 flex items-start gap-1.5 font-medium">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                    <span><strong>Perhatian Khusus Verifikator:</strong> {item.perhatianKhusus}</span>
                  </div>
                )}

                {onSelectPedomanRule && (
                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        onSelectPedomanRule(item);
                        onClose();
                      }}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <span>Terapkan Kaidah Pedoman</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-slate-200 text-xs">
          <span className="text-slate-500 text-[11px]">
            Menampilkan {filteredItems.length} pedoman dari total {INA_CBG_PEDOMAN_EDISI_2.length} aturan kesepakatan bersama.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 font-bold rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </Modal>
  );
};
