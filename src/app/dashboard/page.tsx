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
import { Loader2 } from 'lucide-react';

export default function DashboardLayout() {
  const { session, loading } = useAuth();
  const router = useRouter();
  const [currentTab, setCurrentTab] = useState('overview');

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
      <div className="flex min-h-screen items-center justify-center bg-[#141920] text-zinc-400">
        <div className="text-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-500" />
          <p className="text-sm font-medium">Loading workspace console...</p>
        </div>
      </div>
    );
  }

  const activeAgent = agents.find(a => a.id === selectedAgentId);
  const activeAgentName = activeAgent ? activeAgent.name : 'No Agent Selected';

  return (
    <div className="dark flex h-screen bg-[#141920] text-zinc-100 overflow-hidden">
      {/* Sidebar Nav */}
      <Sidebar 
        currentTab={currentTab} 
        setCurrentTab={setCurrentTab} 
        agentsCount={agents.length} 
      />

      {/* Main Content Workspace */}
      <main className="flex-1 overflow-y-auto p-8 bg-[#141920]">
        {/* Workspace select header when agents exist */}
        {agents.length > 0 && (
          <div className="mb-6 flex justify-end gap-3 items-center text-xs">
            <span className="text-zinc-550 font-semibold uppercase tracking-wider">Active Scope Agent:</span>
            <select
              value={selectedAgentId || ''}
              onChange={(e) => handleSelectAgent(e.target.value)}
              className="bg-white border border-zinc-200 rounded-lg px-3 py-1.5 text-zinc-750 font-semibold focus:outline-none focus:ring-1 focus:ring-blue-600 cursor-pointer"
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

        {currentTab === 'api_keys' && selectedAgentId && (
          <SettingsTab agentId={selectedAgentId} />
        )}
      </main>
    </div>
  );
}
