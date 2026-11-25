// src/app/api/activities/route.ts
import { NextResponse } from 'next/server';
import { queryDb } from '@/lib/db/neon';
import { SAMPLE_QRIS_RECEIPT } from '@/modules/payment-activity/activity.service';

export const dynamic = 'force-dynamic';

interface ActivityDbRow {
  id: string;
  merchant_id: string;
  activity_date: string | Date;
  activity_type: string;
  reported_count: number;
  source: string;
  status: string;
  provider_reference: string | null;
  evidence_storage_key: string | null;
  created_at: string | Date;
  verified_by: string | null;
  verified_at: string | Date | null;
  business_name: string | null;
  regency: string | null;
  display_name: string | null;
}

export async function GET() {
  try {
    const query = `
      SELECT 
        pa.id,
        pa.merchant_id,
        pa.activity_date,
        pa.activity_type,
        pa.reported_count,
        pa.source,
        pa.status,
        pa.provider_reference,
        pa.evidence_storage_key,
        pa.created_at,
        pa.verified_by,
        pa.verified_at,
        m.business_name,
        m.regency,
        p.display_name
      FROM payment_activities pa
      LEFT JOIN merchants m ON pa.merchant_id = m.id
      LEFT JOIN profiles p ON m.user_id = p.id
      ORDER BY pa.created_at DESC
    `;

    const rows = await queryDb<ActivityDbRow>(query);

    const activities = rows.map((row) => {
      let photoUrl: string | null = null;
      if (row.evidence_storage_key === 'sample_qris_receipt') {
        photoUrl = SAMPLE_QRIS_RECEIPT;
      } else if (
        row.evidence_storage_key &&
        (row.evidence_storage_key.startsWith('data:image') || row.evidence_storage_key.startsWith('http'))
      ) {
        photoUrl = row.evidence_storage_key;
      }

      const formattedDate =
        row.activity_date instanceof Date
          ? row.activity_date.toISOString().split('T')[0]
          : String(row.activity_date).split('T')[0];

      return {
        id: row.id,
        merchant_id: row.merchant_id,
        merchantName: row.business_name || row.display_name || 'Warung Mitra DigiUMKM',
        regency: row.regency || 'Jawa Timur',
        activity_date: formattedDate,
        activity_type: row.activity_type,
        reported_count: row.reported_count,
        source: row.source,
        status: row.status,
        provider_reference: row.provider_reference,
        evidence_storage_key: row.evidence_storage_key,
        evidencePhotoUrl: photoUrl,
        created_at:
          row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at),
        verified_by: row.verified_by,
        verified_at:
          row.verified_at instanceof Date
            ? row.verified_at.toISOString()
            : row.verified_at
            ? String(row.verified_at)
            : null,
      };
    });

    return NextResponse.json({
      success: true,
      data: activities,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Database error';
    console.error('[API Activities GET Error]:', errorMsg);
    return NextResponse.json(
      {
        success: false,
        error: errorMsg,
        data: [],
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      merchant_id = 'e0000000-0000-0000-0000-000000000001',
      activityDate = new Date().toISOString().split('T')[0],
      activityType = 'qris_in_store',
      reportedCount = 1,
      evidencePhotoUrl = null,
    } = body;

    const count = parseInt(String(reportedCount), 10) || 1;
    const storageKey = evidencePhotoUrl || (body.notes ? `note:${body.notes}` : null);

    const insertQuery = `
      INSERT INTO payment_activities (
        merchant_id,
        activity_date,
        activity_type,
        reported_count,
        source,
        status,
        evidence_storage_key
      ) VALUES ($1, $2, $3, $4, 'self_reported', 'submitted', $5)
      RETURNING *
    `;

    const [newRow] = await queryDb<ActivityDbRow>(insertQuery, [
      merchant_id,
      activityDate,
      activityType,
      count,
      storageKey,
    ]);

    // Ambil info merchant
    const merchantRows = await queryDb<{ business_name: string; regency: string }>(
      'SELECT business_name, regency FROM merchants WHERE id = $1',
      [merchant_id]
    );
    const m = merchantRows[0] || { business_name: 'Warung Berkah Bu Siti', regency: 'Jember' };

    return NextResponse.json({
      success: true,
      message: 'Laporan transaksi berhasil dikirim.',
      data: {
        ...newRow,
        merchantName: m.business_name,
        regency: m.regency,
        evidencePhotoUrl: evidencePhotoUrl,
      },
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Gagal mengirim laporan';
    console.error('[API Activities POST Error]:', errorMsg);
    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, ids, activity_date, reported_count, status, rejection_reason } = body;

    // Dukungan Operasi Massal (Bulk Edit / Batch Status Change)
    if (ids && Array.isArray(ids) && ids.length > 0) {
      if (!status) {
        return NextResponse.json(
          { success: false, error: 'Status baru wajib ditentukan untuk pembaruan massal.' },
          { status: 400 }
        );
      }

      for (const targetId of ids) {
        const existing = await queryDb<{ id: string; merchant_id: string; status: string }>(
          'SELECT id, merchant_id, status FROM payment_activities WHERE id = $1',
          [targetId]
        );
        if (existing.length === 0) continue;
        const prev = existing[0];

        await queryDb(
          `UPDATE payment_activities SET status = $1, verified_at = NOW() WHERE id = $2`,
          [status, targetId]
        );

        // Poin Ledger
        if (prev.status !== 'verified' && status === 'verified') {
          try {
            await queryDb(
              `INSERT INTO points_ledger (merchant_id, event_key, source_type, source_id, delta, idempotency_key)
               VALUES ($1, 'payment_verified', 'payment_activities', $2, 30, $3)
               ON CONFLICT (idempotency_key) DO NOTHING`,
              [prev.merchant_id, targetId, `bulk_verify_${targetId}_${Date.now()}`]
            );
          } catch (e) {
            console.warn('[Bulk Ledger Add]:', e);
          }
        } else if (prev.status === 'verified' && status === 'rejected') {
          try {
            await queryDb(
              `INSERT INTO points_ledger (merchant_id, event_key, source_type, source_id, delta, idempotency_key)
               VALUES ($1, 'payment_revoked', 'payment_activities', $2, -30, $3)
               ON CONFLICT (idempotency_key) DO NOTHING`,
              [prev.merchant_id, targetId, `bulk_revoke_${targetId}_${Date.now()}`]
            );
          } catch (e) {
            console.warn('[Bulk Ledger Revoke]:', e);
          }
        }

        // Audit Log
        try {
          await queryDb(
            `INSERT INTO audit_logs (actor_id, action, entity_type, entity_id, metadata_json)
             VALUES ($1, 'BULK_EDIT_PAYMENT_ACTIVITY', 'payment_activities', $2, $3::jsonb)`,
            [
              'a0000000-0000-0000-0000-000000000001',
              targetId,
              JSON.stringify({ previous_status: prev.status, new_status: status, rejection_reason: rejection_reason || null }),
            ]
          );
        } catch (e) {
          console.warn('[Bulk Audit]:', e);
        }
      }

      return NextResponse.json({
        success: true,
        message: `${ids.length} laporan berhasil diperbarui sekaligus.`,
      });
    }

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID laporan wajib disertakan.' },
        { status: 400 }
      );
    }

    // 1. Cek laporan yang ada
    const existing = await queryDb<{ id: string; merchant_id: string; status: string; reported_count: number }>(
      'SELECT id, merchant_id, status, reported_count FROM payment_activities WHERE id = $1',
      [id]
    );

    if (existing.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Laporan tidak ditemukan.' },
        { status: 404 }
      );
    }

    const prev = existing[0];
    const newCount = reported_count !== undefined ? parseInt(String(reported_count), 10) : prev.reported_count;
    const newStatus = status || prev.status;

    // 2. Perbarui laporan
    const updateQuery = `
      UPDATE payment_activities
      SET 
        activity_date = COALESCE($1, activity_date),
        reported_count = $2,
        status = $3,
        verified_at = NOW()
      WHERE id = $4
      RETURNING *
    `;

    const [updatedRow] = await queryDb<ActivityDbRow>(updateQuery, [
      activity_date || null,
      newCount,
      newStatus,
      id,
    ]);

    // 3. Sinkronkan poin ledger jika status berubah
    if (prev.status !== 'verified' && newStatus === 'verified') {
      const idempotencyKey = `verify_act_${id}_${Date.now()}`;
      try {
        await queryDb(
          `INSERT INTO points_ledger (
             merchant_id, event_key, source_type, source_id, delta, idempotency_key
           ) VALUES ($1, 'payment_verified', 'payment_activities', $2, 30, $3)
           ON CONFLICT (idempotency_key) DO NOTHING`,
          [prev.merchant_id, id, idempotencyKey]
        );
      } catch (ledgerErr) {
        console.warn('[Ledger Sync on Edit]:', ledgerErr);
      }
    } else if (prev.status === 'verified' && newStatus === 'rejected') {
      try {
        const revokeKey = `revoke_act_${id}_${Date.now()}`;
        await queryDb(
          `INSERT INTO points_ledger (
             merchant_id, event_key, source_type, source_id, delta, idempotency_key
           ) VALUES ($1, 'payment_revoked', 'payment_activities', $2, -30, $3)
           ON CONFLICT (idempotency_key) DO NOTHING`,
          [prev.merchant_id, id, revokeKey]
        );
      } catch (ledgerErr) {
        console.warn('[Ledger Revoke on Edit]:', ledgerErr);
      }
    }

    // 4. Catat Audit Log
    try {
      await queryDb(
        `INSERT INTO audit_logs (
           actor_id, action, entity_type, entity_id, metadata_json
         ) VALUES ($1, 'EDIT_PAYMENT_ACTIVITY', 'payment_activities', $2, $3::jsonb)`,
        [
          'a0000000-0000-0000-0000-000000000001',
          id,
          JSON.stringify({
            previous_status: prev.status,
            new_status: newStatus,
            previous_count: prev.reported_count,
            new_count: newCount,
            rejection_reason: rejection_reason || null,
          }),
        ]
      );
    } catch (auditErr) {
      console.warn('[Audit Log Edit Notice]:', auditErr);
    }

    return NextResponse.json({
      success: true,
      message: 'Perubahan laporan transaksi berhasil disimpan.',
      data: updatedRow,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Gagal mengubah laporan';
    console.error('[API Activities PATCH Error]:', errorMsg);
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    let id = searchParams.get('id');
    let ids: string[] | null = null;

    try {
      const body = await request.json();
      if (body) {
        if (body.ids && Array.isArray(body.ids)) {
          ids = body.ids;
        } else if (body.id) {
          id = body.id;
        }
      }
    } catch {
      // body kosong, gunakan searchParams
    }

    // Dukungan Operasi Hapus Massal (Bulk Delete)
    if (ids && ids.length > 0) {
      for (const targetId of ids) {
        const existing = await queryDb<{ id: string; merchant_id: string; status: string }>(
          'SELECT id, merchant_id, status FROM payment_activities WHERE id = $1',
          [targetId]
        );
        if (existing.length === 0) continue;
        const act = existing[0];

        if (act.status === 'verified') {
          try {
            await queryDb(
              `INSERT INTO points_ledger (merchant_id, event_key, source_type, source_id, delta, idempotency_key)
               VALUES ($1, 'payment_deleted', 'payment_activities', $2, -30, $3)
               ON CONFLICT (idempotency_key) DO NOTHING`,
              [act.merchant_id, targetId, `bulk_del_act_${targetId}_${Date.now()}`]
            );
          } catch (e) {
            console.warn('[Bulk Del Ledger]:', e);
          }
        }

        await queryDb('DELETE FROM payment_activities WHERE id = $1', [targetId]);

        try {
          await queryDb(
            `INSERT INTO audit_logs (actor_id, action, entity_type, entity_id, metadata_json)
             VALUES ($1, 'BULK_DELETE_PAYMENT_ACTIVITY', 'payment_activities', $2, $3::jsonb)`,
            [
              'a0000000-0000-0000-0000-000000000001',
              targetId,
              JSON.stringify({ deleted_activity_id: targetId, merchant_id: act.merchant_id, status: act.status }),
            ]
          );
        } catch (e) {
          console.warn('[Bulk Del Audit]:', e);
        }
      }

      return NextResponse.json({
        success: true,
        message: `${ids.length} laporan berhasil dihapus sekaligus.`,
      });
    }

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID laporan wajib disertakan.' },
        { status: 400 }
      );
    }

    // 1. Ambil data sebelum dihapus
    const existing = await queryDb<{ id: string; merchant_id: string; status: string }>(
      'SELECT id, merchant_id, status FROM payment_activities WHERE id = $1',
      [id]
    );

    if (existing.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Laporan tidak ditemukan.' },
        { status: 404 }
      );
    }

    const activity = existing[0];

    // 2. Jika tadinya disetujui, tarik kembali poin
    if (activity.status === 'verified') {
      try {
        const delRevokeKey = `del_act_${id}_${Date.now()}`;
        await queryDb(
          `INSERT INTO points_ledger (
             merchant_id, event_key, source_type, source_id, delta, idempotency_key
           ) VALUES ($1, 'payment_deleted', 'payment_activities', $2, -30, $3)
           ON CONFLICT (idempotency_key) DO NOTHING`,
          [activity.merchant_id, id, delRevokeKey]
        );
      } catch (ledgerErr) {
        console.warn('[Ledger Cleanup on Delete]:', ledgerErr);
      }
    }

    // 3. Hapus dari database
    await queryDb('DELETE FROM payment_activities WHERE id = $1', [id]);

    // 4. Catat Audit Log
    try {
      await queryDb(
        `INSERT INTO audit_logs (
           actor_id, action, entity_type, entity_id, metadata_json
         ) VALUES ($1, 'DELETE_PAYMENT_ACTIVITY', 'payment_activities', $2, $3::jsonb)`,
        [
          'a0000000-0000-0000-0000-000000000001',
          id,
          JSON.stringify({
            deleted_activity_id: id,
            merchant_id: activity.merchant_id,
            status: activity.status,
          }),
        ]
      );
    } catch (auditErr) {
      console.warn('[Audit Log Delete Notice]:', auditErr);
    }

    return NextResponse.json({
      success: true,
      message: 'Laporan aktivitas berhasil dihapus.',
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Gagal menghapus laporan';
    console.error('[API Activities DELETE Error]:', errorMsg);
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}

