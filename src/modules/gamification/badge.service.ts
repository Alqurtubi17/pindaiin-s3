// src/modules/gamification/badge.service.ts
// Layanan penentuan dan evaluasi lencana prestasi (Badges)

export interface BadgeDefinition {
  code: string;
  name: string;
  description: string;
  icon: string;
  category: 'activity' | 'learning' | 'level';
}

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  {
    code: 'FIRST_QRIS_CLAIM',
    name: 'Langkah Pertama',
    description: 'Melaporkan transaksi pembayaran QRIS pertama kali di warung.',
    icon: '🚀',
    category: 'activity',
  },
  {
    code: 'SAFETY_CHAMPION',
    name: 'Juara Keamanan',
    description: 'Menyelesaikan modul dan lulus kuis keamanan transaksi QRIS.',
    icon: '🛡️',
    category: 'learning',
  },
  {
    code: 'STREAK_3_DAYS',
    name: 'Pedagang Konsisten',
    description: 'Melaporkan aktivitas transaksi QRIS selama 3 hari berturut-turut.',
    icon: '🔥',
    category: 'activity',
  },
  {
    code: 'LEVEL_2_REACHED',
    name: 'Pedagang Cakap',
    description: 'Berhasil mengumpulkan 100 XP dan naik ke Level 2.',
    icon: '⭐',
    category: 'level',
  },
];

export interface MerchantStats {
  reportedActivityCount: number;
  completedLessonCount: number;
  currentLevelNumber: number;
  streakDays: number;
}

export function evaluateBadges(stats: MerchantStats, currentBadgeCodes: string[]): BadgeDefinition[] {
  const newlyUnlocked: BadgeDefinition[] = [];

  const shouldAward = (code: string, condition: boolean) => {
    if (condition && !currentBadgeCodes.includes(code)) {
      const def = BADGE_DEFINITIONS.find((b) => b.code === code);
      if (def) newlyUnlocked.push(def);
    }
  };

  shouldAward('FIRST_QRIS_CLAIM', stats.reportedActivityCount >= 1);
  shouldAward('SAFETY_CHAMPION', stats.completedLessonCount >= 1);
  shouldAward('STREAK_3_DAYS', stats.streakDays >= 3);
  shouldAward('LEVEL_2_REACHED', stats.currentLevelNumber >= 2);

  return newlyUnlocked;
}

