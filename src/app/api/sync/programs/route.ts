import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

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
      console.error('[API Programs GET] Error:', error.message);
      const errRes = NextResponse.json({ success: false, error: error.message, data: [] });
      errRes.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
      return errRes;
    }

    const res = NextResponse.json({ success: true, data: data || [] });
    res.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
    return res;
  } catch (err: any) {
    const res = NextResponse.json({ success: false, error: err.message, data: [] });
    res.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
    return res;
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
      return NextResponse.json({ error: 'Supabase credentials tidak ditemukan' }, { status: 503 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Persiapkan item agar sesuai dengan kolom Supabase
    const formatted = programs.map((p: any) => ({
      id: String(p.id),
      name: p.name || 'Program Kerja',
      priorityName: p.priorityName || '-',
      volume: p.volume || '-',
      frequency: p.frequency || '-',
      location: p.location || '-',
      target: p.target || '-',
      budget: p.budget || '-',
      pic: p.pic || 'Kelompok 56 KKN',
      status: p.status || 'Planned',
      progress: Number(p.progress) || 0,
      description: p.description || '',
      evaluation: p.evaluation || '',
      photo_urls: p.photo_urls || []
    }));

    const { data, error } = await supabase
      .from('program')
      .upsert(formatted, { onConflict: 'id' })
      .select();

    if (error) {
      console.error('[API Programs POST] Supabase upsert error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error('[API Programs POST] Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
