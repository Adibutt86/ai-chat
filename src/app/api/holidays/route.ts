import { NextResponse } from 'next/server';
import { getSessionUser, authError } from '@/lib/api-auth';
import { prisma } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const agentId = searchParams.get('agentId');

  if (agentId) {
    try {
      const agent = await prisma.agent.findUnique({
        where: { id: agentId },
        select: { organizationId: true }
      });
      if (!agent) return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
      const holidays = await prisma.holiday.findMany({
        where: { organizationId: agent.organizationId },
        orderBy: { date: 'asc' }
      });
      const response = NextResponse.json(holidays);
      response.headers.set('Access-Control-Allow-Origin', '*');
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
      return response;
    } catch (err: any) {
      const errorResponse = NextResponse.json({ error: err.message }, { status: 500 });
      errorResponse.headers.set('Access-Control-Allow-Origin', '*');
      return errorResponse;
    }
  }

  const session = await getSessionUser(request);
  if (!session) return authError();

  const orgId = session.orgId;
  if (!orgId) return NextResponse.json({ error: 'Organization missing in session' }, { status: 400 });

  try {
    const holidays = await prisma.holiday.findMany({
      where: { organizationId: orgId },
      orderBy: { date: 'asc' }
    });
    return NextResponse.json(holidays);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getSessionUser(request);
  if (!session) return authError();

  const orgId = session.orgId;
  if (!orgId) return NextResponse.json({ error: 'Organization missing in session' }, { status: 400 });

  try {
    const { date, name } = await request.json();

    if (!date || !name) {
      return NextResponse.json({ error: 'Date and name are required' }, { status: 400 });
    }

    const holiday = await prisma.holiday.upsert({
      where: {
        organizationId_date: {
          organizationId: orgId,
          date
        }
      },
      update: { name },
      create: {
        organizationId: orgId,
        date,
        name
      }
    });

    return NextResponse.json(holiday);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = await getSessionUser(request);
  if (!session) return authError();

  const orgId = session.orgId;
  if (!orgId) return NextResponse.json({ error: 'Organization missing in session' }, { status: 400 });

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Holiday id is required' }, { status: 400 });
    }

    await prisma.holiday.delete({
      where: {
        id,
        organizationId: orgId
      }
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function OPTIONS() {
  const response = new NextResponse(null, { status: 204 });
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
  return response;
}
