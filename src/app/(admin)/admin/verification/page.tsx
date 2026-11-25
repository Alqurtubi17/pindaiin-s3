// src/app/(admin)/admin/verification/page.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  CheckSquare,
  CheckCircle2,
  XCircle,
  AlertCircle,
  User,
  Calendar,
  Image as ImageIcon,
  ZoomIn,
  X,
  FileCheck,
  RefreshCw,
  Loader2,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
} from 'lucide-react';
import {
  PaymentActivityWithMerchant,
  SAMPLE_ACTIVITIES,
  getCachedActivities,
  fetchActivitiesApi,
  verifyActivityApi,
  updateActivityApi,
  deleteActivityApi,
  bulkUpdateActivitiesApi,
  bulkDeleteActivitiesApi,
} from '@/modules/payment-activity/activity.service';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatSimpleDate } from '@/lib/utils/format';
import { usePageTitle } from '@/lib/utils/use-page-title';

export default function AdminVerificationPage() {
  usePageTitle('Verifikasi Aktivitas');
  const [activities, setActivities] = useState<PaymentActivityWithMerchant[]>(SAMPLE_ACTIVITIES);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [zoomImage, setZoomImage] = useState<string | null>(null);

  // State Pagination Riwayat
  const [historyPage, setHistoryPage] = useState(1);
  const [historyPageSize, setHistoryPageSize] = useState(5);

  // State Modal Edit
  const [editingItem, setEditingItem] = useState<PaymentActivityWithMerchant | null>(null);
  const [editDate, setEditDate] = useState('');
  const [editCount, setEditCount] = useState(1);
  const [editStatus, setEditStatus] = useState<'verified' | 'rejected'>('verified');
  const [editReason, setEditReason] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // State Modal Hapus
  const [deletingItem, setDeletingItem] = useState<PaymentActivityWithMerchant | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // State Aksi Massal (Bulk Checkbox Actions)
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showBulkEditModal, setShowBulkEditModal] = useState(false);
  const [bulkStatus, setBulkStatus] = useState<'verified' | 'rejected'>('verified');
  const [bulkReason, setBulkReason] = useState('');
  const [isBulkSaving, setIsBulkSaving] = useState(false);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  const loadData = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) setIsRefreshing(true);
    try {
      const data = await fetchActivitiesApi();
      setActivities(data);
    } catch {
      setActivities(getCachedActivities());
    } finally {
      setIsLoading(false);
      if (isManualRefresh) setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    // 1. Muat awal dari cache seketika
    setActivities(getCachedActivities());
    setIsLoading(false);

    // 2. Muat data terbaru dari Neon DB
    loadData();

    // 3. Listener untuk sinkronisasi otomatis antar-tab / event
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

  const pendingList = activities.filter((a) => a.status === 'submitted');
  const historyList = activities.filter((a) => a.status !== 'submitted');

  const handleApprove = async (activity: PaymentActivityWithMerchant) => {
    setProcessingId(activity.id);
    setMessage(null);

    // Optimistic UI update seketika agar UI responsif
    setActivities((prev) =>
      prev.map((a) =>
        a.id === activity.id
          ? {
              ...a,
              status: 'verified',
              verified_by: 'admin-operator-1',
              verified_at: new Date().toISOString(),
            }
          : a
      )
    );

    try {
      const res = await verifyActivityApi(activity.id, 'approve');
      setMessage({ text: res.message, type: 'success' });
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Gagal menyetujui aktivitas';
      setMessage({ text: errorMsg, type: 'error' });
      // Revert / re-sync jika gagal
      loadData();
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectConfirm = async (activity: PaymentActivityWithMerchant) => {
    if (!rejectReason.trim()) {
      setMessage({ text: 'Alasan penolakan wajib dicantumkan sesuai SOP.', type: 'error' });
      return;
    }

    setProcessingId(activity.id);
    setMessage(null);

    // Optimistic UI update
    setActivities((prev) =>
      prev.map((a) =>
        a.id === activity.id
          ? {
              ...a,
              status: 'rejected',
              verified_by: 'admin-operator-1',
              verified_at: new Date().toISOString(),
            }
          : a
      )
    );

    try {
      const res = await verifyActivityApi(activity.id, 'reject', rejectReason);
      setMessage({ text: res.message, type: 'success' });
      setRejectingId(null);
      setRejectReason('');
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Gagal menolak aktivitas';
      setMessage({ text: errorMsg, type: 'error' });
      loadData();
    } finally {
      setProcessingId(null);
    }
  };

  // Kalkulasi Pagination Riwayat
  const totalHistoryItems = historyList.length;
  const totalHistoryPages = Math.max(1, Math.ceil(totalHistoryItems / historyPageSize));
  const historyStartIndex = (historyPage - 1) * historyPageSize;
  const paginatedHistory = historyList.slice(historyStartIndex, historyStartIndex + historyPageSize);

  // Handler Buka Modal Edit
  const handleOpenEdit = (item: PaymentActivityWithMerchant) => {
    setEditingItem(item);
    setEditDate(item.activity_date);
    setEditCount(item.reported_count);
    setEditStatus(item.status === 'verified' ? 'verified' : 'rejected');
    setEditReason('');
  };

  // Handler Simpan Perubahan Edit
  const handleSaveEdit = async () => {
    if (!editingItem) return;
    setIsSavingEdit(true);
    setMessage(null);

    try {
      const res = await updateActivityApi(editingItem.id, {
        activity_date: editDate,
        reported_count: Number(editCount),
        status: editStatus,
        rejection_reason: editStatus === 'rejected' ? editReason : undefined,
      });

      // Update state lokal
      setActivities((prev) =>
        prev.map((a) =>
          a.id === editingItem.id
            ? {
                ...a,
                activity_date: editDate,
                reported_count: Number(editCount),
                status: editStatus,
              }
            : a
        )
      );

      setMessage({ text: res.message, type: 'success' });
      setEditingItem(null);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Gagal menyimpan perubahan';
      setMessage({ text: errorMsg, type: 'error' });
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Handler Buka Modal Hapus
  const handleOpenDelete = (item: PaymentActivityWithMerchant) => {
    setDeletingItem(item);
  };

  // Handler Konfirmasi Hapus
  const handleConfirmDelete = async () => {
    if (!deletingItem) return;
    setIsDeleting(true);
    setMessage(null);

    try {
      const res = await deleteActivityApi(deletingItem.id);
      setActivities((prev) => prev.filter((a) => a.id !== deletingItem.id));
      setMessage({ text: res.message, type: 'success' });
      setDeletingItem(null);

      // Sesuaikan halaman jika halaman saat ini kosong setelah dihapus
      if (paginatedHistory.length === 1 && historyPage > 1) {
        setHistoryPage((p) => p - 1);
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Gagal menghapus laporan';
      setMessage({ text: errorMsg, type: 'error' });
    } finally {
      setIsDeleting(false);
    }
  };

  // Handler Ceklist Massal
  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAllOnPage = () => {
    const pageIds = paginatedHistory.map((item) => item.id);
    const allSelected = pageIds.length > 0 && pageIds.every((id) => selectedIds.includes(id));
    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !pageIds.includes(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...pageIds])));
    }
  };

  const handleClearSelection = () => {
    setSelectedIds([]);
  };

  // Handler Aksi Massal: Ubah Status Sekaligus
  const handleBulkEditConfirm = async () => {
    if (selectedIds.length === 0) return;
    setIsBulkSaving(true);
    setMessage(null);

    try {
      const res = await bulkUpdateActivitiesApi(selectedIds, {
        status: bulkStatus,
        rejection_reason: bulkStatus === 'rejected' ? bulkReason : undefined,
      });

      const idSet = new Set(selectedIds);
      setActivities((prev) =>
        prev.map((a) =>
          idSet.has(a.id)
            ? {
                ...a,
                status: bulkStatus,
              }
            : a
        )
      );

      setMessage({ text: res.message, type: 'success' });
      setShowBulkEditModal(false);
      setSelectedIds([]);
      setBulkReason('');
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Gagal memperbarui laporan sekaligus';
      setMessage({ text: errorMsg, type: 'error' });
    } finally {
      setIsBulkSaving(false);
    }
  };

  // Handler Aksi Massal: Hapus Sekaligus
  const handleBulkDeleteConfirm = async () => {
    if (selectedIds.length === 0) return;
    setIsBulkDeleting(true);
    setMessage(null);

    try {
      const res = await bulkDeleteActivitiesApi(selectedIds);
      const idSet = new Set(selectedIds);
      setActivities((prev) => prev.filter((a) => !idSet.has(a.id)));

      setMessage({ text: res.message, type: 'success' });
      setShowBulkDeleteModal(false);
      setSelectedIds([]);

      // Sesuaikan halaman jika halaman menjadi kosong
      if (historyPage > 1 && paginatedHistory.every((a) => idSet.has(a.id))) {
        setHistoryPage((p) => Math.max(1, p - 1));
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Gagal menghapus laporan sekaligus';
      setMessage({ text: errorMsg, type: 'error' });
    } finally {
      setIsBulkDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Halaman Modern */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Verifikasi Laporan Transaksi
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Daftar laporan aktivitas pembayaran QRIS yang perlu ditinjau
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadData(true)}
            disabled={isRefreshing || isLoading}
            className="text-xs flex items-center gap-1.5 text-slate-600 hover:text-slate-900 bg-white border-slate-200"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-sky-600' : ''}`} />
            <span>{isRefreshing ? 'Memperbarui...' : 'Perbarui Data'}</span>
          </Button>
          <span className="text-xs text-slate-500 font-medium bg-slate-100 px-2.5 py-1 rounded-md">
            {pendingList.length} laporan menunggu
          </span>
        </div>
      </div>

      {message && (
        <div
          className={`p-3.5 rounded-lg text-xs font-semibold border flex items-center gap-2 ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-red-50 text-red-800 border-red-200'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Antrean Menunggu Verifikasi */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          Perlu Ditinjau Segera
        </h3>

        {pendingList.length === 0 ? (
          <Card className="p-8 text-center text-slate-500 space-y-2 bg-white border border-slate-200/80 rounded-xl">
            <CheckSquare className="w-8 h-8 mx-auto text-emerald-500" />
            <h4 className="font-bold text-slate-800 text-sm">Semua Antrean Bersih!</h4>
            <p className="text-xs text-slate-400">Tidak ada laporan transaksi yang menunggu verifikasi saat ini.</p>
          </Card>
        ) : (
          pendingList.map((item) => (
            <Card
              key={item.id}
              className="p-5 space-y-4 bg-white border border-slate-200/80 rounded-xl hover:shadow-xs transition-shadow"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-100 text-[11px] font-semibold text-slate-700">
                    <User className="w-3 h-3 text-slate-500" />
                    <span>
                      {item.merchantName} ({item.regency})
                    </span>
                  </div>
                  <h4 className="font-bold text-base text-slate-900 leading-snug">
                    Klaim: {item.reported_count} Transaksi QRIS Diterima
                  </h4>
                </div>

                <div className="text-xs text-slate-500 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Tanggal: {formatSimpleDate(item.activity_date)}</span>
                </div>
              </div>

              {/* Tampilan Bukti Foto Transaksi QRIS */}
              {item.evidencePhotoUrl ? (
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-16 h-16 rounded-lg overflow-hidden border border-slate-300 bg-white cursor-pointer relative group shrink-0"
                      onClick={() => setZoomImage(item.evidencePhotoUrl || null)}
                    >
                      <img
                        src={item.evidencePhotoUrl}
                        alt="Bukti Transaksi QRIS"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <ZoomIn className="w-4 h-4 text-white" />
                      </div>
                    </div>
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                        <FileCheck className="w-3.5 h-3.5 text-sky-600" />
                        <span>Foto Bukti Transaksi Terlampir</span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Struk / notifikasi kasir QRIS diunggah oleh pedagang.
                      </p>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-xs flex items-center gap-1.5 shrink-0"
                    onClick={() => setZoomImage(item.evidencePhotoUrl || null)}
                  >
                    <ZoomIn className="w-3.5 h-3.5 text-slate-600" />
                    <span>Perbesar Foto Bukti</span>
                  </Button>
                </div>
              ) : (
                <div className="p-2.5 bg-slate-50/70 border border-slate-200/60 rounded-lg text-xs text-slate-500 italic">
                  Laporan mandiri pedagang (berdasarkan pernyataan kebenaran transaksi tanpa lampiran foto).
                </div>
              )}

              {rejectingId === item.id ? (
                /* Form Alasan Penolakan */
                <div className="p-3.5 bg-red-50 border border-red-200 rounded-lg space-y-2.5">
                  <h5 className="font-bold text-xs text-red-900">Masukkan Alasan Penolakan:</h5>
                  <input
                    type="text"
                    required
                    placeholder="contoh: Foto bukti buram atau tanggal tidak cocok"
                    className="w-full h-9 px-3 text-xs rounded-lg border border-red-300 focus:outline-none focus:ring-2 focus:ring-red-500 bg-white text-slate-900"
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={() => {
                        setRejectingId(null);
                        setRejectReason('');
                      }}
                    >
                      Batal
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      className="text-xs"
                      onClick={() => handleRejectConfirm(item)}
                    >
                      Konfirmasi Tolak Laporan
                    </Button>
                  </div>
                </div>
              ) : (
                /* Aksi Setujui / Tolak */
                <div className="flex items-center justify-end gap-2.5 pt-1">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={processingId === item.id}
                    className="text-xs text-red-600 hover:bg-red-50 hover:border-red-200"
                    onClick={() => setRejectingId(item.id)}
                  >
                    Tolak Laporan
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    disabled={processingId === item.id}
                    className="text-xs bg-emerald-600 hover:bg-emerald-700 flex items-center gap-1.5"
                    onClick={() => handleApprove(item)}
                  >
                    {processingId === item.id ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Menyimpan...</span>
                      </>
                    ) : (
                      <span>Setujui (+30 XP)</span>
                    )}
                  </Button>
                </div>
              )}
            </Card>
          ))
        )}
      </div>

      {/* Riwayat Verifikasi Sebelumnya */}
      <div className="space-y-4 pt-4 border-t border-slate-200">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Riwayat Verifikasi Sebelumnya
          </h3>
          <span className="text-xs text-slate-500 font-medium">
            Total {totalHistoryItems} riwayat
          </span>
        </div>

        {totalHistoryItems === 0 ? (
          <Card className="p-8 text-center text-slate-500 space-y-2 bg-white border border-slate-200/80 rounded-xl">
            <FileCheck className="w-8 h-8 mx-auto text-slate-300" />
            <h4 className="font-bold text-slate-700 text-sm">Belum Ada Riwayat</h4>
            <p className="text-xs text-slate-400">Semua laporan yang telah disetujui atau ditolak akan tersimpan di sini.</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {/* Toolbar Aksi Massal (Bulk Checkbox Actions) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 border border-slate-200/80 p-3 rounded-2xl">
              <div className="flex items-center gap-2.5">
                <input
                  type="checkbox"
                  id="selectAllHistory"
                  checked={paginatedHistory.length > 0 && paginatedHistory.every((a) => selectedIds.includes(a.id))}
                  onChange={handleSelectAllOnPage}
                  className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500 border-slate-300 cursor-pointer"
                />
                <label htmlFor="selectAllHistory" className="text-xs font-semibold text-slate-700 cursor-pointer select-none">
                  Pilih Semua di Halaman Ini
                </label>
                {selectedIds.length > 0 && (
                  <span className="text-xs font-bold text-sky-700 bg-sky-100 px-2.5 py-0.5 rounded-full">
                    {selectedIds.length} dipilih
                  </span>
                )}
              </div>

              {selectedIds.length > 0 && (
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="text-xs flex items-center gap-1.5 text-sky-700 bg-white hover:bg-sky-50 border-sky-200 rounded-xl font-semibold shadow-xs"
                    onClick={() => {
                      setBulkStatus('verified');
                      setBulkReason('');
                      setShowBulkEditModal(true);
                    }}
                  >
                    <Pencil className="w-3.5 h-3.5 text-sky-600" />
                    <span>Ubah Status ({selectedIds.length})</span>
                  </Button>

                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="text-xs flex items-center gap-1.5 text-rose-600 bg-white hover:bg-rose-50 border-rose-200 rounded-xl font-semibold shadow-xs"
                    onClick={() => setShowBulkDeleteModal(true)}
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                    <span>Hapus Sekaligus ({selectedIds.length})</span>
                  </Button>

                  <button
                    type="button"
                    onClick={handleClearSelection}
                    className="text-xs text-slate-500 hover:text-slate-800 underline px-1"
                  >
                    Batal
                  </button>
                </div>
              )}
            </div>

            {/* Daftar Kartu Riwayat */}
            <div className="space-y-2.5">
              {paginatedHistory.map((item) => {
                const isSelected = selectedIds.includes(item.id);
                return (
                  <Card
                    key={item.id}
                    className={`p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${
                      isSelected
                        ? 'bg-sky-50/50 border-sky-300 ring-1 ring-sky-200 shadow-sm'
                        : 'bg-white border-slate-200/80 hover:border-slate-300 shadow-xs'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelect(item.id)}
                        className="w-4 h-4 mt-1 rounded text-sky-600 focus:ring-sky-500 border-slate-300 cursor-pointer shrink-0"
                      />
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="font-bold text-sm text-slate-900">
                            {item.merchantName} ({item.regency})
                          </h4>
                          {item.status === 'verified' ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              Disetujui (+30 XP)
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                              <XCircle className="w-3 h-3 text-rose-600" />
                              Ditolak
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500">
                          Tanggal {formatSimpleDate(item.activity_date)} • {item.reported_count} Transaksi QRIS
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center pl-7 sm:pl-0">
                      {item.evidencePhotoUrl && (
                        <button
                          type="button"
                          className="text-xs text-sky-600 hover:text-sky-700 hover:underline flex items-center gap-1 font-semibold px-2 py-1"
                          onClick={() => setZoomImage(item.evidencePhotoUrl || null)}
                        >
                          <ImageIcon className="w-3.5 h-3.5" />
                          <span>Foto</span>
                        </button>
                      )}

                      {/* Tombol Edit */}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="text-xs flex items-center gap-1.5 text-slate-700 hover:bg-slate-100 rounded-xl"
                        onClick={() => handleOpenEdit(item)}
                      >
                        <Pencil className="w-3.5 h-3.5 text-slate-500" />
                        <span>Edit</span>
                      </Button>

                      {/* Tombol Hapus */}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="text-xs flex items-center gap-1.5 text-rose-600 hover:bg-rose-50 hover:border-rose-200 rounded-xl"
                        onClick={() => handleOpenDelete(item)}
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                        <span>Hapus</span>
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Kontrol Pagination Interaktif */}
        {totalHistoryItems > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs text-xs mt-3">
            <div className="text-slate-500 font-medium">
              Menampilkan <strong className="text-slate-800">{historyStartIndex + 1}</strong> –{' '}
              <strong className="text-slate-800">
                {Math.min(historyStartIndex + historyPageSize, totalHistoryItems)}
              </strong>{' '}
              dari <strong className="text-slate-800">{totalHistoryItems}</strong> riwayat laporan
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500">Tampilkan:</span>
                <select
                  className="h-8 px-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  value={historyPageSize}
                  onChange={(e) => {
                    setHistoryPageSize(Number(e.target.value));
                    setHistoryPage(1);
                  }}
                >
                  <option value={5}>5 per halaman</option>
                  <option value={10}>10 per halaman</option>
                  <option value={20}>20 per halaman</option>
                </select>
              </div>

              {/* Tombol Navigasi Halaman */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={historyPage === 1}
                  onClick={() => setHistoryPage((p) => Math.max(1, p - 1))}
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  title="Halaman Sebelumnya"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {Array.from({ length: totalHistoryPages }).map((_, idx) => {
                  const pageNum = idx + 1;
                  return (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => setHistoryPage(pageNum)}
                      className={`w-7 h-7 rounded-lg text-xs font-semibold transition-colors ${
                        historyPage === pageNum
                          ? 'bg-sky-600 text-white shadow-xs'
                          : 'text-slate-600 hover:bg-slate-100 border border-transparent'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  type="button"
                  disabled={historyPage === totalHistoryPages}
                  onClick={() => setHistoryPage((p) => Math.min(totalHistoryPages, p + 1))}
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  title="Halaman Berikutnya"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal Edit Laporan */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="space-y-0.5">
                <h4 className="font-bold text-base text-slate-900 flex items-center gap-2">
                  <Pencil className="w-4 h-4 text-sky-600" />
                  <span>Edit Laporan Transaksi</span>
                </h4>
                <p className="text-xs text-slate-500">
                  {editingItem.merchantName} ({editingItem.regency})
                </p>
              </div>
              <button
                type="button"
                className="p-1 text-slate-400 hover:text-slate-600 rounded-md"
                onClick={() => setEditingItem(null)}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Tanggal Aktivitas Transaksi
                </label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-slate-50/50"
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Jumlah Transaksi QRIS yang Diterima
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-slate-50/50"
                  value={editCount}
                  onChange={(e) => setEditCount(Math.max(1, parseInt(e.target.value) || 1))}
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Status Verifikasi
                </label>
                <select
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-slate-50/50"
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as 'verified' | 'rejected')}
                >
                  <option value="verified">Disetujui (+30 XP)</option>
                  <option value="rejected">Ditolak</option>
                </select>
              </div>

              {editStatus === 'rejected' && (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Alasan Penolakan
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Contoh: Bukti transaksi tidak terbaca dengan jelas"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-slate-50/50"
                    value={editReason}
                    onChange={(e) => setEditReason(e.target.value)}
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                disabled={isSavingEdit}
                onClick={() => setEditingItem(null)}
              >
                Batal
              </Button>
              <Button
                variant="primary"
                size="sm"
                className="text-xs bg-sky-600 hover:bg-sky-700 flex items-center gap-1.5"
                disabled={isSavingEdit}
                onClick={handleSaveEdit}
              >
                {isSavingEdit ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  <span>Simpan Perubahan</span>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus Laporan */}
      {deletingItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center shrink-0 text-rose-600">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900">
                  Konfirmasi Hapus Laporan
                </h4>
                <p className="text-xs text-slate-500">
                  Tindakan ini tidak dapat dibatalkan
                </p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs space-y-1">
              <div className="font-semibold text-slate-800">
                {deletingItem.merchantName} ({deletingItem.regency})
              </div>
              <div className="text-slate-500">
                Tanggal: {formatSimpleDate(deletingItem.activity_date)} • {deletingItem.reported_count} Transaksi
              </div>
              <div className="text-[11px] font-medium text-slate-600">
                Status saat ini: {deletingItem.status === 'verified' ? 'Disetujui' : 'Ditolak'}
              </div>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Apakah Anda yakin ingin menghapus laporan transaksi ini? Riwayat dan poin terkait akan disesuaikan secara otomatis.
            </p>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                disabled={isDeleting}
                onClick={() => setDeletingItem(null)}
              >
                Batal
              </Button>
              <Button
                variant="danger"
                size="sm"
                className="text-xs bg-rose-600 hover:bg-rose-700 flex items-center gap-1.5"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Menghapus...</span>
                  </>
                ) : (
                  <span>Hapus Laporan</span>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Ubah Status Sekaligus (Bulk Edit) */}
      {showBulkEditModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="space-y-0.5">
                <h4 className="font-bold text-base text-slate-900 flex items-center gap-2">
                  <Pencil className="w-4 h-4 text-sky-600" />
                  <span>Ubah Status {selectedIds.length} Laporan Sekaligus</span>
                </h4>
                <p className="text-xs text-slate-500">
                  Terapkan status verifikasi yang sama untuk semua laporan terpilih
                </p>
              </div>
              <button
                type="button"
                className="p-1 text-slate-400 hover:text-slate-600 rounded-md"
                onClick={() => setShowBulkEditModal(false)}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Pilih Status Baru
                </label>
                <select
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-slate-50/50"
                  value={bulkStatus}
                  onChange={(e) => setBulkStatus(e.target.value as 'verified' | 'rejected')}
                >
                  <option value="verified">Disetujui (+30 XP per merchant)</option>
                  <option value="rejected">Ditolak</option>
                </select>
              </div>

              {bulkStatus === 'rejected' && (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Alasan Penolakan Bersama
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Contoh: Dokumen bukti transaksi tidak memenuhi kriteria verifikasi"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-slate-50/50"
                    value={bulkReason}
                    onChange={(e) => setBulkReason(e.target.value)}
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                disabled={isBulkSaving}
                onClick={() => setShowBulkEditModal(false)}
              >
                Batal
              </Button>
              <Button
                variant="primary"
                size="sm"
                className="text-xs bg-sky-600 hover:bg-sky-700 flex items-center gap-1.5"
                disabled={isBulkSaving}
                onClick={handleBulkEditConfirm}
              >
                {isBulkSaving ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  <span>Terapkan ke {selectedIds.length} Laporan</span>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Hapus Laporan Sekaligus (Bulk Delete) */}
      {showBulkDeleteModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center shrink-0 text-rose-600">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900">
                  Hapus {selectedIds.length} Laporan Sekaligus
                </h4>
                <p className="text-xs text-slate-500">
                  Tindakan massal ini tidak dapat dibatalkan
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Apakah Anda yakin ingin menghapus <strong>{selectedIds.length} laporan transaksi</strong> yang dipilih? Riwayat transaksi dan poin terkait akan disesuaikan secara permanen.
            </p>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                disabled={isBulkDeleting}
                onClick={() => setShowBulkDeleteModal(false)}
              >
                Batal
              </Button>
              <Button
                variant="danger"
                size="sm"
                className="text-xs bg-rose-600 hover:bg-rose-700 flex items-center gap-1.5"
                disabled={isBulkDeleting}
                onClick={handleBulkDeleteConfirm}
              >
                {isBulkDeleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Menghapus...</span>
                  </>
                ) : (
                  <span>Hapus Semua ({selectedIds.length})</span>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Zoom Foto Bukti */}
      {zoomImage && (
        <div className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-4 space-y-3 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h4 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-sky-600" />
                <span>Pratinjau Foto Bukti Transaksi QRIS</span>
              </h4>
              <button
                type="button"
                className="p-1 text-slate-400 hover:text-slate-600 rounded-md"
                onClick={() => setZoomImage(null)}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center p-2">
              <img
                src={zoomImage}
                alt="Foto Bukti Transaksi Detail"
                className="w-full max-h-96 object-contain"
              />
            </div>
            <div className="flex justify-end pt-1">
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => setZoomImage(null)}
              >
                Tutup
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
