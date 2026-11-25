-- supabase/seed.sql
-- Data sintetis awal untuk pengujian lokal: Level, Badges, Modul Belajar, Misi, Reward, dan Aturan Poin

-- 1. Konfigurasi Level
INSERT INTO levels (level_number, name, minimum_xp, maximum_xp) VALUES
(1, 'Pemula QRIS', 0, 99),
(2, 'Pedagang Cakap', 100, 249),
(3, 'Pedagang Terampil', 250, 499),
(4, 'Jawara QRIS', 500, NULL)
ON CONFLICT (level_number) DO NOTHING;

-- 2. Konfigurasi Badges
INSERT INTO badges (code, name, description, criteria_json) VALUES
('FIRST_QRIS_CLAIM', 'Langkah Pertama', 'Melaporkan transaksi QRIS pertama kali', '{"type": "first_transaction"}'),
('SAFETY_CHAMPION', 'Juara Keamanan', 'Menyelesaikan kuis keamanan transaksi QRIS', '{"type": "quiz_passed", "topic": "security"}'),
('STREAK_3_DAYS', 'Pedagang Konsisten', 'Melaporkan transaksi 3 hari berturut-turut', '{"type": "streak", "days": 3}')
ON CONFLICT (code) DO NOTHING;

-- 3. Aturan Poin (Point Rules)
INSERT INTO point_rules (event_key, xp, max_awards_per_period, is_active) VALUES
('PROFILE_COMPLETED', 50, 1, true),
('LESSON_COMPLETED', 30, NULL, true),
('QRIS_ACTIVITY_SUBMITTED', 20, 1, true),
('QRIS_ACTIVITY_VERIFIED', 30, NULL, true)
ON CONFLICT (event_key) DO NOTHING;

-- 4. Materi Pembelajaran (Lessons)
INSERT INTO lessons (id, title, content_md, topic, xp_reward, is_published) VALUES
('d1111111-1111-1111-1111-111111111111', 'Mengenal QRIS & Cara Pasang Stiker Aman', '## Mengenal QRIS\nQRIS (Quick Response Code Indonesian Standard) adalah satu QR code yang bisa menerima pembayaran dari semua aplikasi perbankan dan dompet digital di Indonesia.\n\n### Tips Aman Memasang Stiker QRIS:\n1. Pasang stiker QRIS di dekat meja kasir yang mudah diawasi.\n2. Raba permukaan stiker secara berkala; pastikan tidak ada stiker lain yang menimpa.\n3. Jangan biarkan stiker QRIS tanpa pengawasan saat toko tutup.', 'qris_basics', 50, true),
('d2222222-2222-2222-2222-222222222222', 'Waspada Penipuan & Cara Cek Notifikasi Masuk', '## Cara Memastikan Uang QRIS Benar Masuk\nJangan hanya percaya pada tangkapan layar (screenshot) pembeli di ponselnya!\n\n### 3 Langkah Cek Transaksi:\n1. Buka aplikasi merchant/mobile banking Anda sendiri.\n2. Periksa riwayat transaksi masuk dan pastikan nominalnya cocok.\n3. Jangan layani pembeli yang mendesak barang dibawa sebelum notifikasi resmi masuk.', 'security', 50, true)
ON CONFLICT (id) DO NOTHING;

-- 5. Misi Awal (Missions)
INSERT INTO missions (id, title, description, mission_type, xp_reward, starts_at, ends_at, is_active) VALUES
('m1111111-1111-1111-1111-111111111111', 'Lapor Transaksi Pertama', 'Laporkan transaksi QRIS yang Anda terima hari ini melalui menu Aktivitas.', 'activity', 50, timezone('utc', now()), timezone('utc', now() + interval '30 days'), true),
('m2222222-2222-2222-2222-222222222222', 'Selesaikan Modul Keamanan', 'Baca modul Waspada Penipuan dan jawab kuisnya dengan benar.', 'learning', 40, timezone('utc', now()), timezone('utc', now() + interval '30 days'), true)
ON CONFLICT (id) DO NOTHING;

-- 6. Katalog Hadiah (Rewards)
INSERT INTO rewards (name, description, category, points_cost, stock, is_active, fulfillment_instructions) VALUES
('Pulsa Seluler Rp 10.000', 'Pulsa reguler all-operator untuk mendukung internet usaha Anda.', 'voucher', 100, 50, true, 'Nomor pulsa dikirimkan via SMS dalam 1x24 jam.'),
('Stiker QRIS Akrilik Tahan Air', 'Stand akrilik kokoh untuk memajang stiker QRIS di meja kasir.', 'merchandise', 200, 25, true, 'Dikirimkan ke alamat usaha oleh tim pendamping lapangan.'),
('Voucher Belanja Sembako Rp 25.000', 'Voucher belanja perlengkapan warung di toko grosir mitra.', 'voucher', 300, 10, true, 'Tunjukkan kode voucher saat berbelanja di agen mitra.')
ON CONFLICT DO NOTHING;

