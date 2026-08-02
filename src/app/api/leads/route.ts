import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSessionUser, authError } from '@/lib/api-auth';

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
      where: { agentId: { in: agentIds } },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(leads);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { agentId, name, email, phone, message } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    let targetAgentId = agentId;

    if (!targetAgentId) {
      const firstAgent = await prisma.agent.findFirst();
      if (firstAgent) targetAgentId = firstAgent.id;
    }

    if (!targetAgentId) {
      return NextResponse.json({ error: 'No active agent found' }, { status: 400 });
    }

    const lead = await prisma.lead.create({
      data: {
        agentId: targetAgentId,
        name: name || undefined,
        email,
        phone: phone || undefined,
        company: message || undefined
      }
    });

    return NextResponse.json({ success: true, lead });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
