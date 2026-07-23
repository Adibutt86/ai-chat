import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const agentId = searchParams.get('agentId');

  if (!agentId) {
    return NextResponse.json({ error: 'agentId is required' }, { status: 400 });
  }

  const agent = await prisma.agent.findUnique({
    where: { id: agentId },
    include: {
      widgetSettings: true,
    },
  });

  if (!agent) {
    return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
  }

  // Fetch global active provider setting
  const globalConfig = await prisma.globalSettings.findUnique({
    where: { id: 'global-config' },
  });
  const activeProvider = globalConfig?.activeProvider || 'gemini';

  // Set CORS headers so standard client web loaders can request embedding setup
  const response = NextResponse.json({
    id: agent.id,
    name: agent.name,
    avatarUrl: agent.avatarUrl,
    themeColor: agent.themeColor,
    activeProvider,
    widgetSettings: agent.widgetSettings || {
      primaryColor: '#2563eb',
      secondaryColor: '#1e40af',
      borderRadius: '0.75rem',
      position: 'bottom-right',
      welcomeMessage: 'Hi! How can I help you today?',
      placeholder: 'Type your message...',
      themeMode: 'light',
      showBooking: true,
      showLeadForm: true,
      showServices: false,
      showHours: false,
      showPricing: false,
      width: '380px',
      height: '600px',
    },
  });

  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type');

  return response;
}

export async function OPTIONS() {
  const response = new NextResponse(null, { status: 204 });
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
  return response;
}
