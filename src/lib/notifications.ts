import { prisma } from './db';
import crypto from 'crypto';

export type NotificationEvent = 
  | 'BOOKING_CREATED'
  | 'BOOKING_CONFIRMED'
  | 'BOOKING_CANCELLED'
  | 'BOOKING_RESCHEDULED';

interface NotificationPayload {
  bookingId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string | null;
  serviceName: string;
  startTime: Date;
  endTime: Date;
  timezone: string;
  businessName: string;
}

export function generateBookingActionToken(bookingId: string): string {
  const secret = process.env.AUTH_SECRET || process.env.JWT_SECRET || 'geekvista-booking-action-secret-2026';
  return crypto.createHmac('sha256', secret).update(bookingId).digest('hex');
}

export async function getAdminEmail(): Promise<string> {
  try {
    const adminUser = await prisma.user.findFirst({
      where: { role: 'admin' },
      select: { email: true }
    });
    if (adminUser?.email) return adminUser.email;

    const ownerUser = await prisma.user.findFirst({
      where: { role: 'owner' },
      select: { email: true }
    });
    if (ownerUser?.email) return ownerUser.email;
  } catch (err) {
    console.error('Error finding admin email:', err);
  }
  return process.env.ADMIN_EMAIL || 'comswebs@gmail.com';
}

async function sendResendEmail(to: string, subject: string, html: string): Promise<boolean> {
  try {
    const config = await prisma.globalSettings.findUnique({
      where: { id: 'global-config' }
    });

    const apiKey = config?.resendApiKey || process.env.RESEND_API_KEY;
    const fromEmail = config?.fromEmail || process.env.FROM_EMAIL || 'onboarding@resend.dev';

    console.log(`[EMAIL SEND INITIATED] To: ${to} | Subject: "${subject}"`);

    if (apiKey && apiKey.length > 5) {
      console.log(`[RESEND API] Delivering email via Resend API to ${to}...`);
      let resendRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [to],
          subject,
          html
        })
      });
      let resData = await resendRes.json();

      if (!resendRes.ok && resData.name === 'validation_error' && to !== 'comswebs@gmail.com') {
        console.warn(`[RESEND TEST MODE] Forwarding email intended for ${to} to account signup email comswebs@gmail.com`);
        const testNotice = `<div style="background:#fef3c7; border:1px solid #fcd34d; color:#92400e; padding:10px 14px; border-radius:6px; font-size:12px; margin-bottom:16px;">
          ⚠️ <strong>Resend Test Mode:</strong> Email intended for <code>${to}</code> was delivered to signup account <code>comswebs@gmail.com</code>.
        </div>`;

        resendRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: fromEmail,
            to: ['comswebs@gmail.com'],
            subject: `[Test Mode -> ${to}] ${subject}`,
            html: testNotice + html
          })
        });
        resData = await resendRes.json();
      }

      console.log(`[RESEND API RESPONSE]:`, resData);
      return resendRes.ok;
    } else {
      console.log(`[EMAIL LOG FALLBACK] (RESEND_API_KEY not configured). Message for ${to}:\nSubject: ${subject}\n`);
      return true;
    }
  } catch (err) {
    console.error('[EMAIL DELIVERY ERROR]:', err);
    return false;
  }
}

/**
 * Send Lead Captured Email ONLY to Admin (Not sent to user/visitor)
 */
export async function sendLeadCapturedAdminNotification(lead: {
  name?: string | null;
  email: string;
  phone?: string | null;
  company?: string | null;
  createdAt: Date;
  agentName?: string;
}): Promise<boolean> {
  const adminEmail = await getAdminEmail();
  const leadName = lead.name || 'Captured Contact';
  const subject = `[New Lead Captured] - ${leadName} (${lead.email})`;

  const formattedDate = new Date(lead.createdAt).toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const htmlBody = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 28px; background-color: #f8fafc; color: #1e293b;">
      <div style="max-width: 580px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
        
        <div style="background-color: #1E3A8A; padding: 20px 24px; text-align: left;">
          <h2 style="color: #ffffff; margin: 0; font-size: 18px; font-weight: 700;">📋 New Lead Captured</h2>
          <p style="color: #93c5fd; margin: 4px 0 0 0; font-size: 12px;">Geekvista AI Chatbot Notification</p>
        </div>

        <div style="padding: 24px;">
          <p style="font-size: 14px; color: #334155; margin-top: 0;">A new visitor has submitted their contact details via your AI Chatbot widget:</p>

          <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin: 16px 0; background-color: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
            <tr>
              <td style="padding: 10px 14px; font-weight: bold; color: #64748b; border-bottom: 1px solid #e2e8f0; width: 35%;">Contact Name:</td>
              <td style="padding: 10px 14px; font-weight: bold; color: #0f172a; border-bottom: 1px solid #e2e8f0;">${leadName}</td>
            </tr>
            <tr>
              <td style="padding: 10px 14px; font-weight: bold; color: #64748b; border-bottom: 1px solid #e2e8f0;">Email Address:</td>
              <td style="padding: 10px 14px; color: #1E3A8A; font-weight: 600; border-bottom: 1px solid #e2e8f0;"><a href="mailto:${lead.email}" style="color: #1E3A8A; text-decoration: none;">${lead.email}</a></td>
            </tr>
            <tr>
              <td style="padding: 10px 14px; font-weight: bold; color: #64748b; border-bottom: 1px solid #e2e8f0;">Phone Number:</td>
              <td style="padding: 10px 14px; color: #0f172a; border-bottom: 1px solid #e2e8f0;">${lead.phone || 'N/A'}</td>
            </tr>
            ${lead.agentName ? `
            <tr>
              <td style="padding: 10px 14px; font-weight: bold; color: #64748b; border-bottom: 1px solid #e2e8f0;">Scope Agent:</td>
              <td style="padding: 10px 14px; color: #0f172a; border-bottom: 1px solid #e2e8f0;">${lead.agentName}</td>
            </tr>` : ''}
            <tr>
              <td style="padding: 10px 14px; font-weight: bold; color: #64748b;">Captured At:</td>
              <td style="padding: 10px 14px; color: #0f172a;">${formattedDate}</td>
            </tr>
          </table>

          <div style="margin-top: 24px; text-align: center;">
            <a href="http://localhost:3000/dashboard?tab=leads" style="display: inline-block; background-color: #F97316; color: #ffffff; text-decoration: none; padding: 10px 20px; border-radius: 8px; font-size: 13px; font-weight: bold;">
              View Leads Dashboard →
            </a>
          </div>
        </div>

        <div style="background-color: #f1f5f9; padding: 12px 24px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0;">
          This email was sent automatically to workspace admins. User leads notifications are disabled for site visitors.
        </div>
      </div>
    </div>
  `;

  return sendResendEmail(adminEmail, subject, htmlBody);
}

/**
 * Send Booking Request Notification Email to Admin with Approve & Cancel links
 */
export async function sendBookingAdminNotification(
  booking: any,
  serviceName: string,
  businessName: string,
  origin: string
): Promise<boolean> {
  const adminEmail = await getAdminEmail();
  const token = generateBookingActionToken(booking.id);
  const approveUrl = `${origin}/api/bookings/action?action=confirm&id=${booking.id}&token=${token}`;
  const cancelUrl = `${origin}/api/bookings/action?action=cancel&id=${booking.id}&token=${token}`;

  const formattedStart = new Date(booking.startTime).toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short'
  });

  const subject = `[New Booking Request] - ${booking.customerName} (${serviceName})`;

  const htmlBody = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 28px; background-color: #f8fafc; color: #1e293b;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
        
        <div style="background-color: #1E3A8A; padding: 22px 24px; text-align: left;">
          <h2 style="color: #ffffff; margin: 0; font-size: 18px; font-weight: 700;">📅 New Appointment Booking Request</h2>
          <p style="color: #93c5fd; margin: 4px 0 0 0; font-size: 12px;">Action Required: Approve or Cancel Booking</p>
        </div>

        <div style="padding: 24px;">
          <p style="font-size: 14px; color: #334155; margin-top: 0;">A new appointment has been scheduled and is awaiting your approval:</p>

          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 16px 0; font-size: 13px;">
            <p style="margin: 6px 0;">👤 <strong>Customer:</strong> ${booking.customerName}</p>
            <p style="margin: 6px 0;">✉️ <strong>Email:</strong> ${booking.customerEmail}</p>
            <p style="margin: 6px 0;">📞 <strong>Phone:</strong> ${booking.customerPhone || 'N/A'}</p>
            <p style="margin: 6px 0;">💼 <strong>Service:</strong> ${serviceName}</p>
            <p style="margin: 6px 0;">🕒 <strong>Requested Time:</strong> ${formattedStart}</p>
            <p style="margin: 6px 0;">🌐 <strong>Timezone:</strong> ${booking.timezone || 'UTC'}</p>
            <p style="margin: 6px 0;">🔑 <strong>Booking Ref:</strong> <code>${booking.id}</code></p>
          </div>

          <p style="font-size: 13px; font-weight: 700; color: #0f172a; margin-top: 20px; text-align: center;">Click an action below to update this booking directly from your email:</p>

          <div style="margin: 24px 0; text-align: center; display: flex; justify-content: center; gap: 12px;">
            <a href="${approveUrl}" style="display: inline-block; background-color: #10b981; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-size: 13px; font-weight: bold; box-shadow: 0 2px 4px rgba(16, 185, 129, 0.2); margin-right: 8px;">
              ✓ Approve Booking
            </a>
            <a href="${cancelUrl}" style="display: inline-block; background-color: #ef4444; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-size: 13px; font-weight: bold; box-shadow: 0 2px 4px rgba(239, 68, 68, 0.2);">
              ✕ Cancel Booking
            </a>
          </div>
        </div>

        <div style="background-color: #f1f5f9; padding: 12px 24px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0;">
          Geekvista AI Business Booking System • Instant One-Click Approval Link
        </div>
      </div>
    </div>
  `;

  return sendResendEmail(adminEmail, subject, htmlBody);
}

/**
 * Send Booking Status Notification Email to Customer
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

  const config = await prisma.globalSettings.findUnique({
    where: { id: 'global-config' }
  });

  let subject = '';
  let customBodyText = '';

  const replaceVars = (str: string) => {
    return str
      .replace(/\{customerName\}/g, payload.customerName || 'Valued Customer')
      .replace(/\{serviceName\}/g, payload.serviceName || 'Appointment')
      .replace(/\{startTime\}/g, formattedStart)
      .replace(/\{businessName\}/g, payload.businessName || 'Geekvista')
      .replace(/\{bookingId\}/g, payload.bookingId || '');
  };

  if (event === 'BOOKING_CONFIRMED' && config?.emailApprovedSubject) {
    subject = replaceVars(config.emailApprovedSubject);
    customBodyText = replaceVars(config.emailApprovedBody || '');
  } else if (event === 'BOOKING_CANCELLED' && config?.emailCancelledSubject) {
    subject = replaceVars(config.emailCancelledSubject);
    customBodyText = replaceVars(config.emailCancelledBody || '');
  } else {
    const subjectMap: Record<NotificationEvent, string> = {
      BOOKING_CREATED: `Appointment Booked (Pending Approval): ${payload.serviceName}`,
      BOOKING_CONFIRMED: `Appointment Approved & Confirmed: ${payload.serviceName}`,
      BOOKING_CANCELLED: `Appointment Cancelled: ${payload.serviceName}`,
      BOOKING_RESCHEDULED: `Appointment Rescheduled: ${payload.serviceName}`,
    };
    subject = subjectMap[event];
  }

  const htmlBody = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 24px; background-color: #f8fafc; color: #1e293b;">
      <div style="max-width: 580px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
        
        <div style="background-color: #1E3A8A; padding: 20px 24px; text-align: left;">
          <h2 style="color: #ffffff; margin: 0; font-size: 18px; font-weight: 700;">${subject}</h2>
          <p style="color: #93c5fd; margin: 4px 0 0 0; font-size: 12px;">Geekvista Appointment Update</p>
        </div>

        <div style="padding: 24px;">
          <p style="font-size: 14px; color: #334155; margin-top: 0;">Hello <strong>${payload.customerName}</strong>,</p>

          ${customBodyText ? `
            <div style="font-size: 13.5px; color: #334155; line-height: 1.6; whitespace-pre-wrap; margin: 16px 0;">
              ${customBodyText.replace(/\n/g, '<br/>')}
            </div>
          ` : `
            <p style="font-size: 13px; color: #475569;">Your appointment status for <strong>${payload.serviceName}</strong> with <strong>${payload.businessName}</strong> has been updated to: <span style="display: inline-block; padding: 4px 10px; background: #e0f2fe; color: #0369a1; border-radius: 6px; font-weight: bold;">${event.replace('_', ' ')}</span>.</p>
          `}

          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 16px; border-radius: 8px; margin: 20px 0; font-size: 13px;">
            <p style="margin: 6px 0;">📅 <strong>Date & Time:</strong> ${formattedStart}</p>
            <p style="margin: 6px 0;">🌐 <strong>Timezone:</strong> ${payload.timezone}</p>
            <p style="margin: 6px 0;">🏢 <strong>Business:</strong> ${payload.businessName}</p>
            <p style="margin: 6px 0;">🔑 <strong>Booking ID:</strong> <code>${payload.bookingId}</code></p>
          </div>

          <p style="color: #64748b; font-size: 13px; margin-bottom: 0;">Thank you for choosing ${payload.businessName}!</p>
        </div>

        <div style="background-color: #f1f5f9; padding: 12px 24px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0;">
          Automated appointment update notification.
        </div>
      </div>
    </div>
  `;

  return sendResendEmail(payload.customerEmail, subject, htmlBody);
}
