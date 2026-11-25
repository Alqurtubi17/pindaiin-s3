// src/modules/merchants/admin-merchants.service.ts
'use client';

export interface AdminMerchantItem {
  id: string;
  userId: string;
  displayName: string;
  businessName: string;
  email: string;
  phone: string;
  businessCategory: string;
  regency: string;
  level: number;
  currentXp: number;
  status: 'active' | 'suspended';
  registeredAt: string;
  lastPasswordResetAt?: string;
}

export const INITIAL_MERCHANTS: AdminMerchantItem[] = [
  {
    id: 'm-001',
    userId: 'u-001',
    displayName: 'Siti Aminah',
    businessName: 'Warung Bu Siti',
    email: 'warung.siti@gmail.com',
    phone: '081234567890',
    businessCategory: 'Kuliner & Warung Makan',
    regency: 'Banyuwangi',
    level: 3,
    currentXp: 380,
    status: 'active',
    registeredAt: '2026-11-01T08:00:00Z',
  },
  {
    id: 'm-002',
    userId: 'u-002',
    displayName: 'Ahmad Fauzi',
    businessName: 'Toko Kelontong Berkah',
    email: 'kelontong.fauzi@gmail.com',
    phone: '082198765432',
    businessCategory: 'Kelontong & Sembako',
    regency: 'Jember',
    level: 2,
    currentXp: 210,
    status: 'active',
    registeredAt: '2026-11-05T09:30:00Z',
  },
  {
    id: 'm-003',
    userId: 'u-003',
    displayName: 'Pak Slamet',
    businessName: 'Kedai Kopi Pak Slamet',
    email: 'kopi.slamet@gmail.com',
    phone: '085311223344',
    businessCategory: 'Minuman & Kopi',
    regency: 'Malang',
    level: 4,
    currentXp: 540,
    status: 'active',
    registeredAt: '2026-10-20T11:15:00Z',
  },
  {
    id: 'm-004',
    userId: 'u-004',
    displayName: 'Nurul Hidayati',
    businessName: 'Batik Tradisional Madura',
    email: 'batik.madura@gmail.com',
    phone: '087855667788',
    businessCategory: 'Fashion & Pakaian',
    regency: 'Bangkalan',
    level: 2,
    currentXp: 180,
    status: 'active',
    registeredAt: '2026-11-12T14:00:00Z',
  },
  {
    id: 'm-005',
    userId: 'u-005',
    displayName: 'Joko Prabowo',
    businessName: 'Bengkel Las Mandiri',
    email: 'joko.las@gmail.com',
    phone: '081399887766',
    businessCategory: 'Jasa & Bengkel',
    regency: 'Pasuruan',
    level: 1,
    currentXp: 90,
    status: 'active',
    registeredAt: '2026-11-18T10:45:00Z',
  },
  {
    id: 'm-006',
    userId: 'u-006',
    displayName: 'Budi Santoso',
    businessName: 'Toko Sayur Segar Mas Budi',
    email: 'sayur.budi@gmail.com',
    phone: '082233445566',
    businessCategory: 'Pertanian & Hasil Bumi',
    regency: 'Kediri',
    level: 3,
    currentXp: 340,
    status: 'active',
    registeredAt: '2026-11-19T08:20:00Z',
  },
  {
    id: 'm-007',
    userId: 'u-007',
    displayName: 'Dewi Lestari',
    businessName: 'Apotek Rakyat Sehat',
    email: 'apotek.dewi@gmail.com',
    phone: '085711229988',
    businessCategory: 'Kesehatan & Obat',
    regency: 'Probolinggo',
    level: 2,
    currentXp: 160,
    status: 'active',
    registeredAt: '2026-11-20T13:10:00Z',
  },
  {
    id: 'm-008',
    userId: 'u-008',
    displayName: 'Hendra Kurniawan',
    businessName: 'Percetakan & ATK Jaya',
    email: 'atk.hendra@gmail.com',
    phone: '081299775533',
    businessCategory: 'Jasa & Percetakan',
    regency: 'Sidoarjo',
    level: 4,
    currentXp: 620,
    status: 'active',
    registeredAt: '2026-11-21T09:40:00Z',
  },
  {
    id: 'm-009',
    userId: 'u-009',
    displayName: 'Sri Wahyuni',
    businessName: 'Bakso Solo Asli Bu Sri',
    email: 'bakso.sri@gmail.com',
    phone: '087788990011',
    businessCategory: 'Kuliner & Warung Makan',
    regency: 'Surabaya',
    level: 3,
    currentXp: 410,
    status: 'active',
    registeredAt: '2026-11-22T15:30:00Z',
  },
  {
    id: 'm-010',
    userId: 'u-010',
    displayName: 'Agus Supriyanto',
    businessName: 'Toko Pancing Bahari',
    email: 'pancing.agus@gmail.com',
    phone: '085233441122',
    businessCategory: 'Kelontong & Sembako',
    regency: 'Tuban',
    level: 1,
    currentXp: 75,
    status: 'active',
    registeredAt: '2026-11-23T11:00:00Z',
  },
];

const STORAGE_KEY = 'digiumkm_admin_merchants_list';
const PASSWORD_REGISTRY_KEY = 'digiumkm_user_passwords_registry';

export function getAdminMerchants(): AdminMerchantItem[] {
  if (typeof window === 'undefined') return INITIAL_MERCHANTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_MERCHANTS));
      return INITIAL_MERCHANTS;
    }
    const parsed: AdminMerchantItem[] = JSON.parse(raw);
    if (parsed.length < INITIAL_MERCHANTS.length) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_MERCHANTS));
      return INITIAL_MERCHANTS;
    }
    return parsed;
  } catch {
    return INITIAL_MERCHANTS;
  }
}

export function saveAdminMerchants(list: AdminMerchantItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (err) {
    console.error('Failed to save admin merchants list:', err);
  }
}

/**
 * Admin langsung mereset password merchant
 */
export function directResetMerchantPassword(merchantId: string, newPassword: string): { success: boolean; message: string } {
  if (typeof window === 'undefined') return { success: false, message: 'Window not defined' };

  try {
    const list = getAdminMerchants();
    const target = list.find((m) => m.id === merchantId);

    if (!target) {
      return { success: false, message: 'Data merchant tidak ditemukan.' };
    }

    // 1. Catat ke registry kata sandi lokal sehingga user bisa langsung login dengan sandi baru ini
    const registryRaw = localStorage.getItem(PASSWORD_REGISTRY_KEY);
    const registry: Record<string, string> = registryRaw ? JSON.parse(registryRaw) : {};
    registry[target.email.toLowerCase()] = newPassword;
    localStorage.setItem(PASSWORD_REGISTRY_KEY, JSON.stringify(registry));

    // 2. Update status merchant terakhir reset
    const updated = list.map((m) =>
      m.id === merchantId
        ? { ...m, lastPasswordResetAt: new Date().toISOString() }
        : m
    );
    saveAdminMerchants(updated);

    return {
      success: true,
      message: `Kata sandi untuk ${target.displayName} (${target.businessName}) berhasil diperbarui langsung oleh admin.`,
    };
  } catch (err) {
    return { success: false, message: 'Gagal memperbarui kata sandi: ' + (err as Error).message };
  }
}

/**
 * Toggle status merchant (Aktif / Nonaktif)
 */
export function toggleMerchantStatus(merchantId: string): AdminMerchantItem[] {
  const list = getAdminMerchants();
  const updated = list.map((m) =>
    m.id === merchantId
      ? { ...m, status: (m.status === 'active' ? 'suspended' : 'active') as 'active' | 'suspended' }
      : m
  );
  saveAdminMerchants(updated);
  return updated;
}

/**
 * Generate temporary secure password (contoh: Digi#4829!)
 */
export function generateRandomPassword(): string {
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  const symbols = ['!', '@', '#', '$', '%'];
  const sym = symbols[Math.floor(Math.random() * symbols.length)];
  return `Digi#${randomNum}${sym}`;
}

