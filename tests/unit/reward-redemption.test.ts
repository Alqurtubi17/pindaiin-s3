import { describe, it, expect } from 'vitest';
import { validateAndRedeemReward, SAMPLE_REWARDS } from '@/modules/rewards/reward.service';
import { evaluateBadges } from '@/modules/gamification/badge.service';

describe('Reward Catalogue & Atomic Redemption Service', () => {
  const pulsaReward = SAMPLE_REWARDS[0]; // Cost: 100, Stock: 50
  const outOfStockReward = SAMPLE_REWARDS[3]; // Stock: 0

  it('berhasil menukarkan reward saat saldo mencukupi dan stok ada', () => {
    const res = validateAndRedeemReward(pulsaReward, 'merchant-123', 250);
    expect(res.success).toBe(true);
    expect(res.newBalance).toBe(150); // 250 - 100
    expect(res.newStock).toBe(49); // 50 - 1
    expect(res.idempotencyKey).toContain('redemption_merchant-123_');
  });

  it('menolak penukaran jika saldo poin tidak cukup', () => {
    const res = validateAndRedeemReward(pulsaReward, 'merchant-123', 80);
    expect(res.success).toBe(false);
    expect(res.message).toContain('belum mencukupi');
  });

  it('menolak penukaran jika stok hadiah telah habis', () => {
    const res = validateAndRedeemReward(outOfStockReward, 'merchant-123', 500);
    expect(res.success).toBe(false);
    expect(res.message).toContain('stok hadiah ini telah habis');
  });

  it('menolak penukaran jika reward tidak aktif', () => {
    const inactive = { ...pulsaReward, is_active: false };
    const res = validateAndRedeemReward(inactive, 'merchant-123', 500);
    expect(res.success).toBe(false);
    expect(res.message).toContain('tidak aktif');
  });
});

describe('Badge Evaluation System', () => {
  it('memberikan badge Langkah Pertama setelah 1 transaksi dilaporkan', () => {
    const stats = {
      reportedActivityCount: 1,
      completedLessonCount: 0,
      currentLevelNumber: 1,
      streakDays: 1,
    };
    const newBadges = evaluateBadges(stats, []);
    expect(newBadges.map((b) => b.code)).toContain('FIRST_QRIS_CLAIM');
    expect(newBadges.length).toBe(1);
  });

  it('tidak memberikan badge duplikat jika sudah pernah diraih', () => {
    const stats = {
      reportedActivityCount: 2,
      completedLessonCount: 0,
      currentLevelNumber: 1,
      streakDays: 1,
    };
    const newBadges = evaluateBadges(stats, ['FIRST_QRIS_CLAIM']);
    expect(newBadges.length).toBe(0);
  });

  it('memberikan beberapa badge sekaligus jika syarat terpenuhi', () => {
    const stats = {
      reportedActivityCount: 3,
      completedLessonCount: 2,
      currentLevelNumber: 2,
      streakDays: 3,
    };
    const newBadges = evaluateBadges(stats, []);
    const codes = newBadges.map((b) => b.code);
    expect(codes).toContain('FIRST_QRIS_CLAIM');
    expect(codes).toContain('SAFETY_CHAMPION');
    expect(codes).toContain('STREAK_3_DAYS');
    expect(codes).toContain('LEVEL_2_REACHED');
    expect(newBadges.length).toBe(4);
  });
});

