'use client';

import React, { useState, useEffect } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import Header from '@/app/components/Header';

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
      <link rel="stylesheet" href="/css/preload.min.css" />
      <link rel="stylesheet" href="/css/icomoon.css" />
      <link rel="stylesheet" href="/css/libs.min.css" />
      <link rel="stylesheet" href="/css/prices.min.css" />
      <link rel="stylesheet" href="/css/floatbutton.min.css" />

      {/* Header navigation bar */}
      <Header dataPage="prices" dataPageParent="prices" />

      {/* Page Header */}
      <header className="page">
        <div className="container">
          <ul className="breadcrumbs d-flex flex-wrap">
            <li className="breadcrumbs_item">
              <Link className="link" href="/">Home</Link>
            </li>
            <li className="breadcrumbs_item current">
              <span id="currentpage">Prices</span>
            </li>
          </ul>
        </div>
        <div className="container d-xl-flex">
          <div className="page_main">
            <div className="wrapper">
              <span className="tw-height h2">
                <span className="text">Solutions for Your business</span>
              </span>
              <h2 className="page_main-title type" data-text="Solutions for Your business">
                Solutions for Your business
              </h2>
            </div>
            <Link className="page_main-btn btn btn--white" href="/contact">Get Free Consultation</Link>
          </div>
          <div className="page_media">
            <img className="page_media-arrow" src="/svg/arrow.svg" alt="Solutions for Your business" />
            <picture>
              <img className="page_media-image" src="/img/prices/hero.jpg" alt="Solutions for Your business" />
            </picture>
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
                  <p className="label">Ideal for small websites or testing out ChatBox AI features</p>
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
                <div className="media">
                  <img className="media_left" src="/svg/Illustration-2.svg" alt="Our Pricing" />
                  <img className="media_right" src="/svg/puzzle.svg" alt="Our Pricing" />
                </div>
                <div className="pricing_list-item_header">
                  <h5 className="title">Professional</h5>
                  <span className="price">
                    <span className="sign">$</span> <span className="int">49</span> <span className="float">00</span>
                  </span>
                  <p className="label">Best option for scaling companies and online stores</p>
                </div>
                <ul className="pricing_list-item_list">
                  <li className="list-item"><i className="icon-circle icon"></i> 5 Active Chatbot Agents</li>
                  <li className="list-item"><i className="icon-circle icon"></i> 10,000 Messages per Month</li>
                  <li className="list-item"><i className="icon-circle icon"></i> Sitemap & URL Page Indexing</li>
                  <li className="list-item"><i className="icon-circle icon"></i> PDF & Document Knowledge Uploads</li>
                  <li className="list-item"><i className="icon-circle icon"></i> Priority Email Support</li>
                  <li className="list-item"><i className="icon-circle icon"></i> Analytics & Lead Capture</li>
                </ul>
                <a className="btn btn--neon signUpTrigger" href="#">Upgrade Plan</a>
              </li>

              <li className="pricing_list-item">
                <div className="pricing_list-item_header">
                  <h5 className="title">Enterprise</h5>
                  <span className="price">
                    <span className="sign">$</span> <span className="int">149</span> <span className="float">00</span>
                  </span>
                  <p className="label">Full support and infrastructure overrides for large businesses</p>
                </div>
                <ul className="pricing_list-item_list">
                  <li className="list-item"><i className="icon-circle icon"></i> Unlimited Chatbot Agents</li>
                  <li className="list-item"><i className="icon-circle icon"></i> Unlimited Messages per Month</li>
                  <li className="list-item"><i className="icon-circle icon"></i> Dedicated Supabase Database</li>
                  <li className="list-item"><i className="icon-circle icon"></i> Custom Domain Widget Embeds</li>
                  <li className="list-item"><i className="icon-circle icon"></i> REST API Access & Webhooks</li>
                  <li className="list-item"><i className="icon-circle icon"></i> 24/7 Phone & Zoom Support</li>
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
                Nullam elementum, magna at suscipit lobortis, dui nibh molestie enim, sed scelerisque ex odio sit amet purus. Pellentesque fermentum mauris
              </p>
            </div>
            <ul className="challenges_list d-flex flex-column flex-sm-row flex-wrap">
              <li className="challenges_list-item">
                <span className="number">01</span>
                <span className="separator"></span>
                <h5 className="title">How and Where to Start</h5>
              </li>
              <li className="challenges_list-item">
                <span className="number">02</span>
                <span className="separator"></span>
                <h5 className="title">Time to Get New Strategy</h5>
              </li>
              <li className="challenges_list-item">
                <span className="number">03</span>
                <span className="separator"></span>
                <h5 className="title">Tool Selection</h5>
              </li>
              <li className="challenges_list-item">
                <span className="number">04</span>
                <span className="separator"></span>
                <h5 className="title">Find the Right Place Market</h5>
              </li>
              <li className="challenges_list-item">
                <span className="number">05</span>
                <span className="separator"></span>
                <h5 className="title">New System Support</h5>
              </li>
              <li className="challenges_list-item">
                <span className="number">06</span>
                <span className="separator"></span>
                <h5 className="title">Take New Level of Management</h5>
              </li>
            </ul>
          </div>
        </section>

        {/* Model Prices Accordion */}
        <section className="model section">
          <div className="container d-xl-flex align-items-center justify-content-between">
            <div className="model_header">
              <h4 className="model_header-title">Fine-Tuned Model Prices Updates</h4>
              <p className="model_header-subtitle">Create your own custom models by fine-tuning our base models with your own data.</p>
              <p className="model_header-text">
                Nunc quis tellus leo. Vivamus lorem magna, tempus at suscipit quis, viverra ut dolor. Suspendisse in urna id urna facilisis dapibus ut at enim. Sed tempus tincidunt neque nec tincidunt. Nam imperdiet felis nulla
              </p>
              <Link className="model_header-btn btn btn--neon" href="/contact">Talk to Specialist</Link>
            </div>
            
            <div className="model_table">
              <div className="model_table-header">
                <h6 className="model_table-header_label">Model</h6>
                <h6 className="model_table-header_label">Service</h6>
                <h6 className="model_table-header_label">Plan Advanced bills</h6>
              </div>

              {/* Collapsible Model item 1 */}
              <div className="model_table-col">
                <span 
                  className={`cell cell--trigger ${activeModelCollapse === 'workshops' ? '' : 'collapsed'}`} 
                  onClick={() => setActiveModelCollapse(activeModelCollapse === 'workshops' ? null : 'workshops')}
                  role="button"
                >
                  <span className="label">Workshops</span>
                  <i className="icon-angle-left icon"></i>
                </span>
                <div className={`cell-collapse collapse ${activeModelCollapse === 'workshops' ? 'show' : ''}`}>
                  <span className="cell">
                    <span className="cell-label">Service</span>
                    <span className="cell-content">LoDDoS - DDOS Testing Tool</span>
                  </span>
                  <span className="cell">
                    <span className="cell-label">Plan Advanced bills</span>
                    <span className="cell-content">$0.20/billed</span>
                  </span>
                </div>
              </div>

              {/* Collapsible Model item 2 */}
              <div className="model_table-col">
                <span 
                  className={`cell cell--trigger ${activeModelCollapse === 'dev' ? '' : 'collapsed'}`} 
                  onClick={() => setActiveModelCollapse(activeModelCollapse === 'dev' ? null : 'dev')}
                  role="button"
                >
                  <span className="label">Model Development</span>
                  <i className="icon-angle-left icon"></i>
                </span>
                <div className={`cell-collapse collapse ${activeModelCollapse === 'dev' ? 'show' : ''}`}>
                  <span className="cell">
                    <span className="cell-label">Service</span>
                    <span className="cell-content">System Performance Monitoring</span>
                  </span>
                  <span className="cell">
                    <span className="cell-label">Plan Advanced bills</span>
                    <span className="cell-content">$2.60/billed</span>
                  </span>
                </div>
              </div>

              {/* Collapsible Model item 3 */}
              <div className="model_table-col">
                <span 
                  className={`cell cell--trigger ${activeModelCollapse === 'consulting' ? '' : 'collapsed'}`} 
                  onClick={() => setActiveModelCollapse(activeModelCollapse === 'consulting' ? null : 'consulting')}
                  role="button"
                >
                  <span className="label">Ongoing Consulting</span>
                  <i className="icon-angle-left icon"></i>
                </span>
                <div className={`cell-collapse collapse ${activeModelCollapse === 'consulting' ? 'show' : ''}`}>
                  <span className="cell">
                    <span className="cell-label">Service</span>
                    <span className="cell-content">Technical Support Services</span>
                  </span>
                  <span className="cell">
                    <span className="cell-label">Plan Advanced bills</span>
                    <span className="cell-content">$12/billed</span>
                  </span>
                </div>
              </div>

              {/* Collapsible Model item 4 */}
              <div className="model_table-col">
                <span 
                  className={`cell cell--trigger ${activeModelCollapse === 'startup' ? '' : 'collapsed'}`} 
                  onClick={() => setActiveModelCollapse(activeModelCollapse === 'startup' ? null : 'startup')}
                  role="button"
                >
                  <span className="label">For Startups</span>
                  <i className="icon-angle-left icon"></i>
                </span>
                <div className={`cell-collapse collapse ${activeModelCollapse === 'startup' ? 'show' : ''}`}>
                  <span className="cell">
                    <span className="cell-label">Service</span>
                    <span className="cell-content">Bug Monitoring and realtime fixes</span>
                  </span>
                  <span className="cell">
                    <span className="cell-label">Plan Advanced bills</span>
                    <span className="cell-content">$18/billed</span>
                  </span>
                </div>
              </div>

            </div>
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
            <div className="ticker h3" id="ticker">
              <span className="ticker-item mx-4">FRD Company</span>
              <span className="ticker-item mx-4">Cryptochain</span>
              <span className="ticker-item mx-4">SMMHelper</span>
              <span className="ticker-item mx-4">Basic Data</span>
            </div>
          </div>

          <div className="container">
            <ul className="services_list">
              <li className="wrapper">
                <Link className="services_list-item d-flex flex-column" href="/service">
                  <i className="icon-chart-bar icon"></i>
                  <span className="title h5">Data Analysis</span>
                  <p className="text">Phasellus fringilla tuc dignissim diam. Duis nec tempus ligula. Curabitur vel pretium. Vestibulum metus pur esta</p>
                </Link>
              </li>
              <li className="wrapper">
                <Link className="services_list-item d-flex flex-column" href="/service">
                  <i className="icon-cloud icon"></i>
                  <span className="title h5">Optimization</span>
                  <p className="text">Phasellus fringilla dignissim diam. Duis nec tempus ligula. Curabitur vel pretium. Vestibulum metus pur esta</p>
                </Link>
              </li>
              <li className="wrapper">
                <Link className="services_list-item d-flex flex-column" href="/service">
                  <i className="icon-filesearch icon"></i>
                  <span className="title h5">Content Track</span>
                  <p className="text">Phasellus fringilla tuc dignissim diam. Duis nec tempus ligula. Curabitur vel pretium. Vestibulum metus pur esta</p>
                </Link>
              </li>
              <li className="wrapper">
                <Link className="services_list-item d-flex flex-column" href="/service">
                  <i className="icon-protect icon"></i>
                  <span className="title h5">Risk Manage</span>
                  <p className="text">Phasellus fringilla dignissim diam. Duis nec tempus ligula. Curabitur vel pretium. Vestibulum metus pur esta</p>
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
            <Link className="logo footer_top-logo d-inline-flex align-items-center" href="/">
              <span className="logo_icon">
                <img src="/svg/logo.svg" alt="AICHAT" />
              </span>
              <span className="logo_text h2">AICHAT</span>
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
              <a className="link" href="mailto:sitechcompany@email.com">sitechcompany@email.com</a>
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
