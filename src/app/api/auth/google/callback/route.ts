import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state'); // State contains organizationId
  const error = searchParams.get('error');

  if (error) {
    console.error('Google OAuth callback error:', error);
    return NextResponse.redirect(new URL('/dashboard?error=google_auth_failed', request.url));
  }

  if (!code || !state) {
    return new Response('Missing code or state parameters', { status: 400 });
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/auth/google/callback';

  if (!clientId || !clientSecret) {
    return new Response('Google credentials are not configured in .env', { status: 500 });
  }

  try {
    // Exchange Auth Code for tokens
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Google Token Exchange Failed:', errorData);
      return NextResponse.redirect(new URL('/dashboard?error=token_exchange_failed', request.url));
    }

    const tokens = await response.json();
    const expiresAt = new Date(Date.now() + (tokens.expires_in || 3600) * 1000);

    // Save Calendar Connection to Supabase PostgreSQL (Upsert pattern)
    await prisma.calendarConnection.upsert({
      where: { organizationId: state },
      update: {
        accessToken: tokens.access_token,
        // Only overwrite refresh token if a new one was sent by Google
        refreshToken: tokens.refresh_token || undefined,
        expiresAt,
        calendarId: 'primary' // default to primary calendar
      },
      create: {
        organizationId: state,
        provider: 'google',
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token || '',
        expiresAt,
        calendarId: 'primary'
      }
    });

    // Success! Redirect to settings tab in dashboard
    return NextResponse.redirect(new URL('/dashboard?google_success=true', request.url));
  } catch (err) {
    console.error('Google OAuth callback crash:', err);
    return NextResponse.redirect(new URL('/dashboard?error=server_oauth_error', request.url));
  }
}
