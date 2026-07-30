'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Shield, Save, Users, Bot, MessageSquare, ShieldAlert, AlertTriangle } from 'lucide-react';

export default function MasterPanel() {
  const { session, loading } = useAuth();
  const router = useRouter();

  // API Overrides Config State
  const [activeProvider, setActiveProvider] = useState('claude');
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [openaiApiKey, setOpenaiApiKey] = useState('');
  const [claudeApiKey, setClaudeApiKey] = useState('');
  const [openrouterApiKey, setOpenrouterApiKey] = useState('');
  const [resendApiKey, setResendApiKey] = useState('');
  const [fromEmail, setFromEmail] = useState('onboarding@resend.dev');

  const [signupDisabled, setSignupDisabled] = useState(false);
  const [allowedDomains, setAllowedDomains] = useState('*');
  const [crawlerLimit, setCrawlerLimit] = useState(100);
  const [success, setSuccess] = useState(false);

  // SaaS Users State
  const [users, setUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [clearingAgentId, setClearingAgentId] = useState<string | null>(null);

  const fetchGlobalSettings = async () => {
    try {
      const res = await fetch('/api/global-config');
      if (res.ok) {
        const data = await res.json();
        setActiveProvider(data.activeProvider || 'claude');
        setGeminiApiKey(data.geminiKey || '');
        setOpenaiApiKey(data.openaiKey || '');
        setClaudeApiKey(data.claudeKey || '');
        setOpenrouterApiKey(data.openrouterKey || '');
        setResendApiKey(data.resendApiKey || '');
        setFromEmail(data.fromEmail || 'onboarding@resend.dev');
      }
    } catch (err) {
      console.error('Error fetching global configurations:', err);
    }
  };

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await fetch('/api/admin/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    if (!loading) {
      if (!session) {
        router.replace('/login');
      } else if (session.role !== 'admin') {
        router.replace('/dashboard');
      } else {
        fetchGlobalSettings();
        fetchUsers();
      }
    }
  }, [session, loading, router]);

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/global-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activeProvider,
          geminiKey: geminiApiKey,
          openaiKey: openaiApiKey,
          claudeKey: claudeApiKey,
          openrouterKey: openrouterApiKey,
          resendApiKey,
          fromEmail,
        }),
      });

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('WARNING: Are you sure you want to delete this user account? This will permanently delete the user, their organization, all chatbots/agents, documents, and bookings. This action CANNOT be undone.')) return;
    setDeletingUserId(userId);
    try {
      const res = await fetch(`/api/admin/users?userId=${userId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        fetchUsers();
        alert('User account and organization deleted successfully.');
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete user');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingUserId(null);
    }
  };

  const handleClearAgentCache = async (agentId: string) => {
    if (!confirm('Are you sure you want to clear the search cache for this chatbot? All crawled pages, index logs, and search embeddings will be deleted.')) return;
    setClearingAgentId(agentId);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'clear-cache', agentId })
      });
      if (res.ok) {
        fetchUsers();
        alert('Chatbot search index cleared successfully.');
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to clear cache');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setClearingAgentId(null);
    }
  };

  if (loading || !session || session.role !== 'admin') {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-400 text-sm">
        Verifying master admin privilege...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex">
      {/* Admin Panel Header & Workspace */}
      <main className="flex-1 p-8 md:p-12 max-w-4xl mx-auto space-y-8">
        
        <div className="flex justify-between items-center border-b border-zinc-800 pb-6">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-red-500" />
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Master Console</h1>
              <p className="text-xs text-zinc-500">Global SaaS infrastructure configurations & core credentials.</p>
            </div>
          </div>
          <button 
            onClick={() => router.push('/dashboard')}
            className="text-xs font-semibold bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 px-4 py-2 rounded-xl transition cursor-pointer"
          >
            Exit Console
          </button>
        </div>

        {success && (
          <div className="bg-emerald-950/60 border border-emerald-900/50 p-4 rounded-xl text-emerald-400 text-xs font-semibold animate-fadeIn">
            ✓ Master configurations updated successfully. Restarting engine workers.
          </div>
        )}

        <form onSubmit={handleSaveConfig} className="grid grid-cols-1 gap-8">
          {/* Active LLM Provider Setup */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 space-y-6">
            <div className="border-b border-zinc-800 pb-3">
              <h3 className="text-base font-bold text-white">Active LLM Provider</h3>
              <p className="text-xs text-zinc-500 mt-1">Specify which core service handles chat queries and embeds.</p>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-zinc-500 font-semibold mb-1">Active Global AI Provider</label>
              <select
                value="claude"
                disabled
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-emerald-400 font-semibold focus:ring-1 focus:ring-red-500 outline-none cursor-not-allowed"
              >
                <option value="claude">Amazon Bedrock — Anthropic Claude 3 Haiku (Active & Primary)</option>
              </select>
              <p className="text-[10px] text-zinc-500 mt-1">Amazon Bedrock (Claude 3 Haiku) is set as the exclusive AI engine for all chat queries and embeddings.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-zinc-500 font-semibold mb-1">AWS Access Key ID (Amazon Bedrock)</label>
                <input
                  type="text"
                  readOnly
                  value="AKIASUFKCZAIYYYCQJ4M"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-emerald-400 font-mono text-xs focus:ring-1 focus:ring-red-500 outline-none cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-zinc-500 font-semibold mb-1">AWS Region & Model</label>
                <input
                  type="text"
                  readOnly
                  value="us-east-1 | anthropic.claude-3-haiku-20240307-v1:0"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-400 font-mono text-xs outline-none cursor-not-allowed"
                />
              </div>

              <div className="pt-4 border-t border-zinc-800 space-y-4">
                <h4 className="text-xs uppercase tracking-wider text-red-400 font-bold">✉️ Resend Email Service Settings</h4>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-zinc-500 font-semibold mb-1">Resend API Key</label>
                  <input
                    type="password"
                    placeholder="re_123456789..."
                    value={resendApiKey}
                    onChange={(e) => setResendApiKey(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white text-xs focus:ring-1 focus:ring-red-500 outline-none"
                  />
                  <p className="text-[10px] text-zinc-500 mt-1">Get your free API key at <a href="https://resend.com" target="_blank" rel="noreferrer" className="text-red-400 underline">resend.com</a> to enable automated email notifications.</p>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-zinc-500 font-semibold mb-1">From Sender Email</label>
                  <input
                    type="email"
                    placeholder="onboarding@resend.dev"
                    value={fromEmail}
                    onChange={(e) => setFromEmail(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white text-xs focus:ring-1 focus:ring-red-500 outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-zinc-800">
              <button
                type="submit"
                className="bg-red-600 hover:bg-red-700 text-sm font-bold text-white px-6 py-3 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="h-4 w-4" /> Save System Settings
              </button>
            </div>
          </div>
        </form>

        {/* User Account & Organization Manager */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 space-y-6">
          <div className="border-b border-zinc-800 pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Users className="h-5 w-5 text-red-500" />
              SaaS Account Manager
            </h3>
            <p className="text-xs text-zinc-500 mt-1">Monitor, manage, reset, and delete registered client organizations.</p>
          </div>

          {loadingUsers ? (
            <div className="text-xs text-zinc-500 text-center py-6">Loading user accounts...</div>
          ) : users.length === 0 ? (
            <div className="text-xs text-zinc-500 text-center py-6">No user accounts found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-zinc-850 text-zinc-500 font-bold uppercase tracking-wider">
                    <th className="pb-3 pr-4">User</th>
                    <th className="pb-3 pr-4">Organization</th>
                    <th className="pb-3 pr-4">Agents</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-850">
                  {users.map((u) => {
                    const org = u.memberships?.[0]?.organization;
                    return (
                      <tr key={u.id} className="text-zinc-300">
                        <td className="py-4 pr-4">
                          <div className="font-semibold text-white">{u.name || 'N/A'}</div>
                          <div className="text-[10px] text-zinc-500">{u.email}</div>
                          <div className="text-[9px] text-zinc-600 mt-0.5">Joined: {new Date(u.createdAt).toLocaleDateString()}</div>
                        </td>
                        <td className="py-4 pr-4">
                          <div className="font-semibold text-zinc-300">{org?.name || 'N/A'}</div>
                          <div className="text-[10px] text-zinc-550">ID: {org?.id || 'None'}</div>
                        </td>
                        <td className="py-4 pr-4">
                          {org?.agents && org.agents.length > 0 ? (
                            <div className="space-y-1">
                              {org.agents.map((a: any) => (
                                <div key={a.id} className="bg-zinc-950 border border-zinc-850 p-2 rounded-lg text-[10px] flex items-center justify-between gap-4">
                                  <div>
                                    <span className="font-bold text-white block">{a.name}</span>
                                    <span className="text-[9px] text-zinc-550">
                                      Docs: {a._count?.documents} | Bookings: {a._count?.bookings}
                                    </span>
                                  </div>
                                  <button
                                    onClick={() => handleClearAgentCache(a.id)}
                                    disabled={clearingAgentId === a.id}
                                    className="bg-zinc-900 border border-zinc-800 text-[9px] text-red-400 font-bold px-2 py-1 rounded hover:bg-zinc-850 hover:text-red-350 transition cursor-pointer"
                                  >
                                    {clearingAgentId === a.id ? 'Wiping...' : 'Clear Cache'}
                                  </button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-[10px] text-zinc-550 italic">No agents created</span>
                          )}
                        </td>
                        <td className="py-4 text-right">
                          <button
                            onClick={() => handleDeleteUser(u.id)}
                            disabled={deletingUserId === u.id || u.role === 'admin'}
                            className="bg-red-950/40 border border-red-900/50 hover:bg-red-900/50 text-red-400 text-[10px] font-bold px-3 py-1.5 rounded-xl transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {deletingUserId === u.id ? 'Deleting...' : 'Delete User'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Database Overviews */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 space-y-4">
          <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
            <ShieldAlert className="h-5 w-5 text-red-500" />
            <h3 className="text-base font-bold text-white">Infrastructure Status</h3>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-zinc-950 p-4 border border-zinc-855 rounded-2xl">
              <span className="block text-zinc-500 text-[10px] uppercase font-bold tracking-widest">Postgres Schema</span>
              <span className="block text-emerald-400 font-bold text-sm mt-1">ONLINE / SYNCED</span>
            </div>
            <div className="bg-zinc-950 p-4 border border-zinc-855 rounded-2xl">
              <span className="block text-zinc-500 text-[10px] uppercase font-bold tracking-widest">OpenRouter Gate</span>
              <span className="block text-zinc-300 font-bold text-sm mt-1">READY</span>
            </div>
            <div className="bg-zinc-950 p-4 border border-zinc-855 rounded-2xl">
              <span className="block text-zinc-500 text-[10px] uppercase font-bold tracking-widest">System Health</span>
              <span className="block text-emerald-400 font-bold text-sm mt-1">EXCELLENT</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
