import React, { useState } from 'react';
import { SirsRl32Row } from '../../data/sirsRl3Data';
import { Search } from 'lucide-react';

interface SirsRl32TableProps {
  data: SirsRl32Row[];
}

export const SirsRl32Table: React.FC<SirsRl32TableProps> = ({ data }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredData = data.filter(row => {
    if (row.no === '99' || row.isTotal) return true;
    if (!searchTerm.trim()) return true;
    return row.jenisPelayanan.toLowerCase().includes(searchTerm.toLowerCase()) || row.no.includes(searchTerm);
  });

  return (
    <div className="space-y-3 font-sans">
      {/* Title & Official Note */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
            Formulir RL 3.2 Rekapitulasi Kegiatan Pelayanan Rawat Inap
          </h2>
          <p className="text-xs text-slate-700 mt-1 leading-relaxed max-w-4xl">
            Formulir kegiatan pelayanan rawat inap dilaporkan <strong>bulanan</strong> dengan data bersumber dari Instalasi Rawat Inap baik berupa sensus harian pasien rawat inap atau formulir lainnya yang mencatat pasien rawat inap di rumah sakit.
          </p>
        </div>

        {/* Search quick filter */}
        <div className="relative w-64 shrink-0">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Cari jenis pelayanan..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Official Table matching Kemenkes RI Standard */}
      <div className="overflow-x-auto border border-black shadow-2xs max-h-[650px] overflow-y-auto">
        <table className="w-full text-[11px] text-slate-900 border-collapse">
          <thead className="sticky top-0 bg-white z-10">
            <tr className="border-b border-black text-center font-bold">
              <th className="border-r border-black p-1.5 w-10" rowSpan={2}>No</th>
              <th className="border-r border-black p-1.5 text-left min-w-[170px]" rowSpan={2}>Jenis Pelayanan</th>
              <th className="border-r border-black p-1.5 w-14" rowSpan={2}>Pasien Awal Bulan</th>
              <th className="border-r border-black p-1.5 w-14" rowSpan={2}>Pasien Masuk</th>
              <th className="border-r border-black p-1.5 w-14" rowSpan={2}>Pasien Pindahan</th>
              <th className="border-r border-black p-1.5 w-14" rowSpan={2}>Pasien Dipindahkan</th>
              <th className="border-r border-black p-1.5 w-14" rowSpan={2}>Pasien Keluar Hidup</th>
              <th className="border-r border-black p-1 text-center" colSpan={2}>
                Pasien Laki-Laki Keluar Mati
              </th>
              <th className="border-r border-black p-1 text-center" colSpan={2}>
                Pasien Perempuan Keluar Mati
              </th>
              <th className="border-r border-black p-1.5 w-14 bg-slate-200" rowSpan={2}>
                Jumlah Lama Dirawat
              </th>
              <th className="border-r border-black p-1.5 w-14" rowSpan={2}>Pasien Akhir Bulan</th>
              <th className="border-r border-black p-1.5 w-14" rowSpan={2}>Jumlah Hari Perawatan</th>
              <th className="border-r border-black p-1 text-center" colSpan={6}>
                Rincian Hari Perawatan per Kelas
              </th>
              <th className="p-1.5 w-16" rowSpan={2}>
                Jumlah alokasi tempat tidur awal bulan
              </th>
            </tr>
            <tr className="border-b-2 border-black text-center font-bold text-[10px]">
              <th className="border-r border-black p-1 w-10">&lt;48 jam</th>
              <th className="border-r border-black p-1 w-10">&ge;48 jam</th>
              <th className="border-r border-black p-1 w-10">&lt;48 jam</th>
              <th className="border-r border-black p-1 w-10">&ge;48 jam</th>
              <th className="border-r border-black p-1 w-9">VVIP</th>
              <th className="border-r border-black p-1 w-9">VIP</th>
              <th className="border-r border-black p-1 w-9">I</th>
              <th className="border-r border-black p-1 w-9">II</th>
              <th className="border-r border-black p-1 w-9">III</th>
              <th className="border-r border-black p-1 w-12">Kelas Khusus</th>
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
                  <td className="border-r border-black p-1.5 font-sans font-bold">{row.no}</td>
                  <td className="border-r border-black p-1.5 text-left font-sans font-medium">
                    {row.jenisPelayanan}
                  </td>
                  <td className="border-r border-black p-1.5">{row.pasienAwal}</td>
                  <td className="border-r border-black p-1.5 font-bold text-blue-800">{row.pasienMasuk}</td>
                  <td className="border-r border-black p-1.5">{row.pasienPindahan}</td>
                  <td className="border-r border-black p-1.5">{row.pasienDipindahkan}</td>
                  <td className="border-r border-black p-1.5 font-bold text-emerald-800">{row.keluarHidup}</td>
                  <td className="border-r border-black p-1.5 text-rose-700">{row.keluarMatiL_lt48}</td>
                  <td className="border-r border-black p-1.5 text-rose-700">{row.keluarMatiL_gte48}</td>
                  <td className="border-r border-black p-1.5 text-rose-700">{row.keluarMatiP_lt48}</td>
                  <td className="border-r border-black p-1.5 text-rose-700">{row.keluarMatiP_gte48}</td>
                  <td className="border-r border-black p-1.5 bg-slate-100 font-bold">{row.lamaDirawat}</td>
                  <td className="border-r border-black p-1.5 font-bold text-purple-800">{row.pasienAkhir}</td>
                  <td className="border-r border-black p-1.5 font-bold">{row.hariPerawatan}</td>
                  <td className="border-r border-black p-1.5">{row.kelasVVIP}</td>
                  <td className="border-r border-black p-1.5">{row.kelasVIP}</td>
                  <td className="border-r border-black p-1.5">{row.kelas1}</td>
                  <td className="border-r border-black p-1.5">{row.kelas2}</td>
                  <td className="border-r border-black p-1.5">{row.kelas3}</td>
                  <td className="border-r border-black p-1.5">{row.kelasKhusus}</td>
                  <td className="p-1.5 font-bold">{row.alokasiTTAwal}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
