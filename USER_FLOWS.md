# User Flows — DigiUMKM

## 1. Merchant onboarding
```text
Landing page
  -> Register / Login
  -> Read privacy notice and consent
  -> Create merchant profile
  -> Select QRIS status (already uses / not yet / unsure)
  -> Short digital readiness check
  -> Dashboard
```

## 2. Learning flow
```text
Dashboard
  -> Learning Center
  -> Select QRIS/security lesson
  -> Read short lesson
  -> Complete quiz
  -> Pass threshold?
       -> Yes: mark lesson complete + award configured XP
       -> No: show explanation + retry
  -> Update progress
```

## 3. Mission flow
```text
Dashboard
  -> Mission list
  -> View mission rules and evidence requirements
  -> Start mission
  -> Perform activity
  -> Submit completion
  -> Server checks eligibility and duplicate claim
  -> If transaction-related: pending admin/provider verification
  -> If verified: award XP once
  -> Update level/badge
```

## 4. QRIS activity reporting
```text
Payment Activity
  -> Choose activity date and activity type
  -> Enter minimal permitted information
  -> Confirm declaration and consent
  -> Submit
  -> Status = submitted
  -> Admin reviews
       -> Approve: admin_verified + eligible XP
       -> Reject: reason shown; no XP
```

Do not request PIN, OTP, account credentials, full bank statements, or unnecessary customer data. Avoid collecting receipt images unless there is a justified protocol and safe redaction process.

## 5. Reward redemption
```text
Reward Catalogue
  -> Select reward
  -> Check points and availability
  -> Confirm redemption
  -> Server locks balance / checks eligibility
  -> Create redemption + debit ledger atomically
  -> Show redemption code or fulfillment status
  -> Admin/partner fulfills reward
```

## 6. Admin flow
```text
Admin login
  -> Admin dashboard
  -> Review pending activity claims
  -> Check SOP and evidence
  -> Approve / reject with reason
  -> Audit event created
  -> Manage missions, point rules, rewards
  -> Export pseudonymized aggregate report
```

## 7. Research participant flow
```text
Invitation
  -> Participant information sheet
  -> Consent to research
  -> Baseline questionnaire
  -> Random assignment if experimental design used
  -> Use DigiUMKM or comparison learning material
  -> Follow-up measurement
  -> De-identify research dataset
```

## UX principles for rural users
- Bahasa Indonesia sederhana.
- Satu tindakan utama per layar.
- Ikon disertai label teks.
- Ukuran tombol besar.
- Hindari animasi berat.
- Beri feedback yang jelas saat koneksi terputus.
- Jangan menghukum pengguna karena tidak aktif.
- Sediakan bantuan dan cara menghubungi pendamping.
