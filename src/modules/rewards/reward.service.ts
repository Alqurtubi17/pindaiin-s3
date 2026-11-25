// src/modules/rewards/reward.service.ts
// Layanan katalog hadiah dan validasi penukaran reward atomik

import { Reward } from '@/types/database.types';

export const SAMPLE_REWARDS: Reward[] = [
  {
    id: 'r1111111-1111-1111-1111-111111111111',
    name: 'Pulsa Seluler Rp 10.000',
    description: 'Pulsa all-operator untuk mendukung kelancaran kuota internet di warung Anda.',
    category: 'voucher',
    points_cost: 100,
    stock: 50,
    is_active: true,
    fulfillment_instructions: 'Pulsa akan diisikan langsung ke nomor telepon terdaftar dalam waktu 1x24 jam kerja.',
  },
  {
    id: 'r2222222-2222-2222-2222-222222222222',
    name: 'Stand Stiker QRIS Akrilik Tahan Air',
    description: 'Pajangan akrilik meja kasir agar stiker QRIS Anda aman dari cipratan air dan mudah dilihat pembeli.',
    category: 'merchandise',
    points_cost: 200,
    stock: 25,
    is_active: true,
    fulfillment_instructions: 'Dikirimkan ke alamat usaha Anda oleh tim pendamping lapangan pada kunjungan berikutnya.',
  },
  {
    id: 'r3333333-3333-3333-3333-333333333333',
    name: 'Voucher Belanja Sembako Rp 25.000',
    description: 'Voucher belanja perlengkapan warung di toko grosir sembako mitra terdekat.',
    category: 'voucher',
    points_cost: 300,
    stock: 10,
    is_active: true,
    fulfillment_instructions: 'Kode voucher unik akan tampil di halaman riwayat dan dapat ditunjukkan saat belanja.',
  },
  {
    id: 'r4444444-4444-4444-4444-444444444444',
    name: 'Banner Spanduk "Menerima QRIS" (1x0.5m)',
    description: 'Spanduk promosi toko Anda bahwa warung sudah melayani pembayaran non-tunai.',
    category: 'merchandise',
    points_cost: 450,
    stock: 0, // Contoh stok habis
    is_active: true,
    fulfillment_instructions: 'Dicetak khusus dengan nama warung Anda dan dikirim ke alamat usaha.',
  },
];

export interface RedeemRewardResult {
  success: boolean;
  message: string;
  newBalance?: number;
  newStock?: number | null;
  idempotencyKey?: string;
}

export function validateAndRedeemReward(
  reward: Reward,
  merchantId: string,
  currentBalance: number
): RedeemRewardResult {
  // 1. Cek status aktif
  if (!reward.is_active) {
    return {
      success: false,
      message: 'Hadiah ini sedang tidak aktif atau tidak dapat ditukarkan.',
    };
  }

  // 2. Cek stok
  if (reward.stock !== null && reward.stock <= 0) {
    return {
      success: false,
      message: 'Maaf, stok hadiah ini telah habis.',
    };
  }

  // 3. Cek kecukupan saldo poin
  if (currentBalance < reward.points_cost) {
    return {
      success: false,
      message: `Poin Anda (${currentBalance} Poin) belum mencukupi untuk hadiah ini (${reward.points_cost} Poin dibutuhkan).`,
    };
  }

  const newBalance = currentBalance - reward.points_cost;
  const newStock = reward.stock !== null ? reward.stock - 1 : null;
  const idempotencyKey = `redemption_${merchantId}_${reward.id}_${Date.now()}`;

  return {
    success: true,
    message: `Penukaran "${reward.name}" berhasil! Saldo Anda berkurang ${reward.points_cost} poin.`,
    newBalance,
    newStock,
    idempotencyKey,
  };
}

