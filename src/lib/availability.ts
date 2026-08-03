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
    const tz = timezone && timezone !== 'UTC' ? timezone : 'UTC';

    if (tz === 'UTC') {
      return new Date(Date.UTC(year, month - 1, day, hours, minutes, 0));
    }

    const isoStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`;
    const targetDate = new Date(isoStr);
    
    if (isNaN(targetDate.getTime())) {
      return new Date(Date.UTC(year, month - 1, day, hours, minutes, 0));
    }

    // Determine offset using locale string comparison
    const tzDateStr = targetDate.toLocaleString('en-US', { timeZone: tz });
    const tzDate = new Date(tzDateStr);
    const diff = targetDate.getTime() - tzDate.getTime();
    return new Date(targetDate.getTime() + diff);
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
    maxAdvanceDays: Math.max(dbSettings?.maxAdvanceDays || 60, 60), // Ensure at least 60 days advance booking horizon
    maxDailyBookings: Math.max(dbSettings?.maxDailyBookings || 20, 20), // Ensure generous daily cap
    slotIntervalMinutes: dbSettings?.slotIntervalMinutes || 30,
    isBookingEnabled: dbSettings?.isBookingEnabled !== false
  };

  // Rule 0: Master Global Online Booking Switch Check
  if (schedulingSettings.isBookingEnabled === false) {
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

  // Auto-initialize default business hours if none exist in database
  if (allHours.length === 0 && orgId) {
    const DEFAULT_HOURS = [
      { dayOfWeek: 1, isEnabled: true, startTime: '09:00', endTime: '17:00' },
      { dayOfWeek: 2, isEnabled: true, startTime: '09:00', endTime: '17:00' },
      { dayOfWeek: 3, isEnabled: true, startTime: '09:00', endTime: '17:00' },
      { dayOfWeek: 4, isEnabled: true, startTime: '09:00', endTime: '17:00' },
      { dayOfWeek: 5, isEnabled: true, startTime: '09:00', endTime: '17:00' },
      { dayOfWeek: 6, isEnabled: true, startTime: '09:00', endTime: '17:00' },
      { dayOfWeek: 0, isEnabled: true, startTime: '09:00', endTime: '17:00' },
    ];
    await prisma.businessHours.createMany({
      data: DEFAULT_HOURS.map(h => ({
        ...h,
        organizationId: orgId,
        timezone: 'UTC'
      }))
    });
    allHours = await prisma.businessHours.findMany({
      where: { organizationId: orgId }
    });
  }

  let businessHours = allHours.find(h => h.dayOfWeek === dayOfWeek);

  // If business hours record is missing for this day, fallback to an enabled 9am-5pm schedule
  if (!businessHours) {
    businessHours = {
      id: `default_${dayOfWeek}`,
      organizationId: orgId,
      dayOfWeek,
      isEnabled: true,
      startTime: '09:00',
      endTime: '17:00',
      hasBreak: false,
      breakStartTime: null,
      breakEndTime: null,
      timezone: 'UTC',
      createdAt: new Date(),
      updatedAt: new Date()
    } as any;
  }

  if (!businessHours || !businessHours.isEnabled) {
    return []; // Closed on this day
  }

  const timezone = businessHours.timezone || 'UTC';
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
