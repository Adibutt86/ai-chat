'use client';

import React, { useState, useEffect } from 'react';
import { Settings, Save, Sparkles, Sliders, Upload, Copy, Check, Trash2 } from 'lucide-react';

interface WidgetCustomizerProps {
  agentId: string;
}

const THEME_PRESETS = [
  {
    id: 'light',
    name: 'Classic Light',
    icon: '☀️',
    primaryColor: '#2563eb',
    themeMode: 'light',
    borderRadius: '0.75rem',
    badge: 'Standard',
  },
  {
    id: 'dark',
    name: 'Sleek Dark',
    icon: '🌙',
    primaryColor: '#6366f1',
    themeMode: 'dark',
    borderRadius: '0.75rem',
    badge: 'Popular',
  },
  {
    id: 'glass',
    name: 'Frosted Glass',
    icon: '✨',
    primaryColor: '#06b6d4',
    themeMode: 'light',
    borderRadius: '1.25rem',
    badge: 'Glossy',
  },
  {
    id: 'cyber',
    name: 'Cyber Neon',
    icon: '⚡',
    primaryColor: '#10b981',
    themeMode: 'dark',
    borderRadius: '0.5rem',
    badge: 'High Tech',
  },
  {
    id: 'pastel',
    name: 'Soft Rose',
    icon: '🌸',
    primaryColor: '#e11d48',
    themeMode: 'light',
    borderRadius: '1.5rem',
    badge: 'Boutique',
  },
  {
    id: 'vibrant',
    name: 'Sunset Gradient',
    icon: '🌈',
    primaryColor: '#8b5cf6',
    themeMode: 'dark',
    borderRadius: '1rem',
    badge: 'Dynamic',
  },
];

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
  const [showTripForm, setShowTripForm] = useState(false);
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

  // Administrative Delete Booking State
  const [deleteBookingId, setDeleteBookingId] = useState('');
  const [deleteBookingMsg, setDeleteBookingMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [deletingBooking, setDeletingBooking] = useState(false);

  const handleDeleteBookingSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deleteBookingId.trim()) return;
    if (!confirm(`Are you sure you want to permanently delete booking ID "${deleteBookingId.trim()}"?`)) return;

    setDeletingBooking(true);
    setDeleteBookingMsg(null);
    try {
      const res = await fetch(`/api/bookings?id=${encodeURIComponent(deleteBookingId.trim())}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setDeleteBookingMsg({ type: 'success', text: `Booking "${deleteBookingId.trim()}" has been deleted successfully.` });
        setDeleteBookingId('');
      } else {
        const data = await res.json();
        setDeleteBookingMsg({ type: 'error', text: data.error || 'Failed to delete booking. Please check the Booking ID and try again.' });
      }
    } catch {
      setDeleteBookingMsg({ type: 'error', text: 'Network error deleting booking.' });
    } finally {
      setDeletingBooking(false);
    }
  };

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
            setShowTripForm(data.showTripForm !== undefined ? data.showTripForm : false);
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
          showTripForm,
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
  const scriptTagCode = `<!-- Geekvista Widget Loader -->
<script
  src="${widgetOrigin}/chatbox-widget.js"
  data-agent-id="${agentId}"
  async>
</script>`;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Widget Customizer & Installation</h2>
        <p className="text-slate-500 text-xs mt-0.5">Design visual styling parameters and configure clickable suggested actions for visitors.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Side: Customize Form */}
        <form onSubmit={handleSave} className="bg-white border border-slate-200 rounded-xl p-5 space-y-5 text-xs text-slate-700 shadow-xs">
          <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
            <Sliders className="h-4 w-4 text-[#F97316]" />
            <h3 className="text-sm font-bold text-slate-900">Interface Parameters</h3>
          </div>

          {success && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-3.5 py-2.5 rounded-lg flex items-center gap-2 text-xs font-semibold">
              <Sparkles className="h-4 w-4 text-emerald-600" />
              Settings updated successfully! Changes take effect immediately.
            </div>
          )}

          {/* Style Templates & Theme Presets */}
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-2">Theme Preset Styles</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {THEME_PRESETS.map((preset) => {
                const isActive = primaryColor === preset.primaryColor && themeMode === preset.themeMode && borderRadius === preset.borderRadius;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      setPrimaryColor(preset.primaryColor);
                      setThemeMode(preset.themeMode);
                      setBorderRadius(preset.borderRadius);
                    }}
                    className={`relative text-left p-2.5 rounded-lg border transition-all cursor-pointer overflow-hidden ${
                      isActive
                        ? 'bg-blue-50/70 border-[#1E3A8A] ring-2 ring-[#1E3A8A]/20 shadow-xs'
                        : 'bg-slate-50/70 border-slate-200 hover:border-slate-300 hover:bg-slate-100/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm">{preset.icon}</span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                        preset.themeMode === 'dark' ? 'bg-slate-800 text-white' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {preset.badge}
                      </span>
                    </div>

                    <div className="font-bold text-[11px] text-slate-900 mb-1 truncate">{preset.name}</div>
                    
                    {/* Swatch Bar */}
                    <div className="flex items-center gap-1">
                      <div
                        className="h-1.5 flex-1 rounded-full"
                        style={{ backgroundColor: preset.primaryColor }}
                      />
                      <div
                        className={`h-1.5 w-4 rounded-full border border-slate-300 ${
                          preset.themeMode === 'dark' ? 'bg-slate-800' : 'bg-white'
                        }`}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">Bot Avatar Image (Upload File or URL)</label>
            <div className="flex gap-2 items-center">
              <input
                type="text"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="Paste URL or click Upload"
                className="flex-1 bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#F97316]"
              />
              <label className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs px-3 py-1.5 rounded-lg cursor-pointer border border-slate-300 font-semibold shrink-0 flex items-center gap-1.5 transition">
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
              <div className="h-8 w-8 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center overflow-hidden shrink-0">
                {avatarUrl && avatarUrl.trim() !== '' ? (
                  <img
                    src={avatarUrl}
                    alt="Avatar Preview"
                    className="h-full w-full object-cover"
                    onError={(e: any) => { e.target.style.display = 'none'; }}
                  />
                ) : (
                  <svg className="h-4 w-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2a10 10 0 0 1 10 10c0 5.523-4.477 10-10 10S2 17.523 2 12A10 10 0 0 1 12 2z"></path>
                    <path d="M12 6v6l4 2"></path>
                  </svg>
                )}
              </div>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Upload a PNG/JPG file from your computer or paste an image URL.</p>
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">Brand Color</label>
              <input
                type="color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="w-full h-8 bg-white border border-slate-300 rounded-lg cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">Border Radius</label>
              <select
                value={borderRadius}
                onChange={(e) => setBorderRadius(e.target.value)}
                className="w-full h-8 bg-white border border-slate-300 rounded-lg px-3 py-1 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#F97316]"
              >
                <option value="0.25rem">Classic (Sharp)</option>
                <option value="0.75rem">Standard (Rounded)</option>
                <option value="1.5rem">Pill (Extra Smooth)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">Default Theme Mode</label>
              <select
                value={themeMode}
                onChange={(e) => setThemeMode(e.target.value)}
                className="w-full h-8 bg-white border border-slate-300 rounded-lg px-3 py-1 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#F97316]"
              >
                <option value="light">Light Mode</option>
                <option value="dark">Dark Mode</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">Launcher Position</label>
              <select
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                className="w-full h-8 bg-white border border-slate-300 rounded-lg px-3 py-1 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#F97316]"
              >
                <option value="bottom-right">Bottom Right</option>
                <option value="bottom-left">Bottom Left</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">Widget Width</label>
              <input
                type="text"
                value={width}
                onChange={(e) => setWidth(e.target.value)}
                placeholder="e.g. 380px"
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#F97316]"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">Widget Height</label>
              <input
                type="text"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                placeholder="e.g. 600px"
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#F97316]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">Welcome Text</label>
            <input
              type="text"
              value={welcomeMessage}
              onChange={(e) => setWelcomeMessage(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#F97316]"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">Input Placeholder</label>
            <input
              type="text"
              value={placeholder}
              onChange={(e) => setPlaceholder(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#F97316]"
            />
          </div>

          {/* Suggested Actions / Quick Links */}
          <div className="border-t border-slate-200 pt-4 space-y-4">
            <div>
              <h4 className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-0.5">Suggested Actions / Quick Links</h4>
              <p className="text-[11px] text-slate-400">Configure suggestion buttons and select independent Knowledge Retrieval Sources for each feature point.</p>
            </div>

            <div className="space-y-4">
              {/* Point 1: Book an Appointment */}
              <div className="bg-slate-50/80 border border-slate-200 p-3.5 rounded-lg space-y-2.5">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showBooking}
                    onChange={(e) => setShowBooking(e.target.checked)}
                    className="accent-[#F97316] h-4 w-4"
                  />
                  <span className="font-bold text-slate-900 text-xs">📅 Book an Appointment / Demowise</span>
                </label>

                {showBooking && (
                  <div className="pl-6 space-y-2 pt-1.5 border-t border-slate-200">
                    <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">Knowledge Retrieval Source for Booking:</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <label className={`flex items-start gap-2 p-2 rounded-lg border cursor-pointer transition ${bookingSourceMode === 'website' ? 'bg-blue-50 border-[#1E3A8A] text-slate-900 font-semibold' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'}`}>
                        <input
                          type="radio"
                          name="bookingSourceMode"
                          value="website"
                          checked={bookingSourceMode === 'website'}
                          onChange={() => setBookingSourceMode('website')}
                          className="mt-0.5 accent-[#F97316]"
                        />
                        <div>
                          <div className="text-xs font-bold text-slate-900">🌐 Fetch from Website</div>
                          <div className="text-[10px] text-slate-500 leading-tight">Searches live website RAG data for booking info.</div>
                        </div>
                      </label>

                      <label className={`flex items-start gap-2 p-2 rounded-lg border cursor-pointer transition ${bookingSourceMode === 'dashboard' ? 'bg-blue-50 border-[#1E3A8A] text-slate-900 font-semibold' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'}`}>
                        <input
                          type="radio"
                          name="bookingSourceMode"
                          value="dashboard"
                          checked={bookingSourceMode === 'dashboard'}
                          onChange={() => setBookingSourceMode('dashboard')}
                          className="mt-0.5 accent-[#F97316]"
                        />
                        <div>
                          <div className="text-xs font-bold text-slate-900">📊 Fetch from Dashboard</div>
                          <div className="text-[10px] text-slate-500 leading-tight">Triggers interactive booking flow & slots.</div>
                        </div>
                      </label>
                    </div>

                    {/* Delete Booking Option */}
                    <div className="mt-2.5 pt-2.5 border-t border-slate-200 space-y-1.5">
                      <label className="block text-[10px] uppercase tracking-wider text-rose-600 font-bold flex items-center gap-1">
                        <Trash2 className="h-3 w-3 text-rose-600" /> Delete Booking Record:
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Enter Booking Confirmation ID..."
                          value={deleteBookingId}
                          onChange={(e) => setDeleteBookingId(e.target.value)}
                          className="flex-1 bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
                        />
                        <button
                          type="button"
                          disabled={deletingBooking || !deleteBookingId.trim()}
                          onClick={handleDeleteBookingSettings}
                          className="bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white text-xs px-3 py-1 rounded-lg font-semibold flex items-center gap-1 cursor-pointer transition shrink-0"
                        >
                          <Trash2 className="h-3 w-3" />
                          {deletingBooking ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                      {deleteBookingMsg && (
                        <div className={`text-[11px] p-2 rounded-lg font-semibold ${deleteBookingMsg.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
                          {deleteBookingMsg.text}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Point 2: Lead Capture & Contact Us */}
              <div className="bg-slate-50/80 border border-slate-200 p-3.5 rounded-lg space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showLeadForm}
                      onChange={(e) => setShowLeadForm(e.target.checked)}
                      className="accent-[#F97316] h-4 w-4"
                    />
                    <span className="font-bold text-slate-900 text-xs">📋 Lead Capture Form</span>
                  </label>
                  <span className="text-[9px] bg-blue-50 text-[#1E3A8A] font-bold px-2 py-0.5 rounded-full border border-blue-200">
                    Saves to Leads
                  </span>
                </div>

                {showLeadForm && (
                  <div className="pl-6 space-y-2 pt-1.5 border-t border-slate-200">
                    <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">Knowledge Retrieval Source for Contact:</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <label className={`flex items-start gap-2 p-2 rounded-lg border cursor-pointer transition ${contactSourceMode === 'website' ? 'bg-blue-50 border-[#1E3A8A] text-slate-900 font-semibold' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'}`}>
                        <input
                          type="radio"
                          name="contactSourceMode"
                          value="website"
                          checked={contactSourceMode === 'website'}
                          onChange={() => setContactSourceMode('website')}
                          className="mt-0.5 accent-[#F97316]"
                        />
                        <div>
                          <div className="text-xs font-bold text-slate-900">🌐 Fetch from Website</div>
                          <div className="text-[10px] text-slate-500 leading-tight">Searches website for contact details.</div>
                        </div>
                      </label>

                      <label className={`flex items-start gap-2 p-2 rounded-lg border cursor-pointer transition ${contactSourceMode === 'dashboard' ? 'bg-blue-50 border-[#1E3A8A] text-slate-900 font-semibold' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'}`}>
                        <input
                          type="radio"
                          name="contactSourceMode"
                          value="dashboard"
                          checked={contactSourceMode === 'dashboard'}
                          onChange={() => setContactSourceMode('dashboard')}
                          className="mt-0.5 accent-[#F97316]"
                        />
                        <div>
                          <div className="text-xs font-bold text-slate-900">📊 Fetch from Dashboard</div>
                          <div className="text-[10px] text-slate-500 leading-tight">Triggers interactive lead capture form.</div>
                        </div>
                      </label>
                    </div>
                  </div>
                )}
              </div>

              {/* Point 3: Our Services */}
              <div className="bg-slate-50/80 border border-slate-200 p-3.5 rounded-lg space-y-2.5">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showServices}
                    onChange={(e) => setShowServices(e.target.checked)}
                    className="accent-[#F97316] h-4 w-4"
                  />
                  <span className="font-bold text-slate-900 text-xs">💼 Our Services</span>
                </label>

                {showServices && (
                  <div className="pl-6 space-y-2 pt-1.5 border-t border-slate-200">
                    <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">Knowledge Retrieval Source for Services:</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <label className={`flex items-start gap-2 p-2 rounded-lg border cursor-pointer transition ${servicesSourceMode === 'website' ? 'bg-blue-50 border-[#1E3A8A] text-slate-900 font-semibold' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'}`}>
                        <input
                          type="radio"
                          name="servicesSourceMode"
                          value="website"
                          checked={servicesSourceMode === 'website'}
                          onChange={() => setServicesSourceMode('website')}
                          className="mt-0.5 accent-[#F97316]"
                        />
                        <div>
                          <div className="text-xs font-bold text-slate-900">🌐 Fetch from Website</div>
                          <div className="text-[10px] text-slate-500 leading-tight">Searches website for services.</div>
                        </div>
                      </label>

                      <label className={`flex items-start gap-2 p-2 rounded-lg border cursor-pointer transition ${servicesSourceMode === 'dashboard' ? 'bg-blue-50 border-[#1E3A8A] text-slate-900 font-semibold' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'}`}>
                        <input
                          type="radio"
                          name="servicesSourceMode"
                          value="dashboard"
                          checked={servicesSourceMode === 'dashboard'}
                          onChange={() => setServicesSourceMode('dashboard')}
                          className="mt-0.5 accent-[#F97316]"
                        />
                        <div>
                          <div className="text-xs font-bold text-slate-900">📊 Fetch from Dashboard</div>
                          <div className="text-[10px] text-slate-500 leading-tight">Uses services from dashboard.</div>
                        </div>
                      </label>
                    </div>
                  </div>
                )}
              </div>

              {/* Point 4: Business Working Hours */}
              <div className="bg-slate-50/80 border border-slate-200 p-3.5 rounded-lg space-y-2.5">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showHours}
                    onChange={(e) => setShowHours(e.target.checked)}
                    className="accent-[#F97316] h-4 w-4"
                  />
                  <span className="font-bold text-slate-900 text-xs">🕒 Business Working Hours</span>
                </label>

                {showHours && (
                  <div className="pl-6 space-y-2 pt-1.5 border-t border-slate-200">
                    <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">Knowledge Retrieval Source for Working Hours:</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <label className={`flex items-start gap-2 p-2 rounded-lg border cursor-pointer transition ${hoursSourceMode === 'website' ? 'bg-blue-50 border-[#1E3A8A] text-slate-900 font-semibold' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'}`}>
                        <input
                          type="radio"
                          name="hoursSourceMode"
                          value="website"
                          checked={hoursSourceMode === 'website'}
                          onChange={() => setHoursSourceMode('website')}
                          className="mt-0.5 accent-[#F97316]"
                        />
                        <div>
                          <div className="text-xs font-bold text-slate-900">🌐 Fetch from Website</div>
                          <div className="text-[10px] text-slate-500 leading-tight">Searches website for hours.</div>
                        </div>
                      </label>

                      <label className={`flex items-start gap-2 p-2 rounded-lg border cursor-pointer transition ${hoursSourceMode === 'dashboard' ? 'bg-blue-50 border-[#1E3A8A] text-slate-900 font-semibold' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'}`}>
                        <input
                          type="radio"
                          name="hoursSourceMode"
                          value="dashboard"
                          checked={hoursSourceMode === 'dashboard'}
                          onChange={() => setHoursSourceMode('dashboard')}
                          className="mt-0.5 accent-[#F97316]"
                        />
                        <div>
                          <div className="text-xs font-bold text-slate-900">📊 Fetch from Dashboard</div>
                          <div className="text-[10px] text-slate-500 leading-tight">Uses working hours from dashboard.</div>
                        </div>
                      </label>
                    </div>
                  </div>
                )}
              </div>

              {/* Point 5: Trip Details Form */}
              <div className="bg-slate-50/80 border border-slate-200 p-3.5 rounded-lg space-y-1.5">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showTripForm}
                    onChange={(e) => setShowTripForm(e.target.checked)}
                    className="mt-0.5 accent-[#F97316] h-4 w-4 cursor-pointer"
                  />
                  <div>
                    <div className="font-bold text-slate-900 text-xs">🚘 Trip Details Form</div>
                    <div className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                      Enable for specialized trip details inquiry forms.
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 bg-[#F97316] hover:bg-[#ea580c] text-white font-semibold border border-slate-900 shadow-xs rounded-lg px-4 py-2.5 text-xs w-full justify-center transition cursor-pointer disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {loading ? 'Saving Changes...' : 'Update Widget Settings'}
          </button>
        </form>

        {/* Right Side: Install Code & Widget Preview Container */}
        <div className="space-y-5">
          {/* Installation snippet */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3 shadow-xs">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2.5">
              <Settings className="h-4 w-4 text-[#F97316]" />
              <h3 className="text-sm font-bold text-slate-900">One-Line Script Loader</h3>
            </div>
            <p className="text-xs text-slate-500">Copy this HTML snippet and place it at the end of the &lt;body&gt; block on any website page you want the chatbot to load.</p>
            <pre className="bg-slate-900 border border-slate-800 p-3.5 rounded-lg text-xs font-mono text-blue-300 overflow-x-auto select-all leading-relaxed whitespace-pre-wrap">
              {scriptTagCode}
            </pre>
          </div>

          {/* WordPress Plugin Agent ID Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
              <div className="flex items-center gap-2">
                <Copy className="h-4 w-4 text-[#F97316]" />
                <h3 className="text-sm font-bold text-slate-900">Agent ID (WordPress Connection)</h3>
              </div>
            </div>
            <p className="text-xs text-slate-500">Copy just your unique Agent ID below to paste into your WordPress Plugin settings page.</p>
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 p-2 rounded-lg">
              <code className="flex-1 text-xs font-mono text-[#1E3A8A] font-bold truncate px-1.5 selection:bg-blue-100">{agentId}</code>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(agentId);
                  setCopiedId(true);
                  setTimeout(() => setCopiedId(false), 2500);
                }}
                className="bg-[#F97316] hover:bg-[#ea580c] text-white text-xs px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition cursor-pointer shrink-0 border border-slate-900 shadow-xs"
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
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-1">Live Chat Widget Sandbox</h3>
            <p className="text-xs text-slate-500 mb-3">Click the simulator link below to test your customized agent vector RAG matches directly in a sandbox webpage.</p>
            <a
              href={`/widget-sandbox?agentId=${agentId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded-lg px-4 py-2.5 text-xs font-bold text-[#1E3A8A] w-full transition cursor-pointer shadow-xs"
            >
              Open Live Simulator Screen
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
