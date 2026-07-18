'use client';

import React, { useState, useEffect } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import Header from '@/app/components/Header';

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
            <div className="d-flex flex-column bg-dark p-4 p-md-5 rounded-4 text-white" style={{ flex: 1, minHeight: 'auto', backgroundColor: '#141920', border: '1px solid #1B2129' }}>
              <h4 className="text-white mb-4" style={{ fontWeight: 800 }}>Installation Instructions</h4>
              
              <div className="d-flex flex-column gap-4 text-white">
                <div className="d-flex gap-3 align-items-start text-white">
                  <span className="badge rounded-circle p-3 d-flex align-items-center justify-content-center bg-primary text-white" style={{ width: '36px', height: '36px', fontWeight: 'bold' }}>1</span>
                  <div>
                    <h5 className="text-white mb-2" style={{ fontWeight: 700 }}>Download the Plugin</h5>
                    <p className="small mb-3 text-white">Download the lightweight ChatBox AI widget loader plugin `.zip` archive.</p>
                    <a className="btn btn--neon" href="/public/chatbox-widget.js" download style={{ padding: '10px 24px', fontSize: '14px' }}>
                      <i className="icon-arrow-down icon mr-2"></i> Download WordPress Plugin (.zip)
                    </a>
                  </div>
                </div>

                <div className="d-flex gap-3 align-items-start text-white">
                  <span className="badge rounded-circle p-3 d-flex align-items-center justify-content-center bg-primary text-white" style={{ width: '36px', height: '36px', fontWeight: 'bold' }}>2</span>
                  <div>
                    <h5 className="text-white mb-1" style={{ fontWeight: 700 }}>Upload to WordPress</h5>
                    <p className="small text-white">Go to your WordPress Admin panel &gt; <strong>Plugins</strong> &gt; <strong>Add New</strong> &gt; <strong>Upload Plugin</strong>. Choose the downloaded `.zip` file, click install, and then activate it.</p>
                  </div>
                </div>

                <div className="d-flex gap-3 align-items-start text-white">
                  <span className="badge rounded-circle p-3 d-flex align-items-center justify-content-center bg-primary text-white" style={{ width: '36px', height: '36px', fontWeight: 'bold' }}>3</span>
                  <div>
                    <h5 className="text-white mb-1" style={{ fontWeight: 700 }}>Configure Agent ID</h5>
                    <p className="small text-white">Open the new **ChatBox AI Settings** item in your sidebar, paste your custom **Agent ID** from your Dashboard, and save changes!</p>
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
                  <a className="link link--underline" href="mailto:sitechcompany@email.com">sitechcompany@email.com</a>
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
