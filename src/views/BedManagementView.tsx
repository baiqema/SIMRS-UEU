import React from 'react';
import { useApp } from '../context/AppContext';
import { BedManagementView as BedGridComponent } from '../components/bed/BedManagementView';
import { Bed, UserPlus, Users, ArrowLeft, RefreshCw, Sparkles, Building2 } from 'lucide-react';

export const BedManagementView: React.FC = () => {
  const { navigate, beds } = useApp();

  const totalBeds = beds.length;
  const occupiedBeds = beds.filter(b => b.status === 'Occupied').length;
  const availableBeds = beds.filter(b => b.status === 'Available').length;
  const borPercentage = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700 shrink-0 shadow-2xs">
            <Bed className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full tracking-wider">
                Rawat Inap & Bangsal
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                BOR Saat Ini: <strong className="text-indigo-900">{borPercentage}%</strong>
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 leading-tight">
              Bed Management (Ketersediaan Kamar Ranap)
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Monitoring Real-time Kapasitas Tempat Tidur, Status Kamar, Mutasi Pasien & Admisi Rawat Inap RS
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={() => navigate('pendaftaran', { tab: 'kunjungan' })}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
            title="Lihat Daftar Pasien yang Sedang Dirawat Inap"
          >
            <Users className="w-4 h-4 text-slate-600" />
            <span>Kunjungan Pasien</span>
          </button>

          <button
            type="button"
            onClick={() => navigate('pendaftaran', { regType: 'Rawat Inap' })}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-sm shadow-indigo-600/20"
            title="Buka Formulir Pendaftaran Pasien Rawat Inap Baru"
          >
            <UserPlus className="w-4 h-4" />
            <span>Admisi Pasien Ranap</span>
          </button>
        </div>
      </div>

      {/* Embedded Bed Management Grid & Floor Plan */}
      <div className="bg-transparent">
        <BedGridComponent
          onSelectBed={(bed) => {
            navigate('pendaftaran', {
              regType: 'Rawat Inap',
              bedId: bed.id,
              room: bed.room,
              kelas: bed.class
            });
          }}
        />
      </div>
    </div>
  );
};
