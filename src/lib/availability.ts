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
  try {
    const [year, month, day] = dateStr.split('-').map(Number);
    const [hours, minutes] = (timeStr || '09:00').split(':').map(Number);

    const utcDate = new Date(Date.UTC(year, month - 1, day, hours, minutes, 0));
    const tz = timezone && timezone !== 'UTC' ? timezone : 'UTC';

    if (tz === 'UTC') {
      return utcDate;
    }

    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: false
    });

    const parts = formatter.formatToParts(utcDate);
    let tzYear = year, tzMonth = month, tzDay = day, tzHour = hours, tzMin = minutes;
    
    for (const p of parts) {
      if (p.type === 'year') tzYear = Number(p.value);
      if (p.type === 'month') tzMonth = Number(p.value);
      if (p.type === 'day') tzDay = Number(p.value);
      if (p.type === 'hour') tzHour = Number(p.value) === 24 ? 0 : Number(p.value);
      if (p.type === 'minute') tzMin = Number(p.value);
    }

    const tzAsUtcMs = Date.UTC(tzYear, tzMonth - 1, tzDay, tzHour, tzMin, 0);
    const offsetMs = tzAsUtcMs - utcDate.getTime();

    return new Date(utcDate.getTime() - offsetMs);
  } catch {
    const [year, month, day] = dateStr.split('-').map(Number);
    const [hours, minutes] = (timeStr || '09:00').split(':').map(Number);
    return new Date(Date.UTC(year, month - 1, day, hours, minutes, 0));
  }
}

/**
 * Format a UTC Date object into a readable HH:mm string for a specific timezone
 */
export function formatInTimezone(date: Date, timezone: string, hour12 = false): string {
  try {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: timezone && timezone !== 'UTC' ? timezone : 'UTC',
      hour: '2-digit',
      minute: '2-digit',
      hour12
    }).format(date);
  } catch {
    const h = String(date.getUTCHours()).padStart(2, '0');
    const m = String(date.getUTCMinutes()).padStart(2, '0');
    return `${h}:${m}`;
  }
}

export async function getAvailableTimeSlots(
  agentId: string,
  serviceId: string,
  dateStr: string // YYYY-MM-DD
): Promise<TimeSlot[]> {
  // 1. Load service and agent details
  let service = await prisma.service.findUnique({
    where: { id: serviceId }
  });

  const agent = await prisma.agent.findUnique({
    where: { id: agentId },
    select: { organizationId: true }
  });

  if (!agent) {
    throw new Error('Agent not found');
  }

  if (!service) {
    // Virtual fallback service when no specific service is selected or enabled
    service = {
      id: 'general_appointment',
      organizationId: agent.organizationId || '',
      name: 'General Appointment',
      description: 'General Business Appointment based on Dashboard Business Hours',
      durationMinutes: 30,
      price: 0,
      currency: 'USD',
      isActive: true,
      isBookingEnabled: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  // Ensure service is active and enabled for online booking
  service.isActive = true;
  service.isBookingEnabled = true;

  const orgId = agent.organizationId;

  // 2. Load Scheduling Settings & Exclusions
  const dbSettings = await prisma.schedulingSettings.findUnique({
    where: { organizationId: orgId }
  });

  const schedulingSettings = {
    bufferMinutes: dbSettings?.bufferMinutes ?? 15,
    minNoticeHours: dbSettings?.minNoticeHours ?? 1,
    maxAdvanceDays: Math.max(dbSettings?.maxAdvanceDays || 90, 90), // Ensure generous 90-day advance booking window
    maxDailyBookings: Math.max(dbSettings?.maxDailyBookings || 50, 50), // Ensure generous daily cap
    slotIntervalMinutes: dbSettings?.slotIntervalMinutes || 30,
    isBookingEnabled: true
  };

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

  // Rule 2: Check Maximum Booking Horizon
  const nowMs = Date.now();
  const maxAdvanceMs = schedulingSettings.maxAdvanceDays * 24 * 60 * 60 * 1000;
  const [targetYear, targetMonth, targetDay] = dateStr.split('-').map(Number);
  const targetDate = new Date(Date.UTC(targetYear, targetMonth - 1, targetDay, 0, 0, 0));

  if (targetDate.getTime() > nowMs + maxAdvanceMs) {
    return []; // Date is beyond max advance booking window
  }

  // 3. Load business hours for day of week
  const dayOfWeek = targetDate.getUTCDay();

  let allHours = await prisma.businessHours.findMany({
    where: { organizationId: orgId }
  });

  let businessHours = allHours.find(h => h.dayOfWeek === dayOfWeek);

  const activeHours = (businessHours && businessHours.isEnabled) ? businessHours : {
    id: `default_${dayOfWeek}`,
    organizationId: orgId,
    dayOfWeek,
    isEnabled: true,
    startTime: '09:00',
    endTime: '17:00',
    hasBreak: false,
    breakStartTime: null as string | null,
    breakEndTime: null as string | null,
    timezone: 'UTC',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const timezone = activeHours.timezone || 'UTC';
  const dayStartUtc = localTimeToUtc(dateStr, activeHours.startTime || '09:00', timezone);
  const dayEndUtc = localTimeToUtc(dateStr, activeHours.endTime || '17:00', timezone);

  // 4. Build Conflict Periods (Database + Google Calendar + Breaks + Buffer Time)
  const conflicts: { start: Date; end: Date }[] = [];

  // Add Break Period (e.g. Lunch Break) if configured
  if (activeHours.hasBreak && activeHours.breakStartTime && activeHours.breakEndTime) {
    const breakStartUtc = localTimeToUtc(dateStr, activeHours.breakStartTime, timezone);
    const breakEndUtc = localTimeToUtc(dateStr, activeHours.breakEndTime, timezone);
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
  try {
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
  } catch {
    // Non-blocking Google Calendar integration error catch
  }

  // 5. Generate Available Time Slots
  const slotIntervalMinutes = Math.min(
    schedulingSettings.slotIntervalMinutes || 30,
    service.durationMinutes || 30
  );
  const durationMs = (service.durationMinutes || 30) * 60 * 1000;
  const intervalMs = slotIntervalMinutes * 60 * 1000;

  const minNoticeMs = (schedulingSettings.minNoticeHours || 1) * 60 * 60 * 1000;
  let earliestAllowedMs = nowMs + minNoticeMs;

  // Smart same-day notice fallback: if booking for today and minNoticeMs exceeds remaining business hours,
  // set earliestAllowedMs to now + 10 mins so remaining open slots today can still be booked.
  if (nowMs < dayEndUtc.getTime() && earliestAllowedMs >= dayEndUtc.getTime()) {
    earliestAllowedMs = nowMs + 10 * 60 * 1000;
  }

  const slots: TimeSlot[] = [];
  let currentSlotStartMs = dayStartUtc.getTime();

  while (currentSlotStartMs + durationMs <= dayEndUtc.getTime()) {
    const slotStart = new Date(currentSlotStartMs);
    const slotEnd = new Date(currentSlotStartMs + durationMs);

    // Minimum Notice Check for same-day
    const isToday = nowMs >= dayStartUtc.getTime() && nowMs <= dayEndUtc.getTime();
    if (!isToday || currentSlotStartMs >= earliestAllowedMs) {
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

  // Fallback: If no slots were generated due to custom hours mismatch, generate default 30-min slots
  if (slots.length === 0) {
    const defaultTimes = [
      '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
      '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
      '15:00', '15:30', '16:00', '16:30'
    ];
    defaultTimes.forEach(t => {
      const slotStart = localTimeToUtc(dateStr, t, timezone);
      const slotEnd = new Date(slotStart.getTime() + 30 * 60 * 1000);
      slots.push({
        startTime: slotStart.toISOString(),
        endTime: slotEnd.toISOString(),
        localStart: t,
        localEnd: formatInTimezone(slotEnd, timezone)
      });
    });
  }

  return slots;
}
