// src/modules/auth/auth.actions.ts
// Server Actions untuk registrasi dan pengisian profil UMKM

'use server';

import { registerSchema, merchantProfileSchema, type RegisterInput, type MerchantProfileInput } from './auth.schema';

export interface ActionResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
}

export async function handleRegister(input: RegisterInput): Promise<ActionResponse> {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: 'Data registrasi tidak valid.',
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const userId = crypto.randomUUID();

  return {
    success: true,
    message: 'Registrasi berhasil. Silakan lengkapi profil usaha Anda.',
    data: { userId },
  };
}

export async function handleSaveMerchantProfile(input: MerchantProfileInput): Promise<ActionResponse> {
  const parsed = merchantProfileSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: 'Data profil usaha tidak valid.',
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const merchantId = crypto.randomUUID();

  return {
    success: true,
    message: 'Profil usaha berhasil disimpan! +50 XP bonus telah ditambahkan.',
    data: { merchantId },
  };
}
