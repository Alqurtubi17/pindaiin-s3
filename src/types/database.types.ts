// src/types/database.types.ts
// Definisi tipe data TypeScript terpetakan dari skema PostgreSQL DigiUMKM

export type UserRole = 'merchant' | 'admin' | 'researcher';
export type QrisStatus = 'active' | 'not_active' | 'applied' | 'unknown';
export type MissionClaimStatus = 'started' | 'submitted' | 'approved' | 'rejected';
export type ActivitySource = 'self_reported' | 'admin_verified' | 'provider_verified' | 'simulated';
export type ActivityStatus = 'submitted' | 'verified' | 'rejected';
export type RedemptionStatus = 'requested' | 'approved' | 'fulfilled' | 'rejected' | 'cancelled';

export interface Profile {
  id: string; // UUID references auth.users(id)
  role: UserRole;
  display_name: string;
  phone_e164: string | null;
  created_at: string;
  updated_at: string;
}

export interface Merchant {
  id: string; // UUID
  user_id: string;
  business_name: string;
  business_category: string;
  province: string;
  regency: string;
  district: string | null;
  rural_locality: string | null;
  qris_status: QrisStatus;
  created_at: string;
  updated_at: string;
}

export interface ConsentRecord {
  id: string;
  user_id: string;
  consent_type: string;
  version: string;
  accepted: boolean;
  accepted_at: string | null;
  withdrawn_at: string | null;
}

export interface Lesson {
  id: string;
  title: string;
  content_md: string;
  topic: string;
  xp_reward: number;
  is_published: boolean;
  created_at: string;
}

export interface LessonCompletion {
  id: string;
  lesson_id: string;
  merchant_id: string;
  score: number | null;
  completed_at: string;
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  mission_type: string;
  rules_json: Record<string, unknown>;
  xp_reward: number;
  starts_at: string;
  ends_at: string;
  is_active: boolean;
  created_at: string;
}

export interface MissionClaim {
  id: string;
  mission_id: string;
  merchant_id: string;
  status: MissionClaimStatus;
  submitted_at: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  review_note: string | null;
}

export interface PaymentActivity {
  id: string;
  merchant_id: string;
  activity_date: string; // YYYY-MM-DD
  activity_type: string;
  reported_count: number;
  source: ActivitySource;
  status: ActivityStatus;
  provider_reference: string | null;
  evidence_storage_key: string | null;
  created_at: string;
  verified_by: string | null;
  verified_at: string | null;
}

export interface PointRule {
  id: string;
  event_key: string;
  xp: number;
  max_awards_per_period: number | null;
  is_active: boolean;
}

export interface PointsLedgerEntry {
  id: string;
  merchant_id: string;
  event_key: string;
  source_type: string;
  source_id: string;
  delta: number; // Positive for XP awards, Negative for redemption debits
  idempotency_key: string;
  created_at: string;
  created_by: string | null;
}

export interface Level {
  id: string;
  level_number: number;
  name: string;
  minimum_xp: number;
  maximum_xp: number | null;
}

export interface Badge {
  id: string;
  code: string;
  name: string;
  description: string;
  criteria_json: Record<string, unknown>;
}

export interface MerchantBadge {
  id: string;
  merchant_id: string;
  badge_id: string;
  awarded_at: string;
}

export interface Reward {
  id: string;
  name: string;
  description: string;
  category: string;
  points_cost: number;
  stock: number | null;
  is_active: boolean;
  fulfillment_instructions: string;
}

export interface RewardRedemption {
  id: string;
  merchant_id: string;
  reward_id: string;
  points_cost: number;
  status: RedemptionStatus;
  created_at: string;
  fulfilled_at: string | null;
  idempotency_key: string;
}

export interface AuditLog {
  id: string;
  actor_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  metadata_json: Record<string, unknown>;
  created_at: string;
}

