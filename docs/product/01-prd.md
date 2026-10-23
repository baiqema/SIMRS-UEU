# Product requirements document (PRD)

| | |
| --- | --- |
| Product | SIMRS Esa Unggul (repository `SIMRS-UEU`, campus copy `esaunggul/simrs-rmik`) |
| Owner | Ema (product and screens), Daniel (backend and deployment) |
| Status | In use for teaching; written from the code on `main` at `c768230` |
| Last updated | 2026-10-23 |

Statements marked *(inferred)* come from reading the code, not from a written decision. Confirm them before relying on them.

## 1. Background

Students of the RMIK programme (Rekam Medis dan Informasi Kesehatan) need to practise the daily work of a hospital medical records unit: registering patients, keeping the electronic medical record (RME), coding diagnoses with ICD-10 and ICD-9-CM, preparing BPJS claims and producing the Ministry of Health RL reports. Practising on a real hospital system is not possible: the data is confidential and the systems are not built for a classroom.

SIMRS Esa Unggul is a hospital information system built for the classroom. It looks and behaves like a hospital SIMRS, but every record is simulated, every class gets its own copy of the hospital, and a lecturer can reset that copy to a known starting point.

## 2. Problem statement

- Lecturers have no shared, safe environment where a whole class can work on the same simulated hospital at the same time.
- Students learn the steps of one role in isolation and rarely see how their work feeds the next unit (registration → examination → coding → claim → report).
- Lecturers cannot see who did what, so assessing practical work is slow.

## 3. Goals

| # | Goal | How the product meets it |
| --- | --- | --- |
| G1 | Let students practise the full patient journey of a hospital, end to end | Modules from registration to reporting, linked by the same registration record |
| G2 | Let students take one hospital role at a time and feel its limits | 14 practice roles; each role can open and change only its own modules |
| G3 | Give each class its own hospital that the lecturer controls | Classes with their own data copy, roster import and *Reset Data Kelas* |
| G4 | Make every student action visible to the lecturer | Append-only audit trail per class |
| G5 | Teach national standards, not a vendor's quirks | ICD-10 / ICD-9-CM, KMK 1423/2022 metadata, INA-CBG, SIRS RL 3–5, BPJS fragmentation rules |
| G6 | Run on the university's own servers | Single Node.js process plus the campus PostgreSQL; Docker image |

## 4. Non-goals

- Treating real patients or storing real patient data. The system must never be connected to a real hospital, BPJS VClaim, E-Klaim, SATUSEHAT or SIRS online service.
- Billing real money or submitting real claims.
- Replacing the university's academic system (SIAKAD). Classes and rosters are entered here for practice only.
- Exams and graded practicum sessions. A Praktikum/Ujian module existed earlier and was removed on purpose (October 2026).

## 5. Users

Full detail is in [Users, roles and access](02-users-and-roles.md).

| User | Main need |
| --- | --- |
| Mahasiswa (RMIK student) | Practise the work of a hospital role on realistic cases |
| Dosen pengampu (lecturer) | Run a class: roster, reset data, watch the audit trail, take any role to demonstrate |
| Super Administrator | Create lecturer accounts, manage master data and role access for the whole install |
| IT unit (campus) | Install, back up and update the system (see [campus deployment](../operations/campus-deployment.md)) |

## 6. Scope

### 6.1 In scope (built)

| Area | Modules |
| --- | --- |
| Registration and consent | Pendaftaran & IGD, Kunjungan Pasien, Indeks Utama Pasien (IUP), Bed Management, General Consent |
| Clinical record | Pemeriksaan Pasien (RME) with 26 forms, CPPT, Asuhan Keperawatan, Informed Consent, Resume Medis |
| Supporting services | Farmasi, Laboratorium, Radiologi (view only, see §9) |
| Coding and claims | Coding ICD-10 & ICD-9-CM, Klaim & VClaim BPJS (simulated), Kamus Metadata KMK 1423 |
| Reporting | Pelaporan RS (SIRS RL 3.1–3.19, RL 4.1–4.3, RL 5.1–5.3), Dashboard Eksekutif |
| Finance | Billing Pasien, Kasir & Pembayaran |
| Administration | Master Data SIMRS, Hak Akses & Pengguna (users, role matrix, classes and rosters), Audit Trail, Log Aktivitas |

### 6.2 Running modes

| Mode | When | Data |
| --- | --- | --- |
| Local mode | Google AI Studio preview and quick demos | Stored in the browser only; one user |
| Server mode | Campus install | Stored in PostgreSQL; shared per class; access enforced by the database |

## 7. Key user journeys

1. **Lecturer prepares a class.** The administrator creates the lecturer account. The lecturer creates a class (a copy of the template hospital is made), imports the student roster from CSV and hands out the temporary passwords.
2. **Student signs in.** The student enters NIM and password, picks a practice role and, if a member of several classes, the class. At first login the student must change the temporary password.
3. **End-to-end case.** A *Mahasiswa Pendaftaran* registers a new patient and a visit and records the general consent. A *Mahasiswa Perawat* or *Dokter* fills the RME forms and CPPT. A *Mahasiswa Coding* codes the visit and locks the coding. A *Petugas Klaim* groups and submits the claim. A *Mahasiswa Pelaporan* sees the case appear in the RL reports. Other students see each change within a few seconds.
4. **Lecturer reviews.** The lecturer opens the Audit Trail and sees every change with user, practice role and time, then resets the class data before the next session.

## 8. Constraints

- **Editing workflow.** Ema edits the screens in Google AI Studio, which syncs only with GitHub. GitHub (`baiqema/SIMRS-UEU`) is therefore the main copy and the campus GitLab is refreshed from it. Screens may only reach data through `useApp()`; `server/`, `db/`, `src/data-layer/` and `src/lib/` must not be edited from AI Studio.
- **Infrastructure.** Production runs on the Esa Unggul PostgreSQL server (14 or newer) and one Node.js 20 process or Docker container. No cloud services.
- **Language.** The interface is in Bahasa Indonesia.
- **Data.** Simulated only; class data may be wiped at any time.

## 9. Known gaps and open questions

These come from reading the code and should be decided by the product owner.

| # | Observation | Effect |
| --- | --- | --- |
| Q1 | Farmasi, Laboratorium and Radiologi show fixed sample records held in memory. They are not stored in a table and have no create or edit form. | Students cannot practise ordering or entering results; changes would be lost on reload. |
| Q2 | Klaim takes the INA-CBG group code and tariff as typed values; there is no grouper. | Tariffs are not checked. *(inferred: intended for teaching the form only)* |
| Q3 | The sidebar lists every module for every role; a role without access gets an *Akses Ditolak* page when it opens one. | Students see modules they cannot use. |
| Q4 | Audit Trail is shown in the sidebar only for Super Admin (R01), but the page itself also admits Dosen (R03). R02, R12 and R13 have `audit` in their access lists but cannot open the page. | Lecturers cannot reach the audit trail from the sidebar. |
| Q5 | Kamus Metadata KMK 1423 (`metadata`) is reachable only by roles with `all` access (R01, R04). | Coding and records students cannot open the dictionary from the sidebar. |
| Q6 | Several access ids (`portal`, `vclaim`, `sep`, `eklaim`) appear in role lists but have no page of their own. | Harmless; they are features inside other pages. |
| Q7 | In server mode the screen-level edit rules (for example, *Mahasiswa Coding* may view but not edit clinical pages) are enforced by the screens; the database enforces the coarser table-to-module rule in [Users, roles and access §5](02-users-and-roles.md#5-what-the-database-enforces). | A student calling the API directly could edit more than the screens allow, within the class only. |

## 10. Success measures *(inferred)*

- A class of about 50 students can work on one class hospital at the same time without lost changes.
- A lecturer can set up a new class, including roster, in under 15 minutes.
- Every change in a class can be traced to a person and practice role in the audit trail.
- The campus IT unit can install and update the system by following the campus guide alone.

## 11. Release history

| Date | Change |
| --- | --- |
| Up to Oct 2026 | Screens built by Ema in Google AI Studio, data in the browser only |
| 2026-10-23 | Server mode merged (PR #2): own Node.js API on PostgreSQL, classes, rosters, audit trail, Docker. Supabase design dropped. Praktikum module removed. First copy pushed to the campus GitLab. |
