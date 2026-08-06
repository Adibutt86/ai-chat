'use client';

import React, { useState, useEffect } from 'react';
import { Search, Trash2, Calendar, MapPin, Monitor, Globe } from 'lucide-react';

interface ConversationsManagerProps {
  agentId: string;
}

export default function ConversationsManager({ agentId }: ConversationsManagerProps) {
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchConversations = async () => {
    try {
      const res = await fetch(`/api/chat?agentId=${agentId}`);
      if (res.ok) {
        const data = await res.json();
        setConversations(data);
        if (data.length > 0 && !selectedConversation) {
          setSelectedConversation(data[0]);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [agentId]);

  const filteredConversations = conversations.filter(c => 
    c.visitorId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.messages.some((m: any) => m.content.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Visitor Conversations</h2>
        <p className="text-slate-500 text-xs mt-0.5">Review real-time chats, customer queries, and visitor context analytics.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 h-[600px]">
        {/* Left Side: Conversation List */}
        <div className="bg-white border border-slate-200 rounded-xl flex flex-col overflow-hidden shadow-xs">
          <div className="p-3 border-b border-slate-200 flex items-center gap-2 bg-slate-50/50">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search chat contents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent text-xs text-slate-800 focus:outline-none placeholder-slate-400"
            />
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {filteredConversations.length === 0 ? (
              <p className="text-xs text-slate-400 italic text-center py-8">No chats found.</p>
            ) : (
              filteredConversations.map((conv) => {
                const isSelected = selectedConversation?.id === conv.id;
                const lastMsg = conv.messages[conv.messages.length - 1]?.content || 'Empty chat';
                return (
                  <div
                    key={conv.id}
                    onClick={() => setSelectedConversation(conv)}
                    className={`p-3.5 cursor-pointer hover:bg-slate-50 transition-all ${
                      isSelected ? 'bg-slate-100/90 border-l-4 border-[#F97316]' : ''
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className={`text-xs font-semibold ${isSelected ? 'text-[#1E3A8A]' : 'text-slate-800'}`}>
                        Visitor ({conv.visitorId.substring(0, 8)})
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {new Date(conv.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 truncate">{lastMsg}</p>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side: Active Chat Viewer */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl flex flex-col overflow-hidden shadow-xs">
          {selectedConversation ? (
            <>
              {/* Visitor Metadata Header */}
              <div className="p-3.5 border-b border-slate-200 bg-slate-50 flex flex-wrap justify-between items-center gap-3 text-xs text-slate-600">
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex items-center gap-1.5 font-medium">
                    <MapPin className="h-3.5 w-3.5 text-[#F97316]" />
                    <span>{selectedConversation.country || 'Unknown Location'}</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-medium">
                    <Monitor className="h-3.5 w-3.5 text-slate-400" />
                    <span>{selectedConversation.browser || 'Unknown Device'}</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-medium">
                    <Globe className="h-3.5 w-3.5 text-[#1E3A8A]" />
                    <span className="truncate max-w-[180px]">{selectedConversation.pageUrl || 'Widget Page'}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                  <Calendar className="h-3 w-3" />
                  <span>{new Date(selectedConversation.createdAt).toLocaleString()}</span>
                </div>
              </div>

              {/* Chat Message Thread */}
              <div className="flex-1 p-5 space-y-3 overflow-y-auto bg-slate-50/40">
                {selectedConversation.messages.map((msg: any) => {
                  const isUser = msg.sender === 'user';
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isUser ? 'justify-[#1E3A8A] justify-start' : 'justify-end'}`}
                    >
                      <div
                        className={`max-w-[75%] rounded-xl px-3.5 py-2 text-xs shadow-xs ${
                          isUser
                            ? 'bg-white text-slate-800 border border-slate-200'
                            : 'bg-[#F97316] text-white font-medium border border-slate-900'
                        }`}
                      >
                        <p className="whitespace-pre-line leading-relaxed">{msg.content}</p>
                        <span className={`block text-[9px] mt-1 text-right ${isUser ? 'text-slate-400' : 'text-orange-100'}`}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 italic text-xs p-8">
              Select a conversation thread to view the session message log.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

