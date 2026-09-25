import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { ExamScenario, ExamSubmission } from '../../types';
import { evaluateExamSubmission } from '../../utils/pdfExtractor';
import { EXTENDED_ICD10, EXTENDED_ICD9CM } from '../../data/icdDatabase';
import { NURSING_SDKI_LIST, NURSING_SLKI_LIST, NURSING_SIKI_LIST } from '../../data/examScenariosData';
import {
  Clock, ShieldAlert, CheckCircle2, AlertTriangle, Save,
  ArrowLeft, Search, ZoomIn, ZoomOut, RotateCcw, Lock,
  Award, Eye, ExternalLink, HelpCircle, FileText, Check, Plus,
  Stethoscope, Barcode, UserCheck, ShieldCheck, Printer
} from 'lucide-react';
import Swal from 'sweetalert2';

interface Props {
  scenario: ExamScenario;
  onBack: () => void;
}

export const ExamDualPaneWorkspace: React.FC<Props> = ({ scenario, onBack }) => {
  const { user, saveExamSubmission, examSubmissions, navigate } = useApp();

  const isDosen = user?.roleId === 'R03' || user?.roleId === 'R01';
  const studentId = user?.id || 'STUDENT_GUEST';
  const studentName = user?.name || 'Mahasiswa Simulasi';

  // Check if student already submitted this scenario
  const existingSubmission = examSubmissions.find(
    s => s.scenarioId === scenario.id && s.studentId === studentId
  );

  const isCompleted = !!existingSubmission;

  // Working state for student
  const [icd10Primary, setIcd10Primary] = useState(existingSubmission?.studentAnswer.icd10Primary || '');
  const [icd10Secondary, setIcd10Secondary] = useState<string[]>(existingSubmission?.studentAnswer.icd10Secondary || []);
  const [icd9Procedures, setIcd9Procedures] = useState<string[]>(existingSubmission?.studentAnswer.icd9Procedures || []);
  const [coderNotes, setCoderNotes] = useState(existingSubmission?.studentAnswer.coderNotes || '');

  const [diagnosaSDKI, setDiagnosaSDKI] = useState<string[]>(existingSubmission?.studentAnswer.diagnosaSDKI || []);
  const [luaranSLKI, setLuaranSLKI] = useState(existingSubmission?.studentAnswer.luaranSLKI || '');
  const [intervensiSIKI, setIntervensiSIKI] = useState<string[]>(existingSubmission?.studentAnswer.intervensiSIKI || []);
  const [catatanImplementasi, setCatatanImplementasi] = useState(existingSubmission?.studentAnswer.catatanImplementasi || '');

  // Secondary code helpers
  const [secInput, setSecInput] = useState('');
  const [procInput, setProcInput] = useState('');
  const [sdkiSelect, setSdkiSelect] = useState('');
  const [sikiSelect, setSikiSelect] = useState('');

  // Dual-Pane states
  const [rightTab, setRightTab] = useState<'workspace' | 'result'>(isCompleted ? 'result' : 'workspace');
  const [pdfZoom, setPdfZoom] = useState<number>(100);
  const [pdfSearch, setPdfSearch] = useState<string>('');
  const [lastSavedTime, setLastSavedTime] = useState<string>('Belum ada perubahan');

  // Countdown timer
  const initialDurationSeconds = scenario.durationMinutes * 60;
  const [timeLeft, setTimeLeft] = useState<number>(() => {
    if (existingSubmission) return 0;
    const savedTimer = localStorage.getItem(`simrs_exam_timer_${scenario.id}_${studentId}`);
    return savedTimer ? Number(savedTimer) : initialDurationSeconds;
  });

  // Submission object
  const [currentSubmission, setCurrentSubmission] = useState<ExamSubmission | null>(existingSubmission || null);

  // Auto-save local draft every 30 seconds
  useEffect(() => {
    if (isCompleted) return;

    const draftKey = `simrs_exam_draft_${scenario.id}_${studentId}`;
    // Load existing draft if any
    const savedDraft = localStorage.getItem(draftKey);
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        if (parsed.icd10Primary) setIcd10Primary(parsed.icd10Primary);
        if (parsed.icd10Secondary) setIcd10Secondary(parsed.icd10Secondary);
        if (parsed.icd9Procedures) setIcd9Procedures(parsed.icd9Procedures);
        if (parsed.coderNotes) setCoderNotes(parsed.coderNotes);
        if (parsed.diagnosaSDKI) setDiagnosaSDKI(parsed.diagnosaSDKI);
        if (parsed.luaranSLKI) setLuaranSLKI(parsed.luaranSLKI);
        if (parsed.intervensiSIKI) setIntervensiSIKI(parsed.intervensiSIKI);
        if (parsed.catatanImplementasi) setCatatanImplementasi(parsed.catatanImplementasi);
      } catch (e) {
        console.error('Draft load error:', e);
      }
    }

    const interval = setInterval(() => {
      const draftData = {
        icd10Primary,
        icd10Secondary,
        icd9Procedures,
        coderNotes,
        diagnosaSDKI,
        luaranSLKI,
        intervensiSIKI,
        catatanImplementasi,
        savedAt: new Date().toLocaleTimeString('id-ID')
      };
      localStorage.setItem(draftKey, JSON.stringify(draftData));
      setLastSavedTime(new Date().toLocaleTimeString('id-ID'));
    }, 30000);

    return () => clearInterval(interval);
  }, [scenario.id, studentId, isCompleted, icd10Primary, icd10Secondary, icd9Procedures, coderNotes, diagnosaSDKI, luaranSLKI, intervensiSIKI, catatanImplementasi]);

  // Countdown timer tick
  useEffect(() => {
    if (isCompleted || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        const nextVal = prev - 1;
        localStorage.setItem(`simrs_exam_timer_${scenario.id}_${studentId}`, nextVal.toString());
        if (nextVal <= 0) {
          clearInterval(timer);
          handleAutoSubmit();
          return 0;
        }
        return nextVal;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isCompleted, scenario.id, studentId]);

  // Format time (MM:SS)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Auto-Submit Handler
  const handleAutoSubmit = () => {
    Swal.fire({
      icon: 'info',
      title: 'Waktu Ujian Berakhir!',
      text: 'Durasi ujian telah habis. Jawaban Anda disimpan dan dievaluasi secara otomatis oleh sistem.',
      confirmButtonColor: '#2563eb'
    }).then(() => {
      submitAnswers(true);
    });
  };

  // Manual Submit confirmation
  const handleManualSubmit = () => {
    Swal.fire({
      title: 'Kumpulkan Jawaban Ujian?',
      text: 'Pastikan seluruh kode dan isian asuhan telah diperiksa dengan teliti. Setelah dikumpulkan, hasil evaluasi dan nilai otomatis akan diterbitkan.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#16a34a',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Ya, Kumpulkan Jawaban',
      cancelButtonText: 'Periksa Kembali'
    }).then((result) => {
      if (result.isConfirmed) {
        submitAnswers(false);
      }
    });
  };

  const submitAnswers = (isAuto: boolean) => {
    const timeSpent = Math.max(1, (scenario.durationMinutes * 60) - timeLeft);

    const submissionDraft: ExamSubmission = {
      id: `SUB-${scenario.id}-${studentId}-${Date.now().toString(36)}`,
      scenarioId: scenario.id,
      studentId,
      studentName,
      submittedAt: new Date().toISOString(),
      timeSpentSeconds: timeSpent,
      autoSubmitted: isAuto,
      studentAnswer: {
        icd10Primary,
        icd10Secondary,
        icd9Procedures,
        coderNotes,
        diagnosaSDKI,
        luaranSLKI,
        intervensiSIKI,
        catatanImplementasi
      },
      score: 0,
      scoreDetails: {
        icd10PrimaryMatch: false,
        icd10SecondaryMatches: [],
        icd10SecondaryMissing: [],
        icd10SecondaryExtra: [],
        icd9Matches: [],
        icd9Missing: [],
        icd9Extra: [],
        sdkiMatches: [],
        sdkiMissing: [],
        sikiMatches: [],
        sikiMissing: [],
        slkiScore: 0,
        feedback: ''
      }
    };

    const graded = evaluateExamSubmission(submissionDraft, scenario);
    saveExamSubmission(graded);
    setCurrentSubmission(graded);
    setRightTab('result');

    // Clean timer
    localStorage.removeItem(`simrs_exam_timer_${scenario.id}_${studentId}`);

    Swal.fire({
      icon: 'success',
      title: 'Ujian Berhasil Dikumpulkan!',
      html: `
        <div class="text-center p-3">
          <div class="text-3xl font-extrabold text-emerald-600 mb-2">${graded.score} / 100</div>
          <p class="text-xs text-slate-600">${graded.scoreDetails.feedback}</p>
        </div>
      `,
      confirmButtonColor: '#2563eb'
    });
  };

  // Helper to highlight search text in PDF reader
  const renderHighlightedContent = (text: string) => {
    if (!pdfSearch.trim()) {
      return text;
    }
    const parts = text.split(new RegExp(`(${pdfSearch})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === pdfSearch.toLowerCase() ? (
        <mark key={i} className="bg-amber-300 text-slate-900 px-0.5 rounded font-bold">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  // Prevent print keyboard shortcuts on the workspace
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'p' || e.key === 's')) {
        e.preventDefault();
        Swal.fire({
          icon: 'warning',
          title: 'Akses Dibatasi',
          text: 'Fungsi cetak (Print) dan simpan (Save) berkas soal ujian dinonaktifkan untuk mematuhi integritas akademik ujian simulasi.',
          confirmButtonColor: '#d97706',
          timer: 2500
        });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] -mt-2 bg-slate-100 rounded-2xl border border-slate-200 overflow-hidden shadow-md select-none">
      {/* EXAM CONTROL HEADER */}
      <div className="bg-white border-b border-slate-200 px-5 py-3 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 hover:bg-slate-100 rounded-xl text-slate-600 transition-colors"
            title="Kembali ke Daftar Ujian"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                scenario.category === 'RMIK'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-emerald-100 text-emerald-800'
              }`}>
                {scenario.category} - UJIAN SIMULASI
              </span>
              <h2 className="text-sm font-bold text-slate-800 line-clamp-1 max-w-md">
                {scenario.title}
              </h2>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
              <span>Peserta: <strong>{studentName}</strong> ({studentId})</span>
              <span>•</span>
              <span>Pasien: <strong>{scenario.extractedPatient.name}</strong> ({scenario.extractedPatient.noRM})</span>
              <span>•</span>
              <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.2 rounded font-medium">
                Auto-Save: {lastSavedTime}
              </span>
            </div>
          </div>
        </div>

        {/* TIMER & SUBMIT BUTTON */}
        <div className="flex items-center gap-3">
          {/* Countdown Clock */}
          {!isCompleted ? (
            <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-mono text-sm font-bold border transition-colors ${
              timeLeft <= 300
                ? 'bg-red-50 text-red-700 border-red-200 animate-pulse'
                : 'bg-slate-900 text-white border-slate-800'
            }`}>
              <Clock className="w-4 h-4" />
              <span>Sisa Waktu: {formatTime(timeLeft)}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-mono text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Ujian Telah Selesai Dikumpulkan</span>
            </div>
          )}

          {/* Action Buttons */}
          {!isCompleted ? (
            <button
              onClick={handleManualSubmit}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs hover:shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              Kumpulkan Ujian
            </button>
          ) : (
            <button
              onClick={() => setRightTab(rightTab === 'workspace' ? 'result' : 'workspace')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs hover:shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              {rightTab === 'result' ? (
                <>
                  <FileText className="w-4 h-4" /> Lihat Form Jawaban
                </>
              ) : (
                <>
                  <Award className="w-4 h-4" /> Lihat Nilai & Kunci
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* DUAL-PANE BODY */}
      <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-hidden">
        {/* ========================================================================= */}
        {/* LEFT PANE: READ-ONLY PDF & CLINICAL CASE VIEWER (7 COLS) */}
        {/* ========================================================================= */}
        <div className="lg:col-span-7 border-r border-slate-200 bg-slate-200/70 flex flex-col overflow-hidden relative">
          {/* PDF Viewer Toolbar */}
          <div className="bg-slate-800 text-white px-4 py-2.5 flex items-center justify-between gap-3 text-xs shrink-0 shadow-xs">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-400" />
              <span className="font-semibold text-slate-200 truncate max-w-[200px]" title={scenario.pdfFileName}>
                {scenario.pdfFileName}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                <Lock className="w-3 h-3" /> READ-ONLY (MAHASISWA)
              </span>
            </div>

            {/* Document Controls: Zoom, Search */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={pdfSearch}
                  onChange={(e) => setPdfSearch(e.target.value)}
                  placeholder="Cari kata/istilah..."
                  className="pl-7 pr-2 py-1 text-xs bg-slate-700 text-white rounded-lg border border-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-400 w-32 placeholder:text-slate-400"
                />
              </div>

              <div className="flex items-center bg-slate-700 rounded-lg p-0.5 border border-slate-600">
                <button
                  onClick={() => setPdfZoom(prev => Math.max(70, prev - 10))}
                  className="p-1 hover:bg-slate-600 rounded text-slate-300 hover:text-white"
                  title="Perkecil"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="px-2 font-mono text-[11px] text-slate-300">{pdfZoom}%</span>
                <button
                  onClick={() => setPdfZoom(prev => Math.min(140, prev + 10))}
                  className="p-1 hover:bg-slate-600 rounded text-slate-300 hover:text-white"
                  title="Perbesar"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setPdfZoom(100)}
                  className="p-1 hover:bg-slate-600 rounded text-slate-300 hover:text-white"
                  title="Reset Zoom"
                >
                  <RotateCcw className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

          {/* Read-Only Academic Integrity Warning Banner */}
          <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-1.5 text-[11px] text-amber-900 font-medium flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>Proteksi Dokumen Kasus: Pengunduhan, pencetakan (Ctrl+P), dan penyuntingan file PDF dinonaktifkan.</span>
            </span>
            <span className="text-[10px] text-slate-500 font-mono">ID: {scenario.id}</span>
          </div>

          {/* Virtual Paper PDF Document Viewer */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 flex justify-center bg-slate-300/60 select-text">
            <div
              style={{ transform: `scale(${pdfZoom / 100})`, transformOrigin: 'top center' }}
              className="w-full max-w-[760px] bg-white rounded-lg shadow-xl border border-slate-300 p-8 min-h-[950px] relative transition-transform text-slate-800 font-sans"
            >
              {/* Subtle Watermark */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden opacity-5 rotate-[-30deg]">
                <p className="text-5xl font-black tracking-widest text-slate-900 text-center uppercase leading-loose">
                  LEMBAR UJIAN SIMULASI SIMRS<br />
                  UNIVERSITAS ESA UNGGUL<br />
                  CONFIDENTIAL - DO NOT COPY
                </p>
              </div>

              {/* Hospital Official Letterhead (Kop Surat) */}
              <div className="border-b-2 border-slate-900 pb-3 mb-6 text-center">
                <h1 className="text-base font-black tracking-wide uppercase text-slate-900">
                  RUMAH SAKIT UNIVERSITAS ESA UNGGUL
                </h1>
                <p className="text-[11px] text-slate-600">
                  Jl. Arjuna Utara No.9, Kebon Jeruk, Jakarta Barat 11510 • Telp: (021) 567-4223
                </p>
                <div className="mt-2 inline-block px-3 py-1 bg-slate-100 rounded-md text-[11px] font-bold tracking-wider text-slate-800 uppercase border border-slate-300">
                  {scenario.category === 'RMIK' ? 'BERKAS REKAM MEDIS KODIFIKASI KLINIS' : 'LEMBAR PENGKAJIAN ASUHAN KEPERAWATAN'}
                </div>
              </div>

              {/* Section 1: Patient Demographics Card */}
              <div className="mb-5 bg-slate-50 border border-slate-200 rounded-xl p-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-blue-900 mb-2.5 pb-1 border-b border-slate-200 flex items-center justify-between">
                  <span>I. Data Demografi & Registrasi Pasien</span>
                  <span className="text-[10px] text-slate-500 font-mono">No. RM: {scenario.extractedPatient.noRM}</span>
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-2 gap-x-4 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Nama Pasien</span>
                    <strong className="text-slate-900">{scenario.extractedPatient.name}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Nomor Registrasi</span>
                    <strong className="text-slate-900 font-mono">{scenario.extractedEncounter.regId}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Tgl Lahir / Umur</span>
                    <span className="text-slate-800">{scenario.extractedPatient.birthDate} ({scenario.extractedPatient.age} th)</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Jenis Kelamin</span>
                    <span className="text-slate-800">{scenario.extractedPatient.gender === 'L' ? 'Laki-laki (L)' : 'Perempuan (P)'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">NIK</span>
                    <span className="text-slate-800 font-mono">{scenario.extractedPatient.nik}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Penjamin Biaya</span>
                    <span className="text-slate-800 font-semibold">{scenario.extractedPatient.insurance}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Unit / Poli</span>
                    <span className="text-slate-800">{scenario.extractedEncounter.poli}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Dokter DPJP</span>
                    <span className="text-slate-800">{scenario.extractedEncounter.dpjpName}</span>
                  </div>
                </div>
              </div>

              {/* Section 2: Clinical SOAP / CPPT */}
              <div className="mb-5 bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
                <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-900 mb-3 pb-1 border-b border-slate-200">
                  II. Catatan Klinis DPJP / SOAP Terintegrasi
                </h3>

                <div className="space-y-3 text-xs leading-relaxed">
                  <div>
                    <span className="inline-block px-1.5 py-0.5 rounded bg-blue-100 text-blue-900 font-bold text-[10px] mr-2">
                      [S] SUBJEKTIF
                    </span>
                    <span className="text-slate-800 font-medium">
                      {renderHighlightedContent(scenario.extractedEncounter.subjective)}
                    </span>
                  </div>

                  <div>
                    <span className="inline-block px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-900 font-bold text-[10px] mr-2">
                      [O] OBJEKTIF
                    </span>
                    <span className="text-slate-800">
                      {renderHighlightedContent(scenario.extractedEncounter.objective)}
                    </span>
                  </div>

                  {/* Vital Signs Row */}
                  <div className="grid grid-cols-5 gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-center my-2">
                    <div>
                      <span className="text-[9px] text-slate-500 block">Tekanan Darah</span>
                      <strong className="text-xs text-slate-900 font-mono">{scenario.extractedEncounter.vitalSigns.td} mmHg</strong>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 block">Nadi / HR</span>
                      <strong className="text-xs text-slate-900 font-mono">{scenario.extractedEncounter.vitalSigns.nadi} x/m</strong>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 block">Suhu Tubuh</span>
                      <strong className="text-xs text-slate-900 font-mono">{scenario.extractedEncounter.vitalSigns.suhu} °C</strong>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 block">Pernapasan</span>
                      <strong className="text-xs text-slate-900 font-mono">{scenario.extractedEncounter.vitalSigns.rr} x/m</strong>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 block">Saturasi SpO2</span>
                      <strong className="text-xs text-slate-900 font-mono">{scenario.extractedEncounter.vitalSigns.spo2} %</strong>
                    </div>
                  </div>

                  <div>
                    <span className="inline-block px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 font-bold text-[10px] mr-2">
                      [A] ASESMEN
                    </span>
                    <span className="text-slate-900 font-bold">
                      {renderHighlightedContent(scenario.extractedEncounter.assessment)}
                    </span>
                  </div>

                  <div>
                    <span className="inline-block px-1.5 py-0.5 rounded bg-purple-100 text-purple-900 font-bold text-[10px] mr-2">
                      [P] PLAN
                    </span>
                    <span className="text-slate-800">
                      {renderHighlightedContent(scenario.extractedEncounter.plan)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Section 3: Diagnostic / Procedures Penunjang */}
              {scenario.extractedEncounter.penunjang && (
                <div className="mb-5 bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-2.5 pb-1 border-b border-slate-200">
                    III. Hasil Pemeriksaan Penunjang & Prosedur Medis
                  </h3>
                  <div className="space-y-2 text-xs">
                    {scenario.extractedEncounter.penunjang.lab && (
                      <div>
                        <strong className="text-slate-700 block text-[11px] mb-0.5">Laboratorium Cito:</strong>
                        <p className="text-slate-600 bg-white p-2 rounded border border-slate-200">
                          {renderHighlightedContent(scenario.extractedEncounter.penunjang.lab)}
                        </p>
                      </div>
                    )}
                    {scenario.extractedEncounter.penunjang.radiologi && (
                      <div>
                        <strong className="text-slate-700 block text-[11px] mb-0.5">Radiologi / EKG / Diagnostik:</strong>
                        <p className="text-slate-600 bg-white p-2 rounded border border-slate-200">
                          {renderHighlightedContent(scenario.extractedEncounter.penunjang.radiologi)}
                        </p>
                      </div>
                    )}
                    {scenario.extractedEncounter.penunjang.tindakan && (
                      <div>
                        <strong className="text-slate-700 block text-[11px] mb-0.5">Tindakan / Prosedur Medis:</strong>
                        <p className="text-slate-600 bg-white p-2 rounded border border-slate-200">
                          {renderHighlightedContent(scenario.extractedEncounter.penunjang.tindakan)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Section 4: Full Verbatim PDF Text Stream */}
              <div className="mt-6 pt-4 border-t border-slate-200">
                <details className="group">
                  <summary className="text-xs font-bold text-slate-600 cursor-pointer hover:text-slate-900 flex items-center justify-between">
                    <span>Lihat Salinan Lengkap Teks Dokumen PDF Asli</span>
                    <span className="text-[10px] text-blue-600 group-open:hidden">Tampilkan ▼</span>
                    <span className="text-[10px] text-blue-600 hidden group-open:inline">Sembunyikan ▲</span>
                  </summary>
                  <pre className="mt-3 p-3.5 bg-slate-900 text-slate-100 rounded-xl text-[11px] font-mono leading-relaxed whitespace-pre-wrap overflow-x-auto max-h-72 border border-slate-800">
                    {renderHighlightedContent(scenario.pdfContentText)}
                  </pre>
                </details>
              </div>

              {/* Verification Stamp */}
              <div className="mt-8 pt-4 border-t border-slate-300 flex items-center justify-between text-[11px] text-slate-500">
                <span>Dokumen Rekam Medis Elektronik (RME) - Akreditasi KARS</span>
                <span className="font-semibold text-slate-700">DPJP: {scenario.extractedEncounter.dpjpName}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT PANE: SIMRS INTERACTIVE WORKSPACE & SCORING RESULT (5 COLS) */}
        {/* ========================================================================= */}
        <div className="lg:col-span-5 bg-white flex flex-col overflow-hidden">
          {/* Right Pane Navigation Tabs */}
          <div className="flex border-b border-slate-200 bg-slate-50 px-4 pt-2.5 gap-2 shrink-0">
            <button
              onClick={() => setRightTab('workspace')}
              className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
                rightTab === 'workspace'
                  ? 'border-blue-600 text-blue-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <FileText className="w-4 h-4" />
              {scenario.category === 'RMIK' ? 'Form Kodifikasi ICD SIMRS' : 'Form Askep SDKI/SIKI'}
            </button>
            <button
              onClick={() => setRightTab('result')}
              className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
                rightTab === 'result'
                  ? 'border-blue-600 text-blue-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Award className="w-4 h-4" />
              Hasil & Nilai {isCompleted && `(${currentSubmission?.score}/100)`}
            </button>
          </div>

          {/* Right Pane Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5 text-slate-700">
            {/* WORKSPACE TAB */}
            {rightTab === 'workspace' && (
              <>
                {/* Patient Context Tag */}
                <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs">
                    <Stethoscope className="w-4 h-4 text-blue-600" />
                    <span>Pasien: <strong>{scenario.extractedPatient.name}</strong> ({scenario.extractedPatient.noRM})</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      // Allow quick navigation to real SIMRS Coding module
                      navigate('coding', { regId: scenario.extractedEncounter.regId });
                    }}
                    className="text-[11px] font-bold text-blue-700 hover:underline flex items-center gap-1"
                    title="Buka encounter di modul Coding utama"
                  >
                    Buka di Modul Coding <ExternalLink className="w-3 h-3" />
                  </button>
                </div>

                {scenario.category === 'RMIK' ? (
                  /* ========================================================= */
                  /* RMIK WORKSPACE: ICD-10 & ICD-9-CM */
                  /* ========================================================= */
                  <div className="space-y-5">
                    {/* 1. Primary Diagnosis */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                        <span>1. Diagnosis Utama (ICD-10 Primary) *</span>
                        <span className="text-[10px] text-blue-600 font-semibold">Bobot: 40 Poin</span>
                      </label>
                      <p className="text-[11px] text-slate-500">
                        Tentukan diagnosis yang menjadi penyebab utama pasien dirawat berdasarkan asesmen DPJP.
                      </p>
                      <div className="space-y-1.5">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            disabled={isCompleted}
                            value={icd10Primary}
                            onChange={(e) => setIcd10Primary(e.target.value.toUpperCase())}
                            placeholder="Contoh: I10 atau A91"
                            className="text-xs px-3 py-2 rounded-xl border border-slate-300 font-bold uppercase w-32 focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100 text-blue-800"
                          />
                          <select
                            disabled={isCompleted}
                            onChange={(e) => {
                              if (e.target.value) setIcd10Primary(e.target.value);
                            }}
                            className="text-xs px-3 py-2 rounded-xl border border-slate-300 bg-white flex-1 disabled:bg-slate-100"
                          >
                            <option value="">-- Rekomendasi Kode ICD-10 --</option>
                            {EXTENDED_ICD10.slice(0, 40).map((c) => (
                              <option key={c.code} value={c.code}>
                                {c.code} - {c.desc}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* 2. Secondary Diagnosis */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                        <span>2. Diagnosis Sekunder & Komorbiditas (ICD-10)</span>
                        <span className="text-[10px] text-blue-600 font-semibold">Bobot: 30 Poin</span>
                      </label>
                      <p className="text-[11px] text-slate-500">
                        Tambahkan diagnosis penyerta, komplikasi, atau riwayat penyakit yang mempengaruhi perawatan.
                      </p>
                      {!isCompleted && (
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={secInput}
                            onChange={(e) => setSecInput(e.target.value.toUpperCase())}
                            placeholder="Ketik kode (misal: E78.5)"
                            className="text-xs px-3 py-2 rounded-xl border border-slate-300 font-bold uppercase w-36"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (secInput.trim() && !icd10Secondary.includes(secInput.trim())) {
                                setIcd10Secondary([...icd10Secondary, secInput.trim()]);
                                setSecInput('');
                              }
                            }}
                            className="px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center gap-1"
                          >
                            <Plus className="w-3.5 h-3.5" /> Tambah
                          </button>
                        </div>
                      )}
                      <div className="flex flex-wrap gap-2 pt-1">
                        {icd10Secondary.map((code) => (
                          <span
                            key={code}
                            className="px-2.5 py-1 bg-blue-50 text-blue-800 border border-blue-200 rounded-lg text-xs font-bold flex items-center gap-1.5"
                          >
                            {code}
                            {!isCompleted && (
                              <button
                                type="button"
                                onClick={() => setIcd10Secondary(icd10Secondary.filter(c => c !== code))}
                                className="hover:text-red-600 font-bold ml-1"
                              >
                                ×
                              </button>
                            )}
                          </span>
                        ))}
                        {icd10Secondary.length === 0 && (
                          <span className="text-xs text-slate-400 italic">Belum ada kode sekunder</span>
                        )}
                      </div>
                    </div>

                    {/* 3. ICD-9-CM Procedures */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                        <span>3. Tindakan / Prosedur Medis (ICD-9-CM)</span>
                        <span className="text-[10px] text-blue-600 font-semibold">Bobot: 30 Poin</span>
                      </label>
                      <p className="text-[11px] text-slate-500">
                        Kodekan tindakan medis, pemeriksaan diagnostik (EKG, USG, Rontgen), dan terapi invasif (infus, injeksi, operasi).
                      </p>
                      {!isCompleted && (
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={procInput}
                            onChange={(e) => setProcInput(e.target.value)}
                            placeholder="Kode ICD-9-CM (misal: 89.13)"
                            className="text-xs px-3 py-2 rounded-xl border border-slate-300 font-bold uppercase w-36"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (procInput.trim() && !icd9Procedures.includes(procInput.trim())) {
                                setIcd9Procedures([...icd9Procedures, procInput.trim()]);
                                setProcInput('');
                              }
                            }}
                            className="px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center gap-1"
                          >
                            <Plus className="w-3.5 h-3.5" /> Tambah
                          </button>
                        </div>
                      )}
                      <div className="flex flex-wrap gap-2 pt-1">
                        {icd9Procedures.map((proc) => (
                          <span
                            key={proc}
                            className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-bold flex items-center gap-1.5"
                          >
                            {proc}
                            {!isCompleted && (
                              <button
                                type="button"
                                onClick={() => setIcd9Procedures(icd9Procedures.filter(p => p !== proc))}
                                className="hover:text-red-600 font-bold ml-1"
                              >
                                ×
                              </button>
                            )}
                          </span>
                        ))}
                        {icd9Procedures.length === 0 && (
                          <span className="text-xs text-slate-400 italic">Belum ada kode prosedur</span>
                        )}
                      </div>
                    </div>

                    {/* 4. Coder Notes */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-800">
                        Catatan Perekam Medis (Justifikasi Klinis)
                      </label>
                      <textarea
                        rows={3}
                        disabled={isCompleted}
                        value={coderNotes}
                        onChange={(e) => setCoderNotes(e.target.value)}
                        placeholder="Berikan alasan atau rujukan aturan kodifikasi ICD-10 (rule MB1-MB5)..."
                        className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100"
                      />
                    </div>
                  </div>
                ) : (
                  /* ========================================================= */
                  /* KEPERAWATAN WORKSPACE: SDKI, SLKI, SIKI */
                  /* ========================================================= */
                  <div className="space-y-5">
                    {/* SDKI Diagnosa */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                        <span>1. Masalah / Diagnosa Keperawatan (SDKI) *</span>
                        <span className="text-[10px] text-emerald-600 font-semibold">Bobot: 40 Poin</span>
                      </label>
                      {!isCompleted && (
                        <div className="flex gap-2">
                          <select
                            value={sdkiSelect}
                            onChange={(e) => setSdkiSelect(e.target.value)}
                            className="text-xs px-3 py-2 rounded-xl border border-slate-300 bg-white flex-1"
                          >
                            <option value="">-- Pilih Standar SDKI PPNI --</option>
                            {NURSING_SDKI_LIST.map((item) => (
                              <option key={item.code} value={`${item.code}: ${item.name}`}>
                                {item.code} - {item.name} ({item.category})
                              </option>
                            ))}
                          </select>
                          <button
                            type="button"
                            onClick={() => {
                              if (sdkiSelect && !diagnosaSDKI.includes(sdkiSelect)) {
                                setDiagnosaSDKI([...diagnosaSDKI, sdkiSelect]);
                                setSdkiSelect('');
                              }
                            }}
                            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1"
                          >
                            <Plus className="w-3.5 h-3.5" /> Tambah
                          </button>
                        </div>
                      )}
                      <div className="flex flex-wrap gap-2 pt-1">
                        {diagnosaSDKI.map((item) => (
                          <span
                            key={item}
                            className="px-2.5 py-1 bg-blue-100 text-blue-800 rounded-lg text-xs font-bold flex items-center gap-1.5"
                          >
                            {item}
                            {!isCompleted && (
                              <button
                                type="button"
                                onClick={() => setDiagnosaSDKI(diagnosaSDKI.filter(d => d !== item))}
                                className="hover:text-red-600 font-bold ml-1"
                              >
                                ×
                              </button>
                            )}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* SLKI Luaran */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                        <span>2. Kriteria Luaran Keperawatan (SLKI)</span>
                        <span className="text-[10px] text-emerald-600 font-semibold">Bobot: 20 Poin</span>
                      </label>
                      <select
                        disabled={isCompleted}
                        value={luaranSLKI}
                        onChange={(e) => setLuaranSLKI(e.target.value)}
                        className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 bg-white disabled:bg-slate-100"
                      >
                        <option value="">-- Pilih Luaran SLKI --</option>
                        {NURSING_SLKI_LIST.map((item) => (
                          <option key={item.code} value={`${item.code}: ${item.name}`}>
                            {item.code} - {item.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* SIKI Intervensi */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                        <span>3. Rencana Intervensi Keperawatan (SIKI) *</span>
                        <span className="text-[10px] text-emerald-600 font-semibold">Bobot: 40 Poin</span>
                      </label>
                      {!isCompleted && (
                        <div className="flex gap-2">
                          <select
                            value={sikiSelect}
                            onChange={(e) => setSikiSelect(e.target.value)}
                            className="text-xs px-3 py-2 rounded-xl border border-slate-300 bg-white flex-1"
                          >
                            <option value="">-- Pilih Standar SIKI PPNI --</option>
                            {NURSING_SIKI_LIST.map((item) => (
                              <option key={item.code} value={`${item.code}: ${item.name}`}>
                                {item.code} - {item.name}
                              </option>
                            ))}
                          </select>
                          <button
                            type="button"
                            onClick={() => {
                              if (sikiSelect && !intervensiSIKI.includes(sikiSelect)) {
                                setIntervensiSIKI([...intervensiSIKI, sikiSelect]);
                                setSikiSelect('');
                              }
                            }}
                            className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1"
                          >
                            <Plus className="w-3.5 h-3.5" /> Tambah
                          </button>
                        </div>
                      )}
                      <div className="flex flex-wrap gap-2 pt-1">
                        {intervensiSIKI.map((item) => (
                          <span
                            key={item}
                            className="px-2.5 py-1 bg-indigo-100 text-indigo-800 rounded-lg text-xs font-bold flex items-center gap-1.5"
                          >
                            {item}
                            {!isCompleted && (
                              <button
                                type="button"
                                onClick={() => setIntervensiSIKI(intervensiSIKI.filter(i => i !== item))}
                                className="hover:text-red-600 font-bold ml-1"
                              >
                                ×
                              </button>
                            )}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Catatan Implementasi Keperawatan */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-800">
                        Catatan Tindakan & Implementasi Perawat
                      </label>
                      <textarea
                        rows={3}
                        disabled={isCompleted}
                        value={catatanImplementasi}
                        onChange={(e) => setCatatanImplementasi(e.target.value)}
                        placeholder="Uraikan tindakan keperawatan yang telah dilakukan..."
                        className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100"
                      />
                    </div>
                  </div>
                )}
              </>
            )}

            {/* RESULTS TAB */}
            {rightTab === 'result' && (
              <div className="space-y-5">
                {currentSubmission ? (
                  <>
                    {/* Score Card Banner */}
                    <div className={`p-6 rounded-2xl border text-center relative overflow-hidden ${
                      currentSubmission.score >= 70
                        ? 'bg-gradient-to-br from-emerald-500 to-teal-700 text-white border-emerald-600'
                        : 'bg-gradient-to-br from-amber-500 to-orange-600 text-white border-amber-600'
                    }`}>
                      <span className="text-xs uppercase font-bold tracking-wider opacity-90 block mb-1">
                        Hasil Evaluasi Ujian Praktik SIMRS
                      </span>
                      <div className="text-5xl font-black tracking-tight my-2">
                        {currentSubmission.score}
                        <span className="text-2xl font-medium opacity-80"> / 100</span>
                      </div>
                      <p className="text-xs font-medium opacity-90 max-w-sm mx-auto">
                        {currentSubmission.score >= 70
                          ? 'Selamat! Anda dinyatakan LULUS kompetensi praktikum ini.'
                          : 'Perlu pendalaman lebih lanjut pada kaidah pemilihan kode diagnosis / intervensi.'}
                      </p>
                      <div className="mt-3 inline-block px-3 py-1 bg-white/20 rounded-full text-[11px] font-bold">
                        Waktu Pengerjaan: {Math.floor(currentSubmission.timeSpentSeconds / 60)} menit {currentSubmission.timeSpentSeconds % 60} detik
                      </div>
                    </div>

                    {/* Feedback DPJP / Scoring Engine */}
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                      <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <Award className="w-4 h-4 text-blue-600" /> Catatan Evaluasi Otomatis (Scoring Engine)
                      </h4>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {currentSubmission.scoreDetails.feedback}
                      </p>
                      {scenario.answerKey.rubrikPenilaian && (
                        <div className="mt-2 pt-2 border-t border-slate-200 text-xs text-slate-500">
                          <strong>Rubrik Dosen:</strong> {scenario.answerKey.rubrikPenilaian}
                        </div>
                      )}
                    </div>

                    {/* Detail Comparison Table */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                        Rincian Perbandingan dengan Kunci Jawaban
                      </h4>

                      {scenario.category === 'RMIK' ? (
                        <div className="space-y-2.5 text-xs">
                          {/* Primary check */}
                          <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                            <div>
                              <span className="text-[10px] text-slate-500 block">Diagnosis Utama (ICD-10)</span>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="font-bold text-slate-900">
                                  Jawaban Anda: {currentSubmission.studentAnswer.icd10Primary || '(Kosong)'}
                                </span>
                                <span>vs</span>
                                <span className="font-bold text-blue-700">
                                  Kunci: {scenario.answerKey.icd10Primary}
                                </span>
                              </div>
                            </div>
                            <span className={`px-2 py-1 rounded-md font-bold text-[11px] ${
                              currentSubmission.scoreDetails.icd10PrimaryMatch
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {currentSubmission.scoreDetails.icd10PrimaryMatch ? 'Tepat (40/40)' : 'Salah (0/40)'}
                            </span>
                          </div>

                          {/* Secondary check */}
                          <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] text-slate-500 font-bold uppercase">Diagnosis Sekunder (ICD-10)</span>
                              <span className="text-[11px] font-bold text-blue-700">
                                {currentSubmission.scoreDetails.icd10SecondaryMatches.length} / {scenario.answerKey.icd10Secondary.length} Tepat
                              </span>
                            </div>
                            <div className="text-[11px]">
                              <span className="text-slate-500">Kunci Dosen: </span>
                              <strong className="text-slate-800">{scenario.answerKey.icd10Secondary.join(', ') || '-'}</strong>
                            </div>
                            <div className="text-[11px]">
                              <span className="text-slate-500">Jawaban Anda: </span>
                              <strong className="text-slate-800">{currentSubmission.studentAnswer.icd10Secondary.join(', ') || '-'}</strong>
                            </div>
                          </div>

                          {/* ICD-9-CM check */}
                          <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] text-slate-500 font-bold uppercase">Prosedur / Tindakan (ICD-9-CM)</span>
                              <span className="text-[11px] font-bold text-emerald-700">
                                {currentSubmission.scoreDetails.icd9Matches.length} / {scenario.answerKey.icd9Procedures.length} Tepat
                              </span>
                            </div>
                            <div className="text-[11px]">
                              <span className="text-slate-500">Kunci Dosen: </span>
                              <strong className="text-slate-800">{scenario.answerKey.icd9Procedures.join(', ') || '-'}</strong>
                            </div>
                            <div className="text-[11px]">
                              <span className="text-slate-500">Jawaban Anda: </span>
                              <strong className="text-slate-800">{currentSubmission.studentAnswer.icd9Procedures.join(', ') || '-'}</strong>
                            </div>
                          </div>
                        </div>
                      ) : (
                        /* Keperawatan check */
                        <div className="space-y-2.5 text-xs">
                          <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 space-y-1.5">
                            <span className="text-[10px] text-slate-500 font-bold uppercase">Diagnosa SDKI</span>
                            <div className="text-[11px]">
                              <span className="text-slate-500">Kunci Dosen: </span>
                              <strong className="text-slate-800">{scenario.answerKey.diagnosaSDKI.join(' • ')}</strong>
                            </div>
                            <div className="text-[11px]">
                              <span className="text-slate-500">Jawaban Anda: </span>
                              <strong className="text-slate-800">{currentSubmission.studentAnswer.diagnosaSDKI.join(' • ') || '-'}</strong>
                            </div>
                          </div>
                          <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 space-y-1.5">
                            <span className="text-[10px] text-slate-500 font-bold uppercase">Intervensi SIKI</span>
                            <div className="text-[11px]">
                              <span className="text-slate-500">Kunci Dosen: </span>
                              <strong className="text-slate-800">{scenario.answerKey.intervensiSIKI.join(' • ')}</strong>
                            </div>
                            <div className="text-[11px]">
                              <span className="text-slate-500">Jawaban Anda: </span>
                              <strong className="text-slate-800">{currentSubmission.studentAnswer.intervensiSIKI.join(' • ') || '-'}</strong>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  /* If not submitted yet */
                  <div className="p-8 text-center text-slate-500 space-y-3 bg-slate-50 rounded-2xl border border-slate-200">
                    <Lock className="w-8 h-8 text-slate-400 mx-auto" />
                    <h4 className="text-sm font-bold text-slate-800">
                      Kunci Jawaban & Evaluasi Otomatis Terkunci
                    </h4>
                    <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                      Sesuai dengan ketentuan ujian praktikum, kunci jawaban dan penilaian akan ditampilkan secara otomatis setelah Anda mengumpulkan ujian.
                    </p>
                    {isDosen && (
                      <div className="pt-3 border-t border-slate-200">
                        <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-full">
                          Privilese Dosen: Anda dapat melihat kunci jawaban di panel Kelola Soal.
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
