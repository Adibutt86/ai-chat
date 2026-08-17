'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Header from '@/app/components/Header';
import Preloader from '@/app/components/Preloader';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

// Import Lottie animations dynamically to prevent hydration/SSR mismatches
const Lottie = dynamic(() => import('lottie-react'), { ssr: false });
import herohomeAnimation from '@/../public/lottie/herohome.json';
import paperplaneAnimation from '@/../public/lottie/paperplane.json';

// Declarative Viewport Counter
function Counter({ value, suffix = '', separator = ',' }: { value: number; suffix?: string; separator?: string }) {
  const [count, setCount] = useState(0);
  const elementRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let startTimestamp: number | null = null;
    let animationFrameId: number;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / 2000, 1);
      setCount(Math.floor(progress * value));
      if (progress < 1) {
        animationFrameId = window.requestAnimationFrame(step);
      }
    };

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        animationFrameId = window.requestAnimationFrame(step);
        observer.disconnect();
      }
    });

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      observer.disconnect();
    };
  }, [value]);

  const formatted = count.toLocaleString('en-US').replace(/,/g, separator);

  return <span ref={elementRef}>{formatted}{suffix}</span>;
}

// Pure CSS high-performance marquee ticker
function Ticker() {
  const items = ["FRD Company", "Cryptochain", "SMMHelper", "Innovation Line", "Basic Data"];
  return (
    <div className="ticker h3 overflow-hidden w-100" style={{ whiteSpace: 'nowrap', display: 'flex', border: 'none', background: 'transparent' }}>
      <div 
        className="d-flex animate-marquee"
        style={{
          display: 'inline-flex',
          gap: '3rem'
        }}
      >
        {[...items, ...items, ...items, ...items].map((item, idx) => (
          <span key={idx} className="ticker-item" style={{ display: 'inline-block', marginRight: '2rem', visibility: 'visible' }}>
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
          animation: marquee 20s linear infinite !important;
        }
        .ticker-item {
          visibility: visible !important;
        }
      `}} />
    </div>
  );
}

export default function Home() {
  // FAQ Accordion State
  const [activeFaq, setActiveFaq] = useState<string | null>('item-1');

  // Scroll to Top state
  const [showScrollTop, setShowScrollTop] = useState(false);

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
      {/* Stylesheets loaded via HTML head for page-specific scope */}
      <link rel="stylesheet" href="/css/preload.min.css" />
      <link rel="stylesheet" href="/css/icomoon.css" />
      <link rel="stylesheet" href="/css/libs.min.css" />
      <link rel="stylesheet" href="/css/index.min.css" />
      <link rel="stylesheet" href="/css/floatbutton.min.css" />

      {/* Header navigation bar */}
      <Header dataPage="home" dataPageParent="home" />

      <main>
        {/* Hero Section */}
        <section className="hero">
          <div className="hero_bg">
            <img className="hero_bg-blue" src="/svg/herohome1.svg" alt="The Fastest Web Solutions" />
          </div>
          <div className="container d-xl-flex">
            <div className="hero_main" style={{ zIndex: 2, position: 'relative' }}>
              <span style={{ color: '#F97316', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '12px', display: 'inline-block', fontSize: '12px', background: 'rgba(249, 115, 22, 0.1)', padding: '5px 14px', borderRadius: '16px', border: '1px solid rgba(249, 115, 22, 0.2)' }}>
                Meet Geekvista AI
              </span>
              <h1 className="h1" style={{ fontSize: 'clamp(2.4rem, 4.5vw, 3.8rem)', fontWeight: 800, lineHeight: 1.15, color: '#FFFFFF', marginBottom: '20px', marginTop: '4px' }}>
                Engage, Support <br />&amp; Convert
              </h1>
              <p className="hero_main-text" style={{ fontSize: '17px', lineHeight: 1.6, color: 'rgba(255, 255, 255, 0.9)', marginBottom: '28px', maxWidth: '580px' }}>
                Geekvista provides beautiful, custom-trained conversational widgets designed to integrate seamlessly into your website. Automate customer support, capture high-quality leads, and delight visitors 24/7.
              </p>
              
              <div className="hero_main-features" style={{ marginBottom: '32px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, background: 'rgba(255, 255, 255, 0.15)', color: '#FFFFFF', padding: '6px 14px', borderRadius: '20px', border: '1px solid rgba(255, 255, 255, 0.3)', backdropFilter: 'blur(4px)' }}>
                  ⚡ Instant Embed
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, background: 'rgba(255, 255, 255, 0.15)', color: '#FFFFFF', padding: '6px 14px', borderRadius: '20px', border: '1px solid rgba(255, 255, 255, 0.3)', backdropFilter: 'blur(4px)' }}>
                  🤖 Powered by Geekvista
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, background: 'rgba(255, 255, 255, 0.15)', color: '#FFFFFF', padding: '6px 14px', borderRadius: '20px', border: '1px solid rgba(255, 255, 255, 0.3)', backdropFilter: 'blur(4px)' }}>
                  🔌 WordPress Ready
                </span>
              </div>

              <div style={{ display: 'flex', gap: '14px', alignItems: 'center', flexWrap: 'wrap' }}>
                <a className="hero_main-btn btn btn--neon signUpTrigger" href="#" style={{ borderRadius: '8px', padding: '0 28px', height: '48px', fontWeight: 700 }}>Try For Free</a>
                <a className="hero_main-btn btn" href="#features" style={{ background: '#FFFFFF', border: '1px solid #CBD5E1', color: '#1E293B', borderRadius: '8px', padding: '0 24px', height: '48px', fontWeight: 700, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>Explore Features</a>
              </div>
            </div>
            <div className="hero_media animate-fadeIn" style={{ minHeight: '490px', width: '100%', maxWidth: '770px' }}>
              <Lottie animationData={herohomeAnimation} loop={true} autoplay={true} style={{ width: '100%', height: '100%' }} />
            </div>
          </div>
        </section>

        {/* Services Grid Section */}
        <div className="services">
          <img className="services_shape" src="/svg/blueshape1.svg" alt="Our Features and Services" />
          <div className="container d-flex flex-column-reverse flex-xl-row">
            <div className="services_media">
              <img src="/svg/Illustration-2.svg" alt="Our Features and Services" />
            </div>
            <ul className="services_list">
              <motion.li 
                className="wrapper"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <Link className="services_list-item d-flex flex-column" href="/wordpress">
                  <i className="icon-chart-bar icon"></i>
                  <span className="title h5">Smart RAG Training</span>
                  <p className="text">
                    Automatically scrape your website pages, docs, and FAQs to train custom AI models in seconds.
                  </p>
                </Link>
              </motion.li>
              <motion.li 
                className="wrapper"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <Link className="services_list-item d-flex flex-column" href="/prices">
                  <i className="icon-cloud icon"></i>
                  <span className="title h5">Anthropic Claude AI Engine</span>
                  <p className="text">
                    Powered exclusively by Anthropic Claude AI models for fast, accurate, and high-fidelity responses.
                  </p>
                </Link>
              </motion.li>
              <motion.li 
                className="wrapper"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Link className="services_list-item d-flex flex-column" href="/wordpress">
                  <i className="icon-filesearch icon"></i>
                  <span className="title h5">Seamless Widget Embed</span>
                  <p className="text">
                    Easy one-line script snippet for WordPress, Next.js, Shopify, or custom HTML sites.
                  </p>
                </Link>
              </motion.li>
              <motion.li 
                className="wrapper"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Link className="services_list-item d-flex flex-column" href="/contact">
                  <i className="icon-protect icon"></i>
                  <span className="title h5">Lead Capture & Analytics</span>
                  <p className="text">
                    Collect visitor emails, track conversation transcripts, and capture qualified sales leads 24/7.
                  </p>
                </Link>
              </motion.li>
            </ul>
          </div>
        </div>

        {/* About Tools Section */}
        <section className="about">
          <img className="about_shape" src="/svg/bg%202.svg" alt="The Right Digital Tools for Business" />
          <div className="container d-lg-flex">
            <div className="about_main">
              <div className="wrapper">
                <span className="tw-height h4">
                  <span className="text">The Right Digital Tools for Business</span>
                </span>
                <h4 className="about_main-title type" data-text="The Right Digital Tools for Business">
                  The Right Digital Tools for Business
                </h4>
              </div>
              <p className="about_main-text">
                Geekvista helps businesses automate customer support, capture qualified leads, and engage website visitors round the clock using custom-trained AI assistants.
              </p>
              <ul className="about_main-list d-flex flex-column">
                <motion.li 
                  className="about_main-list_item"
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                >
                  <span className="media">
                    <i className="icon-rabbit icon"></i>
                  </span>
                  <div className="main">
                    <h6 className="main_title">Detects your platform and makes installation on your website a breeze</h6>
                    <p className="main_text">
                      Supports one-click WordPress plugin integration, Next.js, Shopify, and custom HTML embed widgets in less than 2 minutes.
                    </p>
                  </div>
                </motion.li>
                <motion.li 
                  className="about_main-list_item"
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  <span className="media">
                    <i className="icon-star icon"></i>
                  </span>
                  <div className="main">
                    <h6 className="main_title">Advanced catalog of top analytics and marketing services to address your business needs</h6>
                    <p className="main_text">
                      Track chat transcripts, visitor country analytics, lead details, and conversation performance in real time.
                    </p>
                  </div>
                </motion.li>
                <motion.li 
                  className="about_main-list_item"
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <span className="media">
                    <i className="icon-moneyglass icon"></i>
                  </span>
                  <div className="main">
                    <h6 className="main_title">Turn website traffic into sales with smart AI conversational prompts</h6>
                    <p className="main_text">
                      Turn casual site visitors into paying customers with proactive AI chat prompts, automated FAQ resolution, and instant booking flows.
                    </p>
                  </div>
                </motion.li>
              </ul>
              <div className="about_main-action d-flex flex-column flex-sm-row">
                <a className="about_main-action_btn btn btn--white signUpTrigger" href="#">View Demo</a>
                <a className="about_main-action_btn btn btn--neon signUpTrigger" href="#">Free Trial</a>
              </div>
            </div>
            <div className="about_media">
              <img className="about_media-main" src="/svg/illustartion%203.svg" alt="The Right Digital Tools for Business" />
              <img className="about_media-shape" src="/svg/shapes_bg3.svg" alt="The Right Digital Tools for Business" />
            </div>
          </div>
        </section>

        {/* FAQ Accordion Section */}
        <div className="faq">
          <div className="container">
            <div className="accordion" id="faq_accordion">
              {/* ACCORDION ITEM 1 */}
              <div className="accordion_item">
                <div className="accordion_item-wrapper">
                  <h4
                    className={`title d-flex justify-content-between align-items-center ${activeFaq !== 'item-1' ? 'collapsed' : ''}`}
                    onClick={() => setActiveFaq(activeFaq === 'item-1' ? null : 'item-1')}
                    style={{ cursor: 'pointer' }}
                  >
                    How Geekvista works with your business
                    <span className={`title_icon ${activeFaq === 'item-1' ? 'transform' : ''}`}>
                      <i className="icon-arrow-left icon arrow-rotate"></i>
                    </span>
                  </h4>
                  <div className="accordion-collapse" style={{ display: activeFaq === 'item-1' ? 'block' : 'none' }}>
                    <div className="body">
                      <div className="main">
                        <p className="main_general">
                          Geekvista integrates directly into your workflow in 3 simple steps to automate customer support and boost lead generation.
                        </p>
                        <ul className="main_list">
                          <li className="main_list-item">
                            <span className="number">01</span>
                            <div className="main">
                               <h6 className="main_title">Index Your Knowledge Base</h6>
                               <p className="main_text">
                                 Paste your website URL, sitemap, or upload documentation to automatically train your custom AI chatbot in seconds.
                               </p>
                            </div>
                          </li>
                          <li className="main_list-item">
                            <span className="number">02</span>
                            <div className="main">
                               <h6 className="main_title">Customize Widget & Model Settings</h6>
                               <p className="main_text">
                                 Adjust widget colors, avatar, position, welcome message, and system instructions to match your brand style.
                               </p>
                            </div>
                          </li>
                          <li className="main_list-item">
                            <span className="number">03</span>
                            <div className="main">
                               <h6 className="main_title">Embed & Automate 24/7 Support</h6>
                               <p className="main_text">
                                 Copy-paste a single script snippet to deploy your chatbot and automate visitor support and lead capture instantly.
                               </p>
                            </div>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ACCORDION ITEM 2 */}
              <div className="accordion_item">
                <div className="accordion_item-wrapper">
                  <h4
                    className={`title d-flex justify-content-between align-items-center ${activeFaq !== 'item-2' ? 'collapsed' : ''}`}
                    onClick={() => setActiveFaq(activeFaq === 'item-2' ? null : 'item-2')}
                    style={{ cursor: 'pointer' }}
                  >
                    All Services & Features that we provide
                    <span className={`title_icon ${activeFaq === 'item-2' ? 'transform' : ''}`}>
                      <i className="icon-arrow-left icon arrow-rotate"></i>
                    </span>
                  </h4>
                  <div className="accordion-collapse" style={{ display: activeFaq === 'item-2' ? 'block' : 'none' }}>
                    <div className="body">
                      <div className="main">
                        <p className="main_general">
                          Our platform offers end-to-end AI capabilities designed for websites, SaaS platforms, e-commerce stores, and agencies.
                        </p>
                        <ul className="main_list">
                          <li className="main_list-item">
                            <span className="number">01</span>
                            <div className="main">
                               <h6 className="main_title">AI Knowledge Base Training</h6>
                               <p className="main_text">
                                 Index sitemaps, PDFs, FAQs, and custom text to give your bot accurate, context-aware website knowledge.
                               </p>
                            </div>
                          </li>
                          <li className="main_list-item">
                            <span className="number">02</span>
                            <div className="main">
                               <h6 className="main_title">Amazon Bedrock & Claude Engine</h6>
                               <p className="main_text">
                                 Experience high-speed, low-cost streaming responses with Amazon Bedrock Claude 3 Haiku model integration.
                               </p>
                            </div>
                          </li>
                          <li className="main_list-item">
                            <span className="number">03</span>
                            <div className="main">
                               <h6 className="main_title">Lead Capture & Appointment Booking</h6>
                               <p className="main_text">
                                 Collect visitor email addresses and schedule appointments directly inside the interactive chat widget.
                               </p>
                            </div>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ACCORDION ITEM 3 */}
              <div className="accordion_item">
                <div className="accordion_item-wrapper">
                  <h4
                    className={`title d-flex justify-content-between align-items-center ${activeFaq !== 'item-3' ? 'collapsed' : ''}`}
                    onClick={() => setActiveFaq(activeFaq === 'item-3' ? null : 'item-3')}
                    style={{ cursor: 'pointer' }}
                  >
                    Advanced Solutions & Flexible Pricing
                    <span className={`title_icon ${activeFaq === 'item-3' ? 'transform' : ''}`}>
                      <i className="icon-arrow-left icon arrow-rotate"></i>
                    </span>
                  </h4>
                  <div className="accordion-collapse" style={{ display: activeFaq === 'item-3' ? 'block' : 'none' }}>
                    <div className="body">
                      <div className="main">
                        <p className="main_general">
                          Choose from flexible pricing plans built to scale with your business from day one.
                        </p>
                        <ul className="main_list">
                          <li className="main_list-item">
                            <span className="number">01</span>
                            <div className="main">
                               <h6 className="main_title">Starter & Pro Subscription Plans</h6>
                               <p className="main_text">
                                 Affordable pricing options for personal blogs, growing SaaS platforms, and enterprise e-commerce sites.
                               </p>
                            </div>
                          </li>
                          <li className="main_list-item">
                            <span className="number">02</span>
                            <div className="main">
                               <h6 className="main_title">Multi-Agent Management</h6>
                               <p className="main_text">
                                 Create multiple AI personas with unique system prompts, widget styles, and specialized knowledge bases.
                               </p>
                            </div>
                          </li>
                          <li className="main_list-item">
                            <span className="number">03</span>
                            <div className="main">
                               <h6 className="main_title">High Availability & Vector Security</h6>
                               <p className="main_text">
                                 Enterprise-grade database security, vector embeddings, and zero downtime for continuous 24/7 availability.
                               </p>
                            </div>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Join Sitech banner */}
        <section className="join section">
          <div className="join_media">
            <img className="join_media-left" src="/svg/joinman.svg" alt="Join Us" />
            <div className="group">
              <img className="shape" src="/svg/bgshape_white.svg" alt="Join Us" />
              <img className="speaker" src="/svg/speaker.svg" alt="Join Us" />
            </div>
          </div>
          <div className="container d-md-flex flex-column align-items-center">
            <h3 className="join_header">
              Join <span className="join_header-wrapper"><Counter value={68000} suffix="+" /></span> growing businesses that use Geekvista to drive Customer Experience
            </h3>
            <ul className="join_list d-flex flex-column flex-md-row justify-content-md-center">
              <li className="join_list-item">
                <i className="icon-check icon"></i> No credit card required
              </li>
              <li className="join_list-item">
                <i className="icon-check icon"></i> 14-day free trial
              </li>
              <li className="join_list-item">
                <i className="icon-check icon"></i> Cancel Anytime
              </li>
            </ul>
            <a className="join_btn btn btn--neon signUpTrigger" href="#">Get Started Now</a>
          </div>
        </section>

        {/* Testimonials section */}
        <section className="testimonials section">
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
            <Ticker />
          </div>
        </section>

        {/* Feedback Section */}
        <section className="feedback section">
          <div className="feedback_shapes">
            <div className="shape shape--left">
              <img src="/svg/bgshape_white2.svg" alt="shape" />
            </div>
            <div className="shape shape--right">
              <img src="/svg/bgshape_white.svg" alt="shape" />
            </div>
          </div>
          <div className="container d-lg-flex align-items-center justify-content-between">
            <div className="feedback_main">
              <div className="feedback_main-header">
                <div className="wrapper">
                  <span className="tw-height h4">
                    <span className="text">Ask us anything</span>
                  </span>
                  <h4 className="feedback_main-header_title type" data-text="Ask us anything">
                    Ask us anything
                  </h4>
                </div>
                <p className="feedback_main-header_text">
                  Have questions about setting up Geekvista for your website or business? Get in touch with us today and our AI specialists will be happy to assist you.
                </p>
              </div>
              <form className="feedback_main-form form d-flex flex-column" action="#" method="post">
                <input className="field required" type="text" id="feedbackName" name="feedbackName" placeholder="Name" required />
                <input className="field required" type="email" id="feedbackEmail" name="feedbackEmail" placeholder="E-mail" required />
                <textarea className="field required" name="feedbackMessage" id="feedbackMessage" placeholder="Type your message here…" required></textarea>
                <button className="btn btn--neon" type="submit">Send</button>
              </form>
            </div>
            <div className="feedback_media" style={{ minHeight: '350px', width: '100%', maxWidth: '550px' }}>
              <Lottie animationData={paperplaneAnimation} loop={true} autoplay={true} style={{ width: '100%', height: '100%' }} />
            </div>
          </div>
        </section>
      </main>

      {/* Footer component */}
      <footer className="footer">
        <div className="container">
          <div className="footer_top">
            <Link className="logo footer_top-logo d-inline-flex align-items-center gap-2" href="/" style={{ textDecoration: 'none' }}>
              <img src="/img/gemini-svg.svg" alt="Geekvista AI" style={{ height: '70px', width: 'auto', objectFit: 'contain', display: 'block' }} />
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
              <a className="link" href="tel:+923475851969">+92 347 5851969</a>
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
    </>
  );
}
