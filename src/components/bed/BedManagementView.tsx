import React, { useState, useMemo } from 'react';
import {
  Bed as BedIcon, CheckCircle2, AlertCircle, Wrench, Sparkles, User,
  FileText, Activity, Clock, ShieldCheck, ArrowRight, X, Filter,
  Building2, DoorOpen, Plus, RefreshCw, Stethoscope, Check, AlertTriangle,
  ChevronRight, LogOut, Search, Info
} from 'lucide-react';
import Swal from 'sweetalert2';
import { useApp } from '../../context/AppContext';
import { Bed, Patient, Registration } from '../../types';

interface BedManagementViewProps {
  onSelectBed?: (bed: Bed) => void;
  selectedBedId?: string;
  isEmbedInForm?: boolean;
}

export const BedManagementView: React.FC<BedManagementViewProps> = ({
  onSelectBed,
  selectedBedId,
  isEmbedInForm = false
}) => {
  const { beds, updateBed, patients, registrations, updateRegistration, navigate } = useApp();

  // Selected Room for POPUP MODAL DENAH BED VIEW
  const [selectedRoomNameModal, setSelectedRoomNameModal] = useState<string | null>(null);

  // Filters
  const [filterFloor, setFilterFloor] = useState<string>('all');
  const [filterClass, setFilterClass] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals
  const [patientDetailModal, setPatientDetailModal] = useState<{
    bed: Bed;
    patient: Patient | null;
    registration: Registration | null;
  } | null>(null);

  const [maintenanceModal, setMaintenanceModal] = useState<Bed | null>(null);
  const [maintenanceReasonInput, setMaintenanceReasonInput] = useState('');

  // Group beds by Room
  const roomGroups = useMemo(() => {
    const map = new Map<string, Bed[]>();
    beds.forEach(bed => {
      const roomKey = bed.room;
      if (!map.has(roomKey)) {
        map.set(roomKey, []);
      }
      map.get(roomKey)!.push(bed);
    });

    const list = Array.from(map.entries()).map(([roomName, roomBeds]) => {
      const total = roomBeds.length;
      const occupied = roomBeds.filter(b => b.status === 'Occupied').length;
      const available = roomBeds.filter(b => b.status === 'Available').length;
      const maintenance = roomBeds.filter(b => b.status === 'Maintenance' || b.status === 'Cleaning').length;
      const floor = roomBeds[0]?.floor || '1';
      const bedClass = roomBeds[0]?.class || 'Kelas 1';
      const occupancyRate = total > 0 ? Math.round((occupied / total) * 100) : 0;

      return {
        roomName,
        floor,
        bedClass,
        total,
        occupied,
        available,
        maintenance,
        occupancyRate,
        beds: roomBeds
      };
    });

    return list;
  }, [beds]);

  // Overall Statistics for top bar
  const totalStats = useMemo(() => {
    const total = beds.length;
    const occupied = beds.filter(b => b.status === 'Occupied').length;
    const available = beds.filter(b => b.status === 'Available').length;
    const maintenance = beds.filter(b => b.status === 'Maintenance' || b.status === 'Cleaning').length;
    const rate = total > 0 ? Math.round((occupied / total) * 100) : 0;
    return { total, occupied, available, maintenance, rate };
  }, [beds]);

  // Filtered Room Groups
  const filteredRooms = useMemo(() => {
    return roomGroups.filter(room => {
      if (filterFloor !== 'all' && room.floor !== filterFloor) return false;
      if (filterClass !== 'all' && room.bedClass !== filterClass) return false;
      if (filterStatus === 'available' && room.available === 0) return false;
      if (filterStatus === 'full' && room.available > 0) return false;
      if (filterStatus === 'maintenance' && room.maintenance === 0) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchRoom = room.roomName.toLowerCase().includes(query);
        const matchBed = room.beds.some(b => (b.bedNumber || b.id).toLowerCase().includes(query));
        const matchPatient = room.beds.some(b => {
          if (!b.patientId) return false;
          const p = patients.find(pt => pt.id === b.patientId || pt.noRM === b.patientId);
          return p ? p.name.toLowerCase().includes(query) || p.noRM.includes(query) : false;
        });
        if (!matchRoom && !matchBed && !matchPatient) return false;
      }
      return true;
    });
  }, [roomGroups, filterFloor, filterClass, filterStatus, searchQuery, patients]);

  // Active Selected Room Data for Modal
  const currentModalRoom = useMemo(() => {
    if (!selectedRoomNameModal) return null;
    return roomGroups.find(r => r.roomName === selectedRoomNameModal) || null;
  }, [roomGroups, selectedRoomNameModal]);

  // Helper to find patient and registration for an occupied bed
  const getBedPatientInfo = (bed: Bed) => {
    if (!bed.patientId) return { patient: null, registration: null };
    const patient = patients.find(p => p.id === bed.patientId || p.noRM === bed.patientId) || null;
    const registration = registrations.find(r => 
      (r.patientId === bed.patientId || (patient && r.patientId === patient.id)) &&
      r.type === 'Rawat Inap' &&
      r.status === 'Dirawat'
    ) || registrations.find(r => r.patientId === bed.patientId) || null;

    return { patient, registration };
  };

  // Handler: Click Bed
  const handleBedClick = (bed: Bed) => {
    // 1. If Bed is Green (Available / Tersedia)
    if (bed.status === 'Available') {
      if (onSelectBed) {
        onSelectBed(bed);
        setSelectedRoomNameModal(null); // Close denah modal after selection
        Swal.fire({
          icon: 'success',
          title: 'Tempat Tidur Dipilih',
          text: `${bed.room} - ${bed.bedNumber || bed.id} (${bed.class}) siap digunakan untuk pendaftaran pasien.`,
          timer: 1500,
          showConfirmButton: false
        });
      } else {
        // Open Quick Assign or Prompt
        Swal.fire({
          title: `Tempat Tidur Tersedia (Siap Huni)`,
          html: `
            <div class="text-left text-xs space-y-2 text-slate-700">
              <div class="p-3 bg-emerald-50 border border-emerald-300 rounded-xl space-y-1">
                <p><strong>Ruangan:</strong> ${bed.room}</p>
                <p><strong>Nomor Bed:</strong> ${bed.bedNumber || bed.id} (${bed.class})</p>
                <p><strong>Lantai:</strong> Lantai ${bed.floor}</p>
                <p><strong>Status:</strong> <span class="text-emerald-700 font-bold">Siap Huni & Steril</span></p>
              </div>
              <p class="text-slate-500">Pilih tindakan untuk tempat tidur ini:</p>
            </div>
          `,
          icon: 'info',
          showCancelButton: true,
          showDenyButton: true,
          confirmButtonText: 'Daftarkan Pasien Baru',
          confirmButtonColor: '#2563eb',
          denyButtonText: 'Tandai Sterilisasi/Pemeliharaan',
          denyButtonColor: '#e11d48',
          cancelButtonText: 'Tutup'
        }).then((result) => {
          if (result.isConfirmed) {
            setSelectedRoomNameModal(null);
            navigate('pendaftaran', { 
              regType: 'Rawat Inap', 
              room: bed.room,
              bedId: bed.id,
              kelas: bed.class 
            });
          } else if (result.isDenied) {
            setMaintenanceModal(bed);
            setMaintenanceReasonInput('Sterilisasi & disinfeksi rutin kamar');
          }
        });
      }
    } 
    // 2. If Bed is White (Occupied / Terisi Pasien)
    else if (bed.status === 'Occupied') {
      const { patient, registration } = getBedPatientInfo(bed);
      setPatientDetailModal({ bed, patient, registration });
    } 
    // 3. If Bed is Red (Maintenance / Kosong Pemeliharaan/Sterilisasi)
    else {
      Swal.fire({
        title: 'Bed Dalam Pemeliharaan / Sterilisasi',
        html: `
          <div class="text-left text-xs space-y-2 text-slate-700">
            <div class="p-3 bg-rose-50 border border-rose-300 rounded-xl space-y-1.5">
              <p><strong>Ruangan:</strong> ${bed.room}</p>
              <p><strong>Nomor Bed:</strong> ${bed.bedNumber || bed.id} (${bed.class})</p>
              <p><strong>Status:</strong> <span class="text-rose-700 font-black uppercase">Kosong (Belum Siap Huni)</span></p>
              <p><strong>Keterangan:</strong> ${bed.maintenanceReason || bed.note || 'Sedang proses perbaikan/sterilisasi fasilitas'}</p>
            </div>
            <p class="text-slate-500 text-[11px]">Apakah pemeliharaan atau sterilisasi tempat tidur ini sudah selesai dan siap huni kembali?</p>
          </div>
        `,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: '✓ Set Siap Huni (Warna Hijau)',
        confirmButtonColor: '#059669',
        cancelButtonText: 'Tutup'
      }).then((result) => {
        if (result.isConfirmed) {
          updateBed(bed.id, {
            status: 'Available',
            maintenanceReason: undefined,
            note: undefined
          });
          Swal.fire({
            icon: 'success',
            title: 'Bed Siap Huni',
            text: `Status bed ${bed.bedNumber || bed.id} kini diubah menjadi TERSEDIA (HIJAU).`,
            timer: 1600,
            showConfirmButton: false
          });
        }
      });
    }
  };

  // Handler: Submit Maintenance
  const handleConfirmMaintenance = () => {
    if (!maintenanceModal) return;
    updateBed(maintenanceModal.id, {
      status: 'Maintenance',
      maintenanceReason: maintenanceReasonInput || 'Sedang pembersihan dan sterilisasi ruangan',
      patientId: null
    });
    setMaintenanceModal(null);
    Swal.fire({
      icon: 'info',
      title: 'Status Diubah ke Pemeliharaan',
      text: `Bed ${maintenanceModal.bedNumber || maintenanceModal.id} ditandai Kosong Pemeliharaan/Sterilisasi (Warna Merah).`,
      timer: 1600,
      showConfirmButton: false
    });
  };

  // Handler: Discharge Patient from Bed
  const handleDischargePatient = () => {
    if (!patientDetailModal) return;
    const { bed, patient, registration } = patientDetailModal;

    Swal.fire({
      title: 'Konfirmasi Pasien Pulang / Discharge Bed',
      text: `Apakah pasien ${patient?.name || 'ini'} sudah diizinkan pulang dan tempat tidur siap dikosongkan untuk sterilisasi?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Ya, Pulangkan & Sterilisasi Bed',
      confirmButtonColor: '#e11d48',
      cancelButtonText: 'Batal'
    }).then((res) => {
      if (res.isConfirmed) {
        if (registration) {
          updateRegistration(registration.id, { status: 'Selesai' });
        }
        updateBed(bed.id, {
          status: 'Maintenance',
          patientId: null,
          maintenanceReason: 'Sterilisasi kamar pasca kepulangan pasien'
        });
        setPatientDetailModal(null);
        Swal.fire({
          icon: 'success',
          title: 'Pasien Berhasil Dipulangkan',
          text: `Tempat tidur ${bed.bedNumber || bed.id} kini berstatus Kosong Pemeliharaan/Sterilisasi (Merah) untuk disiapkan bagi pasien berikutnya.`,
          timer: 2000,
          showConfirmButton: false
        });
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* HEADER SECTION & REAL-TIME SUMMARY STATS */}
      {!isEmbedInForm && (
        <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shrink-0">
                <BedIcon className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <span>Bed Management (Manajemen Tempat Tidur)</span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-100 text-blue-800 uppercase tracking-wider">
                    Rawat Inap SIMRS
                  </span>
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  Monitoring ketersediaan bed secara real-time. Klik kartu ruangan untuk membuka pop-up denah visual tempat tidur.
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => {
                  Swal.fire({
                    icon: 'success',
                    title: 'Data Tersinkronisasi',
                    text: 'Data keterisian tempat tidur rumah sakit terupdate secara real-time.',
                    timer: 1000,
                    showConfirmButton: false
                  });
                }}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh Data</span>
              </button>
            </div>
          </div>

          {/* 4 SUMMARY STAT CARDS */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
            {/* Total Bed */}
            <div className="bg-gradient-to-br from-slate-50 to-slate-100/70 border border-slate-200/90 rounded-2xl p-4 shadow-2xs space-y-1">
              <div className="flex items-center justify-between text-slate-600 text-xs font-bold">
                <span>Total Kapasitas Bed</span>
                <Building2 className="w-4 h-4 text-slate-500" />
              </div>
              <div className="text-2xl font-black text-slate-900 font-mono">{totalStats.total}</div>
              <div className="text-[10px] text-slate-500 font-medium">Seluruh bangsal & ruang rawat</div>
            </div>

            {/* Bed Terisi (Putih) */}
            <div className="bg-gradient-to-br from-blue-50/70 to-indigo-50/70 border border-blue-200 rounded-2xl p-4 shadow-2xs space-y-1">
              <div className="flex items-center justify-between text-blue-900 text-xs font-bold">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-white border-2 border-slate-400 inline-block shadow-2xs"></span>
                  <span>Bed Terisi (Putih)</span>
                </span>
                <User className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-2xl font-black text-blue-950 font-mono">{totalStats.occupied}</div>
              <div className="text-[10px] text-blue-700 font-medium">Sedang dirawat ({totalStats.rate}% BOR)</div>
            </div>

            {/* Bed Kosong/Tersedia (Hijau) */}
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50/70 border border-emerald-200 rounded-2xl p-4 shadow-2xs space-y-1">
              <div className="flex items-center justify-between text-emerald-900 text-xs font-bold">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block shadow-2xs"></span>
                  <span>Bed Kosong (Hijau)</span>
                </span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-black text-emerald-950 font-mono">{totalStats.available}</div>
              <div className="text-[10px] text-emerald-700 font-medium">Siap huni / dapat dipilih</div>
            </div>

            {/* Bed Pemeliharaan/Sterilisasi (Merah) */}
            <div className="bg-gradient-to-br from-rose-50 to-pink-50/70 border border-rose-200 rounded-2xl p-4 shadow-2xs space-y-1">
              <div className="flex items-center justify-between text-rose-900 text-xs font-bold">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block shadow-2xs"></span>
                  <span>Pemeliharaan (Merah)</span>
                </span>
                <Wrench className="w-4 h-4 text-rose-600" />
              </div>
              <div className="text-2xl font-black text-rose-950 font-mono">{totalStats.maintenance}</div>
              <div className="text-[10px] text-rose-700 font-medium">Sterilisasi / belum siap huni</div>
            </div>
          </div>
        </div>
      )}

      {/* FILTER & SEARCH TOOLBAR */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap flex-1">
          {/* Search */}
          <div className="relative min-w-[220px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Cari kamar, bed, nama pasien..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Filter Lantai */}
          <select
            value={filterFloor}
            onChange={e => setFilterFloor(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 cursor-pointer"
          >
            <option value="all">Semua Lantai</option>
            <option value="2">Lantai 2</option>
            <option value="3">Lantai 3</option>
            <option value="4">Lantai 4</option>
            <option value="5">Lantai 5</option>
          </select>

          {/* Filter Kelas */}
          <select
            value={filterClass}
            onChange={e => setFilterClass(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 cursor-pointer"
          >
            <option value="all">Semua Kelas Perawatan</option>
            <option value="VVIP">VVIP</option>
            <option value="VIP">VIP</option>
            <option value="Kelas 1">Kelas 1</option>
            <option value="Kelas 2">Kelas 2</option>
            <option value="Kelas 3">Kelas 3</option>
            <option value="ICU">ICU</option>
          </select>

          {/* Filter Status */}
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 cursor-pointer"
          >
            <option value="all">Semua Status Keterisian</option>
            <option value="available">Ada Bed Kosong (Hijau)</option>
            <option value="full">Kamar Penuh</option>
            <option value="maintenance">Ada Pemeliharaan (Merah)</option>
          </select>
        </div>

        {/* Color Legend Header */}
        <div className="flex items-center gap-2.5 text-[11px] font-bold shrink-0 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
          <span className="text-slate-500 font-semibold text-[10px] uppercase">Indikator:</span>
          <span className="flex items-center gap-1 text-emerald-800">
            <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-xs"></span>
            <span>Hijau: Tersedia</span>
          </span>
          <span className="flex items-center gap-1 text-slate-800">
            <span className="w-3 h-3 rounded-full bg-white border border-slate-400 shadow-xs"></span>
            <span>Putih: Terisi</span>
          </span>
          <span className="flex items-center gap-1 text-rose-800">
            <span className="w-3 h-3 rounded-full bg-rose-500 shadow-xs"></span>
            <span>Merah: Pemeliharaan</span>
          </span>
        </div>
      </div>

      {/* DASHBOARD KARTU RUANGAN REAL-TIME (KLIK KARTU UNTUK MEMBUKA POP-UP DENAH BED) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <DoorOpen className="w-4 h-4 text-indigo-600" />
            <span>Daftar Ruangan Rawat Inap (Klik Kamar / "Lihat Denah Bed" untuk Membuka Pop-up)</span>
          </h3>
          <span className="text-xs font-bold text-slate-500">
            {filteredRooms.length} Ruangan Terdaftar
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredRooms.map(room => {
            return (
              <div
                key={room.roomName}
                onClick={() => setSelectedRoomNameModal(room.roomName)}
                className="bg-white rounded-2xl border-2 border-slate-200 hover:border-indigo-500 p-4 transition-all cursor-pointer relative shadow-xs hover:shadow-md hover:-translate-y-0.5 group flex flex-col justify-between"
              >
                {/* Header Kartu Ruangan */}
                <div>
                  <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2.5">
                    <div>
                      <div className="font-black text-slate-900 text-sm leading-tight group-hover:text-indigo-600 transition-colors">
                        {room.roomName}
                      </div>
                      <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5 mt-0.5">
                        <span>Lantai {room.floor}</span>
                        <span>&bull;</span>
                        <span className="font-semibold text-slate-700">{room.bedClass}</span>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase shrink-0 ${
                      room.available > 0
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-rose-100 text-rose-800 border border-rose-300'
                    }`}>
                      {room.available > 0 ? `${room.available} Kosong` : 'Penuh'}
                    </span>
                  </div>

                  {/* 3 Indikator Angka Wajib Secara Real-Time */}
                  <div className="grid grid-cols-3 gap-2 py-3 text-center">
                    {/* Total Kapasitas Bed */}
                    <div className="bg-slate-50 p-2 rounded-xl border border-slate-200/80">
                      <span className="text-[9px] uppercase font-bold text-slate-500 block leading-tight">Total Kapasitas</span>
                      <span className="text-base font-black text-slate-800 font-mono mt-0.5 block">{room.total}</span>
                      <span className="text-[9px] text-slate-400">Bed</span>
                    </div>

                    {/* Jumlah Bed Terisi (Putih) */}
                    <div className="bg-blue-50/70 p-2 rounded-xl border border-blue-200/80">
                      <span className="text-[9px] uppercase font-bold text-blue-900 block leading-tight">Bed Terisi</span>
                      <span className="text-base font-black text-blue-900 font-mono mt-0.5 block">{room.occupied}</span>
                      <span className="text-[9px] text-blue-600 font-medium">Pasien</span>
                    </div>

                    {/* Jumlah Bed Kosong / Tersedia (Hijau) */}
                    <div className="bg-emerald-50/80 p-2 rounded-xl border border-emerald-200/80">
                      <span className="text-[9px] uppercase font-bold text-emerald-900 block leading-tight">Bed Kosong</span>
                      <span className="text-base font-black text-emerald-800 font-mono mt-0.5 block">{room.available}</span>
                      <span className="text-[9px] text-emerald-600 font-medium">Tersedia</span>
                    </div>
                  </div>

                  {/* Occupancy Progress Bar */}
                  <div className="space-y-1 pt-1 border-t border-slate-100">
                    <div className="flex items-center justify-between text-[10px] text-slate-500 font-semibold">
                      <span>Tingkat Keterisian:</span>
                      <span className="font-mono text-slate-700">{room.occupancyRate}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          room.occupancyRate >= 90 ? 'bg-rose-500' :
                          room.occupancyRate >= 70 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${room.occupancyRate}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Footer Info / Interaktif Call to Action */}
                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold">
                  <span className="text-indigo-600 flex items-center gap-1 group-hover:underline">
                    <span>Lihat Denah Bed</span>
                    <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  </span>
                  {room.maintenance > 0 && (
                    <span className="text-[10px] text-rose-600 font-semibold flex items-center gap-1">
                      <Wrench className="w-3 h-3" />
                      <span>{room.maintenance} Pemeliharaan</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* POP-UP MODAL: DENAH VISUAL & TATA LETAK BED RUANGAN (MUNCUL KETIKA KARTU KAMAR DI-KLIK) */}
      {currentModalRoom && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 shadow-2xl p-5 sm:p-6 space-y-4">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-sm shrink-0 shadow-xs">
                  <DoorOpen className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-[10px] font-black uppercase text-indigo-700 tracking-wider">
                    Denah Visual & Tata Letak Bed Ruangan
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2 flex-wrap">
                    <span>{currentModalRoom.roomName}</span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800">
                      Lantai {currentModalRoom.floor} &bull; {currentModalRoom.bedClass}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Kapasitas: <strong>{currentModalRoom.total} Bed</strong> &bull; <strong className="text-blue-700">{currentModalRoom.occupied} Terisi</strong> &bull; <strong className="text-emerald-700">{currentModalRoom.available} Kosong/Tersedia</strong>
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedRoomNameModal(null)}
                className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center cursor-pointer transition-colors shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Petunjuk Interaksi & Keterangan Warna */}
            <div className="p-3 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 border border-blue-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
              <div className="flex items-center gap-2 text-slate-700">
                <Info className="w-4 h-4 text-blue-600 shrink-0" />
                <span>
                  <strong>Petunjuk:</strong> Klik bed <strong>Hijau</strong> untuk memilih/mendaftarkan &bull; Klik bed <strong>Putih</strong> untuk profil pasien &bull; Klik bed <strong>Merah</strong> untuk menyelesaikan pemeliharaan.
                </span>
              </div>

              {/* Legend Badges */}
              <div className="flex items-center gap-2 text-[11px] font-bold shrink-0">
                <span className="flex items-center gap-1 text-emerald-800 bg-white/80 px-2 py-0.5 rounded-lg border border-emerald-200">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  <span>Hijau: Tersedia</span>
                </span>
                <span className="flex items-center gap-1 text-slate-800 bg-white/80 px-2 py-0.5 rounded-lg border border-slate-200">
                  <span className="w-2.5 h-2.5 rounded-full bg-white border border-slate-400"></span>
                  <span>Putih: Terisi</span>
                </span>
                <span className="flex items-center gap-1 text-rose-800 bg-white/80 px-2 py-0.5 rounded-lg border border-rose-200">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                  <span>Merah: Pemeliharaan</span>
                </span>
              </div>
            </div>

            {/* GRID DENAH BED VISUAL SESUAI RUANGAN TERPILIH */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 pt-1">
              {currentModalRoom.beds.map(bed => {
                const isAvailable = bed.status === 'Available'; // Hijau
                const isOccupied = bed.status === 'Occupied';   // Putih
                const isMaintenance = bed.status === 'Maintenance' || bed.status === 'Cleaning'; // Merah
                const isSelected = selectedBedId === bed.id;

                const { patient } = getBedPatientInfo(bed);

                return (
                  <div
                    key={bed.id}
                    onClick={() => handleBedClick(bed)}
                    title={
                      isAvailable
                        ? `Bed ${bed.bedNumber || bed.id}: Tersedia / Siap Huni (Klik untuk memilih/mendaftarkan)`
                        : isOccupied
                        ? `Bed ${bed.bedNumber || bed.id}: Terisi (${patient?.name || 'Pasien'}) - Klik untuk profil`
                        : `Bed ${bed.bedNumber || bed.id}: Dalam Pemeliharaan / Sterilisasi`
                    }
                    className={`relative p-3.5 rounded-2xl border-2 transition-all cursor-pointer select-none flex flex-col justify-between min-h-[145px] shadow-xs hover:shadow-md transform active:scale-95 ${
                      // WARNA HIJAU: Status Bed Tersedia (siap huni / siap dipilih)
                      isAvailable
                        ? isSelected
                          ? 'bg-emerald-500 border-emerald-600 text-white ring-4 ring-emerald-200 shadow-md'
                          : 'bg-emerald-500 hover:bg-emerald-600 border-emerald-600 text-white'
                      // WARNA PUTIH: Status Bed Terisi (sedang digunakan oleh pasien)
                      : isOccupied
                        ? 'bg-white hover:bg-slate-50 border-slate-300 text-slate-800 ring-1 ring-slate-200 shadow-xs'
                      // WARNA MERAH: Status Bed Kosong (rusak, pemeliharaan/maintenance, atau sedang dibersihkan/sterilisasi)
                        : 'bg-rose-500 hover:bg-rose-600 border-rose-600 text-white'
                    }`}
                  >
                    {/* Header Bed Card */}
                    <div>
                      <div className="flex items-center justify-between gap-1">
                        <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                          isAvailable ? 'bg-emerald-600 text-white' :
                          isOccupied ? 'bg-slate-100 text-slate-700 border border-slate-200' :
                          'bg-rose-600 text-white'
                        }`}>
                          {bed.bedNumber || bed.id}
                        </span>

                        {/* Status Badge Icon */}
                        {isAvailable && (
                          <span className="flex items-center gap-1 text-[10px] font-bold bg-emerald-600/80 px-1.5 py-0.5 rounded-md text-white">
                            <Check className="w-3 h-3 stroke-[3]" />
                            <span>Tersedia</span>
                          </span>
                        )}
                        {isOccupied && (
                          <span className="flex items-center gap-1 text-[10px] font-bold bg-blue-100 text-blue-900 border border-blue-200 px-1.5 py-0.5 rounded-md">
                            <User className="w-3 h-3" />
                            <span>Terisi</span>
                          </span>
                        )}
                        {isMaintenance && (
                          <span className="flex items-center gap-1 text-[10px] font-bold bg-rose-600/80 px-1.5 py-0.5 rounded-md text-white">
                            <Wrench className="w-3 h-3" />
                            <span>Steril/Rusak</span>
                          </span>
                        )}
                      </div>

                      {/* Bed Graphic Icon */}
                      <div className="flex items-center justify-center py-2.5">
                        <div className={`p-2.5 rounded-2xl ${
                          isAvailable ? 'bg-emerald-600/40 text-white' :
                          isOccupied ? 'bg-slate-100 text-slate-700' :
                          'bg-rose-600/40 text-white'
                        }`}>
                          <BedIcon className="w-7 h-7 stroke-[2]" />
                        </div>
                      </div>

                      {/* Room / Bed Identification */}
                      <div className="text-center space-y-0.5">
                        <div className={`text-xs font-black truncate ${isOccupied ? 'text-slate-900' : 'text-white'}`}>
                          {bed.roomName || bed.room.split('-')[0]}
                        </div>
                        <div className={`text-[10px] font-medium truncate ${isOccupied ? 'text-slate-500' : 'text-white/80'}`}>
                          {bed.class}
                        </div>
                      </div>
                    </div>

                    {/* Footer Status & Patient Info */}
                    <div className={`pt-2 mt-1 border-t text-[10px] ${
                      isAvailable ? 'border-emerald-400/50 text-emerald-100' :
                      isOccupied ? 'border-slate-100 text-slate-600' :
                      'border-rose-400/50 text-rose-100'
                    }`}>
                      {isAvailable && (
                        <div className="text-center font-bold text-white flex items-center justify-center gap-1">
                          <span>✓ Siap Huni</span>
                          {isSelected && <span className="underline">(Terpilih)</span>}
                        </div>
                      )}

                      {isOccupied && (
                        <div className="space-y-0.5">
                          <div className="font-bold text-slate-900 truncate">
                            {patient ? patient.name : 'Pasien Dirawat'}
                          </div>
                          <div className="text-[9px] text-slate-500 font-mono">
                            RM: {patient ? patient.noRM : '-'}
                          </div>
                        </div>
                      )}

                      {isMaintenance && (
                        <div className="text-center font-bold text-white truncate" title={bed.maintenanceReason}>
                          {bed.maintenanceReason || 'Sterilisasi Ruang'}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Pilih bed berwarna <strong>Hijau</strong> untuk pasien baru.
              </span>
              <button
                type="button"
                onClick={() => setSelectedRoomNameModal(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer transition-colors"
              >
                Tutup Denah Ruangan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* POP-UP MODAL: INFORMASI SINGKAT PASIEN DIRAWAT (SAAT BED PUTIH DI-KLIK) */}
      {patientDetailModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden space-y-4 p-6">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-black text-slate-900 leading-tight">
                    Informasi Pasien Rawat Inap
                  </h4>
                  <p className="text-xs text-slate-500 font-medium">
                    {patientDetailModal.bed.room} &bull; {patientDetailModal.bed.bedNumber || patientDetailModal.bed.id}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPatientDetailModal(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Patient & Room Detail Content */}
            <div className="space-y-3.5 text-xs text-slate-700">
              {/* Patient Banner */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-blue-700 text-xs">
                    No. RM: {patientDetailModal.patient?.noRM || '-'}
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 border border-emerald-300">
                    Sedang Dirawat
                  </span>
                </div>
                <div className="text-base font-black text-slate-900">
                  {patientDetailModal.patient?.name || 'Pasien Anonim'}
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 pt-1 border-t border-slate-200">
                  <div>
                    <span className="text-slate-400 block text-[10px]">NIK Pasien:</span>
                    <span className="font-mono font-bold text-slate-800">{patientDetailModal.patient?.nik || '-'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Jenis Kelamin / Usia:</span>
                    <span className="font-bold text-slate-800">
                      {patientDetailModal.patient?.gender === 'L' ? 'Laki-laki' : 'Perempuan'}, {patientDetailModal.patient?.birthDate ? `${new Date().getFullYear() - new Date(patientDetailModal.patient.birthDate).getFullYear()} thn` : '-'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Clinical & Inpatient Info Grid */}
              <div className="grid grid-cols-2 gap-3 text-[11px]">
                <div className="bg-blue-50/70 p-3 rounded-xl border border-blue-200/80 space-y-1">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Dokter DPJP</span>
                  <span className="font-bold text-blue-950 flex items-center gap-1">
                    <Stethoscope className="w-3.5 h-3.5 text-blue-600" />
                    <span>{patientDetailModal.registration?.dpjp || 'dr. Spesialis Penyakit Dalam, Sp.PD'}</span>
                  </span>
                </div>

                <div className="bg-emerald-50/70 p-3 rounded-xl border border-emerald-200/80 space-y-1">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Penjamin / Asuransi</span>
                  <span className="font-bold text-emerald-950 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{patientDetailModal.registration?.paymentMethod || 'BPJS Kesehatan (JKN)'}</span>
                  </span>
                </div>

                <div className="bg-amber-50/70 p-3 rounded-xl border border-amber-200/80 space-y-1">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Kelas Rawat Inap</span>
                  <span className="font-bold text-amber-950">
                    {patientDetailModal.bed.class} (Lantai {patientDetailModal.bed.floor})
                  </span>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Tanggal Masuk Rawat</span>
                  <span className="font-bold text-slate-800 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>{patientDetailModal.bed.occupiedSince || patientDetailModal.registration?.date || 'Hari ini'}</span>
                  </span>
                </div>
              </div>

              {/* Diagnosis info if any */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Diagnosa Masuk Awal</span>
                <span className="font-semibold text-slate-800">
                  {patientDetailModal.registration?.complaint || 'Demam Febris H-3 dd DHF Grade I + Dispepsia Fungsional'}
                </span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2.5">
              <button
                type="button"
                onClick={handleDischargePatient}
                className="w-full sm:w-auto px-4 py-2.5 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-all"
              >
                <LogOut className="w-4 h-4" />
                <span>Pasien Pulang / Kosongkan Bed</span>
              </button>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => {
                    setPatientDetailModal(null);
                    setSelectedRoomNameModal(null);
                    navigate('rekammedis', { 
                      initialTab: 'rawatinap',
                      searchRM: patientDetailModal.patient?.noRM
                    });
                  }}
                  className="flex-1 sm:flex-none px-3.5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Buka RME Pasien</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPatientDetailModal(null)}
                  className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: INPUT REASON FOR MAINTENANCE (STERILISASI / PERBAIKAN) */}
      {maintenanceModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-xs">
                  <Wrench className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-black text-slate-900 text-sm">
                    Tandai Bed Kosong Pemeliharaan (Merah)
                  </h4>
                  <p className="text-[11px] text-slate-500 font-medium">
                    {maintenanceModal.room} - {maintenanceModal.bedNumber || maintenanceModal.id}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMaintenanceModal(null)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Keterangan / Alasan Pemeliharaan & Sterilisasi:</label>
                <textarea
                  rows={3}
                  value={maintenanceReasonInput}
                  onChange={e => setMaintenanceReasonInput(e.target.value)}
                  placeholder="Contoh: Sterilisasi kamar pasca discharge pasien, perbaikan tiang infus, pengecatan dinding..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-[11px] text-rose-800 space-y-1">
                <span className="font-bold block">Status akan diubah menjadi: KOSONG (WARNA MERAH)</span>
                <p className="text-slate-600">
                  Tempat tidur tidak akan dapat dipilih untuk pendaftaran pasien sampai petugas menandai bahwa sterilisasi/pemeliharaan telah selesai.
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setMaintenanceModal(null)}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmMaintenance}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Simpan Status Pemeliharaan</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
