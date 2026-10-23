import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Modal } from '../components/Modal';
import { KelasRosterPanel } from '../components/kelas/KelasRosterPanel';
import Swal from 'sweetalert2';
import {
  Users, Plus, ShieldCheck, UserCheck, Key, ShieldAlert,
  Edit3, Trash2, CheckCircle2, Lock, Unlock, Search,
  CheckSquare, Square, Save, RefreshCw, Layers, Sliders, Check,
  GraduationCap, Download, Upload, RotateCcw, FileSpreadsheet,
  Eye, EyeOff, UserPlus, Database, School, Copy, FileText, AlertCircle, Sparkles
} from 'lucide-react';
import { RoleId, User, SimClass } from '../types';

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
      { id: 'audit', name: 'Audit Trail (Superadmin)', desc: 'Pelacakan integritas per field data, IP address & user log' },
      { id: 'logaktivitas', name: 'Log Aktivitas Sistem', desc: 'Catatan log sesi login, logout dan transaksi aplikasi' },
      { id: 'manajemenuser', name: 'Manajemen Pengguna & Hak Akses', desc: 'Kelola akun user, reset password, dan konfigurasi RBAC' }
    ]
  }
];

export const ManajemenUserView: React.FC = () => {
  const {
    users, roles, user: currentUser, addUser, updateUser, deleteUser,
    updateRolePermissions, getRole, canEditPage,
    classes, activeClassId, setActiveClassId, addClass,
    importRoster, toggleUserActive, batchSetUsersActive, resetClassSimulation, createDosenUser,
    backendMode, accountType
  } = useApp();
  // In database mode, classes and rosters live on the server: the roster tab shows KelasRosterPanel instead.
  const isDbMode = backendMode === 'server';
  const showRosterTab = !isDbMode || accountType === 'dosen' || accountType === 'admin';

  const isEditable = canEditPage('user');
  const isSuperAdmin = currentUser?.roleId === 'R01';
  const isDosen = currentUser?.roleId === 'R03';
  const canManageRoster = isSuperAdmin || isDosen;

  // Active View Tab: 'users' (Daftar Pengguna) | 'rbac' (Matriks Hak Akses) | 'roster' (Kelas & Roster Mahasiswa)
  const [activeTab, setActiveTab] = useState<'users' | 'rbac' | 'roster'>(showRosterTab ? 'roster' : 'users');

  // Search & Filter Users (Tab 1)
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');

  // Modal Create User (Tab 1)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [roleId, setRoleId] = useState<RoleId>('R04');

  // Modal Edit User (Tab 1)
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editName, setEditName] = useState('');
  const [editRoleId, setEditRoleId] = useState<RoleId>('R04');
  const [editActive, setEditActive] = useState(true);

  // RBAC Matrix State (Tab 2)
  const [selectedRoleId, setSelectedRoleId] = useState<RoleId>('R07');
  const [currentSelectedAccess, setCurrentSelectedAccess] = useState<string[]>([]);

  // Sync selected role permissions when selectedRoleId changes
  useEffect(() => {
    const r = roles.find(role => role.id === selectedRoleId);
    if (r) {
      setCurrentSelectedAccess([...r.access]);
    }
  }, [selectedRoleId, roles]);

  // ===== ROSTER & KELAS STATES (Tab 3) =====
  const [rosterSearch, setRosterSearch] = useState('');
  const [rosterRoleFilter, setRosterRoleFilter] = useState('all');
  const [rosterStatusFilter, setRosterStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [selectedRosterIds, setSelectedRosterIds] = useState<string[]>([]);
  const [showAllPasswords, setShowAllPasswords] = useState(false);
  const [revealedPasswordIds, setRevealedPasswordIds] = useState<Record<string, boolean>>({});

  // Modal Import Excel / CSV
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importRawText, setImportRawText] = useState('');
  const [importDefaultRole, setImportDefaultRole] = useState<RoleId>('R04');

  // Modal Buat Kelas Baru
  const [isCreateClassModalOpen, setIsCreateClassModalOpen] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [newClassDosen, setNewClassDosen] = useState('');
  const [newClassSemester, setNewClassSemester] = useState('Genap');
  const [newClassYear, setNewClassYear] = useState('2024/2025');
  const [newClassDesc, setNewClassDesc] = useState('');

  // Modal Buat Akun Dosen
  const [isCreateDosenModalOpen, setIsCreateDosenModalOpen] = useState(false);
  const [dosenName, setDosenName] = useState('');
  const [dosenNidn, setDosenNidn] = useState('');
  const [dosenUsername, setDosenUsername] = useState('');
  const [dosenPassword, setDosenPassword] = useState('');
  const [dosenClassId, setDosenClassId] = useState('');

  // Modal SQL DDL & RLS Schema Viewer
  const [isSqlSchemaModalOpen, setIsSqlSchemaModalOpen] = useState(false);

  // Modal Edit Roster Member Role
  const [editingRosterUser, setEditingRosterUser] = useState<User | null>(null);
  const [editRosterRoleId, setEditRosterRoleId] = useState<RoleId>('R04');

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

  // ===== ROSTER & KELAS COMPUTED & HELPERS =====
  const activeClass: SimClass = useMemo(() => {
    return classes.find(c => c.id === activeClassId) || classes[0] || {
      id: 'RMIK-2024-A',
      name: 'RMIK Kelas A 2024/2025',
      dosenName: 'dr. Hendra Prasetya, M.Kes',
      semester: 'Genap',
      academicYear: '2024/2025',
      active: true,
      description: 'Kelas Reguler Praktikum Rekam Medis & Informasi Kesehatan'
    };
  }, [classes, activeClassId]);

  // Students belonging to the active class
  const classStudents = useMemo(() => {
    return users.filter(u => {
      // Exclude root superadmin from student roster
      if (u.id === 'U001') return false;
      // If user has explicit classId, match activeClassId; or fallback to primary class
      if (u.classId) {
        return u.classId === activeClassId;
      }
      return activeClassId === 'RMIK-2024-A';
    });
  }, [users, activeClassId]);

  const filteredRoster = useMemo(() => {
    return classStudents.filter(u => {
      const q = rosterSearch.toLowerCase();
      const matchSearch = q
        ? (u.nim && u.nim.toLowerCase().includes(q)) ||
          u.name.toLowerCase().includes(q) ||
          u.username.toLowerCase().includes(q)
        : true;
      const matchRole = rosterRoleFilter !== 'all' ? u.roleId === rosterRoleFilter : true;
      const matchStatus = rosterStatusFilter === 'all'
        ? true
        : rosterStatusFilter === 'active'
          ? u.active
          : !u.active;
      return matchSearch && matchRole && matchStatus;
    });
  }, [classStudents, rosterSearch, rosterRoleFilter, rosterStatusFilter]);

  const totalRosterCount = classStudents.length;
  const activeRosterCount = classStudents.filter(s => s.active).length;
  const inactiveRosterCount = classStudents.filter(s => !s.active).length;

  // Parsed Import Preview from pasted text
  const parsedImportList = useMemo(() => {
    if (!importRawText.trim()) return [];
    const lines = importRawText.split(/\r?\n/);
    const results: Array<{ nim: string; name: string; username: string; roleId: RoleId; tempPassword: string }> = [];

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line) continue;
      const lower = line.toLowerCase();
      if (lower.startsWith('nim') || lower.startsWith('no') || lower.startsWith('nama') || lower.startsWith('student')) {
        continue;
      }

      let parts: string[] = [];
      if (line.includes('\t')) {
        parts = line.split('\t');
      } else if (line.includes(',')) {
        parts = line.split(',');
      } else if (line.includes(';')) {
        parts = line.split(';');
      } else if (line.includes('|')) {
        parts = line.split('|');
      } else {
        const match = line.match(/^(\S+)\s+(.+)$/);
        if (match) parts = [match[1], match[2]];
        else parts = [line];
      }

      if (parts.length >= 2) {
        const nim = parts[0].trim().replace(/[^a-zA-Z0-9]/g, '');
        const name = parts[1].trim();
        if (nim && name) {
          const last4 = nim.length >= 4 ? nim.slice(-4) : nim.padEnd(4, '0');
          const tempPassword = `ueu${last4}`;
          const username = `mhs_${nim.toLowerCase()}`;
          results.push({
            nim,
            name,
            username,
            roleId: importDefaultRole,
            tempPassword
          });
        }
      }
    }
    return results;
  }, [importRawText, importDefaultRole]);

  // Execute Import
  const handleExecuteImport = () => {
    if (parsedImportList.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Format Data Kosong / Tidak Valid',
        text: 'Masukkan daftar mahasiswa dengan format: NIM [Tab/Koma] Nama Lengkap.',
        confirmButtonColor: '#2563eb'
      });
      return;
    }

    const res = importRoster(activeClassId, parsedImportList);
    setIsImportModalOpen(false);
    setImportRawText('');

    Swal.fire({
      icon: 'success',
      title: 'Import Roster Berhasil!',
      html: `
        <div class="text-left text-xs space-y-1.5">
          <p><strong>${res.count}</strong> mahasiswa baru berhasil didaftarkan ke kelas <strong>${activeClass.name}</strong>.</p>
          ${res.duplicates ? `<p class="text-amber-600"><strong>${res.duplicates}</strong> akun dengan NIM/Username sama dilewati.</p>` : ''}
          <p class="text-slate-500 mt-2">Password sementara otomatis dibangkitkan (format: <code>ueu[4 digit NIM]</code>). Anda dapat mengunduh daftar akun melalui tombol <strong>Ekspor CSV Password</strong>.</p>
        </div>
      `,
      confirmButtonColor: '#2563eb'
    });
  };

  const handleLoadSampleData = () => {
    const sample = `20240801001\tAditiya Pratama Putra\n20240801002\tBella Anggraini\n20240801003\tCahyo Nugroho\n20240801004\tDewi Sartika Dewi\n20240801005\tEko Prasetyo Utomo\n20240801006\tFitri Handayani`;
    setImportRawText(sample);
  };

  // Export temporary passwords CSV
  const handleExportPasswordsCSV = () => {
    if (classStudents.length === 0) {
      Swal.fire({
        icon: 'info',
        title: 'Tidak Ada Data Mahasiswa',
        text: 'Belum ada anggota mahasiswa di kelas ini untuk diekspor.',
        confirmButtonColor: '#2563eb'
      });
      return;
    }

    const headers = ['No', 'NIM', 'Nama Mahasiswa', 'Username', 'Peran Praktikum', 'Password Sementara', 'Status Akun', 'Kelas', 'Tahun Akademik'];
    const rows = classStudents.map((st, idx) => {
      const roleObj = roles.find(r => r.id === st.roleId);
      const pass = st.tempPassword || (st.nim ? `ueu${st.nim.slice(-4)}` : 'ueu2024');
      return [
        idx + 1,
        `"${st.nim || '-'}"`,
        `"${st.name.replace(/"/g, '""')}"`,
        `"${st.username}"`,
        `"${roleObj?.name || st.roleId}"`,
        `"${pass}"`,
        `"${st.active ? 'Aktif' : 'Non-Aktif'}"`,
        `"${activeClass.name}"`,
        `"${activeClass.academicYear} ${activeClass.semester}"`
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `roster_${activeClass.id}_password_sementara.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    Swal.fire({
      icon: 'success',
      title: 'CSV Berhasil Diunduh',
      text: `File kredensial sementara untuk ${classStudents.length} mahasiswa kelas ${activeClass.name} telah disimpan.`,
      timer: 1800,
      showConfirmButton: false
    });
  };

  // Reset class simulation
  const handleResetClass = () => {
    if (!canManageRoster) {
      Swal.fire({
        icon: 'error',
        title: 'Akses Ditolak',
        text: 'Hanya Dosen Pengampu (R03) atau Super Administrator (R01) yang dapat mereset simulasi kelas.',
        confirmButtonColor: '#e11d48'
      });
      return;
    }

    Swal.fire({
      title: `Reset Simulasi Kelas?`,
      html: `
        <div class="text-left text-xs space-y-2 text-slate-600">
          <p>Anda akan mereset data simulasi klinis untuk kelas <strong>${activeClass.name}</strong>.</p>
          <div class="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 font-medium">
            ⚠️ <strong>Dampak Operasi:</strong>
            <ul class="list-disc ml-4 mt-1 space-y-0.5">
              <li>Data pasien, kunjungan, CPPT, resume, coding, billing, dan klaim kelas ini dikembalikan ke benchmark awal SIMRS.</li>
              <li>Akun mahasiswa & password sementara <strong>TIDAK AKAN DIHAPUS</strong>.</li>
              <li>Jejak Audit Trail & Log Aktivitas <strong>TETAP DISIMPAN (Append-only)</strong>.</li>
            </ul>
          </div>
          <p class="font-bold text-slate-800">Ketik "RESET" untuk mengonfirmasi:</p>
        </div>
      `,
      input: 'text',
      inputPlaceholder: 'Ketik RESET di sini',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Konfirmasi Reset Data',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#64748b',
      preConfirm: (val) => {
        if (val !== 'RESET') {
          Swal.showValidationMessage('Harap ketik "RESET" persis huruf besar untuk melanjutkan.');
          return false;
        }
        return true;
      }
    }).then((result) => {
      if (result.isConfirmed) {
        resetClassSimulation(activeClassId);
        Swal.fire({
          icon: 'success',
          title: 'Simulasi Kelas Direset!',
          text: `Data pelayanan klinis kelas ${activeClass.name} telah dikembalikan ke benchmark awal. Mahasiswa siap memulai skenario baru.`,
          confirmButtonColor: '#2563eb'
        });
      }
    });
  };

  // Create Dosen
  const handleCreateDosen = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSuperAdmin) {
      Swal.fire({ icon: 'error', title: 'Hanya Super Administrator', text: 'Pembuatan akun Dosen hanya dapat dilakukan oleh Super Administrator (R01).' });
      return;
    }
    if (!dosenName.trim() || !dosenUsername.trim() || !dosenPassword.trim()) {
      Swal.fire({ icon: 'warning', title: 'Data Belum Lengkap', text: 'Nama Dosen, Username, dan Password wajib diisi.' });
      return;
    }

    const res = createDosenUser({
      name: dosenName,
      username: dosenUsername,
      password: dosenPassword,
      nidn: dosenNidn,
      classId: dosenClassId || undefined
    });

    if (!res.success) {
      Swal.fire({ icon: 'error', title: 'Gagal Membuat Dosen', text: res.message || 'Username sudah digunakan.' });
      return;
    }

    setIsCreateDosenModalOpen(false);
    setDosenName('');
    setDosenNidn('');
    setDosenUsername('');
    setDosenPassword('');
    setDosenClassId('');

    Swal.fire({
      icon: 'success',
      title: 'Akun Dosen Dibuat',
      text: `Dosen ${dosenName} dengan hak akses R03 berhasil ditambahkan.`,
      timer: 1800,
      showConfirmButton: false
    });
  };

  // Create Class
  const handleCreateClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim()) {
      Swal.fire({ icon: 'warning', title: 'Nama Kelas Wajib Diisi' });
      return;
    }
    const classId = `RMIK-${Date.now().toString(36).toUpperCase().slice(-5)}`;
    const res = addClass({
      id: classId,
      name: newClassName,
      dosenName: newClassDosen || (currentUser?.roleId === 'R03' ? currentUser.name : 'Dosen Pengampu RMIK'),
      semester: newClassSemester,
      academicYear: newClassYear,
      description: newClassDesc || `Kelas Praktikum SIMRS ${newClassYear}`,
      active: true
    });

    if (res.success) {
      setActiveClassId(classId);
      setIsCreateClassModalOpen(false);
      setNewClassName('');
      setNewClassDosen('');
      setNewClassDesc('');
      Swal.fire({
        icon: 'success',
        title: 'Kelas Berhasil Dibuat',
        text: `Kelas "${newClassName}" telah dibuat dan aktif.`,
        timer: 1600,
        showConfirmButton: false
      });
    }
  };

  // Batch activate/deactivate
  const handleBatchToggle = (activate: boolean) => {
    if (selectedRosterIds.length === 0) return;
    batchSetUsersActive(selectedRosterIds, activate);
    setSelectedRosterIds([]);
    Swal.fire({
      icon: 'success',
      title: activate ? 'Akun Diaktifkan' : 'Akun Dinonaktifkan',
      text: `${selectedRosterIds.length} akun mahasiswa telah di${activate ? 'aktifkan' : 'nonaktifkan'}.`,
      timer: 1500,
      showConfirmButton: false
    });
  };

  // Select all roster items
  const handleSelectAllRoster = (checked: boolean) => {
    if (checked) {
      setSelectedRosterIds(filteredRoster.map(s => s.id));
    } else {
      setSelectedRosterIds([]);
    }
  };

  // Toggle single item selection
  const handleToggleSelectRoster = (id: string) => {
    setSelectedRosterIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  // Toggle password visibility for user
  const handleTogglePasswordView = (id: string) => {
    setRevealedPasswordIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Quick update roster member role
  const handleSaveRosterRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRosterUser) return;
    updateUser(editingRosterUser.id, { roleId: editRosterRoleId });
    setEditingRosterUser(null);
    Swal.fire({
      icon: 'success',
      title: 'Peran Diperbarui',
      text: `Peran mahasiswa ${editingRosterUser.name} telah diubah menjadi ${roles.find(r => r.id === editRosterRoleId)?.name}.`,
      timer: 1500,
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
            Manajemen Pengguna, Kelas & Hak Akses (RBAC)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Pengelolaan akun mahasiswa per kelas, otentikasi multi-tenant, kredensial sementara, dan matriks hak akses SIMRS.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-200/80 p-1.5 rounded-2xl shrink-0 overflow-x-auto">
          {showRosterTab && (
          <button
            onClick={() => setActiveTab('roster')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'roster'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            <GraduationCap className="w-4 h-4 text-emerald-300" />
            <span>{isDbMode ? 'Kelas & Roster' : `Kelas & Roster (${classStudents.length})`}</span>
          </button>
          )}
          <button
            onClick={() => setActiveTab('users')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'users'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Semua Pengguna ({users.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('rbac')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
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

      {activeTab === 'roster' && isDbMode && showRosterTab && <KelasRosterPanel />}

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

      {/* TAB 3: KELAS & ROSTER MAHASISWA (local mode) */}
      {activeTab === 'roster' && !isDbMode && (
        <div className="space-y-4">
          {/* Class Selector & Header Info Banner */}
          <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-5 text-white shadow-sm border border-blue-800/40 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1">
                    <Database className="w-3 h-3 text-emerald-400" />
                    Multi-Tenant Database Terisolasi
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-white/10 text-blue-200">
                    ID: {activeClass.id}
                  </span>
                </div>
                <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                  <School className="w-5 h-5 text-blue-300" />
                  {activeClass.name}
                </h2>
                <p className="text-xs text-blue-200/80">
                  {activeClass.description || 'Simulasi pelayanan rumah sakit terisolasi untuk praktikum mahasiswa prodi RMIK.'}
                </p>
              </div>

              {/* Class Selector Dropdown & Actions */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="bg-white/10 backdrop-blur-md p-1.5 rounded-2xl border border-white/20 flex items-center gap-2">
                  <span className="text-[11px] font-bold text-blue-200 pl-2">Pilih Kelas:</span>
                  <select
                    value={activeClassId}
                    onChange={e => {
                      setActiveClassId(e.target.value);
                      setSelectedRosterIds([]);
                    }}
                    className="bg-slate-900/90 text-white text-xs font-semibold px-3 py-1.5 rounded-xl border border-blue-400/40 focus:outline-none cursor-pointer"
                  >
                    {classes.map(c => (
                      <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                        {c.name} ({c.academicYear} - {c.semester})
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={() => setIsCreateClassModalOpen(true)}
                  className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-xs"
                  title="Tambah Kelas Simulasi Baru"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Kelas Baru</span>
                </button>

                <button
                  onClick={() => setIsSqlSchemaModalOpen(true)}
                  className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all border border-white/20"
                  title="Lihat Skema Database PostgreSQL & Aturan RLS"
                >
                  <Database className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Skema SQL & RLS</span>
                </button>
              </div>
            </div>

            {/* Dosen & Academic Info Bar */}
            <div className="pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs text-blue-200/90">
              <div className="flex items-center gap-4">
                <span>Dosen Pengampu: <strong className="text-white">{activeClass.dosenName || 'Dosen Pengampu RMIK'}</strong></span>
                <span>Tahun Akademik: <strong className="text-white">{activeClass.academicYear} ({activeClass.semester})</strong></span>
              </div>
              <div className="text-[11px] text-blue-300/80">
                Data pasien, CPPT, coding, dan billing kelas ini <strong>terpisah penuh</strong> dari kelas lainnya.
              </div>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Mahasiswa</span>
                <Users className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-2xl font-black text-slate-900 mt-1">{totalRosterCount}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Terdaftar di {activeClass.id}</div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Akun Aktif</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-black text-emerald-700 mt-1">{activeRosterCount}</div>
              <div className="text-[10px] text-emerald-600 mt-0.5">Dapat login & simulasi</div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-rose-600 uppercase tracking-wider">Non-Aktif / Suspend</span>
                <Lock className="w-4 h-4 text-rose-600" />
              </div>
              <div className="text-2xl font-black text-rose-700 mt-1">{inactiveRosterCount}</div>
              <div className="text-[10px] text-rose-600 mt-0.5">Akses masuk diblokir</div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">Peran Default</span>
                <GraduationCap className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="text-base font-black text-indigo-900 mt-1 truncate">R04 (All Modul)</div>
              <div className="text-[10px] text-indigo-600 mt-0.5">Hak akses praktikum penuh</div>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={rosterSearch}
                  onChange={e => setRosterSearch(e.target.value)}
                  placeholder="Cari NIM, Nama, atau Username..."
                  className="pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs w-60 focus:bg-white focus:outline-none focus:border-blue-500 font-medium"
                />
              </div>

              <select
                value={rosterRoleFilter}
                onChange={e => setRosterRoleFilter(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium cursor-pointer"
              >
                <option value="all">Semua Peran Praktikum</option>
                {roles.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.id})
                  </option>
                ))}
              </select>

              <select
                value={rosterStatusFilter}
                onChange={e => setRosterStatusFilter(e.target.value as any)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium cursor-pointer"
              >
                <option value="all">Semua Status Akun</option>
                <option value="active">Hanya Aktif</option>
                <option value="inactive">Hanya Non-Aktif</option>
              </select>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => {
                  setImportRawText('');
                  setIsImportModalOpen(true);
                }}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
                title="Import Mahasiswa dari Excel / CSV"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Import Excel / CSV</span>
              </button>

              <button
                onClick={handleExportPasswordsCSV}
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
                title="Download CSV Password Sementara Mahasiswa"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Ekspor CSV Password</span>
              </button>

              <button
                onClick={handleResetClass}
                className="px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                title="Reset simulasi klinis kelas kembali ke benchmark awal"
              >
                <RotateCcw className="w-3.5 h-3.5 text-rose-600" />
                <span>Reset Simulasi Kelas</span>
              </button>

              {isSuperAdmin && (
                <button
                  onClick={() => setIsCreateDosenModalOpen(true)}
                  className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
                  title="Buat Akun Dosen Baru (Superadmin Only)"
                >
                  <UserPlus className="w-3.5 h-3.5 text-blue-300" />
                  <span>+ Akun Dosen</span>
                </button>
              )}
            </div>
          </div>

          {/* Batch Actions Bar (when checkboxes selected) */}
          {selectedRosterIds.length > 0 && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-2xl flex items-center justify-between gap-3 text-xs text-blue-900">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-blue-600" />
                <span>
                  Terpilih <strong>{selectedRosterIds.length}</strong> mahasiswa dari kelas ini.
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleBatchToggle(true)}
                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors"
                >
                  Aktifkan Terpilih
                </button>
                <button
                  onClick={() => handleBatchToggle(false)}
                  className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors"
                >
                  Nonaktifkan Terpilih
                </button>
                <button
                  onClick={() => setSelectedRosterIds([])}
                  className="px-2.5 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-bold cursor-pointer"
                >
                  Batal
                </button>
              </div>
            </div>
          )}

          {/* Roster Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-wider font-bold">
                    <th className="p-3.5 w-10 text-center">
                      <input
                        type="checkbox"
                        checked={filteredRoster.length > 0 && selectedRosterIds.length === filteredRoster.length}
                        onChange={e => handleSelectAllRoster(e.target.checked)}
                        className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                    </th>
                    <th className="p-3.5">NIM</th>
                    <th className="p-3.5">Nama Lengkap Mahasiswa</th>
                    <th className="p-3.5">Username Login</th>
                    <th className="p-3.5">Peran Praktikum</th>
                    <th className="p-3.5">
                      <div className="flex items-center gap-1.5">
                        <span>Password Sementara</span>
                        <button
                          onClick={() => setShowAllPasswords(!showAllPasswords)}
                          className="text-slate-400 hover:text-blue-600 cursor-pointer"
                          title={showAllPasswords ? 'Sembunyikan semua password' : 'Tampilkan semua password'}
                        >
                          {showAllPasswords ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </th>
                    <th className="p-3.5 text-center">Status Akun</th>
                    <th className="p-3.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                  {filteredRoster.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-400">
                        <GraduationCap className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                        <p className="font-bold text-slate-600">Belum ada mahasiswa di kelas ini</p>
                        <p className="text-xs text-slate-400 mt-1">
                          Klik tombol <strong>Import Excel / CSV</strong> di atas untuk mendaftarkan mahasiswa kelas ini secara massal.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredRoster.map(st => {
                      const roleObj = roles.find(r => r.id === st.roleId);
                      const isRevealed = showAllPasswords || revealedPasswordIds[st.id];
                      const tempPass = st.tempPassword || (st.nim ? `ueu${st.nim.slice(-4)}` : 'ueu2024');
                      const isSelected = selectedRosterIds.includes(st.id);

                      return (
                        <tr key={st.id} className={`hover:bg-slate-50/80 transition-colors ${isSelected ? 'bg-blue-50/40' : ''}`}>
                          <td className="p-3.5 text-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleSelectRoster(st.id)}
                              className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                            />
                          </td>
                          <td className="p-3.5">
                            <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                              {st.nim || '-'}
                            </span>
                          </td>
                          <td className="p-3.5">
                            <div className="font-bold text-slate-900 flex items-center gap-1.5">
                              {st.name}
                              {st.nim && (
                                <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                                  RMIK
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="p-3.5 font-mono text-slate-600">
                            {st.username}
                          </td>
                          <td className="p-3.5">
                            <button
                              onClick={() => {
                                setEditingRosterUser(st);
                                setEditRosterRoleId(st.roleId);
                              }}
                              className="cursor-pointer group flex items-center gap-1 text-left"
                              title="Klik untuk ubah peran praktikum mahasiswa"
                            >
                              <span
                                className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                  st.roleId === 'R04'
                                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                                }`}
                              >
                                {roleObj?.name || st.roleId}
                              </span>
                              <Edit3 className="w-3 h-3 text-slate-400 group-hover:text-blue-600 transition-colors" />
                            </button>
                            {st.roleId === 'R04' && (
                              <div className="text-[9px] text-indigo-600 font-semibold mt-0.5">
                                Akses seluruh modul SIMRS
                              </div>
                            )}
                          </td>
                          <td className="p-3.5">
                            <div className="flex items-center gap-1.5 font-mono">
                              <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${isRevealed ? 'bg-slate-100 text-slate-900 border border-slate-200' : 'bg-slate-50 text-slate-400'}`}>
                                {isRevealed ? tempPass : '••••••••'}
                              </span>
                              <button
                                onClick={() => handleTogglePasswordView(st.id)}
                                className="text-slate-400 hover:text-blue-600 cursor-pointer p-0.5"
                                title={isRevealed ? 'Sembunyikan' : 'Tampilkan Password'}
                              >
                                {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                              </button>
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(tempPass);
                                  Swal.fire({
                                    icon: 'success',
                                    title: 'Password Disalin',
                                    text: `Password "${tempPass}" disalin ke clipboard.`,
                                    timer: 1000,
                                    showConfirmButton: false
                                  });
                                }}
                                className="text-slate-400 hover:text-emerald-600 cursor-pointer p-0.5"
                                title="Salin Password"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                          <td className="p-3.5 text-center">
                            <button
                              onClick={() => toggleUserActive(st.id)}
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer transition-all inline-flex items-center gap-1 ${
                                st.active
                                  ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                  : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                              }`}
                              title={st.active ? 'Klik untuk non-aktifkan akun' : 'Klik untuk aktifkan akun'}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${st.active ? 'bg-emerald-600' : 'bg-rose-600'}`}></span>
                              <span>{st.active ? 'Aktif' : 'Non-Aktif'}</span>
                            </button>
                          </td>
                          <td className="p-3.5 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => {
                                  const text = `Akun SIMRS Mahasiswa:\nNama: ${st.name}\nNIM: ${st.nim || '-'}\nUsername: ${st.username}\nPassword: ${tempPass}\nKelas: ${activeClass.name}`;
                                  navigator.clipboard.writeText(text);
                                  Swal.fire({
                                    icon: 'success',
                                    title: 'Kredensial Disalin!',
                                    text: `Format akun untuk ${st.name} siap dikirimkan.`,
                                    timer: 1200,
                                    showConfirmButton: false
                                  });
                                }}
                                className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer transition-colors"
                                title="Salin Kredensial Lengkap"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => {
                                  setEditingRosterUser(st);
                                  setEditRosterRoleId(st.roleId);
                                }}
                                className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer transition-colors"
                                title="Ubah Peran"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer */}
            <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500 font-medium">
              <div>
                Menampilkan <strong>{filteredRoster.length}</strong> dari total <strong>{totalRosterCount}</strong> mahasiswa di kelas <strong>{activeClass.name}</strong>.
              </div>
              <div className="flex items-center gap-3 text-[11px]">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Aktif: {activeRosterCount}
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span> Non-Aktif: {inactiveRosterCount}
                </span>
              </div>
            </div>
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

      {/* MODAL 1: IMPORT EXCEL / CSV MAHASISWA */}
      {isImportModalOpen && (
        <Modal
          isOpen={isImportModalOpen}
          onClose={() => setIsImportModalOpen(false)}
          title={`Import Roster Mahasiswa: ${activeClass.name}`}
        >
          <div className="space-y-4 max-h-[80vh] overflow-y-auto pr-1">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-2xl text-xs text-blue-900 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-blue-950">
                <FileSpreadsheet className="w-4 h-4 text-blue-600" />
                <span>Petunjuk Format Import Excel / CSV:</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                Salin kolom <strong>NIM</strong> dan <strong>Nama Lengkap</strong> langsung dari Microsoft Excel atau Google Sheets, lalu tempelkan (paste) pada kotak teks di bawah. Sistem otomatis mendeteksi pemisah Tab, Koma, atau Titik Koma.
              </p>
              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-blue-700 font-mono">
                  Password sementara otomatis dibangkitkan: <code>ueu + [4 digit terakhir NIM]</code>
                </span>
                <button
                  type="button"
                  onClick={handleLoadSampleData}
                  className="px-2.5 py-1 bg-white hover:bg-blue-100 text-blue-700 border border-blue-300 rounded-lg text-[11px] font-bold cursor-pointer transition-colors"
                >
                  Gunakan Format Contoh RMIK
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Target Kelas</label>
                <input
                  type="text"
                  value={`${activeClass.name} (${activeClass.id})`}
                  disabled
                  className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Peran Praktikum Default</label>
                <select
                  value={importDefaultRole}
                  onChange={e => setImportDefaultRole(e.target.value as RoleId)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                >
                  <option value="R04">R04 - Mahasiswa Umum (Akses Semua Modul)</option>
                  {roles.filter(r => r.id !== 'R04' && r.id !== 'R01' && r.id !== 'R03').map(r => (
                    <option key={r.id} value={r.id}>
                      {r.id} - {r.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Data Mahasiswa (NIM dan Nama Lengkap) *
              </label>
              <textarea
                rows={6}
                value={importRawText}
                onChange={e => setImportRawText(e.target.value)}
                placeholder={"20240801001\tAditiya Pratama Putra\n20240801002\tBella Anggraini\n20240801003\tCahyo Nugroho"}
                className="w-full p-3 font-mono text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-blue-500 leading-relaxed"
              />
              <div className="flex justify-between items-center text-[11px] text-slate-500 mt-1">
                <span>Ditemukan: <strong>{parsedImportList.length}</strong> mahasiswa valid</span>
                <span>Baris header akan otomatis diabaikan</span>
              </div>
            </div>

            {/* Live Preview Table */}
            {parsedImportList.length > 0 && (
              <div className="space-y-1.5">
                <div className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>Pratinjau Akun yang Akan Dibuat ({parsedImportList.length}):</span>
                  <span className="text-emerald-600 font-semibold text-[11px]">Format Valid</span>
                </div>
                <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-xl bg-slate-50">
                  <table className="w-full text-left text-[11px]">
                    <thead className="bg-slate-200/80 sticky top-0 text-slate-700 font-bold">
                      <tr>
                        <th className="p-2">No</th>
                        <th className="p-2">NIM</th>
                        <th className="p-2">Nama Mahasiswa</th>
                        <th className="p-2">Username</th>
                        <th className="p-2">Password Temp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {parsedImportList.map((item, idx) => (
                        <tr key={idx} className="hover:bg-white">
                          <td className="p-2 text-slate-400 font-mono">{idx + 1}</td>
                          <td className="p-2 font-mono font-bold text-blue-700">{item.nim}</td>
                          <td className="p-2 font-semibold text-slate-800">{item.name}</td>
                          <td className="p-2 font-mono text-slate-600">{item.username}</td>
                          <td className="p-2 font-mono text-emerald-700 font-bold">{item.tempPassword}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleExecuteImport}
                disabled={parsedImportList.length === 0}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold disabled:opacity-50 cursor-pointer shadow-md transition-all flex items-center gap-1.5"
              >
                <Upload className="w-4 h-4" />
                <span>Daftarkan {parsedImportList.length} Mahasiswa ke Kelas</span>
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL 2: BUAT KELAS BARU */}
      {isCreateClassModalOpen && (
        <Modal
          isOpen={isCreateClassModalOpen}
          onClose={() => setIsCreateClassModalOpen(false)}
          title="Tambah Kelas Simulasi SIMRS (Multi-Tenant)"
        >
          <form onSubmit={handleCreateClass} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Nama Kelas *</label>
              <input
                type="text"
                value={newClassName}
                onChange={e => setNewClassName(e.target.value)}
                placeholder="Contoh: RMIK 2024 Kelas B (Reguler)"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Dosen Pengampu</label>
              <input
                type="text"
                value={newClassDosen}
                onChange={e => setNewClassDosen(e.target.value)}
                placeholder="Contoh: dr. Hendra Prasetya, M.Kes"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Semester</label>
                <select
                  value={newClassSemester}
                  onChange={e => setNewClassSemester(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                >
                  <option value="Ganjil">Semester Ganjil</option>
                  <option value="Genap">Semester Genap</option>
                  <option value="Antara / Remedial">Semester Antara</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tahun Akademik</label>
                <input
                  type="text"
                  value={newClassYear}
                  onChange={e => setNewClassYear(e.target.value)}
                  placeholder="2024/2025"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Deskripsi / Modul Praktikum</label>
              <textarea
                rows={3}
                value={newClassDesc}
                onChange={e => setNewClassDesc(e.target.value)}
                placeholder="Catatan skenario pembelajaran, mata kuliah, atau target capaian kelas..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsCreateClassModalOpen(false)}
                className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer transition-colors"
              >
                Buat Kelas
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL 3: BUAT AKUN DOSEN (SUPERADMIN ONLY) */}
      {isCreateDosenModalOpen && (
        <Modal
          isOpen={isCreateDosenModalOpen}
          onClose={() => setIsCreateDosenModalOpen(false)}
          title="Tambah Akun Dosen Pengampu (R03)"
        >
          <form onSubmit={handleCreateDosen} className="space-y-3">
            <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-xs text-indigo-900">
              Akun Dosen (R03) memiliki wewenang untuk melihat log audit kelas, mengevaluasi praktikum, mengimpor mahasiswa, dan mereset simulasi kelas bimbingannya.
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Nama Lengkap & Gelar Dosen *</label>
              <input
                type="text"
                value={dosenName}
                onChange={e => setDosenName(e.target.value)}
                placeholder="dr. Hendra Prasetya, M.Kes"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">NIDN / NIP</label>
                <input
                  type="text"
                  value={dosenNidn}
                  onChange={e => setDosenNidn(e.target.value)}
                  placeholder="0312058801"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Kelas Bimbingan Utama</label>
                <select
                  value={dosenClassId}
                  onChange={e => setDosenClassId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                >
                  <option value="">Semua / Fleksibel</option>
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Username Login *</label>
                <input
                  type="text"
                  value={dosenUsername}
                  onChange={e => setDosenUsername(e.target.value)}
                  placeholder="dosen.hendra"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Password Initial *</label>
                <input
                  type="password"
                  value={dosenPassword}
                  onChange={e => setDosenPassword(e.target.value)}
                  placeholder="******"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsCreateDosenModalOpen(false)}
                className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer transition-colors"
              >
                Simpan Akun Dosen
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL 4: SKEMA POSTGRESQL & ATURAN RLS */}
      {isSqlSchemaModalOpen && (
        <Modal
          isOpen={isSqlSchemaModalOpen}
          onClose={() => setIsSqlSchemaModalOpen(false)}
          title="Skema Database PostgreSQL & Aturan Row Level Security (RLS)"
        >
          <div className="space-y-4 max-h-[80vh] overflow-y-auto pr-1">
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-950 space-y-1">
              <div className="flex items-center gap-2 font-bold">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Arsitektur Keamanan & Multi-Tenant Terverifikasi:</span>
              </div>
              <ul className="list-disc ml-5 space-y-0.5 text-slate-600">
                <li><strong>Tenant Isolation:</strong> Setiap tabel transaksi klinis (pasien, registrasi, CPPT, coding, billing) memiliki kolom <code>class_id</code> terisolasi per kelas.</li>
                <li><strong>Append-Only Audit Trail:</strong> Trigger <code>audit_log_immutable()</code> menolak semua perintah <code>UPDATE</code> dan <code>DELETE</code> pada <code>audit_log</code> demi integritas forensik ISO 27001 & KMK 1423.</li>
                <li><strong>Role Rules:</strong> Peran <code>R04 Mahasiswa (Umum)</code> memiliki hak akses penuh <em>all modules</em>, sementara peran praktikum spesifik (R05 Dokter, R07 Pendaftaran, R09 Coding) dibatasi RLS.</li>
                <li><strong>Proteksi Akun:</strong> Mahasiswa dilarang mengubah role menjadi Admin (R01) atau Dosen (R03).</li>
                <li><strong>Reset Kelas:</strong> Fungsi <code>reset_class(class_id)</code> mereset data klinis kelas tanpa menghapus mahasiswa atau log audit.</li>
              </ul>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-slate-700">Folder: <code>db/migrations/</code></span>
                <button
                  onClick={() => {
                    const sqlSnippet = `-- SIMRS RMIK MULTI-TENANT SCHEMA & RLS
-- Skema lengkap: folder db/migrations/ pada repositori (dijalankan berurutan)
-- Tabel inti: classes, profiles, class_members, practice_roles, practice_sessions, audit_log
-- Tabel klinis & master data per kelas: patients, registrations, cppt, coding, billing, claims, master_poli, master_dokter, ...
-- Trigger: audit_log_immutable() (IMMUTABLE AUDIT TRAIL)
-- Function: reset_class(p_class)`;
                    navigator.clipboard.writeText(sqlSnippet);
                    Swal.fire({
                      icon: 'success',
                      title: 'Petunjuk Skema Disalin',
                      text: 'Skema lengkap tersedia di folder db/migrations/ pada repositori.',
                      timer: 1600,
                      showConfirmButton: false
                    });
                  }}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Salin Info Skema</span>
                </button>
              </div>

              <div className="bg-slate-900 text-slate-200 p-3.5 rounded-xl text-[11px] font-mono leading-relaxed overflow-x-auto max-h-60 border border-slate-800">
                <pre>{`-- 1. APPEND-ONLY IMMUTABLE AUDIT LOG (db/migrations/..._audit.sql)
create function private.audit_log_immutable() returns trigger as $$
begin
  raise exception 'audit_log is append-only' using errcode = '42501';
end $$ language plpgsql;

-- 2. RLS: write allowed for the active practice role's modules ('all' for R04)
create policy patients_insert on public.patients for insert to authenticated
  with check (public.can_write(class_id, 'patients'));

-- 3. RESET CLASS DATA BACK TO THE TEMPLATE WITHOUT DELETING MEMBERS OR AUDIT LOG
create function public.reset_class(p_class uuid) returns void as $$
begin
  -- dosen of the class or admin only; deletes class rows, copies the template again
  ...
end $$ language plpgsql security definer;`}</pre>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setIsSqlSchemaModalOpen(false)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL 5: UBAH PERAN PRAKTIKUM MAHASISWA */}
      {editingRosterUser && (
        <Modal
          isOpen={!!editingRosterUser}
          onClose={() => setEditingRosterUser(null)}
          title={`Ubah Peran Praktikum: ${editingRosterUser.name}`}
        >
          <form onSubmit={handleSaveRosterRole} className="space-y-3">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
              <div>NIM: <strong className="font-mono text-blue-700">{editingRosterUser.nim || '-'}</strong></div>
              <div>Username: <strong className="font-mono text-slate-800">{editingRosterUser.username}</strong></div>
              <div>Kelas: <strong>{activeClass.name}</strong></div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Pilih Peran Praktikum</label>
              <select
                value={editRosterRoleId}
                onChange={e => setEditRosterRoleId(e.target.value as RoleId)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
              >
                <option value="R04">R04 - Mahasiswa Umum (Akses Seluruh Modul SIMRS)</option>
                {roles.filter(r => r.id !== 'R04' && r.id !== 'R01' && r.id !== 'R03').map(r => (
                  <option key={r.id} value={r.id}>
                    {r.id} - {r.name}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-500 mt-1">
                {editRosterRoleId === 'R04'
                  ? 'Peran R04 memberikan hak akses praktikum ke seluruh modul tanpa batasan.'
                  : 'Peran praktikum spesifik membatasi hak akses mahasiswa sesuai skenario unit kerja RS.'}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingRosterUser(null)}
                className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer transition-colors"
              >
                Simpan Peran
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
