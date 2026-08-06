'use client';

import React from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { 
  Bot, 
  BookOpen, 
  MessageSquare, 
  BarChart2, 
  Users, 
  Code, 
  Key, 
  Settings as SettingsIcon, 
  LogOut,
  User,
  Calendar,
  Briefcase,
  Clock
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  agentsCount: number;
}

export default function Sidebar({ currentTab, setCurrentTab, agentsCount }: SidebarProps) {
  const { session, logout } = useAuth();

  const navigationItems = [
    { id: 'overview', name: 'Dashboard', icon: BarChart2 },
    { id: 'agents', name: 'Agents', icon: Bot, badge: agentsCount > 0 ? agentsCount : undefined },
    { id: 'training', name: 'Training', icon: BookOpen },
    { id: 'conversations', name: 'Conversations', icon: MessageSquare },
    { id: 'leads', name: 'Leads', icon: Users },
    { id: 'bookings', name: 'Bookings', icon: Calendar },
    { id: 'services', name: 'Services', icon: Briefcase },
    { id: 'business_hours', name: 'Business Hours', icon: Clock },
    { id: 'widget', name: 'Widget Settings', icon: Code },
    { id: 'settings', name: 'Settings', icon: SettingsIcon },
  ];

  return (
    <aside className="w-64 border-r border-slate-200 bg-white flex flex-col text-slate-700 shadow-sm">
      {/* Brand Header */}
      <div className="h-16 px-6 border-b border-slate-200 flex items-center gap-3 bg-white">
        <div className="h-9 w-9 rounded-lg bg-[#F97316] flex items-center justify-center text-white border border-slate-900 shadow-sm">
          <Bot className="h-5 w-5 text-white" />
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-slate-900 text-base tracking-tight leading-tight">AICHAT</span>
          <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Console</span>
        </div>
      </div>

      {/* User Section */}
      <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/80 flex items-center gap-3">
        <div className="h-8 w-8 rounded-full bg-[#1E3A8A]/10 flex items-center justify-center border border-[#1E3A8A]/20 text-[#1E3A8A] font-bold text-xs uppercase">
          {session?.email?.substring(0, 2) || 'US'}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-slate-900 truncate">{session?.email?.split('@')[0] || 'User'}</p>
          <p className="text-[11px] text-slate-500 truncate">{session?.email || 'admin@geekvista.com'}</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer ${
                isActive 
                  ? 'bg-slate-100 text-[#1E3A8A] border-l-4 border-[#F97316] shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`h-4 w-4 ${isActive ? 'text-[#F97316]' : 'text-slate-400'}`} />
                <span>{item.name}</span>
              </div>
              {item.badge !== undefined && (
                <span className="bg-slate-200 text-[#1E3A8A] text-[10px] px-2 py-0.5 rounded-full font-bold">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Logout Footer */}
      <div className="p-3 border-t border-slate-200 bg-white">
        <button
          onClick={logout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 transition duration-150 cursor-pointer"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}

