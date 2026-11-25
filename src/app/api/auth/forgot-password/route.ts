// src/app/api/auth/forgot-password/route.ts
import { NextResponse } from 'next/server';
import { z } from 'zod';
import {
  createPasswordResetToken,
  sendPasswordResetLinkEmail,
} from '@/lib/email/smtp.service';

const forgotPasswordSchema = z.object({
  email: z.string().email('Format email tidak valid'),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = forgotPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: 'Masukkan alamat email yang valid.' },
        { status: 400 }
      );
    }

    const { origin } = new URL(request.url);
    const token = createPasswordResetToken(parsed.data.email);
    const resetUrl = `${origin}/reset-password?token=${encodeURIComponent(token)}`;

    const result = await sendPasswordResetLinkEmail({
      to: parsed.data.email,
      resetUrl,
    });

    return NextResponse.json({
      success: true,
      simulated: result.simulated,
      resetUrl: result.simulated ? result.resetUrl : undefined,
      message: result.message,
    });
  } catch (error) {
    console.error('Error in /api/auth/forgot-password:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal memproses permintaan reset kata sandi.' },
      { status: 500 }
    );
  }
}

