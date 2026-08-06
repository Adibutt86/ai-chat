'use client';

import React, { useState, useEffect } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import Header from '@/app/components/Header';
import Preloader from '@/app/components/Preloader';
import PartnerTicker from '@/app/components/PartnerTicker';

export default function PricesPage() {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [activeModelCollapse, setActiveModelCollapse] = useState<string | null>('workshops');

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = (e: React.MouseEvent) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <Preloader />
      <link rel="stylesheet" href="/css/preload.min.css" />
      <link rel="stylesheet" href="/css/icomoon.css" />
      <link rel="stylesheet" href="/css/libs.min.css" />
      <link rel="stylesheet" href="/css/prices.min.css" />
      <link rel="stylesheet" href="/css/floatbutton.min.css" />

      {/* Header navigation bar */}
      <Header dataPage="prices" dataPageParent="prices" />

      {/* Page Header */}
      <header className="page" style={{ background: 'linear-gradient(135deg, #1E3A8A 0%, #0F172A 100%)', padding: '40px 0 80px', position: 'relative', overflow: 'hidden' }}>
        <div className="container">
          <ul className="breadcrumbs d-flex flex-wrap" style={{ marginBottom: '30px' }}>
            <li className="breadcrumbs_item">
              <Link className="link" href="/" style={{ color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>Home</Link>
            </li>
            <li className="breadcrumbs_item current">
              <span id="currentpage" style={{ color: '#F97316', fontWeight: 700 }}>Prices</span>
            </li>
          </ul>
        </div>
        
        <div className="container">
          <div className="row align-items-center" style={{ display: 'flex', flexWrap: 'wrap', gap: '30px 0' }}>
            <div className="col-12 col-xl-6" style={{ flex: '1 1 500px', maxWidth: '650px' }}>
              <span style={{ 
                color: '#F97316', 
                fontWeight: '700', 
                textTransform: 'uppercase', 
                letterSpacing: '1.5px', 
                marginBottom: '12px', 
                display: 'inline-block', 
                fontSize: '13px',
                background: 'rgba(249, 115, 22, 0.15)',
                padding: '6px 14px',
                borderRadius: '20px',
                border: '1px solid rgba(249, 115, 22, 0.3)'
              }}>
                Flexible & Transparent Pricing
              </span>
              
              <h1 style={{ 
                color: '#FFFFFF', 
                fontSize: '44px', 
                fontWeight: '800', 
                lineHeight: '1.2', 
                marginBottom: '20px',
                fontFamily: 'inherit' 
              }}>
                Simple, Predictable Plans for Growing Businesses
              </h1>
              
              <p style={{ 
                color: 'rgba(255, 255, 255, 0.82)', 
                fontSize: '17px', 
                lineHeight: '1.7', 
                marginBottom: '32px',
                maxWidth: '560px' 
              }}>
                Deploy intelligent AI chat assistants on your website in minutes. Pay only for what you use with zero hidden fees and instant setup.
              </p>
              
              <div style={{ display: 'flex', gap: '14px', alignItems: 'center', flexWrap: 'wrap' }}>
                <Link className="btn btn--neon signUpTrigger" href="/register" style={{ padding: '0 28px', height: '48px' }}>
                  Start Free Trial
                </Link>
                <Link className="btn" href="/contact" style={{ 
                  background: 'rgba(255, 255, 255, 0.1)', 
                  border: '1px solid rgba(255, 255, 255, 0.25)', 
                  color: '#FFFFFF',
                  padding: '0 24px',
                  height: '48px',
                  borderRadius: '2px',
                  fontWeight: '700'
                }}>
                  Talk to Sales
                </Link>
              </div>
            </div>
            
            <div className="col-12 col-xl-6 d-flex justify-content-center" style={{ flex: '1 1 450px' }}>
              <div style={{ position: 'relative', width: '100%', maxWidth: '540px' }}>
                <img 
                  src="/img/prices/hero_new.jpg" 
                  alt="Geekvista Pricing Plans" 
                  style={{ 
                    width: '100%', 
                    height: 'auto', 
                    borderRadius: '16px', 
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', 
                    border: '2px solid rgba(255, 255, 255, 0.15)',
                    display: 'block' 
                  }} 
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      <main>
        {/* Pricing Table Section */}
        <section className="pricing section">
          <div className="container">
            <div className="pricing_header">
              <h4 className="pricing_header-title">Base Model Prices</h4>
              <p className="pricing_header-text">Simple and flexible. Only pay for what you use. For your small-to medium-sized companies</p>
            </div>
            <ul className="pricing_list d-flex flex-column flex-md-row flex-wrap">
              <li className="pricing_list-item">
                <div className="pricing_list-item_header">
                  <h5 className="title">Starter</h5>
                  <span className="price">
                    <span className="sign">$</span> <span className="int">19</span> <span className="float">00</span>
                  </span>
                  <p className="label">Ideal for small websites or testing out Geekvista features</p>
                </div>
                <ul className="pricing_list-item_list">
                  <li className="list-item"><i className="icon-circle icon"></i> 1 Active Chatbot Agent</li>
                  <li className="list-item"><i className="icon-circle icon"></i> 1,000 Messages per Month</li>
                  <li className="list-item"><i className="icon-circle icon"></i> Website URL & Sitemap Crawler</li>
                  <li className="list-item"><i className="icon-circle icon"></i> Custom Bubble Styling</li>
                  <li className="list-item"><i className="icon-circle icon"></i> Email Customer Support</li>
                </ul>
                <a className="btn btn--neon signUpTrigger" href="#">Upgrade Plan</a>
              </li>

              <li className="pricing_list-item">
                <div className="pricing_list-item_header">
                  <h5 className="title">Professional</h5>
                  <span className="price">
                    <span className="sign">$</span> <span className="int">49</span> <span className="float">00</span>
                  </span>
                  <p className="label">Designed for growing businesses needing higher limits</p>
                </div>
                <ul className="pricing_list-item_list">
                  <li className="list-item"><i className="icon-circle icon"></i> 3 Active Chatbot Agents</li>
                  <li className="list-item"><i className="icon-circle icon"></i> 5,000 Messages per Month</li>
                  <li className="list-item"><i className="icon-circle icon"></i> Document & PDF Knowledge Base</li>
                  <li className="list-item"><i className="icon-circle icon"></i> Lead Generation & Form Capture</li>
                  <li className="list-item"><i className="icon-circle icon"></i> Priority Support</li>
                </ul>
                <a className="btn btn--neon signUpTrigger" href="#">Upgrade Plan</a>
              </li>

              <li className="pricing_list-item">
                <div className="pricing_list-item_header">
                  <h5 className="title">Enterprise</h5>
                  <span className="price">
                    <span className="sign">$</span> <span className="int">99</span> <span className="float">00</span>
                  </span>
                  <p className="label">For agencies and high-traffic enterprise organizations</p>
                </div>
                <ul className="pricing_list-item_list">
                  <li className="list-item"><i className="icon-circle icon"></i> Unlimited Chatbot Agents</li>
                  <li className="list-item"><i className="icon-circle icon"></i> 25,000 Messages per Month</li>
                  <li className="list-item"><i className="icon-circle icon"></i> Custom LLM & API Key Support</li>
                  <li className="list-item"><i className="icon-circle icon"></i> Dedicated Account Manager</li>
                  <li className="list-item"><i className="icon-circle icon"></i> SLA & 24/7 Phone Support</li>
                </ul>
                <a className="btn btn--neon signUpTrigger" href="#">Upgrade Plan</a>
              </li>
            </ul>
          </div>
        </section>

        {/* Challenges Section */}
        <section className="challenges section">
          <div className="challenges_shapes">
            <div className="half half--left">
              <span className="circle"></span>
              <img className="shape" src="/svg/barshape.svg" alt="Your Challenges" />
            </div>
            <div className="half half--right">
              <img className="shape" src="/svg/speaker.svg" alt="Your Challenges" />
              <span className="circle circle--big"></span>
              <span className="circle circle--small"></span>
            </div>
          </div>
          <div className="container d-lg-flex align-items-center">
            <div className="challenges_header">
              <h3 className="challenges_header-title d-flex align-items-end">
                <span className="text">Your Challenges</span>
                <i className="icon-arrow-left icon arrow-rotate"></i>
              </h3>
              <p className="challenges_header-text">
                Geekvista eliminates slow support response times, missed lead captures, and high customer service overhead by delivering instant, custom-trained AI chat assistants.
              </p>
            </div>
            <ul className="challenges_list d-flex flex-column flex-sm-row flex-wrap">
              <li className="challenges_list-item">
                <span className="number">01</span>
                <span className="separator"></span>
                <h5 className="title">Instant Website Setup</h5>
              </li>
              <li className="challenges_list-item">
                <span className="number">02</span>
                <span className="separator"></span>
                <h5 className="title">Automated RAG Search</h5>
              </li>
              <li className="challenges_list-item">
                <span className="number">03</span>
                <span className="separator"></span>
                <h5 className="title">Multi-LLM Provider Engine</h5>
              </li>
              <li className="challenges_list-item">
                <span className="number">04</span>
                <span className="separator"></span>
                <h5 className="title">WordPress & Web Embeds</h5>
              </li>
              <li className="challenges_list-item">
                <span className="number">05</span>
                <span className="separator"></span>
                <h5 className="title">Continuous 24/7 Support</h5>
              </li>
              <li className="challenges_list-item">
                <span className="number">06</span>
                <span className="separator"></span>
                <h5 className="title">Lead & Transcript Analytics</h5>
              </li>
            </ul>
          </div>
        </section>

        {/* Services Bottom & Ticker Section */}
        <div className="services">
          <div className="stripe d-flex align-items-center">
            <div className="stripe_block d-none d-sm-flex align-items-center">
              <span className="stripe_block-icon">
                <i className="icon-arrow-left icon"></i>
              </span>
              <ul className="stripe_block-list d-flex flex-column">
                <li>1000+ Partners,</li>
                <li>1700+ Investors,</li>
                <li>160+ Clients</li>
              </ul>
            </div>
            <div className="py-4 overflow-hidden w-100">
              <PartnerTicker />
            </div>
          </div>

          <div className="container">
            <ul className="services_list">
              <li className="wrapper">
                <Link className="services_list-item d-flex flex-column" href="/about">
                  <i className="icon-chart-bar icon"></i>
                  <span className="title h5">Lead & Chat Analytics</span>
                  <p className="text">Track user conversation transcripts, capture incoming lead contact details, and analyze customer satisfaction metrics in real time.</p>
                </Link>
              </li>
              <li className="wrapper">
                <Link className="services_list-item d-flex flex-column" href="/about">
                  <i className="icon-cloud icon"></i>
                  <span className="title h5">RAG Search Optimization</span>
                  <p className="text">Automatically crawl website URLs, parse PDFs, and generate high-precision vector embeddings for instant, context-aware AI responses.</p>
                </Link>
              </li>
              <li className="wrapper">
                <Link className="services_list-item d-flex flex-column" href="/about">
                  <i className="icon-filesearch icon"></i>
                  <span className="title h5">Multi-LLM Engine Guard</span>
                  <p className="text">Seamlessly switch between Anthropic Claude 3.5, Google Gemini 2.5, and OpenAI GPT-4o with automatic fallback redundancy.</p>
                </Link>
              </li>
              <li className="wrapper">
                <Link className="services_list-item d-flex flex-column" href="/about">
                  <i className="icon-protect icon"></i>
                  <span className="title h5">Enterprise Security & Privacy</span>
                  <p className="text">Ensure zero data leaks with role-based access control, encrypted API keys, and custom domain widget embedding.</p>
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </main>

      {/* Footer component */}
      <footer className="footer">
        <div className="container">
          <div className="footer_top">
            <Link className="logo footer_top-logo d-inline-flex align-items-center gap-2" href="/">
              <span className="logo_icon d-inline-flex align-items-center justify-content-center" style={{ width: '56px', height: '56px' }}>
                <img src="/svg/logo.svg" alt="Geekvista AI" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </span>
              <span className="logo_text h2 mb-0" style={{ fontSize: '32px', fontWeight: 800, lineHeight: 1 }}>Geekvista AI</span>
            </Link>
            <ul className="footer_top-nav d-flex flex-wrap">
              <li className="footer_top-nav_link">
                <Link className="link h5" href="/about">
                  About <i className="icon-arrow-left icon arrow-rotate"></i>
                </Link>
              </li>
              <li className="footer_top-nav_link">
                <Link className="link h5" href="/services">
                  Services <i className="icon-arrow-left icon arrow-rotate"></i>
                </Link>
              </li>
              <li className="footer_top-nav_link">
                <Link className="link h5" href="/contact">
                  Contact <i className="icon-arrow-left icon arrow-rotate"></i>
                </Link>
              </li>
            </ul>
          </div>
          <div className="footer_bottom">
            <div className="footer_bottom-contacts d-flex flex-column">
              <a className="link" href="mailto:support@geekvista.com">support@geekvista.com</a>
              <a className="link" href="tel:+1202303404">+1 202 303 404</a>
            </div>
            <div className="footer_bottom-socials">
              <ul className="footer_bottom-socials_list socials d-flex flex-wrap">
                <li className="socials-item">
                  <a className="link" href="https://facebook.com/" target="_blank" rel="noopener noreferrer">
                    <i className="icon-facebook icon"></i>
                  </a>
                </li>
                <li className="socials-item">
                  <a className="link" href="https://instagram.com/" target="_blank" rel="noopener noreferrer">
                    <i className="icon-instagram icon"></i>
                  </a>
                </li>
                <li className="socials-item">
                  <a className="link" href="https://twitter.com/" target="_blank" rel="noopener noreferrer">
                    <i className="icon-twitter icon"></i>
                  </a>
                </li>
                <li className="socials-item">
                  <a className="link" href="https://youtube.com/" target="_blank" rel="noopener noreferrer">
                    <i className="icon-youtube-play icon"></i>
                  </a>
                </li>
                <li className="socials-item">
                  <a className="link" href="https://linkedin.com/" target="_blank" rel="noopener noreferrer">
                    <i className="icon-linkedin icon"></i>
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <p className="footer_copyright">
            Copyright &copy; {new Date().getFullYear()} Sitech by Merkulove
          </p>
        </div>
        
        <a 
          className={`footer_scroll ${showScrollTop ? 'active' : ''}`} 
          id="scrollToTop" 
          href="#" 
          onClick={scrollToTop}
          style={{ display: showScrollTop ? 'flex' : 'none', opacity: showScrollTop ? 1 : 0, transition: 'all 0.3s' }}
        >
          <i className="icon-arrow-up icon"></i>
        </a>
      </footer>

      {/* Lottie Player Script */}
      <Script src="https://unpkg.com/@lottiefiles/lottie-player@2.0.12/dist/lottie-player.js" strategy="afterInteractive" />
    </>
  );
}
