import { NextResponse } from 'next/server';
import { getSessionUser, authError } from '@/lib/api-auth';
import { prisma } from '@/lib/db';

const DEFAULT_HOURS = [
  { dayOfWeek: 1, isEnabled: true, startTime: '09:00', endTime: '17:00' }, // Monday
  { dayOfWeek: 2, isEnabled: true, startTime: '09:00', endTime: '17:00' }, // Tuesday
  { dayOfWeek: 3, isEnabled: true, startTime: '09:00', endTime: '17:00' }, // Wednesday
  { dayOfWeek: 4, isEnabled: true, startTime: '09:00', endTime: '17:00' }, // Thursday
  { dayOfWeek: 5, isEnabled: true, startTime: '09:00', endTime: '17:00' }, // Friday
  { dayOfWeek: 6, isEnabled: false, startTime: '09:00', endTime: '17:00' }, // Saturday
  { dayOfWeek: 0, isEnabled: false, startTime: '09:00', endTime: '17:00' }, // Sunday
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const agentId = searchParams.get('agentId');

  // Public access for chatbot widget
  if (agentId) {
    try {
      const agent = await prisma.agent.findUnique({
        where: { id: agentId },
        select: { organizationId: true }
      });

      if (!agent) {
        return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
      }

      let hours = await prisma.businessHours.findMany({
        where: { organizationId: agent.organizationId },
        orderBy: { dayOfWeek: 'asc' }
      });

      // Seed automatically if none found
      if (hours.length === 0) {
        const data = DEFAULT_HOURS.map(h => ({
          ...h,
          organizationId: agent.organizationId,
          timezone: 'UTC'
        }));
        await prisma.businessHours.createMany({ data });
        hours = await prisma.businessHours.findMany({
          where: { organizationId: agent.organizationId },
          orderBy: { dayOfWeek: 'asc' }
        });
      }

      return NextResponse.json(hours);
    } catch (err: any) {
      return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
    }
  }

  // Dashboard authenticated access
  const session = await getSessionUser(request);
  if (!session) return authError();

  const orgId = session.orgId;
  if (!orgId) {
    return NextResponse.json({ error: 'Organization not found in session' }, { status: 400 });
  }

  try {
    let hours = await prisma.businessHours.findMany({
      where: { organizationId: orgId },
      orderBy: { dayOfWeek: 'asc' }
    });

    // Seed automatically if none found
    if (hours.length === 0) {
      const data = DEFAULT_HOURS.map(h => ({
        ...h,
        organizationId: orgId,
        timezone: 'UTC'
      }));
      await prisma.businessHours.createMany({ data });
      hours = await prisma.businessHours.findMany({
        where: { organizationId: orgId },
        orderBy: { dayOfWeek: 'asc' }
      });
    }

    return NextResponse.json(hours);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const session = await getSessionUser(request);
  if (!session) return authError();

  const orgId = session.orgId;
  if (!orgId) {
    return NextResponse.json({ error: 'Organization not found in session' }, { status: 400 });
  }

  try {
    const { hours, timezone } = await request.json();

    if (!hours || !Array.isArray(hours)) {
      return NextResponse.json({ error: 'Invalid hours array payload' }, { status: 400 });
    }

    const updates = hours.map((h: any) => {
      return prisma.businessHours.update({
        where: {
          id: h.id,
          organizationId: orgId
        },
        data: {
          isEnabled: h.isEnabled,
          startTime: h.startTime,
          endTime: h.endTime,
          timezone: timezone || undefined
        }
      });
    });

    await prisma.$transaction(updates);

    return NextResponse.json({ success: true, message: 'Business hours updated successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
