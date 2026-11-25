-- 20261124000002_rls_policies.sql
-- Pengaktifan Row Level Security (RLS) pada semua tabel DigiUMKM

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE merchants ENABLE ROW LEVEL SECURITY;
ALTER TABLE consent_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE mission_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE point_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE points_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE merchant_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE reward_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function: verifikasi peran admin di level database
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Profiles
CREATE POLICY "Pengguna membaca profil sendiri atau admin" ON profiles
  FOR SELECT USING (auth.uid() = id OR is_admin());
CREATE POLICY "Pengguna memperbarui profil sendiri" ON profiles
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Pengguna baru membuat profilnya" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Merchants
CREATE POLICY "Merchant membaca data usaha sendiri atau admin" ON merchants
  FOR SELECT USING (user_id = auth.uid() OR is_admin());
CREATE POLICY "Merchant memperbarui data usaha sendiri" ON merchants
  FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Merchant mendaftarkan data usaha" ON merchants
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Consent Records
CREATE POLICY "Pengguna membaca consent sendiri" ON consent_records
  FOR SELECT USING (user_id = auth.uid() OR is_admin());
CREATE POLICY "Pengguna menyetujui consent" ON consent_records
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Lessons (Materi Belajar)
CREATE POLICY "Semua pengguna terotentikasi dapat membaca materi yang dipublikasi" ON lessons
  FOR SELECT USING (is_published = true OR is_admin());
CREATE POLICY "Hanya admin mengelola materi" ON lessons
  FOR ALL USING (is_admin());

-- Lesson Completions
CREATE POLICY "Merchant melihat riwayat modul sendiri" ON lesson_completions
  FOR SELECT USING (
    merchant_id IN (SELECT id FROM merchants WHERE user_id = auth.uid()) OR is_admin()
  );
CREATE POLICY "Merchant mencatat modul selesai" ON lesson_completions
  FOR INSERT WITH CHECK (
    merchant_id IN (SELECT id FROM merchants WHERE user_id = auth.uid())
  );

-- Missions
CREATE POLICY "Semua merchant membaca misi aktif" ON missions
  FOR SELECT USING (is_active = true OR is_admin());
CREATE POLICY "Hanya admin mengelola misi" ON missions
  FOR ALL USING (is_admin());

-- Mission Claims
CREATE POLICY "Merchant melihat status klaim misi sendiri" ON mission_claims
  FOR SELECT USING (
    merchant_id IN (SELECT id FROM merchants WHERE user_id = auth.uid()) OR is_admin()
  );
CREATE POLICY "Merchant memulai atau mengajukan klaim misi" ON mission_claims
  FOR INSERT WITH CHECK (
    merchant_id IN (SELECT id FROM merchants WHERE user_id = auth.uid())
  );
CREATE POLICY "Admin meninjau klaim misi" ON mission_claims
  FOR UPDATE USING (is_admin());

-- Payment Activities (Pelaporan QRIS Mode Pilot)
CREATE POLICY "Merchant melihat riwayat transaksi sendiri" ON payment_activities
  FOR SELECT USING (
    merchant_id IN (SELECT id FROM merchants WHERE user_id = auth.uid()) OR is_admin()
  );
CREATE POLICY "Merchant melaporkan transaksi (self-reported)" ON payment_activities
  FOR INSERT WITH CHECK (
    merchant_id IN (SELECT id FROM merchants WHERE user_id = auth.uid())
    AND source = 'self_reported'
    AND status = 'submitted'
  );
CREATE POLICY "Admin memverifikasi transaksi merchant" ON payment_activities
  FOR UPDATE USING (is_admin());

-- Points Ledger (Strictly Append-Only)
CREATE POLICY "Merchant melihat ledger poin miliknya" ON points_ledger
  FOR SELECT USING (
    merchant_id IN (SELECT id FROM merchants WHERE user_id = auth.uid()) OR is_admin()
  );

-- Levels & Badges (Publik terotentikasi)
CREATE POLICY "Pengguna melihat konfigurasi level" ON levels
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Pengguna melihat daftar badge" ON badges
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Pengguna melihat badge yang diraih" ON merchant_badges
  FOR SELECT USING (
    merchant_id IN (SELECT id FROM merchants WHERE user_id = auth.uid()) OR is_admin()
  );

-- Rewards & Redemptions
CREATE POLICY "Pengguna melihat katalog reward aktif" ON rewards
  FOR SELECT TO authenticated USING (is_active = true OR is_admin());
CREATE POLICY "Admin mengelola reward" ON rewards
  FOR ALL USING (is_admin());
CREATE POLICY "Merchant melihat penukaran miliknya" ON reward_redemptions
  FOR SELECT USING (
    merchant_id IN (SELECT id FROM merchants WHERE user_id = auth.uid()) OR is_admin()
  );
CREATE POLICY "Admin memproses status fulfillment penukaran" ON reward_redemptions
  FOR UPDATE USING (is_admin());

-- Audit Logs (Hanya Admin)
CREATE POLICY "Hanya admin dapat membaca audit logs" ON audit_logs
  FOR SELECT USING (is_admin());

