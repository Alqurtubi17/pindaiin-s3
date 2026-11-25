// src/components/gamification/xp-progress-card.tsx
import React from 'react';
import { Award, Coins } from 'lucide-react';
import { LevelProgress } from '@/modules/gamification/level-calculator';

interface XpProgressCardProps {
  progress: LevelProgress;
  goldPoints: number;
}

export function XpProgressCard({ progress, goldPoints }: XpProgressCardProps) {
  const { currentLevel, nextLevel, currentXp, progressPercent, xpToNextLevel } = progress;

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-sky-700 via-sky-600 to-sky-800 text-white rounded-2xl p-5 shadow-md shadow-sky-900/10 space-y-4">
      {/* Background Decorative Element */}
      <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/5 rounded-full blur-xl pointer-events-none" />

      {/* Header Level & Saldo Poin Emas */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/15 text-xs font-semibold text-sky-100 backdrop-blur-xs">
            <Award className="w-3.5 h-3.5 text-amber-300" />
            <span>Level {currentLevel.levelNumber}</span>
          </div>
          <h3 className="text-xl font-extrabold tracking-tight text-white">
            {currentLevel.name}
          </h3>
        </div>

        {/* Saldo Poin Hadiah */}
        <div className="bg-amber-400 text-slate-950 px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-sm font-bold text-sm">
          <Coins className="w-4 h-4 text-slate-950" />
          <span>{goldPoints} Poin</span>
        </div>
      </div>

      {/* Bar Progress XP */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs text-sky-100 font-medium">
          <span>{currentXp} Total XP</span>
          {nextLevel ? (
            <span>Kurang {xpToNextLevel} XP ke Lv {nextLevel.levelNumber}</span>
          ) : (
            <span className="text-amber-300 font-bold">Level Maksimal!</span>
          )}
        </div>
        <div className="w-full h-3 rounded-full bg-black/20 overflow-hidden p-0.5">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-300 transition-all duration-500 shadow-xs"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
}

