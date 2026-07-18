'use client';

import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Check, 
  AlertCircle,
  Loader2,
  Globe
} from 'lucide-react';

interface BusinessHour {
  id: string;
  dayOfWeek: number;
  isEnabled: boolean;
  startTime: string;
  endTime: string;
  timezone: string;
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
  const [hours, setHours] = useState<BusinessHour[]>([]);
  const [timezone, setTimezone] = useState('UTC');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchHours();
  }, []);

  const fetchHours = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/business-hours');
      if (res.ok) {
        const data = await res.json();
        setHours(data);
        if (data.length > 0) {
          setTimezone(data[0].timezone);
        }
        setError(null);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to load business hours');
      }
    } catch {
      setError('Connection failed. Please check API settings.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleDay = (id: string) => {
    setHours(prev => prev.map(h => h.id === id ? { ...h, isEnabled: !h.isEnabled } : h));
  };

  const handleTimeChange = (id: string, field: 'startTime' | 'endTime', value: string) => {
    setHours(prev => prev.map(h => h.id === id ? { ...h, [field]: value } : h));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    setError(null);
    try {
      const res = await fetch('/api/business-hours', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hours, timezone }),
      });
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
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

  // Sort hours to display Monday first (1-6, then 0)
  const sortedHours = [...hours].sort((a, b) => {
    const dayA = a.dayOfWeek === 0 ? 7 : a.dayOfWeek;
    const dayB = b.dayOfWeek === 0 ? 7 : b.dayOfWeek;
    return dayA - dayB;
  });

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-2xl font-bold text-zinc-900">Business Hours</h2>
        <p className="text-zinc-550 text-sm">Configure your weekly availability and timezone for appointment scheduling.</p>
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
          <span>Business hours updated successfully!</span>
        </div>
      )}

      {loading ? (
        <div className="flex py-12 justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-6">
          {/* Timezone Section */}
          <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-zinc-800 mb-4 uppercase tracking-wider flex items-center gap-2">
              <Globe className="h-4 w-4 text-blue-600" /> Timezone Setup
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
              <p className="text-xs text-zinc-500 mt-2">All availability will be evaluated and filtered in this timezone.</p>
            </div>
          </div>

          {/* Weekly Schedule Section */}
          <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-6 border-b border-zinc-200 bg-zinc-50/50">
              <h3 className="text-sm font-semibold text-zinc-800 uppercase tracking-wider flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-600" /> Weekly Availability
              </h3>
            </div>
            
            <div className="divide-y divide-zinc-150 px-6 bg-white">
              {sortedHours.map((h) => {
                const label = WEEKDAYS.find(w => w.value === h.dayOfWeek)?.label || '';
                return (
                  <div key={h.id} className="py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    {/* Toggle and Day Name */}
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

                    {/* Start and End Times */}
                    <div className="flex items-center gap-3">
                      {h.isEnabled ? (
                        <>
                          <input
                            type="time"
                            value={h.startTime}
                            onChange={(e) => handleTimeChange(h.id, 'startTime', e.target.value)}
                            className="bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-1.5 text-zinc-900 focus:outline-none focus:ring-1 focus:ring-blue-600 text-sm cursor-pointer"
                          />
                          <span className="text-zinc-500 text-sm">to</span>
                          <input
                            type="time"
                            value={h.endTime}
                            onChange={(e) => handleTimeChange(h.id, 'endTime', e.target.value)}
                            className="bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-1.5 text-zinc-900 focus:outline-none focus:ring-1 focus:ring-blue-600 text-sm cursor-pointer"
                          />
                        </>
                      ) : (
                        <span className="text-sm text-zinc-400 italic">Closed / Unavailable</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-6 bg-zinc-50/50 border-t border-zinc-200 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition cursor-pointer"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                <span>Save Availability</span>
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
