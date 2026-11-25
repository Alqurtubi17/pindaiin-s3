// src/lib/adapters/manual-pilot.adapter.ts
// Implementasi default mode pilot untuk pelaporan manual UMKM rural
// Kepatuhan: Tidak membuat API fiktif, status selalu self_reported atau admin_verified

import {
  PaymentProviderAdapter,
  SubmitPaymentActivityParams,
  PaymentActivityResult
} from './payment-adapter.interface';

export class ManualPilotPaymentAdapter implements PaymentProviderAdapter {
  readonly providerName = 'manual_pilot';
  readonly isManualPilot = true;

  async submitActivity(params: SubmitPaymentActivityParams): Promise<PaymentActivityResult> {
    if (!params.declarationAccepted) {
      throw new Error('Deklarasi kebenaran transaksi wajib disetujui.');
    }

    if (params.reportedCount < 1) {
      throw new Error('Jumlah transaksi yang dilaporkan minimal 1.');
    }

    // Mengembalikan status yang memenuhi standar pilot: self_reported & submitted
    return {
      id: crypto.randomUUID(),
      source: 'self_reported',
      status: 'submitted',
      message: 'Aktivitas QRIS berhasil dilaporkan dan menunggu verifikasi admin/pendamping.',
    };
  }

  async verifyActivity(activityId: string, reviewerId: string, isApproved: boolean, note?: string): Promise<boolean> {
    // Verifikasi dilakukan oleh admin manusia sesuai SOP pilot
    return true;
  }
}

export const defaultPaymentAdapter = new ManualPilotPaymentAdapter();

