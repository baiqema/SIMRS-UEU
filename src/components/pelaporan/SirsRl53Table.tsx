import React from 'react';
import { SirsRl53Top10KunjunganRow } from '../../data/sirsRl5Data';
import { Users, TrendingUp, Info } from 'lucide-react';

interface SirsRl53TableProps {
  data: SirsRl53Top10KunjunganRow[];
}

export const SirsRl53Table: React.FC<SirsRl53TableProps> = ({ data }) => {
  // Top 10 rows (1 to 10)
  const rows = data.slice(0, 10);

  // Grand totals
  const totalKasusBaruL = rows.reduce((acc, r) => acc + r.kasusBaruL, 0);
  const totalKasusBaruP = rows.reduce((acc, r) => acc + r.kasusBaruP, 0);
  const totalKasusBaru = rows.reduce((acc, r) => acc + r.kasusBaruTotal, 0);
  const totalKunjunganL = rows.reduce((acc, r) => acc + r.kunjunganL, 0);
  const totalKunjunganP = rows.reduce((acc, r) => acc + r.kunjunganP, 0);
  const totalKunjungan = rows.reduce((acc, r) => acc + r.kunjunganTotal, 0);

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
      {/* Title & Official Subtitle as per Image 3 */}
      <div className="border-b pb-3">
        <div className="flex items-center gap-2">
          <span className="bg-blue-100 text-blue-900 border border-blue-200 font-extrabold px-2.5 py-0.5 rounded text-[10px]">
            SIRS REVISI 6.3 - FORMULIR RESMI
          </span>
          <span className="bg-sky-100 text-sky-900 border border-sky-200 font-black px-2.5 py-0.5 rounded text-[10px]">
            10 BESAR KUNJUNGAN RAWAT JALAN
          </span>
        </div>
        <h2 className="text-base font-black text-slate-900 flex items-center gap-2 mt-1">
          <Users className="w-5 h-5 text-sky-600" />
          <span>C. Formulir RL 5.3 10 Besar Kunjungan Penyakit Rawat Jalan</span>
        </h2>
        <p className="text-xs text-slate-600 mt-0.5">
          Formulir 10 Besar Kunjungan Penyakit Rawat Jalan dilaporkan <strong>bulanan</strong> dengan data yang bersumber dari <strong>formulir RL 5.1 Kompilasi Penyakit/Morbiditas Pasien Rawat Jalan</strong>.
        </p>
      </div>

      {/* Top 3 Visual Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {rows.slice(0, 3).map((item, idx) => (
          <div
            key={item.code}
            className={`p-3.5 rounded-xl border flex items-start justify-between ${
              idx === 0
                ? 'bg-sky-50/80 border-sky-300 text-sky-950'
                : idx === 1
                ? 'bg-blue-50/70 border-blue-200 text-blue-950'
                : 'bg-indigo-50/70 border-indigo-200 text-indigo-950'
            }`}
          >
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <span className={`w-5 h-5 rounded-full text-[11px] font-black flex items-center justify-center text-white ${
                  idx === 0 ? 'bg-sky-600' : idx === 1 ? 'bg-blue-600' : 'bg-indigo-600'
                }`}>
                  {idx + 1}
                </span>
                <span className="font-mono font-bold text-xs bg-white px-2 py-0.5 rounded border border-slate-200">
                  {item.code}
                </span>
              </div>
              <h4 className="font-bold text-xs line-clamp-1">{item.name}</h4>
              <p className="text-[11px] text-slate-600">
                Kunjungan L: <strong>{item.kunjunganL}</strong> | P: <strong>{item.kunjunganP}</strong>
              </p>
            </div>
            <div className="text-right">
              <div className="text-xl font-black text-sky-800">{item.kunjunganTotal}</div>
              <span className="text-[10px] font-bold text-slate-500">Kunjungan</span>
            </div>
          </div>
        ))}
      </div>

      {/* Exact Table Layout from Image 3 */}
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
                Jumlah Kasus Baru Menurut Jenis Kelamin
              </th>
              <th className="p-2.5 text-center" colSpan={3}>
                Jumlah Kunjungan
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

          <tbody className="divide-y divide-slate-900 font-mono text-xs">
            {rows.map((row) => (
              <tr key={row.rank} className="hover:bg-slate-50">
                <td className="p-2 border-r border-slate-900 text-center font-bold text-slate-800 font-sans">
                  {row.rank}
                </td>
                <td className="p-2 border-r border-slate-900 text-center font-bold text-blue-700">
                  {row.code}
                </td>
                <td className="p-2 border-r border-slate-900 font-semibold text-slate-900 font-sans">
                  {row.name}
                </td>
                <td className="p-2 border-r border-slate-900 text-center font-semibold text-slate-900">
                  {row.kasusBaruL}
                </td>
                <td className="p-2 border-r border-slate-900 text-center font-semibold text-slate-900">
                  {row.kasusBaruP}
                </td>
                <td className="p-2 border-r border-slate-900 text-center font-bold bg-slate-200 text-slate-950">
                  {row.kasusBaruTotal}
                </td>
                <td className="p-2 border-r border-slate-900 text-center font-semibold text-slate-900">
                  {row.kunjunganL}
                </td>
                <td className="p-2 border-r border-slate-900 text-center font-semibold text-slate-900">
                  {row.kunjunganP}
                </td>
                <td className="p-2 text-center font-bold bg-slate-200 text-slate-950">
                  {row.kunjunganTotal}
                </td>
              </tr>
            ))}
          </tbody>

          {/* Grand Total Footer */}
          <tfoot>
            <tr className="bg-slate-100 font-bold border-t-2 border-slate-900 text-xs">
              <td colSpan={3} className="p-2.5 text-right font-black border-r border-slate-900 pr-4 font-sans">
                TOTAL 10 BESAR KUNJUNGAN RAWAT JALAN:
              </td>
              <td className="p-2.5 text-center font-mono font-black border-r border-slate-900 text-slate-900">
                {totalKasusBaruL}
              </td>
              <td className="p-2.5 text-center font-mono font-black border-r border-slate-900 text-slate-900">
                {totalKasusBaruP}
              </td>
              <td className="p-2.5 text-center font-mono font-black border-r border-slate-900 bg-slate-300 text-slate-950">
                {totalKasusBaru}
              </td>
              <td className="p-2.5 text-center font-mono font-black border-r border-slate-900 text-slate-900">
                {totalKunjunganL}
              </td>
              <td className="p-2.5 text-center font-mono font-black border-r border-slate-900 text-slate-900">
                {totalKunjunganP}
              </td>
              <td className="p-2.5 text-center font-mono font-black bg-slate-300 text-slate-950">
                {totalKunjungan}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Official Footnotes / Instructions from Image 3 */}
      <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-1">
        <h5 className="font-bold text-slate-900">Pengisian formulir RL 5.3 10 Besar Kunjungan Penyakit Rawat Jalan sebagai berikut:</h5>
        <ol className="list-decimal pl-4 space-y-0.5 text-slate-600">
          <li>Data 10 Besar Kunjungan Penyakit Rawat Jalan merupakan hasil dari Kompilasi Penyakit/Morbiditas Pasien Rawat Jalan, yang dikelompokkan berdasarkan Kelompok ICD-10 kemudian diurutkan berdasarkan jumlah terbanyak pada kolom Total Jumlah Kunjungan.</li>
          <li>Kunjungan mencakup seluruh kontak pelayanan medis rawat jalan pasien baru maupun pasien kontrol ulang (lama).</li>
        </ol>
      </div>
    </div>
  );
};
