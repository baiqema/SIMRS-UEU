# Functional requirements

Requirements are written from the behaviour of the code on `main` (`c768230`). Each has an id `FR-<module>-<n>` so test cases and change requests can refer to it. "The system" means the web app together with, in server mode, the API and database.

Who may open and edit each module is defined in [Users, roles and access](02-users-and-roles.md). Any module opened without edit rights shows a *Mode Lihat* (view-only) banner, and every save action shows *Akses Terbatas* instead of saving.

Module ids in brackets are the page ids used in code.

## AUTH: Sign-in, class selection and password

| Id | Requirement |
| --- | --- |
| FR-AUTH-1 | The user signs in with username or NIM, password and a practice role chosen from a list (default *Mahasiswa Coding*). |
| FR-AUTH-2 | Usernames are case-insensitive and may contain only `a-z 0-9 . _ -`. |
| FR-AUTH-3 | A wrong username or password gives the same message (*Username/NIM atau password salah*) in the same time, so usernames cannot be guessed. |
| FR-AUTH-4 | After 10 failed attempts for a username, or 200 from one IP address, sign-in is blocked for 15 minutes. |
| FR-AUTH-5 | A deactivated account, or an account in no class, cannot sign in and is told to contact the lecturer. |
| FR-AUTH-6 | A user who belongs to more than one class picks the class after signing in (*Pilih Kelas*). |
| FR-AUTH-7 | A user whose account has a temporary password must set a new password of at least 8 characters before reaching any module. |
| FR-AUTH-8 | Choosing *Super Admin* requires an admin account; choosing *Dosen* requires a dosen or admin account. |
| FR-AUTH-9 | Reloading the page keeps the user signed in with the same class and role until the token expires (12 hours by default). |
| FR-AUTH-10 | Signing in with the same account in another window ends the first window's practice session; the first window's saves are then refused. |
| FR-AUTH-11 | On demo installs (`VITE_DEMO_MODE=true`) and in local mode the login screen lists preset demo accounts that fill the form in one click. The real admin account is never listed in server mode. |

## DASH: Dashboard Eksekutif (`dashboard`)

| Id | Requirement |
| --- | --- |
| FR-DASH-1 | Show patient totals, new versus returning patients, payer mix (BPJS, Umum, Asuransi) and gender split for a chosen period (today, this week, this month, this year). |
| FR-DASH-2 | Show bed capacity and occupancy, and hospital efficiency indicators BOR, ALOS, BTO and TOI. |
| FR-DASH-3 | Export the summary as CSV and print it. |
| FR-DASH-4 | Link to Bed Management. |

## REG: Pendaftaran, Kunjungan and IUP (`pendaftaran`, `kunjungan`, `indekspasien`)

| Id | Requirement |
| --- | --- |
| FR-REG-1 | Register a visit of type Rawat Jalan, Rawat Inap, IGD or Bayi Baru Lahir for a new or existing patient. |
| FR-REG-2 | Give each new patient the next free medical record number (No. RM) automatically. |
| FR-REG-3 | Record patient identity: NIK (16 digits), name (required), date of birth, sex, blood type, allergies, phone, address down to village using the Indonesian region selector, and a guarantor with relationship and address. |
| FR-REG-4 | Record the payer. For BPJS the card number must be exactly 13 digits; a simulated eligibility check returns *Aktif* or *Tidak Aktif* and the BPJS class. |
| FR-REG-5 | Refuse a registration that duplicates an existing patient by No. RM, NIK, BPJS number, or the same name and date of birth (*Pendaftaran Duplikat Ditolak*), and offer to load the existing patient instead. |
| FR-REG-6 | For Rawat Jalan choose polyclinic and DPJP from master data; for Rawat Inap choose room and bed from the bed map; for IGD record triage level (Merah, Kuning, Hijau, Hitam), reason for visit and GCS. |
| FR-REG-7 | For Bayi Baru Lahir record mother's No. RM and name, birth weight, length, head circumference, APGAR and delivery method. |
| FR-REG-8 | Warn of **potential fragmentation**: a Rawat Jalan visit to the same polyclinic within 7 days of a previous one, or to another polyclinic within 7 days. Warn of **potential readmission**: a Rawat Inap visit within 30 days of a previous one. Show the BPJS exception conditions and keep the flag and reason on the visit. |
| FR-REG-9 | Enforce service time limits: a Rawat Jalan control or referral date may be at most 7 days old; an inpatient stay over 30 days is flagged. Input past the limit is blocked unless an override with approver and reason is recorded. |
| FR-REG-10 | Issue a simulated SEP number through the VClaim SEP form. |
| FR-REG-11 | List visits (*Kunjungan Pasien*) with filters by date, type, polyclinic, status and fragmentation flag; edit polyclinic, doctor, room and status; cancel a visit (status *Batal*). |
| FR-REG-12 | Search the patient master index (IUP) by name, No. RM, NIK and date of birth; open the comprehensive patient profile (visits, CPPT, documents); correct patient identity. |
| FR-REG-13 | Print the visit receipt, the RM tracer (outguide) and the general consent form. |
| FR-REG-14 | Simulate sending the patient identity to SATUSEHAT and show a generated SATUSEHAT id. No real connection is made. |

## BED: Bed Management (`bedmanagement`)

| Id | Requirement |
| --- | --- |
| FR-BED-1 | Show every bed by room, floor and class (VVIP, VIP, Kelas 1–3, IGD, ICU) with status Available, Occupied, Cleaning or Maintenance and the current patient. |
| FR-BED-2 | Start an inpatient registration from a free bed. |
| FR-BED-3 | List patients currently admitted. |

## GC: General Consent (`generalconsent`)

| Id | Requirement |
| --- | --- |
| FR-GC-1 | Record the general consent for a registration: signer name, relationship and phone, witness, special information-release choices and notes. |
| FR-GC-2 | Capture patient and witness signatures on a drawing pad. |
| FR-GC-3 | Mark the consent *Signed* or *Pending*, edit it later, and print the official form. |

## RME: Pemeriksaan Pasien / Rekam Medis Elektronik (`rekammedis`)

| Id | Requirement |
| --- | --- |
| FR-RME-1 | Show the day's visit queue with examination status (*Siap Diperiksa*, *Selesai Diperiksa*) and open a patient's record from it. |
| FR-RME-2 | Provide assessment forms for Rawat Jalan, Rawat Inap and IGD with triage, and a medical examination in SOAP form. |
| FR-RME-3 | Provide the catalogue of 26 RME forms, including: initial assessments, SOAP DPJP, CPPT, nursing care (SDKI/SLKI/SIKI), vital-sign monitoring, fluid balance, pain (VAS/NRS/CPOT), fall risk (Morse/Humpty Dumpty), pressure-injury risk (Braden), nutrition screening (MST), patient education, discharge planning, informed consent, e-prescribing, lab and radiology orders and results, operation report, anaesthesia status, midwifery and neonatal notes, resume medis, coding form and RM tracer. |
| FR-RME-4 | Save a medical record with anamnesis, physical examination, diagnosis, plan and nurse notes, status Draft, Pending or Verified. |
| FR-RME-5 | Let the DPJP and the nurse each verify and sign the record. |
| FR-RME-6 | When a medical record is created, create a draft bill for the visit with a specialist consultation (Rp150.000) and a physical examination (Rp35.000). |
| FR-RME-7 | Show the visit history and an RME summary for the patient, and allow uploading or listing supporting documents (*dokumen berkas*). |
| FR-RME-8 | Provide a coding workspace tab that opens the Coding module for the visit. |

## CPPT: Catatan Perkembangan Pasien Terintegrasi (`cppt`)

| Id | Requirement |
| --- | --- |
| FR-CPPT-1 | Record progress notes per visit with date, time, profession, unit and author, in SOAP, SBAR or ADIME format. |
| FR-CPPT-2 | Record vital signs (blood pressure, heart rate, respiratory rate, temperature, SpO2), instructions to other care providers (PPA), medicine instructions (drug, quantity, signa), implementation and critical values. |
| FR-CPPT-3 | Let the DPJP verify entries; deleted entries are marked deleted, not removed. |
| FR-CPPT-4 | Select a patient and see all CPPT entries of their visits. |

## ASKEP: Asuhan Keperawatan (tab in RME; access id `keperawatan`)

| Id | Requirement |
| --- | --- |
| FR-ASKEP-1 | Record nursing assessment: chief complaint, history, allergies and vital signs. |
| FR-ASKEP-2 | Choose nursing diagnoses (SDKI), interventions (SIKI) and outcomes (SLKI); record implementation and a SOAP evaluation. |
| FR-ASKEP-3 | Save as Draft or Final. Provide a full IGD nursing care form. |

## IC: Informed Consent (`informedconsent`)

| Id | Requirement |
| --- | --- |
| FR-IC-1 | Record consent or refusal (*Persetujuan* / *Penolakan*) for a medical action linked to a CPPT entry. Action and CPPT are required. |
| FR-IC-2 | Record diagnosis, procedure steps, purpose, risks, complications, prognosis and alternatives. |
| FR-IC-3 | Capture patient (or relative), doctor and witness signatures; edit and print the official form. |

## RESUME: Resume Medis (`resumemedis`)

| Id | Requirement |
| --- | --- |
| FR-RESUME-1 | Build a discharge summary automatically from the visit: dates and length of stay, vital signs from the first and last CPPT, lab and radiology summaries, diagnosis and medicines. |
| FR-RESUME-2 | Check completeness against a fixed list (identity, admission and discharge dates, DPJP, chief complaint, history, admission diagnosis, main diagnosis, ICD-10 verification document, home medication, discharge condition and type, instructions, follow-up appointment) and list what is missing. |
| FR-RESUME-3 | Compare the DPJP's main diagnosis with the verified coding diagnosis and flag a mismatch; let the user synchronise the diagnosis with the coding. |
| FR-RESUME-4 | Compute the status: *Belum Lengkap*, *Menunggu Verifikasi* (diagnosis mismatch or verification missing), *Siap Difinalisasi*, or *Final*. Finalisation is refused while anything is missing. |
| FR-RESUME-5 | Set a completion deadline of 48 hours for Rawat Inap and 24 hours for Rawat Jalan and IGD, show the remaining time and send reminders. |
| FR-RESUME-6 | Show INA-CBG verification guidance (edition 2) and print the official A4 resume. |

## PENUNJANG: Farmasi, Laboratorium, Radiologi (`farmasi`, `laboratorium`, `radiologi`)

| Id | Requirement |
| --- | --- |
| FR-PEN-1 | Farmasi lists dispensing records per visit: drug, quantity, dose, item and record status. |
| FR-PEN-2 | Laboratorium lists lab results per visit with LOINC codes and Final or Pending status. |
| FR-PEN-3 | Radiologi lists radiology examinations with LOINC code, result, radiologist and status. |
| FR-PEN-4 | *Current limitation:* these three lists show fixed sample records and cannot be added to or changed (PRD Q1). Lab and radiology orders are recorded as RME forms instead. |

## CODE: Coding ICD-10 & ICD-9-CM (`coding`)

| Id | Requirement |
| --- | --- |
| FR-CODE-1 | List visits to be coded with filters by date range, coding status (Draft, Locked) and search; show past visits of the patient. |
| FR-CODE-2 | Open a coding worksheet for a visit showing the medical record, CPPT/SOAP and supporting results. |
| FR-CODE-3 | Search ICD-10 diagnoses and ICD-9-CM procedures by code or description from the built-in database (about 15 000 entries). |
| FR-CODE-4 | Suggest codes from the doctor's SOAP assessment and plan. Refuse when no SOAP exists for the visit. |
| FR-CODE-5 | Require at least one primary ICD-10 diagnosis; allow secondary diagnoses and procedures; record coder and notes. |
| FR-CODE-6 | Save as Draft or lock the coding (*Locked*, the final step). Only an authorised coder may lock. Each visit shows its coding progress: *Menunggu Koding*, *Dalam Proses Koding* (draft) or *Selesai Dikoding* (locked). Only locked codings can be claimed (FR-CLAIM-1). |
| FR-CODE-7 | Check the patient's BPJS card status from the worksheet (simulated) and link to the KMK 1423 metadata dictionary. |

## CLAIM: Klaim & VClaim BPJS (`klaim`)

| Id | Requirement |
| --- | --- |
| FR-CLAIM-1 | Create a claim from a locked coding: SEP number, INA-CBG group code and description, and tariff. All are required. |
| FR-CLAIM-2 | Mark the new claim *Submitted* with today's date (simulated E-Klaim submission); claims may later be *Verified* or *Rejected*. |
| FR-CLAIM-3 | Simulate VClaim card checks (13-digit card number; choose an *Aktif* or *Tidak Aktif* response), keep a history of checks, re-sync a card and reset the history. |
| FR-CLAIM-4 | Print the SEP. |
| FR-CLAIM-5 | *Current limitation:* there is no INA-CBG grouper; group and tariff are typed (PRD Q2). |

## META: Kamus Metadata KMK 1423 (`metadata`)

| Id | Requirement |
| --- | --- |
| FR-META-1 | Show the RME data variables of KMK HK.01.07/MENKES/1423/2022 grouped by service (IGD, Rawat Jalan, Rawat Inap, Laboratorium, Farmasi, Bayi Baru Lahir) with mandatory flags and details. |
| FR-META-2 | Search and export the dictionary as CSV. |

## RL: Pelaporan RS (`pelaporan`)

| Id | Requirement |
| --- | --- |
| FR-RL-1 | Produce the SIRS RL forms RL 3.1–3.19 (service indicators, inpatient, emergency, visitors, visits, midwifery, neonatal, lab, radiology, referrals, dental, surgery, rehabilitation, special services, mental health, family planning, drug procurement, prescriptions, payment method), RL 4.1–4.3 (inpatient morbidity, top 10 diseases, top 10 causes of death) and RL 5.1–5.3 (outpatient morbidity, top 10 new cases, top 10 visits). |
| FR-RL-2 | Compute the forms from the class's registrations, patients, medical records and coding where the data exists (for example RL 3.1 BOR, ALOS, BTO, TOI, NDR, GDR), and fill the rest from reference sample data. |
| FR-RL-3 | Filter by date range (default the whole year) and search; reset filters. |
| FR-RL-4 | Print the displayed form. |

## BILL: Billing and Kasir (`billing`, `pembayaran`)

| Id | Requirement |
| --- | --- |
| FR-BILL-1 | Show each visit's bill with service lines (name, quantity, price), total, amount paid and status. |
| FR-BILL-2 | The cashier processes payment of an unpaid bill after confirmation; the bill becomes *Paid* with the full total paid and a receipt is issued. |

## MD: Master Data SIMRS (`masterdata`, Super Admin only)

| Id | Requirement |
| --- | --- |
| FR-MD-1 | Manage rooms: unique code, name, type (Rawat Inap, ICU, NICU, PICU, HCU, Isolasi, VK, OK, ...), location, capacity (not negative), facilities, active flag. A room with an occupied bed cannot be deleted. |
| FR-MD-2 | Manage beds: unique code, name, room, class, operational status (Tersedia, Terisi, Dibersihkan, Dalam Perbaikan, Tidak Aktif), active flag. An occupied bed cannot be deleted. |
| FR-MD-3 | Manage doctors: name with titles, NIK, STR/SIP, specialty (required), phone, email, sex, general schedule, active flag. Deleting a doctor deletes their polyclinic assignments. |
| FR-MD-4 | Manage polyclinics: unique code, name, service group, location, service hours, active flag. A polyclinic with history is deactivated instead of deleted. |
| FR-MD-5 | Assign doctors to polyclinics with practice days (at least one) and start and end time (start before end); refuse schedules that clash. |
| FR-MD-6 | Master data is per class hospital: each class gets its own copy from the template. |

## USR: Hak Akses & Pengguna (`manajemenuser`)

| Id | Requirement |
| --- | --- |
| FR-USR-1 | Show the members of the class with account, role and status. |
| FR-USR-2 | Show the role access matrix; the admin can tick or untick modules per role and save. Changes apply to every class. |
| FR-USR-3 | The admin creates lecturer accounts; the system returns a temporary password to hand over. |
| FR-USR-4 | A lecturer or admin creates a class; it starts as a copy of the template hospital, with "today" dates set to the creation date. |
| FR-USR-5 | A lecturer imports students from CSV, TSV or pasted text (`NIM,Nama`, up to 300 rows, optional header). Invalid NIMs, missing names and duplicates are reported per line. |
| FR-USR-6 | The import result lists each row as created, existing, skipped or failed, with temporary passwords for new accounts, and offers a CSV download of the passwords. A failure in one row does not stop the others. |
| FR-USR-7 | A lecturer activates or deactivates a student in their class; only an admin may change a lecturer's membership; nobody may change their own. Deactivation ends the student's open session in that class. |
| FR-USR-8 | *Reset Data Kelas* replaces all class data with a fresh copy of the template after confirmation. Only the class lecturer or an admin may reset. |
| FR-USR-9 | Show the database schema and row-level security rules for teaching. |

## AUDIT: Audit Trail and Log Aktivitas (`audit`, `logaktivitas`)

| Id | Requirement |
| --- | --- |
| FR-AUDIT-1 | Record every create, update and delete of class data with time, user, practice role, table, record id, and the old and new record. |
| FR-AUDIT-2 | Record sign-in to and sign-out from a practice session, page navigation, class creation, class reset, member activation changes and roster imports. |
| FR-AUDIT-3 | The audit log cannot be changed or deleted by anyone, including through the database. |
| FR-AUDIT-4 | The Audit Trail page (Super Admin and Dosen) lists the latest 500 entries with filters, a field-by-field diff of each change, and CSV export. |
| FR-AUDIT-5 | Log Aktivitas lists recent activity in a simple timeline. |

## SYNC: Shared class data (server mode)

| Id | Requirement |
| --- | --- |
| FR-SYNC-1 | All members of a class work on the same data. Changes by others appear within about 5 seconds while the tab is visible, and at once when the tab regains focus. |
| FR-SYNC-2 | A save sends only the changed records of one table and is applied all-or-nothing. |
| FR-SYNC-3 | A save the database refuses is reported to the user (*Peran Anda tidak memiliki izin mengubah modul ini* or *Gagal menyimpan ke server. Data dikembalikan.*) and the screen goes back to the server's data. |
| FR-SYNC-4 | In local mode data is kept in the browser only and is not shared. |
