import { NextResponse } from 'next/server';
import { getSessionUser, authError } from '@/lib/api-auth';

export async function GET(request: Request) {
  const session = await getSessionUser(request);
  if (!session) return authError();

  return NextResponse.json({ session });
}
