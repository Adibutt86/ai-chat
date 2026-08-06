import React from 'react';
import Link from 'next/link';
import Script from 'next/script';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import Preloader from '@/app/components/Preloader';
import { getAllPosts, getAllTags } from '@/lib/blog';
import { Calendar, Clock, Tag, ArrowRight, BookOpen, Zap } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog & Insights — Geekvista',
  description: 'Tutorials, deep dives, and best practices to help you build better customer experiences with AI chatbots.',
};

export default async function BlogPage() {
  const posts = getAllPosts();
  const tags = getAllTags();

  const featured = posts.find((p) => p.featured) || posts[0];
  const remainingPosts = featured
    ? posts.filter((p) => p.slug !== featured.slug)
    : posts;

  return (
    <>
      <Preloader />

      {/* Header navigation bar */}
      <Header dataPage="blog" dataPageParent="blog" />

      {/* Page Header */}
      <header className="page">
        <div className="page_shapes">
          <img className="shape shape--left" src="/svg/ovalblue.svg" alt="Blog" />
          <img className="shape shape--right" src="/svg/bgshape_white2.svg" alt="Blog" />
        </div>
        <div className="container">
          <ul className="breadcrumbs d-flex flex-wrap">
            <li className="breadcrumbs_item">
              <Link className="link" href="/">Home</Link>
            </li>
            <li className="breadcrumbs_item current">
              <span id="currentpage">Blog</span>
            </li>
          </ul>
        </div>
        <div className="container d-md-flex">
          <div className="page_main">
            <h1 className="page_main-title">Blog &amp; Insights</h1>
            <p className="page_main-text">
              Tutorials, deep dives, and best practices to help you build better customer experiences with AI chatbots.
            </p>
          </div>
        </div>
      </header>

      {/* Main Blog Content Section */}
      <main className="bg-white py-16 text-slate-800">
        <div className="container max-w-6xl mx-auto px-4">

          {/* Tags list */}
          {tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 mb-10 pb-6 border-b border-slate-200">
              <span className="text-slate-500 text-sm font-medium mr-2">Topics:</span>
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 text-xs px-3.5 py-1.5 rounded-full font-medium bg-slate-100 text-slate-700 border border-slate-200"
                >
                  <Tag size={11} className="text-[#1E3A8A]" />
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Featured post */}
          {featured && (
            <div className="mb-14">
              <div className="flex items-center gap-2 mb-4">
                <span className="inline-flex items-center gap-1 bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/30 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
                  <Zap size={13} /> Featured Article
                </span>
              </div>
              <Link href={`/blog/${featured.slug}`} className="group block">
                <div className="relative rounded-2xl border border-slate-200 bg-white p-8 md:p-10 shadow-sm hover:shadow-xl hover:border-[#1E3A8A]/40 transition-all duration-300">
                  <div className="relative z-10">
                    <div className="flex flex-wrap gap-2 mb-4">
                      {featured.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs font-medium bg-blue-50 text-[#1E3A8A] border border-blue-100 px-2.5 py-1 rounded-md"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <h2 className="text-2xl md:text-4xl font-bold text-slate-900 mb-4 group-hover:text-[#1E3A8A] transition-colors leading-tight">
                      {featured.title}
                    </h2>
                    <p className="text-slate-600 text-base md:text-lg mb-6 max-w-3xl leading-relaxed">
                      {featured.description}
                    </p>

                    <div className="flex items-center justify-between flex-wrap gap-4 pt-4 border-t border-slate-100">
                      <div className="flex items-center gap-4 text-xs md:text-sm text-slate-500">
                        <span className="flex items-center gap-1.5">
                          <Calendar size={14} className="text-[#1E3A8A]" />
                          {new Date(featured.date).toLocaleDateString('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock size={14} className="text-[#10B981]" />
                          {featured.readingTime}
                        </span>
                        <span className="text-slate-400">by {featured.author}</span>
                      </div>

                      <span className="inline-flex items-center gap-2 text-[#F97316] font-semibold text-sm group-hover:translate-x-1 transition-transform">
                        Read Article <ArrowRight size={16} />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          )}

          {/* Post grid */}
          {remainingPosts.length > 0 && (
            <>
              <h2 className="text-slate-900 font-bold text-xl mb-6">
                Recent Articles
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {remainingPosts.map((post) => (
                  <Link
                    key={post.slug}
                    href={`/blog/${post.slug}`}
                    className="group block h-full"
                  >
                    <article className="h-full rounded-xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md hover:border-[#1E3A8A]/30 transition-all duration-300 flex flex-col">
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {post.tags.slice(0, 2).map((tag) => (
                          <span
                            key={tag}
                            className="text-[11px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      <h3 className="font-bold text-slate-900 text-lg mb-2 group-hover:text-[#1E3A8A] transition-colors leading-snug flex-1">
                        {post.title}
                      </h3>
                      <p className="text-slate-500 text-sm leading-relaxed mb-4 line-clamp-2">
                        {post.description}
                      </p>

                      <div className="flex items-center justify-between text-xs text-slate-400 mt-auto pt-3 border-t border-slate-100">
                        <span className="flex items-center gap-1">
                          <Calendar size={12} className="text-[#1E3A8A]" />
                          {new Date(post.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={12} className="text-[#10B981]" />
                          {post.readingTime}
                        </span>
                      </div>
                    </article>
                  </Link>
                ))}
              </div>
            </>
          )}

          {posts.length === 0 && (
            <div className="text-center py-20 text-slate-400">
              <BookOpen size={40} className="mx-auto mb-3 text-slate-300" />
              <p className="text-lg">No posts found.</p>
            </div>
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
