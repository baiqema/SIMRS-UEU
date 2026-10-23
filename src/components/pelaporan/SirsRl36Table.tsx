import React, { useState } from 'react';
import { SirsRl36Row } from '../../data/sirsRl3Data';
import { Search } from 'lucide-react';

interface SirsRl36TableProps {
  data: SirsRl36Row[];
}

export const SirsRl36Table: React.FC<SirsRl36TableProps> = ({ data }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredData = data.filter(row => {
    if (row.isHeader) return true;
    if (!searchTerm.trim()) return true;
    return row.jenisKegiatan.toLowerCase().includes(searchTerm.toLowerCase()) || row.no.includes(searchTerm);
  });

  return (
    <div className="space-y-3 font-sans">
      {/* Title & Official Note */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
            Formulir RL 3.6 Rekapitulasi Kegiatan Pelayanan Kebidanan
          </h2>
          <p className="text-xs text-slate-700 mt-1 leading-relaxed max-w-5xl">
            Formulir rekapitulasi Kegiatan Pelayanan Kebidanan dilaporkan <strong>bulanan</strong> dengan data yang dapat bersumber dari poli Kebidanan, poli KB, dan/atau poli Umum yang menangani pelayanan kebidanan baik berupa register pasien kebidanan maupun pencatatan kebidanan lainnya.
          </p>
        </div>

        {/* Search quick filter */}
        <div className="relative w-64 shrink-0">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Cari kegiatan kebidanan..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Official Table matching Kemenkes RI Standard */}
      <div className="overflow-x-auto border border-black shadow-2xs max-h-[650px] overflow-y-auto">
        <table className="w-full text-[11px] text-slate-900 border-collapse">
          <thead className="sticky top-0 bg-white z-10">
            <tr className="border-b border-black text-center font-bold">
              <th className="border-r border-black p-2 w-12" rowSpan={2}>No.</th>
              <th className="border-r border-black p-2 text-left min-w-[240px]" rowSpan={2}>Jenis Kegiatan</th>
              <th className="border-r border-black p-1 text-center" colSpan={7}>
                Rujukan Medis
              </th>
              <th className="border-r border-black p-1 text-center" colSpan={3}>
                Rujukan Non Medis
              </th>
              <th className="border-r border-black p-1 text-center" colSpan={3}>
                Non Rujukan
              </th>
              <th className="p-2 w-16" rowSpan={2}>Dirujuk</th>
            </tr>
            <tr className="border-b-2 border-black text-center font-bold text-[10px]">
              {/* Rujukan Medis subheaders */}
              <th className="border-r border-black p-1 w-12">Rumah Sakit</th>
              <th className="border-r border-black p-1 w-10">Bidan</th>
              <th className="border-r border-black p-1 w-12">Puskesmas</th>
              <th className="border-r border-black p-1 w-12">Faskes Lainnya</th>
              <th className="border-r border-black p-1 w-12">Jumlah Hidup</th>
              <th className="border-r border-black p-1 w-12">Jumlah Mati</th>
              <th className="border-r border-black p-1 w-14 bg-slate-200">Total Rujukan Medis</th>

              {/* Rujukan Non Medis subheaders */}
              <th className="border-r border-black p-1 w-12">Jumlah Hidup</th>
              <th className="border-r border-black p-1 w-12">Jumlah Mati</th>
              <th className="border-r border-black p-1 w-14 bg-slate-200">Total Rujukan Non Medis</th>

              {/* Non Rujukan subheaders */}
              <th className="border-r border-black p-1 w-12">Jumlah Hidup</th>
              <th className="border-r border-black p-1 w-12">Jumlah Mati</th>
              <th className="border-r border-black p-1 w-14 bg-slate-200">Total Non Rujukan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/70 font-mono text-center">
            {filteredData.map((row) => {
              const isParentHeader = row.isHeader;
              const isSubItem = row.no.includes('.');

              if (isParentHeader) {
                return (
                  <tr key={row.no} className="bg-slate-100 font-bold border-t border-black text-slate-900">
                    <td className="border-r border-black p-1.5 font-bold font-sans text-center">{row.no}</td>
                    <td className="border-r border-black p-1.5 text-left font-sans font-bold" colSpan={14}>
                      {row.jenisKegiatan}
                    </td>
                    <td className="p-1.5 bg-slate-200"></td>
                  </tr>
                );
              }

              return (
                <tr key={row.no} className="hover:bg-slate-50">
                  <td className="border-r border-black p-1.5 font-bold font-sans text-center">{row.no}</td>
                  <td
                    className={`border-r border-black p-1.5 text-left font-sans ${
                      isSubItem ? 'pl-6 font-normal text-slate-800' : 'font-semibold text-slate-900'
                    }`}
                  >
                    {row.jenisKegiatan}
                  </td>

                  {/* Rujukan Medis */}
                  <td className="border-r border-black p-1">{row.rujukanRS}</td>
                  <td className="border-r border-black p-1">{row.rujukanBidan}</td>
                  <td className="border-r border-black p-1">{row.rujukanPuskesmas}</td>
                  <td className="border-r border-black p-1">{row.rujukanFaskesLain}</td>
                  <td className="border-r border-black p-1 font-bold text-emerald-800">{row.rujukanHidup}</td>
                  
                  {row.disabledDeathColumns ? (
                    <td className="border-r border-black p-1 bg-black text-white font-bold italic">0</td>
                  ) : (
                    <td className="border-r border-black p-1 text-rose-700">{row.rujukanMati}</td>
                  )}
                  
                  <td className="border-r border-black p-1 bg-slate-100 font-bold">{row.totalRujukanMedis}</td>

                  {/* Rujukan Non Medis */}
                  <td className="border-r border-black p-1">{row.nonMedisHidup}</td>
                  {row.disabledDeathColumns ? (
                    <td className="border-r border-black p-1 bg-black text-white font-bold italic">0</td>
                  ) : (
                    <td className="border-r border-black p-1 text-rose-700">{row.nonMedisMati}</td>
                  )}
                  <td className="border-r border-black p-1 bg-slate-100 font-bold">{row.totalRujukanNonMedis}</td>

                  {/* Non Rujukan */}
                  <td className="border-r border-black p-1">{row.nonRujukanHidup}</td>
                  {row.disabledDeathColumns ? (
                    <td className="border-r border-black p-1 bg-black text-white font-bold italic">0</td>
                  ) : (
                    <td className="border-r border-black p-1 text-rose-700">{row.nonRujukanMati}</td>
                  )}
                  <td className="border-r border-black p-1 bg-slate-100 font-bold">{row.totalNonRujukan}</td>

                  {/* Dirujuk */}
                  {row.disabledDirujuk ? (
                    <td className="p-1 bg-black text-white font-bold italic">0</td>
                  ) : (
                    <td className="p-1 font-bold">{row.dirujuk}</td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
