// src/app/api/auth/reset-password/route.ts
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyPasswordResetToken } from '@/lib/email/smtp.service';

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token reset wajib diisi'),
  newPassword: z.string().min(6, 'Kata sandi baru minimal 6 karakter'),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = resetPasswordSchema.safeParse(body);

    if (!parsed.success) {
      const firstError = Object.values(parsed.error.flatten().fieldErrors).flat()[0];
      return NextResponse.json(
        { success: false, message: firstError || 'Data reset kata sandi tidak valid.' },
        { status: 400 }
      );
    }

    const verification = verifyPasswordResetToken(parsed.data.token);
    if (!verification.valid) {
      return NextResponse.json(
        { success: false, message: verification.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      email: verification.email,
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
