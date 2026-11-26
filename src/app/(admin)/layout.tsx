// src/app/(admin)/layout.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  CheckSquare,
  BarChart3,
  Layers,
  Store,
  LogOut,
  Users,
  Menu,
  X,
} from 'lucide-react';
import { clsx } from 'clsx';
import { BrandLogo } from '@/components/ui/brand-logo';
import { activateAdminDemoMerchantSession } from '@/modules/auth/merchant-session';
import { getAdminSession, clearAdminSession, AdminSession } from '@/modules/auth/admin-session';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [adminSession, setAdminSessionState] = useState<AdminSession | null>(null);

  useEffect(() => {
    const syncAdminSession = () => {
      const current = getAdminSession();
      setAdminSessionState(current);
      if (!current) {
        router.replace('/admin-login');
      }
    };

    syncAdminSession();
    window.addEventListener('storage', syncAdminSession);
    window.addEventListener('pindaiin_admin_session_updated', syncAdminSession);
    return () => {
      window.removeEventListener('storage', syncAdminSession);
      window.removeEventListener('pindaiin_admin_session_updated', syncAdminSession);
    };
  }, [router]);

  if (!adminSession) {
    return null;
  }

  const navLinks = [
    {
      href: '/admin/merchants',
      label: 'Kelola Merchant',
      icon: Users,
    },
    {
      href: '/admin/verification',
      label: 'Verifikasi',
      icon: CheckSquare,
    },
    {
      href: '/admin/analytics',
      label: 'Analitik & Riset',
      icon: BarChart3,
    },
    {
      href: '/admin/content',
      label: 'Kelola Konten',
      icon: Layers,
    },
  ];

  const handleEnterDemoMerchant = () => {
    setMobileMenuOpen(false);
    activateAdminDemoMerchantSession();
    router.push('/dashboard');
  };

  const handleLogoutAdmin = () => {
    setMobileMenuOpen(false);
    clearAdminSession();
    router.push('/admin-login');
  };

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-900 flex flex-col antialiased">
      {/* Header Admin Modern - 1 Baris Ramping di Semua Perangkat */}
      <header className="bg-white/90 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 lg:h-16 flex items-center justify-between gap-4">
          {/* Kiri: Brand DigiUMKM */}
          <Link href="/admin/verification" className="shrink-0">
            <BrandLogo size="sm" />
          </Link>

          {/* Tengah: Navigasi Desktop */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={clsx(
                    'px-3 py-1.5 rounded-lg flex items-center gap-2 text-xs transition-colors select-none whitespace-nowrap',
                    isActive
                      ? 'bg-slate-100 text-slate-900 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium'
                  )}
                >
                  <Icon className={clsx('w-4 h-4', isActive ? 'text-sky-600' : 'text-slate-400')} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Kanan: Aksi Desktop & Tombol Menu Mobile */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleEnterDemoMerchant}
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-sky-700 hover:bg-sky-50 transition-colors"
              title="Masuk ke tampilan pedagang memakai akun testing/demo"
            >
              <Store className="w-4 h-4 text-slate-400" />
              <span>Mode Pedagang</span>
            </button>

            <div className="hidden lg:block h-4 w-px bg-slate-200" />

            <button
              type="button"
              onClick={handleLogoutAdmin}
              className="hidden lg:inline-flex p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
              title="Keluar dari Panel"
            >
              <LogOut className="w-4 h-4" />
            </button>

            {/* Tombol Hamburger untuk HP & Tablet */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              aria-label="Buka menu navigasi"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Slide-over Drawer Navigasi untuk HP & Tablet */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden flex justify-end bg-slate-900/50 backdrop-blur-[1px]">
          <div
            className="flex-1"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <aside className="w-72 max-w-[85vw] bg-white h-full shadow-2xl flex flex-col justify-between p-5">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
                <BrandLogo size="sm" />
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                  aria-label="Tutup menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="space-y-1">
                {navLinks.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={clsx(
                        'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors',
                        isActive
                          ? 'bg-sky-50 text-sky-700 font-semibold'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium'
                      )}
                    >
                      <Icon className={clsx('w-4 h-4', isActive ? 'text-sky-600' : 'text-slate-400')} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="space-y-1.5 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={handleEnterDemoMerchant}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <Store className="w-4 h-4 text-slate-400" />
                <span>Mode Pedagang (Demo)</span>
              </button>
              <button
                type="button"
                onClick={handleLogoutAdmin}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Keluar dari Panel</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-5 sm:py-8">
        {children}
      </main>
    </div>
  );
}
