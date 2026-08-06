'use client';

import React from 'react';
import { Mail, Phone, Building, Calendar, UserCheck } from 'lucide-react';

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
}

export default function Leads({ leads }: LeadsProps) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Captured Leads</h2>
        <p className="text-slate-500 text-xs mt-0.5">Review potential customers and buyers details captured by chatbot conversations.</p>
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
                <th className="p-3.5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {leads.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400 italic text-xs">
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
                    <td className="p-3.5 text-right">
                      <span className="inline-flex items-center gap-1 bg-blue-50 text-[#1E3A8A] border border-blue-200 px-2 py-0.5 rounded-full text-[10px] font-bold">
                        <UserCheck className="h-3 w-3 text-[#F97316]" /> New Lead
                      </span>
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

