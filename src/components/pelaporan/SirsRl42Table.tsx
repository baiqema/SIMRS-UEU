import React from 'react';
import { SirsRl42Top10Row } from '../../data/sirsRl4Data';
import { Trophy, TrendingUp, Info } from 'lucide-react';

interface SirsRl42TableProps {
  data: SirsRl42Top10Row[];
}

export const SirsRl42Table: React.FC<SirsRl42TableProps> = ({ data }) => {
  // Top 10 rows (1 to 10)
  const rows = data.slice(0, 10);

  // Grand totals
  const totalHidupMatiL = rows.reduce((acc, r) => acc + r.hidupMatiL, 0);
  const totalHidupMatiP = rows.reduce((acc, r) => acc + r.hidupMatiP, 0);
  const totalHidupMati = rows.reduce((acc, r) => acc + r.hidupMatiTotal, 0);
  const totalMatiL = rows.reduce((acc, r) => acc + r.matiL, 0);
  const totalMatiP = rows.reduce((acc, r) => acc + r.matiP, 0);
  const totalMati = rows.reduce((acc, r) => acc + r.matiTotal, 0);

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
      {/* Title & Official Subtitle as per Screenshot B */}
      <div className="border-b pb-3">
        <div className="flex items-center gap-2">
          <span className="bg-blue-100 text-blue-900 border border-blue-200 font-extrabold px-2.5 py-0.5 rounded text-[10px]">
            SIRS REVISI 6.3 - FORMULIR RESMI
          </span>
          <span className="bg-amber-100 text-amber-900 border border-amber-200 font-black px-2.5 py-0.5 rounded text-[10px]">
            10 BESAR MORBIDITAS RAWAT INAP
          </span>
        </div>
        <h2 className="text-base font-black text-slate-900 flex items-center gap-2 mt-1">
          <Trophy className="w-5 h-5 text-amber-500" />
          <span>B. Formulir RL 4.2 10 Besar Penyakit Rawat Inap</span>
        </h2>
        <p className="text-xs text-slate-600 mt-0.5">
          Formulir 10 Besar Penyakit Rawat Inap dilaporkan <strong>bulanan</strong> dengan data yang bersumber dari <strong>formulir RL 4.1 Kompilasi Penyakit/Morbiditas Pasien Rawat Inap</strong>.
        </p>
      </div>

      {/* Top 3 Visual Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {rows.slice(0, 3).map((item, idx) => (
          <div
            key={item.code}
            className={`p-3.5 rounded-xl border flex items-start justify-between ${
              idx === 0
                ? 'bg-amber-50/70 border-amber-300 text-amber-950'
                : idx === 1
                ? 'bg-slate-50 border-slate-300 text-slate-900'
                : 'bg-orange-50/70 border-orange-300 text-orange-950'
            }`}
          >
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <span className={`w-5 h-5 rounded-full text-[11px] font-black flex items-center justify-center text-white ${
                  idx === 0 ? 'bg-amber-500' : idx === 1 ? 'bg-slate-500' : 'bg-orange-500'
                }`}>
                  {idx + 1}
                </span>
                <span className="font-mono font-bold text-xs bg-white px-2 py-0.5 rounded border border-slate-200">
                  {item.code}
                </span>
              </div>
              <h4 className="font-bold text-xs line-clamp-1">{item.name}</h4>
              <p className="text-[11px] text-slate-600">
                L: <strong>{item.hidupMatiL}</strong> | P: <strong>{item.hidupMatiP}</strong>
              </p>
            </div>
            <div className="text-right">
              <div className="text-xl font-black text-slate-900">{item.hidupMatiTotal}</div>
              <span className="text-[10px] font-bold text-slate-500">Pasien</span>
            </div>
          </div>
        ))}
      </div>

      {/* Exact Table Layout from Screenshot Cuplikan layar 2026-10-07 102118.png */}
      <div className="overflow-x-auto rounded-xl border border-slate-900">
        <table className="w-full text-left text-xs border-collapse border border-slate-900">
          <thead>
            {/* Header Level 1 */}
            <tr className="bg-white text-slate-900 font-bold border-b border-slate-900">
              <th className="p-2.5 border-r border-slate-900 text-center w-14" rowSpan={2}>
                No.
              </th>
              <th className="p-2.5 border-r border-slate-900 text-center w-36" rowSpan={2}>
                Kelompok ICD-10
              </th>
              <th className="p-2.5 border-r border-slate-900" rowSpan={2}>
                Kelompok Diagnosis Penyakit
              </th>
              <th className="p-2.5 border-r border-slate-900 text-center" colSpan={3}>
                Jumlah Pasien Hidup dan Mati Menurut Jenis Kelamin
              </th>
              <th className="p-2.5 text-center" colSpan={3}>
                Jumlah Pasien Keluar Mati
              </th>
            </tr>

            {/* Header Level 2 */}
            <tr className="bg-white text-slate-900 font-bold border-b border-slate-900 text-[11px]">
              <th className="p-2 border-r border-slate-900 text-center w-20">L</th>
              <th className="p-2 border-r border-slate-900 text-center w-20">P</th>
              <th className="p-2 border-r border-slate-900 text-center w-24 bg-slate-200">Total</th>
              <th className="p-2 border-r border-slate-900 text-center w-20">L</th>
              <th className="p-2 border-r border-slate-900 text-center w-20">P</th>
              <th className="p-2 text-center w-24 bg-slate-200">Total</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-900">
            {rows.map((row) => (
              <tr key={row.rank} className="hover:bg-slate-50">
                <td className="p-2 border-r border-slate-900 text-center font-bold text-slate-800">
                  {row.rank}
                </td>
                <td className="p-2 border-r border-slate-900 text-center font-mono font-bold text-blue-700">
                  {row.code}
                </td>
                <td className="p-2 border-r border-slate-900 font-semibold text-slate-900">
                  {row.name}
                </td>
                <td className="p-2 border-r border-slate-900 text-center font-mono font-semibold text-slate-900">
                  {row.hidupMatiL}
                </td>
                <td className="p-2 border-r border-slate-900 text-center font-mono font-semibold text-slate-900">
                  {row.hidupMatiP}
                </td>
                <td className="p-2 border-r border-slate-900 text-center font-mono font-bold bg-slate-200 text-slate-900">
                  {row.hidupMatiTotal}
                </td>
                <td className={`p-2 border-r border-slate-900 text-center font-mono font-semibold ${row.matiL > 0 ? 'text-rose-700 font-bold' : 'text-slate-900'}`}>
                  {row.matiL}
                </td>
                <td className={`p-2 border-r border-slate-900 text-center font-mono font-semibold ${row.matiP > 0 ? 'text-rose-700 font-bold' : 'text-slate-900'}`}>
                  {row.matiP}
                </td>
                <td className={`p-2 text-center font-mono font-bold bg-slate-200 ${row.matiTotal > 0 ? 'text-rose-900' : 'text-slate-900'}`}>
                  {row.matiTotal}
                </td>
              </tr>
            ))}
          </tbody>

          {/* Grand Total Footer */}
          <tfoot>
            <tr className="bg-slate-100 font-bold border-t-2 border-slate-900 text-xs">
              <td colSpan={3} className="p-2.5 text-right font-black border-r border-slate-900 pr-4">
                TOTAL 10 BESAR PENYAKIT RAWAT INAP:
              </td>
              <td className="p-2.5 text-center font-mono font-black border-r border-slate-900">
                {totalHidupMatiL}
              </td>
              <td className="p-2.5 text-center font-mono font-black border-r border-slate-900">
                {totalHidupMatiP}
              </td>
              <td className="p-2.5 text-center font-mono font-black border-r border-slate-900 bg-slate-300 text-slate-950">
                {totalHidupMati}
              </td>
              <td className="p-2.5 text-center font-mono font-black border-r border-slate-900 text-rose-800">
                {totalMatiL}
              </td>
              <td className="p-2.5 text-center font-mono font-black border-r border-slate-900 text-rose-800">
                {totalMatiP}
              </td>
              <td className="p-2.5 text-center font-mono font-black bg-slate-300 text-rose-950">
                {totalMati}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t">
        <span>Sumber Data: Kompilasi Morbiditas Pasien Rawat Inap (RL 4.1)</span>
        <span className="italic">Format Resmi Formulir RL 4.2 SIRS Online 6.3</span>
      </div>
    </div>
  );
};
