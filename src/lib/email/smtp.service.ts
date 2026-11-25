// src/lib/email/smtp.service.ts
import nodemailer from 'nodemailer';

/**
 * Konfigurasi Google / Gmail SMTP
 * -------------------------------------------------------------
 * Panduan untuk mendapatkan Google App Password (Sandi Aplikasi):
 * 1. Buka Akun Google -> Keamanan (Security)
 * 2. Aktifkan "Verifikasi 2 Langkah" (2-Step Verification)
 * 3. Buka menu "Sandi Aplikasi" (App Passwords)
 * 4. Buat sandi baru untuk aplikasi "DigiUMKM"
 * 5. Salin 16 digit sandi ke env SMTP_PASS (tanpa spasi)
 */
export interface SmtpConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  from: string;
}

export function getSmtpConfig(): SmtpConfig {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = Number(process.env.SMTP_PORT) || 465;
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;
  const user = process.env.SMTP_USER || '';
  const pass = process.env.SMTP_PASS || '';
  const from = process.env.SMTP_FROM || 'DigiUMKM <noreply@digiumkm.id>';

  return { host, port, secure, user, pass, from };
}

// Memory store untuk OTP (dengan masa berlaku 5 menit)
interface OtpEntry {
  otp: string;
  expiresAt: number;
  purpose: 'register' | 'reset-password';
}

// Global in-memory map agar persist selama server instance berjalan
const otpStore = new Map<string, OtpEntry>();

export function generate6DigitOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function storeOtp(email: string, otp: string, purpose: 'register' | 'reset-password'): void {
  const normalizedEmail = email.toLowerCase().trim();
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 menit
  otpStore.set(`${normalizedEmail}:${purpose}`, { otp, expiresAt, purpose });
}

export function verifyStoredOtp(email: string, inputOtp: string, purpose: 'register' | 'reset-password'): { valid: boolean; message: string } {
  const normalizedEmail = email.toLowerCase().trim();
  const key = `${normalizedEmail}:${purpose}`;
  const entry = otpStore.get(key);

  if (!entry) {
    return { valid: false, message: 'Kode OTP tidak ditemukan atau sudah kadaluarsa. Silakan minta kode baru.' };
  }

  if (Date.now() > entry.expiresAt) {
    otpStore.delete(key);
    return { valid: false, message: 'Kode OTP telah kadaluarsa (melewati batas 5 menit). Silakan minta kode baru.' };
  }

  if (entry.otp !== inputOtp.trim()) {
    return { valid: false, message: 'Kode OTP yang Anda masukkan salah. Periksa kembali email Anda.' };
  }

  // Hapus setelah berhasil diverifikasi untuk mencegah replay
  otpStore.delete(key);
  return { valid: true, message: 'Verifikasi OTP berhasil.' };
}

/**
 * Kirim email OTP menggunakan Google SMTP
 */
export async function sendOtpEmail({
  to,
  otp,
  purpose,
  recipientName,
}: {
  to: string;
  otp: string;
  purpose: 'register' | 'reset-password';
  recipientName?: string;
}): Promise<{ success: boolean; simulated: boolean; message: string; otp?: string }> {
  const config = getSmtpConfig();
  const normalizedEmail = to.toLowerCase().trim();

  // Simpan OTP ke memory store
  storeOtp(normalizedEmail, otp, purpose);

  const isRegistration = purpose === 'register';
  const subject = isRegistration
    ? `[DigiUMKM] Kode Verifikasi Pendaftaran: ${otp}`
    : `[DigiUMKM] Kode Verifikasi Reset Kata Sandi: ${otp}`;

  const greeting = recipientName ? `Halo Bapak/Ibu <strong>${recipientName}</strong>,` : 'Halo Mitra UMKM,';
  const actionText = isRegistration
    ? 'Gunakan kode verifikasi (OTP) di bawah ini untuk menyelesaikan pendaftaran akun toko Anda di platform DigiUMKM:'
    : 'Kami menerima permintaan untuk mereset kata sandi akun DigiUMKM Anda. Masukkan kode OTP berikut untuk melanjutkan:';

  const htmlContent = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; background-color: #f8fafc; border-radius: 16px; border: 1px solid #e2e8f0;">
      <div style="text-align: center; margin-bottom: 24px;">
        <div style="display: inline-block; width: 44px; height: 44px; background-color: #0284c7; border-radius: 12px; color: #ffffff; font-size: 20px; font-weight: bold; line-height: 44px; text-align: center;">DU</div>
        <h2 style="color: #0f172a; margin: 12px 0 4px 0; font-size: 20px; font-weight: 800;">DigiUMKM</h2>
        <p style="color: #64748b; font-size: 12px; margin: 0;">Pendamping Digital & Adopsi QRIS untuk UMKM</p>
      </div>

      <div style="background-color: #ffffff; padding: 24px; border-radius: 12px; border: 1px solid #cbd5e1; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
        <p style="color: #334155; font-size: 14px; margin-top: 0;">${greeting}</p>
        <p style="color: #475569; font-size: 13px; line-height: 1.5;">${actionText}</p>

        <div style="text-align: center; margin: 24px 0;">
          <div style="display: inline-block; padding: 12px 28px; background-color: #f0f9ff; border: 2px dashed #0284c7; border-radius: 12px; font-size: 28px; font-weight: 800; letter-spacing: 6px; color: #0369a1; font-family: monospace;">
            ${otp}
          </div>
          <p style="font-size: 11px; color: #64748b; margin-top: 8px;">Berlaku selama <strong>5 menit</strong>. Jangan berikan kode ini kepada siapapun.</p>
        </div>

        <p style="color: #64748b; font-size: 12px; line-height: 1.4; border-top: 1px solid #f1f5f9; padding-top: 16px; margin-bottom: 0;">
          Jika Anda tidak merasa melakukan permintaan ini, silakan abaikan email ini. Akun Anda tetap aman bersama kami.
        </p>
      </div>

      <div style="text-align: center; margin-top: 20px; font-size: 11px; color: #94a3b8;">
        &copy; 2026 DigiUMKM • Inisiatif Digitalisasi QRIS UMKM Jawa Timur
      </div>
    </div>
  `;

  // Cek apakah kredensial SMTP Google sudah dikonfigurasi
  const hasRealSmtp = Boolean(config.user && config.pass);

  if (!hasRealSmtp) {
    console.log(`\n======================================================`);
    console.log(`[MODE SIMULASI / DEV SMTP GMAIL]`);
    console.log(`Tujuan Email: ${normalizedEmail}`);
    console.log(`Jenis: ${purpose}`);
    console.log(`Kode OTP: >>> ${otp} <<<`);
    console.log(`(Tips: Isi SMTP_USER dan SMTP_PASS di .env.local untuk kirim email nyata via Gmail)`);
    console.log(`======================================================\n`);

    return {
      success: true,
      simulated: true,
      otp,
      message: `Kode verifikasi OTP telah dikirim (Mode Demo: Kode OTP Anda adalah ${otp}).`,
    };
  }

  try {
    const transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: config.user,
        pass: config.pass,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    await transporter.sendMail({
      from: config.from,
      to: normalizedEmail,
      subject,
      html: htmlContent,
      text: `Kode verifikasi DigiUMKM Anda adalah: ${otp}. Berlaku selama 5 menit.`,
    });

    return {
      success: true,
      simulated: false,
      message: `Kode verifikasi OTP berhasil dikirim ke alamat email ${normalizedEmail}.`,
    };
  } catch (err) {
    console.error('SMTP sendMail error:', err);
    // Fallback gracefully so registration / reset flow doesn't crash if Gmail network is blocked
    return {
      success: true,
      simulated: true,
      otp,
      message: `Gagal menghubungi server SMTP Gmail, beralih ke kode darurat: ${otp}`,
    };
  }
}

