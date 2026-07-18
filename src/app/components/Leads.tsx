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
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-zinc-900">Captured Leads</h2>
        <p className="text-zinc-550 text-sm">Review potential customers and buyers details captured by chatbot conversations.</p>
      </div>

      <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm text-zinc-700">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-550 font-semibold uppercase text-xs tracking-wider">
                <th className="p-4">Contact Name</th>
                <th className="p-4">Email Address</th>
                <th className="p-4">Phone Number</th>
                <th className="p-4">Company Name</th>
                <th className="p-4">Captured Date</th>
                <th className="p-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-150">
              {leads.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-zinc-400 italic">
                    No buyer leads captured yet. Add buying-intent keywords (like "price", "premium") in chat simulation.
                  </td>
                </tr>
              ) : (
                leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-zinc-50/50 transition">
                    <td className="p-4 text-zinc-900 font-medium flex items-center gap-2">
                      <div className="h-7 w-7 rounded-full bg-zinc-100 flex items-center justify-center text-blue-650 text-xs font-semibold border border-zinc-200">
                        {lead.name?.substring(0, 1) || 'C'}
                      </div>
                      <span>{lead.name || 'Captured Contact'}</span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5 text-zinc-700">
                        <Mail className="h-3.5 w-3.5 text-zinc-400" />
                        <span>{lead.email}</span>
                      </div>
                    </td>
                    <td className="p-4 text-zinc-650">
                      {lead.phone ? (
                        <div className="flex items-center gap-1.5">
                          <Phone className="h-3.5 w-3.5 text-zinc-400" />
                          <span>{lead.phone}</span>
                        </div>
                      ) : (
                        <span className="text-zinc-400">—</span>
                      )}
                    </td>
                    <td className="p-4 text-zinc-650">
                      {lead.company ? (
                        <div className="flex items-center gap-1.5">
                          <Building className="h-3.5 w-3.5 text-zinc-400" />
                          <span>{lead.company}</span>
                        </div>
                      ) : (
                        <span className="text-zinc-400">—</span>
                      )}
                    </td>
                    <td className="p-4 text-xs text-zinc-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-zinc-400" />
                        <span>{new Date(lead.createdAt).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-600 border border-blue-200 px-2 py-0.5 rounded-full text-xs font-semibold">
                        <UserCheck className="h-3 w-3" /> New Lead
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
