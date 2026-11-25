// src/app/(merchant)/dashboard/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { PlusCircle, BookOpen, Target, ChevronRight, ShieldCheck, Clock, CheckCircle2 } from 'lucide-react';
import { XpProgressCard } from '@/components/gamification/xp-progress-card';
import { calculateLevelProgress } from '@/modules/gamification/level-calculator';
import {
  computeLedgerSummary,
  getStoredLedgerEntries,
  getStoredClaimedMissions,
  SAMPLE_LEDGER_ENTRIES,
} from '@/modules/ledger/ledger.service';
import { SAMPLE_MISSIONS } from '@/modules/missions/mission.service';
import { PointsLedgerEntry } from '@/types/database.types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { usePageTitle } from '@/lib/utils/use-page-title';
import { useIsMounted } from '@/lib/utils/use-is-mounted';

export default function DashboardPage() {
  usePageTitle('Dashboard');
  const isMounted = useIsMounted();

  const [ledgerEntries, setLedgerEntries] = useState<PointsLedgerEntry[]>(SAMPLE_LEDGER_ENTRIES);
  const [claimedMissions, setClaimedMissions] = useState<string[]>([]);

  // Sinkronisasi data real-time saat terjadi klaim atau perubahan di tab/halaman lain
  useEffect(() => {
    const syncData = () => {
      const entries = getStoredLedgerEntries();
      if (entries.length > 0) setLedgerEntries(entries);
      setClaimedMissions(getStoredClaimedMissions());
    };

    syncData();
    window.addEventListener('digiumkm_ledger_updated', syncData);
    window.addEventListener('storage', syncData);

    return () => {
      window.removeEventListener('digiumkm_ledger_updated', syncData);
      window.removeEventListener('storage', syncData);
    };
  }, []);

  const { totalXp, currentBalance } = computeLedgerSummary(ledgerEntries);
  const progress = calculateLevelProgress(totalXp);

  // Cari misi aktif yang belum selesai atau tampilkan misi pertama
  const activeMission =
    SAMPLE_MISSIONS.find((m) => !claimedMissions.includes(m.id)) || SAMPLE_MISSIONS[0];
  const isMissionClaimed = claimedMissions.includes(activeMission.id);

  return (
    <div className="space-y-4">
      {/* 1. Kartu Level & Progres XP (Terhubung langsung ke ledger) */}
      <XpProgressCard progress={progress} goldPoints={currentBalance} />

      {/* 2. Tombol Aksi Cepat: Laporkan Transaksi QRIS */}
      <Card className="border-sky-200 bg-sky-50/70 p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-0.5">
            <h4 className="text-sm font-bold text-slate-900">Ada Transaksi QRIS Hari Ini?</h4>
            <p className="text-xs text-slate-600">Catat jumlah transaksi untuk bonus +20 XP.</p>
          </div>
          <Link href="/activity">
            <Button size="sm" variant="primary" className="whitespace-nowrap flex items-center gap-1.5">
              <PlusCircle className="w-4 h-4" />
              <span>Lapor Sekarang</span>
            </Button>
          </Link>
        </div>
      </Card>

      {/* 3. Misi Harian yang Sedang Berjalan */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
            <Target className="w-4 h-4 text-sky-600" />
            <span>Misi Terpilih</span>
          </h3>
          <Link href="/missions" className="text-xs font-semibold text-sky-600 flex items-center gap-0.5">
            <span>Lihat Semua</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <Card className="p-3.5 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h4 className="font-bold text-sm text-slate-900">{activeMission.title}</h4>
              <p className="text-xs text-slate-600 mt-0.5">{activeMission.description}</p>
            </div>
            <span className="text-xs font-bold text-amber-600 whitespace-nowrap bg-amber-50 px-2 py-1 rounded-lg border border-amber-200">
              +{activeMission.xp_reward} XP
            </span>
          </div>

          <div className="pt-2 border-t border-slate-100 min-h-[40px]">
            {!isMounted ? (
              <div className="w-full h-8 rounded-lg bg-slate-100 animate-pulse" />
            ) : isMissionClaimed ? (
              <div className="flex items-center justify-between text-xs font-bold text-emerald-600">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  Misi Selesai & Diklaim
                </span>
                <Link href="/missions" className="text-sky-600 underline font-semibold">
                  Lihat Misi Lain
                </Link>
              </div>
            ) : (
              <Link href="/missions">
                <Button variant="outline" size="sm" className="w-full text-xs">
                  Klaim di Halaman Misi (+{activeMission.xp_reward} XP)
                </Button>
              </Link>
            )}
          </div>
        </Card>
      </div>

      {/* 4. Rekomendasi Modul Belajar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-sky-600" />
            <span>Belajar QRIS & Keamanan</span>
          </h3>
          <Link href="/learning" className="text-xs font-semibold text-sky-600 flex items-center gap-0.5">
            <span>Semua Materi</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <Link href="/learning/waspada-penipuan-qris" className="block">
          <Card className="p-3.5 hover:border-sky-300 transition-colors">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-sky-100 text-sky-700">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-semibold text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> 2 Menit
                  </span>
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                    +50 XP
                  </span>
                </div>
                <h4 className="font-bold text-sm text-slate-900 leading-snug">
                  Waspada Penipuan & Cara Cek Notifikasi Masuk
                </h4>
                <p className="text-xs text-slate-500 line-clamp-1">
                  Pelajari cara membedakan bukti transfer asli dan editan.
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400 self-center" />
            </div>
          </Card>
        </Link>
      </div>
    </div>
  );
}

