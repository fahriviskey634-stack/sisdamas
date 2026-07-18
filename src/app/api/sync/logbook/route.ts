import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { nim, logbookData } = body;

    if (!nim || !logbookData) {
      return NextResponse.json({ error: 'NIM dan logbookData wajib diisi' }, { status: 400 });
    }

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ error: 'Konfigurasi Supabase Server belum lengkap' }, { status: 500 });
    }

    const supabaseServer = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false }
    });

    const dates = Object.keys(logbookData);
    let syncCount = 0;

    for (const dateStr of dates) {
      const activities = logbookData[dateStr] || [];

      // 1. Upsert logbook entry for this date
      const { data: entryData, error: entryError } = await supabaseServer
        .from('logbook_entry')
        .upsert(
          { nim, entry_date: dateStr },
          { onConflict: 'nim,entry_date' }
        )
        .select()
        .single();

      if (entryError) {
        if (entryError.code === '42P01') {
          return NextResponse.json({
            status: 'warning',
            message: 'Tabel database logbook belum dibuat. Silakan jalankan migrasi 002_logbook_schema.sql di Supabase SQL Editor.',
            db_synced: false
          });
        }
        throw entryError;
      }

      // 2. Clear old activities for this entry
      const { error: deleteError } = await supabaseServer
        .from('logbook_activity')
        .delete()
        .eq('entry_id', entryData.id);

      if (deleteError) throw deleteError;

      // 3. Insert new activities
      if (activities.length > 0) {
        const activityInserts = activities.map((act: any) => ({
          entry_id: entryData.id,
          kegiatan: act.kegiatan || '-',
          output: act.output || '-',
          volume: Number(act.volume) || 1,
          satuan: act.satuan || 'kali',
          bukti_foto_url: act.bukti_foto_url || ''
        }));

        const { error: insertError } = await supabaseServer
          .from('logbook_activity')
          .insert(activityInserts);

        if (insertError) throw insertError;
      }

      syncCount++;
    }

    return NextResponse.json({
      status: 'success',
      message: `Berhasil mensinkronisasi ${syncCount} tanggal logbook ke database.`,
      db_synced: true
    });
  } catch (err: any) {
    console.error('Error syncing logbook:', err);
    return NextResponse.json({ error: err.message || 'Gagal sinkronisasi logbook' }, { status: 500 });
  }
}
