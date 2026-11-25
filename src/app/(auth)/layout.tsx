// src/app/(auth)/layout.tsx
import React from 'react';
import { BrandMark } from '@/components/ui/brand-logo';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-md mx-auto min-h-screen flex flex-col justify-center px-5 py-6 bg-white shadow-sm">
      <div className="text-center mb-5">
        <div className="inline-flex justify-center mb-2.5">
          <BrandMark size="lg" className="shadow-md shadow-sky-200/70 rounded-xl" />
        </div>
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
          Pindai<span className="text-sky-600">in</span>
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Pendamping Digital & Adopsi QRIS untuk UMKM
        </p>
      </div>
      {children}
    </div>
  );
}

