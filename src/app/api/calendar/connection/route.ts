import { NextResponse } from 'next/server';
import { getSessionUser, authError } from '@/lib/api-auth';
import { prisma } from '@/lib/db';
import { getValidAccessToken, listCalendars } from '@/lib/google-calendar';

export async function GET(request: Request) {
  const session = await getSessionUser(request);
  if (!session) return authError();

  const orgId = session.orgId;
  if (!orgId) {
    return NextResponse.json({ error: 'Organization not found in session' }, { status: 400 });
  }

  try {
    const connection = await prisma.calendarConnection.findUnique({
      where: { organizationId: orgId }
    });

    if (!connection) {
      return NextResponse.json({ connected: false });
    }

    const accessToken = await getValidAccessToken(orgId);
    if (!accessToken) {
      // Token is broken/disconnected
      return NextResponse.json({ connected: false, error: 'Authorization expired. Please reconnect.' });
    }

    const calendars = await listCalendars(accessToken);

    return NextResponse.json({
      connected: true,
      selectedCalendarId: connection.calendarId,
      calendars
    });
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
    const { calendarId } = await request.json();
    if (!calendarId) {
      return NextResponse.json({ error: 'calendarId is required' }, { status: 400 });
    }

    const updated = await prisma.calendarConnection.update({
      where: { organizationId: orgId },
      data: { calendarId }
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = await getSessionUser(request);
  if (!session) return authError();

  const orgId = session.orgId;
  if (!orgId) {
    return NextResponse.json({ error: 'Organization not found in session' }, { status: 400 });
  }

  try {
    await prisma.calendarConnection.delete({
      where: { organizationId: orgId }
    });
    return NextResponse.json({ success: true, message: 'Google Calendar disconnected' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
