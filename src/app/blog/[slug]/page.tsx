import { notFound } from "next/navigation";
import { getAllSlugs, getPostBySlug } from "@/lib/blog";
import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import Preloader from "@/app/components/Preloader";
import { Calendar, Clock, ArrowLeft, Tag, User } from "lucide-react";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};
  return {
    title: `${post.title} — Geekvista Blog`,
    description: post.description,
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) notFound();

  // Dynamically import the MDX file
  const { default: PostContent } = await import(
    `@content/blog/${slug}.mdx`
  );

  return (
    <>
      <Preloader />

      {/* Header navigation bar */}
      <Header dataPage="blog" dataPageParent="blog" />

      {/* Page Header Header */}
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
            <li className="breadcrumbs_item">
              <Link className="link" href="/blog">Blog</Link>
            </li>
            <li className="breadcrumbs_item current">
              <span id="currentpage">{post.title}</span>
            </li>
          </ul>
        </div>
        <div className="container d-md-flex">
          <div className="page_main">
            <h1 className="page_main-title">{post.title}</h1>
            <p className="page_main-text">{post.description}</p>
          </div>
        </div>
      </header>

      {/* Post Body Section */}
      <main className="bg-white py-12 text-slate-800">
        <div className="max-w-3xl mx-auto px-4">
          {/* Back link */}
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-[#1E3A8A] hover:text-[#2563eb] font-medium text-sm mb-8 transition-colors group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Back to All Articles
          </Link>

          {/* Post Meta Header */}
          <div className="mb-10 pb-6 border-b border-slate-200">
            <div className="flex flex-wrap gap-2 mb-4">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 text-xs bg-blue-50 text-[#1E3A8A] border border-blue-100 font-medium px-3 py-1 rounded-full"
                >
                  <Tag size={11} />
                  {tag}
                </span>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-5 text-sm text-slate-500">
              <span className="flex items-center gap-1.5 font-medium text-slate-700">
                <User size={14} className="text-[#1E3A8A]" />
                {post.author}
                {post.authorRole && (
                  <span className="text-slate-400 font-normal">({post.authorRole})</span>
                )}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar size={14} className="text-[#1E3A8A]" />
                {new Date(post.date).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock size={14} className="text-[#10B981]" />
                {post.readingTime}
              </span>
            </div>
          </div>

          {/* MDX Article Body */}
          <article className="blog-prose max-w-none">
            <PostContent />
          </article>

          {/* Call to Action Box */}
          <div className="mt-14 rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center shadow-sm">
            <h3 className="text-2xl font-bold text-slate-900 mb-2">
              Ready to Automate Customer Support?
            </h3>
            <p className="text-slate-600 mb-6 max-w-md mx-auto">
              Deploy your custom AI chatbot in under 5 minutes. No credit card required.
            </p>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 bg-[#F97316] hover:bg-[#ea580c] text-white font-semibold px-6 py-3 rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
            >
              Get Started Free →
            </Link>
          </div>

          {/* Bottom Back Button */}
          <div className="mt-10 text-center">
            <Link
              href="/blog"
              className="text-slate-500 hover:text-[#1E3A8A] text-sm font-medium transition-colors"
            >
              ← Back to Blog
            </Link>
          </div>
        </div>
      </main>

      {/* Footer component */}
      <Footer />

      {/* Lottie Player Script */}
      <Script src="https://unpkg.com/@lottiefiles/lottie-player@2.0.12/dist/lottie-player.js" strategy="afterInteractive" />
    </>
  );
}
