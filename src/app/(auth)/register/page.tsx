// src/app/(auth)/register/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, ShieldCheck, AlertCircle, CheckCircle2, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { handleRegister } from '@/modules/auth/auth.actions';
import { usePageTitle } from '@/lib/utils/use-page-title';
import { TurnstileWidget } from '@/components/auth/turnstile-widget';
import { GoogleAuthButton } from '@/components/auth/google-auth-button';

export default function RegisterPage() {
  usePageTitle('Daftar Akun Pedagang');
  const router = useRouter();

  // Step 1: Input Data, Step 2: OTP Verification
  const [step, setStep] = useState<1 | 2>(1);

  // Form Fields
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [consentResearch, setConsentResearch] = useState(true);

  // OTP Fields
  const [otpCode, setOtpCode] = useState('');
  const [simulatedOtp, setSimulatedOtp] = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  // States
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  // Countdown resend timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 2 && resendTimer > 0) {
      timer = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    } else if (resendTimer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(timer);
  }, [step, resendTimer]);

  // Step 1: Kirim OTP ke email pendaftar
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (password !== confirmPassword) {
      setErrorMsg('Konfirmasi kata sandi tidak cocok.');
      return;
    }

    if (!consentResearch) {
      setErrorMsg('Anda wajib menyetujui syarat & ketentuan privasi.');
      return;
    }

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

      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          purpose: 'register',
          recipientName: displayName.trim(),
        }),
      });

      const data = await res.json();
      setIsLoading(false);

      if (!res.ok || !data.success) {
        setErrorMsg(data.message || 'Gagal mengirim kode verifikasi OTP.');
        return;
      }

      if (data.simulated && data.otp) {
        setSimulatedOtp(data.otp);
      } else {
        setSimulatedOtp(null);
      }

      setStep(2);
      setResendTimer(60);
      setCanResend(false);
      setSuccessMsg(`Kode OTP 6-digit telah dikirim ke ${email}. Periksa kotak masuk atau spam email Anda.`);
    } catch (err) {
      setIsLoading(false);
      setErrorMsg('Terjadi gangguan jaringan saat mengirim kode OTP.');
    }
  };

  // Step 2: Verifikasi OTP & Lanjutkan pendaftaran
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (otpCode.trim().length !== 6) {
      setErrorMsg('Kode OTP harus terdiri dari 6 digit angka.');
      return;
    }

    setIsLoading(true);

    try {
      const verifyRes = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          otp: otpCode.trim(),
          purpose: 'register',
        }),
      });

      const verifyData = await verifyRes.json();

      if (!verifyRes.ok || !verifyData.success) {
        setIsLoading(false);
        setErrorMsg(verifyData.message || 'Kode OTP salah atau sudah kadaluarsa.');
        return;
      }

      // OTP Valid -> Buat akun di sistem
      const regRes = await handleRegister({
        displayName: displayName.trim(),
        email: email.trim(),
        password,
        consentResearch,
      });

      setIsLoading(false);

      if (!regRes.success) {
        setErrorMsg(regRes.message);
        return;
      }

      router.push('/onboarding');
    } catch (err) {
      setIsLoading(false);
      setErrorMsg('Terjadi kesalahan saat memproses pendaftaran akun.');
    }
  };

  // Kirim ulang OTP
  const handleResendOtp = async () => {
    if (!canResend) return;
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          purpose: 'register',
          recipientName: displayName.trim(),
        }),
      });

      const data = await res.json();
      setIsLoading(false);

      if (data.simulated && data.otp) {
        setSimulatedOtp(data.otp);
      }

      setResendTimer(60);
      setCanResend(false);
      setSuccessMsg('Kode OTP baru telah berhasil dikirim ulang ke email Anda.');
    } catch {
      setIsLoading(false);
      setErrorMsg('Gagal mengirim ulang kode OTP.');
    }
  };

  return (
    <Card className="p-6 bg-white border border-slate-200/90 shadow-xl rounded-2xl space-y-5">
      {/* Header Form */}
      <div className="space-y-1 text-center sm:text-left border-b border-slate-100 pb-3.5">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          {step === 1 ? 'Daftar Akun Pedagang' : 'Verifikasi Email Anda'}
        </h2>
        <p className="text-xs text-slate-500">
          {step === 1
            ? 'Mulai digitalisasi kasir QRIS & raih reward usaha Anda'
            : `Masukkan 6-digit kode OTP yang kami kirimkan ke ${email}`}
        </p>
      </div>

      {errorMsg && (
        <div className="p-3 text-xs text-rose-700 bg-rose-50 rounded-xl border border-rose-200 flex items-start gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3 text-xs text-emerald-800 bg-emerald-50 rounded-xl border border-emerald-200 flex items-start gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* ================================================================= */}
      {/* TAHAP 1: FORM PENDAFTARAN */}
      {/* ================================================================= */}
      {step === 1 && (
        <form onSubmit={handleRequestOtp} className="space-y-3.5">
          {/* Nama Pemilik */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Nama Lengkap Pemilik Usaha</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                required
                placeholder="contoh: Siti Aminah"
                className="w-full h-10 pl-10 pr-3.5 text-xs bg-slate-50/70 border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Alamat Email Aktif</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                placeholder="warung.siti@gmail.com"
                className="w-full h-10 pl-10 pr-3.5 text-xs bg-slate-50/70 border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <p className="text-[10px] text-slate-500">Kode OTP verifikasi akan dikirimkan ke alamat email ini.</p>
          </div>

          {/* Kata Sandi */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Kata Sandi</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  placeholder="Min. 6 karakter"
                  className="w-full h-10 pl-9 pr-8 text-xs bg-slate-50/70 border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all font-mono"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1 text-slate-400 hover:text-slate-600 absolute right-2 top-2.5"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Ulangi Kata Sandi</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  placeholder="Ketik ulang sandi"
                  className="w-full h-10 pl-9 pr-3 text-xs bg-slate-50/70 border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all font-mono"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Persetujuan & Kebijakan Privasi */}
          <div className="p-3 bg-slate-50/80 border border-slate-200 rounded-xl">
            <label className="flex items-start gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                className="mt-0.5 w-4 h-4 rounded text-sky-600 focus:ring-sky-500 border-slate-300"
                checked={consentResearch}
                onChange={(e) => setConsentResearch(e.target.checked)}
                required
              />
              <span className="text-[11px] text-slate-600 leading-relaxed">
                Saya menyetujui syarat & ketentuan serta kebijakan privasi Pindaiin. Data usaha saya dijamin keamanannya dan tidak akan pernah diperjualbelikan.
              </span>
            </label>
          </div>

          {/* Verifikasi Keamanan Cloudflare Turnstile */}
          <TurnstileWidget onVerify={setTurnstileToken} />

          {/* Tombol Lanjut ke OTP */}
          <Button
            type="submit"
            variant="primary"
            size="md"
            className="w-full h-11 text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white rounded-xl shadow-md shadow-sky-600/20 flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
            isLoading={isLoading}
          >
            <span>Kirim Kode OTP Verifikasi</span>
            <ArrowRight className="w-4 h-4" />
          </Button>

          <div className="relative flex items-center py-0.5">
            <div className="flex-grow border-t border-slate-200" />
            <span className="shrink mx-3 text-[11px] font-medium text-slate-400">atau</span>
            <div className="flex-grow border-t border-slate-200" />
          </div>

          <GoogleAuthButton label="Daftar dengan Google" onError={setErrorMsg} />
        </form>
      )}

      {/* ================================================================= */}
      {/* TAHAP 2: VERIFIKASI KODE OTP DARI EMAIL */}
      {/* ================================================================= */}
      {step === 2 && (
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          {simulatedOtp && (
            <div className="p-3 bg-sky-50 border border-sky-200 rounded-xl text-xs text-sky-900 space-y-1">
              <span className="font-bold flex items-center gap-1.5 text-sky-800">
                <ShieldCheck className="w-4 h-4 text-sky-600" />
                Mode Uji Coba (Dev / Demo SMTP):
              </span>
              <p className="text-[11px] text-slate-600">
                Kode OTP Anda: <strong className="font-mono text-sm text-sky-700 bg-white px-2 py-0.5 rounded border border-sky-300">{simulatedOtp}</strong>
              </p>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-800 text-center block">
              Masukkan 6-Digit Kode Verifikasi OTP
            </label>
            <div className="flex justify-center">
              <input
                type="text"
                required
                maxLength={6}
                autoFocus
                placeholder="000000"
                className="w-48 h-12 text-center text-2xl font-black font-mono tracking-[0.4em] bg-slate-50 border-2 border-sky-500 rounded-xl focus:outline-none focus:ring-4 focus:ring-sky-100 text-slate-900 placeholder:text-slate-300"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
              />
            </div>
            <p className="text-[11px] text-center text-slate-500">
              Kode berlaku selama <strong>5 menit</strong>.
            </p>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="md"
            className="w-full h-11 text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white rounded-xl shadow-md shadow-sky-600/20 flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
            isLoading={isLoading}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Verifikasi & Selesaikan Pendaftaran</span>
          </Button>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
            <button
              type="button"
              onClick={() => {
                setStep(1);
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className="text-slate-500 hover:text-slate-800 font-medium"
            >
              ← Ubah Email
            </button>

            {canResend ? (
              <button
                type="button"
                onClick={handleResendOtp}
                className="text-sky-600 font-bold hover:underline flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Kirim Ulang Kode</span>
              </button>
            ) : (
              <span className="text-slate-400">
                Kirim ulang dalam <strong className="text-slate-600 font-mono">{resendTimer}s</strong>
              </span>
            )}
          </div>
        </form>
      )}

      {/* Footer Navigasi Login */}
      <div className="text-center pt-2 border-t border-slate-100 text-xs text-slate-600">
        Sudah memiliki akun pedagang?{' '}
        <Link href="/login" className="font-bold text-sky-600 hover:underline">
          Masuk di sini
        </Link>
      </div>
    </Card>
  );
}
