import { describe, it, expect } from 'vitest';
import { merchantProfileSchema } from '@/modules/auth/auth.schema';

describe('Merchant Onboarding Profile Logic', () => {
  it('berhasil memvalidasi status QRIS yang belum aktif', () => {
    const input = {
      businessName: 'Warung Kopi Cak Dul',
      businessCategory: 'Makanan & Minuman / Warung',
      province: 'Jawa Timur',
      regency: 'Banyuwangi',
      district: 'Rogojampi',
      ruralLocality: 'Gitik',
      qrisStatus: 'not_active' as const,
    };

    const result = merchantProfileSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it('berhasil memvalidasi status QRIS yang sudah terdaftar/applied', () => {
    const input = {
      businessName: 'Toko Tani Makmur',
      businessCategory: 'Pertanian & Peternakan',
      province: 'Jawa Timur',
      regency: 'Bondowoso',
      qrisStatus: 'applied' as const,
    };

    const result = merchantProfileSchema.safeParse(input);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.qrisStatus).toBe('applied');
    }
  });

  it('gagal jika nama usaha terlalu pendek (< 3 karakter)', () => {
    const input = {
      businessName: 'AB',
      businessCategory: 'Kelontong & Sembako',
      province: 'Jawa Timur',
      regency: 'Jember',
      qrisStatus: 'not_active' as const,
    };

    const result = merchantProfileSchema.safeParse(input);
    expect(result.success).toBe(false);
  });
});

