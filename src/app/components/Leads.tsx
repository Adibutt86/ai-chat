'use client';

import React from 'react';
import { Mail, Phone, Building, Calendar, UserCheck, Download } from 'lucide-react';
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

  const exportToCSV = () => {
    const headers = ['Contact Name', 'Email Address', 'Phone Number', 'Company Name', 'Captured Date'];
    const csvContent = [
      headers.join(','),
      ...leads.map(l => [
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
    <div className="space-y-5">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Captured Leads</h2>
          <p className="text-slate-500 text-xs mt-0.5">Review potential customers and buyers details captured by chatbot conversations.</p>
        </div>
        {isAdmin && leads.length > 0 && (
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-800 transition shadow-sm"
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
              {leads.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400 italic text-xs">
                    No buyer leads captured yet. Add buying-intent keywords in chat simulation.
                  </td>
                </tr>
              ) : (
                leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-50/70 transition">
                    <td className="p-3.5 text-slate-900 font-semibold flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-[#1E3A8A]/10 flex items-center justify-center text-[#1E3A8A] text-[10px] font-bold border border-[#1E3A8A]/20">
                        {lead.name?.substring(0, 1) || 'C'}
                      </div>
                      <span>{lead.name || 'Captured Contact'}</span>
                    </td>
                    <td className="p-3.5">
                      <div className="flex items-center gap-1.5 text-slate-700">
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
                      <span className="inline-flex items-center gap-1 bg-blue-50 text-[#1E3A8A] border border-blue-200 px-2 py-0.5 rounded-full text-[10px] font-bold">
                        <UserCheck className="h-3 w-3 text-[#F97316]" /> New Lead
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <a href={`mailto:${lead.email}`} className="inline-flex items-center gap-1.5 bg-[#F97316] text-white px-3 py-1.5 rounded-lg text-[11px] font-bold hover:bg-[#EA580C] transition shadow-xs">
                        <Mail className="h-3.5 w-3.5" /> Email
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

