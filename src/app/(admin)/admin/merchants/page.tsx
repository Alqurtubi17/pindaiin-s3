// src/app/(admin)/admin/merchants/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  KeyRound,
  CheckCircle2,
  X,
  Copy,
  Check,
  Eye,
  EyeOff,
  Dices,
  Phone,
  Mail,
  MapPin,
  Tag,
  ShieldCheck,
  Ban,
  UserCheck,
  Store,
  Award,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { usePageTitle } from '@/lib/utils/use-page-title';
import {
  AdminMerchantItem,
  INITIAL_MERCHANTS,
  getAdminMerchants,
  directResetMerchantPassword,
  toggleMerchantStatus,
  generateRandomPassword,
} from '@/modules/merchants/admin-merchants.service';

export default function AdminMerchantsPage() {
  usePageTitle('Kelola Data Merchant');

  const [merchants, setMerchants] = useState<AdminMerchantItem[]>(INITIAL_MERCHANTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended'>('all');
  const [notification, setNotification] = useState<string | null>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  // Modal Reset Password states
  const [selectedMerchant, setSelectedMerchant] = useState<AdminMerchantItem | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setMerchants(getAdminMerchants());
  }, []);

  // Reset page saat user mencari atau memfilter
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, pageSize]);

  const showSuccess = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleOpenResetModal = (merchant: AdminMerchantItem) => {
    setSelectedMerchant(merchant);
    setNewPassword(generateRandomPassword());
    setShowPassword(true);
    setIsCopied(false);
  };

  const handleGenerateRandom = () => {
    setNewPassword(generateRandomPassword());
    setIsCopied(false);
  };

  const handleCopyToClipboard = () => {
    if (!newPassword) return;
    navigator.clipboard.writeText(newPassword);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleSaveResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMerchant || !newPassword.trim()) return;

    if (newPassword.length < 6) {
      alert('Kata sandi minimal 6 karakter.');
      return;
    }

    setIsSubmitting(true);
    const res = directResetMerchantPassword(selectedMerchant.id, newPassword.trim());
    setIsSubmitting(false);

    if (res.success) {
      showSuccess(res.message);
      setMerchants(getAdminMerchants());
      setSelectedMerchant(null);
    } else {
      alert(res.message);
    }
  };

  const handleToggleStatus = (merchantId: string) => {
    const updated = toggleMerchantStatus(merchantId);
    setMerchants(updated);
    showSuccess('Status akun pedagang berhasil diperbarui.');
  };

  // Filter merchants
  const filteredMerchants = merchants.filter((m) => {
    const matchesSearch =
      m.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.regency.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.businessCategory.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' ? true : m.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Perhitungan Pagination
  const totalItems = filteredMerchants.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedMerchants = filteredMerchants.slice(startIndex, startIndex + pageSize);

  // Metrik Statistik
  const totalActive = merchants.filter((m) => m.status === 'active').length;
  const activePercentage = merchants.length > 0 ? Math.round((totalActive / merchants.length) * 100) : 0;
  const uniqueRegencies = Array.from(new Set(merchants.map((m) => m.regency))).length;
  const totalXpSum = merchants.reduce((acc, curr) => acc + (curr.currentXp || 0), 0);
  const averageLevel = merchants.length > 0
    ? (merchants.reduce((acc, curr) => acc + (curr.level || 1), 0) / merchants.length).toFixed(1)
    : '1.0';

  return (
    <div className="space-y-6">
      {/* Header Halaman Bersih Tanpa Badge Slop */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Kelola Merchant & Akun Pedagang
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Data profil pelaku usaha, verifikasi akun, dan bantuan pengaturan ulang kata sandi
          </p>
        </div>
      </div>

      {notification && (
        <div className="p-3.5 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Ringkasan Metrik Statistik Menarik & Informatif */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1: Total Merchant */}
        <Card className="p-4 bg-white border border-slate-200/80 rounded-2xl shadow-xs flex items-center justify-between gap-3">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500">Total Pelaku Usaha</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-extrabold text-slate-900">{merchants.length}</span>
              <span className="text-xs text-slate-500 font-medium">Merchant</span>
            </div>
            <p className="text-[11px] text-sky-600 font-medium flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-sky-600" />
              <span>Terdaftar di platform</span>
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-sky-50 text-sky-600 border border-sky-100 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
        </Card>

        {/* Card 2: Merchant Aktif */}
        <Card className="p-4 bg-white border border-slate-200/80 rounded-2xl shadow-xs flex items-center justify-between gap-3">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500">Kesiapan QRIS</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-extrabold text-emerald-700">{totalActive}</span>
              <span className="text-xs text-emerald-600 font-bold">Aktif</span>
            </div>
            <p className="text-[11px] text-emerald-700 font-medium">
              {activePercentage}% akun dalam status aktif
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
            <Store className="w-5 h-5" />
          </div>
        </Card>

        {/* Card 3: Sebaran Wilayah */}
        <Card className="p-4 bg-white border border-slate-200/80 rounded-2xl shadow-xs flex items-center justify-between gap-3">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500">Sebaran Wilayah</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-extrabold text-amber-700">{uniqueRegencies}</span>
              <span className="text-xs text-slate-500 font-medium">Kab / Kota</span>
            </div>
            <p className="text-[11px] text-amber-700 font-medium">
              Area pilot riset Jawa Timur
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center shrink-0">
            <MapPin className="w-5 h-5" />
          </div>
        </Card>

        {/* Card 4: Gamifikasi & Poin */}
        <Card className="p-4 bg-white border border-slate-200/80 rounded-2xl shadow-xs flex items-center justify-between gap-3">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500">Rata-rata Gamifikasi</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-extrabold text-indigo-700">Lv. {averageLevel}</span>
              <span className="text-xs text-slate-500 font-medium">Usaha</span>
            </div>
            <p className="text-[11px] text-indigo-600 font-medium">
              {totalXpSum.toLocaleString('id-ID')} Total Akumulasi XP
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center shrink-0">
            <Award className="w-5 h-5" />
          </div>
        </Card>
      </div>

      {/* Bar Pencarian & Filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 bg-white p-3 rounded-2xl border border-slate-200/90 shadow-xs">
        <div className="relative w-full sm:flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari toko, nama pemilik, email, kategori, atau kabupaten..."
            className="w-full h-10 pl-9 pr-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-semibold text-slate-500 shrink-0">Status:</span>
          <select
            className="flex-1 sm:flex-none h-10 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'suspended')}
          >
            <option value="all">Semua Status</option>
            <option value="active">Aktif Saja</option>
            <option value="suspended">Dinonaktifkan</option>
          </select>
        </div>
      </div>

      {/* Daftar Merchant dengan Data Terpaginasi */}
      <div className="space-y-3">
        {paginatedMerchants.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 text-slate-400 space-y-2">
            <Users className="w-8 h-8 mx-auto text-slate-300" />
            <p className="text-xs font-medium">Tidak ada data pedagang yang cocok dengan kriteria pencarian.</p>
          </div>
        ) : (
          paginatedMerchants.map((merchant) => (
            <Card
              key={merchant.id}
              className="p-4 bg-white border border-slate-200/80 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:border-slate-300 transition-all shadow-xs"
            >
              {/* Kolom Informasi Toko & Pemilik */}
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h3 className="font-bold text-sm text-slate-900 tracking-tight truncate">
                    {merchant.businessName}
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                    Lv. {merchant.level} • {merchant.currentXp} XP
                  </span>
                  {merchant.status === 'active' ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Aktif
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                      Dinonaktifkan
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-1 gap-x-4 text-xs text-slate-500 pt-0.5">
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-medium text-slate-700 truncate">{merchant.displayName}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{merchant.email}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{merchant.phone}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{merchant.businessCategory}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>Kab/Kota {merchant.regency}</span>
                  </div>
                  {merchant.lastPasswordResetAt && (
                    <div className="text-[11px] text-amber-600 font-medium">
                      Reset sandi: {new Date(merchant.lastPasswordResetAt).toLocaleDateString('id-ID')}
                    </div>
                  )}
                </div>
              </div>

              {/* Tombol Aksi Admin */}
              <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                {/* Tombol Bantu Reset Password Langsung */}
                <Button
                  type="button"
                  size="sm"
                  variant="primary"
                  className="bg-sky-600 hover:bg-sky-700 text-white text-xs flex items-center gap-1.5 rounded-xl shadow-xs font-semibold"
                  onClick={() => handleOpenResetModal(merchant)}
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Bantu Reset Sandi</span>
                </Button>

                {/* Tombol Suspend / Aktifkan */}
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className={`text-xs flex items-center gap-1.5 rounded-xl ${
                    merchant.status === 'active'
                      ? 'text-slate-600 hover:text-rose-600 hover:bg-rose-50'
                      : 'text-emerald-700 hover:bg-emerald-50 border-emerald-200'
                  }`}
                  onClick={() => handleToggleStatus(merchant.id)}
                  title={merchant.status === 'active' ? 'Nonaktifkan Akun' : 'Aktifkan Akun'}
                >
                  {merchant.status === 'active' ? (
                    <>
                      <Ban className="w-3.5 h-3.5" />
                      <span>Nonaktifkan</span>
                    </>
                  ) : (
                    <>
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Aktifkan</span>
                    </>
                  )}
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* ================================================================= */}
      {/* KONTROL PAGINATION INTERAKTIF */}
      {/* ================================================================= */}
      {totalItems > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs text-xs">
          <div className="text-slate-500 font-medium">
            Menampilkan <strong className="text-slate-800">{startIndex + 1}</strong> –{' '}
            <strong className="text-slate-800">{Math.min(startIndex + pageSize, totalItems)}</strong> dari{' '}
            <strong className="text-slate-800">{totalItems}</strong> merchant
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500">Tampilkan:</span>
              <select
                className="h-8 px-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-sky-500"
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
              >
                <option value={5}>5 per halaman</option>
                <option value={10}>10 per halaman</option>
                <option value={20}>20 per halaman</option>
              </select>
            </div>

            {/* Tombol Halaman */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                title="Halaman Sebelumnya"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {Array.from({ length: totalPages }).map((_, idx) => {
                const pageNum = idx + 1;
                return (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                      currentPage === pageNum
                        ? 'bg-sky-600 text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                title="Halaman Selanjutnya"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* MODAL RESET KATA SANDI LANGSUNG OLEH ADMIN */}
      {/* ================================================================= */}
      {selectedMerchant && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-700 border border-sky-100 flex items-center justify-center font-bold">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900">Bantu Reset Kata Sandi</h4>
                  <p className="text-[11px] text-slate-500">Atur ulang kata sandi pedagang secara langsung</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedMerchant(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Profil Pedagang yang Direset */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Nama Toko:</span>
                <strong className="text-slate-900">{selectedMerchant.businessName}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Pemilik:</span>
                <span className="text-slate-800 font-medium">{selectedMerchant.displayName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Alamat Email:</span>
                <span className="font-mono text-slate-700">{selectedMerchant.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">No. WhatsApp:</span>
                <span className="text-slate-700 font-medium">{selectedMerchant.phone}</span>
              </div>
            </div>

            <form onSubmit={handleSaveResetPassword} className="space-y-3.5">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700">Kata Sandi Baru</label>
                  <button
                    type="button"
                    onClick={handleGenerateRandom}
                    className="text-[11px] font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1 hover:underline"
                  >
                    <Dices className="w-3.5 h-3.5" />
                    <span>Buat Sandi Acak</span>
                  </button>
                </div>

                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    className="w-full h-10 pl-3 pr-20 text-xs font-mono font-bold bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-900"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                  <div className="absolute right-2 top-2 flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="p-1 text-slate-400 hover:text-slate-600"
                      title={showPassword ? 'Sembunyikan' : 'Tampilkan'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    <button
                      type="button"
                      onClick={handleCopyToClipboard}
                      className="p-1 text-sky-600 hover:text-sky-700"
                      title="Salin kata sandi"
                    >
                      {isCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                {isCopied && (
                  <p className="text-[10px] text-emerald-600 font-semibold">Kata sandi berhasil disalin ke clipboard!</p>
                )}
              </div>

              <div className="p-3 bg-amber-50/80 border border-amber-200/80 rounded-xl text-[11px] text-amber-900 space-y-1">
                <div className="flex items-center gap-1 font-bold">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                  <span>Petunjuk Penggunaan:</span>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  Setelah menekan <strong>Simpan & Terapkan</strong>, kata sandi pedagang akan langsung aktif. Bagikan kata sandi baru ini kepada pedagang melalui WhatsApp/SMS agar mereka dapat segera masuk kembali.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-xs rounded-xl"
                  onClick={() => setSelectedMerchant(null)}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  className="text-xs bg-sky-600 hover:bg-sky-700 text-white font-semibold flex items-center gap-1.5 rounded-xl"
                  isLoading={isSubmitting}
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Simpan & Terapkan Kata Sandi</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
