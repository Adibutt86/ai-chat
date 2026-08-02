'use client';

import React, { useState, useEffect } from 'react';
import { Settings, Save, Sparkles, Sliders, Upload, Copy, Check } from 'lucide-react';

interface WidgetCustomizerProps {
  agentId: string;
}

export default function WidgetCustomizer({ agentId }: WidgetCustomizerProps) {
  const [copiedId, setCopiedId] = useState(false);
  const [primaryColor, setPrimaryColor] = useState('#2563eb');
  const [borderRadius, setBorderRadius] = useState('0.75rem');
  const [welcomeMessage, setWelcomeMessage] = useState('Hi! How can I help you today?');
  const [placeholder, setPlaceholder] = useState('Type your message...');
  const [themeMode, setThemeMode] = useState('light');
  const [position, setPosition] = useState('bottom-right');
  
  const [avatarUrl, setAvatarUrl] = useState('');
  
  // Toggles for Quick Links
  const [showBooking, setShowBooking] = useState(true);
  const [showLeadForm, setShowLeadForm] = useState(true);
  const [showServices, setShowServices] = useState(false);
  const [showHours, setShowHours] = useState(false);
  const [dataSourceMode, setDataSourceMode] = useState<'dashboard' | 'website'>('dashboard');

  // Per-point Knowledge Retrieval Source Modes
  const [bookingSourceMode, setBookingSourceMode] = useState<'dashboard' | 'website'>('dashboard');
  const [contactSourceMode, setContactSourceMode] = useState<'dashboard' | 'website'>('dashboard');
  const [servicesSourceMode, setServicesSourceMode] = useState<'dashboard' | 'website'>('dashboard');
  const [hoursSourceMode, setHoursSourceMode] = useState<'dashboard' | 'website'>('dashboard');

  // Widget dimensions
  const [width, setWidth] = useState('380px');
  const [height, setHeight] = useState('600px');

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch(`/api/widget/settings?agentId=${agentId}`);
        if (res.ok) {
          const data = await res.json();
          if (data) {
            setAvatarUrl(data.avatarUrl || '');
            setPrimaryColor(data.primaryColor || '#2563eb');
            setBorderRadius(data.borderRadius || '0.75rem');
            setWelcomeMessage(data.welcomeMessage || 'Hi! How can I help you today?');
            setPlaceholder(data.placeholder || 'Type your message...');
            setThemeMode(data.themeMode || 'light');
            setPosition(data.position || 'bottom-right');
            setShowBooking(data.showBooking !== undefined ? data.showBooking : true);
            setShowLeadForm(data.showLeadForm !== undefined ? data.showLeadForm : true);
            setShowServices(data.showServices !== undefined ? data.showServices : false);
            setShowHours(data.showHours !== undefined ? data.showHours : false);
            setDataSourceMode(data.dataSourceMode === 'website' ? 'website' : 'dashboard');
            
            setBookingSourceMode(data.bookingSourceMode === 'website' ? 'website' : 'dashboard');
            setContactSourceMode(data.contactSourceMode === 'website' ? 'website' : 'dashboard');
            setServicesSourceMode(data.servicesSourceMode === 'website' ? 'website' : 'dashboard');
            setHoursSourceMode(data.hoursSourceMode === 'website' ? 'website' : 'dashboard');

            setWidth(data.width || '380px');
            setHeight(data.height || '600px');
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
          avatarUrl,
          primaryColor,
          borderRadius,
          welcomeMessage,
          placeholder,
          themeMode,
          position,
          showBooking,
          showLeadForm,
          showServices,
          showHours,
          dataSourceMode,
          bookingSourceMode,
          contactSourceMode,
          servicesSourceMode,
          hoursSourceMode,
          width,
          height,
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
        <p className="text-zinc-400 text-sm">Design visual styling parameters and configure clickable suggested actions for visitors.</p>
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

          <div>
            <label className="block text-xs uppercase tracking-wider text-zinc-500 font-semibold mb-1">Bot Avatar Image (Upload File or URL)</label>
            <div className="flex gap-2 items-center">
              <input
                type="text"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="Paste URL or click Upload"
                className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
              <label className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs px-3 py-2 rounded-lg cursor-pointer border border-zinc-700 font-medium shrink-0 flex items-center gap-1.5 transition">
                <Upload className="h-3.5 w-3.5" />
                <span>Upload</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        if (typeof reader.result === 'string') {
                          setAvatarUrl(reader.result);
                        }
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </label>
              <div className="h-9 w-9 rounded-full bg-zinc-950 border border-zinc-750 flex items-center justify-center overflow-hidden shrink-0">
                {avatarUrl && avatarUrl.trim() !== '' ? (
                  <img
                    src={avatarUrl}
                    alt="Avatar Preview"
                    className="h-full w-full object-cover"
                    onError={(e: any) => { e.target.style.display = 'none'; }}
                  />
                ) : (
                  <svg className="h-5 w-5 text-zinc-400 p-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2a10 10 0 0 1 10 10c0 5.523-4.477 10-10 10S2 17.523 2 12A10 10 0 0 1 12 2z"></path>
                    <path d="M12 6v6l4 2"></path>
                  </svg>
                )}
              </div>
            </div>
            <p className="text-[11px] text-zinc-500 mt-1">Upload a PNG/JPG file from your computer or paste an image URL.</p>
          </div>

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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-zinc-500 font-semibold mb-1">Widget Width</label>
              <input
                type="text"
                value={width}
                onChange={(e) => setWidth(e.target.value)}
                placeholder="e.g. 380px"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-zinc-500 font-semibold mb-1">Widget Height</label>
              <input
                type="text"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                placeholder="e.g. 600px"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white"
              />
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

          {/* Suggested Actions / Quick Links with Independent Source Selection for Each Point */}
          <div className="border-t border-zinc-800 pt-5 space-y-6">
            <div>
              <h4 className="text-xs uppercase tracking-wider text-zinc-400 font-bold mb-1">Suggested Actions / Quick Links</h4>
              <p className="text-[11px] text-zinc-500 mb-2">Configure suggestion buttons and select independent Knowledge Retrieval Sources for each feature point.</p>
              <div className="bg-blue-950/30 border border-blue-900/40 p-2.5 rounded-lg text-[11px] text-blue-300">
                💡 <strong>Features:</strong> Sleek single-color vector icons, animated hover tooltips, and independent source retrieval configuration for every point.
              </div>
            </div>

            <div className="space-y-6">
              {/* Point 1: Book an Appointment */}
              <div className="bg-zinc-950/60 border border-zinc-800 p-4 rounded-xl space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showBooking}
                    onChange={(e) => setShowBooking(e.target.checked)}
                    className="rounded border-zinc-800 text-blue-600 focus:ring-blue-600 bg-zinc-900 h-4 w-4"
                  />
                  <span className="font-semibold text-white">📅 Book an Appointment / Demowise</span>
                </label>

                {showBooking && (
                  <div className="pl-7 space-y-2 pt-1 border-t border-zinc-850">
                    <label className="block text-[11px] uppercase tracking-wider text-zinc-400 font-bold mb-1">Knowledge Retrieval Source for Booking:</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <label className={`flex items-start gap-2 p-2.5 rounded-lg border cursor-pointer transition ${bookingSourceMode === 'website' ? 'bg-blue-950/40 border-blue-600/80 text-white' : 'bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:border-zinc-700'}`}>
                        <input
                          type="radio"
                          name="bookingSourceMode"
                          value="website"
                          checked={bookingSourceMode === 'website'}
                          onChange={() => setBookingSourceMode('website')}
                          className="mt-0.5 text-blue-600 focus:ring-blue-600 bg-zinc-950 border-zinc-800 h-3.5 w-3.5 cursor-pointer"
                        />
                        <div>
                          <div className="text-xs font-bold text-white">🌐 Fetch from Website</div>
                          <div className="text-[10px] text-zinc-400 leading-tight">Searches live website RAG data for booking info.</div>
                        </div>
                      </label>

                      <label className={`flex items-start gap-2 p-2.5 rounded-lg border cursor-pointer transition ${bookingSourceMode === 'dashboard' ? 'bg-blue-950/40 border-blue-600/80 text-white' : 'bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:border-zinc-700'}`}>
                        <input
                          type="radio"
                          name="bookingSourceMode"
                          value="dashboard"
                          checked={bookingSourceMode === 'dashboard'}
                          onChange={() => setBookingSourceMode('dashboard')}
                          className="mt-0.5 text-blue-600 focus:ring-blue-600 bg-zinc-950 border-zinc-800 h-3.5 w-3.5 cursor-pointer"
                        />
                        <div>
                          <div className="text-xs font-bold text-white">📊 Fetch from Dashboard</div>
                          <div className="text-[10px] text-zinc-400 leading-tight">Triggers interactive booking flow & slots.</div>
                        </div>
                      </label>
                    </div>
                  </div>
                )}
              </div>

              {/* Point 2: Contact Us / Leave Details */}
              <div className="bg-zinc-950/60 border border-zinc-800 p-4 rounded-xl space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showLeadForm}
                    onChange={(e) => setShowLeadForm(e.target.checked)}
                    className="rounded border-zinc-800 text-blue-600 focus:ring-blue-600 bg-zinc-900 h-4 w-4"
                  />
                  <span className="font-semibold text-white">📞 Contact Us / Leave Details</span>
                </label>

                {showLeadForm && (
                  <div className="pl-7 space-y-2 pt-1 border-t border-zinc-850">
                    <label className="block text-[11px] uppercase tracking-wider text-zinc-400 font-bold mb-1">Knowledge Retrieval Source for Contact:</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <label className={`flex items-start gap-2 p-2.5 rounded-lg border cursor-pointer transition ${contactSourceMode === 'website' ? 'bg-blue-950/40 border-blue-600/80 text-white' : 'bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:border-zinc-700'}`}>
                        <input
                          type="radio"
                          name="contactSourceMode"
                          value="website"
                          checked={contactSourceMode === 'website'}
                          onChange={() => setContactSourceMode('website')}
                          className="mt-0.5 text-blue-600 focus:ring-blue-600 bg-zinc-950 border-zinc-800 h-3.5 w-3.5 cursor-pointer"
                        />
                        <div>
                          <div className="text-xs font-bold text-white">🌐 Fetch from Website</div>
                          <div className="text-[10px] text-zinc-400 leading-tight">Searches live website content for contact details.</div>
                        </div>
                      </label>

                      <label className={`flex items-start gap-2 p-2.5 rounded-lg border cursor-pointer transition ${contactSourceMode === 'dashboard' ? 'bg-blue-950/40 border-blue-600/80 text-white' : 'bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:border-zinc-700'}`}>
                        <input
                          type="radio"
                          name="contactSourceMode"
                          value="dashboard"
                          checked={contactSourceMode === 'dashboard'}
                          onChange={() => setContactSourceMode('dashboard')}
                          className="mt-0.5 text-blue-600 focus:ring-blue-600 bg-zinc-950 border-zinc-800 h-3.5 w-3.5 cursor-pointer"
                        />
                        <div>
                          <div className="text-xs font-bold text-white">📊 Fetch from Dashboard</div>
                          <div className="text-[10px] text-zinc-400 leading-tight">Uses structured dashboard contact info.</div>
                        </div>
                      </label>
                    </div>
                  </div>
                )}
              </div>

              {/* Point 3: Our Services */}
              <div className="bg-zinc-950/60 border border-zinc-800 p-4 rounded-xl space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showServices}
                    onChange={(e) => setShowServices(e.target.checked)}
                    className="rounded border-zinc-800 text-blue-600 focus:ring-blue-600 bg-zinc-900 h-4 w-4"
                  />
                  <span className="font-semibold text-white">💼 Our Services</span>
                </label>

                {showServices && (
                  <div className="pl-7 space-y-2 pt-1 border-t border-zinc-850">
                    <label className="block text-[11px] uppercase tracking-wider text-zinc-400 font-bold mb-1">Knowledge Retrieval Source for Services:</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <label className={`flex items-start gap-2 p-2.5 rounded-lg border cursor-pointer transition ${servicesSourceMode === 'website' ? 'bg-blue-950/40 border-blue-600/80 text-white' : 'bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:border-zinc-700'}`}>
                        <input
                          type="radio"
                          name="servicesSourceMode"
                          value="website"
                          checked={servicesSourceMode === 'website'}
                          onChange={() => setServicesSourceMode('website')}
                          className="mt-0.5 text-blue-600 focus:ring-blue-600 bg-zinc-950 border-zinc-800 h-3.5 w-3.5 cursor-pointer"
                        />
                        <div>
                          <div className="text-xs font-bold text-white">🌐 Fetch from Website</div>
                          <div className="text-[10px] text-zinc-400 leading-tight">Searches live website content for services.</div>
                        </div>
                      </label>

                      <label className={`flex items-start gap-2 p-2.5 rounded-lg border cursor-pointer transition ${servicesSourceMode === 'dashboard' ? 'bg-blue-950/40 border-blue-600/80 text-white' : 'bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:border-zinc-700'}`}>
                        <input
                          type="radio"
                          name="servicesSourceMode"
                          value="dashboard"
                          checked={servicesSourceMode === 'dashboard'}
                          onChange={() => setServicesSourceMode('dashboard')}
                          className="mt-0.5 text-blue-600 focus:ring-blue-600 bg-zinc-950 border-zinc-800 h-3.5 w-3.5 cursor-pointer"
                        />
                        <div>
                          <div className="text-xs font-bold text-white">📊 Fetch from Dashboard</div>
                          <div className="text-[10px] text-zinc-400 leading-tight">Uses services from dashboard settings.</div>
                        </div>
                      </label>
                    </div>
                  </div>
                )}
              </div>

              {/* Point 4: Business Working Hours */}
              <div className="bg-zinc-950/60 border border-zinc-800 p-4 rounded-xl space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showHours}
                    onChange={(e) => setShowHours(e.target.checked)}
                    className="rounded border-zinc-800 text-blue-600 focus:ring-blue-600 bg-zinc-900 h-4 w-4"
                  />
                  <span className="font-semibold text-white">🕒 Business Working Hours</span>
                </label>

                {showHours && (
                  <div className="pl-7 space-y-2 pt-1 border-t border-zinc-850">
                    <label className="block text-[11px] uppercase tracking-wider text-zinc-400 font-bold mb-1">Knowledge Retrieval Source for Working Hours:</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <label className={`flex items-start gap-2 p-2.5 rounded-lg border cursor-pointer transition ${hoursSourceMode === 'website' ? 'bg-blue-950/40 border-blue-600/80 text-white' : 'bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:border-zinc-700'}`}>
                        <input
                          type="radio"
                          name="hoursSourceMode"
                          value="website"
                          checked={hoursSourceMode === 'website'}
                          onChange={() => setHoursSourceMode('website')}
                          className="mt-0.5 text-blue-600 focus:ring-blue-600 bg-zinc-950 border-zinc-800 h-3.5 w-3.5 cursor-pointer"
                        />
                        <div>
                          <div className="text-xs font-bold text-white">🌐 Fetch from Website</div>
                          <div className="text-[10px] text-zinc-400 leading-tight">Searches live website content for hours.</div>
                        </div>
                      </label>

                      <label className={`flex items-start gap-2 p-2.5 rounded-lg border cursor-pointer transition ${hoursSourceMode === 'dashboard' ? 'bg-blue-950/40 border-blue-600/80 text-white' : 'bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:border-zinc-700'}`}>
                        <input
                          type="radio"
                          name="hoursSourceMode"
                          value="dashboard"
                          checked={hoursSourceMode === 'dashboard'}
                          onChange={() => setHoursSourceMode('dashboard')}
                          className="mt-0.5 text-blue-600 focus:ring-blue-600 bg-zinc-950 border-zinc-800 h-3.5 w-3.5 cursor-pointer"
                        />
                        <div>
                          <div className="text-xs font-bold text-white">📊 Fetch from Dashboard</div>
                          <div className="text-[10px] text-zinc-400 leading-tight">Uses working hours from dashboard settings.</div>
                        </div>
                      </label>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2.5 rounded-lg text-white font-semibold w-full justify-center transition cursor-pointer"
          >
            <Save className="h-4 w-4" />
            {loading ? 'Saving Changes...' : 'Update Widget Settings'}
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

          {/* WordPress Plugin Agent ID Card */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-3">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Copy className="h-5 w-5 text-blue-500" />
                <h3 className="text-base font-bold text-white">Agent ID (WordPress Connection)</h3>
              </div>
            </div>
            <p className="text-xs text-zinc-400">Copy just your unique Agent ID below to paste into your WordPress Plugin settings page.</p>
            <div className="flex items-center gap-2 bg-zinc-950 border border-zinc-800 p-2.5 rounded-xl">
              <code className="flex-1 text-xs font-mono text-emerald-400 truncate px-2 selection:bg-blue-900">{agentId}</code>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(agentId);
                  setCopiedId(true);
                  setTimeout(() => setCopiedId(false), 2500);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3.5 py-2 rounded-lg font-semibold flex items-center gap-1.5 transition cursor-pointer shrink-0"
              >
                {copiedId ? (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy Agent ID</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Interactive Simulation Frame */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
            <h3 className="text-base font-bold text-white mb-2">Live Chat Widget Sandbox</h3>
            <p className="text-xs text-zinc-400 mb-4">Click the simulator link below to test your customized agent vector RAG matches directly in a sandbox webpage.</p>
            <a
              href={`/widget-sandbox?agentId=${agentId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center bg-zinc-950 hover:bg-zinc-850 border border-zinc-800 rounded-xl px-4 py-3 text-sm font-semibold text-blue-400 w-full transition cursor-pointer"
            >
              Open Live Simulator Screen
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
