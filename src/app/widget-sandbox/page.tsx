'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Script from 'next/script';

function SandboxInner() {
  const searchParams = useSearchParams();
  const agentId = searchParams.get('agentId');
  const [origin, setOrigin] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin);
    }
  }, []);

  if (!agentId || !origin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-400">
        <p className="text-sm">agentId parameter is required in URL to test widget sandbox...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-900 text-zinc-100 flex flex-col items-center justify-center p-8 relative">
      <div className="max-w-2xl text-center space-y-4">
        <h1 className="text-4xl font-extrabold tracking-tight text-white">ChatBox AI Sandbox</h1>
        <p className="text-zinc-400">This simulates a customer's external website loading the script bundle.</p>
        
        <div className="bg-zinc-950/80 border border-zinc-800 rounded-2xl p-6 text-left max-w-lg mx-auto font-mono text-xs text-zinc-400 space-y-2">
          <p className="text-zinc-500 font-bold uppercase tracking-wider text-[10px]">Loaded script tag parameters:</p>
          <p>&lt;script</p>
          <p className="pl-4 text-blue-400">src="{origin}/chatbox-widget.js"</p>
          <p className="pl-4 text-blue-400">data-agent-id="{agentId}"</p>
          <p className="pl-4">async&gt;</p>
          <p>&lt;/script&gt;</p>
        </div>

        <p className="text-sm text-zinc-500">Look at the bottom right/left corner of this browser window to test the floating chat bubble!</p>
      </div>

      {/* Dynamic widget loader injection */}
      <Script
        src={`${origin}/chatbox-widget.js`}
        data-agent-id={agentId}
        strategy="lazyOnload"
      />
    </div>
  );
}

export default function WidgetSandboxPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-400">
        <p className="text-sm">Loading testing sandbox...</p>
      </div>
    }>
      <SandboxInner />
    </Suspense>
  );
}
