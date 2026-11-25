// src/app/(auth)/login/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { usePageTitle } from '@/lib/utils/use-page-title';
import { setMerchantSession } from '@/modules/auth/merchant-session';
import { TurnstileWidget } from '@/components/auth/turnstile-widget';
import { GoogleAuthButton } from '@/components/auth/google-auth-button';

export default function LoginPage() {
  usePageTitle('Masuk Akun');
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const err = params.get('error');
    if (err === 'google_not_configured') {
      setErrorMsg('Login Google belum dikonfigurasi pada server.');
    } else if (err === 'google_auth_failed' || err === 'google_auth_missing_code') {
      setErrorMsg('Login dengan Google gagal atau dibatalkan. Silakan coba kembali.');
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!turnstileToken) {
      setErrorMsg('Silakan selesaikan verifikasi keamanan Cloudflare terlebih dahulu.');
      return;
    }

    setIsLoading(true);

    try {
      const cfRes = await fetch('/api/auth/verify-turnstile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: turnstileToken }),
      });
      const cfData = await cfRes.json();
      if (!cfRes.ok || !cfData.success) {
        setIsLoading(false);
        setErrorMsg(cfData.message || 'Verifikasi keamanan Cloudflare gagal.');
        return;
      }

      const normalizedEmail = email.toLowerCase().trim();

      // Cek apakah password pernah di-reset oleh admin melalui local registry
      const registryRaw = typeof window !== 'undefined' ? localStorage.getItem('digiumkm_user_passwords_registry') : null;
      if (registryRaw) {
        const registry = JSON.parse(registryRaw);
        if (registry[normalizedEmail]) {
          if (registry[normalizedEmail] === password) {
            // Berhasil login dengan password resetan admin
            setMerchantSession({
              email: normalizedEmail,
              mode: 'merchant',
              loggedInAt: new Date().toISOString(),
            });
            setTimeout(() => {
              setIsLoading(false);
              router.push('/dashboard');
            }, 400);
            return;
          } else {
            setIsLoading(false);
            setErrorMsg('Kata sandi salah. Silakan masukkan kata sandi yang baru diberikan.');
            return;
          }
        }
      }

      if (password.length >= 6) {
        setMerchantSession({
          email: normalizedEmail,
          mode: 'merchant',
          loggedInAt: new Date().toISOString(),
        });
        setTimeout(() => {
          setIsLoading(false);
          router.push('/dashboard');
        }, 300);
        return;
      }

      setIsLoading(false);
      setErrorMsg('Email atau kata sandi tidak cocok. Silakan periksa kembali.');
    } catch {
      setIsLoading(false);
      setErrorMsg('Terjadi kesalahan koneksi saat login.');
    }
  };

  return (
    <Card className="p-6 bg-white border border-slate-200/90 shadow-xl rounded-2xl space-y-5">
      {/* Header Form */}
      <div className="space-y-1 text-center sm:text-left border-b border-slate-100 pb-3.5">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Masuk ke Akun Anda</h2>
        <p className="text-xs text-slate-500">
          Masukkan email dan kata sandi toko yang telah terdaftar
        </p>
      </div>

      {errorMsg && (
        <div className="p-3 text-xs text-rose-700 bg-rose-50 rounded-xl border border-rose-200 flex items-start gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Input Email */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700">Alamat Email</label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="email"
              required
              placeholder="contoh: warung.siti@gmail.com"
              className="w-full h-10 pl-10 pr-3.5 text-xs bg-slate-50/70 border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        {/* Input Kata Sandi */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-700">Kata Sandi</label>
            <Link
              href="/forgot-password"
              className="text-xs font-semibold text-sky-600 hover:text-sky-700 hover:underline transition-colors"
            >
              Lupa kata sandi?
            </Link>
          </div>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              minLength={6}
              placeholder="Minimal 6 karakter"
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

        {/* Ingat Saya */}
        <div className="flex items-center justify-between pt-0.5">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500 border-slate-300"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            <span className="text-xs text-slate-600 font-medium">Ingat saya di perangkat ini</span>
          </label>
        </div>

        {/* Verifikasi Keamanan Cloudflare Turnstile */}
        <TurnstileWidget onVerify={setTurnstileToken} />

        {/* Tombol Masuk */}
        <Button
          type="submit"
          variant="primary"
          size="md"
          className="w-full h-11 text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white rounded-xl shadow-md shadow-sky-600/20 flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
          isLoading={isLoading}
        >
          <span>Masuk Sekarang</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </form>

      {/* Pemisah & Login with Google */}
      <div className="relative flex items-center py-0.5">
        <div className="flex-grow border-t border-slate-200" />
        <span className="shrink mx-3 text-[11px] font-medium text-slate-400">atau</span>
        <div className="flex-grow border-t border-slate-200" />
      </div>

      <GoogleAuthButton label="Masuk dengan Google" onError={setErrorMsg} />

      {/* Footer Navigasi Daftar */}
      <div className="text-center pt-2 border-t border-slate-100 text-xs text-slate-600">
        Belum memiliki akun pedagang?{' '}
        <Link href="/register" className="font-bold text-sky-600 hover:underline">
          Daftar di sini
        </Link>
      </div>
    </Card>
  );
}
