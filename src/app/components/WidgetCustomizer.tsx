'use client';

import React, { useState, useEffect } from 'react';
import { Settings, Save, Sparkles, Sliders } from 'lucide-react';

interface WidgetCustomizerProps {
  agentId: string;
}

export default function WidgetCustomizer({ agentId }: WidgetCustomizerProps) {
  const [primaryColor, setPrimaryColor] = useState('#2563eb');
  const [borderRadius, setBorderRadius] = useState('0.75rem');
  const [welcomeMessage, setWelcomeMessage] = useState('Hi! How can I help you today?');
  const [placeholder, setPlaceholder] = useState('Type your message...');
  const [themeMode, setThemeMode] = useState('light');
  const [position, setPosition] = useState('bottom-right');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch(`/api/widget/settings?agentId=${agentId}`);
        if (res.ok) {
          const data = await res.json();
          if (data) {
            setPrimaryColor(data.primaryColor || '#2563eb');
            setBorderRadius(data.borderRadius || '0.75rem');
            setWelcomeMessage(data.welcomeMessage || 'Hi! How can I help you today?');
            setPlaceholder(data.placeholder || 'Type your message...');
            setThemeMode(data.themeMode || 'light');
            setPosition(data.position || 'bottom-right');
          }
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchSettings();
  }, [agentId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    try {
      const res = await fetch('/api/widget/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId,
          primaryColor,
          borderRadius,
          welcomeMessage,
          placeholder,
          themeMode,
          position,
        }),
      });

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const widgetOrigin = typeof window !== 'undefined' ? window.location.origin : '';
  const scriptTagCode = `<!-- ChatBox AI Widget Loader -->
<script
  src="${widgetOrigin}/chatbox-widget.js"
  data-agent-id="${agentId}"
  async>
</script>`;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white">Widget Customizer & Installation</h2>
        <p className="text-zinc-400 text-sm">Design visual styling parameters and download one-line production loader codes.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Side: Customize Form */}
        <form onSubmit={handleSave} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-6 text-sm text-zinc-300">
          <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
            <Sliders className="h-5 w-5 text-blue-500" />
            <h3 className="text-base font-bold text-white">Interface Parameters</h3>
          </div>

          {success && (
            <div className="bg-emerald-950/40 border border-emerald-800/80 text-emerald-400 px-4 py-3 rounded-lg flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Settings updated successfully! Changes take effect immediately.
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-zinc-500 font-semibold mb-1">Brand Color</label>
              <input
                type="color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="w-full h-10 bg-zinc-950 border border-zinc-800 rounded-lg cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-zinc-500 font-semibold mb-1">Border Radius</label>
              <select
                value={borderRadius}
                onChange={(e) => setBorderRadius(e.target.value)}
                className="w-full h-10 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white"
              >
                <option value="0.25rem">Classic (Sharp)</option>
                <option value="0.75rem">Standard (Rounded)</option>
                <option value="1.5rem">Pill (Extra Smooth)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-zinc-500 font-semibold mb-1">Default Theme Mode</label>
              <select
                value={themeMode}
                onChange={(e) => setThemeMode(e.target.value)}
                className="w-full h-10 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white"
              >
                <option value="light">Light Mode</option>
                <option value="dark">Dark Mode</option>
              </select>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-zinc-500 font-semibold mb-1">Launcher Position</label>
              <select
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                className="w-full h-10 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white"
              >
                <option value="bottom-right">Bottom Right</option>
                <option value="bottom-left">Bottom Left</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-zinc-500 font-semibold mb-1">Welcome Text</label>
            <input
              type="text"
              value={welcomeMessage}
              onChange={(e) => setWelcomeMessage(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-white"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-zinc-500 font-semibold mb-1">Input Placeholder</label>
            <input
              type="text"
              value={placeholder}
              onChange={(e) => setPlaceholder(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-white"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2.5 rounded-lg text-white font-semibold"
          >
            <Save className="h-4 w-4" />
            {loading ? 'Saving...' : 'Update Customizations'}
          </button>
        </form>

        {/* Right Side: Install Code & Widget Preview Container */}
        <div className="space-y-6">
          {/* Installation snippet */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
              <Settings className="h-5 w-5 text-blue-500" />
              <h3 className="text-base font-bold text-white">One-Line Script Loader</h3>
            </div>
            <p className="text-xs text-zinc-400">Copy this HTML snippet and place it at the end of the &lt;body&gt; block on any website page you want the chatbot to load.</p>
            <pre className="bg-zinc-950 border border-zinc-850 p-4 rounded-xl text-xs font-mono text-blue-400 overflow-x-auto select-all leading-relaxed whitespace-pre-wrap">
              {scriptTagCode}
            </pre>
          </div>

          {/* Interactive Simulation Frame */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
            <h3 className="text-base font-bold text-white mb-2">Live Chat Widget Sandbox</h3>
            <p className="text-xs text-zinc-400 mb-4">Click the simulator link below to test your customized agent vector RAG matches directly in a sandbox webpage.</p>
            <a
              href={`/widget-sandbox?agentId=${agentId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center bg-zinc-950 hover:bg-zinc-850 border border-zinc-800 rounded-xl px-4 py-3 text-sm font-semibold text-blue-400 w-full transition"
            >
              Open Live Simulator Screen
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
