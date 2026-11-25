// src/modules/auth/auth.schema.ts
// Skema validasi Zod untuk registrasi, login, dan profil merchant

import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(8, 'Kata sandi minimal 8 karakter'),
  displayName: z.string().min(2, 'Nama lengkap minimal 2 karakter'),
  consentResearch: z.boolean().refine(val => val === true, {
    message: 'Persetujuan partisipasi riset dan kebijakan privasi wajib dicentang',
  }),
});

export const merchantProfileSchema = z.object({
  businessName: z.string().min(3, 'Nama usaha minimal 3 karakter'),
  businessCategory: z.string().min(2, 'Kategori usaha wajib dipilih'),
  province: z.string().default('Jawa Timur'),
  regency: z.string().min(2, 'Kabupaten/Kota wajib diisi'),
  district: z.string().optional(),
  ruralLocality: z.string().optional(),
  qrisStatus: z.enum(['active', 'not_active', 'applied', 'unknown'], {
    errorMap: () => ({ message: 'Status QRIS tidak valid' }),
  }),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type MerchantProfileInput = z.infer<typeof merchantProfileSchema>;

