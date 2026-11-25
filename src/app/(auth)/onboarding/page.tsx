// src/app/(auth)/onboarding/page.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { handleSaveMerchantProfile } from '@/modules/auth/auth.actions';
import { QrisStatus } from '@/types/database.types';
import { getStoredCategories } from '@/modules/merchants/categories.service';
import { usePageTitle } from '@/lib/utils/use-page-title';
import { setMerchantSession } from '@/modules/auth/merchant-session';

export default function OnboardingPage() {
  usePageTitle('Lengkapi Profil Usaha');
  const router = useRouter();
  const [categories, setCategories] = useState<string[]>([]);
  const [businessName, setBusinessName] = useState('');
  const [businessCategory, setBusinessCategory] = useState('Kelontong & Sembako');
  const [customCategory, setCustomCategory] = useState('');
  const [regency, setRegency] = useState('Jember');

  React.useEffect(() => {
    setCategories(getStoredCategories());
  }, []);
  const [district, setDistrict] = useState('');
  const [ruralLocality, setRuralLocality] = useState('');
  const [qrisStatus, setQrisStatus] = useState<QrisStatus>('not_active');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    const finalCategory =
      businessCategory === 'Lainnya' ? (customCategory.trim() || 'Lainnya') : businessCategory;

    const res = await handleSaveMerchantProfile({
      businessName,
      businessCategory: finalCategory,
      province: 'Jawa Timur',
      regency,
      district,
      ruralLocality,
      qrisStatus,
    });

    setIsLoading(false);

    if (!res.success) {
      setErrorMsg(res.message);
      return;
    }

    setMerchantSession({
      email: 'pedagang@digiumkm.id',
      mode: 'merchant',
      loggedInAt: new Date().toISOString(),
    });
    router.push('/dashboard');
  };

  return (
    <Card variant="elevated" className="space-y-5">
      <div className="border-b border-slate-100 pb-3">
        <h2 className="text-lg font-bold text-slate-800">Profil Usaha Anda</h2>
        <p className="text-xs text-slate-500">Lengkapi data usaha untuk mulai menggunakan Pindaiin</p>
      </div>

      {errorMsg && (
        <div className="p-3 text-sm text-red-700 bg-red-50 rounded-xl border border-red-200">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Nama Usaha / Toko"
          required
          placeholder="contoh: Warung Berkah"
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
        />

        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-slate-700">Kategori Usaha</label>
          <select
            className="w-full h-10 px-3 rounded-lg border border-slate-300 bg-white text-sm text-slate-900 focus:ring-2 focus:ring-sky-500"
            value={businessCategory}
            onChange={(e) => setBusinessCategory(e.target.value)}
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
            <option value="Lainnya">Lainnya (Ketik Sendiri)</option>
          </select>

          {businessCategory === 'Lainnya' && (
            <div className="pt-1.5 space-y-1">
              <input
                type="text"
                required
                placeholder="Ketik kategori usaha Anda (contoh: Kerajinan Anyaman)"
                className="w-full h-10 px-3 rounded-lg border border-sky-400 bg-sky-50/50 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 placeholder:text-slate-400"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
              />
              <p className="text-[11px] text-sky-700 font-medium">Tuliskan bidang usaha toko Anda.</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-700">Kabupaten/Kota</label>
            <select
              className="w-full h-10 px-3 rounded-lg border border-slate-300 bg-white text-sm text-slate-900 focus:ring-2 focus:ring-sky-500"
              value={regency}
              onChange={(e) => setRegency(e.target.value)}
            >
              <option value="Jember">Jember</option>
              <option value="Banyuwangi">Banyuwangi</option>
              <option value="Bondowoso">Bondowoso</option>
              <option value="Situbondo">Situbondo</option>
              <option value="Lumajang">Lumajang</option>
              <option value="Malang">Malang</option>
              <option value="Lainnya">Lainnya (Jawa Timur)</option>
            </select>
          </div>

          <Input
            label="Kecamatan"
            placeholder="contoh: Ambulu"
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
          />
        </div>

        <Input
          label="Desa / Kelurahan"
          placeholder="contoh: Tegalsari"
          value={ruralLocality}
          onChange={(e) => setRuralLocality(e.target.value)}
        />

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-slate-800">
            Apakah saat ini usaha Anda sudah menerima QRIS?
          </label>
          <div className="space-y-2 pt-1">
            <label className="flex items-center gap-3 p-3 border rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
              <input
                type="radio"
                name="qrisStatus"
                value="not_active"
                checked={qrisStatus === 'not_active'}
                onChange={() => setQrisStatus('not_active')}
                className="w-4 h-4 text-sky-600"
              />
              <span className="text-sm text-slate-700">Belum pernah punya QRIS</span>
            </label>

            <label className="flex items-center gap-3 p-3 border rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
              <input
                type="radio"
                name="qrisStatus"
                value="active"
                checked={qrisStatus === 'active'}
                onChange={() => setQrisStatus('active')}
                className="w-4 h-4 text-sky-600"
              />
              <span className="text-sm text-slate-700">Sudah punya stiker/aplikasi QRIS aktif</span>
            </label>

            <label className="flex items-center gap-3 p-3 border rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
              <input
                type="radio"
                name="qrisStatus"
                value="applied"
                checked={qrisStatus === 'applied'}
                onChange={() => setQrisStatus('applied')}
                className="w-4 h-4 text-sky-600"
              />
              <span className="text-sm text-slate-700">Sudah mendaftar, sedang menunggu proses</span>
            </label>
          </div>
        </div>

        <Button type="submit" variant="primary" size="md" className="w-full mt-2" isLoading={isLoading}>
          Simpan Profil & Masuk Dashboard
        </Button>
      </form>
    </Card>
  );
}

