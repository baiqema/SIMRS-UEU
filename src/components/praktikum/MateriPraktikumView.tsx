import React, { useState } from 'react';
import { MATERI_PRAKTIKUM } from '../../data/praktikumMateriQuizData';
import {
  BookOpen, Target, FileText, Wrench, ListOrdered, CheckCircle2,
  Sparkles, ArrowRight, ShieldCheck, Scale, Lightbulb, PlayCircle,
  ExternalLink, Layers, Laptop, Award
} from 'lucide-react';

interface MateriPraktikumViewProps {
  onStartQuiz: () => void;
}

export const MateriPraktikumView: React.FC<MateriPraktikumViewProps> = ({ onStartQuiz }) => {
  const [activeSection, setActiveSection] = useState<'tujuan' | 'teori' | 'alat' | 'langkah'>('tujuan');

  const { tujuan, dasarTeori, alatDanBahan, langkahPraktikum } = MATERI_PRAKTIKUM;

  return (
    <div className="space-y-6">
      {/* Hero Card Modul Praktikum */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-8 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold text-blue-100 border border-white/20">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Modul Pembelajaran Praktikum Laboratorium RMIK & SIMRS</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white leading-tight">
            Panduan Lengkap Praktikum SIMRS & Rekam Medis Elektronik
          </h2>

          <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed">
            Materi pembelajaran komprehensif mulai dari tujuan kompetensi, dasar teori regulasi, alat & bahan, 
            hingga 6 tahapan alur operasional SIMRS terintegrasi. Uji pemahaman Anda melalui evaluasi quiz 20 soal di akhir materi.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={onStartQuiz}
              className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer transform hover:-translate-y-0.5"
            >
              <PlayCircle className="w-4 h-4 text-slate-950" />
              <span>Mulai Quiz Evaluasi (20 Soal Pilihan Ganda)</span>
            </button>

            <span className="text-xs text-blue-200">
              Estimasi belajar: 15–20 menit
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-1.5 p-1.5 bg-slate-100 rounded-2xl overflow-x-auto border border-slate-200/80">
        <button
          onClick={() => setActiveSection('tujuan')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeSection === 'tujuan'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <Target className="w-4 h-4" />
          <span>1. Tujuan Pembelajaran</span>
        </button>

        <button
          onClick={() => setActiveSection('teori')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeSection === 'teori'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>2. Dasar Teori & Regulasi</span>
        </button>

        <button
          onClick={() => setActiveSection('alat')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeSection === 'alat'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <Wrench className="w-4 h-4" />
          <span>3. Alat dan Bahan</span>
        </button>

        <button
          onClick={() => setActiveSection('langkah')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeSection === 'langkah'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <ListOrdered className="w-4 h-4" />
          <span>4. Langkah-Langkah Praktikum</span>
        </button>
      </div>

      {/* SECTION 1: TUJUAN PRAKTIKUM */}
      {activeSection === 'tujuan' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-xs">
          <div>
            <div className="flex items-center gap-2 text-blue-700 text-xs font-bold uppercase tracking-wider mb-1">
              <Target className="w-4 h-4" />
              <span>Kompetensi & Capaian Belajar</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              Tujuan Pembelajaran Praktikum
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Target kompetensi yang wajib dikuasai mahasiswa program studi Rekam Medis dan Informasi Kesehatan (RMIK) serta tenaga kesehatan.
            </p>
          </div>

          {/* Tujuan Umum */}
          <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-2xl space-y-1.5">
            <h4 className="text-xs font-bold uppercase text-blue-900 flex items-center gap-2">
              <Award className="w-4 h-4 text-blue-600" />
              Tujuan Instruksional Umum (TIU)
            </h4>
            <p className="text-xs text-blue-950 leading-relaxed">
              {tujuan.umum}
            </p>
          </div>

          {/* Tujuan Khusus */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase text-slate-700 tracking-wider">
              Tujuan Instruksional Khusus (TIK)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {tujuan.khusus.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 flex items-start gap-3 hover:border-blue-300 transition-colors"
                >
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <p className="text-xs text-slate-700 leading-relaxed font-medium">
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={() => setActiveSection('teori')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>Lanjut ke Dasar Teori</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* SECTION 2: DASAR TEORI */}
      {activeSection === 'teori' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-xs">
          <div>
            <div className="flex items-center gap-2 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-1">
              <BookOpen className="w-4 h-4" />
              <span>Landasan Ilmiah & Konseptual</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              Dasar Teori Penyelenggaraan SIMRS & RME
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Prinsip penting, regulasi perundang-undangan, dan kaidah standar akreditasi rumah sakit.
            </p>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-700 leading-relaxed font-medium">
            <span className="font-bold text-slate-900 block mb-1">Ringkasan Konsep:</span>
            {dasarTeori.ringkasan}
          </div>

          {/* 5 Poin Kunci */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase text-slate-700 tracking-wider">
              5 Pilar Utama Tata Kelola Rekam Medis Elektronik
            </h4>
            <div className="space-y-3">
              {dasarTeori.poinPenting.map((point, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-slate-200 bg-white hover:border-indigo-300 transition-colors shadow-2xs space-y-1"
                >
                  <div className="flex items-center gap-2 text-xs font-bold text-indigo-900">
                    <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0" />
                    <span>{point.judul}</span>
                  </div>
                  <p className="text-xs text-slate-600 pl-4 leading-relaxed">
                    {point.deskripsi}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Regulasi Terkait */}
          <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-2">
            <h4 className="text-xs font-bold text-amber-950 flex items-center gap-2 uppercase">
              <Scale className="w-4 h-4 text-amber-700" />
              Dasar Hukum & Peraturan Terkait:
            </h4>
            <ul className="text-xs text-amber-900 space-y-1.5 list-disc list-inside pl-1">
              {dasarTeori.regulasiTerkait.map((reg, idx) => (
                <li key={idx} className="leading-relaxed">
                  <span className="font-medium">{reg}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="pt-2 flex items-center justify-between">
            <button
              onClick={() => setActiveSection('tujuan')}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
            >
              Kembali
            </button>
            <button
              onClick={() => setActiveSection('alat')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>Lanjut ke Alat & Bahan</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* SECTION 3: ALAT DAN BAHAN */}
      {activeSection === 'alat' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-xs">
          <div>
            <div className="flex items-center gap-2 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-1">
              <Wrench className="w-4 h-4" />
              <span>Kebutuhan Fasilitas & Simulasi</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              Alat dan Bahan Praktikum
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Perangkat keras, sistem perangkat lunak, serta spesifikasi dokumen simulasi yang diperlukan.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Perangkat Keras */}
            <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase border-b border-slate-200 pb-2">
                <Laptop className="w-4 h-4 text-blue-600" />
                <span>Perangkat Keras (Hardware)</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-600">
                {alatDanBahan.perangkatKeras.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Perangkat Lunak */}
            <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase border-b border-slate-200 pb-2">
                <Layers className="w-4 h-4 text-indigo-600" />
                <span>Perangkat Lunak (Software)</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-600">
                {alatDanBahan.perangkatLunak.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Dokumen & Formulir */}
            <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase border-b border-slate-200 pb-2">
                <FileText className="w-4 h-4 text-amber-600" />
                <span>Dokumen & Formulir Simulasi</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-600">
                {alatDanBahan.dokumenDanFormulir.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between">
            <button
              onClick={() => setActiveSection('teori')}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
            >
              Kembali
            </button>
            <button
              onClick={() => setActiveSection('langkah')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>Lanjut ke Langkah Praktikum</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* SECTION 4: LANGKAH-LANGKAH PRAKTIKUM */}
      {activeSection === 'langkah' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-xs">
          <div>
            <div className="flex items-center gap-2 text-blue-700 text-xs font-bold uppercase tracking-wider mb-1">
              <ListOrdered className="w-4 h-4" />
              <span>Prosedur Operasional Standar (SOP)</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              Langkah-Langkah Praktikum Terintegrasi
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Ikuti 6 tahapan alur operasional di bawah ini secara runut untuk menjalankan simulasi rekam medis secara menyeluruh.
            </p>
          </div>

          <div className="space-y-4">
            {langkahPraktikum.map((stage, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl border border-slate-200/90 bg-white hover:border-blue-300 transition-all shadow-2xs space-y-3"
              >
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-xl bg-blue-600 text-white text-xs font-bold flex items-center justify-center shrink-0 shadow-2xs">
                    {idx + 1}
                  </span>
                  <h4 className="text-sm font-bold text-slate-900">
                    {stage.tahap}
                  </h4>
                </div>

                <div className="pl-10 space-y-2">
                  <ul className="space-y-1.5 text-xs text-slate-700 list-disc list-inside">
                    {stage.langkah.map((step, sIdx) => (
                      <li key={sIdx} className="leading-relaxed">
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2 mt-2">
                    <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-bold text-amber-950">Tips Klinis & Regulasi: </strong>
                      <span className="text-[11.5px] leading-relaxed">{stage.tipsKlinis}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Banner Pengerjaan Quiz */}
          <div className="p-5 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-bold text-emerald-950 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Materi Praktikum Selesai Dipelajari!</span>
              </h4>
              <p className="text-xs text-emerald-800 mt-1">
                Silakan lanjut ke sesi Quiz Evaluasi Pemahaman sebanyak 20 soal untuk mengukur tingkat kompetensi Anda.
              </p>
            </div>

            <button
              onClick={onStartQuiz}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer shrink-0"
            >
              <span>Mulai Quiz (20 Soal)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
