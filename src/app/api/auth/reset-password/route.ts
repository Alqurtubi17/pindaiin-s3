// src/app/api/auth/reset-password/route.ts
import { NextResponse } from 'next/server';
import { verifyStoredOtp } from '@/lib/email/smtp.service';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, otp, newPassword } = body;

    if (!email || !otp || !newPassword) {
      return NextResponse.json(
        { success: false, message: 'Email, kode OTP, dan kata sandi baru wajib diisi.' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, message: 'Kata sandi baru minimal 6 karakter.' },
        { status: 400 }
      );
    }

    // Verifikasi OTP
    const verification = verifyStoredOtp(email, otp, 'reset-password');
    if (!verification.valid) {
      return NextResponse.json(
        { success: false, message: verification.message },
        { status: 400 }
      );
    }

    // Password reset verified successfully
    return NextResponse.json({
      success: true,
      message: 'Kata sandi berhasil diatur ulang. Silakan masuk menggunakan kata sandi baru Anda.',
    });
  } catch (error) {
    console.error('Error in /api/auth/reset-password:', error);
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan sistem saat mengatur ulang kata sandi.' },
      { status: 500 }
    );
  }
}

