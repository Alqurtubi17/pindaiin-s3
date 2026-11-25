// src/app/(merchant)/layout.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { TopBar } from '@/components/navigation/top-bar';
import { BottomNav } from '@/components/navigation/bottom-nav';
import { getMerchantSession, setMerchantSession, MerchantSession } from '@/modules/auth/merchant-session';

export default function MerchantLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [session, setSession] = useState<MerchantSession | null>(null);

  useEffect(() => {
    const syncSession = () => {
      let current = getMerchantSession();
      if (!current && typeof document !== 'undefined') {
        const hasCookie = document.cookie.includes('digiumkm_merchant_session=');
        if (hasCookie) {
          const emailMatch = document.cookie.match(/(?:^|;\s*)larisin_oauth_email=([^;]+)/);
          const oauthEmail = emailMatch ? decodeURIComponent(emailMatch[1]) : 'pedagang@gmail.com';
          current = {
            email: oauthEmail,
            mode: 'merchant',
            loggedInAt: new Date().toISOString(),
          };
          setMerchantSession(current);
          document.cookie = 'larisin_oauth_email=; path=/; max-age=0; SameSite=Lax';
        }
      }
      setSession(current);
      if (!current) {
        router.replace('/login');
      }
    };

    syncSession();
    window.addEventListener('storage', syncSession);
    window.addEventListener('digiumkm_session_updated', syncSession);
    return () => {
      window.removeEventListener('storage', syncSession);
      window.removeEventListener('digiumkm_session_updated', syncSession);
    };
  }, [router]);

  if (!session) {
    return null;
  }

  const isDemoMode = session.mode === 'admin_demo';

  return (
    <div className="min-h-screen flex flex-col pb-20 bg-slate-50">
      <TopBar
        businessName="Warung Berkah Bu Siti"
        regency="Jember, Jawa Timur"
        isDemoMode={isDemoMode}
      />
      <div className="flex-1 px-4 py-4 space-y-4 max-w-md mx-auto w-full">
        {children}
      </div>
      <BottomNav />
    </div>
  );
}
