// src/modules/merchants/categories.service.ts
// Layanan pengelolaan master kategori usaha yang sinkron antara Merchant dan Admin

export const DEFAULT_BUSINESS_CATEGORIES: string[] = [
  'Kelontong & Sembako',
  'Makanan & Minuman / Warung',
  'Warung Kopi & Kuliner',
  'Pakaian & Fashion',
  'Pulsa & Konter HP',
  'Pertanian & Peternakan',
  'Jasa / Servis / Bengkel',
];

const STORAGE_KEY = 'digiumkm_business_categories';

export function getStoredCategories(): string[] {
  if (typeof window === 'undefined') {
    return DEFAULT_BUSINESS_CATEGORIES;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // Abaikan jika parsing gagal
  }
  return DEFAULT_BUSINESS_CATEGORIES;
}

export function saveStoredCategories(categories: string[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(categories));
    // Trigger storage event agar tab lain/komponen lain langsung update
    window.dispatchEvent(new Event('storage'));
  } catch {
    // Storage quota
  }
}

