-- 20261124000001_initial_schema.sql
-- Inisialisasi skema inti DigiUMKM sesuai DATABASE_SCHEMA.md

-- 1. Ekstensi UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Tipe Enum
CREATE TYPE user_role AS ENUM ('merchant', 'admin', 'researcher');
CREATE TYPE qris_status_type AS ENUM ('active', 'not_active', 'applied', 'unknown');
CREATE TYPE mission_claim_status AS ENUM ('started', 'submitted', 'approved', 'rejected');
CREATE TYPE activity_source AS ENUM ('self_reported', 'admin_verified', 'provider_verified', 'simulated');
CREATE TYPE activity_status AS ENUM ('submitted', 'verified', 'rejected');
CREATE TYPE redemption_status AS ENUM ('requested', 'approved', 'fulfilled', 'rejected', 'cancelled');

-- 3. Tabel Profiles (terikat auth.users)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role user_role NOT NULL DEFAULT 'merchant',
    display_name TEXT NOT NULL,
    phone_e164 TEXT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 4. Tabel Merchants (Profil Usaha)
CREATE TABLE merchants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
    business_name TEXT NOT NULL,
    business_category TEXT NOT NULL,
    province TEXT NOT NULL DEFAULT 'Jawa Timur',
    regency TEXT NOT NULL,
    district TEXT NULL,
    rural_locality TEXT NULL,
    qris_status qris_status_type NOT NULL DEFAULT 'not_active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 5. Tabel Consent Records (Etika Penelitian & Privasi)
CREATE TABLE consent_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    consent_type TEXT NOT NULL,
    version TEXT NOT NULL,
    accepted BOOLEAN NOT NULL DEFAULT false,
    accepted_at TIMESTAMPTZ NULL,
    withdrawn_at TIMESTAMPTZ NULL
);

-- 6. Modul Pembelajaran (Lessons & Completions)
CREATE TABLE lessons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    content_md TEXT NOT NULL,
    topic TEXT NOT NULL,
    xp_reward INTEGER NOT NULL DEFAULT 50 CHECK (xp_reward >= 0),
    is_published BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE TABLE lesson_completions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    score INTEGER NULL,
    completed_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    CONSTRAINT uq_lesson_merchant UNIQUE (lesson_id, merchant_id)
);

-- 7. Modul Misi & Klaim
CREATE TABLE missions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    mission_type TEXT NOT NULL,
    rules_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    xp_reward INTEGER NOT NULL CHECK (xp_reward >= 0),
    starts_at TIMESTAMPTZ NOT NULL,
    ends_at TIMESTAMPTZ NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE TABLE mission_claims (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mission_id UUID NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
    merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    status mission_claim_status NOT NULL DEFAULT 'started',
    submitted_at TIMESTAMPTZ NULL,
    reviewed_by UUID NULL REFERENCES profiles(id),
    reviewed_at TIMESTAMPTZ NULL,
    review_note TEXT NULL,
    CONSTRAINT uq_mission_merchant_claim UNIQUE (mission_id, merchant_id)
);

-- 8. Pelaporan Aktivitas Transaksi QRIS (Mode Pilot Manual)
CREATE TABLE payment_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    activity_date DATE NOT NULL,
    activity_type TEXT NOT NULL,
    reported_count INTEGER NOT NULL DEFAULT 1 CHECK (reported_count > 0),
    source activity_source NOT NULL DEFAULT 'self_reported',
    status activity_status NOT NULL DEFAULT 'submitted',
    provider_reference TEXT NULL,
    evidence_storage_key TEXT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    verified_by UUID NULL REFERENCES profiles(id),
    verified_at TIMESTAMPTZ NULL
);

-- 9. Gamifikasi: Point Rules & Append-Only Points Ledger
CREATE TABLE point_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_key TEXT NOT NULL UNIQUE,
    xp INTEGER NOT NULL CHECK (xp >= 0),
    max_awards_per_period INTEGER NULL,
    is_active BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE points_ledger (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    event_key TEXT NOT NULL,
    source_type TEXT NOT NULL,
    source_id UUID NOT NULL,
    delta INTEGER NOT NULL, -- Positif untuk reward XP, Negatif untuk penukaran hadiah
    idempotency_key TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    created_by UUID NULL REFERENCES profiles(id)
);

-- 10. Levels & Badges
CREATE TABLE levels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    level_number INTEGER NOT NULL UNIQUE,
    name TEXT NOT NULL,
    minimum_xp INTEGER NOT NULL,
    maximum_xp INTEGER NULL
);

CREATE TABLE badges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    criteria_json JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE merchant_badges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    badge_id UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
    awarded_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    CONSTRAINT uq_merchant_badge UNIQUE (merchant_id, badge_id)
);

-- 11. Katalog Reward & Penukaran
CREATE TABLE rewards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    points_cost INTEGER NOT NULL CHECK (points_cost >= 0),
    stock INTEGER NULL CHECK (stock IS NULL OR stock >= 0),
    is_active BOOLEAN NOT NULL DEFAULT true,
    fulfillment_instructions TEXT NOT NULL
);

CREATE TABLE reward_redemptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    reward_id UUID NOT NULL REFERENCES rewards(id) ON DELETE RESTRICT,
    points_cost INTEGER NOT NULL,
    status redemption_status NOT NULL DEFAULT 'requested',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    fulfilled_at TIMESTAMPTZ NULL,
    idempotency_key TEXT NOT NULL UNIQUE
);

-- 12. Audit Logs
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_id UUID NOT NULL REFERENCES profiles(id),
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    metadata_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 13. Indeks Performa & Keamanan
CREATE INDEX idx_merchants_user_id ON merchants(user_id);
CREATE INDEX idx_payment_activities_merchant ON payment_activities(merchant_id);
CREATE INDEX idx_payment_activities_status ON payment_activities(status);
CREATE INDEX idx_points_ledger_merchant ON points_ledger(merchant_id);
CREATE INDEX idx_mission_claims_merchant ON mission_claims(merchant_id);
CREATE INDEX idx_reward_redemptions_merchant ON reward_redemptions(merchant_id);

