'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import Preloader from '@/app/components/Preloader';

export default function WordpressPluginPage() {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'plugin' | 'script' | 'gutenberg'>('plugin');
  const [activeFaq, setActiveFaq] = useState<number | null>(0);

  const scriptSnippet = `<script 
  src="${typeof window !== 'undefined' ? window.location.origin : 'https://chatbox.ai'}/api/widget/embed.js" 
  data-agent-id="YOUR_AGENT_ID" 
  async defer>
</script>`;

  const shortcodeSnippet = `[geekvista_ai_chat agent_id="YOUR_AGENT_ID" position="bottom-right"]`;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const faqs = [
    {
      q: "Does this plugin affect my WordPress site loading speed?",
      a: "Not at all. The script is loaded asynchronously (< 5ms footprint) from an optimized global CDN after your core page DOM has completely rendered, guaranteeing a 100/100 PageSpeed score."
    },
    {
      q: "Is it compatible with WooCommerce & Elementor?",
      a: "Yes! Geekvista AI seamlessly integrates with all major WordPress builders including Elementor, Divi, Gutenberg, Beaver Builder, and WooCommerce stores."
    },
    {
      q: "Where do I find my Agent ID?",
      a: "Navigate to your Geekvista Dashboard > Agents section. Select your active bot agent and copy the Agent ID string from the Embed Settings tab."
    },
    {
      q: "Can I customize the chat bubble style to match my theme?",
      a: "Absolutely. Custom colors, avatar images, greeting messages, position (bottom-right/left), and lead capture fields can be adjusted anytime without updating plugin files."
    }
  ];

  return (
    <>
      <Preloader />
      <link rel="stylesheet" href="/css/preload.min.css" />
      <link rel="stylesheet" href="/css/icomoon.css" />
      <link rel="stylesheet" href="/css/libs.min.css" />
      <link rel="stylesheet" href="/css/about.min.css" />
      <link rel="stylesheet" href="/css/floatbutton.min.css" />

      {/* Header navigation bar */}
      <Header dataPage="wordpress" dataPageParent="pages" />

      {/* Hero Header Section */}
      <header 
        className="page" 
        style={{ 
          background: 'radial-gradient(circle at 50% 0%, #1E3A8A 0%, #0F172A 70%, #090D16 100%)', 
          padding: '40px 0 80px', 
          position: 'relative', 
          overflow: 'hidden' 
        }}
      >
        {/* Decorative Grid Lines */}
        <div 
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.07) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
            pointerEvents: 'none',
            opacity: 0.6
          }} 
        />

        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          {/* Breadcrumb Navigation */}
          <ul className="breadcrumbs d-flex flex-wrap" style={{ marginBottom: '36px', gap: '8px', alignItems: 'center', listStyle: 'none', padding: 0 }}>
            <li className="breadcrumbs_item">
              <Link className="link" href="/" style={{ color: 'rgba(255,255,255,0.65)', fontWeight: 600, textDecoration: 'none', fontSize: '14px' }}>Home</Link>
            </li>
            <li style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px' }}>/</li>
            <li className="breadcrumbs_item current">
              <span id="currentpage" style={{ color: '#F97316', fontWeight: 700, fontSize: '14px' }}>WordPress Plugin</span>
            </li>
          </ul>

          <div className="row align-items-center" style={{ display: 'flex', flexWrap: 'wrap', gap: '40px 0' }}>
            {/* Hero Left Content */}
            <div className="col-12 col-xl-7" style={{ flex: '1 1 520px', maxWidth: '700px' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(249, 115, 22, 0.12)', border: '1px solid rgba(249, 115, 22, 0.3)', padding: '6px 16px', borderRadius: '30px', marginBottom: '20px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981', display: 'inline-block', boxShadow: '0 0 8px #10B981' }}></span>
                <span style={{ color: '#F97316', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', fontSize: '12px' }}>
                  Official WordPress Integration • v1.0.2
                </span>
              </div>
              
              <h1 style={{ 
                color: '#FFFFFF', 
                fontSize: 'clamp(32px, 5vw, 50px)', 
                fontWeight: '800', 
                lineHeight: '1.15', 
                marginBottom: '20px',
                letterSpacing: '-0.5px' 
              }}>
                Add AI Support to WordPress in 60 Seconds
              </h1>
              
              <p style={{ 
                color: 'rgba(255, 255, 255, 0.82)', 
                fontSize: '17px', 
                lineHeight: '1.75', 
                marginBottom: '32px',
                maxWidth: '600px' 
              }}>
                Deploy custom-trained AI chat assistants to your WordPress site with zero technical setup. Answer visitor questions 24/7, capture leads, and automate support.
              </p>
              
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
                <a 
                  className="btn-neon" 
                  href="/api/download-wordpress-plugin" 
                  download 
                  style={{ 
                    background: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)',
                    color: '#FFFFFF',
                    border: 'none',
                    boxShadow: '0 6px 20px rgba(249, 115, 22, 0.4)',
                    padding: '0 32px', 
                    height: '52px', 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    gap: '10px',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '15px',
                    textDecoration: 'none',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                  </svg>
                  Download Plugin (.zip)
                </a>

                <a 
                  className="btn" 
                  href="#quick-install" 
                  style={{ 
                    background: 'rgba(255, 255, 255, 0.08)', 
                    border: '1px solid rgba(255, 255, 255, 0.2)', 
                    color: '#FFFFFF',
                    padding: '0 26px',
                    height: '52px',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '15px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    textDecoration: 'none'
                  }}
                >
                  Setup Guide &amp; Docs &darr;
                </a>
              </div>
            </div>
            
            {/* Hero Right Specs Card */}
            <div className="col-12 col-xl-5 d-flex justify-content-center" style={{ flex: '1 1 360px' }}>
              <div style={{
                background: 'rgba(15, 23, 42, 0.65)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '20px',
                padding: '32px',
                width: '100%',
                maxWidth: '430px',
                backdropFilter: 'blur(16px)',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
                color: '#FFFFFF'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px' }}>
                  <div style={{ 
                    width: '52px', 
                    height: '52px', 
                    borderRadius: '14px', 
                    background: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    boxShadow: '0 8px 16px rgba(249, 115, 22, 0.3)' 
                  }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                    </svg>
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontWeight: 800, color: '#FFFFFF', fontSize: '19px' }}>Geekvista WP Assistant</h4>
                    <span style={{ fontSize: '13px', color: '#10B981', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                      Verified &amp; Tested
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '14px', color: 'rgba(255, 255, 255, 0.85)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                    <span style={{ color: '#94A3B8' }}>WordPress Support</span>
                    <strong style={{ color: '#FFFFFF', fontWeight: 700 }}>v5.0 – v6.7+</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                    <span style={{ color: '#94A3B8' }}>PHP Requirement</span>
                    <strong style={{ color: '#FFFFFF', fontWeight: 700 }}>PHP 7.4+ or 8.x</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                    <span style={{ color: '#94A3B8' }}>PageSpeed Impact</span>
                    <strong style={{ color: '#10B981', fontWeight: 700 }}>&lt; 5ms (Asynchronous)</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                    <span style={{ color: '#94A3B8' }}>Package Size</span>
                    <strong style={{ color: '#FFFFFF', fontWeight: 700 }}>24.2 KB (.zip)</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#94A3B8' }}>License &amp; Cost</span>
                    <strong style={{ color: '#F97316', fontWeight: 700 }}>MIT / 100% Free</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Interactive Content */}
      <main id="quick-install" style={{ background: '#F8FAFC', padding: '80px 0 100px' }}>
        <div className="container">

          {/* Section Header */}
          <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 50px' }}>
            <span style={{ color: '#F97316', fontWeight: 700, textTransform: 'uppercase', fontSize: '13px', letterSpacing: '1.2px' }}>
              Choose Your Preferred Method
            </span>
            <h2 style={{ fontSize: '34px', fontWeight: 800, color: '#0F172A', marginTop: '8px', letterSpacing: '-0.5px' }}>
              Integration Methods
            </h2>
            <p style={{ color: '#64748B', fontSize: '16px', marginTop: '10px' }}>
              Pick the simplest option for your site architecture. Both methods deliver full chatbot features.
            </p>
          </div>

          {/* Tab Selection */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '40px' }}>
            <div style={{ 
              background: '#E2E8F0', 
              padding: '5px', 
              borderRadius: '12px', 
              display: 'inline-flex',
              gap: '6px'
            }}>
              <button 
                onClick={() => setActiveTab('plugin')}
                style={{
                  background: activeTab === 'plugin' ? '#FFFFFF' : 'transparent',
                  color: activeTab === 'plugin' ? '#1E3A8A' : '#64748B',
                  fontWeight: 700,
                  fontSize: '14px',
                  padding: '10px 22px',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: activeTab === 'plugin' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                  transition: 'all 0.2s ease'
                }}
              >
                1. WP Plugin (.zip)
              </button>

              <button 
                onClick={() => setActiveTab('script')}
                style={{
                  background: activeTab === 'script' ? '#FFFFFF' : 'transparent',
                  color: activeTab === 'script' ? '#1E3A8A' : '#64748B',
                  fontWeight: 700,
                  fontSize: '14px',
                  padding: '10px 22px',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: activeTab === 'script' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                  transition: 'all 0.2s ease'
                }}
              >
                2. HTML Script Tag
              </button>

              <button 
                onClick={() => setActiveTab('gutenberg')}
                style={{
                  background: activeTab === 'gutenberg' ? '#FFFFFF' : 'transparent',
                  color: activeTab === 'gutenberg' ? '#1E3A8A' : '#64748B',
                  fontWeight: 700,
                  fontSize: '14px',
                  padding: '10px 22px',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: activeTab === 'gutenberg' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                  transition: 'all 0.2s ease'
                }}
              >
                3. Shortcode / Gutenberg
              </button>
            </div>
          </div>

          {/* TAB CONTENT 1: WP PLUGIN ZIP */}
          {activeTab === 'plugin' && (
            <div className="row" style={{ display: 'flex', flexWrap: 'wrap', gap: '24px 0' }}>
              <div className="col-12 col-md-4" style={{ flex: '1 1 300px' }}>
                <div style={{
                  background: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '16px',
                  padding: '32px 28px',
                  height: '100%',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
                  transition: 'transform 0.2s ease, boxShadow 0.2s ease'
                }}>
                  <div style={{ 
                    width: '44px', 
                    height: '44px', 
                    borderRadius: '12px', 
                    background: '#1E3A8A', 
                    color: '#FFFFFF', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    fontWeight: 800, 
                    fontSize: '18px', 
                    marginBottom: '20px' 
                  }}>
                    1
                  </div>
                  <h4 style={{ fontWeight: 700, color: '#0F172A', marginBottom: '12px', fontSize: '18px' }}>Download Archive</h4>
                  <p style={{ color: '#64748B', fontSize: '14px', lineHeight: 1.6, marginBottom: '24px' }}>
                    Get the official <code>chatbox-ai-widget.zip</code> plugin directly from our server.
                  </p>
                  <a 
                    className="btn-neon" 
                    href="/api/download-wordpress-plugin" 
                    download 
                    style={{ 
                      background: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)',
                      color: '#FFFFFF',
                      border: 'none',
                      boxShadow: '0 4px 14px rgba(249, 115, 22, 0.35)',
                      width: '100%', 
                      height: '44px', 
                      fontSize: '14px', 
                      fontWeight: 700,
                      borderRadius: '8px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      textDecoration: 'none',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    Download .ZIP
                  </a>
                </div>
              </div>

              <div className="col-12 col-md-4" style={{ flex: '1 1 300px' }}>
                <div style={{
                  background: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '16px',
                  padding: '32px 28px',
                  height: '100%',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)'
                }}>
                  <div style={{ 
                    width: '44px', 
                    height: '44px', 
                    borderRadius: '12px', 
                    background: '#1E3A8A', 
                    color: '#FFFFFF', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    fontWeight: 800, 
                    fontSize: '18px', 
                    marginBottom: '20px' 
                  }}>
                    2
                  </div>
                  <h4 style={{ fontWeight: 700, color: '#0F172A', marginBottom: '12px', fontSize: '18px' }}>Upload to WP Admin</h4>
                  <p style={{ color: '#64748B', fontSize: '14px', lineHeight: 1.6 }}>
                    In your WordPress Dashboard, navigate to <strong>Plugins &gt; Add New &gt; Upload Plugin</strong>. Choose the downloaded zip file and click <strong>Activate</strong>.
                  </p>
                </div>
              </div>

              <div className="col-12 col-md-4" style={{ flex: '1 1 300px' }}>
                <div style={{
                  background: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '16px',
                  padding: '32px 28px',
                  height: '100%',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)'
                }}>
                  <div style={{ 
                    width: '44px', 
                    height: '44px', 
                    borderRadius: '12px', 
                    background: '#1E3A8A', 
                    color: '#FFFFFF', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    fontWeight: 800, 
                    fontSize: '18px', 
                    marginBottom: '20px' 
                  }}>
                    3
                  </div>
                  <h4 style={{ fontWeight: 700, color: '#0F172A', marginBottom: '12px', fontSize: '18px' }}>Save Agent ID</h4>
                  <p style={{ color: '#64748B', fontSize: '14px', lineHeight: 1.6 }}>
                    Open the new <strong>Geekvista AI</strong> menu item in your sidebar, paste your Agent ID, and click <strong>Save Changes</strong>. Your live chat widget appears instantly!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB CONTENT 2: HTML SCRIPT TAG */}
          {activeTab === 'script' && (
            <div style={{
              background: '#0F172A',
              border: '1px solid #1E293B',
              borderRadius: '16px',
              padding: '36px',
              color: '#FFFFFF',
              maxWidth: '900px',
              margin: '0 auto',
              boxShadow: '0 12px 30px rgba(0,0,0,0.15)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
                <div>
                  <h4 style={{ color: '#FFFFFF', fontWeight: 800, margin: 0, fontSize: '18px' }}>Global HTML Embed Code</h4>
                  <p style={{ color: '#94A3B8', fontSize: '14px', margin: '4px 0 0' }}>
                    Paste this snippet inside your theme footer file (<code>footer.php</code>) right before <code>&lt;/body&gt;</code>.
                  </p>
                </div>
                <button 
                  onClick={() => handleCopy(scriptSnippet)}
                  style={{
                    background: copied ? '#10B981' : '#F97316',
                    color: '#FFFFFF',
                    border: 'none',
                    padding: '10px 22px',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '14px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  {copied ? '✓ Copied!' : 'Copy Snippet'}
                </button>
              </div>

              <pre style={{
                background: '#020617',
                border: '1px solid #1E293B',
                borderRadius: '10px',
                padding: '20px 24px',
                color: '#38BDF8',
                fontSize: '14px',
                fontFamily: 'Consolas, Monaco, monospace',
                overflowX: 'auto',
                margin: 0
              }}>
                <code>{scriptSnippet}</code>
              </pre>
            </div>
          )}

          {/* TAB CONTENT 3: SHORTCODE / GUTENBERG */}
          {activeTab === 'gutenberg' && (
            <div style={{
              background: '#0F172A',
              border: '1px solid #1E293B',
              borderRadius: '16px',
              padding: '36px',
              color: '#FFFFFF',
              maxWidth: '900px',
              margin: '0 auto',
              boxShadow: '0 12px 30px rgba(0,0,0,0.15)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
                <div>
                  <h4 style={{ color: '#FFFFFF', fontWeight: 800, margin: 0, fontSize: '18px' }}>WordPress Shortcode</h4>
                  <p style={{ color: '#94A3B8', fontSize: '14px', margin: '4px 0 0' }}>
                    Add this shortcode anywhere inside Gutenberg blocks, Elementor text widgets, or theme templates.
                  </p>
                </div>
                <button 
                  onClick={() => handleCopy(shortcodeSnippet)}
                  style={{
                    background: copied ? '#10B981' : '#F97316',
                    color: '#FFFFFF',
                    border: 'none',
                    padding: '10px 22px',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '14px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {copied ? '✓ Copied!' : 'Copy Shortcode'}
                </button>
              </div>

              <pre style={{
                background: '#020617',
                border: '1px solid #1E293B',
                borderRadius: '10px',
                padding: '20px 24px',
                color: '#F472B6',
                fontSize: '14px',
                fontFamily: 'Consolas, Monaco, monospace',
                overflowX: 'auto',
                margin: 0
              }}>
                <code>{shortcodeSnippet}</code>
              </pre>
            </div>
          )}

          {/* Minimum Essential Features Grid */}
          <div style={{ marginTop: '90px' }}>
            <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto 40px' }}>
              <span style={{ color: '#F97316', fontWeight: 700, textTransform: 'uppercase', fontSize: '13px', letterSpacing: '1px' }}>
                Key Capabilities
              </span>
              <h3 style={{ fontSize: '28px', fontWeight: 800, color: '#0F172A', marginTop: '6px' }}>
                Why WordPress Owners Love It
              </h3>
            </div>

            <div className="row" style={{ display: 'flex', flexWrap: 'wrap', gap: '24px 0' }}>
              
              {/* Feature 1: Zero Latency */}
              <div className="col-12 col-md-6 col-lg-3" style={{ flex: '1 1 240px' }}>
                <div style={{ 
                  background: '#FFFFFF', 
                  border: '1px solid #E2E8F0', 
                  borderRadius: '16px', 
                  padding: '28px 24px', 
                  height: '100%',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
                  transition: 'all 0.3s ease'
                }}>
                  <div style={{ 
                    width: '54px', 
                    height: '54px', 
                    borderRadius: '14px', 
                    background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)', 
                    color: '#FFFFFF', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    marginBottom: '20px',
                    boxShadow: '0 8px 20px rgba(59, 130, 246, 0.35)' 
                  }}>
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                    </svg>
                  </div>
                  <h5 style={{ fontWeight: 800, color: '#0F172A', fontSize: '17px', marginBottom: '8px' }}>Zero Latency</h5>
                  <p style={{ color: '#64748B', fontSize: '14px', lineHeight: 1.6, margin: 0 }}>Loads asynchronously without slowing page rendering or Core Web Vitals.</p>
                </div>
              </div>

              {/* Feature 2: Auto Site RAG */}
              <div className="col-12 col-md-6 col-lg-3" style={{ flex: '1 1 240px' }}>
                <div style={{ 
                  background: '#FFFFFF', 
                  border: '1px solid #E2E8F0', 
                  borderRadius: '16px', 
                  padding: '28px 24px', 
                  height: '100%',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
                  transition: 'all 0.3s ease'
                }}>
                  <div style={{ 
                    width: '54px', 
                    height: '54px', 
                    borderRadius: '14px', 
                    background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', 
                    color: '#FFFFFF', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    marginBottom: '20px',
                    boxShadow: '0 8px 20px rgba(16, 185, 129, 0.35)' 
                  }}>
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                      <circle cx="12" cy="9" r="2"/>
                      <path d="M13.5 10.5L16 13"/>
                    </svg>
                  </div>
                  <h5 style={{ fontWeight: 800, color: '#0F172A', fontSize: '17px', marginBottom: '8px' }}>Auto Site RAG</h5>
                  <p style={{ color: '#64748B', fontSize: '14px', lineHeight: 1.6, margin: 0 }}>Reads your WordPress posts and pages automatically to provide accurate answers.</p>
                </div>
              </div>

              {/* Feature 3: Lead Generation */}
              <div className="col-12 col-md-6 col-lg-3" style={{ flex: '1 1 240px' }}>
                <div style={{ 
                  background: '#FFFFFF', 
                  border: '1px solid #E2E8F0', 
                  borderRadius: '16px', 
                  padding: '28px 24px', 
                  height: '100%',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
                  transition: 'all 0.3s ease'
                }}>
                  <div style={{ 
                    width: '54px', 
                    height: '54px', 
                    borderRadius: '14px', 
                    background: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)', 
                    color: '#FFFFFF', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    marginBottom: '20px',
                    boxShadow: '0 8px 20px rgba(249, 115, 22, 0.35)' 
                  }}>
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                      <circle cx="8.5" cy="7" r="4"/>
                      <polyline points="17 11 19 13 23 9"/>
                    </svg>
                  </div>
                  <h5 style={{ fontWeight: 800, color: '#0F172A', fontSize: '17px', marginBottom: '8px' }}>Lead Generation</h5>
                  <p style={{ color: '#64748B', fontSize: '14px', lineHeight: 1.6, margin: 0 }}>Capture visitor emails &amp; phone numbers straight into your Geekvista dashboard.</p>
                </div>
              </div>

              {/* Feature 4: Theme Matcher */}
              <div className="col-12 col-md-6 col-lg-3" style={{ flex: '1 1 240px' }}>
                <div style={{ 
                  background: '#FFFFFF', 
                  border: '1px solid #E2E8F0', 
                  borderRadius: '16px', 
                  padding: '28px 24px', 
                  height: '100%',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
                  transition: 'all 0.3s ease'
                }}>
                  <div style={{ 
                    width: '54px', 
                    height: '54px', 
                    borderRadius: '14px', 
                    background: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)', 
                    color: '#FFFFFF', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    marginBottom: '20px',
                    boxShadow: '0 8px 20px rgba(139, 92, 246, 0.35)' 
                  }}>
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.92 0 1.7-.77 1.7-1.7 0-.42-.16-.8-.44-1.1-.28-.31-.44-.7-.44-1.1 0-.93.77-1.7 1.7-1.7H17c2.76 0 5-2.24 5-5 0-5.52-4.48-9.4-10-9.4z"/>
                    </svg>
                  </div>
                  <h5 style={{ fontWeight: 800, color: '#0F172A', fontSize: '17px', marginBottom: '8px' }}>Theme Matcher</h5>
                  <p style={{ color: '#64748B', fontSize: '14px', lineHeight: 1.6, margin: 0 }}>Fully customizable colors, icons, position, and brand messaging.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Minimal FAQs Accordion */}
          <div style={{ marginTop: '80px', maxWidth: '780px', margin: '80px auto 0' }}>
            <h3 style={{ fontSize: '26px', fontWeight: 800, color: '#0F172A', textAlign: 'center', marginBottom: '32px' }}>
              Frequently Asked Questions
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {faqs.map((faq, idx) => (
                <div 
                  key={idx}
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderRadius: '12px',
                    overflow: 'hidden'
                  }}
                >
                  <button
                    onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                    style={{
                      width: '100%',
                      padding: '18px 24px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      background: 'none',
                      border: 'none',
                      textAlign: 'left',
                      cursor: 'pointer',
                      fontSize: '16px',
                      fontWeight: 700,
                      color: '#0F172A'
                    }}
                  >
                    <span>{faq.q}</span>
                    <span style={{ fontSize: '20px', color: '#64748B', transition: 'transform 0.2s', transform: activeFaq === idx ? 'rotate(45deg)' : 'none' }}>+</span>
                  </button>
                  {activeFaq === idx && (
                    <div style={{ padding: '0 24px 20px', color: '#64748B', fontSize: '14px', lineHeight: 1.6 }}>
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>

      {/* Shared Footer Component */}
      <Footer />
    </>
  );
}


