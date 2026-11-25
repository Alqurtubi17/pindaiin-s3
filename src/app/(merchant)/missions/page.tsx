// src/app/(merchant)/missions/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Target,
  CheckCircle2,
  Award,
  History,
  BookOpen,
  QrCode,
  ShieldCheck,
  Sparkles,
  ArrowUpRight,
  ArrowDownLeft,
  Gift,
  ChevronRight,
  Coins,
} from 'lucide-react';
import {
  SAMPLE_MISSIONS,
  evaluateMissionClaim,
  getStoredClaimedMissions,
  saveStoredClaimedMission,
  getStoredLedgerEntries,
} from '@/modules/missions/mission.service';
import { computeLedgerSummary, SAMPLE_LEDGER_ENTRIES } from '@/modules/ledger/ledger.service';
import { PointsLedgerEntry } from '@/types/database.types';
import { Button } from '@/components/ui/button';
import { usePageTitle } from '@/lib/utils/use-page-title';
import { useIsMounted } from '@/lib/utils/use-is-mounted';

function getMissionVisual(missionType: string) {
  switch (missionType) {
    case 'activity':
      return {
        label: 'Transaksi',
        icon: QrCode,
        iconBox: 'bg-sky-50 text-sky-600 border-sky-100',
      };
    case 'learning':
      return {
        label: 'Edukasi',
        icon: BookOpen,
        iconBox: 'bg-indigo-50 text-indigo-600 border-indigo-100',
      };
    case 'setup':
      return {
        label: 'Persiapan Toko',
        icon: ShieldCheck,
        iconBox: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      };
    default:
      return {
        label: 'Tantangan',
        icon: Target,
        iconBox: 'bg-slate-50 text-slate-600 border-slate-200',
      };
  }
}

export default function MissionsPage() {
  usePageTitle('Misi & Tantangan');
  const isMounted = useIsMounted();
  const [activeTab, setActiveTab] = useState<'missions' | 'ledger'>('missions');

  const [claimedMissions, setClaimedMissions] = useState<string[]>([]);
  const [ledgerEntries, setLedgerEntries] = useState<PointsLedgerEntry[]>(SAMPLE_LEDGER_ENTRIES);
  const [alertMsg, setAlertMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [historyFilter, setHistoryFilter] = useState<'all' | 'credit' | 'debit'>('all');

  useEffect(() => {
    const syncData = () => {
      setClaimedMissions(getStoredClaimedMissions());
      const entries = getStoredLedgerEntries();
      if (entries.length > 0) {
        setLedgerEntries(entries);
      }
    };

    syncData();
    window.addEventListener('digiumkm_ledger_updated', syncData);
    window.addEventListener('storage', syncData);

    return () => {
      window.removeEventListener('digiumkm_ledger_updated', syncData);
      window.removeEventListener('storage', syncData);
    };
  }, []);

  const { totalXp, currentBalance, formattedEntries } = computeLedgerSummary(ledgerEntries);

  const completedCount = SAMPLE_MISSIONS.filter((m) => claimedMissions.includes(m.id)).length;
  const progressPercent =
    SAMPLE_MISSIONS.length > 0 ? Math.round((completedCount / SAMPLE_MISSIONS.length) * 100) : 0;
  const remainingXp = SAMPLE_MISSIONS.filter((m) => !claimedMissions.includes(m.id)).reduce(
    (sum, m) => sum + m.xp_reward,
    0
  );

  const handleClaim = (missionId: string) => {
    const mission = SAMPLE_MISSIONS.find((m) => m.id === missionId);
    if (!mission) return;

    const result = evaluateMissionClaim(mission, 'merchant-demo', claimedMissions, true);

    if (result.success) {
      saveStoredClaimedMission(missionId, mission.xp_reward, mission.title);

      setClaimedMissions((prev) => (prev.includes(missionId) ? prev : [...prev, missionId]));
      const updatedEntries = getStoredLedgerEntries();
      if (updatedEntries.length > 0) {
        setLedgerEntries(updatedEntries);
      }
      setAlertMsg({ text: result.message, type: 'success' });
    } else {
      setAlertMsg({ text: result.message, type: 'error' });
    }
  };

  return (
    <div className="space-y-3.5 pb-6">
      {/* Header Tabs */}
      <div className="p-1 bg-slate-200/75 rounded-xl flex">
        <button
          type="button"
          onClick={() => setActiveTab('missions')}
          className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'missions'
              ? 'bg-white text-sky-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Target className="w-3.5 h-3.5" />
          <span>Misi & Tantangan ({SAMPLE_MISSIONS.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('ledger')}
          className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'ledger'
              ? 'bg-white text-sky-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>Riwayat Poin {isMounted ? `(${currentBalance})` : ''}</span>
        </button>
      </div>

      {alertMsg && (
        <div
          className={`p-3 rounded-xl text-xs font-semibold border ${
            alertMsg.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-red-50 text-red-800 border-red-200'
          }`}
        >
          {alertMsg.text}
        </div>
      )}

      {activeTab === 'missions' ? (
        <div className="space-y-3">
          {/* Banner Progres Misi */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 via-teal-600 to-sky-700 p-4 text-white shadow-md shadow-teal-900/10">
            <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/10 blur-xl" />
            <div className="relative space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-50">
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Tantangan Harian Toko</span>
                </div>
                {isMounted && (
                  <span className="text-[11px] font-bold bg-white/15 px-2.5 py-0.5 rounded-full">
                    {completedCount}/{SAMPLE_MISSIONS.length} Selesai ({progressPercent}%)
                  </span>
                )}
              </div>

              <div>
                <h2 className="text-lg font-extrabold tracking-tight leading-snug">
                  Kumpulkan XP & Tukar Hadiah
                </h2>
                <p className="text-xs text-emerald-50/90">
                  Selesaikan misi untuk meraih sisa{' '}
                  <span className="font-bold text-amber-300">
                    +{isMounted ? remainingXp : 0} XP
                  </span>{' '}
                  tambahan.
                </p>
              </div>

              {isMounted && (
                <div className="w-full h-1.5 rounded-full bg-white/20 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-300 to-white rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Daftar 5 Misi */}
          <div className="space-y-2.5">
            {SAMPLE_MISSIONS.map((mission) => {
              const isClaimed = claimedMissions.includes(mission.id);
              const visual = getMissionVisual(mission.mission_type);
              const MissionIcon = visual.icon;

              return (
                <div
                  key={mission.id}
                  className={`rounded-2xl bg-white border p-3.5 transition-all shadow-2xs ${
                    isClaimed
                      ? 'border-emerald-200/90 bg-emerald-50/20'
                      : 'border-slate-200/90 hover:border-sky-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${visual.iconBox}`}
                    >
                      <MissionIcon className="w-5 h-5" />
                    </div>

                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-semibold text-slate-500">
                          {visual.label}
                        </span>
                        <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/80 flex items-center gap-1 shrink-0">
                          <Award className="w-3 h-3" />
                          <span>+{mission.xp_reward} XP</span>
                        </span>
                      </div>

                      <h3 className="font-bold text-sm text-slate-900 leading-snug">
                        {mission.title}
                      </h3>

                      <p className="text-xs text-slate-600 leading-relaxed">
                        {mission.description}
                      </p>

                      <div className="pt-2 border-t border-slate-100">
                        {!isMounted ? (
                          <div className="w-full h-9 rounded-lg bg-slate-100 animate-pulse" />
                        ) : isClaimed ? (
                          <div className="flex items-center justify-between text-xs font-bold text-emerald-700 py-1">
                            <span className="inline-flex items-center gap-1.5">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              <span>Misi Selesai & Poin Masuk</span>
                            </span>
                            <span className="text-[11px] text-emerald-600 font-semibold">
                              +{mission.xp_reward} XP
                            </span>
                          </div>
                        ) : (
                          <Button
                            variant="primary"
                            size="sm"
                            className="w-full text-xs font-bold min-h-[40px] rounded-xl"
                            onClick={() => handleClaim(mission.id)}
                          >
                            Klaim Hadiah (+{mission.xp_reward} XP)
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="space-y-3.5">
          {/* Kartu Ringkasan Poin Modern */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-sky-900 p-4 text-white shadow-md">
            <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-amber-400/15 blur-xl" />
            <div className="relative space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="text-[11px] font-medium text-slate-300 flex items-center gap-1.5">
                    <Coins className="w-3.5 h-3.5 text-amber-300" />
                    Saldo Poin Tersedia
                  </span>
                  <p className="text-2xl font-black tracking-tight text-white">
                    {isMounted ? `${currentBalance} Poin` : '-'}
                  </p>
                </div>
                <div className="text-right space-y-0.5">
                  <span className="text-[11px] font-medium text-slate-300">Total XP</span>
                  <p className="text-base font-extrabold text-sky-300">
                    {isMounted ? `${totalXp} XP` : '-'}
                  </p>
                </div>
              </div>

              <div className="pt-2.5 border-t border-white/10 flex items-center justify-between gap-2">
                <span className="text-[11px] text-slate-300">
                  Tukarkan poin dengan perlengkapan usaha
                </span>
                <Link
                  href="/rewards"
                  className="inline-flex items-center gap-1 rounded-lg bg-amber-300 hover:bg-amber-200 text-amber-950 px-2.5 py-1.5 text-[11px] font-bold transition-colors shrink-0"
                >
                  <Gift className="w-3.5 h-3.5" />
                  <span>Tukar Hadiah</span>
                  <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>

          {/* Filter & Daftar Riwayat */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between gap-2 px-0.5">
              <h3 className="text-sm font-bold text-slate-900">Riwayat Aktivitas Poin</h3>
              <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-[11px] font-semibold">
                <button
                  type="button"
                  onClick={() => setHistoryFilter('all')}
                  className={`px-2 py-1 rounded-md transition-colors ${
                    historyFilter === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
                  }`}
                >
                  Semua
                </button>
                <button
                  type="button"
                  onClick={() => setHistoryFilter('credit')}
                  className={`px-2 py-1 rounded-md transition-colors ${
                    historyFilter === 'credit' ? 'bg-white text-emerald-700 shadow-2xs' : 'text-slate-500'
                  }`}
                >
                  Masuk
                </button>
                <button
                  type="button"
                  onClick={() => setHistoryFilter('debit')}
                  className={`px-2 py-1 rounded-md transition-colors ${
                    historyFilter === 'debit' ? 'bg-white text-rose-700 shadow-2xs' : 'text-slate-500'
                  }`}
                >
                  Ditukar
                </button>
              </div>
            </div>

            {(() => {
              const visibleEntries = formattedEntries.filter((item) =>
                historyFilter === 'all' ? true : item.type === historyFilter
              );

              if (visibleEntries.length === 0) {
                return (
                  <div className="rounded-2xl bg-white border border-slate-200/80 p-6 text-center space-y-1">
                    <History className="w-6 h-6 text-slate-300 mx-auto" />
                    <p className="text-xs font-bold text-slate-700">Belum ada catatan</p>
                    <p className="text-[11px] text-slate-500">
                      Riwayat poin untuk kategori ini akan muncul di sini.
                    </p>
                  </div>
                );
              }

              return (
                <div className="rounded-2xl bg-white border border-slate-200/90 divide-y divide-slate-100 overflow-hidden shadow-2xs">
                  {visibleEntries.map((item) => (
                    <div key={item.id} className="p-3.5 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                            item.type === 'credit'
                              ? 'bg-emerald-50 text-emerald-600'
                              : 'bg-rose-50 text-rose-600'
                          }`}
                        >
                          {item.type === 'credit' ? (
                            <ArrowDownLeft className="w-4 h-4" />
                          ) : (
                            <ArrowUpRight className="w-4 h-4" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-slate-900 truncate">{item.title}</h4>
                          <p className="text-[11px] text-slate-500">{item.dateWib}</p>
                        </div>
                      </div>
                      <span
                        className={`text-xs font-extrabold shrink-0 ${
                          item.type === 'credit' ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {item.deltaFormatted}
                      </span>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
