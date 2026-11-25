// src/app/(auth)/forgot-password/page.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowRight, ArrowLeft, AlertCircle, CheckCircle2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { usePageTitle } from '@/lib/utils/use-page-title';

export default function ForgotPasswordPage() {
  usePageTitle('Lupa Kata Sandi');

  const [email, setEmail] = useState('');
  const [isSent, setIsSent] = useState(false);
  const [simulatedResetUrl, setSimulatedResetUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleRequestResetLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();
      setIsLoading(false);

      if (!res.ok || !data.success) {
        setErrorMsg(data.message || 'Gagal mengirim tautan reset kata sandi.');
        return;
      }

      if (data.simulated && data.resetUrl) {
        setSimulatedResetUrl(data.resetUrl);
      } else {
        setSimulatedResetUrl(null);
      }

      setIsSent(true);
    } catch {
      setIsLoading(false);
      setErrorMsg('Terjadi kesalahan jaringan saat mengirim tautan reset sandi.');
    }
  };

  return (
    <Card className="p-6 bg-white border border-slate-200/90 shadow-xl rounded-2xl space-y-5">
      <div className="space-y-1 text-center sm:text-left border-b border-slate-100 pb-3.5">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          {isSent ? 'Periksa Email Anda' : 'Lupa Kata Sandi'}
        </h2>
        <p className="text-xs text-slate-500">
          {isSent
            ? `Kami telah mengirimkan tautan atur ulang kata sandi ke ${email}`
            : 'Masukkan alamat email toko Anda untuk menerima tautan atur ulang kata sandi'}
        </p>
      </div>

      {errorMsg && (
        <div className="p-3 text-xs text-rose-700 bg-rose-50 rounded-xl border border-rose-200 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {!isSent ? (
        <form onSubmit={handleRequestResetLink} className="space-y-4">
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
              Tautan reset kata sandi yang berlaku 15 menit akan dikirimkan ke email ini.
            </p>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="md"
            className="w-full h-11 text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white rounded-xl shadow-md shadow-sky-600/20 flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
            isLoading={isLoading}
          >
            <span>Kirim Tautan Reset Sandi</span>
            <ArrowRight className="w-4 h-4" />
          </Button>

          <div className="pt-1">
            <Link
              href="/login"
              className="w-full h-10 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-100 hover:border-slate-300 text-slate-700 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
              <span>Kembali ke Halaman Masuk</span>
            </Link>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
            <div className="w-11 h-11 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <p className="text-xs font-semibold text-emerald-900">
              Tautan atur ulang kata sandi telah dikirim!
            </p>
            <p className="text-[11px] text-emerald-800/80 leading-relaxed">
              Buka kotak masuk atau folder spam pada email <strong>{email}</strong>, lalu klik tautan di dalamnya dalam waktu 15 menit.
            </p>
          </div>

          {simulatedResetUrl && (
            <div className="p-3.5 rounded-xl bg-sky-50 border border-sky-200 space-y-2">
              <p className="text-[11px] font-bold text-sky-900">
                Mode Uji Lokal (SMTP belum diisi):
              </p>
              <Link
                href={simulatedResetUrl}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-700 hover:text-sky-900 underline break-all"
              >
                <span>Buka Tautan Reset Kata Sandi</span>
                <ExternalLink className="w-3.5 h-3.5 shrink-0" />
              </Link>
            </div>
          )}

          <div className="space-y-2 pt-1">
            <button
              type="button"
              onClick={() => {
                setIsSent(false);
                setSimulatedResetUrl(null);
              }}
              className="w-full h-10 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
            >
              Kirim Ulang ke Email Lain
            </button>

            <Link
              href="/login"
              className="w-full h-10 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-100 hover:border-slate-300 text-slate-700 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
              <span>Kembali ke Halaman Masuk</span>
            </Link>
          </div>
        </div>
      )}
    </Card>
  );
}
