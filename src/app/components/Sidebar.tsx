import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';
import { canAccessTab, isMasterAdmin } from '@/lib/permissions';
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
  Clock,
  Shield
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  agentsCount: number;
}

export default function Sidebar({ currentTab, setCurrentTab, agentsCount }: SidebarProps) {
  const { session, logout } = useAuth();
  const router = useRouter();
  const role = session?.role || 'user';
  const isMaster = isMasterAdmin(role);

  const allNavigationItems = [
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
    ...(isMaster ? [{ id: 'master_panel', name: 'Master Panel', icon: Shield }] : []),
  ];

  const navigationItems = allNavigationItems.filter(item => canAccessTab(role, item.id) || item.id === 'master_panel');

  return (
    <aside className="w-64 border-r border-slate-200 bg-white flex flex-col text-slate-700 shadow-sm">
      {/* Brand Header */}
      <div className="h-16 px-6 border-b border-slate-200 flex items-center justify-between bg-white">
        <Link href="/" className="flex items-center gap-2">
          <img src="/img/logo-main.png" alt="Geekvista AI Console" style={{ height: '36px', width: 'auto', objectFit: 'contain' }} />
        </Link>
        <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded border border-slate-200">Console</span>
      </div>

      {/* User Section */}
      <div className="px-3.5 py-2.5 border-b border-slate-200 bg-slate-50/70 flex items-center gap-2.5">
        <div className="h-8 w-8 rounded-full bg-[#1E3A8A] flex items-center justify-center text-white font-bold text-xs uppercase shrink-0 shadow-xs">
          {session?.email?.substring(0, 2) || 'US'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1">
            <p className="text-xs font-bold text-slate-900 truncate capitalize">
              {session?.email?.split('@')[0] || 'User'}
            </p>
            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0 ${
              isMasterAdmin(role) ? 'bg-[#F97316] text-white shadow-2xs' : 'bg-slate-200 text-slate-700'
            }`}>
              {isMasterAdmin(role) ? 'Master' : 'User'}
            </span>
          </div>
          <p className="text-[10px] text-slate-400 truncate leading-tight mt-0.5">{session?.email || 'admin@chatbox.ai'}</p>
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
              onClick={() => {
                if (item.id === 'master_panel') {
                  router.push('/master-panel');
                } else {
                  setCurrentTab(item.id);
                }
              }}
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

