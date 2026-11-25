// src/lib/db/neon.ts
// Koneksi serverless PostgreSQL untuk Neon.tech
import { neon } from '@neondatabase/serverless';

// Mengambil DATABASE_URL dari environment
const connectionString = process.env.DATABASE_URL || '';

export const sql = connectionString ? neon(connectionString) : null;

export function getDb() {
  if (!process.env.DATABASE_URL) {
    console.warn('DATABASE_URL belum diatur di .env.local');
  }
  return neon(process.env.DATABASE_URL || '');
}

/**
 * Helper untuk mengeksekusi parameterized query ke Neon PostgreSQL
 */
export async function queryDb<T = Record<string, unknown>>(
  text: string,
  params: unknown[] = []
): Promise<T[]> {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    throw new Error('DATABASE_URL tidak ditemukan di konfigurasi environment.');
  }

  const sqlClient = neon(dbUrl);
  const rows = await sqlClient.query(text, params);
  return rows as T[];
}


