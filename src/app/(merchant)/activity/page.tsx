// src/app/(merchant)/activity/page.tsx
'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  PlusCircle,
  CheckCircle2,
  Clock,
  XCircle,
  QrCode,
  Send,
  Camera,
  Image as ImageIcon,
  X,
  Loader2,
  Award,
} from 'lucide-react';
import {
  PaymentActivityWithMerchant,
  getCachedActivities,
  fetchActivitiesApi,
  submitActivityApi,
} from '@/modules/payment-activity/activity.service';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatSimpleDate } from '@/lib/utils/format';
import { usePageTitle } from '@/lib/utils/use-page-title';

export default function PaymentActivityPage() {
  usePageTitle('Aktivitas QRIS');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activities, setActivities] = useState<PaymentActivityWithMerchant[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [activityDate, setActivityDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [reportedCount, setReportedCount] = useState<number>(3);
  const [notes, setNotes] = useState('');
  const [evidencePhoto, setEvidencePhoto] = useState<string | null>(null);
  const [declarationAccepted, setDeclarationAccepted] = useState(false);
  const [previewModalImg, setPreviewModalImg] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const loadData = useCallback(async () => {
    try {
      const data = await fetchActivitiesApi();
      setActivities(data);
    } catch {
      setActivities(getCachedActivities());
    }
  }, []);

  useEffect(() => {
    setActivities(getCachedActivities());
    loadData();

    const handleSync = () => {
      setActivities(getCachedActivities());
    };
    window.addEventListener('storage', handleSync);
    window.addEventListener('digiumkm_activity_synced', handleSync);

    return () => {
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('digiumkm_activity_synced', handleSync);
    };
  }, [loadData]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      alert('Ukuran foto bukti transaksi maksimal 3 MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setEvidencePhoto(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setNotification(null);
    setIsSubmitting(true);

    try {
      const res = await submitActivityApi('e0000000-0000-0000-0000-000000000001', {
        activityDate,
        activityType: 'qris_in_store',
        reportedCount: Number(reportedCount),
        declarationAccepted,
        notes: notes || undefined,
        evidencePhotoUrl: evidencePhoto || undefined,
      });

      if (res.success && res.activity) {
        setNotification({ text: res.message, type: 'success' });
        setShowForm(false);
        setDeclarationAccepted(false);
        setNotes('');
        setEvidencePhoto(null);
        await loadData();
      } else {
        setNotification({ text: res.error || res.message, type: 'error' });
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Gagal mengirim laporan';
      setNotification({ text: errorMsg, type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
    <div className="space-y-4 pb-6">
      {notification && (
        <div
          className={`p-3.5 rounded-xl text-xs font-semibold border flex items-center gap-2 ${
            notification.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-red-50 text-red-800 border-red-200'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <XCircle className="w-4 h-4 text-red-600 shrink-0" />
          )}
          <span>{notification.text}</span>
        </div>
      )}

      {/* Hero Banner Pelaporan QRIS */}
      {!showForm ? (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-sky-600 via-sky-700 to-indigo-800 p-5 text-white shadow-md shadow-sky-900/15">
          <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-xl" />
          <div className="relative space-y-3.5">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-100">
                <QrCode className="w-4 h-4" />
                <span>Aktivitas Pembayaran QRIS</span>
              </div>
              <h2 className="text-lg font-extrabold tracking-tight leading-snug">
                Terima Pembayaran Hari Ini?
              </h2>
              <p className="text-xs text-sky-100/90 leading-relaxed">
                Catat transaksi QRIS toko Anda dan lampirkan bukti untuk meraih bonus poin XP.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-white hover:bg-sky-50 text-sky-700 px-4 py-2.5 text-xs font-bold shadow-xs transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Lapor Transaksi Sekarang</span>
            </button>
          </div>
        </div>
      ) : (
        /* Form Pelaporan Transaksi dengan Bukti Foto */
        <Card className="p-5 space-y-4 border border-sky-300 shadow-md rounded-xl bg-white">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-slate-900">Form Laporan Transaksi QRIS</h3>
              <p className="text-xs text-slate-500">Catat perkiraan transaksi dan unggah bukti pembayaran QRIS</p>
            </div>
            <button
              type="button"
              className="text-xs text-slate-400 hover:text-slate-600 font-bold p-1"
              onClick={() => setShowForm(false)}
            >
              ✕ Tutup
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Tanggal Transaksi"
              type="date"
              required
              value={activityDate}
              onChange={(e) => setActivityDate(e.target.value)}
            />

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">
                Jumlah Transaksi QRIS yang Diterima
              </label>
              <input
                type="number"
                min={1}
                max={50}
                required
                className="w-full h-10 px-3 rounded-lg border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                value={reportedCount}
                onChange={(e) => setReportedCount(Number(e.target.value))}
              />
              <p className="text-[11px] text-slate-500">Berapa kali pembeli membayar dengan scan kode QRIS hari ini?</p>
            </div>

            {/* Input Foto Bukti Transaksi QRIS */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Foto Bukti Transaksi QRIS (Struk / Notifikasi / Foto Kasir)
              </label>

              {evidencePhoto ? (
                <div className="relative rounded-xl border border-sky-200 p-2 bg-sky-50/50 flex items-center gap-3">
                  <img
                    src={evidencePhoto}
                    alt="Bukti Transaksi"
                    className="w-16 h-16 rounded-lg object-cover border border-slate-200 bg-white"
                  />
                  <div className="flex-1 space-y-0.5">
                    <p className="text-xs font-bold text-slate-800">Foto bukti berhasil dilampirkan</p>
                    <p className="text-[11px] text-slate-500">Foto siap diverifikasi oleh admin.</p>
                  </div>
                  <button
                    type="button"
                    className="p-1.5 rounded-lg text-red-500 hover:bg-red-50"
                    onClick={() => setEvidencePhoto(null)}
                    title="Hapus foto"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-slate-300 hover:border-sky-400 rounded-xl p-4 text-center space-y-2 bg-slate-50/50">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoUpload}
                  />
                  <Camera className="w-6 h-6 text-slate-400 mx-auto" />
                  <div>
                    <button
                      type="button"
                      className="text-xs font-semibold text-sky-600 hover:underline"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Unggah Foto Bukti Transaksi
                    </button>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Format JPG/PNG maksimal 3 MB. Data rekening sensitif dirahasiakan.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <Input
              label="Catatan Usaha (Opsional)"
              placeholder="contoh: Ramai pembeli sembako pagi hari"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />

            {/* Checklist Deklarasi Kejujuran */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  className="mt-0.5 w-4 h-4 rounded text-sky-600 focus:ring-sky-500"
                  checked={declarationAccepted}
                  onChange={(e) => setDeclarationAccepted(e.target.checked)}
                  required
                />
                <span className="text-xs text-slate-700 leading-snug font-medium">
                  Saya menyatakan dengan jujur bahwa transaksi pembayaran QRIS tersebut benar-benar terjadi di toko saya.
                </span>
              </label>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Mengirim Laporan...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Kirim Laporan Aktivitas</span>
                </>
              )}
            </Button>
          </form>
        </Card>
      )}

      {/* Riwayat Pelaporan Aktivitas Transaksi */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
            <QrCode className="w-4 h-4 text-sky-600" />
            <span>Riwayat Laporan Aktivitas</span>
          </h3>
          <span className="text-[11px] font-semibold text-slate-500">
            {activities.length} laporan
          </span>
        </div>

        <div className="space-y-2.5">
          {activities.map((item) => {
            const isVerified = item.status === 'verified';
            const isSubmitted = item.status === 'submitted';
            const isRejected = item.status === 'rejected';

            return (
              <div
                key={item.id}
                className={`rounded-2xl bg-white border p-3.5 shadow-2xs transition-all ${
                  isVerified
                    ? 'border-emerald-200/80'
                    : isSubmitted
                    ? 'border-amber-200/80'
                    : 'border-rose-200/80'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${
                      isVerified
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                        : isSubmitted
                        ? 'bg-amber-50 text-amber-600 border-amber-100'
                        : 'bg-rose-50 text-rose-600 border-rose-100'
                    }`}
                  >
                    <QrCode className="w-5 h-5" />
                  </div>

                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[11px] text-slate-500 font-medium">
                          {formatSimpleDate(item.activity_date)}
                        </span>
                        <h4 className="font-bold text-sm text-slate-900 leading-snug">
                          Menerima {item.reported_count} Transaksi QRIS
                        </h4>
                      </div>

                      {isVerified && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full shrink-0">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Terverifikasi
                        </span>
                      )}
                      {isSubmitted && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full shrink-0">
                          <Clock className="w-3 h-3 text-amber-600" />
                          Menunggu Cek
                        </span>
                      )}
                      {isRejected && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-800 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full shrink-0">
                          <XCircle className="w-3 h-3 text-rose-600" />
                          Ditolak
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px]">
                      {item.evidencePhotoUrl ? (
                        <button
                          type="button"
                          className="inline-flex items-center gap-1.5 text-sky-600 hover:text-sky-700 font-semibold"
                          onClick={() => setPreviewModalImg(item.evidencePhotoUrl || null)}
                        >
                          <ImageIcon className="w-3.5 h-3.5" />
                          <span>Lihat Bukti Foto</span>
                        </button>
                      ) : (
                        <span className="text-slate-400">Tanpa lampiran foto</span>
                      )}

                      {isVerified ? (
                        <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                          <Award className="w-3 h-3" />
                          +30 XP Bonus
                        </span>
                      ) : isSubmitted ? (
                        <span className="text-amber-700 font-medium">+20 XP tercatat</span>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>

      {/* Modal Pratinjau Foto Bukti Transaksi */}
      {previewModalImg && (
        <div className="fixed inset-0 z-[100] bg-slate-900/70 backdrop-blur-[1px] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-4 space-y-3 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h4 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-sky-600" />
                <span>Foto Bukti Transaksi QRIS</span>
              </h4>
              <button
                type="button"
                className="p-1 text-slate-400 hover:text-slate-600"
                onClick={() => setPreviewModalImg(null)}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center">
              <img
                src={previewModalImg}
                alt="Pratinjau Foto Bukti"
                className="w-full max-h-72 object-contain"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs"
              onClick={() => setPreviewModalImg(null)}
            >
              Tutup
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
