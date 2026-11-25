// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const MERCHANT_SESSION_COOKIE = 'digiumkm_merchant_session';

export function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get(MERCHANT_SESSION_COOKIE)?.value;

  if (!sessionCookie) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/learning/:path*',
    '/missions/:path*',
    '/activity/:path*',
    '/rewards/:path*',
    '/profile/:path*',
  ],
};

