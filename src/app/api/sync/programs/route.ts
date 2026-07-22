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

export async function GET() {
  try {
    if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('placeholder')) {
      return NextResponse.json({ success: false, data: [] });
    }
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data, error } = await supabase
      .from('program')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[API Programs GET] Supabase Error:', error.message);
      return NextResponse.json({ success: false, error: error.message, data: [] });
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

    // 1. Ensure priority_matrix exists
    let matrixId = toValidUuid("default_matrix_kkn56");
    try {
      const { data: mList } = await supabase.from('priority_matrix').select('id').eq('id', matrixId);
      if (!mList || mList.length === 0) {
        await supabase.from('priority_matrix').insert([{ id: matrixId }]);
      }
    } catch (e) {
      console.warn("Priority matrix check error:", e);
    }

    // 2. Ensure priority_item exists
    let itemId = toValidUuid("default_item_kkn56");
    try {
      const { data: iList } = await supabase.from('priority_item').select('id').eq('id', itemId);
      if (!iList || iList.length === 0) {
        await supabase.from('priority_item').insert([{
          id: itemId,
          matrix_id: matrixId,
          urgency: 5,
          seriousness: 5,
          growth: 5,
          total_score: 125
        }]);
      }
    } catch (e) {
      console.warn("Priority item check error:", e);
    }

    // 3. Format programs and upsert
    const dbRows = programs.map((p: any) => {
      const uuid = toValidUuid(p.id);
      return {
        id: uuid,
        priority_item_id: itemId,
        name: p.name || 'Program Kerja',
        description: JSON.stringify(p),
        status: 'PLANNED',
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date().toISOString().split('T')[0],
        photo_urls: p.photo_urls || []
      };
    });

    const { data, error } = await supabase
      .from('program')
      .upsert(dbRows, { onConflict: 'id' })
      .select();

    if (error) {
      console.warn('[API Programs POST] Supabase upsert notice:', error.message);
      return NextResponse.json({ success: true, warning: error.message, data: programs });
    }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error('[API Programs POST] Error:', err);
    return NextResponse.json({ success: true, warning: err.message });
  }
}
