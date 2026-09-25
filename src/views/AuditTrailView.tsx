import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Modal } from '../components/Modal';
import {
  ShieldCheck, ShieldAlert, Search, Filter, Download, Eye,
  Lock, ArrowRight, RefreshCw, Layers, CheckCircle2, AlertTriangle, FileText, Activity
} from 'lucide-react';
import { AuditEntry } from '../types';
import Swal from 'sweetalert2';

export const AuditTrailView: React.FC = () => {
  const { auditTrail, user, logAudit } = useApp();
  const isSuperAdmin = user?.roleId === 'R01';

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState('ALL');
  const [filterEntity, setFilterEntity] = useState('ALL');

  // Modal Detail Inspection
  const [selectedEntry, setSelectedEntry] = useState<AuditEntry | null>(null);

  // If user is not superadmin, render security restricted lock screen
  if (!isSuperAdmin) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-rose-200 shadow-xs p-8 text-center space-y-4">
          <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center border border-rose-100 shadow-xs">
            <Lock className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-slate-900">Akses Terbatas: Super Administrator Only</h2>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              Modul <strong>Audit Trail (Log Diff Integrity)</strong> memuat catatan forensik keamanan, manipulasi basis data, dan riwayat IP Address. Berdasarkan KMK HK.01.07/MENKES/1423/2022 dan ISO 27001, modul ini hanya dapat diakses oleh pemegang peran <strong>Super Administrator (R01)</strong>.
            </p>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 font-mono">
            Peran Anda Saat Ini: <strong>{user?.name}</strong> ({user?.roleId})
          </div>
        </div>
      </div>
    );
  }

  // Filter audit records
  const filteredAudit = auditTrail.filter(entry => {
    const matchSearch = searchTerm
      ? (entry.userName && entry.userName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (entry.entity && entry.entity.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (entry.entityId && entry.entityId.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (entry.field_name && entry.field_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (entry.old_value && entry.old_value.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (entry.new_value && entry.new_value.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (entry.ip && entry.ip.includes(searchTerm))
      : true;

    const matchAction = filterAction !== 'ALL' ? entry.action === filterAction : true;
    const matchEntity = filterEntity !== 'ALL' ? entry.entity === filterEntity : true;

    return matchSearch && matchAction && matchEntity;
  });

  // KPI calculations
  const totalCount = auditTrail.length;
  const createCount = auditTrail.filter(a => a.action === 'CREATE').length;
  const updateCount = auditTrail.filter(a => a.action === 'UPDATE').length;
  const deleteCount = auditTrail.filter(a => a.action === 'DELETE').length;

  const handleExportCSV = () => {
    if (filteredAudit.length === 0) {
      Swal.fire({
        icon: 'info',
        title: 'Tidak Ada Data',
        text: 'Tidak ada data log yang memenuhi kriteria filter untuk diekspor.',
        confirmButtonColor: '#2563eb'
      });
      return;
    }

    const headers = ['ID,Timestamp,User ID,User Name,Action,Entity,Entity ID,Field Name,Old Value,New Value,IP Address\n'];
    const rows = filteredAudit.map(e => {
      const cleanOld = (e.old_value || '').replace(/"/g, '""');
      const cleanNew = (e.new_value || '').replace(/"/g, '""');
      return `"${e.id}","${e.timestamp}","${e.userId}","${e.userName}","${e.action}","${e.entity}","${e.entityId}","${e.field_name || ''}","${cleanOld}","${cleanNew}","${e.ip}"\n`;
    });

    const blob = new Blob([headers.concat(rows).join('')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Audit_Trail_SIMRS_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCreateTestLog = () => {
    logAudit({
      action: 'UPDATE',
      entity: 'SecurityPolicy',
      entityId: 'SEC-POL-01',
      field_name: 'rbac_enforcement_status',
      old_value: 'PARTIAL_MODE',
      new_value: 'STRICT_SUPERADMIN_ENFORCED'
    });

    Swal.fire({
      icon: 'success',
      title: 'Log Integritas Dicatat',
      text: 'Entri audit pengujian berhasil dimasukkan ke dalam basis data Audit Trail.',
      timer: 1400,
      showConfirmButton: false
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            Audit Trail & Log Diff Integrity (Khusus Superadmin)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Pencatatan riwayat perubahan data (field-level change tracking) untuk kepatuhan hukum, forensik dan akreditasi RS.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCreateTestLog}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
            title="Catat entri log simulasi pengujian"
          >
            <Activity className="w-3.5 h-3.5 text-blue-600" />
            <span>Simulasi Uji Log</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
            title="Ekspor data audit ke format CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Ekspor CSV</span>
          </button>
        </div>
      </div>

      {/* Security Status Banner */}
      <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-900 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
          <div>
            <strong>Kepatuhan KMK HK.01.07/MENKES/1423/2022:</strong> Setiap transaksi mencatat otomatis <code>field_name</code>, <code>old_value</code>, <code>new_value</code>, <code>action</code>, <code>timestamp</code>, <code>user_id</code>, dan <code>IP Address</code>.
          </div>
        </div>
        <span className="font-mono text-[10px] font-bold bg-emerald-200 px-2 py-0.5 rounded-md text-emerald-900 shrink-0 hidden md:inline">
          OTORISASI SUPERADMIN: AKTIF
        </span>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Entri Audit</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{totalCount}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Semua jejak rekam</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Operasi CREATE</div>
          <div className="text-2xl font-black text-emerald-700 mt-1">{createCount}</div>
          <div className="text-[10px] text-emerald-600 mt-0.5">Pendaftaran & input data</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">Operasi UPDATE / Diff</div>
          <div className="text-2xl font-black text-amber-700 mt-1">{updateCount}</div>
          <div className="text-[10px] text-amber-600 mt-0.5">Perubahan nilai field</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold text-rose-600 uppercase tracking-wider">Operasi DELETE / Batal</div>
          <div className="text-2xl font-black text-rose-700 mt-1">{deleteCount}</div>
          <div className="text-[10px] text-rose-600 mt-0.5">Pembatalan & penghapusan</div>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Cari user, entitas, field, IP..."
              className="pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs w-64 focus:bg-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <select
            value={filterAction}
            onChange={e => setFilterAction(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
          >
            <option value="ALL">Semua Aksi</option>
            <option value="CREATE">CREATE</option>
            <option value="UPDATE">UPDATE</option>
            <option value="DELETE">DELETE</option>
            <option value="LOGIN">LOGIN</option>
          </select>

          <select
            value={filterEntity}
            onChange={e => setFilterEntity(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
          >
            <option value="ALL">Semua Entitas</option>
            <option value="Registration">Registration</option>
            <option value="Patient">Patient</option>
            <option value="CPPT">CPPT</option>
            <option value="MedicalRecord">MedicalRecord</option>
            <option value="Billing">Billing</option>
            <option value="Coding">Coding</option>
            <option value="User">User</option>
            <option value="Role">Role</option>
            <option value="SecurityPolicy">SecurityPolicy</option>
          </select>
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Menampilkan <strong>{filteredAudit.length}</strong> dari <strong>{totalCount}</strong> log
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-wider font-bold">
                <th className="p-3.5">Waktu (Timestamp)</th>
                <th className="p-3.5">Pengguna (User)</th>
                <th className="p-3.5">Aksi</th>
                <th className="p-3.5">Entitas / Modul</th>
                <th className="p-3.5">ID Entitas</th>
                <th className="p-3.5">Field Changed</th>
                <th className="p-3.5">Nilai Lama (Old)</th>
                <th className="p-3.5">Nilai Baru (New)</th>
                <th className="p-3.5">IP Address</th>
                <th className="p-3.5 text-right">Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {filteredAudit.map(entry => (
                <tr
                  key={entry.id}
                  onClick={() => setSelectedEntry(entry)}
                  className="hover:bg-blue-50/60 transition-colors cursor-pointer"
                >
                  <td className="p-3.5 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                    {new Date(entry.timestamp).toLocaleString('id-ID')}
                  </td>
                  <td className="p-3.5 font-bold text-slate-900">{entry.userName}</td>
                  <td className="p-3.5">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                      entry.action === 'CREATE' ? 'bg-emerald-100 text-emerald-800' :
                      entry.action === 'UPDATE' ? 'bg-amber-100 text-amber-800' :
                      entry.action === 'DELETE' ? 'bg-rose-100 text-rose-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {entry.action}
                    </span>
                  </td>
                  <td className="p-3.5 font-semibold text-slate-800">{entry.entity}</td>
                  <td className="p-3.5 font-mono text-slate-500 text-[10px]">{entry.entityId}</td>
                  <td className="p-3.5 font-mono text-blue-700 font-bold">{entry.field_name || '-'}</td>
                  <td className="p-3.5 max-w-[140px] truncate text-rose-600 font-mono text-[11px]">
                    {entry.old_value ?? '-'}
                  </td>
                  <td className="p-3.5 max-w-[140px] truncate text-emerald-600 font-mono text-[11px]">
                    {entry.new_value ?? '-'}
                  </td>
                  <td className="p-3.5 font-mono text-slate-400 text-[10px]">{entry.ip}</td>
                  <td className="p-3.5 text-right" onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => setSelectedEntry(entry)}
                      className="p-1.5 bg-slate-100 hover:bg-blue-100 text-slate-600 hover:text-blue-700 rounded-lg transition-colors cursor-pointer"
                      title="Lihat Detail Diff Log"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAIL MODAL (DIFF INSPECTOR) */}
      {selectedEntry && (
        <Modal
          isOpen={!!selectedEntry}
          onClose={() => setSelectedEntry(null)}
          title={`Inspeksi Audit Trail (${selectedEntry.id})`}
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Waktu Transaksi</span>
                <span className="font-mono font-bold text-slate-800">
                  {new Date(selectedEntry.timestamp).toLocaleString('id-ID')}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Pengguna & IP Address</span>
                <span className="font-bold text-slate-800">
                  {selectedEntry.userName} ({selectedEntry.userId}) &bull; {selectedEntry.ip}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Entitas & Record ID</span>
                <span className="font-bold text-blue-700">
                  {selectedEntry.entity} &bull; <span className="font-mono">{selectedEntry.entityId}</span>
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Aksi / Operasi</span>
                <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                  selectedEntry.action === 'CREATE' ? 'bg-emerald-100 text-emerald-800' :
                  selectedEntry.action === 'UPDATE' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                }`}>
                  {selectedEntry.action}
                </span>
              </div>
            </div>

            <div>
              <span className="text-slate-500 font-bold block mb-1">Field yang Dimodifikasi:</span>
              <div className="p-2 bg-slate-100 rounded-lg font-mono font-bold text-blue-800">
                {selectedEntry.field_name || '(Full Entity Snapshot / Action)'}
              </div>
            </div>

            {/* Side-by-side diff */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 block">
                  Nilai Sebelumnya (Old Value)
                </span>
                <pre className="font-mono text-xs text-rose-900 whitespace-pre-wrap break-all bg-white p-2.5 rounded-lg border border-rose-200">
                  {selectedEntry.old_value || '(Kosong / Belum Ada Data)'}
                </pre>
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">
                  Nilai Terbaru (New Value)
                </span>
                <pre className="font-mono text-xs text-emerald-900 whitespace-pre-wrap break-all bg-white p-2.5 rounded-lg border border-emerald-200">
                  {selectedEntry.new_value || '(Dihapus / Kosong)'}
                </pre>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedEntry(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
              >
                Tutup Inspeksi
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
