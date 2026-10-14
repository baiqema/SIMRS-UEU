# SIMRS-UEU Supabase Backend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give Ema's SIMRS-UEU React app a real backend: shared class hospitals in Postgres, real login, rules enforced by the database, and an append-only audit trail. Her interface stays unchanged, and Praktikum/Ujian are removed.

**Architecture:** Every module still reads and writes through `useApp()` in `src/context/AppContext.tsx`. Each persisted state slice is created with a new `useSlice` hook:
- In **local mode**, it behaves exactly like today (`localStorage`).
- In **Supabase mode**, it loads rows for the active class, pushes row-level diffs (upsert/delete), and receives other users' changes through Realtime.

Postgres row-level security (RLS) decides who may write what, based on the user's open *practice session* (class + chosen role). An audit trigger on every table writes to an append-only `audit_log`.

**Tech Stack:** React 19, Vite 6, TypeScript 5.8 (existing); `@supabase/supabase-js` 2.x; Supabase (Postgres 15+, Auth, Realtime, Edge Functions on Deno); Vitest 3; tsx 4; Supabase CLI 2.x run through `npx`.

**Spec:** `docs/superpowers/specs/2026-10-09-simrs-ueu-supabase-backend-design.md`

## Global Constraints

- Ema's application is the product. Do not restyle or restructure her screens. The only edits allowed in her existing files are the ones listed in a task's **Files** block.
- New backend code lives only in `src/data-layer/`, `src/lib/`, `supabase/`, `scripts/` and `tests/`. New screens go in `src/views/` (`PilihKelasView.tsx`, `GantiPasswordView.tsx`) and `src/components/kelas/`.
- **Local mode is the default** whenever `VITE_SUPABASE_URL` or `VITE_SUPABASE_ANON_KEY` is missing. In local mode the app must behave exactly as before, including Ema's prototype login.
- The **service-role key** never appears in the repository, in any `VITE_` variable, or in Vercel. It exists only in Supabase Edge Function secrets (set automatically) and in each developer's local `.env.test.local` / `.env.bootstrap.local` (gitignored by the existing `.env*` rule).
- Synthetic data only. No real BPJS, SATUSEHAT, LIS or PACS calls.
- New user-facing copy is in Indonesian and uses Ema's Tailwind patterns (rounded-2xl cards, `bg-gradient-to-r from-blue-600 to-indigo-700` primary buttons, `text-xs` body text, and `sweetalert2` for notices).
- Login email domain constant: `users.simrs-ueu.invalid`. Usernames match `^[a-z0-9._-]+$` after lowercasing.
- Template class id: `00000000-0000-0000-0000-000000000001`.
- Date placeholders in seed data: `__TODAY__` becomes `YYYY-MM-DD` and `__TODAYCOMPACT__` becomes `YYYYMMDD`, both applied when a class is created or reset.
- Work goes to `baiqema/SIMRS-UEU` through pull requests that Ema merges. Never push to `main`. Each **Phase** below is one PR.
- Commit messages end with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Spec deviations (decided while planning, already folded into the spec)

1. **Database tests are Vitest integration tests run against a dedicated Supabase *dev* project, not pgTAP.** The dev machine has no Docker, and `supabase test db` needs it.
2. **A `staff_directory` table was added.** Ema's `users` list doubles as the hospital's fictional staff: doctors are chosen as DPJP by id (e.g. `U002`). Those records stay class data. Real login accounts are separate.
3. **No generated or indexed columns yet.** All filtering and RL reporting happens in her screens, on the client.
4. **`login()` becomes async.** `LoginView.tsx` gets a minimal `await` edit.
5. **The roster screen is a new tab** inside her *Hak Akses & Pengguna* view, not a replacement for it. R03 Dosen gains `manajemenuser` access so lecturers can open it.

## Review Focus

These are failure modes the spec implies but no ordinary test would naturally catch. Each one has a pinned test in the task that owns the code.

1. **A role saves something on its own page that writes to *another* table.** Examples:
   - a doctor's exam (`addMedicalRecord`) also writes `billing`
   - registration (`addRegistration`) also writes `general_consents` and `beds`
   - the RM desk (`RekamMedisView`) writes `coding` and `cppt`

   These saves must succeed. They are pinned by `tests/integration/rls.test.ts` → "cross-module writes allowed by table_modules" (Task 6).
2. **Two students in one class edit the same list at the same time.** Student A's save must never delete a row that student B added and A has not seen yet. Pinned by `src/data-layer/diff.test.ts` → "rows unknown to this client are never deleted" (Task 4).
3. **Ema's fictional staff (DPJP doctors such as `U002`) must still appear in Supabase mode**, or registration and exam screens show blank doctors. Pinned by `tests/integration/lifecycle.test.ts` → "template copies staff_directory" (Task 8), and `src/data-layer/supabaseQueries.test.ts` → "members merge after staff without replacing staff" (Task 10).
4. **Reloading the browser mid-practice must restore the same class and role**, not drop the user back at login or quietly change their role. Pinned by `tests/integration/session.test.ts` → "my_practice_session returns the open session after re-login" (Task 8).
5. **A rejected save** (role not allowed) **must roll the screen back to the server's version and show a notice**, not leave unsaved data on screen. Pinned by `src/data-layer/useSlice.test.ts` → "failed push rolls back to refetched rows and notifies" (Task 4).

---

## Phase 1 — Preparation (no code; done by people)

### Task 1: Accounts, projects and the AI Studio sync test

**Files:**
- Create: `docs/operations/setup-checklist.md`

- [ ] **Step 1: Write the checklist file**

```markdown
# Setup checklist (one-time)

## GitHub
- [ ] Daniel forks `baiqema/SIMRS-UEU` to `danielhappyg/SIMRS-UEU` (GitHub → Fork).
- [ ] Ema confirms she reviews and merges PRs into `main`.

## AI Studio sync rules (Ema)
- [ ] Before every AI Studio session: Settings → GitHub tab → Pull, and check it says "In Sync".
- [ ] Never choose "Force push" once the backend PRs are merged.
- [ ] One-time test, done together:
  1. Daniel pushes branch `sync-test` with a harmless change (add a comment line to `README.md`) and merges it into `main` through a PR.
  2. Ema pulls in AI Studio and confirms the comment appears.
  3. Ema makes a harmless edit in AI Studio and pushes; Daniel confirms the comment from step 1 is still there.
  4. If step 3 removed the comment, STOP and tell Daniel before any backend PR is merged.

## Supabase (Daniel)
- [ ] Create project `simrs-ueu-dev` (used only by automated tests).
- [ ] Create project `simrs-ueu-demo` (used by the Vercel demo).
- [ ] In BOTH projects: Authentication → Sign In / Providers → Email: disable "Allow new users to sign up" and disable "Confirm email".
- [ ] Note for each project: Project URL, anon (publishable) key, service-role key, database password. Store them in a password manager, never in the repo.

## Vercel (Daniel)
- [ ] Import `danielhappyg/SIMRS-UEU` into Daniel's Vercel account (framework: Vite).
- [ ] Leave environment variables empty for now; the first deploy runs in local mode.
```

- [ ] **Step 2: Do the checklist with Ema and tick every box.** If AI Studio sync step 3 fails, stop the plan and escalate to Daniel; the spec's isolation strategy then needs a stricter process.

- [ ] **Step 3: Commit**

```bash
git add docs/operations/setup-checklist.md
git commit -m "docs: add one-time setup checklist

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

## Phase 2 — Remove Praktikum and Ujian (PR 1)

### Task 2: Delete the Praktikum and Ujian features and unused dependencies

**Files:**
- Delete: `src/views/PraktikumView.tsx`, `src/components/praktikum/` (whole folder), `src/components/exam/` (whole folder), `src/data/praktikumMateriQuizData.ts`, `src/data/examScenariosData.ts`, `src/utils/pdfExtractor.ts`
- Modify: `src/App.tsx` (import line 22, `case 'praktikum'` lines 100-101)
- Modify: `src/components/Sidebar.tsx` (line 73 menu entry, line 197 condition, `GraduationCap` import on line 6)
- Modify: `src/components/Header.tsx` (line 38)
- Modify: `src/views/ManajemenUserView.tsx` (line 63 module entry)
- Modify: `src/context/AppContext.tsx` (imports lines 5-6, 13, 17-18; interface lines 39, 42-43, 120-124; state lines 337-394; effects lines 416-417; functions lines 1212-1316; provider value `praktikum`, `examScenarios`, `examSubmissions` and the five exam functions)
- Modify: `src/types.ts` (remove `ExamScenario`, `ExamSubmission`, `PraktikumModule` and any interfaces only they use)
- Modify: `src/data/mockData.ts` (remove `INITIAL_PRAKTIKUM` lines 629-636 and `PraktikumModule` from the import on line 4; remove `'praktikum'` from R03's access on line 48)
- Modify: `package.json`, `metadata.json`

**Interfaces:**
- Consumes: nothing.
- Produces: an `AppContextType` with no `praktikum`, `examScenarios`, `examSubmissions`, `saveExamScenario`, `deleteExamScenario`, `saveExamSubmission`, `deleteExamSubmission` or `injectSimulationPatient`.

- [ ] **Step 1: Delete the feature files**

```bash
git rm -r src/views/PraktikumView.tsx src/components/praktikum src/components/exam \
  src/data/praktikumMateriQuizData.ts src/data/examScenariosData.ts src/utils/pdfExtractor.ts
```

- [ ] **Step 2: Remove the route in `src/App.tsx`.** Delete the line `import { PraktikumView } from './views/PraktikumView';`, and delete:

```tsx
      case 'praktikum':
        return <PraktikumView />;
```

- [ ] **Step 3: Remove the menu entry in `src/components/Sidebar.tsx`.** Delete the line:

```tsx
        { id: 'praktikum', label: 'Ujian Praktik & Simulasi', icon: GraduationCap },
```

Change `&& item.id !== 'dashboard' && item.id !== 'praktikum' && (` to `&& item.id !== 'dashboard' && (`. Remove `GraduationCap, ` from the lucide import on line 6, but only if `grep -n GraduationCap src/components/Sidebar.tsx` shows no other use.

- [ ] **Step 4: Remove the remaining mentions.**
  - `src/components/Header.tsx`: delete the line `      praktikum: 'Administrasi / Praktikum RMIK',`.
  - `src/views/ManajemenUserView.tsx`: delete the line `      { id: 'praktikum', name: 'Modul Praktikum RMIK', desc: 'Skenario pembelajaran, evaluasi & logbook mahasiswa' },`.
  - `src/data/mockData.ts`:
    - delete the `INITIAL_PRAKTIKUM` export block
    - remove `PraktikumModule, ` from the type import
    - in R03's access list change `'praktikum', 'audit', 'logaktivitas'` to `'audit', 'logaktivitas'`

- [ ] **Step 5: Remove the exam code from `src/context/AppContext.tsx`.**
  - Remove from imports: `PraktikumModule`, `ExamScenario`, `ExamSubmission`, `INITIAL_PRAKTIKUM`, the line `import { INITIAL_EXAM_SCENARIOS } from '../data/examScenariosData';`, and the line `import { buildSimulationRecords } from '../utils/pdfExtractor';`.
  - Remove interface members: `praktikum`, `examScenarios`, `examSubmissions`, `saveExamScenario`, `deleteExamScenario`, `saveExamSubmission`, `deleteExamSubmission`, `injectSimulationPatient`.
  - Remove the `examScenarios` and `examSubmissions` `useState` blocks.
  - Remove the two `useEffect` lines for `simrs_exam_scenarios` and `simrs_exam_submissions`.
  - Remove the functions `injectSimulationPatient`, `saveExamScenario`, `deleteExamScenario`, `saveExamSubmission` and `deleteExamSubmission`.
  - Remove the matching keys from the provider `value`, including `praktikum: INITIAL_PRAKTIKUM,`.

- [ ] **Step 6: Remove the types from `src/types.ts`.** Delete `export interface ExamScenario`, `export interface ExamSubmission` and `export interface PraktikumModule` (with their bodies), plus any interface that `grep -rn "<Name>" src` then shows is used nowhere else.

- [ ] **Step 7: Remove unused dependencies and the Gemini capability**

```bash
npm uninstall @google/genai express dotenv @types/express
```

In `metadata.json`, set `"majorCapabilities": []`. In `.env.example`, delete the `GEMINI_API_KEY` comment block and line.

- [ ] **Step 8: Verify nothing references the removed code**

Run: `grep -rn "praktikum\|Praktikum\|examScenario\|ExamScenario\|examSubmission\|pdfExtractor\|injectSimulationPatient\|genai" src --include=*.ts --include=*.tsx | grep -v "LoginView.tsx"`
Expected: no output. LoginView keeps its copy text such as "Role praktikum", which is intentional: practice still exists, only the module is gone.

- [ ] **Step 9: Type-check and build**

Run: `npm run lint && npm run build`
Expected: `tsc` prints nothing and exits 0, and Vite prints `✓ built in`.

- [ ] **Step 10: Click through in local mode**

Run: `npm run dev`. Open http://localhost:3000 and log in with the preset "Super Administrator". Click every sidebar item and confirm each opens without a blank screen or console error, and that "Ujian Praktik & Simulasi" is gone. Stop the server.

- [ ] **Step 11: Commit**

```bash
git add -A
git commit -m "feat: remove Praktikum and Ujian modules and unused AI dependencies

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

## Phase 3 — Data-layer seam, no behaviour change (PR 2)

### Task 3: Test tooling, and extracting the seed normalizers

**Files:**
- Modify: `package.json` (dev dependencies and scripts)
- Modify: `tsconfig.json` (add `exclude`)
- Create: `vitest.config.ts`
- Create: `src/data/seedNormalizers.ts`
- Create: `src/data/seedNormalizers.test.ts`
- Modify: `src/context/AppContext.tsx`: the `patients` initializer (lines ~168-201), the `registrations` initializer (~203-254) and the `medicalRecords` initializer (~261-282) call the extracted functions

**Interfaces:**
- Produces:
  - `sanitizePatientList(list: Patient[]): Patient[]`
  - `sanitizeMedicalRecords(list: MedicalRecord[]): MedicalRecord[]`
  - `buildTodayRegistrations(todayStr: string, todayCompact?: string): Registration[]`
  - `ensureTodayRegistrations(list: Registration[], todayStr: string): Registration[]`

- [ ] **Step 1: Install tools and add scripts**

```bash
npm install --save-dev vitest@^3.2.4 tsx@^4.19.0
```

In `package.json` `"scripts"`, add:

```json
    "test": "vitest run",
    "test:integration": "vitest run -c vitest.integration.config.ts",
    "seed:build": "tsx scripts/build-seed.ts",
    "bootstrap": "tsx scripts/bootstrap.ts"
```

In `tsconfig.json`, add a top-level key after `"compilerOptions"`:

```json
  "exclude": ["node_modules", "dist", "supabase/functions"]
```

Create `vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/*.test.ts', 'scripts/**/*.test.ts'],
    environment: 'node',
  },
});
```

- [ ] **Step 2: Write the failing test** `src/data/seedNormalizers.test.ts`

```ts
import { describe, expect, it } from 'vitest';
import {
  sanitizePatientList, sanitizeMedicalRecords,
  buildTodayRegistrations, ensureTodayRegistrations,
} from './seedNormalizers';
import type { Patient, MedicalRecord, Registration } from '../types';

describe('sanitizePatientList', () => {
  it('replaces legacy RM numbers with the 1-based position and sorts ascending', () => {
    const list = [
      { id: 'P2', noRM: '000007' },
      { id: 'P1', noRM: 'RM-2024-01' },
    ] as Patient[];
    const out = sanitizePatientList(list);
    expect(out.map(p => p.noRM)).toEqual(['000002', '000007']);
  });
});

describe('sanitizeMedicalRecords', () => {
  it('pads RM digits to six characters', () => {
    const out = sanitizeMedicalRecords([{ id: 'M1', noRM: '42' }] as MedicalRecord[]);
    expect(out[0].noRM).toBe('000042');
  });
});

describe('buildTodayRegistrations', () => {
  it('builds IGD, Rawat Jalan and Rawat Inap seeds for the given day', () => {
    const regs = buildTodayRegistrations('2026-10-09');
    expect(regs.map(r => r.type)).toEqual(['IGD', 'Rawat Jalan', 'Rawat Inap']);
    expect(regs[0].sepNo).toBe('0010R00120261009V001');
  });

  it('accepts placeholders for seed generation', () => {
    const regs = buildTodayRegistrations('__TODAY__', '__TODAYCOMPACT__');
    expect(regs[0].date).toBe('__TODAY__');
    expect(regs[0].sepNo).toBe('0010R001__TODAYCOMPACT__V001');
  });
});

describe('ensureTodayRegistrations', () => {
  it('prepends today seeds only when no registration exists for today', () => {
    const existing = [{ id: 'R1', date: '2026-01-01' }] as Registration[];
    expect(ensureTodayRegistrations(existing, '2026-10-09')).toHaveLength(4);
    const withToday = [{ id: 'R1', date: '2026-10-09' }] as Registration[];
    expect(ensureTodayRegistrations(withToday, '2026-10-09')).toBe(withToday);
  });
});
```

- [ ] **Step 3: Run it to verify it fails**

Run: `npx vitest run src/data/seedNormalizers.test.ts`
Expected: FAIL, `Failed to resolve import "./seedNormalizers"`.

- [ ] **Step 4: Create `src/data/seedNormalizers.ts`** by moving Ema's existing logic out of `AppContext.tsx` unchanged:

```ts
import type { Patient, MedicalRecord, Registration } from '../types';

const isLegacyRM = (raw: string, digits: string) =>
  !digits || digits.startsWith('2024') || digits.startsWith('24') || digits.startsWith('9988') || raw.includes('RM-');

const rmNumber = (noRM: string) => parseInt(noRM.replace(/\D/g, '') || '0', 10);

export function sanitizePatientList(list: Patient[]): Patient[] {
  const mapped = list.map((p, idx) => {
    const raw = p.noRM || '';
    const digits = raw.replace(/\D/g, '');
    if (isLegacyRM(raw, digits)) return { ...p, noRM: String(idx + 1).padStart(6, '0') };
    return { ...p, noRM: digits.padStart(6, '0') };
  });
  return mapped.sort((a, b) => rmNumber(a.noRM) - rmNumber(b.noRM));
}

export function sanitizeMedicalRecords(list: MedicalRecord[]): MedicalRecord[] {
  return list
    .map((m, idx) => {
      const raw = m.noRM || '';
      const digits = raw.replace(/\D/g, '');
      if (raw.includes('2024') || isLegacyRM(raw, digits)) return { ...m, noRM: String(idx + 1).padStart(6, '0') };
      return { ...m, noRM: digits.padStart(6, '0') };
    })
    .sort((a, b) => rmNumber(a.noRM) - rmNumber(b.noRM));
}

export function buildTodayRegistrations(todayStr: string, todayCompact = todayStr.replace(/-/g, '')): Registration[] {
  return [
    {
      id: 'REG-TODAY-IGD', patientId: 'P001', date: todayStr, type: 'IGD',
      poli: 'Instalasi Gawat Darurat (IGD)', dpjp: 'U002', status: 'Dirawat',
      sepNo: `0010R001${todayCompact}V001`, room: 'Bed Resusitasi 01',
      triageLevel: 'Kuning (Emergensi)', reasonForVisit: 'Nyeri dada kiri menjalar & sesak napas akut',
    },
    {
      id: 'REG-TODAY-RALAN', patientId: 'P002', date: todayStr, type: 'Rawat Jalan',
      poli: 'Poli Penyakit Dalam', dpjp: 'U002', status: 'Dirawat',
      sepNo: `0010R001${todayCompact}V002`, room: null,
      reasonForVisit: 'Kontrol rutin hipertensi dan keluhan lemas',
    },
    {
      id: 'REG-TODAY-RANAP', patientId: 'P003', date: todayStr, type: 'Rawat Inap',
      poli: 'Bangsal Perawatan Melati', dpjp: 'U002', status: 'Dirawat',
      sepNo: `0010R001${todayCompact}V003`, room: 'Kamar Melati 204 (Bed A)',
      reasonForVisit: 'Demam tifoid hari ke-5 & dehidrasi sedang',
    },
  ] as Registration[];
}

export function ensureTodayRegistrations(list: Registration[], todayStr: string): Registration[] {
  if (list.some(r => r.date === todayStr)) return list;
  return [...buildTodayRegistrations(todayStr), ...list];
}
```

Compare the objects in `buildTodayRegistrations` field-by-field with the original block in `AppContext.tsx` (lines ~211-249) before deleting it. They must be identical apart from the template variables.

- [ ] **Step 5: Run the tests**

Run: `npx vitest run src/data/seedNormalizers.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 6: Make `AppContext.tsx` use the extracted functions.** Add `import { sanitizePatientList, sanitizeMedicalRecords, ensureTodayRegistrations } from '../data/seedNormalizers';`, then replace the three initializer bodies:

```tsx
  const [patients, setPatients] = useState<Patient[]>(() => {
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
    const todayStr = new Date().toISOString().split('T')[0];
    const saved = localStorage.getItem('simrs_registrations');
    const base: Registration[] = saved ? JSON.parse(saved) : INITIAL_REGISTRATIONS;
    const list = ensureTodayRegistrations(base, todayStr);
    if (list !== base) localStorage.setItem('simrs_registrations', JSON.stringify(list));
    return list;
  });
```

```tsx
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>(() => {
    const saved = localStorage.getItem('simrs_medicalRecords');
    const records = saved ? (() => {
      try { return JSON.parse(saved); } catch { return INITIAL_MEDICAL_RECORDS; }
    })() : INITIAL_MEDICAL_RECORDS;
    const sanitized = sanitizeMedicalRecords(records);
    localStorage.setItem('simrs_medicalRecords', JSON.stringify(sanitized));
    return sanitized;
  });
```

- [ ] **Step 7: Type-check, build and run the unit tests**

Run: `npm run lint && npm run build && npm test`
Expected: all three succeed, and Vitest reports 5 passed.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "refactor: extract seed normalizers and add Vitest

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

### Task 4: The `useSlice` hook, slice registry and diff (local mode only)

**Files:**
- Create: `src/data-layer/config.ts`, `src/data-layer/slices.ts`, `src/data-layer/diff.ts`, `src/data-layer/registry.ts`, `src/data-layer/useSlice.ts`
- Create tests: `src/data-layer/config.test.ts`, `src/data-layer/diff.test.ts`, `src/data-layer/registry.test.ts`, `src/data-layer/useSlice.test.ts`
- Modify: `src/context/AppContext.tsx`:
  - the 14 persisted `useState` slices become `useSlice`
  - the matching persistence `useEffect` lines are removed
  - the `roles`, `auditTrail` and `user` effects are guarded to local mode

**Interfaces:**
- Produces:
  - `type BackendMode = 'local' | 'supabase'`
  - `getBackendMode(env?): BackendMode`, `isDemoMode(env?): boolean`
  - `type SliceName`, `SLICES: Record<SliceName, { table: string; localKey: string }>`, `SLICE_BY_TABLE: Record<string, SliceName>`
  - `diffById<T extends { id: string }>(prev: T[], next: T[]): SliceDiff<T>` where `SliceDiff<T> = { upserts: T[]; deletes: string[] }`
  - `type RemoteChange = { type: 'upsert'; row: { id: string } } | { type: 'delete'; id: string }`
  - `applyRemoteChange<T extends { id: string }>(list: T[], change: RemoteChange): T[]`
  - `sliceRegistry.register(name, handle): () => void`, `sliceRegistry.hydrateAll(rows: Partial<Record<SliceName, unknown[]>>)`, `sliceRegistry.applyRemote(name, change)`
  - `interface SlicePersistence { push(name: SliceName, diff: SliceDiff<{ id: string }>): Promise<void>; refetch(name: SliceName): Promise<unknown[]>; onSaveError(err: unknown): void }`
  - `setSlicePersistence(p: SlicePersistence | null): void`
  - `useSlice<T extends { id: string }>(name: SliceName, localInit: () => T[]): [T[], Dispatch<SetStateAction<T[]>>]`
  - `createSliceSetter(...)`, the non-React core of `useSlice`, exported for tests

- [ ] **Step 1: Write the failing tests**

`src/data-layer/config.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { getBackendMode, isDemoMode } from './config';

describe('getBackendMode', () => {
  it('is local unless both Supabase variables are present', () => {
    expect(getBackendMode({})).toBe('local');
    expect(getBackendMode({ VITE_SUPABASE_URL: 'https://x.supabase.co' })).toBe('local');
    expect(getBackendMode({ VITE_SUPABASE_URL: 'https://x.supabase.co', VITE_SUPABASE_ANON_KEY: 'k' })).toBe('supabase');
  });
});

describe('isDemoMode', () => {
  it('is always true in local mode and follows VITE_DEMO_MODE in supabase mode', () => {
    expect(isDemoMode({})).toBe(true);
    const sb = { VITE_SUPABASE_URL: 'u', VITE_SUPABASE_ANON_KEY: 'k' };
    expect(isDemoMode(sb)).toBe(false);
    expect(isDemoMode({ ...sb, VITE_DEMO_MODE: 'true' })).toBe(true);
  });
});
```

`src/data-layer/diff.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { diffById } from './diff';

type Row = { id: string; v: number };

describe('diffById', () => {
  it('reports added and changed rows as upserts and missing rows as deletes', () => {
    const a = { id: 'a', v: 1 }, b = { id: 'b', v: 1 }, c = { id: 'c', v: 1 };
    const d = diffById<Row>([a, b, c], [a, { id: 'b', v: 2 }, { id: 'd', v: 1 }]);
    expect(d.upserts.map(r => r.id)).toEqual(['b', 'd']);
    expect(d.deletes).toEqual(['c']);
  });

  it('treats a structurally equal copy as unchanged', () => {
    const d = diffById<Row>([{ id: 'a', v: 1 }], [{ id: 'a', v: 1 }]);
    expect(d).toEqual({ upserts: [], deletes: [] });
  });

  it('rows unknown to this client are never deleted', () => {
    // Student B added "b2" on the server; student A's list never contained it.
    const prevA: Row[] = [{ id: 'a1', v: 1 }];
    const nextA: Row[] = [{ id: 'a1', v: 1 }, { id: 'a2', v: 1 }];
    const d = diffById(prevA, nextA);
    expect(d.deletes).toEqual([]);
    expect(d.upserts.map(r => r.id)).toEqual(['a2']);
  });
});
```

`src/data-layer/registry.test.ts`:

```ts
import { describe, expect, it, vi } from 'vitest';
import { applyRemoteChange, sliceRegistry } from './registry';

describe('applyRemoteChange', () => {
  it('replaces an existing row in place', () => {
    const out = applyRemoteChange([{ id: 'a', v: 1 }, { id: 'b', v: 1 }], { type: 'upsert', row: { id: 'b', v: 2 } as any });
    expect(out).toEqual([{ id: 'a', v: 1 }, { id: 'b', v: 2 }]);
  });
  it('prepends a new row', () => {
    const out = applyRemoteChange([{ id: 'a' }], { type: 'upsert', row: { id: 'z' } });
    expect(out.map(r => r.id)).toEqual(['z', 'a']);
  });
  it('removes a deleted row', () => {
    expect(applyRemoteChange([{ id: 'a' }, { id: 'b' }], { type: 'delete', id: 'a' })).toEqual([{ id: 'b' }]);
  });
});

describe('sliceRegistry', () => {
  it('hydrates every registered slice and gives empty arrays to slices without rows', () => {
    const p = vi.fn(), c = vi.fn();
    const offP = sliceRegistry.register('patients', { hydrate: p, applyRemote: vi.fn() });
    const offC = sliceRegistry.register('cppt', { hydrate: c, applyRemote: vi.fn() });
    sliceRegistry.hydrateAll({ patients: [{ id: 'P1' }] });
    expect(p).toHaveBeenCalledWith([{ id: 'P1' }]);
    expect(c).toHaveBeenCalledWith([]);
    offP(); offC();
  });
});
```

`src/data-layer/useSlice.test.ts` tests the non-React core:

```ts
import { describe, expect, it, vi } from 'vitest';
import { createSliceSetter, setSlicePersistence } from './useSlice';

const flush = () => new Promise(r => setTimeout(r, 0));

function harness(initial: { id: string; v: number }[], mode: 'local' | 'supabase') {
  const ref = { current: initial };
  const setState = vi.fn((next: typeof initial) => { ref.current = next; });
  const set = createSliceSetter('patients', mode, ref, setState);
  return { ref, setState, set };
}

describe('createSliceSetter', () => {
  it('chains function updaters against the latest value', () => {
    const h = harness([], 'local');
    h.set(prev => [...prev, { id: 'a', v: 1 }]);
    h.set(prev => [...prev, { id: 'b', v: 1 }]);
    expect(h.ref.current.map(r => r.id)).toEqual(['a', 'b']);
  });

  it('pushes only the diff in supabase mode', async () => {
    const push = vi.fn().mockResolvedValue(undefined);
    setSlicePersistence({ push, refetch: vi.fn(), onSaveError: vi.fn() });
    const h = harness([{ id: 'a', v: 1 }], 'supabase');
    h.set(prev => prev.map(r => ({ ...r, v: 2 })));
    await flush();
    expect(push).toHaveBeenCalledWith('patients', { upserts: [{ id: 'a', v: 2 }], deletes: [] });
    setSlicePersistence(null);
  });

  it('failed push rolls back to refetched rows and notifies', async () => {
    const onSaveError = vi.fn();
    const server = [{ id: 'a', v: 1 }];
    setSlicePersistence({ push: vi.fn().mockRejectedValue(new Error('rls')), refetch: vi.fn().mockResolvedValue(server), onSaveError });
    const h = harness([{ id: 'a', v: 1 }], 'supabase');
    h.set([{ id: 'a', v: 9 }]);
    await flush(); await flush();
    expect(onSaveError).toHaveBeenCalledOnce();
    expect(h.ref.current).toEqual(server);
    setSlicePersistence(null);
  });

  it('never pushes in local mode', async () => {
    const push = vi.fn();
    setSlicePersistence({ push, refetch: vi.fn(), onSaveError: vi.fn() });
    harness([], 'local').set([{ id: 'a', v: 1 }]);
    await flush();
    expect(push).not.toHaveBeenCalled();
    setSlicePersistence(null);
  });
});
```

- [ ] **Step 2: Run them to verify they fail**

Run: `npx vitest run src/data-layer`
Expected: FAIL. All four files report unresolved imports.

- [ ] **Step 3: Implement the modules**

`src/data-layer/config.ts`:

```ts
export type BackendMode = 'local' | 'supabase';
type Env = Record<string, string | boolean | undefined>;

export function getBackendMode(env: Env = import.meta.env): BackendMode {
  return env.VITE_SUPABASE_URL && env.VITE_SUPABASE_ANON_KEY ? 'supabase' : 'local';
}

/** Preset demo accounts are shown in local mode (prototype) and on the Vercel demo. */
export function isDemoMode(env: Env = import.meta.env): boolean {
  return getBackendMode(env) === 'local' || env.VITE_DEMO_MODE === 'true';
}
```

`src/data-layer/slices.ts`:

```ts
export const SLICES = {
  patients: { table: 'patients', localKey: 'simrs_patients' },
  registrations: { table: 'registrations', localKey: 'simrs_registrations' },
  generalConsents: { table: 'general_consents', localKey: 'simrs_generalConsents' },
  medicalRecords: { table: 'medical_records', localKey: 'simrs_medicalRecords' },
  cppt: { table: 'cppt', localKey: 'simrs_cppt' },
  informedConsents: { table: 'informed_consents', localKey: 'simrs_informedConsents' },
  coding: { table: 'coding', localKey: 'simrs_coding' },
  claims: { table: 'claims', localKey: 'simrs_claims' },
  billing: { table: 'billing', localKey: 'simrs_billing' },
  beds: { table: 'beds', localKey: 'simrs_beds' },
  dokumenBerkas: { table: 'dokumen_berkas', localKey: 'simrs_dokumenBerkas' },
  asuhanKeperawatan: { table: 'asuhan_keperawatan', localKey: 'simrs_asuhanKeperawatan' },
  resumeMedisList: { table: 'resume_medis', localKey: 'simrs_resume_medis' },
  staff: { table: 'staff_directory', localKey: 'simrs_users' },
} as const satisfies Record<string, { table: string; localKey: string }>;

export type SliceName = keyof typeof SLICES;
export const SLICE_NAMES = Object.keys(SLICES) as SliceName[];
export const SLICE_BY_TABLE = Object.fromEntries(
  SLICE_NAMES.map(n => [SLICES[n].table, n]),
) as Record<string, SliceName>;
```

`src/data-layer/diff.ts`:

```ts
export interface SliceDiff<T> { upserts: T[]; deletes: string[] }

export function diffById<T extends { id: string }>(prev: T[], next: T[]): SliceDiff<T> {
  const prevById = new Map(prev.map(r => [r.id, r]));
  const nextIds = new Set<string>();
  const upserts: T[] = [];
  for (const row of next) {
    nextIds.add(row.id);
    const old = prevById.get(row.id);
    if (old === undefined || (old !== row && JSON.stringify(old) !== JSON.stringify(row))) upserts.push(row);
  }
  const deletes = prev.filter(r => !nextIds.has(r.id)).map(r => r.id);
  return { upserts, deletes };
}
```

`src/data-layer/registry.ts`:

```ts
import type { SliceName } from './slices';

export type RemoteChange = { type: 'upsert'; row: { id: string } } | { type: 'delete'; id: string };
export interface SliceHandle { hydrate(rows: unknown[]): void; applyRemote(change: RemoteChange): void }

export function applyRemoteChange<T extends { id: string }>(list: T[], change: RemoteChange): T[] {
  if (change.type === 'delete') return list.filter(r => r.id !== change.id);
  const idx = list.findIndex(r => r.id === change.row.id);
  if (idx === -1) return [change.row as T, ...list];
  const copy = list.slice();
  copy[idx] = change.row as T;
  return copy;
}

const handles = new Map<SliceName, SliceHandle>();

export const sliceRegistry = {
  register(name: SliceName, handle: SliceHandle): () => void {
    handles.set(name, handle);
    return () => { if (handles.get(name) === handle) handles.delete(name); };
  },
  hydrateAll(rows: Partial<Record<SliceName, unknown[]>>): void {
    for (const [name, handle] of handles) handle.hydrate(rows[name] ?? []);
  },
  applyRemote(name: SliceName, change: RemoteChange): void {
    handles.get(name)?.applyRemote(change);
  },
};
```

`src/data-layer/useSlice.ts`:

```ts
import { useEffect, useMemo, useRef, useState, type Dispatch, type SetStateAction } from 'react';
import { getBackendMode, type BackendMode } from './config';
import { diffById, type SliceDiff } from './diff';
import { applyRemoteChange, sliceRegistry } from './registry';
import { SLICES, type SliceName } from './slices';

export interface SlicePersistence {
  push(name: SliceName, diff: SliceDiff<{ id: string }>): Promise<void>;
  refetch(name: SliceName): Promise<unknown[]>;
  onSaveError(err: unknown): void;
}

let persistence: SlicePersistence | null = null;
export function setSlicePersistence(p: SlicePersistence | null): void { persistence = p; }

export function createSliceSetter<T extends { id: string }>(
  name: SliceName,
  mode: BackendMode,
  ref: { current: T[] },
  setState: (next: T[]) => void,
): Dispatch<SetStateAction<T[]>> {
  return action => {
    const prev = ref.current;
    const next = typeof action === 'function' ? (action as (p: T[]) => T[])(prev) : action;
    if (next === prev) return;
    ref.current = next;
    setState(next);
    const p = persistence;
    if (mode !== 'supabase' || !p) return;
    const diff = diffById(prev, next);
    if (diff.upserts.length === 0 && diff.deletes.length === 0) return;
    p.push(name, diff).catch(async err => {
      p.onSaveError(err);
      const rows = (await p.refetch(name)) as T[];
      ref.current = rows;
      setState(rows);
    });
  };
}

export function useSlice<T extends { id: string }>(
  name: SliceName,
  localInit: () => T[],
): [T[], Dispatch<SetStateAction<T[]>>] {
  const mode = getBackendMode();
  const [state, setState] = useState<T[]>(() => (mode === 'local' ? localInit() : []));
  const ref = useRef(state);

  useEffect(() => {
    if (mode === 'local') localStorage.setItem(SLICES[name].localKey, JSON.stringify(state));
  }, [mode, name, state]);

  useEffect(() => sliceRegistry.register(name, {
    hydrate: rows => { ref.current = rows as T[]; setState(rows as T[]); },
    applyRemote: change => {
      const next = applyRemoteChange(ref.current, change);
      ref.current = next;
      setState(next);
    },
  }), [name]);

  const set = useMemo(() => createSliceSetter<T>(name, mode, ref, setState), [name, mode]);
  return [state, set];
}
```

- [ ] **Step 4: Run the tests**

Run: `npx vitest run src/data-layer`
Expected: PASS (all tests in the 4 files).

- [ ] **Step 5: Switch `AppContext.tsx` to `useSlice`.** Add:

```tsx
import { useSlice } from '../data-layer/useSlice';
import { getBackendMode } from '../data-layer/config';
```

Then, for each of the 14 slices below, change only the declaration line. The initializer body stays exactly as it is:

| Before | After |
|---|---|
| `const [users, setUsers] = useState<User[]>(() => {` | `const [users, setUsers] = useSlice<User>('staff', () => {` |
| `const [patients, setPatients] = useState<Patient[]>(() => {` | `const [patients, setPatients] = useSlice<Patient>('patients', () => {` |
| `const [registrations, setRegistrations] = useState<Registration[]>(() => {` | `const [registrations, setRegistrations] = useSlice<Registration>('registrations', () => {` |
| `const [generalConsents, setGeneralConsents] = useState<GeneralConsent[]>(() => {` | `... = useSlice<GeneralConsent>('generalConsents', () => {` |
| `const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>(() => {` | `... = useSlice<MedicalRecord>('medicalRecords', () => {` |
| `const [cppt, setCppt] = useState<CPPT[]>(() => {` | `... = useSlice<CPPT>('cppt', () => {` |
| `const [informedConsents, ...] = useState<InformedConsent[]>(() => {` | `... = useSlice<InformedConsent>('informedConsents', () => {` |
| `const [coding, setCoding] = useState<Coding[]>(() => {` | `... = useSlice<Coding>('coding', () => {` |
| `const [claims, setClaims] = useState<Claim[]>(() => {` | `... = useSlice<Claim>('claims', () => {` |
| `const [billing, setBilling] = useState<Billing[]>(() => {` | `... = useSlice<Billing>('billing', () => {` |
| `const [beds, setBeds] = useState<Bed[]>(() => {` | `... = useSlice<Bed>('beds', () => {` |
| `const [dokumenBerkas, ...] = useState<DokumenBerkas[]>(() => {` | `... = useSlice<DokumenBerkas>('dokumenBerkas', () => {` |
| `const [asuhanKeperawatan, ...] = useState<AsuhanKeperawatan[]>(() => {` | `... = useSlice<AsuhanKeperawatan>('asuhanKeperawatan', () => {` |
| `const [resumeMedisList, ...] = useState<ResumeMedis[]>(() => {` | `... = useSlice<ResumeMedis>('resumeMedisList', () => {` |

Delete these persistence effects, because `useSlice` now writes to `localStorage` itself:
- `simrs_users`, `simrs_patients`, `simrs_registrations`, `simrs_generalConsents`, `simrs_medicalRecords`
- `simrs_cppt`, `simrs_informedConsents`, `simrs_coding`, `simrs_claims`, `simrs_billing`
- `simrs_beds`, `simrs_dokumenBerkas`, `simrs_asuhanKeperawatan`, `simrs_resume_medis`

Declare the mode **immediately after** the line `const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);`. Later tasks insert code right after this line and rely on `backendMode` already being defined:

```tsx
  const backendMode = getBackendMode();
```

Then guard the remaining three effects so they only write in local mode:

```tsx
  useEffect(() => { if (backendMode === 'local') localStorage.setItem('simrs_roles', JSON.stringify(roles)); }, [backendMode, roles]);
  useEffect(() => { if (backendMode === 'local') localStorage.setItem('simrs_auditTrail', JSON.stringify(auditTrail)); }, [backendMode, auditTrail]);
  useEffect(() => {
    if (backendMode !== 'local') return;
    if (user) localStorage.setItem('simrs_current_user', JSON.stringify(user));
    else localStorage.removeItem('simrs_current_user');
  }, [backendMode, user]);
```

- [ ] **Step 6: Check that no persisted slice still uses `useState`**

Run: `grep -nE "useState<(User|Patient|Registration|GeneralConsent|MedicalRecord|CPPT|InformedConsent|Coding|Claim|Billing|Bed|DokumenBerkas|AsuhanKeperawatan|ResumeMedis)\[\]>" src/context/AppContext.tsx`
Expected: no output.

- [ ] **Step 7: Type-check, build and test**

Run: `npm run lint && npm run build && npm test`
Expected: all pass.

- [ ] **Step 8: Run a local-mode regression in the browser.** Run `npm run dev` and log in as "Mahasiswa Pendaftaran". Then:
  1. Register a new patient.
  2. Reload the page and confirm the patient is still listed (proving `localStorage` persistence).
  3. Log out, log in as "Mahasiswa Coding", and save a coding for an existing registration.
  4. Reload again and confirm the coding persisted.

Stop the server.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "refactor: route persisted state through useSlice data-layer seam

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

## Phase 4 — Database (PR 3)

Every task in this phase applies migrations to **`simrs-ueu-dev`** and tests there. Link the CLI once:

```bash
npm install --save-dev supabase@^2
npx supabase init            # creates supabase/config.toml; answer "N" to VS Code / IntelliJ prompts
npx supabase login
npx supabase link --project-ref <simrs-ueu-dev project ref>
```

Create `.env.test.local`. It is ignored by git through `.env*`; verify with `git check-ignore .env.test.local`, which must print the path.

```dotenv
SUPABASE_TEST_URL=https://<dev-ref>.supabase.co
SUPABASE_TEST_ANON_KEY=<dev anon key>
SUPABASE_TEST_SERVICE_ROLE_KEY=<dev service-role key>
```

### Task 5: Core identity schema, helper functions and the integration-test harness

**Files:**
- Create: `supabase/migrations/20261009000100_core_identity.sql`
- Create: `vitest.integration.config.ts`, `tests/integration/setup.ts`, `tests/integration/helpers.ts`
- Create test: `tests/integration/identity.test.ts`

**Interfaces:**
- Produces:
  - SQL tables `classes`, `profiles`, `class_members`, `practice_roles`, `table_modules`, `practice_sessions`
  - schema `private`
  - functions `public.account_type()`, `public.is_class_member(uuid)`, `public.is_class_dosen(uuid)`, `public.can_read_class(uuid)`, `public.can_write(uuid, text)`
  - test helpers `admin`, `makeUser(type, opts?)`, `addMember(classId, userId, role)`, `insertClassDirect(name)`, `cleanupUsers()`

- [ ] **Step 1: Write the integration harness**

`vitest.integration.config.ts`:

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/integration/**/*.test.ts'],
    setupFiles: ['tests/integration/setup.ts'],
    testTimeout: 30_000,
    hookTimeout: 60_000,
    fileParallelism: false,
  },
});
```

`tests/integration/setup.ts`:

```ts
import { existsSync } from 'node:fs';

if (existsSync('.env.test.local')) process.loadEnvFile('.env.test.local');
for (const k of ['SUPABASE_TEST_URL', 'SUPABASE_TEST_ANON_KEY', 'SUPABASE_TEST_SERVICE_ROLE_KEY']) {
  if (!process.env[k]) throw new Error(`Missing ${k}; see docs/superpowers/plans (Phase 4 intro)`);
}
```

`tests/integration/helpers.ts`:

```ts
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = () => process.env.SUPABASE_TEST_URL!;
const anonKey = () => process.env.SUPABASE_TEST_ANON_KEY!;
export const EMAIL_DOMAIN = 'users.simrs-ueu.invalid';

export const admin = (): SupabaseClient =>
  createClient(url(), process.env.SUPABASE_TEST_SERVICE_ROLE_KEY!, { auth: { persistSession: false } });

export const anon = (): SupabaseClient => createClient(url(), anonKey(), { auth: { persistSession: false } });

const created: string[] = [];

export interface TestUser { id: string; username: string; password: string; client: SupabaseClient }

export async function makeUser(
  type: 'admin' | 'dosen' | 'mahasiswa',
  opts: { active?: boolean } = {},
): Promise<TestUser> {
  const username = `t${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
  const password = `Pw-${Math.random().toString(36).slice(2)}A1`;
  const { data, error } = await admin().auth.admin.createUser({
    email: `${username}@${EMAIL_DOMAIN}`, password, email_confirm: true,
  });
  if (error) throw error;
  created.push(data.user.id);
  const { error: pErr } = await admin().from('profiles').insert({
    id: data.user.id, username, full_name: `Test ${type} ${username}`, account_type: type, active: opts.active ?? true,
  });
  if (pErr) throw pErr;
  const client = anon();
  const { error: sErr } = await client.auth.signInWithPassword({ email: `${username}@${EMAIL_DOMAIN}`, password });
  if (sErr) throw sErr;
  return { id: data.user.id, username, password, client };
}

export async function insertClassDirect(name = `TEST-${Date.now()}`): Promise<string> {
  const { data, error } = await admin().from('classes').insert({ name }).select('id').single();
  if (error) throw error;
  return data.id as string;
}

export async function addMember(classId: string, userId: string, role: 'dosen' | 'mahasiswa', active = true) {
  const { error } = await admin().from('class_members').insert({ class_id: classId, user_id: userId, member_role: role, active });
  if (error) throw error;
}

export async function cleanupUsers() {
  while (created.length) {
    const id = created.pop()!;
    await admin().auth.admin.deleteUser(id);
  }
}
```

- [ ] **Step 2: Write the failing test** `tests/integration/identity.test.ts`

```ts
import { afterAll, describe, expect, it } from 'vitest';
import { addMember, cleanupUsers, insertClassDirect, makeUser } from './helpers';

afterAll(cleanupUsers);

describe('identity helpers', () => {
  it('account_type returns the caller type, and null for inactive accounts', async () => {
    const d = await makeUser('dosen');
    const x = await makeUser('mahasiswa', { active: false });
    expect((await d.client.rpc('account_type')).data).toBe('dosen');
    expect((await x.client.rpc('account_type')).data).toBeNull();
  });

  it('class membership controls can_read_class', async () => {
    const cls = await insertClassDirect();
    const m = await makeUser('mahasiswa');
    const outsider = await makeUser('mahasiswa');
    await addMember(cls, m.id, 'mahasiswa');
    expect((await m.client.rpc('can_read_class', { p_class: cls })).data).toBe(true);
    expect((await outsider.client.rpc('can_read_class', { p_class: cls })).data).toBe(false);
  });

  it('students cannot read other students\' profiles outside their classes', async () => {
    const a = await makeUser('mahasiswa');
    const b = await makeUser('mahasiswa');
    const { data } = await a.client.from('profiles').select('id').eq('id', b.id);
    expect(data).toEqual([]);
  });
});
```

- [ ] **Step 3: Run it to verify it fails**

Run: `npm run test:integration -- identity`
Expected: FAIL; `profiles` does not exist, so the insert in `makeUser` errors with `relation "public.profiles" does not exist`.

- [ ] **Step 4: Write the migration** `supabase/migrations/20261009000100_core_identity.sql`

```sql
create extension if not exists pgcrypto;
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create table public.classes (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) > 0),
  is_template boolean not null default false,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
create unique index classes_single_template on public.classes (is_template) where is_template;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique check (username ~ '^[a-z0-9._-]+$'),
  full_name text not null check (length(trim(full_name)) > 0),
  account_type text not null check (account_type in ('admin', 'dosen', 'mahasiswa')),
  must_change_password boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.class_members (
  class_id uuid not null references public.classes(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  member_role text not null check (member_role in ('dosen', 'mahasiswa')),
  active boolean not null default true,
  primary key (class_id, user_id)
);

create table public.practice_roles (
  id text primary key,
  name text not null,
  access text[] not null default '{}'
);

create table public.table_modules (
  table_name text primary key,
  modules text[] not null
);

insert into public.table_modules (table_name, modules) values
  ('patients',           '{pendaftaran}'),
  ('registrations',      '{pendaftaran,bedmanagement}'),
  ('beds',               '{pendaftaran,bedmanagement}'),
  ('general_consents',   '{pendaftaran,generalconsent}'),
  ('medical_records',    '{rekammedis,pemeriksaan}'),
  ('billing',            '{rekammedis,pemeriksaan,billing,pembayaran}'),
  ('cppt',               '{rekammedis,cppt}'),
  ('informed_consents',  '{informedconsent}'),
  ('coding',             '{coding,rekammedis,pemeriksaan}'),
  ('claims',             '{klaim}'),
  ('resume_medis',       '{resumemedis}'),
  ('asuhan_keperawatan', '{keperawatan}'),
  ('dokumen_berkas',     '{pendaftaran,rekammedis,cppt,keperawatan,resumemedis,laboratorium,radiologi,coding}'),
  ('staff_directory',    '{manajemenuser}');

create table public.practice_sessions (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  class_id uuid not null references public.classes(id) on delete cascade,
  role_id text not null references public.practice_roles(id),
  started_at timestamptz not null default now(),
  ended_at timestamptz
);
create unique index practice_sessions_one_open on public.practice_sessions (user_id) where ended_at is null;

-- Helper predicates (security definer so RLS policies can call them without recursion)
create or replace function public.account_type() returns text
language sql stable security definer set search_path = public as $$
  select account_type from public.profiles where id = auth.uid() and active
$$;

create or replace function public.is_class_member(p_class uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.class_members m join public.profiles p on p.id = m.user_id
    where m.class_id = p_class and m.user_id = auth.uid() and m.active and p.active
  )
$$;

create or replace function public.is_class_dosen(p_class uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.class_members m join public.profiles p on p.id = m.user_id
    where m.class_id = p_class and m.user_id = auth.uid() and m.active and p.active and m.member_role = 'dosen'
  )
$$;

create or replace function public.can_read_class(p_class uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce(public.account_type() = 'admin', false) or public.is_class_member(p_class)
$$;

create or replace function public.can_write(p_class uuid, p_table text) returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce(public.account_type() = 'admin', false)
      or public.is_class_dosen(p_class)
      or (public.is_class_member(p_class) and exists (
            select 1
            from public.practice_sessions s
            join public.practice_roles r on r.id = s.role_id
            join public.table_modules t on t.table_name = p_table
            where s.user_id = auth.uid() and s.ended_at is null and s.class_id = p_class
              and ('all' = any (r.access) or r.access && t.modules)))
$$;

-- Row-level security
alter table public.classes enable row level security;
alter table public.profiles enable row level security;
alter table public.class_members enable row level security;
alter table public.practice_roles enable row level security;
alter table public.table_modules enable row level security;
alter table public.practice_sessions enable row level security;

create policy classes_select on public.classes for select to authenticated using (public.can_read_class(id));

create policy profiles_select on public.profiles for select to authenticated using (
  id = auth.uid()
  or coalesce(public.account_type() = 'admin', false)
  or exists (select 1 from public.class_members m where m.user_id = profiles.id and public.is_class_member(m.class_id))
);

create policy class_members_select on public.class_members for select to authenticated
  using (public.can_read_class(class_id));

create policy practice_roles_select on public.practice_roles for select to authenticated using (true);
create policy practice_roles_update on public.practice_roles for update to authenticated
  using (coalesce(public.account_type() = 'admin', false))
  with check (coalesce(public.account_type() = 'admin', false));

create policy table_modules_select on public.table_modules for select to authenticated using (true);

create policy practice_sessions_select on public.practice_sessions for select to authenticated using (
  user_id = auth.uid() or coalesce(public.account_type() = 'admin', false) or public.is_class_dosen(class_id)
);

revoke all on all tables in schema public from anon;
```

- [ ] **Step 5: Apply it and run the test**

Run: `npx supabase db push`, then `npm run test:integration -- identity`
Expected: `db push` lists the migration as applied, and the test PASSes (3 tests).

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat(db): core identity schema, access helpers, integration harness

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

### Task 6: Clinical tables with RLS

**Files:**
- Create: `supabase/migrations/20261009000200_clinical_tables.sql`
- Create test: `tests/integration/rls.test.ts`

**Interfaces:**
- Consumes: `can_read_class`, `can_write`, `table_modules` (Task 5).
- Produces: 14 tables (`patients`, `registrations`, `general_consents`, `informed_consents`, `medical_records`, `cppt`, `asuhan_keperawatan`, `resume_medis`, `coding`, `claims`, `billing`, `beds`, `dokumen_berkas`, `staff_directory`). Each has the columns `class_id uuid, id text, data jsonb, seq bigint, created_by, updated_by, created_at, updated_at`, primary key `(class_id, id)`, and Realtime enabled. Also `private.clinical_tables()` returns the same 14 names.

- [ ] **Step 1: Write the failing test** `tests/integration/rls.test.ts`. The practice session is opened by direct insert with the service role, because `start_practice_session` only arrives in Task 8.

```ts
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { addMember, admin, cleanupUsers, insertClassDirect, makeUser, type TestUser } from './helpers';

const ROLES = [
  { id: 'R04', name: 'Mahasiswa (All Modul)', access: ['all'] },
  { id: 'R05', name: 'Dokter', access: ['dashboard', 'rekammedis', 'cppt', 'informedconsent', 'resumemedis', 'laboratorium', 'radiologi'] },
  { id: 'R07', name: 'Mahasiswa Pendaftaran', access: ['dashboard', 'pendaftaran', 'generalconsent', 'vclaim', 'sep'] },
  { id: 'R09', name: 'Mahasiswa Coding', access: ['dashboard', 'coding', 'klaim', 'eklaim'] },
];

async function openSession(u: TestUser, classId: string, roleId: string) {
  await admin().from('practice_sessions').update({ ended_at: new Date().toISOString() }).eq('user_id', u.id).is('ended_at', null);
  const { error } = await admin().from('practice_sessions').insert({ user_id: u.id, class_id: classId, role_id: roleId });
  if (error) throw error;
}

const row = (classId: string, id: string) => ({ class_id: classId, id, data: { id } });

let classA: string, classB: string, coder: TestUser, registrar: TestUser, doctor: TestUser, allRole: TestUser, dosen: TestUser;

beforeAll(async () => {
  await admin().from('practice_roles').upsert(ROLES);
  classA = await insertClassDirect();
  classB = await insertClassDirect();
  [coder, registrar, doctor, allRole, dosen] = await Promise.all([
    makeUser('mahasiswa'), makeUser('mahasiswa'), makeUser('mahasiswa'), makeUser('mahasiswa'), makeUser('dosen'),
  ]);
  for (const u of [coder, registrar, doctor, allRole]) await addMember(classA, u.id, 'mahasiswa');
  await addMember(classA, dosen.id, 'dosen');
  await openSession(coder, classA, 'R09');
  await openSession(registrar, classA, 'R07');
  await openSession(doctor, classA, 'R05');
  await openSession(allRole, classA, 'R04');
});
afterAll(cleanupUsers);

describe('clinical table RLS', () => {
  it('a coding student cannot write patients but can write coding and claims', async () => {
    expect((await coder.client.from('patients').insert(row(classA, 'P-x1'))).error).not.toBeNull();
    expect((await coder.client.from('coding').insert(row(classA, 'C-1'))).error).toBeNull();
    expect((await coder.client.from('claims').insert(row(classA, 'K-1'))).error).toBeNull();
  });

  it('cross-module writes allowed by table_modules', async () => {
    // Doctor (rekammedis) saving an exam also writes billing, coding and cppt.
    for (const t of ['medical_records', 'billing', 'coding', 'cppt']) {
      expect((await doctor.client.from(t).insert(row(classA, `${t}-d1`))).error, t).toBeNull();
    }
    // Registration also writes general consent and beds.
    for (const t of ['patients', 'registrations', 'general_consents', 'beds']) {
      expect((await registrar.client.from(t).insert(row(classA, `${t}-r1`))).error, t).toBeNull();
    }
  });

  it('R04 can write every clinical table', async () => {
    const { data: tables } = await admin().rpc('clinical_table_names');
    for (const t of tables as string[]) {
      expect((await allRole.client.from(t).insert(row(classA, `${t}-all`))).error, t).toBeNull();
    }
  });

  it('nobody reads or writes another class', async () => {
    await admin().from('patients').insert(row(classB, 'P-b1'));
    expect((await allRole.client.from('patients').select('id').eq('class_id', classB)).data).toEqual([]);
    expect((await allRole.client.from('patients').insert(row(classB, 'P-b2'))).error).not.toBeNull();
  });

  it('a class dosen writes anything in their class without a practice session', async () => {
    expect((await dosen.client.from('claims').insert(row(classA, 'K-dsn'))).error).toBeNull();
  });

  it('data.id must match the row id', async () => {
    const bad = { class_id: classA, id: 'C-2', data: { id: 'other' } };
    expect((await coder.client.from('coding').insert(bad)).error).not.toBeNull();
  });

  it('class_id cannot be changed by update', async () => {
    await coder.client.from('coding').insert(row(classA, 'C-move'));
    const { error } = await admin().from('coding').update({ class_id: classB }).eq('class_id', classA).eq('id', 'C-move');
    expect(error).not.toBeNull();
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npm run test:integration -- rls`
Expected: FAIL with `relation "public.patients" does not exist` or a missing-function error for `clinical_table_names`.

- [ ] **Step 3: Write the migration** `supabase/migrations/20261009000200_clinical_tables.sql`

```sql
create or replace function private.clinical_tables() returns text[]
language sql immutable as $$
  select array['patients','registrations','general_consents','informed_consents','medical_records','cppt',
               'asuhan_keperawatan','resume_medis','coding','claims','billing','beds','dokumen_berkas','staff_directory']
$$;

-- Exposed read-only so tests and tooling can enumerate tables.
create or replace function public.clinical_table_names() returns text[]
language sql immutable security definer set search_path = public as $$
  select private.clinical_tables()
$$;

create or replace function private.stamp_row() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    new.created_by := auth.uid();
    new.created_at := now();
  else
    if new.class_id is distinct from old.class_id or new.id is distinct from old.id then
      raise exception 'class_id and id cannot change' using errcode = '42501';
    end if;
    new.created_by := old.created_by;
    new.created_at := old.created_at;
  end if;
  new.updated_by := auth.uid();
  new.updated_at := now();
  return new;
end $$;

do $$
declare t text;
begin
  foreach t in array private.clinical_tables() loop
    execute format($f$
      create table public.%1$I (
        class_id uuid not null references public.classes(id) on delete cascade,
        id text not null check (length(id) between 1 and 200),
        data jsonb not null check (jsonb_typeof(data) = 'object' and data->>'id' = id),
        seq bigint generated always as identity,
        created_by uuid,
        updated_by uuid,
        created_at timestamptz not null default now(),
        updated_at timestamptz not null default now(),
        primary key (class_id, id)
      );
      create index %1$s_class_order on public.%1$I (class_id, created_at desc, seq);
      alter table public.%1$I enable row level security;
      create trigger stamp_row before insert or update on public.%1$I
        for each row execute function private.stamp_row();
      create policy %1$s_select on public.%1$I for select to authenticated
        using (public.can_read_class(class_id));
      create policy %1$s_insert on public.%1$I for insert to authenticated
        with check (public.can_write(class_id, %1$L));
      create policy %1$s_update on public.%1$I for update to authenticated
        using (public.can_write(class_id, %1$L)) with check (public.can_write(class_id, %1$L));
      create policy %1$s_delete on public.%1$I for delete to authenticated
        using (public.can_write(class_id, %1$L));
      alter publication supabase_realtime add table public.%1$I;
      revoke all on public.%1$I from anon;
    $f$, t);
  end loop;
end $$;
```

- [ ] **Step 4: Apply and test**

Run: `npx supabase db push && npm run test:integration -- rls`
Expected: PASS (7 tests).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(db): clinical tables with class and practice-role RLS

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

### Task 7: Append-only audit log

**Files:**
- Create: `supabase/migrations/20261009000300_audit.sql`
- Create test: `tests/integration/audit.test.ts`

**Interfaces:**
- Consumes: the clinical tables and `private.clinical_tables()` (Task 6).
- Produces:
  - table `public.audit_log (id bigint, at timestamptz, class_id uuid, actor_id uuid, actor_name text, practice_role_id text, action text, entity text, entity_id text, module text, old_data jsonb, new_data jsonb, details jsonb)`
  - `public.audit_actor()`
  - `private.write_event(p_class uuid, p_action text, p_entity text, p_entity_id text, p_details jsonb)`
  - RPC `public.log_event(p_action text, p_entity text, p_entity_id text, p_details jsonb)`, which allows only `NAVIGATE`
  - audit trigger on all clinical tables and `practice_roles`, skipped when `simrs.skip_audit = 'on'`

- [ ] **Step 1: Write the failing test** `tests/integration/audit.test.ts`

```ts
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { addMember, admin, cleanupUsers, insertClassDirect, makeUser, type TestUser } from './helpers';

let cls: string, u: TestUser;

beforeAll(async () => {
  await admin().from('practice_roles').upsert([{ id: 'R04', name: 'Mahasiswa (All Modul)', access: ['all'] }]);
  cls = await insertClassDirect();
  u = await makeUser('mahasiswa');
  await addMember(cls, u.id, 'mahasiswa');
  await admin().from('practice_sessions').insert({ user_id: u.id, class_id: cls, role_id: 'R04' });
});
afterAll(cleanupUsers);

describe('audit_log', () => {
  it('records create, update and delete with actor and practice role', async () => {
    await u.client.from('cppt').insert({ class_id: cls, id: 'CP1', data: { id: 'CP1', s: 'a' } });
    await u.client.from('cppt').update({ data: { id: 'CP1', s: 'b' } }).eq('class_id', cls).eq('id', 'CP1');
    await u.client.from('cppt').delete().eq('class_id', cls).eq('id', 'CP1');
    const { data } = await admin().from('audit_log').select('*').eq('class_id', cls).eq('entity_id', 'CP1').order('id');
    expect(data!.map(r => r.action)).toEqual(['CREATE', 'UPDATE', 'DELETE']);
    expect(data![1].old_data).toEqual({ id: 'CP1', s: 'a' });
    expect(data![1].new_data).toEqual({ id: 'CP1', s: 'b' });
    expect(data![0].actor_id).toBe(u.id);
    expect(data![0].practice_role_id).toBe('R04');
    expect(data![0].entity).toBe('cppt');
  });

  it('rejects update and delete even for the service role', async () => {
    const { data } = await admin().from('audit_log').select('id').eq('class_id', cls).limit(1).single();
    expect((await admin().from('audit_log').update({ action: 'DELETE' }).eq('id', data!.id)).error).not.toBeNull();
    expect((await admin().from('audit_log').delete().eq('id', data!.id)).error).not.toBeNull();
  });

  it('clients cannot insert audit rows directly', async () => {
    const { error } = await u.client.from('audit_log').insert({ action: 'LOGIN', entity: 'User' });
    expect(error).not.toBeNull();
  });

  it('log_event accepts NAVIGATE and refuses other actions', async () => {
    expect((await u.client.rpc('log_event', { p_action: 'NAVIGATE', p_entity: 'Page', p_entity_id: 'coding', p_details: { module: 'coding' } })).error).toBeNull();
    expect((await u.client.rpc('log_event', { p_action: 'DELETE', p_entity: 'X', p_entity_id: '1', p_details: null })).error).not.toBeNull();
  });

  it('class members read their class audit; outsiders do not', async () => {
    const outsider = await makeUser('mahasiswa');
    expect((await u.client.from('audit_log').select('id').eq('class_id', cls)).data!.length).toBeGreaterThan(0);
    expect((await outsider.client.from('audit_log').select('id').eq('class_id', cls)).data).toEqual([]);
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npm run test:integration -- audit`
Expected: FAIL with `relation "public.audit_log" does not exist`.

- [ ] **Step 3: Write the migration** `supabase/migrations/20261009000300_audit.sql`

```sql
create table public.audit_log (
  id bigint generated always as identity primary key,
  at timestamptz not null default now(),
  class_id uuid references public.classes(id),
  actor_id uuid,
  actor_name text,
  practice_role_id text,
  action text not null check (action in ('CREATE','UPDATE','DELETE','LOGIN','LOGOUT','NAVIGATE','RESET')),
  entity text not null,
  entity_id text,
  module text,
  old_data jsonb,
  new_data jsonb,
  details jsonb
);
create index audit_log_class_at on public.audit_log (class_id, at desc);

create or replace function public.audit_actor()
returns table (actor_id uuid, actor_name text, role_id text)
language sql stable security definer set search_path = public as $$
  select auth.uid(),
         (select full_name from public.profiles where id = auth.uid()),
         (select role_id from public.practice_sessions where user_id = auth.uid() and ended_at is null)
$$;

create or replace function private.audit_row_change() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  a record;
  v_row jsonb := case when tg_op = 'DELETE' then to_jsonb(old) else to_jsonb(new) end;
begin
  if coalesce(current_setting('simrs.skip_audit', true), '') = 'on' then
    return null;
  end if;
  select * into a from public.audit_actor();
  insert into public.audit_log (class_id, actor_id, actor_name, practice_role_id, action, entity, entity_id, module, old_data, new_data)
  values (
    (v_row->>'class_id')::uuid, a.actor_id, a.actor_name, a.role_id,
    case tg_op when 'INSERT' then 'CREATE' when 'UPDATE' then 'UPDATE' else 'DELETE' end,
    tg_table_name, v_row->>'id', tg_table_name,
    case when tg_op <> 'INSERT' then coalesce(to_jsonb(old)->'data', to_jsonb(old)) end,
    case when tg_op <> 'DELETE' then coalesce(to_jsonb(new)->'data', to_jsonb(new)) end
  );
  return null;
end $$;

do $$
declare t text;
begin
  foreach t in array private.clinical_tables() || array['practice_roles'] loop
    execute format('create trigger audit_row_change after insert or update or delete on public.%I
                    for each row execute function private.audit_row_change()', t);
  end loop;
end $$;

create or replace function private.audit_log_immutable() returns trigger
language plpgsql as $$
begin
  raise exception 'audit_log is append-only' using errcode = '42501';
end $$;
create trigger audit_log_no_update before update or delete on public.audit_log
  for each row execute function private.audit_log_immutable();
create trigger audit_log_no_truncate before truncate on public.audit_log
  for each statement execute function private.audit_log_immutable();

create or replace function private.write_event(p_class uuid, p_action text, p_entity text, p_entity_id text, p_details jsonb)
returns void language sql security definer set search_path = public as $$
  insert into public.audit_log (class_id, actor_id, actor_name, practice_role_id, action, entity, entity_id, module, details)
  select p_class, a.actor_id, a.actor_name, a.role_id, p_action, p_entity, p_entity_id, p_details->>'module', p_details
  from public.audit_actor() a
$$;

create or replace function public.log_event(p_action text, p_entity text, p_entity_id text, p_details jsonb default null)
returns void language plpgsql security definer set search_path = public as $$
declare v_class uuid;
begin
  if auth.uid() is null then raise exception 'not authenticated' using errcode = '42501'; end if;
  if p_action <> 'NAVIGATE' then raise exception 'event % not allowed from client', p_action using errcode = '42501'; end if;
  select class_id into v_class from public.practice_sessions where user_id = auth.uid() and ended_at is null;
  perform private.write_event(v_class, p_action, p_entity, p_entity_id, p_details);
end $$;

alter table public.audit_log enable row level security;
revoke insert, update, delete, truncate on public.audit_log from anon, authenticated;
create policy audit_select on public.audit_log for select to authenticated using (
  coalesce(public.account_type() = 'admin', false) or (class_id is not null and public.can_read_class(class_id))
);
alter publication supabase_realtime add table public.audit_log;
revoke execute on function public.log_event(text, text, text, jsonb) from anon;
```

- [ ] **Step 4: Apply and test**

Run: `npx supabase db push && npm run test:integration -- audit`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(db): append-only audit log with row triggers and log_event

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

### Task 8: Practice sessions, class lifecycle, and the template seed

**Files:**
- Create: `supabase/migrations/20261009000400_sessions_and_classes.sql`
- Create: `scripts/build-seed.ts`, `scripts/build-seed.test.ts`
- Create (generated, committed): `supabase/seed.sql`
- Create tests: `tests/integration/session.test.ts`, `tests/integration/lifecycle.test.ts`

**Interfaces:**
- Consumes: `private.write_event` (Task 7), `private.clinical_tables()` (Task 6), `INITIAL_*` from `src/data/mockData.ts`, `buildTodayRegistrations` (Task 3).
- Produces:
  - RPCs `start_practice_session(p_class uuid, p_role text) returns practice_sessions`, `end_practice_session() returns void`, `my_practice_session() returns setof practice_sessions`, `my_classes() returns table(id uuid, name text)`, `clear_must_change_password() returns void`, `create_class(p_name text) returns uuid`, `reset_class(p_class uuid) returns void`
  - `buildSeedSql(): string` (pure function in `scripts/build-seed.ts`)

- [ ] **Step 1: Write the failing seed-builder unit test** `scripts/build-seed.test.ts`

```ts
import { describe, expect, it } from 'vitest';
import { buildSeedSql, sqlLiteral, TEMPLATE_CLASS_ID } from './build-seed';

describe('sqlLiteral', () => {
  it('doubles single quotes', () => {
    expect(sqlLiteral("Jum'at")).toBe("'Jum''at'");
  });
});

describe('buildSeedSql', () => {
  const sql = buildSeedSql();
  it('creates the template class and keeps existing role edits', () => {
    expect(sql).toContain(`'${TEMPLATE_CLASS_ID}'`);
    expect(sql).toMatch(/insert into public\.practice_roles[\s\S]+on conflict \(id\) do nothing/);
  });
  it('seeds staff without passwords', () => {
    expect(sql).toContain('insert into public.staff_directory');
    expect(sql).not.toMatch(/"password"/);
  });
  it('seeds today registrations with placeholders', () => {
    expect(sql).toContain('__TODAY__');
    expect(sql).toContain('__TODAYCOMPACT__');
  });
  it('gives R03 the manajemenuser module and no praktikum', () => {
    const r03 = sql.split('\n').find(l => l.includes("'R03'"))!;
    expect(r03).toContain('manajemenuser');
    expect(r03).not.toContain('praktikum');
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run scripts/build-seed.test.ts`
Expected: FAIL, `Failed to resolve import "./build-seed"`.

- [ ] **Step 3: Implement** `scripts/build-seed.ts`

```ts
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import {
  INITIAL_USERS, INITIAL_ROLES, INITIAL_PATIENTS, INITIAL_REGISTRATIONS, INITIAL_GENERAL_CONSENTS,
  INITIAL_MEDICAL_RECORDS, INITIAL_CPPT, INITIAL_INFORMED_CONSENTS, INITIAL_CODING, INITIAL_CLAIMS,
  INITIAL_BILLING, INITIAL_BEDS, INITIAL_DOKUMEN_BERKAS, INITIAL_RESUME_MEDIS,
} from '../src/data/mockData';
import { buildTodayRegistrations, sanitizeMedicalRecords, sanitizePatientList } from '../src/data/seedNormalizers';

export const TEMPLATE_CLASS_ID = '00000000-0000-0000-0000-000000000001';

export const sqlLiteral = (s: string) => `'${s.replace(/'/g, "''")}'`;

const textArray = (xs: string[]) => `array[${xs.map(sqlLiteral).join(',')}]::text[]`;

function rolesForSeed() {
  return INITIAL_ROLES.map(r => r.id === 'R03'
    ? { ...r, access: Array.from(new Set([...r.access.filter(a => a !== 'praktikum'), 'manajemenuser'])) }
    : r);
}

function insertRows(table: string, rows: { id: string }[]): string {
  if (rows.length === 0) return '';
  const values = rows
    .map(r => `  (${sqlLiteral(TEMPLATE_CLASS_ID)}, ${sqlLiteral(r.id)}, ${sqlLiteral(JSON.stringify(r))}::jsonb)`)
    .join(',\n');
  return `insert into public.${table} (class_id, id, data) values\n${values};\n`;
}

export function buildSeedSql(): string {
  const staff = INITIAL_USERS.map(({ password: _pw, ...u }) => u);
  const tables: [string, { id: string }[]][] = [
    ['staff_directory', staff],
    ['patients', sanitizePatientList(INITIAL_PATIENTS)],
    ['registrations', [...buildTodayRegistrations('__TODAY__', '__TODAYCOMPACT__'), ...INITIAL_REGISTRATIONS]],
    ['general_consents', INITIAL_GENERAL_CONSENTS],
    ['medical_records', sanitizeMedicalRecords(INITIAL_MEDICAL_RECORDS)],
    ['cppt', INITIAL_CPPT],
    ['informed_consents', INITIAL_INFORMED_CONSENTS],
    ['coding', INITIAL_CODING],
    ['claims', INITIAL_CLAIMS],
    ['billing', INITIAL_BILLING],
    ['beds', INITIAL_BEDS],
    ['dokumen_berkas', INITIAL_DOKUMEN_BERKAS],
    ['resume_medis', INITIAL_RESUME_MEDIS],
    ['asuhan_keperawatan', []],
  ];

  const roleValues = rolesForSeed()
    .map(r => `  (${sqlLiteral(r.id)}, ${sqlLiteral(r.name)}, ${textArray(r.access)})`)
    .join(',\n');

  return [
    '-- GENERATED by scripts/build-seed.ts from src/data/mockData.ts. Do not edit by hand; run `npm run seed:build`.',
    'begin;',
    "select set_config('simrs.skip_audit', 'on', true);",
    `insert into public.practice_roles (id, name, access) values\n${roleValues}\non conflict (id) do nothing;`,
    `insert into public.classes (id, name, is_template) values (${sqlLiteral(TEMPLATE_CLASS_ID)}, 'TEMPLATE (jangan dipakai)', true) on conflict (id) do nothing;`,
    ...tables.map(([t]) => `delete from public.${t} where class_id = ${sqlLiteral(TEMPLATE_CLASS_ID)};`),
    ...tables.map(([t, rows]) => insertRows(t, rows)),
    'commit;',
    '',
  ].join('\n');
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  writeFileSync('supabase/seed.sql', buildSeedSql());
  console.log('wrote supabase/seed.sql');
}
```

- [ ] **Step 4: Run the unit test, then generate the seed**

Run: `npx vitest run scripts/build-seed.test.ts && npm run seed:build`
Expected: PASS (5 tests), then `wrote supabase/seed.sql`.

- [ ] **Step 5: Write the failing integration tests**

`tests/integration/session.test.ts`:

```ts
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { addMember, anon, cleanupUsers, EMAIL_DOMAIN, insertClassDirect, makeUser, type TestUser } from './helpers';

let cls: string, m: TestUser, d: TestUser, a: TestUser, inactive: TestUser;

beforeAll(async () => {
  cls = await insertClassDirect();
  [m, d, a, inactive] = await Promise.all([makeUser('mahasiswa'), makeUser('dosen'), makeUser('admin'), makeUser('mahasiswa')]);
  await addMember(cls, m.id, 'mahasiswa');
  await addMember(cls, d.id, 'dosen');
  await addMember(cls, inactive.id, 'mahasiswa', false);
});
afterAll(cleanupUsers);

describe('start_practice_session', () => {
  it('students may pick operational roles including R04 but not R01 or R03', async () => {
    expect((await m.client.rpc('start_practice_session', { p_class: cls, p_role: 'R09' })).error).toBeNull();
    expect((await m.client.rpc('start_practice_session', { p_class: cls, p_role: 'R04' })).error).toBeNull();
    expect((await m.client.rpc('start_practice_session', { p_class: cls, p_role: 'R01' })).error).not.toBeNull();
    expect((await m.client.rpc('start_practice_session', { p_class: cls, p_role: 'R03' })).error).not.toBeNull();
  });

  it('dosen may pick R03 and admin may pick R01 in any class', async () => {
    expect((await d.client.rpc('start_practice_session', { p_class: cls, p_role: 'R03' })).error).toBeNull();
    expect((await a.client.rpc('start_practice_session', { p_class: cls, p_role: 'R01' })).error).toBeNull();
  });

  it('inactive members and non-members are refused', async () => {
    expect((await inactive.client.rpc('start_practice_session', { p_class: cls, p_role: 'R09' })).error).not.toBeNull();
    const other = await insertClassDirect();
    expect((await m.client.rpc('start_practice_session', { p_class: other, p_role: 'R09' })).error).not.toBeNull();
  });

  it('switching role keeps exactly one open session', async () => {
    await m.client.rpc('start_practice_session', { p_class: cls, p_role: 'R07' });
    await m.client.rpc('start_practice_session', { p_class: cls, p_role: 'R06' });
    const { data } = await m.client.rpc('my_practice_session');
    expect(data).toHaveLength(1);
    expect(data[0].role_id).toBe('R06');
  });

  it('my_practice_session returns the open session after re-login', async () => {
    await m.client.rpc('start_practice_session', { p_class: cls, p_role: 'R13' });
    const fresh = anon();
    await fresh.auth.signInWithPassword({ email: `${m.username}@${EMAIL_DOMAIN}`, password: m.password });
    const { data } = await fresh.rpc('my_practice_session');
    expect(data[0]).toMatchObject({ class_id: cls, role_id: 'R13' });
  });

  it('end_practice_session closes it and logs LOGOUT', async () => {
    await m.client.rpc('end_practice_session');
    expect((await m.client.rpc('my_practice_session')).data).toEqual([]);
  });

  it('my_classes lists active memberships only', async () => {
    const { data } = await m.client.rpc('my_classes');
    expect(data.map((c: { id: string }) => c.id)).toContain(cls);
    expect((await inactive.client.rpc('my_classes')).data).toEqual([]);
  });
});
```

`tests/integration/lifecycle.test.ts`:

```ts
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { admin, cleanupUsers, makeUser, type TestUser } from './helpers';

const TEMPLATE = '00000000-0000-0000-0000-000000000001';
let d: TestUser, m: TestUser, cls: string;

const count = async (table: string, classId: string) =>
  (await admin().from(table).select('id', { count: 'exact', head: true }).eq('class_id', classId)).count;

beforeAll(async () => {
  d = await makeUser('dosen');
  m = await makeUser('mahasiswa');
  const { data, error } = await d.client.rpc('create_class', { p_name: `TEST-lifecycle-${Date.now()}` });
  if (error) throw error;
  cls = data as string;
});
afterAll(cleanupUsers);

describe('create_class', () => {
  it('only dosen or admin can create classes', async () => {
    expect((await m.client.rpc('create_class', { p_name: 'nope' })).error).not.toBeNull();
  });

  it('copies every template table, including staff_directory', async () => {
    const { data: tables } = await admin().rpc('clinical_table_names');
    for (const t of tables as string[]) expect(await count(t, cls), t).toBe(await count(t, TEMPLATE));
    expect(await count('staff_directory', cls)).toBeGreaterThan(0);
  });

  it('template copies staff_directory with the DPJP doctor U002', async () => {
    const { data } = await admin().from('staff_directory').select('id').eq('class_id', cls).eq('id', 'U002');
    expect(data).toHaveLength(1);
  });

  it('replaces date placeholders with today', async () => {
    const today = new Date().toISOString().slice(0, 10);
    const { data } = await admin().from('registrations').select('data').eq('class_id', cls).eq('id', 'REG-TODAY-IGD').single();
    expect(data!.data.date).toBe(today);
    expect(data!.data.sepNo).toBe(`0010R001${today.replace(/-/g, '')}V001`);
  });

  it('makes the creating dosen a dosen member', async () => {
    const { data } = await admin().from('class_members').select('member_role').eq('class_id', cls).eq('user_id', d.id).single();
    expect(data!.member_role).toBe('dosen');
  });
});

describe('reset_class', () => {
  it('restores template data and keeps the audit history', async () => {
    await d.client.from('patients').insert({ class_id: cls, id: 'P-extra', data: { id: 'P-extra' } });
    const auditBefore = (await admin().from('audit_log').select('id', { count: 'exact', head: true }).eq('class_id', cls)).count!;
    expect((await d.client.rpc('reset_class', { p_class: cls })).error).toBeNull();
    expect(await count('patients', cls)).toBe(await count('patients', TEMPLATE));
    const { data: resets } = await admin().from('audit_log').select('action').eq('class_id', cls).eq('action', 'RESET');
    expect(resets).toHaveLength(1);
    const auditAfter = (await admin().from('audit_log').select('id', { count: 'exact', head: true }).eq('class_id', cls)).count!;
    expect(auditAfter).toBe(auditBefore + 1);
  });

  it('students cannot reset', async () => {
    expect((await m.client.rpc('reset_class', { p_class: cls })).error).not.toBeNull();
  });
});
```

- [ ] **Step 6: Run them to verify they fail**

Run: `npm run test:integration -- session lifecycle`
Expected: FAIL with `Could not find the function public.start_practice_session` and `public.create_class`.

- [ ] **Step 7: Write the migration** `supabase/migrations/20261009000400_sessions_and_classes.sql`

```sql
create or replace function private.apply_today(p_data jsonb) returns jsonb
language sql stable as $$
  select replace(replace(p_data::text, '__TODAYCOMPACT__', to_char(current_date, 'YYYYMMDD')),
                 '__TODAY__', to_char(current_date, 'YYYY-MM-DD'))::jsonb
$$;

create or replace function private.copy_template(p_src uuid, p_dst uuid) returns void
language plpgsql security definer set search_path = public as $$
declare t text;
begin
  perform set_config('simrs.skip_audit', 'on', true);
  foreach t in array private.clinical_tables() loop
    execute format('insert into public.%1$I (class_id, id, data)
                    select $2, id, private.apply_today(data) from public.%1$I where class_id = $1 order by seq', t)
      using p_src, p_dst;
  end loop;
  perform set_config('simrs.skip_audit', 'off', true);
end $$;

create or replace function private.template_class_id() returns uuid
language sql stable as $$ select id from public.classes where is_template $$;

create or replace function public.start_practice_session(p_class uuid, p_role text)
returns public.practice_sessions language plpgsql security definer set search_path = public as $$
declare
  v_type text := public.account_type();
  v_row public.practice_sessions;
begin
  if auth.uid() is null or v_type is null then
    raise exception 'Akun tidak aktif atau belum masuk' using errcode = '42501';
  end if;
  if not exists (select 1 from public.practice_roles where id = p_role) then
    raise exception 'Peran % tidak dikenal', p_role using errcode = '22023';
  end if;
  if p_role = 'R01' and v_type <> 'admin' then
    raise exception 'Peran Super Admin hanya untuk akun admin' using errcode = '42501';
  end if;
  if p_role = 'R03' and v_type not in ('dosen', 'admin') then
    raise exception 'Peran Dosen hanya untuk akun dosen' using errcode = '42501';
  end if;
  if p_class = private.template_class_id() then
    raise exception 'Kelas templat tidak dapat dipakai' using errcode = '42501';
  end if;
  if v_type <> 'admin' and not public.is_class_member(p_class) then
    raise exception 'Anda bukan anggota aktif kelas ini' using errcode = '42501';
  end if;
  update public.practice_sessions set ended_at = now() where user_id = auth.uid() and ended_at is null;
  insert into public.practice_sessions (user_id, class_id, role_id) values (auth.uid(), p_class, p_role)
  returning * into v_row;
  perform private.write_event(p_class, 'LOGIN', 'User', auth.uid()::text, jsonb_build_object('roleId', p_role));
  return v_row;
end $$;

create or replace function public.end_practice_session() returns void
language plpgsql security definer set search_path = public as $$
declare v_class uuid;
begin
  select class_id into v_class from public.practice_sessions where user_id = auth.uid() and ended_at is null;
  if v_class is null then return; end if;
  perform private.write_event(v_class, 'LOGOUT', 'User', auth.uid()::text, null);
  update public.practice_sessions set ended_at = now() where user_id = auth.uid() and ended_at is null;
end $$;

create or replace function public.my_practice_session() returns setof public.practice_sessions
language sql stable security definer set search_path = public as $$
  select * from public.practice_sessions where user_id = auth.uid() and ended_at is null
$$;

create or replace function public.my_classes() returns table (id uuid, name text)
language sql stable security definer set search_path = public as $$
  select c.id, c.name from public.classes c
  where not c.is_template
    and (coalesce(public.account_type() = 'admin', false) or public.is_class_member(c.id))
  order by c.created_at desc
$$;

create or replace function public.clear_must_change_password() returns void
language sql security definer set search_path = public as $$
  update public.profiles set must_change_password = false where id = auth.uid()
$$;

create or replace function public.create_class(p_name text) returns uuid
language plpgsql security definer set search_path = public as $$
declare
  v_type text := public.account_type();
  v_template uuid := private.template_class_id();
  v_id uuid;
begin
  if v_type is null or v_type not in ('dosen', 'admin') then
    raise exception 'Hanya dosen atau admin yang dapat membuat kelas' using errcode = '42501';
  end if;
  if v_template is null then
    raise exception 'Templat kelas belum di-seed (jalankan supabase/seed.sql)' using errcode = '55000';
  end if;
  insert into public.classes (name, created_by) values (trim(p_name), auth.uid()) returning id into v_id;
  if v_type = 'dosen' then
    insert into public.class_members (class_id, user_id, member_role) values (v_id, auth.uid(), 'dosen');
  end if;
  perform private.copy_template(v_template, v_id);
  perform private.write_event(v_id, 'CREATE', 'Class', v_id::text, jsonb_build_object('name', trim(p_name)));
  return v_id;
end $$;

create or replace function public.reset_class(p_class uuid) returns void
language plpgsql security definer set search_path = public as $$
declare
  v_template uuid := private.template_class_id();
  t text;
begin
  if not (coalesce(public.account_type() = 'admin', false) or public.is_class_dosen(p_class)) then
    raise exception 'Hanya dosen kelas ini atau admin yang dapat mereset kelas' using errcode = '42501';
  end if;
  if p_class = v_template then
    raise exception 'Kelas templat tidak dapat direset' using errcode = '42501';
  end if;
  perform set_config('simrs.skip_audit', 'on', true);
  foreach t in array private.clinical_tables() loop
    execute format('delete from public.%I where class_id = $1', t) using p_class;
  end loop;
  perform private.copy_template(v_template, p_class);
  perform private.write_event(p_class, 'RESET', 'Class', p_class::text, null);
end $$;

revoke execute on function public.start_practice_session(uuid, text), public.end_practice_session(),
  public.my_practice_session(), public.my_classes(), public.clear_must_change_password(),
  public.create_class(text), public.reset_class(uuid) from anon;
```

- [ ] **Step 8: Apply the migration and seed, then test**

Run: `npx supabase db push --include-seed && npm run test:integration`
Expected: every integration file PASSes: identity, rls, audit, session, lifecycle.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat(db): practice sessions, class create/reset, generated template seed

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

## Phase 5 — Supabase mode in the app (PR 4)

### Task 9: Supabase client and sync engine

**Files:**
- Modify: `package.json` (add `@supabase/supabase-js`)
- Create: `src/lib/supabaseClient.ts`
- Create: `src/data-layer/syncEngine.ts`, `src/data-layer/syncEngine.test.ts`
- Create: `src/data-layer/notify.ts`
- Modify: `.env.example` (document the variables)

**Interfaces:**
- Consumes: `SLICES`, `SLICE_NAMES`, `SLICE_BY_TABLE`, `SliceName` (Task 4); `SlicePersistence` (Task 4); `sliceRegistry` (Task 4); `sanitizePatientList`, `sanitizeMedicalRecords` (Task 3).
- Produces:
  - `getSupabase(): SupabaseClient` (throws in local mode)
  - `toRow(classId: string, obj: { id: string }): { class_id: string; id: string; data: object }`
  - `normalizeLoaded(name: SliceName, rows: unknown[]): unknown[]`
  - `createSyncEngine(client: SupabaseClient, classId: string): SyncEngine` where `SyncEngine = Omit<SlicePersistence, 'onSaveError'> & { loadAll(): Promise<Record<SliceName, unknown[]>>; subscribe(): () => void }`
  - `notifySaveError(err: unknown): void`, `notifyInfo(message: string): void`

- [ ] **Step 1: Install and configure**

```bash
npm install @supabase/supabase-js@^2.49.4
```

Append to `.env.example`:

```dotenv
# Supabase mode. Leave both empty to run in local (browser-only) mode, e.g. in AI Studio.
VITE_SUPABASE_URL=""
VITE_SUPABASE_ANON_KEY=""
# Show the preset demo accounts on the login screen (demo deployments only).
VITE_DEMO_MODE="false"
```

- [ ] **Step 2: Write the failing test** `src/data-layer/syncEngine.test.ts`

```ts
import { describe, expect, it, vi } from 'vitest';
import { createSyncEngine, normalizeLoaded, toRow } from './syncEngine';

describe('toRow', () => {
  it('wraps the object as data with class and id', () => {
    expect(toRow('c1', { id: 'P1', name: 'x' } as any)).toEqual({ class_id: 'c1', id: 'P1', data: { id: 'P1', name: 'x' } });
  });
});

describe('normalizeLoaded', () => {
  it('applies Ema\'s patient RM normalization on load', () => {
    const out = normalizeLoaded('patients', [{ id: 'b', noRM: '000002' }, { id: 'a', noRM: '000001' }]) as any[];
    expect(out.map(p => p.id)).toEqual(['a', 'b']);
  });
  it('leaves other slices in server order', () => {
    const rows = [{ id: 'z' }, { id: 'a' }];
    expect(normalizeLoaded('cppt', rows)).toBe(rows);
  });
});

function fakeClient() {
  const calls: any[] = [];
  const builder = (table: string) => {
    const b: any = {
      upsert: (rows: any, opts: any) => { calls.push(['upsert', table, rows, opts]); return Promise.resolve({ error: null }); },
      delete: () => b,
      eq: (c: string, v: string) => { calls.push(['eq', table, c, v]); return b; },
      in: (c: string, v: string[]) => { calls.push(['in', table, c, v]); return Promise.resolve({ error: null }); },
    };
    return b;
  };
  return { calls, client: { from: vi.fn(builder) } as any };
}

describe('createSyncEngine.push', () => {
  it('upserts on (class_id,id) and deletes by id within the class', async () => {
    const { calls, client } = fakeClient();
    const engine = createSyncEngine(client, 'c1');
    await engine.push('patients', { upserts: [{ id: 'P1' }], deletes: ['P2'] });
    expect(calls).toContainEqual(['upsert', 'patients', [{ class_id: 'c1', id: 'P1', data: { id: 'P1' } }], { onConflict: 'class_id,id' }]);
    expect(calls).toContainEqual(['eq', 'patients', 'class_id', 'c1']);
    expect(calls).toContainEqual(['in', 'patients', 'id', ['P2']]);
  });

  it('throws when Supabase returns an error', async () => {
    const client = { from: () => ({ upsert: () => Promise.resolve({ error: { message: 'new row violates row-level security policy' } }) }) } as any;
    await expect(createSyncEngine(client, 'c1').push('coding', { upserts: [{ id: 'x' }], deletes: [] })).rejects.toThrow('row-level security');
  });
});
```

- [ ] **Step 3: Run it to verify it fails**

Run: `npx vitest run src/data-layer/syncEngine.test.ts`
Expected: FAIL, `Failed to resolve import "./syncEngine"`.

- [ ] **Step 4: Implement**

`src/lib/supabaseClient.ts`:

```ts
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { getBackendMode } from '../data-layer/config';

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (getBackendMode() !== 'supabase') throw new Error('Supabase is not configured (local mode)');
  if (!client) {
    client = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY, {
      auth: { persistSession: true, autoRefreshToken: true },
    });
  }
  return client;
}
```

`src/data-layer/notify.ts`:

```ts
import Swal from 'sweetalert2';

const toast = Swal.mixin({ toast: true, position: 'top-end', showConfirmButton: false, timer: 4500, timerProgressBar: true });

export function notifySaveError(err: unknown): void {
  const msg = err instanceof Error ? err.message : String((err as { message?: string })?.message ?? err);
  const denied = /row-level security|42501|permission/i.test(msg);
  void toast.fire({
    icon: 'error',
    title: denied ? 'Peran Anda tidak memiliki izin mengubah modul ini.' : 'Gagal menyimpan ke server. Data dikembalikan.',
  });
}

export function notifyInfo(message: string): void {
  void toast.fire({ icon: 'info', title: message });
}
```

`src/data-layer/syncEngine.ts`:

```ts
import type { SupabaseClient } from '@supabase/supabase-js';
import { sanitizeMedicalRecords, sanitizePatientList } from '../data/seedNormalizers';
import type { MedicalRecord, Patient } from '../types';
import { sliceRegistry } from './registry';
import { SLICE_BY_TABLE, SLICE_NAMES, SLICES, type SliceName } from './slices';
import type { SlicePersistence } from './useSlice';

const CHUNK = 500;

export const toRow = (classId: string, obj: { id: string }) => ({ class_id: classId, id: obj.id, data: obj });

export function normalizeLoaded(name: SliceName, rows: unknown[]): unknown[] {
  if (name === 'patients') return sanitizePatientList(rows as Patient[]);
  if (name === 'medicalRecords') return sanitizeMedicalRecords(rows as MedicalRecord[]);
  return rows;
}

export type SyncEngine = Omit<SlicePersistence, 'onSaveError'> & {
  loadAll(): Promise<Record<SliceName, unknown[]>>;
  subscribe(): () => void;
};

export function createSyncEngine(client: SupabaseClient, classId: string): SyncEngine {
  async function fetchSlice(name: SliceName): Promise<unknown[]> {
    const { data, error } = await client
      .from(SLICES[name].table)
      .select('data')
      .eq('class_id', classId)
      .order('created_at', { ascending: false })
      .order('seq', { ascending: true });
    if (error) throw new Error(error.message);
    return normalizeLoaded(name, (data ?? []).map(r => r.data));
  }

  return {
    async push(name, diff) {
      const table = SLICES[name].table;
      for (let i = 0; i < diff.upserts.length; i += CHUNK) {
        const rows = diff.upserts.slice(i, i + CHUNK).map(o => toRow(classId, o));
        const { error } = await client.from(table).upsert(rows, { onConflict: 'class_id,id' });
        if (error) throw new Error(error.message);
      }
      if (diff.deletes.length > 0) {
        const { error } = await client.from(table).delete().eq('class_id', classId).in('id', diff.deletes);
        if (error) throw new Error(error.message);
      }
    },
    refetch: fetchSlice,
    async loadAll() {
      const entries = await Promise.all(SLICE_NAMES.map(async n => [n, await fetchSlice(n)] as const));
      return Object.fromEntries(entries) as Record<SliceName, unknown[]>;
    },
    subscribe() {
      const channel = client.channel(`class-${classId}`);
      for (const name of SLICE_NAMES) {
        channel.on(
          'postgres_changes',
          { event: '*', schema: 'public', table: SLICES[name].table, filter: `class_id=eq.${classId}` },
          payload => {
            const slice = SLICE_BY_TABLE[payload.table];
            if (payload.eventType === 'DELETE') {
              const id = (payload.old as { id?: string }).id;
              if (id) sliceRegistry.applyRemote(slice, { type: 'delete', id });
            } else {
              sliceRegistry.applyRemote(slice, { type: 'upsert', row: (payload.new as { data: { id: string } }).data });
            }
          },
        );
      }
      channel.subscribe();
      return () => { void client.removeChannel(channel); };
    },
  };
}
```

- [ ] **Step 5: Run the tests and the type check**

Run: `npx vitest run src/data-layer && npm run lint`
Expected: PASS; tsc prints nothing.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat(data-layer): Supabase client, sync engine and save-error notices

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

### Task 10: Session, roles, members and audit queries

**Files:**
- Create: `src/data-layer/session.ts`, `src/data-layer/session.test.ts`
- Create: `src/data-layer/supabaseQueries.ts`, `src/data-layer/supabaseQueries.test.ts`

**Interfaces:**
- Consumes: `getSupabase` (Task 9), RPCs from Task 8, `AuditEntry`, `Role`, `RoleId` and `User` from `src/types.ts`.
- Produces:
  - `LOGIN_EMAIL_DOMAIN = 'users.simrs-ueu.invalid'`
  - `usernameToEmail(username: string): string`; throws `Error('Username hanya boleh huruf, angka, titik, garis bawah, atau tanda hubung')` for invalid input
  - `type AccountType = 'admin' | 'dosen' | 'mahasiswa'`
  - `interface Profile { id: string; username: string; full_name: string; account_type: AccountType; must_change_password: boolean; active: boolean }`
  - `interface ClassInfo { id: string; name: string }`
  - `interface PracticeSession { id: number; class_id: string; role_id: string }`
  - `signIn(client, username, password): Promise<{ profile: Profile; classes: ClassInfo[] } | { error: string }>`
  - `startPractice(client, classId, roleId): Promise<PracticeSession>`
  - `restoreSession(client): Promise<{ profile: Profile; session: PracticeSession | null; classes: ClassInfo[] } | null>`
  - `endPractice(client): Promise<void>`
  - `changePassword(client, newPassword): Promise<void>`
  - `loadPracticeRoles(client): Promise<Role[]>`
  - `loadMembers(client, classId): Promise<User[]>`
  - `mergeStaffAndMembers(staff: User[], members: User[]): User[]`
  - `mapAuditRow(row: AuditRow): AuditEntry`
  - `loadAudit(client, classId): Promise<AuditEntry[]>`
  - `subscribeAudit(client, classId, onEntry: (e: AuditEntry) => void): () => void`
  - `logNavigate(client, page: string): void`
  - `updateRoleAccess(client, roleId: string, access: string[]): Promise<void>`

- [ ] **Step 1: Add `'RESET'` to Ema's audit action union.** In `src/types.ts`, inside `interface AuditEntry`, change

```ts
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'NAVIGATE';
```

to

```ts
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'NAVIGATE' | 'RESET';
```

- [ ] **Step 2: Write the failing tests**

`src/data-layer/session.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { usernameToEmail } from './session';

describe('usernameToEmail', () => {
  it('lowercases and trims, then appends the internal domain', () => {
    expect(usernameToEmail('  DSN.Dr.Wati ')).toBe('dsn.dr.wati@users.simrs-ueu.invalid');
    expect(usernameToEmail('20240306044')).toBe('20240306044@users.simrs-ueu.invalid');
  });
  it('rejects characters that cannot form an email local part', () => {
    expect(() => usernameToEmail('budi santoso')).toThrow(/Username hanya boleh/);
    expect(() => usernameToEmail('')).toThrow(/Username hanya boleh/);
  });
});
```

`src/data-layer/supabaseQueries.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { mapAuditRow, mergeStaffAndMembers } from './supabaseQueries';
import type { User } from '../types';

describe('mapAuditRow', () => {
  it('maps a database row to Ema\'s AuditEntry shape', () => {
    const e = mapAuditRow({
      id: 42, at: '2026-10-09T01:00:00Z', class_id: 'c', actor_id: 'u1', actor_name: 'Budi',
      practice_role_id: 'R09', action: 'UPDATE', entity: 'coding', entity_id: 'C1', module: 'coding',
      old_data: { id: 'C1', s: 'a' }, new_data: { id: 'C1', s: 'b' }, details: null,
    });
    expect(e).toMatchObject({
      id: '42', timestamp: '2026-10-09T01:00:00Z', userId: 'u1', userName: 'Budi (R09)',
      action: 'UPDATE', entity: 'coding', entityId: 'C1', module: 'coding', ip: '-',
    });
    expect(e.old_value).toBe('{"id":"C1","s":"a"}');
  });

  it('truncates long values to 300 characters', () => {
    const big = { id: 'x', t: 'a'.repeat(1000) };
    const e = mapAuditRow({ id: 1, at: '', class_id: null, actor_id: null, actor_name: null, practice_role_id: null,
      action: 'CREATE', entity: 'cppt', entity_id: 'x', module: null, old_data: null, new_data: big, details: null });
    expect(e.new_value!.length).toBe(300);
    expect(e.userName).toBe('System');
  });
});

describe('mergeStaffAndMembers', () => {
  it('members merge after staff without replacing staff', () => {
    const staff = [{ id: 'U002', name: 'dr. A', roleId: 'R05' }] as User[];
    const members = [{ id: 'uuid-1', name: 'Budi', roleId: 'R04' }, { id: 'U002', name: 'collision', roleId: 'R04' }] as User[];
    const out = mergeStaffAndMembers(staff, members);
    expect(out.map(u => u.id)).toEqual(['U002', 'uuid-1']);
    expect(out[0].name).toBe('dr. A');
  });
});
```

- [ ] **Step 3: Run them to verify they fail**

Run: `npx vitest run src/data-layer/session.test.ts src/data-layer/supabaseQueries.test.ts`
Expected: FAIL with unresolved imports.

- [ ] **Step 4: Implement** `src/data-layer/session.ts`

```ts
import type { SupabaseClient } from '@supabase/supabase-js';

export const LOGIN_EMAIL_DOMAIN = 'users.simrs-ueu.invalid';
export type AccountType = 'admin' | 'dosen' | 'mahasiswa';

export interface Profile {
  id: string; username: string; full_name: string; account_type: AccountType;
  must_change_password: boolean; active: boolean;
}
export interface ClassInfo { id: string; name: string }
export interface PracticeSession { id: number; class_id: string; role_id: string }

export function usernameToEmail(username: string): string {
  const u = username.trim().toLowerCase();
  if (!/^[a-z0-9._-]+$/.test(u)) {
    throw new Error('Username hanya boleh huruf, angka, titik, garis bawah, atau tanda hubung');
  }
  return `${u}@${LOGIN_EMAIL_DOMAIN}`;
}

async function loadProfile(client: SupabaseClient, userId: string): Promise<Profile | null> {
  const { data } = await client.from('profiles').select('*').eq('id', userId).maybeSingle();
  return (data as Profile) ?? null;
}

async function loadClasses(client: SupabaseClient): Promise<ClassInfo[]> {
  const { data, error } = await client.rpc('my_classes');
  if (error) throw new Error(error.message);
  return (data ?? []) as ClassInfo[];
}

export async function signIn(
  client: SupabaseClient, username: string, password: string,
): Promise<{ profile: Profile; classes: ClassInfo[] } | { error: string }> {
  let email: string;
  try { email = usernameToEmail(username); } catch (e) { return { error: (e as Error).message }; }
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error || !data.user) return { error: 'Username/NIM atau password salah' };
  const profile = await loadProfile(client, data.user.id);
  if (!profile || !profile.active) {
    await client.auth.signOut();
    return { error: 'Akun non-aktif. Hubungi dosen atau admin.' };
  }
  const classes = await loadClasses(client);
  if (classes.length === 0) {
    await client.auth.signOut();
    return { error: 'Akun Anda belum terdaftar di kelas mana pun. Hubungi dosen.' };
  }
  return { profile, classes };
}

export async function startPractice(client: SupabaseClient, classId: string, roleId: string): Promise<PracticeSession> {
  const { data, error } = await client.rpc('start_practice_session', { p_class: classId, p_role: roleId });
  if (error) throw new Error(error.message);
  return data as PracticeSession;
}

export async function restoreSession(
  client: SupabaseClient,
): Promise<{ profile: Profile; session: PracticeSession | null; classes: ClassInfo[] } | null> {
  const { data } = await client.auth.getSession();
  const userId = data.session?.user.id;
  if (!userId) return null;
  const profile = await loadProfile(client, userId);
  if (!profile || !profile.active) { await client.auth.signOut(); return null; }
  const { data: open } = await client.rpc('my_practice_session');
  const session = ((open ?? []) as PracticeSession[])[0] ?? null;
  return { profile, session, classes: await loadClasses(client) };
}

export async function endPractice(client: SupabaseClient): Promise<void> {
  await client.rpc('end_practice_session');
  await client.auth.signOut();
}

export async function changePassword(client: SupabaseClient, newPassword: string): Promise<void> {
  const { error } = await client.auth.updateUser({ password: newPassword });
  if (error) throw new Error(error.message);
  const { error: e2 } = await client.rpc('clear_must_change_password');
  if (e2) throw new Error(e2.message);
}
```

- [ ] **Step 5: Implement** `src/data-layer/supabaseQueries.ts`

```ts
import type { SupabaseClient } from '@supabase/supabase-js';
import type { AuditEntry, Role, RoleId, User } from '../types';

export interface AuditRow {
  id: number; at: string; class_id: string | null; actor_id: string | null; actor_name: string | null;
  practice_role_id: string | null; action: AuditEntry['action']; entity: string; entity_id: string | null;
  module: string | null; old_data: unknown; new_data: unknown; details: Record<string, unknown> | null;
}

const MAX_VALUE = 300;
const compact = (v: unknown): string | null => (v == null ? null : JSON.stringify(v).slice(0, MAX_VALUE));

export function mapAuditRow(r: AuditRow): AuditEntry {
  const who = r.actor_name ?? 'System';
  return {
    id: String(r.id),
    timestamp: r.at,
    userId: r.actor_id ?? 'SYSTEM',
    userName: r.practice_role_id ? `${who} (${r.practice_role_id})` : who,
    action: r.action,
    entity: r.entity,
    entityId: r.entity_id ?? '',
    field_name: null,
    old_value: compact(r.old_data),
    new_value: compact(r.new_data ?? r.details),
    ip: '-',
    device: '-',
    module: r.module ?? undefined,
  };
}

export async function loadAudit(client: SupabaseClient, classId: string): Promise<AuditEntry[]> {
  const { data, error } = await client.from('audit_log').select('*').eq('class_id', classId)
    .order('at', { ascending: false }).limit(500);
  if (error) throw new Error(error.message);
  return (data as AuditRow[]).map(mapAuditRow);
}

export function subscribeAudit(client: SupabaseClient, classId: string, onEntry: (e: AuditEntry) => void): () => void {
  const channel = client.channel(`audit-${classId}`).on(
    'postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'audit_log', filter: `class_id=eq.${classId}` },
    payload => onEntry(mapAuditRow(payload.new as AuditRow)),
  );
  channel.subscribe();
  return () => { void client.removeChannel(channel); };
}

export async function loadPracticeRoles(client: SupabaseClient): Promise<Role[]> {
  const { data, error } = await client.from('practice_roles').select('id, name, access').order('id');
  if (error) throw new Error(error.message);
  return data as Role[];
}

export async function updateRoleAccess(client: SupabaseClient, roleId: string, access: string[]): Promise<void> {
  const { data, error } = await client.from('practice_roles').update({ access }).eq('id', roleId).select('id');
  if (error) throw new Error(error.message);
  if (!data || data.length === 0) throw new Error('42501: hanya admin yang dapat mengubah hak akses');
}

export async function loadMembers(client: SupabaseClient, classId: string): Promise<User[]> {
  const { data, error } = await client.from('class_members')
    .select('member_role, active, profiles(id, username, full_name)')
    .eq('class_id', classId);
  if (error) throw new Error(error.message);
  return (data ?? []).map((m: any) => ({
    id: m.profiles.id,
    username: m.profiles.username,
    name: m.profiles.full_name,
    roleId: (m.member_role === 'dosen' ? 'R03' : 'R04') as RoleId,
    active: m.active,
  }));
}

export function mergeStaffAndMembers(staff: User[], members: User[]): User[] {
  const ids = new Set(staff.map(u => u.id));
  return [...staff, ...members.filter(m => !ids.has(m.id))];
}

export function logNavigate(client: SupabaseClient, page: string): void {
  void client.rpc('log_event', { p_action: 'NAVIGATE', p_entity: 'Page', p_entity_id: page, p_details: { module: page } });
}
```

- [ ] **Step 6: Run the tests and the type check**

Run: `npx vitest run src/data-layer && npm run lint`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat(data-layer): session, roles, members and audit queries

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

### Task 11: Wire Supabase mode into AppContext

**Files:**
- Create: `src/data-layer/useSupabaseSession.ts`
- Modify: `src/context/AppContext.tsx`:
  - `login` becomes async and dispatches by mode
  - `logout` and `navigate` route by mode
  - `audit` routing
  - `updateRolePermissions` routing
  - `users` exposed as staff merged with members
  - new context fields

**Interfaces:**
- Consumes: everything produced by Tasks 4, 9 and 10.
- Produces, as additions to `AppContextType`:
  - `login: (u: string, p: string, selectedRoleId?: RoleId) => Promise<{ success: boolean; error?: string; needsClassChoice?: boolean }>` (signature change)
  - `backendMode: BackendMode`
  - `booting: boolean`
  - `accountType: AccountType | null`
  - `mustChangePassword: boolean`
  - `classOptions: ClassInfo[] | null`
  - `activeClass: ClassInfo | null`
  - `chooseClass: (classId: string) => Promise<{ success: boolean; error?: string }>`
  - `changePassword: (newPassword: string) => Promise<{ success: boolean; error?: string }>`
  - `resetActiveClass: () => Promise<{ success: boolean; error?: string }>`

- [ ] **Step 1: Implement** `src/data-layer/useSupabaseSession.ts`

```ts
import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from 'react';
import { getSupabase } from '../lib/supabaseClient';
import type { AuditEntry, Role, RoleId, User } from '../types';
import { getBackendMode } from './config';
import { notifySaveError } from './notify';
import { sliceRegistry } from './registry';
import {
  changePassword as changePw, endPractice, restoreSession, signIn, startPractice,
  type AccountType, type ClassInfo, type PracticeSession, type Profile,
} from './session';
import { loadAudit, loadMembers, loadPracticeRoles, subscribeAudit } from './supabaseQueries';
import { createSyncEngine } from './syncEngine';
import { setSlicePersistence } from './useSlice';

interface Deps {
  setUser: Dispatch<SetStateAction<User | null>>;
  setRoles: Dispatch<SetStateAction<Role[]>>;
  setAuditTrail: Dispatch<SetStateAction<AuditEntry[]>>;
  onExit: () => void;
}

type Result = { success: boolean; error?: string };

export function useSupabaseSession(deps: Deps) {
  const enabled = getBackendMode() === 'supabase';
  const [booting, setBooting] = useState(enabled);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [classOptions, setClassOptions] = useState<ClassInfo[] | null>(null);
  const [activeClass, setActiveClass] = useState<ClassInfo | null>(null);
  const [members, setMembers] = useState<User[]>([]);
  const pending = useRef<{ profile: Profile; roleId: RoleId } | null>(null);
  const teardown = useRef<(() => void) | null>(null);

  async function enterClass(p: Profile, cls: ClassInfo, roleId: RoleId, existing?: PracticeSession) {
    const client = getSupabase();
    const session = existing ?? await startPractice(client, cls.id, roleId);
    const engine = createSyncEngine(client, cls.id);
    setSlicePersistence({ ...engine, onSaveError: notifySaveError });
    const [rows, roles, memberUsers, audit] = await Promise.all([
      engine.loadAll(), loadPracticeRoles(client), loadMembers(client, cls.id), loadAudit(client, cls.id),
    ]);
    sliceRegistry.hydrateAll(rows);
    deps.setRoles(roles);
    deps.setAuditTrail(audit);
    setMembers(memberUsers);
    const offData = engine.subscribe();
    const offAudit = subscribeAudit(client, cls.id, e => deps.setAuditTrail(prev => [e, ...prev].slice(0, 500)));
    teardown.current = () => { offData(); offAudit(); };
    setProfile(p);
    setActiveClass(cls);
    setClassOptions(null);
    deps.setUser({ id: p.id, username: p.username, name: p.full_name, roleId: session.role_id as RoleId, active: true });
  }

  function clearLocal() {
    teardown.current?.();
    teardown.current = null;
    setSlicePersistence(null);
    sliceRegistry.hydrateAll({});
    deps.setAuditTrail([]);
    setMembers([]);
    setProfile(null);
    setActiveClass(null);
    setClassOptions(null);
    pending.current = null;
    deps.setUser(null);
    deps.onExit();
  }

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    (async () => {
      try {
        const restored = await restoreSession(getSupabase());
        if (cancelled || !restored?.session) return;
        const cls = restored.classes.find(c => c.id === restored.session!.class_id);
        if (cls) await enterClass(restored.profile, cls, restored.session.role_id as RoleId, restored.session);
      } catch (e) {
        notifySaveError(e);
      } finally {
        if (!cancelled) setBooting(false);
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  async function login(username: string, password: string, roleId: RoleId): Promise<Result & { needsClassChoice?: boolean }> {
    const res = await signIn(getSupabase(), username, password);
    if ('error' in res) return { success: false, error: res.error };
    if (res.classes.length > 1) {
      pending.current = { profile: res.profile, roleId };
      setClassOptions(res.classes);
      return { success: true, needsClassChoice: true };
    }
    try {
      await enterClass(res.profile, res.classes[0], roleId);
      return { success: true };
    } catch (e) {
      await getSupabase().auth.signOut();
      return { success: false, error: (e as Error).message };
    }
  }

  async function chooseClass(classId: string): Promise<Result> {
    const p = pending.current;
    const cls = classOptions?.find(c => c.id === classId);
    if (!p || !cls) return { success: false, error: 'Sesi login kedaluwarsa. Silakan masuk kembali.' };
    try {
      await enterClass(p.profile, cls, p.roleId);
      pending.current = null;
      return { success: true };
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  }

  async function logout(): Promise<void> {
    try { await endPractice(getSupabase()); } finally { clearLocal(); }
  }

  async function changePassword(newPassword: string): Promise<Result> {
    if (newPassword.length < 8) return { success: false, error: 'Password minimal 8 karakter' };
    try {
      await changePw(getSupabase(), newPassword);
      setProfile(prev => (prev ? { ...prev, must_change_password: false } : prev));
      return { success: true };
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  }

  async function resetActiveClass(): Promise<Result> {
    if (!activeClass || !profile) return { success: false, error: 'Tidak ada kelas aktif' };
    const { error } = await getSupabase().rpc('reset_class', { p_class: activeClass.id });
    if (error) return { success: false, error: error.message };
    const rows = await createSyncEngine(getSupabase(), activeClass.id).loadAll();
    sliceRegistry.hydrateAll(rows);
    return { success: true };
  }

  return {
    enabled, booting, members, classOptions, activeClass,
    accountType: (profile?.account_type ?? null) as AccountType | null,
    mustChangePassword: profile?.must_change_password ?? false,
    login, chooseClass, logout, changePassword, resetActiveClass,
  };
}
```

- [ ] **Step 2: Wire it into `AppContext.tsx`.**

**2a.** Add imports:

```tsx
import { useMemo } from 'react';
import { useSupabaseSession } from '../data-layer/useSupabaseSession';
import { mergeStaffAndMembers, logNavigate, updateRoleAccess } from '../data-layer/supabaseQueries';
import { notifySaveError } from '../data-layer/notify';
import { getSupabase } from '../lib/supabaseClient';
import type { BackendMode } from '../data-layer/config';
import type { AccountType, ClassInfo } from '../data-layer/session';
```

(Merge `useMemo` into the existing `react` import line instead of adding a second one.)

**2b.** In `interface AppContextType`, replace the `login` member and add the new fields:

```ts
  login: (u: string, p: string, selectedRoleId?: RoleId) => Promise<{ success: boolean; error?: string; needsClassChoice?: boolean }>;
  backendMode: BackendMode;
  booting: boolean;
  accountType: AccountType | null;
  mustChangePassword: boolean;
  classOptions: ClassInfo[] | null;
  activeClass: ClassInfo | null;
  chooseClass: (classId: string) => Promise<{ success: boolean; error?: string }>;
  changePassword: (newPassword: string) => Promise<{ success: boolean; error?: string }>;
  resetActiveClass: () => Promise<{ success: boolean; error?: string }>;
```

**2b-2.** Never restore a browser-stored local user in Supabase mode, because a stale `simrs_current_user` from earlier local-mode use on the same origin would bypass login. Make the first statement of the `user` state initializer:

```tsx
    if (getBackendMode() === 'supabase') return null;
```

**2c.** Right after the line `const backendMode = getBackendMode();` (added in Task 4), create the session:

```tsx
  const sb = useSupabaseSession({
    setUser, setRoles, setAuditTrail,
    onExit: () => setActivePage('dashboard'),
  });
  const exposedUsers = useMemo(
    () => (backendMode === 'supabase' ? mergeStaffAndMembers(users, sb.members) : users),
    [backendMode, users, sb.members],
  );
```

**2d.** Route `audit` by mode. Insert this as the first statement of the existing `audit` function:

```tsx
    if (backendMode === 'supabase') {
      // CREATE/UPDATE/DELETE are written by database triggers; LOGIN/LOGOUT by session RPCs.
      if (action === 'NAVIGATE') logNavigate(getSupabase(), entityId);
      return;
    }
```

**2e.** Rename the existing `login` function to `loginLocal` and leave its body untouched. Then add:

```tsx
  const login = async (u: string, p: string, selectedRoleId?: RoleId) => {
    if (backendMode === 'supabase') return sb.login(u, p, selectedRoleId ?? 'R04');
    return loginLocal(u, p, selectedRoleId);
  };
```

**2f.** Rename the existing `logout` to `logoutLocal`, then add:

```tsx
  const logout = () => {
    if (backendMode === 'supabase') { void sb.logout(); return; }
    logoutLocal();
  };
```

**2g.** Route `updateRolePermissions`. Insert as its first statement:

```tsx
    if (backendMode === 'supabase') {
      updateRoleAccess(getSupabase(), roleId, newAccess)
        .then(() => setRoles(prev => prev.map(r => r.id === roleId ? { ...r, access: newAccess } : r)))
        .catch(notifySaveError);
      return;
    }
```

**2h.** Make `getUser` use the merged list. Change `const getUser = (id: string) => users.find(u => u.id === id);` to `const getUser = (id: string) => exposedUsers.find(u => u.id === id);`.

**2i.** In the provider `value`:
- replace `users,` with `users: exposedUsers,`
- add `backendMode, booting: sb.booting, accountType: sb.accountType, mustChangePassword: sb.mustChangePassword, classOptions: sb.classOptions, activeClass: sb.activeClass, chooseClass: sb.chooseClass, changePassword: sb.changePassword, resetActiveClass: sb.resetActiveClass,`

- [ ] **Step 3: Type-check**

Run: `npm run lint`
Expected: the only errors are in `src/views/LoginView.tsx` at the two `login(...)` call sites (a Promise is now returned). Task 12 fixes those. If any other file errors, fix it here before continuing.

- [ ] **Step 4: Commit** (the build becomes green again in Task 12; both land in the same PR)

```bash
git add -A
git commit -m "feat: wire Supabase session, sync and audit routing into AppContext

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

### Task 12: Login flow screens (async login, class picker, first-login password, demo presets)

**Files:**
- Create: `src/data/demoAccounts.ts`
- Create: `src/views/PilihKelasView.tsx`, `src/views/GantiPasswordView.tsx`
- Modify: `src/views/LoginView.tsx`:
  - `handleLoginSubmit` and `handlePresetFill` become async
  - `demoAccounts` comes from `src/data/demoAccounts.ts`
  - the demo box is wrapped in an `isDemoMode()` check
- Modify: `src/App.tsx` (`AppContent` gating at the top)

**Interfaces:**
- Consumes: context fields from Task 11; `isDemoMode` (Task 4).
- Produces: `DEMO_ACCOUNTS: { label: string; u: string; p: string; roleId: RoleId; accountType: 'admin' | 'dosen' | 'mahasiswa' }[]`, which is also used by `scripts/bootstrap.ts` in Task 15.

- [ ] **Step 1: Create** `src/data/demoAccounts.ts` (values copied from Ema's `LoginView.tsx`)

```ts
import type { RoleId } from '../types';

export const DEMO_ACCOUNTS: { label: string; u: string; p: string; roleId: RoleId; accountType: 'admin' | 'dosen' | 'mahasiswa' }[] = [
  { label: 'Mahasiswa Coding (NIM 20240306044)', u: '20240306044', p: 'mhs123', roleId: 'R09', accountType: 'mahasiswa' },
  { label: 'Mahasiswa Pendaftaran', u: 'mhs.pendaftaran', p: 'pendaftaran123', roleId: 'R07', accountType: 'mahasiswa' },
  { label: 'Mahasiswa Perawat', u: 'mhs.perawat', p: 'perawat123', roleId: 'R06', accountType: 'mahasiswa' },
  { label: 'Mahasiswa Pelaporan', u: 'mhs.pelaporan', p: 'pelaporan123', roleId: 'R13', accountType: 'mahasiswa' },
  { label: 'Dosen Pengampu (Dr. Wati)', u: 'dsn.dr.wati', p: 'dosen123', roleId: 'R03', accountType: 'dosen' },
  { label: 'Super Administrator', u: 'admin', p: 'admin123', roleId: 'R01', accountType: 'admin' },
];
```

- [ ] **Step 2: Edit `src/views/LoginView.tsx`**

- Add imports `import { DEMO_ACCOUNTS } from '../data/demoAccounts';` and `import { isDemoMode } from '../data-layer/config';`.
- Delete the local `const demoAccounts = [ ... ];` block and add `const demoAccounts = DEMO_ACCOUNTS;` in its place.
- Replace the two handlers:

```tsx
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setErrorMsg('Username/NIM dan password wajib diisi');
      return;
    }
    const res = await login(username.trim(), password.trim(), selectedRole);
    if (!res.success) {
      setErrorMsg(res.error || 'Login gagal. Periksa kembali Username/NIM & password');
    }
  };

  const handlePresetFill = async (u: string, p: string, r: RoleId) => {
    setUsername(u);
    setPassword(p);
    setSelectedRole(r);
    setErrorMsg('');
    const res = await login(u, p, r);
    if (!res.success) setErrorMsg(res.error || 'Login gagal');
  };
```

- Wrap the demo block. Change `{/* Quick Demo Login */}` followed by `<div className="mt-5 pt-4 border-t border-slate-100">` to `{/* Quick Demo Login */}` followed by `{isDemoMode() && (` and then the same `<div ...>`. After that div's closing `</div>` (just before the closing `</div>` of the card), add `)}`.

- [ ] **Step 3: Create** `src/views/PilihKelasView.tsx`

```tsx
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Building2, LogIn } from 'lucide-react';

export const PilihKelasView: React.FC = () => {
  const { classOptions, chooseClass } = useApp();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState('');

  const pick = async (id: string) => {
    setBusy(id);
    setError('');
    const res = await chooseClass(id);
    if (!res.success) setError(res.error || 'Gagal masuk ke kelas');
    setBusy(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4 font-sans">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4">
        <div className="flex items-center gap-3 text-blue-900">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-sm font-black">Pilih Kelas</h2>
            <p className="text-xs text-slate-500">Anda terdaftar di lebih dari satu kelas. Pilih rumah sakit simulasi yang akan dibuka.</p>
          </div>
        </div>
        <div className="space-y-2">
          {(classOptions ?? []).map(c => (
            <button
              key={c.id}
              type="button"
              disabled={busy !== null}
              onClick={() => pick(c.id)}
              className="w-full text-left p-3 bg-slate-50 hover:bg-blue-50/90 hover:border-blue-300 border border-slate-200/80 rounded-xl text-xs font-bold text-slate-800 flex items-center justify-between cursor-pointer disabled:opacity-60"
            >
              <span>{c.name}</span>
              <LogIn className="w-4 h-4 text-blue-600" />
            </button>
          ))}
        </div>
        {error && <p className="text-xs text-rose-600 font-semibold">{error}</p>}
      </div>
    </div>
  );
};
```

- [ ] **Step 4: Create** `src/views/GantiPasswordView.tsx`

```tsx
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { KeyRound } from 'lucide-react';

export const GantiPasswordView: React.FC = () => {
  const { changePassword, logout, user } = useApp();
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pw !== pw2) { setError('Konfirmasi password tidak sama'); return; }
    setBusy(true);
    const res = await changePassword(pw);
    setBusy(false);
    if (!res.success) setError(res.error || 'Gagal mengganti password');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4 font-sans">
      <form onSubmit={submit} className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4">
        <div className="flex items-center gap-3 text-blue-900">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
            <KeyRound className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-sm font-black">Ganti Password</h2>
            <p className="text-xs text-slate-500">Halo {user?.name}. Ini login pertama Anda; buat password baru (minimal 8 karakter).</p>
          </div>
        </div>
        <input type="password" value={pw} onChange={e => setPw(e.target.value)} placeholder="Password baru"
          className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none" />
        <input type="password" value={pw2} onChange={e => setPw2(e.target.value)} placeholder="Ulangi password baru"
          className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none" />
        {error && <p className="text-xs text-rose-600 font-semibold">{error}</p>}
        <button type="submit" disabled={busy}
          className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white rounded-xl text-xs font-black shadow-lg shadow-blue-600/30 cursor-pointer disabled:opacity-60">
          Simpan Password Baru
        </button>
        <button type="button" onClick={logout} className="w-full text-xs text-slate-500 hover:text-slate-700 cursor-pointer">
          Keluar
        </button>
      </form>
    </div>
  );
};
```

- [ ] **Step 5: Gate `src/App.tsx`.** Add imports `import { PilihKelasView } from './views/PilihKelasView';` and `import { GantiPasswordView } from './views/GantiPasswordView';`. Then change the top of `AppContent`:

```tsx
  const { user, activePage, sidebarCollapsed, getRole, booting, classOptions, mustChangePassword } = useApp();

  if (booting) {
    return (
      <div className="min-h-screen bg-[#EEF4FB] flex items-center justify-center text-xs font-bold text-slate-500">
        Memuat sesi SIMRS…
      </div>
    );
  }

  if (!user) {
    return classOptions ? <PilihKelasView /> : <LoginView />;
  }

  if (mustChangePassword) {
    return <GantiPasswordView />;
  }
```

Also let dosen open the audit page. Change `if (pageId === 'audit') return user.roleId === 'R01';` to `if (pageId === 'audit') return user.roleId === 'R01' || user.roleId === 'R03';`.

- [ ] **Step 6: Type-check, build and run unit tests**

Run: `npm run lint && npm run build && npm test`
Expected: all pass.

- [ ] **Step 7: Run a local-mode regression.** Run `npm run dev` with no `.env.local`. The preset box must be visible. Log in with "Mahasiswa Pendaftaran", add a patient, reload, and confirm the patient persists. Stop the server.

- [ ] **Step 8: Run a Supabase-mode smoke test against the dev project.**
  1. Create `.env.local` with the dev URL and anon key, plus `VITE_DEMO_MODE=true`.
  2. Run `npm run bootstrap -- --env .env.test.local --admin-password '<choose>' --class "Kelas Dev" --demo`. This needs Task 15's script; if Task 15 isn't done yet, do this smoke test after Task 15.
  3. Run `npm run dev`.
  4. Log in with the "Mahasiswa Pendaftaran" preset and add a patient.
  5. In a private window, log in with the "Mahasiswa Coding" preset. Confirm the new patient appears without a reload (Realtime). Then try to edit a patient: the save must fail with the toast *"Peran Anda tidak memiliki izin mengubah modul ini."* and the field must revert.
  6. Reload the first window and confirm you are still logged in as Mahasiswa Pendaftaran (session restore).

Stop the server.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: async login, class picker, first-login password, demo-mode presets

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

## Phase 6 — Roster import and the class screen (PR 5)

### Task 13: `import-roster` Edge Function

**Files:**
- Create: `supabase/functions/import-roster/index.ts`
- Create: `supabase/functions/import-roster/validate.ts`, `supabase/functions/import-roster/validate.test.ts`
- Modify: `vitest.config.ts` (include `supabase/functions/**/*.test.ts`)
- Create test: `tests/integration/roster.test.ts`

**Interfaces:**
- Consumes: `profiles`, `class_members` (Task 5).
- Produces:
  - HTTP `POST /functions/v1/import-roster` with body `{ action: 'import_roster'; classId: string; rows: { nim: string; name: string }[] } | { action: 'create_dosen'; username: string; name: string }`
  - response `{ accounts: { username: string; name: string; status: 'created' | 'existing'; tempPassword: string | null }[] }`, or `{ error: string }` with 400/401/403
  - `parseRoster(text: string): { rows: { nim: string; name: string }[]; errors: string[] }`
  - `validateRows(rows: unknown): { nim: string; name: string }[]`

- [ ] **Step 1: Write the failing unit test** `supabase/functions/import-roster/validate.test.ts`

```ts
import { describe, expect, it } from 'vitest';
import { parseRoster, validateRows } from './validate';

describe('parseRoster', () => {
  it('accepts comma, semicolon or tab separated "NIM, Nama" lines and skips a header', () => {
    const { rows, errors } = parseRoster('NIM,Nama\n20240306044, Budi Santoso\n20240306045;Siti\n20240306046\tAni Lestari\n');
    expect(errors).toEqual([]);
    expect(rows).toEqual([
      { nim: '20240306044', name: 'Budi Santoso' },
      { nim: '20240306045', name: 'Siti' },
      { nim: '20240306046', name: 'Ani Lestari' },
    ]);
  });

  it('reports bad lines with their line number and drops duplicate NIMs', () => {
    const { rows, errors } = parseRoster('20240306044,Budi\nbukan nim!,X\n20240306044,Budi lagi');
    expect(rows).toHaveLength(1);
    expect(errors).toEqual(['Baris 2: NIM tidak valid', 'Baris 3: NIM duplikat']);
  });
});

describe('validateRows', () => {
  it('rejects more than 300 rows', () => {
    const rows = Array.from({ length: 301 }, (_, i) => ({ nim: `n${i}`, name: 'x' }));
    expect(() => validateRows(rows)).toThrow(/maksimal 300/);
  });
});
```

Add `'supabase/functions/**/*.test.ts'` to the `include` array in `vitest.config.ts`.

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run supabase/functions`
Expected: FAIL, unresolved `./validate`.

- [ ] **Step 3: Implement** `supabase/functions/import-roster/validate.ts`. This file has no Deno-only APIs, so Node can test it.

```ts
export interface RosterRow { nim: string; name: string }
const NIM = /^[0-9a-z._-]{3,40}$/;
export const MAX_ROWS = 300;

export function parseRoster(text: string): { rows: RosterRow[]; errors: string[] } {
  const rows: RosterRow[] = [];
  const errors: string[] = [];
  const seen = new Set<string>();
  text.split(/\r?\n/).forEach((line, i) => {
    const trimmed = line.trim();
    if (!trimmed) return;
    const [rawNim, ...rest] = trimmed.split(/[,;\t]/);
    const nim = rawNim.trim().toLowerCase();
    const name = rest.join(' ').trim();
    if (i === 0 && /^nim$/i.test(nim)) return;
    if (!NIM.test(nim)) { errors.push(`Baris ${i + 1}: NIM tidak valid`); return; }
    if (!name || name.length > 120) { errors.push(`Baris ${i + 1}: Nama wajib diisi (maks. 120 karakter)`); return; }
    if (seen.has(nim)) { errors.push(`Baris ${i + 1}: NIM duplikat`); return; }
    seen.add(nim);
    rows.push({ nim, name });
  });
  return { rows, errors };
}

export function validateRows(rows: unknown): RosterRow[] {
  if (!Array.isArray(rows) || rows.length === 0) throw new Error('Daftar mahasiswa kosong');
  if (rows.length > MAX_ROWS) throw new Error(`Daftar terlalu panjang (maksimal ${MAX_ROWS} baris)`);
  return rows.map((r, i) => {
    const nim = String((r as RosterRow)?.nim ?? '').trim().toLowerCase();
    const name = String((r as RosterRow)?.name ?? '').trim();
    if (!NIM.test(nim) || !name || name.length > 120) throw new Error(`Baris ${i + 1} tidak valid`);
    return { nim, name };
  });
}
```

- [ ] **Step 4: Run the unit tests**

Run: `npx vitest run supabase/functions`
Expected: PASS (3 tests).

- [ ] **Step 5: Implement** `supabase/functions/import-roster/index.ts`

```ts
import { createClient, type SupabaseClient } from 'npm:@supabase/supabase-js@2';
import { validateRows } from './validate.ts';

const EMAIL_DOMAIN = 'users.simrs-ueu.invalid';
const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } });

function tempPassword(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  return Array.from(crypto.getRandomValues(new Uint8Array(10)), b => alphabet[b % alphabet.length]).join('');
}

async function ensureAccount(admin: SupabaseClient, username: string, name: string, type: 'dosen' | 'mahasiswa') {
  const uname = username.trim().toLowerCase();
  const { data: existing } = await admin.from('profiles').select('id, full_name').eq('username', uname).maybeSingle();
  if (existing) return { id: existing.id as string, username: uname, name: existing.full_name as string, status: 'existing' as const, tempPassword: null };
  const pw = tempPassword();
  const { data, error } = await admin.auth.admin.createUser({ email: `${uname}@${EMAIL_DOMAIN}`, password: pw, email_confirm: true });
  if (error || !data.user) throw new Error(error?.message ?? 'createUser failed');
  const { error: pErr } = await admin.from('profiles').insert({
    id: data.user.id, username: uname, full_name: name.trim(), account_type: type, must_change_password: true,
  });
  if (pErr) { await admin.auth.admin.deleteUser(data.user.id); throw new Error(pErr.message); }
  return { id: data.user.id, username: uname, name: name.trim(), status: 'created' as const, tempPassword: pw };
}

Deno.serve(async req => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return json(405, { error: 'Method not allowed' });

  const url = Deno.env.get('SUPABASE_URL')!;
  const caller = createClient(url, Deno.env.get('SUPABASE_ANON_KEY')!, {
    global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } },
  });
  const { data: { user } } = await caller.auth.getUser();
  if (!user) return json(401, { error: 'Belum masuk' });

  const admin = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { auth: { persistSession: false } });
  const { data: me } = await admin.from('profiles').select('account_type, active').eq('id', user.id).maybeSingle();
  if (!me?.active) return json(403, { error: 'Akun tidak aktif' });

  let body: any;
  try { body = await req.json(); } catch { return json(400, { error: 'Body bukan JSON' }); }

  try {
    if (body.action === 'create_dosen') {
      if (me.account_type !== 'admin') return json(403, { error: 'Hanya admin yang dapat membuat akun dosen' });
      const acc = await ensureAccount(admin, String(body.username ?? ''), String(body.name ?? ''), 'dosen');
      const { id: _id, ...pub } = acc;
      return json(200, { accounts: [pub] });
    }

    if (body.action === 'import_roster') {
      const classId = String(body.classId ?? '');
      if (me.account_type !== 'admin') {
        const { data: m } = await admin.from('class_members').select('member_role, active')
          .eq('class_id', classId).eq('user_id', user.id).maybeSingle();
        if (!m?.active || m.member_role !== 'dosen') return json(403, { error: 'Hanya dosen kelas ini yang dapat mengimpor' });
      }
      const rows = validateRows(body.rows);
      const accounts = [];
      for (const r of rows) {
        const acc = await ensureAccount(admin, r.nim, r.name, 'mahasiswa');
        const { error } = await admin.from('class_members').upsert(
          { class_id: classId, user_id: acc.id, member_role: 'mahasiswa', active: true },
          { onConflict: 'class_id,user_id' },
        );
        if (error) throw new Error(error.message);
        const { id: _id, ...pub } = acc;
        accounts.push(pub);
      }
      return json(200, { accounts });
    }

    return json(400, { error: 'Aksi tidak dikenal' });
  } catch (e) {
    return json(400, { error: (e as Error).message });
  }
});
```

- [ ] **Step 6: Deploy to dev**

Run: `npx supabase functions deploy import-roster --use-api`
Expected: `Deployed Functions on project <dev-ref>: import-roster`.

- [ ] **Step 7: Write the integration test** `tests/integration/roster.test.ts`

```ts
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { admin, cleanupUsers, makeUser, type TestUser } from './helpers';

let d: TestUser, m: TestUser, cls: string;
const nim = `9${Date.now()}`.slice(0, 12);

beforeAll(async () => {
  d = await makeUser('dosen');
  m = await makeUser('mahasiswa');
  cls = (await d.client.rpc('create_class', { p_name: `TEST-roster-${Date.now()}` })).data as string;
});
afterAll(async () => {
  const { data } = await admin().from('profiles').select('id').eq('username', nim).maybeSingle();
  if (data) await admin().auth.admin.deleteUser(data.id);
  await cleanupUsers();
});

describe('import-roster', () => {
  it('creates a student who must change password and joins the class', async () => {
    const { data, error } = await d.client.functions.invoke('import-roster', {
      body: { action: 'import_roster', classId: cls, rows: [{ nim, name: 'Budi Uji' }] },
    });
    expect(error).toBeNull();
    expect(data.accounts[0]).toMatchObject({ username: nim, status: 'created' });
    expect(data.accounts[0].tempPassword).toHaveLength(10);
    const { data: p } = await admin().from('profiles').select('id, must_change_password, account_type').eq('username', nim).single();
    expect(p).toMatchObject({ must_change_password: true, account_type: 'mahasiswa' });
    const { data: mem } = await admin().from('class_members').select('member_role').eq('class_id', cls).eq('user_id', p!.id).single();
    expect(mem!.member_role).toBe('mahasiswa');
  });

  it('re-importing the same NIM does not create a duplicate', async () => {
    const { data } = await d.client.functions.invoke('import-roster', {
      body: { action: 'import_roster', classId: cls, rows: [{ nim, name: 'Budi Uji' }] },
    });
    expect(data.accounts[0]).toMatchObject({ status: 'existing', tempPassword: null });
  });

  it('students cannot import', async () => {
    const { error } = await m.client.functions.invoke('import-roster', {
      body: { action: 'import_roster', classId: cls, rows: [{ nim: 'x123', name: 'X' }] },
    });
    expect(error).not.toBeNull();
  });

  it('only admin creates dosen accounts', async () => {
    const { error } = await d.client.functions.invoke('import-roster', {
      body: { action: 'create_dosen', username: 'dsn.coba', name: 'Coba' },
    });
    expect(error).not.toBeNull();
  });
});
```

- [ ] **Step 8: Run it**

Run: `npm run test:integration -- roster`
Expected: PASS (4 tests). If the first test fails with an email-format error from `createUser`:
1. Change `EMAIL_DOMAIN` / `LOGIN_EMAIL_DOMAIN` to `users.simrs-ueu.example.com` in all three places: `index.ts`, `src/data-layer/session.ts` and `tests/integration/helpers.ts`.
2. Update the Global Constraints line accordingly.
3. Redeploy and re-run.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat(fn): import-roster edge function with roster parsing

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

### Task 14: Class and roster tab in *Hak Akses & Pengguna*

**Files:**
- Create: `src/components/kelas/KelasRosterPanel.tsx`
- Modify: `src/views/ManajemenUserView.tsx`:
  - tab state type (line 77)
  - a third tab button after the `rbac` button (~line 351)
  - render block after the users tab
  - imports
- Modify: `src/data/mockData.ts` (add `'manajemenuser'` to R03 access, so local mode matches the seed)

**Interfaces:**
- Consumes: `useApp()` fields `backendMode`, `accountType`, `activeClass`, `resetActiveClass` (Task 11); `parseRoster` (Task 13); `getSupabase` (Task 9).
- Produces: `KelasRosterPanel` React component (no props).

- [ ] **Step 1: Create** `src/components/kelas/KelasRosterPanel.tsx`

```tsx
import React, { useState } from 'react';
import Swal from 'sweetalert2';
import { Upload, RefreshCw, Download, School } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getSupabase } from '../../lib/supabaseClient';
import { parseRoster } from '../../../supabase/functions/import-roster/validate';

interface Account { username: string; name: string; status: 'created' | 'existing'; tempPassword: string | null }

export const KelasRosterPanel: React.FC = () => {
  const { activeClass, users, resetActiveClass, accountType } = useApp();
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Account[]>([]);
  const [newClassName, setNewClassName] = useState('');
  const parsed = parseRoster(text);
  const members = users.filter(u => /^[0-9a-f-]{36}$/.test(u.id));

  const importRoster = async () => {
    if (!activeClass || parsed.rows.length === 0) return;
    setBusy(true);
    const { data, error } = await getSupabase().functions.invoke('import-roster', {
      body: { action: 'import_roster', classId: activeClass.id, rows: parsed.rows },
    });
    setBusy(false);
    if (error) { void Swal.fire({ icon: 'error', title: 'Impor gagal', text: error.message }); return; }
    setResult(data.accounts as Account[]);
    setText('');
  };

  const downloadCsv = () => {
    const lines = ['NIM,Nama,Status,Password Sementara', ...result.map(a => `${a.username},"${a.name}",${a.status},${a.tempPassword ?? '-'}`)];
    const blob = new Blob([lines.join('\n')], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `akun-${activeClass?.name ?? 'kelas'}.csv`;
    a.click();
  };

  const reset = async () => {
    const ok = await Swal.fire({
      icon: 'warning', title: 'Reset rumah sakit kelas?',
      text: 'Semua data pasien kelas ini dikembalikan ke data awal. Riwayat audit tetap disimpan.',
      showCancelButton: true, confirmButtonText: 'Ya, reset', cancelButtonText: 'Batal',
    });
    if (!ok.isConfirmed) return;
    const res = await resetActiveClass();
    void Swal.fire({ icon: res.success ? 'success' : 'error', title: res.success ? 'Kelas direset' : 'Reset gagal', text: res.error });
  };

  const createClass = async () => {
    if (!newClassName.trim()) return;
    const { error } = await getSupabase().rpc('create_class', { p_name: newClassName.trim() });
    if (error) { void Swal.fire({ icon: 'error', title: 'Gagal membuat kelas', text: error.message }); return; }
    setNewClassName('');
    void Swal.fire({ icon: 'success', title: 'Kelas dibuat', text: 'Keluar lalu masuk kembali untuk memilih kelas baru.' });
  };

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 text-xs">
          <School className="w-5 h-5 text-blue-600" />
          <div>
            <div className="font-black text-slate-800">{activeClass?.name}</div>
            <div className="text-slate-500">{members.length} anggota kelas</div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <input value={newClassName} onChange={e => setNewClassName(e.target.value)} placeholder="Nama kelas baru"
            className="px-3 py-2 border border-slate-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500" />
          <button type="button" onClick={createClass} className="px-3 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold cursor-pointer">Buat Kelas</button>
          <button type="button" onClick={reset} className="px-3 py-2 bg-amber-100 text-amber-900 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer">
            <RefreshCw className="w-4 h-4" /> Reset Data Kelas
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="text-xs font-black text-slate-800">Impor Daftar Mahasiswa</div>
        <p className="text-[11px] text-slate-500">Tempel satu mahasiswa per baris: <span className="font-mono">NIM, Nama</span>. Pemisah boleh koma, titik koma, atau tab (salin langsung dari Excel).</p>
        <textarea value={text} onChange={e => setText(e.target.value)} rows={6}
          className="w-full p-3 border border-slate-300 rounded-xl text-xs font-mono outline-none focus:ring-2 focus:ring-blue-500"
          placeholder={'20240306044, Budi Santoso\n20240306045, Siti Aminah'} />
        {parsed.errors.length > 0 && (
          <ul className="text-[11px] text-rose-600 font-semibold list-disc pl-4">{parsed.errors.map(e => <li key={e}>{e}</li>)}</ul>
        )}
        <button type="button" disabled={busy || parsed.rows.length === 0} onClick={importRoster}
          className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl text-xs font-black flex items-center gap-2 cursor-pointer disabled:opacity-60">
          <Upload className="w-4 h-4" /> Impor {parsed.rows.length} Mahasiswa
        </button>
      </div>

      {result.length > 0 && (
        <div className="bg-white p-4 rounded-2xl border border-emerald-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-xs font-black text-emerald-900">Hasil Impor: bagikan password sementara ke mahasiswa</div>
            <button type="button" onClick={downloadCsv} className="px-3 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer">
              <Download className="w-4 h-4" /> Unduh CSV
            </button>
          </div>
          <table className="w-full text-[11px]">
            <thead><tr className="text-left text-slate-500"><th>NIM</th><th>Nama</th><th>Status</th><th>Password Sementara</th></tr></thead>
            <tbody>
              {result.map(a => (
                <tr key={a.username} className="border-t border-slate-100">
                  <td className="font-mono py-1">{a.username}</td><td>{a.name}</td>
                  <td>{a.status === 'created' ? 'Akun baru' : 'Sudah ada'}</td>
                  <td className="font-mono font-bold">{a.tempPassword ?? '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-[10px] text-slate-500">Password sementara hanya ditampilkan sekali. Mahasiswa wajib menggantinya saat login pertama.</p>
        </div>
      )}

      {accountType === 'admin' && (
        <p className="text-[11px] text-slate-500">Admin: akun dosen dibuat melalui fungsi <span className="font-mono">import-roster</span> (aksi <span className="font-mono">create_dosen</span>); lihat runbook.</p>
      )}
    </div>
  );
};
```

- [ ] **Step 2: Edit `src/views/ManajemenUserView.tsx`**

- Add the imports `import { KelasRosterPanel } from '../components/kelas/KelasRosterPanel';` and `School` to the lucide import list.
- Change the destructuring on line 72 to also take `backendMode, accountType`:
  `const { users, roles, user: currentUser, addUser, updateUser, deleteUser, updateRolePermissions, getRole, canEditPage, backendMode, accountType } = useApp();`
- Add `const showKelasTab = backendMode === 'supabase' && (accountType === 'dosen' || accountType === 'admin');`
- Change `useState<'users' | 'rbac'>('users')` to `useState<'users' | 'rbac' | 'kelas'>('users')`.
- After the closing `</button>` of the `rbac` tab button, insert:

```tsx
          {showKelasTab && (
            <button
              onClick={() => setActiveTab('kelas')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'kelas' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              <School className="w-4 h-4" />
              <span>Kelas & Roster</span>
            </button>
          )}
```

- Directly before `{/* TAB 1: DAFTAR PENGGUNA (USERS TABLE) */}`, insert:

```tsx
      {activeTab === 'kelas' && showKelasTab && <KelasRosterPanel />}
```

- [ ] **Step 3: Give R03 the module in local mode too.** In `src/data/mockData.ts`, R03's access list ends `'audit', 'logaktivitas'`. Change it to `'audit', 'logaktivitas', 'manajemenuser'`.

- [ ] **Step 4: Type-check, build and run unit tests**

Run: `npm run lint && npm run build && npm test`
Expected: all pass. Note: the import from `supabase/functions/import-roster/validate.ts` is allowed by `tsconfig.json`'s `exclude`, because the file is imported explicitly and has no Deno APIs.

- [ ] **Step 5: Manual check on dev.**
  1. Log in as `dsn.dr.wati` (R03), open *Hak Akses & Pengguna*, then *Kelas & Roster*.
  2. Paste two fake NIMs and import. Confirm the temporary passwords show and the CSV downloads.
  3. Log in as one of the new NIMs with its temporary password and confirm the *Ganti Password* screen appears.
  4. Set a new password and confirm the app opens.
  5. As the dosen, click *Reset Data Kelas* and confirm the patient list returns to the seed.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: class and roster tab for dosen and admin

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

## Phase 7 — Demo readiness (PR 6)

### Task 15: Bootstrap script, Vercel config and runbooks

**Files:**
- Create: `scripts/bootstrap.ts`
- Create: `vercel.json`
- Create: `docs/operations/demo-walkthrough.md`, `docs/operations/internal-server-deployment.md`
- Modify: `README.md` (add a "Running modes" and "Working with AI Studio" section)

**Interfaces:**
- Consumes: `DEMO_ACCOUNTS` (Task 12), `create_class` RPC (Task 8).
- Produces: the CLI `npm run bootstrap -- --env <file> --admin-password <pw> --class "<name>" [--demo]`.

- [ ] **Step 1: Implement** `scripts/bootstrap.ts`

```ts
import { createClient } from '@supabase/supabase-js';
import { parseArgs } from 'node:util';
import { DEMO_ACCOUNTS } from '../src/data/demoAccounts';

const DOMAIN = 'users.simrs-ueu.invalid';
const { values } = parseArgs({
  options: {
    env: { type: 'string', default: '.env.bootstrap.local' },
    'admin-username': { type: 'string', default: 'admin' },
    'admin-password': { type: 'string' },
    class: { type: 'string', default: 'Kelas Demo RMIK' },
    demo: { type: 'boolean', default: false },
  },
});

process.loadEnvFile(values.env!);
const url = process.env.SUPABASE_URL ?? process.env.SUPABASE_TEST_URL;
const service = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_TEST_SERVICE_ROLE_KEY;
const anonKey = process.env.SUPABASE_ANON_KEY ?? process.env.SUPABASE_TEST_ANON_KEY;
if (!url || !service || !anonKey) throw new Error('Env file must define SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY');

const admin = createClient(url, service, { auth: { persistSession: false } });

async function ensure(username: string, password: string, name: string, type: 'admin' | 'dosen' | 'mahasiswa') {
  const { data: existing } = await admin.from('profiles').select('id').eq('username', username).maybeSingle();
  if (existing) return existing.id as string;
  const { data, error } = await admin.auth.admin.createUser({ email: `${username}@${DOMAIN}`, password, email_confirm: true });
  if (error) throw error;
  const { error: pErr } = await admin.from('profiles').insert({ id: data.user.id, username, full_name: name, account_type: type });
  if (pErr) throw pErr;
  return data.user.id;
}

const demoAdmin = DEMO_ACCOUNTS.find(a => a.accountType === 'admin')!;
const adminUsername = values['admin-username']!;
const adminPassword = values['admin-password'] ?? (values.demo ? demoAdmin.p : undefined);
if (!adminPassword) throw new Error('--admin-password is required outside --demo');
await ensure(adminUsername, adminPassword, 'Super Administrator', 'admin');

const asAdmin = createClient(url, anonKey, { auth: { persistSession: false } });
const { error: sErr } = await asAdmin.auth.signInWithPassword({ email: `${adminUsername}@${DOMAIN}`, password: adminPassword });
if (sErr) throw sErr;
const { data: classId, error: cErr } = await asAdmin.rpc('create_class', { p_name: values.class });
if (cErr) throw cErr;
console.log(`Class "${values.class}" created: ${classId}`);

if (values.demo) {
  for (const acc of DEMO_ACCOUNTS.filter(a => a.u !== adminUsername)) {
    const id = await ensure(acc.u, acc.p, acc.label, acc.accountType);
    if (acc.accountType !== 'admin') {
      await admin.from('class_members').upsert(
        { class_id: classId, user_id: id, member_role: acc.accountType, active: true },
        { onConflict: 'class_id,user_id' },
      );
    }
    console.log(`demo account ready: ${acc.u}`);
  }
}
```

- [ ] **Step 2: Run it against dev and check**

Run: `npm run bootstrap -- --env .env.test.local --class "Kelas Dev" --demo`
Expected: `Class "Kelas Dev" created: <uuid>`, then six `demo account ready` lines. Running it again creates a second class and reuses the accounts.

- [ ] **Step 3: Create** `vercel.json`

```json
{
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

- [ ] **Step 4: Write** `docs/operations/demo-walkthrough.md`

```markdown
# Demo walkthrough (IT Esa Unggul & Kepala Laboratorium)

Demo URL: the Vercel production URL of `danielhappyg/SIMRS-UEU`. Data is synthetic only.

1. **Login & roles.** Log in as `mhs.pendaftaran` (preset). Point out that the role list is the same as Ema's, and that choosing *Admin* with a student account is refused by the server.
2. **Shared class hospital.** Register a new patient. In a second browser (private window), log in as `20240306044` (Mahasiswa Coding). The patient appears without reloading.
3. **Role enforcement.** As Mahasiswa Coding, try to edit the patient's address. The save is refused and the screen reverts.
4. **End-to-end flow.** Coding → Klaim on the new registration → Pelaporan RL shows it.
5. **Lecturer tools.** Log in as `dsn.dr.wati` → *Hak Akses & Pengguna* → *Kelas & Roster*: import two NIMs, show the temporary-password CSV, then *Reset Data Kelas*.
6. **Audit trail.** Open *Audit Trail* as the dosen: every change above is listed with user, role and time. Explain that it is append-only in the database.
7. **Hosting.** Explain that this demo uses Vercel + Supabase cloud, and that production moves to an internal server (see `internal-server-deployment.md`).
```

- [ ] **Step 5: Write** `docs/operations/internal-server-deployment.md`

```markdown
# Deploying SIMRS-UEU on an internal Esa Unggul server

## What runs
1. **Supabase (self-hosted)**: Postgres, Auth, REST, Realtime, Edge Functions. Official guide: https://supabase.com/docs/guides/self-hosting/docker (Docker Compose, about 8–10 containers). Minimum: 4 vCPU, 8 GB RAM, 50 GB disk.
2. **The web app**: static files from `npm run build` (`dist/`) served by nginx or any static web server.

## Steps
1. Install Docker and Docker Compose on the server.
2. Follow the self-hosting guide; set strong `POSTGRES_PASSWORD`, `JWT_SECRET`, `ANON_KEY`, `SERVICE_ROLE_KEY`, `DASHBOARD_PASSWORD`.
3. In the Auth settings (`.env` of the Supabase stack): `DISABLE_SIGNUP=true`, `ENABLE_EMAIL_AUTOCONFIRM=true`.
4. From a checkout of this repository:
   - `npx supabase db push --db-url "postgresql://postgres:<pw>@<server>:5432/postgres" --include-seed`
   - Copy `supabase/functions/import-roster` into the stack's `volumes/functions/` folder and restart the functions container.
5. Bootstrap the first admin and class:
   `npm run bootstrap -- --env .env.bootstrap.local --admin-password '<strong>' --class "<nama kelas>"`
   where `.env.bootstrap.local` contains `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` of the internal stack. Do NOT use `--demo`.
6. Build the app with `VITE_SUPABASE_URL=<internal API URL> VITE_SUPABASE_ANON_KEY=<anon> VITE_DEMO_MODE=false npm run build` and serve `dist/` (SPA fallback to `index.html`).
7. Admin creates dosen accounts (`import-roster` action `create_dosen`); dosen create classes and import rosters in the app.

## Backups
`pg_dump` the `public` and `auth` schemas daily. `audit_log` is append-only by design; plan retention with the lab.

## If Supabase cannot be self-hosted
The schema, RLS and functions run on plain PostgreSQL. Auth, Realtime and the roster function would need a replacement API behind a third data-layer adapter (see spec §11, Option 2).
```

- [ ] **Step 6: Add a section to `README.md`**

```markdown
## Running modes

- **Local mode (default, used in AI Studio):** no environment variables. Data lives in the browser.
- **Supabase mode:** set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (see `.env.example`). Data is shared per class in Postgres; logins, roles and the audit trail are enforced by the database.

## Working with AI Studio (important)

- Pull from GitHub (Settings → GitHub → Pull) before every AI Studio session.
- Never use "Force push".
- Screens talk to data only through `useApp()`; do not edit `src/data-layer/`, `src/lib/` or `supabase/` from AI Studio.
```

- [ ] **Step 7: Prepare the demo project and Vercel.**
  1. Link the CLI to `simrs-ueu-demo`: `npx supabase link --project-ref <demo-ref>`.
  2. Run `npx supabase db push --include-seed` and `npx supabase functions deploy import-roster --use-api`.
  3. Create `.env.bootstrap.local` with the demo values and run `npm run bootstrap -- --env .env.bootstrap.local --demo`.
  4. In Vercel → Project → Settings → Environment Variables, set `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (demo values) and `VITE_DEMO_MODE=true`, then redeploy.
  5. Re-link the CLI to dev afterwards: `npx supabase link --project-ref <dev-ref>`.

- [ ] **Step 8: Run the demo walkthrough on the Vercel URL.** Follow `docs/operations/demo-walkthrough.md` steps 1–6 exactly. Every step must behave as written. Fix any deviation before opening the PR.

- [ ] **Step 9: Final full verification**

Run: `npm run lint && npm run build && npm test && npm run test:integration`
Expected: all pass.

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "feat: bootstrap script, Vercel config, demo and internal-server runbooks

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

## PR map

| PR | Tasks | Title |
|---|---|---|
| — | 1 | (setup, no PR beyond the checklist doc; it can ride with PR 1) |
| 1 | 2 | Remove Praktikum & Ujian |
| 2 | 3–4 | Data-layer seam (no behaviour change) |
| 3 | 5–8 | Database: schema, RLS, audit, classes, seed |
| 4 | 9–12 | Supabase mode in the app |
| 5 | 13–14 | Roster import & class screen |
| 6 | 15 | Demo readiness |

Each PR description must list what Ema should click to verify in the Vercel preview, and must remind her to **Pull in AI Studio after merging**.
