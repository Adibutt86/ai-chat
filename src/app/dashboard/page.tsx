'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';
import Sidebar from '@/app/components/Sidebar';
import Overview from '@/app/components/Overview';
import AgentsManager from '@/app/components/AgentsManager';
import TrainingManager from '@/app/components/TrainingManager';
import ConversationsManager from '@/app/components/ConversationsManager';
import Leads from '@/app/components/Leads';
import WidgetCustomizer from '@/app/components/WidgetCustomizer';
import SettingsTab from '@/app/components/SettingsTab';
import BookingsManager from '@/app/components/BookingsManager';
import ServicesManager from '@/app/components/ServicesManager';
import BusinessHoursManager from '@/app/components/BusinessHoursManager';
import { canAccessTab } from '@/lib/permissions';
import { Loader2 } from 'lucide-react';

export default function DashboardLayout() {
  const { session, loading } = useAuth();
  const router = useRouter();
  const [currentTab, setCurrentTabState] = useState('overview');

  const userRole = session?.role || 'user';

  // Restore active tab from URL query parameter or localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const urlParams = new URLSearchParams(window.location.search);
    const tabFromUrl = urlParams.get('tab');
    const savedTab = localStorage.getItem('dashboard_active_tab');

    const validTabs = [
      'overview',
      'agents',
      'training',
      'conversations',
      'leads',
      'bookings',
      'services',
      'business_hours',
      'widget',
      'settings'
    ];

    let activeTab = 'overview';
    if (tabFromUrl && validTabs.includes(tabFromUrl)) {
      activeTab = tabFromUrl;
    } else if (savedTab && validTabs.includes(savedTab)) {
      activeTab = savedTab;
    }

    // Verify role permissions for requested tab
    if (!canAccessTab(userRole, activeTab)) {
      activeTab = 'overview';
    }

    setCurrentTabState(activeTab);

    // Sync URL query parameter without page reload
    const newUrl = `${window.location.pathname}?tab=${activeTab}`;
    window.history.replaceState(null, '', newUrl);
  }, [userRole]);

  const setCurrentTab = (tab: string) => {
    if (!canAccessTab(userRole, tab)) return;
    setCurrentTabState(tab);
    if (typeof window !== 'undefined') {
      localStorage.setItem('dashboard_active_tab', tab);
      const newUrl = `${window.location.pathname}?tab=${tab}`;
      window.history.replaceState(null, '', newUrl);
    }
  };

  // Dashboard Data State
  const [agents, setAgents] = useState<any[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [leads, setLeads] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  const fetchAgents = async () => {
    try {
      const res = await fetch('/api/agents');
      if (res.ok) {
        const data = await res.json();
        setAgents(data);
        if (data.length > 0 && !selectedAgentId) {
          setSelectedAgentId(data[0].id);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAnalytics = async () => {
    if (!selectedAgentId) return;
    try {
      const res = await fetch(`/api/analytics?agentId=${selectedAgentId}`);
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data.analytics);
        setLeads(data.leads || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!loading && !session) {
      router.replace('/login');
    }
  }, [session, loading, router]);

  useEffect(() => {
    if (session) {
      fetchAgents().then(() => setDataLoading(false));
    }
  }, [session]);

  useEffect(() => {
    if (selectedAgentId) {
      fetchAnalytics();
    }
  }, [selectedAgentId]);

  // Dynamically load the selected agent's custom widget
  useEffect(() => {
    if (!selectedAgentId) return;

    const cleanupWidget = () => {
      const container = document.getElementById('chatbox-widget-container');
      if (container) container.remove();

      // Clean up styles injected by previous script runs
      const styles = document.querySelectorAll('style');
      styles.forEach((style) => {
        if (
          style.innerHTML.includes('#chatbox-widget-container') ||
          style.innerHTML.includes('#chatbox-launcher')
        ) {
          style.remove();
        }
      });
    };

    cleanupWidget();

    const script = document.createElement('script');
    script.src = `/chatbox-widget.js?t=${Date.now()}`;
    script.setAttribute('data-agent-id', selectedAgentId);
    script.setAttribute('data-dashboard', 'true');
    script.async = true;
    document.body.appendChild(script);

    return () => {
      cleanupWidget();
      script.remove();
    };
  }, [selectedAgentId]);

  const handleSelectAgent = (id: string) => {
    setSelectedAgentId(id);
  };

  const handleCreateAgent = async (agentData: any) => {
    try {
      const res = await fetch('/api/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(agentData),
      });
      if (res.ok) {
        await fetchAgents();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateAgent = async (agentData: any) => {
    try {
      const res = await fetch('/api/agents', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(agentData),
      });
      if (res.ok) {
        await fetchAgents();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteAgent = async (id: string) => {
    try {
      const res = await fetch(`/api/agents?agentId=${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        if (selectedAgentId === id) {
          setSelectedAgentId(null);
        }
        await fetchAgents();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading || dataLoading) {
    return (
      <div 
        className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-500"
        style={{ fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}
      >
        <div className="text-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-[#F97316]" />
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-600">Loading workspace console...</p>
        </div>
      </div>
    );
  }

  const activeAgent = agents.find(a => a.id === selectedAgentId);
  const activeAgentName = activeAgent ? activeAgent.name : 'No Agent Selected';

  return (
    <div 
      className="flex h-screen bg-[#F8FAFC] text-slate-800 overflow-hidden font-sans"
      style={{ fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}
    >
      {/* Sidebar Nav */}
      <Sidebar 
        currentTab={currentTab} 
        setCurrentTab={setCurrentTab} 
        agentsCount={agents.length} 
      />

      {/* Main Content Workspace */}
      <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-[#F8FAFC]">
        {/* Workspace select header when agents exist */}
        {agents.length > 0 && (
          <div className="mb-6 flex justify-end gap-3 items-center text-xs">
            <span className="text-slate-500 font-semibold uppercase tracking-wider text-[11px]">Active Scope Agent:</span>
            <select
              value={selectedAgentId || ''}
              onChange={(e) => handleSelectAgent(e.target.value)}
              className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-[#F97316] cursor-pointer shadow-sm text-xs"
            >
              {agents.map((agent) => (
                <option key={agent.id} value={agent.id}>
                  {agent.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Dynamic view router */}
        {currentTab === 'overview' && analytics && (
          <Overview stats={analytics} agentName={activeAgentName} />
        )}

        {currentTab === 'agents' && (
          <AgentsManager 
            agents={agents}
            selectedAgentId={selectedAgentId}
            onSelectAgent={handleSelectAgent}
            onCreateAgent={handleCreateAgent}
            onUpdateAgent={handleUpdateAgent}
            onDeleteAgent={handleDeleteAgent}
          />
        )}

        {currentTab === 'training' && selectedAgentId && (
          <TrainingManager agentId={selectedAgentId} />
        )}

        {currentTab === 'conversations' && selectedAgentId && (
          <ConversationsManager agentId={selectedAgentId} />
        )}

        {currentTab === 'leads' && (
          <Leads leads={leads} />
        )}

        {currentTab === 'widget' && selectedAgentId && (
          <WidgetCustomizer agentId={selectedAgentId} />
        )}

        {currentTab === 'bookings' && selectedAgentId && (
          <BookingsManager agentId={selectedAgentId} />
        )}

        {currentTab === 'services' && (
          <ServicesManager />
        )}

        {currentTab === 'business_hours' && (
          <BusinessHoursManager />
        )}

        {currentTab === 'settings' && selectedAgentId && (
          <SettingsTab agentId={selectedAgentId} />
        )}
      </main>
    </div>
  );
}

