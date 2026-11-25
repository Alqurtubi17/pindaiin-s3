// src/modules/payment-activity/activity.schema.ts
// Skema validasi Zod untuk pelaporan transaksi QRIS (Mode Pilot)
// Kepatuhan: Tidak mengumpulkan PIN, OTP, password, atau nomor kartu

import { z } from 'zod';

export const paymentActivitySchema = z.object({
  activityDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal harus YYYY-MM-DD'),
  activityType: z.string().default('qris_in_store'),
  reportedCount: z.coerce.number().int().min(1, 'Jumlah transaksi minimal 1').max(50, 'Batas wajar klaim harian tercapai'),
  declarationAccepted: z.boolean().refine((val) => val === true, {
    message: 'Anda wajib menyetujui pernyataan kebenaran transaksi',
  }),
  notes: z.string().max(200, 'Catatan maksimal 200 karakter').optional(),
  evidencePhotoUrl: z.string().optional(),
});

export type PaymentActivityInput = z.infer<typeof paymentActivitySchema>;

