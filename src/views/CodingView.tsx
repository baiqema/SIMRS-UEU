import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { ReadOnlyBanner } from '../components/ReadOnlyBanner';
import { IcdAutocomplete } from '../components/IcdAutocomplete';
import { ModalCekBpjs } from '../components/ModalCekBpjs';
import Swal from 'sweetalert2';
import {
  Barcode,
  Lock,
  CheckCircle2,
  Search,
  Tag,
  Stethoscope,
  Activity,
  FileText,
  Sparkles,
  Zap,
  BookOpen,
  Clock,
  Calendar,
  ArrowLeft,
  AlertCircle,
  RefreshCw,
  ShieldCheck,
  History,
  Eye,
  User,
  Check,
  ChevronRight,
  Hospital,
  UserCheck,
  Layers,
  FileSpreadsheet,
  Plus
} from 'lucide-react';
import { EXTENDED_ICD10, EXTENDED_ICD9CM } from '../data/icdDatabase';

export const CodingView: React.FC = () => {
  const {
    coding,
    medicalRecords,
    cppt,
    registrations,
    patients,
    user,
    params,
    saveEncounterCoding,
    lockCoding,
    getMR,
    getReg,
    getPatient,
    getUser,
    canEditPage,
    navigate
  } = useApp();

  const isEditable = canEditPage('coding');

  // Active view tab: 'workbench' (Lembar Kerja & Riwayat Kunjungan) vs 'rekap' (Semua Data Koding)
  const [activeTab, setActiveTab] = useState<'workbench' | 'rekap'>('workbench');
  const [showVclaimModal, setShowVclaimModal] = useState(false);

  // Search & Filter state for Patient Selector
  const [patientSearch, setPatientSearch] = useState('');

  // Selected Patient ID
  const [selectedPatientId, setSelectedPatientId] = useState<string>(() => {
    if (params?.patientId) return params.patientId;
    if (params?.regId) {
      const r = registrations.find(reg => reg.id === params.regId);
      if (r) return r.patientId;
    }
    // Default to first patient with registrations, or first patient
    const firstReg = registrations[0];
    return firstReg ? firstReg.patientId : (patients[0]?.id || 'P001');
  });

  // Selected Encounter / Visit ID (Encounter-Based Coding)
  const [selectedRegId, setSelectedRegId] = useState<string>('');

  // Active Form Coding State
  const [formIcd10List, setFormIcd10List] = useState<string[]>(['I10']);
  const [formIcd9List, setFormIcd9List] = useState<string[]>([]);
  const [formNote, setFormNote] = useState<string>('');
  const [formStatus, setFormStatus] = useState<'Draft' | 'Locked'>('Draft');

  // Table Rekap Search & Filter
  const [searchTable, setSearchTable] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Draft' | 'Locked'>('all');

  // All visits / encounters for the selected patient, sorted newest first
  const patientEncounters = useMemo(() => {
    return registrations
      .filter(r => r.patientId === selectedPatientId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [registrations, selectedPatientId]);

  // Today's system date (Active Session)
  const todayDateStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Determine which encounter is the "Active Session" (Today's encounter or the latest encounter)
  const activeSessionEncounter = useMemo(() => {
    if (patientEncounters.length === 0) return null;
    const todayEncounter = patientEncounters.find(r => r.date === todayDateStr);
    return todayEncounter || patientEncounters[0];
  }, [patientEncounters, todayDateStr]);

  // Sync selectedRegId when patient changes or encounters load
  useEffect(() => {
    if (params?.regId && patientEncounters.some(r => r.id === params.regId)) {
      setSelectedRegId(params.regId);
    } else if (activeSessionEncounter) {
      setSelectedRegId(activeSessionEncounter.id);
    } else if (patientEncounters.length > 0) {
      setSelectedRegId(patientEncounters[0].id);
    } else {
      setSelectedRegId('');
    }
  }, [selectedPatientId, activeSessionEncounter, patientEncounters, params?.regId]);

  // The currently selected encounter object
  const currentEncounter = useMemo(() => {
    return patientEncounters.find(r => r.id === selectedRegId) || activeSessionEncounter || null;
  }, [patientEncounters, selectedRegId, activeSessionEncounter]);

  // Is the currently viewed visit the Active Session?
  const isViewingActiveSession = useMemo(() => {
    if (!currentEncounter || !activeSessionEncounter) return true;
    return currentEncounter.id === activeSessionEncounter.id;
  }, [currentEncounter, activeSessionEncounter]);

  // The patient object
  const currentPatient = useMemo(() => {
    return patients.find(p => p.id === selectedPatientId) || null;
  }, [patients, selectedPatientId]);

  // Medical record for the currently selected encounter
  const currentMR = useMemo(() => {
    if (!currentEncounter) return null;
    return medicalRecords.find(m => m.regId === currentEncounter.id) || null;
  }, [medicalRecords, currentEncounter]);

  // CPPT / SOAP for the currently selected encounter
  const currentCPPT = useMemo(() => {
    if (!currentEncounter) return null;
    // Look up by regId first, or by mrId
    const cpptByReg = cppt.find(c => c.regId === currentEncounter.id);
    if (cpptByReg) return cpptByReg;
    if (currentMR) {
      return cppt.find(c => c.mrId === currentMR.id) || null;
    }
    return null;
  }, [cppt, currentEncounter, currentMR]);

  // Coding record tied to the currently selected encounter
  const currentEncounterCoding = useMemo(() => {
    if (!currentEncounter) return null;
    // Must strictly match regId
    const byReg = coding.find(c => c.regId === currentEncounter.id);
    if (byReg) return byReg;
    // Fallback if older coding has mrId matching currentMR
    if (currentMR) {
      return coding.find(c => c.mrId === currentMR.id) || null;
    }
    return null;
  }, [coding, currentEncounter, currentMR]);

  // When selectedRegId changes, load existing coding data into form state if active session
  useEffect(() => {
    if (currentEncounterCoding) {
      const rawIcd10 = Array.isArray(currentEncounterCoding.icd10)
        ? currentEncounterCoding.icd10
        : (currentEncounterCoding.icd10 ? [currentEncounterCoding.icd10] : ['I10']);
      const rawIcd9 = Array.isArray(currentEncounterCoding.icd9cm)
        ? currentEncounterCoding.icd9cm
        : (currentEncounterCoding.icd9cm ? [currentEncounterCoding.icd9cm] : []);

      setFormIcd10List(rawIcd10.length > 0 ? rawIcd10 : ['I10']);
      setFormIcd9List(rawIcd9);
      setFormNote(currentEncounterCoding.note || '');
      setFormStatus(currentEncounterCoding.status || 'Draft');
    } else {
      // If no coding yet for this encounter, initialize clean state
      setFormIcd10List(['I10']);
      setFormIcd9List([]);
      setFormNote('');
      setFormStatus('Draft');
    }
  }, [selectedRegId, currentEncounterCoding]);

  // Clinical text context for auto-detection (Assessment & Plan + Anamnesis)
  const soapContextText = useMemo(() => {
    const parts: string[] = [];
    if (currentCPPT) {
      parts.push(currentCPPT.assessment || '');
      parts.push(currentCPPT.plan || '');
      parts.push(currentCPPT.subjective || '');
      parts.push(currentCPPT.objective || '');
    }
    if (currentMR) {
      parts.push(currentMR.diagnosis || '');
      parts.push(currentMR.anamnesis || '');
    }
    return parts.join(' ');
  }, [currentCPPT, currentMR]);

  // Multi-ICD10 Handlers
  const handleAddIcd10 = (code: string) => {
    if (!formIcd10List.includes(code)) {
      setFormIcd10List(prev => [...prev, code]);
    }
  };

  const handleRemoveIcd10 = (code: string) => {
    if (formIcd10List.length <= 1) {
      Swal.fire({
        icon: 'info',
        title: 'Minimal 1 Kode ICD-10',
        text: 'Setiap berkas koding wajib memiliki setidaknya 1 Kode Diagnosis Utama (Primer).',
        confirmButtonColor: '#1e3a8a'
      });
      return;
    }
    setFormIcd10List(prev => prev.filter(c => c !== code));
  };

  // Multi-ICD9CM Handlers
  const handleAddIcd9 = (code: string) => {
    if (!formIcd9List.includes(code)) {
      setFormIcd9List(prev => [...prev, code]);
    }
  };

  const handleRemoveIcd9 = (code: string) => {
    setFormIcd9List(prev => prev.filter(c => c !== code));
  };

  // Auto-Detect Codes directly from Daily SOAP Assessment & Plan
  const handleAutoDetectFromSOAP = () => {
    if (!currentCPPT && !currentMR) {
      Swal.fire({
        icon: 'info',
        title: 'Data SOAP Belum Tersedia',
        text: 'Dokter belum mengisi CPPT/SOAP pada sesi kunjungan ini.',
        confirmButtonColor: '#1e3a8a'
      });
      return;
    }

    const textToAnalyze = soapContextText.toLowerCase();

    // Match ICD-10
    const matchedIcd10 = EXTENDED_ICD10.filter(item => {
      const codeMatch = textToAnalyze.includes(item.code.toLowerCase());
      const words = item.desc.toLowerCase().split(/[\s,/-]+/).filter(w => w.length > 3);
      const descMatch = words.some(w => textToAnalyze.includes(w));
      return codeMatch || descMatch;
    }).map(i => i.code).slice(0, 3);

    // Match ICD-9-CM
    const matchedIcd9 = EXTENDED_ICD9CM.filter(item => {
      const codeMatch = textToAnalyze.includes(item.code.toLowerCase());
      const words = item.desc.toLowerCase().split(/[\s,/-]+/).filter(w => w.length > 3);
      const descMatch = words.some(w => textToAnalyze.includes(w));
      return codeMatch || descMatch;
    }).map(i => i.code).slice(0, 2);

    if (matchedIcd10.length > 0) {
      setFormIcd10List(matchedIcd10);
    }
    if (matchedIcd9.length > 0) {
      setFormIcd9List(matchedIcd9);
    }

    Swal.fire({
      icon: 'success',
      title: 'Integrasi SOAP Berhasil',
      html: `
        <div class="text-left text-xs space-y-2">
          <p class="font-bold text-slate-700">Kode terdeteksi otomatis dari Asesmen & Plan SOAP DPJP:</p>
          <div class="bg-blue-50 p-2.5 rounded-lg border border-blue-200">
            <p class="font-bold text-blue-900">ICD-10 Terdeteksi (${matchedIcd10.length}):</p>
            <p class="font-mono text-slate-700">${matchedIcd10.join(', ') || 'Tidak ditemukan kecocokan spesifik'}</p>
          </div>
          <div class="bg-indigo-50 p-2.5 rounded-lg border border-indigo-200">
            <p class="font-bold text-indigo-900">ICD-9-CM Terdeteksi (${matchedIcd9.length}):</p>
            <p class="font-mono text-slate-700">${matchedIcd9.join(', ') || 'Tidak ada tindakan terdeteksi'}</p>
          </div>
        </div>
      `,
      confirmButtonColor: '#1e3a8a'
    });
  };

  /**
   * Output Simpan Data:
   * Tombol "Simpan Pengkodean" hanya memperbarui record data yang terhubung dengan Encounter ID
   * pada tanggal berjalan yang sedang dipilih, tanpa mengganggu integritas histori kunjungan lain.
   */
  const handleSaveCoding = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEditable) {
      Swal.fire({
        icon: 'warning',
        title: 'Akses Terbatas (Mode Lihat)',
        text: 'Anda berada dalam Mode Lihat (Read-Only). Silakan gunakan akun berwenang Koding & Casemix.',
        confirmButtonColor: '#1e3a8a'
      });
      return;
    }

    if (!currentEncounter) {
      Swal.fire({
        icon: 'warning',
        title: 'Kunjungan Belum Dipilih',
        text: 'Silakan pilih kunjungan/encounter yang ingin dikodekan.',
        confirmButtonColor: '#1e3a8a'
      });
      return;
    }

    if (formIcd10List.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Kode ICD-10 Kosong',
        text: 'Wajib mencantumkan minimal 1 Kode Diagnosis Utama (Primer).',
        confirmButtonColor: '#1e3a8a'
      });
      return;
    }

    // Persist specifically to this Encounter ID
    const saved = saveEncounterCoding({
      regId: currentEncounter.id,
      mrId: currentMR?.id || `MR-${currentEncounter.id}`,
      icd10: formIcd10List,
      icd9cm: formIcd9List,
      note: formNote,
      status: formStatus,
      date: currentEncounter.date
    });

    Swal.fire({
      icon: 'success',
      title: 'Pengkodean Berhasil Disimpan!',
      html: `
        <div class="text-left text-xs space-y-2">
          <p class="text-slate-700">Data pengkodean tersimpan aman dan terikat spesifik ke:</p>
          <div class="bg-slate-100 p-2.5 rounded-lg border border-slate-200 font-mono text-xs">
            <p><strong>Encounter ID:</strong> ${saved.regId || currentEncounter.id}</p>
            <p><strong>Tanggal Kunjungan:</strong> ${saved.date}</p>
            <p><strong>Kode Koding ID:</strong> ${saved.id}</p>
            <p><strong>Status:</strong> ${saved.status}</p>
            <p><strong>Diagnosis Primer:</strong> ${Array.isArray(saved.icd10) ? saved.icd10[0] : saved.icd10}</p>
          </div>
          <p class="text-emerald-700 font-semibold flex items-center gap-1">
            <span class="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
            Histori kunjungan pasien sebelumnya tetap utuh dan terlindungi dari penimpaan.
          </p>
        </div>
      `,
      confirmButtonColor: '#1e3a8a'
    });
  };

  // Lock coding action
  const handleLockRecord = (codingId: string) => {
    if (!isEditable) {
      Swal.fire({
        icon: 'warning',
        title: 'Akses Terbatas',
        text: 'Hanya petugas Coder berwenang yang dapat mengunci (lock) data pengkodean.',
        confirmButtonColor: '#1e3a8a'
      });
      return;
    }

    Swal.fire({
      title: 'Kunci (Lock) Pengkodean?',
      text: "Data pengkodean yang dikunci akan menjadi permanen dan siap diproses untuk Grouping INA-CBG's & Klaim BPJS.",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Ya, Kunci (Lock)',
      cancelButtonText: 'Batal'
    }).then(result => {
      if (result.isConfirmed) {
        lockCoding(codingId);
        setFormStatus('Locked');
        Swal.fire({
          icon: 'success',
          title: 'Pengkodean Dikunci (Locked)',
          text: 'Status pengkodean untuk kunjungan ini resmi terkunci.',
          timer: 1500,
          showConfirmButton: false
        });
      }
    });
  };

  // Patients filtered for patient selector dropdown
  const filteredPatients = useMemo(() => {
    const list = !patientSearch.trim()
      ? [...patients]
      : patients.filter(p => {
          const q = patientSearch.toLowerCase().trim();
          return (
            p.name.toLowerCase().includes(q) ||
            p.noRM.toLowerCase().includes(q) ||
            p.nik.toLowerCase().includes(q)
          );
        });
    return list.sort((a, b) => {
      const numA = parseInt(a.noRM.replace(/\D/g, '') || '0', 10);
      const numB = parseInt(b.noRM.replace(/\D/g, '') || '0', 10);
      return numA - numB;
    });
  }, [patients, patientSearch]);

  // Rekap Table Filtered List
  const filteredCodingRekap = useMemo(() => {
    return coding.filter(c => {
      if (statusFilter !== 'all' && c.status !== statusFilter) return false;
      if (searchTable.trim()) {
        const q = searchTable.toLowerCase().trim();
        const mr = getMR(c.mrId);
        const r = c.regId ? getReg(c.regId) : (mr ? getReg(mr.regId) : null);
        const p = r ? getPatient(r.patientId) : null;

        const matchId = c.id.toLowerCase().includes(q);
        const matchReg = (c.regId || '').toLowerCase().includes(q);
        const matchRm = (mr?.noRM || p?.noRM || '').toLowerCase().includes(q);
        const matchName = (p?.name || '').toLowerCase().includes(q);
        const matchIcd10 = (Array.isArray(c.icd10) ? c.icd10.join(' ') : c.icd10).toLowerCase().includes(q);
        const matchIcd9 = (Array.isArray(c.icd9cm) ? c.icd9cm.join(' ') : (c.icd9cm || '')).toLowerCase().includes(q);

        if (!matchId && !matchReg && !matchRm && !matchName && !matchIcd10 && !matchIcd9) {
          return false;
        }
      }
      return true;
    }).sort((a, b) => {
      const mrA = getMR(a.mrId);
      const rA = a.regId ? getReg(a.regId) : (mrA ? getReg(mrA.regId) : null);
      const pA = rA ? getPatient(rA.patientId) : null;
      const numA = parseInt((mrA?.noRM || pA?.noRM || '').replace(/\D/g, '') || '0', 10);

      const mrB = getMR(b.mrId);
      const rB = b.regId ? getReg(b.regId) : (mrB ? getReg(mrB.regId) : null);
      const pB = rB ? getPatient(rB.patientId) : null;
      const numB = parseInt((mrB?.noRM || pB?.noRM || '').replace(/\D/g, '') || '0', 10);

      return numA - numB;
    });
  }, [coding, statusFilter, searchTable, medicalRecords, registrations, patients]);

  // Formatter for dates
  const formatDateDisplay = (dateStr?: string) => {
    if (!dateStr) return '-';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div id="coding-view-root" className="space-y-6">
      {/* Read-Only Mode Banner if user has view-only permissions */}
      {!isEditable && (
        <ReadOnlyBanner moduleName="Modul Kodifikasi ICD-10 & ICD-9-CM (Mode Akses Terbatas)" />
      )}

      {/* Main Header */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-blue-900 text-white rounded-3xl p-6 shadow-md border border-blue-800/60 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-0.5 rounded-full bg-blue-800 text-blue-100 text-[10px] font-black uppercase tracking-wider border border-blue-600">
              Casemix & ICD-10 / ICD-9-CM Terintegrasi
            </span>
            <span className="text-xs text-cyan-300 font-mono flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              Isolasi Riwayat Per-Encounter ID (Anti-Overwrite)
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
            <Barcode className="w-6 h-6 text-cyan-400" />
            Modul Kodifikasi Klinis (ICD-10 & ICD-9-CM)
          </h1>
          <p className="text-xs text-blue-200 max-w-3xl leading-relaxed">
            Kodifikasi klinis diagnosis (ICD-10) dan prosedur medis (ICD-9-CM) terintegrasi RME.
          </p>
        </div>

        {/* Action Header Buttons & Mode Toggle */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setShowVclaimModal(true)}
            className="px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer transition-all"
            title="Cek Status Kartu & Kepesertaan BPJS (+ Cek BPJS)"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>+ Cek VClaim BPJS</span>
          </button>

          <button
            id="btn-kamus-kmk"
            onClick={() => navigate('metadata')}
            className="px-3.5 py-2.5 bg-blue-900/90 hover:bg-blue-800 text-cyan-200 text-xs font-bold rounded-xl border border-blue-700 shadow-xs flex items-center gap-1.5 cursor-pointer transition-all"
            title="Lihat Pedoman Kamus Metadata KMK 1423/2022"
          >
            <BookOpen className="w-4 h-4 text-cyan-300" />
            Kamus KMK 1423
          </button>

          {/* View Tab Switcher */}
          <div className="bg-slate-900/90 border border-blue-700/80 p-1 rounded-xl flex items-center gap-1 shadow-inner">
            <button
              id="tab-workbench"
              onClick={() => setActiveTab('workbench')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'workbench'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-blue-200 hover:text-white'
              }`}
            >
              <Stethoscope className="w-3.5 h-3.5" />
              Lembar Kerja & Riwayat
            </button>
            <button
              id="tab-rekap"
              onClick={() => setActiveTab('rekap')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'rekap'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-blue-200 hover:text-white'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              Rekap Koding RS
            </button>
          </div>
        </div>
      </div>

      {/* TAB 1: WORKBENCH (LEMBAR KERJA & RIWAYAT KUNJUNGAN) */}
      {activeTab === 'workbench' && (
        <div className="space-y-6">
          {/* Patient Quick Selector & Information Banner */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-blue-900" />
                <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
                  PILIH PASIEN & KUNJUNGAN YANG AKAN DIKODEKAN
                </span>
              </div>
              {/* Quick Search Patient */}
              <div className="flex items-center gap-2">
                <div className="relative w-full sm:w-72">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={patientSearch}
                    onChange={e => setPatientSearch(e.target.value)}
                    placeholder="Cari Pasien (Nama, No RM, NIK)..."
                    className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                </div>
                <select
                  id="select-patient"
                  value={selectedPatientId}
                  onChange={e => setSelectedPatientId(e.target.value)}
                  className="px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg text-xs font-bold text-blue-950 focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer"
                >
                  {filteredPatients.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.noRM} - {p.name} ({p.nik})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Active Patient Identity Card */}
            {currentPatient && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/80 text-xs">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Nama Pasien</span>
                  <span className="font-bold text-slate-900 text-sm">{currentPatient.name}</span>
                  <span className="text-[11px] text-slate-500 block">NIK: {currentPatient.nik}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Nomor Rekam Medis</span>
                  <span className="font-mono font-black text-blue-900 text-sm">{currentPatient.noRM}</span>
                  <span className="text-[11px] text-slate-500 block">{currentPatient.gender === 'L' ? 'Laki-laki' : 'Perempuan'}, {currentPatient.birthDate}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Penjamin / Asuransi</span>
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold inline-block text-[11px] mt-0.5">
                    {currentPatient.insuranceType}
                  </span>
                  <span className="text-[10px] text-slate-500 block font-mono mt-0.5">No: {currentPatient.insuranceNo}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total Kunjungan Pasien</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="px-2.5 py-0.5 bg-blue-900 text-white rounded-full font-bold text-[11px]">
                      {patientEncounters.length} Kunjungan
                    </span>
                    <span className="text-[10px] text-slate-500">Tercatat di SIMRS</span>
                  </div>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Status Sesi Saat Ini</span>
                  {isViewingActiveSession ? (
                    <span className="px-2 py-1 bg-emerald-50 text-emerald-700 border border-emerald-300 rounded-lg font-bold flex items-center gap-1 text-[11px] mt-0.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      Sesi Kunjungan Aktif
                    </span>
                  ) : (
                    <span className="px-2 py-1 bg-amber-50 text-amber-800 border border-amber-300 rounded-lg font-bold flex items-center gap-1 text-[11px] mt-0.5">
                      <History className="w-3 h-3 text-amber-600" />
                      Arsip Riwayat Lampau
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* TWO-COLUMN WORKBENCH: SIDEBAR RIWAYAT KUNJUNGAN & MAIN CODING WORKSPACE */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* LEFT COLUMN: PANEL RIWAYAT KUNJUNGAN PASIEN (HISTORY FILTER / SIDEBAR) */}
            <div className="lg:col-span-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4 text-blue-900" />
                  <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                    Riwayat Kunjungan Pasien
                  </h2>
                </div>
                <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                  {patientEncounters.length} Sesi
                </span>
              </div>

              <p className="text-[11px] text-slate-500 leading-relaxed">
                Pilih kunjungan di bawah untuk memeriksa riwayat SOAP dan pengkodean lampau dalam <strong>mode baca (read-only)</strong>, atau kembali ke kunjungan hari ini.
              </p>

              {/* Quick Return to Active Session Button (if viewing historical visit) */}
              {!isViewingActiveSession && activeSessionEncounter && (
                <button
                  id="btn-return-active-session"
                  onClick={() => setSelectedRegId(activeSessionEncounter.id)}
                  className="w-full py-2.5 px-3 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-600 hover:to-indigo-600 text-white text-xs font-bold rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all border border-blue-400 animate-pulse"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Kembali ke Kunjungan Hari Ini (Aktif)
                </button>
              )}

              {/* Encounters List */}
              <div className="space-y-2.5 max-h-[620px] overflow-y-auto pr-1">
                {patientEncounters.map((enc, idx) => {
                  const isSelected = enc.id === selectedRegId;
                  const isActiveSession = activeSessionEncounter ? enc.id === activeSessionEncounter.id : idx === 0;
                  
                  // Check coding status for this encounter
                  const encCoding = coding.find(c => c.regId === enc.id || (c.mrId && medicalRecords.find(m => m.regId === enc.id)?.id === c.mrId));
                  const isCoded = !!encCoding;
                  const codingStatus = encCoding?.status || 'Belum Dikode';

                  // DPJP Doctor
                  const dpjpDoctor = getUser(enc.dpjp);

                  return (
                    <div
                      key={enc.id}
                      id={`encounter-card-${enc.id}`}
                      onClick={() => setSelectedRegId(enc.id)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer relative ${
                        isSelected
                          ? 'bg-blue-50/90 border-blue-600 shadow-md ring-2 ring-blue-500/20'
                          : 'bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                      }`}
                    >
                      {/* Active Session Ribbon */}
                      {isActiveSession && (
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="px-2 py-0.5 bg-emerald-600 text-white text-[9px] font-black uppercase tracking-wider rounded-md flex items-center gap-1 shadow-xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                            Kunjungan Hari Ini (Active)
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {enc.date === todayDateStr ? 'Sesi Berjalan' : 'Sesi Terkini'}
                          </span>
                        </div>
                      )}

                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-blue-900 shrink-0" />
                            <span className="text-xs font-black text-slate-900">
                              {formatDateDisplay(enc.date)}
                            </span>
                          </div>
                          <div className="text-[11px] font-semibold text-slate-700 flex items-center gap-1">
                            <Hospital className="w-3 h-3 text-slate-400" />
                            {enc.poli || enc.type}
                          </div>
                          <div className="text-[10px] text-slate-500">
                            DPJP: {dpjpDoctor?.name || 'dr. DPJP'}
                          </div>
                        </div>

                        {/* Encounter ID Badge */}
                        <div className="text-right">
                          <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-700 font-mono text-[10px] font-bold rounded">
                            {enc.id}
                          </span>
                        </div>
                      </div>

                      {/* Coding Status Pill */}
                      <div className="mt-2.5 pt-2 border-t border-slate-200/70 flex items-center justify-between text-[10px]">
                        <span className="text-slate-500 font-medium">Status Koding:</span>
                        {codingStatus === 'Locked' && (
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded-md flex items-center gap-1">
                            <Lock className="w-2.5 h-2.5 text-emerald-700" /> Locked
                          </span>
                        )}
                        {codingStatus === 'Draft' && (
                          <span className="px-2 py-0.5 bg-amber-100 text-amber-800 font-bold rounded-md flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5 text-amber-700" /> Draft
                          </span>
                        )}
                        {codingStatus === 'Belum Dikode' && (
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-600 font-bold rounded-md">
                            Belum Dikode
                          </span>
                        )}
                      </div>

                      {isSelected && (
                        <div className="absolute top-1/2 -right-1 -translate-y-1/2 w-2 h-6 bg-blue-600 rounded-l"></div>
                      )}
                    </div>
                  );
                })}

                {patientEncounters.length === 0 && (
                  <div className="p-6 text-center text-slate-400 text-xs">
                    Belum ada riwayat kunjungan untuk pasien ini.
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT COLUMN: WORKBENCH CONTENT (DYNAMIC: ACTIVE FORM vs HISTORICAL READ-ONLY) */}
            <div className="lg:col-span-8 space-y-6">

              {/* READ-ONLY BANNER IF VIEWING HISTORICAL VISIT (Requirement 3) */}
              {!isViewingActiveSession && currentEncounter && (
                <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 text-white p-4 rounded-2xl shadow-md border border-amber-400 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-amber-700/60 rounded-xl shrink-0">
                      <History className="w-5 h-5 text-white" />
                    </div>
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-amber-800/80 text-amber-100 rounded text-[10px] font-black uppercase tracking-wider">
                          Mode Lihat Riwayat (Read-Only)
                        </span>
                        <span className="text-xs font-mono font-bold">Encounter: {currentEncounter.id}</span>
                      </div>
                      <h2 className="text-sm font-black">Arsip Kunjungan Lampau: {formatDateDisplay(currentEncounter.date)}</h2>
                      <p className="text-xs text-amber-100 max-w-xl">
                        Anda sedang meninjau arsip riwayat kunjungan lampau. Sesuai regulasi rekam medis, data pada kunjungan ini dikunci untuk melindungi integritas audit trail per-encounter.
                      </p>
                    </div>
                  </div>

                  {activeSessionEncounter && (
                    <button
                      id="btn-switch-to-active-from-banner"
                      onClick={() => setSelectedRegId(activeSessionEncounter.id)}
                      className="px-4 py-2 bg-white text-amber-900 hover:bg-amber-50 rounded-xl text-xs font-black shrink-0 shadow flex items-center gap-1.5 cursor-pointer transition-all"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      Kembali ke Kunjungan Aktif
                    </button>
                  )}
                </div>
              )}

              {/* 1. PANEL RINGKASAN MEDIS (SOAP HARIAN DOKTER) - REQUIREMENT 1 */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-blue-100 text-blue-900 rounded-xl">
                      <Stethoscope className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-sm font-black text-slate-900">
                          {isViewingActiveSession
                            ? 'Ringkasan Medis SOAP Harian (CPPT Dokter Sesi Ini)'
                            : `Ringkasan Medis SOAP Kunjungan Lampau (${formatDateDisplay(currentEncounter?.date)})`}
                        </h2>
                        {isViewingActiveSession && (
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-bold rounded-full border border-blue-300">
                            Auto-Sync CPPT
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500">
                        {isViewingActiveSession
                          ? 'Dokumentasi klinis SOAP DPJP untuk penetapan kode ICD-10 dan ICD-9-CM.'
                          : 'Dokumentasi klinis SOAP DPJP yang tercatat pada kunjungan lampau tersebut.'}
                      </p>
                    </div>
                  </div>

                  {/* Auto Detect Button (Only active when viewing active session) */}
                  {isViewingActiveSession && isEditable && (
                    <button
                      id="btn-auto-detect-soap"
                      type="button"
                      onClick={handleAutoDetectFromSOAP}
                      className="px-3.5 py-2 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-600 hover:to-indigo-600 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-2 transition-all cursor-pointer border border-blue-400"
                      title="Gunakan Asesmen & Plan SOAP untuk memilih kode ICD otomatis"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
                      Terapkan dari Asesmen SOAP
                    </button>
                  )}
                </div>

                {/* SOAP Detail Box */}
                {currentCPPT ? (
                  <div className="space-y-3">
                    {/* DPJP & Meta Header */}
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">DPJP: {currentCPPT.staffName || 'dr. DPJP'}</span>
                        <span className="text-slate-400">•</span>
                        <span>{currentCPPT.profession || 'Spesialis'}</span>
                        <span className="text-slate-400">•</span>
                        <span>Unit: {currentCPPT.unit || currentEncounter?.poli}</span>
                      </div>
                      <div className="flex items-center gap-2 font-mono text-[11px]">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{currentCPPT.date} {currentCPPT.time || '10:00'} WIB</span>
                        {currentCPPT.verified && (
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded text-[10px]">
                            Terverifikasi
                          </span>
                        )}
                      </div>
                    </div>

                    {/* SOAP 4-Quadrant Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      {/* S: Subjektif */}
                      <div className="bg-slate-50/90 p-3.5 rounded-xl border border-slate-200 space-y-1">
                        <div className="flex items-center gap-1.5 text-slate-800 font-bold text-xs">
                          <span className="w-5 h-5 rounded-md bg-blue-900 text-white text-[10px] font-black flex items-center justify-center">S</span>
                          Subjektif (Anamnesis Pasien)
                        </div>
                        <p className="text-xs text-slate-700 leading-relaxed pl-6">
                          {currentCPPT.subjective || '-'}
                        </p>
                      </div>

                      {/* O: Objektif */}
                      <div className="bg-slate-50/90 p-3.5 rounded-xl border border-slate-200 space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-slate-800 font-bold text-xs">
                            <span className="w-5 h-5 rounded-md bg-blue-900 text-white text-[10px] font-black flex items-center justify-center">O</span>
                            Objektif (Tanda Vital & Fisik)
                          </div>
                        </div>
                        <p className="text-xs text-slate-700 leading-relaxed pl-6">
                          {currentCPPT.objective || '-'}
                        </p>
                        {currentCPPT.vitalSigns && (
                          <div className="pl-6 pt-1 flex flex-wrap gap-2 text-[10px] font-mono text-slate-600">
                            {currentCPPT.vitalSigns.systolic && (
                              <span className="px-1.5 py-0.5 bg-white border rounded">
                                TD: {currentCPPT.vitalSigns.systolic}/{currentCPPT.vitalSigns.diastolic} mmHg
                              </span>
                            )}
                            {currentCPPT.vitalSigns.heartRate && (
                              <span className="px-1.5 py-0.5 bg-white border rounded">
                                HR: {currentCPPT.vitalSigns.heartRate} x/m
                              </span>
                            )}
                            {currentCPPT.vitalSigns.spo2 && (
                              <span className="px-1.5 py-0.5 bg-white border rounded">
                                SpO2: {currentCPPT.vitalSigns.spo2}%
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* A: Asesmen (ACUAN UTAMA PENGKODEAN DIAGNOSIS) */}
                      <div className="bg-blue-50/90 p-3.5 rounded-xl border-2 border-blue-400 space-y-1 shadow-xs">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-blue-950 font-black text-xs">
                            <span className="w-5 h-5 rounded-md bg-blue-800 text-white text-[10px] font-black flex items-center justify-center">A</span>
                            Asesmen / Diagnosis Kerja DPJP
                          </div>
                          <span className="text-[9px] font-black uppercase px-2 py-0.5 bg-blue-200 text-blue-900 rounded-md">
                            Acuan ICD-10
                          </span>
                        </div>
                        <p className="text-xs font-bold text-blue-950 leading-relaxed pl-6">
                          {currentCPPT.assessment || '-'}
                        </p>
                      </div>

                      {/* P: Plan (ACUAN TINDAKAN PROSEDUR) */}
                      <div className="bg-indigo-50/90 p-3.5 rounded-xl border-2 border-indigo-400 space-y-1 shadow-xs">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-indigo-950 font-black text-xs">
                            <span className="w-5 h-5 rounded-md bg-indigo-800 text-white text-[10px] font-black flex items-center justify-center">P</span>
                            Plan / Tindakan & Terapi DPJP
                          </div>
                          <span className="text-[9px] font-black uppercase px-2 py-0.5 bg-indigo-200 text-indigo-900 rounded-md">
                            ICD-9-CM
                          </span>
                        </div>
                        <p className="text-xs text-indigo-950 leading-relaxed pl-6">
                          {currentCPPT.plan || '-'}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Fallback if no CPPT entered yet */
                  <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800 space-y-2">
                    <div className="flex items-center gap-2 font-bold">
                      <AlertCircle className="w-4 h-4 text-amber-600" />
                      Dokter belum mencatat CPPT/SOAP pada sesi kunjungan ini.
                    </div>
                    {currentMR ? (
                      <div className="bg-white p-3 rounded-lg border border-amber-200 space-y-1 text-slate-700">
                        <p className="text-[11px] font-bold text-slate-900">Diagnosis Awal Rekam Medis (MR):</p>
                        <p className="font-semibold text-blue-900">{currentMR.diagnosis}</p>
                        <p className="text-[11px] text-slate-500">{currentMR.anamnesis}</p>
                      </div>
                    ) : (
                      <p className="text-[11px]">
                        Silakan minta dokter DPJP mengisi CPPT di Modul Rekam Medis / CPPT, atau lakukan pengkodean berdasarkan berkas fisik yang sah.
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* 2. FORM PENGKODEAN KLINIS ATAU ARSIP RIWAYAT (ICD-10 & ICD-9-CM) */}
              {isViewingActiveSession ? (
                /* ACTIVE SESSION: EDITABLE FORM */
                <form onSubmit={handleSaveCoding} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <Barcode className="w-5 h-5 text-blue-900" />
                      <div>
                        <h2 className="text-sm font-black text-slate-900">
                          Form Pengkodean Aktif (Encounter: {currentEncounter?.id})
                        </h2>
                        <p className="text-[11px] text-slate-500">
                          Transaksi pengkodean ini terikat pada Encounter ID di atas. Riwayat kunjungan lampau diproteksi secara permanen.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-600 font-bold">Status:</span>
                      <select
                        value={formStatus}
                        onChange={e => setFormStatus(e.target.value as 'Draft' | 'Locked')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border focus:outline-none ${
                          formStatus === 'Locked'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : 'bg-amber-50 text-amber-800 border-amber-300'
                        }`}
                      >
                        <option value="Draft">Draft (Dapat Diubah)</option>
                        <option value="Locked">Locked (Finalisasi)</option>
                      </select>
                    </div>
                  </div>

                  {/* SECTION: MULTI-ICD-10 (DIAGNOSIS UTAMA & SEKUNDER) */}
                  <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-black text-blue-950 flex items-center gap-1.5">
                        <Stethoscope className="w-4 h-4 text-blue-800" />
                        Kode Diagnosis ICD-10 (Diagnosis Primer & Sekunder) *
                      </label>
                      <span className="text-[10px] text-blue-900 font-bold bg-blue-200/80 px-2 py-0.5 rounded-md">
                        {formIcd10List.length} Kode Terpilih
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-600">
                      Kode pertama bertindak sebagai <strong>Diagnosis Primer (★)</strong>, kode berikutnya sebagai <strong>Diagnosis Sekunder / Komorbid</strong>. Ketik kode atau deskripsi penyakit:
                    </p>

                    <IcdAutocomplete
                      type="icd10"
                      selectedCodes={formIcd10List}
                      onAddCode={handleAddIcd10}
                      onRemoveCode={handleRemoveIcd10}
                      medicalRecordContextText={soapContextText}
                      placeholder="Ketik kode/kata kunci (cth: I10, E11, Hipertensi, Dislipidemia, Kanker, DBD)..."
                    />
                  </div>

                  {/* SECTION: MULTI-ICD-9-CM (PROSEDUR / TINDAKAN MEDIS) */}
                  <div className="bg-indigo-50/70 border border-indigo-200 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-black text-indigo-950 flex items-center gap-1.5">
                        <Activity className="w-4 h-4 text-indigo-800" />
                        Kode Prosedur / Tindakan Medis ICD-9-CM
                      </label>
                      <span className="text-[10px] text-indigo-900 font-bold bg-indigo-200/80 px-2 py-0.5 rounded-md">
                        {formIcd9List.length} Prosedur Terpilih
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-600">
                      Masukkan seluruh tindakan operatif, diagnostik (EKG, USG, Rontgen), terapi infus, atau tindakan medis lainnya yang dilakukan pada sesi ini:
                    </p>

                    <IcdAutocomplete
                      type="icd9"
                      selectedCodes={formIcd9List}
                      onAddCode={handleAddIcd9}
                      onRemoveCode={handleRemoveIcd9}
                      medicalRecordContextText={soapContextText}
                      placeholder="Ketik kode ICD-9-CM atau nama tindakan (cth: 89.13, EKG, 99.21, Injeksi, USG)..."
                    />
                  </div>

                  {/* SECTION: CATATAN CODER */}
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Catatan Khusus Perekam Medis (Coder Note) & Konfirmasi Klinis
                    </label>
                    <textarea
                      value={formNote}
                      onChange={e => setFormNote(e.target.value)}
                      rows={2}
                      placeholder="Catatan derajat keparahan, klarifikasi DPJP, komorbiditas penyerta INA-CBGs..."
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  {/* SUBMIT BUTTON SECTION (Requirement 4) */}
                  <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>
                        Penyimpanan hanya memperbarui record Encounter <strong>{currentEncounter?.id}</strong>. Histori kunjungan lain tidak akan terhapus.
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        id="btn-submit-coding"
                        type="submit"
                        disabled={!isEditable}
                        className="px-5 py-2.5 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-black shadow-md transition-all cursor-pointer flex items-center gap-2 border border-blue-700 disabled:opacity-50"
                      >
                        <CheckCircle2 className="w-4 h-4 text-cyan-300" />
                        Simpan Pengkodean (Encounter {currentEncounter?.id})
                      </button>
                    </div>
                  </div>
                </form>
              ) : (
                /* HISTORICAL VISIT: READ-ONLY DISPLAY (Requirement 3) */
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <History className="w-5 h-5 text-amber-600" />
                      <div>
                        <h2 className="text-sm font-black text-slate-900">
                          Data Pengkodean Tersimpan pada Kunjungan Ini
                        </h2>
                        <p className="text-[11px] text-slate-500">
                          Encounter ID: {currentEncounter?.id} • Tanggal Kunjungan: {formatDateDisplay(currentEncounter?.date)}
                        </p>
                      </div>
                    </div>

                    <span className="px-3 py-1 bg-amber-100 text-amber-900 border border-amber-300 rounded-full font-bold text-xs flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5 text-amber-800" />
                      Arsip Terkunci (Read-Only)
                    </span>
                  </div>

                  {currentEncounterCoding ? (
                    <div className="space-y-4">
                      {/* ICD-10 Display */}
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                        <span className="text-[11px] font-black uppercase text-blue-950 flex items-center gap-1">
                          <Stethoscope className="w-4 h-4 text-blue-800" />
                          Kode Diagnosis ICD-10 Tercatat pada Kunjungan Ini:
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {(Array.isArray(currentEncounterCoding.icd10) ? currentEncounterCoding.icd10 : [currentEncounterCoding.icd10]).map((code, idx) => {
                            const icdObj = EXTENDED_ICD10.find(i => i.code === code);
                            const isPrimary = idx === 0;
                            return (
                              <div
                                key={code + idx}
                                className={`p-2.5 rounded-lg border text-xs flex items-center gap-2 ${
                                  isPrimary
                                    ? 'bg-blue-900 text-white border-blue-800 font-bold'
                                    : 'bg-white text-slate-800 border-slate-300'
                                }`}
                              >
                                <span className={isPrimary ? 'text-cyan-300 font-mono font-black' : 'font-mono font-bold text-blue-900'}>
                                  {isPrimary ? '★ ' : ''}{code}
                                </span>
                                <span className="text-xs">
                                  {icdObj?.desc || (Array.isArray(currentEncounterCoding.icd10Desc) ? currentEncounterCoding.icd10Desc[idx] : currentEncounterCoding.icd10Desc) || code}
                                </span>
                                <span className={`text-[9px] uppercase px-1.5 py-0.5 rounded ${
                                  isPrimary ? 'bg-blue-800 text-cyan-200' : 'bg-slate-100 text-slate-600'
                                }`}>
                                  {isPrimary ? 'Primer' : 'Sekunder'}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* ICD-9-CM Display */}
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                        <span className="text-[11px] font-black uppercase text-indigo-950 flex items-center gap-1">
                          <Activity className="w-4 h-4 text-indigo-800" />
                          Kode Prosedur / Tindakan ICD-9-CM Tercatat:
                        </span>
                        {(Array.isArray(currentEncounterCoding.icd9cm) && currentEncounterCoding.icd9cm.length > 0) ? (
                          <div className="flex flex-wrap gap-2">
                            {currentEncounterCoding.icd9cm.map((code, idx) => {
                              const icd9Obj = EXTENDED_ICD9CM.find(i => i.code === code);
                              return (
                                <div
                                  key={code + idx}
                                  className="p-2.5 bg-white text-indigo-950 border border-indigo-200 rounded-lg text-xs flex items-center gap-2 font-medium"
                                >
                                  <span className="font-mono font-bold text-indigo-700">{code}</span>
                                  <span>{icd9Obj?.desc || code}</span>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <p className="text-xs text-slate-500 italic pl-1">- Tidak ada tindakan atau prosedur medis yang tercatat -</p>
                        )}
                      </div>

                      {/* Meta & Coder Note */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 block uppercase">Petugas Coder</span>
                          <span className="font-bold text-slate-800">{getUser(currentEncounterCoding.coderId)?.name || 'Petugas Coder'}</span>
                          <span className="text-[10px] text-slate-500 block">ID: {currentEncounterCoding.id} • Tanggal: {currentEncounterCoding.date}</span>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 block uppercase">Catatan Khusus Coder</span>
                          <span className="text-slate-700 italic">{currentEncounterCoding.note || 'Tidak ada catatan khusus.'}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300 space-y-2">
                      <p className="text-xs font-bold text-slate-600">
                        Belum ada data pengkodean tersimpan untuk kunjungan lampau ini.
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Riwayat kunjungan lampau hanya dapat dikodekan bila ada instruksi perbaikan berkas tertulis dari komite rekam medis.
                      </p>
                    </div>
                  )}

                  <div className="pt-3 border-t border-slate-100 flex justify-end">
                    {activeSessionEncounter && (
                      <button
                        onClick={() => setSelectedRegId(activeSessionEncounter.id)}
                        className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-all"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        Kembali ke Form Pengkodean Kunjungan Hari Ini
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: REKAP KODING SEMUA PASIEN (CASEMIX & HOSPITAL MONITORING) */}
      {activeTab === 'rekap' && (
        <div className="space-y-4">
          {/* Search & Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-96">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTable}
                onChange={e => setSearchTable(e.target.value)}
                placeholder="Cari ID Koding / Encounter / No RM / Nama / Kode ICD..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                {(['all', 'Draft', 'Locked'] as const).map(st => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      statusFilter === st
                        ? 'bg-blue-900 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {st === 'all' ? 'Semua Status' : st}
                  </button>
                ))}
              </div>
              <span className="text-xs text-slate-600 font-bold bg-slate-100 px-3 py-1.5 rounded-xl">
                Total: {filteredCodingRekap.length} Berkas
              </span>
            </div>
          </div>

          {/* Table Coding */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-900 border-b border-slate-800 text-white uppercase tracking-wider font-bold text-[11px]">
                    <th className="p-3.5">ID Koding</th>
                    <th className="p-3.5">Encounter ID</th>
                    <th className="p-3.5">No. RM Pasien</th>
                    <th className="p-3.5">Nama Pasien</th>
                    <th className="p-3.5">Kode ICD-10 (Primer & Sekunder)</th>
                    <th className="p-3.5">Kode ICD-9-CM (Prosedur)</th>
                    <th className="p-3.5">Petugas Coder</th>
                    <th className="p-3.5 text-center">Status</th>
                    <th className="p-3.5 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                  {filteredCodingRekap.map(c => {
                    const mr = getMR(c.mrId);
                    const r = c.regId ? getReg(c.regId) : (mr ? getReg(mr.regId) : null);
                    const p = r ? getPatient(r.patientId) : null;
                    const coder = getUser(c.coderId);

                    const icd10Array = Array.isArray(c.icd10) ? c.icd10 : [c.icd10];
                    const icd9Array = Array.isArray(c.icd9cm) ? c.icd9cm : (c.icd9cm ? [c.icd9cm] : []);

                    return (
                      <tr key={c.id} className="hover:bg-blue-50/60 transition-colors">
                        <td className="p-3.5 font-bold font-mono text-blue-900">{c.id}</td>
                        <td className="p-3.5 font-mono text-slate-700 font-bold">
                          {c.regId ? (
                            <span className="px-2 py-0.5 bg-slate-100 rounded text-[11px]">
                              {c.regId}
                            </span>
                          ) : '-'}
                        </td>
                        <td className="p-3.5 font-mono text-slate-800 font-bold">{p?.noRM || mr?.noRM || '-'}</td>
                        <td className="p-3.5 font-bold text-slate-900">{p?.name || '-'}</td>
                        <td className="p-3.5">
                          <div className="flex flex-wrap gap-1.5 max-w-sm">
                            {icd10Array.map((code, idx) => {
                              const icdObj = EXTENDED_ICD10.find(i => i.code === code);
                              const isPrimary = idx === 0;
                              return (
                                <span
                                  key={code + idx}
                                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold font-mono inline-flex items-center gap-1 border ${
                                    isPrimary
                                      ? 'bg-blue-900 text-blue-50 border-blue-800'
                                      : 'bg-slate-100 text-slate-800 border-slate-200'
                                  }`}
                                  title={icdObj?.desc || (Array.isArray(c.icd10Desc) ? c.icd10Desc[idx] : c.icd10Desc)}
                                >
                                  <span className={isPrimary ? 'text-cyan-300 font-black' : 'text-slate-600'}>
                                    {isPrimary ? '★ ' : ''}{code}
                                  </span>
                                  <span className="font-sans font-normal text-current opacity-90 text-[9px] truncate max-w-[120px]">
                                    {icdObj?.desc || (Array.isArray(c.icd10Desc) ? c.icd10Desc[idx] : c.icd10Desc)}
                                  </span>
                                </span>
                              );
                            })}
                          </div>
                        </td>
                        <td className="p-3.5">
                          {icd9Array.length > 0 ? (
                            <div className="flex flex-wrap gap-1.5 max-w-xs">
                              {icd9Array.map((code, idx) => {
                                const icd9Obj = EXTENDED_ICD9CM.find(i => i.code === code);
                                return (
                                  <span
                                    key={code + idx}
                                    className="px-2 py-0.5 rounded-md text-[10px] font-bold font-mono bg-indigo-900 text-indigo-50 border border-indigo-800 inline-flex items-center gap-1"
                                    title={icd9Obj?.desc || (Array.isArray(c.icd9cmDesc) ? c.icd9cmDesc[idx] : c.icd9cmDesc)}
                                  >
                                    <span className="text-indigo-200">{code}</span>
                                    <span className="font-sans font-normal text-indigo-100 opacity-90 text-[9px] truncate max-w-[100px]">
                                      {icd9Obj?.desc || (Array.isArray(c.icd9cmDesc) ? c.icd9cmDesc[idx] : c.icd9cmDesc)}
                                    </span>
                                  </span>
                                );
                              })}
                            </div>
                          ) : (
                            <span className="text-slate-400 italic text-[11px]">- Tanpa Tindakan -</span>
                          )}
                        </td>
                        <td className="p-3.5 text-slate-600">{coder?.name || 'Petugas Koding'}</td>
                        <td className="p-3.5 text-center">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            c.status === 'Locked' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {c.status}
                          </span>
                        </td>
                        <td className="p-3.5 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {/* Open in Workbench Button */}
                            <button
                              onClick={() => {
                                if (p) setSelectedPatientId(p.id);
                                if (c.regId) setSelectedRegId(c.regId);
                                setActiveTab('workbench');
                              }}
                              className="px-2.5 py-1 bg-blue-50 text-blue-800 hover:bg-blue-100 rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1 cursor-pointer border border-blue-200"
                              title="Buka Rekam Medis & Riwayat Pasien di Lembar Kerja"
                            >
                              <Eye className="w-3 h-3 text-blue-700" />
                              Buka
                            </button>

                            {c.status === 'Draft' ? (
                              <button
                                onClick={() => handleLockRecord(c.id)}
                                className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1 cursor-pointer shadow-xs"
                                title="Kunci (Lock) Coding"
                              >
                                <Lock className="w-3 h-3" /> Lock
                              </button>
                            ) : (
                              <span className="text-[10px] font-bold text-slate-400 flex items-center justify-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Locked
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredCodingRekap.length === 0 && (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-slate-400">
                        Belum ada data koding yang sesuai dengan pencarian atau filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal Cek VClaim BPJS */}
      {showVclaimModal && (
        <ModalCekBpjs
          isOpen={showVclaimModal}
          onClose={() => setShowVclaimModal(false)}
          patients={patients}
          initialNoBpjs={currentPatient?.noBPJS || ''}
          initialNik={currentPatient?.nik || ''}
          onAddToLog={(logItem) => {
            try {
              const current = JSON.parse(localStorage.getItem('simrs_vclaim_sync_logs') || '[]');
              localStorage.setItem('simrs_vclaim_sync_logs', JSON.stringify([logItem, ...current]));
            } catch {
              // ignore
            }
          }}
        />
      )}
    </div>
  );
};
