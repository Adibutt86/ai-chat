import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSessionUser, authError } from '@/lib/api-auth';
import { isMasterAdmin } from '@/lib/permissions';
import { sendLeadCapturedAdminNotification } from '@/lib/notifications';

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

  const isMaster = isMasterAdmin(session.role);

  try {
    let agentIds: string[] = [];
    if (!isMaster) {
      const agents = await prisma.agent.findMany({
        where: { organizationId: orgId },
        select: { id: true }
      });
      agentIds = agents.map(a => a.id);
    }

    const leads = await prisma.lead.findMany({
      where: isMaster ? {} : {
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
    const { agentId, conversationId, name, email, phone, message } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400, headers: corsHeaders });
    }

    let targetAgentId = agentId;
    if (!targetAgentId || targetAgentId === 'demo') {
      let mainAgent = await prisma.agent.findFirst({
        where: { name: { contains: 'demo', mode: 'insensitive' } },
        orderBy: { createdAt: 'asc' },
      });
      if (!mainAgent) {
        mainAgent = await prisma.agent.findFirst({
          where: { name: { contains: 'tester', mode: 'insensitive' } },
          orderBy: { createdAt: 'asc' },
        });
      }
      if (!mainAgent) {
        mainAgent = await prisma.agent.findFirst({
          orderBy: { createdAt: 'asc' },
        });
      }
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
        conversationId: conversationId || undefined,
        name: name || undefined,
        email: String(email).trim(),
        phone: phone || undefined,
        company: message || undefined
      }
    });

    if (conversationId) {
      try {
        await prisma.conversation.update({
          where: { id: conversationId },
          data: {
            visitorName: name || undefined,
            visitorEmail: String(email).trim(),
            visitorPhone: phone || undefined,
          }
        });
      } catch (e) {
        console.error('Non-blocking conversation update error:', e);
      }
    }

    try {
      const agentObj = await prisma.agent.findUnique({ where: { id: targetAgentId } });
      await sendLeadCapturedAdminNotification({
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        company: lead.company,
        createdAt: lead.createdAt,
        agentName: agentObj?.name || 'AI Support Assistant'
      });
    } catch (e) {
      console.error('Lead admin email notification error:', e);
    }

    return NextResponse.json({ success: true, lead }, { headers: corsHeaders });
  } catch (err: any) {
    console.error('Error creating lead:', err);
    return NextResponse.json({ error: err.message || 'Failed to save lead' }, { status: 500, headers: corsHeaders });
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Lead ID is required' }, { status: 400, headers: corsHeaders });
  }

  try {
    await prisma.lead.delete({
      where: { id }
    });
    return NextResponse.json({ success: true }, { headers: corsHeaders });
  } catch (err: any) {
    console.error('Error deleting lead:', err);
    return NextResponse.json({ error: err.message || 'Failed to delete lead' }, { status: 500, headers: corsHeaders });
  }
}
