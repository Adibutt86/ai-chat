'use client';

import React, { useState } from 'react';
import { Bot, Plus, Check, Trash2, Edit } from 'lucide-react';

interface Agent {
  id: string;
  name: string;
  description: string | null;
  themeColor: string;
  model: string;
  temperature: number;
  systemPrompt?: string;
}

interface AgentsManagerProps {
  agents: Agent[];
  selectedAgentId: string | null;
  onSelectAgent: (id: string) => void;
  onCreateAgent: (agentData: any) => Promise<void>;
  onUpdateAgent: (agentData: any) => Promise<void>;
  onDeleteAgent?: (id: string) => Promise<void>;
}

export default function AgentsManager({
  agents,
  selectedAgentId,
  onSelectAgent,
  onCreateAgent,
  onUpdateAgent,
  onDeleteAgent,
}: AgentsManagerProps) {
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editAgentId, setEditAgentId] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [themeColor, setThemeColor] = useState('#2563eb');
  const [model, setModel] = useState('gemini-2.5-flash');
  const [temperature, setTemperature] = useState(0.7);
  const [systemPrompt, setSystemPrompt] = useState(
    "You are a helpful AI assistant. Answer questions based on the provided context. If the answer is not in the context, say 'I don't have enough information. Please contact support.'"
  );

  const handleCreateClick = () => {
    setIsEditMode(false);
    setEditAgentId(null);
    setName('');
    setDescription('');
    setThemeColor('#2563eb');
    setModel('gemini-2.5-flash');
    setTemperature(0.7);
    setSystemPrompt(
      "You are a helpful AI assistant. Answer questions based on the provided context. If the answer is not in the context, say 'I don't have enough information. Please contact support.'"
    );
    setShowModal(true);
  };

  const handleEditClick = (e: React.MouseEvent, agent: Agent) => {
    e.stopPropagation(); // Avoid triggering selection click
    setIsEditMode(true);
    setEditAgentId(agent.id);
    setName(agent.name);
    setDescription(agent.description || '');
    setThemeColor(agent.themeColor || '#2563eb');
    setModel(agent.model || 'gemini-2.5-flash');
    setTemperature(agent.temperature !== undefined ? agent.temperature : 0.7);
    setSystemPrompt(
      agent.systemPrompt ||
        "You are a helpful AI assistant. Answer questions based on the provided context."
    );
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      name,
      description,
      themeColor,
      model,
      temperature,
      systemPrompt,
    };

    if (isEditMode && editAgentId) {
      await onUpdateAgent({ id: editAgentId, ...data });
    } else {
      await onCreateAgent(data);
    }
    
    setShowModal(false);
    setName('');
    setDescription('');
  };

  const handleDelete = async (e: React.MouseEvent, agentId: string) => {
    e.stopPropagation(); // Avoid triggering selection click
    if (confirm('Are you sure you want to permanently delete this agent? All associated documents and chats will be removed.')) {
      if (onDeleteAgent) {
        await onDeleteAgent(agentId);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">AI Agents</h2>
          <p className="text-zinc-400 text-sm">Configure, deploy, and select different personas/models for your chatbots.</p>
        </div>
        <button
          onClick={handleCreateClick}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition duration-150"
        >
          <Plus className="h-4 w-4" />
          Create Agent
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {agents.map((agent) => {
          const isSelected = selectedAgentId === agent.id;
          return (
            <div
              key={agent.id}
              onClick={() => onSelectAgent(agent.id)}
              className={`cursor-pointer rounded-2xl border p-6 transition flex flex-col justify-between group relative ${
                isSelected
                  ? 'border-blue-500 bg-zinc-900 shadow-md ring-1 ring-blue-500'
                  : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700'
              }`}
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div
                    className="h-10 w-10 rounded-xl flex items-center justify-center text-white"
                    style={{ backgroundColor: agent.themeColor }}
                  >
                    <Bot className="h-5 w-5" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    {isSelected && (
                      <span className="bg-blue-950 text-blue-400 border border-blue-900 px-2 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1 mr-1">
                        <Check className="h-3 w-3" /> Active
                      </span>
                    )}
                    <button
                      onClick={(e) => handleEditClick(e, agent)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 bg-zinc-800 hover:bg-zinc-750 text-zinc-300 hover:text-white rounded-lg transition duration-150 border border-zinc-700"
                      title="Edit Agent"
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </button>
                    {agents.length > 1 && (
                      <button
                        onClick={(e) => handleDelete(e, agent.id)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 bg-red-950/40 hover:bg-red-950 text-red-500 hover:text-white rounded-lg transition duration-150 border border-red-900/50"
                        title="Delete Agent"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
                <h3 className="text-lg font-bold text-white">{agent.name}</h3>
                <p className="text-zinc-400 text-xs mt-2 line-clamp-2">
                  {agent.description || 'No custom agent description.'}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-zinc-800 flex justify-between items-center text-zinc-500 text-xs">
                <span>Model: {agent.model}</span>
                <span>Temp: {agent.temperature}</span>
              </div>
            </div>
          );
        })}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-zinc-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-xl bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-2xl space-y-6">
            <h3 className="text-xl font-bold text-white">
              {isEditMode ? 'Edit Agent Properties' : 'Create New Agent'}
            </h3>

            {/* Custom creation/configuration instructions guide */}
            <div className="bg-blue-950/30 border border-blue-900/40 p-4 rounded-xl text-xs text-blue-300 space-y-2">
              <span className="font-semibold text-white block">💡 Setup Instructions:</span>
              <ul className="list-disc pl-4 space-y-1">
                <li><strong>System Instructions</strong>: Define the chatbot's instructions, scope, boundaries, and tone of voice.</li>
                <li><strong>AI Model</strong>: Use <em>Gemini 2.5 Flash</em> for fast response streaming, or <em>Gemini 2.5 Pro</em> for complex query tasks.</li>
                <li><strong>Temperature</strong>: Lower settings (0.1–0.3) provide precise, factual RAG answers. Higher settings (0.7+) make it more conversational.</li>
              </ul>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-sm text-zinc-200">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-zinc-500 font-semibold mb-1">Agent Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-zinc-500 font-semibold mb-1">Theme Color</label>
                  <input
                    type="color"
                    value={themeColor}
                    onChange={(e) => setThemeColor(e.target.value)}
                    className="w-full h-10 bg-zinc-950 border border-zinc-800 rounded-lg cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-zinc-500 font-semibold mb-1">Description</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                  placeholder="e.g. Sales specialist assistant"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-zinc-500 font-semibold mb-1">AI Model</label>
                  <select
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                  >
                    <option value="gemini-2.5-flash">Gemini 2.5 Flash (Recommended)</option>
                    <option value="gemini-2.5-pro">Gemini 2.5 Pro</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-zinc-500 font-semibold mb-1">Temperature ({temperature})</label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={temperature}
                    onChange={(e) => setTemperature(parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-zinc-500 font-semibold mb-1">System Instructions</label>
                <textarea
                  rows={4}
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white font-mono text-xs focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded-lg text-white font-medium transition duration-150"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-white font-medium transition duration-150"
                >
                  {isEditMode ? 'Save Changes' : 'Create Agent'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
