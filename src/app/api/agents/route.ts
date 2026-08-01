import { NextResponse } from 'next/server';
import { getSessionUser, authError } from '@/lib/api-auth';
import { prisma } from '@/lib/db';

async function resolveOrgId(session: any): Promise<string | null> {
  if (session.orgId) return session.orgId;
  if (!session.userId) return null;
  const member = await prisma.member.findFirst({
    where: { userId: session.userId },
    select: { organizationId: true },
  });
  return member?.organizationId || null;
}

export async function GET(request: Request) {
  const session = await getSessionUser(request);
  if (!session) return authError();

  const orgId = await resolveOrgId(session);
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

  const orgId = await resolveOrgId(session);
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
        model: model || 'claude-3-5-sonnet-20241022',
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

export async function PUT(request: Request) {
  const session = await getSessionUser(request);
  if (!session) return authError();

  try {
    const { id, name, description, avatarUrl, themeColor, language, model, temperature, systemPrompt } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    const orgId = await resolveOrgId(session);

    // Ensure agent exists and user has access
    const existingAgent = await prisma.agent.findFirst({
      where: session.role === 'admin'
        ? { id }
        : (orgId ? { id, organizationId: orgId } : { id }),
    });

    if (!existingAgent) {
      return NextResponse.json({ error: 'Agent not found or permission denied' }, { status: 404 });
    }

    const updatedAgent = await prisma.agent.update({
      where: { id },
      data: {
        name: name !== undefined ? name : existingAgent.name,
        description: description !== undefined ? description : existingAgent.description,
        avatarUrl: avatarUrl !== undefined ? avatarUrl : existingAgent.avatarUrl,
        themeColor: themeColor !== undefined ? themeColor : existingAgent.themeColor,
        language: language !== undefined ? language : existingAgent.language,
        model: model !== undefined ? model : existingAgent.model,
        temperature: temperature !== undefined ? parseFloat(temperature) : existingAgent.temperature,
        systemPrompt: systemPrompt !== undefined ? systemPrompt : existingAgent.systemPrompt,
      },
    });

    return NextResponse.json(updatedAgent);
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

    const orgId = await resolveOrgId(session);

    const agent = await prisma.agent.findFirst({
      where: session.role === 'admin'
        ? { id: agentId }
        : (orgId ? { id: agentId, organizationId: orgId } : { id: agentId }),
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
