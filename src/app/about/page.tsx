'use client';

import React, { useState, useEffect } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import Header from '@/app/components/Header';
import Preloader from '@/app/components/Preloader';

export default function AboutPage() {
  const [showScrollTop, setShowScrollTop] = useState(false);

  // States for sliders
  const [aboutSlide, setAboutSlide] = useState(0);

  const aboutSlidesCount = 4;

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
      <link rel="stylesheet" href="/css/about.min.css" />
      <link rel="stylesheet" href="/css/floatbutton.min.css" />

      {/* Header navigation bar */}
      <Header dataPage="about" dataPageParent="about" />

      {/* Page Header with About Slider */}
      <header className="page">
        <div className="page_shapes"></div>
        <div className="container">
          <ul className="breadcrumbs d-flex flex-wrap">
            <li className="breadcrumbs_item">
              <Link className="link" href="/">Home</Link>
            </li>
            <li className="breadcrumbs_item current">
              <span id="currentpage">About</span>
            </li>
          </ul>
          <div className="page_header">
            <h2 className="page_header-title type" data-text="About Us">About Us</h2>
            <span className="tw-height h2"><span className="text">About Us</span></span>
            <h5 className="page_header-subtitle">Empowering businesses with custom AI chatbot assistants that engage, support, and convert visitors 24/7</h5>
          </div>
          
          <div className="page_slider-controls">
            <a
              className="control"
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setAboutSlide((aboutSlide - 1 + aboutSlidesCount) % aboutSlidesCount);
              }}
            >
              <i className="icon-angle-left icon"></i>
            </a>
            <a
              className="control"
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setAboutSlide((aboutSlide + 1) % aboutSlidesCount);
              }}
            >
              <i className="icon-angle-right icon"></i>
            </a>
          </div>

          <div className="page_slider overflow-hidden">
            <div 
              className="d-flex transition-transform duration-500" 
              style={{ 
                transform: `translateX(-${aboutSlide * (100 / aboutSlidesCount)}%)`,
                width: `${aboutSlidesCount * 100}%`
              }}
            >
              {/* Slide 1 */}
              <div style={{ width: `${100 / aboutSlidesCount}%`, flexShrink: 0 }} className="px-2">
                <picture>
                  <img src="/img/about/01.jpg" alt="About Us" className="img-fluid rounded-4" style={{ width: '100%', maxHeight: '500px', objectFit: 'cover' }} />
                </picture>
              </div>
              {/* Slide 2 */}
              <div style={{ width: `${100 / aboutSlidesCount}%`, flexShrink: 0 }} className="px-2">
                <picture>
                  <img src="/img/about/02.jpg" alt="About Us" className="img-fluid rounded-4" style={{ width: '100%', maxHeight: '500px', objectFit: 'cover' }} />
                </picture>
              </div>
              {/* Slide 3 */}
              <div style={{ width: `${100 / aboutSlidesCount}%`, flexShrink: 0 }} className="px-2">
                <picture>
                  <img src="/img/about/03.jpg" alt="About Us" className="img-fluid rounded-4" style={{ width: '100%', maxHeight: '500px', objectFit: 'cover' }} />
                </picture>
              </div>
              {/* Slide 4 */}
              <div style={{ width: `${100 / aboutSlidesCount}%`, flexShrink: 0 }} className="px-2">
                <picture>
                  <img src="/img/about/04.jpg" alt="About Us" className="img-fluid rounded-4" style={{ width: '100%', maxHeight: '500px', objectFit: 'cover' }} />
                </picture>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main>
        {/* Statistics & Video Block */}
        <div className="services">
          <div className="container">
            <div className="services_content d-lg-flex align-items-center">
              <ul className="services_content-numbers d-flex flex-column">
                <li className="block">
                  <h6 className="label">Custom AI Chatbots Deployed</h6>
                  <span className="h1" style={{ fontWeight: 800 }}>2,400+</span>
                </li>
                <li className="block">
                  <h6 className="label">Daily Conversations Automated</h6>
                  <span className="h1" style={{ fontWeight: 800 }}>150K+</span>
                </li>
                <li className="block">
                  <h6 className="label">Satisfied Businesses & Brands</h6>
                  <span className="h1" style={{ fontWeight: 800 }}>8,100+</span>
                </li>
              </ul>
              
              <div className="services_content-video video">
                <span className="cover">
                  <picture>
                    <img src="/img/about/cover.jpg" alt="About our AI chatbot services" />
                  </picture>
                  <a className="video-btn btn--neon" href="https://www.youtube.com/watch?v=XHOmBV4js_E" target="_blank" rel="noopener noreferrer">
                    <i className="icon-play icon"></i>
                  </a>
                </span>
              </div>
            </div>

            <ul className="services_list">
              <li className="wrapper">
                <Link className="services_list-item d-flex flex-column" href="/wordpress">
                  <i className="icon-chart-bar icon"></i>
                  <span className="title h5">Smart RAG Training</span>
                  <p className="text">Instantly train your AI chatbot by scraping website content, documents, and FAQs to deliver accurate answers.</p>
                </Link>
              </li>
              <li className="wrapper">
                <Link className="services_list-item d-flex flex-column" href="/prices">
                  <i className="icon-cloud icon"></i>
                  <span className="title h5">Anthropic Claude AI Engine</span>
                  <p className="text">Powered by Anthropic Claude 3.5 Sonnet for unmatched speed, reasoning, and response accuracy.</p>
                </Link>
              </li>
              <li className="wrapper">
                <Link className="services_list-item d-flex flex-column" href="/wordpress">
                  <i className="icon-filesearch icon"></i>
                  <span className="title h5">Seamless Widget Embed</span>
                  <p className="text">Deploy your custom AI chatbot widget to WordPress, Next.js, Shopify, or any custom website with one line of code.</p>
                </Link>
              </li>
              <li className="wrapper">
                <Link className="services_list-item d-flex flex-column" href="/contact">
                  <i className="icon-protect icon"></i>
                  <span className="title h5">Lead Capture & Analytics</span>
                  <p className="text">Capture qualified visitor emails, view detailed chat transcripts, and track user engagement in real time.</p>
                </Link>
              </li>
            </ul>
          </div>
        </div>

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
                  <span className="tw-height h4"><span className="text">Ask us anything</span></span>
                  <h4 className="feedback_main-header_title type" data-text="Ask us anything">Ask us anything</h4>
                </div>
                <p className="feedback_main-header_text">Have questions about setting up ChatBox AI for your website or business? Get in touch with us today and our AI specialists will be happy to assist you.</p>
              </div>
              <form className="feedback_main-form form d-flex flex-column" action="#" method="post">
                <input className="field required" type="text" id="feedbackName" name="feedbackName" placeholder="Name" required />
                <input className="field required" type="email" id="feedbackEmail" name="feedbackEmail" placeholder="E-mail" required />
                <textarea className="field required" name="feedbackMessage" id="feedbackMessage" placeholder="Type your message here…" required></textarea>
                <button className="btn btn--neon" type="submit">Send</button>
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
