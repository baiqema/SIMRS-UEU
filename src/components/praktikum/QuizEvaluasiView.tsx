import React, { useState, useEffect } from 'react';
import { QUIZ_SOAL_20, QuizQuestion } from '../../data/praktikumMateriQuizData';
import {
  CheckCircle2, XCircle, AlertCircle, RotateCcw, ArrowRight,
  ArrowLeft, Award, HelpCircle, BookOpen, Clock, Printer,
  Sparkles, Check, ChevronRight, BarChart2, ShieldCheck, Flag
} from 'lucide-react';
import Swal from 'sweetalert2';

interface QuizEvaluasiViewProps {
  onBackToMateri: () => void;
  studentName?: string;
  studentId?: string;
}

export const QuizEvaluasiView: React.FC<QuizEvaluasiViewProps> = ({
  onBackToMateri,
  studentName = 'Mahasiswa RMIK',
  studentId = 'MHS-2026'
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, 'A' | 'B' | 'C' | 'D'>>({});
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [filterReview, setFilterReview] = useState<'ALL' | 'CORRECT' | 'WRONG'>('ALL');

  const totalQuestions = QUIZ_SOAL_20.length;
  const currentQuestion = QUIZ_SOAL_20[currentIndex];
  const currentAnswer = selectedAnswers[currentQuestion.id];
  const hasAnsweredCurrent = Boolean(currentAnswer);
  const isCurrentCorrect = currentAnswer === currentQuestion.correctAnswer;

  // Calculate scores
  const answeredCount = Object.keys(selectedAnswers).length;
  const correctCount = Object.entries(selectedAnswers).filter(([qId, ans]) => {
    const q = QUIZ_SOAL_20.find(item => item.id === Number(qId));
    return q && q.correctAnswer === ans;
  }).length;
  const wrongCount = answeredCount - correctCount;
  const scorePercentage = Math.round((correctCount / totalQuestions) * 100);

  // Kategori Hasil Belajar
  const getCategory = (score: number) => {
    if (score >= 85) return { grade: 'A', label: 'Sangat Baik', color: 'emerald', desc: 'Pemahaman materi & regulasi SIMRS sangat komprehensif dan kompeten.' };
    if (score >= 70) return { grade: 'B', label: 'Baik', color: 'blue', desc: 'Kompeten menguasai alur kerja rekam medis dan praktikum terintegrasi.' };
    if (score >= 55) return { grade: 'C', label: 'Cukup', color: 'amber', desc: 'Memahami dasar, disarankan membaca kembali kaidah pengodean dan SOP.' };
    return { grade: 'D/E', label: 'Perlu Remedial', color: 'rose', desc: 'Perlu pendalaman materi dasar teori dan mengulang quiz kembali.' };
  };

  const categoryResult = getCategory(scorePercentage);

  const handleSelectOption = (key: 'A' | 'B' | 'C' | 'D') => {
    if (selectedAnswers[currentQuestion.id]) return; // Answer locked once chosen

    const updated = {
      ...selectedAnswers,
      [currentQuestion.id]: key
    };
    setSelectedAnswers(updated);

    // Audio/visual instant feedback notice
    const isCorrect = key === currentQuestion.correctAnswer;
    if (isCorrect) {
      // SweetAlert subtle toast
      const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 1600,
        timerProgressBar: true
      });
      Toast.fire({
        icon: 'success',
        title: 'Jawaban Benar!'
      });
    } else {
      const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true
      });
      Toast.fire({
        icon: 'error',
        title: `Jawaban Salah! (Kunci: ${currentQuestion.correctAnswer})`
      });
    }

    // Auto prompt completion if 20th answered
    if (Object.keys(updated).length === totalQuestions) {
      setTimeout(() => {
        Swal.fire({
          icon: 'info',
          title: 'Seluruh 20 Soal Selesai!',
          text: 'Anda telah menyelesaikan seluruh butir soal quiz. Ingin melihat rekap nilai dan review pembahasan sekarang?',
          showCancelButton: true,
          confirmButtonText: 'Lihat Hasil Akhir',
          cancelButtonText: 'Tetap di Sini',
          confirmButtonColor: '#2563eb'
        }).then(res => {
          if (res.isConfirmed) {
            setIsCompleted(true);
          }
        });
      }, 800);
    }
  };

  const handleResetQuiz = () => {
    Swal.fire({
      title: 'Ulangi Quiz dari Awal?',
      text: 'Seluruh jawaban Anda akan direset agar Anda dapat menguji kembali pemahaman praktikum.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Ya, Ulangi Quiz',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#2563eb',
      cancelButtonColor: '#64748b'
    }).then(res => {
      if (res.isConfirmed) {
        setSelectedAnswers({});
        setCurrentIndex(0);
        setIsCompleted(false);
        Swal.fire({
          icon: 'success',
          title: 'Quiz Direset!',
          text: 'Silakan mulai mengerjakan soal dari nomor 1.',
          timer: 1400,
          showConfirmButton: false
        });
      }
    });
  };

  const handlePrintResult = () => {
    window.print();
  };

  // Filtered review questions
  const filteredReviewQuestions = QUIZ_SOAL_20.filter(q => {
    const ans = selectedAnswers[q.id];
    if (filterReview === 'CORRECT') return ans === q.correctAnswer;
    if (filterReview === 'WRONG') return ans && ans !== q.correctAnswer;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Quiz Top Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToMateri}
            className="p-2 hover:bg-slate-100 rounded-xl text-slate-600 transition-colors cursor-pointer"
            title="Kembali ke Modul Materi Pembelajaran"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] px-2 py-0.5 bg-blue-100 text-blue-800 rounded-md font-bold uppercase tracking-wider">
                Evaluasi Mandiri
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {answeredCount} / {totalQuestions} Terjawab
              </span>
            </div>
            <h2 className="text-base font-bold text-slate-900 mt-0.5">
              Quiz Evaluasi Praktikum SIMRS & RME (20 Soal)
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          {!isCompleted && answeredCount === totalQuestions && (
            <button
              onClick={() => setIsCompleted(true)}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Award className="w-4 h-4" />
              <span>Lihat Hasil Akhir</span>
            </button>
          )}

          <button
            onClick={handleResetQuiz}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
            title="Reset Seluruh Jawaban Quiz"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Ulangi Quiz</span>
          </button>
        </div>
      </div>

      {/* VIEW A: INTERACTIVE QUESTION SOLVING MODE */}
      {!isCompleted ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Question Main Panel (3 Cols) */}
          <div className="lg:col-span-3 space-y-5">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
              {/* Question Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 bg-blue-600 text-white text-xs font-bold rounded-xl">
                    Soal {currentIndex + 1} dari {totalQuestions}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-lg">
                    {currentQuestion.category}
                  </span>
                </div>

                {hasAnsweredCurrent && (
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                    isCurrentCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {isCurrentCorrect ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Jawaban Benar
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3.5 h-3.5 text-rose-600" /> Jawaban Salah
                      </>
                    )}
                  </span>
                )}
              </div>

              {/* Case Context if applicable */}
              {currentQuestion.caseContext && (
                <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl text-xs text-blue-900 leading-relaxed font-medium">
                  <strong>Studi Kasus: </strong>{currentQuestion.caseContext}
                </div>
              )}

              {/* Question Text */}
              <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-relaxed">
                {currentQuestion.question}
              </h3>

              {/* 4 Answer Options (A, B, C, D) */}
              <div className="space-y-3 pt-1">
                {currentQuestion.options.map(opt => {
                  const isSelected = currentAnswer === opt.key;
                  const isThisCorrect = opt.key === currentQuestion.correctAnswer;

                  let styleClass = 'border-slate-200 hover:border-blue-300 hover:bg-slate-50 text-slate-800 bg-white';
                  let badgeClass = 'bg-slate-100 text-slate-700 border-slate-200';

                  if (hasAnsweredCurrent) {
                    if (isThisCorrect) {
                      styleClass = 'border-emerald-500 bg-emerald-50/80 text-emerald-950 shadow-2xs font-semibold ring-1 ring-emerald-400';
                      badgeClass = 'bg-emerald-600 text-white border-emerald-600 font-bold';
                    } else if (isSelected && !isThisCorrect) {
                      styleClass = 'border-rose-400 bg-rose-50/80 text-rose-950 font-semibold ring-1 ring-rose-400';
                      badgeClass = 'bg-rose-600 text-white border-rose-600 font-bold';
                    } else {
                      styleClass = 'border-slate-200 opacity-60 text-slate-500 bg-slate-50/50';
                      badgeClass = 'bg-slate-100 text-slate-400';
                    }
                  }

                  return (
                    <button
                      key={opt.key}
                      onClick={() => handleSelectOption(opt.key)}
                      disabled={hasAnsweredCurrent}
                      className={`w-full p-4 rounded-xl border text-left text-xs transition-all flex items-start gap-3 cursor-pointer disabled:cursor-default ${styleClass}`}
                    >
                      <span className={`w-6 h-6 rounded-lg border flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 ${badgeClass}`}>
                        {opt.key}
                      </span>
                      <span className="flex-1 leading-relaxed">
                        {opt.text}
                      </span>
                      {hasAnsweredCurrent && isThisCorrect && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 self-center" />
                      )}
                      {hasAnsweredCurrent && isSelected && !isThisCorrect && (
                        <XCircle className="w-4 h-4 text-rose-600 shrink-0 self-center" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* AUTOMATIC INSTANT FEEDBACK & EXPLANATION BANNER */}
              {hasAnsweredCurrent && (
                <div className={`p-4 rounded-2xl border transition-all space-y-2 mt-4 ${
                  isCurrentCorrect
                    ? 'bg-emerald-50/90 border-emerald-200 text-emerald-950'
                    : 'bg-rose-50/90 border-rose-200 text-rose-950'
                }`}>
                  <div className="flex items-center gap-2">
                    {isCurrentCorrect ? (
                      <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                        <span>Jawaban Benar! Anda memilih opsi ({currentAnswer}).</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-xs font-bold text-rose-900">
                        <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                        <span>Jawaban Salah! Anda memilih ({currentAnswer}), jawaban yang benar adalah ({currentQuestion.correctAnswer}).</span>
                      </div>
                    )}
                  </div>

                  <div className="pl-7 space-y-1.5 text-xs">
                    <p className="leading-relaxed">
                      <strong>Penjelasan: </strong>
                      {currentQuestion.explanation}
                    </p>
                    <div className="pt-1 text-[11px] text-slate-600 flex items-center gap-1 font-medium">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span><strong>Konsep Kunci: </strong>{currentQuestion.conceptNote}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Controls */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                  disabled={currentIndex === 0}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Sebelumnya</span>
                </button>

                {currentIndex < totalQuestions - 1 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentIndex(prev => Math.min(totalQuestions - 1, prev + 1))}
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Soal Berikutnya</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsCompleted(true)}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Award className="w-4 h-4" />
                    <span>Selesai & Lihat Nilai</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Quick Navigator Sidebar (1 Col) */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Nomor Soal
                </h4>
                <span className="text-[11px] font-bold text-blue-600">
                  {answeredCount}/{totalQuestions}
                </span>
              </div>

              {/* Number Matrix Grid */}
              <div className="grid grid-cols-5 gap-2">
                {QUIZ_SOAL_20.map((q, idx) => {
                  const ans = selectedAnswers[q.id];
                  const isCurrent = idx === currentIndex;
                  const isAnsCorrect = ans === q.correctAnswer;

                  let colorClass = 'bg-slate-50 text-slate-600 border-slate-200 hover:border-blue-400';
                  if (ans) {
                    colorClass = isAnsCorrect
                      ? 'bg-emerald-500 text-white border-emerald-600 font-bold'
                      : 'bg-rose-500 text-white border-rose-600 font-bold';
                  }

                  if (isCurrent) {
                    colorClass += ' ring-2 ring-blue-500 ring-offset-1';
                  }

                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentIndex(idx)}
                      className={`h-9 rounded-xl border text-xs font-semibold flex items-center justify-center transition-all cursor-pointer ${colorClass}`}
                      title={`Soal ${idx + 1}: ${ans ? (isAnsCorrect ? 'Benar' : 'Salah') : 'Belum Dijawab'}`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="pt-2 border-t border-slate-100 space-y-1.5 text-[10px] text-slate-500">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-emerald-500 shrink-0" />
                  <span>Jawaban Benar</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-rose-500 shrink-0" />
                  <span>Jawaban Salah</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-slate-100 border border-slate-300 shrink-0" />
                  <span>Belum Terjawab</span>
                </div>
              </div>

              {/* Progress Summary Card */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                <div className="flex items-center justify-between text-slate-600">
                  <span>Benar:</span>
                  <strong className="text-emerald-700">{correctCount}</strong>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>Salah:</span>
                  <strong className="text-rose-700">{wrongCount}</strong>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-slate-200 font-bold text-slate-900">
                  <span>Skor Sementara:</span>
                  <span className="text-blue-700">{scorePercentage}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* VIEW B: COMPREHENSIVE RESULT, SCORE & REVIEW ALL 20 QUESTIONS */
        <div className="space-y-6">
          {/* Result Score Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-slate-200">
              <div className="space-y-2 text-center md:text-left">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold">
                  <Award className="w-4 h-4 text-blue-600" />
                  <span>Hasil Evaluasi Pembelajaran Praktikum</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
                  Ringkasan Nilai & Capaian Pemahaman
                </h3>
                <p className="text-xs text-slate-500">
                  Mahasiswa: <strong className="text-slate-800">{studentName}</strong> ({studentId}) &bull; 
                  Tanggal Ujian: <span className="font-mono">{new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                </p>
              </div>

              {/* Big Score Badge */}
              <div className="flex items-center gap-5 bg-gradient-to-br from-slate-50 to-blue-50/50 p-4 sm:p-5 rounded-3xl border border-blue-100 shadow-2xs">
                <div className="text-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Nilai Akhir
                  </span>
                  <span className="text-4xl sm:text-5xl font-extrabold text-blue-700 tracking-tight">
                    {scorePercentage}
                    <span className="text-lg font-semibold text-slate-400">/100</span>
                  </span>
                  <span className="text-[11px] font-bold text-slate-500 block mt-0.5">
                    ({scorePercentage}%)
                  </span>
                </div>

                <div className="h-16 w-px bg-slate-200" />

                <div className="text-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Predikat
                  </span>
                  <span className={`text-2xl font-black block mt-1 ${
                    categoryResult.grade === 'A' ? 'text-emerald-700' :
                    categoryResult.grade === 'B' ? 'text-blue-700' :
                    categoryResult.grade === 'C' ? 'text-amber-700' : 'text-rose-700'
                  }`}>
                    Grade {categoryResult.grade}
                  </span>
                  <span className="text-[11px] font-bold text-slate-700 block">
                    {categoryResult.label}
                  </span>
                </div>
              </div>
            </div>

            {/* Metrics Breakdown */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-[10px] text-slate-500 block uppercase font-bold">Total Soal</span>
                <span className="text-lg font-bold text-slate-900">{totalQuestions}</span>
              </div>
              <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200">
                <span className="text-[10px] text-emerald-800 block uppercase font-bold">Jawaban Benar</span>
                <span className="text-lg font-bold text-emerald-700">{correctCount} Soal</span>
              </div>
              <div className="p-3.5 bg-rose-50 rounded-2xl border border-rose-200">
                <span className="text-[10px] text-rose-800 block uppercase font-bold">Jawaban Salah</span>
                <span className="text-lg font-bold text-rose-700">{wrongCount} Soal</span>
              </div>
              <div className="p-3.5 bg-blue-50 rounded-2xl border border-blue-200">
                <span className="text-[10px] text-blue-800 block uppercase font-bold">Tingkat Ketuntasan</span>
                <span className="text-lg font-bold text-blue-700">{scorePercentage >= 70 ? 'LULUS KOMPETEN' : 'REMEDIAL'}</span>
              </div>
            </div>

            {/* Feedback Deskriptif */}
            <div className={`p-4 rounded-2xl border text-xs leading-relaxed ${
              categoryResult.grade === 'A' ? 'bg-emerald-50 border-emerald-200 text-emerald-950' :
              categoryResult.grade === 'B' ? 'bg-blue-50 border-blue-200 text-blue-950' :
              categoryResult.grade === 'C' ? 'bg-amber-50 border-amber-200 text-amber-950' :
              'bg-rose-50 border-rose-200 text-rose-950'
            }`}>
              <strong className="font-bold block mb-1">Evaluasi Hasil Belajar:</strong>
              {categoryResult.desc}
            </div>

            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsCompleted(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  Kembali ke Lembar Soal
                </button>
                <button
                  onClick={onBackToMateri}
                  className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  Buka Materi Pembelajaran
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrintResult}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Printer className="w-4 h-4 text-blue-400" />
                  <span>Cetak Lembar Nilai</span>
                </button>
                <button
                  onClick={handleResetQuiz}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Ulangi Quiz (Retake)</span>
                </button>
              </div>
            </div>
          </div>

          {/* REVIEW SECTION: REVIEW ALL 20 QUESTIONS WITH EXPLANATION */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
              <div>
                <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                  <span>Pembahasan Rinci 20 Soal Evaluasi</span>
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Tinjau jawaban Anda, kunci jawaban yang benar, dan telaah letak kesalahan konsep pada setiap butir soal.
                </p>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
                <button
                  onClick={() => setFilterReview('ALL')}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                    filterReview === 'ALL' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Semua ({totalQuestions})
                </button>
                <button
                  onClick={() => setFilterReview('CORRECT')}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                    filterReview === 'CORRECT' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Benar ({correctCount})
                </button>
                <button
                  onClick={() => setFilterReview('WRONG')}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                    filterReview === 'WRONG' ? 'bg-rose-600 text-white shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Salah ({wrongCount})
                </button>
              </div>
            </div>

            {/* Question Items List */}
            <div className="space-y-4">
              {filteredReviewQuestions.map(q => {
                const studentAns = selectedAnswers[q.id];
                const isCorrect = studentAns === q.correctAnswer;
                const correctOption = q.options.find(o => o.key === q.correctAnswer);
                const studentOption = q.options.find(o => o.key === studentAns);

                return (
                  <div
                    key={q.id}
                    className={`p-5 rounded-2xl border transition-all space-y-3 ${
                      isCorrect
                        ? 'border-emerald-200/90 bg-white hover:border-emerald-300'
                        : 'border-rose-200/90 bg-white hover:border-rose-300'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-slate-900 text-white text-xs font-bold flex items-center justify-center shrink-0">
                          {q.id}
                        </span>
                        <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                          {q.category}
                        </span>
                      </div>

                      <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                        isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {isCorrect ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Jawaban Anda Benar
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3.5 h-3.5 text-rose-600" /> Jawaban Anda Salah
                          </>
                        )}
                      </span>
                    </div>

                    {q.caseContext && (
                      <p className="text-xs text-blue-900 bg-blue-50/70 p-2.5 rounded-lg border border-blue-200 font-medium">
                        <strong>Kasus: </strong>{q.caseContext}
                      </p>
                    )}

                    <h5 className="text-xs sm:text-sm font-bold text-slate-900 leading-relaxed">
                      {q.question}
                    </h5>

                    {/* Options Breakdown */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      {q.options.map(opt => {
                        const isStudentChoice = studentAns === opt.key;
                        const isKunci = opt.key === q.correctAnswer;

                        let optClass = 'bg-slate-50 text-slate-600 border-slate-200';
                        if (isKunci) {
                          optClass = 'bg-emerald-50 text-emerald-950 border-emerald-300 font-bold';
                        } else if (isStudentChoice && !isKunci) {
                          optClass = 'bg-rose-50 text-rose-950 border-rose-300 font-bold line-through opacity-85';
                        }

                        return (
                          <div
                            key={opt.key}
                            className={`p-2.5 rounded-xl border text-xs flex items-center gap-2 ${optClass}`}
                          >
                            <span className="font-mono font-bold w-5 shrink-0">
                              {opt.key}.
                            </span>
                            <span className="flex-1">{opt.text}</span>
                            {isKunci && <Check className="w-3.5 h-3.5 text-emerald-700 shrink-0" />}
                            {isStudentChoice && !isKunci && <XCircle className="w-3.5 h-3.5 text-rose-700 shrink-0" />}
                          </div>
                        );
                      })}
                    </div>

                    {/* Penjelasan & Analisis Kesalahan */}
                    <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-xs text-slate-700">
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        <span>Pembahasan Ilmiah:</span>
                      </div>
                      <p className="leading-relaxed pl-5 text-slate-700">
                        {q.explanation}
                      </p>
                      <div className="pl-5 text-[11px] text-blue-700 font-medium">
                        <strong>Kunci Teori: </strong>{q.conceptNote}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
