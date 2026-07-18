import { NextResponse } from 'next/server';
import { getAvailableTimeSlots } from '@/lib/availability';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const agentId = searchParams.get('agentId');
  const serviceId = searchParams.get('serviceId');
  const date = searchParams.get('date'); // YYYY-MM-DD

  if (!agentId || !serviceId || !date) {
    return NextResponse.json({ error: 'agentId, serviceId, and date are required' }, { status: 400 });
  }

  try {
    const slots = await getAvailableTimeSlots(agentId, serviceId, date);
    return NextResponse.json(slots);
  } catch (err: any) {
    console.error('Error fetching slots:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
