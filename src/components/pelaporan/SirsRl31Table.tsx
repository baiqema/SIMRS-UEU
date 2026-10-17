import React from 'react';
import { SirsRl31Row } from '../../data/sirsRl3Data';

interface SirsRl31TableProps {
  data: SirsRl31Row[];
}

export const SirsRl31Table: React.FC<SirsRl31TableProps> = ({ data }) => {
  return (
    <div className="space-y-3 font-sans">
      {/* Title & Official Note */}
      <div>
        <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
          Formulir RL 3.1 Indikator Pelayanan
        </h2>
        <p className="text-xs text-slate-700 mt-1 leading-relaxed">
          Formulir indikator pelayanan dilaporkan <strong>bulanan</strong> dengan data yang <strong>bersumber dari formulir rekapitulasi kegiatan pelayanan rawat inap (RL 3.2)</strong>.
        </p>
      </div>

      {/* Official Table matching Kemenkes RI Standard */}
      <div className="overflow-x-auto border border-black shadow-2xs">
        <table className="w-full text-xs text-slate-900 border-collapse">
          <thead>
            <tr className="bg-white border-b-2 border-black text-center font-bold">
              <th className="border-r border-black p-2.5 w-14">No.</th>
              <th className="border-r border-black p-2.5 text-left min-w-[220px]">Jenis Pelayanan</th>
              <th className="border-r border-black p-2.5 w-24">BOR</th>
              <th className="border-r border-black p-2.5 w-24">ALOS</th>
              <th className="border-r border-black p-2.5 w-24">BTO</th>
              <th className="border-r border-black p-2.5 w-24">TOI</th>
              <th className="border-r border-black p-2.5 w-24">NDR</th>
              <th className="p-2.5 w-24">GDR</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/80 font-mono text-center">
            {data.map((row) => {
              const isAvg = row.no === '77' || row.isTotal;
              return (
                <tr
                  key={row.no}
                  className={isAvg ? 'bg-slate-200 font-bold border-t-2 border-black' : 'hover:bg-slate-50'}
                >
                  <td className="border-r border-black p-2 font-bold font-sans">{row.no}</td>
                  <td className="border-r border-black p-2 text-left font-sans font-medium">
                    {row.jenisPelayanan}
                  </td>
                  <td className="border-r border-black p-2">
                    {row.bor.toFixed(1)}%
                  </td>
                  <td className="border-r border-black p-2">
                    {row.alos.toFixed(1)}
                  </td>
                  <td className="border-r border-black p-2">
                    {row.bto.toFixed(1)}
                  </td>
                  <td className="border-r border-black p-2">
                    {row.toi.toFixed(1)}
                  </td>
                  <td className="border-r border-black p-2">
                    {row.ndr.toFixed(1)}
                  </td>
                  <td className="p-2">
                    {row.gdr.toFixed(1)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
