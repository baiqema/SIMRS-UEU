import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  Building2, Bed as BedIcon, Stethoscope, BriefcaseMedical, Network,
  Plus, Search, Filter, Edit2, Trash2, CheckCircle2, XCircle, AlertTriangle,
  Clock, MapPin, Phone, Users, ShieldAlert, ShieldCheck, Check, X,
  DoorOpen, RefreshCw, Layers, Calendar, ChevronRight
} from 'lucide-react';
import Swal from 'sweetalert2';
import {
  MasterRuangan, MasterBed, MasterDokter, MasterPoli, DoctorPoliMapping,
  JenisRuangan, KelompokLayananPoli, StatusBedOperasional
} from '../types';

export const MasterDataView: React.FC = () => {
  const {
    user,
    masterRuangan,
    masterBed,
    masterDokter,
    masterPoli,
    doctorPoliMappings,
    addMasterRuangan,
    updateMasterRuangan,
    deleteMasterRuangan,
    toggleMasterRuanganStatus,
    addMasterBed,
    updateMasterBed,
    deleteMasterBed,
    toggleMasterBedStatus,
    addMasterDokter,
    updateMasterDokter,
    deleteMasterDokter,
    toggleMasterDokterStatus,
    addMasterPoli,
    updateMasterPoli,
    deleteMasterPoli,
    toggleMasterPoliStatus,
    addDoctorPoliMapping,
    updateDoctorPoliMapping,
    deleteDoctorPoliMapping,
    toggleDoctorPoliMappingStatus,
    registrations
  } = useApp();

  // Active Tab
  const [activeTab, setActiveTab] = useState<'ruangan' | 'bed' | 'dokter' | 'poli' | 'mapping'>('ruangan');

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterExtra, setFilterExtra] = useState<string>('all'); // Extra filter e.g. room type, room id, specialty

  // Modals
  const [modalRuanganOpen, setModalRuanganOpen] = useState(false);
  const [editingRuangan, setEditingRuangan] = useState<MasterRuangan | null>(null);

  const [modalBedOpen, setModalBedOpen] = useState(false);
  const [editingBed, setEditingBed] = useState<MasterBed | null>(null);

  const [modalDokterOpen, setModalDokterOpen] = useState(false);
  const [editingDokter, setEditingDokter] = useState<MasterDokter | null>(null);

  const [modalPoliOpen, setModalPoliOpen] = useState(false);
  const [editingPoli, setEditingPoli] = useState<MasterPoli | null>(null);

  const [modalMappingOpen, setModalMappingOpen] = useState(false);
  const [editingMapping, setEditingMapping] = useState<DoctorPoliMapping | null>(null);

  // Form States
  // 1. Ruangan Form
  const [formRuanganKode, setFormRuanganKode] = useState('');
  const [formRuanganNama, setFormRuanganNama] = useState('');
  const [formRuanganJenis, setFormRuanganJenis] = useState<JenisRuangan>('Rawat Inap');
  const [formRuanganLokasi, setFormRuanganLokasi] = useState('');
  const [formRuanganKapasitas, setFormRuanganKapasitas] = useState(4);
  const [formRuanganStatus, setFormRuanganStatus] = useState<'Aktif' | 'Nonaktif'>('Aktif');
  const [formRuanganDeskripsi, setFormRuanganDeskripsi] = useState('');

  // 2. Bed Form
  const [formBedKode, setFormBedKode] = useState('');
  const [formBedNama, setFormBedNama] = useState('');
  const [formBedRuanganId, setFormBedRuanganId] = useState('');
  const [formBedKelas, setFormBedKelas] = useState('Kelas 1');
  const [formBedStatusOps, setFormBedStatusOps] = useState<StatusBedOperasional>('Tersedia');
  const [formBedCatatan, setFormBedCatatan] = useState('');

  // 3. Dokter Form
  const [formDokterNama, setFormDokterNama] = useState('');
  const [formDokterNik, setFormDokterNik] = useState('');
  const [formDokterStrSip, setFormDokterStrSip] = useState('');
  const [formDokterSpesialisasi, setFormDokterSpesialisasi] = useState('Penyakit Dalam');
  const [formDokterTelepon, setFormDokterTelepon] = useState('');
  const [formDokterGender, setFormDokterGender] = useState<'L' | 'P'>('L');

  // 4. Poli Form
  const [formPoliKode, setFormPoliKode] = useState('');
  const [formPoliNama, setFormPoliNama] = useState('');
  const [formPoliKelompok, setFormPoliKelompok] = useState<KelompokLayananPoli>('Spesialis Dasar');
  const [formPoliLokasi, setFormPoliLokasi] = useState('Gedung Rawat Jalan - Lantai 1');
  const [formPoliJam, setFormPoliJam] = useState('Senin - Sabtu (08:00 - 16:00 WIB)');

  // 5. Mapping Form
  const [formMapDoctorId, setFormMapDoctorId] = useState('');
  const [formMapPoliIds, setFormMapPoliIds] = useState<string[]>([]);
  const [formMapHari, setFormMapHari] = useState<string[]>(['Senin', 'Rabu', 'Jumat']);
  const [formMapJamMulai, setFormMapJamMulai] = useState('08:00');
  const [formMapJamSelesai, setFormMapJamSelesai] = useState('12:00');
  const [formMapCatatan, setFormMapCatatan] = useState('');

  // STRICT RBAC VALIDATION: ONLY SUPERADMIN (R01)
  const isSuperAdmin = user?.roleId === 'R01';

  if (!isSuperAdmin) {
    return (
      <div className="bg-white rounded-2xl border border-rose-200 p-8 shadow-xs max-w-2xl mx-auto my-12 text-center space-y-4">
        <div className="w-16 h-16 bg-rose-50 border border-rose-200 text-rose-600 rounded-2xl flex items-center justify-center mx-auto shadow-2xs">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Akses Terbatas — Khusus Super Administrator (R01)</h2>
        <p className="text-xs text-slate-600 leading-relaxed max-w-lg mx-auto">
          Modul Master Data SIMRS (Manajemen Ruangan, Bed, Dokter, Poli, dan Penempatan Dokter-Poli) merupakan modul inti dan hanya dapat dikelola oleh akun dengan peran <strong>Super Administrator (R01)</strong>. Akun Anda saat ini tidak memiliki hak akses untuk mengubah master data sistem.
        </p>
      </div>
    );
  }

  // --- Reset & Open Handlers ---
  const handleOpenAddRuangan = () => {
    setEditingRuangan(null);
    const nextNum = masterRuangan.length + 1;
    setFormRuanganKode(`RNG-NEW-${String(nextNum).padStart(2, '0')}`);
    setFormRuanganNama('');
    setFormRuanganJenis('Rawat Inap');
    setFormRuanganLokasi('Gedung Rawat Inap - Lantai 2');
    setFormRuanganKapasitas(4);
    setFormRuanganStatus('Aktif');
    setFormRuanganDeskripsi('');
    setModalRuanganOpen(true);
  };

  const handleOpenEditRuangan = (r: MasterRuangan) => {
    setEditingRuangan(r);
    setFormRuanganKode(r.kode);
    setFormRuanganNama(r.nama);
    setFormRuanganJenis(r.jenis);
    setFormRuanganLokasi(r.lokasi);
    setFormRuanganKapasitas(r.kapasitas);
    setFormRuanganStatus(r.status);
    setFormRuanganDeskripsi(r.deskripsi || '');
    setModalRuanganOpen(true);
  };

  const handleSaveRuangan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formRuanganKode.trim() || !formRuanganNama.trim()) {
      Swal.fire({ icon: 'warning', title: 'Data Belum Lengkap', text: 'Kode dan Nama Ruangan wajib diisi.' });
      return;
    }
    if (formRuanganKapasitas < 0) {
      Swal.fire({ icon: 'error', title: 'Kapasitas Tidak Valid', text: 'Kapasitas ruangan tidak boleh bernilai negatif.' });
      return;
    }

    if (editingRuangan) {
      const res = updateMasterRuangan(editingRuangan.id, {
        kode: formRuanganKode,
        nama: formRuanganNama,
        jenis: formRuanganJenis,
        lokasi: formRuanganLokasi,
        kapasitas: formRuanganKapasitas,
        status: formRuanganStatus,
        deskripsi: formRuanganDeskripsi
      });
      if (res.success) {
        Swal.fire({ icon: 'success', title: 'Berhasil', text: res.message, timer: 1500, showConfirmButton: false });
        setModalRuanganOpen(false);
      } else {
        Swal.fire({ icon: 'error', title: 'Gagal', text: res.message });
      }
    } else {
      const res = addMasterRuangan({
        kode: formRuanganKode,
        nama: formRuanganNama,
        jenis: formRuanganJenis,
        lokasi: formRuanganLokasi,
        kapasitas: formRuanganKapasitas,
        status: formRuanganStatus,
        deskripsi: formRuanganDeskripsi
      });
      if (res.success) {
        Swal.fire({ icon: 'success', title: 'Berhasil', text: res.message, timer: 1500, showConfirmButton: false });
        setModalRuanganOpen(false);
      } else {
        Swal.fire({ icon: 'error', title: 'Gagal', text: res.message });
      }
    }
  };

  const handleDeleteRuangan = (r: MasterRuangan) => {
    Swal.fire({
      title: 'Hapus Ruangan?',
      text: `Apakah Anda yakin ingin menghapus ruangan "${r.nama}"? Pastikan tidak ada tempat tidur yang sedang ditempati pasien.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e11d48',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Ya, Hapus Ruangan',
      cancelButtonText: 'Batal'
    }).then(result => {
      if (result.isConfirmed) {
        const res = deleteMasterRuangan(r.id);
        if (res.success) {
          Swal.fire({ icon: 'success', title: 'Terhapus', text: res.message, timer: 1500, showConfirmButton: false });
        } else {
          Swal.fire({ icon: 'error', title: 'Gagal Menghapus', text: res.message });
        }
      }
    });
  };

  // --- Bed Handlers ---
  const handleOpenAddBed = () => {
    setEditingBed(null);
    const defaultRoom = masterRuangan.find(r => r.status === 'Aktif') || masterRuangan[0];
    const defaultRoomId = defaultRoom ? defaultRoom.id : '';
    const nextNum = masterBed.length + 1;
    setFormBedKode(`BED-${String(nextNum).padStart(3, '0')}`);
    setFormBedNama(`Kamar ${nextNum} - Bed A`);
    setFormBedRuanganId(defaultRoomId);
    setFormBedKelas('Kelas 1');
    setFormBedStatusOps('Tersedia');
    setFormBedCatatan('');
    setModalBedOpen(true);
  };

  const handleOpenEditBed = (b: MasterBed) => {
    setEditingBed(b);
    setFormBedKode(b.kode);
    setFormBedNama(b.nama);
    setFormBedRuanganId(b.ruanganId);
    setFormBedKelas(b.kelas);
    setFormBedStatusOps(b.statusOperasional);
    setFormBedCatatan(b.catatan || '');
    setModalBedOpen(true);
  };

  const handleSaveBed = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formBedKode.trim() || !formBedNama.trim() || !formBedRuanganId) {
      Swal.fire({ icon: 'warning', title: 'Data Belum Lengkap', text: 'Kode, Nama Bed, dan Ruangan wajib diisi.' });
      return;
    }

    if (editingBed) {
      const res = updateMasterBed(editingBed.id, {
        kode: formBedKode,
        nama: formBedNama,
        ruanganId: formBedRuanganId,
        kelas: formBedKelas,
        statusOperasional: formBedStatusOps,
        catatan: formBedCatatan
      });
      if (res.success) {
        Swal.fire({ icon: 'success', title: 'Berhasil', text: res.message, timer: 1500, showConfirmButton: false });
        setModalBedOpen(false);
      } else {
        Swal.fire({ icon: 'error', title: 'Gagal', text: res.message });
      }
    } else {
      const targetRoom = masterRuangan.find(r => r.id === formBedRuanganId);
      const res = addMasterBed({
        kode: formBedKode,
        nama: formBedNama,
        ruanganId: formBedRuanganId,
        ruanganNama: targetRoom ? targetRoom.nama : 'Rawat Inap',
        kelas: formBedKelas,
        statusOperasional: formBedStatusOps,
        status: 'Aktif',
        catatan: formBedCatatan
      });
      if (res.success) {
        Swal.fire({ icon: 'success', title: 'Berhasil', text: res.message, timer: 1500, showConfirmButton: false });
        setModalBedOpen(false);
      } else {
        Swal.fire({ icon: 'error', title: 'Gagal', text: res.message });
      }
    }
  };

  const handleDeleteBed = (b: MasterBed) => {
    Swal.fire({
      title: 'Hapus Tempat Tidur?',
      text: `Hapus bed "${b.nama}" (${b.ruanganNama})? Bed yang sedang terisi pasien tidak dapat dihapus.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e11d48',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Ya, Hapus Bed',
      cancelButtonText: 'Batal'
    }).then(result => {
      if (result.isConfirmed) {
        const res = deleteMasterBed(b.id);
        if (res.success) {
          Swal.fire({ icon: 'success', title: 'Terhapus', text: res.message, timer: 1500, showConfirmButton: false });
        } else {
          Swal.fire({ icon: 'error', title: 'Gagal Menghapus', text: res.message });
        }
      }
    });
  };

  // --- Dokter Handlers ---
  const handleOpenAddDokter = () => {
    setEditingDokter(null);
    setFormDokterNama('');
    setFormDokterNik('');
    setFormDokterStrSip('');
    setFormDokterSpesialisasi('Penyakit Dalam');
    setFormDokterTelepon('');
    setFormDokterGender('L');
    setModalDokterOpen(true);
  };

  const handleOpenEditDokter = (d: MasterDokter) => {
    setEditingDokter(d);
    setFormDokterNama(d.nama);
    setFormDokterNik(d.nik);
    setFormDokterStrSip(d.strSip);
    setFormDokterSpesialisasi(d.spesialisasi);
    setFormDokterTelepon(d.telepon);
    setFormDokterGender(d.gender || 'L');
    setModalDokterOpen(true);
  };

  const handleSaveDokter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formDokterNama.trim() || !formDokterSpesialisasi) {
      Swal.fire({ icon: 'warning', title: 'Data Belum Lengkap', text: 'Nama dokter dan spesialisasi wajib diisi.' });
      return;
    }

    if (editingDokter) {
      const res = updateMasterDokter(editingDokter.id, {
        nama: formDokterNama.trim(),
        nik: formDokterNik.trim(),
        strSip: formDokterStrSip.trim(),
        spesialisasi: formDokterSpesialisasi,
        telepon: formDokterTelepon.trim(),
        gender: formDokterGender
      });
      if (res.success) {
        Swal.fire({ icon: 'success', title: 'Berhasil', text: res.message, timer: 1500, showConfirmButton: false });
        setModalDokterOpen(false);
      } else {
        Swal.fire({ icon: 'error', title: 'Gagal', text: res.message });
      }
    } else {
      const res = addMasterDokter({
        nama: formDokterNama.trim(),
        nik: formDokterNik.trim(),
        strSip: formDokterStrSip.trim(),
        spesialisasi: formDokterSpesialisasi,
        telepon: formDokterTelepon.trim(),
        gender: formDokterGender,
        status: 'Aktif'
      });
      if (res.success) {
        Swal.fire({ icon: 'success', title: 'Berhasil', text: res.message, timer: 1500, showConfirmButton: false });
        setModalDokterOpen(false);
      } else {
        Swal.fire({ icon: 'error', title: 'Gagal', text: res.message });
      }
    }
  };

  const handleDeleteDokter = (d: MasterDokter) => {
    Swal.fire({
      title: 'Hapus Dokter?',
      text: `Hapus dokter "${d.nama}"? Seluruh penugasan poli terkait dokter ini juga akan dihapus.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e11d48',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal'
    }).then(result => {
      if (result.isConfirmed) {
        const res = deleteMasterDokter(d.id);
        if (res.success) {
          Swal.fire({ icon: 'success', title: 'Terhapus', text: res.message, timer: 1500, showConfirmButton: false });
        } else {
          Swal.fire({ icon: 'error', title: 'Gagal', text: res.message });
        }
      }
    });
  };

  // --- Poli Handlers ---
  const handleOpenAddPoli = () => {
    setEditingPoli(null);
    const nextNum = masterPoli.length + 1;
    setFormPoliKode(`POL-SP-${String(nextNum).padStart(2, '0')}`);
    setFormPoliNama('');
    setFormPoliKelompok('Spesialis Dasar');
    setFormPoliLokasi('Gedung Rawat Jalan - Lantai 1');
    setFormPoliJam('Senin - Sabtu (08:00 - 16:00 WIB)');
    setModalPoliOpen(true);
  };

  const handleOpenEditPoli = (p: MasterPoli) => {
    setEditingPoli(p);
    setFormPoliKode(p.kode);
    setFormPoliNama(p.nama);
    setFormPoliKelompok(p.kelompokLayanan);
    setFormPoliLokasi(p.lokasi);
    setFormPoliJam(p.jamPelayanan);
    setModalPoliOpen(true);
  };

  const handleSavePoli = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formPoliKode.trim() || !formPoliNama.trim()) {
      Swal.fire({ icon: 'warning', title: 'Data Belum Lengkap', text: 'Kode dan Nama Poli wajib diisi.' });
      return;
    }

    if (editingPoli) {
      const res = updateMasterPoli(editingPoli.id, {
        kode: formPoliKode.trim().toUpperCase(),
        nama: formPoliNama.trim(),
        kelompokLayanan: formPoliKelompok,
        lokasi: formPoliLokasi.trim(),
        jamPelayanan: formPoliJam.trim()
      });
      if (res.success) {
        Swal.fire({ icon: 'success', title: 'Berhasil', text: res.message, timer: 1500, showConfirmButton: false });
        setModalPoliOpen(false);
      } else {
        Swal.fire({ icon: 'error', title: 'Gagal', text: res.message });
      }
    } else {
      const res = addMasterPoli({
        kode: formPoliKode.trim().toUpperCase(),
        nama: formPoliNama.trim(),
        kelompokLayanan: formPoliKelompok,
        lokasi: formPoliLokasi.trim(),
        jamPelayanan: formPoliJam.trim(),
        status: 'Aktif'
      });
      if (res.success) {
        Swal.fire({ icon: 'success', title: 'Berhasil', text: res.message, timer: 1500, showConfirmButton: false });
        setModalPoliOpen(false);
      } else {
        Swal.fire({ icon: 'error', title: 'Gagal', text: res.message });
      }
    }
  };

  const handleDeletePoli = (p: MasterPoli) => {
    Swal.fire({
      title: 'Hapus Poli / Klinik?',
      text: `Apakah Anda ingin menghapus poli "${p.nama}"? Jika poli memiliki riwayat transaksi atau penugasan, sistem akan menyarankan untuk menonaktifkan poli agar riwayat transaksi tidak rusak.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e11d48',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Hapus Poli',
      cancelButtonText: 'Batal'
    }).then(result => {
      if (result.isConfirmed) {
        const res = deleteMasterPoli(p.id);
        if (res.success) {
          Swal.fire({ icon: 'success', title: 'Terhapus', text: res.message, timer: 1500, showConfirmButton: false });
        } else {
          Swal.fire({
            icon: 'info',
            title: 'Saran Tata Kelola SIMRS',
            text: res.message,
            showDenyButton: true,
            denyButtonText: 'Nonaktifkan Poli Saja',
            denyButtonColor: '#d97706',
            confirmButtonText: 'Mengerti'
          }).then(denyRes => {
            if (denyRes.isDenied) {
              toggleMasterPoliStatus(p.id);
              Swal.fire({ icon: 'success', title: 'Dinonaktifkan', text: `Poli "${p.nama}" berhasil dinonaktifkan dengan aman.`, timer: 1500, showConfirmButton: false });
            }
          });
        }
      }
    });
  };

  // --- Mapping Handlers ---
  const handleOpenAddMapping = (presetDoctorId?: string) => {
    setEditingMapping(null);
    const activeDocs = masterDokter.filter(d => d.status === 'Aktif');
    const defaultDocId = presetDoctorId || (activeDocs.length > 0 ? activeDocs[0].id : '');
    const activePolis = masterPoli.filter(p => p.status === 'Aktif');
    const defaultPoliId = activePolis.length > 0 ? activePolis[0].id : '';

    setFormMapDoctorId(defaultDocId);
    setFormMapPoliIds(defaultPoliId ? [defaultPoliId] : []);
    setFormMapHari(['Senin', 'Rabu', 'Jumat']);
    setFormMapJamMulai('08:00');
    setFormMapJamSelesai('12:00');
    setFormMapCatatan('Penugasan praktik rawat jalan reguler');
    setModalMappingOpen(true);
  };

  const handleOpenEditMapping = (m: DoctorPoliMapping) => {
    setEditingMapping(m);
    setFormMapDoctorId(m.doctorId);
    setFormMapPoliIds([m.poliId]);
    setFormMapHari(m.hariPraktik || ['Senin', 'Rabu']);
    setFormMapJamMulai(m.jamMulai || '08:00');
    setFormMapJamSelesai(m.jamSelesai || '12:00');
    setFormMapCatatan(m.catatan || '');
    setModalMappingOpen(true);
  };

  const handleSaveMapping = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formMapDoctorId || formMapPoliIds.length === 0) {
      Swal.fire({ icon: 'warning', title: 'Data Belum Lengkap', text: 'Pilih dokter dan minimal satu poli tempat bertugas.' });
      return;
    }
    if (formMapHari.length === 0) {
      Swal.fire({ icon: 'warning', title: 'Hari Praktik Kosong', text: 'Pilih minimal satu hari jadwal praktik.' });
      return;
    }
    if (formMapJamMulai >= formMapJamSelesai) {
      Swal.fire({ icon: 'error', title: 'Waktu Tidak Valid', text: 'Jam mulai praktik harus lebih awal dari jam selesai.' });
      return;
    }

    if (editingMapping) {
      const res = updateDoctorPoliMapping(editingMapping.id, {
        doctorId: formMapDoctorId,
        poliId: formMapPoliIds[0],
        hariPraktik: formMapHari,
        jamMulai: formMapJamMulai,
        jamSelesai: formMapJamSelesai,
        catatan: formMapCatatan
      });
      if (res.success) {
        Swal.fire({ icon: 'success', title: 'Berhasil', text: res.message, timer: 1500, showConfirmButton: false });
        setModalMappingOpen(false);
      } else {
        Swal.fire({ icon: 'error', title: 'Konflik Jadwal', text: res.message });
      }
    } else {
      // Loop across selected poliIds (support multi-poli assignment)
      let addedCount = 0;
      let lastError = '';

      for (const targetPoliId of formMapPoliIds) {
        const res = addDoctorPoliMapping({
          doctorId: formMapDoctorId,
          doctorName: '',
          poliId: targetPoliId,
          poliName: '',
          hariPraktik: formMapHari,
          jamMulai: formMapJamMulai,
          jamSelesai: formMapJamSelesai,
          status: 'Aktif',
          catatan: formMapCatatan
        });
        if (res.success) {
          addedCount++;
        } else {
          lastError = res.message;
        }
      }

      if (addedCount > 0) {
        Swal.fire({
          icon: 'success',
          title: 'Berhasil',
          text: `${addedCount} penugasan poli berhasil disimpan.${lastError ? ' Beberapa poli lain mengalami bentrok: ' + lastError : ''}`,
          timer: 2000,
          showConfirmButton: false
        });
        setModalMappingOpen(false);
      } else {
        Swal.fire({ icon: 'error', title: 'Gagal Menyimpan Penugasan', text: lastError || 'Semua jadwal yang diajukan bertabrakan.' });
      }
    }
  };

  const handleDeleteMapping = (m: DoctorPoliMapping) => {
    Swal.fire({
      title: 'Hapus Penugasan Dokter?',
      text: `Hapus penugasan dokter ${m.doctorName} pada ${m.poliName}? Data induk dokter dan poli tetap aman dan tidak terhapus.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#e11d48',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Ya, Hapus Penugasan',
      cancelButtonText: 'Batal'
    }).then(result => {
      if (result.isConfirmed) {
        const res = deleteDoctorPoliMapping(m.id);
        if (res.success) {
          Swal.fire({ icon: 'success', title: 'Terhapus', text: res.message, timer: 1500, showConfirmButton: false });
        } else {
          Swal.fire({ icon: 'error', title: 'Gagal', text: res.message });
        }
      }
    });
  };

  // --- Filtered Data Collections ---
  const filteredRuangan = useMemo(() => {
    return masterRuangan.filter(r => {
      if (filterStatus !== 'all' && r.status !== filterStatus) return false;
      if (filterExtra !== 'all' && r.jenis !== filterExtra) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return r.kode.toLowerCase().includes(q) || r.nama.toLowerCase().includes(q) || r.lokasi.toLowerCase().includes(q);
      }
      return true;
    });
  }, [masterRuangan, filterStatus, filterExtra, searchQuery]);

  const filteredBed = useMemo(() => {
    return masterBed.filter(b => {
      if (filterStatus !== 'all' && b.status !== filterStatus) return false;
      if (filterExtra !== 'all') {
        if (filterExtra.startsWith('room:')) {
          const targetRoomId = filterExtra.replace('room:', '');
          if (b.ruanganId !== targetRoomId) return false;
        } else if (filterExtra.startsWith('ops:')) {
          const targetOps = filterExtra.replace('ops:', '');
          if (b.statusOperasional !== targetOps) return false;
        } else if (b.kelas !== filterExtra) {
          return false;
        }
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return b.kode.toLowerCase().includes(q) || b.nama.toLowerCase().includes(q) || b.ruanganNama.toLowerCase().includes(q);
      }
      return true;
    });
  }, [masterBed, filterStatus, filterExtra, searchQuery]);

  const filteredDokter = useMemo(() => {
    return masterDokter.filter(d => {
      if (filterStatus !== 'all' && d.status !== filterStatus) return false;
      if (filterExtra !== 'all' && d.spesialisasi !== filterExtra) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return d.id.toLowerCase().includes(q) || d.nama.toLowerCase().includes(q) || d.spesialisasi.toLowerCase().includes(q) || d.nik.includes(q);
      }
      return true;
    });
  }, [masterDokter, filterStatus, filterExtra, searchQuery]);

  const filteredPoli = useMemo(() => {
    return masterPoli.filter(p => {
      if (filterStatus !== 'all' && p.status !== filterStatus) return false;
      if (filterExtra !== 'all' && p.kelompokLayanan !== filterExtra) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return p.kode.toLowerCase().includes(q) || p.nama.toLowerCase().includes(q) || p.lokasi.toLowerCase().includes(q);
      }
      return true;
    });
  }, [masterPoli, filterStatus, filterExtra, searchQuery]);

  const filteredMappings = useMemo(() => {
    return doctorPoliMappings.filter(m => {
      if (filterStatus !== 'all' && m.status !== filterStatus) return false;
      if (filterExtra !== 'all') {
        if (filterExtra.startsWith('poli:')) {
          const poliId = filterExtra.replace('poli:', '');
          if (m.poliId !== poliId) return false;
        } else if (filterExtra.startsWith('doc:')) {
          const docId = filterExtra.replace('doc:', '');
          if (m.doctorId !== docId) return false;
        }
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return m.doctorName.toLowerCase().includes(q) || m.poliName.toLowerCase().includes(q) || (m.jadwalPraktik && m.jadwalPraktik.toLowerCase().includes(q));
      }
      return true;
    });
  }, [doctorPoliMappings, filterStatus, filterExtra, searchQuery]);

  // Overall Statistics
  const totalRuangan = masterRuangan.length;
  const activeRuangan = masterRuangan.filter(r => r.status === 'Aktif').length;
  const totalBeds = masterBed.length;
  const occupiedBeds = masterBed.filter(b => b.statusOperasional === 'Terisi').length;
  const availableBeds = masterBed.filter(b => b.statusOperasional === 'Tersedia').length;
  const totalDoctors = masterDokter.length;
  const activeDoctors = masterDokter.filter(d => d.status === 'Aktif').length;
  const totalPolis = masterPoli.length;
  const activePolis = masterPoli.filter(p => p.status === 'Aktif').length;
  const totalMappings = doctorPoliMappings.length;

  return (
    <div className="space-y-6">
      {/* HEADER SECTION */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-md shadow-blue-500/20 shrink-0">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 rounded-full tracking-wider">
                Khusus Superadmin (R01)
              </span>
              <span className="text-[11px] text-slate-400 font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Terotorisasi Penuh
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 leading-tight">
              Manajemen Master Data SIMRS
            </h1>
            <p className="text-xs text-slate-500">
              Pengelolaan Data Induk Ruangan, Bed/Tempat Tidur, Dokter, Poli, dan Penempatan Dokter-Poli (Mapping)
            </p>
          </div>
        </div>

        {/* Quick KPI Badges */}
        <div className="flex items-center gap-3 text-xs bg-slate-50 p-2 rounded-xl border border-slate-200/60 shrink-0">
          <div className="px-2.5 py-1 text-center">
            <div className="text-[10px] text-slate-400 uppercase font-bold">Ruangan</div>
            <div className="font-extrabold text-blue-700">{activeRuangan}/{totalRuangan}</div>
          </div>
          <div className="w-px h-7 bg-slate-200" />
          <div className="px-2.5 py-1 text-center">
            <div className="text-[10px] text-slate-400 uppercase font-bold">Bed RS</div>
            <div className="font-extrabold text-indigo-700">{availableBeds} Ready</div>
          </div>
          <div className="w-px h-7 bg-slate-200" />
          <div className="px-2.5 py-1 text-center">
            <div className="text-[10px] text-slate-400 uppercase font-bold">Dokter</div>
            <div className="font-extrabold text-emerald-700">{activeDoctors} Aktif</div>
          </div>
          <div className="w-px h-7 bg-slate-200" />
          <div className="px-2.5 py-1 text-center">
            <div className="text-[10px] text-slate-400 uppercase font-bold">Poli</div>
            <div className="font-extrabold text-purple-700">{activePolis} Unit</div>
          </div>
        </div>
      </div>

      {/* 5 SUB-MODULE TABS */}
      <div className="flex items-center gap-1.5 p-1.5 bg-slate-100 rounded-2xl border border-slate-200/80 overflow-x-auto scrollbar-thin">
        <button
          type="button"
          onClick={() => { setActiveTab('ruangan'); setSearchQuery(''); setFilterStatus('all'); setFilterExtra('all'); }}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
            activeTab === 'ruangan'
              ? 'bg-white text-blue-700 shadow-xs border border-blue-100'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <DoorOpen className="w-4 h-4" />
          <span>1. Manajemen Ruangan</span>
          <span className="text-[10px] px-1.5 py-0.2 bg-blue-50 text-blue-700 rounded-md font-bold">{totalRuangan}</span>
        </button>

        <button
          type="button"
          onClick={() => { setActiveTab('bed'); setSearchQuery(''); setFilterStatus('all'); setFilterExtra('all'); }}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
            activeTab === 'bed'
              ? 'bg-white text-blue-700 shadow-xs border border-blue-100'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <BedIcon className="w-4 h-4" />
          <span>2. Manajemen Bed / Tempat Tidur</span>
          <span className="text-[10px] px-1.5 py-0.2 bg-blue-50 text-blue-700 rounded-md font-bold">{totalBeds}</span>
        </button>

        <button
          type="button"
          onClick={() => { setActiveTab('dokter'); setSearchQuery(''); setFilterStatus('all'); setFilterExtra('all'); }}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
            activeTab === 'dokter'
              ? 'bg-white text-blue-700 shadow-xs border border-blue-100'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <Stethoscope className="w-4 h-4" />
          <span>3. Manajemen Dokter</span>
          <span className="text-[10px] px-1.5 py-0.2 bg-blue-50 text-blue-700 rounded-md font-bold">{totalDoctors}</span>
        </button>

        <button
          type="button"
          onClick={() => { setActiveTab('poli'); setSearchQuery(''); setFilterStatus('all'); setFilterExtra('all'); }}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
            activeTab === 'poli'
              ? 'bg-white text-blue-700 shadow-xs border border-blue-100'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <BriefcaseMedical className="w-4 h-4" />
          <span>4. Manajemen Poli / Klinik</span>
          <span className="text-[10px] px-1.5 py-0.2 bg-blue-50 text-blue-700 rounded-md font-bold">{totalPolis}</span>
        </button>

        <button
          type="button"
          onClick={() => { setActiveTab('mapping'); setSearchQuery(''); setFilterStatus('all'); setFilterExtra('all'); }}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
            activeTab === 'mapping'
              ? 'bg-white text-blue-700 shadow-xs border border-blue-100'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <Network className="w-4 h-4" />
          <span>5. Penempatan Dokter ke Poli (Mapping)</span>
          <span className="text-[10px] px-1.5 py-0.2 bg-indigo-50 text-indigo-700 rounded-md font-bold">{totalMappings}</span>
        </button>
      </div>

      {/* FILTER & SEARCH TOOLBAR */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 w-full md:w-auto flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={
                activeTab === 'ruangan' ? 'Cari kode, nama ruangan, atau lokasi gedung...' :
                activeTab === 'bed' ? 'Cari kode bed, nama bed, atau bangsal...' :
                activeTab === 'dokter' ? 'Cari ID, nama dokter, atau spesialisasi...' :
                activeTab === 'poli' ? 'Cari kode poli, nama poli, atau lokasi...' :
                'Cari nama dokter, nama poli, atau jadwal...'
              }
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500"
            />
          </div>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-xs text-slate-500 hover:text-slate-800 px-2 py-1 bg-slate-100 rounded-lg shrink-0 cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto flex-wrap justify-end">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-400 font-semibold text-[11px]">Status:</span>
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
            >
              <option value="all">Semua Status</option>
              <option value="Aktif">Hanya Aktif</option>
              <option value="Nonaktif">Hanya Nonaktif</option>
            </select>
          </div>

          {/* Extra Filter based on active tab */}
          {activeTab === 'ruangan' && (
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-400 font-semibold text-[11px]">Jenis:</span>
              <select
                value={filterExtra}
                onChange={e => setFilterExtra(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
              >
                <option value="all">Semua Jenis</option>
                <option value="Rawat Inap">Rawat Inap</option>
                <option value="ICU">ICU</option>
                <option value="NICU">NICU</option>
                <option value="Isolasi">Isolasi</option>
              </select>
            </div>
          )}

          {activeTab === 'bed' && (
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-400 font-semibold text-[11px]">Ruangan:</span>
              <select
                value={filterExtra}
                onChange={e => setFilterExtra(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 max-w-[180px]"
              >
                <option value="all">Semua Ruangan</option>
                {masterRuangan.map(r => (
                  <option key={r.id} value={`room:${r.id}`}>{r.nama}</option>
                ))}
                <option value="ops:Tersedia">Operasional: Tersedia</option>
                <option value="ops:Terisi">Operasional: Terisi</option>
                <option value="ops:Dalam Perbaikan">Operasional: Maintenance</option>
              </select>
            </div>
          )}

          {activeTab === 'poli' && (
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-400 font-semibold text-[11px]">Kelompok:</span>
              <select
                value={filterExtra}
                onChange={e => setFilterExtra(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
              >
                <option value="all">Semua Kelompok</option>
                <option value="Spesialis Dasar">Spesialis Dasar</option>
                <option value="Spesialis Lain">Spesialis Lain</option>
                <option value="Gigi Spesialis">Gigi Spesialis</option>
                <option value="Penunjang Medik">Penunjang Medik</option>
              </select>
            </div>
          )}

          {activeTab === 'mapping' && (
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-400 font-semibold text-[11px]">Filter Poli:</span>
              <select
                value={filterExtra}
                onChange={e => setFilterExtra(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 max-w-[200px]"
              >
                <option value="all">Semua Poli</option>
                {masterPoli.map(p => (
                  <option key={p.id} value={`poli:${p.id}`}>{p.nama}</option>
                ))}
              </select>
            </div>
          )}

          {/* Add Button */}
          {activeTab === 'ruangan' && (
            <button
              onClick={handleOpenAddRuangan}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs shadow-blue-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Ruangan</span>
            </button>
          )}

          {activeTab === 'bed' && (
            <button
              onClick={handleOpenAddBed}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs shadow-blue-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Bed Baru</span>
            </button>
          )}

          {activeTab === 'dokter' && (
            <button
              onClick={handleOpenAddDokter}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs shadow-blue-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Dokter</span>
            </button>
          )}

          {activeTab === 'poli' && (
            <button
              onClick={handleOpenAddPoli}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs shadow-blue-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Poli Baru</span>
            </button>
          )}

          {activeTab === 'mapping' && (
            <button
              onClick={() => handleOpenAddMapping()}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs shadow-indigo-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>Atur Penempatan Dokter</span>
            </button>
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* TAB CONTENT 1: MANAJEMEN RUANGAN                          */}
      {/* ========================================================= */}
      {activeTab === 'ruangan' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Kode Ruangan</th>
                  <th className="py-3 px-4">Nama Ruangan</th>
                  <th className="py-3 px-4">Jenis Ruangan</th>
                  <th className="py-3 px-4">Lokasi & Gedung</th>
                  <th className="py-3 px-4 text-center">Kapasitas</th>
                  <th className="py-3 px-4 text-center">Bed Terdaftar</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredRuangan.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400">
                      Tidak ada data ruangan yang cocok dengan filter.
                    </td>
                  </tr>
                ) : (
                  filteredRuangan.map(r => {
                    const bedsInRoom = masterBed.filter(b => b.ruanganId === r.id);
                    const occupiedInRoom = bedsInRoom.filter(b => b.statusOperasional === 'Terisi').length;
                    return (
                      <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-blue-700">
                          {r.kode}
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-900">
                          {r.nama}
                          {r.deskripsi && (
                            <div className="text-[11px] text-slate-400 font-normal truncate max-w-xs">
                              {r.deskripsi}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            r.jenis === 'ICU' || r.jenis === 'NICU' ? 'bg-purple-100 text-purple-800' :
                            r.jenis === 'Isolasi' ? 'bg-amber-100 text-amber-800' :
                            'bg-blue-50 text-blue-800'
                          }`}>
                            {r.jenis}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-600 flex items-center gap-1.5 pt-4">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{r.lokasi}</span>
                        </td>
                        <td className="py-3 px-4 text-center font-bold text-slate-900">
                          {r.kapasitas} Bed
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-lg ${
                            bedsInRoom.length >= r.kapasitas ? 'bg-amber-50 text-amber-900' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {bedsInRoom.length} Bed ({occupiedInRoom} Terisi)
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => toggleMasterRuanganStatus(r.id)}
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
                              r.status === 'Aktif'
                                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                            }`}
                            title="Klik untuk Mengaktifkan/Menonaktifkan Ruangan"
                          >
                            {r.status === 'Aktif' ? 'Aktif' : 'Nonaktif'}
                          </button>
                        </td>
                        <td className="py-3 px-4 text-right space-x-1">
                          <button
                            onClick={() => handleOpenEditRuangan(r)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            title="Edit Ruangan"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteRuangan(r)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Hapus Ruangan"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB CONTENT 2: MANAJEMEN BED / TEMPAT TIDUR               */}
      {/* ========================================================= */}
      {activeTab === 'bed' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Kode Bed</th>
                  <th className="py-3 px-4">Nama / No. Bed</th>
                  <th className="py-3 px-4">Ruangan Penempatan</th>
                  <th className="py-3 px-4">Kelas Perawatan</th>
                  <th className="py-3 px-4 text-center">Status Operasional</th>
                  <th className="py-3 px-4">Pasien Saat Ini</th>
                  <th className="py-3 px-4 text-center">Status Master</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredBed.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400">
                      Tidak ada data bed yang cocok dengan kriteria pencarian.
                    </td>
                  </tr>
                ) : (
                  filteredBed.map(b => (
                    <tr key={b.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-blue-700">
                        {b.kode}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {b.nama}
                        {b.catatan && (
                          <div className="text-[11px] text-slate-400 font-normal">{b.catatan}</div>
                        )}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-800">
                        {b.ruanganNama}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                          {b.kelas}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          b.statusOperasional === 'Tersedia' ? 'bg-emerald-100 text-emerald-800' :
                          b.statusOperasional === 'Terisi' ? 'bg-rose-100 text-rose-800' :
                          b.statusOperasional === 'Dibersihkan' ? 'bg-cyan-100 text-cyan-800' :
                          b.statusOperasional === 'Dalam Perbaikan' ? 'bg-amber-100 text-amber-900' :
                          'bg-slate-200 text-slate-600'
                        }`}>
                          {b.statusOperasional}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 text-[11px]">
                        {b.statusOperasional === 'Terisi' || b.patientId ? (
                          <div className="font-bold text-rose-900">
                            {b.pasienNama || `Pasien ID: ${b.patientId}`}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Tidak ada (Kosong)</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => {
                            const res = toggleMasterBedStatus(b.id);
                            if (!res.success) Swal.fire({ icon: 'warning', title: 'Perhatian', text: res.message });
                          }}
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
                            b.status === 'Aktif'
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                          }`}
                          title="Klik untuk Mengaktifkan/Menonaktifkan Bed"
                        >
                          {b.status === 'Aktif' ? 'Aktif' : 'Nonaktif'}
                        </button>
                      </td>
                      <td className="py-3 px-4 text-right space-x-1">
                        <button
                          onClick={() => handleOpenEditBed(b)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          title="Edit Bed"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteBed(b)}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Hapus Bed"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB CONTENT 3: MANAJEMEN DOKTER                           */}
      {/* ========================================================= */}
      {activeTab === 'dokter' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">ID Dokter</th>
                  <th className="py-3 px-4">Nama Lengkap & Gelar</th>
                  <th className="py-3 px-4">NIK (16 Digit)</th>
                  <th className="py-3 px-4">Nomor STR / SIP</th>
                  <th className="py-3 px-4">Spesialisasi</th>
                  <th className="py-3 px-4">Kontak / Telepon</th>
                  <th className="py-3 px-4 text-center">Poli Penugasan</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredDokter.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-slate-400">
                      Tidak ada dokter yang ditemukan.
                    </td>
                  </tr>
                ) : (
                  filteredDokter.map(d => {
                    const assignedMappings = doctorPoliMappings.filter(m => m.doctorId === d.id && m.status === 'Aktif');
                    return (
                      <tr key={d.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-blue-700">
                          {d.id}
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-900">
                          <div className="flex items-center gap-1.5">
                            <span>{d.nama}</span>
                            <span className={`text-[9px] px-1 rounded font-bold ${d.gender === 'P' ? 'bg-pink-100 text-pink-700' : 'bg-blue-100 text-blue-700'}`}>
                              {d.gender === 'P' ? 'P' : 'L'}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-600">
                          {d.nik}
                        </td>
                        <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                          {d.strSip}
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-800">
                            {d.spesialisasi}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-600">
                          {d.telepon}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {assignedMappings.length > 0 ? (
                            <div className="flex flex-col gap-1 items-center">
                              {assignedMappings.map(m => (
                                <span key={m.id} className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-semibold truncate max-w-[140px]" title={m.poliName}>
                                  {m.poliName}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded font-medium">
                              Belum Ditempatkan
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => toggleMasterDokterStatus(d.id)}
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
                              d.status === 'Aktif'
                                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                            }`}
                            title="Aktifkan/Nonaktifkan Dokter"
                          >
                            {d.status === 'Aktif' ? 'Aktif' : 'Nonaktif'}
                          </button>
                        </td>
                        <td className="py-3 px-4 text-right space-x-1">
                          <button
                            onClick={() => handleOpenAddMapping(d.id)}
                            className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                            title="Tugaskan ke Poli"
                          >
                            <Network className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenEditDokter(d)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            title="Edit Data Dokter"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteDokter(d)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Hapus Dokter"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB CONTENT 4: MANAJEMEN POLI / KLINIK                    */}
      {/* ========================================================= */}
      {activeTab === 'poli' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Kode Poli</th>
                  <th className="py-3 px-4">Nama Poliklinik / Layanan</th>
                  <th className="py-3 px-4">Kelompok Pelayanan</th>
                  <th className="py-3 px-4">Lokasi Poliklinik</th>
                  <th className="py-3 px-4">Jam Pelayanan</th>
                  <th className="py-3 px-4 text-center">Jumlah Dokter</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredPoli.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400">
                      Tidak ada poliklinik yang ditemukan.
                    </td>
                  </tr>
                ) : (
                  filteredPoli.map(p => {
                    const doctorsInPoli = doctorPoliMappings.filter(m => m.poliId === p.id && m.status === 'Aktif');
                    return (
                      <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-blue-700">
                          {p.kode}
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-900">
                          {p.nama}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            p.kelompokLayanan === 'Spesialis Dasar' ? 'bg-blue-100 text-blue-800' :
                            p.kelompokLayanan === 'Spesialis Lain' ? 'bg-emerald-100 text-emerald-800' :
                            p.kelompokLayanan === 'Gigi Spesialis' ? 'bg-amber-100 text-amber-800' :
                            'bg-purple-100 text-purple-800'
                          }`}>
                            {p.kelompokLayanan}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          {p.lokasi}
                        </td>
                        <td className="py-3 px-4 text-slate-600 text-[11px] font-medium flex items-center gap-1 pt-4">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{p.jamPelayanan}</span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-800 font-bold text-[11px]">
                            {doctorsInPoli.length} Dokter
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => toggleMasterPoliStatus(p.id)}
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
                              p.status === 'Aktif'
                                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                            }`}
                            title="Aktifkan/Nonaktifkan Poli"
                          >
                            {p.status === 'Aktif' ? 'Aktif' : 'Nonaktif'}
                          </button>
                        </td>
                        <td className="py-3 px-4 text-right space-x-1">
                          <button
                            onClick={() => handleOpenEditPoli(p)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            title="Edit Poli"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeletePoli(p)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Hapus / Nonaktifkan Poli"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB CONTENT 5: MAPPING DOKTER KE POLI (PENUGASAN)        */}
      {/* ========================================================= */}
      {activeTab === 'mapping' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden space-y-4 p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Network className="w-4 h-4 text-indigo-600" />
                Matriks Penugasan Relasi Many-to-Many (Dokter &ndash; Poli)
              </h2>
              <p className="text-xs text-slate-500">
                Satu dokter dapat ditugaskan pada beberapa poli, dan satu poli dapat melayani banyak dokter dengan jadwal praktik terstandarisasi.
              </p>
            </div>
            <div className="text-xs font-bold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
              Total Penugasan Aktif: <strong className="text-indigo-700">{doctorPoliMappings.filter(m => m.status === 'Aktif').length}</strong>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Nama Dokter</th>
                  <th className="py-3 px-4">Poli Tempat Praktik</th>
                  <th className="py-3 px-4">Hari Praktik</th>
                  <th className="py-3 px-4">Jam Pelayanan</th>
                  <th className="py-3 px-4">Keterangan / Catatan</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredMappings.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      Tidak ada data penempatan dokter ke poli yang cocok.
                    </td>
                  </tr>
                ) : (
                  filteredMappings.map(m => (
                    <tr key={m.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {m.doctorName}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-indigo-900 bg-indigo-50 px-2 py-0.5 rounded text-[11px]">
                          {m.poliName}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1">
                          {m.hariPraktik?.map((h, hIdx) => (
                            <span key={hIdx} className="bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded text-[10px] font-semibold">
                              {h}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono font-medium text-slate-600">
                        {m.jamMulai} - {m.jamSelesai} WIB
                      </td>
                      <td className="py-3 px-4 text-slate-500 text-[11px]">
                        {m.catatan || '-'}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => toggleDoctorPoliMappingStatus(m.id)}
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
                            m.status === 'Aktif'
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                          }`}
                          title="Aktifkan/Nonaktifkan Penugasan"
                        >
                          {m.status === 'Aktif' ? 'Aktif' : 'Nonaktif'}
                        </button>
                      </td>
                      <td className="py-3 px-4 text-right space-x-1">
                        <button
                          onClick={() => handleOpenEditMapping(m)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          title="Ubah Jadwal Penugasan"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteMapping(m)}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Hapus Penugasan dari Poli"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 1: FORM RUANGAN (TAMBAH / EDIT)                     */}
      {/* ========================================================= */}
      {modalRuanganOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <DoorOpen className="w-4 h-4 text-blue-600" />
                {editingRuangan ? 'Ubah Informasi Ruangan' : 'Tambah Ruangan Baru'}
              </h3>
              <button
                onClick={() => setModalRuanganOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveRuangan} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Kode Ruangan (Unik) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formRuanganKode}
                    onChange={e => setFormRuanganKode(e.target.value)}
                    placeholder="Contoh: RNG-MWR-01"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-blue-900 focus:bg-white focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Jenis Ruangan <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formRuanganJenis}
                    onChange={e => setFormRuanganJenis(e.target.value as JenisRuangan)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                  >
                    <option value="Rawat Inap">Rawat Inap</option>
                    <option value="ICU">ICU (Intensive Care Unit)</option>
                    <option value="NICU">NICU (Neonatal ICU)</option>
                    <option value="PICU">PICU (Pediatric ICU)</option>
                    <option value="HCU">HCU (High Care Unit)</option>
                    <option value="Isolasi">Ruang Isolasi</option>
                    <option value="VK / Bersalin">VK / Kamar Bersalin</option>
                    <option value="Bedah / OK">Kamar Bedah (OK)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Ruangan <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formRuanganNama}
                  onChange={e => setFormRuanganNama(e.target.value)}
                  placeholder="Contoh: Bangsal Mawar (Penyakit Dalam)"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Lokasi / Gedung <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formRuanganLokasi}
                    onChange={e => setFormRuanganLokasi(e.target.value)}
                    placeholder="Contoh: Gedung A - Lantai 2"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Kapasitas Tempat Tidur <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formRuanganKapasitas}
                    onChange={e => setFormRuanganKapasitas(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Deskripsi & Fasilitas Ruangan
                </label>
                <textarea
                  rows={2}
                  value={formRuanganDeskripsi}
                  onChange={e => setFormRuanganDeskripsi(e.target.value)}
                  placeholder="Catatan fasilitas ruangan, keunggulan, dll..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalRuanganOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-xs"
                >
                  {editingRuangan ? 'Simpan Perubahan' : 'Tambah Ruangan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: FORM BED (TAMBAH / EDIT)                         */}
      {/* ========================================================= */}
      {modalBedOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <BedIcon className="w-4 h-4 text-blue-600" />
                {editingBed ? 'Ubah Informasi Tempat Tidur' : 'Tambah Bed Baru'}
              </h3>
              <button
                onClick={() => setModalBedOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveBed} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Kode Bed (Unik) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formBedKode}
                    onChange={e => setFormBedKode(e.target.value)}
                    placeholder="Contoh: MWR-101-A"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-blue-900 focus:bg-white focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Kelas Perawatan <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formBedKelas}
                    onChange={e => setFormBedKelas(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                  >
                    <option value="Kelas 1">Kelas 1</option>
                    <option value="Kelas 2">Kelas 2</option>
                    <option value="Kelas 3">Kelas 3</option>
                    <option value="VIP">VIP</option>
                    <option value="VVIP">VVIP</option>
                    <option value="ICU">ICU</option>
                    <option value="Isolasi">Isolasi</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama / Nomor Bed <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formBedNama}
                  onChange={e => setFormBedNama(e.target.value)}
                  placeholder="Contoh: Kamar 101 - Bed A"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Ruangan Penempatan Bed <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formBedRuanganId}
                  onChange={e => setFormBedRuanganId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                  required
                >
                  <option value="">-- Pilih Ruangan --</option>
                  {masterRuangan.map(r => (
                    <option key={r.id} value={r.id}>
                      {r.nama} (Kapasitas: {r.kapasitas} Bed)
                    </option>
                  ))}
                </select>
                <span className="text-[10px] text-slate-500 mt-1 block">
                  * Setiap bed wajib terhubung dengan satu ruangan master yang valid.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Status Operasional
                </label>
                <select
                  value={formBedStatusOps}
                  onChange={e => setFormBedStatusOps(e.target.value as StatusBedOperasional)}
                  disabled={editingBed?.statusOperasional === 'Terisi'}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 disabled:opacity-60"
                >
                  <option value="Tersedia">Tersedia (Ready for Admission)</option>
                  <option value="Terisi">Terisi (Occupied Pasien)</option>
                  <option value="Dibersihkan">Dibersihkan (Housekeeping)</option>
                  <option value="Dalam Perbaikan">Dalam Perbaikan (Maintenance)</option>
                  <option value="Tidak Aktif">Tidak Aktif (Inactive)</option>
                </select>
                {editingBed?.statusOperasional === 'Terisi' && (
                  <p className="text-[10px] text-rose-600 mt-1">
                    Status "Terisi" terkunci oleh data admisi pasien. Lakukan discharge atau pemindahan di modul Bed Management untuk mengosongkan tempat tidur.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Catatan / Keterangan Bed
                </label>
                <input
                  type="text"
                  value={formBedCatatan}
                  onChange={e => setFormBedCatatan(e.target.value)}
                  placeholder="Catatan kondisi tempat tidur, tipe kasur elektrik, dll"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalBedOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-xs"
                >
                  {editingBed ? 'Simpan Perubahan' : 'Tambah Bed'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 3: FORM DOKTER (TAMBAH / EDIT)                      */}
      {/* ========================================================= */}
      {modalDokterOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-blue-600" />
                {editingDokter ? 'Ubah Data Dokter' : 'Tambah Dokter Baru'}
              </h3>
              <button
                onClick={() => setModalDokterOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveDokter} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Lengkap & Gelar <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formDokterNama}
                  onChange={e => setFormDokterNama(e.target.value)}
                  placeholder="Contoh: dr. Andika Pratama, Sp.PD"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    NIK / KTP (16 Digit)
                  </label>
                  <input
                    type="text"
                    maxLength={16}
                    value={formDokterNik}
                    onChange={e => setFormDokterNik(e.target.value.replace(/\D/g, ''))}
                    placeholder="16 Digit NIK"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-medium text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nomor STR / SIP
                  </label>
                  <input
                    type="text"
                    value={formDokterStrSip}
                    onChange={e => setFormDokterStrSip(e.target.value)}
                    placeholder="STR-998877/KONSIL/2026"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-medium text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Spesialisasi <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formDokterSpesialisasi}
                    onChange={e => setFormDokterSpesialisasi(e.target.value)}
                    placeholder="Contoh: Penyakit Dalam, Bedah, Anak"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Jenis Kelamin
                  </label>
                  <select
                    value={formDokterGender}
                    onChange={e => setFormDokterGender(e.target.value as 'L' | 'P')}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                  >
                    <option value="L">Laki-laki (L)</option>
                    <option value="P">Perempuan (P)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nomor Telepon / WhatsApp
                </label>
                <input
                  type="text"
                  value={formDokterTelepon}
                  onChange={e => setFormDokterTelepon(e.target.value)}
                  placeholder="Contoh: 081280001000"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalDokterOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-xs"
                >
                  {editingDokter ? 'Simpan Data' : 'Tambah Dokter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 4: FORM POLI (TAMBAH / EDIT)                        */}
      {/* ========================================================= */}
      {modalPoliOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <BriefcaseMedical className="w-4 h-4 text-blue-600" />
                {editingPoli ? 'Ubah Informasi Poli' : 'Tambah Poliklinik Baru'}
              </h3>
              <button
                onClick={() => setModalPoliOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSavePoli} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Kode Poli (Unik) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formPoliKode}
                    onChange={e => setFormPoliKode(e.target.value)}
                    placeholder="Contoh: POL-GERIATRI"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-blue-900"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Kelompok Layanan <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formPoliKelompok}
                    onChange={e => setFormPoliKelompok(e.target.value as KelompokLayananPoli)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                  >
                    <option value="Spesialis Dasar">Spesialis Dasar</option>
                    <option value="Spesialis Lain">Spesialis Lain</option>
                    <option value="Gigi Spesialis">Gigi Spesialis</option>
                    <option value="Penunjang Medik">Penunjang Medik</option>
                    <option value="Layanan Umum">Layanan Umum</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Poliklinik <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formPoliNama}
                  onChange={e => setFormPoliNama(e.target.value)}
                  placeholder="Contoh: Poliklinik Geriatri & Terpadu"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Lokasi Poliklinik
                </label>
                <input
                  type="text"
                  value={formPoliLokasi}
                  onChange={e => setFormPoliLokasi(e.target.value)}
                  placeholder="Contoh: Gedung Rawat Jalan - Lantai 2 Sayap Barat"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Jam Pelayanan
                </label>
                <input
                  type="text"
                  value={formPoliJam}
                  onChange={e => setFormPoliJam(e.target.value)}
                  placeholder="Contoh: Senin - Jumat (08:00 - 15:00 WIB)"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalPoliOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-xs"
                >
                  {editingPoli ? 'Simpan Perubahan' : 'Tambah Poli'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 5: FORM MAPPING DOKTER KE POLI                      */}
      {/* ========================================================= */}
      {modalMappingOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Network className="w-4 h-4 text-indigo-600" />
                {editingMapping ? 'Ubah Penempatan Dokter' : 'Atur Penempatan Dokter ke Poli'}
              </h3>
              <button
                onClick={() => setModalMappingOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveMapping} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Pilih Dokter <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formMapDoctorId}
                  onChange={e => setFormMapDoctorId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                  required
                >
                  <option value="">-- Pilih Dokter Spesialis --</option>
                  {masterDokter.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.nama} ({d.spesialisasi}) {d.status !== 'Aktif' ? '- [Nonaktif]' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Pilih Poli / Klinik Penugasan <span className="text-rose-500">*</span>
                </label>
                {editingMapping ? (
                  <select
                    value={formMapPoliIds[0] || ''}
                    onChange={e => setFormMapPoliIds([e.target.value])}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                    required
                  >
                    {masterPoli.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.nama} ({p.kelompokLayanan})
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="max-h-36 overflow-y-auto border border-slate-200 rounded-xl p-2 space-y-1 bg-slate-50/60 scrollbar-thin">
                    {masterPoli.filter(p => p.status === 'Aktif').map(p => {
                      const isChecked = formMapPoliIds.includes(p.id);
                      return (
                        <label
                          key={p.id}
                          className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-white text-xs font-semibold text-slate-700 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={e => {
                              if (e.target.checked) {
                                setFormMapPoliIds(prev => [...prev, p.id]);
                              } else {
                                setFormMapPoliIds(prev => prev.filter(id => id !== p.id));
                              }
                            }}
                            className="w-3.5 h-3.5 rounded text-indigo-600 focus:ring-indigo-500"
                          />
                          <span>{p.nama}</span>
                          <span className="text-[10px] text-slate-400 font-normal">({p.kode})</span>
                        </label>
                      );
                    })}
                  </div>
                )}
                <span className="text-[10px] text-slate-500 mt-1 block">
                  * Satu dokter dapat ditugaskan pada satu atau beberapa poli secara fleksibel.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Hari Praktik Pelayanan <span className="text-rose-500">*</span>
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'].map(day => {
                    const isSelected = formMapHari.includes(day);
                    return (
                      <button
                        type="button"
                        key={day}
                        onClick={() => {
                          if (isSelected) {
                            setFormMapHari(prev => prev.filter(d => d !== day));
                          } else {
                            setFormMapHari(prev => [...prev, day]);
                          }
                        }}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-600 text-white shadow-2xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Jam Mulai Praktik
                  </label>
                  <input
                    type="time"
                    value={formMapJamMulai}
                    onChange={e => setFormMapJamMulai(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Jam Selesai Praktik
                  </label>
                  <input
                    type="time"
                    value={formMapJamSelesai}
                    onChange={e => setFormMapJamSelesai(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Catatan Penugasan
                </label>
                <input
                  type="text"
                  value={formMapCatatan}
                  onChange={e => setFormMapCatatan(e.target.value)}
                  placeholder="Contoh: Konsultasi sub-spesialis terpadu"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalMappingOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-xs"
                >
                  {editingMapping ? 'Simpan Penugasan' : 'Tetapkan Penempatan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
