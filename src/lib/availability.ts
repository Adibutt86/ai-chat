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

  if (!service.isActive || service.isBookingEnabled === false) {
    return []; // Online booking is disabled for this individual service
  }

  const orgId = agent.organizationId;

  // 2. Load Scheduling Settings & Exclusions
  const schedulingSettings = await prisma.schedulingSettings.findUnique({
    where: { organizationId: orgId }
  }) || {
    bufferMinutes: 15,
    minNoticeHours: 2,
    maxAdvanceDays: 30,
    maxDailyBookings: 10,
    slotIntervalMinutes: 30,
    isBookingEnabled: true
  };

  // Rule 0: Master Global Online Booking Switch Check
  if ((schedulingSettings as any).isBookingEnabled === false) {
    return []; // Global online booking is paused for all services
  }

  // Rule 1: Check Holiday Exception
  const isHoliday = await prisma.holiday.findUnique({
    where: {
      organizationId_date: {
        organizationId: orgId,
        date: dateStr
      }
    }
  });

  if (isHoliday) {
    return []; // Closed for Holiday
  }

  // Rule 2: Check Maximum Booking Horizon (maxAdvanceDays)
  const nowMs = Date.now();
  const maxAdvanceMs = schedulingSettings.maxAdvanceDays * 24 * 60 * 60 * 1000;
  const targetDate = new Date(`${dateStr}T00:00:00Z`);

  if (targetDate.getTime() > nowMs + maxAdvanceMs) {
    return []; // Date is beyond max advance booking window
  }

  // 3. Load business hours for day of week
  const dayOfWeek = targetDate.getUTCDay();

  const businessHours = await prisma.businessHours.findFirst({
    where: { organizationId: orgId, dayOfWeek }
  });

  if (!businessHours || !businessHours.isEnabled) {
    return []; // Closed on this day
  }

  const timezone = businessHours.timezone;
  const dayStartUtc = localTimeToUtc(dateStr, businessHours.startTime, timezone);
  const dayEndUtc = localTimeToUtc(dateStr, businessHours.endTime, timezone);

  // Rule 3: Check Maximum Daily Bookings Limit
  const existingDailyCount = await prisma.booking.count({
    where: {
      organizationId: orgId,
      status: { notIn: ['cancelled'] },
      startTime: { lte: dayEndUtc },
      endTime: { gte: dayStartUtc }
    }
  });

  if (existingDailyCount >= schedulingSettings.maxDailyBookings) {
    return []; // Reached max daily booking cap
  }

  // 4. Build Conflict Periods (Database + Google Calendar + Breaks + Buffer Time)
  const conflicts: { start: Date; end: Date }[] = [];

  // Add Break Period (e.g. Lunch Break) if configured
  if (businessHours.hasBreak && businessHours.breakStartTime && businessHours.breakEndTime) {
    const breakStartUtc = localTimeToUtc(dateStr, businessHours.breakStartTime, timezone);
    const breakEndUtc = localTimeToUtc(dateStr, businessHours.breakEndTime, timezone);
    conflicts.push({ start: breakStartUtc, end: breakEndUtc });
  }

  // Fetch Database Bookings with Buffer Padding
  const bufferMs = schedulingSettings.bufferMinutes * 60 * 1000;

  const existingBookings = await prisma.booking.findMany({
    where: {
      organizationId: orgId,
      status: { notIn: ['cancelled'] },
      startTime: { lte: dayEndUtc },
      endTime: { gte: dayStartUtc }
    },
    select: { startTime: true, endTime: true }
  });

  existingBookings.forEach(b => {
    conflicts.push({
      start: new Date(new Date(b.startTime).getTime() - bufferMs),
      end: new Date(new Date(b.endTime).getTime() + bufferMs)
    });
  });

  // Fetch Google Calendar Busy Slots (with buffer padding)
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
      googleConflicts.forEach(gc => {
        conflicts.push({
          start: new Date(gc.start.getTime() - bufferMs),
          end: new Date(gc.end.getTime() + bufferMs)
        });
      });
    }
  }

  // 5. Generate Available Time Slots
  const slotIntervalMinutes = Math.min(
    schedulingSettings.slotIntervalMinutes || 30,
    service.durationMinutes
  );
  const durationMs = service.durationMinutes * 60 * 1000;
  const intervalMs = slotIntervalMinutes * 60 * 1000;

  const minNoticeMs = schedulingSettings.minNoticeHours * 60 * 60 * 1000;
  const earliestAllowedMs = nowMs + minNoticeMs;

  const slots: TimeSlot[] = [];
  let currentSlotStartMs = dayStartUtc.getTime();

  while (currentSlotStartMs + durationMs <= dayEndUtc.getTime()) {
    const slotStart = new Date(currentSlotStartMs);
    const slotEnd = new Date(currentSlotStartMs + durationMs);

    // Minimum Notice Check
    if (currentSlotStartMs >= earliestAllowedMs) {
      // Verify Overlaps with Conflicts
      const hasConflict = conflicts.some(conflict => {
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
