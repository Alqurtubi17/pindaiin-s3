// src/components/navigation/top-bar.tsx
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Wifi, WifiOff, Gift } from 'lucide-react';
import { BrandMark } from '@/components/ui/brand-logo';

interface TopBarProps {
  businessName?: string;
  regency?: string;
  isDemoMode?: boolean;
}

export function TopBar({
  businessName = 'Warung Mitra',
  regency = 'Jawa Timur',
  isDemoMode = false,
}: TopBarProps) {
  const pathname = usePathname();
  const [isOnline, setIsOnline] = useState(true);
  const isRewardsActive = pathname === '/rewards' || pathname.startsWith('/rewards/');

  useEffect(() => {
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-100 px-4 py-3 flex items-center justify-between gap-2 shadow-xs">
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        <BrandMark size="md" className="shadow-xs" />
        <div className="min-w-0">
          <h2 className="text-sm font-bold text-slate-900 leading-tight truncate">
            {businessName}
          </h2>
          <p className="text-[11px] text-slate-500 truncate">{regency}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {isDemoMode && (
          <Link
            href="/admin/verification"
            className="text-xs font-semibold text-slate-600 hover:text-sky-700 px-1.5 py-1 transition-colors"
            title="Kembali ke Panel Admin"
          >
            Admin
          </Link>
        )}
        <Link
          href="/rewards"
          className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[11px] font-bold border transition-colors ${
            isRewardsActive
              ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
              : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
          }`}
        >
          <Gift className="w-3.5 h-3.5" />
          <span>Hadiah</span>
        </Link>

        {/* Indikator Status Jaringan untuk Koneksi Rural */}
        <div className="flex items-center gap-1 px-2 py-1.5 rounded-full text-xs font-medium border border-slate-200 bg-slate-50">
          {isOnline ? (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <Wifi className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline text-slate-700 font-semibold text-[11px]">Online</span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              <WifiOff className="w-3.5 h-3.5 text-amber-600" />
              <span className="hidden sm:inline text-amber-800 font-semibold text-[11px]">Offline</span>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

