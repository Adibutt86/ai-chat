'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Footer() {
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
              <Link className="link h5" href="/prices">
                Prices <i className="icon-arrow-left icon arrow-rotate"></i>
              </Link>
            </li>
            <li className="footer_top-nav_link">
              <Link className="link h5" href="/blog">
                Blog <i className="icon-arrow-left icon arrow-rotate"></i>
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
          Copyright &copy; {new Date().getFullYear()} AICHAT
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
  );
}
