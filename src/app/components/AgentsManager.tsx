'use client';
// Anthropic Claude Agent Properties Manager

import React, { useState } from 'react';
import { Bot, Plus, Check, Trash2, Edit, Upload } from 'lucide-react';

interface Agent {
  id: string;
  name: string;
  description: string | null;
  avatarUrl?: string | null;
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
  const [avatarUrl, setAvatarUrl] = useState('');
  const [themeColor, setThemeColor] = useState('#2563eb');
  const [model, setModel] = useState('claude-3-5-sonnet-20241022');
  const [temperature, setTemperature] = useState(0.7);
  const [systemPrompt, setSystemPrompt] = useState(
    "You are a helpful AI assistant. Answer questions based on the provided context. If the answer is not in the context, say 'I don't have enough information. Please contact support.'"
  );

  const handleCreateClick = () => {
    setIsEditMode(false);
    setEditAgentId(null);
    setName('');
    setDescription('');
    setAvatarUrl('');
    setThemeColor('#2563eb');
    setModel('claude-3-5-sonnet-20241022');
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
    setAvatarUrl(agent.avatarUrl || '');
    setThemeColor(agent.themeColor || '#2563eb');
    setModel(agent.model || 'claude-3-5-sonnet-20241022');
    setTemperature(agent.temperature !== undefined ? agent.temperature : 0.7);
    setSystemPrompt(
      agent.systemPrompt ||
        "You are a helpful AI assistant. Answer questions based on the provided context."
    );
    setShowModal(true);
  };

  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const data = {
        name,
        description,
        avatarUrl,
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
    } catch (err) {
      console.error('Error saving agent properties:', err);
    } finally {
      setIsSaving(false);
    }
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
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">AI Agents</h2>
          <p className="text-slate-500 text-xs mt-0.5">Configure, deploy, and select different personas/models for your chatbots.</p>
        </div>
        <button
          onClick={handleCreateClick}
          className="flex items-center gap-2 bg-[#F97316] hover:bg-[#ea580c] text-white font-semibold shadow-xs border border-slate-900 rounded-lg px-3.5 py-1.5 text-xs transition-all"
        >
          <Plus className="h-4 w-4" />
          Create Agent
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {agents.map((agent) => {
          const isSelected = selectedAgentId === agent.id;
          return (
            <div
              key={agent.id}
              onClick={() => onSelectAgent(agent.id)}
              className={`cursor-pointer rounded-xl border p-5 transition-all flex flex-col justify-between group relative ${
                isSelected
                  ? 'border-[#1E3A8A] bg-slate-50/90 shadow-sm ring-2 ring-[#1E3A8A]/20'
                  : 'border-slate-200 bg-white hover:border-slate-300 shadow-xs'
              }`}
            >
              <div>
                <div className="flex justify-between items-start mb-3">
                  <div
                    className="h-9 w-9 rounded-lg flex items-center justify-center text-white border border-slate-900 shadow-xs"
                    style={{ backgroundColor: agent.themeColor || '#2563eb' }}
                  >
                    <Bot className="h-5 w-5" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    {isSelected && (
                      <span className="bg-blue-50 text-[#1E3A8A] border border-blue-200 px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 mr-1">
                        <Check className="h-3 w-3 text-[#F97316]" /> Active
                      </span>
                    )}
                    <button
                      onClick={(e) => handleEditClick(e, agent)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition duration-150 border border-slate-300"
                      title="Edit Agent"
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </button>
                    {agents.length > 1 && (
                      <button
                        onClick={(e) => handleDelete(e, agent.id)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition duration-150 border border-rose-200"
                        title="Delete Agent"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
                <h3 className="text-base font-bold text-slate-900">{agent.name}</h3>
                <p className="text-slate-500 text-xs mt-1.5 line-clamp-2">
                  {agent.description || 'No custom agent description.'}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-200/80 flex justify-between items-center text-slate-500 text-[11px]">
                <span className="font-mono">Model: {agent.model}</span>
                <span>Temp: {agent.temperature}</span>
              </div>
            </div>
          );
        })}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-xl bg-white border border-slate-200 rounded-xl p-6 shadow-2xl space-y-5">
            <h3 className="text-lg font-bold text-slate-900">
              {isEditMode ? 'Edit Agent Properties' : 'Create New Agent'}
            </h3>

            {/* Custom creation/configuration instructions guide */}
            <div className="bg-blue-50/70 border border-blue-200/80 p-3.5 rounded-lg text-xs text-slate-700 space-y-1.5">
              <span className="font-bold text-[#1E3A8A] block">💡 Setup Instructions:</span>
              <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-slate-600">
                <li><strong>System Instructions</strong>: Define your chatbot's persona, scope, boundaries, and tone of voice.</li>
                <li><strong>AI Model</strong>: Powered by <em>Anthropic Claude 3.5 Sonnet</em> for high-quality, intelligent responses.</li>
                <li><strong>Temperature</strong>: Lower settings (0.1–0.3) deliver exact factual answers. Higher settings (0.7+) create creative responses.</li>
              </ul>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs text-slate-700">
              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">Agent Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#F97316]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">Theme Color</label>
                  <input
                    type="color"
                    value={themeColor}
                    onChange={(e) => setThemeColor(e.target.value)}
                    className="w-full h-8 bg-white border border-slate-300 rounded-lg cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">Description</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#F97316]"
                  placeholder="e.g. Sales specialist assistant"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">Avatar Image (Upload File or URL)</label>
                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    className="flex-1 bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#F97316]"
                    placeholder="Paste URL or click Upload"
                  />
                  <label className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs px-3 py-1.5 rounded-lg cursor-pointer border border-slate-300 font-semibold shrink-0 flex items-center gap-1.5 transition">
                    <Upload className="h-3.5 w-3.5" />
                    <span>Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            if (typeof reader.result === 'string') {
                              setAvatarUrl(reader.result);
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                  <div className="h-8 w-8 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center overflow-hidden shrink-0">
                    {avatarUrl && avatarUrl.trim() !== '' ? (
                      <img
                        src={avatarUrl}
                        alt="Avatar Preview"
                        className="h-full w-full object-cover"
                        onError={(e: any) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <svg className="h-4 w-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 2a10 10 0 0 1 10 10c0 5.523-4.477 10-10 10S2 17.523 2 12A10 10 0 0 1 12 2z"></path>
                        <path d="M12 6v6l4 2"></path>
                      </svg>
                    )}
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Upload a PNG/JPG file from your computer or paste an image URL.</p>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">AI Model</label>
                  <select
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#F97316]"
                  >
                    <option value="claude-3-5-sonnet-20241022">Claude 3.5 Sonnet (Recommended)</option>
                    <option value="claude-3-5-haiku-20241022">Claude 3.5 Haiku (Fast & Low Cost)</option>
                    <option value="claude-3-7-sonnet-20250219">Claude 3.7 Sonnet (Advanced)</option>
                    <option value="claude-3-opus-20240229">Claude 3 Opus</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">Temperature ({temperature})</label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={temperature}
                    onChange={(e) => setTemperature(parseFloat(e.target.value))}
                    className="w-full accent-[#F97316]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">System Instructions</label>
                <textarea
                  rows={4}
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-[#F97316]"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold rounded-lg px-3.5 py-1.5 text-xs shadow-xs transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="bg-[#F97316] hover:bg-[#ea580c] text-white font-semibold shadow-xs border border-slate-900 rounded-lg px-3.5 py-1.5 text-xs transition-all disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : (isEditMode ? 'Save Changes' : 'Create Agent')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

