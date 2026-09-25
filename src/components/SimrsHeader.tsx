import React from 'react';
import { useApp } from '../context/AppContext';
import { RotateCw, LogOut, LayoutDashboard, BookOpen } from 'lucide-react';
import { EsaUnggulLogo } from './Logos';

interface SimrsHeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenPortal: () => void;
}

export const SimrsHeader: React.FC<SimrsHeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenPortal,
}) => {
  const { user, logout, activePage, navigate } = useApp();

  const tabs = [
    { id: 'DASHBOARD', label: 'DASHBOARD', page: 'dashboard' },
    { id: 'PENDAFTARAN', label: 'PENDAFTARAN', page: 'portal' },
    { id: 'PEMERIKSAAN', label: 'PEMERIKSAAN', page: 'portal' },
    { id: 'PELAPORAN', label: 'PELAPORAN RS', page: 'portal' },
    { id: 'METADATA', label: 'METADATA KMK 1423', page: 'metadata' },
  ];

  return (
    <header className="bg-[#0B5ED7] border-b border-[#0852bc] text-white text-xs font-bold select-none sticky top-0 z-50 shadow-md">
      <div className="flex items-center justify-between px-3 sm:px-5 h-14 overflow-x-auto scrollbar-none gap-2">
        {/* LEFT: LOGO UNIVERSITAS ESA UNGGUL */}
        <div className="flex items-center gap-3 shrink-0 pr-3 border-r border-white/20">
          <div
            onClick={onOpenPortal}
            className="flex items-center gap-2.5 cursor-pointer hover:opacity-95 transition-opacity"
            title="Universitas Esa Unggul - SIMRS & RME"
          >
            <EsaUnggulLogo size="sm" showText={true} />
          </div>
        </div>

        {/* TOP TABS */}
        <div className="flex items-center space-x-1.5 overflow-x-auto py-1 px-1 scrollbar-none shrink-0">
          {tabs.map((tab) => {
            const isSelectedPage =
              (tab.page === 'dashboard' && activePage === 'dashboard') ||
              (tab.page === 'metadata' && activePage === 'metadata') ||
              (tab.page === 'portal' && activePage === 'portal' && activeTab === tab.id);

            return (
              <button
                key={tab.id}
                onClick={() => {
                  if (tab.page === 'dashboard') {
                    navigate('dashboard');
                  } else if (tab.page === 'metadata') {
                    navigate('metadata');
                  } else {
                    setActiveTab(tab.id);
                    navigate('portal');
                  }
                }}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-black tracking-wide whitespace-nowrap transition-all cursor-pointer ${
                  isSelectedPage
                    ? 'bg-white text-[#0B5ED7] shadow-sm font-black'
                    : 'text-white/85 hover:bg-white/15 hover:text-white'
                }`}
              >
                {tab.id === 'METADATA' && <BookOpen className="w-3 h-3 inline mr-1 text-amber-300" />}
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* RIGHT: CONTROLS & ACTIONS */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 pl-2 border-l border-white/20">
          <button
            onClick={() => navigate('metadata')}
            className={`hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-black transition-colors cursor-pointer border ${
              activePage === 'metadata'
                ? 'bg-white text-[#0B5ED7] border-white shadow-xs'
                : 'bg-white/10 hover:bg-white/20 text-white border-white/30'
            }`}
            title="Kamus Metadata RME KMK 1423"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-300" />
            <span>Kamus KMK</span>
          </button>

          <button
            onClick={() => navigate('dashboard')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-black transition-colors cursor-pointer shadow-xs border ${
              activePage === 'dashboard'
                ? 'bg-emerald-600 text-white border-emerald-500'
                : 'bg-white/15 hover:bg-white/25 text-white border-white/30'
            }`}
            title="Dashboard Eksekutif"
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Dashboard</span>
          </button>

          <button
            onClick={() => window.location.reload()}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            title="Refresh"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>

          <span className="hidden lg:inline-block font-black text-white tracking-tight text-[11px] max-w-[130px] truncate bg-white/15 px-2.5 py-1 rounded-full border border-white/25">
            {user?.name ? user.name.toUpperCase() : 'USER'}
          </span>

          <button
            onClick={logout}
            className="p-1.5 rounded-xl bg-[#C53030] hover:bg-[#A82828] text-white transition-colors cursor-pointer shadow-xs"
            title="Keluar"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
