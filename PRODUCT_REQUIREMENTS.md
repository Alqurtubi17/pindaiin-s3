# Product Requirements — DigiUMKM

## 1. Ringkasan
DigiUMKM adalah platform web/PWA gamifikasi yang membantu UMKM rural membangun keterampilan dan kebiasaan menerima pembayaran QRIS. Platform tidak menggantikan aplikasi pembayaran dan tidak menyimpan dana.

## 2. Sasaran
- Meningkatkan pemahaman UMKM tentang QRIS dan keamanan transaksi.
- Mendorong percobaan penggunaan QRIS.
- Mendorong konsistensi penggunaan QRIS.
- Menyediakan feedback, penghargaan, dan pendampingan yang relevan.
- Menghasilkan data evaluasi yang dapat dianalisis untuk penelitian.

## 3. Persona
### Merchant
Pemilik/pengelola UMKM dengan literasi digital dan kualitas koneksi internet yang beragam. Membutuhkan tampilan sederhana, bahasa Indonesia, instruksi singkat, dan bantuan.

### Admin
Mengelola akun, konten pembelajaran, misi, verifikasi aktivitas, katalog reward, dan laporan.

### Researcher
Mengakses data penelitian yang telah diminimalkan/di-pseudonymize dan hanya sesuai persetujuan serta protokol etik.

## 4. Fitur fungsional
- Registrasi/login dan persetujuan penggunaan data.
- Profil UMKM: nama usaha, kabupaten/kecamatan, kategori usaha, status penggunaan QRIS.
- Dashboard: XP, level, progress misi, aktivitas terakhir.
- Learning center: materi singkat, kuis, dan hasil.
- Misi: edukasi, kesiapan QRIS, transaksi valid, konsistensi penggunaan.
- Poin dan badge.
- Reward catalogue dan penukaran.
- Pencatatan aktivitas QRIS.
- Verifikasi aktivitas oleh admin pada pilot.
- Dashboard admin dan laporan agregat.
- Pengaturan privasi dan permintaan penghapusan akun.

## 5. Non-functional requirements
- Mobile-first, responsive, PWA-ready.
- Waktu muat ringan dan hemat data.
- WCAG-informed accessibility: kontras, ukuran teks, label input, navigasi keyboard.
- Keamanan berbasis role dan RLS.
- Audit trail untuk verifikasi dan reward.
- Backup dan kebijakan retensi data.
- Bahasa Indonesia; gunakan istilah sederhana.

## 6. Di luar ruang lingkup MVP
- Memproses pembayaran.
- Menyimpan saldo atau dana.
- Mengakses rekening atau aplikasi mobile banking pengguna.
- Membaca transaksi QRIS secara otomatis tanpa perjanjian/API resmi.
- Memberi pinjaman, skor kredit, atau rekomendasi finansial.
- Leaderboard wajib yang menampilkan identitas usaha.

## 7. Kriteria penerimaan utama
- Merchant dapat mendaftar dan mengelola profil.
- Merchant dapat mengikuti modul belajar dan misi.
- Poin hanya diberikan sekali untuk aktivitas yang memenuhi syarat.
- Saldo poin dapat ditelusuri melalui ledger.
- Admin dapat memverifikasi/menolak klaim dengan alasan.
- Penukaran reward mengurangi poin melalui transaksi atomik.
- Merchant tidak dapat melihat data merchant lain.
- Laporan penelitian tidak menampilkan identitas langsung.
