// src/app/api/auth/verify-turnstile/route.ts
import { NextResponse } from 'next/server';
import { z } from 'zod';

const turnstileSchema = z.object({
  token: z.string().min(1, 'Token verifikasi keamanan wajib diisi'),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = turnstileSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: 'Silakan selesaikan verifikasi keamanan terlebih dahulu.' },
        { status: 400 }
      );
    }

    const secretKey = process.env.TURNSTILE_SECRET_KEY;

    // Jika secret key Cloudflare Turnstile belum dikonfigurasi di lingkungan lokal, izinkan token uji lokal
    if (!secretKey) {
      if (parsed.data.token === 'dev-turnstile-token') {
        return NextResponse.json({ success: true, mode: 'local_dev' });
      }
      return NextResponse.json(
        { success: false, message: 'Token verifikasi lokal tidak valid.' },
        { status: 400 }
      );
    }

    const formData = new URLSearchParams();
    formData.append('secret', secretKey);
    formData.append('response', parsed.data.token);

    const verifyRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData.toString(),
    });

    const data = (await verifyRes.json()) as { success?: boolean };

    if (!data.success) {
      return NextResponse.json(
        { success: false, message: 'Verifikasi keamanan Cloudflare gagal. Silakan coba lagi.' },
        { status: 403 }
      );
    }

    return NextResponse.json({ success: true, mode: 'cloudflare' });
  } catch {
    return NextResponse.json(
      { success: false, message: 'Gagal memproses verifikasi keamanan.' },
      { status: 500 }
    );
  }
}

