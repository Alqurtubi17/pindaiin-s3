import { describe, it, expect } from 'vitest';
import {
  submitPaymentActivity,
  processAdminVerification,
  SAMPLE_ACTIVITIES,
} from '@/modules/payment-activity/activity.service';

describe('QRIS Activity Reporting (Mode Pilot)', () => {
  it('berhasil mengirim laporan transaksi yang memenuhi syarat dengan deklarasi', () => {
    const res = submitPaymentActivity('merchant-123', {
      activityDate: '2026-11-24',
      activityType: 'qris_in_store',
      reportedCount: 4,
      declarationAccepted: true,
      notes: 'Ramai pembeli sembako',
    });

    expect(res.success).toBe(true);
    expect(res.activity?.source).toBe('self_reported');
    expect(res.activity?.status).toBe('submitted');
    expect(res.activity?.reported_count).toBe(4);
  });

  it('gagal jika deklarasi kebenaran transaksi tidak dicentang', () => {
    const res = submitPaymentActivity('merchant-123', {
      activityDate: '2026-11-24',
      activityType: 'qris_in_store',
      reportedCount: 4,
      declarationAccepted: false,
    });

    expect(res.success).toBe(false);
    expect(res.message).toContain('tidak valid');
  });

  it('gagal jika jumlah transaksi melebihi batas wajar harian (>50)', () => {
    const res = submitPaymentActivity('merchant-123', {
      activityDate: '2026-11-24',
      activityType: 'qris_in_store',
      reportedCount: 999,
      declarationAccepted: true,
    });

    expect(res.success).toBe(false);
    expect(res.error).toContain('Batas wajar klaim harian');
  });
});

describe('Admin Verification & Audit Log Engine', () => {
  const pendingActivity = SAMPLE_ACTIVITIES[0]; // status: 'submitted'

  it('menyetujui laporan transaksi, mengubah status ke verified, memberi +30 XP dan mencatat audit log', () => {
    const res = processAdminVerification('admin-op-1', pendingActivity, 'approve');

    expect(res.success).toBe(true);
    expect(res.status).toBe('verified');
    expect(res.xpAwarded).toBe(30);
    expect(res.auditLog.action).toBe('APPROVE_PAYMENT_ACTIVITY');
    expect(res.auditLog.actor_id).toBe('admin-op-1');
    expect(res.auditLog.entity_id).toBe(pendingActivity.id);
  });

  it('menolak laporan transaksi wajib menyertakan alasan penolakan dan tidak memberi XP', () => {
    const res = processAdminVerification(
      'admin-op-1',
      pendingActivity,
      'reject',
      'Tanggal di luar masa pilot uji coba'
    );

    expect(res.success).toBe(true);
    expect(res.status).toBe('rejected');
    expect(res.xpAwarded).toBe(0);
    expect(res.auditLog.action).toBe('REJECT_PAYMENT_ACTIVITY');
    expect(res.auditLog.metadata_json.rejection_reason).toBe('Tanggal di luar masa pilot uji coba');
  });

  it('melempar error jika penolakan tidak disertai alasan', () => {
    expect(() =>
      processAdminVerification('admin-op-1', pendingActivity, 'reject', '')
    ).toThrow('Alasan penolakan wajib dicantumkan');
  });

  it('melempar error jika memverifikasi aktivitas yang sudah pernah diverifikasi', () => {
    const alreadyVerified = SAMPLE_ACTIVITIES[1]; // status: 'verified'
    expect(() =>
      processAdminVerification('admin-op-1', alreadyVerified, 'approve')
    ).toThrow('sudah pernah diverifikasi');
  });

  it('laporan yang sudah disetujui berpindah ke riwayat dan tidak muncul di antrean pending', () => {
    // Simulasikan alur verifikasi dan pemisahan antrean
    const activeQueue = [...SAMPLE_ACTIVITIES];
    const pendingBefore = activeQueue.filter((a) => a.status === 'submitted');
    expect(pendingBefore.length).toBeGreaterThan(0);

    const target = pendingBefore[0];
    const result = processAdminVerification('admin-operator-1', target, 'approve');

    // Update state layaknya di halaman verifikasi
    const updatedQueue = activeQueue.map((a) =>
      a.id === target.id
        ? { ...a, status: result.status, verified_by: 'admin-operator-1', verified_at: new Date().toISOString() }
        : a
    );

    const pendingAfter = updatedQueue.filter((a) => a.status === 'submitted');
    const historyAfter = updatedQueue.filter((a) => a.status !== 'submitted');

    // Laporan yang baru saja disetujui tidak boleh ada di antrean pending lagi
    expect(pendingAfter.some((a) => a.id === target.id)).toBe(false);
    expect(historyAfter.some((a) => a.id === target.id)).toBe(true);
  });
});

