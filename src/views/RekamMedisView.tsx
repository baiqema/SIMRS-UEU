import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Modal } from '../components/Modal';
import { CPPTInputTable } from '../components/CPPTInputTable';
import { FormRawatJalan } from '../components/forms/FormRawatJalan';
import { FormIgd } from '../components/forms/FormIgd';
import { FormRawatInap } from '../components/forms/FormRawatInap';
import { TracerIgdModal } from '../components/TracerIgdModal';
import { AsuhanKeperawatanIgdModal } from '../components/AsuhanKeperawatanIgdModal';
import { EXTENDED_ICD10, EXTENDED_ICD9CM, ExtendedICD10, ExtendedICD9CM } from '../data/icdDatabase';
import { DigitalSignaturePad } from '../components/DigitalSignaturePad';
import Swal from 'sweetalert2';
import {
  Search, User, FileText, Activity, Clock, ShieldCheck, Stethoscope,
  HeartPulse, FilePlus, Calendar, Plus, CheckCircle2, ChevronRight, ChevronLeft,
  AlertCircle, AlertTriangle, Pill, Building2, Eye, Filter, UserCheck,
  Check, FileCheck, ClipboardList, Thermometer, Droplets, ShieldAlert,
  Flame, Utensils, Beaker, Radio, FileDigit, Scissors, Heart, FileSpreadsheet,
  ArrowRight, Download, Printer, Barcode, Lock, Unlock, Sparkles, Tag,
  Layers, QrCode, BookmarkCheck, XCircle, Info, Edit3, PenTool, RotateCcw
} from 'lucide-react';
import { Patient, Registration, CPPT, MedicalRecord, Coding } from '../types';

// List of all 26 official RME Forms as requested
const ALL_RME_FORMS = [
  { id: 'f01', code: 'AARJ', name: 'Asesmen Awal Rawat Jalan', category: 'Asesmen', icon: FileText },
  { id: 'f02', code: 'AARI', name: 'Asesmen Awal Rawat Inap', category: 'Asesmen', icon: FileSpreadsheet },
  { id: 'f03', code: 'AIGD', name: 'Asesmen IGD & Triase', category: 'Asesmen', icon: ShieldAlert },
  { id: 'f04', code: 'SOAP', name: 'SOAP Medis Dokter DPJP', category: 'Catatan', icon: Stethoscope },
  { id: 'f05', code: 'CPPT', name: 'CPPT (Catatan Perkembangan Terintegrasi)', category: 'Catatan', icon: Activity },
  { id: 'f06', code: 'ASKEP', name: 'Asuhan Keperawatan (SDKI/SLKI/SIKI)', category: 'Catatan', icon: ClipboardList },
  { id: 'f07', code: 'TRACER', name: 'Tracer Berkas Rekam Medis (Outguide)', category: 'Pelacakan', icon: ShieldAlert },
  { id: 'f08', code: 'CODING', name: 'Formulir Koding ICD-10 & ICD-9-CM', category: 'Koding', icon: Barcode },
  { id: 'f09', code: 'RMED', name: 'Resume Medis & Ringkasan Pulang', category: 'Resume', icon: FileCheck },
  { id: 'f10', code: 'CKEB', name: 'Catatan Kebidanan & Neonatus', category: 'Catatan', icon: HeartPulse },
  { id: 'f11', code: 'EDUK', name: 'Edukasi Pasien & Keluarga Terintegrasi', category: 'Edukasi', icon: UserCheck },
  { id: 'f12', code: 'INFORM', name: 'Persetujuan Tindakan (Informed Consent)', category: 'Persetujuan', icon: CheckCircle2 },
  { id: 'f13', code: 'TTV', name: 'Monitoring Tanda-Tanda Vital (TTV)', category: 'Monitoring', icon: Thermometer },
  { id: 'f14', code: 'INTAKE', name: 'Intake & Output Keseimbangan Cairan', category: 'Monitoring', icon: Droplets },
  { id: 'f15', code: 'NYERI', name: 'Pengkajian Skala Nyeri (VAS/NRS/CPOT)', category: 'Pengkajian', icon: Flame },
  { id: 'f16', code: 'JATUH', name: 'Pengkajian Risiko Jatuh Morse/Humpty', category: 'Pengkajian', icon: AlertTriangle },
  { id: 'f17', code: 'DEKUB', name: 'Pengkajian Risiko Dekubitus Braden', category: 'Pengkajian', icon: ShieldAlert },
  { id: 'f18', code: 'GIZI', name: 'Pengkajian Gizi & Skrining Nutrisi MST', category: 'Pengkajian', icon: Utensils },
  { id: 'f19', code: 'ORD_LAB', name: 'Order Pemeriksaan Laboratorium LIS', category: 'Penunjang', icon: Beaker },
  { id: 'f20', code: 'ORD_RAD', name: 'Order Radiologi & Pemeriksaan Imaging', category: 'Penunjang', icon: Radio },
  { id: 'f21', code: 'RESEP', name: 'Resep Elektronik Dokter (e-Prescribing)', category: 'Farmasi', icon: Pill },
  { id: 'f22', code: 'HASIL_LAB', name: 'Hasil Laboratorium & Validasi Kritis', category: 'Hasil', icon: FileDigit },
  { id: 'f23', code: 'HASIL_RAD', name: 'Hasil & Ekspertise Radiologi', category: 'Hasil', icon: Radio },
  { id: 'f24', code: 'OP', name: 'Laporan Operasi & Tindakan Bedah', category: 'Tindakan', icon: Scissors },
  { id: 'f25', code: 'ANES', name: 'Status Anestesi & Sedasi Pasien', category: 'Tindakan', icon: Heart },
  { id: 'f26', code: 'DISCHARGE', name: 'Discharge Planning (Perencanaan Pulang)', category: 'Perencanaan', icon: Building2 },
];

export const RekamMedisView: React.FC = () => {
  const {
    patients, registrations, medicalRecords, cppt, coding, user, params,
    addMedicalRecord, updateMedicalRecord, addCPPT, addCoding, updateCoding, lockCoding,
    getPatient, getReg, getUser, canEditPage
  } = useApp();

  const isEditable = canEditPage('rekammedis');

  // Search & Master Pasien State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState<string>(() => {
    if (params?.patientId) return params.patientId;
    const sorted = [...patients].sort((a, b) => parseInt(a.noRM.replace(/\D/g, '') || '0', 10) - parseInt(b.noRM.replace(/\D/g, '') || '0', 10));
    return sorted.length > 0 ? sorted[0].id : '';
  });

  const [selectedRegId, setSelectedRegId] = useState<string>(() => {
    if (params?.regId) return params.regId;
    return '';
  });

  const [activeTab, setActiveTab] = useState<'identitas' | 'rawatjalan' | 'igd' | 'rawatinap' | 'soap' | 'cppt' | 'keperawatan' | 'coding' | 'tracer' | 'formulir' | 'riwayat'>(() => {
    if (params?.initialTab) return params.initialTab as any;
    return 'identitas';
  });

  // Tab Bar Horizontal Scroll & Geser State
  const tabBarRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [thumbRatio, setThumbRatio] = useState(0.35);

  const updateScrollMetrics = () => {
    if (!tabBarRef.current) return;
    const el = tabBarRef.current;
    const maxScroll = el.scrollWidth - el.clientWidth;
    if (maxScroll <= 2) {
      setScrollProgress(0);
      setCanScrollLeft(false);
      setCanScrollRight(false);
      setThumbRatio(1);
    } else {
      const pct = Math.min(100, Math.max(0, (el.scrollLeft / maxScroll) * 100));
      setScrollProgress(pct);
      setCanScrollLeft(el.scrollLeft > 4);
      setCanScrollRight(el.scrollLeft < maxScroll - 4);
      setThumbRatio(Math.max(0.18, Math.min(0.82, el.clientWidth / el.scrollWidth)));
    }
  };

  useEffect(() => {
    const el = tabBarRef.current;
    if (!el) return;
    updateScrollMetrics();
    el.addEventListener('scroll', updateScrollMetrics, { passive: true });
    window.addEventListener('resize', updateScrollMetrics);
    return () => {
      el.removeEventListener('scroll', updateScrollMetrics);
      window.removeEventListener('resize', updateScrollMetrics);
    };
  }, []);

  const handleScrollTabs = (delta: number) => {
    if (tabBarRef.current) {
      tabBarRef.current.scrollBy({ left: delta, behavior: 'smooth' });
    }
  };

  const handleSliderChange = (newPct: number) => {
    if (!tabBarRef.current) return;
    const el = tabBarRef.current;
    const maxScroll = el.scrollWidth - el.clientWidth;
    el.scrollLeft = (newPct / 100) * maxScroll;
    setScrollProgress(newPct);
  };

  // Modals
  const [isTracerModalOpen, setIsTracerModalOpen] = useState(false);
  const [isAskepModalOpen, setIsAskepModalOpen] = useState(false);

  // Medical Record / SOAP Form State (with Plan & TTD Perawat/Dokter)
  const [editingMRId, setEditingMRId] = useState<string | null>(null);
  const [anamnesis, setAnamnesis] = useState('');
  const [physicalExam, setPhysicalExam] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [plan, setPlan] = useState('');
  const [nurseNotes, setNurseNotes] = useState('');
  const [systolic, setSystolic] = useState('120');
  const [diastolic, setDiastolic] = useState('80');
  const [heartRate, setHeartRate] = useState('80');
  const [respRate, setRespRate] = useState('20');
  const [temperature, setTemperature] = useState('36.5');
  const [spo2, setSpo2] = useState('98');

  // Signatures for Nurse and Doctor
  const [nurseName, setNurseName] = useState('Ns. Rina Wulandari, S.Kep');
  const [nurseIdentifier, setNurseIdentifier] = useState('STR: 12.04.5.2.1.20.78912');
  const [nurseSignature, setNurseSignature] = useState('');
  const [doctorName, setDoctorName] = useState('dr. Budi Santoso, Sp.PD');
  const [doctorIdentifier, setDoctorIdentifier] = useState('SIP: 446/1029/DISKES/2023');
  const [doctorSignature, setDoctorSignature] = useState('');

  // Interactive Large Coding Workspace State
  const [icd10Search, setIcd10Search] = useState('');
  const [icd9Search, setIcd9Search] = useState('');
  const [selectedIcd10, setSelectedIcd10] = useState<{ code: string; desc: string }[]>([]);
  const [primaryIcd10Index, setPrimaryIcd10Index] = useState(0);
  const [selectedIcd9, setSelectedIcd9] = useState<{ code: string; desc: string }[]>([]);
  const [codingNote, setCodingNote] = useState('');
  const [isAutoDetected, setIsAutoDetected] = useState(false);

  // Interactive Tracer State
  const [tracerBorrowerUnit, setTracerBorrowerUnit] = useState('IGD / Poli Penyakit Dalam');
  const [tracerPurpose, setTracerPurpose] = useState('Pemeriksaan & Pengobatan Klinis');
  const [tracerStatus, setTracerStatus] = useState<'Di Ruang Filing' | 'Keluar / Dipinjam' | 'Diterima di Ruangan' | 'Kembali'>('Diterima di Ruangan');
  const [tracerOfficer, setTracerOfficer] = useState(user?.name || 'Petugas Filing RMIK');

  // Handle incoming params changes
  useEffect(() => {
    if (params?.patientId) {
      setSelectedPatientId(params.patientId);
    }
    if (params?.regId) {
      setSelectedRegId(params.regId);
    }
    if (params?.initialTab) {
      setActiveTab(params.initialTab as any);
    }
  }, [params]);

  const selectedPatient = patients.find(p => p.id === selectedPatientId) || patients[0];

  // Get patient's registrations
  const patientRegistrations = registrations.filter(r => r?.patientId === selectedPatient?.id);

  // Ensure active registration
  const activeReg = patientRegistrations.find(r => r.id === selectedRegId) || patientRegistrations[0] || null;

  // Active Medical Record
  const activeMR = medicalRecords.find(mr => mr.regId === activeReg?.id) || null;

  // Active Coding record
  const activeCoding = coding.find(c => (activeMR && c.mrId === activeMR.id) || (activeReg && c.regId === activeReg.id)) || null;

  // Sync Coding Workspace when active patient / registration changes
  useEffect(() => {
    if (activeCoding) {
      const icd10List = (activeCoding.icd10 || []).map((code, idx) => ({
        code,
        desc: (activeCoding.icd10Desc && activeCoding.icd10Desc[idx]) || code
      }));
      const icd9List = (activeCoding.icd9cm || []).map((code, idx) => ({
        code,
        desc: (activeCoding.icd9cmDesc && activeCoding.icd9cmDesc[idx]) || code
      }));
      setSelectedIcd10(icd10List);
      setSelectedIcd9(icd9List);
      setCodingNote(activeCoding.note || '');
      setPrimaryIcd10Index(0);
    } else if (activeMR) {
      // Auto pre-populate initial diagnosis if present
      if (activeMR.diagnosis) {
        const diagStr = activeMR.diagnosis;
        const matched = EXTENDED_ICD10.find(i => diagStr.toLowerCase().includes(i.code.toLowerCase()) || diagStr.toLowerCase().includes(i.desc.toLowerCase()));
        if (matched) {
          setSelectedIcd10([{ code: matched.code, desc: matched.desc }]);
        } else {
          setSelectedIcd10([{ code: 'I10', desc: 'Hipertensi Esensial (Primer)' }]);
        }
      } else {
        setSelectedIcd10([]);
      }
      setSelectedIcd9([]);
      setCodingNote('');
    }
  }, [activeMR, activeCoding, activeReg]);

  // Filtered Patients for Quick Selection List
  const filteredPatients = patients.filter(p => {
    const q = searchQuery.toLowerCase();
    const cleanRM = (p.noRM || '').replace(/\D/g, '');
    return (
      p.name.toLowerCase().includes(q) ||
      cleanRM.includes(q) ||
      (p.noRM || '').toLowerCase().includes(q) ||
      (p.nik || '').includes(q)
    );
  });

  // Calculate Missing / Completed Forms for the current active registration
  const completedForms: string[] = [];
  const missingForms: string[] = [];

  // Logic to determine form completion
  if (activeReg) {
    if (activeReg.type === 'IGD') {
      completedForms.push('AIGD'); // Asesmen IGD
    } else if (activeReg.type === 'Rawat Inap') {
      completedForms.push('AARI'); // Asesmen Ranap
    } else {
      completedForms.push('AARJ'); // Asesmen Rajal
    }

    if (activeMR) {
      completedForms.push('SOAP');
    } else {
      missingForms.push('SOAP');
    }

    const patientCppts = cppt.filter(c => c.mrId === activeMR?.id);
    if (patientCppts.length > 0) {
      completedForms.push('CPPT');
    } else {
      missingForms.push('CPPT');
    }

    if (activeCoding) {
      completedForms.push('CODING');
    } else {
      missingForms.push('CODING');
    }

    // Default other standard forms check
    completedForms.push('INFORM', 'TTV', 'TRACER');
    missingForms.push('ASKEP', 'RMED', 'DISCHARGE');
  }

  // Auto sync DPJP & Perawat names
  useEffect(() => {
    if (activeReg?.dpjp) {
      const doc = getUser(activeReg.dpjp);
      if (doc) {
        setDoctorName(doc.name);
        setDoctorIdentifier(`SIP: 446/${doc.id}/DISKES/2023`);
      }
    } else if (user?.roleId === 'dokter') {
      setDoctorName(user.name);
      setDoctorIdentifier(`SIP: 446/${user.id}/DISKES/2023`);
    }
    if (user?.roleId === 'perawat') {
      setNurseName(user.name);
      setNurseIdentifier(`STR: 12.04.5.2.1.20.${user.id}`);
    }
  }, [activeReg?.dpjp, user]);

  // Handle Start New SOAP
  const handleStartNewSoap = () => {
    setEditingMRId(null);
    setAnamnesis('');
    setPhysicalExam('');
    setDiagnosis('');
    setPlan('');
    setNurseNotes('');
    setSystolic('120');
    setDiastolic('80');
    setHeartRate('80');
    setRespRate('20');
    setTemperature('36.5');
    setSpo2('98');
    setDoctorSignature('');
    setNurseSignature('');
    setActiveTab('soap');
  };

  // Handle Start Editing Existing SOAP
  const handleStartEditSoap = (mr: MedicalRecord) => {
    setEditingMRId(mr.id);
    setAnamnesis(mr.anamnesis || '');
    setDiagnosis(mr.diagnosis || '');
    setPlan(mr.plan || '');
    setNurseNotes(mr.nurseNotes || '');

    // Extract TTV
    let remainingExam = mr.physicalExam || '';
    const tdMatch = remainingExam.match(/TD:\s*(\d+)\/(\d+)\s*mmHg/i);
    if (tdMatch) {
      setSystolic(tdMatch[1]);
      setDiastolic(tdMatch[2]);
    }
    const hrMatch = remainingExam.match(/Nadi:\s*(\d+)x\/m/i);
    if (hrMatch) setHeartRate(hrMatch[1]);
    const rrMatch = remainingExam.match(/RR:\s*(\d+)x\/m/i);
    if (rrMatch) setRespRate(rrMatch[1]);
    const tempMatch = remainingExam.match(/Suhu:\s*([\d.]+) C/i);
    if (tempMatch) setTemperature(tempMatch[1]);
    const spo2Match = remainingExam.match(/SpO2:\s*(\d+)%/i);
    if (spo2Match) setSpo2(spo2Match[1]);

    remainingExam = remainingExam
      .replace(/TD:.*?mmHg[,\.]\s*/gi, '')
      .replace(/Nadi:.*?x\/m[,\.]\s*/gi, '')
      .replace(/RR:.*?x\/m[,\.]\s*/gi, '')
      .replace(/Suhu:.*?C[,\.]\s*/gi, '')
      .replace(/SpO2:.*?[%][,\.]\s*/gi, '')
      .trim();

    setPhysicalExam(remainingExam);

    if (mr.doctorName) setDoctorName(mr.doctorName);
    if (mr.doctorSignature) setDoctorSignature(mr.doctorSignature);
    if (mr.nurseName) setNurseName(mr.nurseName);
    if (mr.nurseSignature) setNurseSignature(mr.nurseSignature);

    setActiveTab('soap');
  };

  // Handle Medical Record Save
  const handleSaveMedicalRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeReg) {
      Swal.fire('Peringatan', 'Silakan pilih registrasi pasien terlebih dahulu', 'warning');
      return;
    }

    const ttvFormatted = `TD: ${systolic}/${diastolic} mmHg, Nadi: ${heartRate}x/m, RR: ${respRate}x/m, Suhu: ${temperature} C, SpO2: ${spo2}%. ${physicalExam}`;

    if (editingMRId) {
      updateMedicalRecord(editingMRId, {
        anamnesis,
        physicalExam: ttvFormatted,
        diagnosis,
        plan,
        nurseNotes,
        doctorName,
        doctorSignature,
        nurseName,
        nurseSignature,
        diagnosisStatus: 'Verified',
        updatedAt: new Date().toISOString()
      });

      Swal.fire({
        icon: 'success',
        title: 'Pemeriksaan SOAP Berhasil Diperbarui!',
        text: `Data SOAP, Rencana Terapi (Plan), dan Tanda Tangan No. RM ${selectedPatient.noRM} berhasil diperbarui.`,
        timer: 1800,
        showConfirmButton: false
      });
      setEditingMRId(null);
    } else {
      const newMR: MedicalRecord = {
        id: `MR${Date.now().toString().slice(-4)}`,
        regId: activeReg.id,
        noRM: selectedPatient.noRM,
        anamnesis,
        physicalExam: ttvFormatted,
        diagnosis,
        plan,
        nurseNotes,
        diagnosisStatus: 'Verified',
        doctorId: user?.id || 'U002',
        doctorName,
        doctorSignature,
        nurseId: user?.roleId === 'perawat' ? user.id : 'N001',
        nurseName,
        nurseSignature,
        date: new Date().toISOString().substring(0, 10)
      };

      addMedicalRecord(newMR);

      Swal.fire({
        icon: 'success',
        title: 'Pemeriksaan SOAP Berhasil Disimpan',
        text: `Data SOAP, Rencana Terapi (Plan), dan Tanda Tangan No. RM ${selectedPatient.noRM} tersimpan ke Rekam Medis Elektronik.`,
        timer: 1800,
        showConfirmButton: false
      });
    }

    setActiveTab('identitas');
  };

  // Auto-Detect ICD-10 and ICD-9-CM from Medical Record notes
  const handleAutoDetectCoding = () => {
    if (!activeMR) {
      Swal.fire('Info', 'Belum ada catatan medis / diagnosis dokter untuk dideteksi.', 'info');
      return;
    }

    const textToAnalyze = `${activeMR.anamnesis || ''} ${activeMR.physicalExam || ''} ${activeMR.diagnosis || ''}`.toLowerCase();
    
    // Scan ICD-10
    const matchedIcd10: { code: string; desc: string }[] = [];
    EXTENDED_ICD10.forEach(item => {
      const codeMatch = textToAnalyze.includes(item.code.toLowerCase());
      const descWords = item.desc.toLowerCase().split(' ').filter(w => w.length > 4);
      const descMatch = descWords.some(word => textToAnalyze.includes(word));
      if (codeMatch || descMatch) {
        if (!matchedIcd10.some(m => m.code === item.code)) {
          matchedIcd10.push({ code: item.code, desc: item.desc });
        }
      }
    });

    // Scan ICD-9-CM
    const matchedIcd9: { code: string; desc: string }[] = [];
    EXTENDED_ICD9CM.forEach(item => {
      const codeMatch = textToAnalyze.includes(item.code.toLowerCase());
      const descWords = item.desc.toLowerCase().split(' ').filter(w => w.length > 4);
      const descMatch = descWords.some(word => textToAnalyze.includes(word));
      if (codeMatch || descMatch) {
        if (!matchedIcd9.some(m => m.code === item.code)) {
          matchedIcd9.push({ code: item.code, desc: item.desc });
        }
      }
    });

    if (matchedIcd10.length === 0) {
      matchedIcd10.push({ code: 'I10', desc: 'Hipertensi Esensial (Primer)' });
    }
    if (matchedIcd9.length === 0) {
      matchedIcd9.push({ code: '89.13', desc: 'Elektrokardiogram (EKG)' });
    }

    setSelectedIcd10(matchedIcd10);
    setSelectedIcd9(matchedIcd9);
    setIsAutoDetected(true);

    Swal.fire({
      icon: 'success',
      title: 'Deteksi Otomatis Berhasil!',
      text: `Ditemukan ${matchedIcd10.length} kode ICD-10 dan ${matchedIcd9.length} kode ICD-9-CM dari rekam medis dokter.`,
      timer: 1800,
      showConfirmButton: false
    });
  };

  // Add ICD-10 Code
  const handleAddIcd10 = (item: ExtendedICD10) => {
    if (!selectedIcd10.some(i => i.code === item.code)) {
      setSelectedIcd10(prev => [...prev, { code: item.code, desc: item.desc }]);
    }
    setIcd10Search('');
  };

  // Remove ICD-10 Code
  const handleRemoveIcd10 = (code: string) => {
    setSelectedIcd10(prev => prev.filter(i => i.code !== code));
  };

  // Add ICD-9-CM Code
  const handleAddIcd9 = (item: ExtendedICD9CM) => {
    if (!selectedIcd9.some(i => i.code === item.code)) {
      setSelectedIcd9(prev => [...prev, { code: item.code, desc: item.desc }]);
    }
    setIcd9Search('');
  };

  // Remove ICD-9-CM Code
  const handleRemoveIcd9 = (code: string) => {
    setSelectedIcd9(prev => prev.filter(i => i.code !== code));
  };

  // Save Coding
  const handleSaveCoding = (lockStatus: 'Draft' | 'Locked' = 'Draft') => {
    if (!activeReg) {
      Swal.fire('Peringatan', 'Silakan pilih registrasi pasien terlebih dahulu', 'warning');
      return;
    }
    if (selectedIcd10.length === 0) {
      Swal.fire('Peringatan', 'Minimal harus ada 1 diagnosis ICD-10', 'warning');
      return;
    }

    const icd10Codes = selectedIcd10.map(i => i.code);
    const icd10Descriptions = selectedIcd10.map(i => i.desc);
    const icd9Codes = selectedIcd9.map(i => i.code);
    const icd9Descriptions = selectedIcd9.map(i => i.desc);

    if (activeCoding) {
      updateCoding(activeCoding.id, {
        icd10: icd10Codes,
        icd10Desc: icd10Descriptions,
        icd9cm: icd9Codes,
        icd9cmDesc: icd9Descriptions,
        note: codingNote,
        status: lockStatus,
        date: new Date().toISOString().substring(0, 10)
      });
    } else {
      addCoding({
        mrId: activeMR ? activeMR.id : `MR_${activeReg.id}`,
        regId: activeReg.id,
        icd10: icd10Codes,
        icd10Desc: icd10Descriptions,
        icd9cm: icd9Codes,
        icd9cmDesc: icd9Descriptions,
        coderId: user?.id || 'U006',
        date: new Date().toISOString().substring(0, 10),
        status: lockStatus,
        note: codingNote
      });
    }

    Swal.fire({
      icon: 'success',
      title: lockStatus === 'Locked' ? 'Koding Berhasil Dikunci!' : 'Koding Tersimpan',
      text: `Data Koding Rekam Medis No. RM ${selectedPatient.noRM} berhasil diperbarui.`,
      timer: 1800,
      showConfirmButton: false
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-3 sm:p-6 space-y-5">
      {/* Top Patient Bar & Quick Selector */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Patient Search & Dropdown */}
          <div className="flex items-center gap-3 flex-1">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-lg shrink-0 shadow-xs">
              <User className="w-6 h-6" />
            </div>

            <div className="space-y-1 flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 font-mono font-black text-xs border border-blue-200">
                  NO. RM {selectedPatient?.noRM || '000001'}
                </span>
                <span className="font-bold text-slate-900 text-base truncate">
                  {selectedPatient?.name || 'Pilih Pasien'}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  ({selectedPatient?.gender === 'M' ? 'Laki-laki' : 'Perempuan'}, {selectedPatient?.dob ? new Date().getFullYear() - new Date(selectedPatient.dob).getFullYear() : 30} thn)
                </span>
                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[11px] font-bold rounded border border-emerald-200">
                  {selectedPatient?.insuranceType || 'BPJS'}
                </span>
              </div>

              <div className="text-xs text-slate-500 flex items-center gap-3 flex-wrap">
                <span>NIK: <strong className="font-mono text-slate-700">{selectedPatient?.nik || '-'}</strong></span>
                <span>Poli/Unit: <strong className="text-slate-700">{activeReg?.poli || 'IGD'}</strong></span>
                <span>Tgl Masuk: <strong className="text-slate-700">{activeReg?.date || '-'}</strong></span>
                <span>Status Rawat: <strong className="text-blue-700">{activeReg?.status || 'Dirawat'}</strong></span>
              </div>
            </div>
          </div>

          {/* Patient Switcher Dropdown */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="relative min-w-[240px]">
              <select
                value={selectedPatientId}
                onChange={(e) => {
                  setSelectedPatientId(e.target.value);
                  const firstReg = registrations.find(r => r.patientId === e.target.value);
                  if (firstReg) setSelectedRegId(firstReg.id);
                }}
                className="w-full bg-slate-50 text-slate-800 text-xs font-bold py-2.5 px-3 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 focus:bg-white cursor-pointer shadow-xs"
              >
                {[...patients].sort((a, b) => parseInt(a.noRM.replace(/\D/g, '') || '0', 10) - parseInt(b.noRM.replace(/\D/g, '') || '0', 10)).map(p => (
                  <option key={p.id} value={p.id}>
                    [{p.noRM}] {p.name} ({p.insuranceType})
                  </option>
                ))}
              </select>
            </div>

            {/* Quick Action Button to Open Asuhan Keperawatan Modal */}
            <button
              onClick={() => setIsAskepModalOpen(true)}
              className="px-3 py-2 bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
              title="Formulir Asuhan Keperawatan IGD Lengkap"
            >
              <ClipboardList className="w-3.5 h-3.5 text-purple-600" />
              <span>Modal Askep</span>
            </button>

            {/* Quick Action Button to Open Tracer Modal */}
            <button
              onClick={() => setIsTracerModalOpen(true)}
              className="px-3 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
              title="Cetak Tracer Rekam Medis"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
              <span>Tracer Modal</span>
            </button>
          </div>
        </div>
      </div>

      {/* PROMINENT STATUS BANNER: KELENGKAPAN REKAM MEDIS & STATUS KODING */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card 1: Status Formulir RME */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-blue-600" />
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                Kelengkapan Berkas & Formulir RME
              </h3>
            </div>
            <span className="text-[11px] font-black px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              {completedForms.length} / {completedForms.length + missingForms.length} Terisi ({Math.round((completedForms.length / (completedForms.length + missingForms.length)) * 100)}%)
            </span>
          </div>

          {/* Missing Forms Warning Badges */}
          <div className="space-y-1.5">
            <div className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
              <span>Formulir yang Belum Diisi:</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {missingForms.length > 0 ? (
                missingForms.map(fCode => {
                  const formMeta = ALL_RME_FORMS.find(f => f.code === fCode);
                  return (
                    <button
                      key={fCode}
                      onClick={() => {
                        if (fCode === 'SOAP') setActiveTab('soap');
                        else if (fCode === 'CPPT') setActiveTab('cppt');
                        else if (fCode === 'ASKEP') setActiveTab('keperawatan');
                        else if (fCode === 'CODING') setActiveTab('coding');
                        else setActiveTab('formulir');
                      }}
                      className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                      <span>{formMeta ? formMeta.name : fCode}</span>
                      <ArrowRight className="w-2.5 h-2.5 text-amber-600" />
                    </button>
                  );
                })
              ) : (
                <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Semua formulir klinis terisi lengkap.
                </span>
              )}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-500 font-medium">Formulir Terisi: <strong>{completedForms.join(', ')}</strong></span>
            <button
              onClick={() => setActiveTab('formulir')}
              className="text-blue-600 font-bold hover:underline"
            >
              Lihat 26 Formulir &rarr;
            </button>
          </div>
        </div>

        {/* Card 2: Status Koding Diagnosa & Prosedur */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Barcode className="w-4 h-4 text-cyan-600" />
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                Status Koding ICD-10 & ICD-9-CM
              </h3>
            </div>
            {activeCoding ? (
              <span className={`text-[11px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1 border ${
                activeCoding.status === 'Locked'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-cyan-50 text-cyan-700 border-cyan-200'
              }`}>
                {activeCoding.status === 'Locked' ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                {activeCoding.status === 'Locked' ? 'TERKUNCI (FINAL)' : 'DRAFT KODING'}
              </span>
            ) : (
              <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                BELUM DIKODING
              </span>
            )}
          </div>

          {/* Coding Summary Display */}
          <div className="space-y-1.5">
            {activeCoding ? (
              <div className="space-y-1">
                <div className="text-xs text-slate-800 font-bold flex items-center gap-1.5">
                  <span className="text-amber-500 font-black">★ Utama:</span>
                  <span className="font-mono text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                    {activeCoding.icd10?.[0] || '-'}
                  </span>
                  <span className="truncate">{activeCoding.icd10Desc?.[0] || 'Diagnosis Utama'}</span>
                </div>
                {activeCoding.icd9cm && activeCoding.icd9cm.length > 0 && (
                  <div className="text-[11px] text-slate-600 font-medium flex items-center gap-1.5">
                    <span>Tindakan:</span>
                    <span className="font-mono text-cyan-700 font-bold">
                      {activeCoding.icd9cm.join(', ')}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-500">
                Pasien ini belum memiliki rekaman koding resmi ICD-10 / ICD-9-CM. Buka workspace koding untuk auto-detect dan simpan koding.
              </p>
            )}
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-500 font-medium">
              Petugas: <strong>{activeCoding ? 'Perekam Medis (Coder)' : '-'}</strong>
            </span>
            <button
              onClick={() => setActiveTab('coding')}
              className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1"
            >
              <Barcode className="w-3 h-3" />
              <span>{activeCoding ? 'Edit Koding' : 'Lakukan Koding Sekarang'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Single-Page Navigation Tabs */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        {/* Menu Tabs Row */}
        <div
          ref={tabBarRef}
          className="flex items-center overflow-x-auto scrollbar-none bg-slate-50/70 p-1.5 gap-1 scroll-smooth"
        >
          {[
            { id: 'identitas', label: 'Ringkasan RME', icon: FileText },
            { id: 'rawatjalan', label: 'Asesmen Rawat Jalan', icon: Stethoscope },
            { id: 'igd', label: 'Asesmen IGD & Triase', icon: ShieldAlert },
            { id: 'rawatinap', label: 'Asesmen Rawat Inap', icon: FileSpreadsheet },
            { id: 'soap', label: 'Pemeriksaan Medis (SOAP)', icon: Stethoscope },
            { id: 'cppt', label: 'CPPT Terintegrasi', icon: Activity },
            { id: 'keperawatan', label: 'Asuhan Keperawatan', icon: ClipboardList },
            { id: 'coding', label: 'Workspace Koding (ICD-10 & 9)', icon: Barcode },
            { id: 'tracer', label: 'Tracer Berkas RM', icon: ShieldAlert },
            { id: 'formulir', label: '26 Formulir RME', icon: Layers },
            { id: 'riwayat', label: 'Riwayat Kunjungan', icon: Clock },
          ].map(tab => {
            const IconComp = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-white hover:text-slate-900'
                }`}
              >
                <IconComp className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
                {tab.id === 'coding' && !activeCoding && (
                  <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0"></span>
                )}
              </button>
            );
          })}
        </div>

        {/* MENU GESER PEMERIKSAAN RAWAT JALAN (HORIZONTAL SLIDER TRACK WITH ARROWS) */}
        <div className="bg-slate-100/95 border-y border-slate-200 px-3 py-1.5 flex items-center gap-2 select-none shadow-2xs">
          {/* Tombol Geser Kiri (◄) */}
          <button
            type="button"
            onClick={() => handleScrollTabs(-260)}
            disabled={!canScrollLeft}
            title="Geser Menu ke Kiri"
            className={`w-7 h-6 flex items-center justify-center rounded-md transition-all cursor-pointer shrink-0 ${
              canScrollLeft
                ? 'bg-slate-700 hover:bg-slate-900 active:scale-90 text-white shadow-2xs'
                : 'bg-slate-300 text-slate-400 cursor-not-allowed opacity-60'
            }`}
          >
            <span className="text-[12px] leading-none font-bold">◄</span>
          </button>

          {/* Slider Track Geser Menu (Draggable / Clickable Track matching screenshot) */}
          <div
            className="flex-1 h-5 bg-slate-200/90 hover:bg-slate-200 rounded-full relative flex items-center px-0.5 cursor-pointer border border-slate-300 shadow-inner group"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const clickX = e.clientX - rect.left;
              const pct = Math.min(100, Math.max(0, (clickX / rect.width) * 100));
              handleSliderChange(pct);
            }}
            title="Klik atau geser untuk menggeser menu pemeriksaan rawat jalan"
          >
            {/* Draggable Thumb Indicator */}
            <div
              style={{
                width: `${thumbRatio * 100}%`,
                left: `calc(${scrollProgress}% * ${1 - thumbRatio})`
              }}
              className="h-3.5 bg-slate-600 group-hover:bg-slate-700 active:bg-slate-800 rounded-full absolute shadow-sm transition-all duration-75 flex items-center justify-center cursor-grab active:cursor-grabbing"
            >
              <div className="w-5 h-1 bg-slate-400/90 rounded-full"></div>
            </div>

            {/* Range input overlay for smooth touch/drag & mouse sliding */}
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={scrollProgress}
              onChange={(e) => handleSliderChange(parseFloat(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-10"
              aria-label="Geser Menu Pemeriksaan Rawat Jalan"
            />
          </div>

          {/* Tombol Geser Kanan (►) */}
          <button
            type="button"
            onClick={() => handleScrollTabs(260)}
            disabled={!canScrollRight}
            title="Geser Menu ke Kanan"
            className={`w-7 h-6 flex items-center justify-center rounded-md transition-all cursor-pointer shrink-0 ${
              canScrollRight
                ? 'bg-slate-700 hover:bg-slate-900 active:scale-90 text-white shadow-2xs'
                : 'bg-slate-300 text-slate-400 cursor-not-allowed opacity-60'
            }`}
          >
            <span className="text-[12px] leading-none font-bold">►</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-4 sm:p-6">
          {/* TAB 1: IDENTITAS & RINGKASAN */}
          {activeTab === 'identitas' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Kolom Kiri: Identitas Pasien & Penanggung Jawab */}
                <div className="lg:col-span-1 bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-4">
                  <div className="border-b border-slate-200 pb-2 flex items-center justify-between">
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">
                      Identitas Pasien
                    </h4>
                    <span className="text-[10px] font-mono font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                      ID: {selectedPatient?.id}
                    </span>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    <div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase">Nama Pasien</div>
                      <div className="font-bold text-slate-900 text-sm">{selectedPatient?.name}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase">No. RM</div>
                        <div className="font-mono font-black text-blue-700 text-sm">{selectedPatient?.noRM}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase">Golongan Darah</div>
                        <div className="font-bold text-rose-700">{selectedPatient?.bloodType || 'O'}</div>
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase">NIK KTP</div>
                      <div className="font-mono font-bold text-slate-700">{selectedPatient?.nik}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase">Alamat Domisili</div>
                      <div className="text-slate-700 leading-relaxed">{selectedPatient?.address}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase">Riwayat Alergi</div>
                      <div className="font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded border border-rose-200 inline-block">
                        {selectedPatient?.allergy || 'Tidak Ada Alergi'}
                      </div>
                    </div>
                  </div>

                  {/* Penanggung Jawab */}
                  {selectedPatient?.guarantor && (
                    <div className="border-t border-slate-200 pt-3 space-y-2 text-xs">
                      <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-700">
                        Penanggung Jawab (Keluarga)
                      </div>
                      <div>
                        <div className="font-bold text-slate-800">{selectedPatient.guarantor.name} ({selectedPatient.guarantor.relation})</div>
                        <div className="text-slate-500">{selectedPatient.guarantor.phone}</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Kolom Tengah & Kanan: Catatan Rekam Medis Terkini */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xs">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">
                          Catatan Rekam Medis DPJP Terkini
                        </h4>
                        <p className="text-xs text-slate-500">
                          Kunjungan {activeReg?.type} &bull; {activeReg?.date}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {activeMR && (
                          <button
                            type="button"
                            onClick={() => handleStartEditSoap(activeMR)}
                            className="px-3 py-1.5 bg-amber-500 text-white rounded-xl text-xs font-bold hover:bg-amber-600 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Edit SOAP Ini</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={handleStartNewSoap}
                          className="px-3 py-1.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <FilePlus className="w-3.5 h-3.5" />
                          <span>Input SOAP Baru</span>
                        </button>
                      </div>
                    </div>

                    {activeMR ? (
                      <div className="space-y-4 text-xs">
                        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                          <div className="font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                            <Stethoscope className="w-3.5 h-3.5 text-blue-600" />
                            <span>Anamnesis Pasien (S):</span>
                          </div>
                          <p className="text-slate-800 leading-relaxed">{activeMR.anamnesis}</p>
                        </div>

                        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                          <div className="font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                            <Activity className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Pemeriksaan Fisik & Tanda Vital (O):</span>
                          </div>
                          <p className="text-slate-800 leading-relaxed">{activeMR.physicalExam}</p>
                        </div>

                        <div className="p-3.5 bg-blue-50/60 rounded-xl border border-blue-200">
                          <div className="font-bold text-blue-900 mb-1 flex items-center gap-1.5">
                            <Tag className="w-3.5 h-3.5 text-blue-700" />
                            <span>Diagnosis Kerja Dokter DPJP (A):</span>
                          </div>
                          <div className="font-black text-blue-800 text-sm">{activeMR.diagnosis}</div>
                        </div>

                        {/* P - Plan / Rencana Terapi & Penatalaksanaan */}
                        <div className="p-3.5 bg-indigo-50/70 rounded-xl border border-indigo-200">
                          <div className="font-bold text-indigo-950 mb-1 flex items-center gap-1.5">
                            <ClipboardList className="w-3.5 h-3.5 text-indigo-700" />
                            <span>Rencana Penatalaksanaan & Instruksi Medis (P / Plan):</span>
                          </div>
                          {activeMR.plan ? (
                            <p className="text-slate-800 leading-relaxed whitespace-pre-line">{activeMR.plan}</p>
                          ) : (
                            <p className="text-slate-400 italic text-[11px]">Belum ada instruksi plan/terapi tercatat. Klik Edit SOAP untuk menambahkan.</p>
                          )}
                        </div>

                        {/* Tanda Tangan & Verifikasi Perawat & Dokter */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                          {/* Perawat */}
                          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-between">
                            <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 mb-2">
                              <span>Perawat / Pengkaji TTV:</span>
                              <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px]">Terverifikasi</span>
                            </div>
                            <div className="h-14 bg-white border border-slate-200 rounded-lg flex items-center justify-center p-1 overflow-hidden">
                              {activeMR.nurseSignature ? (
                                <img src={activeMR.nurseSignature} alt="TTD Perawat" className="max-h-full object-contain" />
                              ) : (
                                <span className="text-[11px] text-slate-400 italic">Belum TTD</span>
                              )}
                            </div>
                            <div className="mt-2 text-center">
                              <div className="font-bold text-slate-800 text-[11px]">{activeMR.nurseName || 'Ns. Rina Wulandari, S.Kep'}</div>
                              <div className="text-[10px] text-slate-500">STR: 12.04.5.2.1.20.78912</div>
                            </div>
                          </div>

                          {/* Dokter DPJP */}
                          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-between">
                            <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 mb-2">
                              <span>Dokter DPJP Pemeriksa:</span>
                              <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px]">DPJP Utama</span>
                            </div>
                            <div className="h-14 bg-white border border-slate-200 rounded-lg flex items-center justify-center p-1 overflow-hidden">
                              {activeMR.doctorSignature ? (
                                <img src={activeMR.doctorSignature} alt="TTD Dokter" className="max-h-full object-contain" />
                              ) : (
                                <span className="text-[11px] text-slate-400 italic">Belum TTD</span>
                              )}
                            </div>
                            <div className="mt-2 text-center">
                              <div className="font-bold text-slate-800 text-[11px]">{activeMR.doctorName || 'dr. Budi Santoso, Sp.PD'}</div>
                              <div className="text-[10px] text-slate-500">SIP: 446/1029/DISKES/2023</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-10 space-y-3">
                        <Stethoscope className="w-10 h-10 text-slate-300 mx-auto" />
                        <div className="text-sm font-bold text-slate-600">Belum Ada Pemeriksaan Medis Terkini</div>
                        <p className="text-xs text-slate-400 max-w-sm mx-auto">
                          Silakan lakukan pemeriksaan medis dan pengisian SOAP untuk pasien ini.
                        </p>
                        <button
                          onClick={() => setActiveTab('soap')}
                          className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors inline-flex items-center gap-1.5"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Mulai Pemeriksaan SOAP</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Fast Action Tiles for One-Page Navigation */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div
                      onClick={() => setActiveTab('keperawatan')}
                      className="p-3.5 bg-purple-50 hover:bg-purple-100/80 border border-purple-200 rounded-xl cursor-pointer transition-colors space-y-1"
                    >
                      <div className="text-purple-700 font-bold text-xs flex items-center gap-1.5">
                        <ClipboardList className="w-4 h-4" />
                        <span>Asuhan Keperawatan</span>
                      </div>
                      <p className="text-[11px] text-purple-900/80">Pengkajian, SDKI, SLKI & SIKI Terpadu</p>
                    </div>

                    <div
                      onClick={() => setActiveTab('coding')}
                      className="p-3.5 bg-cyan-50 hover:bg-cyan-100/80 border border-cyan-200 rounded-xl cursor-pointer transition-colors space-y-1"
                    >
                      <div className="text-cyan-700 font-bold text-xs flex items-center gap-1.5">
                        <Barcode className="w-4 h-4" />
                        <span>Workspace Koding</span>
                      </div>
                      <p className="text-[11px] text-cyan-900/80">Koding ICD-10 & 9 Satu Halaman</p>
                    </div>

                    <div
                      onClick={() => setActiveTab('tracer')}
                      className="p-3.5 bg-rose-50 hover:bg-rose-100/80 border border-rose-200 rounded-xl cursor-pointer transition-colors space-y-1"
                    >
                      <div className="text-rose-700 font-bold text-xs flex items-center gap-1.5">
                        <ShieldAlert className="w-4 h-4" />
                        <span>Tracer Rekam Medis</span>
                      </div>
                      <p className="text-[11px] text-rose-900/80">Lembar Outguide Berkas RM IGD</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: ASESMEN AWAL RAWAT JALAN (BAGIAN I - IV) */}
          {activeTab === 'rawatjalan' && selectedPatient && (
            <FormRawatJalan
              patient={selectedPatient}
              registration={activeReg}
              user={user}
              onSaveSuccess={() => {
                setActiveTab('identitas');
              }}
            />
          )}

          {/* TAB: ASESMEN IGD & TRIASE (BAGIAN I - IV) */}
          {activeTab === 'igd' && selectedPatient && (
            <FormIgd
              patient={selectedPatient}
              registration={activeReg}
              user={user}
              onSaveSuccess={() => {
                setActiveTab('identitas');
              }}
            />
          )}

          {/* TAB: ASESMEN RAWAT INAP (BAGIAN I - V + LONGITUDINAL) */}
          {activeTab === 'rawatinap' && selectedPatient && (
            <FormRawatInap
              patient={selectedPatient}
              registration={activeReg}
              user={user}
              onSaveSuccess={() => {
                setActiveTab('identitas');
              }}
            />
          )}

          {/* TAB 2: SOAP MEDIS PEMERIKSAAN DOKTER */}
          {activeTab === 'soap' && (
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-3 gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                      <Stethoscope className="w-5 h-5 text-blue-600" />
                      Pemeriksaan Medis & Input SOAP Terintegrasi
                    </h3>
                    {editingMRId ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                        <Edit3 className="w-3 h-3" />
                        Mode Edit (ID: {editingMRId})
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-100 text-blue-800 border border-blue-200 flex items-center gap-1">
                        <Plus className="w-3 h-3" />
                        Input Baru
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Standar Pengisian Rekam Medis Elektronik Lengkap S-O-A-P & TTD Berdasarkan KMK 1423/2022
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {editingMRId && (
                    <button
                      type="button"
                      onClick={handleStartNewSoap}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Batal Edit / Input Baru</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setAnamnesis('Pasien mengeluh pusing berputar dan tengkuk terasa kaku sejak 2 hari SMRS. Mual (+), muntah (-), pandangan kabur disangkal. Riwayat hipertensi tidak terkontrol sejak 1 tahun lalu.');
                      setPhysicalExam('KU: Sedang, Kesadaran: Compos Mentis (GCS E4V5M6). Mata: CA (-/-), SI (-/-). Thorax: Cor BJ I-II regular murni, murmur (-). Pulmo vesikuler (+/+), rhonki (-/-), wheezing (-/-). Abdomen supel, BU (+) normal. Ekstremitas akral hangat, CRT < 2s, edema (-/-).');
                      setDiagnosis('I10 - Hipertensi Esensial (Primer) Stadium II');
                      setPlan('1. Farmakoterapi:\n   - Amlodipine 10 mg 1x1 tab PO (pagi hari)\n   - Candesartan 8 mg 1x1 tab PO (malam hari)\n   - Paracetamol 500 mg 3x1 tab PO (bila nyeri kepala / prn)\n2. Penunjang:\n   - Cek EKG 12 lead, Profil Lipid Lengkap, Ureum, Kreatinin\n3. Non-Farmakologi & Edukasi:\n   - Modifikasi gaya hidup: Diet rendah garam (< 2 gram / 1 sdt garam dapur per hari)\n   - Batasi makanan berlemak dan tinggi kolesterol, hindari kafein & merokok\n   - Olahraga aerobik ringan teratur 30 menit/hari\n   - Monitoring tekanan darah mandiri di rumah dan kontrol ulang Poli Penyakit Dalam 1 minggu lagi');
                      setNurseNotes('Pasien telah diistirahatkan di tempat tidur posisi semi-fowler, edukasi pembatasan garam telah disampaikan kepada keluarga.');
                      setSystolic('150');
                      setDiastolic('95');
                      setHeartRate('84');
                      setRespRate('20');
                      setTemperature('36.6');
                      setSpo2('98');
                    }}
                    className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Isi Sampel Klinis Lengkap (S-O-A-P)</span>
                  </button>
                </div>
              </div>

              <form onSubmit={handleSaveMedicalRecord} className="space-y-5">
                {/* Tanda Vital Box */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                  <div className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Thermometer className="w-4 h-4 text-rose-600" />
                    <span>Tanda-Tanda Vital (TTV) Pasien</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Sistole (mmHg)</label>
                      <input
                        type="text"
                        value={systolic}
                        onChange={(e) => setSystolic(e.target.value)}
                        className="w-full mt-1 p-2 bg-white rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Diastole (mmHg)</label>
                      <input
                        type="text"
                        value={diastolic}
                        onChange={(e) => setDiastolic(e.target.value)}
                        className="w-full mt-1 p-2 bg-white rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Nadi (x/mnt)</label>
                      <input
                        type="text"
                        value={heartRate}
                        onChange={(e) => setHeartRate(e.target.value)}
                        className="w-full mt-1 p-2 bg-white rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase">RR (x/mnt)</label>
                      <input
                        type="text"
                        value={respRate}
                        onChange={(e) => setRespRate(e.target.value)}
                        className="w-full mt-1 p-2 bg-white rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Suhu (&deg;C)</label>
                      <input
                        type="text"
                        value={temperature}
                        onChange={(e) => setTemperature(e.target.value)}
                        className="w-full mt-1 p-2 bg-white rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase">SpO2 (%)</label>
                      <input
                        type="text"
                        value={spo2}
                        onChange={(e) => setSpo2(e.target.value)}
                        className="w-full mt-1 p-2 bg-white rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* S - Subjective / Anamnesis */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800 uppercase flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[10px]">S</span>
                    <span>Anamnesis / Keluhan Pasien (Subjective)</span>
                  </label>
                  <textarea
                    value={anamnesis}
                    onChange={(e) => setAnamnesis(e.target.value)}
                    rows={3}
                    placeholder="Tuliskan keluhan utama, riwayat penyakit sekarang, riwayat penyakit dahulu, riwayat obat..."
                    className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:bg-white focus:border-blue-500 transition-all"
                    required
                  />
                </div>

                {/* O - Objective / Physical Exam */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800 uppercase flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[10px]">O</span>
                    <span>Pemeriksaan Fisik & Status Lokalis (Objective)</span>
                  </label>
                  <textarea
                    value={physicalExam}
                    onChange={(e) => setPhysicalExam(e.target.value)}
                    rows={3}
                    placeholder="Keadaan umum, kesadaran, kepala, thorax, abdomen, ekstremitas, hasil lab/penunjang..."
                    className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:bg-white focus:border-blue-500 transition-all"
                    required
                  />
                </div>

                {/* A - Assessment / Diagnosis */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800 uppercase flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center font-bold text-[10px]">A</span>
                    <span>Diagnosis Medis / Assessment (ICD-10 Preview)</span>
                  </label>
                  <input
                    type="text"
                    value={diagnosis}
                    onChange={(e) => setDiagnosis(e.target.value)}
                    placeholder="Contoh: I10 - Hipertensi Esensial (Primer)"
                    className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs font-bold text-blue-900 focus:outline-none focus:bg-white focus:border-blue-500 transition-all"
                    required
                  />
                </div>

                {/* P - Plan / Planning & Instruksi Medis (Rencana Penatalaksanaan) */}
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <label className="text-xs font-bold text-slate-800 uppercase flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-[10px]">P</span>
                      <span>Rencana Penatalaksanaan & Instruksi Medis (Plan)</span>
                    </label>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setPlan(prev => prev ? `${prev}\n- Amlodipine 5mg tab 1x1 tab PO pagi\n- Candesartan 8mg tab 1x1 tab PO malam` : '- Amlodipine 5mg tab 1x1 tab PO pagi\n- Candesartan 8mg tab 1x1 tab PO malam')}
                        className="px-2 py-0.5 text-[10px] font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-md border border-indigo-200 cursor-pointer"
                      >
                        + Resep HT
                      </button>
                      <button
                        type="button"
                        onClick={() => setPlan(prev => prev ? `${prev}\n- Diet rendah garam < 2g/hari\n- Cek profil lipid dan fungsi ginjal\n- Kontrol poli 1 minggu lagi` : '- Diet rendah garam < 2g/hari\n- Cek profil lipid dan fungsi ginjal\n- Kontrol poli 1 minggu lagi')}
                        className="px-2 py-0.5 text-[10px] font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-md border border-indigo-200 cursor-pointer"
                      >
                        + Edukasi & Lab
                      </button>
                    </div>
                  </div>
                  <textarea
                    value={plan}
                    onChange={(e) => setPlan(e.target.value)}
                    rows={4}
                    placeholder="Tuliskan rencana penatalaksanaan, terapi obat / resep dokter, tindakan medis klinis, instruksi monitoring perawat, rencana pemeriksaan penunjang (lab/radiologi), edukasi pasien, dan tanggal rencana kontrol..."
                    className="w-full p-3 bg-indigo-50/40 rounded-xl border border-indigo-200 text-xs font-medium text-slate-800 focus:outline-none focus:bg-white focus:border-indigo-500 transition-all"
                    required
                  />
                </div>

                {/* Catatan Tindakan / Asuhan Perawat (Opsional) */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <ClipboardList className="w-4 h-4 text-emerald-600" />
                    <span>Catatan Implementasi & Respon Keperawatan (Opsional Perawat)</span>
                  </label>
                  <input
                    type="text"
                    value={nurseNotes}
                    onChange={(e) => setNurseNotes(e.target.value)}
                    placeholder="Contoh: Pasien telah diistirahatkan semi-fowler, obat oral dosis pertama telah diberikan, keluhan pusing berkurang..."
                    className="w-full p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-blue-500 transition-all"
                  />
                </div>

                {/* BAGIAN TANDA TANGAN (TTD) PERAWAT DAN DOKTER SESUAI PENGISI */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-4">
                  <div className="border-b border-slate-200 pb-2">
                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                      <PenTool className="w-4 h-4 text-blue-600" />
                      Bagian Tanda Tangan (TTD) Perawat & Dokter Sesuai Pengisi
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Berdasarkan Permenkes RME, catatan SOAP wajib ditandatangani secara digital oleh Perawat (pengkaji tanda vital) dan Dokter DPJP (pemeriksa & pemberi instruksi medis).
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Tanda Tangan Perawat */}
                    <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
                      <DigitalSignaturePad
                        title="Verifikasi & Tanda Tangan Perawat"
                        roleLabel="Perawat / Pengkaji TTV"
                        personName={nurseName}
                        onNameChange={setNurseName}
                        identifierNumber={nurseIdentifier}
                        onIdentifierChange={setNurseIdentifier}
                        signatureValue={nurseSignature}
                        onSignatureChange={setNurseSignature}
                        signedDate={new Date().toLocaleDateString('id-ID', { dateStyle: 'long' })}
                      />
                    </div>

                    {/* Tanda Tangan Dokter DPJP */}
                    <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
                      <DigitalSignaturePad
                        title="Verifikasi & Tanda Tangan Dokter DPJP"
                        roleLabel="Dokter DPJP / Pemeriksa Utama"
                        personName={doctorName}
                        onNameChange={setDoctorName}
                        identifierNumber={doctorIdentifier}
                        onIdentifierChange={setDoctorIdentifier}
                        signatureValue={doctorSignature}
                        onSignatureChange={setDoctorSignature}
                        signedDate={new Date().toLocaleDateString('id-ID', { dateStyle: 'long' })}
                      />
                    </div>
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setActiveTab('identitas')}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>{editingMRId ? 'Perbarui Catatan SOAP & TTD' : 'Simpan SOAP ke Rekam Medis'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 3: CPPT TERINTEGRASI */}
          {activeTab === 'cppt' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-emerald-600" />
                    Catatan Perkembangan Pasien Terintegrasi (CPPT)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Pencatatan perkembangan pasien multi-PPA (Dokter, Perawat, Farmasi, Gizi) terintegrasi
                  </p>
                </div>
              </div>

              {activeMR ? (
                <CPPTInputTable mr={activeMR} />
              ) : (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 text-center space-y-3">
                  <Activity className="w-10 h-10 text-slate-300 mx-auto" />
                  <div className="font-bold text-slate-700 text-sm">Belum Ada Rekam Medis Aktif</div>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Silakan isi pemeriksaan SOAP awal dokter terlebih dahulu untuk membuka lembar CPPT.
                  </p>
                  <button
                    onClick={() => setActiveTab('soap')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700"
                  >
                    Input SOAP Dokter
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: ASUHAN KEPERAWATAN KOMPREHENSIF (SDKI, SLKI, SIKI) */}
          {activeTab === 'keperawatan' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <ClipboardList className="w-5 h-5 text-purple-600" />
                    Asesmen & Asuhan Keperawatan Komprehensif (SDKI, SLKI, SIKI)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Dokumentasi pengkajian perawat terstandar PPNI (Standar Diagnosis, Luaran & Intervensi Keperawatan)
                  </p>
                </div>
                <button
                  onClick={() => setIsAskepModalOpen(true)}
                  className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Buka Form Pengkajian Lengkap (Modal)</span>
                </button>
              </div>

              {/* Integrated Nursing Care Plan View */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 1. Pengkajian Fisik & Bio-Psiko-Sosial */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                  <div className="text-xs font-black uppercase tracking-wider text-purple-900 flex items-center gap-1.5 border-b border-slate-200 pb-2">
                    <Thermometer className="w-4 h-4 text-purple-600" />
                    <span>1. Pengkajian TTV & Keadaan Umum</span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-200">
                      <span className="text-slate-500">Keadaan Umum:</span>
                      <span className="font-bold text-slate-800">Sedang (Tampak Lemah)</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200">
                      <span className="text-slate-500">Kesadaran:</span>
                      <span className="font-bold text-emerald-700">Compos Mentis (GCS E4V5M6)</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200">
                      <span className="text-slate-500">Tekanan Darah:</span>
                      <span className="font-bold font-mono text-slate-800">{systolic}/{diastolic} mmHg</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200">
                      <span className="text-slate-500">Frekuensi Nadi:</span>
                      <span className="font-bold font-mono text-slate-800">{heartRate} x/menit</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200">
                      <span className="text-slate-500">Frekuensi Napas:</span>
                      <span className="font-bold font-mono text-slate-800">{respRate} x/menit</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-500">Suhu Tubuh / SpO2:</span>
                      <span className="font-bold font-mono text-slate-800">{temperature} &deg;C / {spo2}%</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200">
                    <div className="text-[10px] font-bold uppercase text-slate-500 mb-1">Skala Nyeri (NRS 0-10)</div>
                    <div className="flex items-center gap-2">
                      <div className="px-2 py-1 bg-amber-100 text-amber-900 font-black text-xs rounded">Skala 4 (Sedang)</div>
                      <span className="text-[11px] text-slate-600">Nyeri seperti ditusuk-tusuk di tengkuk</span>
                    </div>
                  </div>
                </div>

                {/* 2. Diagnosis Keperawatan (SDKI) & Luaran (SLKI) */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                  <div className="text-xs font-black uppercase tracking-wider text-purple-900 flex items-center gap-1.5 border-b border-slate-200 pb-2">
                    <ClipboardList className="w-4 h-4 text-purple-600" />
                    <span>2. Diagnosis SDKI & Luaran SLKI</span>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="p-2.5 bg-purple-50 rounded-xl border border-purple-200 space-y-1">
                      <div className="text-[10px] font-bold text-purple-700 uppercase">Diagnosis SDKI 1:</div>
                      <div className="font-bold text-purple-950">D.0077 Nyeri Akut b.d Agen Pencedera Fisiologis (Iskemia Jaringan / Vaskular)</div>
                    </div>

                    <div className="p-2.5 bg-blue-50 rounded-xl border border-blue-200 space-y-1">
                      <div className="text-[10px] font-bold text-blue-700 uppercase">Luaran SLKI 1:</div>
                      <div className="font-bold text-blue-950">L.08066 Tingkat Nyeri Menurun: Keluhan nyeri menurun, meringis menurun, gelisah menurun.</div>
                    </div>

                    <div className="p-2.5 bg-purple-50 rounded-xl border border-purple-200 space-y-1">
                      <div className="text-[10px] font-bold text-purple-700 uppercase">Diagnosis SDKI 2:</div>
                      <div className="font-bold text-purple-950">D.0005 Pola Napas Tidak Efektif b.d Hambatan Upaya Napas</div>
                    </div>
                  </div>
                </div>

                {/* 3. Intervensi Keperawatan (SIKI) & Tindakan */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                  <div className="text-xs font-black uppercase tracking-wider text-purple-900 flex items-center gap-1.5 border-b border-slate-200 pb-2">
                    <CheckCircle2 className="w-4 h-4 text-purple-600" />
                    <span>3. Intervensi SIKI & Evaluasi</span>
                  </div>

                  <div className="space-y-2 text-xs text-slate-800">
                    <div className="p-2.5 bg-white rounded-xl border border-slate-200 space-y-1">
                      <div className="font-bold text-slate-900">I.08238 Manajemen Nyeri:</div>
                      <ul className="list-disc pl-4 text-slate-600 space-y-0.5 text-[11px]">
                        <li>Identifikasi lokasi, karakteristik, durasi, frekuensi nyeri</li>
                        <li>Berikan teknik non-farmakologis (relaksasi napas dalam)</li>
                        <li>Kolaborasi pemberian analgetik / antihipertensi sesuai advis DPJP</li>
                      </ul>
                    </div>

                    <div className="p-2.5 bg-white rounded-xl border border-slate-200 space-y-1">
                      <div className="font-bold text-slate-900">I.01011 Manajemen Jalan Napas:</div>
                      <ul className="list-disc pl-4 text-slate-600 space-y-0.5 text-[11px]">
                        <li>Posisikan semi-fowler untuk memaksimalkan ventilasi</li>
                        <li>Berikan oksigenasi nasal kanul 3 lpm jika SpO2 &lt; 95%</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between">
                <div className="text-xs text-slate-500 flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-emerald-600" />
                  <span>Perawat Penanggung Jawab: <strong>{user?.name || 'Ns. Siti Rahma, S.Kep'}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      Swal.fire({
                        icon: 'success',
                        title: 'Asuhan Keperawatan Terverifikasi',
                        text: 'Rencana asuhan keperawatan berhasil disimpan ke rekam medis pasien.',
                        timer: 1800,
                        showConfirmButton: false
                      });
                    }}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>Verifikasi & Simpan Asuhan Keperawatan</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: WORKSPACE KODING ICD-10 & ICD-9-CM (SATU HALAMAN BESAR & LENGKAP) */}
          {activeTab === 'coding' && (
            <div className="space-y-6">
              {/* Header Workspace */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-4 gap-3">
                <div>
                  <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <Barcode className="w-6 h-6 text-cyan-600" />
                    Workspace Koding Rekam Medis (ICD-10 & ICD-9-CM)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Pengkodean Penyakit & Tindakan Medis Terstandar WHO / Kemenkes RI untuk Klaim BPJS & SIMRS
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={handleAutoDetectCoding}
                    className="px-3.5 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-xl text-xs font-black shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Sparkles className="w-4 h-4 text-yellow-300" />
                    <span>⚡ Deteksi Otomatis dari Rekam Medis</span>
                  </button>

                  <button
                    onClick={() => handleSaveCoding('Draft')}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <BookmarkCheck className="w-3.5 h-3.5 text-blue-600" />
                    <span>Simpan Draft</span>
                  </button>

                  <button
                    onClick={() => handleSaveCoding('Locked')}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Kunci Koding (Final)</span>
                  </button>
                </div>
              </div>

              {/* Doctor Medical Notes Reference Box */}
              {activeMR && (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2 text-xs">
                  <div className="font-black text-slate-700 uppercase flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Stethoscope className="w-4 h-4 text-blue-600" />
                      Referensi Diagnosis & Catatan Klinis Dokter DPJP
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">Tgl: {activeMR.date}</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                    <div>
                      <span className="text-slate-500 font-medium">Anamnesis:</span>
                      <p className="text-slate-800 font-medium mt-0.5">{activeMR.anamnesis}</p>
                    </div>
                    <div>
                      <span className="text-slate-500 font-medium">Diagnosis DPJP:</span>
                      <p className="text-blue-800 font-bold text-sm mt-0.5">{activeMR.diagnosis}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* 2-Column Coding Workspace: Left ICD-10, Right ICD-9-CM */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* SECTION ICD-10 DIAGNOSIS */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xs">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-black text-xs">
                        10
                      </div>
                      <h4 className="text-sm font-bold text-slate-900">
                        ICD-10 (Diagnosis Utama & Sekunder)
                      </h4>
                    </div>
                    <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                      {selectedIcd10.length} Terpilih
                    </span>
                  </div>

                  {/* Autocomplete Search Input ICD-10 */}
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={icd10Search}
                      onChange={(e) => setIcd10Search(e.target.value)}
                      placeholder="Ketik kode ICD-10 atau nama penyakit (contoh: I10, Hypertensi, J18, Diabetes)..."
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 transition-all"
                    />

                    {/* Autocomplete Dropdown List */}
                    {icd10Search.trim().length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-y-auto z-30 divide-y divide-slate-100">
                        {EXTENDED_ICD10.filter(item =>
                          item.code.toLowerCase().includes(icd10Search.toLowerCase()) ||
                          item.desc.toLowerCase().includes(icd10Search.toLowerCase())
                        ).slice(0, 10).map(item => (
                          <div
                            key={item.code}
                            onClick={() => handleAddIcd10(item)}
                            className="p-2.5 hover:bg-blue-50/80 cursor-pointer flex items-center justify-between gap-2 transition-colors"
                          >
                            <div>
                              <span className="font-mono font-black text-xs text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200 mr-2">
                                {item.code}
                              </span>
                              <span className="text-xs font-bold text-slate-800">{item.desc}</span>
                            </div>
                            <Plus className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Selected ICD-10 Codes List */}
                  <div className="space-y-2">
                    <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      Daftar Kode ICD-10 Terpilih:
                    </div>
                    {selectedIcd10.length > 0 ? (
                      <div className="space-y-2">
                        {selectedIcd10.map((item, idx) => {
                          const isPrimary = idx === primaryIcd10Index;
                          return (
                            <div
                              key={item.code}
                              className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                                isPrimary
                                  ? 'bg-blue-50/80 border-blue-300 ring-1 ring-blue-300'
                                  : 'bg-slate-50 border-slate-200'
                              }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <button
                                  type="button"
                                  onClick={() => setPrimaryIcd10Index(idx)}
                                  className={`p-1 rounded-lg transition-colors cursor-pointer ${
                                    isPrimary ? 'text-amber-500 bg-amber-100' : 'text-slate-400 hover:text-amber-500'
                                  }`}
                                  title={isPrimary ? 'Diagnosis Utama' : 'Jadikan Diagnosis Utama'}
                                >
                                  <span className="text-sm">★</span>
                                </button>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-mono font-black text-xs text-blue-800">
                                      {item.code}
                                    </span>
                                    {isPrimary ? (
                                      <span className="text-[10px] bg-blue-600 text-white font-black px-1.5 py-0.2 rounded">
                                        UTAMA
                                      </span>
                                    ) : (
                                      <span className="text-[10px] bg-slate-200 text-slate-700 font-bold px-1.5 py-0.2 rounded">
                                        SEKUNDER
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-xs font-bold text-slate-800 truncate">
                                    {item.desc}
                                  </div>
                                </div>
                              </div>

                              <button
                                onClick={() => handleRemoveIcd10(item.code)}
                                className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                title="Hapus Kode"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="p-4 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl">
                        Belum ada diagnosis ICD-10 terpilih.
                      </div>
                    )}
                  </div>
                </div>

                {/* SECTION ICD-9-CM PROCEDURES */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xs">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-cyan-600 text-white flex items-center justify-center font-black text-xs">
                        9
                      </div>
                      <h4 className="text-sm font-bold text-slate-900">
                        ICD-9-CM (Prosedur & Tindakan Medis)
                      </h4>
                    </div>
                    <span className="text-[11px] font-bold text-cyan-600 bg-cyan-50 px-2 py-0.5 rounded">
                      {selectedIcd9.length} Terpilih
                    </span>
                  </div>

                  {/* Autocomplete Search Input ICD-9-CM */}
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={icd9Search}
                      onChange={(e) => setIcd9Search(e.target.value)}
                      placeholder="Ketik kode ICD-9-CM atau nama prosedur (contoh: 89.13, EKG, 88.56, USG)..."
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-cyan-500 transition-all"
                    />

                    {/* Autocomplete Dropdown List */}
                    {icd9Search.trim().length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-y-auto z-30 divide-y divide-slate-100">
                        {EXTENDED_ICD9CM.filter(item =>
                          item.code.toLowerCase().includes(icd9Search.toLowerCase()) ||
                          item.desc.toLowerCase().includes(icd9Search.toLowerCase())
                        ).slice(0, 10).map(item => (
                          <div
                            key={item.code}
                            onClick={() => handleAddIcd9(item)}
                            className="p-2.5 hover:bg-cyan-50/80 cursor-pointer flex items-center justify-between gap-2 transition-colors"
                          >
                            <div>
                              <span className="font-mono font-black text-xs text-cyan-700 bg-cyan-50 px-1.5 py-0.5 rounded border border-cyan-200 mr-2">
                                {item.code}
                              </span>
                              <span className="text-xs font-bold text-slate-800">{item.desc}</span>
                            </div>
                            <Plus className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Selected ICD-9-CM Codes List */}
                  <div className="space-y-2">
                    <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      Daftar Tindakan ICD-9-CM Terpilih:
                    </div>
                    {selectedIcd9.length > 0 ? (
                      <div className="space-y-2">
                        {selectedIcd9.map((item) => (
                          <div
                            key={item.code}
                            className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3"
                          >
                            <div>
                              <div className="font-mono font-black text-xs text-cyan-800">
                                {item.code}
                              </div>
                              <div className="text-xs font-bold text-slate-800">
                                {item.desc}
                              </div>
                            </div>

                            <button
                              onClick={() => handleRemoveIcd9(item.code)}
                              className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Hapus Tindakan"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl">
                        Belum ada tindakan ICD-9-CM terpilih.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Coding Notes & Summary */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                <label className="text-xs font-bold text-slate-800 uppercase flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-slate-600" />
                  <span>Catatan Khusus Koder / Perekam Medis (RMIK)</span>
                </label>
                <input
                  type="text"
                  value={codingNote}
                  onChange={(e) => setCodingNote(e.target.value)}
                  placeholder="Contoh: Koding terverifikasi sesuai resume klinis DPJP dan hasil EKG/Lab..."
                  className="w-full p-2.5 bg-white rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          )}

          {/* TAB 6: TRACER REKAM MEDIS IGD & RAWAT INAP (SATU HALAMAN BESAR STANDAR RMIK) */}
          {activeTab === 'tracer' && (
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Header Tracer */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-3 gap-3">
                <div>
                  <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-rose-600" />
                    Tracer Rekam Medis (Outguide Pelacakan Berkas RM Fisik & RME)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Lembar Pelacakan Outguide Resmi Penjajaran Berkas RM di Ruang Filing Sesuai Standar Akreditasi RS
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => window.print()}
                    className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Cetak Tracer Berkas</span>
                  </button>
                  <button
                    onClick={() => {
                      setTracerStatus('Diterima di Ruangan');
                      Swal.fire({
                        icon: 'success',
                        title: 'Berkas Diterima!',
                        text: `Berkas No. RM ${selectedPatient?.noRM} terkonfirmasi berada di ${tracerBorrowerUnit}.`,
                        timer: 1800,
                        showConfirmButton: false
                      });
                    }}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Konfirmasi Terima Berkas</span>
                  </button>
                </div>
              </div>

              {/* Full-Page Printable Tracer Outguide Sheet */}
              <div className="p-6 bg-white border-2 border-slate-300 rounded-3xl space-y-5 shadow-sm text-slate-800 font-sans print:border-none print:p-0">
                {/* Header Banner */}
                <div className="border-b-2 border-slate-300 pb-3 flex items-start justify-between">
                  <div>
                    <div className="text-[10px] font-extrabold uppercase tracking-widest text-blue-700">
                      SIMRS 3.0 &bull; UNIVERSITAS ESA UNGGUL
                    </div>
                    <h2 className="text-lg font-black tracking-tight text-slate-900 flex items-center gap-1.5">
                      <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />
                      TRACER OUTGUIDE REKAM MEDIS PASIEN
                    </h2>
                    <p className="text-xs font-medium text-slate-600">
                      Petunjuk Keluar / Pengganti Berkas Rekam Medis pada Rak Penyimpanan (Filing Storage)
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="px-3 py-1 bg-rose-600 text-white font-black text-xs rounded-lg uppercase tracking-wider inline-block">
                      PRIORITAS {activeReg?.type || 'IGD'}
                    </span>
                    <div className="text-[11px] font-mono font-bold text-slate-500 mt-1">
                      {new Date().toLocaleDateString('id-ID')} &bull; {new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                    </div>
                  </div>
                </div>

                {/* Big No RM & Barcode Box */}
                <div className="bg-blue-50/70 p-4 rounded-2xl border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="text-[10px] font-bold text-blue-800 uppercase">NO. REKAM MEDIS (RM)</div>
                    <div className="text-3xl font-black font-mono text-blue-700 tracking-wider">
                      {selectedPatient?.noRM || '000001'}
                    </div>
                    <div className="text-xs font-bold text-slate-700 mt-1">
                      No. Registrasi: <span className="font-mono text-blue-700">{activeReg?.id || 'REG001'}</span>
                    </div>
                  </div>

                  {/* QR & Barcode Simulation */}
                  <div className="flex items-center gap-3">
                    <div className="bg-white p-2 border border-blue-200 rounded-xl">
                      <QrCode className="w-12 h-12 text-blue-600" />
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] font-bold text-slate-500 uppercase">KODE SISTEM</div>
                      <div className="text-xs font-mono font-bold text-slate-700">*{selectedPatient?.noRM}*</div>
                      <div className="text-[10px] text-emerald-600 font-bold mt-1">STATUS: {tracerStatus}</div>
                    </div>
                  </div>
                </div>

                {/* Grid of Tracer Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Nama Pasien:</span>
                    <div className="font-bold text-slate-900 text-sm">{selectedPatient?.name}</div>
                    <div className="text-slate-500">NIK: {selectedPatient?.nik}</div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Unit / Ruangan Peminjam:</span>
                    <div className="font-bold text-blue-800 text-sm">{tracerBorrowerUnit}</div>
                    <div className="text-slate-500">DPJP: dr. Sari Dewi, Sp.PD</div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Keperluan Peminjaman:</span>
                    <div className="font-bold text-slate-800">{tracerPurpose}</div>
                    <div className="text-slate-500">Kunjungan Poliklinik / Tindakan</div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Petugas Filing RMIK:</span>
                    <div className="font-bold text-slate-800">{tracerOfficer}</div>
                    <div className="text-slate-500">Tgl Pinjam: {new Date().toISOString().substring(0, 10)}</div>
                  </div>
                </div>

                {/* Signature Box */}
                <div className="grid grid-cols-2 gap-6 pt-4 border-t border-slate-200 text-center text-xs">
                  <div className="space-y-12">
                    <div className="font-bold text-slate-600">Petugas Ruang Filing RMIK</div>
                    <div className="font-bold text-slate-800 underline">({tracerOfficer})</div>
                  </div>
                  <div className="space-y-12">
                    <div className="font-bold text-slate-600">Penerima Berkas di Ruangan</div>
                    <div className="font-bold text-slate-800 underline">({user?.name || 'Perawat Jaga'})</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: 26 FORMULIR RME KMK 1423 */}
          {activeTab === 'formulir' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <Layers className="w-5 h-5 text-blue-600" />
                    26 Formulir Standar Rekam Medis Elektronik (KMK 1423/2022)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Daftar lengkap 26 formulir rekam medis dengan status pengisian otomatis
                  </p>
                </div>
              </div>

              {/* Grid of all 26 Forms */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {ALL_RME_FORMS.map((form) => {
                  const isCompleted = completedForms.includes(form.code);
                  const IconComp = form.icon;
                  return (
                    <div
                      key={form.id}
                      onClick={() => {
                        if (form.code === 'AARJ') setActiveTab('rawatjalan');
                        else if (form.code === 'AARI') setActiveTab('rawatinap');
                        else if (form.code === 'AIGD') setActiveTab('igd');
                        else if (form.code === 'SOAP') setActiveTab('soap');
                        else if (form.code === 'CPPT') setActiveTab('cppt');
                        else if (form.code === 'ASKEP') setActiveTab('keperawatan');
                        else if (form.code === 'CODING') setActiveTab('coding');
                        else if (form.code === 'TRACER') setActiveTab('tracer');
                        else {
                          Swal.fire({
                            title: form.name,
                            text: `Formulir ${form.name} (${form.code}) terintegrasi dengan rekam medis pasien.`,
                            icon: 'info'
                          });
                        }
                      }}
                      className="p-3.5 bg-white hover:bg-blue-50/50 border border-slate-200 hover:border-blue-300 rounded-xl transition-all cursor-pointer flex items-start justify-between gap-3 group"
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          isCompleted ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                        }`}>
                          <IconComp className="w-4 h-4" />
                        </div>
                        <div className="space-y-0.5 min-w-0">
                          <div className="text-[10px] font-mono font-bold text-slate-400">
                            [{form.code}] &bull; {form.category}
                          </div>
                          <div className="text-xs font-bold text-slate-800 group-hover:text-blue-700 transition-colors truncate">
                            {form.name}
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0">
                        {isCompleted ? (
                          <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-black flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            Terisi
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                            Belum
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 8: RIWAYAT KUNJUNGAN */}
          {activeTab === 'riwayat' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-600" />
                    Riwayat Kunjungan & Pemeriksaan Pasien
                  </h3>
                  <p className="text-xs text-slate-500">
                    Histori kunjungan IGD, Rawat Jalan dan Rawat Inap No. RM {selectedPatient?.noRM}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {patientRegistrations.length > 0 ? (
                  patientRegistrations.map((reg, idx) => {
                    const mr = medicalRecords.find(m => m.regId === reg.id);
                    const isCurrent = reg.id === activeReg?.id;
                    return (
                      <div
                        key={reg.id}
                        onClick={() => setSelectedRegId(reg.id)}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                          isCurrent
                            ? 'bg-blue-50/60 border-blue-300 shadow-xs'
                            : 'bg-white border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-sm shrink-0">
                            {idx + 1}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 text-sm">
                                {reg.type} &bull; {reg.poli}
                              </span>
                              <span className="text-[11px] font-mono text-blue-700 bg-blue-100 px-1.5 rounded">
                                {reg.id}
                              </span>
                            </div>
                            <div className="text-xs text-slate-500">
                              Tanggal Masuk: {reg.date} &bull; Status: <strong className="text-emerald-700">{reg.status}</strong>
                            </div>
                            {mr && (
                              <div className="text-xs text-slate-700 font-medium mt-1">
                                Diagnosis: <strong className="text-blue-800">{mr.diagnosis}</strong>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          {isCurrent ? (
                            <span className="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-xl">
                              Sedang Aktif
                            </span>
                          ) : (
                            <span className="text-xs font-bold text-blue-600 hover:underline">
                              Buka Kunjungan &rarr;
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-8 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl">
                    Belum ada riwayat kunjungan lain untuk pasien ini.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MODAL TRACER IGD */}
      <TracerIgdModal
        isOpen={isTracerModalOpen}
        onClose={() => setIsTracerModalOpen(false)}
        patient={selectedPatient}
        registration={activeReg}
        doctor={getUser(activeReg?.dpjp || 'U002')}
      />

      {/* MODAL ASUHAN KEPERAWATAN IGD */}
      <AsuhanKeperawatanIgdModal
        isOpen={isAskepModalOpen}
        onClose={() => setIsAskepModalOpen(false)}
        patient={selectedPatient}
        registration={activeReg}
        nurse={user}
      />
    </div>
  );
};
