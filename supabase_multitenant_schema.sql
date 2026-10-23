-- ==============================================================================
-- SIMRS ESA UNGGUL - PRODI REKAM MEDIS & INFORMASI KESEHATAN (RMIK)
-- MULTI-TENANT DATABASE SCHEMA, APPEND-ONLY AUDIT TRAIL & ROW LEVEL SECURITY (RLS)
-- ==============================================================================
-- Standard: Permenkes No. 24/2022 (RME), KMK 1423/2022 & ISO 27001 Security Audit
--
-- Features:
-- 1. Multi-Tenant per Kelas (1 Kelas = 1 Sistem RS Simulasi Terisolasi)
-- 2. Append-Only Audit Trail (Strictly Immutable, No Edit / No Delete)
-- 3. Access Rules & RLS Enforcement:
--    - R04 Mahasiswa (Umum) retains full access ("all modules")
--    - Practice Roles (R05 Dokter, R06 Perawat, R07 Pendaftaran, R08 RM,
--      R09 Coding, R10 Keuangan, R11 Klaim, R13 Pelaporan, R14 Keperawatan)
--      are restricted to their practice scope
--    - Student protection: Cannot promote themselves to R01 Admin / R03 Dosen
-- 4. Class Reset Facility (Resets simulation data without erasing users or audit logs)
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 2. CORE SYSTEM TABLES
-- ==============================================================================

-- 2.1 CLASSES (SIMULATED HOSPITAL TENANTS)
CREATE TABLE IF NOT EXISTS classes (
    id TEXT PRIMARY KEY, -- e.g. 'RMIK-2024-A'
    name TEXT NOT NULL,
    dosen_id TEXT,
    dosen_name TEXT,
    semester TEXT DEFAULT 'Ganjil 2026/2027',
    academic_year TEXT DEFAULT '2026/2027',
    description TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2.2 ROLES (RBAC DICTIONARY)
CREATE TABLE IF NOT EXISTS roles (
    id TEXT PRIMARY KEY, -- 'R01' s/d 'R14'
    name TEXT NOT NULL,
    access TEXT[] NOT NULL
);

-- 2.3 USERS & ACCOUNTS
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY DEFAULT ('U_' || gen_random_uuid()::text),
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    role_id TEXT NOT NULL REFERENCES roles(id),
    class_id TEXT REFERENCES classes(id) ON DELETE SET NULL,
    nim TEXT,
    temp_password TEXT,
    is_first_login BOOLEAN DEFAULT false,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ==============================================================================
-- 3. APPEND-ONLY AUDIT TRAIL (IMMUTABLE FORENSIC LOG)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS audit_trail (
    id TEXT PRIMARY KEY DEFAULT ('AUD_' || gen_random_uuid()::text),
    timestamp TIMESTAMPTZ DEFAULT now() NOT NULL,
    user_id TEXT NOT NULL,
    user_name TEXT NOT NULL,
    action TEXT NOT NULL, -- 'CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'NAVIGATE'
    entity TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    field_name TEXT,
    old_value TEXT,
    new_value TEXT,
    ip TEXT DEFAULT '127.0.0.1',
    device TEXT,
    module TEXT,
    class_id TEXT REFERENCES classes(id) ON DELETE SET NULL
);

-- Index for high performance chronologic inspection
CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_trail(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_class ON audit_trail(class_id);
CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_trail(user_id);

-- TRIGGER: PREVENT ANY UPDATE OR DELETE ON AUDIT TRAIL (APPEND-ONLY ENFORCEMENT)
CREATE OR REPLACE FUNCTION prevent_audit_tampering()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Audit Trail SIMRS Esa Unggul bersifat append-only permanen. Modifikasi (UPDATE) atau penghapusan (DELETE) dilarang berdasarkan regulasi KMK 1423/2022 dan ISO 27001!'
        USING ERRCODE = 'restrict_violation';
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_audit_trail_immutable ON audit_trail;
CREATE TRIGGER trg_audit_trail_immutable
    BEFORE UPDATE OR DELETE ON audit_trail
    FOR EACH ROW EXECUTE FUNCTION prevent_audit_tampering();

-- ==============================================================================
-- 4. SIMULATION HOSPITAL DATA TABLES (TENANT ISOLATED BY class_id)
-- ==============================================================================

-- 4.1 PATIENTS
CREATE TABLE IF NOT EXISTS patients (
    id TEXT PRIMARY KEY,
    class_id TEXT NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    no_rm TEXT NOT NULL,
    nik TEXT,
    name TEXT NOT NULL,
    dob DATE,
    gender TEXT,
    address TEXT,
    phone TEXT,
    blood_type TEXT,
    allergy TEXT,
    insurance_type TEXT DEFAULT 'BPJS',
    no_bpjs TEXT,
    bpjs_status TEXT DEFAULT 'Aktif',
    guarantor JSONB,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT uq_patient_rm_class UNIQUE (class_id, no_rm)
);

-- 4.2 REGISTRATIONS (ENCOUNTERS)
CREATE TABLE IF NOT EXISTS registrations (
    id TEXT PRIMARY KEY,
    class_id TEXT NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    patient_id TEXT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    type TEXT NOT NULL, -- 'Rawat Jalan' | 'Rawat Inap' | 'IGD'
    poli TEXT,
    dpjp TEXT, -- User ID / Nama Dokter
    status TEXT NOT NULL, -- 'Dirawat' | 'Selesai' | 'Siap Diperiksa' | 'Selesai Diperiksa' | 'Batal'
    examination_status TEXT DEFAULT 'Siap Diperiksa',
    sep_no TEXT,
    room TEXT,
    bed_id TEXT,
    triage_level TEXT,
    reason_for_visit TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4.3 MEDICAL RECORDS (RME DOKTER)
CREATE TABLE IF NOT EXISTS medical_records (
    id TEXT PRIMARY KEY,
    class_id TEXT NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    reg_id TEXT NOT NULL REFERENCES registrations(id) ON DELETE CASCADE,
    patient_id TEXT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    anamnesis TEXT,
    physical_exam TEXT,
    diagnosis TEXT,
    therapy TEXT,
    doctor_id TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4.4 CPPT / SOAP PPA
CREATE TABLE IF NOT EXISTS cppt (
    id TEXT PRIMARY KEY,
    class_id TEXT NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    mr_id TEXT,
    reg_id TEXT NOT NULL REFERENCES registrations(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    time TEXT,
    subjective TEXT,
    objective TEXT,
    assessment TEXT,
    plan TEXT,
    profession TEXT DEFAULT 'Dokter',
    user_id TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4.5 CODING (ICD-10 & ICD-9-CM)
CREATE TABLE IF NOT EXISTS coding (
    id TEXT PRIMARY KEY,
    class_id TEXT NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    reg_id TEXT NOT NULL REFERENCES registrations(id) ON DELETE CASCADE,
    icd10 TEXT[] NOT NULL DEFAULT '{}',
    icd10_desc TEXT[] DEFAULT '{}',
    icd9cm TEXT[] DEFAULT '{}',
    icd9cm_desc TEXT[] DEFAULT '{}',
    note TEXT,
    status TEXT DEFAULT 'Draft', -- 'Draft' | 'Locked'
    date DATE NOT NULL,
    coder_id TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4.6 BPJS CLAIMS & E-KLAIM
CREATE TABLE IF NOT EXISTS claims (
    id TEXT PRIMARY KEY,
    class_id TEXT NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    coding_id TEXT REFERENCES coding(id) ON DELETE CASCADE,
    reg_id TEXT,
    group_code TEXT NOT NULL,
    group_desc TEXT NOT NULL,
    tariff NUMERIC(15, 2) NOT NULL DEFAULT 0,
    status TEXT DEFAULT 'Draft',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4.7 BILLING & KASIR
CREATE TABLE IF NOT EXISTS billing (
    id TEXT PRIMARY KEY,
    class_id TEXT NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    reg_id TEXT NOT NULL REFERENCES registrations(id) ON DELETE CASCADE,
    patient_id TEXT REFERENCES patients(id),
    total NUMERIC(15, 2) NOT NULL DEFAULT 0,
    paid NUMERIC(15, 2) NOT NULL DEFAULT 0,
    status TEXT DEFAULT 'Unpaid', -- 'Paid' | 'Unpaid'
    items JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4.8 BEDS (MANAJEMEN TEMPAT TIDUR)
CREATE TABLE IF NOT EXISTS beds (
    id TEXT PRIMARY KEY,
    class_id TEXT NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    room TEXT NOT NULL,
    floor TEXT NOT NULL,
    class TEXT NOT NULL,
    status TEXT NOT NULL, -- 'Occupied' | 'Available' | 'Maintenance' | 'Cleaning'
    patient_id TEXT
);

-- ==============================================================================
-- 5. ROW LEVEL SECURITY (RLS) HELPER FUNCTIONS
-- ==============================================================================

-- Helper: Get current active class from JWT or session variable
CREATE OR REPLACE FUNCTION current_user_class()
RETURNS TEXT AS $$
BEGIN
    RETURN COALESCE(
        current_setting('request.jwt.claim.class_id', true),
        current_setting('app.current_class_id', true),
        (SELECT class_id FROM users WHERE username = current_setting('request.jwt.claim.email', true) LIMIT 1),
        'RMIK-2024-A'
    );
END;
$$ LANGUAGE plpgsql STABLE;

-- Helper: Get current active role from JWT or session variable
CREATE OR REPLACE FUNCTION current_user_role()
RETURNS TEXT AS $$
BEGIN
    RETURN COALESCE(
        current_setting('request.jwt.claim.role_id', true),
        current_setting('app.current_role_id', true),
        (SELECT role_id FROM users WHERE username = current_setting('request.jwt.claim.email', true) LIMIT 1),
        'R04'
    );
END;
$$ LANGUAGE plpgsql STABLE;

-- Helper: Check if user is Administrator (R01) or Dosen (R03)
CREATE OR REPLACE FUNCTION is_admin_or_dosen()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN current_user_role() IN ('R01', 'R03');
END;
$$ LANGUAGE plpgsql STABLE;

-- ==============================================================================
-- 6. ENABLE ROW LEVEL SECURITY & POLICIES
-- ==============================================================================

-- 6.1 AUDIT TRAIL RLS
ALTER TABLE audit_trail ENABLE ROW LEVEL SECURITY;

CREATE POLICY audit_trail_select ON audit_trail
    FOR SELECT USING (
        is_admin_or_dosen() OR class_id = current_user_class()
    );

CREATE POLICY audit_trail_insert ON audit_trail
    FOR INSERT WITH CHECK (true);

CREATE POLICY audit_trail_no_update ON audit_trail
    FOR UPDATE USING (false);

CREATE POLICY audit_trail_no_delete ON audit_trail
    FOR DELETE USING (false);

-- 6.2 CLASSES RLS
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;

CREATE POLICY classes_select ON classes
    FOR SELECT USING (true);

CREATE POLICY classes_admin_all ON classes
    FOR ALL USING (is_admin_or_dosen());

-- 6.3 USERS RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY users_select ON users
    FOR SELECT USING (
        is_admin_or_dosen() OR class_id = current_user_class()
    );

CREATE POLICY users_admin_insert ON users
    FOR INSERT WITH CHECK (
        is_admin_or_dosen() OR (
            -- Student registration protection: Cannot register as R01 or R03!
            role_id NOT IN ('R01', 'R03')
        )
    );

CREATE POLICY users_admin_update ON users
    FOR UPDATE USING (
        is_admin_or_dosen() OR (
            id = (SELECT id FROM users WHERE username = current_setting('request.jwt.claim.email', true) LIMIT 1)
            AND role_id NOT IN ('R01', 'R03') -- Cannot self-promote!
        )
    );

-- 6.4 SIMULATION DATA RLS (PATIENTS, REGISTRATIONS, MEDICAL RECORDS, CODING, ETC.)
-- NOTE: R04 Mahasiswa (Umum) retains full access ("all modules") per class!
-- Practice roles are enforced by module.

ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE cppt ENABLE ROW LEVEL SECURITY;
ALTER TABLE coding ENABLE ROW LEVEL SECURITY;
ALTER TABLE claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing ENABLE ROW LEVEL SECURITY;
ALTER TABLE beds ENABLE ROW LEVEL SECURITY;

-- PATIENTS POLICY
CREATE POLICY patients_select ON patients
    FOR SELECT USING (class_id = current_user_class() OR is_admin_or_dosen());

CREATE POLICY patients_write ON patients
    FOR ALL USING (
        (class_id = current_user_class() OR is_admin_or_dosen())
        AND (
            is_admin_or_dosen()
            OR current_user_role() IN ('R04', 'R07', 'R08') -- R04 All, R07 Pendaftaran, R08 RM
        )
    );

-- REGISTRATIONS POLICY
CREATE POLICY registrations_select ON registrations
    FOR SELECT USING (class_id = current_user_class() OR is_admin_or_dosen());

CREATE POLICY registrations_write ON registrations
    FOR ALL USING (
        (class_id = current_user_class() OR is_admin_or_dosen())
        AND (
            is_admin_or_dosen()
            OR current_user_role() IN ('R04', 'R07', 'R08') -- R04 All, R07 Pendaftaran, R08 RM
        )
    );

-- MEDICAL RECORDS POLICY (R09 Coding can READ ONLY, cannot modify!)
CREATE POLICY medical_records_select ON medical_records
    FOR SELECT USING (class_id = current_user_class() OR is_admin_or_dosen());

CREATE POLICY medical_records_write ON medical_records
    FOR ALL USING (
        (class_id = current_user_class() OR is_admin_or_dosen())
        AND (
            is_admin_or_dosen()
            OR current_user_role() IN ('R04', 'R05') -- R04 All, R05 Dokter
        )
    );

-- CPPT POLICY
CREATE POLICY cppt_select ON cppt
    FOR SELECT USING (class_id = current_user_class() OR is_admin_or_dosen());

CREATE POLICY cppt_write ON cppt
    FOR ALL USING (
        (class_id = current_user_class() OR is_admin_or_dosen())
        AND (
            is_admin_or_dosen()
            OR current_user_role() IN ('R04', 'R05', 'R06', 'R14') -- R04 All, R05 Dokter, R06/R14 Perawat
        )
    );

-- CODING POLICY (R09 Coding has full write access on coding)
CREATE POLICY coding_select ON coding
    FOR SELECT USING (class_id = current_user_class() OR is_admin_or_dosen());

CREATE POLICY coding_write ON coding
    FOR ALL USING (
        (class_id = current_user_class() OR is_admin_or_dosen())
        AND (
            is_admin_or_dosen()
            OR current_user_role() IN ('R04', 'R09', 'R08') -- R04 All, R09 Coding, R08 RM
        )
    );

-- CLAIMS POLICY
CREATE POLICY claims_select ON claims
    FOR SELECT USING (class_id = current_user_class() OR is_admin_or_dosen());

CREATE POLICY claims_write ON claims
    FOR ALL USING (
        (class_id = current_user_class() OR is_admin_or_dosen())
        AND (
            is_admin_or_dosen()
            OR current_user_role() IN ('R04', 'R09', 'R11') -- R04 All, R09 Coding, R11 Klaim
        )
    );

-- BILLING POLICY
CREATE POLICY billing_select ON billing
    FOR SELECT USING (class_id = current_user_class() OR is_admin_or_dosen());

CREATE POLICY billing_write ON billing
    FOR ALL USING (
        (class_id = current_user_class() OR is_admin_or_dosen())
        AND (
            is_admin_or_dosen()
            OR current_user_role() IN ('R04', 'R10') -- R04 All, R10 Keuangan/Kasir
        )
    );

-- BEDS POLICY
CREATE POLICY beds_select ON beds
    FOR SELECT USING (class_id = current_user_class() OR is_admin_or_dosen());

CREATE POLICY beds_write ON beds
    FOR ALL USING (
        (class_id = current_user_class() OR is_admin_or_dosen())
        AND (
            is_admin_or_dosen()
            OR current_user_role() IN ('R04', 'R07', 'R06') -- R04 All, R07 Pendaftaran, R06 Perawat
        )
    );

-- ==============================================================================
-- 7. STORED PROCEDURE: RESET CLASS SIMULATION
-- ==============================================================================
-- Resets simulation encounters & clinical data for a given class back to benchmark,
-- while completely preserving student accounts, roster, and audit records.
CREATE OR REPLACE FUNCTION reset_class_simulation(p_class_id TEXT, p_reset_by_user TEXT DEFAULT 'Dosen')
RETURNS JSONB AS $$
DECLARE
    v_patient_count INT;
BEGIN
    -- Verify class exists
    IF NOT EXISTS (SELECT 1 FROM classes WHERE id = p_class_id) THEN
        RAISE EXCEPTION 'Kelas dengan ID % tidak ditemukan.', p_class_id;
    END IF;

    -- Clean simulation clinical tables
    DELETE FROM claims WHERE class_id = p_class_id;
    DELETE FROM coding WHERE class_id = p_class_id;
    DELETE FROM cppt WHERE class_id = p_class_id;
    DELETE FROM medical_records WHERE class_id = p_class_id;
    DELETE FROM billing WHERE class_id = p_class_id;
    DELETE FROM registrations WHERE class_id = p_class_id;
    DELETE FROM patients WHERE class_id = p_class_id;

    -- Log append-only audit trail entry
    INSERT INTO audit_trail (
        user_id, user_name, action, entity, entity_id, field_name, new_value, module, class_id
    ) VALUES (
        'SYS_RESET', p_reset_by_user, 'UPDATE', 'SimClass', p_class_id,
        'reset_simulation', 'Simulasi kelas dibersihkan dan di-reset ke benchmark awal.',
        'manajemenuser', p_class_id
    );

    RETURN jsonb_build_object(
        'success', true,
        'class_id', p_class_id,
        'message', 'Simulasi kelas berhasil di-reset ke data benchmark awal.'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
