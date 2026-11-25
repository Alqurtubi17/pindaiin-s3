// src/app/api/auth/google/callback/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const oauthError = searchParams.get('error');

  if (oauthError || !code || !state) {
    return NextResponse.redirect(`${origin}/login?error=google_auth_failed`);
  }

  const cookieStore = await cookies();
  const savedState = cookieStore.get('larisin_oauth_state')?.value;

  if (!savedState || savedState !== state) {
    return NextResponse.redirect(`${origin}/login?error=google_auth_failed`);
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(`${origin}/login?error=google_not_configured`);
  }

  try {
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: `${origin}/api/auth/google/callback`,
        grant_type: 'authorization_code',
      }).toString(),
    });

    if (!tokenRes.ok) {
      return NextResponse.redirect(`${origin}/login?error=google_auth_failed`);
    }

    const tokenData = (await tokenRes.json()) as { access_token?: string };
    if (!tokenData.access_token) {
      return NextResponse.redirect(`${origin}/login?error=google_auth_failed`);
    }

    const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    if (!userRes.ok) {
      return NextResponse.redirect(`${origin}/login?error=google_auth_failed`);
    }

    const userInfo = (await userRes.json()) as { email?: string };
    const userEmail = userInfo.email || 'pedagang@gmail.com';

    const response = NextResponse.redirect(`${origin}/dashboard`);
    response.cookies.delete('larisin_oauth_state');
    response.cookies.set('digiumkm_merchant_session', 'merchant', {
      path: '/',
      maxAge: 604800,
      sameSite: 'lax',
    });
    response.cookies.set('larisin_oauth_email', userEmail, {
      path: '/',
      maxAge: 300,
      sameSite: 'lax',
    });
    return response;
  } catch {
    return NextResponse.redirect(`${origin}/login?error=google_auth_failed`);
  }
}

