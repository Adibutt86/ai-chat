'use client';

import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Check, 
  AlertCircle,
  Loader2,
  Globe,
  Coffee,
  CalendarDays,
  Sliders,
  Plus,
  Trash2,
  Calendar
} from 'lucide-react';

interface BusinessHour {
  id: string;
  dayOfWeek: number;
  isEnabled: boolean;
  startTime: string;
  endTime: string;
  hasBreak?: boolean;
  breakStartTime?: string;
  breakEndTime?: string;
  timezone: string;
}

interface Holiday {
  id: string;
  date: string;
  name: string;
}

interface SchedulingSettings {
  bufferMinutes: number;
  minNoticeHours: number;
  maxAdvanceDays: number;
  maxDailyBookings: number;
  slotIntervalMinutes: number;
}

const WEEKDAYS = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' }
];

const TIMEZONES = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Asia/Karachi',
  'Asia/Kolkata',
  'Asia/Singapore',
  'Asia/Tokyo',
  'Australia/Sydney'
];

export default function BusinessHoursManager() {
  const [activeTab, setActiveTab] = useState<'hours' | 'holidays' | 'rules'>('hours');
  const [hours, setHours] = useState<BusinessHour[]>([]);
  const [timezone, setTimezone] = useState('UTC');
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [settings, setSettings] = useState<SchedulingSettings>({
    bufferMinutes: 15,
    minNoticeHours: 2,
    maxAdvanceDays: 30,
    maxDailyBookings: 10,
    slotIntervalMinutes: 30
  });

  const [newHolidayDate, setNewHolidayDate] = useState('');
  const [newHolidayName, setNewHolidayName] = useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [hoursRes, holidaysRes, settingsRes] = await Promise.all([
        fetch('/api/business-hours'),
        fetch('/api/holidays'),
        fetch('/api/scheduling-settings')
      ]);

      if (hoursRes.ok) {
        const data = await hoursRes.json();
        setHours(data);
        if (data.length > 0) setTimezone(data[0].timezone);
      }

      if (holidaysRes.ok) {
        const data = await holidaysRes.json();
        setHolidays(data);
      }

      if (settingsRes.ok) {
        const data = await settingsRes.json();
        setSettings(data);
      }
      setError(null);
    } catch {
      setError('Connection failed loading scheduling configurations.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleDay = (id: string) => {
    setHours(prev => prev.map(h => h.id === id ? { ...h, isEnabled: !h.isEnabled } : h));
  };

  const handleToggleBreak = (id: string) => {
    setHours(prev => prev.map(h => h.id === id ? { ...h, hasBreak: !h.hasBreak } : h));
  };

  const handleHourChange = (id: string, field: keyof BusinessHour, value: any) => {
    setHours(prev => prev.map(h => h.id === id ? { ...h, [field]: value } : h));
  };

  const handleSaveHours = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(null);
    setError(null);
    try {
      const res = await fetch('/api/business-hours', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hours, timezone }),
      });
      if (res.ok) {
        setSuccess('Weekly business hours and break shifts updated!');
        setTimeout(() => setSuccess(null), 3000);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to save business hours');
      }
    } catch {
      setError('Network error saving business hours');
    } finally {
      setSaving(false);
    }
  };

  const handleAddHoliday = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHolidayDate || !newHolidayName) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/holidays', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: newHolidayDate, name: newHolidayName }),
      });
      if (res.ok) {
        const newHol = await res.json();
        setHolidays(prev => [...prev.filter(h => h.date !== newHol.date), newHol].sort((a,b) => a.date.localeCompare(b.date)));
        setNewHolidayDate('');
        setNewHolidayName('');
        setSuccess('Holiday exception added!');
        setTimeout(() => setSuccess(null), 3000);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to add holiday');
      }
    } catch {
      setError('Error adding holiday exception');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteHoliday = async (id: string) => {
    try {
      const res = await fetch(`/api/holidays?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setHolidays(prev => prev.filter(h => h.id !== id));
      }
    } catch {
      setError('Failed to delete holiday');
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(null);
    setError(null);
    try {
      const res = await fetch('/api/scheduling-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        setSuccess('Advanced scheduling rules updated!');
        setTimeout(() => setSuccess(null), 3000);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to save settings');
      }
    } catch {
      setError('Network error saving scheduling rules');
    } finally {
      setSaving(false);
    }
  };

  const sortedHours = [...hours].sort((a, b) => {
    const dayA = a.dayOfWeek === 0 ? 7 : a.dayOfWeek;
    const dayB = b.dayOfWeek === 0 ? 7 : b.dayOfWeek;
    return dayA - dayB;
  });

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-2xl font-bold text-zinc-900">Business Hours & Scheduling</h2>
        <p className="text-zinc-550 text-sm">Manage weekly availability, break shifts, holidays, buffer times, and scheduling notice rules.</p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-zinc-200 gap-4">
        <button
          onClick={() => setActiveTab('hours')}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition cursor-pointer ${
            activeTab === 'hours' ? 'border-blue-600 text-blue-600' : 'border-transparent text-zinc-500 hover:text-zinc-800'
          }`}
        >
          <Clock className="h-4 w-4" /> Weekly Hours & Breaks
        </button>

        <button
          onClick={() => setActiveTab('holidays')}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition cursor-pointer ${
            activeTab === 'holidays' ? 'border-blue-600 text-blue-600' : 'border-transparent text-zinc-500 hover:text-zinc-800'
          }`}
        >
          <CalendarDays className="h-4 w-4" /> Holidays & Exceptions ({holidays.length})
        </button>

        <button
          onClick={() => setActiveTab('rules')}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition cursor-pointer ${
            activeTab === 'rules' ? 'border-blue-600 text-blue-600' : 'border-transparent text-zinc-500 hover:text-zinc-800'
          }`}
        >
          <Sliders className="h-4 w-4" /> Buffer & Notice Rules
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex gap-3 text-red-600 text-sm items-center">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex gap-3 text-emerald-600 text-sm items-center">
          <Check className="h-5 w-5 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {loading ? (
        <div className="flex py-12 justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : (
        <>
          {/* TAB 1: WEEKLY HOURS & SHIFT BREAKS */}
          {activeTab === 'hours' && (
            <form onSubmit={handleSaveHours} className="space-y-6">
              <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
                <h3 className="text-sm font-semibold text-zinc-800 mb-4 uppercase tracking-wider flex items-center gap-2">
                  <Globe className="h-4 w-4 text-blue-600" /> Organization Timezone
                </h3>
                <div className="max-w-xs">
                  <select
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-zinc-900 focus:outline-none focus:ring-1 focus:ring-blue-600 text-sm cursor-pointer"
                  >
                    {TIMEZONES.map((tz) => (
                      <option key={tz} value={tz}>
                        {tz}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-zinc-500 mt-2">All client slot availabilities are calculated relative to this timezone.</p>
                </div>
              </div>

              <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="p-6 border-b border-zinc-200 bg-zinc-50/50">
                  <h3 className="text-sm font-semibold text-zinc-800 uppercase tracking-wider flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-600" /> Weekly Availability & Break Shifts
                  </h3>
                </div>

                <div className="divide-y divide-zinc-150 px-6 bg-white">
                  {sortedHours.map((h) => {
                    const label = WEEKDAYS.find(w => w.value === h.dayOfWeek)?.label || '';
                    return (
                      <div key={h.id} className="py-4 space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                          <div className="flex items-center gap-3 w-40">
                            <label className="relative inline-flex items-center cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={h.isEnabled}
                                onChange={() => handleToggleDay(h.id)}
                                className="sr-only peer"
                              />
                              <div className="w-9 h-5 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-400 after:border-zinc-350 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600 peer-checked:after:bg-white peer-checked:after:border-transparent"></div>
                            </label>
                            <span className={`font-medium text-sm ${h.isEnabled ? 'text-zinc-900' : 'text-zinc-400'}`}>{label}</span>
                          </div>

                          <div className="flex items-center gap-3 flex-wrap">
                            {h.isEnabled ? (
                              <>
                                <input
                                  type="time"
                                  value={h.startTime}
                                  onChange={(e) => handleHourChange(h.id, 'startTime', e.target.value)}
                                  className="bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-1.5 text-zinc-900 text-sm cursor-pointer"
                                />
                                <span className="text-zinc-500 text-sm">to</span>
                                <input
                                  type="time"
                                  value={h.endTime}
                                  onChange={(e) => handleHourChange(h.id, 'endTime', e.target.value)}
                                  className="bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-1.5 text-zinc-900 text-sm cursor-pointer"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleToggleBreak(h.id)}
                                  className={`text-xs px-2.5 py-1 rounded-lg border font-medium flex items-center gap-1 cursor-pointer transition ${
                                    h.hasBreak ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-zinc-50 text-zinc-600 border-zinc-200 hover:bg-zinc-100'
                                  }`}
                                >
                                  <Coffee className="h-3 w-3" /> {h.hasBreak ? 'Remove Break' : '+ Add Break'}
                                </button>
                              </>
                            ) : (
                              <span className="text-sm text-zinc-400 italic">Closed / Unavailable</span>
                            )}
                          </div>
                        </div>

                        {/* Break Shift Sub-Row */}
                        {h.isEnabled && h.hasBreak && (
                          <div className="ml-12 pl-4 border-l-2 border-amber-200 flex items-center gap-3 py-1">
                            <span className="text-xs font-semibold text-amber-700 flex items-center gap-1">
                              <Coffee className="h-3 w-3" /> Lunch Break:
                            </span>
                            <input
                              type="time"
                              value={h.breakStartTime || '12:00'}
                              onChange={(e) => handleHourChange(h.id, 'breakStartTime', e.target.value)}
                              className="bg-amber-50/50 border border-amber-200 rounded-lg px-2.5 py-1 text-zinc-900 text-xs"
                            />
                            <span className="text-amber-700 text-xs">to</span>
                            <input
                              type="time"
                              value={h.breakEndTime || '13:00'}
                              onChange={(e) => handleHourChange(h.id, 'breakEndTime', e.target.value)}
                              className="bg-amber-50/50 border border-amber-200 rounded-lg px-2.5 py-1 text-zinc-900 text-xs"
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="p-6 bg-zinc-50/50 border-t border-zinc-200 flex justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition cursor-pointer"
                  >
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                    <span>Save Hours & Breaks</span>
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* TAB 2: HOLIDAYS & SPECIAL DATE EXCEPTIONS */}
          {activeTab === 'holidays' && (
            <div className="space-y-6">
              <form onSubmit={handleAddHoliday} className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm space-y-4">
                <h3 className="text-sm font-semibold text-zinc-800 uppercase tracking-wider flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-blue-600" /> Add Holiday Exception
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-zinc-500 uppercase">Holiday Date *</label>
                    <input
                      type="date"
                      value={newHolidayDate}
                      onChange={(e) => setNewHolidayDate(e.target.value)}
                      className="mt-1 w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-zinc-500 uppercase">Holiday Name / Description *</label>
                    <input
                      type="text"
                      placeholder="e.g. Christmas Day"
                      value={newHolidayName}
                      onChange={(e) => setNewHolidayName(e.target.value)}
                      className="mt-1 w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-sm"
                      required
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      type="submit"
                      disabled={saving}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Plus className="h-4 w-4" /> Add Holiday
                    </button>
                  </div>
                </div>
              </form>

              <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="p-4 bg-zinc-50 border-b border-zinc-200 text-xs font-semibold text-zinc-500 uppercase">
                  Registered Holiday Closures ({holidays.length})
                </div>
                {holidays.length === 0 ? (
                  <div className="p-8 text-center text-sm text-zinc-400">No holidays configured yet. Add holidays above to automatically close booking calendar on specific dates.</div>
                ) : (
                  <div className="divide-y divide-zinc-150">
                    {holidays.map((hol) => (
                      <div key={hol.id} className="p-4 flex items-center justify-between hover:bg-zinc-50">
                        <div>
                          <span className="font-semibold text-sm text-zinc-900">{hol.date}</span>
                          <span className="ml-3 text-xs bg-amber-100 text-amber-800 font-semibold px-2.5 py-0.5 rounded-full">{hol.name}</span>
                        </div>
                        <button
                          onClick={() => handleDeleteHoliday(hol.id)}
                          className="text-red-500 hover:text-red-700 p-1.5 rounded-lg hover:bg-red-50 cursor-pointer"
                          title="Delete Holiday"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: BUFFER TIMES & NOTICE RULES */}
          {activeTab === 'rules' && (
            <form onSubmit={handleSaveSettings} className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm space-y-6">
              <h3 className="text-sm font-semibold text-zinc-800 uppercase tracking-wider flex items-center gap-2">
                <Sliders className="h-4 w-4 text-blue-600" /> Booking Rules & Granularity
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-semibold text-zinc-700 uppercase">Pre & Post Meeting Buffer (Minutes)</label>
                  <input
                    type="number"
                    min="0"
                    max="120"
                    value={settings.bufferMinutes}
                    onChange={(e) => setSettings({ ...settings, bufferMinutes: Number(e.target.value) })}
                    className="mt-1 w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-sm"
                  />
                  <p className="text-xs text-zinc-500 mt-1">Pads time slots before/after meetings to prevent back-to-back overlaps.</p>
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-700 uppercase">Minimum Advance Notice (Hours)</label>
                  <input
                    type="number"
                    min="0"
                    max="72"
                    value={settings.minNoticeHours}
                    onChange={(e) => setSettings({ ...settings, minNoticeHours: Number(e.target.value) })}
                    className="mt-1 w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-sm"
                  />
                  <p className="text-xs text-zinc-500 mt-1">Prevents last-minute bookings (e.g. requires 2 hours notice).</p>
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-700 uppercase">Maximum Booking Horizon (Days)</label>
                  <input
                    type="number"
                    min="1"
                    max="365"
                    value={settings.maxAdvanceDays}
                    onChange={(e) => setSettings({ ...settings, maxAdvanceDays: Number(e.target.value) })}
                    className="mt-1 w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-sm"
                  />
                  <p className="text-xs text-zinc-500 mt-1">Limits how far in advance visitors can book (e.g. up to 30 days ahead).</p>
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-700 uppercase">Maximum Daily Bookings Cap</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={settings.maxDailyBookings}
                    onChange={(e) => setSettings({ ...settings, maxDailyBookings: Number(e.target.value) })}
                    className="mt-1 w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-sm"
                  />
                  <p className="text-xs text-zinc-500 mt-1">Caps total bookings per day to protect staff bandwidth.</p>
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-700 uppercase">Slot Duration / Interval (Minutes)</label>
                  <select
                    value={settings.slotIntervalMinutes}
                    onChange={(e) => setSettings({ ...settings, slotIntervalMinutes: Number(e.target.value) })}
                    className="mt-1 w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-sm cursor-pointer"
                  >
                    <option value={15}>15 minutes</option>
                    <option value={30}>30 minutes</option>
                    <option value={45}>45 minutes</option>
                    <option value={60}>60 minutes (1 hour)</option>
                  </select>
                  <p className="text-xs text-zinc-500 mt-1">Time slot step granularity displayed in widget calendar.</p>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition cursor-pointer"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  <span>Save Scheduling Rules</span>
                </button>
              </div>
            </form>
          )}
        </>
      )}
    </div>
  );
}
