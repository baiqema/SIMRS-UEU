import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  PlusCircle, Bed, Stethoscope, Barcode,
  ShieldAlert, BarChart3, TrendingUp,
  ShieldCheck, Search, Pill, CheckCircle2,
  Activity, ArrowRight, History,
  Baby, FlaskConical, BookOpen,
  ClipboardList, HeartPulse, FileSpreadsheet
} from 'lucide-react';

interface TileItem {
  id: string;
  tabCategory: 'PENDAFTARAN' | 'PEMERIKSAAN' | 'PELAPORAN';
  title: string;
  badgeBg: string;
  iconBg: string;
  icon: React.ElementType;
  targetPage: string;
  desc: string;
  extraState?: any;
}

export const SimrsPortalView: React.FC<{
  activeTab: string;
  setActiveTab: (tab: string) => void;
}> = ({ activeTab }) => {
  const { navigate } = useApp();
  const [searchTerm, setSearchTerm] = useState('');

  const allTiles: TileItem[] = [
    // PENDAFTARAN
    {
      id: 'p1',
      tabCategory: 'PENDAFTARAN',
      title: 'A. Instalasi Gawat Darurat (IGD)',
      badgeBg: 'bg-rose-50 border-rose-200 text-rose-800',
      iconBg: 'bg-gradient-to-br from-rose-500 to-red-600 text-white',
      icon: PlusCircle,
      targetPage: 'pendaftaran',
      desc: 'Pendaftaran gawat darurat (IGD), triase awal & antrean darurat',
      extraState: { filterType: 'IGD', regType: 'IGD', autoOpenForm: true }
    },
    {
      id: 'p2',
      tabCategory: 'PENDAFTARAN',
      title: 'B. Rawat Jalan (Poliklinik)',
      badgeBg: 'bg-blue-50 border-blue-200 text-blue-800',
      iconBg: 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white',
      icon: Stethoscope,
      targetPage: 'pendaftaran',
      desc: 'Registrasi poliklinik spesialis, antrean poli & jadwal dokter',
      extraState: { filterType: 'Rawat Jalan', regType: 'Rawat Jalan', autoOpenForm: true }
    },
    {
      id: 'p3',
      tabCategory: 'PENDAFTARAN',
      title: 'C. Rawat Inap (Bangsal/Kamar)',
      badgeBg: 'bg-amber-50 border-amber-200 text-amber-800',
      iconBg: 'bg-gradient-to-br from-amber-500 to-orange-600 text-white',
      icon: Bed,
      targetPage: 'pendaftaran',
      desc: 'Admisi rawat inap, alokasi bed, booking kamar & bangsal pasien',
      extraState: { filterType: 'Rawat Inap', regType: 'Rawat Inap', autoOpenForm: true }
    },
    {
      id: 'p4',
      tabCategory: 'PENDAFTARAN',
      title: 'D. Bayi Baru Lahir (Neonatal)',
      badgeBg: 'bg-cyan-50 border-cyan-200 text-cyan-800',
      iconBg: 'bg-gradient-to-br from-cyan-500 to-teal-600 text-white',
      icon: Baby,
      targetPage: 'pendaftaran',
      desc: 'Data kelahiran neonatus, nomor RM bayi, skor APGAR & identitas ibu',
      extraState: { filterType: 'Rawat Inap', regType: 'Rawat Inap', isNeonatus: true }
    },
    {
      id: 'p5',
      tabCategory: 'PENDAFTARAN',
      title: 'General Consent & Persetujuan',
      badgeBg: 'bg-emerald-50 border-emerald-200 text-emerald-800',
      iconBg: 'bg-gradient-to-br from-emerald-500 to-teal-700 text-white',
      icon: ShieldCheck,
      targetPage: 'generalconsent',
      desc: 'Formulir persetujuan umum perawatan dan pelepasan informasi medis'
    },
    {
      id: 'p6',
      tabCategory: 'PENDAFTARAN',
      title: 'VClaim BPJS & Pembuatan SEP',
      badgeBg: 'bg-indigo-50 border-indigo-200 text-indigo-800',
      iconBg: 'bg-gradient-to-br from-indigo-500 to-blue-700 text-white',
      icon: CheckCircle2,
      targetPage: 'pendaftaran',
      desc: 'Penerbitan Surat Elegibilitas Peserta (SEP) & bridging BPJS Kesehatan'
    },

    // PEMERIKSAAN
    {
      id: 'pem_rj',
      tabCategory: 'PEMERIKSAAN',
      title: '1. Asesmen Awal Rawat Jalan (AARJ)',
      badgeBg: 'bg-blue-50 border-blue-200 text-blue-800',
      iconBg: 'bg-gradient-to-br from-blue-600 to-indigo-700 text-white',
      icon: Stethoscope,
      targetPage: 'rekammedis',
      desc: 'Formulir Rawat Jalan: Identitas, Pembayaran, General Consent, Anamnesis, Fisik 28 Regio, Spesialistik & Penunjang',
      extraState: { initialTab: 'rawatjalan' }
    },
    {
      id: 'pem_igd',
      tabCategory: 'PEMERIKSAAN',
      title: '2. Asesmen Triase & Gawat Darurat (AIGD)',
      badgeBg: 'bg-rose-50 border-rose-200 text-rose-800',
      iconBg: 'bg-gradient-to-br from-rose-600 to-red-700 text-white',
      icon: ShieldAlert,
      targetPage: 'rekammedis',
      desc: 'Formulir IGD: Triase PMK 47/2018, Nyeri, Risiko Jatuh, Screening Decubitus/Gizi, Anamnesis, Fisik, Informed Consent',
      extraState: { initialTab: 'igd' }
    },
    {
      id: 'pem_ri',
      tabCategory: 'PEMERIKSAAN',
      title: '3. Asesmen Awal Rawat Inap (AARI)',
      badgeBg: 'bg-amber-50 border-amber-200 text-amber-800',
      iconBg: 'bg-gradient-to-br from-amber-600 to-orange-700 text-white',
      icon: Bed,
      targetPage: 'rekammedis',
      desc: 'Formulir Rawat Inap: Identitas, Anamnesis, Fisik 28 Regio, Spesialistik, Discharge Planning & Pencatatan Longitudinal',
      extraState: { initialTab: 'rawatinap' }
    },
    {
      id: 'pem1',
      tabCategory: 'PEMERIKSAAN',
      title: '4. Asesmen Medis & CPPT (SOAP)',
      badgeBg: 'bg-indigo-50 border-indigo-200 text-indigo-800',
      iconBg: 'bg-gradient-to-br from-indigo-600 to-purple-700 text-white',
      icon: Stethoscope,
      targetPage: 'rekammedis',
      desc: 'Anamnesis, pemeriksaan fisik, diagnosis DPJP & catatan perkembangan CPPT',
      extraState: { initialTab: 'soap' }
    },
    {
      id: 'pem2',
      tabCategory: 'PEMERIKSAAN',
      title: 'Asesmen Keperawatan & Asuhan',
      badgeBg: 'bg-purple-50 border-purple-200 text-purple-800',
      iconBg: 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white',
      icon: ClipboardList,
      targetPage: 'rekammedis',
      desc: 'Pengkajian keperawatan terstandar SDKI, luaran SLKI & intervensi SIKI',
      extraState: { initialTab: 'keperawatan' }
    },
    {
      id: 'pem3',
      tabCategory: 'PEMERIKSAAN',
      title: 'Tracer IGD & Berkas Rekam Medis',
      badgeBg: 'bg-rose-50 border-rose-200 text-rose-800',
      iconBg: 'bg-gradient-to-br from-rose-500 to-pink-600 text-white',
      icon: ShieldAlert,
      targetPage: 'rekammedis',
      desc: 'Outguide pelacakan berkas fisik RM IGD/Ranap, barcode & bukti pinjam',
      extraState: { initialTab: 'tracer' }
    },
    {
      id: 'pem4',
      tabCategory: 'PEMERIKSAAN',
      title: 'Coding ICD-10 & ICD-9-CM (Koding)',
      badgeBg: 'bg-cyan-50 border-cyan-200 text-cyan-800',
      iconBg: 'bg-gradient-to-br from-cyan-600 to-blue-700 text-white',
      icon: Barcode,
      targetPage: 'rekammedis',
      desc: 'Workspace koding satu halaman penuh dengan autocomplete diagnosa & tindakan',
      extraState: { initialTab: 'coding' }
    },
    {
      id: 'pem5',
      tabCategory: 'PEMERIKSAAN',
      title: 'Laboratorium Klinis (LIS)',
      badgeBg: 'bg-amber-50 border-amber-200 text-amber-800',
      iconBg: 'bg-gradient-to-br from-amber-500 to-yellow-600 text-white',
      icon: FlaskConical,
      targetPage: 'laboratorium',
      desc: 'Pemeriksaan hematologi, kimia darah, urinalisis & hasil validasi lab'
    },
    {
      id: 'pem6',
      tabCategory: 'PEMERIKSAAN',
      title: 'Apotek & Farmasi (e-Prescribing)',
      badgeBg: 'bg-emerald-50 border-emerald-200 text-emerald-800',
      iconBg: 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white',
      icon: Pill,
      targetPage: 'farmasi',
      desc: 'Pelayanan resep elektronik dokter, dispensing obat & telaah farmasi'
    },
    {
      id: 'pem7',
      tabCategory: 'PEMERIKSAAN',
      title: 'Triase Gawat Darurat (ATS/ESI)',
      badgeBg: 'bg-red-50 border-red-200 text-red-800',
      iconBg: 'bg-gradient-to-br from-red-500 to-rose-700 text-white',
      icon: Activity,
      targetPage: 'pendaftaran',
      desc: 'Penilaian kegawatan pasien gawat darurat (Zona Merah, Kuning, Hijau)'
    },
    {
      id: 'pem8',
      tabCategory: 'PEMERIKSAAN',
      title: 'Resume Medis & Discharge Summary',
      badgeBg: 'bg-teal-50 border-teal-200 text-teal-800',
      iconBg: 'bg-gradient-to-br from-teal-500 to-emerald-700 text-white',
      icon: FileSpreadsheet,
      targetPage: 'resumemedis',
      desc: 'Ringkasan pulang pasien, resume klinis, kondisi keluar & instruksi kontrol'
    },

    // PELAPORAN
    {
      id: 'pel1',
      tabCategory: 'PELAPORAN',
      title: 'Laporan RL 1-5 (SIRS Online)',
      badgeBg: 'bg-indigo-50 border-indigo-200 text-indigo-800',
      iconBg: 'bg-gradient-to-br from-indigo-500 to-blue-700 text-white',
      icon: BarChart3,
      targetPage: 'pelaporan',
      desc: 'Pelaporan Rekapitulasi SIRS Kemenkes RL 1.2, RL 3, RL 4, dan RL 5'
    },
    {
      id: 'pel2',
      tabCategory: 'PELAPORAN',
      title: 'Indikator Efisiensi Rawat Inap',
      badgeBg: 'bg-cyan-50 border-cyan-200 text-cyan-800',
      iconBg: 'bg-gradient-to-br from-cyan-600 to-teal-700 text-white',
      icon: TrendingUp,
      targetPage: 'pelaporan',
      desc: 'Grafik Barber Johnson, BOR, ALOS, TOI, BTO, NDR, dan GDR'
    },
    {
      id: 'pel3',
      tabCategory: 'PELAPORAN',
      title: 'Kamus Metadata KMK 1423/2022',
      badgeBg: 'bg-blue-50 border-blue-200 text-blue-800',
      iconBg: 'bg-gradient-to-br from-blue-600 to-sky-700 text-white',
      icon: BookOpen,
      targetPage: 'metadata',
      desc: 'Pedoman Standar Variabel & Kamus Data RME Kemenkes HK.01.07/1423/2022'
    },
    {
      id: 'pel4',
      tabCategory: 'PELAPORAN',
      title: 'Audit Trail & Keamanan RME',
      badgeBg: 'bg-slate-50 border-slate-200 text-slate-800',
      iconBg: 'bg-gradient-to-br from-slate-600 to-slate-800 text-white',
      icon: History,
      targetPage: 'audit',
      desc: 'Rekam jejak akses, perubahan data klinis, integritas & kepatuhan'
    }
  ];

  const filteredTiles = allTiles.filter(tile => {
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return (
        tile.title.toLowerCase().includes(q) ||
        tile.desc.toLowerCase().includes(q) ||
        tile.tabCategory.toLowerCase().includes(q)
      );
    }
    if (activeTab === 'PORTAL' || activeTab === 'METADATA') return true;
    return tile.tabCategory === activeTab;
  });

  return (
    <div className="min-h-[calc(100vh-3rem)] bg-slate-50 text-slate-800 p-4 sm:p-8 flex flex-col items-center justify-start relative overflow-hidden">
      {/* Background Soft Sky Ambient Glow Effect */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-100/50 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-sky-100/50 rounded-full blur-3xl pointer-events-none"></div>

      {/* Main Container Box */}
      <div className="w-full max-w-6xl bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-xs relative z-10 my-auto">
        {/* Search Bar centered */}
        <div className="max-w-xl mx-auto mb-8 sm:mb-10">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari Layanan SIMRS (Asesmen Keperawatan, Tracer IGD, Koding, CPPT, Lab)..."
              className="w-full pl-11 pr-20 py-3 bg-slate-50 text-slate-800 placeholder-slate-400 rounded-2xl border border-slate-200 text-xs sm:text-sm font-semibold focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all shadow-inner"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-800 text-xs font-bold bg-slate-200 px-2 py-0.5 rounded cursor-pointer"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Category Header or Search Indicator */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-3 gap-2">
          <div className="text-xs font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            {searchTerm ? `Hasil Pencarian: "${searchTerm}"` : `Kategori Modul: ${activeTab}`}
          </div>
          <span className="text-[11px] text-blue-600 font-bold flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-blue-600" />
            Standar RME KMK HK.01.07/MENKES/1423/2022
          </span>
        </div>

        {/* Tiles Grid */}
        {filteredTiles.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {filteredTiles.map(tile => {
              const IconComp = tile.icon;
              return (
                <div
                  key={tile.id}
                  onClick={() => {
                    navigate(tile.targetPage, tile.extraState);
                  }}
                  className="bg-white hover:bg-blue-50/40 border border-slate-200 hover:border-blue-300 rounded-2xl p-5 flex items-start gap-4 cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-md group"
                >
                  {/* Circle Badge Icon */}
                  <div className={`w-13 h-13 rounded-2xl flex items-center justify-center shrink-0 shadow-xs ${tile.iconBg} group-hover:scale-105 transition-transform`}>
                    <IconComp className="w-6 h-6" />
                  </div>

                  <div className="min-w-0 flex-1 space-y-1">
                    {/* Title Button Label */}
                    <h3 className="text-slate-900 font-bold text-sm group-hover:text-blue-600 transition-colors truncate">
                      {tile.title}
                    </h3>

                    {/* Description subtitle */}
                    <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                      {tile.desc}
                    </p>

                    <div className="pt-1 flex items-center gap-1 text-[11px] font-bold text-blue-600 group-hover:underline">
                      <span>Buka Modul</span>
                      <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-12 text-center text-xs text-slate-500 font-medium">
            Menu tidak ditemukan. Coba kata kunci lain atau pilih tab diatas.
          </div>
        )}
      </div>

      {/* Footer Branding */}
      <div className="mt-6 text-[11px] text-slate-500 font-bold text-center">
        Sistem Informasi Manajemen Rumah Sakit (SIMRS 3.0) &bull; Standar KMK HK.01.07/MENKES/1423/2022
      </div>
    </div>
  );
};
