// src/modules/gamification/level-calculator.ts
// Logika penentuan level dan progres XP berbasis konfigurasi (bukan hardcoded)

export interface LevelConfig {
  levelNumber: number;
  name: string;
  minimumXp: number;
  maximumXp: number | null;
}

export const DEFAULT_LEVELS: LevelConfig[] = [
  { levelNumber: 1, name: 'Pemula QRIS', minimumXp: 0, maximumXp: 99 },
  { levelNumber: 2, name: 'Pedagang Cakap', minimumXp: 100, maximumXp: 249 },
  { levelNumber: 3, name: 'Pedagang Terampil', minimumXp: 250, maximumXp: 499 },
  { levelNumber: 4, name: 'Jawara QRIS', minimumXp: 500, maximumXp: null },
];

export interface LevelProgress {
  currentLevel: LevelConfig;
  nextLevel: LevelConfig | null;
  currentXp: number;
  progressPercent: number;
  xpToNextLevel: number | null;
}

export function calculateLevelProgress(totalXp: number, levels: LevelConfig[] = DEFAULT_LEVELS): LevelProgress {
  const sorted = [...levels].sort((a, b) => a.levelNumber - b.levelNumber);
  
  // Cari level tertinggi dengan minimumXp <= totalXp
  let currentLevel = sorted[0];
  let nextLevel: LevelConfig | null = null;

  for (let i = 0; i < sorted.length; i++) {
    if (totalXp >= sorted[i].minimumXp) {
      currentLevel = sorted[i];
      nextLevel = sorted[i + 1] || null;
    } else {
      break;
    }
  }

  if (!nextLevel) {
    // Level maksimal tercapai
    return {
      currentLevel,
      nextLevel: null,
      currentXp: totalXp,
      progressPercent: 100,
      xpToNextLevel: null,
    };
  }

  const range = nextLevel.minimumXp - currentLevel.minimumXp;
  const gained = totalXp - currentLevel.minimumXp;
  const percent = Math.min(100, Math.max(0, Math.round((gained / range) * 100)));
  const xpNeeded = nextLevel.minimumXp - totalXp;

  return {
    currentLevel,
    nextLevel,
    currentXp: totalXp,
    progressPercent: percent,
    xpToNextLevel: xpNeeded,
  };
}

