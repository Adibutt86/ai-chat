import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ success: true, message: 'Logged out successfully' });
  response.headers.set(
    'Set-Cookie',
    `auth_token=; Path=/; HttpOnly; Max-Age=0; SameSite=Lax`
  );
  return response;
}
