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
    { title: 'Total Visitors', value: stats.visitorsCount, icon: Users, change: '+12.3%', color: 'text-blue-600' },
    { title: 'Active Chats', value: stats.chatsCount, icon: MessageSquare, change: '+8.4%', color: 'text-green-600' },
    { title: 'Total Messages', value: stats.messagesCount, icon: MousePointer, change: '+14.1%', color: 'text-purple-650' },
    { title: 'Avg Response Time', value: stats.avgResponseTime, icon: TrendingUp, change: '-0.3s', color: 'text-orange-600' },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Welcome Banner */}
      <div className="flex justify-between items-center bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900">Agent Overview: {agentName}</h2>
          <p className="text-zinc-550 text-sm mt-1">Real-time usage analytics, response metrics and indexed content diagnostics.</p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-xl text-emerald-600 text-sm font-semibold">
          <ShieldCheck className="h-4 w-4" />
          System Operational
        </div>
      </div>

      {/* Grid of Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:border-zinc-300 transition">
              <div className="flex justify-between items-start">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">{card.title}</span>
                <div className={`p-2 rounded-lg bg-zinc-50 border border-zinc-200 ${card.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-3xl font-bold text-zinc-900">{card.value}</span>
                <span className="text-xs text-emerald-600 flex items-center font-medium">
                  {card.change}
                  <ArrowUpRight className="h-3 w-3 ml-0.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: Popular Pages */}
        <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-zinc-900 mb-4">Top Pages Visited by Bot</h3>
          <div className="space-y-3">
            {stats.popularPages.map((page, idx) => (
              <div key={idx} className="flex justify-between items-center p-3 rounded-lg bg-zinc-50 border border-zinc-200">
                <span className="text-sm font-mono text-zinc-800 truncate">{page.url}</span>
                <span className="bg-white text-xs px-2.5 py-1 rounded-full text-blue-600 font-semibold border border-zinc-200">
                  {page.count} requests
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Unanswered Questions */}
        <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-zinc-900 mb-4">Unanswered / Fallback Questions</h3>
          <div className="space-y-3">
            {stats.unansweredQuestions.map((q, idx) => (
              <div key={idx} className="p-3 rounded-lg bg-zinc-50 border border-zinc-200 flex justify-between items-center">
                <span className="text-sm text-zinc-800 truncate">{q}</span>
                <span className="bg-orange-50 text-orange-600 border border-orange-200 text-xs px-2.5 py-1 rounded-full">
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
