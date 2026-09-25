import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { KMK_METADATA_1423, KmkVariableItem } from '../data/kmkMetadata1423';
import { Modal } from '../components/Modal';
import {
  ShieldAlert, Stethoscope, Bed, Baby, FlaskConical, Pill, Database,
  Search, BookOpen, Download, Printer, Filter, CheckCircle2, ChevronRight,
  Info, Sparkles, FileText, ArrowRight, ExternalLink, HelpCircle, Layers
} from 'lucide-react';

export const MetadataRmeView: React.FC = () => {
  const { navigate } = useApp();

  const [activeDatasetTab, setActiveDatasetTab] = useState<string>('IGD');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [dataTypeFilter, setDataTypeFilter] = useState<string>('all');
  const [selectedItem, setSelectedItem] = useState<KmkVariableItem | null>(null);

  const datasetCategories = [
    { id: 'IGD', label: 'A. Instalasi Gawat Darurat (IGD)', shortLabel: 'IGD', icon: ShieldAlert, color: 'from-blue-900 to-indigo-950', badge: 'bg-blue-900 text-blue-100' },
    { id: 'Rawat Jalan', label: 'B. Rawat Jalan', shortLabel: 'Rawat Jalan', icon: Stethoscope, color: 'from-blue-800 to-sky-950', badge: 'bg-sky-900 text-sky-100' },
    { id: 'Rawat Inap', label: 'C. Rawat Inap', shortLabel: 'Rawat Inap', icon: Bed, color: 'from-indigo-900 to-slate-900', badge: 'bg-indigo-900 text-indigo-100' },
    { id: 'Bayi Baru Lahir', label: 'Bayi Baru Lahir (Neonatus)', shortLabel: 'Bayi Baru Lahir', icon: Baby, color: 'from-cyan-900 to-blue-950', badge: 'bg-cyan-900 text-cyan-100' },
    { id: 'Laboratorium', label: 'D. Laboratorium', shortLabel: 'Laboratorium', icon: FlaskConical, color: 'from-slate-900 to-blue-950', badge: 'bg-slate-900 text-slate-100' },
    { id: 'Apotek', label: 'E. Apotek / Farmasi', shortLabel: 'Apotek', icon: Pill, color: 'from-blue-950 to-indigo-900', badge: 'bg-blue-950 text-blue-100' },
    { id: 'ALL', label: 'Semua Variabel Standar', shortLabel: 'Semua Dataset', icon: Database, color: 'from-blue-900 to-slate-900', badge: 'bg-blue-900 text-white' }
  ];

  // Filtering variables
  const filteredVariables = useMemo(() => {
    return KMK_METADATA_1423.filter(item => {
      // Tab filter
      if (activeDatasetTab !== 'ALL' && item.dataset !== activeDatasetTab) {
        return false;
      }
      // Data type filter
      if (dataTypeFilter !== 'all' && item.dataType !== dataTypeFilter) {
        return false;
      }
      // Query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = item.variableName.toLowerCase().includes(q);
        const matchDef = item.operationalDefinition.toLowerCase().includes(q);
        const matchRef = item.reference.toLowerCase().includes(q);
        const matchNo = item.no.toLowerCase().includes(q);
        const matchSec = item.section.toLowerCase().includes(q);
        const matchFmt = item.formatValue.toLowerCase().includes(q);
        return matchName || matchDef || matchRef || matchNo || matchSec || matchFmt;
      }
      return true;
    });
  }, [activeDatasetTab, dataTypeFilter, searchQuery]);

  // Statistics counters
  const totalVars = KMK_METADATA_1423.length;
  const igdCount = KMK_METADATA_1423.filter(v => v.dataset === 'IGD').length;
  const rjCount = KMK_METADATA_1423.filter(v => v.dataset === 'Rawat Jalan').length;
  const riCount = KMK_METADATA_1423.filter(v => v.dataset === 'Rawat Inap').length;
  const bblCount = KMK_METADATA_1423.filter(v => v.dataset === 'Bayi Baru Lahir').length;
  const labCount = KMK_METADATA_1423.filter(v => v.dataset === 'Laboratorium').length;
  const aptCount = KMK_METADATA_1423.filter(v => v.dataset === 'Apotek').length;

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const headers = ['Dataset', 'Section', 'No', 'Nama Variabel', 'Tipe Data', 'Format / Nilai', 'Definisi Operasional', 'Referensi Standar'];
    const rows = filteredVariables.map(v => [
      `"${v.dataset}"`,
      `"${v.section}"`,
      `"${v.no}"`,
      `"${v.variableName}"`,
      `"${v.dataType}"`,
      `"${v.formatValue.replace(/"/g, '""')}"`,
      `"${v.operationalDefinition.replace(/"/g, '""')}"`,
      `"${v.reference}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Metadata_RME_KMK_1423_${activeDatasetTab}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Navy Blue Hero Header */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-blue-900 text-white rounded-3xl p-6 md:p-8 shadow-lg border border-blue-800/60 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full bg-blue-800 text-blue-100 text-[11px] font-black tracking-wider uppercase border border-blue-600 shadow-xs flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-cyan-300" />
                KMK HK.01.07/MENKES/1423/2022
              </span>
              <span className="px-2.5 py-1 rounded-full bg-cyan-900/80 text-cyan-200 text-[10px] font-bold border border-cyan-700">
                Pedoman Variabel & Meta Data RME Resmi
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Kamus Variabel & Metadata Rekam Medis Elektronik
            </h1>
            <p className="text-xs sm:text-sm text-blue-200 leading-relaxed">
              Standar baku elemen data klinis Kementerian Kesehatan RI untuk interoperabilitas sistem rekam medis elektronik rumah sakit, terbagi berurutan dari dataset IGD, Rawat Jalan, Rawat Inap, Bayi Baru Lahir, Laboratorium, dan Apotek.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={handleExportCSV}
              className="px-4 py-2.5 bg-blue-700 hover:bg-blue-600 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer border border-blue-500"
              title="Unduh format spreadsheet CSV"
            >
              <Download className="w-4 h-4" /> Unduh CSV
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-blue-200 text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer border border-slate-700"
            >
              <Printer className="w-4 h-4" /> Cetak Pedoman
            </button>
          </div>
        </div>

        {/* Statistical Summary Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 mt-6 pt-6 border-t border-blue-800/60">
          <div className="bg-slate-900/60 p-3 rounded-2xl border border-blue-700/40">
            <span className="text-[10px] font-bold text-blue-300 uppercase">Total Variabel</span>
            <p className="text-lg font-black text-white mt-0.5">{totalVars} Elemen</p>
          </div>
          <div className="bg-slate-900/60 p-3 rounded-2xl border border-blue-700/40">
            <span className="text-[10px] font-bold text-cyan-300 uppercase">A. IGD</span>
            <p className="text-lg font-black text-cyan-100 mt-0.5">{igdCount} Variabel</p>
          </div>
          <div className="bg-slate-900/60 p-3 rounded-2xl border border-blue-700/40">
            <span className="text-[10px] font-bold text-sky-300 uppercase">B. Rawat Jalan</span>
            <p className="text-lg font-black text-sky-100 mt-0.5">{rjCount} Variabel</p>
          </div>
          <div className="bg-slate-900/60 p-3 rounded-2xl border border-blue-700/40">
            <span className="text-[10px] font-bold text-indigo-300 uppercase">C. Rawat Inap</span>
            <p className="text-lg font-black text-indigo-100 mt-0.5">{riCount} Variabel</p>
          </div>
          <div className="bg-slate-900/60 p-3 rounded-2xl border border-blue-700/40">
            <span className="text-[10px] font-bold text-teal-300 uppercase">Bayi Baru Lahir</span>
            <p className="text-lg font-black text-teal-100 mt-0.5">{bblCount} Variabel</p>
          </div>
          <div className="bg-slate-900/60 p-3 rounded-2xl border border-blue-700/40">
            <span className="text-[10px] font-bold text-blue-300 uppercase">D. Lab & E. Apotek</span>
            <p className="text-lg font-black text-white mt-0.5">{labCount + aptCount} Variabel</p>
          </div>
        </div>
      </div>

      {/* Dataset Tabs - Arranged in exact KMK Order */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
          {datasetCategories.map(cat => {
            const Icon = cat.icon;
            const isActive = activeDatasetTab === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveDatasetTab(cat.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                  isActive
                    ? 'bg-blue-900 text-white shadow-md font-black scale-[1.02]'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-blue-950'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-300' : 'text-blue-800'}`} />
                <span>{cat.shortLabel}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Cari variabel, definisi, format, atau referensi standar..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <div className="flex items-center gap-1.5 text-xs text-slate-600 font-bold">
            <Filter className="w-3.5 h-3.5 text-blue-700" />
            <span className="hidden sm:inline">Tipe Data:</span>
            <select
              value={dataTypeFilter}
              onChange={e => setDataTypeFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="all">Semua Tipe Data</option>
              <option value="karakter">Karakter (String)</option>
              <option value="numerik">Numerik (Angka)</option>
              <option value="alphanumerik">Alphanumerik</option>
              <option value="tanggal, waktu">Tanggal & Waktu</option>
              <option value="alphabet">Alphabet</option>
            </select>
          </div>
          <span className="text-xs font-bold text-blue-900 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-200">
            {filteredVariables.length} Ditemukan
          </span>
        </div>
      </div>

      {/* Main KMK Metadata Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white font-bold uppercase tracking-wider text-[11px]">
                <th className="p-3.5 w-24">No / Urutan</th>
                <th className="p-3.5">Nama Variabel Rekam Medis</th>
                <th className="p-3.5">Tipe Data</th>
                <th className="p-3.5">Format / Value</th>
                <th className="p-3.5 max-w-md">Definisi Operasional</th>
                <th className="p-3.5">Referensi Standar</th>
                <th className="p-3.5 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {filteredVariables.map((item, idx) => {
                return (
                  <tr
                    key={item.id + idx}
                    onClick={() => setSelectedItem(item)}
                    className="hover:bg-blue-50/60 transition-colors cursor-pointer"
                  >
                    <td className="p-3.5 font-mono font-bold text-blue-900">
                      <span className="bg-blue-100 px-2 py-0.5 rounded-md text-[11px]">
                        {item.no}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <div className="font-bold text-slate-900 text-xs">
                        {item.variableName}
                        {item.required && (
                          <span className="text-rose-600 font-bold ml-1" title="Mandatori / Wajib Diisi">*</span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-500 font-sans mt-0.5 flex items-center gap-1">
                        <span className="font-bold text-blue-700">{item.dataset}</span>
                        <span>•</span>
                        <span>{item.section}</span>
                      </div>
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 font-mono">
                        {item.dataType}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <div className="font-mono text-[11px] text-slate-800 bg-blue-50/40 p-1.5 rounded-lg border border-blue-100 max-w-xs truncate">
                        {item.formatValue}
                      </div>
                    </td>
                    <td className="p-3.5 max-w-md">
                      <p className="text-slate-600 text-xs leading-relaxed line-clamp-2">
                        {item.operationalDefinition}
                      </p>
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-1 rounded-md text-[10px] font-bold bg-indigo-50 text-indigo-900 border border-indigo-200 inline-flex items-center gap-1">
                        <BookOpen className="w-3 h-3 text-indigo-600" />
                        {item.reference}
                      </span>
                    </td>
                    <td className="p-3.5 text-center">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedItem(item);
                        }}
                        className="p-1.5 text-blue-700 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
                        title="Lihat Detail Variabel"
                      >
                        <Info className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}

              {filteredVariables.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-400 space-y-2">
                    <Database className="w-8 h-8 mx-auto text-slate-300" />
                    <p className="text-xs font-bold text-slate-600">Tidak ada variabel yang sesuai dengan filter.</p>
                    <p className="text-[11px] text-slate-400">Silakan ubah kata kunci pencarian atau pilih kategori dataset lainnya.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Variable Detail Modal */}
      {selectedItem && (
        <Modal
          isOpen={!!selectedItem}
          onClose={() => setSelectedItem(null)}
          title={`Detail Variabel: ${selectedItem.variableName}`}
        >
          <div className="space-y-4 text-xs">
            <div className="bg-slate-900 text-white p-4 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 bg-blue-600 text-white text-[10px] font-black rounded-md font-mono">
                  KODE {selectedItem.no}
                </span>
                <span className="text-[11px] font-bold text-cyan-300">
                  {selectedItem.dataset}
                </span>
              </div>
              <h3 className="text-base font-bold text-white">
                {selectedItem.variableName}
              </h3>
              <p className="text-[11px] text-blue-200">
                {selectedItem.section} {selectedItem.subSection ? `• ${selectedItem.subSection}` : ''}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                <span className="font-bold text-slate-500 uppercase text-[10px]">Tipe Data</span>
                <p className="font-mono font-bold text-blue-900">{selectedItem.dataType}</p>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                <span className="font-bold text-slate-500 uppercase text-[10px]">Referensi Standar</span>
                <p className="font-bold text-indigo-900">{selectedItem.reference}</p>
              </div>
            </div>

            <div className="bg-blue-50/60 p-3.5 rounded-xl border border-blue-200 space-y-1.5">
              <span className="font-bold text-blue-950 uppercase text-[10px]">Format / Value Standar</span>
              <p className="font-mono text-slate-800 bg-white p-2 rounded-lg border border-blue-100 text-xs break-words">
                {selectedItem.formatValue}
              </p>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1.5">
              <span className="font-bold text-slate-700 uppercase text-[10px]">Definisi Operasional</span>
              <p className="text-slate-800 leading-relaxed text-xs">
                {selectedItem.operationalDefinition}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-between items-center">
              <span className="text-[10px] text-slate-400 font-mono">
                KMK HK.01.07/MENKES/1423/2022
              </span>
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="px-4 py-2 bg-blue-900 text-white rounded-xl font-bold text-xs hover:bg-blue-800 cursor-pointer transition-colors shadow-xs"
              >
                Tutup
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
