'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Script from 'next/script';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import Preloader from '@/app/components/Preloader';

interface BlogItem {
  id: string;
  slug: string;
  title: string;
  date: string;
  author: string;
  comments: string;
  img: string;
  groups: string[];
}

const filterOptions = [
  { id: 'all', label: 'all' },
  { id: 'top', label: 'top' },
  { id: 'advices', label: 'advices' },
  { id: 'market', label: 'Market reporter' },
  { id: 'startups', label: 'Startups' },
  { id: 'maintenance', label: 'maintenance' },
];

const blogPosts: BlogItem[] = [
  {
    id: '1',
    slug: 'build-chatbot-5-minutes',
    title: 'How to Build a Custom AI Chatbot in Under 5 Minutes',
    date: '02 Jan 2026',
    author: 'Emily Smith',
    comments: '2 Comments',
    img: '/img/blog/01.jpg',
    groups: ['advices', 'startups', 'top']
  },
  {
    id: '2',
    slug: '10-ways-ai-reduces-support-costs',
    title: '10 Ways AI Chatbots Can Reduce Customer Support Costs',
    date: '02 Jan 2026',
    author: 'Emily Smith',
    comments: 'No Comments',
    img: '/img/blog/02.jpg',
    groups: ['market', 'startups', 'top']
  },
  {
    id: '3',
    slug: 'rag-vs-fine-tuning',
    title: 'RAG vs Fine-Tuning: Which is Best for AI Chatbots?',
    date: '02 Jan 2026',
    author: 'Emily Smith',
    comments: '3 Comments',
    img: '/img/blog/03.jpg',
    groups: ['market', 'startups', 'top', 'maintenance']
  },
  {
    id: '4',
    slug: 'build-chatbot-5-minutes',
    title: 'We Share Research and Inspiration of Physical and Online Spaces',
    date: '02 Jan 2026',
    author: 'Emily Smith',
    comments: 'no Comments',
    img: '/img/blog/04.jpg',
    groups: ['market', 'advices', 'top', 'maintenance']
  },
  {
    id: '5',
    slug: '10-ways-ai-reduces-support-costs',
    title: 'The Ultimate Guide to Saas Pricing Models, Strategies & Psychological Hacks',
    date: '02 Jan 2026',
    author: 'Emily Smith',
    comments: 'no Comments',
    img: '/img/blog/05.jpg',
    groups: ['advices', 'maintenance']
  },
  {
    id: '6',
    slug: 'rag-vs-fine-tuning',
    title: 'How to Implement and Operate Asset Performance Management Efficiently',
    date: '02 Jan 2026',
    author: 'Emily Smith',
    comments: 'no Comments',
    img: '/img/blog/06.jpg',
    groups: ['startups', 'top', 'maintenance']
  },
  {
    id: '7',
    slug: 'build-chatbot-5-minutes',
    title: 'Amazing VR App Turns Any Room Into A Mixed Reality Stargazing Lounge',
    date: '02 Jan 2026',
    author: 'Emily Smith',
    comments: '1 Comment',
    img: '/img/blog/07.jpg',
    groups: ['startups', 'advices', 'maintenance']
  },
  {
    id: '8',
    slug: '10-ways-ai-reduces-support-costs',
    title: 'Customer Success 101: How to Power Up Your Startup’s Growth and Investments',
    date: '02 Jan 2026',
    author: 'Emily Smith',
    comments: '200 Comments',
    img: '/img/blog/08.jpg',
    groups: ['advices', 'market']
  },
  {
    id: '9',
    slug: 'rag-vs-fine-tuning',
    title: 'Sitech is Tech’s Latest Unicorn: We Raised $150M in Investment',
    date: '02 Jan 2026',
    author: 'Emily Smith',
    comments: 'no Comments',
    img: '/img/blog/09.jpg',
    groups: ['advices', 'market']
  }
];

export default function BlogPage() {
  const [activeFilter, setActiveFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 6;

  const handleFilterChange = (filterId: string) => {
    setActiveFilter(filterId);
    setCurrentPage(1);
  };

  const filteredPosts = activeFilter === 'all'
    ? blogPosts
    : blogPosts.filter((post) => post.groups.includes(activeFilter));

  const totalPages = Math.ceil(filteredPosts.length / postsPerPage) || 1;
  const currentPosts = filteredPosts.slice((currentPage - 1) * postsPerPage, currentPage * postsPerPage);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      const articlesElem = document.getElementById('articles');
      if (articlesElem) {
        articlesElem.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <>
      <Preloader />
      <link rel="stylesheet" href="/css/preload.min.css" />
      <link rel="stylesheet" href="/css/icomoon.css" />
      <link rel="stylesheet" href="/css/libs.min.css" />
      <link rel="stylesheet" href="/css/blog.min.css" />
      <link rel="stylesheet" href="/css/floatbutton.min.css" />

      {/* Header navigation bar */}
      <Header dataPage="blog" dataPageParent="pages" />

      {/* Page Header */}
      <header className="page" style={{ background: 'linear-gradient(135deg, #1E3A8A 0%, #0F172A 100%)', padding: '40px 0 80px', position: 'relative', overflow: 'hidden' }}>
        <div className="container">
          <ul className="breadcrumbs d-flex flex-wrap" style={{ marginBottom: '30px' }}>
            <li className="breadcrumbs_item">
              <Link className="link" href="/" style={{ color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>Home</Link>
            </li>
            <li className="breadcrumbs_item current">
              <span id="currentpage" style={{ color: '#F97316', fontWeight: 700 }}>Blog</span>
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
                Insights & Updates
              </span>
              
              <h1 style={{ 
                color: '#FFFFFF', 
                fontSize: '44px', 
                fontWeight: '800', 
                lineHeight: '1.2', 
                marginBottom: '20px',
                fontFamily: 'inherit' 
              }}>
                AI Chatbot Research, Engineering & SaaS Guides
              </h1>
              
              <p style={{ 
                color: 'rgba(255, 255, 255, 0.82)', 
                fontSize: '17px', 
                lineHeight: '1.7', 
                marginBottom: '32px',
                maxWidth: '560px' 
              }}>
                Discover expert tutorials, architectural breakdowns, and best practices for building, training, and deploying production-ready AI chatbots.
              </p>
              
              <div style={{ display: 'flex', gap: '14px', alignItems: 'center', flexWrap: 'wrap' }}>
                <a className="btn btn--neon" href="#articles" style={{ padding: '0 28px', height: '48px' }}>
                  Explore Articles
                </a>
                <Link className="btn" href="/contact" style={{ 
                  background: 'rgba(255, 255, 255, 0.1)', 
                  border: '1px solid rgba(255, 255, 255, 0.25)', 
                  color: '#FFFFFF',
                  padding: '0 24px',
                  height: '48px',
                  borderRadius: '2px',
                  fontWeight: '700'
                }}>
                  Subscribe
                </Link>
              </div>
            </div>
            
            <div className="col-12 col-xl-6 d-flex justify-content-center" style={{ flex: '1 1 450px' }}>
              <div style={{ position: 'relative', width: '100%', maxWidth: '540px' }}>
                <img 
                  src="/img/blog_hero_fancy.jpg" 
                  alt="Geekvista AI Platform Insights" 
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

      {/* Main Blog Content Section */}
      <main className="blog" id="articles" style={{ paddingTop: '70px', paddingBottom: '90px' }}>
        <div className="container">
          {/* Filters List */}
          <ul className="blog_filters d-flex flex-wrap" style={{ marginBottom: '40px', gap: '10px 15px' }}>
            {filterOptions.map((filter) => (
              <li key={filter.id} className="list-item">
                <a
                  className={`blog_filters-item ${activeFilter === filter.id ? 'current' : ''}`}
                  href="#articles"
                  style={{
                    display: 'inline-block',
                    padding: '8px 20px',
                    borderRadius: '4px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    fontSize: '13px',
                    letterSpacing: '0.5px',
                    transition: 'all 0.3s ease',
                    background: activeFilter === filter.id ? '#F97316' : '#F8FAFC',
                    color: activeFilter === filter.id ? '#FFFFFF' : '#1E293B',
                    border: '1px solid #1B2129',
                    boxShadow: activeFilter === filter.id ? '3px 3px 0 #1B2129' : 'none',
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    handleFilterChange(filter.id);
                  }}
                >
                  {filter.label}
                </a>
              </li>
            ))}
          </ul>

          {/* Posts Grid */}
          <div className="blog_posts d-flex flex-wrap">
            {currentPosts.length > 0 ? (
              currentPosts.map((post) => (
                <div key={post.id} className="blog_posts-item post-item">
                  <div className="wrapper">
                    <div className="main">
                      <Link className="main_title h5" href={`/blog/${post.slug}`}>
                        {post.title}
                      </Link>
                      <div className="main_meta d-flex flex-wrap align-items-center">
                        <p className="main_meta-item">{post.date}</p>
                        <p className="main_meta-item">by {post.author}</p>
                        <p className="main_meta-item">{post.comments}</p>
                      </div>
                    </div>
                    <div className="media">
                      <picture>
                        <img src={post.img} alt={post.title} />
                      </picture>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ padding: '60px 0', textAlign: 'center', width: '100%' }}>
                <p className="h5" style={{ color: '#64748B' }}>No posts found in this category.</p>
              </div>
            )}
          </div>

          {/* Dynamic Interactive Pagination */}
          {totalPages > 1 && (
            <ul className="pagination d-flex flex-wrap align-items-center justify-content-center" style={{ marginTop: '50px', gap: '10px' }}>
              <li className="pagination_item">
                <button
                  className="control btn"
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid #1B2129',
                    padding: '8px 18px',
                    borderRadius: '4px',
                    color: '#1B2129',
                    fontWeight: 700,
                    opacity: currentPage === 1 ? 0.4 : 1,
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
                  }}
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Prev
                </button>
              </li>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <li key={pageNum} className="pagination_item">
                  <button
                    className={`link btn ${currentPage === pageNum ? 'current' : ''}`}
                    style={{
                      background: currentPage === pageNum ? '#1E3A8A' : '#FFFFFF',
                      color: currentPage === pageNum ? '#FFFFFF' : '#1B2129',
                      border: '1px solid #1B2129',
                      width: '42px',
                      height: '42px',
                      borderRadius: '4px',
                      fontWeight: 700,
                      boxShadow: currentPage === pageNum ? '2px 2px 0 #F97316' : 'none',
                      cursor: 'pointer'
                    }}
                    onClick={() => handlePageChange(pageNum)}
                  >
                    {pageNum}
                  </button>
                </li>
              ))}

              <li className="pagination_item">
                <button
                  className="control btn"
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid #1B2129',
                    padding: '8px 18px',
                    borderRadius: '4px',
                    color: '#1B2129',
                    fontWeight: 700,
                    opacity: currentPage === totalPages ? 0.4 : 1,
                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
                  }}
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
              </li>
            </ul>
          )}
        </div>
      </main>

      {/* Footer component */}
      <Footer />

      {/* Lottie Player Script */}
      <Script src="https://unpkg.com/@lottiefiles/lottie-player@2.0.12/dist/lottie-player.js" strategy="afterInteractive" />
    </>
  );
}

