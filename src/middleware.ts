// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const MERCHANT_SESSION_COOKIE = 'digiumkm_merchant_session';
const ADMIN_SESSION_COOKIE = 'pindaiin_admin_session';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/admin')) {
    const adminCookie = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
    if (!adminCookie) {
      return NextResponse.redirect(new URL('/admin-login', request.url));
    }
    return NextResponse.next();
  }

  const sessionCookie = request.cookies.get(MERCHANT_SESSION_COOKIE)?.value;
  if (!sessionCookie) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/dashboard/:path*',
    '/learning/:path*',
    '/missions/:path*',
    '/activity/:path*',
    '/rewards/:path*',
    '/profile/:path*',
  ],
};
