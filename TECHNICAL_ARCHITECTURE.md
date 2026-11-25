# Technical Architecture — DigiUMKM

## 1. Arsitektur logis

```text
Merchant PWA / Admin Web
          |
       HTTPS
          |
 Next.js Application
  |       |        |
 Auth   Domain   Admin/API
        Services
          |
     PostgreSQL
          |
  Audit + Analytics
          |
 Payment Provider Adapter (future)
          |
 Authorized PSP / acquirer integration
```

## 2. Stack yang direkomendasikan
- Next.js + TypeScript untuk aplikasi web.
- Tailwind CSS untuk UI.
- Supabase Auth dan PostgreSQL untuk autentikasi/database.
- Supabase RLS untuk pembatasan akses data.
- Server actions/API routes untuk operasi sensitif.
- Vercel atau hosting setara.
- Playwright untuk alur end-to-end.

## 3. Batas domain
### Identity
Akun, role, consent, profil merchant.

### Learning
Materi, kuis, jawaban, penyelesaian pembelajaran.

### Gamification
Misi, aturan poin, ledger, level, badge, achievement.

### Payment activity
Klaim aktivitas QRIS, status verifikasi, provider reference jika diizinkan.

### Rewards
Katalog, stok, biaya poin, redemption, fulfillment.

### Research analytics
Data pseudonim, metrik agregat, ekspor dengan kontrol akses.

## 4. Integrasi QRIS secara hybrid
### Pilot/manual-assisted
- Merchant mengisi aktivitas QRIS secara ringkas.
- Bukti visual bukan sumber kebenaran otomatis.
- Admin melakukan pemeriksaan sesuai SOP.
- Status yang diperbolehkan: `submitted`, `admin_verified`, `rejected`.
- Label UI harus menyatakan bahwa aktivitas dilaporkan merchant dan/atau diverifikasi admin.

### Integrasi resmi di masa depan
- Dapatkan perjanjian dan akses teknis dari acquirer/PSP yang berwenang.
- Implementasikan adapter provider.
- Verifikasi signature webhook dan idempotency.
- Simpan referensi transaksi minimum yang diperlukan.
- Jangan menyimpan data pembayaran sensitif.
- Status `provider_verified` hanya jika sumber resmi benar-benar mengonfirmasi.

## 5. Keamanan
- HTTPS wajib.
- RLS untuk semua tabel tenant/user-scoped.
- Operasi ledger hanya server-side.
- Admin MFA jika tersedia.
- Audit log tidak dapat diedit dari client.
- Rate limiting dan anti-replay.
- Secrets hanya pada environment server.
- Backup, pemulihan, dan prosedur insiden.
- Consent dan retensi data ditetapkan sebelum pilot.

## 6. Observability
Catat event teknis tanpa data sensitif:
- `merchant_registered`
- `lesson_completed`
- `mission_claimed`
- `payment_activity_submitted`
- `payment_activity_verified`
- `reward_redeemed`

Hindari menulis nama lengkap, nomor rekening, nomor telepon, detail transaksi, atau bukti transaksi ke log aplikasi.

## 7. Environment
- `local`: data sintetis.
- `staging`: uji terbatas dan data dummy.
- `production`: data nyata setelah security/privacy review dan persetujuan yang diperlukan.

## 8. Risiko teknis
| Risiko | Mitigasi |
|---|---|
| Klaim transaksi palsu | Verifikasi, batas klaim, audit, dan label status |
| Double points | Unique constraints dan idempotency |
| Kebocoran data | RLS, server authorization, test antar akun |
| Internet lemah | UI ringan, retry aman, draft lokal terbatas |
| Integrasi provider tertunda | Adapter terpisah; MVP tidak bergantung API |
| Penyalahgunaan reward | Limit, approval, ledger, audit |
