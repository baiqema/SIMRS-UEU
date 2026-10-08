import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Registration, Patient, MedicalRecord, Coding, RegistrationType } from '../types';
import Swal from 'sweetalert2';
import {
  Stethoscope, Search, Calendar, Filter, User, Clock,
  ArrowRight, ShieldCheck, CheckCircle2, AlertCircle, AlertTriangle,
  RotateCcw, FileText, ChevronRight, Activity, HeartPulse, Building2,
  Barcode, Bed, Ambulance, Check, Save, Printer, UserCheck, ShieldAlert
} from 'lucide-react';
import { Modal } from '../components/Modal';

// Status colors & labels
export const STATUS_LABELS = {
  belum_diperiksa: { label: 'Belum Diperiksa', bg: 'bg-rose-50 text-rose-700 border-rose-200' },
  sudah_diperiksa: { label: 'Sudah Diperiksa', bg: 'bg-blue-50 text-blue-700 border-blue-200' },
  menunggu_coding: { label: 'Menunggu Coding', bg: 'bg-amber-50 text-amber-700 border-amber-200' },
  sudah_dikoding: { label: 'Sudah Dikoding', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  selesai: { label: 'Selesai', bg: 'bg-slate-100 text-slate-700 border-slate-300' }
};

export const PemeriksaanView: React.FC = () => {
  const {
    registrations, patients, users, medicalRecords, coding, user,
    addMedicalRecord, updateMedicalRecord, saveEncounterCoding, audit,
    canEditPage, navigate, params
  } = useApp();

  const isEditable = canEditPage('pemeriksaan');
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Tabs: IGD | RAWAT JALAN | RAWAT INAP
  const [activeTab, setActiveTab] = useState<'IGD' | 'Rawat Jalan' | 'Rawat Inap'>(() => {
    if (params?.regType === 'IGD') return 'IGD';
    if (params?.regType === 'Rawat Inap') return 'Rawat Inap';
    return 'RAWAT JALAN' === params?.regType ? 'Rawat Jalan' : (params?.tab || 'Rawat Jalan');
  });

  // Filter States (Default: date = today)
  const [filterDate, setFilterDate] = useState<string>(todayStr);
  const [filterSearch, setFilterSearch] = useState<string>(''); // For No RM / Nama
  const [filterDoctor, setFilterDoctor] = useState<string>('all');
  const [filterExamStatus, setFilterExamStatus] = useState<string>('all');
  const [filterCodingStatus, setFilterCodingStatus] = useState<string>('all');

  // Selected patient for modal examination form
  const [selectedReg, setSelectedReg] = useState<Registration | null>(() => {
    if (params?.regId) {
      return registrations.find(r => r.id === params.regId) || null;
    }
    return null;
  });

  // Associated Patient
  const selectedPatient = useMemo(() => {
    if (!selectedReg) return null;
    return patients.find(p => p.id === selectedReg.patientId) || null;
  }, [selectedReg, patients]);

  // Existing Medical Record for this Registration
  const existingMR = useMemo(() => {
    if (!selectedReg) return null;
    return medicalRecords.find(m => m.regId === selectedReg.id) || null;
  }, [selectedReg, medicalRecords]);

  // Existing Coding for this Registration
  const existingCoding = useMemo(() => {
    if (!selectedReg) return null;
    return coding.find(c => c.regId === selectedReg.id) || null;
  }, [selectedReg, coding]);

  // Calculate age helper
  const calculateAge = (dob?: string) => {
    if (!dob) return '-';
    const birthYear = parseInt(dob.split('-')[0] || '1990', 10);
    const age = Math.max(0, new Date().getFullYear() - birthYear);
    return `${age} Thn`;
  };

  // Helper to determine status for a registration
  const getRegStatus = (regId: string) => {
    const mr = medicalRecords.find(m => m.regId === regId);
    const cod = coding.find(c => c.regId === regId);

    const isExamDone = Boolean(mr && mr.diagnosis && mr.diagnosis !== '-');
    const isCoded = Boolean(cod && cod.icd10 && (Array.isArray(cod.icd10) ? cod.icd10.length > 0 && cod.icd10[0] !== '-' : cod.icd10 !== '-'));
    const isLocked = cod?.status === 'Locked';

    let examStatusLabel = 'Belum Diperiksa';
    let examStatusKey: keyof typeof STATUS_LABELS = 'belum_diperiksa';
    if (isExamDone) {
      examStatusLabel = 'Sudah Diperiksa';
      examStatusKey = 'sudah_diperiksa';
    }

    let codingStatusLabel = 'Menunggu Pemeriksaan';
    let codingStatusKey: keyof typeof STATUS_LABELS = 'belum_diperiksa';
    if (isExamDone && !isCoded) {
      codingStatusLabel = 'Menunggu Coding';
      codingStatusKey = 'menunggu_coding';
    } else if (isCoded && !isLocked) {
      codingStatusLabel = 'Draft Koding';
      codingStatusKey = 'sudah_dikoding';
    } else if (isLocked) {
      codingStatusLabel = 'Sudah Dikoding (Selesai)';
      codingStatusKey = 'selesai';
    }

    return {
      isExamDone,
      isCoded,
      isLocked,
      examStatusLabel,
      examStatusKey,
      codingStatusLabel,
      codingStatusKey
    };
  };

  // Filter registrations
  const filteredRegistrations = useMemo(() => {
    return registrations.filter(reg => {
      // 1. Must match active tab service type
      if (reg.type !== activeTab) return false;

      // 2. Filter by date (Default: today)
      if (filterDate && reg.date !== filterDate) return false;

      // 3. Filter by search query (No RM or Patient Name or NIK)
      const p = patients.find(pt => pt.id === reg.patientId);
      if (filterSearch.trim()) {
        const q = filterSearch.toLowerCase().trim();
        const noRmMatch = (p?.noRM || '').toLowerCase().includes(q);
        const nameMatch = (p?.name || '').toLowerCase().includes(q);
        const nikMatch = (p?.nik || '').includes(q);
        const regIdMatch = reg.id.toLowerCase().includes(q);
        if (!noRmMatch && !nameMatch && !nikMatch && !regIdMatch) return false;
      }

      // 4. Filter by doctor / DPJP
      if (filterDoctor !== 'all' && reg.dpjp !== filterDoctor) return false;

      // 5. Filter by examination status
      const { isExamDone, isCoded } = getRegStatus(reg.id);
      if (filterExamStatus === 'belum' && isExamDone) return false;
      if (filterExamStatus === 'sudah' && !isExamDone) return false;

      // 6. Filter by coding status
      if (filterCodingStatus === 'menunggu' && (!isExamDone || isCoded)) return false;
      if (filterCodingStatus === 'sudah' && !isCoded) return false;

      return true;
    });
  }, [registrations, patients, activeTab, filterDate, filterSearch, filterDoctor, filterExamStatus, filterCodingStatus, medicalRecords, coding]);

  // Form State for Examination
  const [keluhanUtama, setKeluhanUtama] = useState('');
  const [anamnesis, setAnamnesis] = useState('');
  const [pemeriksaanAwal, setPemeriksaanAwal] = useState('');
  const [riwayatKesehatan, setRiwayatKesehatan] = useState('');
  const [pemeriksaanFisik, setPemeriksaanFisik] = useState('');
  const [tandaVital, setTandaVital] = useState({
    sistole: '120',
    diastole: '80',
    heartRate: '82',
    respRate: '20',
    suhu: '36.7',
    spo2: '98',
    gcs: 'E4M6V5'
  });
  const [diagnosisUtama, setDiagnosisUtama] = useState('');
  const [diagnosisSekunder, setDiagnosisSekunder] = useState('');
  const [tindakan, setTindakan] = useState('');
  const [terapi, setTerapi] = useState('');
  const [kondisiPasien, setKondisiPasien] = useState('Stabil / Compos Mentis');
  const [edukasi, setEdukasi] = useState('');
  const [catatanMedis, setCatatanMedis] = useState('');
  const [cpptCatatan, setCpptCatatan] = useState('');

  // Populate form when selectedReg changes
  const handleOpenExamination = (reg: Registration) => {
    setSelectedReg(reg);
    const mr = medicalRecords.find(m => m.regId === reg.id);
    const p = patients.find(pt => pt.id === reg.patientId);

    if (mr) {
      setKeluhanUtama(mr.anamnesis?.split(' | ')[0] || mr.anamnesis || '');
      setAnamnesis(mr.anamnesis || '');
      setPemeriksaanAwal(mr.nurseNotes || '');
      setRiwayatKesehatan(p?.allergy ? `Alergi: ${p.allergy}` : '');
      setPemeriksaanFisik(mr.physicalExam || '');
      if (mr.vitalSigns) {
        setTandaVital({
          sistole: mr.vitalSigns.systolic || '120',
          diastole: mr.vitalSigns.diastolic || '80',
          heartRate: mr.vitalSigns.heartRate || '80',
          respRate: mr.vitalSigns.respRate || '20',
          suhu: mr.vitalSigns.temp || '36.5',
          spo2: mr.vitalSigns.spo2 || '98',
          gcs: mr.vitalSigns.gcs || 'E4M6V5'
        });
      }
      setDiagnosisUtama(mr.diagnosis || '');
      setDiagnosisSekunder(mr.diagnosisSecondary || '');
      setTindakan(mr.actions || '');
      setTerapi(mr.therapy || '');
      setKondisiPasien(mr.condition || 'Stabil / Compos Mentis');
      setEdukasi(mr.education || '');
      setCatatanMedis(mr.otherNotes || '');
      setCpptCatatan(mr.cpptNotes || '');
    } else {
      // Default pre-filled based on registration data & patient
      setKeluhanUtama(reg.reasonForVisit || (reg.type === 'IGD' ? 'Nyeri dada kiri akut dan sesak napas' : 'Pusing, lemas dan mual'));
      setAnamnesis(reg.reasonForVisit ? `Pasien mengeluh ${reg.reasonForVisit}` : 'Pasien mengeluhkan keluhan utama sejak 2 hari SMRS.');
      setPemeriksaanAwal(reg.type === 'IGD' ? `Triase: ${reg.triageLevel || 'Kuning (Emergensi)'}` : 'Kondisi umum sedang, kooperatif.');
      setRiwayatKesehatan(p?.allergy ? `Riwayat Alergi: ${p.allergy}` : 'Tidak ada riwayat alergi.');
      setPemeriksaanFisik('Kepala/Leher: Anemis (-), Ikterik (-). Thorax: Cor S1-S2 murni reguler, Pulmo vesikuler. Abdomen: Supel, bising usus normal. Ekstremitas: Akral hangat, CRT < 2 detik.');
      setTandaVital({
        sistole: '120',
        diastole: '80',
        heartRate: '80',
        respRate: '20',
        suhu: '36.5',
        spo2: '98',
        gcs: 'E4M6V5'
      });
      setDiagnosisUtama(reg.type === 'IGD' ? 'I20.0 - Angina pektoris tidak stabil' : reg.type === 'Rawat Inap' ? 'A01.0 - Demam Tifoid' : 'I10 - Hipertensi Esensial (Primer)');
      setDiagnosisSekunder('');
      setTindakan(reg.type === 'IGD' ? 'Pemberian O2 nasal kanul 3 lpm, pasang IV line RL 20 tpm, rekam EKG 12 lead' : 'Pemeriksaan fisik komprehensif, edukasi gaya hidup');
      setTerapi(reg.type === 'IGD' ? 'ISDN 5mg sublingual, Aspirin 160mg kunyah' : 'Amlodipine 5mg 1x1 tab');
      setKondisiPasien('Stabil / Sadar Penuh');
      setEdukasi('Minum obat teratur, kurangi konsumsi garam/lemak, istirahat cukup.');
      setCatatanMedis('');
      setCpptCatatan('S: Keluhan membaik O: Hemodinamik stabil A: Terkontrol P: Lanjutkan terapi');
    }
  };

  // Save Examination and Automatically Propagate to Coding Module
  const handleSavePemeriksaan = (forwardToCoding = false) => {
    if (!selectedReg || !selectedPatient) return;

    if (!diagnosisUtama.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Diagnosis Wajib Diisi',
        text: 'Silakan isi Diagnosis Utama sebelum menyimpan pemeriksaan.',
        confirmButtonColor: '#2563eb'
      });
      return;
    }

    const payload = {
      regId: selectedReg.id,
      noRM: selectedPatient.noRM,
      anamnesis: `${keluhanUtama} | ${anamnesis}`,
      physicalExam: pemeriksaanFisik,
      diagnosis: diagnosisUtama,
      diagnosisSecondary: diagnosisSekunder,
      actions: tindakan,
      therapy: terapi,
      vitalSigns: {
        systolic: tandaVital.sistole,
        diastolic: tandaVital.diastole,
        heartRate: tandaVital.heartRate,
        respRate: tandaVital.respRate,
        temp: tandaVital.suhu,
        spo2: tandaVital.spo2,
        gcs: tandaVital.gcs
      },
      condition: kondisiPasien,
      education: edukasi,
      cpptNotes: cpptCatatan,
      otherNotes: catatanMedis,
      triageLevel: selectedReg.triageLevel,
      room: selectedReg.room,
      diagnosisStatus: 'Verified' as const,
      doctorId: selectedReg.dpjp || user?.id || 'U002',
      doctorName: users.find(u => u.id === selectedReg.dpjp)?.name || user?.name || 'dr. DPJP Spesialis',
      date: selectedReg.date
    };

    let mrResult: MedicalRecord;
    if (existingMR) {
      updateMedicalRecord(existingMR.id, payload);
      mrResult = { ...existingMR, ...payload };
    } else {
      mrResult = addMedicalRecord(payload);
    }

    // Auto-propagate diagnosis and procedures into Coding Module
    // Extract potential ICD codes if formatted as "I10 - ..." or just create clean entry
    const icd10Matches = diagnosisUtama.match(/[A-Z][0-9]{2}(?:\.[0-9]{1,2})?/);
    const primaryCode = icd10Matches ? icd10Matches[0] : (selectedReg.type === 'IGD' ? 'I20.0' : selectedReg.type === 'Rawat Inap' ? 'A01.0' : 'I10');
    
    const icd9Matches = tindakan.match(/[0-9]{2}(?:\.[0-9]{1,2})?/);
    const procCodes = icd9Matches ? [icd9Matches[0]] : (selectedReg.type === 'IGD' ? ['89.52'] : []);

    saveEncounterCoding({
      regId: selectedReg.id,
      mrId: mrResult.id,
      icd10: [primaryCode],
      icd10Desc: [diagnosisUtama],
      icd9cm: procCodes,
      icd9cmDesc: [tindakan || 'Pemeriksaan Klinis'],
      status: 'Draft',
      note: `Hasil penerusan data pemeriksaan ${selectedReg.type}: ${diagnosisUtama}. Menunggu validasi coder.`
    });

    audit('UPDATE', 'Pemeriksaan', selectedReg.id, {
      field_name: 'status',
      new_value: `Selesai Diperiksa (${selectedReg.type}) -> Diteruskan ke Coding`
    });

    Swal.fire({
      icon: 'success',
      title: 'Pemeriksaan Berhasil Disimpan!',
      html: `
        <div class="text-left text-xs space-y-2 text-slate-700">
          <p><strong>Pasien:</strong> ${selectedPatient.name} (${selectedPatient.noRM})</p>
          <p><strong>Jenis Pelayanan:</strong> <span class="font-bold text-blue-600">${selectedReg.type}</span></p>
          <p><strong>Diagnosis Utama:</strong> ${diagnosisUtama}</p>
          <div class="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 font-medium">
            Data klinis otomatis diteruskan ke <strong>Modul Pengkodingan (Coding ICD-10 & ICD-9-CM)</strong> untuk registrasi kunjungan ini.
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: forwardToCoding ? 'Buka Modul Coding Sekarang' : 'Selesai',
      cancelButtonText: 'Tutup Formulir',
      confirmButtonColor: '#2563eb'
    }).then((res) => {
      setSelectedReg(null);
      if (res.isConfirmed && forwardToCoding) {
        navigate('coding', { patientId: selectedPatient.id, regId: selectedReg.id });
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* HEADER SECTION */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-100 text-blue-800 border border-blue-200">
              MODUL PEMERIKSAAN & KLINIK TERINTEGRASI
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
              SINKRON DENGAN PENDAFTARAN
            </span>
          </div>
          <h1 className="text-xl font-black text-slate-900 flex items-center gap-2 mt-1.5">
            <Stethoscope className="w-6 h-6 text-blue-600" />
            <span>Pemeriksaan Pasien</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Daftar pasien otomatis ditarik dari <strong>Modul Pendaftaran</strong>. Formulir pemeriksaan secara otomatis menyesuaikan jenis pelayanan (<strong>IGD, Rawat Jalan, atau Rawat Inap</strong>).
          </p>
        </div>

        {/* Quick Indicators */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <div className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-right">
            <div className="text-[10px] font-bold text-slate-400 uppercase">Tanggal Aktif</div>
            <div className="text-xs font-mono font-black text-slate-800">{filterDate || todayStr}</div>
          </div>
          <div className="bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-xl text-right">
            <div className="text-[10px] font-bold text-blue-600 uppercase">Pasien Terdaftar</div>
            <div className="text-xs font-mono font-black text-blue-900">{filteredRegistrations.length} Pasien</div>
          </div>
        </div>
      </div>

      {/* SERVICE TYPE TABS: IGD | RAWAT JALAN | RAWAT INAP */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-1 overflow-x-auto">
        {[
          { id: 'IGD', label: 'IGD (Instalasi Gawat Darurat)', icon: Ambulance, color: 'text-rose-600', activeBg: 'bg-rose-600 text-white shadow-md shadow-rose-600/30' },
          { id: 'Rawat Jalan', label: 'RAWAT JALAN (Poliklinik)', icon: Stethoscope, color: 'text-blue-600', activeBg: 'bg-blue-600 text-white shadow-md shadow-blue-600/30' },
          { id: 'Rawat Inap', label: 'RAWAT INAP (Bangsal / Kamar)', icon: Bed, color: 'text-amber-600', activeBg: 'bg-amber-600 text-white shadow-md shadow-amber-600/30' }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const count = registrations.filter(r => r.type === tab.id && (!filterDate || r.date === filterDate)).length;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 py-3 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap ${
                isActive
                  ? tab.activeBg
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-bold'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{tab.label}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-black ${
                isActive ? 'bg-white/25 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
            <Filter className="w-3.5 h-3.5 text-blue-600" />
            <span>Filter & Pencarian Pasien ({activeTab})</span>
          </div>
          <button
            onClick={() => {
              setFilterDate(todayStr);
              setFilterSearch('');
              setFilterDoctor('all');
              setFilterExamStatus('all');
              setFilterCodingStatus('all');
            }}
            className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset ke Hari Ini</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          {/* Tanggal Kunjungan */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Tanggal Kunjungan:</label>
            <div className="relative">
              <Calendar className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="date"
                value={filterDate}
                onChange={e => setFilterDate(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold font-mono text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Search No RM / Nama / NIK */}
          <div className="md:col-span-2">
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Cari Pasien (No. RM / Nama / NIK):</label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={filterSearch}
                onChange={e => setFilterSearch(e.target.value)}
                placeholder="Ketik No RM, nama pasien, atau NIK..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Dokter / DPJP */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Dokter / DPJP:</label>
            <select
              value={filterDoctor}
              onChange={e => setFilterDoctor(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500"
            >
              <option value="all">Semua Dokter DPJP</option>
              {users.filter(u => u.roleId === 'R05').map(doc => (
                <option key={doc.id} value={doc.id}>{doc.name}</option>
              ))}
            </select>
          </div>

          {/* Status Pemeriksaan */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Status Pemeriksaan:</label>
            <select
              value={filterExamStatus}
              onChange={e => setFilterExamStatus(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500"
            >
              <option value="all">Semua Status</option>
              <option value="belum">Belum Diperiksa</option>
              <option value="sudah">Sudah Diperiksa</option>
            </select>
          </div>
        </div>
      </div>

      {/* PATIENT LIST TABLE ACCORDING TO USER BRIEF */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-black text-slate-900">
              Daftar Pasien Terdaftar — {activeTab}
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-blue-100 text-blue-900 border border-blue-200">
              {filteredRegistrations.length} Kunjungan
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
              <span>Belum Diperiksa</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
              <span>Sudah Diperiksa</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span>Sudah Dikoding</span>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white font-bold">
                <th className="p-3 border-r border-slate-800 text-center w-12">No</th>
                <th className="p-3 border-r border-slate-800 text-center w-28">No. Rekam Medis</th>
                <th className="p-3 border-r border-slate-800">Nama Pasien & NIK</th>
                <th className="p-3 border-r border-slate-800 text-center w-24">JK / Umur</th>
                <th className="p-3 border-r border-slate-800 text-center w-36">Tgl & Jam Daftar</th>
                <th className="p-3 border-r border-slate-800">Jenis Pelayanan / Poli / Kamar</th>
                <th className="p-3 border-r border-slate-800 text-center w-28">No. Registrasi</th>
                <th className="p-3 border-r border-slate-800">Dokter / DPJP</th>
                <th className="p-3 border-r border-slate-800 text-center w-32">Status Periksa</th>
                <th className="p-3 border-r border-slate-800 text-center w-36">Status Koding</th>
                <th className="p-3 text-center w-40">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredRegistrations.length === 0 ? (
                <tr>
                  <td colSpan={11} className="p-10 text-center text-slate-400">
                    <AlertCircle className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    <p className="font-bold text-slate-600">Tidak ada pasien terdaftar pada tanggal dan kriteria ini</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Data otomatis ditarik dari Modul Pendaftaran. Silakan daftarkan pasien baru di Modul Pendaftaran atau ubah filter tanggal.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredRegistrations.map((reg, idx) => {
                  const p = patients.find(pt => pt.id === reg.patientId);
                  const doc = users.find(u => u.id === reg.dpjp);
                  const { examStatusLabel, examStatusKey, codingStatusLabel, codingStatusKey } = getRegStatus(reg.id);

                  return (
                    <tr key={reg.id} className="hover:bg-blue-50/40 transition-colors">
                      <td className="p-3 text-center font-bold text-slate-500">{idx + 1}</td>
                      <td className="p-3 text-center font-mono font-black text-blue-700 bg-blue-50/50">
                        {p?.noRM || '-'}
                      </td>
                      <td className="p-3">
                        <div className="font-bold text-slate-900 text-sm">{p?.name || '-'}</div>
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">NIK: {p?.nik || '-'}</div>
                      </td>
                      <td className="p-3 text-center">
                        <span className={`font-bold px-1.5 py-0.5 rounded text-[10px] ${
                          p?.gender === 'M' || p?.gender === '1' || p?.gender === 'L'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-pink-100 text-pink-800'
                        }`}>
                          {p?.gender === 'M' || p?.gender === '1' || p?.gender === 'L' ? 'L' : 'P'}
                        </span>
                        <div className="text-[11px] text-slate-600 font-bold mt-0.5">{calculateAge(p?.dob)}</div>
                      </td>
                      <td className="p-3 text-center font-mono text-[11px] text-slate-700">
                        <div>{reg.date}</div>
                        <div className="text-[10px] text-slate-400">08:30 WIB</div>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded font-black text-[10px] uppercase ${
                          reg.type === 'IGD' ? 'bg-rose-100 text-rose-800' :
                          reg.type === 'Rawat Inap' ? 'bg-amber-100 text-amber-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {reg.type}
                        </span>
                        <div className="font-bold text-slate-800 text-[11px] mt-1">
                          {reg.room ? `${reg.room} (${reg.poli})` : reg.poli}
                        </div>
                      </td>
                      <td className="p-3 text-center font-mono font-bold text-slate-700">
                        {reg.id}
                      </td>
                      <td className="p-3 font-semibold text-slate-800">
                        {doc?.name || 'dr. DPJP Belum Ditugaskan'}
                      </td>
                      <td className="p-3 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black border ${STATUS_LABELS[examStatusKey].bg}`}>
                          {examStatusLabel}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black border ${STATUS_LABELS[codingStatusKey].bg}`}>
                          {codingStatusLabel}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* TOMBOL PERIKSA */}
                          <button
                            type="button"
                            onClick={() => handleOpenExamination(reg)}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black shadow-xs flex items-center gap-1 cursor-pointer transition-all active:scale-95"
                            title="Buka Formulir Pemeriksaan Sesuai Jenis Pendaftaran"
                          >
                            <Stethoscope className="w-3.5 h-3.5" />
                            <span>Periksa</span>
                          </button>

                          {/* TOMBOL CODING */}
                          <button
                            type="button"
                            onClick={() => navigate('coding', { patientId: reg.patientId, regId: reg.id })}
                            className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-xs flex items-center gap-1 cursor-pointer transition-all active:scale-95"
                            title="Buka Modul Pengkodingan ICD-10 & ICD-9-CM"
                          >
                            <Barcode className="w-3.5 h-3.5" />
                            <span>Coding</span>
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
      </div>

      {/* MODAL FORMULIR PEMERIKSAAN OTOMATIS SESUAI JENIS PENDAFTARAN */}
      {selectedReg && selectedPatient && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedReg(null)}
          title={`Formulir Pemeriksaan ${selectedReg.type.toUpperCase()}`}
          maxWidth="max-w-4xl"
        >
          <div className="space-y-5 text-slate-800">
            {/* 1. Header Identitas Pasien (Otomatis Ditarik dari Pendaftaran, Tidak Diketik Ulang) */}
            <div className="p-4 bg-blue-50/70 rounded-2xl border border-blue-200">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-blue-200 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 text-base">{selectedPatient.name}</h3>
                    <p className="text-[11px] text-slate-600 font-medium">
                      NIK: <span className="font-mono font-bold text-slate-800">{selectedPatient.nik}</span> &bull; JK: <span className="font-bold">{selectedPatient.gender === 'M' || selectedPatient.gender === '1' || selectedPatient.gender === 'L' ? 'Laki-Laki' : 'Perempuan'}</span> &bull; Umur: <span className="font-bold">{calculateAge(selectedPatient.dob)}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <div className="text-[10px] text-slate-400 font-bold uppercase">No. Rekam Medis</div>
                    <div className="text-sm font-mono font-black text-blue-900 bg-white px-2.5 py-0.5 rounded-lg border border-blue-300">
                      {selectedPatient.noRM}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-slate-400 font-bold uppercase">No. Registrasi</div>
                    <div className="text-xs font-mono font-bold text-slate-800 bg-white px-2.5 py-1 rounded-lg border border-blue-200">
                      {selectedReg.id}
                    </div>
                  </div>
                </div>
              </div>

              {/* Data Kunjungan yang Ditarik dari Pendaftaran */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Jenis Pendaftaran:</span>
                  <span className="font-black text-blue-800">{selectedReg.type}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Poli / Ruangan:</span>
                  <span className="font-bold text-slate-800">{selectedReg.room || selectedReg.poli}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Tgl & Jam Masuk:</span>
                  <span className="font-mono font-bold text-slate-800">{selectedReg.date} 08:30 WIB</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Dokter DPJP:</span>
                  <span className="font-bold text-slate-800">{users.find(u => u.id === selectedReg.dpjp)?.name || 'dr. DPJP'}</span>
                </div>
              </div>
            </div>

            {/* 2. FORMULIR SESUAI JENIS LAYANAN (IGD | RAWAT JALAN | RAWAT INAP) */}

            {/* ============================================================= */}
            {/* FORMULIR PEMERIKSAAN IGD */}
            {/* ============================================================= */}
            {selectedReg.type === 'IGD' && (
              <div className="space-y-4 border border-rose-200 rounded-2xl p-4 bg-rose-50/20">
                <div className="flex items-center gap-2 border-b border-rose-200 pb-2">
                  <Ambulance className="w-5 h-5 text-rose-600" />
                  <h4 className="font-black text-rose-950 text-sm">Formulir Pemeriksaan Gawat Darurat (IGD)</h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Triase & Pemeriksaan Awal IGD:</label>
                    <input
                      type="text"
                      value={pemeriksaanAwal}
                      onChange={e => setPemeriksaanAwal(e.target.value)}
                      placeholder="Contoh: Triase Kuning (Emergensi), Kesadaran somnolen"
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-medium"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Kondisi Pasien Saat Datang:</label>
                    <input
                      type="text"
                      value={kondisiPasien}
                      onChange={e => setKondisiPasien(e.target.value)}
                      placeholder="Contoh: Akut, gelisah, sesak napas berat"
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 text-xs mb-1">Keluhan Utama & Kronologis Masuk IGD:</label>
                  <textarea
                    rows={2}
                    value={keluhanUtama}
                    onChange={e => setKeluhanUtama(e.target.value)}
                    placeholder="Tuliskan keluhan utama dan onset kejadian..."
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-medium"
                  />
                </div>

                {/* Tanda-tanda Vital IGD */}
                <div>
                  <label className="block font-bold text-slate-700 text-xs mb-1">Tanda-Tanda Vital (TTV) & GCS:</label>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold">TD (mmHg):</span>
                      <input
                        type="text"
                        value={`${tandaVital.sistole}/${tandaVital.diastole}`}
                        onChange={e => {
                          const [s, d] = e.target.value.split('/');
                          setTandaVital({ ...tandaVital, sistole: s || '120', diastole: d || '80' });
                        }}
                        className="w-full p-2 bg-white border border-slate-300 rounded-lg font-mono font-bold"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold">Nadi (x/m):</span>
                      <input
                        type="text"
                        value={tandaVital.heartRate}
                        onChange={e => setTandaVital({ ...tandaVital, heartRate: e.target.value })}
                        className="w-full p-2 bg-white border border-slate-300 rounded-lg font-mono font-bold"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold">RR (x/m):</span>
                      <input
                        type="text"
                        value={tandaVital.respRate}
                        onChange={e => setTandaVital({ ...tandaVital, respRate: e.target.value })}
                        className="w-full p-2 bg-white border border-slate-300 rounded-lg font-mono font-bold"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold">Suhu (°C):</span>
                      <input
                        type="text"
                        value={tandaVital.suhu}
                        onChange={e => setTandaVital({ ...tandaVital, suhu: e.target.value })}
                        className="w-full p-2 bg-white border border-slate-300 rounded-lg font-mono font-bold"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold">SpO2 (%):</span>
                      <input
                        type="text"
                        value={tandaVital.spo2}
                        onChange={e => setTandaVital({ ...tandaVital, spo2: e.target.value })}
                        className="w-full p-2 bg-white border border-slate-300 rounded-lg font-mono font-bold"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold">GCS:</span>
                      <input
                        type="text"
                        value={tandaVital.gcs}
                        onChange={e => setTandaVital({ ...tandaVital, gcs: e.target.value })}
                        className="w-full p-2 bg-white border border-slate-300 rounded-lg font-mono font-bold"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 text-xs mb-1">Pemeriksaan Fisik Kedaruratan:</label>
                  <textarea
                    rows={2}
                    value={pemeriksaanFisik}
                    onChange={e => setPemeriksaanFisik(e.target.value)}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-medium"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Diagnosis Utama IGD *:</label>
                    <input
                      type="text"
                      value={diagnosisUtama}
                      onChange={e => setDiagnosisUtama(e.target.value)}
                      placeholder="Contoh: I20.0 - Angina pektoris tidak stabil"
                      className="w-full p-2.5 bg-white border border-rose-300 rounded-xl font-bold text-rose-900"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Tindakan / Prosedur Gawat Darurat:</label>
                    <input
                      type="text"
                      value={tindakan}
                      onChange={e => setTindakan(e.target.value)}
                      placeholder="Contoh: 89.52 - EKG 12 Lead & Resusitasi O2"
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-medium"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ============================================================= */}
            {/* FORMULIR PEMERIKSAAN RAWAT JALAN */}
            {/* ============================================================= */}
            {selectedReg.type === 'Rawat Jalan' && (
              <div className="space-y-4 border border-blue-200 rounded-2xl p-4 bg-blue-50/20">
                <div className="flex items-center gap-2 border-b border-blue-200 pb-2">
                  <Stethoscope className="w-5 h-5 text-blue-600" />
                  <h4 className="font-black text-blue-950 text-sm">Formulir Pemeriksaan Rawat Jalan ({selectedReg.poli})</h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Keluhan Utama:</label>
                    <input
                      type="text"
                      value={keluhanUtama}
                      onChange={e => setKeluhanUtama(e.target.value)}
                      placeholder="Contoh: Kontrol rutin tekanan darah tinggi"
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-medium"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Riwayat Kesehatan / Alergi:</label>
                    <input
                      type="text"
                      value={riwayatKesehatan}
                      onChange={e => setRiwayatKesehatan(e.target.value)}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 text-xs mb-1">Anamnesis Dokter:</label>
                  <textarea
                    rows={2}
                    value={anamnesis}
                    onChange={e => setAnamnesis(e.target.value)}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-medium"
                  />
                </div>

                {/* Tanda Vital Ralan */}
                <div>
                  <label className="block font-bold text-slate-700 text-xs mb-1">Tanda-Tanda Vital (TTV):</label>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold">Tekanan Darah:</span>
                      <input
                        type="text"
                        value={`${tandaVital.sistole}/${tandaVital.diastole}`}
                        onChange={e => {
                          const [s, d] = e.target.value.split('/');
                          setTandaVital({ ...tandaVital, sistole: s || '120', diastole: d || '80' });
                        }}
                        className="w-full p-2 bg-white border border-slate-300 rounded-lg font-mono font-bold"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold">Nadi:</span>
                      <input
                        type="text"
                        value={tandaVital.heartRate}
                        onChange={e => setTandaVital({ ...tandaVital, heartRate: e.target.value })}
                        className="w-full p-2 bg-white border border-slate-300 rounded-lg font-mono font-bold"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold">Pernapasan:</span>
                      <input
                        type="text"
                        value={tandaVital.respRate}
                        onChange={e => setTandaVital({ ...tandaVital, respRate: e.target.value })}
                        className="w-full p-2 bg-white border border-slate-300 rounded-lg font-mono font-bold"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold">Suhu Tubuh:</span>
                      <input
                        type="text"
                        value={tandaVital.suhu}
                        onChange={e => setTandaVital({ ...tandaVital, suhu: e.target.value })}
                        className="w-full p-2 bg-white border border-slate-300 rounded-lg font-mono font-bold"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold">SpO2:</span>
                      <input
                        type="text"
                        value={tandaVital.spo2}
                        onChange={e => setTandaVital({ ...tandaVital, spo2: e.target.value })}
                        className="w-full p-2 bg-white border border-slate-300 rounded-lg font-mono font-bold"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 text-xs mb-1">Pemeriksaan Fisik:</label>
                  <textarea
                    rows={2}
                    value={pemeriksaanFisik}
                    onChange={e => setPemeriksaanFisik(e.target.value)}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-medium"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Diagnosis Utama Rawat Jalan *:</label>
                    <input
                      type="text"
                      value={diagnosisUtama}
                      onChange={e => setDiagnosisUtama(e.target.value)}
                      placeholder="Contoh: I10 - Hipertensi Esensial (Primer)"
                      className="w-full p-2.5 bg-white border border-blue-300 rounded-xl font-bold text-blue-900"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Tindakan / Prosedur Poliklinik:</label>
                    <input
                      type="text"
                      value={tindakan}
                      onChange={e => setTindakan(e.target.value)}
                      placeholder="Tindakan medis poliklinik..."
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Terapi / Obat:</label>
                    <input
                      type="text"
                      value={terapi}
                      onChange={e => setTerapi(e.target.value)}
                      placeholder="Contoh: Amlodipine 5mg 1x1 tab"
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-medium"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Edukasi Pasien & Catatan Dokter:</label>
                    <input
                      type="text"
                      value={edukasi}
                      onChange={e => setEdukasi(e.target.value)}
                      placeholder="Edukasi pola makan dan kontrol ulang..."
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-medium"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ============================================================= */}
            {/* FORMULIR PEMERIKSAAN RAWAT INAP */}
            {/* ============================================================= */}
            {selectedReg.type === 'Rawat Inap' && (
              <div className="space-y-4 border border-amber-200 rounded-2xl p-4 bg-amber-50/20">
                <div className="flex items-center gap-2 border-b border-amber-200 pb-2">
                  <Bed className="w-5 h-5 text-amber-600" />
                  <h4 className="font-black text-amber-950 text-sm">Formulir Pemeriksaan Rawat Inap ({selectedReg.room || 'Bangsal'})</h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Ruangan / Kamar Inap:</label>
                    <input
                      type="text"
                      disabled
                      value={selectedReg.room || 'Ruang Rawat Inap'}
                      className="w-full p-2.5 bg-slate-100 border border-slate-200 rounded-xl font-bold text-slate-700 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Perkembangan Kondisi Pasien:</label>
                    <input
                      type="text"
                      value={kondisiPasien}
                      onChange={e => setKondisiPasien(e.target.value)}
                      placeholder="Contoh: Demam mulai turun, toleransi makan bertahap membaik"
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 text-xs mb-1">Anamnesis & Catatan Perkembangan (CPPT):</label>
                  <textarea
                    rows={2}
                    value={cpptCatatan}
                    onChange={e => setCpptCatatan(e.target.value)}
                    placeholder="Tuliskan catatan perkembangan harian (S-O-A-P)..."
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-medium"
                  />
                </div>

                {/* TTV Rawat Inap */}
                <div>
                  <label className="block font-bold text-slate-700 text-xs mb-1">Monitoring TTV & Status Vital:</label>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold">TD (mmHg):</span>
                      <input
                        type="text"
                        value={`${tandaVital.sistole}/${tandaVital.diastole}`}
                        onChange={e => {
                          const [s, d] = e.target.value.split('/');
                          setTandaVital({ ...tandaVital, sistole: s || '120', diastole: d || '80' });
                        }}
                        className="w-full p-2 bg-white border border-slate-300 rounded-lg font-mono font-bold"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold">HR (bpm):</span>
                      <input
                        type="text"
                        value={tandaVital.heartRate}
                        onChange={e => setTandaVital({ ...tandaVital, heartRate: e.target.value })}
                        className="w-full p-2 bg-white border border-slate-300 rounded-lg font-mono font-bold"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold">RR (x/m):</span>
                      <input
                        type="text"
                        value={tandaVital.respRate}
                        onChange={e => setTandaVital({ ...tandaVital, respRate: e.target.value })}
                        className="w-full p-2 bg-white border border-slate-300 rounded-lg font-mono font-bold"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold">Suhu (°C):</span>
                      <input
                        type="text"
                        value={tandaVital.suhu}
                        onChange={e => setTandaVital({ ...tandaVital, suhu: e.target.value })}
                        className="w-full p-2 bg-white border border-slate-300 rounded-lg font-mono font-bold"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold">SpO2 (%):</span>
                      <input
                        type="text"
                        value={tandaVital.spo2}
                        onChange={e => setTandaVital({ ...tandaVital, spo2: e.target.value })}
                        className="w-full p-2 bg-white border border-slate-300 rounded-lg font-mono font-bold"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Diagnosis Utama Rawat Inap *:</label>
                    <input
                      type="text"
                      value={diagnosisUtama}
                      onChange={e => setDiagnosisUtama(e.target.value)}
                      placeholder="Contoh: A01.0 - Demam Tifoid"
                      className="w-full p-2.5 bg-white border border-amber-300 rounded-xl font-bold text-amber-900"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Diagnosis Sekunder (Komorbid / Komplikasi):</label>
                    <input
                      type="text"
                      value={diagnosisSekunder}
                      onChange={e => setDiagnosisSekunder(e.target.value)}
                      placeholder="Contoh: K29.7 - Gastritis kronis"
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Tindakan / Prosedur Perawatan:</label>
                    <input
                      type="text"
                      value={tindakan}
                      onChange={e => setTindakan(e.target.value)}
                      placeholder="Contoh: Terapi cairan infus RL 20 tpm"
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-medium"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Terapi / Instruksi DPJP:</label>
                    <input
                      type="text"
                      value={terapi}
                      onChange={e => setTerapi(e.target.value)}
                      placeholder="Contoh: Ciprofloxacin 500mg 2x1 tab, Ondansetron 4mg"
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-medium"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ACTION BUTTONS */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-200">
              <div className="text-xs text-slate-500 font-medium">
                Pemeriksa: <strong className="text-slate-800">{user?.name || 'dr. DPJP'}</strong>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedReg(null)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-all cursor-pointer"
                >
                  Tutup
                </button>
                <button
                  type="button"
                  onClick={() => handleSavePemeriksaan(false)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Pemeriksaan</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSavePemeriksaan(true)}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Simpan & Teruskan ke Coding</span>
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
