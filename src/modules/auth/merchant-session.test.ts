import { describe, it, expect, beforeEach } from 'vitest';
import {
  getMerchantSession,
  setMerchantSession,
  activateAdminDemoMerchantSession,
  clearMerchantSession,
  DEMO_MERCHANT_EMAIL,
  STORAGE_KEY_MERCHANT_SESSION,
} from './merchant-session';

describe('merchant-session', () => {
  beforeEach(() => {
    const store = new Map<string, string>();
    Object.defineProperty(globalThis, 'window', {
      value: {
        dispatchEvent: () => true,
      },
      configurable: true,
    });
    Object.defineProperty(globalThis, 'localStorage', {
      value: {
        getItem: (k: string) => store.get(k) ?? null,
        setItem: (k: string, v: string) => store.set(k, v),
        removeItem: (k: string) => store.delete(k),
      },
      configurable: true,
    });
  });

  it('returns null when no merchant session is stored', () => {
    expect(getMerchantSession()).toBeNull();
  });

  it('stores and retrieves a merchant session', () => {
    setMerchantSession({
      email: 'warung.siti@gmail.com',
      mode: 'merchant',
      loggedInAt: '2026-11-25T10:00:00Z',
    });

    const session = getMerchantSession();
    expect(session?.email).toBe('warung.siti@gmail.com');
    expect(session?.mode).toBe('merchant');
  });

  it('activates admin demo merchant session and clears cleanly', () => {
    const demo = activateAdminDemoMerchantSession();
    expect(demo.email).toBe(DEMO_MERCHANT_EMAIL);
    expect(demo.mode).toBe('admin_demo');
    expect(localStorage.getItem(STORAGE_KEY_MERCHANT_SESSION)).not.toBeNull();

    clearMerchantSession();
    expect(getMerchantSession()).toBeNull();
  });
});

