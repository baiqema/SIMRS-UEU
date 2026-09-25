import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User, Role, RoleId, Patient, Registration, GeneralConsent, MedicalRecord,
  CPPT, InformedConsent, Coding, Claim, Billing, PharmacyRecord, LabRecord,
  RadiologyRecord, Bed, AuditEntry, PraktikumModule, DokumenBerkas, AsuhanKeperawatan,
  ExamScenario, ExamSubmission
} from '../types';
import {
  INITIAL_USERS, INITIAL_ROLES, INITIAL_PATIENTS, INITIAL_REGISTRATIONS,
  INITIAL_GENERAL_CONSENTS, INITIAL_MEDICAL_RECORDS, INITIAL_CPPT,
  INITIAL_INFORMED_CONSENTS, INITIAL_CODING, INITIAL_CLAIMS, INITIAL_BILLING,
  INITIAL_PHARMACY, INITIAL_LAB, INITIAL_RADIOLOGY, INITIAL_BEDS,
  INITIAL_PRAKTIKUM, INITIAL_AUDIT_TRAIL, INITIAL_ICD10, INITIAL_ICD9CM,
  INITIAL_DOKUMEN_BERKAS
} from '../data/mockData';
import { EXTENDED_ICD10, EXTENDED_ICD9CM } from '../data/icdDatabase';
import { INITIAL_EXAM_SCENARIOS } from '../data/examScenariosData';
import { buildSimulationRecords } from '../utils/pdfExtractor';

interface AppContextType {
  user: User | null;
  users: User[];
  roles: Role[];
  patients: Patient[];
  registrations: Registration[];
  generalConsents: GeneralConsent[];
  medicalRecords: MedicalRecord[];
  cppt: CPPT[];
  informedConsents: InformedConsent[];
  coding: Coding[];
  claims: Claim[];
  billing: Billing[];
  pharmacy: PharmacyRecord[];
  lab: LabRecord[];
  radiology: RadiologyRecord[];
  beds: Bed[];
  auditTrail: AuditEntry[];
  praktikum: PraktikumModule[];
  dokumenBerkas: DokumenBerkas[];
  asuhanKeperawatan: AsuhanKeperawatan[];
  examScenarios: ExamScenario[];
  examSubmissions: ExamSubmission[];
  activePage: string;
  params?: any;
  sidebarCollapsed: boolean;
  
  toggleSidebar: () => void;
  login: (u: string, p: string, selectedRoleId?: RoleId) => { success: boolean; error?: string };
  logout: () => void;
  navigate: (page: string, params?: any) => void;
  audit: (action: AuditEntry['action'], entity: string, entityId: string, details?: { field_name?: string; old_value?: any; new_value?: any }) => void;
  
  generateNoRM: () => string;
  addPatient: (patient: Omit<Patient, 'id'>) => Patient;
  updatePatient: (patientId: string, updates: Partial<Patient>) => void;
  addRegistration: (regData: { patientId: string; type: Registration['type']; poli: string; dpjp: string; sepNo?: string; room?: string; bedId?: string; naikKelas?: { isNaik: boolean; dari?: string; ke?: string } }) => Registration;
  cancelRegistration: (regId: string, reason?: string) => void;
  updateRegistration: (regId: string, updates: Partial<Registration>) => void;
  updateBed: (bedId: string, updates: Partial<Bed>) => void;
  addGeneralConsent: (gc: Omit<GeneralConsent, 'id'>) => GeneralConsent;
  addMedicalRecord: (mrData: any) => MedicalRecord;
  updateMedicalRecord: (mrId: string, updates: Partial<MedicalRecord>) => void;
  addCPPT: (cpptData: {
    mrId: string;
    date: string;
    time: string;
    subjective: string;
    objective: string;
    assessment: string;
    plan: string;
    profession?: string;
    staffName?: string;
    unit?: string;
    verified?: boolean;
  }) => CPPT;
  addInformedConsent: (icData: { cpptId: string; action: string; risk: string; complication: string }) => InformedConsent;
  addCoding: (codData: {
    mrId: string;
    regId?: string;
    icd10Codes?: string[] | string;
    icd10Code?: string;
    icd10?: string[] | string;
    icd10Desc?: string[] | string;
    icd9cmCodes?: string[] | string;
    icd9cmCode?: string;
    icd9cm?: string[] | string;
    icd9cmDesc?: string[] | string;
    note?: string;
    date?: string;
    status?: 'Draft' | 'Locked';
    coderId?: string;
  }) => Coding;
  updateCoding: (codingId: string, updates: Partial<Coding>) => void;
  saveEncounterCoding: (data: {
    regId: string;
    mrId?: string;
    icd10: string[];
    icd10Desc?: string[];
    icd9cm?: string[];
    icd9cmDesc?: string[];
    note?: string;
    status?: 'Draft' | 'Locked';
    date?: string;
  }) => Coding;
  lockCoding: (codingId: string) => void;
  addClaim: (claimData: { codingId: string; groupCode: string; groupDesc: string; tariff: number }) => Claim;
  processPayment: (billingId: string) => void;
  addUser: (userData: { name: string; username: string; password?: string; roleId: any }) => { success: boolean; message?: string };
  updateUser: (id: string, updates: Partial<User>) => void;
  deleteUser: (id: string) => { success: boolean; message?: string };
  updateRolePermissions: (roleId: RoleId, newAccess: string[]) => void;
  addDokumenBerkas: (doc: Omit<DokumenBerkas, 'id'>) => DokumenBerkas;
  deleteDokumenBerkas: (id: string) => void;
  addAsuhanKeperawatan: (data: Omit<AsuhanKeperawatan, 'id'>) => AsuhanKeperawatan;
  updateAsuhanKeperawatan: (id: string, updates: Partial<AsuhanKeperawatan>) => void;
  saveExamScenario: (scenario: ExamScenario) => void;
  deleteExamScenario: (id: string) => void;
  saveExamSubmission: (sub: ExamSubmission) => void;
  deleteExamSubmission: (id: string) => void;
  injectSimulationPatient: (scenario: ExamScenario) => void;
  getPatient: (id: string) => Patient | undefined;
  getReg: (id: string) => Registration | undefined;
  getMR: (id: string) => MedicalRecord | undefined;
  getUser: (id: string) => User | undefined;
  getRole: (id: string) => Role | undefined;
  canEditPage: (pageId?: string) => boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const genId = (prefix: string) => prefix + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 5).toUpperCase();

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('simrs_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('simrs_users');
    if (saved) {
      try {
        const parsed: User[] = JSON.parse(saved);
        const existingIds = new Set(parsed.map(u => u.id));
        const missing = INITIAL_USERS.filter(u => !existingIds.has(u.id));
        return missing.length > 0 ? [...parsed, ...missing] : parsed;
      } catch (e) {
        return INITIAL_USERS;
      }
    }
    return INITIAL_USERS;
  });

  const [roles, setRoles] = useState<Role[]>(() => {
    const saved = localStorage.getItem('simrs_roles');
    return saved ? JSON.parse(saved) : INITIAL_ROLES;
  });

  const [patients, setPatients] = useState<Patient[]>(() => {
    const sanitizePatientList = (list: Patient[]): Patient[] => {
      const mapped = list.map((p, idx) => {
        const raw = p.noRM || '';
        const digits = raw.replace(/\D/g, '');
        if (!digits || digits.startsWith('2024') || digits.startsWith('24') || digits.startsWith('9988') || raw.includes('RM-')) {
          return { ...p, noRM: String(idx + 1).padStart(6, '0') };
        }
        return { ...p, noRM: digits.padStart(6, '0') };
      });

      // Always sort ascending by noRM so 000001 is at the very top
      return mapped.sort((a, b) => {
        const nA = parseInt(a.noRM.replace(/\D/g, '') || '0', 10);
        const nB = parseInt(b.noRM.replace(/\D/g, '') || '0', 10);
        return nA - nB;
      });
    };

    const saved = localStorage.getItem('simrs_patients');
    if (saved) {
      try {
        const parsed: Patient[] = JSON.parse(saved);
        if (parsed.length > 0) {
          const sanitized = sanitizePatientList(parsed);
          localStorage.setItem('simrs_patients', JSON.stringify(sanitized));
          return sanitized;
        }
      } catch (e) {
        return sanitizePatientList(INITIAL_PATIENTS);
      }
    }
    return sanitizePatientList(INITIAL_PATIENTS);
  });

  const [registrations, setRegistrations] = useState<Registration[]>(() => {
    const saved = localStorage.getItem('simrs_registrations');
    return saved ? JSON.parse(saved) : INITIAL_REGISTRATIONS;
  });

  const [generalConsents, setGeneralConsents] = useState<GeneralConsent[]>(() => {
    const saved = localStorage.getItem('simrs_generalConsents');
    return saved ? JSON.parse(saved) : INITIAL_GENERAL_CONSENTS;
  });

  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>(() => {
    const saved = localStorage.getItem('simrs_medicalRecords');
    const records = saved ? (() => {
      try { return JSON.parse(saved); } catch { return INITIAL_MEDICAL_RECORDS; }
    })() : INITIAL_MEDICAL_RECORDS;

    const sanitized = records.map((m: MedicalRecord, idx: number) => {
      const rawRM = m.noRM || '';
      const digits = rawRM.replace(/\D/g, '');
      if (!digits || rawRM.includes('2024') || digits.startsWith('2024') || digits.startsWith('24') || digits.startsWith('9988') || rawRM.includes('RM-')) {
        return { ...m, noRM: String(idx + 1).padStart(6, '0') };
      }
      return { ...m, noRM: digits.padStart(6, '0') };
    }).sort((a: MedicalRecord, b: MedicalRecord) => {
      const nA = parseInt(a.noRM.replace(/\D/g, '') || '0', 10);
      const nB = parseInt(b.noRM.replace(/\D/g, '') || '0', 10);
      return nA - nB;
    });

    localStorage.setItem('simrs_medicalRecords', JSON.stringify(sanitized));
    return sanitized;
  });

  const [cppt, setCppt] = useState<CPPT[]>(() => {
    const saved = localStorage.getItem('simrs_cppt');
    return saved ? JSON.parse(saved) : INITIAL_CPPT;
  });

  const [informedConsents, setInformedConsents] = useState<InformedConsent[]>(() => {
    const saved = localStorage.getItem('simrs_informedConsents');
    return saved ? JSON.parse(saved) : INITIAL_INFORMED_CONSENTS;
  });

  const [coding, setCoding] = useState<Coding[]>(() => {
    const saved = localStorage.getItem('simrs_coding');
    return saved ? JSON.parse(saved) : INITIAL_CODING;
  });

  const [claims, setClaims] = useState<Claim[]>(() => {
    const saved = localStorage.getItem('simrs_claims');
    return saved ? JSON.parse(saved) : INITIAL_CLAIMS;
  });

  const [billing, setBilling] = useState<Billing[]>(() => {
    const saved = localStorage.getItem('simrs_billing');
    return saved ? JSON.parse(saved) : INITIAL_BILLING;
  });

  const [pharmacy] = useState<PharmacyRecord[]>(INITIAL_PHARMACY);
  const [lab] = useState<LabRecord[]>(INITIAL_LAB);
  const [radiology] = useState<RadiologyRecord[]>(INITIAL_RADIOLOGY);
  const [beds, setBeds] = useState<Bed[]>(() => {
    const saved = localStorage.getItem('simrs_beds');
    return saved ? JSON.parse(saved) : INITIAL_BEDS;
  });

  const [auditTrail, setAuditTrail] = useState<AuditEntry[]>(() => {
    const saved = localStorage.getItem('simrs_auditTrail');
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_TRAIL;
  });

  const [dokumenBerkas, setDokumenBerkas] = useState<DokumenBerkas[]>(() => {
    const saved = localStorage.getItem('simrs_dokumenBerkas');
    return saved ? JSON.parse(saved) : INITIAL_DOKUMEN_BERKAS;
  });

  const [asuhanKeperawatan, setAsuhanKeperawatan] = useState<AsuhanKeperawatan[]>(() => {
    const saved = localStorage.getItem('simrs_asuhanKeperawatan');
    return saved ? JSON.parse(saved) : [];
  });

  const [examScenarios, setExamScenarios] = useState<ExamScenario[]>(() => {
    const sanitizeScenarios = (scens: ExamScenario[]): ExamScenario[] => {
      // First sort scenarios by extracted noRM or id ascending
      const sorted = [...scens].sort((a, b) => {
        const numA = parseInt((a.extractedPatient?.noRM || a.id || '').replace(/\D/g, '') || '0', 10);
        const numB = parseInt((b.extractedPatient?.noRM || b.id || '').replace(/\D/g, '') || '0', 10);
        return numA - numB;
      });

      return sorted.map((s, idx) => {
        const targetRM = String(idx + 1).padStart(6, '0');
        const oldRM = s.extractedPatient?.noRM || '';
        let newContent = s.pdfContentText || '';
        if (oldRM) {
          newContent = newContent.replaceAll(oldRM, targetRM);
        }
        newContent = newContent
          .replaceAll(/RM-9988\d\d/g, targetRM)
          .replaceAll(/RM-99\d\d\d\d/g, targetRM)
          .replaceAll(/Nomor Rekam Medis \(RM\):\s*(?:RM-)?\d+/g, `Nomor Rekam Medis (RM): ${targetRM}`);

        return {
          ...s,
          pdfContentText: newContent,
          extractedPatient: {
            ...s.extractedPatient,
            noRM: targetRM
          }
        };
      }).sort((a, b) => {
        const numA = parseInt(a.extractedPatient.noRM.replace(/\D/g, '') || '0', 10);
        const numB = parseInt(b.extractedPatient.noRM.replace(/\D/g, '') || '0', 10);
        return numA - numB;
      });
    };

    const saved = localStorage.getItem('simrs_exam_scenarios');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const sanitized = sanitizeScenarios(parsed);
          localStorage.setItem('simrs_exam_scenarios', JSON.stringify(sanitized));
          return sanitized;
        }
      } catch (e) {
        // Fallback
      }
    }
    const initSanitized = sanitizeScenarios(INITIAL_EXAM_SCENARIOS);
    localStorage.setItem('simrs_exam_scenarios', JSON.stringify(initSanitized));
    return initSanitized;
  });

  const [examSubmissions, setExamSubmissions] = useState<ExamSubmission[]>(() => {
    const saved = localStorage.getItem('simrs_exam_submissions');
    return saved ? JSON.parse(saved) : [];
  });

  const [activePage, setActivePage] = useState<string>('dashboard');
  const [params, setParams] = useState<any>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);

  // Persistence effects
  useEffect(() => { localStorage.setItem('simrs_roles', JSON.stringify(roles)); }, [roles]);
  useEffect(() => { localStorage.setItem('simrs_users', JSON.stringify(users)); }, [users]);
  useEffect(() => { localStorage.setItem('simrs_patients', JSON.stringify(patients)); }, [patients]);
  useEffect(() => { localStorage.setItem('simrs_registrations', JSON.stringify(registrations)); }, [registrations]);
  useEffect(() => { localStorage.setItem('simrs_generalConsents', JSON.stringify(generalConsents)); }, [generalConsents]);
  useEffect(() => { localStorage.setItem('simrs_medicalRecords', JSON.stringify(medicalRecords)); }, [medicalRecords]);
  useEffect(() => { localStorage.setItem('simrs_cppt', JSON.stringify(cppt)); }, [cppt]);
  useEffect(() => { localStorage.setItem('simrs_informedConsents', JSON.stringify(informedConsents)); }, [informedConsents]);
  useEffect(() => { localStorage.setItem('simrs_coding', JSON.stringify(coding)); }, [coding]);
  useEffect(() => { localStorage.setItem('simrs_claims', JSON.stringify(claims)); }, [claims]);
  useEffect(() => { localStorage.setItem('simrs_billing', JSON.stringify(billing)); }, [billing]);
  useEffect(() => { localStorage.setItem('simrs_beds', JSON.stringify(beds)); }, [beds]);
  useEffect(() => { localStorage.setItem('simrs_auditTrail', JSON.stringify(auditTrail)); }, [auditTrail]);
  useEffect(() => { localStorage.setItem('simrs_dokumenBerkas', JSON.stringify(dokumenBerkas)); }, [dokumenBerkas]);
  useEffect(() => { localStorage.setItem('simrs_asuhanKeperawatan', JSON.stringify(asuhanKeperawatan)); }, [asuhanKeperawatan]);
  useEffect(() => { localStorage.setItem('simrs_exam_scenarios', JSON.stringify(examScenarios)); }, [examScenarios]);
  useEffect(() => { localStorage.setItem('simrs_exam_submissions', JSON.stringify(examSubmissions)); }, [examSubmissions]);
  useEffect(() => {
    if (user) {
      localStorage.setItem('simrs_current_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('simrs_current_user');
    }
  }, [user]);

  const audit = (
    action: AuditEntry['action'],
    entity: string,
    entityId: string,
    details?: { field_name?: string; old_value?: any; new_value?: any }
  ) => {
    const newEntry: AuditEntry = {
      id: genId('AT'),
      timestamp: new Date().toISOString(),
      userId: user?.id || 'SYSTEM',
      userName: user?.name || 'System',
      action,
      entity,
      entityId,
      field_name: details?.field_name || null,
      old_value: details?.old_value ? String(details.old_value) : null,
      new_value: details?.new_value ? String(details.new_value) : null,
      ip: '192.168.1.' + Math.floor(Math.random() * 255),
      device: navigator.userAgent.substring(0, 80),
      module: activePage
    };
    setAuditTrail(prev => [newEntry, ...prev.slice(0, 499)]);
  };

  const toggleSidebar = () => setSidebarCollapsed(prev => !prev);

  const login = (u: string, p: string, selectedRoleId?: RoleId) => {
    const cleanU = u.trim();
    const cleanP = p.trim();

    // 1. Search exact user match
    let found = users.find(x => x.username.toLowerCase() === cleanU.toLowerCase() && x.password === cleanP && x.active);

    // 2. Fallback search by username
    if (!found) {
      found = users.find(x => x.username.toLowerCase() === cleanU.toLowerCase() && x.active);
    }

    // 3. Fallback auto-provision for student NIM (e.g. 20240306044) or custom username
    if (!found && cleanU.length > 0) {
      const isNim = /^\d+$/.test(cleanU);
      const assignedRole = selectedRoleId || 'R04';
      const newStudentUser: User = {
        id: 'U_' + cleanU,
        username: cleanU,
        password: cleanP || 'mhs123',
        name: isNim ? `Mahasiswa RMIK (${cleanU})` : cleanU,
        roleId: assignedRole,
        active: true
      };
      setUsers(prev => [...prev, newStudentUser]);
      found = newStudentUser;
    }

    if (!found) {
      return { success: false, error: 'Username/NIM atau password salah atau akun non-aktif' };
    }

    // Assign selected role for active session if specified in login form
    const sessionUser: User = {
      ...found,
      roleId: selectedRoleId || found.roleId
    };

    setUser(sessionUser);
    audit('LOGIN', 'User', sessionUser.id, { field_name: 'roleId', new_value: sessionUser.roleId });
    return { success: true };
  };

  const logout = () => {
    if (user) {
      audit('LOGOUT', 'User', user.id, { field_name: 'status', old_value: 'online', new_value: 'offline' });
    }
    setUser(null);
    setActivePage('dashboard');
  };

  const navigate = (page: string, newParams?: any) => {
    setActivePage(page);
    setParams(newParams || null);
    audit('NAVIGATE', 'Page', page);
  };

  const getPatient = (id: string) => patients.find(p => p.id === id);
  const getReg = (id: string) => registrations.find(r => r.id === id);
  const getMR = (id: string) => medicalRecords.find(m => m.id === id);
  const getUser = (id: string) => users.find(u => u.id === id);
  const getRole = (id: string) => roles.find(r => r.id === id) || INITIAL_ROLES.find(r => r.id === id);

  const generateNoRM = (): string => {
    let maxNum = 0;
    patients.forEach(p => {
      if (!p.noRM) return;
      const digitsOnly = p.noRM.replace(/\D/g, '');
      if (digitsOnly.length > 0) {
        // Exclude legacy 2024 / 24 numbers from maximum calculation
        if (digitsOnly.startsWith('2024') || digitsOnly.startsWith('24') || p.noRM.includes('2024')) return;
        const num = parseInt(digitsOnly, 10);
        if (!isNaN(num) && num > maxNum && num < 100000) {
          maxNum = num;
        }
      }
    });

    const nextNum = maxNum > 0 ? maxNum + 1 : (patients.length + 1);
    return String(nextNum).padStart(6, '0');
  };

  const addPatient = (patientData: Omit<Patient, 'id'>) => {
    let cleanNoRM = patientData.noRM ? patientData.noRM.replace(/\D/g, '') : '';
    if (!cleanNoRM || cleanNoRM.startsWith('2024') || cleanNoRM.startsWith('24') || cleanNoRM.length > 6) {
      cleanNoRM = generateNoRM();
    } else {
      cleanNoRM = cleanNoRM.padStart(6, '0');
    }
    const newPatient: Patient = {
      ...patientData,
      noRM: cleanNoRM,
      id: genId('P')
    };
    setPatients(prev => {
      const updated = [...prev, newPatient];
      return updated.sort((a, b) => {
        const nA = parseInt(a.noRM.replace(/\D/g, '') || '0', 10);
        const nB = parseInt(b.noRM.replace(/\D/g, '') || '0', 10);
        return nA - nB;
      });
    });
    audit('CREATE', 'Pasien', newPatient.id, { field_name: 'name', new_value: newPatient.name });
    return newPatient;
  };

  const updatePatient = (patientId: string, updates: Partial<Patient>) => {
    setPatients(prev => prev.map(p => {
      if (p.id === patientId) {
        audit('UPDATE', 'Pasien', patientId, { field_name: 'bpjs_vclaim_update', new_value: JSON.stringify(updates) });
        return { ...p, ...updates };
      }
      return p;
    }));
  };

  const addRegistration = (regData: { patientId: string; type: Registration['type']; poli: string; dpjp: string; sepNo?: string; room?: string; bedId?: string; naikKelas?: { isNaik: boolean; dari?: string; ke?: string } }) => {
    const today = new Date().toISOString().split('T')[0];
    const newReg: Registration = {
      id: genId('REG'),
      patientId: regData.patientId,
      date: today,
      type: regData.type,
      poli: regData.poli,
      dpjp: regData.dpjp,
      status: regData.type === 'Rawat Inap' ? 'Dirawat' : 'Selesai',
      sepNo: regData.sepNo || '-',
      room: regData.room || null
    };

    setRegistrations(prev => [newReg, ...prev]);

    // Update bed if room or bedId assigned (auto-decrement available beds)
    if (regData.bedId) {
      setBeds(prev => prev.map(b => b.id === regData.bedId ? { ...b, status: 'Occupied', patientId: regData.patientId } : b));
    } else if (regData.room) {
      setBeds(prev => prev.map(b => {
        if (b.id === regData.room || regData.room?.includes(b.id) || (b.roomName && regData.room?.includes(b.roomName) && regData.room?.includes(b.bedNumber || ''))) {
          return { ...b, status: 'Occupied', patientId: regData.patientId };
        }
        return b;
      }));
    }

    // Business Rule: Auto General Consent on registration
    const p = getPatient(regData.patientId);
    const newGC: GeneralConsent = {
      id: genId('GC'),
      regId: newReg.id,
      date: today,
      patientSign: p?.name || 'Pasien',
      witnessSign: user?.name || 'Petugas Pendaftaran',
      status: 'Signed'
    };
    setGeneralConsents(prev => [newGC, ...prev]);

    audit('CREATE', 'Pendaftaran', newReg.id, { field_name: 'type', new_value: newReg.type });
    audit('CREATE', 'GeneralConsent', newGC.id, { field_name: 'status', new_value: 'Signed' });

    return newReg;
  };

  const cancelRegistration = (regId: string, reason?: string) => {
    setRegistrations(prev => prev.map(r => {
      if (r.id === regId) {
        audit('UPDATE', 'Registration', regId, { field_name: 'status', old_value: r.status, new_value: 'Batal' });
        // Release bed if occupied
        if (r.room || r.patientId) {
          setBeds(bedsPrev => bedsPrev.map(b => b.patientId === r.patientId ? { ...b, status: 'Available', patientId: null } : b));
        }
        return { ...r, status: 'Batal' };
      }
      return r;
    }));
  };

  const updateRegistration = (regId: string, updates: Partial<Registration>) => {
    setRegistrations(prev => prev.map(r => {
      if (r.id === regId) {
        // Release bed when discharged
        if (updates.status === 'Selesai' && r.status === 'Dirawat') {
          setBeds(bedsPrev => bedsPrev.map(b => b.patientId === r.patientId ? { ...b, status: 'Available', patientId: null } : b));
        }
        audit('UPDATE', 'Registration', regId, { field_name: 'details', new_value: JSON.stringify(updates) });
        return { ...r, ...updates };
      }
      return r;
    }));
  };

  const updateBed = (bedId: string, updates: Partial<Bed>) => {
    setBeds(prev => prev.map(b => b.id === bedId ? { ...b, ...updates } : b));
  };

  const addGeneralConsent = (gcData: Omit<GeneralConsent, 'id'>) => {
    const gc: GeneralConsent = { ...gcData, id: genId('GC') };
    setGeneralConsents(prev => [gc, ...prev]);
    audit('CREATE', 'GeneralConsent', gc.id, { field_name: 'status', new_value: gc.status });
    return gc;
  };

  const addMedicalRecord = (mrData: any) => {
    const r = getReg(mrData.regId);
    const p = r ? getPatient(r.patientId) : undefined;
    const icd = mrData.diagnosisCode ? INITIAL_ICD10.find(i => i.code === mrData.diagnosisCode) : null;

    const mr: MedicalRecord = {
      id: mrData.id || genId('MR'),
      regId: mrData.regId,
      noRM: mrData.noRM || (p?.noRM ? p.noRM.replace(/\D/g, '').padStart(6, '0') : '000000'),
      anamnesis: mrData.anamnesis,
      physicalExam: mrData.physicalExam,
      diagnosis: mrData.diagnosis || (icd ? `${icd.code} - ${icd.desc}` : '-'),
      plan: mrData.plan || '',
      nurseNotes: mrData.nurseNotes || '',
      diagnosisStatus: mrData.diagnosisStatus || (icd ? 'Verified' : 'Pending'),
      doctorId: mrData.doctorId || user?.id || 'U002',
      doctorName: mrData.doctorName || '',
      doctorSignature: mrData.doctorSignature || '',
      nurseId: mrData.nurseId || '',
      nurseName: mrData.nurseName || '',
      nurseSignature: mrData.nurseSignature || '',
      date: mrData.date || new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString()
    };

    setMedicalRecords(prev => [mr, ...prev]);
    audit('CREATE', 'RekamMedis', mr.id, { field_name: 'diagnosis', new_value: mr.diagnosis });

    // Auto create initial billing for consultation
    const newBilling: Billing = {
      id: genId('BIL'),
      regId: mrData.regId,
      services: [
        { name: 'Konsultasi Dokter Spesialis', qty: 1, price: 150000 },
        { name: 'Pemeriksaan Fisik & TTV', qty: 1, price: 35000 }
      ],
      total: 185000,
      paid: 0,
      status: 'Unpaid'
    };
    setBilling(prev => [newBilling, ...prev]);

    return mr;
  };

  const updateMedicalRecord = (mrId: string, updates: Partial<MedicalRecord>) => {
    setMedicalRecords(prev => prev.map(m => m.id === mrId ? { ...m, ...updates, updatedAt: new Date().toISOString() } : m));
    audit('UPDATE', 'RekamMedis', mrId, { field_name: 'SOAP', new_value: 'Pemeriksaan Medis & TTD diperbarui' });
  };

  const addCPPT = (cpptData: {
    mrId: string;
    date: string;
    time: string;
    subjective: string;
    objective: string;
    assessment: string;
    plan: string;
    profession?: string;
    staffName?: string;
    unit?: string;
    verified?: boolean;
  }) => {
    const defaultProf = user?.roleId === 'R05' ? 'Dokter' : user?.roleId === 'R06' ? 'Perawat' : 'Tenaga Kesehatan';
    const newCPPT: CPPT = {
      id: genId('CPPT'),
      mrId: cpptData.mrId,
      date: cpptData.date,
      time: cpptData.time,
      subjective: cpptData.subjective,
      objective: cpptData.objective,
      assessment: cpptData.assessment,
      plan: cpptData.plan,
      doctorId: user?.id || 'U002',
      nurseId: null,
      profession: cpptData.profession || defaultProf,
      staffName: cpptData.staffName || user?.name || 'Petugas Medis',
      unit: cpptData.unit || 'Poliklinik / Rawat Inap',
      verified: cpptData.verified ?? true
    };
    setCppt(prev => [newCPPT, ...prev]);
    audit('CREATE', 'CPPT', newCPPT.id, { field_name: 'assessment', new_value: cpptData.assessment });
    return newCPPT;
  };

  const addInformedConsent = (icData: { cpptId: string; action: string; risk: string; complication: string }) => {
    const ic: InformedConsent = {
      id: genId('IC'),
      cpptId: icData.cpptId,
      action: icData.action,
      risk: icData.risk,
      complication: icData.complication,
      doctorId: user?.id || 'U002',
      date: new Date().toISOString().split('T')[0],
      status: 'Approved'
    };
    setInformedConsents(prev => [ic, ...prev]);
    audit('CREATE', 'InformedConsent', ic.id, { field_name: 'action', new_value: icData.action });
    return ic;
  };

  const addCoding = (codData: {
    mrId: string;
    regId?: string;
    icd10Codes?: string[] | string;
    icd10Code?: string;
    icd10?: string[] | string;
    icd10Desc?: string[] | string;
    icd9cmCodes?: string[] | string;
    icd9cmCode?: string;
    icd9cm?: string[] | string;
    icd9cmDesc?: string[] | string;
    note?: string;
    date?: string;
    status?: 'Draft' | 'Locked';
    coderId?: string;
  }) => {
    const mr = getMR(codData.mrId);
    const r = mr ? getReg(mr.regId) : undefined;
    const finalRegId = codData.regId || r?.id;

    let rawIcd10: string[] = [];
    if (Array.isArray(codData.icd10)) rawIcd10 = codData.icd10;
    else if (Array.isArray(codData.icd10Codes)) rawIcd10 = codData.icd10Codes;
    else if (typeof codData.icd10Codes === 'string' && codData.icd10Codes.trim()) rawIcd10 = [codData.icd10Codes];
    else if (codData.icd10Code) rawIcd10 = [codData.icd10Code];

    let rawIcd9: string[] = [];
    if (Array.isArray(codData.icd9cm)) rawIcd9 = codData.icd9cm;
    else if (Array.isArray(codData.icd9cmCodes)) rawIcd9 = codData.icd9cmCodes;
    else if (typeof codData.icd9cmCodes === 'string' && codData.icd9cmCodes.trim()) rawIcd9 = [codData.icd9cmCodes];
    else if (codData.icd9cmCode) rawIcd9 = [codData.icd9cmCode];

    let icd10Desc: string[] = [];
    if (Array.isArray(codData.icd10Desc)) {
      icd10Desc = codData.icd10Desc;
    } else {
      icd10Desc = rawIcd10.map(code => {
        const found = EXTENDED_ICD10.find(i => i.code === code) || INITIAL_ICD10.find(i => i.code === code);
        return found ? found.desc : code;
      });
    }

    let icd9cmDesc: string[] = [];
    if (Array.isArray(codData.icd9cmDesc)) {
      icd9cmDesc = codData.icd9cmDesc;
    } else {
      icd9cmDesc = rawIcd9.map(code => {
        const found = EXTENDED_ICD9CM.find(i => i.code === code) || INITIAL_ICD9CM.find(i => i.code === code);
        return found ? found.desc : code;
      });
    }

    const newCod: Coding = {
      id: genId('COD'),
      mrId: codData.mrId,
      regId: finalRegId,
      icd10: rawIcd10.length > 0 ? rawIcd10 : ['-'],
      icd10Desc: icd10Desc.length > 0 ? icd10Desc : ['-'],
      icd9cm: rawIcd9.length > 0 ? rawIcd9 : [],
      icd9cmDesc: icd9cmDesc.length > 0 ? icd9cmDesc : [],
      coderId: codData.coderId || user?.id || 'U006',
      date: codData.date || new Date().toISOString().split('T')[0],
      status: codData.status || 'Draft',
      note: codData.note
    };

    setCoding(prev => [newCod, ...prev]);
    audit('CREATE', 'Coding', newCod.id, { field_name: 'status', new_value: newCod.status });
    return newCod;
  };

  const updateCoding = (codingId: string, updates: Partial<Coding>) => {
    setCoding(prev => prev.map(c => {
      if (c.id === codingId) {
        const updated = { ...c, ...updates };
        audit('UPDATE', 'Coding', codingId, { field_name: 'status', old_value: c.status, new_value: updated.status });
        return updated;
      }
      return c;
    }));
  };

  /**
   * Pengelolaan Riwayat Pengkodean (Per-Kunjungan / Per-Encounter ID):
   * Setiap transaksi pengkodean terikat pada ID Kunjungan (Encounter ID).
   * Sistem DILARANG MENIMPA (overwritten) atau MENGHAPUS riwayat pengkodean dari
   * kunjungan-kunjungan pasien sebelumnya saat pengkodean kunjungan baru disimpan.
   */
  const saveEncounterCoding = (data: {
    regId: string;
    mrId?: string;
    icd10: string[];
    icd10Desc?: string[];
    icd9cm?: string[];
    icd9cmDesc?: string[];
    note?: string;
    status?: 'Draft' | 'Locked';
    date?: string;
  }): Coding => {
    // Cari apakah sudah ada record koding KHUSUS untuk Encounter ID ini
    const existing = coding.find(c => c.regId === data.regId);

    const resolvedIcd10Desc = data.icd10Desc && data.icd10Desc.length === data.icd10.length
      ? data.icd10Desc
      : data.icd10.map(code => {
          const found = EXTENDED_ICD10.find(i => i.code === code) || INITIAL_ICD10.find(i => i.code === code);
          return found ? found.desc : code;
        });

    const safeIcd9 = data.icd9cm || [];
    const resolvedIcd9Desc = data.icd9cmDesc && data.icd9cmDesc.length === safeIcd9.length
      ? data.icd9cmDesc
      : safeIcd9.map(code => {
          const found = EXTENDED_ICD9CM.find(i => i.code === code) || INITIAL_ICD9CM.find(i => i.code === code);
          return found ? found.desc : code;
        });

    if (existing) {
      // HANYA perbarui record milik Encounter ID ini saja! Riwayat kunjungan lain tetap aman.
      const updatedRecord: Coding = {
        ...existing,
        icd10: data.icd10.length > 0 ? data.icd10 : ['-'],
        icd10Desc: resolvedIcd10Desc.length > 0 ? resolvedIcd10Desc : ['-'],
        icd9cm: safeIcd9,
        icd9cmDesc: resolvedIcd9Desc,
        note: data.note !== undefined ? data.note : existing.note,
        status: data.status || existing.status,
        date: data.date || existing.date,
        coderId: user?.id || existing.coderId || 'U006'
      };

      setCoding(prev => prev.map(c => c.id === existing.id ? updatedRecord : c));
      audit('UPDATE', 'Coding', existing.id, { field_name: 'regId', new_value: data.regId });
      return updatedRecord;
    } else {
      // Buat record baru khusus untuk Encounter ID ini
      const reg = getReg(data.regId);
      const mr = data.mrId ? getMR(data.mrId) : medicalRecords.find(m => m.regId === data.regId);

      const newRecord: Coding = {
        id: genId('COD'),
        regId: data.regId,
        mrId: data.mrId || mr?.id || `MR-${data.regId}`,
        icd10: data.icd10.length > 0 ? data.icd10 : ['-'],
        icd10Desc: resolvedIcd10Desc.length > 0 ? resolvedIcd10Desc : ['-'],
        icd9cm: safeIcd9,
        icd9cmDesc: resolvedIcd9Desc,
        coderId: user?.id || 'U006',
        date: data.date || reg?.date || new Date().toISOString().split('T')[0],
        status: data.status || 'Draft',
        note: data.note || ''
      };

      // Tambahkan ke daftar tanpa menghapus data kunjungan manapun
      setCoding(prev => [newRecord, ...prev]);
      audit('CREATE', 'Coding', newRecord.id, { field_name: 'regId', new_value: data.regId });
      return newRecord;
    }
  };

  const lockCoding = (codingId: string) => {
    setCoding(prev => prev.map(c => {
      if (c.id === codingId) {
        audit('UPDATE', 'Coding', codingId, { field_name: 'status', old_value: c.status, new_value: 'Locked' });
        return { ...c, status: 'Locked' };
      }
      return c;
    }));
  };

  const addClaim = (claimData: { codingId: string; groupCode: string; groupDesc: string; tariff: number }) => {
    const cod = coding.find(c => c.id === claimData.codingId);
    const mr = cod ? getMR(cod.mrId) : undefined;
    const r = mr ? getReg(mr.regId) : undefined;

    const newClaim: Claim = {
      id: genId('KLAIM'),
      regId: r?.id || 'REG001',
      codingId: claimData.codingId,
      sepNo: r?.sepNo || 'SEP-GENERATED',
      groupCode: claimData.groupCode,
      description: claimData.groupDesc,
      tariff: claimData.tariff,
      dateSubmitted: new Date().toISOString().split('T')[0],
      status: 'Submitted'
    };

    setClaims(prev => [newClaim, ...prev]);
    audit('CREATE', 'KlaimBPJS', newClaim.id, { field_name: 'tariff', new_value: claimData.tariff });
    return newClaim;
  };

  const processPayment = (billingId: string) => {
    setBilling(prev => prev.map(b => {
      if (b.id === billingId) {
        audit('UPDATE', 'Billing', billingId, { field_name: 'status', old_value: b.status, new_value: 'Paid' });
        return { ...b, status: 'Paid', paid: b.total };
      }
      return b;
    }));
  };

  const addUser = (userData: { name: string; username: string; password?: string; roleId: any }) => {
    if (users.some(u => u.username === userData.username)) {
      return { success: false, message: 'Username sudah digunakan' };
    }
    const newUser: User = {
      id: genId('U'),
      name: userData.name,
      username: userData.username,
      password: userData.password || 'password123',
      roleId: userData.roleId,
      active: true
    };
    setUsers(prev => [...prev, newUser]);
    audit('CREATE', 'User', newUser.id, { field_name: 'name', new_value: newUser.name });
    return { success: true };
  };

  const updateUser = (id: string, updates: Partial<User>) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...updates } : u));
    audit('UPDATE', 'User', id);
  };

  const deleteUser = (id: string) => {
    if (id === 'U001') {
      return { success: false, message: 'Super Administrator utama tidak dapat dihapus!' };
    }
    setUsers(prev => prev.filter(u => u.id !== id));
    audit('DELETE', 'User', id);
    return { success: true };
  };

  const updateRolePermissions = (roleId: RoleId, newAccess: string[]) => {
    setRoles(prev => prev.map(r => r.id === roleId ? { ...r, access: newAccess } : r));
    audit('UPDATE', 'Role', roleId, { field_name: 'access', new_value: newAccess.join(',') });
  };

  const addDokumenBerkas = (docData: Omit<DokumenBerkas, 'id'>) => {
    const newDoc: DokumenBerkas = {
      ...docData,
      id: genId('DOC'),
    };
    setDokumenBerkas(prev => [newDoc, ...prev]);
    audit('CREATE', 'DokumenBerkas', newDoc.id, { field_name: 'title', new_value: newDoc.title });
    return newDoc;
  };

  const deleteDokumenBerkas = (id: string) => {
    setDokumenBerkas(prev => prev.filter(d => d.id !== id));
    audit('DELETE', 'DokumenBerkas', id);
  };

  const addAsuhanKeperawatan = (data: Omit<AsuhanKeperawatan, 'id'>) => {
    const newAskep: AsuhanKeperawatan = {
      ...data,
      id: genId('ASKEP'),
    };
    setAsuhanKeperawatan(prev => [newAskep, ...prev]);
    audit('CREATE', 'AsuhanKeperawatan', newAskep.id, { field_name: 'status', new_value: newAskep.status });
    return newAskep;
  };

  const updateAsuhanKeperawatan = (id: string, updates: Partial<AsuhanKeperawatan>) => {
    setAsuhanKeperawatan(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
    audit('UPDATE', 'AsuhanKeperawatan', id);
  };

  const injectSimulationPatient = (scenario: ExamScenario) => {
    const records = buildSimulationRecords(scenario);
    setPatients(prev => {
      const idx = prev.findIndex(p => p.noRM === records.patient.noRM || p.id === records.patient.id);
      let updated: Patient[];
      if (idx >= 0) {
        updated = [...prev];
        updated[idx] = { ...updated[idx], ...records.patient };
      } else {
        updated = [...prev, records.patient];
      }
      return updated.sort((a, b) => {
        const nA = parseInt((a.noRM || '').replace(/\D/g, '') || '0', 10);
        const nB = parseInt((b.noRM || '').replace(/\D/g, '') || '0', 10);
        return nA - nB;
      });
    });

    setRegistrations(prev => {
      const idx = prev.findIndex(r => r.id === records.registration.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], ...records.registration };
        return updated;
      }
      return [records.registration, ...prev];
    });

    setMedicalRecords(prev => {
      const idx = prev.findIndex(m => m.id === records.medicalRecord.id || m.regId === records.medicalRecord.regId);
      let updated: MedicalRecord[];
      if (idx >= 0) {
        updated = [...prev];
        updated[idx] = { ...updated[idx], ...records.medicalRecord };
      } else {
        updated = [...prev, records.medicalRecord];
      }
      return updated.sort((a, b) => {
        const nA = parseInt((a.noRM || '').replace(/\D/g, '') || '0', 10);
        const nB = parseInt((b.noRM || '').replace(/\D/g, '') || '0', 10);
        return nA - nB;
      });
    });

    setCppt(prev => {
      const idx = prev.findIndex(c => c.id === records.cppt.id || c.regId === records.cppt.regId);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], ...records.cppt };
        return updated;
      }
      return [records.cppt, ...prev];
    });
  };

  const saveExamScenario = (scenario: ExamScenario) => {
    setExamScenarios(prev => {
      const idx = prev.findIndex(s => s.id === scenario.id);
      let updated: ExamScenario[];
      if (idx >= 0) {
        updated = [...prev];
        updated[idx] = { ...scenario, updatedAt: new Date().toISOString() };
      } else {
        updated = [...prev, scenario];
      }
      return updated.sort((a, b) => {
        const nA = parseInt((a.extractedPatient?.noRM || '').replace(/\D/g, '') || '0', 10);
        const nB = parseInt((b.extractedPatient?.noRM || '').replace(/\D/g, '') || '0', 10);
        return nA - nB;
      });
    });
    injectSimulationPatient(scenario);
    audit('UPDATE', 'ExamScenario', scenario.id, { field_name: 'title', new_value: scenario.title });
  };

  const deleteExamScenario = (id: string) => {
    setExamScenarios(prev => prev.filter(s => s.id !== id));
    audit('DELETE', 'ExamScenario', id);
  };

  const saveExamSubmission = (sub: ExamSubmission) => {
    setExamSubmissions(prev => {
      const idx = prev.findIndex(s => s.id === sub.id || (s.studentId === sub.studentId && s.scenarioId === sub.scenarioId));
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = sub;
        return updated;
      }
      return [sub, ...prev];
    });
    audit('CREATE', 'ExamSubmission', sub.id, { field_name: 'score', new_value: sub.score });
  };

  const deleteExamSubmission = (id: string) => {
    setExamSubmissions(prev => prev.filter(s => s.id !== id));
    audit('DELETE', 'ExamSubmission', id);
  };

  // Ensure simulation patients are initialized in state
  useEffect(() => {
    examScenarios.forEach(scen => {
      injectSimulationPatient(scen);
    });
  }, []);

  const canEditPage = (pageId?: string): boolean => {
    if (!user) return false;
    const targetPage = pageId || activePage;
    if (targetPage === 'dashboard' || targetPage === 'praktikum' || targetPage === 'audit' || targetPage === 'logaktivitas') return true;
    const role = getRole(user.roleId);
    if (!role) return false;
    if (role.access.includes('all')) return true;
    return role.access.includes(targetPage);
  };

  return (
    <AppContext.Provider
      value={{
        user,
        users,
        roles,
        patients,
        registrations,
        generalConsents,
        medicalRecords,
        cppt,
        informedConsents,
        coding,
        claims,
        billing,
        pharmacy,
        lab,
        radiology,
        beds,
        auditTrail,
        praktikum: INITIAL_PRAKTIKUM,
        dokumenBerkas,
        asuhanKeperawatan,
        examScenarios,
        examSubmissions,
        activePage,
        params,
        sidebarCollapsed,
        toggleSidebar,
        login,
        logout,
        navigate,
        audit,
        generateNoRM,
        addPatient,
        updatePatient,
        addRegistration,
        cancelRegistration,
        updateRegistration,
        updateBed,
        addGeneralConsent,
        addMedicalRecord,
        updateMedicalRecord,
        addCPPT,
        addInformedConsent,
        addCoding,
        updateCoding,
        saveEncounterCoding,
        lockCoding,
        addClaim,
        processPayment,
        addUser,
        updateUser,
        deleteUser,
        updateRolePermissions,
        addDokumenBerkas,
        deleteDokumenBerkas,
        addAsuhanKeperawatan,
        updateAsuhanKeperawatan,
        saveExamScenario,
        deleteExamScenario,
        saveExamSubmission,
        deleteExamSubmission,
        injectSimulationPatient,
        getPatient,
        getReg,
        getMR,
        getUser,
        getRole,
        canEditPage
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
