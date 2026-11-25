// src/app/api/auth/google/route.ts
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { origin } = new URL(request.url);
  const clientId = process.env.GOOGLE_CLIENT_ID;

  // Jika Google OAuth belum dikonfigurasi di lokal, gunakan alur demo development
  if (!clientId) {
    if (process.env.NODE_ENV !== 'production') {
      const response = NextResponse.redirect(`${origin}/dashboard`);
      response.cookies.set('digiumkm_merchant_session', 'merchant', {
        path: '/',
        maxAge: 604800,
        sameSite: 'lax',
      });
      response.cookies.set('larisin_oauth_email', 'warung.google@gmail.com', {
        path: '/',
        maxAge: 300,
        sameSite: 'lax',
      });
      return response;
    }
    return NextResponse.redirect(`${origin}/login?error=google_not_configured`);
  }

  const state = crypto.randomUUID();
  const redirectUri = `${origin}/api/auth/google/callback`;

  const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  authUrl.searchParams.set('client_id', clientId);
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('scope', 'openid email profile');
  authUrl.searchParams.set('state', state);
  authUrl.searchParams.set('prompt', 'select_account');

  const response = NextResponse.redirect(authUrl.toString());
  response.cookies.set('larisin_oauth_state', state, {
    httpOnly: true,
    path: '/',
    maxAge: 600,
    sameSite: 'lax',
  });
  return response;
}

