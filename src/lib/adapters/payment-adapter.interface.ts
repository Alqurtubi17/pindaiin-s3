// src/lib/adapters/payment-adapter.interface.ts
// Interface isolasi pembayaran untuk mencegah hard-coding provider dan kepatuhan AGENTS.md

import { ActivitySource, ActivityStatus } from '@/types/database.types';

export interface SubmitPaymentActivityParams {
  merchantId: string;
  activityDate: string; // ISO date string YYYY-MM-DD
  activityType: string;
  reportedCount: number;
  notes?: string;
  declarationAccepted: boolean;
}

export interface PaymentActivityResult {
  id: string;
  source: ActivitySource;
  status: ActivityStatus;
  message: string;
}

export interface PaymentProviderAdapter {
  readonly providerName: string;
  readonly isManualPilot: boolean;

  submitActivity(params: SubmitPaymentActivityParams): Promise<PaymentActivityResult>;
  verifyActivity(activityId: string, reviewerId: string, isApproved: boolean, note?: string): Promise<boolean>;
}

