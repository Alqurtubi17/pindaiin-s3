// src/modules/missions/mission.service.ts
// Layanan mesin misi dan validasi klaim aman dengan idempotency

import { Mission, MissionClaimStatus } from '@/types/database.types';

export interface MissionWithProgress extends Mission {
  status: MissionClaimStatus | 'unclaimed';
  isCompleted: boolean;
  canClaim: boolean;
}

export const SAMPLE_MISSIONS: Mission[] = [
  {
    id: 'm1111111-1111-1111-1111-111111111111',
    title: 'Lapor Transaksi QRIS Pertama',
    description: 'Catat dan laporkan 1 transaksi pembayaran QRIS yang Anda terima di toko.',
    mission_type: 'activity',
    rules_json: { minTransactionCount: 1, requiresVerification: false },
    xp_reward: 50,
    starts_at: '2026-11-01T00:00:00Z',
    ends_at: '2026-12-31T23:59:59Z',
    is_active: true,
    created_at: '2026-11-01T00:00:00Z',
  },
  {
    id: 'm2222222-2222-2222-2222-222222222222',
    title: 'Selesaikan Modul Keamanan Transaksi',
    description: 'Baca materi waspada penipuan dan lulus kuis dengan skor minimal 70%.',
    mission_type: 'learning',
    rules_json: { lessonId: 'waspada-penipuan-qris', minScore: 70 },
    xp_reward: 40,
    starts_at: '2026-11-01T00:00:00Z',
    ends_at: '2026-12-31T23:59:59Z',
    is_active: true,
    created_at: '2026-11-01T00:00:00Z',
  },
  {
    id: 'm3333333-3333-3333-3333-333333333333',
    title: 'Pasang Stiker QRIS di Tempat Kasir',
    description: 'Pastikan kode QRIS terpasang dekat pandangan kasir dan terbebas dari tempelan lain.',
    mission_type: 'setup',
    rules_json: { declarationOnly: true },
    xp_reward: 30,
    starts_at: '2026-11-01T00:00:00Z',
    ends_at: '2026-12-31T23:59:59Z',
    is_active: true,
    created_at: '2026-11-01T00:00:00Z',
  },
  {
    id: 'm4444444-4444-4444-4444-444444444444',
    title: 'Aktifkan Suara Notifikasi Kasir',
    description: 'Pastikan volume & notifikasi suara aplikasi merchant menyala agar uang masuk langsung terdengar.',
    mission_type: 'setup',
    rules_json: { declarationOnly: true },
    xp_reward: 35,
    starts_at: '2026-11-01T00:00:00Z',
    ends_at: '2026-12-31T23:59:59Z',
    is_active: true,
    created_at: '2026-11-01T00:00:00Z',
  },
  {
    id: 'm5555555-5555-5555-5555-555555555555',
    title: 'Rekap 5 Transaksi QRIS Pekan Ini',
    description: 'Catat dan laporkan minimal 5 transaksi pembayaran QRIS toko Anda melalui menu Aktivitas.',
    mission_type: 'activity',
    rules_json: { minTransactionCount: 5, requiresVerification: false },
    xp_reward: 75,
    starts_at: '2026-11-01T00:00:00Z',
    ends_at: '2026-12-31T23:59:59Z',
    is_active: true,
    created_at: '2026-11-01T00:00:00Z',
  },
];

export interface ClaimMissionResult {
  success: boolean;
  message: string;
  xpAwarded?: number;
  idempotencyKey?: string;
}

export {
  STORAGE_KEY_CLAIMED_MISSIONS,
  STORAGE_KEY_LEDGER_ENTRIES,
  getStoredClaimedMissions,
  saveStoredClaimedMission,
  getStoredLedgerEntries,
} from '@/modules/ledger/ledger.service';

export function evaluateMissionClaim(
  mission: Mission,
  merchantId: string,
  existingClaims: string[], // List of claimed mission IDs by this merchant
  prerequisiteMet: boolean
): ClaimMissionResult {
  // 1. Cek apakah misi aktif
  if (!mission.is_active) {
    return {
      success: false,
      message: 'Misi ini sudah berakhir atau tidak aktif.',
    };
  }

  // 2. Cegah klaim ganda (Double-claim prevention)
  if (existingClaims.includes(mission.id)) {
    return {
      success: false,
      message: 'Anda sudah pernah mengklaim hadiah dari misi ini.',
    };
  }

  // 3. Cek pemenuhan syarat misi
  if (!prerequisiteMet) {
    return {
      success: false,
      message: 'Syarat penyelesaian misi belum terpenuhi.',
    };
  }

  // 4. Generate idempotency key unik untuk ledger
  const idempotencyKey = `mission_claim_${merchantId}_${mission.id}`;

  return {
    success: true,
    message: `Selamat! Misi "${mission.title}" selesai dan +${mission.xp_reward} XP telah ditambahkan.`,
    xpAwarded: mission.xp_reward,
    idempotencyKey,
  };
}

