import { NextResponse } from 'next/server';
import { getAvailableTimeSlots } from '@/lib/availability';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const agentId = searchParams.get('agentId');
  const serviceId = searchParams.get('serviceId');
  const date = searchParams.get('date'); // YYYY-MM-DD

  if (!agentId || !serviceId || !date) {
    const errorResponse = NextResponse.json({ error: 'agentId, serviceId, and date are required' }, { status: 400 });
    errorResponse.headers.set('Access-Control-Allow-Origin', '*');
    return errorResponse;
  }

  try {
    const slots = await getAvailableTimeSlots(agentId, serviceId, date);
    const response = NextResponse.json(slots);
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
    return response;
  } catch (err: any) {
    console.error('Error fetching slots:', err);
    const errorResponse = NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
    errorResponse.headers.set('Access-Control-Allow-Origin', '*');
    return errorResponse;
  }
}

export async function OPTIONS() {
  const response = new NextResponse(null, { status: 204 });
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
  return response;
}
