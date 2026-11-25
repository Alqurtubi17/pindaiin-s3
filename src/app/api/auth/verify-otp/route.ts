// src/app/api/auth/verify-otp/route.ts
import { NextResponse } from 'next/server';
import { verifyStoredOtp } from '@/lib/email/smtp.service';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, otp, purpose } = body;

    if (!email || !otp || !purpose) {
      return NextResponse.json(
        { success: false, message: 'Email, kode OTP, dan tujuan verifikasi wajib diisi.' },
        { status: 400 }
      );
    }

    const verification = verifyStoredOtp(email, otp, purpose);

    if (!verification.valid) {
      return NextResponse.json(
        { success: false, message: verification.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Kode OTP berhasil diverifikasi.',
    });
  } catch (error) {
    console.error('Error in /api/auth/verify-otp:', error);
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan sistem saat memvalidasi OTP.' },
      { status: 500 }
    );
  }
}

