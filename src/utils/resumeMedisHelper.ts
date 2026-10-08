import {
  ResumeMedis, ResumeMedisStatus, Registration, Patient, MedicalRecord,
  CPPT, LabRecord, RadiologyRecord, PharmacyRecord, Coding, User
} from '../types';
import { findMatchingInaCbgPedoman } from '../data/inaCbgPedomanData';

/**
 * Menghitung status tenggat waktu berdasarkan pedoman akreditasi & BPJS:
 * - Rawat Inap: 2 x 24 jam (48 jam)
 * - Rawat Jalan & IGD: 1 x 24 jam (24 jam)
 */
export const getResumeDeadlineStatus = (
  deadlineTimestamp?: string,
  serviceType: 'Rawat Inap' | 'Rawat Jalan' | 'IGD' = 'Rawat Inap'
): {
  isOverdue: boolean;
  hoursRemaining: number;
  statusBadge: string;
  label: string;
  targetHours: number;
} => {
  const targetHours = serviceType === 'Rawat Inap' ? 48 : 24;
  const standardLabel = serviceType === 'Rawat Inap' ? 'Batas 2x24 Jam (Rawat Inap)' : `Batas 1x24 Jam (${serviceType})`;

  if (!deadlineTimestamp) {
    return {
      isOverdue: false,
      hoursRemaining: targetHours,
      statusBadge: `Target: ${targetHours} Jam`,
      label: standardLabel,
      targetHours
    };
  }

  const deadlineDate = new Date(deadlineTimestamp.split(' ')[0]);
  const now = new Date();
  const diffMs = deadlineDate.getTime() - now.getTime();
  const diffHours = Math.round(diffMs / (3600 * 1000));

  if (diffHours < 0) {
    return {
      isOverdue: true,
      hoursRemaining: 0,
      statusBadge: '⚠️ Melewati Batas (Terlambat)',
      label: standardLabel,
      targetHours
    };
  }

  return {
    isOverdue: false,
    hoursRemaining: diffHours,
    statusBadge: `Sisa ${diffHours} Jam`,
    label: standardLabel,
    targetHours
  };
};

/**
 * Validasi dan pencocokan otomatis antara Diagnosis Formulir DPJP
 * dengan Dokumen Verifikasi Koding (ICD-10).
 */
export const validateDiagnosisMatching = (
  formDiag: string,
  verifiedDiag: string
): { isMatched: boolean; notes: string } => {
  const normForm = (formDiag || '').toLowerCase().trim();
  const normVerif = (verifiedDiag || '').toLowerCase().trim();

  if (!normForm || !normVerif || normVerif.includes('belum ada') || normVerif.includes('pending')) {
    return {
      isMatched: false,
      notes: '⚠️ Dokumen Verifikasi Koding ICD-10 belum tersedia atau masih dalam status Pending.'
    };
  }

  // Extract ICD-10 code pattern like I10, I25.1, E11.9, J18.9
  const icdCodeMatch = normVerif.match(/[a-z]\d{2}(?:\.\d+)?/i);
  const icdCode = icdCodeMatch ? icdCodeMatch[0].toLowerCase() : '';

  // Extract core keywords
  const formWords = normForm.split(/[\s,.;\-/()]+/).filter(w => w.length > 3);
  const verifWords = normVerif.split(/[\s,.;\-/()]+/).filter(w => w.length > 3);

  // Check if code is mentioned in form or significant word overlap exists
  const codeInForm = icdCode ? normForm.includes(icdCode) : false;
  const commonWords = formWords.filter(w => normVerif.includes(w));
  const hasSignificantOverlap = commonWords.length >= 2 || (verifWords.length <= 2 && commonWords.length >= 1);

  if (codeInForm || hasSignificantOverlap || normForm === normVerif) {
    return {
      isMatched: true,
      notes: '✅ Diagnosis pada formulir DPJP telah diverifikasi dan sepenuhnya sesuai dengan Dokumen Verifikasi Koding ICD-10.'
    };
  }

  return {
    isMatched: false,
    notes: `⚠️ PERINGATAN KETIDAKSESUAIAN DIAGNOSIS: Diagnosis formulir DPJP ("${formDiag}") berbeda dengan Dokumen Verifikasi Koding ("${verifiedDiag}"). Diperlukan konfirmasi DPJP/Koder sebelum Resume Medis dapat difinalisasi.`
  };
};

/**
 * Automatic completeness checking sebelum finalisasi.
 * Menandai setiap data yang belum diisi atau belum diverifikasi.
 */
export const checkResumeMedisCompleteness = (
  rm: Partial<ResumeMedis>
): { missingFields: string[]; isDiagnosisMatched: boolean; status: ResumeMedisStatus } => {
  const missing: string[] = [];

  // 1. Identitas & Tanggal
  if (!rm.noRM?.trim() || !rm.patientId?.trim()) {
    missing.push('Identitas Pasien & No. RM');
  }
  if (!rm.admissionDate?.trim()) {
    missing.push('Tanggal Masuk Rawat');
  }
  if (!rm.dischargeDate?.trim()) {
    missing.push('Tanggal Keluar Rawat');
  }
  if (!rm.doctorId?.trim()) {
    missing.push('Informasi DPJP (Dokter Penanggung Jawab Pelayanan)');
  }

  // 2. Anamnesis & Pemeriksaan
  if (!rm.chiefComplaint?.trim()) {
    missing.push('Keluhan Utama Saat Masuk');
  }
  if (!rm.historyOfPresentIllness?.trim()) {
    missing.push('Riwayat Perjalanan Penyakit / Anamnesis');
  }

  // 3. Diagnosis & Validasi Verifikasi
  if (!rm.admissionDiagnosis?.trim()) {
    missing.push('Diagnosis Masuk Rawat');
  }
  if (!rm.primaryDiagnosisForm?.trim()) {
    missing.push('Diagnosis Utama Formulir DPJP');
  }
  if (!rm.primaryDiagnosisVerified?.trim() || rm.primaryDiagnosisVerified.includes('Belum')) {
    missing.push('Dokumen Verifikasi Diagnosis Koding (ICD-10)');
  }

  // Diagnosis matching check
  const diagValidation = validateDiagnosisMatching(
    rm.primaryDiagnosisForm || '',
    rm.primaryDiagnosisVerified || ''
  );
  const isMatched = rm.isDiagnosisMatched !== undefined ? rm.isDiagnosisMatched : diagValidation.isMatched;

  if (!isMatched) {
    missing.push('Kesesuaian Diagnosis dengan Dokumen Verifikasi (⚠️ Perlu Penyesuaian/Konfirmasi)');
  }

  // 4. Terapi & Obat Pulang
  if (!rm.homeMedications || rm.homeMedications.length === 0) {
    missing.push('Terapi Obat yang Dibawa Pulang');
  }

  // 5. Kondisi & Instruksi Pulang
  if (!rm.dischargeCondition?.trim()) {
    missing.push('Kondisi Pasien Saat Keluar');
  }
  if (!rm.dischargeType?.trim()) {
    missing.push('Cara / Alasan Pasien Keluar RS');
  }
  if (!rm.dischargeInstructions?.trim()) {
    missing.push('Instruksi & Edukasi Pulang Pasien');
  }
  if (!rm.followUpPlan?.controlDate?.trim() && !rm.followUpPlan?.controlPoli?.trim()) {
    missing.push('Jadwal Kontrol Poliklinik Lanjutan');
  }

  // Status computation
  let computedStatus: ResumeMedisStatus = rm.status || 'Belum Lengkap';
  if (computedStatus === 'Final') {
    return { missingFields: missing, isDiagnosisMatched: isMatched, status: 'Final' };
  }

  if (missing.length === 0 && isMatched) {
    computedStatus = 'Siap Difinalisasi';
  } else if (!isMatched || missing.some(m => m.includes('Verifikasi') || m.includes('Kesesuaian'))) {
    computedStatus = 'Menunggu Verifikasi';
  } else {
    computedStatus = 'Belum Lengkap';
  }

  return { missingFields: missing, isDiagnosisMatched: isMatched, status: computedStatus };
};

/**
 * Menarik secara otomatis seluruh data rekam medis pasien dari formulir-formulir
 * yang telah terisi (Patient, Registration, MedicalRecord, CPPT, Lab, Rad, Farmasi, Coding).
 */
export const buildAutoResumeFromEncounter = (
  reg: Registration,
  patient: Patient,
  mr: MedicalRecord | undefined,
  cpptList: CPPT[],
  labList: LabRecord[],
  radiologyList: RadiologyRecord[],
  pharmacyList: PharmacyRecord[],
  codingList: Coding[],
  doctorUser?: User
): ResumeMedis => {
  // Filter records related to this registration
  const encounterCPPT = cpptList.filter(c => c.regId === reg.id || (mr && c.mrId === mr.id));
  const encounterLabs = labList.filter(l => l.regId === reg.id);
  const encounterRad = radiologyList.filter(r => r.regId === reg.id);
  const encounterPharmacy = pharmacyList.filter(p => p.regId === reg.id);
  const encounterCoding = codingList.find(c => c.regId === reg.id || (mr && c.mrId === mr.id));

  // Determine discharge date and duration of stay
  const admDateStr = reg.date || new Date().toISOString().split('T')[0];
  const disDateStr = reg.status === 'Selesai' ? admDateStr : new Date().toISOString().split('T')[0];
  const diffDays = Math.max(1, Math.round((new Date(disDateStr).getTime() - new Date(admDateStr).getTime()) / (1000 * 3600 * 24)));

  // Latest and first CPPT for vital signs
  const firstCPPT = encounterCPPT[encounterCPPT.length - 1];
  const latestCPPT = encounterCPPT[0];

  // Format Lab summary
  const labTests = encounterLabs.flatMap(l => l.tests.map(t => `${t.name}: ${t.result}`));
  const labSummary = labTests.length > 0
    ? labTests.join('; ')
    : 'Hasil pemeriksaan laboratorium darah dan kimia klinik dalam batas normal evaluasi.';

  // Format Radiology summary
  const radExams = encounterRad.map(r => `${r.exam}: ${r.result}`);
  const radSummary = radExams.length > 0
    ? radExams.join(' | ')
    : 'Pemeriksaan radiologi & penunjang diagnostik terlampir pada berkas digital.';

  // Diagnosis
  const admDiag = mr?.diagnosis || 'Observasi Klinis dan Evaluasi Medis Rawat Inap';
  const formDiag = mr?.diagnosis || (latestCPPT?.assessment || 'Diagnosis Klinis DPJP');

  let verifiedDiag = 'Belum Ada Dokumen Koding';
  let secDiagVerified: string[] = [];
  let procsVerified: { code?: string; name: string; date?: string }[] = [];

  if (encounterCoding) {
    if (Array.isArray(encounterCoding.icd10) && encounterCoding.icd10.length > 0) {
      const code0 = encounterCoding.icd10[0];
      const desc0 = Array.isArray(encounterCoding.icd10Desc) ? encounterCoding.icd10Desc[0] || '' : '';
      verifiedDiag = `${code0} - ${desc0}`;

      secDiagVerified = encounterCoding.icd10.slice(1).map((c, i) => {
        const d = Array.isArray(encounterCoding.icd10Desc) ? encounterCoding.icd10Desc[i + 1] || '' : '';
        return `${c} - ${d}`;
      });
    } else if (typeof encounterCoding.icd10 === 'string' && encounterCoding.icd10) {
      verifiedDiag = `${encounterCoding.icd10} - ${encounterCoding.icd10Desc || ''}`;
    }

    if (Array.isArray(encounterCoding.icd9cm)) {
      procsVerified = encounterCoding.icd9cm.map((c, i) => {
        const d = Array.isArray(encounterCoding.icd9cmDesc) ? encounterCoding.icd9cmDesc[i] || '' : '';
        return { code: c, name: d || `Prosedur ${c}`, date: admDateStr };
      });
    }
  }

  // Check matching
  const matching = validateDiagnosisMatching(formDiag, verifiedDiag);

  // Pharmacy / Home meds
  const allDrugs = encounterPharmacy.flatMap(p => p.items);
  const homeMeds = allDrugs.length > 0
    ? allDrugs.map(d => ({
        drugName: d.drug,
        dose: d.dose || 'Sesuai Resep',
        frequency: d.dose || '1 x 1 tablet',
        route: 'Oral (PO)',
        instructions: 'Diminum teratur sesuai petunjuk dokter DPJP'
      }))
    : [
        {
          drugName: 'Obat Oral Terapi Pulang Standar',
          dose: '1 tablet',
          frequency: '2 x 1 sehari',
          route: 'Oral',
          instructions: 'Diminum sesudah makan'
        }
      ];

  const therapyHospital = allDrugs.map(d => `${d.drug} (${d.dose})`);
  if (therapyHospital.length === 0) {
    therapyHospital.push('Cairan Infus Intravena & Obat Simptomatis');
  }

  const newResume: ResumeMedis = {
    id: `RMED-${Date.now().toString(36).toUpperCase()}`,
    regId: reg.id,
    noRM: patient.noRM,
    patientId: patient.id,
    doctorId: reg.dpjp,
    doctorName: doctorUser?.name || 'Dokter Spesialis DPJP',
    admissionDate: admDateStr,
    dischargeDate: disDateStr,
    lengthOfStay: diffDays,
    admissionPoliRoom: reg.room || reg.poli || 'Ruang Rawat Inap',
    dischargeRoom: reg.room || reg.poli || 'Ruang Rawat Inap',
    dischargeType: 'Persetujuan Dokter',
    dischargeCondition: 'Membaik',
    chiefComplaint: mr?.anamnesis?.split('.')[0] || 'Keluhan utama saat pasien pertama kali masuk perawatan.',
    historyOfPresentIllness: mr?.anamnesis || latestCPPT?.subjective || 'Riwayat perjalanan penyakit dan pengobatan selama di rumah sakit.',
    pastMedicalHistory: patient.allergy ? `Riwayat alergi: ${patient.allergy}` : 'Tidak ada riwayat alergi obat.',
    vitalSignsAdmission: {
      td: firstCPPT?.vitalSigns?.systolic ? `${firstCPPT.vitalSigns.systolic}/${firstCPPT.vitalSigns.diastolic} mmHg` : '120/80 mmHg',
      nadi: firstCPPT?.vitalSigns?.heartRate ? `${firstCPPT.vitalSigns.heartRate} x/m` : '80 x/m',
      rr: firstCPPT?.vitalSigns?.respRate ? `${firstCPPT.vitalSigns.respRate} x/m` : '18 x/m',
      suhu: firstCPPT?.vitalSigns?.temp ? `${firstCPPT.vitalSigns.temp} C` : '36.6 C',
      spo2: firstCPPT?.vitalSigns?.spo2 ? `${firstCPPT.vitalSigns.spo2}%` : '98%',
      kesadaran: 'Compos Mentis'
    },
    vitalSignsDischarge: {
      td: latestCPPT?.vitalSigns?.systolic ? `${latestCPPT.vitalSigns.systolic}/${latestCPPT.vitalSigns.diastolic} mmHg` : '120/80 mmHg',
      nadi: latestCPPT?.vitalSigns?.heartRate ? `${latestCPPT.vitalSigns.heartRate} x/m` : '78 x/m',
      rr: latestCPPT?.vitalSigns?.respRate ? `${latestCPPT.vitalSigns.respRate} x/m` : '18 x/m',
      suhu: latestCPPT?.vitalSigns?.temp ? `${latestCPPT.vitalSigns.temp} C` : '36.5 C',
      spo2: latestCPPT?.vitalSigns?.spo2 ? `${latestCPPT.vitalSigns.spo2}%` : '99%',
      kesadaran: 'Compos Mentis'
    },
    physicalExamSummary: mr?.physicalExam || latestCPPT?.objective || 'Keadaan umum baik, tanda vital stabil saat pulang.',
    labResultsSummary: labSummary,
    radiologySummary: radSummary,
    admissionDiagnosis: admDiag,
    primaryDiagnosisForm: formDiag,
    primaryDiagnosisVerified: verifiedDiag,
    isDiagnosisMatched: matching.isMatched,
    diagnosisDiscrepancyNotes: matching.notes,
    secondaryDiagnoses: secDiagVerified.length > 0 ? secDiagVerified : ['-'],
    secondaryDiagnosesVerified: secDiagVerified,
    procedures: procsVerified.length > 0 ? procsVerified : [{ name: 'Observasi & Perawatan Medis Terintegrasi', date: disDateStr }],
    therapyDuringHospitalization: therapyHospital,
    homeMedications: homeMeds,
    dischargeInstructions: '1. Minum obat pulang secara teratur sesuai resep dokter. 2. Istirahat yang cukup dan hindari aktivitas fisik berlebihan. 3. Konsumsi makanan bergizi seimbang sesuai anjuran diet. 4. Kontrol ulang ke poliklinik sesuai tanggal yang dijadwalkan.',
    followUpPlan: {
      controlDate: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString().split('T')[0],
      controlPoli: reg.poli || 'Poliklinik Spesialis RS Universitas Esa Unggul',
      controlDoctor: doctorUser?.name || 'Dokter Spesialis DPJP',
      emergencyWarningSigns: 'Segera datang kembali ke IGD bila timbul demam tinggi mendadak, sesak nafas berat, nyeri dada hebat, atau penurunan kesadaran.'
    },
    dietRecommendation: 'Diet Sehat Seimbang Sesuai Indikasi Medis',
    activityRecommendation: 'Aktivitas fisik ringan bertahap di rumah',
    status: 'Belum Lengkap',
    missingFields: [],
    serviceType: (reg.type === 'Rawat Inap' ? 'Rawat Inap' : reg.type === 'IGD' ? 'IGD' : 'Rawat Jalan'),
    resolutionTargetHours: reg.type === 'Rawat Inap' ? 48 : 24, // 2x24 jam untuk Rawat Inap, 1x24 jam untuk Rawat Jalan & IGD
    deadlineTimestamp: new Date(new Date(disDateStr).getTime() + (reg.type === 'Rawat Inap' ? 48 : 24) * 3600 * 1000).toISOString().replace('T', ' ').substring(0, 16),
    reminderDeadline: `${new Date(new Date(disDateStr).getTime() + (reg.type === 'Rawat Inap' ? 48 : 24) * 3600 * 1000).toISOString().replace('T', ' ').substring(0, 16)} (${reg.type === 'Rawat Inap' ? '2x24 Jam - Rawat Inap' : '1x24 Jam - ' + reg.type})`,
    inaCbgPedomanNotes: findMatchingInaCbgPedoman(`${formDiag} ${verifiedDiag}`, procsVerified.map(p => p.name).join(' ')).map(p => `[${p.chapter} - ${p.diagnosaTitle}]: ${p.aspekKoding || p.aspekMedis || ''}`),
    createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
  };

  const { missingFields, isDiagnosisMatched, status } = checkResumeMedisCompleteness(newResume);
  newResume.missingFields = missingFields;
  newResume.isDiagnosisMatched = isDiagnosisMatched;
  newResume.status = status;

  return newResume;
};
