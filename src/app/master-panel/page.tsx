'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Save, ShieldAlert, Database, Server, Settings as SettingsIcon, Key } from 'lucide-react';

export default function MasterDashboard() {
  const { session, loading } = useAuth();
  const router = useRouter();

  // API Overrides Config State
  const [activeProvider, setActiveProvider] = useState('gemini');
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [openaiApiKey, setOpenaiApiKey] = useState('');
  const [claudeApiKey, setClaudeApiKey] = useState('');

  const [signupDisabled, setSignupDisabled] = useState(false);
  const [allowedDomains, setAllowedDomains] = useState('*');
  const [crawlerLimit, setCrawlerLimit] = useState(100);
  const [success, setSuccess] = useState(false);

  const fetchGlobalSettings = async () => {
    try {
      const res = await fetch('/api/global-config');
      if (res.ok) {
        const data = await res.json();
        setActiveProvider(data.activeProvider || 'gemini');
        setGeminiApiKey(data.geminiKey || '');
        setOpenaiApiKey(data.openaiKey || '');
        setClaudeApiKey(data.claudeKey || '');
      }
    } catch (err) {
      console.error('Error fetching global configurations:', err);
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

  if (loading || !session || session.role !== 'admin') {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-400 text-sm">
        Verifying master admin privilege...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      {/* Master admin navigation bar */}
      <header className="h-16 px-6 md:px-12 border-b border-zinc-900 bg-zinc-900 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Database className="h-5 w-5 text-red-500" />
          <span className="font-bold text-white text-base tracking-tight">ChatBox AI Master Panel</span>
        </div>
        <div className="flex items-center gap-4">
          <a href="/dashboard" className="text-xs bg-zinc-800 hover:bg-zinc-700 px-3 py-1.5 rounded-lg text-zinc-300 font-semibold transition">
            Go to App Dashboard
          </a>
        </div>
      </header>

      {/* Settings management panels */}
      <main className="flex-1 max-w-4xl w-full mx-auto py-12 px-6 space-y-8">
        <div>
          <h1 className="text-3xl font-black text-white">System Settings & Controls</h1>
          <p className="text-zinc-400 text-sm mt-1">Global SaaS infrastructure, billing parameters and service overrides.</p>
        </div>

        {success && (
          <div className="p-3.5 bg-emerald-950/40 border border-emerald-800/80 rounded-xl text-emerald-400 text-xs">
            Global system settings updated and synced across all backend jobs.
          </div>
        )}

        <form onSubmit={handleSaveConfig} className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 space-y-6">
          <div className="flex items-center gap-2 border-b border-zinc-855 pb-3">
            <Server className="h-5 w-5 text-red-500" />
            <h3 className="text-base font-bold text-white">Global LLM Provider Keys</h3>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-xs uppercase tracking-wider text-zinc-500 font-semibold mb-1.5">Active AI Provider Model</label>
              <select
                value={activeProvider}
                onChange={(e) => setActiveProvider(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-4 py-3 text-zinc-300 font-semibold focus:ring-1 focus:ring-red-500 outline-none"
              >
                <option value="gemini">Google Gemini Models (text-embedding-004 + gemini-2.5-flash)</option>
                <option value="openai">OpenAI Models (text-embedding-3-small + gpt-4o)</option>
                <option value="claude">Anthropic Claude Models (Claude 3.5 Sonnet)</option>
              </select>
              <p className="text-[10px] text-zinc-500 mt-1">Changing the active model applies system-wide to all user chats and embeddings.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-zinc-500 font-semibold mb-1">Google Gemini API Key</label>
                <input
                  type="password"
                  value={geminiApiKey}
                  onChange={(e) => setGeminiApiKey(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-4 py-3 text-zinc-300 font-mono text-xs focus:ring-1 focus:ring-red-500 outline-none"
                  placeholder="AIzaSy..."
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-zinc-500 font-semibold mb-1">OpenAI API Key (ChatGPT)</label>
                <input
                  type="password"
                  value={openaiApiKey}
                  onChange={(e) => setOpenaiApiKey(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-4 py-3 text-zinc-300 font-mono text-xs focus:ring-1 focus:ring-red-500 outline-none"
                  placeholder="sk-proj-..."
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-zinc-500 font-semibold mb-1">Anthropic Claude API Key</label>
                <input
                  type="password"
                  value={claudeApiKey}
                  onChange={(e) => setClaudeApiKey(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-4 py-3 text-zinc-300 font-mono text-xs focus:ring-1 focus:ring-red-500 outline-none"
                  placeholder="sk-ant-..."
                />
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-zinc-855">
              <button
                type="submit"
                className="bg-red-600 hover:bg-red-700 text-sm font-bold text-white px-6 py-3 rounded-xl transition flex items-center gap-1.5"
              >
                <Save className="h-4 w-4" /> Save System Settings
              </button>
            </div>
          </div>
        </form>

        {/* Database Overviews */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 space-y-4">
          <div className="flex items-center gap-2 border-b border-zinc-855 pb-3">
            <ShieldAlert className="h-5 w-5 text-red-500" />
            <h3 className="text-base font-bold text-white">Infrastructure Status</h3>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-850">
              <span className="block text-[10px] text-zinc-500 font-semibold uppercase">Prisma client version</span>
              <span className="block text-sm font-bold text-white mt-1">v6.2.1</span>
            </div>
            <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-850">
              <span className="block text-[10px] text-zinc-500 font-semibold uppercase">Database provider</span>
              <span className="block text-sm font-bold text-white mt-1">PostgreSQL</span>
            </div>
            <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-850">
              <span className="block text-[10px] text-zinc-500 font-semibold uppercase">pgvector chunks status</span>
              <span className="block text-sm font-bold text-emerald-400 mt-1">Active / Connected</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
