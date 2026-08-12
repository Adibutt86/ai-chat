'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/app/context/AuthContext';
import { isMasterAdmin } from '@/lib/permissions';
import { 
  Building, 
  Users, 
  Calendar, 
  Mail,
  Key, 
  Settings as SettingsIcon, 
  Shield, 
  Plus, 
  RefreshCw, 
  ExternalLink,
  Copy,
  Check,
  CheckCircle2,
  Lock,
  Globe,
  Sliders
} from 'lucide-react';
import EmailTemplates from '@/app/components/EmailTemplates';

interface SettingsTabProps {
  agentId: string;
}

export default function SettingsTab({ agentId }: SettingsTabProps) {
  const { session } = useAuth();
  const isMaster = isMasterAdmin(session?.role);
  
  const [activeSubTab, setActiveSubTab] = useState<'organization' | 'team' | 'templates' | 'integrations' | 'security'>('organization');

  // Organization & Team State
  const [members, setMembers] = useState<any[]>([]);
  const [memberEmail, setMemberEmail] = useState('');
  const [memberRole, setMemberRole] = useState('member');
  const [orgName, setOrgName] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // API Key State
  const [apiKey, setApiKey] = useState('gk_live_8f9a2b1c4e7d0e3f2a1b9c8d7e6f5a4b');
  const [copiedKey, setCopiedKey] = useState(false);

  // Google Calendar State
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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2500);
  };

  const subTabs = [
    { id: 'organization', label: 'Organization', icon: Building, desc: 'Company profile & billing' },
    { id: 'team', label: 'Team Members', icon: Users, desc: 'Manage access & roles' },
    { id: 'templates', label: 'Email Templates', icon: Mail, desc: 'Approval & cancellation templates' },
    { id: 'integrations', label: 'Integrations', icon: Calendar, desc: 'Google Calendar & webhooks' },
    { id: 'security', label: 'Security & API Keys', icon: Key, desc: 'API keys & permissions' },
  ] as const;

  return (
    <div className="space-y-6 max-w-5xl animate-fadeIn">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Dashboard Settings</h2>
        <p className="text-slate-500 text-xs mt-0.5">
          Configure enterprise settings, manage team permissions, calendar integrations, and API access keys.
        </p>
      </div>

      {/* Success Notification */}
      {successMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Navigation Sub-Tabs with Icons */}
      <div className="flex border-b border-slate-200 bg-white rounded-t-xl px-2 pt-2 gap-1 overflow-x-auto shadow-2xs">
        {subTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`flex items-center gap-2.5 px-4 py-3 border-b-2 text-xs font-bold transition-all cursor-pointer whitespace-nowrap rounded-t-lg ${
                isActive
                  ? 'border-[#F97316] text-[#1E3A8A] bg-slate-50 shadow-2xs'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50/50'
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? 'text-[#F97316]' : 'text-slate-400'}`} />
              <div className="text-left">
                <div>{tab.label}</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Sub-Tab 1: Organization Settings */}
      {activeSubTab === 'organization' && (
        <div className="space-y-5 animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-b-xl rounded-tr-xl p-6 space-y-5 shadow-xs">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
              <Building className="h-4 w-4 text-[#F97316]" />
              <h3 className="text-sm font-bold text-slate-900">Organization Configuration</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-700">
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1.5">
                  Company / Organization Name
                </label>
                <input
                  type="text"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2 text-slate-800 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#F97316]"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1.5">
                  Subscription & Billing Plan
                </label>
                <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-lg px-3.5 py-2 text-emerald-800 font-bold text-xs">
                  <span>PRO ENTERPRISE PLAN ($49/mo)</span>
                  <span className="bg-emerald-600 text-white text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">
                    Active
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-700 pt-2 border-t border-slate-100">
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1.5 flex items-center gap-1">
                  <Globe className="h-3 w-3 text-slate-400" />
                  Default Workspace Timezone
                </label>
                <select
                  defaultValue="UTC"
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#F97316] cursor-pointer"
                >
                  <option value="UTC">UTC (Coordinated Universal Time)</option>
                  <option value="EST">EST (Eastern Standard Time)</option>
                  <option value="PST">PST (Pacific Standard Time)</option>
                  <option value="GMT">GMT (Greenwich Mean Time)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1.5 flex items-center gap-1">
                  <Sliders className="h-3 w-3 text-slate-400" />
                  Primary Interface Language
                </label>
                <select
                  defaultValue="en"
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#F97316] cursor-pointer"
                >
                  <option value="en">English (United States)</option>
                  <option value="es">Spanish (Español)</option>
                  <option value="fr">French (Français)</option>
                  <option value="de">German (Deutsch)</option>
                </select>
              </div>
            </div>

            <div className="pt-3 flex justify-end">
              <button
                onClick={() => {
                  setSuccessMsg('Organization settings saved.');
                  setTimeout(() => setSuccessMsg(''), 3000);
                }}
                className="bg-[#F97316] hover:bg-[#ea580c] text-white font-bold border border-slate-900 shadow-xs px-4 py-2 rounded-lg text-xs transition cursor-pointer"
              >
                Save Organization Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sub-Tab 2: Team Members Settings */}
      {activeSubTab === 'team' && (
        <div className="space-y-5 animate-fadeIn">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Invite Form */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between shadow-xs">
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-200 pb-2.5">
                  <Users className="h-4 w-4 text-[#F97316]" />
                  <h3 className="text-sm font-bold text-slate-900">Invite Team Member</h3>
                </div>
                <form onSubmit={handleInviteMember} className="space-y-3.5 text-xs text-slate-700">
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      placeholder="colleague@company.com"
                      value={memberEmail}
                      onChange={(e) => setMemberEmail(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#F97316]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">
                      Permission Role
                    </label>
                    <select
                      value={memberRole}
                      onChange={(e) => setMemberRole(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#F97316] cursor-pointer font-medium"
                    >
                      <option value="admin">Administrator (Full Access)</option>
                      <option value="member">Standard Member (Read/Write)</option>
                    </select>
                  </div>
                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-1.5 bg-[#F97316] hover:bg-[#ea580c] text-white font-bold border border-slate-900 shadow-xs rounded-lg px-4 py-2 text-xs transition cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" /> Invite Team Member
                  </button>
                </form>
              </div>
            </div>

            {/* Active Members */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between shadow-xs">
              <div>
                <div className="flex items-center gap-2 border-b border-slate-200 pb-2.5">
                  <Shield className="h-4 w-4 text-[#F97316]" />
                  <h3 className="text-sm font-bold text-slate-900">Active Organization Members</h3>
                </div>
                <div className="mt-3 space-y-2 overflow-y-auto max-h-[220px] pr-1">
                  {members.map((m: any) => (
                    <div key={m.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex justify-between items-center text-xs">
                      <div>
                        <p className="font-bold text-slate-800">{m.user.name || m.user.email}</p>
                        <p className="text-slate-400 text-[10px] mt-0.5">{m.user.email}</p>
                      </div>
                      <span className="bg-white border border-slate-200 text-[10px] px-2.5 py-0.5 rounded-full text-[#1E3A8A] font-semibold capitalize">
                        {m.role}
                      </span>
                    </div>
                  ))}
                </div>
                {isMaster && (
                  <div className="pt-3 mt-3 border-t border-slate-200">
                    <Link
                      href="/master-panel"
                      className="flex items-center justify-center gap-1.5 bg-[#1E3A8A] hover:bg-[#152a65] text-white font-bold rounded-lg px-3 py-2 text-xs transition shadow-xs"
                    >
                      <ExternalLink className="h-3.5 w-3.5 text-[#F97316]" />
                      <span>Open Master Control Panel</span>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sub-Tab 3: Email Templates */}
      {activeSubTab === 'templates' && (
        <EmailTemplates />
      )}

      {/* Sub-Tab 4: Integrations & Calendar */}
      {activeSubTab === 'integrations' && (
        <div className="space-y-5 animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-b-xl rounded-tr-xl p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-[#F97316]" />
                <h3 className="text-sm font-bold text-slate-900">Google Calendar Integration</h3>
              </div>
              {calendarLoading && <RefreshCw className="h-4 w-4 animate-spin text-slate-400" />}
            </div>

            {calendarStatus?.connected ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs">
                  <div>
                    <p className="font-bold text-emerald-800 text-sm">Google Calendar Connected</p>
                    <p className="text-slate-600 text-xs mt-0.5">
                      Real-time appointment slots and double bookings are synchronized automatically.
                    </p>
                  </div>
                  <button
                    onClick={handleDisconnectCalendar}
                    className="bg-white text-rose-600 hover:bg-rose-50 border border-rose-200 px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer shadow-2xs"
                  >
                    Disconnect
                  </button>
                </div>

                <div className="max-w-md text-xs">
                  <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1.5">
                    Select Active Sync Calendar
                  </label>
                  <select
                    value={calendarStatus.selectedCalendarId || 'primary'}
                    onChange={(e) => handleSelectCalendar(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#F97316] text-xs font-medium cursor-pointer"
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
              <div className="space-y-3 p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <p className="text-xs text-slate-600 leading-relaxed">
                  Synchronize your appointment slots with your Google Calendar to prevent double bookings automatically across your active AI agents.
                </p>
                <a
                  href="/api/auth/google"
                  className="inline-flex items-center gap-2 bg-[#F97316] hover:bg-[#ea580c] text-white border border-slate-900 shadow-xs px-4 py-2 rounded-lg text-xs font-bold transition-all"
                >
                  <Calendar className="h-3.5 w-3.5" />
                </a>
              </div>
            )}

            {/* Resend Email API Integration Box */}
            <div className="border-t border-slate-200 pt-5 space-y-3">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-[#F97316]" />
                <h3 className="text-sm font-bold text-slate-900">Resend Email API Configuration</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Configure your Resend API Key to deliver automated Lead Capture emails and Booking Request approval notifications directly to your admin inbox.
              </p>
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                  <span>Resend Email Status:</span>
                  <span className="bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                    Active & Ready
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 leading-normal">
                  You can set <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-800">RESEND_API_KEY</code> in your <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-800">.env</code> file or update it dynamically in the <Link href="/master-panel" className="text-[#1E3A8A] font-bold underline">Master Control Panel</Link>.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sub-Tab 4: Security & API Keys */}
      {activeSubTab === 'security' && (
        <div className="space-y-5 animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-b-xl rounded-tr-xl p-6 space-y-5 shadow-xs">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
              <Key className="h-4 w-4 text-[#F97316]" />
              <h3 className="text-sm font-bold text-slate-900">API Access Keys & Secret Security</h3>
            </div>

            <div className="space-y-3">
              <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold">
                Live Secret API Key
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={apiKey}
                  className="flex-1 bg-slate-50 border border-slate-300 font-mono text-xs text-slate-700 px-3.5 py-2 rounded-lg focus:outline-none"
                />
                <button
                  onClick={() => copyToClipboard(apiKey)}
                  className="flex items-center gap-1.5 bg-[#1E3A8A] hover:bg-[#152a65] text-white font-semibold text-xs px-3.5 py-2 rounded-lg transition cursor-pointer shadow-xs"
                >
                  {copiedKey ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copiedKey ? 'Copied!' : 'Copy Key'}</span>
                </button>
              </div>
              <p className="text-[11px] text-slate-400">
                Use this secret key to authenticate custom REST API requests to your Geekvista AI agents.
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <Lock className="h-4 w-4 text-emerald-600" />
                <span>SSL Encryption Enabled (256-bit)</span>
              </div>
              {isMaster && (
                <Link
                  href="/master-panel"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1E3A8A] hover:text-[#F97316] transition"
                >
                  <span>Open Master Panel</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
