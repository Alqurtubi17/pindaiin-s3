// src/components/navigation/bottom-nav.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BookOpen, Target, QrCode, User } from 'lucide-react';
import { clsx } from 'clsx';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  isCenter?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Belajar', href: '/learning', icon: BookOpen },
  { label: 'Misi', href: '/missions', icon: Target },
  { label: 'Beranda', href: '/dashboard', icon: Home, isCenter: true },
  { label: 'Aktivitas', href: '/activity', icon: QrCode },
  { label: 'Akun', href: '/profile', icon: User },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-[0_-4px_16px_rgba(0,0,0,0.06)]">
      <div className="max-w-md mx-auto grid grid-cols-5 h-16 relative px-1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(`${item.href}/`)) || (item.href === '/dashboard' && pathname === '/dashboard');
          const Icon = item.icon;

          if (item.isCenter) {
            return (
              <div key={item.href} className="relative flex flex-col items-center justify-center select-none">
                <Link
                  href={item.href}
                  className="group flex flex-col items-center"
                  aria-label="Beranda"
                >
                  {/* Floating Action Button Menonjol ke Atas */}
                  <div
                    className={clsx(
                      "absolute -top-5 w-12 h-12 rounded-full flex items-center justify-center shadow-md transition-all duration-200 active:scale-95 border-[3.5px] border-white",
                      isActive
                        ? "bg-sky-600 text-white shadow-sky-500/40 ring-2 ring-sky-300"
                        : "bg-sky-500 hover:bg-sky-600 text-white shadow-sky-400/30"
                    )}
                  >
                    <Icon className="w-5 h-5 stroke-[2.2]" />
                  </div>
                  {/* Label Beranda di Bawah Tombol Melayang */}
                  <span
                    className={clsx(
                      "text-[10px] font-semibold tracking-tight mt-6 transition-colors",
                      isActive ? "text-sky-700 font-bold" : "text-slate-600 group-hover:text-sky-600"
                    )}
                  >
                    {item.label}
                  </span>
                </Link>
              </div>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "flex flex-col items-center justify-center gap-1 transition-all select-none min-h-[52px]",
                isActive ? "text-sky-600 font-bold" : "text-slate-500 hover:text-slate-800"
              )}
            >
              <div className="relative">
                <Icon className={clsx("w-5 h-5 transition-transform", isActive ? "stroke-[2.3] scale-105" : "stroke-[1.8]")} />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-sky-600" />
                )}
              </div>
              <span className="text-[10px] tracking-tight font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
