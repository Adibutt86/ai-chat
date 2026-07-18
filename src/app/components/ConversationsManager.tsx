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
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Visitor Conversations</h2>
        <p className="text-zinc-400 text-sm">Review real-time chats, customer queries, and visitor context analytics.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
        {/* Left Side: Conversation List */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl flex flex-col overflow-hidden">
          <div className="p-4 border-b border-zinc-800 flex items-center gap-2">
            <Search className="h-4 w-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search chat contents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent text-sm text-white focus:outline-none"
            />
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-zinc-850">
            {filteredConversations.length === 0 ? (
              <p className="text-xs text-zinc-500 italic text-center py-8">No chats found.</p>
            ) : (
              filteredConversations.map((conv) => {
                const isSelected = selectedConversation?.id === conv.id;
                const lastMsg = conv.messages[conv.messages.length - 1]?.content || 'Empty chat';
                return (
                  <div
                    key={conv.id}
                    onClick={() => setSelectedConversation(conv)}
                    className={`p-4 cursor-pointer hover:bg-zinc-800/40 transition ${
                      isSelected ? 'bg-zinc-800/80 border-l-2 border-blue-500' : ''
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-xs font-semibold text-white">Visitor ({conv.visitorId.substring(0, 8)})</span>
                      <span className="text-[10px] text-zinc-500">
                        {new Date(conv.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 truncate mt-1">{lastMsg}</p>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side: Active Chat Viewer */}
        <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-2xl flex flex-col overflow-hidden">
          {selectedConversation ? (
            <>
              {/* Visitor Metadata Header */}
              <div className="p-4 border-b border-zinc-800 bg-zinc-950 flex flex-wrap justify-between items-center gap-4 text-xs text-zinc-400">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-zinc-500" />
                    <span>{selectedConversation.country || 'Unknown'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Monitor className="h-3 w-3 text-zinc-500" />
                    <span>{selectedConversation.browser || 'Unknown'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Globe className="h-3 w-3 text-zinc-500" />
                    <span className="truncate max-w-[150px]">{selectedConversation.pageUrl || 'Widget Page'}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-zinc-500">
                  <Calendar className="h-3 w-3" />
                  <span>{new Date(selectedConversation.createdAt).toLocaleString()}</span>
                </div>
              </div>

              {/* Chat Message Thread */}
              <div className="flex-1 p-6 space-y-4 overflow-y-auto bg-zinc-950/20">
                {selectedConversation.messages.map((msg: any) => {
                  const isBot = msg.sender === 'user';
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isBot ? 'justify-start' : 'justify-end'}`}
                    >
                      <div
                        className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                          isBot
                            ? 'bg-zinc-800 text-zinc-100 border border-zinc-700'
                            : 'bg-blue-600 text-white'
                        }`}
                      >
                        <p className="whitespace-pre-line leading-relaxed">{msg.content}</p>
                        <span className="block text-[9px] text-zinc-400 mt-1 text-right">
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-zinc-500 italic p-8">
              Select a conversation thread to view the session message log.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
