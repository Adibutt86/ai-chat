'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/app/context/AuthContext';

interface HeaderProps {
  dataPage?: string;
  dataPageParent?: string;
}

export default function Header({ dataPage = 'contact', dataPageParent = 'contact' }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const { session, loading } = useAuth();

  return (
    <header className="header d-lg-flex align-items-center" data-page={dataPage} data-page-parent={dataPageParent}>
      <div className="container d-flex align-items-center flex-wrap flex-lg-nowrap justify-content-between w-100">
        <Link className="logo header_logo d-inline-flex align-items-center gap-2" href="/" style={{ flexGrow: 0, textDecoration: 'none' }}>
          <span className="logo_icon d-inline-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px', minWidth: '40px', minHeight: '40px', flexShrink: 0 }}>
            <img src="/svg/logo.svg" alt="Geekvista AI" style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} />
          </span>
          <span className="logo_text h4 mb-0" style={{ fontSize: '22px', fontWeight: 800, lineHeight: '1.2', color: '#1b2129', whiteSpace: 'nowrap' }}>Geekvista AI</span>
        </Link>

        <nav className={`header_nav collapse ${mobileMenuOpen ? 'show' : ''} d-lg-flex justify-content-lg-center`} id="headerMenu" style={{ flexGrow: 1, visibility: 'visible', overflow: 'visible', maxHeight: 'none' }}>
          <ul className="header_nav-list">
            <li className={`header_nav-list_item dropdown ${activeDropdown === 'home' ? 'show' : ''}`}>
              <a
                className="nav-link nav-item dropdown-toggle d-flex align-items-center justify-content-between"
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setActiveDropdown(activeDropdown === 'home' ? null : 'home');
                }}
              >
                <span className="nav-item_text">
                  Home <i className="icon-circle icon"></i>
                </span>
                <i className="icon-arrow-left icon arrow-rotate"></i>
              </a>
              <div className={`dropdown-menu collapse ${activeDropdown === 'home' ? 'show' : ''}`}>
                <ul className="dropdown-list">
                  <li className="list-item" data-main="true">
                    <Link className="dropdown-item nav-item" href="/">Home 1</Link>
                  </li>
                </ul>
              </div>
            </li>

            <li className="header_nav-list_item">
              <Link className="nav-item nav-link" href="/about">
                <span className="nav-item_text">About</span>
              </Link>
            </li>



            <li className="header_nav-list_item">
              <Link className="nav-item nav-link" href="/prices">
                <span className="nav-item_text">Prices</span>
              </Link>
            </li>

            <li className="header_nav-list_item">
              <Link className="nav-item nav-link" href="/blog">
                <span className="nav-item_text">Blog</span>
              </Link>
            </li>



            <li className="header_nav-list_item">
              <Link className={`nav-item nav-link ${dataPage === 'wordpress' ? 'current' : ''}`} href="/wordpress">
                <span className="nav-item_text">WP Plugin</span>
              </Link>
            </li>

            <li className="header_nav-list_item">
              <Link className={`nav-item nav-link ${dataPage === 'contact' ? 'current' : ''}`} href="/contact">
                <span className="nav-item_text">Contact</span>
              </Link>
            </li>

            <li className="header_nav-list_btn d-flex d-lg-none flex-column gap-2">
              {session ? (
                <Link className="btn btn--neon text-center" href="/dashboard">Dashboard</Link>
              ) : (
                <>
                  <Link className="btn btn--neon text-center" href="/register">Get Started</Link>
                  <Link className="btn btn--white text-center" href="/login">Sign In</Link>
                </>
              )}
            </li>
          </ul>
        </nav>

        <div className="d-none d-lg-flex align-items-center gap-3" style={{ order: 3 }}>
          {session ? (
            <Link className="header_btn btn btn--neon m-0" href="/dashboard">
              Dashboard
            </Link>
          ) : (
            <>
              <Link href="/login" style={{ marginRight: '15px', fontWeight: 700, color: '#1b2129', textDecoration: 'none' }}>
                Sign In
              </Link>
              <Link className="header_btn btn btn--neon m-0" href="/register">
                Get Started
              </Link>
            </>
          )}
        </div>

        <button
          className="header_trigger"
          id="headerTrigger"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          type="button"
          aria-label="Toggle navigation"
        >
          <i className="icon-arrow-left icon arrow-rotate"></i>
        </button>
      </div>
    </header>
  );
}
