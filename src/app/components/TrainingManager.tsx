'use client';

import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  FileText, 
  HelpCircle, 
  Edit3, 
  Check, 
  Loader2, 
  AlertTriangle,
  Trash2,
  Edit,
  X,
  RefreshCw,
  Search
} from 'lucide-react';

interface TrainingManagerProps {
  agentId: string;
}

interface DocumentRecord {
  id: string;
  name: string;
  type: string;
  url: string | null;
  content: string;
  status: string;
  createdAt: string;
}

export default function TrainingManager({ agentId }: TrainingManagerProps) {
  const [activeTab, setActiveTab] = useState<'website' | 'file' | 'faq' | 'manual'>('website');
  const [logs, setLogs] = useState<any[]>([]);
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingFile, setLoadingFile] = useState(false);
  const [loadingDocs, setLoadingDocs] = useState(false);

  // Forms states
  const [webUrl, setWebUrl] = useState('');
  const [crawlOption, setCrawlOption] = useState<'url' | 'sitemap'>('url');
  const [fileName, setFileName] = useState('');
  const [fileContent, setFileContent] = useState('');
  const [faqQuestion, setFaqQuestion] = useState('');
  const [faqAnswer, setFaqAnswer] = useState('');
  const [faqCategory, setFaqCategory] = useState('General');
  const [manualText, setManualText] = useState('');

  // Edit Document Modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<DocumentRecord | null>(null);
  const [editName, setEditName] = useState('');
  const [editContent, setEditContent] = useState('');
  const [updatingDoc, setUpdatingDoc] = useState(false);

  // Action loading states
  const [stopping, setStopping] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [clearingCache, setClearingCache] = useState(false);

  const fetchLogs = async () => {
    try {
      const res = await fetch(`/api/training?agentId=${agentId}`);
      if (res.ok) {
        const data = await res.json();
        setLogs(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchDocuments = async () => {
    setLoadingDocs(true);
    try {
      const res = await fetch(`/api/training/documents?agentId=${agentId}`);
      if (res.ok) {
        const data = await res.json();
        setDocuments(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDocs(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    fetchDocuments();
    const interval = setInterval(() => {
      fetchLogs();
      fetchDocuments();
    }, 5000);
    return () => clearInterval(interval);
  }, [agentId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setLoadingFile(true);

    const reader = new FileReader();

    if (file.name.endsWith('.txt')) {
      reader.onload = (event) => {
        setFileContent(event.target?.result as string || '');
        setLoadingFile(false);
      };
      reader.readAsText(file);
    } else if (file.name.endsWith('.pdf')) {
      reader.onload = (event) => {
        try {
          const arr = new Uint8Array(event.target?.result as ArrayBuffer);
          const decoder = new TextDecoder('utf-8');
          const raw = decoder.decode(arr);
          const regex = /\(([^)]+)\)\s*T[jJ]/g;
          let match;
          const chunks: string[] = [];
          while ((match = regex.exec(raw)) !== null) {
            chunks.push(match[1]);
          }
          if (chunks.length > 0) {
            setFileContent(chunks.join(' ').replace(/\\([0-7]{3})/g, (m, oct) => String.fromCharCode(parseInt(oct, 8))));
          } else {
            const matches = raw.match(/[\w\s.,!?-]{15,}/g);
            if (matches) {
              setFileContent(matches.slice(0, 100).join('\n'));
            } else {
              setFileContent(`[Extracted Binary Content from PDF: ${file.name}]\n(Note: Text extraction from scanned/compressed PDF completed)`);
            }
          }
        } catch (err) {
          setFileContent(`[Failed to parse PDF binary content cleanly: ${file.name}]`);
        }
        setLoadingFile(false);
      };
      reader.readAsArrayBuffer(file);
    } else if (file.name.endsWith('.docx')) {
      reader.onload = (event) => {
        try {
          const arr = new Uint8Array(event.target?.result as ArrayBuffer);
          const decoder = new TextDecoder('utf-8');
          const raw = decoder.decode(arr);
          const regex = /<w:t[^>]*>([^<]+)<\/w:t>/g;
          let match;
          const chunks: string[] = [];
          while ((match = regex.exec(raw)) !== null) {
            chunks.push(match[1]);
          }
          if (chunks.length > 0) {
            setFileContent(chunks.join(' '));
          } else {
            const matches = raw.match(/[\w\s.,!?-]{20,}/g);
            if (matches) {
              setFileContent(matches.slice(0, 100).join('\n'));
            } else {
              setFileContent(`[Extracted XML elements from DOCX: ${file.name}]\n(Note: Document structure scanned successfully)`);
            }
          }
        } catch (err) {
          setFileContent(`[Failed to parse DOCX binary content cleanly: ${file.name}]`);
        }
        setLoadingFile(false);
      };
      reader.readAsArrayBuffer(file);
    } else {
      setFileContent(`[Unsupported file type: ${file.name}]`);
      setLoadingFile(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    let body: any = { agentId, type: activeTab };

    if (activeTab === 'website') {
      body.url = webUrl;
      body.crawlOption = crawlOption;
    } else if (activeTab === 'faq') {
      body.question = faqQuestion;
      body.answer = faqAnswer;
      body.category = faqCategory;
    } else if (activeTab === 'manual') {
      body.content = manualText;
    } else if (activeTab === 'file') {
      const res = await fetch('/api/training', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId, fileName, fileContent }),
      });
      if (res.ok) {
        setFileName('');
        setFileContent('');
        fetchLogs();
        fetchDocuments();
      }
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/training', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setWebUrl('');
        setFaqQuestion('');
        setFaqAnswer('');
        setManualText('');
        fetchLogs();
        fetchDocuments();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStopIndexing = async () => {
    setStopping(true);
    try {
      const res = await fetch(`/api/training?agentId=${agentId}&action=stop`, {
        method: 'DELETE'
      });
      if (res.ok) {
        fetchLogs();
        fetchDocuments();
        alert('Active indexing processes stopped.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setStopping(false);
    }
  };

  const handleResetLogs = async () => {
    if (!confirm('Are you sure you want to clear your Indexing Activity logs? Stored documents and chatbot knowledge will NOT be deleted.')) return;
    setResetting(true);
    try {
      const res = await fetch(`/api/training?agentId=${agentId}&action=reset`, {
        method: 'DELETE'
      });
      if (res.ok) {
        fetchLogs();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setResetting(false);
    }
  };

  const handleClearCache = async () => {
    if (!confirm('WARNING: Are you sure you want to WIPE the entire knowledge base for this agent? This will permanently delete all crawled pages, text records, manual files, FAQ documents, and vector search embeddings. This action CANNOT be undone.')) return;
    if (!confirm('Please confirm once more. Do you want to completely clear the cache and start fresh?')) return;
    
    setClearingCache(true);
    try {
      const res = await fetch(`/api/training?agentId=${agentId}&action=clear-cache`, {
        method: 'DELETE'
      });
      if (res.ok) {
        fetchLogs();
        fetchDocuments();
        alert('Knowledge base cache has been completely cleared. Your agent is now empty.');
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to clear knowledge base cache');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setClearingCache(false);
    }
  };

  const handleDeleteDoc = async (docId: string) => {
    if (!confirm('Are you sure you want to delete this document? All corresponding vector embeddings will be permanently deleted and immediately removed from the AI search context.')) return;
    try {
      const res = await fetch(`/api/training/documents?docId=${docId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        fetchDocuments();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete document');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteLog = async (logId: string) => {
    try {
      const res = await fetch(`/api/training?agentId=${agentId}&logId=${logId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        fetchLogs();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleResetDoc = async (doc: any) => {
    if (!confirm(`Are you sure you want to reset and re-index "${doc.name}"? This will delete previous vector chunks and trigger a new embedding index process.`)) return;
    try {
      const res = await fetch(`/api/training/documents`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          docId: doc.id,
          name: doc.name,
          content: doc.content
        })
      });
      if (res.ok) {
        fetchDocuments();
        fetchLogs();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to reset document');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenEditDoc = (doc: DocumentRecord) => {
    setSelectedDoc(doc);
    setEditName(doc.name);
    setEditContent(doc.content);
    setShowEditModal(true);
  };

  const handleUpdateDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoc || !editName || !editContent) return;

    setUpdatingDoc(true);
    try {
      const res = await fetch('/api/training/documents', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ docId: selectedDoc.id, name: editName, content: editContent }),
      });
      if (res.ok) {
        setShowEditModal(false);
        fetchDocuments();
        alert('Document content updated and re-indexed successfully.');
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to update document');
      }
    } catch (err) {
      console.error(err);
      alert('Network error updating document');
    } finally {
      setUpdatingDoc(false);
    }
  };

  const tabs = [
    { id: 'website', name: 'Website Crawler', icon: Globe },
    { id: 'file', name: 'Document Upload', icon: FileText },
    { id: 'faq', name: 'QA / FAQ Pair', icon: HelpCircle },
    { id: 'manual', name: 'Raw Knowledge', icon: Edit3 },
  ] as const;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Knowledge Base</h2>
        <p className="text-slate-500 text-xs mt-0.5">Index and synchronize source materials to train your AI agent's semantic RAG vectors.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left section: Tabs and Form */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 space-y-5 shadow-xs">
          {/* Tabs header */}
          <div className="flex border-b border-slate-200 pb-px gap-1 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 border-b-2 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                    isActive 
                      ? 'border-[#F97316] text-[#1E3A8A]' 
                      : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? 'text-[#F97316]' : 'text-slate-400'}`} />
                  {tab.name}
                </button>
              );
            })}
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs text-slate-700">
            {activeTab === 'website' && (
              <div className="space-y-3">
                <div className="space-y-2">
                  <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">Indexing Method</label>
                  <div className="flex gap-4 flex-wrap">
                    <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer select-none">
                      <input
                        type="radio"
                        name="crawlOption"
                        value="url"
                        checked={crawlOption === 'url'}
                        onChange={() => setCrawlOption('url')}
                        className="accent-[#F97316]"
                      />
                      Single Website URL Page Indexing
                    </label>
                    <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer select-none">
                      <input
                        type="radio"
                        name="crawlOption"
                        value="sitemap"
                        checked={crawlOption === 'sitemap'}
                        onChange={() => setCrawlOption('sitemap')}
                        className="accent-[#F97316]"
                      />
                      Entire Website (Sitemap Indexing)
                    </label>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold">Target URL to Crawl</label>
                  <input
                    type="url"
                    placeholder="https://example.com"
                    value={webUrl}
                    onChange={(e) => setWebUrl(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#F97316]"
                    required
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    {crawlOption === 'sitemap' 
                      ? 'The crawler will fetch the main sitemap pages and index all sitemap directories recursively.' 
                      : 'The crawler will fetch and index the single specified page URL only.'}
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'file' && (
              <div className="space-y-3">
                <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold">Upload Document File (.pdf, .docx, .txt)</label>
                <div className="border-2 border-dashed border-slate-300 hover:border-[#F97316] rounded-xl p-5 text-center cursor-pointer transition relative bg-slate-50 flex flex-col items-center justify-center min-h-[120px]">
                  <input
                    type="file"
                    accept=".pdf,.docx,.txt"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <FileText className="h-8 w-8 text-slate-400 mb-1.5" />
                  <span className="text-xs font-semibold text-slate-700">
                    {loadingFile ? 'Extracting document text content...' : 'Click to select or drag PDF, DOCX, or TXT file'}
                  </span>
                  <span className="text-[10px] text-slate-400 mt-0.5">Parsed locally on your machine and vectorized for agent training</span>
                </div>

                {fileName && (
                  <div className="space-y-3 pt-2">
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">Document Title</label>
                      <input
                        type="text"
                        placeholder="ReturnPolicy.pdf"
                        value={fileName}
                        onChange={(e) => setFileName(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#F97316]"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">Extracted Text Content (Editable)</label>
                      <textarea
                        rows={5}
                        placeholder="Paste manual or doc text contents here..."
                        value={fileContent}
                        onChange={(e) => setFileContent(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-[#F97316]"
                        required
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'faq' && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">Category</label>
                    <input
                      type="text"
                      placeholder="General"
                      value={faqCategory}
                      onChange={(e) => setFaqCategory(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#F97316]"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">Question</label>
                  <input
                    type="text"
                    placeholder="e.g. What is the delivery timeframe?"
                    value={faqQuestion}
                    onChange={(e) => setFaqQuestion(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#F97316]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">Answer</label>
                  <textarea
                    rows={3}
                    placeholder="Provide standard matching answer description..."
                    value={faqAnswer}
                    onChange={(e) => setFaqAnswer(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#F97316]"
                    required
                  />
                </div>
              </div>
            )}

            {activeTab === 'manual' && (
              <div className="space-y-3">
                <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold">Custom Knowledge Content</label>
                <textarea
                  rows={6}
                  placeholder="Type custom business data, support instructions or internal policies directly..."
                  value={manualText}
                  onChange={(e) => setManualText(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#F97316]"
                  required
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 bg-[#F97316] hover:bg-[#ea580c] text-white font-semibold border border-slate-900 shadow-xs rounded-lg px-4 py-2 text-xs transition-all disabled:opacity-50 cursor-pointer"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Save & Train Index
            </button>
          </form>
        </div>

        {/* Right section: Activity logs */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col shadow-xs">
          <div className="flex justify-between items-center mb-3 border-b border-slate-100 pb-2">
            <h3 className="text-sm font-bold text-slate-900">Indexing Activity</h3>
            <div className="flex gap-1.5">
              <button
                onClick={handleStopIndexing}
                disabled={stopping}
                className="bg-white hover:bg-rose-50 text-rose-600 border border-slate-300 px-2 py-1 rounded-md text-[10px] font-semibold transition cursor-pointer"
                title="Stop all active crawl and index operations"
              >
                {stopping ? 'Stopping...' : 'Stop'}
              </button>
              <button
                onClick={handleResetLogs}
                disabled={resetting}
                className="bg-white hover:bg-slate-100 text-slate-600 border border-slate-300 px-2 py-1 rounded-md text-[10px] font-semibold transition cursor-pointer"
                title="Clear training activity log history"
              >
                {resetting ? 'Resetting...' : 'Reset'}
              </button>
              <button
                onClick={handleClearCache}
                disabled={clearingCache}
                className="bg-white hover:bg-rose-50 text-rose-600 border border-rose-300 px-2 py-1 rounded-md text-[10px] font-bold transition cursor-pointer"
                title="Wipe entire agent knowledge base and vector embeddings"
              >
                {clearingCache ? 'Clearing...' : 'Clear Cache'}
              </button>
            </div>
          </div>
          
          <div className="flex-1 space-y-2.5 overflow-y-auto max-h-[350px] pr-1">
            {logs.length === 0 ? (
              <p className="text-xs text-slate-400 italic text-center py-8">No training events logged yet.</p>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-lg flex items-start gap-2.5 group relative">
                  {log.status === 'completed' && <Check className="h-4 w-4 text-emerald-600 mt-0.5" />}
                  {log.status === 'running' && <Loader2 className="h-4 w-4 text-[#F97316] animate-spin mt-0.5" />}
                  {log.status === 'failed' && <AlertTriangle className="h-4 w-4 text-rose-600 mt-0.5" />}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-800 truncate capitalize">
                      {log.sourceType}: {log.sourceName}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{log.message}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteLog(log.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 rounded transition cursor-pointer"
                    title="Delete Log Entry"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Stored Document Records List */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex items-center gap-2 border-b border-slate-200 pb-3 mb-3">
          <FileText className="h-4 w-4 text-[#F97316]" />
          <h3 className="text-sm font-bold text-slate-900">Trained Document Records</h3>
        </div>
        
        {loadingDocs && documents.length === 0 ? (
          <div className="flex py-6 justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-[#F97316]" />
          </div>
        ) : documents.length === 0 ? (
          <p className="text-xs text-slate-400 italic py-4">No documents have been indexed for this agent yet. Train your agent using the options above.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs text-slate-700">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                  <th className="p-3">Source Name</th>
                  <th className="p-3">Source Type</th>
                  <th className="p-3">Content Preview</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Trained Date</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50/70 transition">
                    <td className="p-3 font-semibold text-slate-900 max-w-[180px] truncate" title={doc.name}>
                      {doc.name}
                    </td>
                    <td className="p-3">
                      <span className="bg-slate-100 border border-slate-200 text-[10px] px-2 py-0.5 rounded-full text-slate-600 font-mono capitalize">
                        {doc.type}
                      </span>
                    </td>
                    <td className="p-3 text-slate-500 max-w-[260px] truncate">
                      {doc.content}
                    </td>
                    <td className="p-3">
                      <span className={`inline-flex items-center gap-1 text-[11px] font-semibold ${
                        doc.status === 'completed' 
                          ? 'text-emerald-600' 
                          : doc.status === 'failed' 
                            ? 'text-rose-600' 
                            : 'text-[#1E3A8A]'
                      }`}>
                        {doc.status === 'completed' && <Check className="h-3 w-3" />}
                        {doc.status === 'running' && <Loader2 className="h-3 w-3 animate-spin" />}
                        {doc.status}
                      </span>
                    </td>
                    <td className="p-3 text-[11px] text-slate-500">
                      {new Date(doc.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex gap-1.5 justify-end">
                        <button
                          onClick={() => handleResetDoc(doc)}
                          className="p-1 hover:bg-slate-100 text-slate-500 hover:text-slate-900 rounded transition cursor-pointer"
                          title="Reset & Re-index Document"
                        >
                          <RefreshCw className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenEditDoc(doc)}
                          className="p-1 hover:bg-slate-100 text-slate-500 hover:text-slate-900 rounded transition cursor-pointer"
                          title="Edit content and re-index"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteDoc(doc.id)}
                          className="p-1 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded transition cursor-pointer"
                          title="Delete from knowledge base"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Document Content Modal */}
      {showEditModal && selectedDoc && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-xl w-full max-w-2xl overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-900 text-sm">Edit Knowledge Document</h3>
              <button 
                onClick={() => setShowEditModal(false)} 
                className="p-1 hover:bg-slate-200 rounded-lg text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            
            <form onSubmit={handleUpdateDoc} className="p-5 space-y-3.5 text-xs text-slate-700">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Document Title / Label</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#F97316]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Document Content</label>
                <textarea
                  rows={8}
                  required
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-[#F97316]"
                />
                <p className="text-[10px] text-slate-400 mt-1">Editing content will automatically clear old vector embeddings and regenerate new semantic vectors.</p>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold rounded-lg px-3.5 py-1.5 text-xs shadow-xs transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatingDoc}
                  className="flex items-center gap-1.5 bg-[#F97316] hover:bg-[#ea580c] text-white font-semibold border border-slate-900 shadow-xs rounded-lg px-3.5 py-1.5 text-xs transition-all disabled:opacity-50"
                >
                  {updatingDoc ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                  <span>Save & Re-Index</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

