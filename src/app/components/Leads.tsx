'use client';

import React, { useState, useEffect } from 'react';
import { Mail, Phone, Building, Calendar, UserCheck, Download, Trash2, Send, Loader2, XCircle, CheckCircle2, AlertCircle } from 'lucide-react';
import { isMasterAdmin } from '@/lib/permissions';

interface Lead {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  company: string | null;
  createdAt: string;
}

interface LeadsProps {
  leads: Lead[];
  userRole: string;
}

export default function Leads({ leads, userRole }: LeadsProps) {
  const isAdmin = isMasterAdmin(userRole);
  const [leadsList, setLeadsList] = useState<Lead[]>(leads);

  // Resend Direct Email Modal State
  const [selectedEmailLead, setSelectedEmailLead] = useState<Lead | null>(null);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    setLeadsList(leads);
  }, [leads]);

  const openEmailModal = (lead: Lead) => {
    setSelectedEmailLead(lead);
    setEmailSubject(`Follow-up regarding your Geekvista inquiry`);
    setEmailMessage(`Hello ${lead.name || 'Valued Customer'},\n\nThank you for reaching out through our AI Chatbot! How can we assist you today?`);
  };

  const handleSendResendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmailLead) return;

    setSendingEmail(true);
    setToastMessage(null);

    try {
      const res = await fetch('/api/leads/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadEmail: selectedEmailLead.email,
          leadName: selectedEmailLead.name,
          subject: emailSubject,
          message: emailMessage,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setToastMessage({
          type: 'success',
          text: `Email successfully delivered to ${selectedEmailLead.email} via Resend Server!`
        });
        setTimeout(() => {
          setSelectedEmailLead(null);
          setToastMessage(null);
        }, 2500);
      } else {
        setToastMessage({
          type: 'error',
          text: data.error || 'Failed to send email via Resend API.'
        });
      }
    } catch (err: any) {
      console.error(err);
      setToastMessage({
        type: 'error',
        text: 'Network error sending email via Resend server.'
      });
    } finally {
      setSendingEmail(false);
    }
  };

  const handleDeleteLead = async (id: string) => {
    if (!confirm('Are you sure you want to delete this captured lead?')) return;

    try {
      const res = await fetch(`/api/leads?id=${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setLeadsList(prev => prev.filter(l => l.id !== id));
      } else {
        alert('Failed to delete lead.');
      }
    } catch (err) {
      console.error(err);
      alert('Error deleting lead.');
    }
  };

  const exportToCSV = () => {
    const headers = ['Contact Name', 'Email Address', 'Phone Number', 'Company Name', 'Captured Date'];
    const csvContent = [
      headers.join(','),
      ...leadsList.map(l => [
        `"${(l.name || '').replace(/"/g, '""')}"`,
        `"${(l.email || '').replace(/"/g, '""')}"`,
        `"${(l.phone || '').replace(/"/g, '""')}"`,
        `"${(l.company || '').replace(/"/g, '""')}"`,
        `"${new Date(l.createdAt).toLocaleDateString()}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'captured_leads.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Captured Leads</h2>
          <p className="text-slate-500 text-xs mt-0.5">Review potential customers and send direct emails via Resend server integration.</p>
        </div>
        {isAdmin && leadsList.length > 0 && (
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-slate-800 transition shadow-xs cursor-pointer"
          >
            <Download className="h-4 w-4" />
            Export to Excel
          </button>
        )}
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs text-slate-700">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[11px] tracking-wider">
                <th className="p-3.5">Contact Name</th>
                <th className="p-3.5">Email Address</th>
                <th className="p-3.5">Phone Number</th>
                <th className="p-3.5">Company Name</th>
                <th className="p-3.5">Captured Date</th>
                <th className="p-3.5 text-center">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {leadsList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400 italic text-xs">
                    No captured leads available.
                  </td>
                </tr>
              ) : (
                leadsList.map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-50/70 transition">
                    <td className="p-3.5 text-slate-900 font-semibold flex items-center gap-2">
                      <div className="h-7 w-7 rounded-full bg-[#1E3A8A]/10 flex items-center justify-center text-[#1E3A8A] text-xs font-bold border border-[#1E3A8A]/20">
                        {lead.name?.substring(0, 1).toUpperCase() || 'C'}
                      </div>
                      <span>{lead.name || 'Captured Contact'}</span>
                    </td>
                    <td className="p-3.5">
                      <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                        <Mail className="h-3.5 w-3.5 text-slate-400" />
                        <span>{lead.email}</span>
                      </div>
                    </td>
                    <td className="p-3.5 text-slate-600">
                      {lead.phone ? (
                        <div className="flex items-center gap-1.5">
                          <Phone className="h-3.5 w-3.5 text-slate-400" />
                          <span>{lead.phone}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="p-3.5 text-slate-600">
                      {lead.company ? (
                        <div className="flex items-center gap-1.5">
                          <Building className="h-3.5 w-3.5 text-slate-400" />
                          <span>{lead.company}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="p-3.5 text-xs text-slate-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        <span>{new Date(lead.createdAt).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="p-3.5 text-center">
                      <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                        <UserCheck className="h-3 w-3 text-emerald-600" /> New Lead
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => openEmailModal(lead)}
                          className="inline-flex items-center gap-1 bg-[#F97316] text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-[#EA580C] transition shadow-2xs cursor-pointer"
                          title="Send Email via Resend Server"
                        >
                          <Mail className="h-3.5 w-3.5" /> Email
                        </button>
                        <button
                          onClick={() => handleDeleteLead(lead.id)}
                          className="inline-flex items-center gap-1 bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 px-2.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer"
                          title="Delete Lead"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Resend Server Direct Email Modal */}
      {selectedEmailLead && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-xl w-full max-w-lg overflow-hidden shadow-xl text-xs text-slate-700 animate-fadeIn">
            
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-[#F97316]/10 flex items-center justify-center text-[#F97316]">
                  <Mail className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Send Direct Email</h3>
                  <p className="text-[10px] text-slate-400">Delivered directly to customer inbox</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedEmailLead(null)} 
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSendResendEmail} className="p-5 space-y-4">
              {toastMessage && (
                <div className={`p-3 rounded-lg border flex items-center gap-2 text-xs font-semibold ${
                  toastMessage.type === 'success' 
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                    : 'bg-rose-50 text-rose-800 border-rose-200'
                }`}>
                  {toastMessage.type === 'success' ? <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" /> : <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />}
                  <span>{toastMessage.text}</span>
                </div>
              )}

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">
                  To Recipient
                </label>
                <input
                  type="text"
                  readOnly
                  value={`${selectedEmailLead.name || 'Lead'} (${selectedEmailLead.email})`}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-700 font-medium focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">
                  Email Subject *
                </label>
                <input
                  type="text"
                  required
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#F97316]"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">
                  Message Content *
                </label>
                <textarea
                  required
                  rows={5}
                  value={emailMessage}
                  onChange={(e) => setEmailMessage(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-3 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#F97316] leading-relaxed"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setSelectedEmailLead(null)}
                  className="px-3.5 py-2 border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sendingEmail}
                  className="flex items-center gap-1.5 bg-[#F97316] hover:bg-[#ea580c] text-white font-bold border border-slate-900 shadow-xs rounded-lg px-4 py-2 text-xs transition cursor-pointer disabled:opacity-50"
                >
                  {sendingEmail ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Sending Email...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-3.5 w-3.5" />
                      <span>Send Email</span>
                    </>
                  )}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </div>
  );
}
