'use client';

import React, { useState, useEffect } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import Header from '@/app/components/Header';

export default function ContactPage() {
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

      {/* Page Header */}
      <header className="page">
        <div className="page_shapes">
          <img className="shape shape--left" src="/svg/ovalblue.svg" alt="Contact Us" />
          <img className="shape shape--right" src="/svg/bgshape_white2.svg" alt="Contact Us" />
        </div>
        <div className="container">
          <ul className="breadcrumbs d-flex flex-wrap">
            <li className="breadcrumbs_item">
              <Link className="link" href="/">Home</Link>
            </li>
            <li className="breadcrumbs_item current">
              <span id="currentpage">Contact</span>
            </li>
          </ul>
        </div>
        <div className="container d-md-flex">
          <div className="page_main">
            <h5 className="page_main-subtitle">Contact Us</h5>
            <div className="wrapper">
              <span className="tw-height h2"><span className="text">We'd love to help you</span></span>
              <h2 className="page_main-title type" data-text="We'd love to help you">We'd love to help you</h2>
            </div>
          </div>
          <div className="page_media">
            <img className="page_media-img" src="/svg/herocontact.svg" alt="Contact Us" />
          </div>
        </div>
      </header>

      <main>
        {/* Contact Info and Map Area */}
        <div className="contact section">
          <div className="container d-lg-flex align-items-stretch">
            <div className="contact_map">
              <iframe
                title="Office Map Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d11568.257005187127!2d-94.88126!3d47.48126!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x52b610c14f0ea6ab%3A0xe03ea6bb4126!2sBemidji%2C%20MN%2056601%2C%20USA!5e0!3m2!1sen!2s!4v1655000000000!5m2!1sen!2s"
                width="100%"
                height="100%"
                style={{ border: 0, minHeight: '350px', borderRadius: '24px' }}
                allowFullScreen
                loading="lazy"
              ></iframe>
            </div>
            <ul className="contact_info d-flex flex-column flex-md-row flex-lg-column flex-wrap">
              <li className="contact_info-item">
                <h5 className="contact_info-item_header">Office Locations:</h5>
                <div className="contact_info-item_content">
                  <div className="wrapper">
                    <span>9706 S. Mayfield Lane</span>
                    <span>Bemidji, MN 56601</span>
                  </div>
                  <div className="wrapper">
                    <span>12 The Copse, Sutton-in-Ashfield,</span>
                    <span>England United Kingdom</span>
                  </div>
                </div>
              </li>
              <li className="contact_info-item">
                <h5 className="contact_info-item_header">Phone Numbers:</h5>
                <div className="contact_info-item_content">
                  <div className="wrapper">
                    <a className="link" href="tel:+13025550134">+1-302-555-0134</a>
                    <a className="link" href="tel:+16025550134" style={{ display: 'block', marginTop: '5px' }}>+1-602-555-0134</a>
                  </div>
                </div>
              </li>
              <li className="contact_info-item">
                <h5 className="contact_info-item_header">Send Us a Message:</h5>
                <div className="contact_info-item_content">
                  <ul className="socials d-flex" style={{ gap: '10px', marginBottom: '15px' }}>
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
                      <a className="link" href="https://linkedin.com/" target="_blank" rel="noopener noreferrer">
                        <i className="icon-linkedin icon"></i>
                      </a>
                    </li>
                  </ul>
                  <a className="link link--underline" href="mailto:sitechcompany@email.com">sitechcompany@email.com</a>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Collapsible FAQ Accordion */}
        <div className="faq">
          <div className="container">
            <div className="faq_wrapper">
              <div className="accordion" id="faq_accordion">
                {/* FAQ 1 */}
                <div className="accordion_item">
                  <div className="accordion_item-wrapper">
                    <h4
                      className={`title d-flex justify-content-between align-items-center ${activeFaq !== 'item-1' ? 'collapsed' : ''}`}
                      onClick={() => setActiveFaq(activeFaq === 'item-1' ? null : 'item-1')}
                      style={{ cursor: 'pointer' }}
                    >
                      How it works with your business
                      <span className={`title_icon ${activeFaq === 'item-1' ? 'transform' : ''}`}>
                        <i className="icon-arrow-left icon arrow-rotate"></i>
                      </span>
                    </h4>
                    <div className="accordion-collapse" style={{ display: activeFaq === 'item-1' ? 'block' : 'none' }}>
                      <div className="body">
                        <div className="main">
                          <p className="main_general">
                            Suspendisse hendrerit, augue accumsan dictum tincidunt, sem sapien lobortis nibh, vitae auctor mi tortor et ipsum. Duis vitae augue vitae mi suscipit rutrum vitae non eros.
                          </p>
                          <ul className="main_list">
                            <li className="main_list-item">
                              <span className="number">01</span>
                              <div className="main">
                                <h6 className="main_title">Choosing the optimal solution</h6>
                                <p className="main_text">
                                  Nullam elementum, magna at suscipit lobortis, dui nibh molestie enim, sed scelerisque ex odio sit amet purus. Pellentesque fermentum mauris
                                </p>
                              </div>
                            </li>
                          </ul>
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
                      All Services that we provide
                      <span className={`title_icon ${activeFaq === 'item-2' ? 'transform' : ''}`}>
                        <i className="icon-arrow-left icon arrow-rotate"></i>
                      </span>
                    </h4>
                    <div className="accordion-collapse" style={{ display: activeFaq === 'item-2' ? 'block' : 'none' }}>
                      <div className="body">
                        <div className="main">
                          <p className="main_general">
                            Suspendisse hendrerit, augue accumsan dictum tincidunt, sem sapien lobortis nibh, vitae auctor mi tortor et ipsum. Duis vitae augue vitae mi suscipit rutrum vitae non eros.
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

        {/* Stripe Ticker section */}
        <div className="stripe d-flex align-items-center">
          <div className="stripe_block d-none d-sm-flex align-items-center">
            <span className="stripe_block-icon"><i className="icon-arrow-left icon"></i></span>
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
