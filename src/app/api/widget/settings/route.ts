import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const agentId = searchParams.get('agentId');

  if (!agentId) {
    return NextResponse.json({ error: 'agentId is required' }, { status: 400 });
  }

  const settings = await prisma.widgetSettings.findUnique({
    where: { agentId },
  });

  return NextResponse.json(settings);
}

export async function POST(request: Request) {
  try {
    const { 
      agentId, 
      primaryColor, 
      secondaryColor, 
      borderRadius, 
      position, 
      welcomeMessage, 
      placeholder, 
      themeMode,
      showBooking,
      showLeadForm,
      showServices,
      showHours,
      showPricing
    } = await request.json();

    if (!agentId) {
      return NextResponse.json({ error: 'agentId is required' }, { status: 400 });
    }

    const settings = await prisma.widgetSettings.upsert({
      where: { agentId },
      update: {
        primaryColor,
        secondaryColor,
        borderRadius,
        position,
        welcomeMessage,
        placeholder,
        themeMode,
        showBooking: showBooking !== undefined ? showBooking : true,
        showLeadForm: showLeadForm !== undefined ? showLeadForm : true,
        showServices: showServices !== undefined ? showServices : false,
        showHours: showHours !== undefined ? showHours : false,
        showPricing: showPricing !== undefined ? showPricing : false,
      },
      create: {
        agentId,
        primaryColor: primaryColor || '#2563eb',
        secondaryColor: secondaryColor || '#1e40af',
        borderRadius: borderRadius || '0.75rem',
        position: position || 'bottom-right',
        welcomeMessage: welcomeMessage || 'Hi! How can I help you today?',
        placeholder: placeholder || 'Type your message...',
        themeMode: themeMode || 'light',
        showBooking: showBooking !== undefined ? showBooking : true,
        showLeadForm: showLeadForm !== undefined ? showLeadForm : true,
        showServices: showServices !== undefined ? showServices : false,
        showHours: showHours !== undefined ? showHours : false,
        showPricing: showPricing !== undefined ? showPricing : false,
      },
    });

    return NextResponse.json(settings);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
