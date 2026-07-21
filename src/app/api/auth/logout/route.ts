import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const response = NextResponse.json({ success: true, message: 'Berhasil logout' });
  
  // Clear all auth cookies by setting maxAge to 0 and empty value
  const clearOptions = {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 0
  };

  response.cookies.set('kkn-member-session', '', clearOptions);
  response.cookies.set('sb-access-token', '', { ...clearOptions, httpOnly: true });
  response.cookies.set('sb-refresh-token', '', { ...clearOptions, httpOnly: true });

  // Anti-cache response headers
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('Expires', '0');

  return response;
}
