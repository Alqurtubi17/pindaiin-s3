-- supabase/neon_setup.sql
-- Skema Database & Data Realistis DigiUMKM untuk Neon.tech (PostgreSQL Serverless)
-- Cara pakai:
-- 1. Jalankan via terminal: npm run db:push
-- ATAU
-- 2. Buka console.neon.tech > SQL Editor > Paste script ini > Run

-- =========================================================================
-- 1. EKSTENSI & SKEMA AUTH
-- =========================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE SCHEMA IF NOT EXISTS auth;

CREATE TABLE IF NOT EXISTS auth.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc', now())
);

-- =========================================================================
-- 2. TIPE ENUM
-- =========================================================================
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('merchant', 'admin', 'researcher');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE qris_status_type AS ENUM ('active', 'not_active', 'applied', 'unknown');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE mission_claim_status AS ENUM ('started', 'submitted', 'approved', 'rejected');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE activity_source AS ENUM ('self_reported', 'admin_verified', 'provider_verified', 'simulated');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE activity_status AS ENUM ('submitted', 'verified', 'rejected');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE redemption_status AS ENUM ('requested', 'approved', 'fulfilled', 'rejected', 'cancelled');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- =========================================================================
-- 3. STRUKTUR TABEL UTAMA
-- =========================================================================

-- Profil Pengguna
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role user_role NOT NULL DEFAULT 'merchant',
    display_name TEXT NOT NULL,
    phone_e164 TEXT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- Profil Toko/Merchant
CREATE TABLE IF NOT EXISTS merchants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
    business_name TEXT NOT NULL,
    business_category TEXT NOT NULL,
    province TEXT NOT NULL DEFAULT 'Jawa Timur',
    regency TEXT NOT NULL,
    district TEXT NULL,
    rural_locality TEXT NULL,
    qris_status qris_status_type NOT NULL DEFAULT 'not_active',
    store_photo_url TEXT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- Catatan Persetujuan Riset & Privasi
CREATE TABLE IF NOT EXISTS consent_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    consent_type TEXT NOT NULL,
    version TEXT NOT NULL,
    accepted BOOLEAN NOT NULL DEFAULT false,
    accepted_at TIMESTAMPTZ NULL,
    withdrawn_at TIMESTAMPTZ NULL
);

-- Modul Pembelajaran
CREATE TABLE IF NOT EXISTS lessons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    content_md TEXT NOT NULL,
    topic TEXT NOT NULL,
    xp_reward INTEGER NOT NULL DEFAULT 50 CHECK (xp_reward >= 0),
    is_published BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE TABLE IF NOT EXISTS lesson_completions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    score INTEGER NULL,
    completed_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    CONSTRAINT uq_lesson_merchant UNIQUE (lesson_id, merchant_id)
);

-- Misi & Tantangan
CREATE TABLE IF NOT EXISTS missions (
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

CREATE TABLE IF NOT EXISTS mission_claims (
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

-- Pelaporan Aktivitas Transaksi QRIS
CREATE TABLE IF NOT EXISTS payment_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    activity_date DATE NOT NULL,
    activity_type TEXT NOT NULL DEFAULT 'qris_in_store',
    reported_count INTEGER NOT NULL DEFAULT 1 CHECK (reported_count > 0),
    source activity_source NOT NULL DEFAULT 'self_reported',
    status activity_status NOT NULL DEFAULT 'submitted',
    provider_reference TEXT NULL,
    evidence_storage_key TEXT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    verified_by UUID NULL REFERENCES profiles(id),
    verified_at TIMESTAMPTZ NULL
);

-- Gamifikasi: Aturan Poin & Buku Besar Poin (Append-Only Ledger)
CREATE TABLE IF NOT EXISTS point_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_key TEXT NOT NULL UNIQUE,
    xp INTEGER NOT NULL CHECK (xp >= 0),
    max_awards_per_period INTEGER NULL,
    is_active BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS points_ledger (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    event_key TEXT NOT NULL,
    source_type TEXT NOT NULL,
    source_id UUID NOT NULL,
    delta INTEGER NOT NULL,
    idempotency_key TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    created_by UUID NULL REFERENCES profiles(id)
);

-- Level & Lencana Prestasi
CREATE TABLE IF NOT EXISTS levels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    level_number INTEGER NOT NULL UNIQUE,
    name TEXT NOT NULL,
    minimum_xp INTEGER NOT NULL,
    maximum_xp INTEGER NULL
);

CREATE TABLE IF NOT EXISTS badges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    icon_url TEXT NULL,
    criteria_json JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS merchant_badges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    badge_id UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
    awarded_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    CONSTRAINT uq_merchant_badge UNIQUE (merchant_id, badge_id)
);

-- Katalog Hadiah & Penukaran
CREATE TABLE IF NOT EXISTS rewards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    points_cost INTEGER NOT NULL CHECK (points_cost > 0),
    stock INTEGER NULL CHECK (stock IS NULL OR stock >= 0),
    is_active BOOLEAN NOT NULL DEFAULT true,
    fulfillment_instructions TEXT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE TABLE IF NOT EXISTS reward_redemptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    reward_id UUID NOT NULL REFERENCES rewards(id),
    status redemption_status NOT NULL DEFAULT 'requested',
    idempotency_key TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    fulfilled_at TIMESTAMPTZ NULL
);

-- Log Audit Keamanan
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_id UUID NULL REFERENCES profiles(id),
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    metadata_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- =========================================================================
-- 4. FUNGSI STORED PROCEDURES (Saldo & Transaksi Atomik)
-- =========================================================================

CREATE OR REPLACE FUNCTION get_merchant_balance(p_merchant_id UUID)
RETURNS INTEGER AS $$
  SELECT COALESCE(SUM(delta), 0)::INTEGER
  FROM points_ledger
  WHERE merchant_id = p_merchant_id;
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION get_merchant_total_xp(p_merchant_id UUID)
RETURNS INTEGER AS $$
  SELECT COALESCE(SUM(delta), 0)::INTEGER
  FROM points_ledger
  WHERE merchant_id = p_merchant_id AND delta > 0;
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION award_points(
    p_merchant_id UUID,
    p_event_key TEXT,
    p_source_type TEXT,
    p_source_id UUID,
    p_delta INTEGER,
    p_idempotency_key TEXT,
    p_created_by UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_ledger_id UUID;
BEGIN
    IF p_delta <= 0 THEN
        RAISE EXCEPTION 'Delta poin harus positif (diberikan: %)', p_delta;
    END IF;

    INSERT INTO points_ledger (
        merchant_id, event_key, source_type, source_id, delta, idempotency_key, created_by
    ) VALUES (
        p_merchant_id, p_event_key, p_source_type, p_source_id, p_delta, p_idempotency_key, p_created_by
    )
    RETURNING id INTO v_ledger_id;

    RETURN v_ledger_id;
EXCEPTION
    WHEN unique_violation THEN
        RAISE EXCEPTION 'Idempotency key % sudah pernah diproses.', p_idempotency_key;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION redeem_reward_atomic(
    p_merchant_id UUID,
    p_reward_id UUID,
    p_idempotency_key TEXT
)
RETURNS UUID AS $$
DECLARE
    v_cost INTEGER;
    v_stock INTEGER;
    v_balance INTEGER;
    v_redemption_id UUID;
BEGIN
    SELECT points_cost, stock INTO v_cost, v_stock
    FROM rewards
    WHERE id = p_reward_id AND is_active = true
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Hadiah tidak ditemukan atau tidak aktif.';
    END IF;

    IF v_stock IS NOT NULL AND v_stock <= 0 THEN
        RAISE EXCEPTION 'Stok hadiah telah habis.';
    END IF;

    v_balance := get_merchant_balance(p_merchant_id);
    IF v_balance < v_cost THEN
        RAISE EXCEPTION 'Saldo poin (% poin) tidak mencukupi untuk hadiah ini (% poin).', v_balance, v_cost;
    END IF;

    IF v_stock IS NOT NULL THEN
        UPDATE rewards SET stock = stock - 1 WHERE id = p_reward_id;
    END IF;

    INSERT INTO points_ledger (
        merchant_id, event_key, source_type, source_id, delta, idempotency_key
    ) VALUES (
        p_merchant_id, 'REWARD_REDEEMED', 'reward_redemptions', p_reward_id, -v_cost, 'ledger_' || p_idempotency_key
    );

    INSERT INTO reward_redemptions (
        merchant_id, reward_id, idempotency_key
    ) VALUES (
        p_merchant_id, p_reward_id, p_idempotency_key
    )
    RETURNING id INTO v_redemption_id;

    RETURN v_redemption_id;
END;
$$ LANGUAGE plpgsql;

-- =========================================================================
-- 5. DATA REALISTIS (SEEDS NYATA UMKM JAWA TIMUR)
-- =========================================================================

-- 5.1 Levels Pedagang
INSERT INTO levels (id, level_number, name, minimum_xp, maximum_xp) VALUES
('11111111-0000-0000-0000-000000000001', 1, 'Pemula QRIS', 0, 99),
('11111111-0000-0000-0000-000000000002', 2, 'Pedagang Cakap', 100, 249),
('11111111-0000-0000-0000-000000000003', 3, 'Pedagang Terampil', 250, 499),
('11111111-0000-0000-0000-000000000004', 4, 'Jawara QRIS', 500, NULL)
ON CONFLICT (level_number) DO UPDATE SET name = EXCLUDED.name, minimum_xp = EXCLUDED.minimum_xp, maximum_xp = EXCLUDED.maximum_xp;

-- 5.2 Lencana Prestasi (Badges)
INSERT INTO badges (id, code, name, description, criteria_json) VALUES
('22222222-0000-0000-0000-000000000001', 'FIRST_QRIS_CLAIM', 'Langkah Pertama', 'Melaporkan transaksi pembayaran QRIS pertama kali di toko Anda.', '{"type": "first_transaction"}'),
('22222222-0000-0000-0000-000000000002', 'SAFETY_CHAMPION', 'Juara Keamanan', 'Menyelesaikan modul dan lulus kuis keamanan transaksi QRIS.', '{"type": "quiz_passed", "topic": "security"}'),
('22222222-0000-0000-0000-000000000003', 'STREAK_3_DAYS', 'Pedagang Konsisten', 'Melaporkan transaksi pembayaran nontunai 3 hari berturut-turut.', '{"type": "streak", "days": 3}'),
('22222222-0000-0000-0000-000000000004', 'COMMUNITY_HERO', 'Inspirator QRIS', 'Membantu mengajak pedagang sekitar untuk aktif menerima pembayaran digital.', '{"type": "community"}')
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;

-- 5.3 Aturan Poin (Point Rules)
INSERT INTO point_rules (event_key, xp, max_awards_per_period, is_active) VALUES
('PROFILE_COMPLETED', 50, 1, true),
('LESSON_COMPLETED', 50, NULL, true),
('QRIS_ACTIVITY_SUBMITTED', 20, 1, true),
('QRIS_ACTIVITY_VERIFIED', 30, NULL, true)
ON CONFLICT (event_key) DO UPDATE SET xp = EXCLUDED.xp, is_active = EXCLUDED.is_active;

-- 5.4 Materi Modul Pembelajaran Nyata
INSERT INTO lessons (id, title, content_md, topic, xp_reward, is_published) VALUES
('d1111111-1111-1111-1111-111111111111', 'Mengenal QRIS & Cara Pasang Stiker Kasir Aman',
'## Mengenal QRIS untuk Pedagang
QRIS (*Quick Response Code Indonesian Standard*) adalah standar nasional pembayaran digital di Indonesia. Cukup pasang satu kode QR di meja kasir Anda, semua pelanggan bisa membayar menggunakan aplikasi mobile banking (BCA, BRI, Mandiri, BNI, Jatim) maupun dompet digital (GoPay, OVO, DANA, ShopeePay).

### 3 Tips Memasang Stiker QRIS yang Benar:
1. **Pasang di tempat terang & terawasi:** Letakkan stiker di meja kasir yang selalu berada di bawah pengawasan Anda.
2. **Periksa stiker secara rutin:** Raba stiker setiap pagi untuk memastikan tidak ada oknum yang menempelkan stiker QR palsu di atas stiker Anda.
3. **Simpan saat toko tutup:** Jangan meninggalkan stiker atau standing akrilik QRIS di luar kios saat warung Anda sedang tutup.',
'qris_basics', 50, true),

('d2222222-2222-2222-2222-222222222222', 'Waspada Penipuan & Cara Cek Uang Masuk',
'## Jangan Hanya Percaya Tangkapan Layar Pembeli!
Salah satu modus penipuan yang sering terjadi adalah pembeli menunjukkan tangkapan layar (*screenshot*) bukti transfer palsu atau editan di ponsel mereka.

### 3 Langkah Aman Memastikan Uang Sudah Masuk:
1. **Buka Aplikasi Anda Sendiri:** Jangan hanya melihat HP pembeli. Buka aplikasi merchant atau mobile banking di ponsel Anda.
2. **Cek Notifikasi / Riwayat Mutasi:** Pastikan ada notifikasi resmi atau saldo mutasi rekening Anda bertambah sesuai nominal belanja.
3. **Tahan Barang Sampai Dana Terkonfirmasi:** Jika pembeli terburu-buru, mintalah menunggu 1 menit dengan sopan sampai notifikasi uang masuk muncul.',
'security', 50, true),

('d3333333-3333-3333-3333-333333333333', 'Strategi Meningkatkan Transaksi Non-Tunai di Warung',
'## Mengapa Pembeli Suka Membayar dengan QRIS?
Banyak pembeli tidak membawa uang pecahan pas atau malas menunggu uang kembalian. Menyediakan QRIS membuat transaksi belanja lebih cepat dan anti ribet.

### Cara Mengajak Pembeli Memakai QRIS:
- Tuliskan papan kecil: *"Di sini bisa bayar pakai QRIS / scan HP"*.
- Tawarkan kepada pembeli: *"Mau bayar pakai scan QR, Kak?"*.
- Cocok untuk belanja nominal kecil mulai dari seribu rupiah tanpa biaya admin.',
'business_growth', 50, true)
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content_md = EXCLUDED.content_md, xp_reward = EXCLUDED.xp_reward;

-- 5.5 Misi Tantangan Pedagang
INSERT INTO missions (id, title, description, mission_type, xp_reward, starts_at, ends_at, is_active) VALUES
('b1111111-1111-1111-1111-111111111111', 'Lapor Transaksi Pertama', 'Laporkan transaksi pembayaran QRIS yang Anda terima di toko hari ini.', 'activity', 50, timezone('utc', now() - interval '2 days'), timezone('utc', now() + interval '60 days'), true),
('b2222222-2222-2222-2222-222222222222', 'Selesaikan Modul Keamanan QRIS', 'Pelajari cara mendeteksi bukti transfer palsu dan selesaikan modulnya.', 'learning', 40, timezone('utc', now() - interval '2 days'), timezone('utc', now() + interval '60 days'), true),
('b3333333-3333-3333-3333-333333333333', 'Terima 5 Transaksi QRIS Pekan Ini', 'Tingkatkan pelayanan nontunai dengan mencatat total 5 transaksi QRIS.', 'activity', 75, timezone('utc', now() - interval '2 days'), timezone('utc', now() + interval '60 days'), true)
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description, xp_reward = EXCLUDED.xp_reward;

-- 5.6 Katalog Hadiah UMKM Realistis
INSERT INTO rewards (name, description, category, points_cost, stock, is_active, fulfillment_instructions) VALUES
('Pulsa Seluler Rp 10.000', 'Pulsa kuota internet all-operator untuk mendukung aplikasi jualan pedagang.', 'voucher', 100, 50, true, 'Nomor pulsa langsung dikirimkan via SMS operator dalam 1x24 jam kerja.'),
('Standing Akrilik QRIS Meja Kasir', 'Dudukan akrilik bening kokoh dan anti-air untuk memajang stiker QRIS di kasir.', 'merchandise', 200, 30, true, 'Dikirimkan langsung ke alamat warung oleh pendamping lapangan DigiUMKM.'),
('Voucher Sembako Grosir Rp 25.000', 'Voucher belanja perlengkapan warung sembako di toko grosir mitra terdekat.', 'voucher', 300, 15, true, 'Tunjukkan kode voucher saat berbelanja di agen grosir mitra.'),
('Kaos Mitra DigiUMKM "Jawara QRIS"', 'Kaos katun premium khusus pedagang aktif digital.', 'merchandise', 250, 20, true, 'Diserahkan saat kunjungan tim pendamping lapangan.')
ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description, points_cost = EXCLUDED.points_cost, stock = EXCLUDED.stock;

-- =========================================================================
-- 6. DATA AKUN PENGGUNA & PEDAGANG NYATA (UMKM JAWA TIMUR)
-- =========================================================================

-- 6.1 Akun Admin
INSERT INTO auth.users (id, email) VALUES
('a0000000-0000-0000-0000-000000000001', 'admin@digiumkm.id')
ON CONFLICT (id) DO NOTHING;

INSERT INTO profiles (id, role, display_name, phone_e164) VALUES
('a0000000-0000-0000-0000-000000000001', 'admin', 'Pengelola DigiUMKM', '081122334455')
ON CONFLICT (id) DO UPDATE SET display_name = EXCLUDED.display_name, role = EXCLUDED.role;

-- 6.2 Merchant 1: Bu Siti Aminah (Jember - Warung Sembako)
INSERT INTO auth.users (id, email) VALUES
('a0000000-0000-0000-0000-000000000002', 'siti.aminah@gmail.com')
ON CONFLICT (id) DO NOTHING;

INSERT INTO profiles (id, role, display_name, phone_e164) VALUES
('a0000000-0000-0000-0000-000000000002', 'merchant', 'Siti Aminah', '081234567890')
ON CONFLICT (id) DO UPDATE SET display_name = EXCLUDED.display_name;

INSERT INTO merchants (id, user_id, business_name, business_category, province, regency, district, qris_status) VALUES
('e0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', 'Warung Berkah Bu Siti', 'Kelontong & Sembako', 'Jawa Timur', 'Jember', 'Sumbersari', 'active')
ON CONFLICT (user_id) DO UPDATE SET business_name = EXCLUDED.business_name, business_category = EXCLUDED.business_category, regency = EXCLUDED.regency, qris_status = EXCLUDED.qris_status;

-- 6.3 Merchant 2: Pak Slamet Riyadi (Banyuwangi - Toko Kelontong)
INSERT INTO auth.users (id, email) VALUES
('a0000000-0000-0000-0000-000000000003', 'slamet.riyadi@gmail.com')
ON CONFLICT (id) DO NOTHING;

INSERT INTO profiles (id, role, display_name, phone_e164) VALUES
('a0000000-0000-0000-0000-000000000003', 'merchant', 'Slamet Riyadi', '081234567891')
ON CONFLICT (id) DO UPDATE SET display_name = EXCLUDED.display_name;

INSERT INTO merchants (id, user_id, business_name, business_category, province, regency, district, qris_status) VALUES
('e0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000003', 'Toko Kelontong Pak Slamet', 'Kelontong & Sembako', 'Jawa Timur', 'Banyuwangi', 'Rogojampi', 'active')
ON CONFLICT (user_id) DO UPDATE SET business_name = EXCLUDED.business_name, regency = EXCLUDED.regency, qris_status = EXCLUDED.qris_status;

-- 6.4 Merchant 3: Cak Abdul Ghofur (Bondowoso - Warkop)
INSERT INTO auth.users (id, email) VALUES
('a0000000-0000-0000-0000-000000000004', 'cak.dul@gmail.com')
ON CONFLICT (id) DO NOTHING;

INSERT INTO profiles (id, role, display_name, phone_e164) VALUES
('a0000000-0000-0000-0000-000000000004', 'merchant', 'Abdul Ghofur', '081234567892')
ON CONFLICT (id) DO UPDATE SET display_name = EXCLUDED.display_name;

INSERT INTO merchants (id, user_id, business_name, business_category, province, regency, district, qris_status) VALUES
('e0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000004', 'Warung Kopi Cak Dul', 'Warung Kopi & Kuliner', 'Jawa Timur', 'Bondowoso', 'Tamanan', 'active')
ON CONFLICT (user_id) DO UPDATE SET business_name = EXCLUDED.business_name, regency = EXCLUDED.regency, qris_status = EXCLUDED.qris_status;

-- 6.5 Merchant 4: Mbak Sri Wahyuni (Lumajang - Catering)
INSERT INTO auth.users (id, email) VALUES
('a0000000-0000-0000-0000-000000000005', 'sri.wahyuni@gmail.com')
ON CONFLICT (id) DO NOTHING;

INSERT INTO profiles (id, role, display_name, phone_e164) VALUES
('a0000000-0000-0000-0000-000000000005', 'merchant', 'Sri Wahyuni', '081234567893')
ON CONFLICT (id) DO UPDATE SET display_name = EXCLUDED.display_name;

INSERT INTO merchants (id, user_id, business_name, business_category, province, regency, district, qris_status) VALUES
('e0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000005', 'Dapur Bu Sri Catering', 'Makanan & Minuman', 'Jawa Timur', 'Lumajang', 'Pasirian', 'applied')
ON CONFLICT (user_id) DO UPDATE SET business_name = EXCLUDED.business_name, regency = EXCLUDED.regency, qris_status = EXCLUDED.qris_status;

-- 6.6 Merchant 5: Mas Rian Hidayat (Situbondo - Konter Pulsa)
INSERT INTO auth.users (id, email) VALUES
('a0000000-0000-0000-0000-000000000006', 'rian.hidayat@gmail.com')
ON CONFLICT (id) DO NOTHING;

INSERT INTO profiles (id, role, display_name, phone_e164) VALUES
('a0000000-0000-0000-0000-000000000006', 'merchant', 'Rian Hidayat', '081234567894')
ON CONFLICT (id) DO UPDATE SET display_name = EXCLUDED.display_name;

INSERT INTO merchants (id, user_id, business_name, business_category, province, regency, district, qris_status) VALUES
('e0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000006', 'Berkah Cell & Pulsa', 'Pulsa & Konter HP', 'Jawa Timur', 'Situbondo', 'Panji', 'active')
ON CONFLICT (user_id) DO UPDATE SET business_name = EXCLUDED.business_name, regency = EXCLUDED.regency, qris_status = EXCLUDED.qris_status;

-- =========================================================================
-- 7. LAPORAN TRANSAKSI QRIS & BUKTI FOTO
-- =========================================================================

INSERT INTO payment_activities (id, merchant_id, activity_date, activity_type, reported_count, source, status, evidence_storage_key, created_at, verified_by, verified_at) VALUES
-- Laporan Bu Siti (Menunggu Verifikasi Admin - ada bukti foto)
('c0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001', '2026-11-24', 'qris_in_store', 3, 'self_reported', 'submitted', 'sample_qris_receipt', '2026-11-24T06:30:00Z', NULL, NULL),

-- Laporan Pak Slamet (Sudah diverifikasi admin)
('c0000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000002', '2026-11-23', 'qris_in_store', 5, 'self_reported', 'verified', 'sample_qris_receipt', '2026-11-23T08:00:00Z', 'a0000000-0000-0000-0000-000000000001', '2026-11-23T09:15:00Z'),

-- Laporan Cak Dul (Sudah diverifikasi)
('c0000000-0000-0000-0000-000000000003', 'e0000000-0000-0000-0000-000000000003', '2026-11-22', 'qris_in_store', 2, 'self_reported', 'verified', NULL, '2026-11-22T10:00:00Z', 'a0000000-0000-0000-0000-000000000001', '2026-11-22T11:00:00Z'),

-- Laporan Mas Rian (Sudah diverifikasi)
('c0000000-0000-0000-0000-000000000004', 'e0000000-0000-0000-0000-000000000005', '2026-11-24', 'qris_in_store', 4, 'self_reported', 'verified', 'sample_qris_receipt', '2026-11-24T05:00:00Z', 'a0000000-0000-0000-0000-000000000001', '2026-11-24T07:00:00Z')
ON CONFLICT (id) DO NOTHING;

-- =========================================================================
-- 8. BUKU BESAR POIN (POINTS LEDGER) MERCHANT
-- =========================================================================

-- Poin Bu Siti (+50 Profil Lengkap, +50 Modul QRIS, +50 Modul Keamanan = 150 XP)
INSERT INTO points_ledger (id, merchant_id, event_key, source_type, source_id, delta, idempotency_key, created_at) VALUES
('f0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001', 'PROFILE_COMPLETED', 'profiles', 'a0000000-0000-0000-0000-000000000002', 50, 'init_prof_siti', '2026-11-20T04:00:00Z'),
('f0000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000001', 'LESSON_COMPLETED', 'lessons', 'd1111111-1111-1111-1111-111111111111', 50, 'init_les1_siti', '2026-11-21T05:00:00Z'),
('f0000000-0000-0000-0000-000000000003', 'e0000000-0000-0000-0000-000000000001', 'LESSON_COMPLETED', 'lessons', 'd2222222-2222-2222-2222-222222222222', 50, 'init_les2_siti', '2026-11-22T06:00:00Z'),

-- Poin Pak Slamet (+50 Profil, +50 Modul, +30 Transaksi Terverifikasi = 130 XP)
('f0000000-0000-0000-0000-000000000004', 'e0000000-0000-0000-0000-000000000002', 'PROFILE_COMPLETED', 'profiles', 'a0000000-0000-0000-0000-000000000003', 50, 'init_prof_slamet', '2026-11-19T03:00:00Z'),
('f0000000-0000-0000-0000-000000000005', 'e0000000-0000-0000-0000-000000000002', 'LESSON_COMPLETED', 'lessons', 'd1111111-1111-1111-1111-111111111111', 50, 'init_les1_slamet', '2026-11-20T04:00:00Z'),
('f0000000-0000-0000-0000-000000000006', 'e0000000-0000-0000-0000-000000000002', 'QRIS_ACTIVITY_VERIFIED', 'payment_activities', 'c0000000-0000-0000-0000-000000000002', 30, 'init_ver_slamet', '2026-11-23T09:15:00Z')
ON CONFLICT (idempotency_key) DO NOTHING;

-- 8.1 Lencana yang Diraih Merchant
INSERT INTO merchant_badges (merchant_id, badge_id, awarded_at) VALUES
('e0000000-0000-0000-0000-000000000001', '22222222-0000-0000-0000-000000000001', '2026-11-21T06:00:00Z'),
('e0000000-0000-0000-0000-000000000001', '22222222-0000-0000-0000-000000000002', '2026-11-22T07:00:00Z'),
('e0000000-0000-0000-0000-000000000002', '22222222-0000-0000-0000-000000000001', '2026-11-20T05:00:00Z'),
('e0000000-0000-0000-0000-000000000002', '22222222-0000-0000-0000-000000000003', '2026-11-23T10:00:00Z')
ON CONFLICT (merchant_id, badge_id) DO NOTHING;

-- Selesai!
