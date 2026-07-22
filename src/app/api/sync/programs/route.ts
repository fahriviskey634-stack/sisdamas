import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

function toValidUuid(str: string): string {
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str)) {
    return str;
  }
  const hex = crypto.createHash('md5').update(String(str)).digest('hex');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-a${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
}

const PERSISTENT_STORE_ID = toValidUuid('kkn56_program_gallery_global_store_v2');

export async function GET() {
  try {
    if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('placeholder')) {
      return NextResponse.json({ success: false, data: [] });
    }
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 1. Fetch from persistent cloud store
    const { data: storeRows, error: storeErr } = await supabase
      .from('logbook_activity')
      .select('output')
      .eq('id', PERSISTENT_STORE_ID)
      .limit(1);

    if (!storeErr && storeRows && storeRows.length > 0 && storeRows[0].output) {
      try {
        const parsed = JSON.parse(storeRows[0].output);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const res = NextResponse.json({ success: true, data: parsed });
          res.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
          return res;
        }
      } catch (pErr) {
        console.warn('[API Programs GET] Parse error:', pErr);
      }
    }

    // 2. Fallback to program table
    const { data, error } = await supabase
      .from('program')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('[API Programs GET] Program table fallback note:', error.message);
      return NextResponse.json({ success: true, data: [] });
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ success: true, data: [] });
    }

    const parsed = data.map((row: any) => {
      try {
        if (row.description && row.description.startsWith('{')) {
          const jsonObj = JSON.parse(row.description);
          return {
            ...jsonObj,
            id: String(jsonObj.id || row.id),
            photo_urls: row.photo_urls || jsonObj.photo_urls || []
          };
        }
      } catch {}

      return {
        id: String(row.id),
        name: row.name || 'Program Kerja',
        priorityName: 'Dokumentasi Kegiatan',
        volume: '1 Paket',
        frequency: 'Dokumentasi',
        location: 'Desa Sukahaji',
        target: 'Masyarakat',
        budget: '-',
        pic: 'Kelompok 56 KKN',
        status: row.status || 'Completed',
        progress: 100,
        description: row.description || '',
        evaluation: '',
        photo_urls: row.photo_urls || []
      };
    });

    const res = NextResponse.json({ success: true, data: parsed });
    res.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
    return res;
  } catch (err: any) {
    console.error('[API Programs GET] Error:', err);
    return NextResponse.json({ success: false, error: err.message, data: [] });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { programs } = body;

    if (!programs || !Array.isArray(programs)) {
      return NextResponse.json({ error: 'Format data programs harus array' }, { status: 400 });
    }

    if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('placeholder')) {
      return NextResponse.json({ success: true, warning: 'local_storage_mode', data: programs });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // 1. Ensure logbook_entry parent row exists
    let entryId = null;
    try {
      const { data: eList } = await supabase.from('logbook_entry').select('id').limit(1);
      if (eList && eList.length > 0) {
        entryId = eList[0].id;
      } else {
        entryId = crypto.randomUUID();
        await supabase.from('logbook_entry').insert([{
          id: entryId,
          nim: '1231030055',
          entry_date: new Date().toISOString().split('T')[0]
        }]);
      }
    } catch (e) {
      console.warn("Logbook entry check warning:", e);
    }

    // 2. Persist full programs array into persistent cloud store (logbook_activity)
    if (entryId) {
      try {
        const { error: storeErr } = await supabase.from('logbook_activity').upsert([{
          id: PERSISTENT_STORE_ID,
          entry_id: entryId,
          kegiatan: 'PROGRAM_GALLERY_STORE',
          output: JSON.stringify(programs),
          volume: programs.length,
          satuan: 'Album'
        }], { onConflict: 'id' });

        if (storeErr) {
          console.error('[API Programs POST] Cloud store upsert error:', storeErr.message);
        } else {
          console.log('[API Programs POST] Cloud store upsert SUCCESSFUL! Programs count:', programs.length);
        }
      } catch (sErr: any) {
        console.error('[API Programs POST] Cloud store exception:', sErr.message);
      }
    }

    return NextResponse.json({ success: true, data: programs });
  } catch (err: any) {
    console.error('[API Programs POST] Exception:', err);
    return NextResponse.json({ success: true, warning: err.message, data: [] });
  }
}
