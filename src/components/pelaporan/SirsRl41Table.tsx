import React, { useState } from 'react';
import { SIRS_63_AGE_GROUPS, SirsRl41Row } from '../../data/sirsRl4Data';
import { Layers, Search, Filter, Printer, Download, Info } from 'lucide-react';

interface SirsRl41TableProps {
  data: SirsRl41Row[];
  selectedPeriodMonth: string;
  selectedPeriodYear: string;
}

export const SirsRl41Table: React.FC<SirsRl41TableProps> = ({
  data,
  selectedPeriodMonth,
  selectedPeriodYear,
}) => {
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedLetter, setSelectedLetter] = useState('SEMUA');

  const filteredData = data.filter(item => {
    const itemCode = String(item?.code || '');
    const itemName = String(item?.name || '');
    const matchLetter = selectedLetter === 'SEMUA' || itemCode.toUpperCase().startsWith(selectedLetter);
    const matchSearch = itemCode.toLowerCase().includes(searchFilter.toLowerCase()) || itemName.toLowerCase().includes(searchFilter.toLowerCase());
    return matchLetter && matchSearch;
  });

  // Calculate totals across all filtered rows
  const grandTotalHidupMatiL = filteredData.reduce((acc, row) => acc + row.hidupMatiL, 0);
  const grandTotalHidupMatiP = filteredData.reduce((acc, row) => acc + row.hidupMatiP, 0);
  const grandTotalHidupMati = filteredData.reduce((acc, row) => acc + row.hidupMatiTotal, 0);
  const grandTotalMatiL = filteredData.reduce((acc, row) => acc + row.matiL, 0);
  const grandTotalMatiP = filteredData.reduce((acc, row) => acc + row.matiP, 0);
  const grandTotalMati = filteredData.reduce((acc, row) => acc + row.matiTotal, 0);

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
      {/* Title & Official Subtitle */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-blue-100 text-blue-900 border border-blue-200 font-extrabold px-2.5 py-0.5 rounded text-[10px]">
              SIRS REVISI 6.3 RESMI KEMENKES RI
            </span>
            <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 font-black px-2 py-0.5 rounded text-[10px]">
              25 KELOMPOK UMUR & JENIS KELAMIN
            </span>
          </div>
          <h2 className="text-base font-black text-slate-900 flex items-center gap-2 mt-1">
            <Layers className="w-5 h-5 text-blue-600" />
            <span>A. Formulir RL 4.1 Kompilasi Penyakit/Morbiditas Pasien Rawat Inap</span>
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Formulir Kompilasi Penyakit/Morbiditas Pasien Rawat Inap dilaporkan <strong>bulanan</strong> dengan data yang bersumber dari <strong>Instalasi Rawat Inap dan Instalasi Rekam Medis</strong>.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Cari Kode ICD / Diagnosis..."
              value={searchFilter}
              onChange={e => setSearchFilter(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl font-medium text-xs w-60 focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* ALPHABET QUICK JUMP BAR A-Z */}
      <div className="bg-slate-100 p-2 rounded-xl border border-slate-200 flex items-center gap-1 overflow-x-auto scrollbar-none">
        <span className="text-[10px] font-black text-slate-600 px-2 uppercase shrink-0">Filter Abjad ICD:</span>
        {['SEMUA', ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')].map(letter => (
          <button
            key={letter}
            type="button"
            onClick={() => setSelectedLetter(letter)}
            className={`px-2 py-1 rounded-lg text-[11px] font-black shrink-0 transition-all cursor-pointer ${
              selectedLetter === letter
                ? 'bg-blue-700 text-white shadow-xs scale-105'
                : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            {letter}
          </button>
        ))}
      </div>

      {/* Scroll Guide Indicator */}
      <div className="flex items-center justify-between text-[11px] text-slate-500 bg-blue-50/70 px-3 py-1.5 rounded-xl border border-blue-100">
        <span className="flex items-center gap-1.5 font-medium text-blue-900">
          <Info className="w-3.5 h-3.5 text-blue-600 shrink-0" />
          <span>Kolom <strong>No</strong>, <strong>Kode ICD</strong>, dan <strong>Diagnosis Penyakit</strong> terkunci rapi (freeze) di sebelah kiri saat tabel digeser.</span>
        </span>
        <span className="font-bold text-blue-700 hidden sm:inline text-[11px]">
          &larr; Geser tabel horizontal &rarr; (25 Kelompok Umur & Mortalitas)
        </span>
      </div>

      {/* Official SIRS 6.3 Table (25 Kelompok Umur x L/P) */}
      <div className="overflow-x-auto rounded-xl border border-slate-300 shadow-inner bg-slate-50 relative isolate">
        <table className="w-full text-left text-[11px] border-separate border-spacing-0 min-w-[2250px] table-fixed">
          {/* Exact column layout enforcement */}
          <colgroup>
            <col style={{ width: 48, minWidth: 48, maxWidth: 48 }} />
            <col style={{ width: 84, minWidth: 84, maxWidth: 84 }} />
            <col style={{ width: 280, minWidth: 280, maxWidth: 280 }} />
            {/* 50 columns for 25 age groups (L & P) */}
            {Array.from({ length: 50 }).map((_, i) => (
              <col key={`col-ag-${i}`} style={{ width: 36, minWidth: 36, maxWidth: 36 }} />
            ))}
            {/* Hidup dan Mati JK: L, P, Total */}
            <col style={{ width: 48, minWidth: 48 }} />
            <col style={{ width: 48, minWidth: 48 }} />
            <col style={{ width: 56, minWidth: 56 }} />
            {/* Keluar Mati: L, P, Total */}
            <col style={{ width: 48, minWidth: 48 }} />
            <col style={{ width: 48, minWidth: 48 }} />
            <col style={{ width: 56, minWidth: 56 }} />
          </colgroup>

          <thead>
            {/* Row 1: Super Header */}
            <tr className="bg-slate-100 text-slate-900 font-bold">
              <th
                className="p-2 border-b border-r border-slate-300 text-center sticky bg-slate-100 z-30"
                rowSpan={3}
                style={{ left: 0, width: 48, minWidth: 48, maxWidth: 48 }}
              >
                No
              </th>
              <th
                className="p-2 border-b border-r border-slate-300 text-center sticky bg-slate-100 z-30"
                rowSpan={3}
                style={{ left: 48, width: 84, minWidth: 84, maxWidth: 84 }}
              >
                Kode ICD
              </th>
              <th
                className="p-2 border-b border-r-2 border-slate-400 text-left sticky bg-slate-100 z-30 shadow-[4px_0_8px_-2px_rgba(0,0,0,0.15)]"
                rowSpan={3}
                style={{ left: 132, width: 280, minWidth: 280, maxWidth: 280 }}
              >
                Diagnosis Penyakit
              </th>
              <th className="p-2 border-b border-r border-slate-300 text-center bg-slate-200" colSpan={50}>
                Jumlah Pasien Keluar Hidup dan Mati Menurut Kelompok Umur & Jenis Kelamin
              </th>
              <th className="p-2 border-b border-r border-slate-300 text-center bg-slate-100" colSpan={3}>
                Jumlah Pasien Keluar Hidup dan Mati Menurut Jenis Kelamin
              </th>
              <th className="p-2 border-b border-slate-300 text-center bg-slate-200" colSpan={3}>
                Jumlah Pasien Keluar Mati
              </th>
            </tr>

            {/* Row 2: Age Group Names */}
            <tr className="bg-slate-50 text-slate-800 font-bold text-[10px]">
              {SIRS_63_AGE_GROUPS.map(ag => (
                <th key={ag.key} className="p-1 border-b border-r border-slate-300 text-center whitespace-nowrap overflow-hidden" colSpan={2}>
                  {ag.label}
                </th>
              ))}
              {/* Jenis Kelamin Total Header */}
              <th className="p-1 border-b border-r border-slate-300 text-center" rowSpan={2}>L</th>
              <th className="p-1 border-b border-r border-slate-300 text-center" rowSpan={2}>P</th>
              <th className="p-1 border-b border-r border-slate-300 text-center bg-slate-200 font-black" rowSpan={2}>Total</th>
              {/* Keluar Mati Header */}
              <th className="p-1 border-b border-r border-slate-300 text-center" rowSpan={2}>L</th>
              <th className="p-1 border-b border-r border-slate-300 text-center" rowSpan={2}>P</th>
              <th className="p-1 border-b border-slate-300 text-center bg-slate-200 font-black" rowSpan={2}>Total</th>
            </tr>

            {/* Row 3: Gender L / P for each of the 25 age groups */}
            <tr className="bg-slate-100 text-slate-700 font-bold text-[9px]">
              {SIRS_63_AGE_GROUPS.flatMap(ag => [
                <th key={`${ag.key}-L`} className="p-0.5 border-b border-r border-slate-200 text-center">L</th>,
                <th key={`${ag.key}-P`} className="p-0.5 border-b border-r border-slate-300 text-center">P</th>
              ])}
            </tr>
          </thead>

          <tbody className="font-sans text-[11px]">
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan={59} className="p-8 text-center text-slate-500 italic border-b border-slate-200 bg-white">
                  Tidak ada data diagnosis yang cocok dengan filter.
                </td>
              </tr>
            ) : (
              filteredData.map((row, idx) => (
                <tr key={row.code} className="group hover:bg-blue-50/60 transition-colors">
                  <td
                    className="p-1.5 text-center font-bold text-slate-600 border-b border-r border-slate-200 sticky bg-white group-hover:bg-blue-50 z-20"
                    style={{ left: 0, width: 48, minWidth: 48, maxWidth: 48 }}
                  >
                    {idx + 1}
                  </td>
                  <td
                    className="p-1.5 text-center font-mono font-bold text-blue-700 border-b border-r border-slate-200 sticky bg-white group-hover:bg-blue-50 z-20"
                    style={{ left: 48, width: 84, minWidth: 84, maxWidth: 84 }}
                  >
                    {row.code}
                  </td>
                  <td
                    className="p-1.5 font-semibold text-slate-900 border-b border-r-2 border-slate-400 sticky bg-white group-hover:bg-blue-50 z-20 truncate shadow-[4px_0_8px_-2px_rgba(0,0,0,0.15)]"
                    style={{ left: 132, width: 280, minWidth: 280, maxWidth: 280 }}
                    title={row.name}
                  >
                    {row.name}
                  </td>

                  {/* 25 Age Groups x 2 (L, P) - Zeroes are NOT blurred! Clearly crisp text-slate-900 */}
                  {SIRS_63_AGE_GROUPS.flatMap(ag => {
                    const counts = row.ageCounts[ag.key] || { L: 0, P: 0 };
                    return [
                      <td
                        key={`${row.code}-${ag.key}-L`}
                        className={`p-1 text-center border-b border-r border-slate-100 font-mono ${
                          counts.L > 0
                            ? 'font-bold text-blue-950 bg-blue-50/70'
                            : 'font-semibold text-slate-900 bg-white'
                        }`}
                      >
                        {counts.L}
                      </td>,
                      <td
                        key={`${row.code}-${ag.key}-P`}
                        className={`p-1 text-center border-b border-r border-slate-200 font-mono ${
                          counts.P > 0
                            ? 'font-bold text-pink-950 bg-pink-50/70'
                            : 'font-semibold text-slate-900 bg-white'
                        }`}
                      >
                        {counts.P}
                      </td>
                    ];
                  })}

                  {/* Jumlah Pasien Keluar Hidup dan Mati Menurut Jenis Kelamin */}
                  <td className="p-1.5 text-center font-mono font-bold text-slate-900 border-b border-r border-slate-200 bg-slate-50">
                    {row.hidupMatiL}
                  </td>
                  <td className="p-1.5 text-center font-mono font-bold text-slate-900 border-b border-r border-slate-200 bg-slate-50">
                    {row.hidupMatiP}
                  </td>
                  <td className="p-1.5 text-center font-mono font-black text-blue-900 border-b border-r border-slate-300 bg-slate-200">
                    {row.hidupMatiTotal}
                  </td>

                  {/* Jumlah Pasien Keluar Mati - Zeroes are crisp and clear */}
                  <td className={`p-1.5 text-center font-mono border-b border-r border-slate-200 ${
                    row.matiL > 0 ? 'text-rose-700 bg-rose-50 font-bold' : 'text-slate-900 font-semibold bg-white'
                  }`}>
                    {row.matiL}
                  </td>
                  <td className={`p-1.5 text-center font-mono border-b border-r border-slate-200 ${
                    row.matiP > 0 ? 'text-rose-700 bg-rose-50 font-bold' : 'text-slate-900 font-semibold bg-white'
                  }`}>
                    {row.matiP}
                  </td>
                  <td className={`p-1.5 text-center font-mono border-b border-slate-300 ${
                    row.matiTotal > 0 ? 'text-rose-900 bg-rose-100 font-black' : 'text-slate-900 font-bold bg-slate-100'
                  }`}>
                    {row.matiTotal}
                  </td>
                </tr>
              ))
            )}
          </tbody>

          {/* Grand Total Row */}
          <tfoot>
            <tr className="bg-slate-200 font-bold border-t-2 border-slate-400 text-[11px] text-slate-900">
              <td
                colSpan={3}
                className="p-2 font-black text-right pr-4 border-b border-r-2 border-slate-400 sticky bg-slate-200 z-20 shadow-[4px_0_8px_-2px_rgba(0,0,0,0.15)]"
                style={{ left: 0, width: 412, minWidth: 412, maxWidth: 412 }}
              >
                TOTAL KESELURUHAN (KOMPILASI RL 4.1):
              </td>
              {SIRS_63_AGE_GROUPS.flatMap(ag => {
                const totalL = filteredData.reduce((acc, r) => acc + (r.ageCounts[ag.key]?.L || 0), 0);
                const totalP = filteredData.reduce((acc, r) => acc + (r.ageCounts[ag.key]?.P || 0), 0);
                return [
                  <td key={`tot-${ag.key}-L`} className="p-1 text-center font-mono border-b border-r border-slate-300 font-black text-slate-900">
                    {totalL}
                  </td>,
                  <td key={`tot-${ag.key}-P`} className="p-1 text-center font-mono border-b border-r border-slate-300 font-black text-slate-900">
                    {totalP}
                  </td>
                ];
              })}
              <td className="p-2 text-center font-mono font-black border-b border-r border-slate-300 bg-slate-300 text-blue-950">
                {grandTotalHidupMatiL}
              </td>
              <td className="p-2 text-center font-mono font-black border-b border-r border-slate-300 bg-slate-300 text-pink-950">
                {grandTotalHidupMatiP}
              </td>
              <td className="p-2 text-center font-mono font-black border-b border-r border-slate-400 bg-slate-400 text-white">
                {grandTotalHidupMati}
              </td>
              <td className="p-2 text-center font-mono font-black border-b border-r border-slate-300 bg-rose-200 text-rose-950">
                {grandTotalMatiL}
              </td>
              <td className="p-2 text-center font-mono font-black border-b border-r border-slate-300 bg-rose-200 text-rose-950">
                {grandTotalMatiP}
              </td>
              <td className="p-2 text-center font-mono font-black border-b border-slate-300 bg-rose-300 text-rose-950">
                {grandTotalMati}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Official SIRS 6.3 Footnotes as shown in screenshot */}
      <div className="flex flex-wrap items-center justify-between text-xs text-slate-600 pt-1 border-t border-slate-200">
        <div className="flex items-center gap-6 font-medium">
          <span>*) <strong>L</strong> = Laki-laki, <strong>P</strong> = Perempuan</span>
          <span>**) <strong>hr</strong> = hari, <strong>bln</strong> = bulan, <strong>th</strong> = tahun</span>
        </div>
        <div className="text-[11px] text-slate-500 italic">
          Standar: Formulir RL 4.1 SIRS Online Kemenkes RI Revisi 6.3
        </div>
      </div>
    </div>
  );
};
