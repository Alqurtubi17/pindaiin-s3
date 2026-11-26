// src/app/(auth)/admin-login/page.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { usePageTitle } from '@/lib/utils/use-page-title';
import { setAdminSession } from '@/modules/auth/admin-session';

export default function AdminLoginPage() {
  usePageTitle('Masuk Pengelola');
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    if (email.trim() && password.length >= 6) {
      setAdminSession(email.trim());
      setIsLoading(false);
      router.push('/admin/verification');
    } else {
      setIsLoading(false);
      setErrorMsg('Email atau kata sandi pengelola tidak valid.');
    }
  };

  return (
    <Card className="p-6 bg-white border border-slate-200/90 shadow-xl rounded-2xl space-y-5">
      {/* Header Bersih & Profesional */}
      <div className="space-y-1.5 border-b border-slate-100 pb-3.5 text-center">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Masuk ke Panel Pengelola</h2>
        <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
          Gunakan akun pengelola Anda untuk meninjau aktivitas UMKM dan memantau perkembangan program
        </p>
      </div>

      {errorMsg && (
        <div className="p-3 text-xs text-rose-700 bg-rose-50 rounded-xl border border-rose-200 flex items-start gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Input Email Pengelola */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700">Email Pengelola</label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="email"
              required
              placeholder="admin@pindaiin.id"
              className="w-full h-10 pl-10 pr-3.5 text-xs bg-slate-50/70 border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        {/* Input Kata Sandi */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700">Kata Sandi</label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              placeholder="••••••••"
              className="w-full h-10 pl-10 pr-10 text-xs bg-slate-50/70 border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all font-mono"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="p-1 text-slate-400 hover:text-slate-600 absolute right-3 top-2.5 transition-colors"
              title={showPassword ? 'Sembunyikan' : 'Tampilkan'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Tombol Masuk */}
        <Button
          type="submit"
          variant="primary"
          size="md"
          className="w-full h-11 text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white rounded-xl shadow-md shadow-sky-600/20 flex items-center justify-center gap-2 transition-all active:scale-[0.99] mt-2"
          isLoading={isLoading}
        >
          <span>Masuk ke Panel Pengelola</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </form>
    </Card>
  );
}
