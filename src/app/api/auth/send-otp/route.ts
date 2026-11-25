// src/app/api/auth/send-otp/route.ts
import { NextResponse } from 'next/server';
import { generate6DigitOtp, sendOtpEmail } from '@/lib/email/smtp.service';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, purpose, recipientName } = body;

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        { success: false, message: 'Alamat email tidak valid.' },
        { status: 400 }
      );
    }

    if (!purpose || !['register', 'reset-password'].includes(purpose)) {
      return NextResponse.json(
        { success: false, message: 'Tujuan (purpose) OTP tidak valid.' },
        { status: 400 }
      );
    }

    const otp = generate6DigitOtp();
    const result = await sendOtpEmail({
      to: email,
      otp,
      purpose,
      recipientName,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in /api/auth/send-otp:', error);
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan sistem saat mengirim OTP.' },
      { status: 500 }
    );
  }
}

