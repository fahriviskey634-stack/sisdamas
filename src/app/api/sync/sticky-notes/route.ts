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
      .from('sticky_note')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('[API Sticky Notes GET] Error:', error.message);
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
    const { notes } = body;

    if (!notes || !Array.isArray(notes)) {
      return NextResponse.json({ error: 'Format data notes harus array' }, { status: 400 });
    }

    if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('placeholder')) {
      return NextResponse.json({ error: 'Supabase credentials tidak ditemukan' }, { status: 503 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const formatted = notes.map((n: any) => ({
      column_name: n.column_name || 'Lainnya',
      content: n.content,
      color: n.color || '#FEF08A',
      rt_number: n.rt_number || 'Umum',
      author: n.author || 'Anonim'
    }));

    const { data, error } = await supabase
      .from('sticky_note')
      .insert(formatted)
      .select();

    if (error) {
      console.error('[API Sticky Notes POST] Supabase insert error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
