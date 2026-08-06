import { NextResponse } from 'next/server';
import { verifyToken, SessionPayload } from './auth';
import { isMasterAdmin } from './permissions';

export async function getSessionUser(request: Request): Promise<SessionPayload | null> {
  const authHeader = request.headers.get('Authorization');
  let token = '';

  if (authHeader?.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else {
    // Try to read token from cookies
    const cookieHeader = request.headers.get('Cookie');
    const match = cookieHeader?.match(/auth_token=([^;]+)/);
    if (match) {
      token = match[1];
    }
  }

  if (!token) return null;
  return verifyToken(token);
}

export function authError(message = 'Unauthorized user access', status = 401) {
  return NextResponse.json({ error: message }, { status });
}

export function requireMasterAdmin(session: SessionPayload | null) {
  if (!session) return authError();
  if (!isMasterAdmin(session.role)) {
    return NextResponse.json({ error: 'Access denied. Master Admin privileges required.' }, { status: 403 });
  }
  return null;
}

