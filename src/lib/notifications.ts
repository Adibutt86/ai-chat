import { formatInTimezone } from './availability';

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
 * Send a booking notification email.
 * This is an abstraction that logs notifications locally and is ready
 * to be wired up with any transactional email service (e.g. Nodemailer, Resend, SendGrid)
 * using the configured environment variables.
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
    BOOKING_CREATED: `Appointment Booked: ${payload.serviceName}`,
    BOOKING_CONFIRMED: `Appointment Confirmed: ${payload.serviceName}`,
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
    Confirmation ID: ${payload.bookingId}

    If you have any questions, please contact ${payload.businessName}.

    Best regards,
    ChatBox AI Scheduler
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

  // To wire up a real provider in the future:
  // if (process.env.SMTP_HOST && process.env.SMTP_USER) {
  //   // Execute transporter.sendMail(...)
  // }

  return true;
}
