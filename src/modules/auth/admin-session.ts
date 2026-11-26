// src/modules/auth/admin-session.ts
// Pengelolaan sesi login pengelola/admin untuk proteksi panel admin

export interface AdminSession {
  email: string;
  role: 'admin';
  loggedInAt: string;
}

export const STORAGE_KEY_ADMIN_SESSION = 'pindaiin_admin_session';

export function getAdminSession(): AdminSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ADMIN_SESSION);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<AdminSession>;
    if (parsed && typeof parsed.email === 'string' && parsed.role === 'admin') {
      return {
        email: parsed.email,
        role: 'admin',
        loggedInAt: parsed.loggedInAt || new Date().toISOString(),
      };
    }
  } catch {
    // Abaikan jika parsing gagal
  }
  return null;
}

export function setAdminSession(email: string): AdminSession {
  const session: AdminSession = {
    email: email.toLowerCase().trim(),
    role: 'admin',
    loggedInAt: new Date().toISOString(),
  };
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY_ADMIN_SESSION, JSON.stringify(session));
      if (typeof document !== 'undefined') {
        document.cookie = `${STORAGE_KEY_ADMIN_SESSION}=admin; path=/; max-age=604800; SameSite=Lax`;
      }
      window.dispatchEvent(new Event('pindaiin_admin_session_updated'));
    } catch {
      // Abaikan jika storage penuh
    }
  }
  return session;
}

export function clearAdminSession(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY_ADMIN_SESSION);
    if (typeof document !== 'undefined') {
      document.cookie = `${STORAGE_KEY_ADMIN_SESSION}=; path=/; max-age=0; SameSite=Lax`;
    }
    window.dispatchEvent(new Event('pindaiin_admin_session_updated'));
  } catch {
    // Abaikan error storage
  }
}

