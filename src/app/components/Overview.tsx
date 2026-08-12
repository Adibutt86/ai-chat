'use client';

import React from 'react';
import { 
  Bot, 
  BookOpen, 
  MessageSquare, 
  Code, 
  Calendar, 
  ShieldCheck, 
  ArrowRight,
  Sparkles,
  Layers,
  Clock
} from 'lucide-react';

interface OverviewProps {
  stats?: any;
  agentName: string;
  userRole: string;
  setCurrentTab?: (tab: string) => void;
}

export default function Overview({ agentName, userRole, setCurrentTab }: OverviewProps) {
  const handleNav = (tab: string) => {
    if (setCurrentTab) {
      setCurrentTab(tab);
    }
  };

  const quickActions = [
    {
      id: 'training',
      title: 'Knowledge Base & Training',
      description: 'Index website URLs, FAQs, manuals, and custom text documents for your agent.',
      icon: BookOpen,
      color: 'text-blue-600 bg-blue-50 border-blue-200 hover:bg-blue-100',
      badge: 'Knowledge Engine'
    },
    {
      id: 'conversations',
      title: 'Live Conversations',
      description: 'Review real-time chats, customer questions, and chat history.',
      icon: MessageSquare,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200 hover:bg-emerald-100',
      badge: 'Inbox'
    },
    {
      id: 'widget',
      title: 'Widget Customization',
      description: 'Customize launcher theme, brand colors, avatar, position, and embedded styles.',
      icon: Code,
      color: 'text-indigo-600 bg-indigo-50 border-indigo-200 hover:bg-indigo-100',
      badge: 'Appearance'
    },
    {
      id: 'bookings',
      title: 'Bookings & Scheduling',
      description: 'Manage appointment slots, customer bookings, and Google Calendar sync.',
      icon: Calendar,
      color: 'text-orange-600 bg-orange-50 border-orange-200 hover:bg-orange-100',
      badge: 'Appointments'
    }
  ];

  return (
    <div className="space-y-6 animate-fadeIn max-w-6xl">
      {/* Active Agent Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-wrap justify-between items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="bg-[#1E3A8A] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Active Scope
            </span>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">{agentName}</h2>
          </div>
          <p className="text-slate-500 text-xs">
            Manage agent configuration, train knowledge base, customize chat widget, and view customer logs.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3.5 py-2 rounded-lg text-emerald-700 text-xs font-semibold">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          <span>Agent Online & Ready</span>
        </div>
      </div>

      {/* Quick Action Hub Header */}
      <div>
        <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[#F97316]" />
          Agent Quick Management Hub
        </h3>
        <p className="text-slate-500 text-xs mt-0.5">Quickly access key tools to configure and deploy your AI agent.</p>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.id}
              onClick={() => handleNav(action.id)}
              className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs text-left hover:border-slate-300 hover:shadow-md transition-all duration-150 group cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2.5 rounded-xl border ${action.color} transition-colors`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-full">
                    {action.badge}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 group-hover:text-[#F97316] transition-colors flex items-center gap-1.5">
                  {action.title}
                </h4>
                <p className="text-slate-500 text-xs mt-1 leading-relaxed">
                  {action.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center text-xs font-semibold text-[#1E3A8A] group-hover:text-[#F97316] transition-colors">
                <span>Open {action.title}</span>
                <ArrowRight className="h-3.5 w-3.5 ml-1 transition-transform group-hover:translate-x-1" />
              </div>
            </button>
          );
        })}
      </div>

      {/* Workspace Status Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
          <Layers className="h-3.5 w-3.5 text-slate-400" />
          Workspace Configuration Summary
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Scope Agent</span>
            <span className="text-xs font-bold text-slate-900 mt-1 block truncate">{agentName}</span>
          </div>
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Access Role</span>
            <span className="text-xs font-bold text-slate-900 mt-1 block capitalize">{userRole}</span>
          </div>
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Widget Script</span>
            <span className="text-xs font-bold text-emerald-700 mt-1 flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Active & Loaded
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
