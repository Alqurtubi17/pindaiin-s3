import { describe, it, expect } from 'vitest';
import {
  createPasswordResetToken,
  verifyPasswordResetToken,
} from '@/lib/email/smtp.service';
import { POST } from '@/app/api/auth/reset-password/route';

describe('Password reset link token flow', () => {
  it('verifies a valid reset token once and blocks replay', () => {
    const token = createPasswordResetToken('warung.siti@gmail.com');
    const first = verifyPasswordResetToken(token);
    expect(first.valid).toBe(true);
    expect(first.email).toBe('warung.siti@gmail.com');

    const second = verifyPasswordResetToken(token);
    expect(second.valid).toBe(false);
  });

  it('POST /api/auth/reset-password resets password with valid token', async () => {
    const token = createPasswordResetToken('pedagang@gmail.com');
    const req = new Request('http://localhost/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token,
        newPassword: 'passwordBaru123',
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.email).toBe('pedagang@gmail.com');
  });
});

