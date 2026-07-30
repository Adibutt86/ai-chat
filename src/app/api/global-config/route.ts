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
    activeProvider: 'claude',
    geminiKey: '',
    openaiKey: '',
    claudeKey: '',
    openrouterKey: '',
    resendApiKey: '',
    fromEmail: 'onboarding@resend.dev',
  });
}

export async function POST(request: Request) {
  const session = await getSessionUser(request);
  if (!session || session.role !== 'admin') return authError();

  try {
    const { activeProvider, geminiKey, openaiKey, claudeKey, openrouterKey, resendApiKey, fromEmail } = await request.json();

    const config = await prisma.globalSettings.upsert({
      where: { id: 'global-config' },
      update: {
        activeProvider: activeProvider || 'claude',
        geminiKey,
        openaiKey,
        claudeKey,
        openrouterKey,
        resendApiKey,
        fromEmail,
      },
      create: {
        id: 'global-config',
        activeProvider: activeProvider || 'claude',
        geminiKey: geminiKey || '',
        openaiKey: openaiKey || '',
        claudeKey: claudeKey || '',
        openrouterKey: openrouterKey || '',
        resendApiKey: resendApiKey || '',
        fromEmail: fromEmail || 'onboarding@resend.dev',
      },
    });

    return NextResponse.json({ success: true, config });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
