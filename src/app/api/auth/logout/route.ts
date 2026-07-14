import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const response = NextResponse.json({ success: true });
  
  // Clear session cookies by setting maxAge to 0
  const clearOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    path: '/',
    maxAge: 0
  };

  response.cookies.set('sb-access-token', '', clearOptions);
  response.cookies.set('sb-refresh-token', '', clearOptions);

  return response;
}
