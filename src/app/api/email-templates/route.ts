import { NextResponse } from 'next/server';
import { getSessionUser, authError } from '@/lib/api-auth';
import { prisma } from '@/lib/db';

export async function GET(request: Request) {
  const session = await getSessionUser(request);
  if (!session) return authError();

  const config = await prisma.globalSettings.findUnique({
    where: { id: 'global-config' }
  });

  return NextResponse.json({
    emailApprovedSubject: config?.emailApprovedSubject || 'Appointment Approved & Confirmed: {serviceName}',
    emailApprovedBody: config?.emailApprovedBody || 'Hello {customerName},\n\nYour appointment for {serviceName} on {startTime} has been approved and confirmed!\n\nBooking Reference: {bookingId}\nBusiness: {businessName}\n\nThank you for scheduling with {businessName}!',
    emailCancelledSubject: config?.emailCancelledSubject || 'Appointment Cancelled: {serviceName}',
    emailCancelledBody: config?.emailCancelledBody || 'Hello {customerName},\n\nYour appointment for {serviceName} scheduled on {startTime} has been cancelled.\n\nBooking Reference: {bookingId}\n\nIf you have any questions, please reach out to {businessName}.',
    emailLeadSubject: config?.emailLeadSubject || '[New Lead Captured] - {customerName}',
    emailLeadBody: config?.emailLeadBody || 'A new lead has been captured via your AI chatbot widget:\n\nName: {customerName}\nEmail: {customerEmail}\nPhone: {customerPhone}\nCaptured Date: {startTime}'
  });
}

export async function POST(request: Request) {
  const session = await getSessionUser(request);
  if (!session) return authError();

  try {
    const {
      emailApprovedSubject,
      emailApprovedBody,
      emailCancelledSubject,
      emailCancelledBody,
      emailLeadSubject,
      emailLeadBody
    } = await request.json();

    const updatedConfig = await prisma.globalSettings.upsert({
      where: { id: 'global-config' },
      update: {
        emailApprovedSubject,
        emailApprovedBody,
        emailCancelledSubject,
        emailCancelledBody,
        emailLeadSubject,
        emailLeadBody
      },
      create: {
        id: 'global-config',
        emailApprovedSubject,
        emailApprovedBody,
        emailCancelledSubject,
        emailCancelledBody,
        emailLeadSubject,
        emailLeadBody
      }
    });

    return NextResponse.json({ success: true, templates: updatedConfig });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to save email templates' }, { status: 500 });
  }
}
