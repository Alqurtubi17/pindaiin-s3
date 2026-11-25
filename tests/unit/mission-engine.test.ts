import { describe, it, expect } from 'vitest';
import { evaluateMissionClaim, SAMPLE_MISSIONS } from '@/modules/missions/mission.service';
import { computeLedgerSummary } from '@/modules/ledger/ledger.service';
import { PointsLedgerEntry } from '@/types/database.types';

describe('Mission Engine Logic', () => {
  const testMission = SAMPLE_MISSIONS[0];

  it('menyediakan 5 misi aktif untuk pedagang', () => {
    expect(SAMPLE_MISSIONS).toHaveLength(5);
  });

  it('berhasil klaim misi jika syarat terpenuhi dan belum pernah diklaim', () => {
    const res = evaluateMissionClaim(testMission, 'merchant-123', [], true);
    expect(res.success).toBe(true);
    expect(res.xpAwarded).toBe(50);
    expect(res.idempotencyKey).toBe(`mission_claim_merchant-123_${testMission.id}`);
  });

  it('menolak klaim jika misi sudah pernah diklaim sebelumnya (anti double-claim)', () => {
    const res = evaluateMissionClaim(testMission, 'merchant-123', [testMission.id], true);
    expect(res.success).toBe(false);
    expect(res.message).toContain('sudah pernah mengklaim');
  });

  it('menolak klaim jika prasyarat misi belum terpenuhi', () => {
    const res = evaluateMissionClaim(testMission, 'merchant-123', [], false);
    expect(res.success).toBe(false);
    expect(res.message).toContain('belum terpenuhi');
  });

  it('menolak klaim jika misi tidak aktif', () => {
    const inactiveMission = { ...testMission, is_active: false };
    const res = evaluateMissionClaim(inactiveMission, 'merchant-123', [], true);
    expect(res.success).toBe(false);
    expect(res.message).toContain('tidak aktif');
  });
});

describe('Points Ledger Engine', () => {
  it('menghitung akumulasi total XP dan saldo hadiah dengan benar', () => {
    const entries: PointsLedgerEntry[] = [
      {
        id: '1',
        merchant_id: 'm1',
        event_key: 'EV_1',
        source_type: 'test',
        source_id: 's1',
        delta: 100, // +100
        idempotency_key: 'k1',
        created_at: '2026-11-24T00:00:00Z',
        created_by: null,
      },
      {
        id: '2',
        merchant_id: 'm1',
        event_key: 'EV_2',
        source_type: 'test',
        source_id: 's2',
        delta: 50, // +50
        idempotency_key: 'k2',
        created_at: '2026-11-24T01:00:00Z',
        created_by: null,
      },
      {
        id: '3',
        merchant_id: 'm1',
        event_key: 'EV_3',
        source_type: 'test',
        source_id: 's3',
        delta: -30, // Penukaran hadiah (-30)
        idempotency_key: 'k3',
        created_at: '2026-11-24T02:00:00Z',
        created_by: null,
      },
    ];

    const result = computeLedgerSummary(entries);
    // Total XP hanya menjumlahkan delta positif = 100 + 50 = 150
    expect(result.totalXp).toBe(150);
    // Saldo hadiah = 100 + 50 - 30 = 120
    expect(result.currentBalance).toBe(120);
    expect(result.formattedEntries.length).toBe(3);
    // Urutan entri terbaru harus di awal (reverse)
    expect(result.formattedEntries[0].id).toBe('3');
  });
});

