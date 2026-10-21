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
  Plus,
  Users,
  Filter,
  RotateCcw,
  X,
  Edit3,
  ClipboardList,
  Bed,
  CheckCircle
} from 'lucide-react';
import { EXTENDED_ICD10, EXTENDED_ICD9CM } from '../data/icdDatabase';
import type { Registration } from '../types';

export const CodingView: React.FC = () => {
  const {
    coding,
    medicalRecords,
    cppt,
    registrations,
    patients,
    users,
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

  // Active view tab: 'kunjungan' (Daftar Kunjungan Pasien) vs 'workbench' (Lembar Kerja Koding) vs 'rekap' (Rekap Koding RS)
  const [activeTab, setActiveTab] = useState<'kunjungan' | 'workbench' | 'rekap'>(() => {
    if (params?.patientId || params?.regId) return 'workbench';
    return 'kunjungan';
  });
  const [showVclaimModal, setShowVclaimModal] = useState(false);

  // =========================================================================
  // DAFTAR KUNJUNGAN PASIEN (VISIT-BASED CODING) STATES & FILTERS
  // =========================================================================
  const [visitSearch, setVisitSearch] = useState('');
  const [serviceTypeFilter, setServiceTypeFilter] = useState<'all' | 'Rawat Jalan' | 'Rawat Inap'>('all');
  const [statusKodingFilter, setStatusKodingFilter] = useState<'all' | 'Menunggu Koding' | 'Dalam Proses Koding' | 'Selesai Dikoding' | 'Menunggu Pemeriksaan' | 'Belum Lengkap'>('all');
  const [filterVisitDate, setFilterVisitDate] = useState('');
  const [filterVisitMonth, setFilterVisitMonth] = useState('all');
  const [filterVisitYear, setFilterVisitYear] = useState('2026');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');

  // Applied filter state (Executed when "Terapkan Filter" is clicked)
  const [appliedVisitFilters, setAppliedVisitFilters] = useState({
    search: '',
    serviceType: 'all',
    statusKoding: 'all',
    date: '',
    month: 'all',
    year: '2026',
    startDate: '',
    endDate: ''
  });

  const handleApplyVisitFilter = () => {
    setAppliedVisitFilters({
      search: visitSearch.trim(),
      serviceType: serviceTypeFilter,
      statusKoding: statusKodingFilter,
      date: filterVisitDate,
      month: filterVisitMonth,
      year: filterVisitYear,
      startDate: filterStartDate,
      endDate: filterEndDate
    });
  };

  const handleResetVisitFilter = () => {
    setVisitSearch('');
    setServiceTypeFilter('all');
    setStatusKodingFilter('all');
    setFilterVisitDate('');
    setFilterVisitMonth('all');
    setFilterVisitYear('2026');
    setFilterStartDate('');
    setFilterEndDate('');
    setAppliedVisitFilters({
      search: '',
      serviceType: 'all',
      statusKoding: 'all',
      date: '',
      month: 'all',
      year: '2026',
      startDate: '',
      endDate: ''
    });
  };

  // Search & Filter state for Patient Selector in Workbench
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

  // Active Form Coding State (Kosong secara default)
  const [formIcd10List, setFormIcd10List] = useState<string[]>([]);
  const [formIcd9List, setFormIcd9List] = useState<string[]>([]);
  const [formNote, setFormNote] = useState<string>('');
  const [formStatus, setFormStatus] = useState<'Draft' | 'Locked'>('Draft');

  // Table Rekap Search & Filter
  const [searchTable, setSearchTable] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Draft' | 'Locked'>('all');

  // Action to start / continue coding a visit from the visit list
  const handleSelectVisitForCoding = (patientId: string, regId: string) => {
    setSelectedPatientId(patientId);
    setSelectedRegId(regId);
    setActiveTab('workbench');

    const patient = patients.find(p => p.id === patientId);
    const reg = registrations.find(r => r.id === regId);

    Swal.fire({
      icon: 'info',
      title: 'Membuka Lembar Kerja Koding',
      html: `
        <div class="text-left text-xs space-y-1.5">
          <p>Pasien: <strong>${patient?.name || '-'}</strong> (${patient?.noRM || '-'})</p>
          <p>Kunjungan: <strong class="font-mono text-blue-700">${regId}</strong> - ${reg?.date || '-'} (${reg?.type} / ${reg?.poli || reg?.room || '-'})</p>
          <p class="text-slate-500 text-[11px]">Silakan lakukan pengkodean ICD-10 & ICD-9-CM pada formulir lembar kerja.</p>
        </div>
      `,
      timer: 1500,
      showConfirmButton: false
    });
  };

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
        : (currentEncounterCoding.icd10 ? [currentEncounterCoding.icd10] : []);
      const rawIcd9 = Array.isArray(currentEncounterCoding.icd9cm)
        ? currentEncounterCoding.icd9cm
        : (currentEncounterCoding.icd9cm ? [currentEncounterCoding.icd9cm] : []);

      setFormIcd10List(rawIcd10);
      setFormIcd9List(rawIcd9);
      setFormNote(currentEncounterCoding.note || '');
      setFormStatus(currentEncounterCoding.status || 'Draft');
    } else {
      // If no coding yet for this encounter, initialize clean state (kosong secara default)
      setFormIcd10List([]);
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
      const descText = item.desc || item.name || '';
      const codeMatch = Boolean(item.code && textToAnalyze.includes(item.code.toLowerCase()));
      const words = descText.toLowerCase().split(/[\s,/-]+/).filter(w => w.length > 3);
      const descMatch = words.some(w => textToAnalyze.includes(w));
      return codeMatch || descMatch;
    }).map(i => i.code).slice(0, 3);

    // Match ICD-9-CM
    const matchedIcd9 = EXTENDED_ICD9CM.filter(item => {
      const descText = item.desc || item.name || '';
      const codeMatch = Boolean(item.code && textToAnalyze.includes(item.code.toLowerCase()));
      const words = descText.toLowerCase().split(/[\s,/-]+/).filter(w => w.length > 3);
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

  // =========================================================================
  // VISIT-BASED CODING LIST: STATUS EVALUATION & DATA PIPELINE
  // =========================================================================
  const getEncounterData = (reg: Registration) => {
    const patient = patients.find(p => p.id === reg.patientId);
    const mr = medicalRecords.find(m => m.regId === reg.id);
    const cpptList = cppt.filter(c => c.regId === reg.id || (mr && c.mrId === mr.id));
    const codingItem = coding.find(c => c.regId === reg.id || (mr && c.mrId === mr.id));
    const dpjpUser = users.find(u => u.id === reg.dpjp);

    // Keterangan Koding (Rawat Inap vs Rawat Jalan)
    const codingCategory = reg.type === 'Rawat Inap' ? 'Koding Rawat Inap' : 'Koding Rawat Jalan';

    // Status Pemeriksaan
    let examStatusLabel: 'Selesai Diperiksa' | 'Sedang Diperiksa' | 'Menunggu Pemeriksaan' | 'Belum Lengkap' | 'Batal' = 'Menunggu Pemeriksaan';
    let examBadgeClass = 'bg-blue-100 text-blue-800 border-blue-200';

    if (reg.status === 'Batal') {
      examStatusLabel = 'Batal';
      examBadgeClass = 'bg-slate-100 text-slate-600 border-slate-200';
    } else if (reg.examinationStatus === 'Selesai Diperiksa' || reg.status === 'Selesai' || (mr && mr.diagnosis && mr.diagnosisStatus === 'Verified')) {
      examStatusLabel = 'Selesai Diperiksa';
      examBadgeClass = 'bg-emerald-100 text-emerald-800 border-emerald-300';
    } else if (mr && (mr.diagnosis || mr.anamnesis || mr.physicalExam || cpptList.length > 0)) {
      examStatusLabel = 'Sedang Diperiksa';
      examBadgeClass = 'bg-amber-100 text-amber-800 border-amber-300';
    } else if (reg.status === 'Dirawat' || reg.status === 'Siap Diperiksa') {
      examStatusLabel = 'Menunggu Pemeriksaan';
      examBadgeClass = 'bg-sky-100 text-sky-800 border-sky-200';
    } else {
      examStatusLabel = 'Belum Lengkap';
      examBadgeClass = 'bg-rose-100 text-rose-800 border-rose-200';
    }

    // Status Koding (5 kondisi yang disyaratkan user)
    let codingStatusLabel: 'Menunggu Koding' | 'Dalam Proses Koding' | 'Selesai Dikoding' | 'Menunggu Pemeriksaan' | 'Belum Lengkap' = 'Menunggu Koding';
    let codingBadgeClass = 'bg-blue-100 text-blue-900 border-blue-300';
    let codingStatusDesc = 'Pemeriksaan selesai, data siap dikoding';

    const hasIcd10 = codingItem && (Array.isArray(codingItem.icd10) ? codingItem.icd10.length > 0 : Boolean(codingItem.icd10));

    if (codingItem && (codingItem.status === 'Locked' || hasIcd10)) {
      if (codingItem.status === 'Locked') {
        codingStatusLabel = 'Selesai Dikoding';
        codingBadgeClass = 'bg-emerald-100 text-emerald-800 border-emerald-300';
        codingStatusDesc = 'Seluruh proses koding telah selesai & terkunci';
      } else {
        codingStatusLabel = 'Dalam Proses Koding';
        codingBadgeClass = 'bg-amber-100 text-amber-900 border-amber-300';
        codingStatusDesc = 'Petugas sedang melakukan pengkodean (Draft)';
      }
    } else if (codingItem && codingItem.status === 'Draft') {
      codingStatusLabel = 'Dalam Proses Koding';
      codingBadgeClass = 'bg-amber-100 text-amber-900 border-amber-300';
      codingStatusDesc = 'Petugas sedang melakukan pengkodean (Draft)';
    } else if (examStatusLabel === 'Selesai Diperiksa') {
      codingStatusLabel = 'Menunggu Koding';
      codingBadgeClass = 'bg-blue-100 text-blue-900 border-blue-300';
      codingStatusDesc = 'Pemeriksaan telah selesai, data siap dikoding';
    } else if (examStatusLabel === 'Sedang Diperiksa' || examStatusLabel === 'Menunggu Pemeriksaan') {
      codingStatusLabel = 'Menunggu Pemeriksaan';
      codingBadgeClass = 'bg-slate-100 text-slate-700 border-slate-300';
      codingStatusDesc = 'Data kunjungan belum selesai diperiksa';
    } else {
      codingStatusLabel = 'Belum Lengkap';
      codingBadgeClass = 'bg-rose-100 text-rose-800 border-rose-300';
      codingStatusDesc = 'Dokumentasi klinis atau diagnosis belum lengkap';
    }

    // Diagnosa & Klinis
    const diagnosisText = mr?.diagnosis || (cpptList[0]?.assessment) || '-';
    const anamnesisText = mr?.anamnesis || (cpptList[0]?.subjective) || '-';

    return {
      reg,
      patient,
      mr,
      codingItem,
      dpjpUser,
      codingCategory,
      examStatusLabel,
      examBadgeClass,
      codingStatusLabel,
      codingBadgeClass,
      codingStatusDesc,
      diagnosisText,
      anamnesisText
    };
  };

  // Compile all encounters
  const allVisitsData = useMemo(() => {
    return registrations.map(reg => getEncounterData(reg));
  }, [registrations, patients, medicalRecords, cppt, coding, users]);

  // Dynamic Filtered Visits List
  const filteredVisits = useMemo(() => {
    return allVisitsData.filter(item => {
      const { reg, patient, codingStatusLabel } = item;

      // 1. Service Type Filter
      if (appliedVisitFilters.serviceType === 'Rawat Jalan') {
        if (reg.type !== 'Rawat Jalan' && reg.type !== 'IGD') return false;
      } else if (appliedVisitFilters.serviceType === 'Rawat Inap') {
        if (reg.type !== 'Rawat Inap') return false;
      }

      // 2. Status Koding Filter
      if (appliedVisitFilters.statusKoding !== 'all') {
        if (codingStatusLabel !== appliedVisitFilters.statusKoding) return false;
      }

      // 3. Date Filters
      if (appliedVisitFilters.date && reg.date !== appliedVisitFilters.date) {
        return false;
      }
      if (appliedVisitFilters.year !== 'all') {
        if (!reg.date.startsWith(appliedVisitFilters.year)) return false;
      }
      if (appliedVisitFilters.month !== 'all') {
        const regMonth = reg.date.split('-')[1];
        if (regMonth !== appliedVisitFilters.month) return false;
      }
      if (appliedVisitFilters.startDate && reg.date < appliedVisitFilters.startDate) {
        return false;
      }
      if (appliedVisitFilters.endDate && reg.date > appliedVisitFilters.endDate) {
        return false;
      }

      // 4. Search Filter (Nama lengkap, No. RM, Tanggal Lahir, NIK, DPJP, Poli)
      if (appliedVisitFilters.search) {
        const q = appliedVisitFilters.search.toLowerCase();
        const pName = (patient?.name || '').toLowerCase();
        const pRM = (patient?.noRM || '').toLowerCase();
        const pNIK = (patient?.nik || '').toLowerCase();
        const pDOB = (patient?.dob || '').toLowerCase();
        const regId = (reg.id || '').toLowerCase();
        const poli = (reg.poli || '').toLowerCase();
        const room = (reg.room || '').toLowerCase();
        const diag = (item.diagnosisText || '').toLowerCase();

        const match =
          pName.includes(q) ||
          pRM.includes(q) ||
          pNIK.includes(q) ||
          pDOB.includes(q) ||
          regId.includes(q) ||
          poli.includes(q) ||
          room.includes(q) ||
          diag.includes(q);

        if (!match) return false;
      }

      return true;
    }).sort((a, b) => new Date(b.reg.date).getTime() - new Date(a.reg.date).getTime());
  }, [allVisitsData, appliedVisitFilters]);

  // Overall KPI statistics
  const visitStats = useMemo(() => {
    const total = allVisitsData.length;
    const waitingExam = allVisitsData.filter(v => v.codingStatusLabel === 'Menunggu Pemeriksaan').length;
    const waitingCoding = allVisitsData.filter(v => v.codingStatusLabel === 'Menunggu Koding').length;
    const inProgress = allVisitsData.filter(v => v.codingStatusLabel === 'Dalam Proses Koding').length;
    const completed = allVisitsData.filter(v => v.codingStatusLabel === 'Selesai Dikoding').length;
    const incomplete = allVisitsData.filter(v => v.codingStatusLabel === 'Belum Lengkap').length;
    return { total, waitingExam, waitingCoding, inProgress, completed, incomplete };
  }, [allVisitsData]);

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
              id="tab-kunjungan"
              type="button"
              onClick={() => setActiveTab('kunjungan')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'kunjungan'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-blue-200 hover:text-white'
              }`}
            >
              <ClipboardList className="w-3.5 h-3.5" />
              <span>Daftar Kunjungan Pasien</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                activeTab === 'kunjungan' ? 'bg-white text-blue-700' : 'bg-blue-800 text-cyan-200'
              }`}>
                {filteredVisits.length}
              </span>
            </button>
            <button
              id="tab-workbench"
              type="button"
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
              type="button"
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

      {/* ========================================================================= */}
      {/* TAB 0: DAFTAR KUNJUNGAN PASIEN (VISIT-BASED CODING) */}
      {/* ========================================================================= */}
      {activeTab === 'kunjungan' && (
        <div className="space-y-6">
          {/* 1. KPI SUMMARY CARDS */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-[11px] font-bold">Total Kunjungan</span>
                <Hospital className="w-4 h-4 text-slate-400" />
              </div>
              <div className="text-xl font-black text-slate-800">{visitStats.total}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Semua episode pasien</div>
            </div>

            <div className="bg-sky-50/70 p-3.5 rounded-2xl border border-sky-200/80 shadow-2xs">
              <div className="flex items-center justify-between text-sky-700 mb-1">
                <span className="text-[11px] font-bold">Menunggu Periksa</span>
                <Clock className="w-4 h-4 text-sky-600" />
              </div>
              <div className="text-xl font-black text-sky-900">{visitStats.waitingExam}</div>
              <div className="text-[10px] text-sky-600 mt-0.5">Belum selesai di RME</div>
            </div>

            <div className="bg-blue-50/80 p-3.5 rounded-2xl border border-blue-200 shadow-2xs">
              <div className="flex items-center justify-between text-blue-800 mb-1">
                <span className="text-[11px] font-bold">Menunggu Koding</span>
                <Sparkles className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-xl font-black text-blue-900">{visitStats.waitingCoding}</div>
              <div className="text-[10px] text-blue-700 font-semibold mt-0.5">Siap Dikodekan</div>
            </div>

            <div className="bg-amber-50/80 p-3.5 rounded-2xl border border-amber-200 shadow-2xs">
              <div className="flex items-center justify-between text-amber-800 mb-1">
                <span className="text-[11px] font-bold">Proses Koding</span>
                <Edit3 className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-xl font-black text-amber-900">{visitStats.inProgress}</div>
              <div className="text-[10px] text-amber-700 mt-0.5">Draft pengkodean</div>
            </div>

            <div className="bg-emerald-50/80 p-3.5 rounded-2xl border border-emerald-200 shadow-2xs">
              <div className="flex items-center justify-between text-emerald-800 mb-1">
                <span className="text-[11px] font-bold">Selesai Dikoding</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-xl font-black text-emerald-900">{visitStats.completed}</div>
              <div className="text-[10px] text-emerald-700 font-semibold mt-0.5">Terkunci / Final</div>
            </div>

            <div className="bg-rose-50/70 p-3.5 rounded-2xl border border-rose-200/80 shadow-2xs">
              <div className="flex items-center justify-between text-rose-800 mb-1">
                <span className="text-[11px] font-bold">Belum Lengkap</span>
                <AlertCircle className="w-4 h-4 text-rose-600" />
              </div>
              <div className="text-xl font-black text-rose-900">{visitStats.incomplete}</div>
              <div className="text-[10px] text-rose-600 mt-0.5">Dokumentasi klinis</div>
            </div>
          </div>

          {/* 2. FILTER & PENCARIAN KUNJUNGAN PASIEN BAR */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-blue-700" />
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                  Filter & Pencarian Kunjungan Pasien
                </h3>
              </div>
              <span className="text-[11px] text-slate-500 font-medium">
                Pencarian multi-kriteria: Nama, No RM, Tanggal Lahir, Poli, Dokter, dan Status
              </span>
            </div>

            {/* Filter Inputs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3 text-xs">
              {/* 1. Search Bar */}
              <div className="md:col-span-2 space-y-1">
                <label className="text-[11px] font-extrabold text-slate-600 flex items-center gap-1">
                  <Search className="w-3.5 h-3.5 text-blue-600" />
                  Cari Pasien / No. RM / Tanggal Lahir / DPJP
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={visitSearch}
                    onChange={e => setVisitSearch(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleApplyVisitFilter()}
                    placeholder="Contoh: Siti Aminah, 00-01-24, 1990-05-12, dr. Hendra, Penyakit Dalam..."
                    className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all text-xs"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  {visitSearch && (
                    <button
                      type="button"
                      onClick={() => setVisitSearch('')}
                      className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                      title="Hapus pencarian"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* 2. Jenis Pelayanan Filter */}
              <div className="space-y-1">
                <label className="text-[11px] font-extrabold text-slate-600 flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-blue-600" />
                  Jenis Pelayanan
                </label>
                <select
                  value={serviceTypeFilter}
                  onChange={e => setServiceTypeFilter(e.target.value as any)}
                  className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 text-xs"
                >
                  <option value="all">Semua Pelayanan (Rawat Jalan & Inap)</option>
                  <option value="Rawat Jalan">Rawat Jalan (Ralan / Poliklinik / IGD)</option>
                  <option value="Rawat Inap">Rawat Inap (Ranap / Bangsal)</option>
                </select>
              </div>

              {/* 3. Status Koding Filter */}
              <div className="space-y-1">
                <label className="text-[11px] font-extrabold text-slate-600 flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5 text-blue-600" />
                  Status Koding
                </label>
                <select
                  value={statusKodingFilter}
                  onChange={e => setStatusKodingFilter(e.target.value as any)}
                  className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 text-xs"
                >
                  <option value="all">Semua Status Koding</option>
                  <option value="Menunggu Koding">Menunggu Koding (Siap Dikoding)</option>
                  <option value="Dalam Proses Koding">Dalam Proses Koding (Draft)</option>
                  <option value="Selesai Dikoding">Selesai Dikoding (Terkunci)</option>
                  <option value="Menunggu Pemeriksaan">Menunggu Pemeriksaan (Dokter)</option>
                  <option value="Belum Lengkap">Belum Lengkap (Dokumentasi)</option>
                </select>
              </div>

              {/* 4. Filter Periode: Tanggal Spesifik */}
              <div className="space-y-1">
                <label className="text-[11px] font-extrabold text-slate-600 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-blue-600" />
                  Tanggal Kunjungan
                </label>
                <input
                  type="date"
                  value={filterVisitDate}
                  onChange={e => setFilterVisitDate(e.target.value)}
                  className="w-full py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 text-xs cursor-pointer"
                />
              </div>

              {/* 5. Filter Bulan */}
              <div className="space-y-1">
                <label className="text-[11px] font-extrabold text-slate-600">Bulan Pelayanan</label>
                <select
                  value={filterVisitMonth}
                  onChange={e => setFilterVisitMonth(e.target.value)}
                  className="w-full py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 text-xs"
                >
                  <option value="all">Semua Bulan</option>
                  <option value="01">Januari</option>
                  <option value="02">Februari</option>
                  <option value="03">Maret</option>
                  <option value="04">April</option>
                  <option value="05">Mei</option>
                  <option value="06">Juni</option>
                  <option value="07">Juli</option>
                  <option value="08">Agustus</option>
                  <option value="09">September</option>
                  <option value="10">Oktober</option>
                  <option value="11">November</option>
                  <option value="12">Desember</option>
                </select>
              </div>

              {/* 6. Filter Tahun */}
              <div className="space-y-1">
                <label className="text-[11px] font-extrabold text-slate-600">Tahun Pelayanan</label>
                <select
                  value={filterVisitYear}
                  onChange={e => setFilterVisitYear(e.target.value)}
                  className="w-full py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 text-xs"
                >
                  <option value="all">Semua Tahun</option>
                  <option value="2026">2026</option>
                  <option value="2025">2025</option>
                  <option value="2024">2024</option>
                </select>
              </div>

              {/* 7. Rentang Tanggal & Tombol Aksi */}
              <div className="space-y-1 flex flex-col justify-end">
                <label className="text-[11px] font-extrabold text-slate-600">Rentang Tanggal (Opsional)</label>
                <div className="flex items-center gap-1">
                  <input
                    type="date"
                    value={filterStartDate}
                    onChange={e => setFilterStartDate(e.target.value)}
                    placeholder="Mulai"
                    className="w-1/2 py-1.5 px-2 bg-slate-50 border border-slate-200 rounded-lg text-[11px] font-semibold text-slate-800 cursor-pointer"
                    title="Tanggal Mulai"
                  />
                  <span className="text-slate-400 font-bold text-xs">-</span>
                  <input
                    type="date"
                    value={filterEndDate}
                    onChange={e => setFilterEndDate(e.target.value)}
                    placeholder="Sampai"
                    className="w-1/2 py-1.5 px-2 bg-slate-50 border border-slate-200 rounded-lg text-[11px] font-semibold text-slate-800 cursor-pointer"
                    title="Tanggal Akhir"
                  />
                </div>
              </div>
            </div>

            {/* Filter Action Buttons & Active Status Banner */}
            <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleApplyVisitFilter}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer transition-all"
                  title="Terapkan filter pada daftar kunjungan pasien"
                >
                  <Filter className="w-3.5 h-3.5" />
                  <span>Terapkan Filter</span>
                </button>
                <button
                  type="button"
                  onClick={handleResetVisitFilter}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 flex items-center gap-1.5 cursor-pointer transition-all"
                  title="Reset filter ke kondisi default"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                  <span>Reset Filter</span>
                </button>
              </div>

              {/* Status Banner */}
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <span className="bg-blue-50 text-blue-800 font-extrabold px-2.5 py-1 rounded-lg border border-blue-200">
                  Ditemukan: <strong>{filteredVisits.length}</strong> Kunjungan Pasien
                </span>
                {appliedVisitFilters.search && (
                  <span className="bg-amber-50 text-amber-900 font-semibold px-2 py-0.5 rounded-md border border-amber-200 text-[11px]">
                    Kata kunci: "{appliedVisitFilters.search}"
                  </span>
                )}
                {appliedVisitFilters.serviceType !== 'all' && (
                  <span className="bg-sky-50 text-sky-800 font-semibold px-2 py-0.5 rounded-md border border-sky-200 text-[11px]">
                    Layanan: {appliedVisitFilters.serviceType}
                  </span>
                )}
                {appliedVisitFilters.statusKoding !== 'all' && (
                  <span className="bg-indigo-50 text-indigo-800 font-semibold px-2 py-0.5 rounded-md border border-indigo-200 text-[11px]">
                    Status: {appliedVisitFilters.statusKoding}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* 3. VISITS TABLE (MODEL DAFTAR KUNJUNGAN PASIEN / ENCOUNTER-BASED) */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
              <div className="flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-blue-900" />
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                  Daftar Kunjungan Pasien untuk Kodifikasi Klinis
                </h3>
              </div>
              <div className="text-[11px] text-slate-500 font-medium">
                Setiap baris merepresentasikan 1 episode kunjungan/pelayanan terpisah
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100/80 border-b border-slate-200 text-[11px] text-slate-700 font-black uppercase tracking-wider">
                    <th className="py-3 px-3.5 text-center w-12">No.</th>
                    <th className="py-3 px-3.5">Encounter & Tanggal</th>
                    <th className="py-3 px-3.5">Data Pasien</th>
                    <th className="py-3 px-3.5">Jenis Koding & Layanan</th>
                    <th className="py-3 px-3.5">DPJP (Dokter)</th>
                    <th className="py-3 px-3.5 min-w-[200px]">Diagnosis & Pemeriksaan</th>
                    <th className="py-3 px-3.5 text-center">Status Pemeriksaan</th>
                    <th className="py-3 px-3.5 text-center">Status Koding</th>
                    <th className="py-3 px-3.5 text-center w-28">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {filteredVisits.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-slate-400">
                        <div className="max-w-md mx-auto space-y-2">
                          <AlertCircle className="w-8 h-8 text-slate-300 mx-auto" />
                          <p className="font-bold text-slate-600 text-xs">
                            Tidak ada data kunjungan pasien yang sesuai dengan filter.
                          </p>
                          <p className="text-[11px] text-slate-400">
                            Silakan ubah kriteria pencarian atau klik tombol Reset Filter untuk melihat semua kunjungan.
                          </p>
                          <button
                            type="button"
                            onClick={handleResetVisitFilter}
                            className="mt-2 px-3 py-1.5 bg-blue-50 text-blue-700 font-bold rounded-lg border border-blue-200 text-xs hover:bg-blue-100 cursor-pointer inline-flex items-center gap-1.5"
                          >
                            <RotateCcw className="w-3.5 h-3.5" /> Reset Filter
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredVisits.map((item, idx) => {
                      const { reg, patient, dpjpUser, codingCategory, examStatusLabel, examBadgeClass, codingStatusLabel, codingBadgeClass, codingStatusDesc, diagnosisText, anamnesisText } = item;

                      return (
                        <tr
                          key={reg.id}
                          className="hover:bg-blue-50/40 transition-colors"
                        >
                          {/* 1. No */}
                          <td className="py-3 px-3.5 text-center text-slate-400 font-mono text-[11px]">
                            {idx + 1}
                          </td>

                          {/* 2. Encounter ID & Tanggal Kunjungan */}
                          <td className="py-3 px-3.5">
                            <div className="font-mono font-bold text-blue-900 text-[11px]">
                              {reg.id}
                            </div>
                            <div className="flex items-center gap-1 text-[11px] text-slate-600 mt-0.5">
                              <Calendar className="w-3 h-3 text-slate-400" />
                              <span>{reg.date}</span>
                            </div>
                            {reg.sepNo && (
                              <div className="text-[10px] text-emerald-700 font-mono mt-0.5" title="Nomor SEP BPJS">
                                SEP: {reg.sepNo}
                              </div>
                            )}
                          </td>

                          {/* 3. Data Pasien: No. RM, Nama, Tanggal Lahir, Gender */}
                          <td className="py-3 px-3.5">
                            <div className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                              <span>{patient?.name || 'Pasien Tanpa Nama'}</span>
                              <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                                patient?.gender === 'M' || patient?.gender === 'L'
                                  ? 'bg-sky-100 text-sky-800'
                                  : 'bg-pink-100 text-pink-800'
                              }`}>
                                {patient?.gender === 'M' || patient?.gender === 'L' ? 'L' : 'P'}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5 font-mono">
                              <span className="font-black text-blue-800">{patient?.noRM || '-'}</span>
                              <span>•</span>
                              <span>Lahir: {patient?.dob || '-'}</span>
                            </div>
                            {patient?.insuranceType && (
                              <span className="inline-block mt-0.5 px-2 py-0.2 bg-slate-100 text-slate-600 rounded text-[10px] font-semibold">
                                {patient.insuranceType}
                              </span>
                            )}
                          </td>

                          {/* 4. Keterangan Koding & Layanan */}
                          <td className="py-3 px-3.5">
                            <span className={`inline-block px-2.5 py-0.5 rounded-md text-[10px] font-black tracking-wide uppercase border ${
                              reg.type === 'Rawat Inap'
                                ? 'bg-purple-50 text-purple-800 border-purple-200'
                                : 'bg-sky-50 text-sky-800 border-sky-200'
                            }`}>
                              {codingCategory}
                            </span>
                            <div className="text-xs font-bold text-slate-700 mt-1">
                              {reg.type}
                            </div>
                            <div className="text-[11px] text-slate-500">
                              {reg.poli || reg.room || '-'}
                            </div>
                          </td>

                          {/* 5. DPJP */}
                          <td className="py-3 px-3.5">
                            <div className="font-bold text-slate-800 text-xs">
                              {dpjpUser?.name || reg.dpjp || '-'}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              Dokter Penanggung Jawab
                            </div>
                          </td>

                          {/* 6. Diagnosis & Pemeriksaan */}
                          <td className="py-3 px-3.5 max-w-xs">
                            <div className="font-extrabold text-slate-800 line-clamp-2" title={diagnosisText}>
                              {diagnosisText}
                            </div>
                            <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5" title={anamnesisText}>
                              {anamnesisText !== '-' ? `Anamnesis: ${anamnesisText}` : 'Belum ada catatan anamnesis'}
                            </div>
                          </td>

                          {/* 7. Status Pemeriksaan */}
                          <td className="py-3 px-3.5 text-center">
                            <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-black border ${examBadgeClass}`}>
                              {examStatusLabel}
                            </span>
                          </td>

                          {/* 8. Status Koding */}
                          <td className="py-3 px-3.5 text-center">
                            <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-black border ${codingBadgeClass}`}>
                              {codingStatusLabel}
                            </span>
                            <div className="text-[10px] text-slate-400 mt-0.5 max-w-[130px] mx-auto leading-tight">
                              {codingStatusDesc}
                            </div>
                          </td>

                          {/* 9. Tombol Aksi */}
                          <td className="py-3 px-3.5 text-center">
                            {codingStatusLabel === 'Selesai Dikoding' ? (
                              <button
                                type="button"
                                onClick={() => handleSelectVisitForCoding(patient?.id || reg.patientId, reg.id)}
                                className="w-full px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-lg border border-blue-200 text-xs flex items-center justify-center gap-1 cursor-pointer transition-all shadow-2xs"
                                title="Lihat rincian kode diagnosis ICD-10 & prosedur ICD-9-CM"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>Lihat</span>
                              </button>
                            ) : codingStatusLabel === 'Dalam Proses Koding' ? (
                              <button
                                type="button"
                                onClick={() => handleSelectVisitForCoding(patient?.id || reg.patientId, reg.id)}
                                className="w-full px-2.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-extrabold rounded-lg text-xs flex items-center justify-center gap-1 cursor-pointer transition-all shadow-2xs"
                                title="Lanjutkan pengkodean klinis formulir lembar kerja"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                                <span>Lanjutkan</span>
                              </button>
                            ) : codingStatusLabel === 'Menunggu Koding' ? (
                              <button
                                type="button"
                                onClick={() => handleSelectVisitForCoding(patient?.id || reg.patientId, reg.id)}
                                className="w-full px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-lg text-xs flex items-center justify-center gap-1 cursor-pointer transition-all shadow-xs"
                                title="Mulai lakukan proses koding ICD-10 & ICD-9-CM"
                              >
                                <Zap className="w-3.5 h-3.5" />
                                <span>Koding</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleSelectVisitForCoding(patient?.id || reg.patientId, reg.id)}
                                className="w-full px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg border border-slate-200 text-xs flex items-center justify-center gap-1 cursor-pointer transition-all shadow-2xs"
                                title="Buka detail rekam medis kunjungan"
                              >
                                <FileText className="w-3.5 h-3.5" />
                                <span>Detail</span>
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer Summary */}
            <div className="p-3 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
              <div>
                Menampilkan <strong className="text-slate-800">{filteredVisits.length}</strong> dari total <strong className="text-slate-800">{allVisitsData.length}</strong> kunjungan pasien
              </div>
              <div className="flex items-center gap-3 text-[11px]">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span> Siap Dikoding
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span> Dalam Proses
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Selesai
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 1: WORKBENCH (LEMBAR KERJA & RIWAYAT KUNJUNGAN) */}
      {activeTab === 'workbench' && (
        <div className="space-y-6">
          {/* Patient & Encounter Information Banner with Back Button */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            {/* Navigation Header: Tombol Kembali ke Daftar Kunjungan */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <button
                type="button"
                id="btn-back-to-kunjungan"
                onClick={() => setActiveTab('kunjungan')}
                className="px-4 py-2 bg-blue-50 hover:bg-blue-100 active:bg-blue-200 text-blue-900 font-extrabold text-xs rounded-xl border border-blue-200 flex items-center gap-2 cursor-pointer transition-all shadow-2xs group"
                title="Kembali ke Daftar Kunjungan Pasien"
              >
                <ArrowLeft className="w-4 h-4 text-blue-700 group-hover:-translate-x-1 transition-transform" />
                <span>← Kembali ke Daftar Kunjungan Pasien</span>
              </button>

              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="text-slate-500 font-medium">Episode Pelayanan:</span>
                <span className="font-mono font-black text-blue-900 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg">
                  {currentEncounter?.id || '-'}
                </span>
                <span className={`px-2.5 py-1 rounded-lg font-black text-[11px] border ${
                  currentEncounter?.type === 'Rawat Inap'
                    ? 'bg-purple-50 text-purple-800 border-purple-200'
                    : 'bg-sky-50 text-sky-800 border-sky-200'
                }`}>
                  {currentEncounter?.type === 'Rawat Inap' ? 'Koding Rawat Inap' : 'Koding Rawat Jalan'}
                </span>
                <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg font-bold text-[11px]">
                  {currentEncounter?.poli || currentEncounter?.room || '-'}
                </span>
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
                    {/* Clinical Data pulled from Pemeriksaan module */}
                    {currentMR && (
                      <div className="bg-emerald-50/70 p-3.5 rounded-xl border border-emerald-200 text-xs space-y-2 mt-2">
                        <div className="flex items-center justify-between">
                          <span className="font-black text-emerald-900 flex items-center gap-1.5 uppercase text-[11px]">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            Data Klinis Dari Modul Pemeriksaan ({currentEncounter?.type})
                          </span>
                          <span className="text-[10px] bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded font-bold font-mono">
                            Auto-Pulled
                          </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px]">
                          <div>
                            <span className="text-slate-500 font-bold block">Diagnosis Utama:</span>
                            <span className="font-bold text-blue-900">{currentMR.diagnosis || '-'}</span>
                          </div>
                          {currentMR.diagnosisSecondary && (
                            <div>
                              <span className="text-slate-500 font-bold block">Diagnosis Sekunder:</span>
                              <span className="font-medium text-slate-800">{currentMR.diagnosisSecondary}</span>
                            </div>
                          )}
                          <div>
                            <span className="text-slate-500 font-bold block">Tindakan / Prosedur:</span>
                            <span className="font-medium text-slate-800">{currentMR.actions || currentMR.plan || '-'}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 font-bold block">Dokter DPJP / Tanggal:</span>
                            <span className="font-medium text-slate-800">{currentMR.doctorName || 'dr. DPJP'} &bull; {currentMR.date}</span>
                          </div>
                        </div>
                      </div>
                    )}
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
                        type="button"
                        onClick={() => setActiveTab('kunjungan')}
                        className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 font-bold rounded-xl text-xs border border-slate-300 flex items-center gap-1.5 cursor-pointer transition-all shadow-2xs"
                        title="Kembali ke Daftar Kunjungan Pasien"
                      >
                        <ArrowLeft className="w-3.5 h-3.5 text-slate-600" />
                        <span>Kembali ke Kunjungan</span>
                      </button>
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

                  <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveTab('kunjungan')}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 font-bold rounded-xl text-xs border border-slate-300 flex items-center gap-1.5 cursor-pointer shadow-2xs transition-all"
                      title="Kembali ke Daftar Kunjungan Pasien"
                    >
                      <ArrowLeft className="w-3.5 h-3.5 text-slate-600" />
                      <span>Kembali ke Daftar Kunjungan</span>
                    </button>

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
