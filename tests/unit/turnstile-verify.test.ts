import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { POST } from '@/app/api/auth/verify-turnstile/route';

describe('POST /api/auth/verify-turnstile', () => {
  const originalSecret = process.env.TURNSTILE_SECRET_KEY;

  beforeEach(() => {
    delete process.env.TURNSTILE_SECRET_KEY;
  });

  afterEach(() => {
    if (originalSecret !== undefined) {
      process.env.TURNSTILE_SECRET_KEY = originalSecret;
    } else {
      delete process.env.TURNSTILE_SECRET_KEY;
    }
  });

  it('rejects empty token with 400', async () => {
    const req = new Request('http://localhost/api/auth/verify-turnstile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: '' }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.success).toBe(false);
  });

  it('accepts dev-turnstile-token when TURNSTILE_SECRET_KEY is not set', async () => {
    const req = new Request('http://localhost/api/auth/verify-turnstile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: 'dev-turnstile-token' }),
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.mode).toBe('local_dev');
  });
});

