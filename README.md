# DigiUMKM — Agent & Article Pack

Paket ini berisi dokumen kerja untuk membangun DigiUMKM, platform web gamifikasi yang membantu UMKM rural mengadopsi dan mempertahankan penggunaan QRIS.

## Isi paket
- `AGENTS.md` — instruksi kerja untuk coding agent.
- `PRODUCT_REQUIREMENTS.md` — tujuan produk, pengguna, ruang lingkup, dan kriteria penerimaan.
- `TECHNICAL_ARCHITECTURE.md` — arsitektur teknis, keamanan, dan integrasi QRIS.
- `USER_FLOWS.md` — alur pengguna dan admin.
- `DATABASE_SCHEMA.md` — rancangan tabel PostgreSQL.
- `RESEARCH_PROTOCOL.md` — rancangan penelitian untuk artikel ilmiah.
- `ARTICLE_OUTLINE.md` — struktur manuskrip.
- `JOURNAL_TARGETS.md` — jurnal kandidat dan strategi pemilihan.

## Prinsip penting
1. DigiUMKM bukan penyelenggara jasa pembayaran dan tidak memproses dana.
2. Jangan mengklaim transaksi QRIS terverifikasi jika tidak ada sumber data resmi/berizin.
3. Fase awal menggunakan input aktivitas dan verifikasi admin; integrasi otomatis hanya setelah ada kerja sama dan akses resmi dari penyedia pembayaran.
4. Poin diberikan untuk aktivitas yang sehat dan terverifikasi, bukan untuk mendorong transaksi palsu atau berlebihan.
5. Jangan memasukkan data pribadi atau bukti transaksi sensitif ke repositori kode.

## Cara menggunakan
Mulai dengan membaca `AGENTS.md`, lalu `PRODUCT_REQUIREMENTS.md` dan `TECHNICAL_ARCHITECTURE.md`. Implementasikan MVP secara bertahap mengikuti kriteria penerimaan.
