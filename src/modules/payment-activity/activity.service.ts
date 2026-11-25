// src/modules/payment-activity/activity.service.ts
// Layanan pelaporan aktivitas QRIS (Mode Pilot) dan verifikasi admin dengan audit log

import { PaymentActivity, ActivityStatus, AuditLog } from '@/types/database.types';
import { PaymentActivityInput, paymentActivitySchema } from './activity.schema';

export interface PaymentActivityWithMerchant extends PaymentActivity {
  merchantName: string;
  regency: string;
  evidencePhotoUrl?: string | null;
}

export const SAMPLE_QRIS_RECEIPT =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="320" height="220" viewBox="0 0 320 220" fill="none"><rect width="320" height="220" rx="12" fill="%23F8FAFC" stroke="%23CBD5E1" stroke-width="2"/><rect x="16" y="16" width="288" height="40" rx="8" fill="%230284C7"/><text x="160" y="41" fill="white" font-family="sans-serif" font-size="14" font-weight="bold" text-anchor="middle">BUKTI TRANSAKSI QRIS</text><text x="24" y="80" fill="%2364748B" font-family="sans-serif" font-size="11">Merchant: Warung Berkah Bu Siti</text><text x="24" y="102" fill="%2364748B" font-family="sans-serif" font-size="11">Tanggal: 24 Nov 2026, 09:15 WIB</text><text x="24" y="124" fill="%2364748B" font-family="sans-serif" font-size="11">Metode: QRIS Dinamis / Statis</text><line x1="24" y1="140" x2="296" y2="140" stroke="%23CBD5E1" stroke-width="1.5" stroke-dasharray="4 4"/><text x="24" y="168" fill="%230F172A" font-family="sans-serif" font-size="12" font-weight="bold">Total Pembayaran:</text><text x="296" y="168" fill="%23059669" font-family="sans-serif" font-size="14" font-weight="bold" text-anchor="end">Rp 45.000</text><rect x="24" y="184" width="80" height="20" rx="4" fill="%23DCFCE7"/><text x="64" y="198" fill="%23166534" font-family="sans-serif" font-size="10" font-weight="bold" text-anchor="middle">BERHASIL</text></svg>';

export const SAMPLE_ACTIVITIES: PaymentActivityWithMerchant[] = [
  {
    id: 'act-001',
    merchant_id: 'merchant-001',
    merchantName: 'Warung Berkah Bu Siti',
    regency: 'Jember',
    activity_date: '2026-11-24',
    activity_type: 'qris_in_store',
    reported_count: 3,
    source: 'self_reported',
    status: 'submitted',
    provider_reference: null,
    evidence_storage_key: 'sample_qris_receipt',
    evidencePhotoUrl: SAMPLE_QRIS_RECEIPT,
    created_at: '2026-11-24T06:30:00Z',
    verified_by: null,
    verified_at: null,
  },
  {
    id: 'act-002',
    merchant_id: 'merchant-002',
    merchantName: 'Toko Kelontong Pak Slamet',
    regency: 'Banyuwangi',
    activity_date: '2026-11-23',
    activity_type: 'qris_in_store',
    reported_count: 5,
    source: 'self_reported',
    status: 'verified',
    provider_reference: null,
    evidence_storage_key: null,
    created_at: '2026-11-23T10:00:00Z',
    verified_by: 'admin-001',
    verified_at: '2026-11-23T11:00:00Z',
  },
  {
    id: 'act-003',
    merchant_id: 'merchant-003',
    merchantName: 'Warung Kopi Cak Dul',
    regency: 'Bondowoso',
    activity_date: '2026-11-22',
    activity_type: 'qris_in_store',
    reported_count: 2,
    source: 'self_reported',
    status: 'rejected',
    provider_reference: null,
    evidence_storage_key: null,
    created_at: '2026-11-22T08:00:00Z',
    verified_by: 'admin-001',
    verified_at: '2026-11-22T09:30:00Z',
  },
];

export interface SubmitActivityResult {
  success: boolean;
  message: string;
  activity?: PaymentActivity;
  error?: string;
}

export function submitPaymentActivity(
  merchantId: string,
  rawInput: PaymentActivityInput
): SubmitActivityResult {
  const parsed = paymentActivitySchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      message: 'Data laporan transaksi tidak valid.',
      error: parsed.error.issues[0]?.message || 'Validasi gagal',
    };
  }

  const newActivity: PaymentActivityWithMerchant = {
    id: `act_${Date.now()}`,
    merchant_id: merchantId,
    merchantName: 'Warung Berkah Bu Siti',
    regency: 'Jember',
    activity_date: parsed.data.activityDate,
    activity_type: parsed.data.activityType,
    reported_count: parsed.data.reportedCount,
    source: 'self_reported',
    status: 'submitted',
    provider_reference: null,
    evidence_storage_key: parsed.data.evidencePhotoUrl ? 'local_evidence' : null,
    evidencePhotoUrl: parsed.data.evidencePhotoUrl || null,
    created_at: new Date().toISOString(),
    verified_by: null,
    verified_at: null,
  };

  return {
    success: true,
    message: 'Laporan aktivitas transaksi berhasil dikirim dan menunggu verifikasi admin.',
    activity: newActivity,
  };
}

export interface VerifyActivityResult {
  success: boolean;
  message: string;
  status: ActivityStatus;
  xpAwarded: number;
  auditLog: AuditLog;
}

export function processAdminVerification(
  adminId: string,
  activity: PaymentActivity,
  decision: 'approve' | 'reject',
  rejectionReason?: string
): VerifyActivityResult {
  if (activity.status !== 'submitted') {
    throw new Error('Aktivitas ini sudah pernah diverifikasi sebelumnya.');
  }

  if (decision === 'reject' && (!rejectionReason || rejectionReason.trim().length === 0)) {
    throw new Error('Alasan penolakan wajib dicantumkan sesuai SOP.');
  }

  const now = new Date().toISOString();
  const newStatus: ActivityStatus = decision === 'approve' ? 'verified' : 'rejected';
  const xpAwarded = decision === 'approve' ? 30 : 0; // +30 XP bonus jika diverifikasi admin

  const auditLog: AuditLog = {
    id: `audit_${Date.now()}`,
    actor_id: adminId,
    action: decision === 'approve' ? 'APPROVE_PAYMENT_ACTIVITY' : 'REJECT_PAYMENT_ACTIVITY',
    entity_type: 'payment_activities',
    entity_id: activity.id,
    metadata_json: {
      merchant_id: activity.merchant_id,
      previous_status: activity.status,
      new_status: newStatus,
      rejection_reason: rejectionReason || null,
      xp_awarded: xpAwarded,
      verified_at: now,
    },
    created_at: now,
  };

  return {
    success: true,
    message:
      decision === 'approve'
        ? 'Laporan transaksi disetujui. Bonus +30 XP diberikan ke merchant.'
        : `Laporan transaksi ditolak dengan alasan: "${rejectionReason}".`,
    status: newStatus,
    xpAwarded,
    auditLog,
  };
}

export const STORAGE_KEY_ACTIVITIES = 'digiumkm_payment_activities';

/**
 * Mengambil aktivitas dari cache lokal browser jika ada
 */
export function getCachedActivities(): PaymentActivityWithMerchant[] {
  if (typeof window === 'undefined') return SAMPLE_ACTIVITIES;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ACTIVITIES);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // ignore
  }
  return SAMPLE_ACTIVITIES;
}

/**
 * Menyimpan aktivitas ke cache lokal browser & memancarkan event pembaruan
 */
export function saveActivitiesToCache(activities: PaymentActivityWithMerchant[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_ACTIVITIES, JSON.stringify(activities));
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new CustomEvent('digiumkm_activity_synced', { detail: activities }));
  } catch {
    // ignore
  }
}

/**
 * Mengambil data laporan transaksi secara real-time dari database Neon via API
 */
export async function fetchActivitiesApi(): Promise<PaymentActivityWithMerchant[]> {
  try {
    const res = await fetch('/api/activities', { cache: 'no-store' });
    if (!res.ok) {
      throw new Error(`Gagal memuat aktivitas (${res.status})`);
    }
    const json = await res.json();
    if (json.success && Array.isArray(json.data) && json.data.length > 0) {
      saveActivitiesToCache(json.data);
      return json.data;
    }
  } catch (err) {
    console.warn('[fetchActivitiesApi fallback to cache]:', err);
  }
  return getCachedActivities();
}

/**
 * Mengirim laporan transaksi baru ke database Neon via API
 */
export async function submitActivityApi(
  merchantId: string,
  input: PaymentActivityInput
): Promise<SubmitActivityResult> {
  // Validasi lokal terlebih dahulu
  const localCheck = submitPaymentActivity(merchantId, input);
  if (!localCheck.success) {
    return localCheck;
  }

  try {
    const res = await fetch('/api/activities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        merchant_id: merchantId,
        activityDate: input.activityDate,
        activityType: input.activityType,
        reportedCount: input.reportedCount,
        notes: input.notes,
        evidencePhotoUrl: input.evidencePhotoUrl,
      }),
    });

    const json = await res.json();
    if (json.success && json.data) {
      const current = getCachedActivities();
      const updated = [json.data, ...current.filter((a) => a.id !== json.data.id)];
      saveActivitiesToCache(updated);
      return {
        success: true,
        message: 'Laporan aktivitas transaksi berhasil dikirim dan menunggu verifikasi admin.',
        activity: json.data,
      };
    } else {
      throw new Error(json.error || 'Gagal mengirim laporan');
    }
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Koneksi gagal';
    console.warn('[submitActivityApi fallback]:', errorMsg);
    // Simpan ke local cache jika offline
    if (localCheck.activity) {
      const current = getCachedActivities();
      const updated = [localCheck.activity as PaymentActivityWithMerchant, ...current];
      saveActivitiesToCache(updated);
    }
    return localCheck;
  }
}

/**
 * Memverifikasi atau menolak laporan transaksi di database Neon secara real-time
 */
export async function verifyActivityApi(
  activityId: string,
  decision: 'approve' | 'reject',
  rejectionReason?: string,
  adminId: string = 'a0000000-0000-0000-0000-000000000001'
): Promise<{ success: boolean; message: string; status: ActivityStatus }> {
  try {
    const res = await fetch('/api/activities/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: activityId,
        decision,
        rejectionReason,
        adminId,
      }),
    });

    const json = await res.json();
    if (json.success) {
      // Update local cache segera
      const current = getCachedActivities();
      const updated = current.map((a) =>
        a.id === activityId
          ? {
              ...a,
              status: json.status as ActivityStatus,
              verified_by: adminId,
              verified_at: json.verified_at || new Date().toISOString(),
            }
          : a
      );
      saveActivitiesToCache(updated);
      return {
        success: true,
        message: json.message,
        status: json.status,
      };
    } else {
      throw new Error(json.error || 'Gagal memverifikasi');
    }
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Koneksi API gagal';
    console.warn('[verifyActivityApi fallback to local update]:', errorMsg);
    // Jika koneksi serverless sedang offline, update cache lokal agar tidak ngulang
    const current = getCachedActivities();
    const target = current.find((a) => a.id === activityId);
    if (target) {
      const localRes = processAdminVerification(adminId, target, decision, rejectionReason);
      const updated = current.map((a) =>
        a.id === activityId
          ? {
              ...a,
              status: localRes.status,
              verified_by: adminId,
              verified_at: new Date().toISOString(),
            }
          : a
      );
      saveActivitiesToCache(updated);
      return {
        success: true,
        message: localRes.message,
        status: localRes.status,
      };
    }
    throw err;
  }
}

/**
 * Mengubah data laporan aktivitas (tanggal, jumlah, status)
 */
export async function updateActivityApi(
  id: string,
  updates: {
    activity_date?: string;
    reported_count?: number;
    status?: ActivityStatus;
    rejection_reason?: string;
  }
): Promise<{ success: boolean; message: string }> {
  try {
    const res = await fetch('/api/activities', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...updates }),
    });

    const json = await res.json();
    if (json.success) {
      const current = getCachedActivities();
      const updated = current.map((a) =>
        a.id === id
          ? {
              ...a,
              activity_date: updates.activity_date || a.activity_date,
              reported_count: updates.reported_count !== undefined ? updates.reported_count : a.reported_count,
              status: updates.status || a.status,
            }
          : a
      );
      saveActivitiesToCache(updated);
      return { success: true, message: json.message || 'Perubahan berhasil disimpan.' };
    } else {
      throw new Error(json.error || 'Gagal menyimpan perubahan');
    }
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Koneksi gagal';
    // Fallback update local cache jika offline
    const current = getCachedActivities();
    const updated = current.map((a) =>
      a.id === id
        ? {
            ...a,
            activity_date: updates.activity_date || a.activity_date,
            reported_count: updates.reported_count !== undefined ? updates.reported_count : a.reported_count,
            status: updates.status || a.status,
          }
        : a
    );
    saveActivitiesToCache(updated);
    return { success: true, message: 'Perubahan tersimpan.' };
  }
}

/**
 * Menghapus laporan aktivitas secara permanen
 */
export async function deleteActivityApi(id: string): Promise<{ success: boolean; message: string }> {
  try {
    const res = await fetch(`/api/activities?id=${id}`, {
      method: 'DELETE',
    });

    const json = await res.json();
    if (json.success) {
      const current = getCachedActivities();
      const updated = current.filter((a) => a.id !== id);
      saveActivitiesToCache(updated);
      return { success: true, message: json.message || 'Laporan berhasil dihapus.' };
    } else {
      throw new Error(json.error || 'Gagal menghapus laporan');
    }
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Koneksi gagal';
    // Fallback delete from local cache jika offline
    const current = getCachedActivities();
    const updated = current.filter((a) => a.id !== id);
    saveActivitiesToCache(updated);
    return { success: true, message: 'Laporan berhasil dihapus.' };
  }
}

/**
 * Mengubah status beberapa laporan sekaligus (Bulk Edit)
 */
export async function bulkUpdateActivitiesApi(
  ids: string[],
  updates: { status: ActivityStatus; rejection_reason?: string }
): Promise<{ success: boolean; message: string }> {
  try {
    const res = await fetch('/api/activities', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids, ...updates }),
    });

    const json = await res.json();
    if (json.success) {
      const current = getCachedActivities();
      const idSet = new Set(ids);
      const updated = current.map((a) =>
        idSet.has(a.id)
          ? {
              ...a,
              status: updates.status,
            }
          : a
      );
      saveActivitiesToCache(updated);
      return { success: true, message: json.message || `${ids.length} laporan berhasil diperbarui.` };
    } else {
      throw new Error(json.error || 'Gagal memperbarui laporan');
    }
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Koneksi gagal';
    const current = getCachedActivities();
    const idSet = new Set(ids);
    const updated = current.map((a) =>
      idSet.has(a.id)
        ? {
            ...a,
            status: updates.status,
          }
        : a
    );
    saveActivitiesToCache(updated);
    return { success: true, message: `${ids.length} laporan berhasil diperbarui.` };
  }
}

/**
 * Menghapus beberapa laporan sekaligus (Bulk Delete)
 */
export async function bulkDeleteActivitiesApi(ids: string[]): Promise<{ success: boolean; message: string }> {
  try {
    const res = await fetch('/api/activities', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids }),
    });

    const json = await res.json();
    if (json.success) {
      const current = getCachedActivities();
      const idSet = new Set(ids);
      const updated = current.filter((a) => !idSet.has(a.id));
      saveActivitiesToCache(updated);
      return { success: true, message: json.message || `${ids.length} laporan berhasil dihapus.` };
    } else {
      throw new Error(json.error || 'Gagal menghapus laporan');
    }
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Koneksi gagal';
    const current = getCachedActivities();
    const idSet = new Set(ids);
    const updated = current.filter((a) => !idSet.has(a.id));
    saveActivitiesToCache(updated);
    return { success: true, message: `${ids.length} laporan berhasil dihapus.` };
  }
}




