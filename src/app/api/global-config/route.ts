import { NextResponse } from 'next/server';
import { getSessionUser, authError } from '@/lib/api-auth';
import { prisma } from '@/lib/db';

export async function GET(request: Request) {
  const session = await getSessionUser(request);
  if (!session || session.role !== 'admin') return authError();

  const config = await prisma.globalSettings.findUnique({
    where: { id: 'global-config' },
  });

  return NextResponse.json(config || {
    id: 'global-config',
    activeProvider: 'gemini',
    geminiKey: '',
    openaiKey: '',
    claudeKey: '',
  });
}

export async function POST(request: Request) {
  const session = await getSessionUser(request);
  if (!session || session.role !== 'admin') return authError();

  try {
    const { activeProvider, geminiKey, openaiKey, claudeKey } = await request.json();

    const config = await prisma.globalSettings.upsert({
      where: { id: 'global-config' },
      update: {
        activeProvider,
        geminiKey,
        openaiKey,
        claudeKey,
      },
      create: {
        id: 'global-config',
        activeProvider: activeProvider || 'gemini',
        geminiKey: geminiKey || '',
        openaiKey: openaiKey || '',
        claudeKey: claudeKey || '',
      },
    });

    return NextResponse.json({ success: true, config });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
