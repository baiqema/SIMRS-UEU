import React from 'react';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard, ClipboardList, FileSignature, FileText,
  FilePenLine, Handshake, Barcode, ShieldAlert, Receipt,
  Banknote, Pill, FlaskConical, Radio, Users, GraduationCap,
  ShieldCheck, History, BarChart3, BookOpen, Bed
} from 'lucide-react';
import esaUnggulEmblem from '../assets/logo-esa-unggul-emblem.png';
import { RmikLogo } from './Logos';

export const Sidebar: React.FC = () => {
  const { activePage, navigate, sidebarCollapsed, user, getRole } = useApp();

  if (!user) return null;

  const role = getRole(user.roleId);
  const access = role?.access || [];

  const navGroups = [
    {
      group: '',
      items: [
        { id: 'dashboard', label: 'Dashboard Eksekutif', icon: LayoutDashboard }
      ]
    },
    {
      group: 'PENDAFTARAN & CONSENT',
      items: [
        { id: 'pendaftaran', label: 'Pendaftaran & IGD', icon: ClipboardList },
        { id: 'kunjungan', label: 'Kunjungan Pasien', icon: Users },
        { id: 'bedmanagement', label: 'Bed Management (Ranap)', icon: Bed },
        { id: 'generalconsent', label: 'General Consent', icon: FileSignature }
      ]
    },
    {
      group: 'PEMERIKSAAN & CLINICAL',
      items: [
        { id: 'cppt', label: 'CPPT / Asesmen SOAP', icon: FilePenLine },
        { id: 'rekammedis', label: 'Pemeriksaan Rawat Jalan', icon: FileText },
        { id: 'informedconsent', label: 'Informed Consent', icon: Handshake },
        { id: 'resumemedis', label: 'Resume Medis', icon: FileText }
      ]
    },
    {
      group: 'PENUNJANG MEDIS',
      items: [
        { id: 'farmasi', label: 'Farmasi & Apotek', icon: Pill },
        { id: 'laboratorium', label: 'Laboratorium', icon: FlaskConical },
        { id: 'radiologi', label: 'Radiologi', icon: Radio }
      ]
    },
    {
      group: 'CODING & BPJS',
      items: [
        { id: 'coding', label: 'Coding ICD-10 & ICD-9', icon: Barcode },
        { id: 'klaim', label: 'Klaim & VClaim BPJS', icon: ShieldAlert },
        { id: 'pelaporan', label: 'Pelaporan RS (RL)', icon: BarChart3 },
        { id: 'metadata', label: 'Kamus Metadata KMK 1423', icon: BookOpen }
      ]
    },
    {
      group: 'KEUANGAN',
      items: [
        { id: 'billing', label: 'Billing Pasien', icon: Receipt },
        { id: 'pembayaran', label: 'Kasir & Pembayaran', icon: Banknote }
      ]
    },
    {
      group: 'PRAKTIKUM & ADMIN',
      items: [
        { id: 'praktikum', label: 'Ujian Praktik & Simulasi', icon: GraduationCap },
        { id: 'audit', label: 'Audit Trail (Superadmin)', icon: ShieldCheck, superadminOnly: true },
        { id: 'logaktivitas', label: 'Log Aktivitas', icon: History },
        { id: 'manajemenuser', label: 'Hak Akses & Pengguna', icon: Users }
      ]
    }
  ];

  const { canEditPage, params } = useApp();

  const isSuperAdmin = user.roleId === 'R01';

  const handleNavClick = (itemId: string) => {
    if (itemId === 'kunjungan') {
      navigate('pendaftaran', { tab: 'kunjungan' });
    } else if (itemId === 'bedmanagement') {
      navigate('pendaftaran', { viewMode: 'bedmanagement' });
    } else {
      navigate(itemId);
    }
  };

  const hasAccess = (_pageId: string) => {
    return true; // Everyone can view all modules/displays
  };

  return (
    <aside
      className={`fixed top-0 left-0 z-40 h-screen bg-white text-slate-800 transition-all duration-300 flex flex-col border-r border-blue-100 shadow-md ${
        sidebarCollapsed ? 'w-18' : 'w-64'
      }`}
    >
      {/* Brand: Logo Esa Unggul & Logo Rekam Medis RMIK Berdekatan Tanpa Latar Belakang */}
      <div className="h-17 sm:h-18 flex items-center gap-2.5 px-3.5 border-b border-[#0852bc] bg-[#0952be] text-white select-none">
        {sidebarCollapsed ? (
          <div className="w-full flex justify-center">
            <div
              className="flex flex-col items-center gap-1.5 cursor-pointer"
              title="SIMRS Esa Unggul"
              onClick={() => navigate('dashboard')}
            >
              <img
                src={esaUnggulEmblem}
                alt="Logo Esa Unggul"
                className="w-6 h-6 object-contain shrink-0"
                referrerPolicy="no-referrer"
              />
              <RmikLogo size="sm" showText={false} className="w-6 h-6 shrink-0" />
            </div>
          </div>
        ) : (
          <>
            {/* Logo Esa Unggul & Logo Rekam Medis langsung tanpa latar belakang */}
            <div
              className="flex items-center gap-1.5 shrink-0 cursor-pointer"
              onClick={() => navigate('dashboard')}
              title="SIMRS Esa Unggul"
            >
              <img
                src={esaUnggulEmblem}
                alt="Logo Esa Unggul"
                className="w-7 h-7 sm:w-8 sm:h-8 object-contain shrink-0 drop-shadow-xs"
                referrerPolicy="no-referrer"
              />
              <RmikLogo size="sm" showText={false} className="w-7 h-7 sm:w-8 sm:h-8 shrink-0 drop-shadow-xs" />
            </div>

            <div
              className="overflow-hidden min-w-0 cursor-pointer"
              onClick={() => navigate('dashboard')}
            >
              <h1 className="font-extrabold text-white text-sm sm:text-[15px] tracking-tight leading-tight truncate">
                SIMRS Esa Unggul
              </h1>
            </div>
          </>
        )}
      </div>

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto py-3 px-2 space-y-4 scrollbar-thin">
        {navGroups.map((group, gIdx) => {
          const visibleItems = group.items.filter(item => hasAccess(item.id));
          if (visibleItems.length === 0) return null;

          return (
            <div key={gIdx} className="space-y-1">
              {group.group && !sidebarCollapsed && (
                <div className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">
                  {group.group}
                </div>
              )}
              {visibleItems.map(item => {
                const Icon = item.icon;
                const isKunjunganActive = item.id === 'kunjungan' && activePage === 'pendaftaran' && params?.tab === 'kunjungan';
                const isPendaftaranActive = item.id === 'pendaftaran' && activePage === 'pendaftaran' && params?.tab !== 'kunjungan';
                const isActive = item.id === 'kunjungan' ? isKunjunganActive : item.id === 'pendaftaran' ? isPendaftaranActive : activePage === item.id;
                const isEditable = canEditPage(item.id === 'kunjungan' ? 'pendaftaran' : item.id);

                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#0B5ED7] text-white shadow-md shadow-blue-600/30 font-extrabold'
                        : 'text-slate-700 hover:text-[#0B5ED7] hover:bg-blue-50/80'
                    }`}
                    title={sidebarCollapsed ? `${item.label}${!isEditable ? ' (Mode Lihat)' : ''}` : undefined}
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-[#0B5ED7]'}`} />
                      {!sidebarCollapsed && (
                        <span className="truncate">{item.label}</span>
                      )}
                    </div>
                    {!sidebarCollapsed && item.superadminOnly && (
                      <span className={`text-[9px] px-1.5 py-0.2 rounded font-extrabold shrink-0 ${
                        isActive ? 'bg-amber-400 text-slate-950' : 'bg-amber-100 text-amber-900 border border-amber-300'
                      }`}>
                        R01
                      </span>
                    )}
                    {!sidebarCollapsed && !item.superadminOnly && !isEditable && item.id !== 'dashboard' && item.id !== 'praktikum' && (
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold shrink-0 ${
                        isActive ? 'bg-blue-500 text-blue-100' : 'bg-slate-200 text-slate-600'
                      }`}>
                        Lihat
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Footer Info */}
      {!sidebarCollapsed && (
        <div className="p-3 border-t border-slate-100 bg-slate-50/80 text-[10px] text-slate-500 font-semibold text-center">
          Universitas Esa Unggul &copy; 2026
        </div>
      )}
    </aside>
  );
};
