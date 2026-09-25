import { ExamScenario, ExamSubmission, Patient, Registration, MedicalRecord, CPPT } from '../types';
import { EXTENDED_ICD10, EXTENDED_ICD9CM } from '../data/icdDatabase';

export interface ExtractedScenarioData {
  patient: {
    name: string;
    noRM: string;
    nik: string;
    birthDate: string;
    gender: 'L' | 'P';
    age: number;
    address: string;
    insurance: string;
  };
  encounter: {
    regId: string;
    poli: string;
    dpjpName: string;
    date: string;
    subjective: string;
    objective: string;
    vitalSigns: {
      td: string;
      nadi: string;
      suhu: string;
      rr: string;
      spo2: string;
    };
    assessment: string;
    plan: string;
    penunjang?: {
      lab?: string;
      radiologi?: string;
      tindakan?: string;
    };
  };
  suggestedAnswerKey: {
    icd10Primary: string;
    icd10Secondary: string[];
    icd9Procedures: string[];
    diagnosaSDKI: string[];
    luaranSLKI: string;
    intervensiSIKI: string[];
  };
}

/**
 * Extract readable text from an uploaded file (PDF or Text).
 * Uses binary stream inspection for PDF text operators (BT...ET, Tj, TJ) and plain text decoder.
 */
export async function extractTextFromUploadedFile(file: File): Promise<string> {
  return new Promise((resolve) => {
    // If text file
    if (file.type.includes('text') || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        resolve((e.target?.result as string) || '');
      };
      reader.onerror = () => resolve('');
      reader.readAsText(file);
      return;
    }

    // For PDF files: Read as ArrayBuffer and parse text streams
    const reader = new FileReader();
    reader.onload = (e) => {
      const buffer = e.target?.result as ArrayBuffer;
      if (!buffer) {
        resolve('');
        return;
      }

      try {
        const bytes = new Uint8Array(buffer);
        // Convert to string safely in chunks
        let binaryStr = '';
        const chunkSize = 8192;
        for (let i = 0; i < bytes.length; i += chunkSize) {
          const chunk = bytes.subarray(i, Math.min(i + chunkSize, bytes.length));
          binaryStr += String.fromCharCode.apply(null, Array.from(chunk));
        }

        // Search for text in PDF objects / operators
        const extractedLines: string[] = [];

        // 1. Check for standard parentheses text strings like (Hello World) Tj
        const tjRegex = /\(([^)]+)\)\s*Tj/g;
        let match;
        while ((match = tjRegex.exec(binaryStr)) !== null) {
          const cleaned = match[1].replace(/\\([()\\])/g, '$1').trim();
          if (cleaned.length > 1) {
            extractedLines.push(cleaned);
          }
        }

        // 2. Check for TJ array blocks: [(Line 1) 20 (Line 2)] TJ
        const tjArrayRegex = /\[(.*?)\]\s*TJ/g;
        while ((match = tjArrayRegex.exec(binaryStr)) !== null) {
          const inner = match[1];
          const innerMatches = inner.match(/\(([^)]+)\)/g);
          if (innerMatches) {
            const phrase = innerMatches
              .map(m => m.slice(1, -1).replace(/\\([()\\])/g, '$1'))
              .join(' ')
              .trim();
            if (phrase.length > 1) {
              extractedLines.push(phrase);
            }
          }
        }

        // If direct stream parsing found meaningful text
        if (extractedLines.length > 5) {
          resolve(extractedLines.join('\n'));
          return;
        }

        // Fallback: search for ascii chunks containing keywords
        const cleanAscii = binaryStr.replace(/[^\x20-\x7E\r\n\t]/g, ' ');
        const lines = cleanAscii
          .split(/\r?\n/)
          .map(l => l.trim())
          .filter(l => l.length > 15 && /[a-zA-Z]{3,}/.test(l));

        if (lines.length > 5) {
          resolve(lines.slice(0, 100).join('\n'));
          return;
        }

        // If unable to extract meaningful plain text from encrypted/image-only PDF:
        // Provide clear formatted notification with template
        resolve(`[PDF EXTRACTED METADATA]
Nama File: ${file.name}
Ukuran: ${(file.size / 1024).toFixed(1)} KB
Dokumen PDF berhasil dimuat ke dalam penampil berkas SIMRS.
Silakan gunakan teks skenario bawaan atau sesuaikan data pada formulir di bawah.`);
      } catch (err) {
        console.error('PDF extraction error:', err);
        resolve(`Gagal membaca stream PDF: ${file.name}`);
      }
    };
    reader.onerror = () => resolve('');
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Parses raw text of a medical scenario and extracts patient identity, SOAP, and suggested codes.
 */
export function parseScenarioText(rawText: string): ExtractedScenarioData {
  const text = rawText || '';

  // Helpers
  const findMatch = (patterns: RegExp[], defaultVal = ''): string => {
    for (const pat of patterns) {
      const match = text.match(pat);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
    return defaultVal;
  };

  // 1. Patient Demographics
  const name = findMatch([
    /Nama\s*(?:Pasien)?\s*:\s*([^\n\r,]+)/i,
    /Pasien\s*:\s*([^\n\r,]+)/i
  ], 'Tn. Pasien Simulasi');

  const rawNoRM = findMatch([
    /(?:No\.?\s*RM|Nomor\s*Rekam\s*Medis)\s*:\s*([A-Z0-9-]+)/i,
    /RM\s*:\s*([A-Z0-9-]+)/i
  ], '000001');
  const cleanDigits = rawNoRM.replace(/\D/g, '');
  const noRM = cleanDigits.startsWith('2024') || cleanDigits.startsWith('24') || cleanDigits.length === 0
    ? '000001'
    : cleanDigits.padStart(6, '0');

  const nik = findMatch([
    /NIK\s*:\s*([0-9]{16})/i,
    /(?:Nomor\s*Induk\s*Kependudukan|KTP)\s*:\s*([0-9]{16})/i
  ], '317401' + Math.floor(1000000000 + Math.random() * 9000000000));

  const birthDate = findMatch([
    /(?:Tgl\s*Lahir|Tanggal\s*Lahir|DOB)\s*:\s*([0-9]{4}-[0-9]{2}-[0-9]{2})/i,
    /(?:Tgl\s*Lahir|Tanggal\s*Lahir|DOB)\s*:\s*([^\n\r,]+)/i
  ], '1990-05-15');

  const genderRaw = findMatch([
    /(?:Jenis\s*Kelamin|Gender|JK)\s*:\s*([^\n\r,]+)/i
  ], 'Laki-laki');
  const gender: 'L' | 'P' = /p|perempuan|wanita/i.test(genderRaw) ? 'P' : 'L';

  const ageMatch = text.match(/([0-9]{1,2})\s*(?:Tahun|Th|th)/i);
  const age = ageMatch ? parseInt(ageMatch[1], 10) : 35;

  const address = findMatch([
    /Alamat\s*:\s*([^\n\r]+)/i
  ], 'Jakarta Barat');

  const insurance = findMatch([
    /(?:Penjamin|Asuransi|Cara\s*Bayar)\s*:\s*([^\n\r]+)/i
  ], 'BPJS Kesehatan');

  // 2. Encounter & SOAP Data
  const regId = findMatch([
    /(?:No\.?\s*Registrasi|Reg\s*ID|Encounter\s*ID)\s*:\s*([A-Z0-9-]+)/i
  ], `REG-SIM-${Math.floor(100 + Math.random() * 900)}`);

  const poli = findMatch([
    /(?:Unit\s*Pelayanan|Poli|Ruang\s*Rawat)\s*:\s*([^\n\r]+)/i
  ], 'Instalasi Gawat Darurat (IGD)');

  const dpjpName = findMatch([
    /(?:Dokter\s*DPJP|DPJP|Dokter)\s*:\s*([^\n\r]+)/i
  ], 'dr. Sari Dewi, Sp.PD');

  const date = findMatch([
    /(?:Tanggal\s*Pelayanan|Tanggal\s*Pemeriksaan|Tanggal)\s*:\s*([0-9]{4}-[0-9]{2}-[0-9]{2})/i
  ], new Date().toISOString().split('T')[0]);

  // SOAP Extraction
  const subjective = findMatch([
    /(?:\[S\]|SUBJEKTIF|Subjektif|Keluhan\s*Utama)\s*:\s*([\s\S]*?)(?=\[O\]|OBJEKTIF|Objektif|Pemeriksaan\s*Fisik)/i,
    /(?:S\s*:)\s*([\s\S]*?)(?=O\s*:)/i
  ], 'Pasien mengeluhkan gejala klinis sesuai skenario berkas rekam medis.');

  const objective = findMatch([
    /(?:\[O\]|OBJEKTIF|Objektif|Pemeriksaan\s*Fisik)\s*:\s*([\s\S]*?)(?=\[A\]|ASESMEN|Asesmen|Diagnosis)/i,
    /(?:O\s*:)\s*([\s\S]*?)(?=A\s*:)/i
  ], 'Tanda vital dan kondisi fisik umum stabil.');

  // Vital Signs
  const td = findMatch([/(?:TD|Tekanan\s*Darah)\s*:\s*([0-9/]+)/i], '120/80');
  const nadi = findMatch([/(?:HR|Nadi|Heart\s*Rate)\s*:\s*([0-9]+)/i], '84');
  const suhu = findMatch([/(?:Suhu|Temp|T)\s*:\s*([0-9.]+)/i], '36.8');
  const rr = findMatch([/(?:RR|Pernapasan|Respirasi)\s*:\s*([0-9]+)/i], '20');
  const spo2 = findMatch([/(?:SpO2|Saturasi)\s*:\s*([0-9]+)/i], '98');

  const assessment = findMatch([
    /(?:\[A\]|ASESMEN|Asesmen|Diagnosis\s*Kerja)\s*:\s*([\s\S]*?)(?=\[P\]|PLAN|Plan|Rencana)/i,
    /(?:A\s*:)\s*([\s\S]*?)(?=P\s*:)/i
  ], 'Diagnosis kerja sesuai temuan klinis pada dokumen kasus.');

  const plan = findMatch([
    /(?:\[P\]|PLAN|Plan|Rencana\s*Penatalaksanaan)\s*:\s*([\s\S]*?)(?=(?:III\.|TINDAKAN|HASIL|Dibuat\s*Oleh|$))/i,
    /(?:P\s*:)\s*([\s\S]*?)$/i
  ], 'Terapi medikamentosa dan observasi tanda vital berkala.');

  // Penunjang
  const lab = findMatch([
    /(?:Laboratorium|Hasil\s*Lab)\s*:\s*([\s\S]*?)(?=(?:Radiologi|Tindakan|\[A\]|\[P\]|$))/i
  ], '');

  const radiologi = findMatch([
    /(?:Radiologi|Pemeriksaan\s*Radiologi|EKG|USG|Rontgen)\s*:\s*([\s\S]*?)(?=(?:Laboratorium|Tindakan|\[A\]|\[P\]|$))/i
  ], '');

  const tindakan = findMatch([
    /(?:Tindakan|Tindakan\s*Medis|Prosedur)\s*:\s*([\s\S]*?)(?=(?:Edukasi|Catatan|$))/i
  ], '');

  // Auto-Suggest ICD-10 and ICD-9-CM based on text
  const fullTextLower = text.toLowerCase();
  const matchedIcd10 = EXTENDED_ICD10.filter(item => {
    return fullTextLower.includes(item.code.toLowerCase()) ||
      item.desc.toLowerCase().split(/[\s,/-]+/).filter(w => w.length > 4).some(w => fullTextLower.includes(w));
  }).map(i => i.code).slice(0, 3);

  const matchedIcd9 = EXTENDED_ICD9CM.filter(item => {
    return fullTextLower.includes(item.code.toLowerCase()) ||
      item.desc.toLowerCase().split(/[\s,/-]+/).filter(w => w.length > 4).some(w => fullTextLower.includes(w));
  }).map(i => i.code).slice(0, 3);

  return {
    patient: {
      name,
      noRM,
      nik,
      birthDate,
      gender,
      age,
      address,
      insurance
    },
    encounter: {
      regId,
      poli,
      dpjpName,
      date,
      subjective: subjective.replace(/\s+/g, ' ').trim(),
      objective: objective.replace(/\s+/g, ' ').trim(),
      vitalSigns: { td, nadi, suhu, rr, spo2 },
      assessment: assessment.replace(/\s+/g, ' ').trim(),
      plan: plan.replace(/\s+/g, ' ').trim(),
      penunjang: {
        lab: lab ? lab.replace(/\s+/g, ' ').trim() : undefined,
        radiologi: radiologi ? radiologi.replace(/\s+/g, ' ').trim() : undefined,
        tindakan: tindakan ? tindakan.replace(/\s+/g, ' ').trim() : undefined
      }
    },
    suggestedAnswerKey: {
      icd10Primary: matchedIcd10[0] || 'I10',
      icd10Secondary: matchedIcd10.slice(1),
      icd9Procedures: matchedIcd9,
      diagnosaSDKI: fullTextLower.includes('hipovolemia') || fullTextLower.includes('cairan') ? ['D.0023: Hipovolemia'] : ['D.0077: Nyeri Akut'],
      luaranSLKI: 'L.08066: Tingkat Nyeri Menurun',
      intervensiSIKI: ['I.08238: Manajemen Nyeri', 'I.02084: Pemantauan Tanda Vital']
    }
  };
}

/**
 * Creates/Syncs simulation patient records in the SIMRS state.
 */
export function buildSimulationRecords(scenario: ExamScenario): {
  patient: Patient;
  registration: Registration;
  medicalRecord: MedicalRecord;
  cppt: CPPT;
} {
  const p = scenario.extractedPatient;
  const enc = scenario.extractedEncounter;

  const patientId = `P_${p.noRM.replace(/[^a-zA-Z0-9]/g, '')}`;
  const regId = enc.regId;
  const mrId = `MR_${regId}`;
  const cpptId = `CPPT_${regId}`;

  const patient: Patient = {
    id: patientId,
    noRM: p.noRM,
    name: p.name,
    nik: p.nik,
    dob: p.birthDate,
    gender: p.gender,
    address: p.address,
    phone: '0812' + Math.floor(10000000 + Math.random() * 90000000),
    insuranceType: p.insurance.includes('BPJS') ? 'BPJS' : (p.insurance.includes('Umum') ? 'Umum' : 'Asuransi'),
    noBPJS: '000' + Math.floor(1000000000 + Math.random() * 9000000000),
    bloodType: 'O',
    allergy: 'Tidak ada alergi'
  };

  const registration: Registration = {
    id: regId,
    patientId: patientId,
    date: enc.date,
    type: enc.poli.toLowerCase().includes('inap') ? 'Rawat Inap' : (enc.poli.toLowerCase().includes('igd') ? 'IGD' : 'Rawat Jalan'),
    poli: enc.poli,
    dpjp: 'U002', // dr. Sari Dewi
    status: 'Selesai',
    sepNo: '0112R001SIM' + Math.floor(100000 + Math.random() * 900000)
  };

  const medicalRecord: MedicalRecord = {
    id: mrId,
    regId: regId,
    noRM: p.noRM,
    doctorId: 'U002',
    date: enc.date,
    anamnesis: enc.subjective,
    physicalExam: enc.objective,
    diagnosis: enc.assessment,
    plan: enc.plan,
    diagnosisStatus: 'Verified'
  };

  const cppt: CPPT = {
    id: cpptId,
    regId: regId,
    mrId: mrId,
    date: enc.date,
    time: '09:00',
    doctorId: 'U002',
    staffName: enc.dpjpName || 'dr. DPJP',
    profession: 'Dokter Spesialis',
    unit: enc.poli,
    subjective: enc.subjective,
    objective: enc.objective,
    assessment: enc.assessment,
    plan: enc.plan,
    vitalSigns: {
      systolic: enc.vitalSigns.td.split('/')[0] || '120',
      diastolic: enc.vitalSigns.td.split('/')[1] || '80',
      heartRate: enc.vitalSigns.nadi || '80',
      temp: enc.vitalSigns.suhu || '36.8',
      respRate: enc.vitalSigns.rr || '20',
      spo2: enc.vitalSigns.spo2 || '98'
    },
    verified: true
  };

  return { patient, registration, medicalRecord, cppt };
}

/**
 * Evaluates a student's exam submission against the lecturer's answer key.
 */
export function evaluateExamSubmission(
  submission: ExamSubmission,
  scenario: ExamScenario
): ExamSubmission {
  const ans = submission.studentAnswer;
  const key = scenario.answerKey;

  if (scenario.category === 'RMIK') {
    // 1. Primary ICD-10 check (40 points)
    const normKeyPrim = (key.icd10Primary || '').trim().toUpperCase();
    const normAnsPrim = (ans.icd10Primary || '').trim().toUpperCase();
    const isPrimaryMatch = normKeyPrim === normAnsPrim;
    const isCategoryMatch = !isPrimaryMatch && normKeyPrim.slice(0, 3) === normAnsPrim.slice(0, 3);
    const primaryScore = isPrimaryMatch ? 40 : (isCategoryMatch ? 25 : 0);

    // 2. Secondary ICD-10 check (30 points)
    const keySec = (key.icd10Secondary || []).map(s => s.trim().toUpperCase());
    const ansSec = (ans.icd10Secondary || []).map(s => s.trim().toUpperCase());

    const secMatches = ansSec.filter(s => keySec.includes(s));
    const secMissing = keySec.filter(s => !ansSec.includes(s));
    const secExtra = ansSec.filter(s => !keySec.includes(s));

    const secondaryScore = keySec.length > 0
      ? Math.round((secMatches.length / keySec.length) * 30)
      : (ansSec.length === 0 ? 30 : 20);

    // 3. ICD-9-CM Procedures check (30 points)
    const keyProcs = (key.icd9Procedures || []).map(p => p.trim().toUpperCase());
    const ansProcs = (ans.icd9Procedures || []).map(p => p.trim().toUpperCase());

    const procMatches = ansProcs.filter(p => keyProcs.includes(p));
    const procMissing = keyProcs.filter(p => !ansProcs.includes(p));
    const procExtra = ansProcs.filter(p => !keyProcs.includes(p));

    const procScore = keyProcs.length > 0
      ? Math.round((procMatches.length / keyProcs.length) * 30)
      : (ansProcs.length === 0 ? 30 : 20);

    const totalScore = Math.min(100, Math.max(0, primaryScore + secondaryScore + procScore));

    let feedback = `Total Nilai: ${totalScore}/100. `;
    if (isPrimaryMatch) {
      feedback += 'Diagnosis Utama tepat sempurna. ';
    } else {
      feedback += `Diagnosis Utama (${ans.icd10Primary || '-'}) kurang tepat, kunci jawaban: ${key.icd10Primary}. `;
    }
    if (secMissing.length > 0) {
      feedback += `Diagnosis sekunder yang terlewat: ${secMissing.join(', ')}. `;
    }
    if (procMissing.length > 0) {
      feedback += `Prosedur ICD-9 yang terlewat: ${procMissing.join(', ')}. `;
    }

    return {
      ...submission,
      score: totalScore,
      scoreDetails: {
        icd10PrimaryMatch: isPrimaryMatch,
        icd10SecondaryMatches: secMatches,
        icd10SecondaryMissing: secMissing,
        icd10SecondaryExtra: secExtra,
        icd9Matches: procMatches,
        icd9Missing: procMissing,
        icd9Extra: procExtra,
        sdkiMatches: [],
        sdkiMissing: [],
        sikiMatches: [],
        sikiMissing: [],
        slkiScore: 0,
        feedback
      }
    };
  } else {
    // Keperawatan Evaluation
    const keySDKI = (key.diagnosaSDKI || []).map(s => s.trim().toUpperCase());
    const ansSDKI = (ans.diagnosaSDKI || []).map(s => s.trim().toUpperCase());

    const sdkiMatches = ansSDKI.filter(s => keySDKI.some(k => k.includes(s) || s.includes(k)));
    const sdkiMissing = keySDKI.filter(k => !ansSDKI.some(a => a.includes(k) || k.includes(a)));

    const sdkiScore = keySDKI.length > 0 ? Math.round((sdkiMatches.length / keySDKI.length) * 40) : 40;

    // SIKI Intervensi check (40 points)
    const keySIKI = (key.intervensiSIKI || []).map(s => s.trim().toUpperCase());
    const ansSIKI = (ans.intervensiSIKI || []).map(s => s.trim().toUpperCase());

    const sikiMatches = ansSIKI.filter(s => keySIKI.some(k => k.includes(s) || s.includes(k)));
    const sikiMissing = keySIKI.filter(k => !ansSIKI.some(a => a.includes(k) || k.includes(a)));

    const sikiScore = keySIKI.length > 0 ? Math.round((sikiMatches.length / keySIKI.length) * 40) : 40;

    // SLKI Luaran check (20 points)
    const slkiScore = ans.luaranSLKI.trim().length > 5 ? 20 : 0;

    const totalScore = Math.min(100, Math.max(0, sdkiScore + sikiScore + slkiScore));

    const feedback = `Total Nilai Asuhan Keperawatan: ${totalScore}/100. SDKI Tepat: ${sdkiMatches.length}/${keySDKI.length}, SIKI Tepat: ${sikiMatches.length}/${keySIKI.length}.`;

    return {
      ...submission,
      score: totalScore,
      scoreDetails: {
        icd10PrimaryMatch: false,
        icd10SecondaryMatches: [],
        icd10SecondaryMissing: [],
        icd10SecondaryExtra: [],
        icd9Matches: [],
        icd9Missing: [],
        icd9Extra: [],
        sdkiMatches,
        sdkiMissing,
        sikiMatches,
        sikiMissing,
        slkiScore,
        feedback
      }
    };
  }
}
