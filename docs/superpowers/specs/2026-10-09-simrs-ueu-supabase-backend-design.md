# SIMRS-UEU — Real Backend (Supabase) Design

- **Date:** 2026-10-09
- **Status:** Draft for review
- **Authors:** Daniel Happy Putra (with Claude Code); product and interface owner: Ema Prayitna
- **Repository:** `baiqema/SIMRS-UEU`

## 1. Guiding principle

**Ema's application is the product.** Her interface, modules and workflows define the scope and the look. This work only adds what is missing underneath: a real database, real login, classes and rosters, an audit trail the database enforces, and a deployment path that can move to an Esa Unggul internal server.

Consequences:

- We do not redesign or restyle her screens. New screens (first-login password change, class and roster management, save-error notice) reuse her existing components and visual style.
- Features from `danielhappyg/simrs-campus-ueu` (finance settlement, pharmacy custody, and so on) are **not** ported unless the team asks for them later. That repository is reference only.
- Future features follow the same split: Ema designs screens in AI Studio, and the backend work makes them save to the real database.

## 2. Purpose and users

SIMRS-UEU is a **learning tool** for health-sciences students, primarily RMIK, at Universitas Esa Unggul. It is a simulated hospital information system (SIMRS) with synthetic data only. It is **not** an exam platform. When exams happen, students use the tool during them, but the system itself has no exam module.

| Account type | Who | Can do |
|---|---|---|
| `admin` | Head of laboratory, IT | Everything: manage dosen accounts and all classes |
| `dosen` | Lecturers | Create classes, import rosters, reset a class hospital, read and edit everything in their own classes, view their classes' audit trail |
| `mahasiswa` | Students | Log in to their class hospital with a chosen practice role, view all modules, edit the modules their practice role allows |

The demo audience is IT Esa Unggul and the head of laboratory, through a Vercel-hosted link. The final target is an internal Esa Unggul server.

## 3. Scope

### In scope

1. Remove the Praktikum and Ujian features (see §9).
2. Add a data layer with two modes behind the existing `useApp()` interface: **local mode** (current `localStorage` behaviour) and **Supabase mode**.
3. A Supabase (Postgres) schema, row-level security (RLS) policies, audit triggers and seed data, all kept as SQL migration files in the repository.
4. Real authentication: hashed passwords, first-login password change, and practice-role selection checked by the server.
5. Classes, where one class is one simulated hospital, plus roster import by a dosen.
6. Wiring the existing Audit Trail and Log Aktivitas screens to the database audit log.
7. A demo deployment on Vercel, plus a written runbook for moving to an internal server.

### Out of scope (for now)

- Any real BPJS, VClaim, SATUSEHAT, LIS or PACS integration. Everything stays simulated.
- New clinical modules or redesigns. Modules that are currently static mock views (Farmasi, Laboratorium, Radiologi) stay as they are until Ema makes them editable.
- File uploads to storage. Document entries (`DokumenBerkas`) keep only metadata, as they do now.
- Real-time conflict resolution beyond "last save wins per record" (see §6.4).
- Gemini and AI features. The unused `@google/genai`, `express` and `dotenv` dependencies are removed.

## 4. Repository and collaboration workflow

- All work happens on branches in `baiqema/SIMRS-UEU` and lands through **pull requests that Ema merges**. Nobody pushes straight to `main`.
- **AI Studio sync rules for Ema:**
  - Pull from GitHub (Settings → GitHub tab, check that it says "In Sync") before every AI Studio session.
  - Never use "Force push" once the backend is merged.
  - Before relying on this, Daniel and Ema run the sync once on a throwaway branch.
- **Isolation as a safety net:** backend code lives in new files only (`src/lib/`, `src/data-layer/`, `supabase/`). Inside existing files, only the internals of `src/context/AppContext.tsx` change, plus the small edits listed in §9 and §7.4. If an AI Studio push overwrites something, the damage is easy to spot in the PR diff and easy to restore.
- **Local mode stays the default** when no Supabase settings are present. Ema's AI Studio preview therefore keeps working with no setup.

## 5. Architecture

```
Browser (Ema's React app, unchanged screens)
   │  useApp()  ← same functions and state as today
   ▼
AppContext.tsx  (internals rewritten)
   │
   ▼
src/data-layer/
   ├─ index.ts          picks the adapter: Supabase if VITE_SUPABASE_URL is set, otherwise local
   ├─ localAdapter.ts   today's localStorage behaviour, moved here unchanged
   └─ supabaseAdapter.ts  loads per class, saves by diff, subscribes to changes
   │
   ▼
Supabase: Auth · Postgres (tables + RLS + triggers) · Realtime · one Edge Function (roster import)
```

The only Supabase services used are **Auth, Postgres, Realtime and Edge Functions**. All four are part of the self-hostable open-source Supabase stack (see §11).

## 6. Data layer

### 6.1 Entities and tables

There is one table per entity that Ema's app already persists:

| `localStorage` key today | Table |
|---|---|
| `simrs_patients` | `patients` |
| `simrs_registrations` | `registrations` |
| `simrs_generalConsents` | `general_consents` |
| `simrs_informedConsents` | `informed_consents` |
| `simrs_medicalRecords` | `medical_records` |
| `simrs_cppt` | `cppt` |
| `simrs_asuhanKeperawatan` | `asuhan_keperawatan` |
| `simrs_resume_medis` | `resume_medis` |
| `simrs_coding` | `coding` |
| `simrs_claims` | `claims` |
| `simrs_billing` | `billing` |
| `simrs_beds` | `beds` |
| `simrs_dokumenBerkas` | `dokumen_berkas` |
| `simrs_auditTrail` | `audit_log` (see §8) |
| `simrs_users` / `simrs_current_user` | `profiles` and `class_members`, managed by Supabase Auth (see §7) |
| `simrs_roles` | `practice_roles`, read-only reference (see §7.2) |
| `simrs_exam_scenarios`, `simrs_exam_submissions` | removed (see §9) |

**Columns of every clinical table:**

| Column | Type | Notes |
|---|---|---|
| `class_id` | uuid | Which class hospital the row belongs to |
| `id` | text | Ema's existing client-generated id (e.g. `REG001`) |
| `data` | jsonb | Ema's TypeScript object, stored as-is |
| `created_by`, `updated_by` | uuid | Set by trigger from `auth.uid()` |
| `created_at`, `updated_at` | timestamptz | Set by trigger |

- The primary key is `(class_id, id)`, so every class can start from the same seed ids.
- A field gets its own column (generated from `data` and indexed) only when the database must filter or report on it: patient RM number, registration date and care type, and ICD codes in `coding`.
- When Ema adds new fields in AI Studio, they need no migration because they live inside `data`.

### 6.2 AppContext contract

- The `useApp()` value keeps exactly the same shape, minus the removed exam and praktikum members (§9). The screens do not change.
- Each state slice stays a React state array. After login, the adapter loads all rows for the active class into those arrays.
- Ema's `setX(prev => next)` calls stay. A wrapper compares the previous and next arrays by `id` and then:
  - **upserts** rows that were added or changed
  - **deletes** rows that were removed
- If a save fails, for example because RLS denied it, the local state rolls back to the server version and a notice appears in her toast style: *"Peran Anda tidak memiliki izin mengubah modul ini."*
- Changes made by other class members arrive through a Realtime subscription filtered by `class_id`, with a full refetch when the browser window regains focus.

### 6.3 Seed data and class lifecycle

- A script (`scripts/build-seed.ts`) reads Ema's `src/data/mockData.ts` and writes `supabase/seed/template.sql`. That file fills a **template class**, which has a fixed `class_id` and is never assigned to users.
- `create_class(name)` (a Postgres function) creates a class and copies every template row into it.
- `reset_class(class_id)` (dosen or admin only) deletes the class's clinical rows and copies the template again. The audit log is **not** reset.
- When Ema changes `mockData.ts`, re-running the seed script refreshes the template. Existing classes are not affected until they are reset.

### 6.4 Concurrent edits

Last save wins, per record. Every change is captured in the audit log (§8), so a lecturer can see who overwrote what. This is enough for a learning tool. Optimistic locking on `updated_at` can be added later if needed.

## 7. Authentication, roles and classes

### 7.1 Login

- The login screen keeps Ema's layout: Username/NIM, password, role picker.
- Under the hood, the username or NIM maps to an internal Supabase Auth email of the form `<username>@users.simrs-ueu.invalid`. Users never see it.
- **Removed from the current login:**
  - the fallback that accepts any password for a known username
  - auto-creation of unknown usernames
  - the role dropdown overriding the account's real role
- The preset demo-accounts box shows only when `VITE_DEMO_MODE=true`. It is used for the Vercel demo and is off on the internal server.
- At first login (`profiles.must_change_password = true`), a password-change screen in Ema's style appears before anything else.
- If a user belongs to more than one class, a class picker appears after login. Otherwise the app goes straight to their only class.

### 7.2 Practice roles

- Ema's role list (R01–R14 with their `access` module lists) moves into the `practice_roles` table. `getRole()` and `canEditPage()` in the app read from it, so the **interface and the database use one list**.
- Choosing a practice role calls `start_practice_session(class_id, role_id)`. That function checks:

| Practice role | Allowed for |
|---|---|
| R01 Super Admin | `admin` accounts only |
| R03 Dosen | `dosen` and `admin` accounts |
| R02, R04–R14 | any class member |

- **R04 "Mahasiswa (All Modul)" is always available**, as in Ema's design.
- The active session is stored in `practice_sessions (user_id, class_id, role_id, started_at, ended_at)`. Switching role ends the current session and starts a new one, and both events are audited.

### 7.3 What RLS enforces

Each rule uses helper functions `current_class()`, `current_role_access()` and `account_type()`, which read the user's open practice session.

- **Read:** any member of a class can select all clinical rows of that class.
- **Insert, update, delete:** allowed when the row's `class_id` is the session's class **and** the table's module is in the active practice role's `access` list, or that list contains `all`.
- **Dosen:** full read and write on classes where they are a `dosen` member.
- **Admin:** full access.

Tables map to modules as follows. This mapping is itself stored in a table, so it stays in one place:

| Table | Module(s) |
|---|---|
| `patients`, `registrations`, `beds` | `pendaftaran` (and `bedmanagement` for `beds`) |
| `general_consents` | `generalconsent` |
| `informed_consents` | `informedconsent` |
| `medical_records` | `rekammedis` |
| `cppt` | `cppt` |
| `asuhan_keperawatan` | `keperawatan` |
| `resume_medis` | `resumemedis` |
| `coding` | `coding` |
| `claims` | `klaim` |
| `billing` | `billing`, `pembayaran` |
| `dokumen_berkas` | any module the role can edit |

### 7.4 Classes and roster screen

Ema's **Hak Akses & Pengguna** screen keeps its look but becomes class and roster management, visible to dosen and admin:

- Create a class, see its members, and reset the class hospital.
- **Import roster:** paste or upload `NIM, Nama` rows. The `import-roster` Edge Function, which is the only code that holds the service-role key, then:
  - creates the missing accounts with a temporary password
  - sets `must_change_password`
  - adds the accounts to the class as `mahasiswa`
- Deactivate a member. An inactive member cannot start a practice session.
- Admin only: create `dosen` accounts.

## 8. Audit trail

- A trigger on every clinical table writes to `audit_log` on each insert, update and delete. Each entry records:
  - `actor_id` and actor name
  - `class_id`
  - `practice_role_id`
  - `action`, `entity` and `entity_id`
  - the old and new `data` as jsonb
  - the server timestamp
- Ema's app-level events (LOGIN, LOGOUT, NAVIGATE, and role switches) are inserted by the `log_event()` function into the same table.
- `audit_log` is **append-only**. RLS allows inserts only through the trigger or `log_event()`. No update or delete is allowed for anyone, admin included.
- **Read access:** dosen read their own classes, admin reads all, and students read the events for their own class.
- Ema's **Audit Trail** and **Log Aktivitas** screens read from `audit_log` through the adapter. The data is mapped to her existing `AuditEntry` shape, so the screens do not change.

## 9. Removals (Praktikum and Ujian)

Removed files:

- `src/views/PraktikumView.tsx`
- `src/components/praktikum/` (MateriPraktikumView, QuizEvaluasiView)
- `src/components/exam/` (ExamDualPaneWorkspace, ExamScenarioManagerModal)
- `src/data/praktikumMateriQuizData.ts`
- `src/data/examScenariosData.ts`

Edits in existing files:

- `App.tsx`: remove the `praktikum` route.
- `Sidebar.tsx` and `Header.tsx`: remove the "Ujian Praktik & Simulasi" entry and any links to it.
- `AppContext.tsx`: remove `praktikum`, `examScenarios`, `examSubmissions`, their save and delete functions, and `injectSimulationPatient`.
- `types.ts`: remove `ExamScenario`, `ExamSubmission` and `PraktikumModule`.
- `utils/pdfExtractor.ts`: remove the exam-only functions; keep anything other code still imports.
- `practice_roles`: drop `praktikum` from R03's access list.
- `package.json`: remove `@google/genai`, `express`, `@types/express` and `dotenv`.
- `metadata.json`: remove the Gemini capability.

## 10. Deployment: demo on Vercel

- Daniel forks the repository to `danielhappyg/SIMRS-UEU` and connects **his** Vercel account to the fork. Ema does not need a Vercel account.
- The fork's `main` is synced from Ema's `main` after each merged PR. Pull requests to Ema's repo still come from branches.
- Vercel settings:
  - Build: `vite build`, output `dist/`.
  - Environment variables: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_DEMO_MODE=true`.
  - Add an SPA rewrite to `index.html` if routing needs it.
- The **service-role key exists only as an Edge Function secret in Supabase.** It never appears in the repository, in Vercel, or in any `VITE_` variable.
- One Supabase cloud project is created for the demo. It holds synthetic data only.
- Note: Vercel's Hobby plan is for personal, non-commercial use. A long-running university deployment may need a paid plan. This matters less because the final target is internal hosting.

## 11. Portability: moving to an internal server

- Everything the backend needs lives in the repository:
  - `supabase/migrations/*.sql` (schema, RLS, triggers, functions)
  - `supabase/seed/`
  - `supabase/functions/import-roster/`
- **Option 1, recommended:** self-host Supabase on the internal server with its official Docker Compose setup (about 8–10 containers), and serve the built `dist/` from any static web server (for example nginx). The app needs only new values for `VITE_SUPABASE_URL` and the anon key, and `VITE_DEMO_MODE=false`.
- **Option 2, fallback:** if IT will not run the Supabase stack, the SQL schema and RLS still run on plain PostgreSQL. A thin API would then replace Auth, Realtime and the Edge Function behind a third data-layer adapter. That is not built now, but the adapter boundary in §5 keeps it possible.
- A runbook, `docs/operations/internal-server-deployment.md`, is written as part of this work for the IT meeting.

## 12. Rollout phases

Each phase is one pull request into Ema's `main`.

1. **Prep (no code):** fork the repo and connect Vercel, create the Supabase demo project, and run the AI Studio sync test with Ema.
2. **Removals:** §9. The app still runs in local mode, and the PR preview is checked by clicking through every remaining module.
3. **Data-layer seam:** move today's `localStorage` logic into `localAdapter.ts` behind the adapter interface. There is no behaviour change.
4. **Database:** migrations, RLS, triggers, the template seed script, and `create_class` / `reset_class`.
5. **Supabase adapter and auth:** `supabaseAdapter.ts`, the login rewrite (§7.1), practice sessions, the first-login password screen, the class picker, and the save-error notice.
6. **Roster and audit:** the `import-roster` Edge Function, the class and roster screen, and Audit Trail and Log Aktivitas wired to `audit_log`.
7. **Demo readiness:** `VITE_DEMO_MODE` presets, a demo class with demo dosen and student accounts, a demo walkthrough script, and the internal-server runbook.

## 13. Testing

- **Database:** `supabase test db` (pgTAP) tests for each RLS rule:
  - a student cannot write a module outside their role
  - no one can read another class
  - R01 and R03 cannot be selected by students
  - `audit_log` rejects update and delete
  - `reset_class` keeps the audit history
- **Data layer:** Vitest unit tests for the diff-to-upsert/delete wrapper and for the mapping of `audit_log` rows to `AuditEntry` (add `vitest` as a dev dependency).
- **Type check:** `npm run lint` (`tsc --noEmit`) passes.
- **Manual:** after each phase, a click-through on the Vercel PR preview covering registration → CPPT → resume medis → coding → claim → RL reporting, using two student accounts in different roles in the same class.

## 14. Risks and open items

| Item | Mitigation or owner |
|---|---|
| AI Studio push overwrites backend files | Pull-before-session and no force push (§4); backend code kept in isolated files; review every PR diff |
| AI Studio pull behaviour with unsaved local edits is not documented | One-time sync test with Ema in phase 1 |
| Ema's screens may write large arrays often, causing many small saves | Diff-based saves change only the touched rows; batch if profiling shows a problem |
| IT may not accept running the Supabase Docker stack | Raise in the demo meeting; Option 2 in §11 |
| Vercel Hobby plan terms for institutional use | Demo only; internal hosting is the target |
| Static modules (Farmasi, Laboratorium, Radiologi) are not persisted | Intentional; wire them when Ema makes them editable |
