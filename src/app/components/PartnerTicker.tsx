'use client';

import React from 'react';

export default function PartnerTicker() {
  const items = ["FRD Company", "Cryptochain", "SMMHelper", "Innovation Line", "Basic Data"];
  return (
    <div className="ticker h3 overflow-hidden w-100" style={{ whiteSpace: 'nowrap', display: 'flex', border: 'none', background: 'transparent', width: '100%', overflow: 'hidden' }}>
      <div 
        className="d-flex animate-marquee"
        style={{
          display: 'inline-flex',
          gap: '3rem'
        }}
      >
        {[...items, ...items, ...items, ...items, ...items, ...items].map((item, idx) => (
          <span key={idx} className="ticker-item" style={{ display: 'inline-block', marginRight: '2.5rem', visibility: 'visible' }}>
            {item}
          </span>
        ))}
      </div>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: inline-flex !important;
          animation: marquee 22s linear infinite !important;
        }
        .ticker-item {
          visibility: visible !important;
          opacity: 1 !important;
        }
      `}} />
    </div>
  );
}
