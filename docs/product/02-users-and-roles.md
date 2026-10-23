# Users, roles and access

SIMRS Esa Unggul separates two ideas:

- **Account type**: who the person really is at the university (`admin`, `dosen`, `mahasiswa`). Stored in `profiles.account_type` and fixed.
- **Practice role**: the hospital job the person plays in this session (for example *Mahasiswa Coding*). Chosen at login, stored in `practice_sessions`, and can change from session to session.

Access to modules follows the practice role. Account type decides which practice roles a person may choose and who may manage classes.

## 1. Personas

### Mahasiswa RMIK (student)
Second- or third-year RMIK student. Comfortable with a browser, new to hospital systems. Signs in with NIM. Plays one hospital role per session, often in a computer lab where the whole class shares one network address. Needs clear feedback when an action is outside the role.

### Dosen pengampu (lecturer)
Teaches the practicum. Creates the class, imports the roster, resets the class hospital before a session, demonstrates any module, and reviews the audit trail to see what each student did. May teach several classes.

### Super Administrator
Usually the laboratory head or programme IT contact. Creates lecturer accounts, maintains master data (rooms, beds, doctors, polyclinics), edits the role access matrix, sees every class.

### IT unit (campus)
Installs and runs the system on the campus server. Does not use the screens. Served by the [operations guides](../operations/campus-deployment.md).

## 2. Account types

| Account type | Created by | Can choose practice roles | Class rights |
| --- | --- | --- | --- |
| `admin` | `bootstrap` command at install | Any, including R01 Super Admin | Sees and changes every class; creates classes; resets any class; changes master data and role access |
| `dosen` | Admin (*Tambah Akun Dosen*) | Any except R01 | Creates classes (becomes their dosen); for own classes: imports roster, activates or deactivates students, resets data, changes all class data |
| `mahasiswa` | Dosen roster import (CSV) | Any except R01 and R03 | Reads all data of classes they belong to; changes only the tables their practice role allows |

New accounts from a roster import or *Tambah Akun Dosen* get a random 10-character temporary password and must change it at first login (minimum 8 characters).

## 3. Practice roles

The 14 roles come from Ema's prototype (`src/data/mockData.ts`) and are seeded into `practice_roles` (`db/seed.sql`). The admin can change their access lists in *Hak Akses & Pengguna → Matriks Hak Akses*; changes apply to every class.

| Id | Name | Offered on the login screen | Typical use |
| --- | --- | --- | --- |
| R01 | Super Admin | Yes (admin accounts only) | System administration |
| R02 | Laboran/Radiologi | No | Laboratory and radiology staff |
| R03 | Dosen | Yes (dosen and admin only) | Lecturer demonstrations and review |
| R04 | Mahasiswa (All Modul) | Yes | Free practice across all modules |
| R05 | Dokter | No | Doctor (DPJP) |
| R06 | Mahasiswa Perawat | Yes | Nurse: assessment, CPPT, nursing care |
| R07 | Mahasiswa Pendaftaran | Yes | Registration, IUP, SEP, general consent |
| R08 | Petugas Rekam Medis | No | Medical records officer |
| R09 | Mahasiswa Coding | Yes (default) | ICD-10 / ICD-9-CM coding, INA-CBG |
| R10 | Keuangan/Farmasi | No | Billing, cashier, pharmacy |
| R11 | Petugas Klaim BPJS | No | BPJS claims |
| R12 | Kepala Rekam Medis | No | Head of medical records |
| R13 | Mahasiswa Pelaporan | Yes | RL reports and indicators |
| R14 | Mahasiswa Keperawatan | No | Nursing care documentation |

Roles marked "No" exist in the database and the access matrix but cannot be picked on the login screen today.

## 4. Module access matrix

Module ids are the page ids used in code and in `practice_roles.access`. `all` means every module. ✓ = can open; **E** = can also edit in the screens.

| Module (id) | R01 | R02 | R03 | R04 | R05 | R06 | R07 | R08 | R09 | R10 | R11 | R12 | R13 | R14 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Dashboard (`dashboard`) | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Pendaftaran, Kunjungan, IUP (`pendaftaran`) | E | | E | E | | | E | | | | | | | |
| Bed Management (`bedmanagement`) | E | | E | E | | | E | | | | | | | |
| General Consent (`generalconsent`) | E | | E | E | | | E | | ✓ | | | | | |
| Pemeriksaan Pasien / RME (`rekammedis`) | E | | E | E | E | E | E | E | ✓ | | | E | | E |
| CPPT (`cppt`) | E | | E | E | E | E | | E | ✓ | | | | | E |
| Informed Consent (`informedconsent`) | E | | E | E | E | E | | | ✓ | | | | | |
| Resume Medis (`resumemedis`) | E | | E | E | E | E | | E | ✓ | | | | | E |
| Farmasi (`farmasi`) | E | | E | E | | | | | ✓ | E | | | | |
| Laboratorium (`laboratorium`) | E | E | E | E | E | E | | | ✓ | | | | | |
| Radiologi (`radiologi`) | E | E | E | E | E | E | | | ✓ | | | | | |
| Coding (`coding`) | E | | E | E | | | | E | E | | E | E | | |
| Klaim & VClaim (`klaim`) | E | | E | E | | | | | E | | E | | | |
| Pelaporan RL (`pelaporan`) | E | | E | E | | | | E | E | | | E | E | |
| Kamus Metadata (`metadata`) | E | | | E | | | | | | | | | | |
| Billing (`billing`) | E | | E | E | | | | | | E | E | | | |
| Kasir & Pembayaran (`pembayaran`) | E | | E | E | | | | | | E | | | | |
| Master Data (`masterdata`) | E | | | | | | | | | | | | | |
| Audit Trail (`audit`) | ✓ | | ✓ | | | | | | | | | | | |
| Log Aktivitas (`logaktivitas`) | ✓ | | ✓ | ✓ | | | | | | | | | | |
| Hak Akses & Pengguna (`manajemenuser`) | E | | E | E | | | | | | | | E | | |

Rules behind the matrix (from `src/App.tsx` and `canEditPage` in `src/context/AppContext.tsx`):

- `kunjungan` and `indekspasien` open for any role with `pendaftaran` or `kunjungan`; `bedmanagement` for any role with `pendaftaran` or `bedmanagement`.
- `audit` opens only for R01 and R03, whatever the access list says. The sidebar shows it only to R01.
- `masterdata` opens and edits only for R01.
- Mahasiswa Coding (R09) may open the clinical, consent, supporting and registration pages but never edit them; it edits `coding`, `klaim` and `pelaporan` (report filters only).
- Dashboard, Audit Trail and Log Aktivitas are read-only views; every role that can open them sees them the same way.
- `keperawatan` (Asuhan Keperawatan) has no page of its own; it is a tab inside Pemeriksaan Pasien and decides who may save nursing care records.

## 5. What the database enforces

In server mode the screens' rules above are backed by PostgreSQL row-level security. Every request runs as the signed-in user, and the database checks:

| Action | Allowed when |
| --- | --- |
| Read any class data | The user is an admin, or an active member of the class with an active account |
| Write a clinical table | Admin; or dosen of the class; or an active member whose open practice role has `all` or a module listed for that table in `table_modules` (below) |
| Write a master data table | Admin only |
| Change role access lists | Admin only |
| Start a practice session as R01 / R03 | Admin / dosen or admin |
| Reset class, set member active | Admin, or dosen of that class |
| Import roster | Admin, or active dosen of that class |
| Read the audit log | Admin, or a member of the class |
| Change or delete audit entries | Nobody (append-only) |

Table-to-module mapping (`public.table_modules`):

| Table | Writable by roles with any of these modules |
| --- | --- |
| `patients` | pendaftaran |
| `registrations`, `beds` | pendaftaran, bedmanagement |
| `general_consents` | pendaftaran, generalconsent |
| `medical_records` | rekammedis, pemeriksaan |
| `billing` | rekammedis, pemeriksaan, billing, pembayaran |
| `cppt` | rekammedis, cppt |
| `informed_consents` | informedconsent |
| `coding` | coding, rekammedis, pemeriksaan |
| `claims` | klaim |
| `resume_medis` | resumemedis |
| `asuhan_keperawatan` | keperawatan |
| `dokumen_berkas` | pendaftaran, rekammedis, cppt, keperawatan, resumemedis, laboratorium, radiologi, coding |
| `staff_directory` | manajemenuser |
| `master_ruangan`, `master_bed`, `master_dokter`, `master_poli`, `doctor_poli_mappings` | masterdata (admin only in practice) |

Because R09 has `rekammedis` in its access list, the database would let a Mahasiswa Coding write `medical_records`; only the screen stops it. See PRD open issue Q7.

## 6. Sessions

- One open practice session per account. Signing in again elsewhere ends the first window's session; its next save is refused.
- Starting or ending a practice session writes `LOGIN` / `LOGOUT` to the class audit log, with the role.
- A deactivated class member loses their open session in that class at once.
- Login tokens last 12 hours by default (`TOKEN_TTL`).
- Failed logins are limited to 10 per username and 200 per IP address in 15 minutes.
