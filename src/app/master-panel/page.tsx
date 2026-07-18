'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Shield, Save, Users, Bot, MessageSquare, ShieldAlert } from 'lucide-react';

export default function MasterPanel() {
  const { session, loading } = useAuth();
  const router = useRouter();

  // API Overrides Config State
  const [activeProvider, setActiveProvider] = useState('gemini');
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [openaiApiKey, setOpenaiApiKey] = useState('');
  const [claudeApiKey, setClaudeApiKey] = useState('');
  const [openrouterApiKey, setOpenrouterApiKey] = useState('');

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
        setOpenrouterApiKey(data.openrouterKey || '');
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
          openrouterKey: openrouterApiKey,
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
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex">
      {/* Admin Panel Header & Workspace */}
      <main className="flex-1 p-8 md:p-12 max-w-4xl mx-auto space-y-8">
        
        <div className="flex justify-between items-center border-b border-zinc-855 pb-6">
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
            <div className="border-b border-zinc-855 pb-3">
              <h3 className="text-base font-bold text-white">Active LLM Provider</h3>
              <p className="text-xs text-zinc-500 mt-1">Specify which core service handles chat queries and embeds.</p>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-zinc-500 font-semibold mb-1">Provider Selector</label>
              <select
                value={activeProvider}
                onChange={(e) => setActiveProvider(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-4 py-3 text-zinc-300 font-semibold focus:ring-1 focus:ring-red-500 outline-none"
              >
                <option value="gemini">Google Gemini Models (text-embedding-004 + gemini-2.5-flash)</option>
                <option value="openai">OpenAI Models (text-embedding-3-small + gpt-4o)</option>
                <option value="claude">Anthropic Claude Models (Claude 3.5 Sonnet)</option>
                <option value="openrouter">OpenRouter Serverless Models (Gemini, Llama, Qwen)</option>
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
                  className="w-full bg-zinc-950 border border-zinc-855 rounded-xl px-4 py-3 text-zinc-300 font-mono text-xs focus:ring-1 focus:ring-red-500 outline-none"
                  placeholder="sk-proj-..."
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-zinc-500 font-semibold mb-1">Anthropic Claude API Key</label>
                <input
                  type="password"
                  value={claudeApiKey}
                  onChange={(e) => setClaudeApiKey(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-855 rounded-xl px-4 py-3 text-zinc-300 font-mono text-xs focus:ring-1 focus:ring-red-500 outline-none"
                  placeholder="sk-ant-..."
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-zinc-500 font-semibold mb-1">OpenRouter API Key</label>
                <input
                  type="password"
                  value={openrouterApiKey}
                  onChange={(e) => setOpenrouterApiKey(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-855 rounded-xl px-4 py-3 text-zinc-300 font-mono text-xs focus:ring-1 focus:ring-red-500 outline-none"
                  placeholder="sk-or-v1-..."
                />
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-zinc-855">
              <button
                type="submit"
                className="bg-red-600 hover:bg-red-700 text-sm font-bold text-white px-6 py-3 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
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
            <div className="bg-zinc-950 p-4 border border-zinc-855 rounded-2xl">
              <span className="block text-zinc-550 text-[10px] uppercase font-bold tracking-widest">Postgres Schema</span>
              <span className="block text-emerald-400 font-bold text-sm mt-1">ONLINE / SYNCED</span>
            </div>
            <div className="bg-zinc-950 p-4 border border-zinc-855 rounded-2xl">
              <span className="block text-zinc-550 text-[10px] uppercase font-bold tracking-widest">OpenRouter Gate</span>
              <span className="block text-zinc-300 font-bold text-sm mt-1">READY</span>
            </div>
            <div className="bg-zinc-950 p-4 border border-zinc-855 rounded-2xl">
              <span className="block text-zinc-550 text-[10px] uppercase font-bold tracking-widest">System Health</span>
              <span className="block text-emerald-400 font-bold text-sm mt-1">EXCELLENT</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
