# AGENTS.md — Instruksi untuk Coding Agent

## Misi
Bangun DigiUMKM, aplikasi web responsif/PWA untuk mendukung adopsi dan penggunaan QRIS berkelanjutan oleh UMKM di wilayah rural. Produk menggabungkan edukasi, misi, poin, level, badge, reward, pencatatan aktivitas, dan panel admin.

## Aturan kerja
- Baca seluruh dokumen proyek sebelum mengubah kode.
- Prioritaskan MVP yang aman, sederhana, aksesibel, dan dapat diuji.
- Jangan membuat integrasi QRIS/API fiktif. Jangan mengarang endpoint, kredensial, webhook, atau status transaksi.
- Semua integrasi pembayaran harus berada di belakang adapter/interface agar provider dapat ditambahkan setelah izin resmi diperoleh.
- Dalam mode pilot, transaksi berstatus `self_reported` atau `admin_verified`; jangan tampilkan sebagai `provider_verified`.
- Jangan pernah menyimpan PIN, OTP, password mobile banking, nomor kartu, kredensial dompet digital, atau QRIS secret.
- Hindari menyimpan screenshot struk. Jika bukti benar-benar diperlukan, minimalkan data, minta persetujuan, samarkan informasi sensitif, batasi akses, dan tetapkan masa retensi.
- Poin harus dicatat dalam ledger append-only. Jangan mengedit saldo secara langsung.
- Perubahan poin, penukaran reward, dan verifikasi transaksi harus dilakukan melalui server-side transaction dengan otorisasi.
- Gunakan validasi server-side untuk semua input.
- Terapkan role-based access control: `merchant`, `admin`, `researcher` (opsional).
- Jangan memasukkan data responden nyata ke seed, fixture, log, atau repositori.
- Semua nilai poin dan ambang level adalah konfigurasi, bukan angka hard-coded.
- Jangan menganggap leaderboard publik wajib; gunakan opt-in dan nama samaran.
- Dilarang keras menempelkan badge/pill dekoratif berlebihan ("AI slop") seperti label peran berulang ([Pengelola], [Admin], [Portal Administrator], [Internal Auth], dsb.) di sebelah logo, di atas judul halaman, atau di navbar. Logo cukup logo dan nama brand "DigiUMKM". Desain harus bersih, minimalis, proporsional, dan profesional setara web modern tanpa elemen visual artifisial yang tidak perlu.
- Copywriting harus natural, manusiawi, dan lugas. Dilarang keras menampilkan istilah teknis backend, database, atau sistem ke antarmuka pengguna (user-facing UI), seperti "DB", "basis data", "database", "API", "endpoint", "query", "payload", "idempotency", dsb. Gunakan bahasa umum yang ramah dan profesional bagi masyarakat umum, pedagang, dan tim pengelola, seperti:
  - Gunakan "Perbarui Data" atau "Segarkan Daftar", BUKAN "Sinkronkan DB".
  - Gunakan "Daftar laporan aktivitas pembayaran QRIS yang perlu ditinjau", BUKAN "disinkronkan langsung dengan basis data".
  - Gunakan "Menyimpan...", BUKAN "Menyimpan ke DB".
  - Gunakan "Gagal memproses data", BUKAN "Database error".

## Stack default yang disarankan
- Next.js + TypeScript
- Tailwind CSS
- Supabase (PostgreSQL, Auth, Storage hanya jika diperlukan)
- Zod untuk validasi
- Vitest/Jest untuk unit test
- Playwright untuk end-to-end test
- Vercel atau hosting setara untuk deployment

Jika repository telah memakai stack berbeda, pertahankan stack yang ada kecuali ada alasan teknis kuat untuk migrasi.

## Standar implementasi
- TypeScript strict mode.
- Komponen UI reusable dan mobile-first.
- Bahasa antarmuka awal: Bahasa Indonesia.
- Tanggal/waktu disimpan UTC; tampilkan dalam zona `Asia/Jakarta`.
- Simpan uang sebagai integer dalam satuan rupiah, bukan floating point.
- Simpan poin sebagai integer.
- Gunakan UUID untuk primary key.
- Tambahkan migration untuk setiap perubahan skema.
- Jangan commit `.env`, token, secret, atau data pribadi.
- Sediakan `.env.example` tanpa nilai rahasia.
- Tambahkan loading, empty, success, error, dan offline states.
- Desain untuk koneksi internet terbatas dan perangkat Android kelas menengah/rendah.

## Modul MVP
1. Authentication dan profil UMKM.
2. Dashboard merchant.
3. Learning center dan kuis.
4. Mission/challenge engine.
5. Points ledger, level, dan badges.
6. Reward catalogue dan redemption.
7. Aktivitas QRIS dengan status verifikasi.
8. Admin panel untuk misi, reward, verifikasi, dan laporan.

## Keamanan dan integritas
- RLS (Row Level Security) aktif pada tabel yang menyimpan data pengguna.
- Merchant hanya dapat membaca/mengubah data miliknya.
- Admin menggunakan role terverifikasi; jangan percaya role dari client.
- Semua operasi poin dan reward berlangsung di server.
- Cegah replay/double claim dengan idempotency key atau unique constraint.
- Audit log untuk tindakan admin.
- Rate limit endpoint login, klaim misi, dan penukaran reward.
- Jangan mengumpulkan data transaksi lebih banyak dari yang diperlukan.
- Berikan consent yang jelas untuk partisipasi riset dan penggunaan data.

## Definition of Done
Fitur dianggap selesai jika:
- Berjalan di desktop dan mobile.
- Ada validasi dan otorisasi server-side.
- Memiliki unit test untuk logika inti.
- Menangani error dan status kosong.
- Tidak membocorkan data antar akun.
- Dokumentasi diperbarui.
- Tidak mengklaim integrasi provider yang belum benar-benar tersedia.

## Urutan implementasi
1. Setup project, lint, test, environment.
2. Auth, role, merchant profile.
3. Database migrations dan RLS.
4. Dashboard dan learning center.
5. Mission engine dan point ledger.
6. Badge, level, reward, redemption.
7. QRIS activity reporting dan admin verification.
8. Analytics dan export data riset yang teranonimkan.
9. Security review, usability testing, deployment.
