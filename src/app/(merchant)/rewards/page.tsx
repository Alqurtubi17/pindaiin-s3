// src/app/(merchant)/rewards/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Gift,
  Coins,
  CheckCircle2,
  AlertCircle,
  ShoppingBag,
  Ticket,
  Package,
  ChevronRight,
  History,
} from 'lucide-react';
import { SAMPLE_REWARDS, validateAndRedeemReward } from '@/modules/rewards/reward.service';
import {
  computeLedgerSummary,
  getStoredLedgerEntries,
  recordRewardRedeemed,
  SAMPLE_LEDGER_ENTRIES,
} from '@/modules/ledger/ledger.service';
import { PointsLedgerEntry, Reward } from '@/types/database.types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { usePageTitle } from '@/lib/utils/use-page-title';
import { useIsMounted } from '@/lib/utils/use-is-mounted';

export default function RewardsPage() {
  usePageTitle('Katalog Hadiah');
  const isMounted = useIsMounted();

  // Sinkronisasi saldo riil langsung dari mutasi ledger
  const [ledgerEntries, setLedgerEntries] = useState<PointsLedgerEntry[]>(SAMPLE_LEDGER_ENTRIES);

  const [rewards, setRewards] = useState<Reward[]>(SAMPLE_REWARDS);
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [notification, setNotification] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [activeCategory, setActiveCategory] = useState<'all' | 'voucher' | 'merchandise'>('all');

  useEffect(() => {
    const syncData = () => {
      const entries = getStoredLedgerEntries();
      if (entries.length > 0) setLedgerEntries(entries);
    };

    syncData();
    window.addEventListener('digiumkm_ledger_updated', syncData);
    window.addEventListener('storage', syncData);

    return () => {
      window.removeEventListener('digiumkm_ledger_updated', syncData);
      window.removeEventListener('storage', syncData);
    };
  }, []);

  const { currentBalance: balance } = computeLedgerSummary(ledgerEntries);

  const filteredRewards = rewards.filter((r) => {
    if (activeCategory === 'all') return true;
    return r.category === activeCategory;
  });

  const handleConfirmRedeem = () => {
    if (!selectedReward) return;

    if (balance < selectedReward.points_cost) {
      setNotification({
        text: 'Saldo poin emas tidak mencukupi untuk menukarkan hadiah ini.',
        type: 'error',
      });
      setSelectedReward(null);
      return;
    }

    const success = recordRewardRedeemed(selectedReward.id, selectedReward.name, selectedReward.points_cost);

    if (success) {
      // Perbarui stok lokal hadiah
      setRewards((prev) =>
        prev.map((r) =>
          r.id === selectedReward.id ? { ...r, stock: r.stock !== null ? Math.max(0, r.stock - 1) : null } : r
        )
      );
      setNotification({
        text: `Selamat! Hadiah "${selectedReward.name}" berhasil ditukarkan dan dicatat ke riwayat poin.`,
        type: 'success',
      });
      setSelectedReward(null);
    } else {
      setNotification({ text: 'Gagal memproses penukaran hadiah.', type: 'error' });
      setSelectedReward(null);
    }
  };

  const displayBalance = isMounted ? balance : computeLedgerSummary(SAMPLE_LEDGER_ENTRIES).currentBalance;

  return (
    <>
    <div className="space-y-4 pb-6">
      {/* Header Saldo Hadiah Modern */}
      <div className="relative overflow-hidden p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-amber-900 text-white space-y-3 shadow-md">
        <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-amber-400/15 blur-xl" />
        <div className="relative flex items-center justify-between gap-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-300">
            <Gift className="w-4 h-4" />
            <span>Katalog Hadiah UMKM</span>
          </div>
          <Link
            href="/missions"
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-200 hover:text-white bg-white/10 px-2.5 py-1 rounded-full transition-colors"
          >
            <History className="w-3 h-3" />
            <span>Riwayat Poin</span>
          </Link>
        </div>

        <div className="relative space-y-0.5">
          <span className="text-xs text-slate-300 font-medium">Saldo Poin Tersedia</span>
          <div className="flex items-baseline gap-2">
            <h1 className="text-3xl font-black tracking-tight text-white">{displayBalance}</h1>
            <span className="font-bold text-sm text-amber-300">Poin</span>
          </div>
        </div>

        <p className="relative text-xs text-slate-300 leading-relaxed">
          Tukarkan poin hasil misi dan laporan QRIS Anda dengan perlengkapan usaha atau voucher pulsa.
        </p>
      </div>

      {notification && (
        <div
          className={`p-3.5 rounded-xl text-xs font-semibold border flex items-center gap-2 ${
            notification.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-red-50 text-red-800 border-red-200'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          )}
          <span>{notification.text}</span>
        </div>
      )}

      {/* Filter Kategori */}
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => setActiveCategory('all')}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
            activeCategory === 'all'
              ? 'bg-sky-600 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:border-sky-300'
          }`}
        >
          Semua ({rewards.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveCategory('voucher')}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
            activeCategory === 'voucher'
              ? 'bg-sky-600 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:border-sky-300'
          }`}
        >
          Pulsa & Voucher
        </button>
        <button
          type="button"
          onClick={() => setActiveCategory('merchandise')}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
            activeCategory === 'merchandise'
              ? 'bg-sky-600 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:border-sky-300'
          }`}
        >
          Merchandise
        </button>
      </div>

      {/* Daftar Kartu Hadiah */}
      <div className="space-y-2.5">
        {filteredRewards.map((reward) => {
          const isAffordable = displayBalance >= reward.points_cost;
          const isOutOfStock = reward.stock !== null && reward.stock <= 0;
          const isVoucher = reward.category === 'voucher';

          return (
            <div
              key={reward.id}
              className="rounded-2xl bg-white border border-slate-200/90 p-3.5 shadow-2xs hover:border-sky-300 transition-all"
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${
                    isVoucher
                      ? 'bg-sky-50 text-sky-600 border-sky-100'
                      : 'bg-amber-50 text-amber-600 border-amber-100'
                  }`}
                >
                  {isVoucher ? <Ticket className="w-5 h-5" /> : <Package className="w-5 h-5" />}
                </div>

                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[11px] font-semibold text-slate-500">
                        {isVoucher ? 'Voucher & Pulsa' : 'Perlengkapan Usaha'}
                      </span>
                      <h3 className="font-bold text-sm text-slate-900 leading-snug">
                        {reward.name}
                      </h3>
                    </div>

                    <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 border border-amber-200/80 px-2 py-0.5 rounded-md text-[11px] font-bold shrink-0">
                      <Coins className="w-3 h-3 text-amber-600" />
                      <span>{reward.points_cost} Poin</span>
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {reward.description}
                  </p>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3">
                    <div className="text-[11px] font-medium text-slate-500">
                      {isOutOfStock ? (
                        <span className="text-rose-600 font-bold">Stok Habis</span>
                      ) : reward.stock !== null ? (
                        <span>Sisa stok: {reward.stock}</span>
                      ) : (
                        <span className="text-emerald-600">Selalu tersedia</span>
                      )}
                    </div>

                    <Button
                      variant={isAffordable && !isOutOfStock ? 'primary' : 'outline'}
                      size="sm"
                      disabled={!isAffordable || isOutOfStock}
                      className="text-xs min-h-[38px] px-3.5 rounded-xl"
                      onClick={() => setSelectedReward(reward)}
                    >
                      {isOutOfStock ? (
                        'Stok Habis'
                      ) : isAffordable ? (
                        <span className="inline-flex items-center gap-1">
                          Tukar Hadiah <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      ) : (
                        `Kurang ${reward.points_cost - displayBalance} Poin`
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>

      {/* Modal Konfirmasi Penukaran Atomik */}
      {selectedReward && (
        <div className="fixed inset-0 z-[100] bg-slate-900/70 backdrop-blur-[1px] flex items-center justify-center p-4">
          <Card className="max-w-sm w-full p-5 space-y-4 shadow-xl border-slate-300">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
              <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">Konfirmasi Penukaran</h3>
                <p className="text-xs text-slate-500">Hadiah akan diproses oleh tim kami</p>
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-700">
              <p>
                Anda akan menukarkan <strong>{selectedReward.points_cost} Poin</strong> untuk:
              </p>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 font-bold text-slate-900">
                {selectedReward.name}
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                {selectedReward.fulfillment_instructions}
              </p>
            </div>

            <div className="pt-2 flex gap-2">
              <Button
                variant="outline"
                size="md"
                className="flex-1 text-xs"
                onClick={() => setSelectedReward(null)}
              >
                Batal
              </Button>
              <Button
                variant="primary"
                size="md"
                className="flex-1 text-xs"
                onClick={handleConfirmRedeem}
              >
                Ya, Tukar Sekarang
              </Button>
            </div>
          </Card>
        </div>
      )}
    </>
  );
}

