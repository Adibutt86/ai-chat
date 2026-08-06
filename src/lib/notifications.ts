import { prisma } from './db';

export type NotificationEvent = 
  | 'BOOKING_CREATED'
  | 'BOOKING_CONFIRMED'
  | 'BOOKING_CANCELLED'
  | 'BOOKING_RESCHEDULED';

interface NotificationPayload {
  bookingId: string;
  customerName: string;
  customerEmail: string;
  serviceName: string;
  startTime: Date;
  endTime: Date;
  timezone: string;
  businessName: string;
}

/**
 * Send a booking notification email via Resend API or console log fallback.
 */
export async function sendBookingNotification(
  event: NotificationEvent,
  payload: NotificationPayload
): Promise<boolean> {
  const formattedStart = payload.startTime.toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short'
  });

  const subjectMap: Record<NotificationEvent, string> = {
    BOOKING_CREATED: `Appointment Booked (Pending Approval): ${payload.serviceName}`,
    BOOKING_CONFIRMED: `Appointment Approved & Confirmed: ${payload.serviceName}`,
    BOOKING_CANCELLED: `Appointment Cancelled: ${payload.serviceName}`,
    BOOKING_RESCHEDULED: `Appointment Rescheduled: ${payload.serviceName}`,
  };

  const subject = subjectMap[event];
  const emailBody = `
    Hello ${payload.customerName},

    Your appointment status for "${payload.serviceName}" has been updated:
    Event: ${event.replace('_', ' ')}
    Time: ${formattedStart} (Timezone: ${payload.timezone})
    Business: ${payload.businessName}
    Booking Reference ID: ${payload.bookingId}

    If you have any questions, please contact ${payload.businessName}.

    Best regards,
    Geekvista Scheduler
  `;

  // Local/Development logging of the email
  console.log(`
[EMAIL NOTIFICATION SENT]
To: ${payload.customerEmail}
Subject: ${subject}
Body:
${emailBody}
=======================================
  `);

  // Wire up Resend Email Provider
  try {
    const config = await prisma.globalSettings.findUnique({
      where: { id: 'global-config' }
    });

    const apiKey = config?.resendApiKey || process.env.RESEND_API_KEY;
    const fromEmail = config?.fromEmail || process.env.FROM_EMAIL || 'onboarding@resend.dev';

    if (apiKey && apiKey.length > 5) {
      console.log(`[RESEND] Sending email via Resend API to ${payload.customerEmail}...`);
      const resendRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [payload.customerEmail],
          subject: subject,
          html: `<div style="font-family: sans-serif; padding: 24px; color: #1e293b; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; rounded-radius: 12px;">
            <h2 style="color: #2563eb; margin-top: 0;">${subject}</h2>
            <p>Hello <strong>${payload.customerName}</strong>,</p>
            <p>Your appointment status for <strong>${payload.serviceName}</strong> with <strong>${payload.businessName}</strong> is now <span style="display: inline-block; padding: 4px 10px; background: #e0f2fe; color: #0369a1; border-radius: 6px; font-weight: bold;">${event.replace('_', ' ')}</span>.</p>
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 16px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 6px 0;">📅 <strong>Date & Time:</strong> ${formattedStart}</p>
              <p style="margin: 6px 0;">🌐 <strong>Timezone:</strong> ${payload.timezone}</p>
              <p style="margin: 6px 0;">🏢 <strong>Business:</strong> ${payload.businessName}</p>
              <p style="margin: 6px 0;">🔑 <strong>Booking ID:</strong> <code>${payload.bookingId}</code></p>
            </div>
            <p style="color: #64748b; font-size: 14px;">Thank you for scheduling with ${payload.businessName}!</p>
          </div>`
        })
      });
      const resData = await resendRes.json();
      console.log(`[RESEND RESULT]:`, resData);
    }
  } catch (err) {
    console.error('Error delivering email via Resend API:', err);
  }

  return true;
}
