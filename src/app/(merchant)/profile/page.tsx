// src/app/(merchant)/profile/page.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  User,
  Store,
  Award,
  ShieldCheck,
  LogOut,
  Edit3,
  Camera,
  CheckCircle2,
  X,
  MapPin,
  Tag,
  Phone,
  Lock,
  Sparkles,
  Flame,
  Star,
} from 'lucide-react';
import { BADGE_DEFINITIONS } from '@/modules/gamification/badge.service';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { usePageTitle } from '@/lib/utils/use-page-title';
import { getStoredCategories } from '@/modules/merchants/categories.service';
import { clearMerchantSession } from '@/modules/auth/merchant-session';

interface MerchantProfileData {
  displayName: string;
  businessName: string;
  businessCategory: string;
  regency: string;
  province: string;
  phone: string;
  storePhotoUrl: string | null;
  qrisStatus: string;
}

const DEFAULT_PROFILE: MerchantProfileData = {
  displayName: 'Siti Aminah',
  businessName: 'Warung Berkah Bu Siti',
  businessCategory: 'Kelontong & Sembako',
  regency: 'Jember',
  province: 'Jawa Timur',
  phone: '081234567890',
  storePhotoUrl: null,
  qrisStatus: 'active',
};

const CATEGORIES = [
  'Kelontong & Sembako',
  'Makanan & Minuman',
  'Warung Kopi & Kuliner',
  'Pakaian & Fashion',
  'Pulsa & Konter HP',
  'Pertanian & Peternakan',
  'Jasa & Servis',
  'Lainnya',
];

const REGENCIES_JATIM = [
  'Banyuwangi',
  'Blitar',
  'Bondowoso',
  'Jember',
  'Kediri',
  'Lumajang',
  'Madiun',
  'Magetan',
  'Malang',
  'Mojokerto',
  'Nganjuk',
  'Ngawi',
  'Pacitan',
  'Pamekasan',
  'Pasuruan',
  'Ponorogo',
  'Probolinggo',
  'Sampang',
  'Sidoarjo',
  'Situbondo',
  'Sumenep',
  'Surabaya',
  'Trenggalek',
  'Tuban',
  'Tulungagung',
];

export default function ProfilePage() {
  usePageTitle('Profil Usaha');
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<MerchantProfileData>(DEFAULT_PROFILE);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<MerchantProfileData>(DEFAULT_PROFILE);
  const [notification, setNotification] = useState<string | null>(null);

  // Kategori usaha dari master data admin & opsi ketik sendiri
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategoryOption, setSelectedCategoryOption] = useState<string>('Kelontong & Sembako');
  const [customCategory, setCustomCategory] = useState<string>('');

  // Muat data dari localStorage jika ada
  useEffect(() => {
    try {
      const catList = getStoredCategories();
      setCategories(catList);

      const saved = localStorage.getItem('digiumkm_merchant_profile');
      if (saved) {
        const parsed = JSON.parse(saved);
        setProfile(parsed);
        setEditForm(parsed);
      }
    } catch {
      // Abaikan jika SSR / error parsing
    }
  }, []);

  const handleOpenEdit = () => {
    setEditForm(profile);
    const catList = getStoredCategories();
    setCategories(catList);

    if (catList.includes(profile.businessCategory)) {
      setSelectedCategoryOption(profile.businessCategory);
      setCustomCategory('');
    } else {
      setSelectedCategoryOption('Lainnya');
      setCustomCategory(profile.businessCategory);
    }

    setIsEditing(true);
    setNotification(null);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('Ukuran foto maksimal 2 MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setEditForm((prev) => ({
        ...prev,
        storePhotoUrl: reader.result as string,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const finalCategory =
      selectedCategoryOption === 'Lainnya'
        ? (customCategory.trim() || 'Lainnya')
        : selectedCategoryOption;

    const updated: MerchantProfileData = {
      ...editForm,
      businessCategory: finalCategory,
    };

    setProfile(updated);
    try {
      localStorage.setItem('digiumkm_merchant_profile', JSON.stringify(updated));
    } catch {
      // Storage quota exceeded or disabled
    }
    setIsEditing(false);
    setNotification('Profil dan foto toko berhasil diperbarui.');
    setTimeout(() => setNotification(null), 3000);
  };

  // Contoh badge yang sudah diraih
  const unlockedBadges = ['FIRST_QRIS_CLAIM', 'SAFETY_CHAMPION'];

  const renderBadgeIcon = (code: string, isUnlocked: boolean) => {
    const colorClass = isUnlocked ? 'text-amber-600' : 'text-slate-400';
    switch (code) {
      case 'FIRST_QRIS_CLAIM':
        return <Sparkles className={`w-5 h-5 ${isUnlocked ? 'text-sky-600' : 'text-slate-400'}`} />;
      case 'SAFETY_CHAMPION':
        return <ShieldCheck className={`w-5 h-5 ${isUnlocked ? 'text-emerald-600' : 'text-slate-400'}`} />;
      case 'STREAK_3_DAYS':
        return <Flame className={`w-5 h-5 ${isUnlocked ? 'text-orange-500' : 'text-slate-400'}`} />;
      default:
        return <Star className={`w-5 h-5 ${colorClass}`} />;
    }
  };

  return (
    <div className="space-y-4 pb-6">
      {notification && (
        <div className="p-3 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* 1. Kartu Profil Utama & Foto Toko */}
      <div className="rounded-2xl bg-white border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="h-14 bg-gradient-to-r from-sky-600 via-sky-700 to-indigo-700" />
        <div className="px-4 pb-4">
          <div className="flex items-end justify-between gap-3 -mt-8 mb-3">
            {/* Foto Toko / Avatar Inisial */}
            <div className="relative shrink-0">
              {profile.storePhotoUrl ? (
                <div className="w-16 h-16 rounded-2xl overflow-hidden border-[3px] border-white shadow-sm bg-slate-100">
                  <img
                    src={profile.storePhotoUrl}
                    alt={profile.businessName}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-2xl border-[3px] border-white bg-sky-600 text-white font-extrabold text-xl flex items-center justify-center shadow-sm">
                  {profile.displayName.slice(0, 2).toUpperCase()}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleOpenEdit}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-2xs transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5 text-slate-500" />
              <span>Edit Profil</span>
            </button>
          </div>

          <div className="space-y-1.5">
            <h2 className="text-base font-extrabold text-slate-900 leading-tight">
              {profile.businessName}
            </h2>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600">
              <span className="inline-flex items-center gap-1 font-medium">
                <User className="w-3.5 h-3.5 text-slate-400" />
                {profile.displayName}
              </span>
              {profile.phone && (
                <span className="inline-flex items-center gap-1 text-slate-500">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  {profile.phone}
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500 pt-0.5">
              <span className="inline-flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-slate-400" />
                {profile.businessCategory}
              </span>
              <span className="inline-flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {profile.regency}, {profile.province}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Modal / Form Edit Profil & Foto Toko */}
      {isEditing && (
        <Card className="p-4 bg-white border border-sky-200 rounded-xl space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <Edit3 className="w-4 h-4 text-sky-600" />
              <span>Edit Profil & Foto Toko</span>
            </h3>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-md"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-3.5">
            {/* Foto Toko Upload */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Foto Toko / Usaha</label>
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden shrink-0">
                  {editForm.storePhotoUrl ? (
                    <img
                      src={editForm.storePhotoUrl}
                      alt="Pratinjau Toko"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Store className="w-6 h-6 text-slate-400" />
                  )}
                </div>
                <div className="space-y-1">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoUpload}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-xs flex items-center gap-1.5"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Camera className="w-3.5 h-3.5 text-slate-600" />
                    <span>Pilih Foto Toko</span>
                  </Button>
                  {editForm.storePhotoUrl && (
                    <button
                      type="button"
                      className="text-[11px] text-red-600 hover:underline block"
                      onClick={() => setEditForm((prev) => ({ ...prev, storePhotoUrl: null }))}
                    >
                      Hapus Foto
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Nama Pemilik Usaha */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Nama Pemilik Usaha</label>
              <input
                type="text"
                required
                className="w-full h-9 px-3 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white text-slate-900"
                value={editForm.displayName}
                onChange={(e) => setEditForm((prev) => ({ ...prev, displayName: e.target.value }))}
              />
            </div>

            {/* Nama Toko/Usaha */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Nama Toko / Usaha</label>
              <input
                type="text"
                required
                className="w-full h-9 px-3 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white text-slate-900"
                value={editForm.businessName}
                onChange={(e) => setEditForm((prev) => ({ ...prev, businessName: e.target.value }))}
              />
            </div>

            {/* Kategori Usaha & Wilayah Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Kategori Usaha</label>
                <select
                  className="w-full h-9 px-2.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white text-slate-900"
                  value={selectedCategoryOption}
                  onChange={(e) => {
                    setSelectedCategoryOption(e.target.value);
                    if (e.target.value !== 'Lainnya') {
                      setEditForm((prev) => ({ ...prev, businessCategory: e.target.value }));
                    }
                  }}
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                  <option value="Lainnya">Lainnya (Ketik Sendiri)</option>
                </select>

                {selectedCategoryOption === 'Lainnya' && (
                  <div className="pt-1.5 space-y-1">
                    <input
                      type="text"
                      required
                      placeholder="Ketik kategori usaha Anda (contoh: Kerajinan Bambu)"
                      className="w-full h-9 px-3 text-xs rounded-lg border border-sky-400 bg-sky-50/50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 placeholder:text-slate-400"
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                    />
                    <p className="text-[10px] text-sky-700 font-medium">Kategori usaha kustom akan disimpan ke profil Anda.</p>
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Kabupaten / Kota</label>
                <select
                  className="w-full h-9 px-2.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white text-slate-900"
                  value={editForm.regency}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, regency: e.target.value }))}
                >
                  {REGENCIES_JATIM.map((reg) => (
                    <option key={reg} value={reg}>
                      {reg}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* No Telepon / WhatsApp */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Nomor WhatsApp / HP</label>
              <input
                type="tel"
                placeholder="0812xxxx"
                className="w-full h-9 px-3 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white text-slate-900"
                value={editForm.phone}
                onChange={(e) => setEditForm((prev) => ({ ...prev, phone: e.target.value }))}
              />
            </div>

            {/* Tombol Aksi Simpan / Batal */}
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => setIsEditing(false)}
              >
                Batal
              </Button>
              <Button type="submit" variant="primary" size="sm" className="text-xs bg-sky-600 hover:bg-sky-700">
                Simpan Perubahan
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* 3. Bagian Lencana Prestasi (Badges) */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
            <Award className="w-4 h-4 text-amber-600" />
            <span>Pencapaian Toko</span>
          </h3>
          <span className="text-xs font-semibold text-slate-500">
            {unlockedBadges.length} dari {BADGE_DEFINITIONS.length} diraih
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {BADGE_DEFINITIONS.map((badge) => {
            const isUnlocked = unlockedBadges.includes(badge.code);

            return (
              <div
                key={badge.code}
                className={`rounded-2xl border p-3.5 space-y-2 transition-colors ${
                  isUnlocked
                    ? 'bg-white border-slate-200/90 shadow-2xs'
                    : 'bg-slate-50/80 border-slate-200/70 text-slate-400'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                      isUnlocked ? 'bg-amber-50 border border-amber-100' : 'bg-slate-100'
                    }`}
                  >
                    {renderBadgeIcon(badge.code, isUnlocked)}
                  </div>
                  {isUnlocked ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" aria-label="Sudah diraih" />
                  ) : (
                    <Lock className="w-3.5 h-3.5 text-slate-400" aria-label="Belum terbuka" />
                  )}
                </div>
                <div className="space-y-0.5">
                  <h4 className={`font-bold text-xs leading-snug ${isUnlocked ? 'text-slate-900' : 'text-slate-600'}`}>
                    {badge.name}
                  </h4>
                  <p className="text-[11px] text-slate-500 leading-snug line-clamp-2">
                    {badge.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Keamanan & Aksi Akun */}
      <div className="rounded-2xl bg-white border border-slate-200/90 divide-y divide-slate-100 overflow-hidden shadow-2xs">
        <div className="p-4 flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div className="space-y-0.5">
            <h3 className="text-xs font-bold text-slate-900">Privasi & Keamanan Akun</h3>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Pindaiin menjaga kerahasiaan data usaha Anda dan tidak pernah meminta PIN, kode OTP, atau kata sandi perbankan.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            clearMerchantSession();
            router.push('/login');
          }}
          className="w-full px-4 py-3.5 flex items-center justify-center gap-2 text-xs font-bold text-rose-600 hover:bg-rose-50/70 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Keluar dari Akun</span>
        </button>
      </div>
    </div>
  );
}
