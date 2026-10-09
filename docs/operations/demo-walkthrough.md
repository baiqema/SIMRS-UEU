# Demo walkthrough (IT Esa Unggul & Kepala Laboratorium)

Demo URL: the Vercel production URL of `danielhappyg/SIMRS-UEU`. Data is synthetic only.

1. **Login & roles.** Log in as `mhs.pendaftaran` (preset). Point out that the role list is the same as Ema's, and that choosing *Admin* with a student account is refused by the server.
2. **Shared class hospital.** Register a new patient. In a second browser (private window), log in as `20240306044` (Mahasiswa Coding). The patient appears without reloading.
3. **Role enforcement.** As Mahasiswa Coding, try to edit the patient's address. The save is refused and the screen reverts.
4. **End-to-end flow.** Coding → Klaim on the new registration → Pelaporan RL shows it.
5. **Lecturer tools.** Log in as `dsn.dr.wati` → *Hak Akses & Pengguna* → *Kelas & Roster*: import two NIMs, show the temporary-password CSV, then *Reset Data Kelas*.
6. **Audit trail.** Open *Audit Trail* as the dosen: every change above is listed with user, role and time. Explain that it is append-only in the database.
7. **Hosting.** Explain that this demo uses Vercel + Supabase cloud, and that production moves to an internal server (see `internal-server-deployment.md`).
