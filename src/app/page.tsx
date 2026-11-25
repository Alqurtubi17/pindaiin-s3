// src/app/page.tsx
import Link from 'next/link';
import { BookOpen, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { BrandMark } from '@/components/ui/brand-logo';

export default function HomePage() {
  return (
    <div className="max-w-md mx-auto min-h-screen bg-white shadow-sm flex flex-col justify-between p-6">
      <div className="pt-8 space-y-6">
        <div className="flex items-center gap-3">
          <BrandMark size="xl" className="shadow-md shadow-sky-200/70 rounded-2xl" />
          <span className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Pindai<span className="text-sky-600">in</span>
          </span>
        </div>
        <div className="space-y-3">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Kembangkan Usaha Anda dengan Adopsi QRIS yang Aman
          </h1>
          <p className="text-slate-600 text-base leading-relaxed">
            Pelajari cara aman mengadopsi transaksi digital, selesaikan misi harian, kumpulkan poin, dan tukarkan dengan hadiah perlengkapan usaha Anda.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <Card variant="accent" className="space-y-1.5">
            <BookOpen className="w-5 h-5 text-sky-600" />
            <h3 className="font-bold text-sm text-slate-900">Belajar Cepat</h3>
            <p className="text-xs text-slate-600">Materi ringkas 2 menit & kuis berhadiah XP.</p>
          </Card>
          <Card variant="accent" className="space-y-1.5">
            <Gift className="w-5 h-5 text-amber-600" />
            <h3 className="font-bold text-sm text-slate-900">Tukar Hadiah</h3>
            <p className="text-xs text-slate-600">Pulsa, voucher belanja, dan merchandise usaha.</p>
          </Card>
        </div>
      </div>

      <div className="space-y-3 pb-4">
        <Link href="/register" className="block w-full">
          <Button variant="primary" size="lg" className="w-full">
            Daftar Sekarang (Gratis)
          </Button>
        </Link>
        <Link href="/login" className="block w-full">
          <Button variant="outline" size="md" className="w-full">
            Sudah Punya Akun? Masuk
          </Button>
        </Link>
        <p className="text-center text-xs text-slate-400">
          Pindaiin aman, bebas biaya, dan menjamin privasi data Anda.
        </p>
      </div>
    </div>
  );
}

