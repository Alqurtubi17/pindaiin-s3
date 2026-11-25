// tests/unit/admin-merchants-and-otp.test.ts
import { describe, it, expect } from 'vitest';
import {
  generate6DigitOtp,
  storeOtp,
  verifyStoredOtp,
} from '@/lib/email/smtp.service';
import {
  generateRandomPassword,
  INITIAL_MERCHANTS,
} from '@/modules/merchants/admin-merchants.service';

describe('Admin Merchants & Google SMTP/OTP Services', () => {
  it('menghasilkan 6-digit kode OTP numerik yang valid', () => {
    const otp = generate6DigitOtp();
    expect(otp).toHaveLength(6);
    expect(/^\d{6}$/.test(otp)).toBe(true);
  });

  it('berhasil menyimpan dan memverifikasi kode OTP yang cocok', () => {
    const email = 'test.umkm@gmail.com';
    const otp = generate6DigitOtp();

    storeOtp(email, otp, 'register');
    const result = verifyStoredOtp(email, otp, 'register');

    expect(result.valid).toBe(true);
    expect(result.message).toContain('berhasil');
  });

  it('menolak kode OTP yang salah atau berbeda jenis tujuan', () => {
    const email = 'warung.siti@gmail.com';
    const otp = '123456';

    storeOtp(email, otp, 'register');

    // Coba dengan OTP salah
    const wrongOtp = verifyStoredOtp(email, '654321', 'register');
    expect(wrongOtp.valid).toBe(false);

    // Coba dengan tujuan berbeda
    const wrongPurpose = verifyStoredOtp(email, otp, 'reset-password');
    expect(wrongPurpose.valid).toBe(false);
  });

  it('menghasilkan password acak yang aman dengan pola awalan Digi#', () => {
    const password = generateRandomPassword();
    expect(password.startsWith('Digi#')).toBe(true);
    expect(password.length).toBeGreaterThanOrEqual(8);
  });

  it('memastikan data awal merchant admin memuat pedagang Jawa Timur yang realistis', () => {
    expect(INITIAL_MERCHANTS.length).toBeGreaterThanOrEqual(5);
    const banyuwangiMerchant = INITIAL_MERCHANTS.find((m) => m.regency === 'Banyuwangi');
    expect(banyuwangiMerchant).toBeDefined();
    expect(banyuwangiMerchant?.displayName).toBe('Siti Aminah');
  });
});

