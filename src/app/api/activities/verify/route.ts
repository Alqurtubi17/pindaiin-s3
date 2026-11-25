// src/app/api/activities/verify/route.ts
import { NextResponse } from 'next/server';
import { queryDb } from '@/lib/db/neon';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      id,
      decision,
      rejectionReason = '',
      adminId = 'a0000000-0000-0000-0000-000000000001',
    } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID aktivitas wajib disertakan.' },
        { status: 400 }
      );
    }

    if (decision !== 'approve' && decision !== 'reject') {
      return NextResponse.json(
        { success: false, error: 'Keputusan verifikasi tidak valid (harus approve atau reject).' },
        { status: 400 }
      );
    }

    if (decision === 'reject' && (!rejectionReason || !rejectionReason.trim())) {
      return NextResponse.json(
        { success: false, error: 'Alasan penolakan wajib dicantumkan sesuai SOP verifikasi.' },
        { status: 400 }
      );
    }

    // 1. Cek aktivitas di DB
    const existing = await queryDb<{ id: string; status: string; merchant_id: string }>(
      'SELECT id, status, merchant_id FROM payment_activities WHERE id = $1',
      [id]
    );

    if (existing.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Data laporan transaksi tidak ditemukan.' },
        { status: 404 }
      );
    }

    const activity = existing[0];
    if (activity.status !== 'submitted') {
      return NextResponse.json(
        {
          success: false,
          error: `Aktivitas ini sudah diverifikasi sebelumnya dengan status '${activity.status}'.`,
        },
        { status: 400 }
      );
    }

    const newStatus = decision === 'approve' ? 'verified' : 'rejected';
    const xpAwarded = decision === 'approve' ? 30 : 0;

    // 2. Update status aktivitas di database
    await queryDb(
      `UPDATE payment_activities 
       SET status = $1, verified_by = $2, verified_at = NOW() 
       WHERE id = $3`,
      [newStatus, adminId, id]
    );

    // 3. Jika disetujui: Tambah poin ledger (+30 XP)
    if (decision === 'approve') {
      const idempotencyKey = `verify_act_${id}`;
      try {
        await queryDb(
          `INSERT INTO points_ledger (
             merchant_id, event_key, source_type, source_id, delta, idempotency_key, created_by
           ) VALUES ($1, 'payment_verified', 'payment_activities', $2, $3, $4, $5)
           ON CONFLICT (idempotency_key) DO NOTHING`,
          [activity.merchant_id, id, xpAwarded, idempotencyKey, adminId]
        );
      } catch (ledgerErr) {
        console.warn('[Points Ledger Insert Notice]:', ledgerErr);
      }
    }

    // 4. Catat Audit Log
    try {
      const action = decision === 'approve' ? 'APPROVE_PAYMENT_ACTIVITY' : 'REJECT_PAYMENT_ACTIVITY';
      const metadataJson = JSON.stringify({
        merchant_id: activity.merchant_id,
        previous_status: activity.status,
        new_status: newStatus,
        rejection_reason: rejectionReason || null,
        xp_awarded: xpAwarded,
      });

      await queryDb(
        `INSERT INTO audit_logs (
           actor_id, action, entity_type, entity_id, metadata_json
         ) VALUES ($1, $2, 'payment_activities', $3, $4::jsonb)`,
        [adminId, action, id, metadataJson]
      );
    } catch (auditErr) {
      console.warn('[Audit Log Insert Notice]:', auditErr);
    }

    const message =
      decision === 'approve'
        ? 'Laporan transaksi berhasil disetujui. Bonus +30 XP telah ditambahkan ke akun pedagang.'
        : `Laporan transaksi ditolak. Alasan: "${rejectionReason}".`;

    return NextResponse.json({
      success: true,
      message,
      status: newStatus,
      xpAwarded,
      verified_by: adminId,
      verified_at: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Gagal memproses verifikasi';
    console.error('[API Activities Verify Error]:', errorMsg);
    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: 500 }
    );
  }
}

