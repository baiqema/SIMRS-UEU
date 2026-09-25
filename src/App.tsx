import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { LoginView } from './views/LoginView';
import { DashboardView } from './views/DashboardView';
import { PendaftaranView } from './views/PendaftaranView';
import { GeneralConsentView } from './views/GeneralConsentView';
import { RekamMedisView } from './views/RekamMedisView';
import { CPPTView } from './views/CPPTView';
import { InformedConsentView } from './views/InformedConsentView';
import { ResumeMedisView } from './views/ResumeMedisView';
import { CodingView } from './views/CodingView';
import { KlaimView } from './views/KlaimView';
import { BillingView } from './views/BillingView';
import { PembayaranView } from './views/PembayaranView';
import { FarmasiView } from './views/FarmasiView';
import { LaboratoriumView } from './views/LaboratoriumView';
import { RadiologiView } from './views/RadiologiView';
import { ManajemenUserView } from './views/ManajemenUserView';
import { PraktikumView } from './views/PraktikumView';
import { AuditTrailView } from './views/AuditTrailView';
import { LogAktivitasView } from './views/LogAktivitasView';
import { PelaporanView } from './views/PelaporanView';
import { MetadataRmeView } from './views/MetadataRmeView';
import { ShieldAlert } from 'lucide-react';

const AppContent: React.FC = () => {
  const { user, activePage, sidebarCollapsed, getRole } = useApp();

  if (!user) {
    return <LoginView />;
  }

  const role = getRole(user.roleId);
  const access = role?.access || [];

  const hasPageAccess = (pageId: string) => {
    if (pageId === 'kunjungan') return access.includes('all') || access.includes('pendaftaran') || access.includes('kunjungan');
    if (pageId === 'audit') return user.roleId === 'R01';
    return access.includes('all') || access.includes(pageId);
  };

  const renderView = () => {
    if (!hasPageAccess(activePage)) {
      return (
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-slate-200 shadow-xs p-8 text-center space-y-3">
          <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-bold text-slate-800">Akses Ditolak (RBAC Restriction)</h2>
          <p className="text-xs text-slate-500 max-w-md leading-relaxed">
            {activePage === 'audit'
              ? 'Modul Audit Trail dikhususkan hanya untuk Super Administrator (R01) sesuai standar kepatuhan regulasi.'
              : `Peran Anda (${role?.name}) tidak memiliki kewenangan untuk mengakses modul ${activePage}.`}
          </p>
        </div>
      );
    }

    switch (activePage) {
      case 'dashboard':
        return <DashboardView />;
      case 'pendaftaran':
      case 'kunjungan':
      case 'bedmanagement':
        return <PendaftaranView />;
      case 'generalconsent':
        return <GeneralConsentView />;
      case 'rekammedis':
        return <RekamMedisView />;
      case 'cppt':
        return <CPPTView />;
      case 'informedconsent':
        return <InformedConsentView />;
      case 'resumemedis':
        return <ResumeMedisView />;
      case 'coding':
        return <CodingView />;
      case 'klaim':
        return <KlaimView />;
      case 'billing':
        return <BillingView />;
      case 'pembayaran':
        return <PembayaranView />;
      case 'farmasi':
        return <FarmasiView />;
      case 'laboratorium':
        return <LaboratoriumView />;
      case 'radiologi':
        return <RadiologiView />;
      case 'manajemenuser':
        return <ManajemenUserView />;
      case 'praktikum':
        return <PraktikumView />;
      case 'audit':
        return <AuditTrailView />;
      case 'logaktivitas':
        return <LogAktivitasView />;
      case 'pelaporan':
        return <PelaporanView />;
      case 'metadata':
        return <MetadataRmeView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen bg-[#EEF4FB] text-slate-900 font-sans flex antialiased">
      {/* Persistent Left Navigation Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${sidebarCollapsed ? 'ml-18' : 'ml-64'}`}>
        {/* Top Header System */}
        <Header />

        {/* View Main Content */}
        <main className={activePage === 'cppt' ? 'flex-1 w-full px-3 sm:px-6 py-4 space-y-6' : 'flex-1 p-4 sm:p-7 max-w-7xl w-full mx-auto space-y-6'}>
          {renderView()}
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
