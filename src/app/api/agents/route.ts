import { NextResponse } from 'next/server';
import { getSessionUser, authError } from '@/lib/api-auth';
import { prisma } from '@/lib/db';

export async function GET(request: Request) {
  const session = await getSessionUser(request);
  if (!session) return authError();

  const orgId = session.orgId;
  if (!orgId) {
    return NextResponse.json({ error: 'Organization not found in session' }, { status: 400 });
  }

  const agents = await prisma.agent.findMany({
    where: { organizationId: orgId },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(agents);
}

export async function POST(request: Request) {
  const session = await getSessionUser(request);
  if (!session) return authError();

  const orgId = session.orgId;
  if (!orgId) {
    return NextResponse.json({ error: 'Organization not found in session' }, { status: 400 });
  }

  try {
    const { name, description, avatarUrl, themeColor, language, model, temperature, systemPrompt } = await request.json();

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const agent = await prisma.agent.create({
      data: {
        name,
        description,
        avatarUrl,
        themeColor: themeColor || '#2563eb',
        language: language || 'en',
        model: model || 'gemini-2.5-flash',
        temperature: temperature !== undefined ? parseFloat(temperature) : 0.7,
        systemPrompt: systemPrompt || "You are a helpful AI assistant. Answer questions based on the provided context.",
        organizationId: orgId,
      },
    });

    // Create default widget settings for the agent
    await prisma.widgetSettings.create({
      data: {
        agentId: agent.id,
        primaryColor: agent.themeColor,
        borderRadius: '0.75rem',
      },
    });

    return NextResponse.json(agent);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = await getSessionUser(request);
  if (!session) return authError();

  try {
    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get('agentId');

    if (!agentId) {
      return NextResponse.json({ error: 'agentId is required' }, { status: 400 });
    }

    // Ensure agent belongs to organization
    const agent = await prisma.agent.findFirst({
      where: {
        id: agentId,
        organizationId: session.orgId,
      },
    });

    if (!agent) {
      return NextResponse.json({ error: 'Agent not found or permission denied' }, { status: 404 });
    }

    await prisma.agent.delete({
      where: { id: agentId },
    });

    return NextResponse.json({ success: true, message: 'Agent deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
