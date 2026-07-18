import { NextResponse } from 'next/server';
import { getSessionUser, authError } from '@/lib/api-auth';
import { prisma } from '@/lib/db';

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

      const services = await prisma.service.findMany({
        where: {
          organizationId: agent.organizationId,
          isActive: true
        },
        orderBy: { createdAt: 'asc' }
      });

      return NextResponse.json(services);
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
    const services = await prisma.service.findMany({
      where: { organizationId: orgId },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(services);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getSessionUser(request);
  if (!session) return authError();

  const orgId = session.orgId;
  if (!orgId) {
    return NextResponse.json({ error: 'Organization not found in session' }, { status: 400 });
  }

  try {
    const { name, description, durationMinutes, price, currency, isActive } = await request.json();

    if (!name || !durationMinutes) {
      return NextResponse.json({ error: 'Name and duration are required' }, { status: 400 });
    }

    const service = await prisma.service.create({
      data: {
        name,
        description,
        durationMinutes: parseInt(durationMinutes),
        price: parseFloat(price || '0'),
        currency: currency || 'USD',
        isActive: isActive !== undefined ? isActive : true,
        organizationId: orgId,
      },
    });

    return NextResponse.json(service);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
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
    const { id, name, description, durationMinutes, price, currency, isActive } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'Service ID is required' }, { status: 400 });
    }

    // Ensure service belongs to user's organization
    const serviceExists = await prisma.service.findFirst({
      where: { id, organizationId: orgId }
    });

    if (!serviceExists) {
      return NextResponse.json({ error: 'Service not found or access denied' }, { status: 404 });
    }

    const updatedService = await prisma.service.update({
      where: { id },
      data: {
        name: name !== undefined ? name : undefined,
        description: description !== undefined ? description : undefined,
        durationMinutes: durationMinutes !== undefined ? parseInt(durationMinutes) : undefined,
        price: price !== undefined ? parseFloat(price) : undefined,
        currency: currency !== undefined ? currency : undefined,
        isActive: isActive !== undefined ? isActive : undefined,
      },
    });

    return NextResponse.json(updatedService);
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
    const { searchParams } = new URL(request.url);
    const serviceId = searchParams.get('serviceId');

    if (!serviceId) {
      return NextResponse.json({ error: 'serviceId is required' }, { status: 400 });
    }

    // Ensure service belongs to user's organization
    const serviceExists = await prisma.service.findFirst({
      where: { id: serviceId, organizationId: orgId }
    });

    if (!serviceExists) {
      return NextResponse.json({ error: 'Service not found or access denied' }, { status: 404 });
    }

    await prisma.service.delete({
      where: { id: serviceId }
    });

    return NextResponse.json({ success: true, message: 'Service deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
