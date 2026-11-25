// src/modules/ledger/ledger.service.ts
// Layanan penghitungan saldo dan pelacakan transaksi ledger append-only

import { PointsLedgerEntry } from '@/types/database.types';
import { formatDateWIB } from '@/lib/utils/format';

export interface FormattedLedgerEntry {
  id: string;
  dateWib: string;
  title: string;
  type: 'credit' | 'debit';
  deltaFormatted: string;
  sourceType: string;
}

export const SAMPLE_LEDGER_ENTRIES: PointsLedgerEntry[] = [
  {
    id: 'l1',
    merchant_id: 'merchant-1',
    event_key: 'PROFILE_COMPLETED',
    source_type: 'merchants',
    source_id: 'm1',
    delta: 50,
    idempotency_key: 'profile_completed_m1',
    created_at: '2026-11-24T06:00:00Z',
    created_by: null,
  },
  {
    id: 'l2',
    merchant_id: 'merchant-1',
    event_key: 'LESSON_COMPLETED',
    source_type: 'lessons',
    source_id: 'mengenal-qris-aman',
    delta: 50,
    idempotency_key: 'lesson_completed_mengenal-qris-aman',
    created_at: '2026-11-24T06:15:00Z',
    created_by: null,
  },
  {
    id: 'l3',
    merchant_id: 'merchant-1',
    event_key: 'QRIS_ACTIVITY_SUBMITTED',
    source_type: 'payment_activities',
    source_id: 'pa1',
    delta: 20,
    idempotency_key: 'qris_activity_pa1',
    created_at: '2026-11-24T06:30:00Z',
    created_by: null,
  },
  {
    id: 'l4',
    merchant_id: 'merchant-1',
    event_key: 'reward_redemption',
    source_type: 'reward_redemptions',
    source_id: 'rr1',
    delta: -40,
    idempotency_key: 'ledger_redemption_rr1',
    created_at: '2026-11-24T06:45:00Z',
    created_by: null,
  },
];

export const STORAGE_KEY_LEDGER_ENTRIES = 'digiumkm_ledger_entries';
export const STORAGE_KEY_CLAIMED_MISSIONS = 'digiumkm_claimed_missions';
export const STORAGE_KEY_COMPLETED_LESSONS = 'digiumkm_completed_lessons';

export function getStoredLedgerEntries(merchantId = 'merchant-demo'): PointsLedgerEntry[] {
  if (typeof window === 'undefined') return [...SAMPLE_LEDGER_ENTRIES];
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY_LEDGER_ENTRIES}_${merchantId}`);
    if (raw) {
      return JSON.parse(raw);
    }
    localStorage.setItem(`${STORAGE_KEY_LEDGER_ENTRIES}_${merchantId}`, JSON.stringify(SAMPLE_LEDGER_ENTRIES));
    return [...SAMPLE_LEDGER_ENTRIES];
  } catch {
    return [...SAMPLE_LEDGER_ENTRIES];
  }
}

export function saveStoredLedgerEntry(entry: PointsLedgerEntry, merchantId = 'merchant-demo'): void {
  if (typeof window === 'undefined') return;
  try {
    const entries = getStoredLedgerEntries(merchantId);
    if (!entries.some((e: PointsLedgerEntry) => e.idempotency_key === entry.idempotency_key)) {
      entries.push(entry);
      localStorage.setItem(`${STORAGE_KEY_LEDGER_ENTRIES}_${merchantId}`, JSON.stringify(entries));
      window.dispatchEvent(new Event('digiumkm_ledger_updated'));
    }
  } catch (e) {
    console.error('Failed to save ledger entry:', e);
  }
}

export function getStoredClaimedMissions(merchantId = 'merchant-demo'): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY_CLAIMED_MISSIONS}_${merchantId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveStoredClaimedMission(
  missionId: string,
  xpReward: number,
  missionTitle: string,
  merchantId = 'merchant-demo'
): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getStoredClaimedMissions(merchantId);
    if (!current.includes(missionId)) {
      current.push(missionId);
      localStorage.setItem(`${STORAGE_KEY_CLAIMED_MISSIONS}_${merchantId}`, JSON.stringify(current));
    }

    const newEntry: PointsLedgerEntry = {
      id: `l-mission-${missionId}-${Date.now()}`,
      merchant_id: merchantId,
      event_key: 'MISSION_CLAIMED',
      source_type: 'missions',
      source_id: missionId,
      delta: xpReward,
      idempotency_key: `mission_claim_${merchantId}_${missionId}`,
      created_at: new Date().toISOString(),
      created_by: null,
      customTitle: `Klaim Misi: ${missionTitle}`,
    } as any;

    saveStoredLedgerEntry(newEntry, merchantId);
  } catch (e) {
    console.error('Failed to save claimed mission:', e);
  }
}

export function getStoredCompletedLessons(merchantId = 'merchant-demo'): string[] {
  if (typeof window === 'undefined') return ['mengenal-qris-aman'];
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY_COMPLETED_LESSONS}_${merchantId}`);
    if (raw) return JSON.parse(raw);
    const initial = ['mengenal-qris-aman'];
    localStorage.setItem(`${STORAGE_KEY_COMPLETED_LESSONS}_${merchantId}`, JSON.stringify(initial));
    return initial;
  } catch {
    return ['mengenal-qris-aman'];
  }
}

export function recordLessonCompleted(
  lessonId: string,
  lessonTitle: string,
  xpReward: number,
  merchantId = 'merchant-demo'
): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getStoredCompletedLessons(merchantId);
    if (!current.includes(lessonId)) {
      current.push(lessonId);
      localStorage.setItem(`${STORAGE_KEY_COMPLETED_LESSONS}_${merchantId}`, JSON.stringify(current));
    }

    const newEntry: PointsLedgerEntry = {
      id: `l-lesson-${lessonId}-${Date.now()}`,
      merchant_id: merchantId,
      event_key: 'LESSON_COMPLETED',
      source_type: 'lessons',
      source_id: lessonId,
      delta: xpReward,
      idempotency_key: `lesson_completed_${merchantId}_${lessonId}`,
      created_at: new Date().toISOString(),
      created_by: null,
      customTitle: `Menyelesaikan Modul: ${lessonTitle}`,
    } as any;

    saveStoredLedgerEntry(newEntry, merchantId);
  } catch (e) {
    console.error('Failed to record lesson completion:', e);
  }
}

export function recordRewardRedeemed(
  rewardId: string,
  rewardTitle: string,
  pointsCost: number,
  merchantId = 'merchant-demo'
): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const entries = getStoredLedgerEntries(merchantId);
    const summary = computeLedgerSummary(entries);
    if (summary.currentBalance < pointsCost) {
      return false;
    }

    const newEntry: PointsLedgerEntry = {
      id: `l-reward-${rewardId}-${Date.now()}`,
      merchant_id: merchantId,
      event_key: 'reward_redemption',
      source_type: 'reward_redemptions',
      source_id: rewardId,
      delta: -Math.abs(pointsCost),
      idempotency_key: `reward_redemption_${merchantId}_${rewardId}_${Date.now()}`,
      created_at: new Date().toISOString(),
      created_by: null,
      customTitle: `Penukaran Hadiah: ${rewardTitle}`,
    } as any;

    saveStoredLedgerEntry(newEntry, merchantId);
    return true;
  } catch (e) {
    console.error('Failed to record reward redemption:', e);
    return false;
  }
}

export function computeLedgerSummary(entries: PointsLedgerEntry[]): {
  totalXp: number;
  currentBalance: number;
  formattedEntries: FormattedLedgerEntry[];
} {
  let totalXp = 0;
  let currentBalance = 0;

  const formattedEntries: FormattedLedgerEntry[] = entries.map((entry) => {
    if (entry.delta > 0) {
      totalXp += entry.delta;
    }
    currentBalance += entry.delta;

    let title = ((entry as unknown) as Record<string, unknown>).customTitle as string || 'Penyesuaian Poin';
    if (entry.event_key === 'PROFILE_COMPLETED') title = 'Bonus Profil Usaha Selesai';
    else if (entry.event_key === 'LESSON_COMPLETED') title = 'Menyelesaikan Modul Belajar';
    else if (entry.event_key === 'QRIS_ACTIVITY_SUBMITTED') title = 'Laporan Transaksi QRIS';
    else if (entry.event_key === 'reward_redemption') title = 'Penukaran Hadiah';
    else if (entry.event_key === 'MISSION_CLAIMED') title = ((entry as unknown) as Record<string, unknown>).customTitle as string || 'Klaim Misi Selesai';

    return {
      id: entry.id,
      dateWib: formatDateWIB(entry.created_at),
      title,
      type: entry.delta > 0 ? 'credit' : 'debit',
      deltaFormatted: entry.delta > 0 ? `+${entry.delta} XP` : `${entry.delta} Poin`,
      sourceType: entry.source_type,
    };
  });

  return {
    totalXp,
    currentBalance,
    formattedEntries: formattedEntries.reverse(), // Tampilkan yang terbaru di atas
  };
}

