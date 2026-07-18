import { prisma } from './db';

interface GoogleTokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
}

/**
 * Ensures we have a valid, active access token for Google Calendar.
 * If expired or expiring soon, refreshes it automatically.
 */
export async function getValidAccessToken(organizationId: string): Promise<string | null> {
  const connection = await prisma.calendarConnection.findUnique({
    where: { organizationId }
  });

  if (!connection) return null;

  const now = new Date();
  const bufferTime = 5 * 60 * 1000; // 5 minute buffer

  // If token is still valid, return it
  if (connection.expiresAt && connection.expiresAt.getTime() > now.getTime() + bufferTime) {
    return connection.accessToken;
  }

  // Token is expired, refresh it
  if (!connection.refreshToken) {
    console.error(`No refresh token found for organization ${organizationId}`);
    return null;
  }

  try {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID || '',
        client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
        refresh_token: connection.refreshToken,
        grant_type: 'refresh_token',
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error(`Google Access Token Refresh Failed for org ${organizationId}:`, errText);
      return null;
    }

    const tokens: GoogleTokenResponse = await response.json();
    const expiresAt = new Date(Date.now() + tokens.expires_in * 1000);

    // Save refreshed token to DB
    await prisma.calendarConnection.update({
      where: { organizationId },
      data: {
        accessToken: tokens.access_token,
        expiresAt,
        refreshToken: tokens.refresh_token || undefined // google might send a new one
      }
    });

    return tokens.access_token;
  } catch (err) {
    console.error(`Error refreshing token for organization ${organizationId}:`, err);
    return null;
  }
}

/**
 * Fetch available calendars for selection
 */
export async function listCalendars(accessToken: string) {
  try {
    const res = await fetch('https://www.googleapis.com/calendar/v3/users/me/calendarList', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.items || [];
  } catch {
    return [];
  }
}

/**
 * Check availability using Google FreeBusy API
 */
export async function checkFreeBusy(
  accessToken: string,
  calendarId: string,
  timeMin: string, // ISO String
  timeMax: string  // ISO String
): Promise<{ start: Date; end: Date }[]> {
  try {
    const response = await fetch('https://www.googleapis.com/calendar/v3/freeBusy', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        timeMin,
        timeMax,
        items: [{ id: calendarId }]
      })
    });

    if (!response.ok) {
      console.error('Google FreeBusy error:', await response.text());
      return [];
    }

    const data = await response.json();
    const busyPeriods = data.calendars?.[calendarId]?.busy || [];
    
    return busyPeriods.map((period: any) => ({
      start: new Date(period.start),
      end: new Date(period.end)
    }));
  } catch (err) {
    console.error('Error fetching FreeBusy periods:', err);
    return [];
  }
}

/**
 * Create a new event on Google Calendar
 */
export async function createGoogleEvent(
  accessToken: string,
  calendarId: string,
  eventDetails: {
    summary: string;
    description?: string;
    start: { dateTime: string; timeZone: string };
    end: { dateTime: string; timeZone: string };
    attendees?: { email: string }[];
  }
): Promise<string | null> {
  try {
    const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(eventDetails)
    });

    if (!res.ok) {
      console.error('Failed to create calendar event:', await res.text());
      return null;
    }

    const data = await res.json();
    return data.id || null;
  } catch (err) {
    console.error('Google Calendar Event Creation Failed:', err);
    return null;
  }
}

/**
 * Delete event from Google Calendar
 */
export async function deleteGoogleEvent(
  accessToken: string,
  calendarId: string,
  eventId: string
): Promise<boolean> {
  try {
    const res = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${eventId}`,
      {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${accessToken}` }
      }
    );
    return res.ok;
  } catch (err) {
    console.error('Google Calendar Event Deletion Failed:', err);
    return false;
  }
}
