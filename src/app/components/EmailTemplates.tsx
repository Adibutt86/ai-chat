'use client';

import React, { useState, useEffect } from 'react';
import { Mail, CheckCircle2, AlertCircle, Save, Loader2, Info, Sparkles, RefreshCw } from 'lucide-react';

export default function EmailTemplates() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Template States
  const [emailApprovedSubject, setEmailApprovedSubject] = useState('');
  const [emailApprovedBody, setEmailApprovedBody] = useState('');
  
  const [emailCancelledSubject, setEmailCancelledSubject] = useState('');
  const [emailCancelledBody, setEmailCancelledBody] = useState('');

  const [emailLeadSubject, setEmailLeadSubject] = useState('');
  const [emailLeadBody, setEmailLeadBody] = useState('');

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/email-templates');
      if (res.ok) {
        const data = await res.json();
        setEmailApprovedSubject(data.emailApprovedSubject || '');
        setEmailApprovedBody(data.emailApprovedBody || '');
        setEmailCancelledSubject(data.emailCancelledSubject || '');
        setEmailCancelledBody(data.emailCancelledBody || '');
        setEmailLeadSubject(data.emailLeadSubject || '');
        setEmailLeadBody(data.emailLeadBody || '');
      }
    } catch (err) {
      console.error('Error fetching email templates:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setToastMessage(null);

    try {
      const res = await fetch('/api/email-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emailApprovedSubject,
          emailApprovedBody,
          emailCancelledSubject,
          emailCancelledBody,
          emailLeadSubject,
          emailLeadBody,
        }),
      });

      if (res.ok) {
        setToastMessage({
          type: 'success',
          text: 'Email templates updated successfully! All future customer notification emails will use these custom bodies.'
        });
        setTimeout(() => setToastMessage(null), 4000);
      } else {
        const data = await res.json();
        setToastMessage({
          type: 'error',
          text: data.error || 'Failed to save email templates.'
        });
      }
    } catch {
      setToastMessage({
        type: 'error',
        text: 'Network error saving email templates.'
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center">
        <Loader2 className="h-6 w-6 animate-spin text-[#F97316] mx-auto" />
        <p className="text-xs text-slate-500 mt-2 font-medium">Loading Email Template Settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Email Templates Configuration</h2>
          <p className="text-slate-500 text-xs mt-0.5">Customize the email subjects and body text sent to customers upon booking approval, cancellation, or lead capture.</p>
        </div>
        <button
          onClick={fetchTemplates}
          className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-3 py-1.5 rounded-lg text-xs transition cursor-pointer"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Reload Defaults
        </button>
      </div>

      {toastMessage && (
        <div className={`p-4 rounded-xl border flex items-center gap-2.5 text-xs font-semibold shadow-xs ${
          toastMessage.type === 'success' 
            ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
            : 'bg-rose-50 text-rose-800 border-rose-200'
        }`}>
          {toastMessage.type === 'success' ? <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" /> : <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Dynamic Variables Guide */}
      <div className="bg-[#1E3A8A]/5 border border-[#1E3A8A]/20 rounded-xl p-4 space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-[#1E3A8A]">
          <Sparkles className="h-4 w-4 text-[#F97316]" />
          <span>Available Dynamic Placeholders</span>
        </div>
        <p className="text-[11px] text-slate-600 leading-normal">
          You can use the following variables anywhere in the email subject or body text. They will be replaced automatically at runtime:
        </p>
        <div className="flex flex-wrap gap-2 pt-1">
          <code className="bg-white border border-slate-200 text-[#1E3A8A] font-mono text-[11px] px-2 py-0.5 rounded shadow-2xs font-semibold">{"{customerName}"}</code>
          <code className="bg-white border border-slate-200 text-[#1E3A8A] font-mono text-[11px] px-2 py-0.5 rounded shadow-2xs font-semibold">{"{serviceName}"}</code>
          <code className="bg-white border border-slate-200 text-[#1E3A8A] font-mono text-[11px] px-2 py-0.5 rounded shadow-2xs font-semibold">{"{startTime}"}</code>
          <code className="bg-white border border-slate-200 text-[#1E3A8A] font-mono text-[11px] px-2 py-0.5 rounded shadow-2xs font-semibold">{"{businessName}"}</code>
          <code className="bg-white border border-slate-200 text-[#1E3A8A] font-mono text-[11px] px-2 py-0.5 rounded shadow-2xs font-semibold">{"{bookingId}"}</code>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Template 1: Booking Approved Email */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-xs">
          <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
            <div className="h-6 w-6 rounded-md bg-emerald-100 flex items-center justify-center text-emerald-700">
              <CheckCircle2 className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Booking Approved / Confirmed Email</h3>
              <p className="text-[10px] text-slate-400">Sent to the customer when the admin approves their pending booking request</p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">
                Email Subject
              </label>
              <input
                type="text"
                required
                value={emailApprovedSubject}
                onChange={(e) => setEmailApprovedSubject(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#F97316]"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">
                Email Body Text
              </label>
              <textarea
                required
                rows={5}
                value={emailApprovedBody}
                onChange={(e) => setEmailApprovedBody(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg p-3 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#F97316] leading-relaxed font-mono"
              />
            </div>
          </div>
        </div>

        {/* Template 2: Booking Cancelled Email */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-xs">
          <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
            <div className="h-6 w-6 rounded-md bg-rose-100 flex items-center justify-center text-rose-700">
              <AlertCircle className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Booking Cancelled Email</h3>
              <p className="text-[10px] text-slate-400">Sent to the customer when an appointment is cancelled by the admin</p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">
                Email Subject
              </label>
              <input
                type="text"
                required
                value={emailCancelledSubject}
                onChange={(e) => setEmailCancelledSubject(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#F97316]"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">
                Email Body Text
              </label>
              <textarea
                required
                rows={5}
                value={emailCancelledBody}
                onChange={(e) => setEmailCancelledBody(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg p-3 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#F97316] leading-relaxed font-mono"
              />
            </div>
          </div>
        </div>

        {/* Template 3: New Lead Captured Notification */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-xs">
          <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
            <div className="h-6 w-6 rounded-md bg-blue-100 flex items-center justify-center text-[#1E3A8A]">
              <Mail className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">New Lead Captured Admin Notification</h3>
              <p className="text-[10px] text-slate-400">Template for admin notifications sent when visitors submit contact info in chatbot</p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">
                Email Subject
              </label>
              <input
                type="text"
                required
                value={emailLeadSubject}
                onChange={(e) => setEmailLeadSubject(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#F97316]"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">
                Email Body Text
              </label>
              <textarea
                required
                rows={4}
                value={emailLeadBody}
                onChange={(e) => setEmailLeadBody(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg p-3 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#F97316] leading-relaxed font-mono"
              />
            </div>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-[#F97316] hover:bg-[#ea580c] text-white font-bold border border-slate-900 shadow-xs px-5 py-2.5 rounded-lg text-xs transition cursor-pointer disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Saving Templates...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>Save Custom Email Templates</span>
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
}
