'use client';

import React from 'react';
import { 
  Users, 
  MessageSquare, 
  MousePointer, 
  TrendingUp,
  ArrowUpRight,
  ShieldCheck
} from 'lucide-react';

interface StatsProps {
  stats: {
    visitorsCount: number;
    chatsCount: number;
    messagesCount: number;
    avgResponseTime: string;
    leadCount: number;
    unansweredQuestions: string[];
    popularPages: { url: string; count: number }[];
  };
  agentName: string;
}

export default function Overview({ stats, agentName }: StatsProps) {
  const cards = [
    { title: 'Total Visitors', value: stats.visitorsCount, icon: Users, change: '+12.3%', color: 'text-[#1E3A8A] bg-blue-50 border-blue-100' },
    { title: 'Active Chats', value: stats.chatsCount, icon: MessageSquare, change: '+8.4%', color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
    { title: 'Total Messages', value: stats.messagesCount, icon: MousePointer, change: '+14.1%', color: 'text-indigo-600 bg-indigo-50 border-indigo-100' },
    { title: 'Avg Response Time', value: stats.avgResponseTime, icon: TrendingUp, change: '-0.3s', color: 'text-[#F97316] bg-orange-50 border-orange-100' },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Welcome Banner */}
      <div className="flex flex-wrap justify-between items-center bg-white border border-slate-200 rounded-xl p-5 shadow-xs gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Agent Overview: {agentName}</h2>
          <p className="text-slate-500 text-xs mt-0.5">Real-time usage analytics, response metrics and indexed content diagnostics.</p>
        </div>
        <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg text-emerald-700 text-xs font-semibold">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          System Operational
        </div>
      </div>

      {/* Grid of Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col justify-between hover:border-slate-300 transition">
              <div className="flex justify-between items-start">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{card.title}</span>
                <div className={`p-1.5 rounded-lg border ${card.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-slate-900">{card.value}</span>
                <span className="text-xs text-emerald-600 flex items-center font-semibold">
                  {card.change}
                  <ArrowUpRight className="h-3 w-3 ml-0.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Left Column: Popular Pages */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-3">Top Pages Visited by Bot</h3>
          <div className="space-y-2.5">
            {stats.popularPages.map((page, idx) => (
              <div key={idx} className="flex justify-between items-center p-2.5 rounded-lg bg-slate-50 border border-slate-200/80">
                <span className="text-xs font-mono text-slate-800 truncate max-w-[240px]">{page.url}</span>
                <span className="bg-white text-[11px] px-2.5 py-0.5 rounded-full text-[#1E3A8A] font-semibold border border-slate-200 shadow-xs">
                  {page.count} requests
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Unanswered Questions */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-3">Unanswered / Fallback Questions</h3>
          <div className="space-y-2.5">
            {stats.unansweredQuestions.map((q, idx) => (
              <div key={idx} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 flex justify-between items-center">
                <span className="text-xs text-slate-800 truncate max-w-[240px]">{q}</span>
                <span className="bg-orange-50 text-[#F97316] border border-orange-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  Needs Training
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

