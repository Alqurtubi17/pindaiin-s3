# Database Schema — DigiUMKM (PostgreSQL)

Rancangan awal. Terapkan UUID, foreign key, indeks, RLS, dan migration. Kolom sensitif harus diminimalkan.

## 1. Tables

### `profiles`
- `id uuid primary key references auth.users(id)`
- `role text check (role in ('merchant','admin','researcher'))`
- `display_name text`
- `phone_e164 text null` — simpan hanya jika dibutuhkan dan dengan dasar pemrosesan yang jelas
- `created_at timestamptz`
- `updated_at timestamptz`

### `merchants`
- `id uuid primary key`
- `user_id uuid unique references profiles(id)`
- `business_name text`
- `business_category text`
- `province text`
- `regency text`
- `district text null`
- `rural_locality text null`
- `qris_status text check (qris_status in ('active','not_active','applied','unknown'))`
- `created_at timestamptz`
- `updated_at timestamptz`

### `consent_records`
- `id uuid primary key`
- `user_id uuid references profiles(id)`
- `consent_type text`
- `version text`
- `accepted boolean`
- `accepted_at timestamptz null`
- `withdrawn_at timestamptz null`

### `lessons`
- `id uuid primary key`
- `title text`
- `content_md text`
- `topic text`
- `is_published boolean`
- `created_at timestamptz`

### `lesson_completions`
- `id uuid primary key`
- `lesson_id uuid references lessons(id)`
- `merchant_id uuid references merchants(id)`
- `score integer null`
- `completed_at timestamptz`
- unique (`lesson_id`,`merchant_id`)

### `missions`
- `id uuid primary key`
- `title text`
- `description text`
- `mission_type text`
- `rules_json jsonb`
- `xp_reward integer check (xp_reward >= 0)`
- `starts_at timestamptz`
- `ends_at timestamptz`
- `is_active boolean`
- `created_at timestamptz`

### `mission_claims`
- `id uuid primary key`
- `mission_id uuid references missions(id)`
- `merchant_id uuid references merchants(id)`
- `status text check (status in ('started','submitted','approved','rejected'))`
- `submitted_at timestamptz null`
- `reviewed_by uuid null references profiles(id)`
- `reviewed_at timestamptz null`
- `review_note text null`
- unique constraint sesuai aturan klaim misi (misalnya mission + merchant + periode)

### `payment_activities`
- `id uuid primary key`
- `merchant_id uuid references merchants(id)`
- `activity_date date`
- `activity_type text`
- `reported_count integer null`
- `source text check (source in ('self_reported','admin_verified','provider_verified','simulated'))`
- `status text check (status in ('submitted','verified','rejected'))`
- `provider_reference text null`
- `evidence_storage_key text null` — opsional; hindari bukti visual jika tidak perlu
- `created_at timestamptz`
- `verified_by uuid null references profiles(id)`
- `verified_at timestamptz null`

### `point_rules`
- `id uuid primary key`
- `event_key text unique`
- `xp integer check (xp >= 0)`
- `max_awards_per_period integer null`
- `is_active boolean`

### `points_ledger`
- `id uuid primary key`
- `merchant_id uuid references merchants(id)`
- `event_key text`
- `source_type text`
- `source_id uuid`
- `delta integer`
- `idempotency_key text unique`
- `created_at timestamptz`
- `created_by uuid null references profiles(id)`

Ledger bersifat append-only untuk aplikasi. Koreksi dilakukan melalui entri kompensasi, bukan mengubah baris lama.

### `levels`
- `id uuid primary key`
- `level_number integer unique`
- `name text`
- `minimum_xp integer`
- `maximum_xp integer null`

### `badges`
- `id uuid primary key`
- `code text unique`
- `name text`
- `description text`
- `criteria_json jsonb`

### `merchant_badges`
- `id uuid primary key`
- `merchant_id uuid references merchants(id)`
- `badge_id uuid references badges(id)`
- `awarded_at timestamptz`
- unique (`merchant_id`,`badge_id`)

### `rewards`
- `id uuid primary key`
- `name text`
- `description text`
- `category text`
- `points_cost integer check (points_cost >= 0)`
- `stock integer null`
- `is_active boolean`
- `fulfillment_instructions text`

### `reward_redemptions`
- `id uuid primary key`
- `merchant_id uuid references merchants(id)`
- `reward_id uuid references rewards(id)`
- `points_cost integer`
- `status text check (status in ('requested','approved','fulfilled','rejected','cancelled'))`
- `created_at timestamptz`
- `fulfilled_at timestamptz null`
- `idempotency_key text unique`

### `audit_logs`
- `id uuid primary key`
- `actor_id uuid references profiles(id)`
- `action text`
- `entity_type text`
- `entity_id uuid`
- `metadata_json jsonb`
- `created_at timestamptz`

## 2. Derived values
- Total XP = sum of `points_ledger.delta` per merchant.
- Current level = highest level whose `minimum_xp` is <= total XP.
- Reward balance = total XP less valid redemption debits (or represent redemptions as negative ledger entries).
- Do not store a client-editable XP balance as the source of truth.

## 3. Important constraints
- Award points only via server-side function.
- Unique idempotency key prevents duplicate awards.
- Redemption and point debit must be atomic.
- Use database constraints for valid status values.
- RLS: merchant can access only their own records; admin actions require server-verified admin role.
- Research export must exclude direct identifiers and free-text fields that may identify a person.
