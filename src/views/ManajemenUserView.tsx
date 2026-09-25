import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Modal } from '../components/Modal';
import Swal from 'sweetalert2';
import {
  Users, Plus, ShieldCheck, UserCheck, Key, ShieldAlert,
  Edit3, Trash2, CheckCircle2, Lock, Unlock, Search,
  CheckSquare, Square, Save, RefreshCw, Layers, Sliders, Check
} from 'lucide-react';
import { RoleId, User } from '../types';

export const ALL_SYSTEM_MODULES = [
  {
    group: 'MODUL INTI & EKSEKUTIF',
    modules: [
      { id: 'dashboard', name: 'Dashboard Eksekutif', desc: 'Indikator kinerja RS, statistik BOR/LOS, tren kunjungan' },
      { id: 'portal', name: 'Portal Layanan SIMRS', desc: 'Menu utama agregator seluruh unit layanan RS' },
      { id: 'metadata', name: 'Kamus Metadata KMK 1423', desc: 'Katalog standar variabel data rekam medis Kemenkes RI' }
    ]
  },
  {
    group: 'PENDAFTARAN & KUNJUNGAN PASIEN',
    modules: [
      { id: 'pendaftaran', name: 'Pendaftaran & Kunjungan Pasien', desc: 'Registrasi RJ/RI/IGD, Bridging SatuSehat & Laporan Kunjungan' },
      { id: 'generalconsent', name: 'General Consent', desc: 'Lembar persetujuan umum pasien/wali saat pendaftaran' }
    ]
  },
  {
    group: 'PEMERIKSAAN MEDIS & RME TERPADU',
    modules: [
      { id: 'rekammedis', name: 'Pemeriksaan RME / Rawat Jalan', desc: 'Lembar kerja pemeriksaan dokter poliklinik & triase IGD' },
      { id: 'cppt', name: 'CPPT / Asesmen SOAP', desc: 'Catatan Perkembangan Pasien Terintegrasi multi-profesi PPA' },
      { id: 'informedconsent', name: 'Informed Consent', desc: 'Persetujuan/penolakan tindakan kedokteran & pembiusan' },
      { id: 'resumemedis', name: 'Resume Medis Pasien', desc: 'Ringkasan pulang pasien rawat inap / rujukan' }
    ]
  },
  {
    group: 'PENUNJANG MEDIS',
    modules: [
      { id: 'farmasi', name: 'Farmasi & Apotek', desc: 'Penerimaan resep elektronik, telaah obat, peracikan & penyerahan' },
      { id: 'laboratorium', name: 'Laboratorium Klinik', desc: 'Order pemeriksaan spesimen, input hasil lab & nilai rujukan' },
      { id: 'radiologi', name: 'Radiologi & Imaging', desc: 'Pemeriksaan Rontgen/USG/CT-Scan, ekspertise dokter spesialis' }
    ]
  },
  {
    group: 'KODING, KLAIM BPJS & PELAPORAN',
    modules: [
      { id: 'coding', name: 'Coding ICD-10 & ICD-9-CM', desc: 'Kodifikasi diagnosa dan prosedur medis oleh Perekam Medis' },
      { id: 'klaim', name: 'Klaim BPJS & INA-CBG', desc: 'Grouping tarif BPJS, validasi berkas klaim digital' },
      { id: 'pelaporan', name: 'Pelaporan RS (RL SIRS)', desc: 'Ekspor formulir pelaporan morbiditas & mortalitas Kemenkes' }
    ]
  },
  {
    group: 'KEUANGAN & KASIR',
    modules: [
      { id: 'billing', name: 'Billing Pasien', desc: 'Rincian akumulasi biaya tindakan, kamar, jasa medis dan obat' },
      { id: 'pembayaran', name: 'Kasir & Pembayaran', desc: 'Penerimaan pembayaran tunai/debit/QRIS & kwitansi sah' }
    ]
  },
  {
    group: 'ADMINISTRASI & PEMBELAJARAN',
    modules: [
      { id: 'praktikum', name: 'Modul Praktikum RMIK', desc: 'Skenario pembelajaran, evaluasi & logbook mahasiswa' },
      { id: 'audit', name: 'Audit Trail (Superadmin)', desc: 'Pelacakan integritas per field data, IP address & user log' },
      { id: 'logaktivitas', name: 'Log Aktivitas Sistem', desc: 'Catatan log sesi login, logout dan transaksi aplikasi' },
      { id: 'manajemenuser', name: 'Manajemen Pengguna & Hak Akses', desc: 'Kelola akun user, reset password, dan konfigurasi RBAC' }
    ]
  }
];

export const ManajemenUserView: React.FC = () => {
  const { users, roles, user: currentUser, addUser, updateUser, deleteUser, updateRolePermissions, getRole, canEditPage } = useApp();
  const isEditable = canEditPage('user');
  const isSuperAdmin = currentUser?.roleId === 'R01';

  // Active View Tab: 'users' (Daftar Pengguna) | 'rbac' (Matriks Hak Akses)
  const [activeTab, setActiveTab] = useState<'users' | 'rbac'>('users');

  // Search & Filter Users
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');

  // Modal Create User
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [roleId, setRoleId] = useState<RoleId>('R04');

  // Modal Edit User
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editName, setEditName] = useState('');
  const [editRoleId, setEditRoleId] = useState<RoleId>('R04');
  const [editActive, setEditActive] = useState(true);

  // RBAC Matrix State
  const [selectedRoleId, setSelectedRoleId] = useState<RoleId>('R07');
  const [currentSelectedAccess, setCurrentSelectedAccess] = useState<string[]>([]);

  // Sync selected role permissions when selectedRoleId changes
  useEffect(() => {
    const r = roles.find(role => role.id === selectedRoleId);
    if (r) {
      setCurrentSelectedAccess([...r.access]);
    }
  }, [selectedRoleId, roles]);

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEditable) {
      Swal.fire({
        icon: 'warning',
        title: 'Akses Terbatas (Mode Lihat)',
        text: 'Anda berada dalam Mode Lihat untuk Manajemen Pengguna. Silakan hubungi Super Administrator.',
        confirmButtonColor: '#d97706'
      });
      return;
    }
    if (!name.trim() || !username.trim() || !password.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Validasi Data',
        text: 'Lengkapi Nama Lengkap, Username, dan Password.',
        confirmButtonColor: '#2563eb'
      });
      return;
    }

    const res = addUser({
      name,
      username,
      password,
      roleId
    });

    if (!res.success) {
      Swal.fire({
        icon: 'error',
        title: 'Gagal Membuat Pengguna',
        text: res.message || 'Username sudah digunakan di dalam sistem.',
        confirmButtonColor: '#2563eb'
      });
      return;
    }

    setIsCreateModalOpen(false);
    setName('');
    setUsername('');
    setPassword('');

    Swal.fire({
      icon: 'success',
      title: 'Pengguna Berhasil Ditambahkan',
      text: `Akun ${username} dengan peran ${roles.find(r => r.id === roleId)?.name} siap digunakan.`,
      timer: 1600,
      showConfirmButton: false
    });
  };

  const handleOpenEditUser = (u: User) => {
    setEditingUser(u);
    setEditName(u.name);
    setEditRoleId(u.roleId);
    setEditActive(u.active);
  };

  const handleSaveEditUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    updateUser(editingUser.id, {
      name: editName,
      roleId: editRoleId,
      active: editActive
    });

    setEditingUser(null);
    Swal.fire({
      icon: 'success',
      title: 'Perubahan Disimpan',
      text: `Data akun ${editingUser.username} berhasil diperbarui.`,
      timer: 1500,
      showConfirmButton: false
    });
  };

  const handleDeleteUser = (u: User) => {
    if (u.id === 'U001') {
      Swal.fire({
        icon: 'error',
        title: 'Proteksi Akun Root',
        text: 'Akun Super Administrator Utama tidak dapat dihapus demi keamanan sistem.',
        confirmButtonColor: '#2563eb'
      });
      return;
    }

    Swal.fire({
      title: `Hapus Akun ${u.username}?`,
      text: `Apakah Anda yakin ingin menghapus akun ${u.name}? Tindakan ini tidak dapat dibatalkan.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, Hapus Pengguna',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#e11d48',
      cancelButtonColor: '#64748b'
    }).then(result => {
      if (result.isConfirmed) {
        const res = deleteUser(u.id);
        if (res.success) {
          Swal.fire({
            icon: 'success',
            title: 'Pengguna Dihapus',
            text: `Akun ${u.username} telah dihapus dari sistem.`,
            timer: 1500,
            showConfirmButton: false
          });
        }
      }
    });
  };

  // Toggle single permission checkbox
  const handleToggleModule = (moduleId: string) => {
    if (!isSuperAdmin) {
      Swal.fire({
        icon: 'error',
        title: 'Akses Ditolak (Superadmin Only)',
        text: 'Hanya peran Super Administrator (R01) yang memiliki otoritas untuk memodifikasi Hak Akses sistem.',
        confirmButtonColor: '#e11d48'
      });
      return;
    }

    setCurrentSelectedAccess(prev => {
      // If currently 'all', expand to all modules except the untoggled one
      if (prev.includes('all')) {
        const allIds = ALL_SYSTEM_MODULES.flatMap(g => g.modules.map(m => m.id));
        return allIds.filter(id => id !== moduleId);
      }

      if (prev.includes(moduleId)) {
        return prev.filter(id => id !== moduleId);
      } else {
        return [...prev, moduleId];
      }
    });
  };

  // Toggle "All Access" for current role
  const handleToggleAllAccess = () => {
    if (!isSuperAdmin) return;
    if (currentSelectedAccess.includes('all')) {
      setCurrentSelectedAccess([]);
    } else {
      setCurrentSelectedAccess(['all']);
    }
  };

  const handleSelectAllIndividual = () => {
    if (!isSuperAdmin) return;
    const allIds = ALL_SYSTEM_MODULES.flatMap(g => g.modules.map(m => m.id));
    setCurrentSelectedAccess(allIds);
  };

  const handleClearAll = () => {
    if (!isSuperAdmin) return;
    setCurrentSelectedAccess([]);
  };

  const handleSaveRolePermissions = () => {
    if (!isSuperAdmin) {
      Swal.fire({
        icon: 'error',
        title: 'Akses Ditolak',
        text: 'Hanya peran Super Administrator (R01) yang berwenang mengubah matriks hak akses.',
        confirmButtonColor: '#e11d48'
      });
      return;
    }

    updateRolePermissions(selectedRoleId, currentSelectedAccess);
    const targetRole = roles.find(r => r.id === selectedRoleId);

    Swal.fire({
      icon: 'success',
      title: 'Hak Akses Berhasil Disimpan!',
      text: `Kewenangan modul untuk peran "${targetRole?.name}" telah diperbarui dan dicatat pada Audit Trail.`,
      timer: 1800,
      showConfirmButton: false
    });
  };

  const filteredUsers = users.filter(u => {
    const matchSearch = searchTerm
      ? u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.id.toLowerCase().includes(searchTerm.toLowerCase())
      : true;
    const matchRole = filterRole !== 'all' ? u.roleId === filterRole : true;
    return matchSearch && matchRole;
  });

  const selectedRoleObj = roles.find(r => r.id === selectedRoleId);
  const isCurrentRoleAll = currentSelectedAccess.includes('all');

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            Manajemen Pengguna & Konfigurasi Hak Akses (RBAC)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Pengelolaan akun petugas faskes, otentikasi, serta pembatasan kewenangan akses modul SIMRS.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-200/80 p-1.5 rounded-2xl shrink-0">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'users'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Daftar Pengguna ({users.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('rbac')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'rbac'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            <Sliders className="w-4 h-4 text-amber-300" />
            <span>Hak Akses (Superadmin)</span>
            <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-amber-400 text-slate-950 font-black">
              R01
            </span>
          </button>
        </div>
      </div>

      {/* Superadmin Indicator Banner */}
      {isSuperAdmin ? (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs text-emerald-900">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <strong>Super Administrator Terverifikasi:</strong> Anda memiliki hak penuh untuk mengelola pengguna, mereset otorisasi, dan mencentang hak akses tiap peran di modul ini.
            </div>
          </div>
          <span className="font-mono text-[10px] font-bold bg-emerald-200 px-2 py-0.5 rounded-md text-emerald-900 hidden sm:inline">
            ROOT PRIVILEGE (R01)
          </span>
        </div>
      ) : (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-2.5 text-xs text-amber-900">
          <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
          <div>
            <strong>Pemberitahuan Hak Akses:</strong> Akun Anda saat ini adalah <strong>{currentUser?.name}</strong>. Pengubahan matriks kewenangan hak akses dibatasi hanya untuk Super Administrator (R01).
          </div>
        </div>
      )}

      {/* TAB 1: DAFTAR PENGGUNA (USERS TABLE) */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          {/* Toolbar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  placeholder="Cari Nama, Username, atau ID..."
                  className="pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs w-64 focus:bg-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <select
                value={filterRole}
                onChange={e => setFilterRole(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
              >
                <option value="all">Semua Peran / Jabatan</option>
                {roles.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-2 cursor-pointer transition-all self-start md:self-auto"
            >
              <Plus className="w-4 h-4" /> Tambah User Baru
            </button>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-wider font-bold">
                    <th className="p-3.5">ID User</th>
                    <th className="p-3.5">Nama Lengkap & Gelar</th>
                    <th className="p-3.5">Username</th>
                    <th className="p-3.5">Role / Jabatan</th>
                    <th className="p-3.5">Akses Modul</th>
                    <th className="p-3.5 text-center">Status</th>
                    <th className="p-3.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                  {filteredUsers.map(u => {
                    const r = getRole(u.roleId);
                    return (
                      <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3.5 font-bold font-mono text-blue-700">{u.id}</td>
                        <td className="p-3.5 font-bold text-slate-900">{u.name}</td>
                        <td className="p-3.5 font-mono text-slate-600">{u.username}</td>
                        <td className="p-3.5">
                          <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                            u.roleId === 'R01' ? 'bg-amber-100 text-amber-900 border border-amber-300' :
                            u.roleId === 'R03' ? 'bg-purple-100 text-purple-900' :
                            u.roleId === 'R05' ? 'bg-blue-100 text-blue-900' :
                            u.roleId === 'R06' ? 'bg-rose-100 text-rose-900' :
                            'bg-slate-100 text-slate-800'
                          }`}>
                            {r?.name || u.roleId}
                          </span>
                        </td>
                        <td className="p-3.5 max-w-xs truncate text-[11px] text-slate-500 font-mono">
                          {r?.access.includes('all') ? (
                            <span className="font-bold text-emerald-600">Semua Modul (Full Access)</span>
                          ) : (
                            r?.access.join(', ') || '-'
                          )}
                        </td>
                        <td className="p-3.5 text-center">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            u.active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                          }`}>
                            {u.active ? 'Aktif' : 'Non-Aktif'}
                          </span>
                        </td>
                        <td className="p-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenEditUser(u)}
                              className="p-1.5 bg-slate-100 hover:bg-blue-100 text-slate-600 hover:text-blue-700 rounded-lg transition-colors cursor-pointer"
                              title="Edit Pengguna"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            {u.id !== 'U001' && (
                              <button
                                onClick={() => handleDeleteUser(u)}
                                className="p-1.5 bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-700 rounded-lg transition-colors cursor-pointer"
                                title="Hapus Pengguna"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MATRIKS HAK AKSES MODUL (RBAC PERMISSION CHECKBOXES) */}
      {activeTab === 'rbac' && (
        <div className="space-y-6">
          {/* Top Selection & Action Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  Pilih Peran / Jabatan yang Akan Dikonfigurasi Hak Aksesnya:
                </label>
                <div className="flex items-center gap-3">
                  <select
                    value={selectedRoleId}
                    onChange={e => setSelectedRoleId(e.target.value as RoleId)}
                    className="px-4 py-2 bg-slate-50 border-2 border-blue-300 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:border-blue-600 shadow-2xs"
                  >
                    {roles.map(r => (
                      <option key={r.id} value={r.id}>
                        {r.id}: {r.name} ({r.access.includes('all') ? 'Semua Modul' : `${r.access.length} Modul`})
                      </option>
                    ))}
                  </select>

                  <span className="text-xs text-slate-500 hidden sm:inline">
                    Status saat ini: <strong className="text-blue-900 font-bold">{selectedRoleObj?.name}</strong>
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleToggleAllAccess}
                  disabled={!isSuperAdmin}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    isCurrentRoleAll
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Akses Semua Modul ({isCurrentRoleAll ? 'Aktif' : 'Non-Aktif'})</span>
                </button>

                <button
                  type="button"
                  onClick={handleSelectAllIndividual}
                  disabled={!isSuperAdmin || isCurrentRoleAll}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer disabled:opacity-50"
                  title="Centang semua modul satu per satu"
                >
                  Centang Semua
                </button>

                <button
                  type="button"
                  onClick={handleClearAll}
                  disabled={!isSuperAdmin}
                  className="px-3 py-2 bg-slate-100 hover:bg-rose-100 text-slate-700 hover:text-rose-700 rounded-xl text-xs font-bold cursor-pointer disabled:opacity-50"
                  title="Kosongkan semua centang"
                >
                  Kosongkan
                </button>

                <button
                  type="button"
                  onClick={handleSaveRolePermissions}
                  disabled={!isSuperAdmin}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-all"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Perubahan Hak Akses</span>
                </button>
              </div>
            </div>

            {isCurrentRoleAll && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  Peran ini saat ini memiliki status <strong>"FULL ACCESS / ALL MODULES"</strong>. Seluruh modul dapat diakses dan dijalankan tanpa batasan.
                </span>
              </div>
            )}
          </div>

          {/* Grouped Checklist Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {ALL_SYSTEM_MODULES.map((groupObj, gIdx) => (
              <div key={gIdx} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h3 className="font-bold text-xs uppercase text-slate-800 tracking-wider flex items-center gap-2">
                    <Layers className="w-4 h-4 text-blue-600" />
                    <span>{groupObj.group}</span>
                  </h3>
                  <span className="text-[10px] text-slate-400 font-bold">
                    {groupObj.modules.filter(m => isCurrentRoleAll || currentSelectedAccess.includes(m.id)).length} / {groupObj.modules.length} Aktif
                  </span>
                </div>

                <div className="space-y-2">
                  {groupObj.modules.map(mod => {
                    const isChecked = isCurrentRoleAll || currentSelectedAccess.includes(mod.id);
                    return (
                      <div
                        key={mod.id}
                        onClick={() => !isCurrentRoleAll && handleToggleModule(mod.id)}
                        className={`p-3 rounded-xl border transition-all flex items-start justify-between gap-3 cursor-pointer select-none ${
                          isChecked
                            ? 'bg-blue-50/70 border-blue-200'
                            : 'bg-slate-50/50 border-slate-200 hover:bg-slate-100'
                        } ${isCurrentRoleAll ? 'opacity-85' : ''}`}
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-slate-900">{mod.name}</span>
                            <span className="font-mono text-[10px] text-blue-700 font-semibold px-1.5 py-0.2 bg-blue-100/60 rounded">
                              {mod.id}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 leading-tight">{mod.desc}</p>
                        </div>

                        <div className="shrink-0 mt-0.5">
                          {isChecked ? (
                            <div className="w-5 h-5 rounded-md bg-blue-600 text-white flex items-center justify-center shadow-2xs">
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </div>
                          ) : (
                            <div className="w-5 h-5 rounded-md border-2 border-slate-300 bg-white" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Floating Save Button */}
          <div className="sticky bottom-4 bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-slate-200 shadow-md flex items-center justify-between gap-4">
            <div className="text-xs text-slate-600">
              Konfigurasi untuk peran: <strong className="text-blue-900 font-bold">{selectedRoleObj?.name}</strong> &bull; Total Modul Aktif:{' '}
              <strong className="text-emerald-700 font-black">
                {isCurrentRoleAll ? 'Semua Modul (Full Access)' : `${currentSelectedAccess.length} Modul Terpilih`}
              </strong>
            </div>

            <button
              onClick={handleSaveRolePermissions}
              disabled={!isSuperAdmin}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Perubahan Hak Akses</span>
            </button>
          </div>
        </div>
      )}

      {/* MODAL TAMBAH USER BARU */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Form Registrasi Pengguna Baru SIMRS"
      >
        <form onSubmit={handleSaveUser} className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Nama Lengkap & Gelar *</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Contoh: dr. Ahmad Dahlan, Sp.B / Ns. Siti Aminah, S.Kep"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Username Login *</label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="ahmad.d"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Password Initial *</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="******"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Role / Peran Akses Sistem *</label>
            <select
              value={roleId}
              onChange={e => setRoleId(e.target.value as RoleId)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
            >
              {roles.map(r => (
                <option key={r.id} value={r.id}>
                  {r.name} ({r.id})
                </option>
              ))}
            </select>
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 shadow-md cursor-pointer"
            >
              Simpan Pengguna
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL EDIT USER */}
      {editingUser && (
        <Modal
          isOpen={!!editingUser}
          onClose={() => setEditingUser(null)}
          title={`Edit Pengguna (${editingUser.username})`}
        >
          <form onSubmit={handleSaveEditUser} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Nama Lengkap & Gelar</label>
              <input
                type="text"
                value={editName}
                onChange={e => setEditName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Role / Peran Akses</label>
              <select
                value={editRoleId}
                onChange={e => setEditRoleId(e.target.value as RoleId)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
              >
                {roles.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.id})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Status Akun</label>
              <select
                value={editActive ? 'active' : 'inactive'}
                onChange={e => setEditActive(e.target.value === 'active')}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
              >
                <option value="active">Aktif (Dapat Login)</option>
                <option value="inactive">Non-Aktif (Akses Ditangguhkan)</option>
              </select>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 shadow-md cursor-pointer"
              >
                Simpan Perubahan
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
