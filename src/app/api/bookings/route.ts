import { NextResponse } from 'next/server';
import { getSessionUser, authError } from '@/lib/api-auth';
import { prisma } from '@/lib/db';
import { getValidAccessToken, checkFreeBusy, createGoogleEvent, deleteGoogleEvent } from '@/lib/google-calendar';
import { formatInTimezone } from '@/lib/availability';
import { sendBookingNotification } from '@/lib/notifications';

// GET: List bookings for dashboard (authenticated)
export async function GET(request: Request) {
  const session = await getSessionUser(request);
  if (!session) return authError();

  const orgId = session.orgId;
  if (!orgId) {
    return NextResponse.json({ error: 'Organization not found in session' }, { status: 400 });
  }

  const { searchParams } = new URL(request.url);
  const agentId = searchParams.get('agentId');
  const status = searchParams.get('status');
  const serviceId = searchParams.get('serviceId');
  const search = searchParams.get('search');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  const skip = (page - 1) * limit;

  try {
    const whereClause: any = {
      organizationId: orgId,
    };

    if (agentId) whereClause.agentId = agentId;
    if (status) whereClause.status = status;
    if (serviceId) whereClause.serviceId = serviceId;

    if (search) {
      whereClause.OR = [
        { customerName: { contains: search, mode: 'insensitive' } },
        { customerEmail: { contains: search, mode: 'insensitive' } },
        { customerPhone: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where: whereClause,
        include: {
          service: { select: { name: true, price: true, currency: true, durationMinutes: true } },
          agent: { select: { name: true } },
        },
        orderBy: { startTime: 'desc' },
        skip,
        take: limit,
      }),
      prisma.booking.count({ where: whereClause }),
    ]);

    return NextResponse.json({
      bookings,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

// POST: Create a new booking (public - called by chatbot)
export async function POST(request: Request) {
  try {
    const {
      agentId,
      serviceId,
      customerName,
      customerEmail,
      customerPhone,
      customerNotes,
      startTime, // ISO String (UTC)
      endTime,   // ISO String (UTC)
      timezone   // Visitor's local timezone
    } = await request.json();

    if (!agentId || !serviceId || !customerName || !customerEmail || !startTime || !endTime) {
      return NextResponse.json({ error: 'Missing required booking fields' }, { status: 400 });
    }

    // 1. Resolve agent and organization context
    const agent = await prisma.agent.findUnique({
      where: { id: agentId },
      include: { organization: true }
    });

    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    const orgId = agent.organizationId;
    const start = new Date(startTime);
    const end = new Date(endTime);

    // 2. Double-Booking Protection (Step 1: Check PostgreSQL bookings)
    const existingConflict = await prisma.booking.findFirst({
      where: {
        organizationId: orgId,
        status: { notIn: ['cancelled'] },
        startTime: { lt: end },
        endTime: { gt: start }
      }
    });

    if (existingConflict) {
      return NextResponse.json({ error: 'This time slot is no longer available. Please select another time.' }, { status: 409 });
    }

    // 3. Double-Booking Protection (Step 2: Check Google Calendar)
    const connection = await prisma.calendarConnection.findUnique({
      where: { organizationId: orgId }
    });

    if (connection && connection.calendarId) {
      const accessToken = await getValidAccessToken(orgId);
      if (accessToken) {
        const googleConflicts = await checkFreeBusy(
          accessToken,
          connection.calendarId,
          start.toISOString(),
          end.toISOString()
        );
        if (googleConflicts.length > 0) {
          return NextResponse.json({ error: 'This time slot is no longer available (conflicts with sync calendar).' }, { status: 409 });
        }
      }
    }

    // 4. Save booking record in database
    // Set date to local start day
    const bookingDate = new Date(start);
    bookingDate.setUTCHours(0, 0, 0, 0);

    const service = await prisma.service.findUnique({
      where: { id: serviceId }
    });

    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }

    const booking = await prisma.booking.create({
      data: {
        organizationId: orgId,
        agentId,
        serviceId,
        customerName,
        customerEmail,
        customerPhone,
        customerNotes,
        bookingDate,
        startTime: start,
        endTime: end,
        timezone: timezone || 'UTC',
        status: 'confirmed',
      },
      include: {
        service: true,
      }
    });

    // 5. Create event in Google Calendar (if connected)
    if (connection && connection.calendarId) {
      const accessToken = await getValidAccessToken(orgId);
      if (accessToken) {
        // Find business hours timezone for correct display
        const businessHours = await prisma.businessHours.findFirst({
          where: { organizationId: orgId }
        });
        const bizTz = businessHours?.timezone || 'UTC';

        const summary = `${service.name} - ${customerName}`;
        const description = `Appointment booked via ChatBox AI widget.\n\nCustomer: ${customerName}\nEmail: ${customerEmail}\nPhone: ${customerPhone || 'N/A'}\nNotes: ${customerNotes || 'N/A'}`;

        const googleEventId = await createGoogleEvent(accessToken, connection.calendarId, {
          summary,
          description,
          start: { dateTime: start.toISOString(), timeZone: bizTz },
          end: { dateTime: end.toISOString(), timeZone: bizTz },
          attendees: [{ email: customerEmail }]
        });

        if (googleEventId) {
          await prisma.booking.update({
            where: { id: booking.id },
            data: { googleEventId }
          });
        }
      }
    }

    // 6. Send email notification to customer
    try {
      await sendBookingNotification('BOOKING_CONFIRMED', {
        bookingId: booking.id,
        customerName: booking.customerName,
        customerEmail: booking.customerEmail,
        serviceName: service.name,
        startTime: start,
        endTime: end,
        timezone: booking.timezone,
        businessName: agent.organization.name
      });
    } catch (err) {
      console.error('Failed to send confirmation email:', err);
    }

    // Return confirmation
    const response = NextResponse.json({
      success: true,
      booking: {
        id: booking.id,
        serviceName: service.name,
        customerName: booking.customerName,
        startTime: booking.startTime,
        endTime: booking.endTime,
        businessName: agent.organization.name,
      }
    });
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PATCH, DELETE');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
    return response;
  } catch (error: any) {
    console.error('Error creating booking:', error);
    const errorResponse = NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    errorResponse.headers.set('Access-Control-Allow-Origin', '*');
    return errorResponse;
  }
}

// PATCH: Update booking status (authenticated)
export async function PATCH(request: Request) {
  const session = await getSessionUser(request);
  if (!session) return authError();

  const orgId = session.orgId;
  if (!orgId) {
    return NextResponse.json({ error: 'Organization not found in session' }, { status: 400 });
  }

  try {
    const { id, status } = await request.json();

    if (!id || !status) {
      return NextResponse.json({ error: 'id and status are required' }, { status: 400 });
    }

    const booking = await prisma.booking.findFirst({
      where: { id, organizationId: orgId }
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found or access denied' }, { status: 404 });
    }

    const updated = await prisma.booking.update({
      where: { id },
      data: { status }
    });

    // If status is cancelled, clean up Google Calendar event
    if (status === 'cancelled') {
      if (booking.googleEventId) {
        const connection = await prisma.calendarConnection.findUnique({
          where: { organizationId: orgId }
        });
        if (connection && connection.calendarId) {
          const accessToken = await getValidAccessToken(orgId);
          if (accessToken) {
            await deleteGoogleEvent(accessToken, connection.calendarId, booking.googleEventId);
          }
        }
      }

      // Send cancellation email notification to customer
      try {
        const service = await prisma.service.findUnique({
          where: { id: booking.serviceId }
        });
        const agent = await prisma.agent.findUnique({
          where: { id: booking.agentId },
          include: { organization: true }
        });

        if (service && agent) {
          await sendBookingNotification('BOOKING_CANCELLED', {
            bookingId: booking.id,
            customerName: booking.customerName,
            customerEmail: booking.customerEmail,
            serviceName: service.name,
            startTime: booking.startTime,
            endTime: booking.endTime,
            timezone: booking.timezone,
            businessName: agent.organization.name
          });
        }
      } catch (err) {
        console.error('Failed to send cancellation email:', err);
      }
    }

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

export async function OPTIONS() {
  const response = new NextResponse(null, { status: 204 });
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PATCH, DELETE');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
  return response;
}
