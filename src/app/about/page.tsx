'use client';

import React, { useState, useEffect } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import Header from '@/app/components/Header';

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
            <h5 className="page_header-subtitle">Taking your business to new markets is easier than ever</h5>
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
                  <h6 className="label">Advanced Solutions for Startups</h6>
                  <span className="h1" style={{ fontWeight: 800 }}>240+</span>
                </li>
                <li className="block">
                  <h6 className="label">Investors on-boarded on the platform</h6>
                  <span className="h1" style={{ fontWeight: 800 }}>1720</span>
                </li>
                <li className="block">
                  <h6 className="label">Promotion cases and new products</h6>
                  <span className="h1" style={{ fontWeight: 800 }}>8100+</span>
                </li>
              </ul>
              
              <div className="services_content-video video">
                <span className="cover">
                  <picture>
                    <img src="/img/about/cover.jpg" alt="About our services" />
                  </picture>
                  <a className="video-btn btn--neon" href="https://www.youtube.com/watch?v=XHOmBV4js_E" target="_blank" rel="noopener noreferrer">
                    <i className="icon-play icon"></i>
                  </a>
                </span>
              </div>
            </div>

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
                  <span className="tw-height h4"><span className="text">Ask us any</span></span>
                  <h4 className="feedback_main-header_title type" data-text="Ask us any">Ask us any</h4>
                </div>
                <p className="feedback_main-header_text">Suspendisse ligula magna, laoreet non egestas ac, lobortis at nulla. Suspendisse efficitur neque nec neque porttitor tincidunt. Donec iaculis lacus vitae velit finibus ullamcorper</p>
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
