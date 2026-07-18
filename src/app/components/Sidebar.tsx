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
    { id: 'api_keys', name: 'API Keys', icon: Key },
    { id: 'settings', name: 'Settings', icon: SettingsIcon },
  ];

  return (
    <aside className="w-64 border-r border-zinc-200 bg-white flex flex-col text-zinc-700">
      {/* Brand Header */}
      <div className="h-16 px-6 border-b border-zinc-200 flex items-center gap-2">
        <Bot className="h-6 w-6 text-blue-600" />
        <span className="font-bold text-zinc-900 text-lg tracking-tight">ChatBox AI</span>
      </div>

      {/* User Section */}
      <div className="px-4 py-4 border-b border-zinc-200 flex items-center gap-3">
        <div className="h-9 w-9 rounded-full bg-zinc-200 flex items-center justify-center border border-zinc-300 text-blue-600 font-semibold uppercase">
          {session?.email?.substring(0, 2) || 'US'}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-zinc-900 truncate">{session?.email?.split('@')[0] || 'User'}</p>
          <p className="text-xs text-zinc-500 truncate">{session?.email || 'admin@chatbox.ai'}</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition duration-150 cursor-pointer ${
                isActive 
                  ? 'bg-zinc-200 text-zinc-900 border-l-2 border-blue-600' 
                  : 'text-zinc-550 hover:text-zinc-900 hover:bg-zinc-200/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`h-4 w-4 ${isActive ? 'text-blue-600' : 'text-zinc-400'}`} />
                <span>{item.name}</span>
              </div>
              {item.badge !== undefined && (
                <span className="bg-zinc-200 text-xs px-2 py-0.5 rounded-full text-zinc-600 border border-zinc-350">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Logout Footer */}
      <div className="p-4 border-t border-zinc-200">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 transition duration-150 cursor-pointer"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
