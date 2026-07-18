import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/api-auth';

export async function GET(request: Request) {
  const session = await getSessionUser(request);
  if (!session || !session.orgId) {
    return new Response('Unauthorized', { status: 401 });
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/auth/google/callback';

  if (!clientId) {
    return new Response('Google client ID is not configured in .env', { status: 500 });
  }

  // Pass orgId in the state parameter to verify callback integrity
  const state = session.orgId;
  const scopes = [
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/calendar.events'
  ].join(' ');

  const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  googleAuthUrl.searchParams.set('client_id', clientId);
  googleAuthUrl.searchParams.set('redirect_uri', redirectUri);
  googleAuthUrl.searchParams.set('response_type', 'code');
  googleAuthUrl.searchParams.set('scope', scopes);
  googleAuthUrl.searchParams.set('state', state);
  googleAuthUrl.searchParams.set('access_type', 'offline');
  googleAuthUrl.searchParams.set('prompt', 'consent'); // Force consent to guarantee we get a refresh token

  return NextResponse.redirect(googleAuthUrl.toString());
}
