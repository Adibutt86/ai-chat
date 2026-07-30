'use client';

import React, { useState, useEffect } from 'react';

export default function Preloader() {
  const [loading, setLoading] = useState(true);
  const [fade, setFade] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFade(true);
      const removeTimer = setTimeout(() => {
        setLoading(false);
      }, 500);
      return () => clearTimeout(removeTimer);
    }, 400);

    return () => clearTimeout(timer);
  }, []);

  if (!loading) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: '#090d16',
        zIndex: 9999999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: fade ? 0 : 1,
        transition: 'opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
        pointerEvents: fade ? 'none' : 'auto',
      }}
    >
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {/* Glow Ring */}
        <div
          style={{
            width: '84px',
            height: '84px',
            borderRadius: '50%',
            border: '3px solid rgba(37, 99, 235, 0.15)',
            borderTopColor: '#2563eb',
            borderRightColor: '#60a5fa',
            animation: 'preloader-spin 1s linear infinite',
            position: 'absolute',
          }}
        />
        {/* Brand Pulse Icon */}
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            backgroundColor: '#2563eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 24px rgba(37, 99, 235, 0.6)',
            animation: 'preloader-pulse 1.5s ease-in-out infinite',
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        </div>
      </div>

      <div style={{ marginTop: '28px', textAlign: 'center' }}>
        <h4 style={{ color: '#ffffff', fontSize: '18px', fontWeight: '700', letterSpacing: '0.5px', margin: 0, fontFamily: 'sans-serif' }}>
          ChatBox<span style={{ color: '#60a5fa' }}>AI</span>
        </h4>
        <p style={{ color: '#94a3b8', fontSize: '12px', marginTop: '6px', margin: 0, fontFamily: 'sans-serif' }}>
          Loading Experience...
        </p>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes preloader-spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes preloader-pulse {
          0%, 100% { transform: scale(0.95); opacity: 0.85; }
          50% { transform: scale(1.05); opacity: 1; }
        }
      `}} />
    </div>
  );
}
