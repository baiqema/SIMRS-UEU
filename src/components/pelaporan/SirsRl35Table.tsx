import React, { useState } from 'react';
import { SirsRl35Row } from '../../data/sirsRl3Data';
import { Search } from 'lucide-react';

interface SirsRl35TableProps {
  data: SirsRl35Row[];
  rataHariBuka?: number;
  rataKunjunganPerHari?: number;
}

export const SirsRl35Table: React.FC<SirsRl35TableProps> = ({
  data,
  rataHariBuka = 26,
  rataKunjunganPerHari
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredData = data.filter(row => {
    if (row.no === '99' || row.isTotal || row.isSpecialRow) return true;
    if (!searchTerm.trim()) return true;
    return row.jenisKegiatan.toLowerCase().includes(searchTerm.toLowerCase()) || row.no.includes(searchTerm);
  });

  const totalRow = data.find(r => r.no === '99' || r.isTotal);
  const totalKunjungan = totalRow ? totalRow.totalKunjungan : data.reduce((s, r) => s + r.totalKunjungan, 0);
  const calculatedAvgPerHari = rataKunjunganPerHari !== undefined 
    ? rataKunjunganPerHari 
    : (totalKunjungan / (rataHariBuka || 26)).toFixed(1);

  return (
    <div className="space-y-3 font-sans">
      {/* Title & Official Note */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
            Formulir RL 3.5 Rekapitulasi Kunjungan
          </h2>
          <p className="text-xs text-slate-700 mt-1 leading-relaxed max-w-4xl">
            Formulir rekapitulasi kunjungan dilaporkan <strong>bulanan</strong> dengan data bersumber dari Instalasi Rawat Jalan (Poliklinik), Instalasi Gawat Darurat, <em>Medical Check Up</em>, dan <em>Day Care</em>.
          </p>
        </div>

        {/* Search quick filter */}
        <div className="relative w-64 shrink-0">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Cari jenis kegiatan..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Official Table matching Kemenkes RI Standard */}
      <div className="overflow-x-auto border border-black shadow-2xs max-h-[650px] overflow-y-auto">
        <table className="w-full text-xs text-slate-900 border-collapse">
          <thead className="sticky top-0 bg-white z-10">
            <tr className="border-b border-black text-center font-bold">
              <th className="border-r border-black p-2 w-12" rowSpan={2}>No</th>
              <th className="border-r border-black p-2 text-left min-w-[220px]" rowSpan={2}>Jenis Kegiatan</th>
              <th className="border-r border-black p-1.5" colSpan={2}>Kunjungan Pasien Dalam Kab/Kota</th>
              <th className="border-r border-black p-1.5" colSpan={2}>Kunjungan Pasien Luar Kab/Kota</th>
              <th className="p-2 w-28 bg-slate-200" rowSpan={2}>Total Kunjungan</th>
            </tr>
            <tr className="border-b-2 border-black text-center font-bold text-[11px]">
              <th className="border-r border-black p-1.5 w-24">Laki-laki</th>
              <th className="border-r border-black p-1.5 w-24">Perempuan</th>
              <th className="border-r border-black p-1.5 w-24">Laki-laki</th>
              <th className="border-r border-black p-1.5 w-24">Perempuan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/70 font-mono text-center">
            {filteredData.map((row) => {
              const isTotal = row.no === '99' || row.isTotal;
              return (
                <tr
                  key={row.no}
                  className={isTotal ? 'bg-slate-200 font-bold border-t-2 border-black' : 'hover:bg-slate-50'}
                >
                  <td className="border-r border-black p-2 font-bold font-sans">{row.no}</td>
                  <td className="border-r border-black p-2 text-left font-sans font-medium">
                    {row.jenisKegiatan}
                  </td>
                  <td className="border-r border-black p-2">{row.dalamKabL}</td>
                  <td className="border-r border-black p-2">{row.dalamKabP}</td>
                  <td className="border-r border-black p-2">{row.luarKabL}</td>
                  <td className="border-r border-black p-2">{row.luarKabP}</td>
                  <td className="p-2 bg-slate-100 font-bold">{row.totalKunjungan}</td>
                </tr>
              );
            })}

            {/* Row 66: Rata-Rata Hari Poliklinik Buka */}
            <tr className="border-t border-black font-sans font-semibold">
              <td className="border-r border-black p-2 font-bold">66</td>
              <td className="border-r border-black p-2 text-left">Rata-Rata Hari Poliklinik Buka</td>
              <td className="border-r border-black p-2 font-mono text-center font-bold" colSpan={4}>
                {rataHariBuka} Hari Kerja
              </td>
              <td className="p-2 font-mono bg-slate-100 text-center font-bold">{rataHariBuka}</td>
            </tr>

            {/* Row 77: Rata-Rata Kunjungan per Hari */}
            <tr className="border-t border-black font-sans font-bold bg-slate-50">
              <td className="border-r border-black p-2">77</td>
              <td className="border-r border-black p-2 text-left">Rata-Rata Kunjungan per Hari</td>
              <td className="border-r border-black p-2 font-mono text-center text-blue-800" colSpan={4}>
                {calculatedAvgPerHari} Pasien / Hari
              </td>
              <td className="p-2 font-mono bg-slate-200 text-center text-blue-900 font-bold">
                {calculatedAvgPerHari}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
