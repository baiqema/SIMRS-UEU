import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ExamScenario } from '../types';
import { ExamScenarioManagerModal } from '../components/exam/ExamScenarioManagerModal';
import { ExamDualPaneWorkspace } from '../components/exam/ExamDualPaneWorkspace';
import {
  GraduationCap, Plus, Clock, FileText, CheckCircle2,
  AlertTriangle, BookOpen, UserCheck, ShieldCheck,
  Edit, Trash2, Play, Award, BarChart3, Users, ExternalLink,
  Sparkles, Lock, RotateCcw, Search, Eye
} from 'lucide-react';
import Swal from 'sweetalert2';

export const PraktikumView: React.FC = () => {
  const {
    praktikum,
    examScenarios,
    deleteExamScenario,
    examSubmissions,
    deleteExamSubmission,
    user,
    navigate
  } = useApp();

  // Role Detection: Dosen vs Mahasiswa
  // R03 = Dosen, R01 = Super Admin (Full Control)
  // R04 = Mahasiswa (Umum/RMIK), R14 = Mahasiswa Keperawatan
  const isDosenRole = user?.roleId === 'R03' || user?.roleId === 'R01';

  // Role perspective override for quick preview testing (optional)
  const [roleModeOverride, setRoleModeOverride] = useState<'AUTO' | 'DOSEN' | 'MAHASISWA'>('AUTO');
  const isDosen = roleModeOverride === 'AUTO' ? isDosenRole : roleModeOverride === 'DOSEN';

  // Active view states
  const [activeTab, setActiveTab] = useState<'exams' | 'bank' | 'grades' | 'guides'>('exams');
  const [activeScenarioForExam, setActiveScenarioForExam] = useState<ExamScenario | null>(null);
  const [selectedScenarioForEdit, setSelectedScenarioForEdit] = useState<ExamScenario | null>(null);
  const [isManagerModalOpen, setIsManagerModalOpen] = useState(false);

  // Search & Filter
  const [searchFilter, setSearchFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'RMIK' | 'Keperawatan'>('ALL');

  // If in an active exam session, show the Dual-Pane Workspace!
  if (activeScenarioForExam) {
    return (
      <ExamDualPaneWorkspace
        scenario={activeScenarioForExam}
        onBack={() => setActiveScenarioForExam(null)}
      />
    );
  }

  // Filtered Scenarios - Sorted ascending by noRM (000001 on top)
  const filteredScenarios = examScenarios.filter(scen => {
    if (categoryFilter !== 'ALL' && scen.category !== categoryFilter) return false;
    if (!searchFilter.trim()) return true;
    const q = searchFilter.toLowerCase();
    return (
      scen.title.toLowerCase().includes(q) ||
      scen.description.toLowerCase().includes(q) ||
      scen.extractedPatient.name.toLowerCase().includes(q) ||
      scen.extractedPatient.noRM.toLowerCase().includes(q) ||
      scen.pdfFileName.toLowerCase().includes(q)
    );
  }).sort((a, b) => {
    const numA = parseInt((a.extractedPatient?.noRM || '').replace(/\D/g, '') || '0', 10);
    const numB = parseInt((b.extractedPatient?.noRM || '').replace(/\D/g, '') || '0', 10);
    return numA - numB;
  });

  const handleDeleteScenario = (scen: ExamScenario) => {
    if (!isDosen) {
      Swal.fire({
        icon: 'error',
        title: 'Akses Ditolak',
        text: 'Role Mahasiswa dilarang keras menghapus atau mengubah skenario kasus ujian.',
        confirmButtonColor: '#2563eb'
      });
      return;
    }

    Swal.fire({
      title: 'Hapus Skenario Ujian?',
      text: `Skenario "${scen.title}" (${scen.pdfFileName}) akan dihapus dari bank soal SIMRS.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Ya, Hapus Skenario',
      cancelButtonText: 'Batal'
    }).then(result => {
      if (result.isConfirmed) {
        deleteExamScenario(scen.id);
        Swal.fire({
          icon: 'success',
          title: 'Skenario Dihapus',
          timer: 1500,
          showConfirmButton: false
        });
      }
    });
  };

  const handleStartExam = (scen: ExamScenario) => {
    setActiveScenarioForExam(scen);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs">
              <GraduationCap className="w-5 h-5" />
            </span>
            <h1 className="text-lg font-bold text-slate-900">
              Modul Ujian Praktik & Simulasi Laboratorium SIMRS
            </h1>
          </div>
          <p className="text-xs text-slate-500 max-w-2xl">
            Simulasi Ujian Praktik RMIK (Kodifikasi Klinis ICD-10 & ICD-9-CM) & Keperawatan (SDKI, SLKI, SIKI) dengan Ekstraksi PDF Otomatis, Layar Ganda (Dual-Pane), dan Penilaian Otomatis (Scoring Engine).
          </p>
        </div>

        {/* Role Access Indicator & Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-2 ${
            isDosen
              ? 'bg-indigo-50 text-indigo-800 border-indigo-200'
              : 'bg-emerald-50 text-emerald-800 border-emerald-200'
          }`}>
            {isDosen ? (
              <>
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                <span>Peran: DOSEN (Full Control / Pengelola Soal)</span>
              </>
            ) : (
              <>
                <UserCheck className="w-4 h-4 text-emerald-600" />
                <span>Peran: MAHASISWA (Peserta Ujian / Read-Only)</span>
              </>
            )}
          </div>

          {/* Quick Perspective Toggle for instant testing */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-[11px] font-semibold">
            <span className="px-2 text-slate-500">Pratinjau:</span>
            <button
              onClick={() => setRoleModeOverride('AUTO')}
              className={`px-2 py-0.5 rounded-lg transition-colors ${roleModeOverride === 'AUTO' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600'}`}
              title="Mengikuti akun login saat ini"
            >
              Default
            </button>
            <button
              onClick={() => setRoleModeOverride('DOSEN')}
              className={`px-2 py-0.5 rounded-lg transition-colors ${roleModeOverride === 'DOSEN' ? 'bg-indigo-600 text-white shadow-2xs font-bold' : 'text-slate-600'}`}
              title="Pratinjau hak akses Dosen (Upload, Edit, Kunci Jawaban)"
            >
              Dosen
            </button>
            <button
              onClick={() => setRoleModeOverride('MAHASISWA')}
              className={`px-2 py-0.5 rounded-lg transition-colors ${roleModeOverride === 'MAHASISWA' ? 'bg-emerald-600 text-white shadow-2xs font-bold' : 'text-slate-600'}`}
              title="Pratinjau hak akses Mahasiswa (Read-Only PDF, Kerjakan Form)"
            >
              Mahasiswa
            </button>
          </div>

          {/* Dosen Action: Add Scenario */}
          {isDosen && (
            <button
              onClick={() => {
                setSelectedScenarioForEdit(null);
                setIsManagerModalOpen(true);
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs hover:shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Tambah Skenario Ujian (PDF)
            </button>
          )}
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 pt-3 rounded-t-2xl">
        <div className="flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('exams')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'exams'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Play className="w-4 h-4" /> Daftar Ujian Praktik ({filteredScenarios.length})
          </button>

          {isDosen && (
            <button
              onClick={() => setActiveTab('bank')}
              className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
                activeTab === 'bank'
                  ? 'border-blue-600 text-blue-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <FileText className="w-4 h-4" /> Bank Soal & Pengelolaan Dosen
            </button>
          )}

          <button
            onClick={() => setActiveTab('grades')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'grades'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Award className="w-4 h-4" /> Rekap Nilai & Hasil Ujian ({examSubmissions.length})
          </button>

          <button
            onClick={() => setActiveTab('guides')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'guides'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <BookOpen className="w-4 h-4" /> Panduan Praktikum Modul SIMRS
          </button>
        </div>

        {/* Category & Search Filter */}
        {(activeTab === 'exams' || activeTab === 'bank') && (
          <div className="flex items-center gap-2 pb-3">
            <div className="flex items-center bg-slate-100 rounded-xl p-0.5 border border-slate-200 text-xs">
              <button
                onClick={() => setCategoryFilter('ALL')}
                className={`px-2.5 py-1 rounded-lg font-semibold ${categoryFilter === 'ALL' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-500'}`}
              >
                Semua
              </button>
              <button
                onClick={() => setCategoryFilter('RMIK')}
                className={`px-2.5 py-1 rounded-lg font-semibold ${categoryFilter === 'RMIK' ? 'bg-blue-600 text-white shadow-2xs font-bold' : 'text-slate-500'}`}
              >
                RMIK (ICD)
              </button>
              <button
                onClick={() => setCategoryFilter('Keperawatan')}
                className={`px-2.5 py-1 rounded-lg font-semibold ${categoryFilter === 'Keperawatan' ? 'bg-emerald-600 text-white shadow-2xs font-bold' : 'text-slate-500'}`}
              >
                Keperawatan
              </button>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Cari kasus / pasien..."
                className="pl-7 pr-3 py-1 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 w-36 sm:w-48"
              />
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: DAFTAR UJIAN PRAKTIK & SIMULASI (CARDS VIEW) */}
      {/* ========================================================================= */}
      {activeTab === 'exams' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filteredScenarios.map((scen) => {
              const submission = examSubmissions.find(
                s => s.scenarioId === scen.id && (s.studentId === user?.id || !isDosen)
              );
              const isDone = !!submission;

              return (
                <div
                  key={scen.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
                >
                  {/* Card Header */}
                  <div className="p-5 pb-3">
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                        scen.category === 'RMIK'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {scen.category}
                      </span>
                      <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{scen.durationMinutes} Menit</span>
                      </div>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors mb-2 line-clamp-2">
                      {scen.title}
                    </h3>

                    <p className="text-xs text-slate-500 line-clamp-2 mb-3 leading-relaxed">
                      {scen.description}
                    </p>

                    {/* Patient & Case Summary Pill */}
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-500">Pasien Simulasi:</span>
                        <strong className="text-slate-800">{scen.extractedPatient.name}</strong>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-500">No. RM / Reg:</span>
                        <span className="font-mono text-slate-700">{scen.extractedPatient.noRM} • {scen.extractedEncounter.regId}</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-500">File Berkas PDF:</span>
                        <span className="text-blue-700 truncate max-w-[170px] font-mono text-[10px]" title={scen.pdfFileName}>
                          {scen.pdfFileName}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer & Action Buttons */}
                  <div className="p-5 pt-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
                    {/* Status Badge */}
                    {isDone ? (
                      <div className="flex items-center gap-1 text-xs font-bold text-emerald-700">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Selesai • Nilai: {submission.score}/100</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-xs font-semibold text-amber-700">
                        <Clock className="w-3.5 h-3.5 text-amber-500" />
                        <span>Belum Dikerjakan</span>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      {/* Dosen Edit Button */}
                      {isDosen && (
                        <button
                          onClick={() => {
                            setSelectedScenarioForEdit(scen);
                            setIsManagerModalOpen(true);
                          }}
                          className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                          title="Edit Skenario / Kunci Jawaban (Dosen)"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      )}

                      {/* Start / View Exam Workspace */}
                      <button
                        onClick={() => handleStartExam(scen)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-xs hover:shadow-md transition-all flex items-center gap-1.5 cursor-pointer ${
                          isDone
                            ? 'bg-slate-800 hover:bg-slate-900 text-white'
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                      >
                        <Play className="w-3.5 h-3.5" />
                        {isDone ? 'Buka Workspace' : 'Mulai Ujian'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredScenarios.length === 0 && (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 space-y-3">
              <FileText className="w-10 h-10 text-slate-300 mx-auto" />
              <h4 className="text-sm font-bold text-slate-800">Tidak ada skenario ujian yang cocok</h4>
              <p className="text-xs text-slate-400">Silakan ubah filter pencarian atau buat skenario baru melalui Dosen.</p>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: BANK SOAL & PENGELOLAAN DOSEN (DOSEN ONLY TABLE) */}
      {/* ========================================================================= */}
      {activeTab === 'bank' && isDosen && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Manajemen Bank Soal & Kasus Rekam Medis</h3>
              <p className="text-xs text-slate-500">
                Dosen memiliki hak penuh membuat, mengubah, mengunggah ulang PDF, dan menetapkan kunci jawaban ujian.
              </p>
            </div>
            <button
              onClick={() => {
                setSelectedScenarioForEdit(null);
                setIsManagerModalOpen(true);
              }}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Tambah Soal PDF
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-3.5">ID Skenario</th>
                  <th className="p-3.5">Judul & Kategori</th>
                  <th className="p-3.5">Pasien Rekam Medis</th>
                  <th className="p-3.5">File Berkas PDF</th>
                  <th className="p-3.5">Durasi</th>
                  <th className="p-3.5">Kunci Jawaban Preview</th>
                  <th className="p-3.5 text-center">Status</th>
                  <th className="p-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredScenarios.map((scen) => (
                  <tr key={scen.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5 font-mono text-[11px] font-semibold text-slate-500">
                      {scen.id}
                    </td>
                    <td className="p-3.5">
                      <strong className="text-slate-900 block text-xs mb-0.5">{scen.title}</strong>
                      <span className={`text-[10px] px-2 py-0.2 rounded font-bold ${
                        scen.category === 'RMIK' ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {scen.category}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span className="font-semibold text-slate-900 block">{scen.extractedPatient.name}</span>
                      <span className="text-[11px] text-slate-500 font-mono">
                        {scen.extractedPatient.noRM.replace(/\D/g, '').padStart(6, '0')}
                      </span>
                    </td>
                    <td className="p-3.5 font-mono text-[11px] text-blue-700">
                      {scen.pdfFileName}
                    </td>
                    <td className="p-3.5 font-mono text-slate-700">
                      {scen.durationMinutes} Menit
                    </td>
                    <td className="p-3.5">
                      {scen.category === 'RMIK' ? (
                        <div className="space-y-0.5 text-[11px]">
                          <div><span className="text-slate-400">Prim: </span><strong className="text-blue-700 font-mono">{scen.answerKey.icd10Primary || '-'}</strong></div>
                          <div><span className="text-slate-400">Sec: </span><span className="font-mono text-slate-600">{scen.answerKey.icd10Secondary.join(', ') || '-'}</span></div>
                          <div><span className="text-slate-400">ICD-9: </span><span className="font-mono text-emerald-700">{scen.answerKey.icd9Procedures.join(', ') || '-'}</span></div>
                        </div>
                      ) : (
                        <div className="space-y-0.5 text-[11px]">
                          <div><span className="text-slate-400">SDKI: </span><span className="font-semibold text-indigo-700">{scen.answerKey.diagnosaSDKI.length} diagnosa</span></div>
                          <div><span className="text-slate-400">SIKI: </span><span className="text-slate-600">{scen.answerKey.intervensiSIKI.length} intervensi</span></div>
                        </div>
                      )}
                    </td>
                    <td className="p-3.5 text-center">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {scen.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleStartExam(scen)}
                          className="p-1.5 hover:bg-blue-50 text-blue-600 rounded-lg"
                          title="Uji Layar Ganda (Dual Pane)"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedScenarioForEdit(scen);
                            setIsManagerModalOpen(true);
                          }}
                          className="p-1.5 hover:bg-slate-100 text-slate-700 rounded-lg"
                          title="Edit Skenario & Kunci Jawaban"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteScenario(scen)}
                          className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg"
                          title="Hapus Skenario"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: REKAP NILAI & HASIL EVALUASI MAHASISWA */}
      {/* ========================================================================= */}
      {activeTab === 'grades' && (
        <div className="space-y-4">
          {/* Summary metrics cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-xs text-slate-500 font-semibold block">Total Lembar Ujian Masuk</span>
              <div className="text-2xl font-bold text-slate-900 mt-1">{examSubmissions.length}</div>
            </div>
            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-xs text-slate-500 font-semibold block">Rata-rata Nilai Mahasiswa</span>
              <div className="text-2xl font-bold text-blue-600 mt-1">
                {examSubmissions.length > 0
                  ? Math.round(examSubmissions.reduce((acc, s) => acc + s.score, 0) / examSubmissions.length)
                  : 0} / 100
              </div>
            </div>
            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-xs text-slate-500 font-semibold block">Tingkat Kelulusan (&ge; 70)</span>
              <div className="text-2xl font-bold text-emerald-600 mt-1">
                {examSubmissions.length > 0
                  ? Math.round((examSubmissions.filter(s => s.score >= 70).length / examSubmissions.length) * 100)
                  : 100}%
              </div>
            </div>
          </div>

          {/* Submissions Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-900">Daftar Hasil Nilai & Evaluasi Ujian Praktik</h3>
              <p className="text-xs text-slate-500">
                Nilai dihitung otomatis oleh Scoring Engine berdasarkan ketepatan diagnosis utama, sekunder, dan prosedur klinis.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">Nama Mahasiswa</th>
                    <th className="p-3.5">Skenario Ujian</th>
                    <th className="p-3.5">Waktu Kumpul</th>
                    <th className="p-3.5">Durasi Kerja</th>
                    <th className="p-3.5 text-center">Nilai Akhir</th>
                    <th className="p-3.5 text-center">Status</th>
                    <th className="p-3.5">Catatan Scoring</th>
                    {isDosen && <th className="p-3.5 text-right">Aksi</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {examSubmissions.map((sub) => {
                    const scen = examScenarios.find(s => s.id === sub.scenarioId);

                    return (
                      <tr key={sub.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3.5 font-semibold text-slate-900">
                          {sub.studentName}
                          <span className="block text-[10px] text-slate-400 font-mono">{sub.studentId}</span>
                        </td>
                        <td className="p-3.5">
                          <strong className="text-slate-800 block">{scen?.title || sub.scenarioId}</strong>
                          <span className="text-[10px] text-slate-500 font-mono">Pasien: {scen?.extractedPatient.name}</span>
                        </td>
                        <td className="p-3.5 text-slate-600">
                          {new Date(sub.submittedAt).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>
                        <td className="p-3.5 font-mono">
                          {Math.floor(sub.timeSpentSeconds / 60)}m {sub.timeSpentSeconds % 60}s
                        </td>
                        <td className="p-3.5 text-center font-bold text-sm">
                          <span className={sub.score >= 70 ? 'text-emerald-600' : 'text-amber-600'}>
                            {sub.score}
                          </span>
                        </td>
                        <td className="p-3.5 text-center">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            sub.score >= 70 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {sub.score >= 70 ? 'LULUS' : 'REMIDI'}
                          </span>
                        </td>
                        <td className="p-3.5 text-xs text-slate-600 max-w-xs truncate" title={sub.scoreDetails.feedback}>
                          {sub.scoreDetails.feedback}
                        </td>
                        {isDosen && (
                          <td className="p-3.5 text-right">
                            <button
                              onClick={() => {
                                Swal.fire({
                                  title: 'Reset Lembar Ujian?',
                                  text: `Hapus jawaban ${sub.studentName} agar dapat mengulang ujian kembali?`,
                                  icon: 'warning',
                                  showCancelButton: true,
                                  confirmButtonColor: '#ef4444',
                                  cancelButtonColor: '#64748b',
                                  confirmButtonText: 'Ya, Reset'
                                }).then(res => {
                                  if (res.isConfirmed) {
                                    deleteExamSubmission(sub.id);
                                    Swal.fire({ icon: 'success', title: 'Jawaban Direset', timer: 1200, showConfirmButton: false });
                                  }
                                });
                              }}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                              title="Reset Ujian Mahasiswa (Dosen)"
                            >
                              <RotateCcw className="w-4 h-4" />
                            </button>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                  {examSubmissions.length === 0 && (
                    <tr>
                      <td colSpan={isDosen ? 8 : 7} className="p-8 text-center text-slate-400">
                        Belum ada submission jawaban ujian mahasiswa.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: PANDUAN PRAKTIKUM MODUL SIMRS */}
      {/* ========================================================================= */}
      {activeTab === 'guides' && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {praktikum.map(p => (
            <div
              key={p.id}
              onClick={() => {
                const routeMap: Record<string, string> = {
                  'Pendaftaran': 'pendaftaran',
                  'Rekam Medis': 'rekammedis',
                  'CPPT': 'cppt',
                  'Coding': 'coding',
                  'Klaim': 'klaim',
                  'Audit': 'audit'
                };
                const target = routeMap[p.modul] || 'dashboard';
                navigate(target);
              }}
              className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    <GraduationCap className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    {p.status}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors mb-1.5">
                  {p.title}
                </h3>
                <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                  {p.desc}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-600">
                <span className="flex items-center gap-1"><BookOpen className="w-3.5 h-3.5" /> Buka Modul: {p.modul}</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Dosen Scenario Manager Modal */}
      <ExamScenarioManagerModal
        isOpen={isManagerModalOpen}
        onClose={() => setIsManagerModalOpen(false)}
        scenarioToEdit={selectedScenarioForEdit}
      />
    </div>
  );
};
