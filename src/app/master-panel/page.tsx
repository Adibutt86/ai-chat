'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Shield, Save, Users, Bot, MessageSquare, ShieldAlert, AlertTriangle, BookOpen, ArrowLeft, Loader2, RefreshCw } from 'lucide-react';

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

  const handleTrainAgent = (agentId: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('selected_agent_id', agentId);
      localStorage.setItem('dashboard_active_tab', 'training');
    }
    router.push(`/dashboard?agentId=${agentId}&tab=training`);
  };

  if (loading || !session || session.role !== 'admin') {
    return (
      <div 
        className="min-h-screen bg-[#F8FAFC] flex items-center justify-center text-slate-500"
        style={{ fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}
      >
        <div className="text-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-[#F97316]" />
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-600">Verifying Master Admin Security Clearance...</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans p-6 md:p-10"
      style={{ fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}
    >
      <main className="max-w-6xl mx-auto space-y-6">
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 p-5 rounded-xl shadow-xs">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-[#F97316] text-white border border-slate-900 rounded-lg flex items-center justify-center font-bold shadow-xs">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">Master Control Panel</h1>
                <span className="bg-[#F97316] text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">Master</span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">Superadmin system configuration, global API keys, and client user manager.</p>
            </div>
          </div>
          <button 
            onClick={() => router.push('/dashboard')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold bg-[#1E3A8A] hover:bg-[#152a65] text-white px-4 py-2 rounded-lg transition cursor-pointer shadow-xs"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Return to Dashboard</span>
          </button>
        </div>

        {success && (
          <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2 shadow-xs">
            <span>✓</span>
            <span>Master configurations saved successfully! Global model keys updated.</span>
          </div>
        )}

        {/* Global LLM Provider & System Settings Form */}
        <form onSubmit={handleSaveConfig} className="bg-white border border-slate-200 rounded-xl p-6 space-y-6 shadow-xs">
          <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Save className="h-4 w-4 text-[#F97316]" />
                Global AI Model & Email Service Credentials
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Specify primary fallback API keys for chat queries, embeddings, and notification emails.</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-slate-600 font-bold mb-2">Active Core LLM Provider Engine</label>
              <select
                value={activeProvider}
                onChange={(e) => setActiveProvider(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#F97316] shadow-xs"
              >
                <option value="claude">Anthropic Claude API (Recommended / Active)</option>
                <option value="gemini">Google Gemini 2.5 Flash</option>
                <option value="openai">OpenAI GPT-4o</option>
                <option value="openrouter">OpenRouter Gateway</option>
              </select>
              <p className="text-[11px] text-slate-500 mt-1">Selects the default engine for handling all query completions and RAG searches across client agents.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs uppercase tracking-wider text-slate-600 font-semibold mb-1">Anthropic Claude API Key</label>
                <input
                  type="password"
                  value={claudeApiKey}
                  onChange={(e) => setClaudeApiKey(e.target.value)}
                  placeholder="sk-ant-api..."
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#F97316]"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-slate-600 font-semibold mb-1">Google Gemini API Key</label>
                <input
                  type="password"
                  value={geminiApiKey}
                  onChange={(e) => setGeminiApiKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#F97316]"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-slate-600 font-semibold mb-1">OpenAI API Key</label>
                <input
                  type="password"
                  value={openaiApiKey}
                  onChange={(e) => setOpenaiApiKey(e.target.value)}
                  placeholder="sk-proj-..."
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#F97316]"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-slate-600 font-semibold mb-1">OpenRouter Gateway Key</label>
                <input
                  type="password"
                  value={openrouterApiKey}
                  onChange={(e) => setOpenrouterApiKey(e.target.value)}
                  placeholder="sk-or-v1-..."
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#F97316]"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 space-y-4">
              <h4 className="text-xs uppercase tracking-wider text-[#1E3A8A] font-bold">✉️ Resend Automated Email Dispatcher</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-slate-600 font-semibold mb-1">Resend API Key</label>
                  <input
                    type="password"
                    placeholder="re_123456789..."
                    value={resendApiKey}
                    onChange={(e) => setResendApiKey(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#F97316]"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-slate-600 font-semibold mb-1">From Sender Email</label>
                  <input
                    type="email"
                    placeholder="onboarding@resend.dev"
                    value={fromEmail}
                    onChange={(e) => setFromEmail(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#F97316]"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 flex justify-end">
            <button
              type="submit"
              className="bg-[#F97316] hover:bg-[#ea580c] text-white font-semibold border border-slate-900 shadow-xs rounded-lg px-4 py-2 text-xs transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Save className="h-3.5 w-3.5" />
              <span>Save System Settings</span>
            </button>
          </div>
        </form>

        {/* User Account & Organization Manager */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-5 shadow-xs">
          <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Users className="h-4 w-4 text-[#F97316]" />
                SaaS Client Account & Agent Manager
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Monitor client organizations, train chatbot knowledge bases, reset embeddings, or delete users.</p>
            </div>
            <span className="bg-slate-100 border border-slate-200 text-[#1E3A8A] text-xs px-3 py-1 rounded-full font-bold">
              Total Accounts: {users.length}
            </span>
          </div>

          {loadingUsers ? (
            <div className="text-xs text-slate-500 text-center py-8 flex flex-col items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin text-[#F97316]" />
              <span>Loading user accounts...</span>
            </div>
          ) : users.length === 0 ? (
            <div className="text-xs text-slate-500 text-center py-8">No registered user accounts found.</div>
          ) : (
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-4">User Details</th>
                    <th className="py-3 px-4">Organization</th>
                    <th className="py-3 px-4">Assigned Agents & Actions</th>
                    <th className="py-3 px-4 text-right">Account Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {users.map((u) => {
                    const org = u.memberships?.[0]?.organization;
                    return (
                      <tr key={u.id} className="hover:bg-slate-50/60 transition">
                        <td className="py-4 px-4 align-top">
                          <div className="font-bold text-slate-900 text-xs">{u.name || 'N/A'}</div>
                          <div className="text-[11px] font-semibold text-slate-600 mt-0.5">{u.email}</div>
                          <div className="text-[10px] text-slate-400 mt-1">Joined: {new Date(u.createdAt).toLocaleDateString()}</div>
                          <span className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-full uppercase mt-1.5 ${
                            u.role === 'admin' ? 'bg-[#F97316] text-white' : 'bg-slate-200 text-slate-700'
                          }`}>
                            {u.role === 'admin' ? 'Master Admin' : 'Standard User'}
                          </span>
                        </td>

                        <td className="py-4 px-4 align-top">
                          <div className="font-bold text-slate-800">{org?.name || 'N/A'}</div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">ID: {org?.id || 'None'}</div>
                        </td>

                        <td className="py-4 px-4 align-top">
                          {org?.agents && org.agents.length > 0 ? (
                            <div className="space-y-2">
                              {org.agents.map((a: any) => (
                                <div key={a.id} className="bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-xs flex items-center justify-between gap-3 shadow-2xs">
                                  <div>
                                    <span className="font-bold text-slate-900 block">{a.name}</span>
                                    <span className="text-[10px] text-slate-500">
                                      Docs: <strong className="text-slate-800">{a._count?.documents || 0}</strong> | Bookings: <strong className="text-slate-800">{a._count?.bookings || 0}</strong>
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1.5 shrink-0">
                                    <button
                                      onClick={() => handleTrainAgent(a.id)}
                                      className="bg-[#F97316] hover:bg-[#ea580c] text-white font-semibold border border-slate-900 shadow-xs rounded-md px-2.5 py-1 text-[10px] transition-all cursor-pointer flex items-center gap-1"
                                      title="Switch to this Agent and Train Knowledge Base"
                                    >
                                      <BookOpen className="h-3 w-3" />
                                      <span>Train & Manage</span>
                                    </button>
                                    <button
                                      onClick={() => handleClearAgentCache(a.id)}
                                      disabled={clearingAgentId === a.id}
                                      className="bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-600 text-[10px] font-bold px-2 py-1 rounded-md transition cursor-pointer"
                                    >
                                      {clearingAgentId === a.id ? 'Wiping...' : 'Clear Cache'}
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-[11px] text-slate-400 italic">No agents created</span>
                          )}
                        </td>

                        <td className="py-4 px-4 text-right align-top">
                          <button
                            onClick={() => handleDeleteUser(u.id)}
                            disabled={deletingUserId === u.id || u.role === 'admin'}
                            className="bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-semibold px-3 py-1.5 rounded-lg shadow-xs transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
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

        {/* Database & Infrastructure Health Cards */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4 shadow-xs">
          <div className="flex items-center gap-2 border-b border-slate-200 pb-2.5">
            <ShieldAlert className="h-4 w-4 text-[#F97316]" />
            <h3 className="text-sm font-bold text-slate-900">Infrastructure & Vector Engine Status</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div className="bg-slate-50 p-4 border border-slate-200 rounded-xl">
              <span className="block text-slate-500 text-[10px] uppercase font-bold tracking-wider">PostgreSQL + PgVector</span>
              <span className="block text-emerald-600 font-bold text-xs mt-1">ONLINE / SYNCED</span>
            </div>
            <div className="bg-slate-50 p-4 border border-slate-200 rounded-xl">
              <span className="block text-slate-500 text-[10px] uppercase font-bold tracking-wider">Core AI Provider</span>
              <span className="block text-[#1E3A8A] font-bold text-xs mt-1 uppercase">{activeProvider} ENGINE</span>
            </div>
            <div className="bg-slate-50 p-4 border border-slate-200 rounded-xl">
              <span className="block text-slate-500 text-[10px] uppercase font-bold tracking-wider">System Health</span>
              <span className="block text-emerald-600 font-bold text-xs mt-1">EXCELLENT</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
