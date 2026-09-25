import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { CPPT, CPPTMedicineInstruction } from '../types';
import Swal from 'sweetalert2';
import { Check, Plus, Trash2, ShieldCheck, Clock, User, Activity, PenTool, Sparkles, HeartPulse, Stethoscope, AlertTriangle, FileText, ClipboardList, UserCheck, Calendar } from 'lucide-react';
import { AsuhanKeperawatanIgdModal } from './AsuhanKeperawatanIgdModal';
import { EXTENDED_ICD10, EXTENDED_ICD9CM } from '../data/icdDatabase';

// ELECTRONIC SIGNATURE CANVAS COMPONENT
const ElectronicSignatureCanvas: React.FC<{
  onSaveSignature: (dataUrl: string) => void;
}> = ({ onSaveSignature }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    setIsDrawing(true);
    setHasDrawn(true);
    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    ctx.lineTo(x, y);
    ctx.strokeStyle = '#1e3a8a'; // Deep blue ink
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    if (canvasRef.current) {
      onSaveSignature(canvasRef.current.toDataURL());
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
    onSaveSignature('');
  };

  return (
    <div className="space-y-1.5 p-3 bg-blue-50/60 border border-blue-200 rounded-xl">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
          <PenTool className="w-4 h-4 text-blue-700" /> Tanda Tangan Elektronik (E-Signature) *
        </label>
        <button
          type="button"
          onClick={clearCanvas}
          className="text-[11px] text-rose-600 hover:text-rose-800 font-bold underline cursor-pointer"
        >
          Bersihkan Tanda Tangan
        </button>
      </div>
      <div className="border border-blue-300 rounded-xl bg-white overflow-hidden shadow-inner relative">
        <canvas
          ref={canvasRef}
          width={450}
          height={110}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="w-full h-24 bg-slate-50/50 cursor-crosshair touch-none"
        />
        {!hasDrawn && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-slate-400 text-xs italic font-mono">
            ✍️ Goreskan tanda tangan digital dokter / perawat di sini...
          </div>
        )}
      </div>
      <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
        <span>Format Digital: Base64 Canvas PNG</span>
        <span className={hasDrawn ? "text-emerald-700 font-bold" : "text-amber-700"}>
          {hasDrawn ? "✓ E-Signature Berhasil Terekam" : "⚠️ Belum Ada Tanda Tangan"}
        </span>
      </div>
    </div>
  );
};

interface CPPTInputTableProps {
  mrId?: string;
  patientId?: string;
  onSavedSuccess?: () => void;
}

export const CPPTInputTable: React.FC<CPPTInputTableProps> = ({
  mrId,
  patientId,
  onSavedSuccess
}) => {
  const { cppt, medicalRecords, addCPPT, getMR, getReg, getPatient, users, user, canEditPage } = useApp();
  const isEditable = canEditPage('cppt');

  // Full Screen / Expanded View state
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<string>('Pemeriksaan');
  const [pemeriksaanSubMenu, setPemeriksaanSubMenu] = useState<'Assesment' | 'Pengkajian Keperawatan' | 'Triace' | 'IGD' | 'Rawat Jalan' | 'Rawat Inap'>('Assesment');
  const [isPengkajianModalOpen, setIsPengkajianModalOpen] = useState(false);

  // Filters from screenshot
  const [filterProf, setFilterProf] = useState('Semua');
  const [showDeleted, setShowDeleted] = useState(false);

  // Form State matching screenshot
  const [inputDate, setInputDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [inputTime, setInputTime] = useState(() => new Date().toTimeString().substring(0, 8)); // hh:mm:ss
  const [selectedProf, setSelectedProf] = useState('Dokter Spesialis');
  const [staffNameInput, setStaffNameInput] = useState(() => user?.name || 'dr. Sari Dewi, Sp.PD');
  const [unitInput, setUnitInput] = useState('Poliklinik Penyakit Dalam / Bangsal');
  const [formatType, setFormatType] = useState<'SOAP' | 'SBAR' | 'ADIME'>('SOAP');

  // Vitals
  const [tdSys, setTdSys] = useState('120');
  const [tdDia, setTdDia] = useState('80');
  const [heartRate, setHeartRate] = useState('80');
  const [respRate, setRespRate] = useState('20');
  const [temp, setTemp] = useState('36.5');
  const [spO2, setSpO2] = useState('98');

  // SOAP & Instructions
  const [subjective, setSubjective] = useState('');
  const [objective, setObjective] = useState('');
  const [assessment, setAssessment] = useState('');
  const [plan, setPlan] = useState('');
  const [instructionPPA, setInstructionPPA] = useState('');

  // Drug Instructions (Manual typing or selection)
  const [drugName, setDrugName] = useState('');
  const [drugQty, setDrugQty] = useState('1');
  const [drugSigna, setDrugSigna] = useState('3 x sehari 1 kapsul');
  const [medicines, setMedicines] = useState<CPPTMedicineInstruction[]>([]);

  // Implementation & Critical Values
  const [implementation, setImplementation] = useState('');
  const [criticalValue, setCriticalValue] = useState('');

  // TRIASE SPECIFIC STATE
  const [skalaTriase, setSkalaTriase] = useState('3'); // 1 to 5
  const [disposisiTriase, setDisposisiTriase] = useState('Rawat Jalan');
  const [instruksiPulangTriase, setInstruksiPulangTriase] = useState('');
  const [signatureTriaseUrl, setSignatureTriaseUrl] = useState<string>('');

  // SPIRITUAL & PSYCHOSOCIAL ASSESSMENT STATE
  const [pointKesadaran, setPointKesadaran] = useState<number>(3);
  const [pointSikap, setPointSikap] = useState<number>(3);
  const [pointRawatDiri, setPointRawatDiri] = useState<number>(3);
  const [pointOrientasi, setPointOrientasi] = useState<number>(3);
  const [pointAfek, setPointAfek] = useState<number>(3);
  const [pointSpiritual, setPointSpiritual] = useState<number>(3);
  const [customAlasanSpiritual, setCustomAlasanSpiritual] = useState<string>('');

  // Total spiritual point calculation
  const totalPointSpiritual = pointKesadaran + pointSikap + pointRawatDiri + pointOrientasi + pointAfek + pointSpiritual;

  // Derive score scale 1-5 and explanation
  const getSpiritualScoreDetails = (total: number) => {
    if (total >= 16) {
      return {
        score: 5,
        label: 'Skala 5 (Sangat Baik / Mandiri)',
        defaultText: 'Pasien berada dalam kesadaran kompos mentis, orientasi penuh, kooperatif, serta menjalankan kegiatan ibadah secara mandiri tanpa masalah psikososial.'
      };
    }
    if (total >= 13) {
      return {
        score: 4,
        label: 'Skala 4 (Baik / Bimbingan Minimal)',
        defaultText: 'Kondisi psikososial & spiritual pasien stabil, orientasi baik, dan hanya memerlukan motivasi atau bimbingan ibadah minimal.'
      };
    }
    if (total >= 10) {
      return {
        score: 3,
        label: 'Skala 3 (Sedang / Bimbingan Rutin)',
        defaultText: 'Pasien mengalami keterbatasan sedang, afek/sikap kurang kooperatif, serta membutuhkan pendampingan ibadah & konseling rohani secara rutin.'
      };
    }
    if (total >= 7) {
      return {
        score: 2,
        label: 'Skala 2 (Risiko Distres / Perlu Bimbingan Khusus)',
        defaultText: 'Pasien berisiko mengalami kecemasan/distres spiritual, kurang kooperatif, dan memerlukan intervensi bimbingan rohani khusus dari Bintalrohis.'
      };
    }
    return {
      score: 1,
      label: 'Skala 1 (Distres Berat / Intervensi Khusus)',
      defaultText: 'Pasien mengalami distres psikososial/spiritual berat, kesadaran/orientasi terganggu, serta memerlukan penanganan intensif dari tim rohaniwan & psikolog.'
    };
  };

  // Local state for deleted CPPT items in current session
  const [localDeletedIds, setLocalDeletedIds] = useState<string[]>([]);

  // Predefined drug master list for datalist suggestions
  const DRUG_MASTER_LIST = [
    'Amlodipine 5mg Tablet',
    'Amlodipine 10mg Tablet',
    'Paracetamol 500mg Tablet',
    'Paracetamol Syrup 120mg/5ml',
    'Cefadroxil 500mg Kapsul',
    'Amoxicillin 500mg Kaplet',
    'Omeprazole 20mg Kapsul',
    'Lansoprazole 30mg Kapsul',
    'Candesartan 8mg Tablet',
    'Candesartan 16mg Tablet',
    'Metformin 500mg Tablet',
    'Glibenclamide 5mg Tablet',
    'Infus NaCl 0.9% 500ml',
    'Infus Ringer Laktat (RL) 500ml',
    'Salbutamol Nebules 2.5mg',
    'Injeksi Ketorolac 30mg/ml',
    'Injeksi Ondansetron 4mg/2ml',
    'Injeksi Ranitidine 50mg/2ml',
    'Vitamin C 500mg Tablet'
  ];

  // Add drug to list
  const handleAddMedicine = () => {
    if (!drugName.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Ketik / Pilih Obat',
        text: 'Silakan ketik atau pilih nama obat terlebih dahulu',
        confirmButtonColor: '#2563eb'
      });
      return;
    }
    setMedicines(prev => [
      ...prev,
      {
        id: 'MED-' + Date.now(),
        drugName: drugName.trim(),
        qty: drugQty || '1',
        signa: drugSigna || '3 x sehari 1 kapsul'
      }
    ]);
    setDrugName('');
  };

  const handleRemoveMedicine = (id?: string) => {
    setMedicines(prev => prev.filter(m => m.id !== id));
  };

  // Target MR resolution
  const resolvedMrId = mrId || (() => {
    if (patientId) {
      const patientMrs = medicalRecords.filter(m => {
        const r = getReg(m.regId);
        return r?.patientId === patientId;
      });
      if (patientMrs.length > 0) return patientMrs[0].id;
    }
    return medicalRecords[0]?.id || 'MR001';
  })();

  const activeMR = getMR(resolvedMrId);
  const activeReg = activeMR ? getReg(activeMR.regId) : null;
  const activePatient = activeReg ? getPatient(activeReg.patientId) : (patientId ? getPatient(patientId) : null);

  const SIMRS_TABS = [
    'Ruang & Biaya', 'Pemeriksaan', 'PACS', 'EMR', 'Visite',
    'Tind. Dokter', 'Tind. Perawat', 'Lain-lain', 'Resep',
    'Obat Depo', "HAI's", 'Insiden', 'Kronologi', 'Kodingan / Casemix'
  ];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isEditable) {
      Swal.fire({
        icon: 'warning',
        title: 'Akses Terbatas (Mode Lihat)',
        text: 'Akun Anda berada dalam Mode Lihat (Read-Only) untuk pengisian CPPT/SOAP. Silakan login dengan akun Dokter/Perawat/RME.',
        confirmButtonColor: '#d97706'
      });
      return;
    }

    if (!subjective.trim() && !objective.trim() && !assessment.trim() && !plan.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Form Belum Lengkap',
        text: 'Isi minimal salah satu komponen SOAP (S, O, A, atau P) pada CPPT',
        confirmButtonColor: '#2563eb'
      });
      return;
    }

    addCPPT({
      mrId: resolvedMrId,
      date: inputDate,
      time: inputTime.substring(0, 5),
      profession: selectedProf,
      staffName: staffNameInput.trim() || user?.name || (selectedProf.includes('Dokter') ? 'dr. Sari Dewi, Sp.PD' : 'Ns. Hendra, S.Kep'),
      unit: unitInput.trim() || 'Poliklinik / Rawat Inap',
      subjective: subjective || '-',
      objective: objective || `TD ${tdSys}/${tdDia} mmHg, HR ${heartRate}x/m, RR ${respRate}x/m, T ${temp}°C, SpO2 ${spO2}%`,
      assessment: assessment || '-',
      plan: plan || '-',
      verified: true,
      vitalSigns: {
        systolic: tdSys,
        diastolic: tdDia,
        heartRate,
        respRate,
        temp,
        spo2: spO2
      },
      instructionPPA,
      medicines,
      implementation,
      criticalValue,
      formatType
    });

    // Clear form
    setSubjective('');
    setObjective('');
    setAssessment('');
    setPlan('');
    setInstructionPPA('');
    setMedicines([]);
    setImplementation('');
    setCriticalValue('');

    Swal.fire({
      icon: 'success',
      title: 'CPPT Berhasil Disimpan!',
      text: 'Catatan Perkembangan Pasien Terintegrasi telah tersimpan dalam rekam medis.',
      timer: 1800,
      showConfirmButton: false
    });

    if (onSavedSuccess) onSavedSuccess();
  };

  // Filter CPPT entries
  const patientCPPTList = cppt.filter(c => {
    if (localDeletedIds.includes(c.id) && !showDeleted) return false;
    if (patientId) {
      const mr = getMR(c.mrId);
      if (!mr) return false;
      const reg = getReg(mr.regId);
      if (reg?.patientId !== patientId) return false;
    }
    if (filterProf !== 'Semua' && c.profession && !c.profession.toLowerCase().includes(filterProf.toLowerCase())) {
      return false;
    }
    if (!showDeleted && c.isDeleted) return false;
    return true;
  });

  return (
    <div className={`space-y-3 font-sans text-xs text-slate-800 ${isFullScreen ? 'fixed inset-0 z-50 bg-slate-100 p-4 overflow-y-auto' : ''}`}>
      
      {/* FULL SCREEN TOGGLE HEADER (ONLY SHOWN IN FULL SCREEN MODE) */}
      {isFullScreen && (
        <div className="bg-[#81a9c3] text-white p-2.5 rounded-xl flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2 font-bold text-xs">
            <Activity className="w-4 h-4 text-white" />
            <span>SIMRS RME - FORMULIR PEMERIKSAAN & CPPT PASIEN</span>
            {activePatient && (
              <span className="bg-white/20 px-2 py-0.5 rounded text-[11px] font-mono">
                [{activePatient.noRM}] {activePatient.name}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => setIsFullScreen(false)}
            className="px-3 py-1 bg-white/20 hover:bg-white/30 text-white font-bold rounded-lg text-xs transition-colors cursor-pointer"
          >
            ❌ Kecilkan Layar (Tutup Full Screen)
          </button>
        </div>
      )}

      {/* 13 SIMRS SUB-TABS */}
      <div className="bg-slate-200/80 p-1 rounded-xl border border-slate-300 flex items-center justify-between gap-1 overflow-x-auto">
        <div className="flex items-center gap-1 overflow-x-auto min-w-0">
          {SIMRS_TABS.map(tab => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveSubTab(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeSubTab === tab
                  ? 'bg-[#81a9c3] text-white shadow-xs'
                  : 'bg-white/80 text-slate-700 hover:bg-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        {!isFullScreen && (
          <button
            type="button"
            onClick={() => setIsFullScreen(true)}
            className="px-2.5 py-1.5 bg-[#81a9c3] hover:bg-[#6b95b1] text-white font-bold rounded-lg text-[11px] transition-colors whitespace-nowrap cursor-pointer shrink-0 ml-1 flex items-center gap-1 shadow-xs"
            title="Tampilkan Sepenuh Layar"
          >
            <span>⚡ Full Screen</span>
          </button>
        )}
      </div>

      {/* 1. VIEW TAB: RUANG & BIAYA */}
      {activeSubTab === 'Ruang & Biaya' && (
        <div className="space-y-4 bg-white p-4 rounded-xl border border-slate-300 shadow-2xs">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <h3 className="font-bold text-xs text-slate-900 uppercase">Ruang Perawatan & Rincian Akumulasi Biaya Pasien</h3>
            <span className="text-blue-700 font-mono font-bold text-xs">No. RM: {activePatient?.noRM || '000001'}</span>
          </div>

          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div>
              <div className="text-slate-500 font-bold text-[10px] uppercase">Bangsal / Kamar</div>
              <div className="font-extrabold text-slate-900 text-sm">Bangsal Mawar - Room 204</div>
            </div>
            <div>
              <div className="text-slate-500 font-bold text-[10px] uppercase">Kelas Perawatan</div>
              <div className="font-extrabold text-blue-700 text-sm">Kelas VIP (BPJS Utama)</div>
            </div>
            <div>
              <div className="text-slate-500 font-bold text-[10px] uppercase">Lama Rawat Inap</div>
              <div className="font-extrabold text-emerald-700 text-sm">2 Hari (Masuk: 22-07-2026)</div>
            </div>
            <div>
              <div className="text-slate-500 font-bold text-[10px] uppercase">Penjamin / Jaminan</div>
              <div className="font-extrabold text-purple-700 text-sm">BPJS KESEHATAN (SEP Valid)</div>
            </div>
          </div>

          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#81a9c3] text-white font-bold">
                <tr>
                  <th className="p-2.5">No</th>
                  <th className="p-2.5">Tgl / Jam</th>
                  <th className="p-2.5">Kategori / Item Layanan</th>
                  <th className="p-2.5 text-center">Qty</th>
                  <th className="p-2.5 text-right">Harga Satuan</th>
                  <th className="p-2.5 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-800">
                <tr>
                  <td className="p-2.5 font-bold">1</td>
                  <td className="p-2.5 font-mono">22-07-2026</td>
                  <td className="p-2.5 font-semibold">Sewa Kamar Perawatan VIP (Per Hari)</td>
                  <td className="p-2.5 text-center">2</td>
                  <td className="p-2.5 text-right font-mono">Rp 750.000</td>
                  <td className="p-2.5 text-right font-bold text-slate-900 font-mono">Rp 1.500.000</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold">2</td>
                  <td className="p-2.5 font-mono">23-07-2026</td>
                  <td className="p-2.5 font-semibold">Jasa Visite Dokter Spesialis Penyakit Dalam</td>
                  <td className="p-2.5 text-center">2</td>
                  <td className="p-2.5 text-right font-mono">Rp 250.000</td>
                  <td className="p-2.5 text-right font-bold text-slate-900 font-mono">Rp 500.000</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold">3</td>
                  <td className="p-2.5 font-mono">23-07-2026</td>
                  <td className="p-2.5 font-semibold">Paket Obat & Alkes Rawat Inap Bangsal</td>
                  <td className="p-2.5 text-center">1</td>
                  <td className="p-2.5 text-right font-mono">Rp 1.850.000</td>
                  <td className="p-2.5 text-right font-bold text-slate-900 font-mono">Rp 1.850.000</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold">4</td>
                  <td className="p-2.5 font-mono">22-07-2026</td>
                  <td className="p-2.5 font-semibold">Pemeriksaan Radiologi Foto Thorax AP/PA</td>
                  <td className="p-2.5 text-center">1</td>
                  <td className="p-2.5 text-right font-mono">Rp 350.000</td>
                  <td className="p-2.5 text-right font-bold text-slate-900 font-mono">Rp 350.000</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold">5</td>
                  <td className="p-2.5 font-mono">22-07-2026</td>
                  <td className="p-2.5 font-semibold">Laboratorium Darah Rutin + Kimia Darah</td>
                  <td className="p-2.5 text-center">1</td>
                  <td className="p-2.5 text-right font-mono">Rp 650.000</td>
                  <td className="p-2.5 text-right font-bold text-slate-900 font-mono">Rp 650.000</td>
                </tr>
              </tbody>
              <tfoot className="bg-slate-100 font-extrabold text-slate-900 border-t-2 border-slate-300">
                <tr>
                  <td colSpan={5} className="p-2.5 text-right uppercase text-xs">Total Accumulative Billing:</td>
                  <td className="p-2.5 text-right text-sm text-blue-700 font-mono">Rp 4.850.000</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
            <div className="font-bold text-xs text-slate-800">Tambah Item Tagihan Biaya Ruangan / Layanan Baru</div>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
              <input type="text" placeholder="Nama Item / Layanan" className="p-2 border rounded bg-white" />
              <input type="number" placeholder="Harga Satuan (Rp)" className="p-2 border rounded bg-white" />
              <input type="number" placeholder="Qty" defaultValue={1} className="p-2 border rounded bg-white" />
              <button
                type="button"
                onClick={() => Swal.fire({ icon: 'success', title: 'Tagihan Ditambahkan', text: 'Item biaya berhasil ditambahkan ke billing pasien.', timer: 1200, showConfirmButton: false })}
                className="p-2 bg-blue-600 text-white font-bold rounded cursor-pointer hover:bg-blue-700 transition-colors"
              >
                + Tambah Billing
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. VIEW TAB: PACS */}
      {activeSubTab === 'PACS' && (
        <div className="space-y-4 bg-white p-4 rounded-xl border border-slate-300 shadow-2xs">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <h3 className="font-bold text-xs text-slate-900 uppercase">Integrasi Radiologi PACS & DICOM Image Viewer</h3>
            <span className="text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-[10px]">PACS Server Online ✓</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-6 bg-slate-950 p-4 rounded-xl border border-slate-800 text-slate-200 text-center flex flex-col justify-between h-80 relative overflow-hidden">
              <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
                <span>DICOM ID: RAD-20260723-889</span>
                <span>SERIES 1 / IM 1</span>
              </div>
              <div className="my-auto flex flex-col items-center justify-center space-y-2">
                <div className="w-36 h-44 bg-slate-800 rounded-lg border border-slate-700 flex items-center justify-center text-slate-500 font-mono text-xs relative overflow-hidden shadow-inner">
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-800/40 to-slate-900/90"></div>
                  <span className="relative z-10 font-bold text-slate-300 text-[11px] text-center px-2">
                    [ X-RAY THORAX AP/PA ]<br />Preview Image
                  </span>
                </div>
              </div>
              <div className="flex justify-center gap-2 pt-2 border-t border-slate-800 text-[10px] font-bold">
                <button type="button" className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded">🔍 Zoom In</button>
                <button type="button" className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded">☯ Invert</button>
                <button
                  type="button"
                  onClick={() => Swal.fire({ title: 'PACS Viewer Fullscreen', text: 'Membuka DICOM Web Viewer Fullscreen...', icon: 'info' })}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded cursor-pointer"
                >
                  🖥️ Buka PACS Viewer Fullscreen
                </button>
              </div>
            </div>

            <div className="lg:col-span-6 p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 text-xs">
              <div className="font-bold text-slate-900 border-b border-slate-200 pb-2 flex justify-between">
                <span>Ekspertise Radiologi</span>
                <span className="text-slate-500 font-normal">23-07-2026 10:15 WIB</span>
              </div>
              <div className="space-y-1 text-slate-700">
                <div>Pemeriksaan: <strong className="text-slate-900">Foto Thorax AP/PA</strong></div>
                <div>Dokter Radiologi: <strong className="text-slate-900">dr. Budi Santoso, Sp.Rad</strong></div>
              </div>
              <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-2 text-slate-800">
                <div className="font-bold text-blue-900">Hasil Ekspertise:</div>
                <p className="leading-relaxed text-[11px]">
                  Tampak perselubungan infiltrat di paracardial kanan dan basalis paru kiri.<br />
                  Cor tidak membesar, CTR &lt; 50%.<br />
                  Sinus kostofrenikus dan diafragma kanan-kiri normal.<br />
                  Tulang-tulang intak.
                </p>
                <div className="font-bold text-emerald-800 pt-1">Kesan: Pneumonia Bilateral.</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. VIEW TAB: EMR */}
      {activeSubTab === 'EMR' && (
        <div className="space-y-4 bg-white p-4 rounded-xl border border-slate-300 shadow-2xs text-xs">
          <div className="font-bold text-slate-900 uppercase border-b border-slate-200 pb-2 flex justify-between">
            <span>Ringkasan EMR Longitudinal Pasien</span>
            <span className="text-blue-700 font-mono">No. RM: {activePatient?.noRM || '000001'}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="font-bold text-blue-900">Diagnosa Utama (ICD-10)</div>
              <div className="text-base font-extrabold text-blue-950 mt-1">J18.9 - Pneumonia</div>
              <div className="text-[10px] text-blue-700 mt-0.5">Diagnosa Masuk DPJP Utama</div>
            </div>
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="font-bold text-amber-900">Diagnosa Sekunder</div>
              <div className="text-xs font-bold text-amber-950 mt-1">• E11.9 - DM Tipe 2</div>
              <div className="text-xs font-bold text-amber-950">• I10 - Hipertensi Primer</div>
            </div>
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg">
              <div className="font-bold text-rose-900">Riwayat Alergi</div>
              <div className="text-xs font-extrabold text-rose-950 mt-1">⚠️ Amoxicillin (Eritema)</div>
              <div className="text-[10px] text-rose-700 mt-0.5">Reaksi Alergi Obat Ringan</div>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <div className="font-bold text-slate-800">Riwayat Kunjungan Berobat Terdaftar</div>
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-[#81a9c3] text-white font-bold">
                  <tr>
                    <th className="p-2">Tgl / Jam</th>
                    <th className="p-2">Unit / Poliklinik</th>
                    <th className="p-2">DPJP / Nakes</th>
                    <th className="p-2">Diagnosa Ringkas</th>
                    <th className="p-2 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-800">
                  <tr>
                    <td className="p-2 font-mono">22-07-2026 09:00</td>
                    <td className="p-2 font-semibold">Rawat Inap Bangsal Mawar</td>
                    <td className="p-2">dr. Sari Dewi, Sp.PD</td>
                    <td className="p-2">Pneumonia Bilateral + DM Tipe 2</td>
                    <td className="p-2 text-center font-bold text-emerald-700">Rawat Inap Active</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-mono">10-06-2026 09:30</td>
                    <td className="p-2 font-semibold">Poliklinik Penyakit Dalam</td>
                    <td className="p-2">dr. Sari Dewi, Sp.PD</td>
                    <td className="p-2">Hipertensi Primer Control</td>
                    <td className="p-2 text-center font-bold text-slate-500">Selesai</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 4. VIEW TAB: VISITE */}
      {activeSubTab === 'Visite' && (
        <div className="space-y-4 bg-white p-4 rounded-xl border border-slate-300 shadow-2xs text-xs">
          <div className="font-bold text-slate-900 border-b border-slate-200 pb-2 flex justify-between items-center">
            <span>Log Catatan Visite Harian Dokter Spesialis / DPJP</span>
            <button
              type="button"
              onClick={() => Swal.fire({ title: 'Tambah Visite', text: 'Form Catatan Visite Dokter Baru', icon: 'info' })}
              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded cursor-pointer"
            >
              + Catat Visite Baru
            </button>
          </div>

          <div className="space-y-3">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
              <div className="flex justify-between font-bold text-slate-800 border-b border-slate-200 pb-1">
                <span>Visite Hari 2 - dr. Sari Dewi, Sp.PD (DPJP Utama)</span>
                <span className="font-mono text-slate-500">24-07-2026 08:30 WIB</span>
              </div>
              <p className="text-slate-700 pt-1">
                <strong>Evaluasi:</strong> Sesak napas berkurang, batuk berdahak minimal. Ronkhi berkurang.<br />
                <strong>Instruksi Visite:</strong> Terapi injeksi antibiotic & nebulizer dilanjutkan. Cek ulang leukosit besok.
              </p>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
              <div className="flex justify-between font-bold text-slate-800 border-b border-slate-200 pb-1">
                <span>Visite Hari 1 - dr. Sari Dewi, Sp.PD (DPJP Utama)</span>
                <span className="font-mono text-slate-500">23-07-2026 09:15 WIB</span>
              </div>
              <p className="text-slate-700 pt-1">
                <strong>Evaluasi:</strong> Keluhan utama sesak napas. Pasien tirah baring.<br />
                <strong>Instruksi Visite:</strong> Oksigen nasal 3 lpm, pasang IV line RL 20 tpm, Ceftriaxone 1g/12jam IV.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 5. VIEW TAB: TIND. DOKTER */}
      {activeSubTab === 'Tind. Dokter' && (
        <div className="space-y-4 bg-white p-4 rounded-xl border border-slate-300 shadow-2xs text-xs">
          <div className="font-bold text-slate-900 border-b border-slate-200 pb-2 flex justify-between">
            <span>Daftar Tindakan & Prosedur Medis Oleh Dokter</span>
            <span className="text-blue-700 font-mono">Dokter Module</span>
          </div>

          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-[#81a9c3] text-white font-bold">
                <tr>
                  <th className="p-2">No</th>
                  <th className="p-2">Waktu Eksekusi</th>
                  <th className="p-2">Nama Tindakan Dokter</th>
                  <th className="p-2">Kode ICD-9 CM</th>
                  <th className="p-2">Dokter Operator</th>
                  <th className="p-2 text-right">Tarif</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-800">
                <tr>
                  <td className="p-2 font-bold">1</td>
                  <td className="p-2 font-mono">22-07-2026 09:30</td>
                  <td className="p-2 font-semibold">Pemasangan Injeksi IV & Akses Vena Perifer</td>
                  <td className="p-2 font-mono">38.93</td>
                  <td className="p-2">dr. Sari Dewi, Sp.PD</td>
                  <td className="p-2 text-right font-mono">Rp 150.000</td>
                </tr>
                <tr>
                  <td className="p-2 font-bold">2</td>
                  <td className="p-2 font-mono">22-07-2026 09:45</td>
                  <td className="p-2 font-semibold">Pemeriksaan Rekam Jantung (EKG 12 Lead)</td>
                  <td className="p-2 font-mono">89.52</td>
                  <td className="p-2">dr. Ahmad, Sp.JP</td>
                  <td className="p-2 text-right font-mono">Rp 120.000</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
            <div className="font-bold text-slate-800">Input Tindakan Dokter Baru</div>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
              <input type="text" placeholder="Nama Tindakan Dokter" className="p-2 border rounded bg-white" />
              <input type="text" placeholder="Kode ICD-9 CM" className="p-2 border rounded bg-white" />
              <input type="number" placeholder="Tarif (Rp)" className="p-2 border rounded bg-white" />
              <button
                type="button"
                onClick={() => Swal.fire({ icon: 'success', title: 'Tindakan Disimpan', text: 'Tindakan dokter berhasil ditambahkan.', timer: 1200, showConfirmButton: false })}
                className="p-2 bg-blue-600 text-white font-bold rounded cursor-pointer hover:bg-blue-700 transition-colors"
              >
                + Simpan Tindakan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. VIEW TAB: TIND. PERAWAT */}
      {activeSubTab === 'Tind. Perawat' && (
        <div className="space-y-4 bg-white p-4 rounded-xl border border-slate-300 shadow-2xs text-xs">
          <div className="font-bold text-slate-900 border-b border-slate-200 pb-2 flex justify-between">
            <span>Asuhan & Intervensi Keperawatan</span>
            <span className="text-emerald-700 font-mono">Nursing Log</span>
          </div>

          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-[#81a9c3] text-white font-bold">
                <tr>
                  <th className="p-2">Tgl / Jam</th>
                  <th className="p-2">Jenis Intervensi Keperawatan</th>
                  <th className="p-2">Perawat Petugas</th>
                  <th className="p-2">Hasil Observasi / Catatan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-800">
                <tr>
                  <td className="p-2 font-mono">24-07-2026 12:00</td>
                  <td className="p-2 font-semibold">Observasi Vital Signs & Tanda Sesak</td>
                  <td className="p-2">Ns. Hendra, S.Kep</td>
                  <td className="p-2">TD 120/80 mmHg, HR 88x/m, SpO2 98% (Nasal Cannula 3 lpm)</td>
                </tr>
                <tr>
                  <td className="p-2 font-mono">24-07-2026 08:00</td>
                  <td className="p-2 font-semibold">Pemberian Obat Injeksi IV Viamed</td>
                  <td className="p-2">Ns. Rina, Amd.Kep</td>
                  <td className="p-2">Injeksi Ranitidine 50mg IV masuk lancar, tidak ada keluhan alergi</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 7. VIEW TAB: LAIN-LAIN */}
      {activeSubTab === 'Lain-lain' && (
        <div className="space-y-4 bg-white p-4 rounded-xl border border-slate-300 shadow-2xs text-xs">
          <div className="font-bold text-slate-900 border-b border-slate-200 pb-2">Layanan & Konsultasi Penunjang Lain-Lain</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3 border rounded-lg bg-slate-50 space-y-1">
              <div className="font-bold text-slate-900">Konsultasi Gizi Klinis</div>
              <div className="text-slate-600">Diet Tinggi Kalori Tinggi Protein (TKTP) 2000 kkal</div>
              <div className="text-emerald-700 font-bold text-[10px]">Status: Terjadwal</div>
            </div>
            <div className="p-3 border rounded-lg bg-slate-50 space-y-1">
              <div className="font-bold text-slate-900">Fisioterapi Dada</div>
              <div className="text-slate-600">Chest Physiotherapy & Postural Drainage</div>
              <div className="text-blue-700 font-bold text-[10px]">Status: Selesai</div>
            </div>
            <div className="p-3 border rounded-lg bg-slate-50 space-y-1">
              <div className="font-bold text-slate-900">Permintaan Transfusi PMI</div>
              <div className="text-slate-600">Crossmatch PRC Blood Group O+ (1 Kantong)</div>
              <div className="text-amber-700 font-bold text-[10px]">Status: Dalam Proses</div>
            </div>
          </div>
        </div>
      )}

      {/* 8. VIEW TAB: RESEP */}
      {activeSubTab === 'Resep' && (
        <div className="space-y-4 bg-white p-4 rounded-xl border border-slate-300 shadow-2xs text-xs">
          <div className="font-bold text-slate-900 border-b border-slate-200 pb-2 flex justify-between">
            <span>Daftar E-Resep & Instruksi Obat Pasien</span>
            <span className="text-emerald-700 font-bold">Apotek Direct Connection</span>
          </div>

          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-[#81a9c3] text-white font-bold">
                <tr>
                  <th className="p-2">No</th>
                  <th className="p-2">Nama Obat</th>
                  <th className="p-2">Dosis & Signa</th>
                  <th className="p-2 text-center">Jumlah</th>
                  <th className="p-2 text-center">Status Apotek</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-800">
                <tr>
                  <td className="p-2 font-bold">1</td>
                  <td className="p-2 font-bold text-slate-900">Paracetamol 500mg Tablet</td>
                  <td className="p-2">3 x 1 Tablet Sesudah Makan</td>
                  <td className="p-2 text-center font-bold">10 Strip</td>
                  <td className="p-2 text-center"><span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded text-[10px]">Ready / Selesai</span></td>
                </tr>
                <tr>
                  <td className="p-2 font-bold">2</td>
                  <td className="p-2 font-bold text-slate-900">Cefadroxil 500mg Kapsul</td>
                  <td className="p-2">2 x 1 Kapsul Sesudah Makan (Habiskan)</td>
                  <td className="p-2 text-center font-bold">10 Kapsul</td>
                  <td className="p-2 text-center"><span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded text-[10px]">Ready / Selesai</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 9. VIEW TAB: OBAT DEPO */}
      {activeSubTab === 'Obat Depo' && (
        <div className="space-y-4 bg-white p-4 rounded-xl border border-slate-300 shadow-2xs text-xs">
          <div className="font-bold text-slate-900 border-b border-slate-200 pb-2">Log Pengambilan & Stok Depo Obat Bangsal</div>
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-[#81a9c3] text-white font-bold">
                <tr>
                  <th className="p-2">Tgl / Jam</th>
                  <th className="p-2">Item Depo Obat / Alkes</th>
                  <th className="p-2 text-center">Qty</th>
                  <th className="p-2">Petugas Bangsal</th>
                  <th className="p-2 text-center">Depo Asal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-800">
                <tr>
                  <td className="p-2 font-mono">24-07-2026 10:00</td>
                  <td className="p-2 font-semibold">Infus Ringer Laktat (RL) 500ml</td>
                  <td className="p-2 text-center font-bold">2 Fls</td>
                  <td className="p-2">Ns. Hendra, S.Kep</td>
                  <td className="p-2 text-center font-bold text-blue-700">Depo Mawar</td>
                </tr>
                <tr>
                  <td className="p-2 font-mono">24-07-2026 11:15</td>
                  <td className="p-2 font-semibold">Spuit 3cc Terumo</td>
                  <td className="p-2 text-center font-bold">5 Pcs</td>
                  <td className="p-2">Ns. Rina, Amd.Kep</td>
                  <td className="p-2 text-center font-bold text-blue-700">Depo Mawar</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 10. VIEW TAB: HAI's */}
      {activeSubTab === "HAI's" && (
        <div className="space-y-4 bg-white p-4 rounded-xl border border-slate-300 shadow-2xs text-xs">
          <div className="font-bold text-slate-900 border-b border-slate-200 pb-2 flex justify-between">
            <span>Surveilans Infeksi Rumah Sakit / PPI (INOS & HAI's)</span>
            <span className="text-emerald-700 font-bold">Bebas Infeksi (Zero Infection)</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3 border rounded-lg bg-emerald-50/50 border-emerald-200 space-y-1">
              <div className="font-bold text-emerald-900">Infus Perifer (IV Line)</div>
              <div className="text-slate-700">Tgl Pasang: 22-07-2026 (2 Hari)</div>
              <div className="text-emerald-800 font-bold">Tanda Phlebitis (-), PUS (-)</div>
            </div>
            <div className="p-3 border rounded-lg bg-emerald-50/50 border-emerald-200 space-y-1">
              <div className="font-bold text-emerald-900">Kateter Urine (Foley)</div>
              <div className="text-slate-700">Tgl Pasang: 23-07-2026 (1 Hari)</div>
              <div className="text-emerald-800 font-bold">Tanda ISK (-), Urine Jernih</div>
            </div>
            <div className="p-3 border rounded-lg bg-slate-50 space-y-1">
              <div className="font-bold text-slate-800">Ventilator / ETT</div>
              <div className="text-slate-500">Tidak Terpasang</div>
              <div className="text-slate-400 font-bold">-</div>
            </div>
          </div>
        </div>
      )}

      {/* 11. VIEW TAB: INSIDEN */}
      {activeSubTab === 'Insiden' && (
        <div className="space-y-4 bg-white p-4 rounded-xl border border-slate-300 shadow-2xs text-xs">
          <div className="font-bold text-slate-900 border-b border-slate-200 pb-2 flex justify-between">
            <span>Laporan Insiden Keselamatan Pasien (IKP)</span>
            <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">Zone: Hijau (Zero Incident)</span>
          </div>
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-center space-y-2">
            <div className="font-bold text-slate-800 text-sm">Tidak Ada Insiden Keselamatan Pasien Terlaporkan</div>
            <p className="text-slate-500 text-xs">Pasien dalam kondisi aman dan terlindungi sesuai kriteria Patient Safety STARKES.</p>
            <button
              type="button"
              onClick={() => Swal.fire({ title: 'Lapor Insiden', text: 'Form Laporan IKP Pasien', icon: 'warning' })}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded cursor-pointer"
            >
              + Buat Laporan Insiden Baru
            </button>
          </div>
        </div>
      )}

      {/* 12. VIEW TAB: KRONOLOGI */}
      {activeSubTab === 'Kronologi' && (
        <div className="space-y-4 bg-white p-4 rounded-xl border border-slate-300 shadow-2xs text-xs">
          <div className="font-bold text-slate-900 border-b border-slate-200 pb-2">Garis Waktu Chronology Pelayanan Pasien (Patient Pathway)</div>
          <div className="relative border-l-2 border-blue-500 ml-4 pl-4 space-y-4 py-2">
            <div className="relative">
              <div className="absolute -left-[23px] top-0 w-3 h-3 bg-blue-600 rounded-full border-2 border-white"></div>
              <div className="font-bold text-slate-900">22 Juli 2026 - 09:00 WIB</div>
              <div className="text-slate-700">Pasien masuk Triage IGD dengan keluhan sesak napas & batuk.</div>
            </div>
            <div className="relative">
              <div className="absolute -left-[23px] top-0 w-3 h-3 bg-blue-600 rounded-full border-2 border-white"></div>
              <div className="font-bold text-slate-900">22 Juli 2026 - 10:15 WIB</div>
              <div className="text-slate-700">Pemeriksaan Foto Thorax AP/PA di Radiologi. Infiltrat pneumonia terdeteksi.</div>
            </div>
            <div className="relative">
              <div className="absolute -left-[23px] top-0 w-3 h-3 bg-blue-600 rounded-full border-2 border-white"></div>
              <div className="font-bold text-slate-900">22 Juli 2026 - 11:30 WIB</div>
              <div className="text-slate-700">Pasien dipindahkan ke Rawat Inap Bangsal Mawar Room 204.</div>
            </div>
            <div className="relative">
              <div className="absolute -left-[23px] top-0 w-3 h-3 bg-blue-600 rounded-full border-2 border-white"></div>
              <div className="font-bold text-slate-900">24 Juli 2026 - 11:42 WIB</div>
              <div className="text-slate-700">Pemeriksaan CPPT Dokter DOSEN RMIK UEU (SOAP Pneumonia & Terapi O2).</div>
            </div>
          </div>
        </div>
      )}

      {/* 13. VIEW TAB: KODINGAN / CASEMIX */}
      {activeSubTab === 'Kodingan / Casemix' && (
        <div className="space-y-4 bg-white p-4 rounded-xl border border-slate-300 shadow-2xs text-xs">
          <div className="font-bold text-slate-900 border-b border-slate-200 pb-2 flex justify-between items-center">
            <span className="text-sm text-blue-900 font-black">MODUL PENGISIAN KODINGAN & CASEMIX (ICD-10, ICD-9 CM & INA-CBGs)</span>
            <span className="bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full border border-emerald-300">
              Coder Status: Verified (Coder RMIK)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <div className="font-extrabold text-slate-800 border-b border-slate-200 pb-1">1. Pengkodean Diagnosa (ICD-10)</div>
              <div className="space-y-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Diagnosa Utama (Main Diagnosis):</label>
                  <div className="flex gap-2">
                    <input list="icd10-datalist-cppt" type="text" defaultValue="J18.9" className="w-24 p-2 font-mono font-bold border rounded bg-white text-blue-900" placeholder="Kode..." />
                    <input list="icd10-desc-datalist-cppt" type="text" defaultValue="Pneumonia, unspecified" className="flex-1 p-2 font-semibold border rounded bg-white text-slate-800" placeholder="Deskripsi diagnosa..." />
                  </div>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Diagnosa Sekunder 1 (Secondary Diagnosis):</label>
                  <div className="flex gap-2">
                    <input list="icd10-datalist-cppt" type="text" defaultValue="E11.9" className="w-24 p-2 font-mono font-bold border rounded bg-white text-blue-900" placeholder="Kode..." />
                    <input list="icd10-desc-datalist-cppt" type="text" defaultValue="Type 2 diabetes mellitus without complications" className="flex-1 p-2 font-semibold border rounded bg-white text-slate-800" placeholder="Deskripsi diagnosa..." />
                  </div>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Diagnosa Sekunder 2:</label>
                  <div className="flex gap-2">
                    <input list="icd10-datalist-cppt" type="text" defaultValue="I10" className="w-24 p-2 font-mono font-bold border rounded bg-white text-blue-900" placeholder="Kode..." />
                    <input list="icd10-desc-datalist-cppt" type="text" defaultValue="Essential (primary) hypertension" className="flex-1 p-2 font-semibold border rounded bg-white text-slate-800" placeholder="Deskripsi diagnosa..." />
                  </div>
                </div>

                <datalist id="icd10-datalist-cppt">
                  {EXTENDED_ICD10.map(i => (
                    <option key={i.code} value={i.code}>{i.code} - {i.desc}</option>
                  ))}
                </datalist>
                <datalist id="icd10-desc-datalist-cppt">
                  {EXTENDED_ICD10.map(i => (
                    <option key={i.code} value={i.desc}>{i.code} - {i.desc}</option>
                  ))}
                </datalist>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <div className="font-extrabold text-slate-800 border-b border-slate-200 pb-1">2. Pengkodean Prosedur (ICD-9 CM) & INA-CBGs</div>
              <div className="space-y-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Prosedur / Tindakan 1 (ICD-9 CM):</label>
                  <div className="flex gap-2">
                    <input list="icd9-datalist-cppt" type="text" defaultValue="87.44" className="w-24 p-2 font-mono font-bold border rounded bg-white text-blue-900" placeholder="Kode..." />
                    <input list="icd9-desc-datalist-cppt" type="text" defaultValue="Routine chest x-ray" className="flex-1 p-2 font-semibold border rounded bg-white text-slate-800" placeholder="Deskripsi tindakan..." />
                  </div>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Prosedur / Tindakan 2 (ICD-9 CM):</label>
                  <div className="flex gap-2">
                    <input list="icd9-datalist-cppt" type="text" defaultValue="89.52" className="w-24 p-2 font-mono font-bold border rounded bg-white text-blue-900" placeholder="Kode..." />
                    <input list="icd9-desc-datalist-cppt" type="text" defaultValue="Electrocardiogram" className="flex-1 p-2 font-semibold border rounded bg-white text-slate-800" placeholder="Deskripsi tindakan..." />
                  </div>
                </div>

                <datalist id="icd9-datalist-cppt">
                  {EXTENDED_ICD9CM.map(i => (
                    <option key={i.code} value={i.code}>{i.code} - {i.desc}</option>
                  ))}
                </datalist>
                <datalist id="icd9-desc-datalist-cppt">
                  {EXTENDED_ICD9CM.map(i => (
                    <option key={i.code} value={i.desc}>{i.code} - {i.desc}</option>
                  ))}
                </datalist>

                <div className="p-2 bg-blue-100/70 border border-blue-300 rounded-lg space-y-1">
                  <div className="flex justify-between font-bold text-blue-950">
                    <span>Hasil Grouper INA-CBGs:</span>
                    <span className="font-mono text-sm">J-4-16-I</span>
                  </div>
                  <div className="text-blue-900 font-extrabold">PNEUMONIA RINGAN (RAWAT INAP KELAS 1)</div>
                  <div className="flex justify-between text-xs text-blue-950 font-mono font-bold pt-1 border-t border-blue-200">
                    <span>Tarif Klaim CBGs:</span>
                    <span className="text-emerald-800 text-sm">Rp 5.420.000</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={() => {
                Swal.fire({
                  icon: 'success',
                  title: 'Kodingan & Casemix Disimpan!',
                  text: 'Data ICD-10, ICD-9 CM, dan INA-CBGs berhasil dikunci & siap dikirim ke BPJS Vedika.',
                  confirmButtonColor: '#2563eb'
                });
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg cursor-pointer"
            >
              💾 Simpan Kodingan & Grouper Casemix
            </button>
          </div>
        </div>
      )}

      {/* FORM PEMERIKSAAN & HISTORICAL CPPT TABLE (Exclusively shown when activeSubTab === 'Pemeriksaan') */}
      {activeSubTab === 'Pemeriksaan' && (
        <div className="space-y-3">
          {/* Sub-menu Bar for Pemeriksaan: Assesment, Pengkajian Keperawatan, Triace, IGD, Rawat Jalan, Rawat Inap */}
          <div className="bg-slate-200/90 p-1.5 rounded-xl border border-slate-300 flex items-center justify-between gap-1.5 overflow-x-auto shadow-2xs">
            <div className="flex items-center gap-1.5 overflow-x-auto">
              <span className="text-[11px] font-extrabold text-slate-700 px-2 uppercase tracking-wide shrink-0">Sub-Modul Pemeriksaan:</span>
              {(['Assesment', 'Pengkajian Keperawatan', 'Triace', 'IGD', 'Rawat Jalan', 'Rawat Inap'] as const).map(sub => (
                <button
                  key={sub}
                  type="button"
                  onClick={() => setPemeriksaanSubMenu(sub)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap ${
                    pemeriksaanSubMenu === sub
                      ? 'bg-blue-700 text-white shadow-xs'
                      : 'bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  {sub}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setIsPengkajianModalOpen(true)}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-lg shadow-2xs flex items-center gap-1.5 shrink-0 transition-all cursor-pointer"
            >
              <ClipboardList className="w-4 h-4 text-white" />
              <span>Form Pengkajian Full Single-View</span>
            </button>
          </div>

          {/* Top Filter Bar (Exact like screenshot) */}
          <div className="bg-slate-100 p-2.5 rounded-xl border border-slate-200/80 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <select
                value={filterProf}
                onChange={e => setFilterProf(e.target.value)}
                className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 shadow-2xs focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="Semua">Semua Profesi</option>
                <option value="Dokter">Dokter</option>
                <option value="Perawat">Perawat / Bidan</option>
                <option value="Apoteker">Apoteker / Ahli Gizi</option>
              </select>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={showDeleted}
                  onChange={e => setShowDeleted(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span>Tampilkan CPPT yang dihapus</span>
              </label>
            </div>

            <span className="text-[11px] font-bold text-slate-500">
              Formulir CPPT Standar Akreditasi STARKES / KARS (Format S-O-A-P)
            </span>
          </div>

      {/* Main Form Entry Table Matching User's Screenshot */}
      <form onSubmit={handleSave} className="border border-slate-300 rounded-xl overflow-hidden shadow-xs bg-white">
        {/* Table Header */}
        <div className="bg-[#81a9c3] text-white font-bold grid grid-cols-12 text-center divide-x divide-white/30 text-xs">
          <div className="col-span-2 py-3 px-2 flex items-center justify-center">
            <span>Tgl/Jam</span>
          </div>
          <div className="col-span-3 py-3 px-2 flex items-center justify-center">
            <span>Profesional Pemberi Asuhan</span>
          </div>
          <div className="col-span-7 py-2 px-3 flex flex-col justify-center items-center">
            <span className="text-sm">Hasil Asesmen Pasien dan Pemberian Pelayanan</span>
            <span className="text-[10px] font-normal italic opacity-90">
              Tulis dengan format S-O-A-P disertai sasaran
            </span>
          </div>
        </div>

        {/* Table Form Row */}
        <div className="grid grid-cols-12 divide-x divide-slate-200 text-slate-800 bg-white">
          
          {/* Column 1: Tgl/Jam */}
          <div className="col-span-12 md:col-span-2 p-2.5 space-y-2 bg-slate-50/50">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Tanggal</label>
              <input
                type="date"
                value={inputDate}
                onChange={e => setInputDate(e.target.value)}
                className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs font-medium focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Jam (hh:mm:ss)</label>
              <input
                type="text"
                value={inputTime}
                onChange={e => setInputTime(e.target.value)}
                placeholder="08:30:00"
                className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs font-mono focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Column 2: Profesional Pemberi Asuhan */}
          <div className="col-span-12 md:col-span-3 p-2.5 space-y-2 bg-slate-50/50">
            <div>
              <label className="block text-[10px] font-bold text-slate-700 mb-0.5 flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                <span>Nama Petugas (PPA) *</span>
              </label>
              <input
                type="text"
                list="staff-name-options"
                value={staffNameInput}
                onChange={e => setStaffNameInput(e.target.value)}
                placeholder="Nama DPJP / Dokter / Ners..."
                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs font-bold text-blue-950 focus:outline-none focus:border-blue-500 shadow-2xs"
                required
              />
              <datalist id="staff-name-options">
                {users.map(u => (
                  <option key={u.id} value={u.name}>{u.name} ({u.role})</option>
                ))}
                <option value="dr. Sari Dewi, Sp.PD">dr. Sari Dewi, Sp.PD (Dokter Spesialis)</option>
                <option value="dr. Hendra Pratama, Sp.JP">dr. Hendra Pratama, Sp.JP (Spesialis Jantung)</option>
                <option value="dr. Ahmad Fauzi">dr. Ahmad Fauzi (Dokter Umum)</option>
                <option value="Ns. Maria Fransiska, S.Kep">Ns. Maria Fransiska, S.Kep (Perawat Primer)</option>
                <option value="Bdn. Siti Rahma, S.Tr.Keb">Bdn. Siti Rahma, S.Tr.Keb (Bidan)</option>
                <option value="apt. Denny Kurniawan, S.Farm">apt. Denny Kurniawan, S.Farm (Apoteker)</option>
                <option value="Nurul Aini, S.Gz">Nurul Aini, S.Gz (Nutrisionis)</option>
              </datalist>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-700 mb-0.5">Peran / Profesi PPA *</label>
              <select
                value={selectedProf}
                onChange={e => setSelectedProf(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500"
              >
                <option value="Dokter Spesialis">Dokter Spesialis (DPJP)</option>
                <option value="Dokter Umum">Dokter Umum</option>
                <option value="Perawat">Perawat (Nurse)</option>
                <option value="Bidan">Bidan</option>
                <option value="Ahli Gizi">Ahli Gizi (Nutrisionis)</option>
                <option value="Apoteker">Apoteker (Farmasi)</option>
                <option value="Fisioterapis">Fisioterapis</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Unit / Bangsal Pelayanan</label>
              <input
                type="text"
                value={unitInput}
                onChange={e => setUnitInput(e.target.value)}
                placeholder="Poliklinik / Ruang Rawat..."
                className="w-full px-2.5 py-1 bg-white border border-slate-300 rounded text-xs font-medium text-slate-700"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Format Catatan</label>
              <select
                value={formatType}
                onChange={e => setFormatType(e.target.value as any)}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500"
              >
                <option value="SOAP">SOAP (Subjective, Objective, Assessment, Plan)</option>
                <option value="SBAR">SBAR (Situation, Background, Assessment, Recommendation)</option>
                <option value="ADIME">ADIME (Gizi / Nutrisi)</option>
              </select>
            </div>
          </div>

          {/* Column 3: Hasil Asesmen & Pemberian Pelayanan (Exact Grid Layout) */}
          <div className="col-span-12 md:col-span-7 p-3 space-y-3 bg-white">
            
            {/* TRIASE SPECIFIC HEADER BANNER (PURE SOAP FORM FOR IGD) */}
            {pemeriksaanSubMenu === 'Triace' && (
              <div className="bg-rose-50 border border-rose-200 rounded-xl p-2.5 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-extrabold text-rose-900">
                  <HeartPulse className="w-4 h-4 text-rose-600" />
                  <span>PEMERIKSAAN TRIASE IGD (FORMULIR SOAP & INSTRUKSI DISPOSISI)</span>
                </div>
                <span className="text-[10px] font-mono font-bold text-rose-700 bg-white px-2 py-0.5 rounded-full border border-rose-200">
                  SOAP Emergency
                </span>
              </div>
            )}

            {/* Vitals Sub-header Bar (Matching Screenshot 1) */}
            <div className="bg-slate-100/90 p-2 rounded-lg border border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
              
              {/* TD */}
              <div className="flex items-center gap-1">
                <span className="font-semibold text-slate-700 text-[11px]">Tekanan Darah</span>
                <input
                  type="text"
                  value={tdSys}
                  onChange={e => setTdSys(e.target.value)}
                  className="w-10 px-1 py-0.5 bg-white border border-slate-300 rounded text-center text-xs font-mono"
                  placeholder="120"
                />
                <span className="text-slate-400 font-bold">/</span>
                <input
                  type="text"
                  value={tdDia}
                  onChange={e => setTdDia(e.target.value)}
                  className="w-10 px-1 py-0.5 bg-white border border-slate-300 rounded text-center text-xs font-mono"
                  placeholder="80"
                />
              </div>

              {/* Heart Rate */}
              <div className="flex items-center gap-1">
                <span className="font-semibold text-slate-700 text-[11px]">Heart Rate</span>
                <input
                  type="text"
                  value={heartRate}
                  onChange={e => setHeartRate(e.target.value)}
                  className="w-12 px-1 py-0.5 bg-white border border-slate-300 rounded text-center text-xs font-mono"
                  placeholder="80"
                />
                <span className="text-slate-500 text-[11px]">Kali</span>
              </div>

              {/* Resp Rate */}
              <div className="flex items-center gap-1">
                <span className="font-semibold text-slate-700 text-[11px]">Resp Rate</span>
                <input
                  type="text"
                  value={respRate}
                  onChange={e => setRespRate(e.target.value)}
                  className="w-12 px-1 py-0.5 bg-white border border-slate-300 rounded text-center text-xs font-mono"
                  placeholder="20"
                />
                <span className="text-slate-500 text-[11px]">Kali</span>
              </div>

              {/* Temp */}
              <div className="flex items-center gap-1">
                <span className="font-semibold text-slate-700 text-[11px]">Temp</span>
                <input
                  type="text"
                  value={temp}
                  onChange={e => setTemp(e.target.value)}
                  className="w-12 px-1 py-0.5 bg-white border border-slate-300 rounded text-center text-xs font-mono"
                  placeholder="36.5"
                />
                <span className="text-slate-500 text-[11px]">°C</span>
              </div>

              {/* SpO2 */}
              <div className="flex items-center gap-1">
                <span className="font-semibold text-slate-700 text-[11px]">SpO2</span>
                <input
                  type="text"
                  value={spO2}
                  onChange={e => setSpO2(e.target.value)}
                  className="w-12 px-1 py-0.5 bg-white border border-slate-300 rounded text-center text-xs font-mono"
                  placeholder="98"
                />
                <span className="text-slate-500 text-[11px]">%</span>
              </div>
            </div>

            {/* S* Subjective */}
            <div className="flex gap-2 items-start">
              <span className="font-bold text-slate-800 text-xs w-4 mt-1">S*</span>
              <textarea
                value={subjective}
                onChange={e => setSubjective(e.target.value)}
                rows={2}
                placeholder={pemeriksaanSubMenu === 'Triace' ? "Anamnesis Triase / Keluhan Utama IGD..." : "Pasien mengeluh pusing dan nyeri dada ringan sejak tadi pagi..."}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs font-normal focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* O* Objective */}
            <div className="flex gap-2 items-start">
              <span className="font-bold text-slate-800 text-xs w-4 mt-1">O*</span>
              <textarea
                value={objective}
                onChange={e => setObjective(e.target.value)}
                rows={2}
                placeholder={pemeriksaanSubMenu === 'Triace' ? "Pemeriksaan Fisik Singkat & Status Lokalis Triase..." : "Kesadaran Compos Mentis, Keadaan Umum Tampak Sakit Sedang..."}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs font-normal focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* A* Assessment */}
            <div className="flex gap-2 items-start">
              <span className="font-bold text-slate-800 text-xs w-4 mt-1">A*</span>
              <textarea
                value={assessment}
                onChange={e => setAssessment(e.target.value)}
                rows={2}
                placeholder={pemeriksaanSubMenu === 'Triace' ? "Diagnosis Kerja Triase & Prioritas Penanganan..." : "Hipertensi Grade II + Cephalgia..."}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs font-normal focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* P* Plan / Planning Terapi & Edukasi */}
            <div className="flex gap-2 items-start bg-emerald-50/60 p-2 rounded-lg border border-emerald-200">
              <div className="flex flex-col items-center shrink-0">
                <span className="font-black text-emerald-900 bg-emerald-200 text-xs px-1.5 py-0.5 rounded shadow-2xs">P*</span>
                <span className="text-[9px] font-bold text-emerald-700 mt-0.5">Plan</span>
              </div>
              <div className="flex-1">
                <div className="text-[10px] font-bold text-emerald-900 mb-0.5 flex items-center justify-between">
                  <span>Rencana Penatalaksanaan / Planning (Terapi, Tindakan, Monitoring & Edukasi Pasien) *</span>
                  <span className="text-[9px] text-emerald-700">Wajib Terisi RME</span>
                </div>
                <textarea
                  value={plan}
                  onChange={e => setPlan(e.target.value)}
                  rows={2}
                  placeholder={pemeriksaanSubMenu === 'Triace' ? "Tindakan Resusitasi / Stabilisasi Awal IGD..." : "Rencana terapi medikamentosa (Infus NaCl 0.9% 20 tpm, Amlodipine 1x10mg), rencana pemeriksaan penunjang (Ro Thorax, Lab DL), serta edukasi tirah baring..."}
                  className="w-full px-2.5 py-1.5 bg-white border border-emerald-300 rounded text-xs font-semibold text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                />
              </div>
            </div>

            {/* SPIRITUAL & PSYCHOSOCIAL ASSESSMENT MODULE (ONLY IN ASSESMENT SUB-MENU) */}
            {pemeriksaanSubMenu === 'Assesment' && (
              <div className="p-3 bg-slate-50 border border-slate-300 rounded-xl space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <div className="flex items-center gap-1.5 text-xs font-extrabold text-blue-900">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    <span>PENILAIAN PSIKOSOSIAL & SPIRITUAL (SISTEM POIN & SKOR)</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold bg-blue-100 text-blue-900 px-2 py-0.5 rounded-full">
                    Standar STARKES Kemenkes
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                  {/* 1. Kesadaran */}
                  <div className="p-2 bg-white rounded-lg border border-slate-200 space-y-1">
                    <label className="block text-[11px] font-bold text-slate-700">1. Kesadaran Pasien</label>
                    <select
                      value={pointKesadaran}
                      onChange={e => setPointKesadaran(Number(e.target.value))}
                      className="w-full p-1 bg-slate-50 border border-slate-300 rounded text-xs font-bold text-slate-800"
                    >
                      <option value={3}>Kompos Mentis (3 Poin)</option>
                      <option value={2}>Apatis / Somnolen (2 Poin)</option>
                      <option value={1}>Sopor / Delirium / Berkabut (1 Poin)</option>
                      <option value={0}>Koma (0 Poin)</option>
                    </select>
                  </div>

                  {/* 2. Sikap / Tingkah Laku */}
                  <div className="p-2 bg-white rounded-lg border border-slate-200 space-y-1">
                    <label className="block text-[11px] font-bold text-slate-700">2. Sikap & Tingkah Laku</label>
                    <select
                      value={pointSikap}
                      onChange={e => setPointSikap(Number(e.target.value))}
                      className="w-full p-1 bg-slate-50 border border-slate-300 rounded text-xs font-bold text-slate-800"
                    >
                      <option value={3}>Kooperatif (3 Poin)</option>
                      <option value={2}>Kurang Kooperatif (2 Poin)</option>
                      <option value={1}>Tidak Kooperatif (1 Poin)</option>
                    </select>
                  </div>

                  {/* 3. Rawat Diri */}
                  <div className="p-2 bg-white rounded-lg border border-slate-200 space-y-1">
                    <label className="block text-[11px] font-bold text-slate-700">3. Kemampuan Rawat Diri</label>
                    <select
                      value={pointRawatDiri}
                      onChange={e => setPointRawatDiri(Number(e.target.value))}
                      className="w-full p-1 bg-slate-50 border border-slate-300 rounded text-xs font-bold text-slate-800"
                    >
                      <option value={3}>Baik & Mandiri (3 Poin)</option>
                      <option value={2}>Cukup / Bantuan Parsial (2 Poin)</option>
                      <option value={1}>Jelek / Ketergantungan Total (1 Poin)</option>
                    </select>
                  </div>

                  {/* 4. Orientasi */}
                  <div className="p-2 bg-white rounded-lg border border-slate-200 space-y-1">
                    <label className="block text-[11px] font-bold text-slate-700">4. Status Orientasi</label>
                    <select
                      value={pointOrientasi}
                      onChange={e => setPointOrientasi(Number(e.target.value))}
                      className="w-full p-1 bg-slate-50 border border-slate-300 rounded text-xs font-bold text-slate-800"
                    >
                      <option value={3}>Orientasi Baik (3 Poin)</option>
                      <option value={1}>Orientasi Terganggu (1 Poin)</option>
                    </select>
                  </div>

                  {/* 5. Afek */}
                  <div className="p-2 bg-white rounded-lg border border-slate-200 space-y-1">
                    <label className="block text-[11px] font-bold text-slate-700">5. Afek & Emosi</label>
                    <select
                      value={pointAfek}
                      onChange={e => setPointAfek(Number(e.target.value))}
                      className="w-full p-1 bg-slate-50 border border-slate-300 rounded text-xs font-bold text-slate-800"
                    >
                      <option value={3}>Baik & Serasi (3 Poin)</option>
                      <option value={2}>Datar / Sempit (2 Poin)</option>
                      <option value={1}>Tumpul / Inappropriate (1 Poin)</option>
                    </select>
                  </div>

                  {/* 6. Spiritual & Keagamaan */}
                  <div className="p-2 bg-white rounded-lg border border-slate-200 space-y-1">
                    <label className="block text-[11px] font-bold text-slate-700">6. Status Spiritual & Rohani</label>
                    <select
                      value={pointSpiritual}
                      onChange={e => setPointSpiritual(Number(e.target.value))}
                      className="w-full p-1 bg-slate-50 border border-slate-300 rounded text-xs font-bold text-slate-800"
                    >
                      <option value={3}>Ibadah Teratur & Pasrah/Optimis (3 Poin)</option>
                      <option value={2}>Perlu Bimbingan Ibadah & Pendampingan (2 Poin)</option>
                      <option value={1}>Distres Spiritual / Kendala Keyakinan (1 Poin)</option>
                    </select>
                  </div>
                </div>

                {/* HASIL AKHIR: TOTAL POIN & SKALA SKOR */}
                {(() => {
                  const details = getSpiritualScoreDetails(totalPointSpiritual);
                  return (
                    <div className="p-3 bg-blue-100/70 border border-blue-300 rounded-xl space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-blue-200 pb-1.5">
                        <div className="text-xs font-bold text-blue-900">
                          Total Poin Akumulasi: <span className="font-mono text-sm font-extrabold text-blue-700">{totalPointSpiritual} / 18 Poin</span>
                        </div>
                        <div className="px-2.5 py-1 bg-blue-700 text-white font-extrabold text-xs rounded-lg shadow-2xs">
                          {details.label}
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-blue-900 mb-1">Penjelasan / Alasan Skor Spiritual *</label>
                        <textarea
                          value={customAlasanSpiritual || details.defaultText}
                          onChange={e => setCustomAlasanSpiritual(e.target.value)}
                          rows={2}
                          className="w-full px-2.5 py-1.5 bg-white border border-blue-300 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* TRIASE DISPOSISI & INSTRUKSI PULANG (ONLY IN TRIASE SUB-MENU) */}
            {pemeriksaanSubMenu === 'Triace' && (
              <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl space-y-2.5">
                <div className="flex items-center justify-between border-b border-amber-200 pb-1.5">
                  <label className="text-xs font-extrabold text-amber-900 flex items-center gap-1.5">
                    <Stethoscope className="w-4 h-4 text-amber-700" /> INSTRUKSI PULANG & DISPOSISI TRIASE
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Keputusan Disposisi *</label>
                    <select
                      value={disposisiTriase}
                      onChange={e => setDisposisiTriase(e.target.value)}
                      className="w-full p-1.5 bg-white border border-amber-300 rounded-lg text-xs font-bold text-slate-800"
                    >
                      <option value="Rawat Jalan">Pulang Berobat Jalan (Rawat Jalan)</option>
                      <option value="Rawat Inap">Admit ke Rawat Inap (Ranap)</option>
                      <option value="Rujuk RS Lain">Rujuk ke Rumah Sakit Lain</option>
                      <option value="Observasi IGD">Observasi Lanjutan IGD (2-6 Jam)</option>
                      <option value="Pulang APS">Pulang Atas Permintaan Sendiri (APS)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Instruksi Pulang & Edukasi Pasien</label>
                    <textarea
                      value={instruksiPulangTriase}
                      onChange={e => setInstruksiPulangTriase(e.target.value)}
                      rows={2}
                      placeholder="Instruksi obat jalan, kontrol ulang, tanda bahaya yang harus kembali ke IGD..."
                      className="w-full px-2.5 py-1.5 bg-white border border-amber-300 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                {/* ELECTRONIC SIGNATURE FOR TRIASE */}
                <ElectronicSignatureCanvas
                  onSaveSignature={dataUrl => setSignatureTriaseUrl(dataUrl)}
                />
              </div>
            )}

            {/* Instruksi PPA */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-800">Instruksi PPA</label>
              <textarea
                value={instructionPPA}
                onChange={e => setInstructionPPA(e.target.value)}
                rows={1}
                placeholder="Instruksi khusus perawat/bidan: Monitoring TTV tiap 4 jam..."
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs font-normal focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Instruksi (Obat) - Manual Typing + Datalist Suggestions */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800 flex items-center justify-between">
                <span>Instruksi (Obat)</span>
                <span className="text-[10px] text-blue-600 font-normal">⌨️ Ketik manual atau pilih obat dari daftar</span>
              </label>
              <div className="flex flex-wrap items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-200">
                <input
                  type="text"
                  list="drug-suggestions"
                  value={drugName}
                  onChange={e => setDrugName(e.target.value)}
                  placeholder="Ketik nama obat (misal: Paracetamol 500mg)..."
                  className="flex-1 min-w-[200px] px-2.5 py-1 bg-white border border-slate-300 rounded text-xs font-semibold focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
                <datalist id="drug-suggestions">
                  {DRUG_MASTER_LIST.map((item, idx) => (
                    <option key={idx} value={item} />
                  ))}
                </datalist>

                <input
                  type="number"
                  value={drugQty}
                  onChange={e => setDrugQty(e.target.value)}
                  className="w-12 px-2 py-1 bg-white border border-slate-300 rounded text-center text-xs"
                  placeholder="1"
                />

                <input
                  type="text"
                  value={drugSigna}
                  onChange={e => setDrugSigna(e.target.value)}
                  className="w-48 px-2 py-1 bg-white border border-slate-300 rounded text-xs"
                  placeholder="3 x sehari 1 kapsul"
                />

                <button
                  type="button"
                  onClick={handleAddMedicine}
                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                >
                  <Check className="w-3.5 h-3.5" /> Tambah Obat
                </button>
              </div>

              {/* Added drugs list */}
              {medicines.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {medicines.map((m, idx) => (
                    <span
                      key={m.id || idx}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-md text-[11px] font-bold"
                    >
                      <span>{m.drugName} ({m.qty}) - {m.signa}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveMedicine(m.id)}
                        className="text-emerald-700 hover:text-rose-600 cursor-pointer"
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Implementasi */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-800">Implementasi</label>
              <textarea
                value={implementation}
                onChange={e => setImplementation(e.target.value)}
                rows={1}
                placeholder="Tindakan keperawatan / pemberian obat yang telah dilaksanakan..."
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs font-normal focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Nilai Kritis Penunjang */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-800">Nilai Kritis Penunjang</label>
              <textarea
                value={criticalValue}
                onChange={e => setCriticalValue(e.target.value)}
                rows={1}
                placeholder="Hasil lab/radiologi kritis jika ada (misal: Kalium 2.8 mEq/L)..."
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs font-normal focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Bottom Right Save Button (Exact like Screenshot 2) */}
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-4 h-4" /> Simpan CPPT
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* HISTORICAL CPPT RECORDS TABLE (Exact match with Image 1 RME format) */}
      <div className="space-y-2 pt-2">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-blue-600" /> Riwayat Catatan CPPT Terintegrasi ({patientCPPTList.length})
          </h3>
          <span className="text-[11px] text-slate-500 font-mono">Status: Terverifikasi Digital BSRE</span>
        </div>

        <div className="border border-slate-300 rounded-lg overflow-hidden shadow-2xs bg-white text-xs">
          {patientCPPTList.length > 0 ? (
            patientCPPTList.map(item => (
              <div key={item.id} className="grid grid-cols-12 border-b border-slate-300 last:border-b-0 divide-x divide-slate-300">
                {/* Col 1: Date & Time */}
                <div className="col-span-2 p-3 font-sans text-center flex flex-col justify-center items-center text-slate-700 bg-white">
                  <div className="font-medium text-slate-900 text-xs">{item.date}</div>
                  <div className="text-slate-600 text-xs mt-1 font-mono">{item.time}</div>
                </div>

                {/* Col 2: Role, Staff Name & Real Blue Ink Handwritten Signature */}
                <div className="col-span-3 p-3 flex flex-col justify-between space-y-2 bg-white">
                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                        item.profession?.toLowerCase().includes('dokter') || item.profession?.toLowerCase().includes('dpjp')
                          ? 'bg-blue-100 text-blue-800 border border-blue-300'
                          : item.profession?.toLowerCase().includes('perawat') || item.profession?.toLowerCase().includes('nurse')
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : item.profession?.toLowerCase().includes('bidan')
                          ? 'bg-purple-100 text-purple-800 border border-purple-300'
                          : 'bg-amber-100 text-amber-800 border border-amber-300'
                      }`}>
                        {item.profession || 'Dokter'}
                      </span>
                      {item.unit && (
                        <span className="text-[10px] text-slate-500 font-medium truncate">
                          {item.unit}
                        </span>
                      )}
                    </div>
                    <div className="font-extrabold text-slate-900 uppercase text-xs tracking-tight">{item.staffName || 'DOSEN RMIK UEU'}</div>
                  </div>

                  {/* Authentic Handwritten Blue Ink Signature Representation */}
                  <div className="py-1">
                    <div className="text-[9px] text-slate-400 font-sans italic mb-0.5">Tanda Tangan Digital / E-Sign:</div>
                    <div className="p-1 bg-slate-50 border border-slate-200 rounded relative overflow-hidden flex items-center justify-between">
                      <svg className="w-28 h-10 text-blue-800 shrink-0" viewBox="0 0 200 60" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M15 35 C 30 10, 45 50, 60 20 C 70 5, 80 40, 95 25 C 110 10, 100 50, 130 30 C 150 15, 170 35, 185 20" />
                        <path d="M40 40 Q 90 48, 160 38" strokeWidth="1.8" />
                        <circle cx="125" cy="18" r="2" fill="currentColor" />
                      </svg>
                      <div className="text-[9px] text-emerald-700 font-mono font-bold shrink-0 bg-emerald-50 px-1 py-0.5 border border-emerald-200 rounded">
                        E-SIGN ✓
                      </div>
                    </div>
                  </div>

                  {/* Delete action button */}
                  <div className="pt-1 flex items-center justify-between border-t border-slate-100">
                    <span className="text-[10px] text-slate-400 font-mono">RME Kemenkes</span>
                    <button
                      type="button"
                      onClick={() => {
                        Swal.fire({
                          title: 'Hapus Catatan CPPT?',
                          text: `Apakah Anda yakin ingin menghapus CPPT tanggal ${item.date}?`,
                          icon: 'warning',
                          showCancelButton: true,
                          confirmButtonColor: '#e11d48',
                          cancelButtonColor: '#64748b',
                          confirmButtonText: 'Ya, Hapus Data',
                          cancelButtonText: 'Batal'
                        }).then((res) => {
                          if (res.isConfirmed) {
                            setLocalDeletedIds(prev => [...prev, item.id]);
                            Swal.fire({ icon: 'success', title: 'Terhapus!', text: 'CPPT berhasil dihapus.', timer: 1200, showConfirmButton: false });
                          }
                        });
                      }}
                      className="text-[11px] text-rose-600 hover:text-rose-800 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" /> Hapus
                    </button>
                  </div>
                </div>

                {/* Col 3: Inner SOAP and Vitals Table (Exact match Image 1) */}
                <div className="col-span-7 divide-y divide-slate-300 bg-white">
                  {/* Vitals Signs Grid */}
                  <div className="grid grid-cols-5 divide-x divide-slate-300 text-center border-b border-slate-300">
                    <div className="bg-slate-200/90 py-1 px-1 font-normal text-slate-800 text-[11px]">Tekanan Darah</div>
                    <div className="bg-slate-200/90 py-1 px-1 font-normal text-slate-800 text-[11px]">Heart Rate</div>
                    <div className="bg-slate-200/90 py-1 px-1 font-normal text-slate-800 text-[11px]">Resp Rate</div>
                    <div className="bg-slate-200/90 py-1 px-1 font-normal text-slate-800 text-[11px]">Temp</div>
                    <div className="bg-slate-200/90 py-1 px-1 font-normal text-slate-800 text-[11px]">SpO2</div>

                    <div className="py-1 px-1 font-medium text-slate-800 text-xs">
                      {item.vitalSigns ? `${item.vitalSigns.systolic} / ${item.vitalSigns.diastolic}` : '120 / 80'}
                    </div>
                    <div className="py-1 px-1 font-medium text-slate-800 text-xs">
                      {item.vitalSigns ? `${item.vitalSigns.heartRate} Kali` : '90 Kali'}
                    </div>
                    <div className="py-1 px-1 font-medium text-slate-800 text-xs">
                      {item.vitalSigns ? `${item.vitalSigns.respRate} Kali` : '22 Kali'}
                    </div>
                    <div className="py-1 px-1 font-medium text-slate-800 text-xs">
                      {item.vitalSigns ? `${item.vitalSigns.temp} °C` : '37 °C'}
                    </div>
                    <div className="py-1 px-1 font-medium text-slate-800 text-xs">
                      {item.vitalSigns ? `${item.vitalSigns.spo2} %` : '90 %'}
                    </div>
                  </div>

                  {/* Subjective (S) */}
                  <div className="grid grid-cols-12 divide-x divide-slate-300">
                    <div className="col-span-2 p-1.5 font-bold text-center text-slate-900 bg-slate-50/50">S</div>
                    <div className="col-span-10 p-1.5 font-normal text-slate-800">{item.subjective || 'pasien mengeluh sesak napas selama 3 hari'}</div>
                  </div>

                  {/* Objective (O) */}
                  <div className="grid grid-cols-12 divide-x divide-slate-300">
                    <div className="col-span-2 p-1.5 font-bold text-center text-slate-900 bg-slate-50/50">O</div>
                    <div className="col-span-10 p-1.5 font-normal text-slate-800">{item.objective || 'rh +/+ bilateral'}</div>
                  </div>

                  {/* Assessment (A) */}
                  <div className="grid grid-cols-12 divide-x divide-slate-300">
                    <div className="col-span-2 p-1.5 font-bold text-center text-slate-900 bg-slate-50/50">A</div>
                    <div className="col-span-10 p-1.5 font-normal text-slate-800">{item.assessment || 'pneumonia'}</div>
                  </div>

                  {/* Plan (P) - Highlighting clearly */}
                  <div className="grid grid-cols-12 divide-x divide-slate-300 bg-emerald-50/40">
                    <div className="col-span-2 p-1.5 font-extrabold text-center text-emerald-900 bg-emerald-100/70 flex flex-col justify-center items-center">
                      <span>P</span>
                      <span className="text-[9px] font-bold text-emerald-700">Plan</span>
                    </div>
                    <div className="col-span-10 p-1.5 font-medium text-slate-900 leading-relaxed">
                      {item.plan && item.plan !== '-' ? (
                        <div className="text-emerald-950 font-semibold">{item.plan}</div>
                      ) : (
                        <span className="text-slate-400 italic">Rencana penatalaksanaan dan instruksi follow up belum diisi</span>
                      )}
                    </div>
                  </div>

                  {/* Instruksi */}
                  <div className="grid grid-cols-12 divide-x divide-slate-300">
                    <div className="col-span-3 p-1.5 font-bold text-slate-900 bg-slate-50/50">Instruksi</div>
                    <div className="col-span-9 p-1.5 font-normal text-slate-800">{item.instructionPPA || 'Ro thorax'}</div>
                  </div>

                  {/* Instruksi Obat */}
                  <div className="grid grid-cols-12 divide-x divide-slate-300">
                    <div className="col-span-3 p-1.5 font-bold text-slate-900 bg-slate-50/50">Instruksi Obat</div>
                    <div className="col-span-9 p-1.5 font-normal text-slate-800 italic">
                      {item.medicines && item.medicines.length > 0 ? (
                        <div className="not-italic flex flex-wrap gap-1">
                          {item.medicines.map((m, idx) => (
                            <span key={idx} className="font-semibold text-slate-800">
                              {m.drugName} ({m.qty}) {m.signa}{idx < item.medicines.length - 1 ? ',' : ''}
                            </span>
                          ))}
                        </div>
                      ) : (
                        'Tidak ada obat'
                      )}
                    </div>
                  </div>

                  {/* Implementasi */}
                  <div className="grid grid-cols-12 divide-x divide-slate-300">
                    <div className="col-span-3 p-1.5 font-bold text-slate-900 bg-slate-50/50">Implementasi</div>
                    <div className="col-span-9 p-1.5 font-normal text-slate-800">{item.implementation || ''}</div>
                  </div>

                  {/* Nilai Kritis Penunjang */}
                  <div className="grid grid-cols-12 divide-x divide-slate-300">
                    <div className="col-span-3 p-1.5 font-bold text-slate-900 bg-slate-50/50">Nilai Kritis Penunjang</div>
                    <div className="col-span-9 p-1.5 font-normal text-slate-800">{item.criticalValue || ''}</div>
                  </div>

                  {/* Footer watermark matching Image 1 with full role & timestamp */}
                  <div className="p-2 bg-slate-50/90 text-right italic text-[11px] text-slate-700 font-sans flex items-center justify-between border-t border-slate-200">
                    <span className="font-semibold text-blue-900 not-italic">
                      Profesi: <span className="font-bold">{item.profession || 'Dokter'}</span>
                    </span>
                    <span>
                      Ditambahkan oleh <strong className="text-slate-900 not-italic">{item.staffName || 'DOSEN RMIK UEU'}</strong> pada {item.date} {item.time} WIB
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-slate-500 text-xs">
              Belum ada catatan CPPT tersimpan untuk pasien ini.
            </div>
          )}
        </div>
      </div>
    </div>
  )}

      {/* FULL-VIEW PENGKAJIAN KEPERAWATAN INDIVIDU MODAL */}
      <AsuhanKeperawatanIgdModal
        isOpen={isPengkajianModalOpen}
        onClose={() => setIsPengkajianModalOpen(false)}
        patient={activePatient}
        registration={activeReg}
        nurse={user}
      />
    </div>
  );
};
