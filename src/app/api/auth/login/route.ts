import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email dan password wajib diisi' },
        { status: 400 }
      );
    }

    // Initialize an isolated server-side Supabase client
    const supabaseServer = createClient(supabaseUrl, supabaseAnonKey);

    const { data, error } = await supabaseServer.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }

    const session = data.session;
    if (!session) {
      return NextResponse.json(
        { error: 'Gagal membuat sesi login' },
        { status: 500 }
      );
    }

    // Set secure, httpOnly session cookies
    const response = NextResponse.json({ success: true });
    
    // Cookie parameters (30 days expiry as fallback or session duration)
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
      path: '/',
      maxAge: 60 * 60 * 24 * 30 // 30 days
    };

    response.cookies.set('sb-access-token', session.access_token, cookieOptions);
    response.cookies.set('sb-refresh-token', session.refresh_token, cookieOptions);

    return response;
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Terjadi kesalahan sistem internal' },
      { status: 500 }
    );
  }
}
