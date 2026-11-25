import { describe, it, expect } from 'vitest';
import { paymentActivitySchema } from '@/modules/payment-activity/activity.schema';
import { defaultPaymentAdapter } from '@/lib/adapters/manual-pilot.adapter';

describe('Payment Activity & Pilot Adapter Logic', () => {
  it('harus menerima pelaporan transaksi yang valid dengan deklarasi', () => {
    const input = {
      activityDate: '2026-11-24',
      activityType: 'qris_in_store',
      reportedCount: 3,
      declarationAccepted: true,
      notes: 'Penjualan pagi hari',
    };
    const parsed = paymentActivitySchema.safeParse(input);
    expect(parsed.success).toBe(true);
  });

  it('harus menolak jika deklarasi kebenaran tidak dicentang', () => {
    const input = {
      activityDate: '2026-11-24',
      activityType: 'qris_in_store',
      reportedCount: 3,
      declarationAccepted: false,
    };
    const parsed = paymentActivitySchema.safeParse(input);
    expect(parsed.success).toBe(false);
  });

  it('adapter mode pilot mengembalikan status self_reported dan submitted', async () => {
    const res = await defaultPaymentAdapter.submitActivity({
      merchantId: 'merchant-uuid-123',
      activityDate: '2026-11-24',
      activityType: 'qris_in_store',
      reportedCount: 2,
      declarationAccepted: true,
    });

    expect(res.source).toBe('self_reported');
    expect(res.status).toBe('submitted');
    expect(res.message).toContain('menunggu verifikasi');
  });

  it('adapter mode pilot menolak jika deklarasi tidak diterima', async () => {
    await expect(
      defaultPaymentAdapter.submitActivity({
        merchantId: 'merchant-uuid-123',
        activityDate: '2026-11-24',
        activityType: 'qris_in_store',
        reportedCount: 2,
        declarationAccepted: false,
      })
    ).rejects.toThrow('Deklarasi kebenaran');
  });
});

