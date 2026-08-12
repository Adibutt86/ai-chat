import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { generateBookingActionToken, sendBookingNotification } from '@/lib/notifications';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action'); // 'confirm' or 'cancel'
  const id = searchParams.get('id');
  const token = searchParams.get('token');

  if (!id || !action || !token) {
    return new Response(
      `<html><body style="font-family:sans-serif; text-align:center; padding:50px; background:#f8fafc; color:#0f172a;">
        <h2 style="color:#ef4444;">Invalid Request</h2>
        <p>Missing booking parameters or action link format.</p>
      </body></html>`,
      { headers: { 'Content-Type': 'text/html' } }
    );
  }

  // Validate security action token
  const expectedToken = generateBookingActionToken(id);
  if (token !== expectedToken) {
    return new Response(
      `<html><body style="font-family:sans-serif; text-align:center; padding:50px; background:#f8fafc; color:#0f172a;">
        <h2 style="color:#ef4444;">Access Denied</h2>
        <p>Invalid or expired authorization token for this booking.</p>
      </body></html>`,
      { headers: { 'Content-Type': 'text/html' } }
    );
  }

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      service: true,
      agent: { include: { organization: true } }
    }
  });

  if (!booking) {
    return new Response(
      `<html><body style="font-family:sans-serif; text-align:center; padding:50px; background:#f8fafc; color:#0f172a;">
        <h2 style="color:#ef4444;">Booking Not Found</h2>
        <p>The requested booking ID does not exist or was deleted.</p>
      </body></html>`,
      { headers: { 'Content-Type': 'text/html' } }
    );
  }

  const newStatus = action === 'confirm' ? 'confirmed' : 'cancelled';

  await prisma.booking.update({
    where: { id },
    data: { status: newStatus }
  });

  // Trigger customer notification email
  const notificationEvent = newStatus === 'confirmed' ? 'BOOKING_CONFIRMED' : 'BOOKING_CANCELLED';
  try {
    await sendBookingNotification(notificationEvent, {
      bookingId: booking.id,
      customerName: booking.customerName,
      customerEmail: booking.customerEmail,
      serviceName: booking.service.name,
      startTime: booking.startTime,
      endTime: booking.endTime,
      timezone: booking.timezone,
      businessName: booking.agent.organization.name
    });
  } catch (err) {
    console.error('Error sending customer notification after admin action:', err);
  }

  const isSuccess = newStatus === 'confirmed';
  const statusTitle = isSuccess ? 'Appointment Approved & Confirmed!' : 'Appointment Cancelled';
  const statusColor = isSuccess ? '#10b981' : '#ef4444';
  const icon = isSuccess ? '✓' : '✕';

  const htmlResponse = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>${statusTitle}</title>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 40px 16px; display: flex; justify-content: center; align-items: center; min-height: 80vh; }
        .card { background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; max-width: 520px; width: 100%; padding: 36px 32px; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05); text-align: center; }
        .badge { width: 64px; height: 64px; border-radius: 50%; background-color: ${statusColor}15; color: ${statusColor}; font-size: 32px; font-weight: bold; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px auto; border: 2px solid ${statusColor}30; }
        h1 { margin: 0 0 8px 0; font-size: 22px; color: #0f172a; font-weight: 800; }
        p { margin: 0 0 24px 0; color: #64748b; font-size: 14px; line-height: 1.5; }
        .details { background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px 20px; text-align: left; margin-bottom: 28px; font-size: 13px; }
        .details-row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px border-dash #e2e8f0; }
        .details-row:last-child { border-bottom: none; }
        .label { color: #64748b; font-weight: 600; }
        .value { color: #0f172a; font-weight: 700; }
        .btn { display: inline-block; background-color: #1E3A8A; color: #ffffff; text-decoration: none; font-weight: 700; font-size: 13px; padding: 12px 28px; border-radius: 8px; transition: background-color 0.2s; }
        .btn:hover { background-color: #1e40af; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="badge">${icon}</div>
        <h1>${statusTitle}</h1>
        <p>The booking status has been updated in your Geekvista system and an automated email update has been sent to the customer.</p>
        
        <div class="details">
          <div class="details-row">
            <span class="label">Customer Name:</span>
            <span class="value">${booking.customerName}</span>
          </div>
          <div class="details-row">
            <span class="label">Customer Email:</span>
            <span class="value">${booking.customerEmail}</span>
          </div>
          <div class="details-row">
            <span class="label">Service:</span>
            <span class="value">${booking.service.name}</span>
          </div>
          <div class="details-row">
            <span class="label">Booking ID:</span>
            <span class="value">${booking.id}</span>
          </div>
          <div class="details-row">
            <span class="label">New Status:</span>
            <span class="value" style="color: ${statusColor}; text-transform: uppercase;">${newStatus}</span>
          </div>
        </div>

        <a href="http://localhost:3000/dashboard?tab=bookings" class="btn">Go to Dashboard →</a>
      </div>
    </body>
    </html>
  `;

  return new Response(htmlResponse, {
    headers: { 'Content-Type': 'text/html' }
  });
}
