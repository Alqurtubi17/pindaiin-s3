// src/app/(auth)/forgot-password/page.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, KeyRound, Eye, EyeOff, ArrowRight, ShieldCheck, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { usePageTitle } from '@/lib/utils/use-page-title';

export default function ForgotPasswordPage() {
  usePageTitle('Lupa Kata Sandi');
  const router = useRouter();

  // Step 1: Input Email, Step 2: Input OTP & Sandi Baru, Step 3: Sukses
  const [step, setStep] = useState<1 | 2 | 3>(1);

  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [simulatedOtp, setSimulatedOtp] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Step 1: Kirim OTP Reset Password
  const handleRequestResetOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          purpose: 'reset-password',
        }),
      });

      const data = await res.json();
      setIsLoading(false);

      if (!res.ok || !data.success) {
        setErrorMsg(data.message || 'Gagal mengirim kode verifikasi.');
        return;
      }

      if (data.simulated && data.otp) {
        setSimulatedOtp(data.otp);
      }

      setStep(2);
      setSuccessMsg(`Kode verifikasi 6 digit telah dikirim ke ${email}.`);
    } catch {
      setIsLoading(false);
      setErrorMsg('Terjadi kesalahan jaringan saat mengirim kode reset sandi.');
    }
  };

  // Step 2: Verifikasi OTP & Simpan Sandi Baru
  const handleSubmitNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

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
          email: email.trim(),
          otp: otpCode.trim(),
          newPassword,
        }),
      });

      const data = await res.json();
      setIsLoading(false);

      if (!res.ok || !data.success) {
        setErrorMsg(data.message || 'Gagal mengatur ulang kata sandi.');
        return;
      }

      // Simpan ke local registry agar langsung bisa login
      if (typeof window !== 'undefined') {
        const raw = localStorage.getItem('digiumkm_user_passwords_registry');
        const reg = raw ? JSON.parse(raw) : {};
        reg[email.toLowerCase().trim()] = newPassword;
        localStorage.setItem('digiumkm_user_passwords_registry', JSON.stringify(reg));
      }

      setStep(3);
    } catch {
      setIsLoading(false);
      setErrorMsg('Terjadi gangguan jaringan saat memproses kata sandi baru.');
    }
  };

  return (
    <Card className="p-6 bg-white border border-slate-200/90 shadow-xl rounded-2xl space-y-5">
      {/* Header Form */}
      <div className="space-y-1 text-center sm:text-left border-b border-slate-100 pb-3.5">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          {step === 1 && 'Lupa Kata Sandi'}
          {step === 2 && 'Atur Ulang Kata Sandi'}
          {step === 3 && 'Kata Sandi Diperbarui!'}
        </h2>
        <p className="text-xs text-slate-500">
          {step === 1 && 'Masukkan alamat email toko Anda untuk menerima kode verifikasi OTP'}
          {step === 2 && `Masukkan kode OTP dari email ${email} dan buat kata sandi baru`}
          {step === 3 && 'Kata sandi akun Anda telah berhasil diperbarui dan siap digunakan'}
        </p>
      </div>

      {errorMsg && (
        <div className="p-3 text-xs text-rose-700 bg-rose-50 rounded-xl border border-rose-200 flex items-start gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && step === 2 && (
        <div className="p-3 text-xs text-emerald-800 bg-emerald-50 rounded-xl border border-emerald-200 flex items-start gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* ================================================================= */}
      {/* TAHAP 1: INPUT EMAIL */}
      {/* ================================================================= */}
      {step === 1 && (
        <form onSubmit={handleRequestResetOtp} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Alamat Email Terdaftar</label>
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
            <p className="text-[11px] text-slate-500">
              Kode OTP 6-digit akan dikirimkan secara aman ke alamat email ini.
            </p>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="md"
            className="w-full h-11 text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white rounded-xl shadow-md shadow-sky-600/20 flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
            isLoading={isLoading}
          >
            <span>Kirim Kode OTP Reset Sandi</span>
            <ArrowRight className="w-4 h-4" />
          </Button>

          <div className="text-center pt-2 border-t border-slate-100">
            <Link href="/login" className="text-xs text-slate-500 hover:text-sky-600 transition-colors font-medium">
              ← Kembali ke Halaman Masuk
            </Link>
          </div>
        </form>
      )}

      {/* ================================================================= */}
      {/* TAHAP 2: INPUT OTP & KATA SANDI BARU */}
      {/* ================================================================= */}
      {step === 2 && (
        <form onSubmit={handleSubmitNewPassword} className="space-y-4">
          {simulatedOtp && (
            <div className="p-3 bg-sky-50 border border-sky-200 rounded-xl text-xs text-sky-900 space-y-1">
              <span className="font-bold flex items-center gap-1.5 text-sky-800">
                <ShieldCheck className="w-4 h-4 text-sky-600" />
                Mode Uji Coba (Dev / Demo SMTP):
              </span>
              <p className="text-[11px] text-slate-600">
                Kode OTP Reset Anda: <strong className="font-mono text-sm text-sky-700 bg-white px-2 py-0.5 rounded border border-sky-300">{simulatedOtp}</strong>
              </p>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 text-center block">Kode OTP 6-Digit</label>
            <div className="flex justify-center">
              <input
                type="text"
                required
                maxLength={6}
                autoFocus
                placeholder="000000"
                className="w-48 h-11 text-center text-xl font-black font-mono tracking-[0.3em] bg-slate-50 border-2 border-sky-500 rounded-xl focus:outline-none focus:ring-4 focus:ring-sky-100 text-slate-900"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
              />
            </div>
          </div>

          <div className="space-y-3">
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
          </div>

          <Button
            type="submit"
            variant="primary"
            size="md"
            className="w-full h-11 text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white rounded-xl shadow-md shadow-sky-600/20 flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
            isLoading={isLoading}
          >
            <KeyRound className="w-4 h-4" />
            <span>Simpan Kata Sandi Baru</span>
          </Button>

          <div className="text-center pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="text-xs text-slate-500 hover:text-slate-800"
            >
              ← Ganti Alamat Email
            </button>
          </div>
        </form>
      )}

      {/* ================================================================= */}
      {/* TAHAP 3: SUKSES */}
      {/* ================================================================= */}
      {step === 3 && (
        <div className="space-y-4 text-center py-2 animate-in fade-in zoom-in-95">
          <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-xs">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h3 className="font-bold text-base text-slate-900">Kata Sandi Anda Berhasil Diperbarui</h3>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Silakan masuk kembali menggunakan kata sandi baru Anda untuk melanjutkan pengelolaan toko QRIS.
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

