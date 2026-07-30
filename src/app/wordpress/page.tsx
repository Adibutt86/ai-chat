'use client';

import React, { useState, useEffect } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import Header from '@/app/components/Header';
import Preloader from '@/app/components/Preloader';

export default function WordpressPluginPage() {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [activeFaq, setActiveFaq] = useState<string | null>('item-1');

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
      <link rel="stylesheet" href="/css/contact.min.css" />
      <link rel="stylesheet" href="/css/floatbutton.min.css" />

      {/* Header navigation bar */}
      <Header dataPage="contact" dataPageParent="contact" />

      {/* Page Header cloned from Contact Us layout */}
      <header className="page">
        <div className="page_shapes">
          <img className="shape shape--left" src="/svg/ovalblue.svg" alt="WordPress Plugin" />
          <img className="shape shape--right" src="/svg/bgshape_white2.svg" alt="WordPress Plugin" />
        </div>
        <div className="container">
          <ul className="breadcrumbs d-flex flex-wrap">
            <li className="breadcrumbs_item">
              <Link className="link" href="/">Home</Link>
            </li>
            <li className="breadcrumbs_item current">
              <span id="currentpage">WordPress Plugin</span>
            </li>
          </ul>
        </div>
        <div className="container d-md-flex">
          <div className="page_main">
            <h5 className="page_main-subtitle">WordPress Integration</h5>
            <div className="wrapper">
              <span className="tw-height h2"><span className="text">Add chatbot in 1-Click</span></span>
              <h2 className="page_main-title type" data-text="Add chatbot in 1-Click">Add chatbot in 1-Click</h2>
            </div>
          </div>
          <div className="page_media">
            <img className="page_media-img" src="/svg/herocontact.svg" alt="WordPress Plugin" />
          </div>
        </div>
      </header>

      <main>
        {/* Step-by-Step Instructions & Plugin Download */}
        <div className="contact section">
          <div className="container d-lg-flex align-items-stretch gap-4">
            
            {/* Left Block: Transformed into step instructions */}
            <div className="d-flex flex-column p-4 p-md-5 rounded-4" style={{ flex: 1, minHeight: 'auto', backgroundColor: '#141920', border: '1px solid #1B2129', color: '#ffffff' }}>
              <h4 className="mb-4" style={{ fontWeight: 800, color: '#ffffff' }}>Installation & Configuration Guide</h4>
              
              <div className="d-flex flex-column gap-4" style={{ color: '#ffffff' }}>
                <div className="d-flex gap-3 align-items-start" style={{ color: '#ffffff' }}>
                  <span className="badge rounded-circle p-3 d-flex align-items-center justify-content-center" style={{ width: '36px', height: '36px', fontWeight: 'bold', backgroundColor: '#2563eb', color: '#ffffff' }}>1</span>
                  <div>
                    <h5 className="mb-2" style={{ fontWeight: 700, color: '#ffffff' }}>Download Official WordPress Plugin ZIP</h5>
                    <p className="small mb-3" style={{ color: '#CBD5E1' }}>Download the official ChatBox AI WordPress plugin <code>.zip</code> package ready for upload.</p>
                    <a className="btn btn--neon" href="/api/download-wordpress-plugin" download style={{ padding: '10px 24px', fontSize: '14px' }}>
                      <i className="icon-arrow-down icon mr-2"></i> Download WordPress Plugin (.zip)
                    </a>
                  </div>
                </div>

                <div className="d-flex gap-3 align-items-start" style={{ color: '#ffffff' }}>
                  <span className="badge rounded-circle p-3 d-flex align-items-center justify-content-center" style={{ width: '36px', height: '36px', fontWeight: 'bold', backgroundColor: '#2563eb', color: '#ffffff' }}>2</span>
                  <div>
                    <h5 className="mb-1" style={{ fontWeight: 700, color: '#ffffff' }}>Upload to WordPress</h5>
                    <p className="small" style={{ color: '#CBD5E1' }}>Go to your WordPress Admin panel &gt; <strong style={{ color: '#ffffff' }}>Plugins</strong> &gt; <strong style={{ color: '#ffffff' }}>Add New</strong> &gt; <strong style={{ color: '#ffffff' }}>Upload Plugin</strong>. Select the downloaded <code>chatbox-ai-widget.zip</code> file, click Install Now, and Activate the plugin.</p>
                  </div>
                </div>

                <div className="d-flex gap-3 align-items-start" style={{ color: '#ffffff' }}>
                  <span className="badge rounded-circle p-3 d-flex align-items-center justify-content-center" style={{ width: '36px', height: '36px', fontWeight: 'bold', backgroundColor: '#2563eb', color: '#ffffff' }}>3</span>
                  <div>
                    <h5 className="mb-2" style={{ fontWeight: 700, color: '#ffffff' }}>Select Connection Mode & Testing Options</h5>
                    <p className="small mb-3" style={{ color: '#CBD5E1' }}>Open <strong style={{ color: '#ffffff' }}>ChatBox AI</strong> in your WordPress sidebar and choose your options:</p>
                    
                    <div className="d-flex flex-column gap-2">
                      <div className="p-3 rounded-3" style={{ background: '#1C232D', border: '1px solid #2B3545', color: '#ffffff' }}>
                        <h6 className="mb-1 font-weight-bold" style={{ color: '#38BDF8' }}>⚡ Option A: Auto Connect (By Website Domain)</h6>
                        <p className="small mb-0" style={{ color: '#E2E8F0' }}>Automatically pairs your chatbot using your WordPress site URL. No copying or pasting of IDs required!</p>
                      </div>
                      <div className="p-3 rounded-3" style={{ background: '#1C232D', border: '1px solid #2B3545', color: '#ffffff' }}>
                        <h6 className="mb-1 font-weight-bold" style={{ color: '#4ADE80' }}>🔑 Option B: Connect By Agent ID</h6>
                        <p className="small mb-0" style={{ color: '#E2E8F0' }}>Paste your specific Agent ID (e.g. <code style={{ color: '#FACC15', backgroundColor: 'rgba(250, 204, 21, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>cm78xyz...</code>) from your ChatBox AI Dashboard for multi-agent setups.</p>
                      </div>
                      <div className="p-3 rounded-3" style={{ background: '#1C232D', border: '1px solid #2B3545', color: '#ffffff' }}>
                        <h6 className="mb-1 font-weight-bold" style={{ color: '#F472B6' }}>🧪 Option C: Show Now for Logged-In Users & WP Admin Backend</h6>
                        <p className="small mb-0" style={{ color: '#E2E8F0' }}>Check <em>"Show Now for Logged-In Users Only"</em> or <em>"Enable inside WP-Admin Backend"</em> during testing so you can test the chatbot privately without exposing it to public site visitors!</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Cloned Right Block: Contact / Support Info */}
            <ul className="contact_info d-flex flex-column flex-md-row flex-lg-column flex-wrap" style={{ flexShrink: 0 }}>
              <li className="contact_info-item">
                <h5 className="contact_info-item_header">Requirements:</h5>
                <div className="contact_info-item_content">
                  <div className="wrapper">
                    <span>WordPress 5.0 or higher</span>
                    <span>PHP 7.4 or higher</span>
                  </div>
                </div>
              </li>
              <li className="contact_info-item">
                <h5 className="contact_info-item_header">Need Installation Help?</h5>
                <div className="contact_info-item_content">
                  <p className="small mb-3">Our integration specialists can guide you through the process or install it for you.</p>
                  <Link className="btn btn--white w-100 text-center" href="/contact" style={{ padding: '10px' }}>Contact Specialist</Link>
                </div>
              </li>
              <li className="contact_info-item">
                <h5 className="contact_info-item_header">Plugin Support:</h5>
                <div className="contact_info-item_content">
                  <a className="link link--underline" href="mailto:support@chatboxai.com">support@chatboxai.com</a>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Collapsible FAQ Accordion for Plugin FAQ */}
        <div className="faq">
          <div className="container">
            <div className="faq_wrapper">
              <h4 className="text-white mb-4" style={{ fontWeight: 800, textAlign: 'center' }}>Plugin FAQs</h4>
              <div className="accordion" id="faq_accordion">
                {/* FAQ 1 */}
                <div className="accordion_item">
                  <div className="accordion_item-wrapper">
                    <h4
                      className={`title d-flex justify-content-between align-items-center ${activeFaq !== 'item-1' ? 'collapsed' : ''}`}
                      onClick={() => setActiveFaq(activeFaq === 'item-1' ? null : 'item-1')}
                      style={{ cursor: 'pointer' }}
                    >
                      Where can I find my Agent ID?
                      <span className={`title_icon ${activeFaq === 'item-1' ? 'transform' : ''}`}>
                        <i className="icon-arrow-left icon arrow-rotate"></i>
                      </span>
                    </h4>
                    <div className="accordion-collapse" style={{ display: activeFaq === 'item-1' ? 'block' : 'none' }}>
                      <div className="body">
                        <div className="main">
                          <p className="main_general">
                            Your Agent ID is available in the dashboard after you create a chatbot instance. Go to your Dashboard, navigate to the specific chatbot agent settings, and copy the widget script ID.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* FAQ 2 */}
                <div className="accordion_item">
                  <div className="accordion_item-wrapper">
                    <h4
                      className={`title d-flex justify-content-between align-items-center ${activeFaq !== 'item-2' ? 'collapsed' : ''}`}
                      onClick={() => setActiveFaq(activeFaq === 'item-2' ? null : 'item-2')}
                      style={{ cursor: 'pointer' }}
                    >
                      Will this plugin slow down my site load speed?
                      <span className={`title_icon ${activeFaq === 'item-2' ? 'transform' : ''}`}>
                        <i className="icon-arrow-left icon arrow-rotate"></i>
                      </span>
                    </h4>
                    <div className="accordion-collapse" style={{ display: activeFaq === 'item-2' ? 'block' : 'none' }}>
                      <div className="body">
                        <div className="main">
                          <p className="main_general">
                            Not at all. The plugin injects a tiny, asynchronous javascript loader that runs after your website core documents load, ensuring a 100% Google PageSpeed rating score.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feedback form support request */}
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
                  <span className="tw-height h4"><span className="text">Submit Support Ticket</span></span>
                  <h4 className="feedback_main-header_title type" data-text="Plugin Help">Plugin Help</h4>
                </div>
                <p className="feedback_main-header_text">Have any questions about setting up the WordPress plugin? Fill out the help form and our engineers will get back to you within 24 hours.</p>
              </div>
              <form className="feedback_main-form form d-flex flex-column" action="#" method="post">
                <input className="field required" type="text" id="feedbackName" name="feedbackName" placeholder="Name" required />
                <input className="field required" type="email" id="feedbackEmail" name="feedbackEmail" placeholder="E-mail" required />
                <textarea className="field required" name="feedbackMessage" id="feedbackMessage" placeholder="Type your query here…" required></textarea>
                <button className="btn btn--neon" type="submit">Submit Request</button>
              </form>
            </div>
            <div 
              className="feedback_media" 
              style={{ minHeight: '350px' }}
              dangerouslySetInnerHTML={{
                __html: '<lottie-player class="lottie" src="/lottie/paperplane.json" background="transparent" speed=".5" style="width: 100%; height: 100%" loop autoplay></lottie-player>'
              }}
            />
          </div>
        </section>
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
              <a className="link" href="mailto:support@chatboxai.com">support@chatboxai.com</a>
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
