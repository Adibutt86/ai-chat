import { NextResponse } from 'next/server';
import { getSessionUser, authError } from '@/lib/api-auth';
import { prisma } from '@/lib/db';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

// POST: Public endpoint for submitting Trip Details Form from Chatbot Widget
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      agentId,
      firstName,
      lastName,
      company,
      phone,
      serviceType,
      email,
      message,
    } = body;

    if (!agentId || !firstName || !lastName || !phone || !serviceType || !email) {
      return NextResponse.json(
        { error: 'First Name, Last Name, Phone, Email, and Service Choice are required.' },
        { status: 400, headers: corsHeaders }
      );
    }

    const agent = await prisma.agent.findUnique({
      where: { id: agentId }
    });

    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404, headers: corsHeaders });
    }

    const inquiry = await prisma.tripInquiry.create({
      data: {
        agentId,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        company: company ? company.trim() : null,
        phone: phone.trim(),
        serviceType: serviceType.trim(),
        email: email.trim(),
        message: message ? message.trim() : null,
        status: 'new',
      },
    });

    // NOTE: Ready to connect with Resend email notification service later here
    console.log(`[Trip Inquiry Received] ID: ${inquiry.id} | Agent: ${agentId} | Name: ${firstName} ${lastName} | Service: ${serviceType} | Email: ${email}`);

    return NextResponse.json(
      { success: true, message: 'Trip details submitted successfully!', inquiry },
      { status: 201, headers: corsHeaders }
    );
  } catch (err: any) {
    console.error('Error in POST /api/trip-inquiries:', err);
    return NextResponse.json(
      { error: err.message || 'Internal server error' },
      { status: 500, headers: corsHeaders }
    );
  }
}

// GET: Authenticated endpoint for viewing Trip Details Inquiries in Dashboard
export async function GET(request: Request) {
  const session = await getSessionUser(request);
  if (!session) return authError();

  const { searchParams } = new URL(request.url);
  const agentId = searchParams.get('agentId');

  try {
    const whereClause: any = {};
    if (agentId) {
      whereClause.agentId = agentId;
    } else if (session.orgId) {
      whereClause.agent = { organizationId: session.orgId };
    }

    const inquiries = await prisma.tripInquiry.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return NextResponse.json(inquiries);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
