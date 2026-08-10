import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSessionUser, authError } from '@/lib/api-auth';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function GET(request: Request) {
  const session = await getSessionUser(request);
  if (!session) return authError();

  const orgId = session.orgId;
  if (!orgId) return NextResponse.json({ error: 'Organization missing in session' }, { status: 400 });

  try {
    const agents = await prisma.agent.findMany({
      where: { organizationId: orgId },
      select: { id: true }
    });
    const agentIds = agents.map(a => a.id);

    const leads = await prisma.lead.findMany({
      where: {
        OR: [
          { agentId: { in: agentIds } },
          { agentId: 'demo' },
          { agentId: 'default-agent-id' }
        ]
      },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(leads);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { agentId, name, email, phone, message } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400, headers: corsHeaders });
    }

    let targetAgentId = agentId;
    if (!targetAgentId || targetAgentId === 'demo') {
      const mainAgent = await prisma.agent.findFirst({
        orderBy: { createdAt: 'asc' },
      });
      if (mainAgent) {
        targetAgentId = mainAgent.id;
      } else {
        targetAgentId = 'default-agent-id';
      }
    } else {
      const existingAgent = await prisma.agent.findUnique({ where: { id: targetAgentId } });
      if (!existingAgent) {
        const firstAgent = await prisma.agent.findFirst({ orderBy: { createdAt: 'asc' } });
        if (firstAgent) targetAgentId = firstAgent.id;
      }
    }

    const lead = await prisma.lead.create({
      data: {
        agentId: targetAgentId,
        name: name || undefined,
        email: String(email).trim(),
        phone: phone || undefined,
        company: message || undefined
      }
    });

    return NextResponse.json({ success: true, lead }, { headers: corsHeaders });
  } catch (err: any) {
    console.error('Error creating lead:', err);
    return NextResponse.json({ error: err.message || 'Failed to save lead' }, { status: 500, headers: corsHeaders });
  }
}
