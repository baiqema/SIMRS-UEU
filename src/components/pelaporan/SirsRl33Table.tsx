import React from 'react';
import { SirsRl33Row } from '../../data/sirsRl3Data';

interface SirsRl33TableProps {
  data: SirsRl33Row[];
}

export const SirsRl33Table: React.FC<SirsRl33TableProps> = ({ data }) => {
  return (
    <div className="space-y-3 font-sans">
      {/* Title & Official Note */}
      <div>
        <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
          Formulir RL 3.3 Rekapitulasi Kegiatan Pelayanan Rawat Darurat
        </h2>
        <p className="text-xs text-slate-700 mt-1 leading-relaxed">
          Formulir kunjungan rawat darurat dilaporkan <strong>bulanan</strong> dengan data bersumber dari Instalasi Gawat Darurat (IGD).
        </p>
      </div>

      {/* Official Table matching Kemenkes RI Standard */}
      <div className="overflow-x-auto border border-black shadow-2xs">
        <table className="w-full text-xs text-slate-900 border-collapse">
          <thead>
            <tr className="bg-white border-b border-black text-center font-bold">
              <th className="border-r border-black p-2 w-12" rowSpan={2}>No.</th>
              <th className="border-r border-black p-2 text-left min-w-[200px]" rowSpan={2}>Jenis Pelayanan</th>
              <th className="border-r border-black p-1.5" colSpan={2}>Total Pasien</th>
              <th className="border-r border-black p-1.5" colSpan={3}>Tindak Lanjut Pelayanan</th>
              <th className="border-r border-black p-1.5" colSpan={2}>Mati di IGD</th>
              <th className="border-r border-black p-1.5" colSpan={2}>DOA</th>
              <th className="border-r border-black p-1.5" colSpan={2}>Luka-luka</th>
              <th className="p-2 w-20" rowSpan={2}>False Emergency</th>
            </tr>
            <tr className="bg-white border-b-2 border-black text-center font-bold text-[11px]">
              <th className="border-r border-black p-1.5 w-16">Rujukan</th>
              <th className="border-r border-black p-1.5 w-16">Non Rujukan</th>
              <th className="border-r border-black p-1.5 w-16">Dirawat</th>
              <th className="border-r border-black p-1.5 w-16">Dirujuk</th>
              <th className="border-r border-black p-1.5 w-16">Pulang</th>
              <th className="border-r border-black p-1.5 w-14">Laki-laki</th>
              <th className="border-r border-black p-1.5 w-14">Perempuan</th>
              <th className="border-r border-black p-1.5 w-14">Laki-laki</th>
              <th className="border-r border-black p-1.5 w-14">Perempuan</th>
              <th className="border-r border-black p-1.5 w-14">Laki-laki</th>
              <th className="border-r border-black p-1.5 w-14">Perempuan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/70 font-mono text-center">
            {data.map((row) => {
              const isTotal = row.no === '99' || row.isTotal;
              const isMainCategory = (row.no === '1' || row.no === '2') && row.isHeader;
              const isSubItem = row.no.includes('.');

              return (
                <tr
                  key={row.no}
                  className={
                    isTotal
                      ? 'bg-slate-200 font-bold border-t-2 border-black'
                      : isMainCategory
                      ? 'bg-slate-50 font-bold'
                      : 'hover:bg-slate-50'
                  }
                >
                  <td className="border-r border-black p-2 font-bold font-sans">{row.no}</td>
                  <td
                    className={`border-r border-black p-2 text-left font-sans ${
                      isMainCategory ? 'font-bold text-slate-900' : isSubItem ? 'pl-6 font-normal text-slate-800' : 'font-semibold text-slate-900'
                    }`}
                  >
                    {row.jenisPelayanan}
                  </td>
                  <td className="border-r border-black p-1.5">{row.totalRujukan}</td>
                  <td className="border-r border-black p-1.5">{row.totalNonRujukan}</td>
                  <td className="border-r border-black p-1.5 font-bold text-blue-800">{row.dirawat}</td>
                  <td className="border-r border-black p-1.5">{row.dirujuk}</td>
                  <td className="border-r border-black p-1.5 font-bold text-emerald-800">{row.pulang}</td>
                  
                  {/* Mati di IGD */}
                  {row.disabledMaleColumns ? (
                    <td className="border-r border-black p-1.5 bg-black text-white font-bold italic">0</td>
                  ) : (
                    <td className="border-r border-black p-1.5 text-rose-700">{row.matiL}</td>
                  )}
                  <td className="border-r border-black p-1.5 text-rose-700">{row.matiP}</td>

                  {/* DOA */}
                  {row.disabledMaleColumns ? (
                    <td className="border-r border-black p-1.5 bg-black text-white font-bold italic">0</td>
                  ) : (
                    <td className="border-r border-black p-1.5">{row.doaL}</td>
                  )}
                  <td className="border-r border-black p-1.5">{row.doaP}</td>

                  {/* Luka-luka */}
                  {row.disabledMaleColumns ? (
                    <td className="border-r border-black p-1.5 bg-black text-white font-bold italic">0</td>
                  ) : (
                    <td className="border-r border-black p-1.5">{row.lukaL}</td>
                  )}
                  <td className="border-r border-black p-1.5">{row.lukaP}</td>

                  {/* False Emergency */}
                  {row.disabledFalseEmergency ? (
                    <td className="p-1.5 bg-black text-white font-bold italic">0</td>
                  ) : (
                    <td className="p-1.5">{row.falseEmergency}</td>
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
