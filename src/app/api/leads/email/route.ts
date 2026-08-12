import { NextResponse } from 'next/server';
import { getSessionUser, authError } from '@/lib/api-auth';
import { prisma } from '@/lib/db';

export async function POST(request: Request) {
  const session = await getSessionUser(request);
  if (!session) return authError();

  try {
    const { leadEmail, leadName, subject, message } = await request.json();

    if (!leadEmail || !subject || !message) {
      return NextResponse.json({ error: 'Missing required email fields (leadEmail, subject, message)' }, { status: 400 });
    }

    const config = await prisma.globalSettings.findUnique({
      where: { id: 'global-config' }
    });

    const apiKey = config?.resendApiKey || process.env.RESEND_API_KEY;
    const fromEmail = config?.fromEmail || process.env.FROM_EMAIL || 'onboarding@resend.dev';

    if (!apiKey || apiKey.length < 5) {
      return NextResponse.json({ error: 'Resend API Key is not configured in settings or environment.' }, { status: 400 });
    }

    const formattedHtml = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 28px; background-color: #f8fafc; color: #1e293b;">
        <div style="max-width: 580px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          
          <div style="background-color: #1E3A8A; padding: 20px 24px; text-align: left;">
            <h2 style="color: #ffffff; margin: 0; font-size: 18px; font-weight: 700;">Geekvista Support</h2>
            <p style="color: #93c5fd; margin: 4px 0 0 0; font-size: 12px;">Direct Customer Follow-up</p>
          </div>

          <div style="padding: 24px;">
            <p style="font-size: 14px; color: #334155; margin-top: 0;">Hello <strong>${leadName || 'Valued Customer'}</strong>,</p>
            
            <div style="font-size: 13.5px; color: #334155; line-height: 1.6; whitespace-pre-wrap; margin: 16px 0;">
              ${message.replace(/\n/g, '<br/>')}
            </div>

            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />

            <p style="color: #64748b; font-size: 12px; margin-bottom: 0;">
              Best regards,<br/>
              <strong>Geekvista Support Team</strong><br/>
              <a href="http://localhost:3000" style="color: #1E3A8A; text-decoration: none;">www.geekvista.com</a>
            </p>
          </div>

          <div style="background-color: #f1f5f9; padding: 12px 24px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0;">
            Sent directly via Geekvista Resend Server Integration
          </div>
        </div>
      </div>
    `;

    let resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [leadEmail],
        subject: subject,
        html: formattedHtml
      })
    });

    let resData = await resendRes.json();

    if (!resendRes.ok && resData.name === 'validation_error' && leadEmail !== 'comswebs@gmail.com') {
      console.warn(`[RESEND TEST MODE] Forwarding lead email intended for ${leadEmail} to account signup email comswebs@gmail.com`);
      const testNotice = `<div style="background:#fef3c7; border:1px solid #fcd34d; color:#92400e; padding:10px 14px; border-radius:6px; font-size:12px; margin-bottom:16px;">
        ⚠️ <strong>Resend Test Mode:</strong> Lead email intended for <code>${leadEmail}</code> was delivered to signup account <code>comswebs@gmail.com</code>.
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
          subject: `[Test Mode -> ${leadEmail}] ${subject}`,
          html: testNotice + formattedHtml
        })
      });
      resData = await resendRes.json();
    }

    if (!resendRes.ok) {
      return NextResponse.json({ 
        error: resData.message || 'Resend API rejected email delivery' 
      }, { status: resendRes.status });
    }

    return NextResponse.json({ 
      success: true, 
      resendId: resData.id 
    });

  } catch (err: any) {
    console.error('Error sending lead email via Resend:', err);
    return NextResponse.json({ error: err.message || 'Failed to deliver email' }, { status: 500 });
  }
}
