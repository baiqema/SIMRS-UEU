import React from 'react';
import { SirsRl31Row } from '../../data/sirsRl3Data';

interface SirsRl31TableProps {
  data: SirsRl31Row[];
  metrics?: {
    bor?: number;
    alos?: number;
    bto?: number;
    toi?: number;
    ndr?: number;
    gdr?: number;
  };
}

export const SirsRl31Table: React.FC<SirsRl31TableProps> = ({ data, metrics }) => {
  const avgRow = data.find(r => r.no === '77' || r.isTotal);
  const borVal = metrics?.bor !== undefined ? metrics.bor : (avgRow?.bor ?? 40.0);
  const alosVal = metrics?.alos !== undefined ? metrics.alos : (avgRow?.alos ?? 3.5);
  const btoVal = metrics?.bto !== undefined ? metrics.bto : 0.40;
  const toiVal = metrics?.toi !== undefined ? metrics.toi : (avgRow?.toi ?? 2.1);
  const ndrVal = metrics?.ndr !== undefined ? metrics.ndr : 0.0;
  const gdrVal = metrics?.gdr !== undefined ? metrics.gdr : 0.0;

  return (
    <div className="space-y-4 font-sans">
      {/* Title & Official Note */}
      <div>
        <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
          Formulir RL 3.1 Indikator Pelayanan
        </h2>
        <p className="text-xs text-slate-700 mt-1 leading-relaxed">
          Formulir indikator pelayanan dilaporkan <strong>bulanan</strong> dengan data yang <strong>bersumber dari formulir rekapitulasi kegiatan pelayanan rawat inap (RL 3.2)</strong>.
        </p>
      </div>

      {/* 6 Indikator Mutu & Efisiensi Pelayanan RS (Barber-Johnson) - Sesuai Permintaan */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Card 1: BOR */}
        <div className="bg-blue-50/70 border border-blue-200/90 rounded-2xl p-3.5 text-center flex flex-col justify-between shadow-2xs">
          <div className="text-2xl font-bold text-blue-600 tracking-tight">
            {borVal.toFixed(1)}%
          </div>
          <div className="text-xs font-semibold text-slate-700 mt-1">
            BOR (Bed Occupancy)
          </div>
          <div className="text-[11px] font-bold text-blue-600 mt-0.5">
            Ideal: 60-85%
          </div>
        </div>

        {/* Card 2: ALOS */}
        <div className="bg-emerald-50/70 border border-emerald-200/90 rounded-2xl p-3.5 text-center flex flex-col justify-between shadow-2xs">
          <div className="text-2xl font-bold text-emerald-600 tracking-tight">
            {alosVal.toFixed(1)} hr
          </div>
          <div className="text-xs font-semibold text-slate-700 mt-1">
            ALOS (Lama Rawat)
          </div>
          <div className="text-[11px] font-bold text-emerald-600 mt-0.5">
            Ideal: 3-5 hari
          </div>
        </div>

        {/* Card 3: BTO */}
        <div className="bg-purple-50/70 border border-purple-200/90 rounded-2xl p-3.5 text-center flex flex-col justify-between shadow-2xs">
          <div className="text-2xl font-bold text-purple-600 tracking-tight">
            {btoVal.toFixed(2)}x
          </div>
          <div className="text-xs font-semibold text-slate-700 mt-1">
            BTO (Turn Over)
          </div>
          <div className="text-[11px] font-bold text-purple-600 mt-0.5">
            Ideal: 40-50x/thn
          </div>
        </div>

        {/* Card 4: TOI */}
        <div className="bg-amber-50/70 border border-amber-200/90 rounded-2xl p-3.5 text-center flex flex-col justify-between shadow-2xs">
          <div className="text-2xl font-bold text-amber-700 tracking-tight">
            {toiVal.toFixed(1)} hr
          </div>
          <div className="text-xs font-semibold text-slate-700 mt-1">
            TOI (Interval TT)
          </div>
          <div className="text-[11px] font-bold text-amber-700 mt-0.5">
            Ideal: 1-3 hari
          </div>
        </div>

        {/* Card 5: NDR */}
        <div className="bg-rose-50/70 border border-rose-200/90 rounded-2xl p-3.5 text-center flex flex-col justify-between shadow-2xs">
          <div className="text-2xl font-bold text-rose-600 tracking-tight">
            {ndrVal.toFixed(1)} ‰
          </div>
          <div className="text-xs font-semibold text-slate-700 mt-1">
            NDR (≥48 Jam)
          </div>
          <div className="text-[11px] font-bold text-rose-600 mt-0.5">
            Ideal: &lt;25 per 1000
          </div>
        </div>

        {/* Card 6: GDR */}
        <div className="bg-rose-50/70 border border-rose-200/90 rounded-2xl p-3.5 text-center flex flex-col justify-between shadow-2xs">
          <div className="text-2xl font-bold text-rose-700 tracking-tight">
            {gdrVal.toFixed(1)} ‰
          </div>
          <div className="text-xs font-semibold text-slate-700 mt-1">
            GDR (Total Mati)
          </div>
          <div className="text-[11px] font-bold text-rose-700 mt-0.5">
            Ideal: &lt;45 per 1000
          </div>
        </div>
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
