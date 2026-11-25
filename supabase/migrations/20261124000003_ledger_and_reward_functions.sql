-- 20261124000003_ledger_and_reward_functions.sql
-- Prosedur tersimpan atomik untuk keamanan poin dan penukaran reward

-- 1. Helper: Hitung Saldo Total Poin Merchant
CREATE OR REPLACE FUNCTION get_merchant_balance(p_merchant_id UUID)
RETURNS INTEGER AS $$
  SELECT COALESCE(SUM(delta), 0)::INTEGER
  FROM points_ledger
  WHERE merchant_id = p_merchant_id;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- 2. Helper: Hitung Total XP Terkumpul (Semua delta positif)
CREATE OR REPLACE FUNCTION get_merchant_total_xp(p_merchant_id UUID)
RETURNS INTEGER AS $$
  SELECT COALESCE(SUM(delta), 0)::INTEGER
  FROM points_ledger
  WHERE merchant_id = p_merchant_id AND delta > 0;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- 3. Stored Procedure: Berikan Poin (Append-Only dengan proteksi Idempotency)
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
        RAISE EXCEPTION 'Delta poin yang diberikan harus bernilai positif (diberikan: %)', p_delta;
    END IF;

    INSERT INTO points_ledger (
        merchant_id,
        event_key,
        source_type,
        source_id,
        delta,
        idempotency_key,
        created_by
    ) VALUES (
        p_merchant_id,
        p_event_key,
        p_source_type,
        p_source_id,
        p_delta,
        p_idempotency_key,
        p_created_by
    )
    RETURNING id INTO v_ledger_id;

    RETURN v_ledger_id;
EXCEPTION
    WHEN unique_violation THEN
        RAISE EXCEPTION 'Idempotency key % sudah pernah diproses.', p_idempotency_key;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Stored Procedure: Penukaran Reward Atomik (Verifikasi Saldo + Lock Stok + Catat Debit Ledger)
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
    -- Kunci baris reward dengan FOR UPDATE mencegah race condition stok
    SELECT points_cost, stock INTO v_cost, v_stock
    FROM rewards
    WHERE id = p_reward_id AND is_active = true
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Hadiah tidak ditemukan atau sedang tidak aktif.';
    END IF;

    IF v_stock IS NOT NULL AND v_stock <= 0 THEN
        RAISE EXCEPTION 'Stok hadiah telah habis.';
    END IF;

    -- Hitung saldo merchant
    v_balance := get_merchant_balance(p_merchant_id);
    IF v_balance < v_cost THEN
        RAISE EXCEPTION 'Saldo poin Anda (% poin) tidak mencukupi untuk hadiah ini (% poin).', v_balance, v_cost;
    END IF;

    -- Kurangi stok jika tidak unlimited
    IF v_stock IS NOT NULL THEN
        UPDATE rewards SET stock = stock - 1 WHERE id = p_reward_id;
    END IF;

    -- Buat entri penukaran
    INSERT INTO reward_redemptions (
        merchant_id,
        reward_id,
        points_cost,
        status,
        idempotency_key
    ) VALUES (
        p_merchant_id,
        p_reward_id,
        v_cost,
        'requested',
        p_idempotency_key
    )
    RETURNING id INTO v_redemption_id;

    -- Catat transaksi debit ke points ledger (delta bernilai negatif)
    INSERT INTO points_ledger (
        merchant_id,
        event_key,
        source_type,
        source_id,
        delta,
        idempotency_key
    ) VALUES (
        p_merchant_id,
        'reward_redemption',
        'reward_redemptions',
        v_redemption_id,
        -v_cost,
        'ledger_' || p_idempotency_key
    );

    RETURN v_redemption_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

