// src/modules/auth/merchant-session.ts
// Pengelolaan sesi login pedagang dan akun testing/demo untuk mode pratinjau admin

export interface MerchantSession {
  email: string;
  mode: 'merchant' | 'admin_demo';
  loggedInAt: string;
}

export const STORAGE_KEY_MERCHANT_SESSION = 'digiumkm_merchant_session';
export const DEMO_MERCHANT_EMAIL = 'demo.warung@digiumkm.id';

export function getMerchantSession(): MerchantSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_MERCHANT_SESSION);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<MerchantSession>;
    if (parsed && typeof parsed.email === 'string' && (parsed.mode === 'merchant' || parsed.mode === 'admin_demo')) {
      return {
        email: parsed.email,
        mode: parsed.mode,
        loggedInAt: parsed.loggedInAt || new Date().toISOString(),
      };
    }
  } catch {
    // Abaikan jika parsing gagal
  }
  return null;
}

export function setMerchantSession(session: MerchantSession): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_MERCHANT_SESSION, JSON.stringify(session));
    if (typeof document !== 'undefined') {
      document.cookie = `${STORAGE_KEY_MERCHANT_SESSION}=${encodeURIComponent(session.mode)}; path=/; max-age=604800; SameSite=Lax`;
    }
    window.dispatchEvent(new Event('digiumkm_session_updated'));
  } catch {
    // Abaikan jika storage penuh
  }
}

export function activateAdminDemoMerchantSession(): MerchantSession {
  const session: MerchantSession = {
    email: DEMO_MERCHANT_EMAIL,
    mode: 'admin_demo',
    loggedInAt: new Date().toISOString(),
  };
  setMerchantSession(session);
  return session;
}

export function clearMerchantSession(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY_MERCHANT_SESSION);
    if (typeof document !== 'undefined') {
      document.cookie = `${STORAGE_KEY_MERCHANT_SESSION}=; path=/; max-age=0; SameSite=Lax`;
    }
    window.dispatchEvent(new Event('digiumkm_session_updated'));
  } catch {
    // Abaikan error storage
  }
}

