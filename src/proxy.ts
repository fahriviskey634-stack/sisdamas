import { NextRequest, NextResponse } from 'next/server';

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const accessToken = req.cookies.get('sb-access-token')?.value || req.cookies.get('kkn-member-session')?.value;

  // Header anti-cache ketat agar browser tidak menyimpan halaman saat ditutup/logout
  const noCacheHeaders = {
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
    'Pragma': 'no-cache',
    'Expires': '0'
  };

  // Redirect root path '/' directly to dashboard or login
  if (pathname === '/') {
    if (accessToken) {
      const dashboardUrl = new URL('/app/dashboard', req.url);
      const res = NextResponse.redirect(dashboardUrl);
      Object.entries(noCacheHeaders).forEach(([k, v]) => res.headers.set(k, v));
      return res;
    } else {
      const loginUrl = new URL('/login', req.url);
      const res = NextResponse.redirect(loginUrl);
      Object.entries(noCacheHeaders).forEach(([k, v]) => res.headers.set(k, v));
      return res;
    }
  }

  // Guard all /app/* routes: jika tidak ada cookie session, paksa redirect ke /login
  if (pathname.startsWith('/app')) {
    if (!accessToken) {
      const loginUrl = new URL('/login', req.url);
      const res = NextResponse.redirect(loginUrl);
      Object.entries(noCacheHeaders).forEach(([k, v]) => res.headers.set(k, v));
      return res;
    }
  }

  // Redirect authenticated users away from /login to dashboard
  if (pathname === '/login' && accessToken) {
    const dashboardUrl = new URL('/app/dashboard', req.url);
    const res = NextResponse.redirect(dashboardUrl);
    Object.entries(noCacheHeaders).forEach(([k, v]) => res.headers.set(k, v));
    return res;
  }

  const response = NextResponse.next();
  if (pathname.startsWith('/app') || pathname === '/login') {
    Object.entries(noCacheHeaders).forEach(([k, v]) => response.headers.set(k, v));
  }
  return response;
}

export const config = {
  matcher: ['/', '/app/:path*', '/login']
};
