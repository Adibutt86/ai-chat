'use client';

import React, { useState, useEffect } from 'react';
import { Key, Plus, Trash2, Shield, Settings as SettingsIcon, Users, ToggleLeft, Grid, Calendar, RefreshCw } from 'lucide-react';

interface SettingsTabProps {
  agentId: string;
}

export default function SettingsTab({ agentId }: SettingsTabProps) {
  const [keys, setKeys] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [keyName, setKeyName] = useState('');
  const [memberEmail, setMemberEmail] = useState('');
  const [memberRole, setMemberRole] = useState('member');
  const [orgName, setOrgName] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Google Calendar Connection state
  const [calendarLoading, setCalendarLoading] = useState(false);
  const [calendarStatus, setCalendarStatus] = useState<any>(null);

  // Plugins list state
  const [plugins, setPlugins] = useState<any[]>([
    { id: 'slack', name: 'Slack Notifications', desc: 'Alert channels when buying intent is captured.', active: true },
    { id: 'zapier', name: 'Zapier Integration', desc: 'Sync conversations and metadata into CRM tools.', active: false },
    { id: 'hubspot', name: 'HubSpot Sync', desc: 'Automatically map captured leads to HubSpot tables.', active: false }
  ]);

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
        setKeys(data.apiKeys || []);
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

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create_key', keyName }),
      });
      if (res.ok) {
        setKeyName('');
        fetchSettingsData();
        setSuccessMsg('Created new API access key');
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

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

  const handleDeleteKey = async (keyId: string) => {
    try {
      const res = await fetch(`/api/settings?keyId=${keyId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchSettingsData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const togglePlugin = (pluginId: string) => {
    setPlugins((prev: any[]) =>
      prev.map((p: any) => (p.id === pluginId ? { ...p, active: !p.active } : p))
    );
    setSuccessMsg('Plugins updated successfully.');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h2 className="text-2xl font-bold text-zinc-900">System Settings</h2>
        <p className="text-zinc-550 text-sm">Manage enterprise organization details, API access keys, and team membership roles.</p>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-600 text-sm">
          {successMsg}
        </div>
      )}

      {/* Organization Card */}
      <div className="bg-white border border-zinc-200 rounded-2xl p-6 space-y-4 shadow-sm">
        <div className="flex items-center gap-2 border-b border-zinc-200 pb-3">
          <SettingsIcon className="h-5 w-5 text-blue-600" />
          <h3 className="text-base font-bold text-zinc-900">Organization Configuration</h3>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm text-zinc-700">
          <div>
            <label className="block text-xs uppercase tracking-wider text-zinc-500 font-semibold mb-1">Company Name</label>
            <input
              type="text"
              value={orgName}
              readOnly
              className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-zinc-600 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider text-zinc-500 font-semibold mb-1">Billing Plan</label>
            <input
              type="text"
              value="PRO PLAN ($49/mo)"
              readOnly
              className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-emerald-600 font-semibold focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Google Calendar Connection Card */}
      <div className="bg-white border border-zinc-200 rounded-2xl p-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            <h3 className="text-base font-bold text-zinc-900">Google Calendar Integration</h3>
          </div>
          {calendarLoading && <RefreshCw className="h-4 w-4 animate-spin text-zinc-400" />}
        </div>
        
        {calendarStatus?.connected ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-sm">
              <div>
                <p className="font-semibold text-emerald-600">Google Calendar Connected</p>
                <p className="text-zinc-500 text-xs mt-0.5">Real-time availability and double bookings will be synchronized automatically.</p>
              </div>
              <button
                onClick={handleDisconnectCalendar}
                className="bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer"
              >
                Disconnect
              </button>
            </div>

            <div className="max-w-xs text-sm">
              <label className="block text-xs uppercase tracking-wider text-zinc-500 font-semibold mb-1.5">Select Active Calendar</label>
              <select
                value={calendarStatus.selectedCalendarId || 'primary'}
                onChange={(e) => handleSelectCalendar(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-zinc-900 focus:outline-none focus:ring-1 focus:ring-blue-600 text-sm cursor-pointer"
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
          <div className="space-y-4">
            <p className="text-sm text-zinc-550">Synchronize your appointment slots with your Google Calendar to prevent double bookings automatically.</p>
            <a
              href="/api/auth/google"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition"
            >
              Connect Google Calendar
            </a>
          </div>
        )}
      </div>

      {/* Plugins Manager Option block */}
      <div className="bg-white border border-zinc-200 rounded-2xl p-6 space-y-4 shadow-sm">
        <div className="flex items-center gap-2 border-b border-zinc-200 pb-3">
          <Grid className="h-5 w-5 text-blue-600" />
          <h3 className="text-base font-bold text-zinc-900">Integrations & Plugins</h3>
        </div>
        <p className="text-xs text-zinc-500">Toggle SaaS ecosystem triggers and data sync webhooks.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {plugins.map((plugin: any) => (
            <div key={plugin.id} className="p-4 bg-zinc-50 border border-zinc-200 rounded-xl flex flex-col justify-between hover:border-zinc-350 transition">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-zinc-850">{plugin.name}</span>
                  <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                    plugin.active 
                      ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' 
                      : 'bg-zinc-100 text-zinc-500 border border-zinc-200'
                  }`}>
                    {plugin.active ? 'Active' : 'Disabled'}
                  </span>
                </div>
                <p className="text-[10.5px] text-zinc-500 leading-normal mb-4">{plugin.desc}</p>
              </div>
              <button
                onClick={() => togglePlugin(plugin.id)}
                className={`w-full py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  plugin.active 
                    ? 'bg-white hover:bg-zinc-100 border border-zinc-250 text-zinc-700' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {plugin.active ? 'Disable Plugin' : 'Enable Plugin'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Team Invitation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-zinc-200 rounded-2xl p-6 flex flex-col justify-between shadow-sm">
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-zinc-200 pb-3">
              <Users className="h-5 w-5 text-blue-600" />
              <h3 className="text-base font-bold text-zinc-900">Add Team Members</h3>
            </div>
            <form onSubmit={handleInviteMember} className="space-y-3 text-sm text-zinc-750">
              <div>
                <label className="block text-xs uppercase tracking-wider text-zinc-500 font-semibold mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="colleague@company.com"
                  value={memberEmail}
                  onChange={(e) => setMemberEmail(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-zinc-900 placeholder-zinc-400 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-zinc-500 font-semibold mb-1">Permission Role</label>
                <select
                  value={memberRole}
                  onChange={(e) => setMemberRole(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-zinc-900 focus:outline-none cursor-pointer"
                >
                  <option value="admin">Administrator</option>
                  <option value="member">Standard Member</option>
                </select>
              </div>
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-white font-semibold cursor-pointer transition"
              >
                <Plus className="h-4 w-4" /> Add Team Member
              </button>
            </form>
          </div>
        </div>

        {/* Team Members List */}
        <div className="bg-white border border-zinc-200 rounded-2xl p-6 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center gap-2 border-b border-zinc-200 pb-3">
              <Shield className="h-5 w-5 text-blue-600" />
              <h3 className="text-base font-bold text-zinc-900">Active Members</h3>
            </div>
            <div className="mt-4 space-y-3 overflow-y-auto max-h-[200px] pr-1">
              {members.map((m: any) => (
                <div key={m.id} className="p-3 bg-zinc-50 border border-zinc-200 rounded-lg flex justify-between items-center text-xs">
                  <div>
                    <p className="font-semibold text-zinc-800">{m.user.name || m.user.email}</p>
                    <p className="text-zinc-500 mt-0.5">{m.user.email}</p>
                  </div>
                  <span className="bg-white border border-zinc-200 text-[10px] px-2 py-0.5 rounded-full text-zinc-500 font-mono capitalize">
                    {m.role}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Developer API Keys */}
      <div className="bg-white border border-zinc-200 rounded-2xl p-6 space-y-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
          <div className="flex items-center gap-2">
            <Key className="h-5 w-5 text-blue-600" />
            <h3 className="text-base font-bold text-zinc-900">Developer API Keys</h3>
          </div>
        </div>

        <form onSubmit={handleCreateKey} className="flex gap-3 text-sm">
          <input
            type="text"
            placeholder="Key Description (e.g. Production client)"
            value={keyName}
            onChange={(e) => setKeyName(e.target.value)}
            className="flex-1 bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-zinc-900 placeholder-zinc-400 focus:outline-none"
            required
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-white font-semibold flex items-center gap-1.5 cursor-pointer transition"
          >
            <Plus className="h-4 w-4" /> Generate Key
          </button>
        </form>

        <div className="space-y-2">
          {keys.length === 0 ? (
            <p className="text-xs text-zinc-550 italic">No developer keys active.</p>
          ) : (
            keys.map((k: any) => (
              <div key={k.id} className="p-3 bg-zinc-50 border border-zinc-200 rounded-lg flex justify-between items-center text-xs">
                <div>
                  <p className="font-semibold text-zinc-800">{k.name}</p>
                  <p className="font-mono text-blue-600 mt-1 text-[11px] select-all">{k.key}</p>
                </div>
                <button
                  onClick={() => handleDeleteKey(k.id)}
                  className="p-1.5 hover:bg-red-50 text-red-650 rounded-lg transition cursor-pointer"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
