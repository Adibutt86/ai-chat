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

  const filteredPosts = activeFilter === 'all'
    ? blogPosts
    : blogPosts.filter((post) => post.groups.includes(activeFilter));

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
      <header className="page">
        <div className="container">
          <ul className="breadcrumbs d-flex flex-wrap">
            <li className="breadcrumbs_item">
              <Link className="link" href="/">Home</Link>
            </li>
            <li className="breadcrumbs_item current">
              <span id="currentpage">Blog</span>
            </li>
          </ul>
          <div className="wrapper">
            <span className="tw-height h2"><span className="text">Our Blog</span></span>
            <h2 className="page_title type" data-text="Our Blog">Our Blog</h2>
          </div>
        </div>
      </header>

      {/* Main Blog Content Section */}
      <main className="blog">
        <div className="container">
          {/* Filters List */}
          <ul className="blog_filters d-flex flex-wrap">
            {filterOptions.map((filter) => (
              <li key={filter.id} className="list-item">
                <a
                  className={`blog_filters-item ${activeFilter === filter.id ? 'current' : ''}`}
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveFilter(filter.id);
                  }}
                >
                  {filter.label}
                </a>
              </li>
            ))}
          </ul>

          {/* Posts Grid */}
          <div className="blog_posts d-flex flex-wrap">
            {filteredPosts.map((post) => (
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
            ))}
          </div>

          {/* Pagination */}
          <ul className="pagination d-flex flex-wrap align-items-center justify-content-end">
            <li className="pagination_item">
              <a className="link current" href="#">1</a>
            </li>
            <li className="pagination_item">
              <a className="link" href="#">2</a>
            </li>
            <li className="pagination_item">
              <a className="link" href="#">3</a>
            </li>
            <li className="pagination_item">
              <a className="control" href="#">
                <i className="icon-chevron-double-right icon"></i>
              </a>
            </li>
          </ul>
        </div>
      </main>

      {/* Footer component */}
      <Footer />

      {/* Lottie Player Script */}
      <Script src="https://unpkg.com/@lottiefiles/lottie-player@2.0.12/dist/lottie-player.js" strategy="afterInteractive" />
    </>
  );
}

