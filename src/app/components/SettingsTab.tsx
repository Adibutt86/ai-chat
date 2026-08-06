import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/app/context/AuthContext';
import { isMasterAdmin } from '@/lib/permissions';
import { Plus, Shield, Settings as SettingsIcon, Users, Calendar, RefreshCw, ExternalLink } from 'lucide-react';

interface SettingsTabProps {
  agentId: string;
}

export default function SettingsTab({ agentId }: SettingsTabProps) {
  const { session } = useAuth();
  const isMaster = isMasterAdmin(session?.role);
  const [members, setMembers] = useState<any[]>([]);
  const [memberEmail, setMemberEmail] = useState('');
  const [memberRole, setMemberRole] = useState('member');
  const [orgName, setOrgName] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Google Calendar Connection state
  const [calendarLoading, setCalendarLoading] = useState(false);
  const [calendarStatus, setCalendarStatus] = useState<any>(null);

  const fetchCalendarStatus = async () => {
    setCalendarLoading(true);
    try {
      const res = await fetch('/api/calendar/connection');
      if (res.ok) {
        const data = await res.json();
        setCalendarStatus(data);
      }
    } catch (err) {
      console.error('Error fetching calendar status:', err);
    } finally {
      setCalendarLoading(false);
    }
  };

  const handleSelectCalendar = async (calendarId: string) => {
    try {
      const res = await fetch('/api/calendar/connection', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ calendarId }),
      });
      if (res.ok) {
        setSuccessMsg('Google Calendar selection saved.');
        fetchCalendarStatus();
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDisconnectCalendar = async () => {
    if (!confirm('Are you sure you want to disconnect Google Calendar? Double bookings will no longer be checked against it.')) return;
    try {
      const res = await fetch('/api/calendar/connection', {
        method: 'DELETE',
      });
      if (res.ok) {
        setSuccessMsg('Google Calendar disconnected.');
        fetchCalendarStatus();
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSettingsData = async () => {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        setMembers(data.organization?.members || []);
        setOrgName(data.organization?.name || 'My Organization');
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchSettingsData();
    fetchCalendarStatus();
  }, []);

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'invite_member', memberEmail, memberRole }),
      });
      if (res.ok) {
        setMemberEmail('');
        fetchSettingsData();
        setSuccessMsg('Added organization team member');
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-5 max-w-4xl">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">System Settings</h2>
        <p className="text-slate-500 text-xs mt-0.5">Manage enterprise organization details, Google Calendar synchronization, and team membership roles.</p>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 text-xs font-semibold">
          {successMsg}
        </div>
      )}

      {/* Organization Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3.5 shadow-xs">
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2.5">
          <SettingsIcon className="h-4 w-4 text-[#F97316]" />
          <h3 className="text-sm font-bold text-slate-900">Organization Configuration</h3>
        </div>
        <div className="grid grid-cols-2 gap-3.5 text-xs text-slate-700">
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">Company Name</label>
            <input
              type="text"
              value={orgName}
              readOnly
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-700 text-xs focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">Billing Plan</label>
            <input
              type="text"
              value="PRO PLAN ($49/mo)"
              readOnly
              className="w-full bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-1.5 text-emerald-700 font-bold text-xs focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Google Calendar Connection Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3.5 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-[#F97316]" />
            <h3 className="text-sm font-bold text-slate-900">Google Calendar Integration</h3>
          </div>
          {calendarLoading && <RefreshCw className="h-3.5 w-3.5 animate-spin text-slate-400" />}
        </div>
        
        {calendarStatus?.connected ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs">
              <div>
                <p className="font-bold text-emerald-700">Google Calendar Connected</p>
                <p className="text-slate-500 text-[11px] mt-0.5">Real-time availability and double bookings will be synchronized automatically.</p>
              </div>
              <button
                onClick={handleDisconnectCalendar}
                className="bg-white text-rose-600 hover:bg-rose-50 border border-rose-200 px-3 py-1 rounded-md text-xs font-semibold transition cursor-pointer"
              >
                Disconnect
              </button>
            </div>

            <div className="max-w-xs text-xs">
              <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">Select Active Calendar</label>
              <select
                value={calendarStatus.selectedCalendarId || 'primary'}
                onChange={(e) => handleSelectCalendar(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#F97316] text-xs cursor-pointer"
              >
                {calendarStatus.calendars?.map((cal: any) => (
                  <option key={cal.id} value={cal.id}>
                    {cal.summary} {cal.primary ? '(Primary)' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-slate-500">Synchronize your appointment slots with your Google Calendar to prevent double bookings automatically.</p>
            <a
              href="/api/auth/google"
              className="inline-flex items-center gap-2 bg-[#F97316] hover:bg-[#ea580c] text-white border border-slate-900 shadow-xs px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all"
            >
              Connect Google Calendar
            </a>
          </div>
        )}
      </div>

      {/* Team Invitation & Active Members */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between shadow-xs">
          <div className="space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2.5">
              <Users className="h-4 w-4 text-[#F97316]" />
              <h3 className="text-sm font-bold text-slate-900">Add Team Members</h3>
            </div>
            <form onSubmit={handleInviteMember} className="space-y-3 text-xs text-slate-700">
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="colleague@company.com"
                  value={memberEmail}
                  onChange={(e) => setMemberEmail(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#F97316]"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">Permission Role</label>
                <select
                  value={memberRole}
                  onChange={(e) => setMemberRole(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#F97316] cursor-pointer"
                >
                  <option value="admin">Administrator</option>
                  <option value="member">Standard Member</option>
                </select>
              </div>
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-1.5 bg-[#F97316] hover:bg-[#ea580c] text-white font-semibold border border-slate-900 shadow-xs rounded-lg px-3.5 py-1.5 text-xs transition-all cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" /> Add Team Member
              </button>
            </form>
          </div>
        </div>

        {/* Team Members List */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2.5">
              <Shield className="h-4 w-4 text-[#F97316]" />
              <h3 className="text-sm font-bold text-slate-900">Active Members</h3>
            </div>
            <div className="mt-3 space-y-2 overflow-y-auto max-h-[200px] pr-1">
              {members.map((m: any) => (
                <div key={m.id} className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex justify-between items-center text-xs">
                  <div>
                    <p className="font-semibold text-slate-800">{m.user.name || m.user.email}</p>
                    <p className="text-slate-400 text-[10px] mt-0.5">{m.user.email}</p>
                  </div>
                  <span className="bg-white border border-slate-200 text-[10px] px-2 py-0.5 rounded-full text-slate-600 font-mono capitalize">
                    {m.role}
                  </span>
                </div>
              ))}
            </div>
            {isMaster && (
              <div className="pt-3 mt-3 border-t border-slate-200">
                <Link
                  href="/master-panel"
                  className="flex items-center justify-center gap-1.5 bg-[#1E3A8A] hover:bg-[#152a65] text-white font-bold rounded-lg px-3 py-2 text-xs transition-all shadow-xs"
                >
                  <ExternalLink className="h-3.5 w-3.5 text-[#F97316]" />
                  <span>Open Master Control Panel (Manage All System Users)</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

