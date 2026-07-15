import { NextRequest, NextResponse } from 'next/server';

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const accessToken = req.cookies.get('sb-access-token')?.value;

  // Redirect root path '/' directly to dashboard or login depending on auth state
  if (pathname === '/') {
    if (accessToken) {
      const dashboardUrl = new URL('/app/dashboard', req.url);
      return NextResponse.redirect(dashboardUrl);
    } else {
      const loginUrl = new URL('/login', req.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Guard all /app/* routes
  if (pathname.startsWith('/app')) {
    if (!accessToken) {
      // Redirect unauthenticated users to login page
      const loginUrl = new URL('/login', req.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Redirect authenticated users away from login page to dashboard
  if (pathname === '/login' && accessToken) {
    const dashboardUrl = new URL('/app/dashboard', req.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

// Config to specify matching paths
export const config = {
  matcher: ['/', '/app/:path*', '/login']
};
