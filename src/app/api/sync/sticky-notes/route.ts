import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

function getSupabase() {
  if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('placeholder')) {
    return null;
  }
  return createClient(supabaseUrl, supabaseKey);
}

export async function GET() {
  try {
    const supabase = getSupabase();
    if (!supabase) {
      return NextResponse.json({ success: false, data: [] }, {
        headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' }
      });
    }

    const { data, error } = await supabase
      .from('sticky_note')
      .select('id, column_name, content, color, rt_number, author, created_at')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('[API Sticky Notes GET] Error:', error.message);
      return NextResponse.json({ success: false, error: error.message, data: [] }, {
        headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' }
      });
    }

    return NextResponse.json({ success: true, data: data || [] }, {
      headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' }
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message, data: [] }, {
      headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' }
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { notes } = body;

    if (!notes || !Array.isArray(notes)) {
      return NextResponse.json({ error: 'Format data notes harus array' }, { status: 400 });
    }

    const supabase = getSupabase();
    if (!supabase) {
      return NextResponse.json({ error: 'Supabase credentials tidak ditemukan' }, { status: 503 });
    }

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
      .select('id, column_name, content, color, rt_number, author, created_at');

    if (error) {
      console.error('[API Sticky Notes POST] Supabase insert error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const noteId = searchParams.get('id');

    if (!noteId) {
      return NextResponse.json({ error: 'ID note diperlukan' }, { status: 400 });
    }

    const supabase = getSupabase();
    if (!supabase) {
      return NextResponse.json({ error: 'Supabase credentials tidak ditemukan' }, { status: 503 });
    }

    const { error } = await supabase
      .from('sticky_note')
      .delete()
      .eq('id', noteId);

    if (error) {
      console.error('[API Sticky Notes DELETE] Error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, content, column_name, color, rt_number } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID note diperlukan' }, { status: 400 });
    }

    const supabase = getSupabase();
    if (!supabase) {
      return NextResponse.json({ error: 'Supabase credentials tidak ditemukan' }, { status: 503 });
    }

    const updateData: any = {};
    if (content !== undefined) updateData.content = content;
    if (column_name !== undefined) updateData.column_name = column_name;
    if (color !== undefined) updateData.color = color;
    if (rt_number !== undefined) updateData.rt_number = rt_number;

    const { data, error } = await supabase
      .from('sticky_note')
      .update(updateData)
      .eq('id', id)
      .select('id, column_name, content, color, rt_number, author, created_at');

    if (error) {
      console.error('[API Sticky Notes PUT] Error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
