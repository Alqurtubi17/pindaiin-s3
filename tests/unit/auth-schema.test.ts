import { describe, it, expect } from 'vitest';
import { registerSchema, merchantProfileSchema } from '@/modules/auth/auth.schema';

describe('Auth & Merchant Profile Validation Schemas', () => {
  it('harus memvalidasi data registrasi yang sah', () => {
    const valid = {
      email: 'merchant.deso@example.com',
      password: 'passwordAman123',
      displayName: 'Siti Aminah',
      consentResearch: true,
    };
    const result = registerSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it('harus menolak registrasi tanpa persetujuan riset/kebijakan privasi', () => {
    const invalid = {
      email: 'merchant.deso@example.com',
      password: 'passwordAman123',
      displayName: 'Siti Aminah',
      consentResearch: false,
    };
    const result = registerSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('harus memvalidasi profil UMKM wilayah Jawa Timur', () => {
    const validProfile = {
      businessName: 'Warung Berkah Bu Siti',
      businessCategory: 'Kelontong & Sembako',
      province: 'Jawa Timur',
      regency: 'Jember',
      district: 'Ambulu',
      ruralLocality: 'Tegalsari',
      qrisStatus: 'active' as const,
    };
    const result = merchantProfileSchema.safeParse(validProfile);
    expect(result.success).toBe(true);
  });
});

