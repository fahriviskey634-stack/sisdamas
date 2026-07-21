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
      .from('priority_item')
      .select('*')
      .order('rank', { ascending: true });

    if (error) {
      console.error('[API Priority GET] Error:', error.message);
      return NextResponse.json({ success: false, error: error.message, data: [] });
    }

    return NextResponse.json({ success: true, data: data || [] });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message, data: [] });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { items } = body;

    if (!items || !Array.isArray(items)) {
      return NextResponse.json({ error: 'Format data items harus array' }, { status: 400 });
    }

    if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('placeholder')) {
      return NextResponse.json({ error: 'Supabase credentials tidak ditemukan' }, { status: 503 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const formatted = items.map((item: any) => ({
      id: String(item.id),
      problem_text: item.problem_text || '',
      category: item.category || 'Infrastruktur',
      rt_label: item.rt_label || 'RT 01 / RW 01',
      urgency: Number(item.urgency) || 3,
      seriousness: Number(item.seriousness) || 3,
      growth: Number(item.growth) || 3,
      total_score: Number(item.total_score) || 9,
      rank: Number(item.rank) || 1,
      a_score: Number(item.a_score) || 3,
      b_score: Number(item.b_score) || 3,
      c_score: Number(item.c_score) || 3,
      d_score: Number(item.d_score) || 3,
      total_score_abcd: Number(item.total_score_abcd) || 12,
      rank_abcd: Number(item.rank_abcd) || 1,
      potensi_uraian: item.potensi_uraian || '',
      alt_mandiri: item.alt_mandiri || '',
      alt_dukungan_luar: item.alt_dukungan_luar || '',
      alt_bantuan_luar: item.alt_bantuan_luar || ''
    }));

    const { data, error } = await supabase
      .from('priority_item')
      .upsert(formatted, { onConflict: 'id' })
      .select();

    if (error) {
      console.error('[API Priority POST] Supabase upsert error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
