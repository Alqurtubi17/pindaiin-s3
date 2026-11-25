// src/components/gamification/ledger-history.tsx
import React from 'react';
import { ArrowDownLeft, ArrowUpRight, History } from 'lucide-react';
import { FormattedLedgerEntry } from '@/modules/ledger/ledger.service';
import { Card } from '@/components/ui/card';

interface LedgerHistoryProps {
  entries: FormattedLedgerEntry[];
}

export function LedgerHistory({ entries }: LedgerHistoryProps) {
  if (entries.length === 0) {
    return (
      <Card className="p-6 text-center text-slate-500 space-y-2">
        <History className="w-8 h-8 mx-auto text-slate-400" />
        <p className="text-sm font-semibold text-slate-700">Belum Ada Riwayat Poin</p>
        <p className="text-xs">Selesaikan modul belajar atau laporkan transaksi untuk mulai mengumpulkan poin.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-2.5">
      {entries.map((item) => (
        <Card key={item.id} className="p-3.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                item.type === 'credit'
                  ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                  : 'bg-red-50 text-red-600 border border-red-100'
              }`}
            >
              {item.type === 'credit' ? (
                <ArrowUpRight className="w-5 h-5" />
              ) : (
                <ArrowDownLeft className="w-5 h-5" />
              )}
            </div>
            <div className="space-y-0.5">
              <h4 className="text-sm font-bold text-slate-900 leading-tight">
                {item.title}
              </h4>
              <p className="text-[11px] text-slate-500">{item.dateWib}</p>
            </div>
          </div>

          <span
            className={`text-sm font-extrabold whitespace-nowrap ${
              item.type === 'credit' ? 'text-emerald-600' : 'text-red-600'
            }`}
          >
            {item.deltaFormatted}
          </span>
        </Card>
      ))}
    </div>
  );
}

