// src/app/(auth)/reset-password/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lock, KeyRound, Eye, EyeOff, ArrowRight, ArrowLeft, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { usePageTitle } from '@/lib/utils/use-page-title';

export default function ResetPasswordPage() {
  usePageTitle('Atur Ulang Kata Sandi');
  const router = useRouter();

  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const t = params.get('token') || '';
    setToken(t);
    if (!t) {
      setErrorMsg('Tautan reset kata sandi tidak ditemukan atau sudah tidak berlaku.');
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!token) {
      setErrorMsg('Tautan reset kata sandi tidak valid.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('Konfirmasi kata sandi tidak cocok.');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMsg('Kata sandi baru minimal 6 karakter.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          newPassword,
        }),
      });

      const data = await res.json();
      setIsLoading(false);

      if (!res.ok || !data.success) {
        setErrorMsg(data.message || 'Gagal mengatur ulang kata sandi.');
        return;
      }

      if (typeof window !== 'undefined' && data.email) {
        const raw = localStorage.getItem('digiumkm_user_passwords_registry');
        const reg = raw ? JSON.parse(raw) : {};
        reg[String(data.email).toLowerCase().trim()] = newPassword;
        localStorage.setItem('digiumkm_user_passwords_registry', JSON.stringify(reg));
      }

      setIsDone(true);
    } catch {
      setIsLoading(false);
      setErrorMsg('Terjadi gangguan jaringan saat menyimpan kata sandi baru.');
    }
  };

  return (
    <Card className="p-6 bg-white border border-slate-200/90 shadow-xl rounded-2xl space-y-5">
      <div className="space-y-1 text-center sm:text-left border-b border-slate-100 pb-3.5">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          {isDone ? 'Kata Sandi Diperbarui!' : 'Atur Ulang Kata Sandi'}
        </h2>
        <p className="text-xs text-slate-500">
          {isDone
            ? 'Kata sandi akun Anda berhasil diperbarui dan siap digunakan'
            : 'Buat kata sandi baru yang aman untuk akun toko Anda'}
        </p>
      </div>

      {errorMsg && (
        <div className="p-3 text-xs text-rose-700 bg-rose-50 rounded-xl border border-rose-200 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {!isDone ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Kata Sandi Baru</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                placeholder="Minimal 6 karakter"
                className="w-full h-10 pl-10 pr-10 text-xs bg-slate-50/70 border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all font-mono"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="p-1 text-slate-400 hover:text-slate-600 absolute right-3 top-2.5"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Ulangi Kata Sandi Baru</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                placeholder="Ketik ulang sandi baru"
                className="w-full h-10 pl-10 pr-3.5 text-xs bg-slate-50/70 border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all font-mono"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={!token}
            className="w-full h-11 text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white rounded-xl shadow-md shadow-sky-600/20 flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
            isLoading={isLoading}
          >
            <KeyRound className="w-4 h-4" />
            <span>Simpan Kata Sandi Baru</span>
          </Button>

          <div className="pt-1">
            <Link
              href="/forgot-password"
              className="w-full h-10 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-100 hover:border-slate-300 text-slate-700 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
              <span>Minta Tautan Reset Baru</span>
            </Link>
          </div>
        </form>
      ) : (
        <div className="space-y-4 text-center py-2">
          <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-xs">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h3 className="font-bold text-base text-slate-900">Kata Sandi Berhasil Diperbarui</h3>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Silakan masuk kembali menggunakan kata sandi baru Anda.
            </p>
          </div>

          <Button
            type="button"
            variant="primary"
            size="md"
            className="w-full h-11 text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white rounded-xl shadow-md shadow-sky-600/20 flex items-center justify-center gap-2 mt-2"
            onClick={() => router.push('/login')}
          >
            <span>Masuk Sekarang</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </Card>
  );
}

