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
      <link rel="stylesheet" href="/css/preload.min.css" />
      <link rel="stylesheet" href="/css/icomoon.css" />
      <link rel="stylesheet" href="/css/libs.min.css" />
      <link rel="stylesheet" href="/css/post.min.css" />
      <link rel="stylesheet" href="/css/floatbutton.min.css" />

      {/* Header navigation bar */}
      <Header dataPage="post" dataPageParent="pages" />

      {/* Page Header Header */}
      <header className="page">
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

          <div className="page_header">
            <div className="wrapper">
              <span className="tw-height h2"><span className="text">{post.title}</span></span>
              <h2 className="page_main-title type" data-text={post.title}>{post.title}</h2>
            </div>
            <div className="main_meta d-flex flex-wrap align-items-center mt-3">
              <span className="main_meta-bookmark"><i className="icon-bookmark icon"></i></span>
              <p className="main_meta-item">
                {new Date(post.date).toLocaleDateString("en-US", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </p>
              <p className="main_meta-item">by {post.author}</p>
              <p className="main_meta-item">{post.readingTime}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Post Body Section */}
      <main className="post">
        <div className="container py-5">
          <article className="article">
            <div className="article_media article_media--main mb-4">
              <picture>
                <img
                  src={post.coverImage || "/img/post/main.jpg"}
                  alt={post.title}
                  style={{ width: '100%', maxHeight: '500px', objectFit: 'cover' }}
                />
              </picture>
            </div>

            <div className="container--sm py-3" style={{ fontSize: '1.1rem', lineHeight: '1.8' }}>
              <PostContent />
            </div>

            {post.tags && post.tags.length > 0 && (
              <div className="article_tags container--sm mt-4">
                <ul className="article_tags-list d-flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <li key={tag} className="list-item">
                      <span className="tag">{tag}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </article>

          {/* Navigation link */}
          <div className="mt-5 text-center">
            <Link href="/blog" className="btn btn--neon d-inline-flex">
              ← Back to All Articles
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

