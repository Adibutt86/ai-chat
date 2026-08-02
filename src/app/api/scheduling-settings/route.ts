import { NextResponse } from 'next/server';
import { getSessionUser, authError } from '@/lib/api-auth';
import { prisma } from '@/lib/db';

export async function GET(request: Request) {
  const session = await getSessionUser(request);
  if (!session) return authError();

  const orgId = session.orgId;
  if (!orgId) return NextResponse.json({ error: 'Organization missing in session' }, { status: 400 });

  try {
    let settings = await prisma.schedulingSettings.findUnique({
      where: { organizationId: orgId }
    });

    if (!settings) {
      settings = await prisma.schedulingSettings.create({
        data: {
          organizationId: orgId,
          bufferMinutes: 15,
          minNoticeHours: 2,
          maxAdvanceDays: 30,
          maxDailyBookings: 10,
          slotIntervalMinutes: 30
        }
      });
    }

    return NextResponse.json(settings);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const session = await getSessionUser(request);
  if (!session) return authError();

  const orgId = session.orgId;
  if (!orgId) return NextResponse.json({ error: 'Organization missing in session' }, { status: 400 });

  try {
    const { bufferMinutes, minNoticeHours, maxAdvanceDays, maxDailyBookings, slotIntervalMinutes } = await request.json();

    const settings = await prisma.schedulingSettings.upsert({
      where: { organizationId: orgId },
      update: {
        bufferMinutes: Number(bufferMinutes) || 15,
        minNoticeHours: Number(minNoticeHours) || 2,
        maxAdvanceDays: Number(maxAdvanceDays) || 30,
        maxDailyBookings: Number(maxDailyBookings) || 10,
        slotIntervalMinutes: Number(slotIntervalMinutes) || 30
      },
      create: {
        organizationId: orgId,
        bufferMinutes: Number(bufferMinutes) || 15,
        minNoticeHours: Number(minNoticeHours) || 2,
        maxAdvanceDays: Number(maxAdvanceDays) || 30,
        maxDailyBookings: Number(maxDailyBookings) || 10,
        slotIntervalMinutes: Number(slotIntervalMinutes) || 30
      }
    });

    return NextResponse.json({ success: true, settings });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
