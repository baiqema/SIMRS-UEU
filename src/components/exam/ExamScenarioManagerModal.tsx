import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ExamScenario } from '../../types';
import { extractTextFromUploadedFile, parseScenarioText } from '../../utils/pdfExtractor';
import { EXTENDED_ICD10, EXTENDED_ICD9CM } from '../../data/icdDatabase';
import { NURSING_SDKI_LIST, NURSING_SLKI_LIST, NURSING_SIKI_LIST } from '../../data/examScenariosData';
import {
  UploadCloud, FileText, Sparkles, AlertCircle, Save, X,
  Plus, Trash2, Check, Clock, Stethoscope, FileCode
} from 'lucide-react';
import Swal from 'sweetalert2';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  scenarioToEdit?: ExamScenario | null;
}

export const ExamScenarioManagerModal: React.FC<Props> = ({
  isOpen,
  onClose,
  scenarioToEdit
}) => {
  const { saveExamScenario, user } = useApp();

  const isEdit = !!scenarioToEdit;

  // Form states
  const [title, setTitle] = useState(scenarioToEdit?.title || '');
  const [category, setCategory] = useState<'RMIK' | 'Keperawatan'>(scenarioToEdit?.category || 'RMIK');
  const [description, setDescription] = useState(scenarioToEdit?.description || '');
  const [durationMinutes, setDurationMinutes] = useState(scenarioToEdit?.durationMinutes || 45);
  const [status, setStatus] = useState<'Aktif' | 'Draft' | 'Arsip'>(scenarioToEdit?.status || 'Aktif');
  const [pdfFileName, setPdfFileName] = useState(scenarioToEdit?.pdfFileName || 'SKENARIO_KASUS.pdf');
  const [pdfContentText, setPdfContentText] = useState(scenarioToEdit?.pdfContentText || '');
  const [isExtracting, setIsExtracting] = useState(false);

  // Extracted Patient Demographics
  const [patientName, setPatientName] = useState(scenarioToEdit?.extractedPatient.name || '');
  const [patientNoRM, setPatientNoRM] = useState(scenarioToEdit?.extractedPatient.noRM || '');
  const [patientNIK, setPatientNIK] = useState(scenarioToEdit?.extractedPatient.nik || '');
  const [patientBirthDate, setPatientBirthDate] = useState(scenarioToEdit?.extractedPatient.birthDate || '');
  const [patientGender, setPatientGender] = useState<'L' | 'P'>(scenarioToEdit?.extractedPatient.gender || 'L');
  const [patientAge, setPatientAge] = useState(scenarioToEdit?.extractedPatient.age || 35);
  const [patientAddress, setPatientAddress] = useState(scenarioToEdit?.extractedPatient.address || '');
  const [patientInsurance, setPatientInsurance] = useState(scenarioToEdit?.extractedPatient.insurance || 'BPJS Kesehatan');

  // Extracted Clinical SOAP
  const [regId, setRegId] = useState(scenarioToEdit?.extractedEncounter.regId || '');
  const [poli, setPoli] = useState(scenarioToEdit?.extractedEncounter.poli || 'Instalasi Gawat Darurat (IGD)');
  const [dpjpName, setDpjpName] = useState(scenarioToEdit?.extractedEncounter.dpjpName || 'dr. Sari Dewi, Sp.PD');
  const [subjective, setSubjective] = useState(scenarioToEdit?.extractedEncounter.subjective || '');
  const [objective, setObjective] = useState(scenarioToEdit?.extractedEncounter.objective || '');
  const [vitalTd, setVitalTd] = useState(scenarioToEdit?.extractedEncounter.vitalSigns.td || '120/80');
  const [vitalNadi, setVitalNadi] = useState(scenarioToEdit?.extractedEncounter.vitalSigns.nadi || '80');
  const [vitalSuhu, setVitalSuhu] = useState(scenarioToEdit?.extractedEncounter.vitalSigns.suhu || '36.8');
  const [vitalRr, setVitalRr] = useState(scenarioToEdit?.extractedEncounter.vitalSigns.rr || '20');
  const [vitalSpo2, setVitalSpo2] = useState(scenarioToEdit?.extractedEncounter.vitalSigns.spo2 || '98');
  const [assessment, setAssessment] = useState(scenarioToEdit?.extractedEncounter.assessment || '');
  const [plan, setPlan] = useState(scenarioToEdit?.extractedEncounter.plan || '');
  const [labData, setLabData] = useState(scenarioToEdit?.extractedEncounter.penunjang?.lab || '');
  const [radiologiData, setRadiologiData] = useState(scenarioToEdit?.extractedEncounter.penunjang?.radiologi || '');
  const [tindakanData, setTindakanData] = useState(scenarioToEdit?.extractedEncounter.penunjang?.tindakan || '');

  // Answer Key - RMIK
  const [icd10Primary, setIcd10Primary] = useState(scenarioToEdit?.answerKey.icd10Primary || '');
  const [icd10Secondary, setIcd10Secondary] = useState<string[]>(scenarioToEdit?.answerKey.icd10Secondary || []);
  const [icd9Procedures, setIcd9Procedures] = useState<string[]>(scenarioToEdit?.answerKey.icd9Procedures || []);

  // Answer Key - Keperawatan
  const [diagnosaSDKI, setDiagnosaSDKI] = useState<string[]>(scenarioToEdit?.answerKey.diagnosaSDKI || []);
  const [luaranSLKI, setLuaranSLKI] = useState(scenarioToEdit?.answerKey.luaranSLKI || '');
  const [intervensiSIKI, setIntervensiSIKI] = useState<string[]>(scenarioToEdit?.answerKey.intervensiSIKI || []);
  const [rubrikPenilaian, setRubrikPenilaian] = useState(scenarioToEdit?.answerKey.rubrikPenilaian || '');

  // Quick helper inputs for adding codes
  const [newSecCode, setNewSecCode] = useState('');
  const [newProcCode, setNewProcCode] = useState('');
  const [newSdkiCode, setNewSdkiCode] = useState('');
  const [newSikiCode, setNewSikiCode] = useState('');

  // Active step inside modal
  const [activeTab, setActiveTab] = useState<'upload' | 'patient' | 'answerKey'>('upload');

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsExtracting(true);
    setPdfFileName(file.name);

    try {
      const extractedText = await extractTextFromUploadedFile(file);
      setPdfContentText(extractedText);

      // Parse text
      const parsed = parseScenarioText(extractedText);

      // Auto-fill fields if not already populated or if new
      if (!title) {
        setTitle(`Skenario Kasus: ${parsed.patient.name} (${parsed.encounter.poli})`);
      }
      setPatientName(parsed.patient.name);
      setPatientNoRM(parsed.patient.noRM);
      setPatientNIK(parsed.patient.nik);
      setPatientBirthDate(parsed.patient.birthDate);
      setPatientGender(parsed.patient.gender);
      setPatientAge(parsed.patient.age);
      setPatientAddress(parsed.patient.address);
      setPatientInsurance(parsed.patient.insurance);

      setRegId(parsed.encounter.regId);
      setPoli(parsed.encounter.poli);
      setDpjpName(parsed.encounter.dpjpName);
      setSubjective(parsed.encounter.subjective);
      setObjective(parsed.encounter.objective);
      setVitalTd(parsed.encounter.vitalSigns.td);
      setVitalNadi(parsed.encounter.vitalSigns.nadi);
      setVitalSuhu(parsed.encounter.vitalSigns.suhu);
      setVitalRr(parsed.encounter.vitalSigns.rr);
      setVitalSpo2(parsed.encounter.vitalSigns.spo2);
      setAssessment(parsed.encounter.assessment);
      setPlan(parsed.encounter.plan);

      if (parsed.encounter.penunjang?.lab) setLabData(parsed.encounter.penunjang.lab);
      if (parsed.encounter.penunjang?.radiologi) setRadiologiData(parsed.encounter.penunjang.radiologi);
      if (parsed.encounter.penunjang?.tindakan) setTindakanData(parsed.encounter.penunjang.tindakan);

      // Suggest answers
      if (!icd10Primary) setIcd10Primary(parsed.suggestedAnswerKey.icd10Primary);
      if (icd10Secondary.length === 0) setIcd10Secondary(parsed.suggestedAnswerKey.icd10Secondary);
      if (icd9Procedures.length === 0) setIcd9Procedures(parsed.suggestedAnswerKey.icd9Procedures);
      if (diagnosaSDKI.length === 0) setDiagnosaSDKI(parsed.suggestedAnswerKey.diagnosaSDKI);
      if (!luaranSLKI) setLuaranSLKI(parsed.suggestedAnswerKey.luaranSLKI);
      if (intervensiSIKI.length === 0) setIntervensiSIKI(parsed.suggestedAnswerKey.intervensiSIKI);

      Swal.fire({
        icon: 'success',
        title: 'Ekstraksi PDF Selesai',
        text: `Data rekam medis & pasien (${parsed.patient.name} - ${parsed.patient.noRM}) berhasil diekstraksi dan diselaraskan secara otomatis.`,
        timer: 2000,
        showConfirmButton: false
      });
      setActiveTab('patient');
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'Gagal Ekstraksi',
        text: 'Terjadi kesalahan saat memproses file berkas kasus.',
        confirmButtonColor: '#2563eb'
      });
    } finally {
      setIsExtracting(false);
    }
  };

  const handleSave = () => {
    if (!title.trim()) {
      Swal.fire({ icon: 'warning', title: 'Judul Wajib Diisi', text: 'Silakan isi judul skenario ujian.', confirmButtonColor: '#2563eb' });
      return;
    }
    if (!pdfContentText.trim()) {
      Swal.fire({ icon: 'warning', title: 'Teks Skenario Kosong', text: 'Unggah file PDF atau tuliskan teks skenario rekam medis.', confirmButtonColor: '#2563eb' });
      return;
    }

    const scenarioId = scenarioToEdit?.id || `SCEN-${category}-${Date.now().toString(36).toUpperCase()}`;

    const newScenario: ExamScenario = {
      id: scenarioId,
      title: title.trim(),
      category,
      description: description.trim() || `Skenario ${category} untuk ${patientName} (${patientNoRM})`,
      durationMinutes: Number(durationMinutes) || 45,
      status,
      pdfFileName,
      pdfContentText,
      extractedPatient: {
        name: patientName || 'Pasien Tanpa Nama',
        noRM: patientNoRM ? patientNoRM.replace(/\D/g, '').padStart(6, '0') : '000001',
        nik: patientNIK || '3174000000000000',
        birthDate: patientBirthDate || '1990-01-01',
        gender: patientGender,
        age: Number(patientAge) || 30,
        address: patientAddress || 'Jakarta',
        insurance: patientInsurance || 'BPJS Kesehatan'
      },
      extractedEncounter: {
        regId: regId || `REG-SIM-${Date.now().toString().slice(-4)}`,
        poli: poli || 'Instalasi Gawat Darurat (IGD)',
        dpjpName: dpjpName || 'dr. DPJP Simulasi',
        date: new Date().toISOString().split('T')[0],
        subjective: subjective || 'Keluhan pasien',
        objective: objective || 'Pemeriksaan fisik stabil',
        vitalSigns: {
          td: vitalTd || '120/80',
          nadi: vitalNadi || '80',
          suhu: vitalSuhu || '36.5',
          rr: vitalRr || '20',
          spo2: vitalSpo2 || '98'
        },
        assessment: assessment || 'Diagnosis DPJP',
        plan: plan || 'Rencana terapi',
        penunjang: {
          lab: labData || undefined,
          radiologi: radiologiData || undefined,
          tindakan: tindakanData || undefined
        }
      },
      answerKey: {
        icd10Primary: icd10Primary.trim().toUpperCase(),
        icd10Secondary,
        icd9Procedures,
        diagnosaSDKI,
        luaranSLKI,
        intervensiSIKI,
        rubrikPenilaian: rubrikPenilaian.trim()
      },
      createdAt: scenarioToEdit?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: scenarioToEdit?.createdBy || `${user?.name || 'Dosen'} (Dosen)`
    };

    saveExamScenario(newScenario);

    Swal.fire({
      icon: 'success',
      title: isEdit ? 'Skenario Diperbarui' : 'Skenario Berhasil Dibuat',
      text: `Skenario "${newScenario.title}" dan data pasien simulasi telah tersimpan aktif di SIMRS.`,
      confirmButtonColor: '#2563eb'
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-linear-to-r from-blue-700 via-indigo-700 to-blue-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center font-bold text-lg border border-white/20">
              <FileCode className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold flex items-center gap-2">
                {isEdit ? 'Edit Skenario Ujian & Kunci Jawaban' : 'Buat Skenario Ujian Baru (PDF Extractor)'}
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/20 text-white font-medium border border-white/20">
                  Role: Dosen (Full Control)
                </span>
              </h2>
              <p className="text-xs text-blue-100">
                Unggah berkas PDF, ekstraksi data rekam medis secara otomatis, dan tentukan kunci jawaban ujian.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-3 gap-3">
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'upload'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <UploadCloud className="w-4 h-4" /> 1. Berkas PDF & Pengaturan Soal
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('patient')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'patient'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Stethoscope className="w-4 h-4" /> 2. Hasil Ekstraksi Pasien & SOAP
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('answerKey')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'answerKey'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Check className="w-4 h-4" /> 3. Kunci Jawaban & Rubrik Penilaian
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-700">
          {/* TAB 1: UPLOAD & CONFIG */}
          {activeTab === 'upload' && (
            <div className="space-y-5">
              {/* Drag & Drop PDF Extractor Area */}
              <div className="p-5 border-2 border-dashed border-blue-200 hover:border-blue-400 bg-blue-50/50 rounded-2xl transition-all text-center">
                <div className="mx-auto w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center mb-3 shadow-sm">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-800 mb-1">
                  Unggah Berkas Skenario Kasus (PDF / Dokumen Teks)
                </h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto mb-4">
                  Sistem PDF Extractor SIMRS akan membaca secara otomatis identitas pasien, keluhan, tanda vital, asesmen, dan rencana dokter dari berkas.
                </p>
                <div className="flex items-center justify-center gap-3">
                  <label className="cursor-pointer px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs hover:shadow-md transition-all flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Pilih File PDF Kasus
                    <input
                      type="file"
                      accept=".pdf,.txt,.md"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                  {pdfFileName && (
                    <span className="text-xs font-semibold text-blue-900 bg-blue-100 px-3 py-1.5 rounded-lg">
                      {pdfFileName}
                    </span>
                  )}
                </div>
                {isExtracting && (
                  <div className="mt-3 flex items-center justify-center gap-2 text-xs text-blue-700 font-bold animate-pulse">
                    <Sparkles className="w-4 h-4 text-blue-600 animate-spin" />
                    Mengekstraksi data rekam medis... Mohon tunggu
                  </div>
                )}
              </div>

              {/* Basic Exam Meta */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-bold text-slate-700">Judul Skenario Kasus Ujian *</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Contoh: Ujian Praktik Kodifikasi: Kasus DBD dengan Syok Hipovolemik"
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Kategori Program Studi *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="RMIK">RMIK (Rekam Medis - ICD-10 & ICD-9-CM)</option>
                    <option value="Keperawatan">Keperawatan (Askep - SDKI, SLKI, SIKI)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Durasi Ujian (Menit) *</label>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <input
                      type="number"
                      min={10}
                      max={180}
                      value={durationMinutes}
                      onChange={(e) => setDurationMinutes(Number(e.target.value))}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Status Skenario</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="Aktif">Aktif (Tersedia untuk Mahasiswa)</option>
                    <option value="Draft">Draft (Hanya Dosen)</option>
                    <option value="Arsip">Arsip</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Deskripsi Kasus Singkat</label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Ringkasan singkat latar belakang skenario klinis"
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Raw Extracted Text View / Edit */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700">
                    Isi Teks Skenario Rekam Medis (Tampil di Penampil PDF Mahasiswa) *
                  </label>
                  <span className="text-[10px] text-slate-400">Dapat disunting jika ada typo</span>
                </div>
                <textarea
                  rows={8}
                  value={pdfContentText}
                  onChange={(e) => setPdfContentText(e.target.value)}
                  placeholder="Isi teks lengkap rekam medis dari file PDF..."
                  className="w-full font-mono text-[11px] p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 text-slate-800 leading-relaxed"
                />
              </div>
            </div>
          )}

          {/* TAB 2: EXTRACTED PATIENT & CLINICAL */}
          {activeTab === 'patient' && (
            <div className="space-y-6">
              <div className="p-3.5 bg-blue-50/80 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
                <span>
                  Data di bawah ini dihasilkan dari ekstraksi otomatis. Dosen dapat menyunting atau memverifikasi sebelum disinkronkan ke SIMRS.
                </span>
              </div>

              {/* Patient Identity */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                  Identitas Pasien Rekam Medis
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600">Nama Pasien</label>
                    <input
                      type="text"
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      className="w-full text-xs p-2 rounded-lg border border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600">Nomor RM</label>
                    <input
                      type="text"
                      value={patientNoRM}
                      onChange={(e) => setPatientNoRM(e.target.value)}
                      className="w-full text-xs p-2 rounded-lg border border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600">NIK (16 Digit)</label>
                    <input
                      type="text"
                      value={patientNIK}
                      onChange={(e) => setPatientNIK(e.target.value)}
                      className="w-full text-xs p-2 rounded-lg border border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600">Jenis Kelamin</label>
                    <select
                      value={patientGender}
                      onChange={(e) => setPatientGender(e.target.value as any)}
                      className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
                    >
                      <option value="L">Laki-laki (L)</option>
                      <option value="P">Perempuan (P)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600">Tanggal Lahir</label>
                    <input
                      type="date"
                      value={patientBirthDate}
                      onChange={(e) => setPatientBirthDate(e.target.value)}
                      className="w-full text-xs p-2 rounded-lg border border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600">Umur (Tahun)</label>
                    <input
                      type="number"
                      value={patientAge}
                      onChange={(e) => setPatientAge(Number(e.target.value))}
                      className="w-full text-xs p-2 rounded-lg border border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600">Penjamin Biaya</label>
                    <input
                      type="text"
                      value={patientInsurance}
                      onChange={(e) => setPatientInsurance(e.target.value)}
                      className="w-full text-xs p-2 rounded-lg border border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600">Unit / Poli</label>
                    <input
                      type="text"
                      value={poli}
                      onChange={(e) => setPoli(e.target.value)}
                      className="w-full text-xs p-2 rounded-lg border border-slate-300"
                    />
                  </div>
                </div>
              </div>

              {/* Clinical SOAP */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                  Catatan Medis & SOAP Terintegrasi
                </h4>
                <div>
                  <label className="text-[11px] font-semibold text-slate-600">[S] Subjektif / Anamnesis</label>
                  <textarea
                    rows={2}
                    value={subjective}
                    onChange={(e) => setSubjective(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-600">[O] Objektif & Pemeriksaan Fisik</label>
                  <textarea
                    rows={2}
                    value={objective}
                    onChange={(e) => setObjective(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg border border-slate-300"
                  />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div>
                    <label className="text-[10px] text-slate-500 font-bold">TD (mmHg)</label>
                    <input
                      type="text"
                      value={vitalTd}
                      onChange={(e) => setVitalTd(e.target.value)}
                      className="w-full text-xs p-1.5 rounded border border-slate-300 bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 font-bold">Nadi (x/m)</label>
                    <input
                      type="text"
                      value={vitalNadi}
                      onChange={(e) => setVitalNadi(e.target.value)}
                      className="w-full text-xs p-1.5 rounded border border-slate-300 bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 font-bold">Suhu (°C)</label>
                    <input
                      type="text"
                      value={vitalSuhu}
                      onChange={(e) => setVitalSuhu(e.target.value)}
                      className="w-full text-xs p-1.5 rounded border border-slate-300 bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 font-bold">RR (x/m)</label>
                    <input
                      type="text"
                      value={vitalRr}
                      onChange={(e) => setVitalRr(e.target.value)}
                      className="w-full text-xs p-1.5 rounded border border-slate-300 bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 font-bold">SpO2 (%)</label>
                    <input
                      type="text"
                      value={vitalSpo2}
                      onChange={(e) => setVitalSpo2(e.target.value)}
                      className="w-full text-xs p-1.5 rounded border border-slate-300 bg-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-600">[A] Asesmen / Diagnosis DPJP</label>
                  <input
                    type="text"
                    value={assessment}
                    onChange={(e) => setAssessment(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-600">[P] Rencana / Plan Terapi</label>
                  <textarea
                    rows={2}
                    value={plan}
                    onChange={(e) => setPlan(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg border border-slate-300"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ANSWER KEY & SCORING RUBRIC */}
          {activeTab === 'answerKey' && (
            <div className="space-y-6">
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  Kunci jawaban ini digunakan oleh <strong>Scoring Engine Otomatis</strong> saat mahasiswa mengumpulkan jawaban. Mahasiswa TIDAK BISA melihat panel ini selama ujian berlangsung.
                </span>
              </div>

              {category === 'RMIK' ? (
                <div className="space-y-5">
                  {/* Primary ICD-10 */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-800">
                      Kunci Jawaban: Diagnosis Utama (ICD-10 Primary) * [Bobot 40%]
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={icd10Primary}
                        onChange={(e) => setIcd10Primary(e.target.value.toUpperCase())}
                        placeholder="Contoh: I10 atau A91 atau K35.8"
                        className="text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 font-bold text-blue-700 uppercase w-48"
                      />
                      <select
                        onChange={(e) => {
                          if (e.target.value) setIcd10Primary(e.target.value);
                        }}
                        className="text-xs px-3 py-2 rounded-xl border border-slate-300 bg-white flex-1"
                      >
                        <option value="">-- Pilih dari Kamus ICD-10 Cepat --</option>
                        {EXTENDED_ICD10.slice(0, 30).map((c) => (
                          <option key={c.code} value={c.code}>
                            {c.code} - {c.desc}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Secondary ICD-10 */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-800">
                      Kunci Jawaban: Diagnosis Sekunder / Komorbiditas (ICD-10 Secondary) [Bobot 30%]
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newSecCode}
                        onChange={(e) => setNewSecCode(e.target.value.toUpperCase())}
                        placeholder="Ketik kode ICD-10 (contoh: E78.5)"
                        className="text-xs px-3 py-2 rounded-xl border border-slate-300 font-bold uppercase w-48"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (newSecCode.trim() && !icd10Secondary.includes(newSecCode.trim())) {
                            setIcd10Secondary([...icd10Secondary, newSecCode.trim()]);
                            setNewSecCode('');
                          }
                        }}
                        className="px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" /> Tambah Kode
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {icd10Secondary.map((code) => (
                        <span
                          key={code}
                          className="px-2.5 py-1 bg-blue-100 text-blue-800 rounded-lg text-xs font-bold flex items-center gap-1.5"
                        >
                          {code}
                          <button
                            type="button"
                            onClick={() => setIcd10Secondary(icd10Secondary.filter((c) => c !== code))}
                            className="hover:text-red-600"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                      {icd10Secondary.length === 0 && (
                        <span className="text-xs text-slate-400 italic">Belum ada diagnosis sekunder</span>
                      )}
                    </div>
                  </div>

                  {/* ICD-9-CM Procedures */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-800">
                      Kunci Jawaban: Prosedur / Tindakan Medis (ICD-9-CM) [Bobot 30%]
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newProcCode}
                        onChange={(e) => setNewProcCode(e.target.value)}
                        placeholder="Ketik kode ICD-9-CM (contoh: 89.13)"
                        className="text-xs px-3 py-2 rounded-xl border border-slate-300 font-bold uppercase w-48"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (newProcCode.trim() && !icd9Procedures.includes(newProcCode.trim())) {
                            setIcd9Procedures([...icd9Procedures, newProcCode.trim()]);
                            setNewProcCode('');
                          }
                        }}
                        className="px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" /> Tambah Prosedur
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {icd9Procedures.map((proc) => (
                        <span
                          key={proc}
                          className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-lg text-xs font-bold flex items-center gap-1.5"
                        >
                          {proc}
                          <button
                            type="button"
                            onClick={() => setIcd9Procedures(icd9Procedures.filter((p) => p !== proc))}
                            className="hover:text-red-600"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                      {icd9Procedures.length === 0 && (
                        <span className="text-xs text-slate-400 italic">Belum ada prosedur ICD-9-CM</span>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                /* KEPERAWATAN ANSWER KEY */
                <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-800">
                      Kunci Diagnosa Keperawatan Utama & Penyerta (SDKI) [Bobot 40%]
                    </label>
                    <div className="flex gap-2">
                      <select
                        value={newSdkiCode}
                        onChange={(e) => setNewSdkiCode(e.target.value)}
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
                          if (newSdkiCode && !diagnosaSDKI.includes(newSdkiCode)) {
                            setDiagnosaSDKI([...diagnosaSDKI, newSdkiCode]);
                            setNewSdkiCode('');
                          }
                        }}
                        className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" /> Tambah
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {diagnosaSDKI.map((item) => (
                        <span
                          key={item}
                          className="px-2.5 py-1 bg-blue-100 text-blue-800 rounded-lg text-xs font-bold flex items-center gap-1.5"
                        >
                          {item}
                          <button
                            type="button"
                            onClick={() => setDiagnosaSDKI(diagnosaSDKI.filter((d) => d !== item))}
                            className="hover:text-red-600"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-800">
                      Kunci Luaran Keperawatan (SLKI) [Bobot 20%]
                    </label>
                    <select
                      value={luaranSLKI}
                      onChange={(e) => setLuaranSLKI(e.target.value)}
                      className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 bg-white"
                    >
                      <option value="">-- Pilih Kriteria Luaran SLKI --</option>
                      {NURSING_SLKI_LIST.map((item) => (
                        <option key={item.code} value={`${item.code}: ${item.name}`}>
                          {item.code} - {item.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-800">
                      Kunci Intervensi Keperawatan (SIKI) [Bobot 40%]
                    </label>
                    <div className="flex gap-2">
                      <select
                        value={newSikiCode}
                        onChange={(e) => setNewSikiCode(e.target.value)}
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
                          if (newSikiCode && !intervensiSIKI.includes(newSikiCode)) {
                            setIntervensiSIKI([...intervensiSIKI, newSikiCode]);
                            setNewSikiCode('');
                          }
                        }}
                        className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" /> Tambah
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {intervensiSIKI.map((item) => (
                        <span
                          key={item}
                          className="px-2.5 py-1 bg-indigo-100 text-indigo-800 rounded-lg text-xs font-bold flex items-center gap-1.5"
                        >
                          {item}
                          <button
                            type="button"
                            onClick={() => setIntervensiSIKI(intervensiSIKI.filter((i) => i !== item))}
                            className="hover:text-red-600"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Scoring Rubric / Notes */}
              <div className="space-y-1.5 pt-2">
                <label className="text-xs font-bold text-slate-800">
                  Rubrik Penilaian & Catatan Khusus Penguji (Dosen)
                </label>
                <textarea
                  rows={3}
                  value={rubrikPenilaian}
                  onChange={(e) => setRubrikPenilaian(e.target.value)}
                  placeholder="Catatan penguji untuk evaluasi jawaban mahasiswa..."
                  className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-500 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-500" />
            <span>Menyimpan skenario akan mengintegrasikan pasien simulasi ke SIMRS</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs hover:shadow-md transition-all flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {isEdit ? 'Simpan Perubahan' : 'Terbitkan Skenario Ujian'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
