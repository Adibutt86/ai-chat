import { NextResponse } from 'next/server';
import { verifyToken } from './auth';

export async function getSessionUser(request: Request) {
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

export function authError() {
  return NextResponse.json({ error: 'Unauthorized user access' }, { status: 401 });
}
