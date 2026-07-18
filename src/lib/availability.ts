import { prisma } from './db';
import { getValidAccessToken, checkFreeBusy } from './google-calendar';

interface TimeSlot {
  startTime: string; // ISO String (UTC)
  endTime: string;   // ISO String (UTC)
  localStart: string; // HH:mm format for visitor display
  localEnd: string;   // HH:mm format for visitor display
}

/**
 * Convert local time string (e.g. "09:00") on a specific date to a UTC Date object
 */
export function localTimeToUtc(dateStr: string, timeStr: string, timezone: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  const [hours, minutes] = timeStr.split(':').map(Number);
  
  const formattedString = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`;
  
  const tempDate = new Date(`${formattedString}Z`);
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: false
  });
  
  const parts = formatter.formatToParts(tempDate);
  const partMap: Record<string, string> = {};
  parts.forEach(p => partMap[p.type] = p.value);
  
  const tzYear = Number(partMap.year);
  const tzMonth = Number(partMap.month);
  const tzDay = Number(partMap.day);
  const tzHour = Number(partMap.hour);
  const tzMin = Number(partMap.minute);
  
  const utcMs = Date.UTC(year, month - 1, day, hours, minutes, 0);
  const tzMs = Date.UTC(tzYear, tzMonth - 1, tzDay, tzHour, tzMin, 0);
  const offset = tzMs - utcMs;
  
  return new Date(utcMs - offset);
}

/**
 * Format a UTC Date object into a readable HH:mm string for a specific timezone
 */
export function formatInTimezone(date: Date, timezone: string, hour12 = false): string {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    hour: '2-digit',
    minute: '2-digit',
    hour12
  }).format(date);
}

export async function getAvailableTimeSlots(
  agentId: string,
  serviceId: string,
  dateStr: string // YYYY-MM-DD
): Promise<TimeSlot[]> {
  // 1. Load service and agent details
  const service = await prisma.service.findUnique({
    where: { id: serviceId }
  });

  const agent = await prisma.agent.findUnique({
    where: { id: agentId },
    select: { organizationId: true }
  });

  if (!service || !agent) {
    throw new Error('Service or Agent not found');
  }

  const orgId = agent.organizationId;

  // 2. Load business hours settings
  // Parse the day of the week (Date.getDay() returns 0 for Sunday)
  const targetDate = new Date(dateStr);
  const dayOfWeek = targetDate.getDay();

  const businessHours = await prisma.businessHours.findFirst({
    where: { organizationId: orgId, dayOfWeek }
  });

  // If closed or disabled, return no slots
  if (!businessHours || !businessHours.isEnabled) {
    return [];
  }

  const timezone = businessHours.timezone;
  const startTimeStr = businessHours.startTime;
  const endTimeStr = businessHours.endTime;

  // 3. Compute business hours boundary in UTC for this specific day
  const dayStartUtc = localTimeToUtc(dateStr, startTimeStr, timezone);
  const dayEndUtc = localTimeToUtc(dateStr, endTimeStr, timezone);

  // 4. Fetch conflicts from Supabase Database
  // Conflicting bookings must overlap with our target day range
  const existingBookings = await prisma.booking.findMany({
    where: {
      organizationId: orgId,
      status: { notIn: ['cancelled'] },
      startTime: { lte: dayEndUtc },
      endTime: { gte: dayStartUtc }
    },
    select: { startTime: true, endTime: true }
  });

  const conflicts: { start: Date; end: Date }[] = existingBookings.map(b => ({
    start: new Date(b.startTime),
    end: new Date(b.endTime)
  }));

  // 5. Fetch conflicts from Google Calendar (if connected)
  const connection = await prisma.calendarConnection.findUnique({
    where: { organizationId: orgId }
  });

  if (connection && connection.calendarId) {
    const accessToken = await getValidAccessToken(orgId);
    if (accessToken) {
      const googleConflicts = await checkFreeBusy(
        accessToken,
        connection.calendarId,
        dayStartUtc.toISOString(),
        dayEndUtc.toISOString()
      );
      conflicts.push(...googleConflicts);
    }
  }

  // 6. Generate time slot intervals
  // Slots start every 30 minutes, or matching service duration if larger
  const slotIntervalMinutes = Math.min(30, service.durationMinutes);
  const durationMs = service.durationMinutes * 60 * 1000;
  const intervalMs = slotIntervalMinutes * 60 * 1000;

  const slots: TimeSlot[] = [];
  let currentSlotStartMs = dayStartUtc.getTime();
  const now = Date.now();
  const minBookingNoticeMs = 2 * 60 * 60 * 1000; // 2 hours minimum notice

  while (currentSlotStartMs + durationMs <= dayEndUtc.getTime()) {
    const slotStart = new Date(currentSlotStartMs);
    const slotEnd = new Date(currentSlotStartMs + durationMs);

    // Rule A: Prevent booking slots that begin in the past or within the notice window
    const isPast = currentSlotStartMs < now + minBookingNoticeMs;

    if (!isPast) {
      // Rule B: Verify if this slot overlaps with any conflicts (Postgres or Google Calendar)
      const hasConflict = conflicts.some(conflict => {
        // Overlap occurs when (start1 < end2) AND (end1 > start2)
        return slotStart.getTime() < conflict.end.getTime() && slotEnd.getTime() > conflict.start.getTime();
      });

      if (!hasConflict) {
        slots.push({
          startTime: slotStart.toISOString(),
          endTime: slotEnd.toISOString(),
          localStart: formatInTimezone(slotStart, timezone),
          localEnd: formatInTimezone(slotEnd, timezone)
        });
      }
    }

    currentSlotStartMs += intervalMs;
  }

  return slots;
}
