'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Header from '@/app/components/Header';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

// Import Lottie animations dynamically to prevent hydration/SSR mismatches
const Lottie = dynamic(() => import('lottie-react'), { ssr: false });
import herohomeAnimation from '@/../public/lottie/herohome.json';
import paperplaneAnimation from '@/../public/lottie/paperplane.json';

// Declarative Viewport Counter
function Counter({ value, suffix = '', separator = ',' }: { value: number; suffix?: string; separator?: string }) {
  const [count, setCount] = useState(0);
  const elementRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let startTimestamp: number | null = null;
    let animationFrameId: number;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / 2000, 1);
      setCount(Math.floor(progress * value));
      if (progress < 1) {
        animationFrameId = window.requestAnimationFrame(step);
      }
    };

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        animationFrameId = window.requestAnimationFrame(step);
        observer.disconnect();
      }
    });

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      observer.disconnect();
    };
  }, [value]);

  const formatted = count.toLocaleString('en-US').replace(/,/g, separator);

  return <span ref={elementRef}>{formatted}{suffix}</span>;
}

// Pure CSS high-performance marquee ticker
function Ticker() {
  const items = ["FRD Company", "Cryptochain", "SMMHelper", "Innovation Line", "Basic Data"];
  return (
    <div className="ticker h3 overflow-hidden w-100" style={{ whiteSpace: 'nowrap', display: 'flex', border: 'none', background: 'transparent' }}>
      <div 
        className="d-flex animate-marquee"
        style={{
          display: 'inline-flex',
          gap: '3rem'
        }}
      >
        {[...items, ...items, ...items, ...items].map((item, idx) => (
          <span key={idx} className="ticker-item" style={{ display: 'inline-block', marginRight: '2rem', visibility: 'visible' }}>
            {item}
          </span>
        ))}
      </div>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: inline-flex !important;
          animation: marquee 20s linear infinite !important;
        }
        .ticker-item {
          visibility: visible !important;
        }
      `}} />
    </div>
  );
}

export default function Home() {
  // FAQ Accordion State
  const [activeFaq, setActiveFaq] = useState<string | null>('item-1');

  // Scroll to Top state
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
    <>
      {/* Stylesheets loaded via HTML head for page-specific scope */}
      <link rel="stylesheet" href="/css/preload.min.css" />
      <link rel="stylesheet" href="/css/icomoon.css" />
      <link rel="stylesheet" href="/css/libs.min.css" />
      <link rel="stylesheet" href="/css/index.min.css" />
      <link rel="stylesheet" href="/css/floatbutton.min.css" />

      {/* Header navigation bar */}
      <Header dataPage="home" dataPageParent="home" />

      <main>
        {/* Hero Section */}
        <section className="hero">
          <div className="hero_bg">
            <img className="hero_bg-blue" src="/svg/herohome1.svg" alt="The Fastest Web Solutions" />
          </div>
          <div className="container d-xl-flex">
            <div className="hero_main">
              <span style={{ color: 'var(--primary)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '8px', display: 'block', fontSize: '14px' }}>
                Meet ChatBox AI
              </span>
              <span className="tw-height h1">
                <span className="text">Engage, Support & Convert</span>
              </span>
              <h1 className="hero_main-title type" data-text="Engage, Support & Convert">
                Engage, Support & Convert
              </h1>
              <p className="hero_main-text">
                ChatBox AI provides beautiful, custom-trained conversational widgets designed to integrate seamlessly into your website. Automate customer support, capture high-quality leads, and delight visitors 24/7.
              </p>
              
              <div className="hero_main-features" style={{ margin: '20px 0 30px 0', display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '14px', background: 'rgba(42, 42, 255, 0.1)', padding: '6px 12px', borderRadius: '20px', border: '1px solid rgba(42, 42, 255, 0.2)' }}>
                  ⚡ Instant Embed
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '14px', background: 'rgba(42, 42, 255, 0.1)', padding: '6px 12px', borderRadius: '20px', border: '1px solid rgba(42, 42, 255, 0.2)' }}>
                  🤖 Powered by ChatBox AI
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '14px', background: 'rgba(42, 42, 255, 0.1)', padding: '6px 12px', borderRadius: '20px', border: '1px solid rgba(42, 42, 255, 0.2)' }}>
                  🔌 WordPress Ready
                </span>
              </div>

              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                <a className="hero_main-btn btn btn--neon signUpTrigger" href="#">Try For Free</a>
                <a className="hero_main-btn btn" href="#features" style={{ background: 'transparent', border: '1px solid rgba(0,0,0,0.15)', color: 'inherit' }}>Explore Features</a>
              </div>
            </div>
            <div className="hero_media animate-fadeIn" style={{ minHeight: '490px', width: '100%', maxWidth: '770px' }}>
              <Lottie animationData={herohomeAnimation} loop={true} autoplay={true} style={{ width: '100%', height: '100%' }} />
            </div>
          </div>
        </section>

        {/* Services Grid Section */}
        <div className="services">
          <img className="services_shape" src="/svg/blueshape1.svg" alt="Our Features and Services" />
          <div className="container d-flex flex-column-reverse flex-xl-row">
            <div className="services_media">
              <img src="/svg/Illustration-2.svg" alt="Our Features and Services" />
            </div>
            <ul className="services_list">
              <motion.li 
                className="wrapper"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <Link className="services_list-item d-flex flex-column" href="/service">
                  <i className="icon-chart-bar icon"></i>
                  <span className="title h5">Data Analysis</span>
                  <p className="text">
                    Phasellus fringilla tuc dignissim diam. Duis nec tempus ligula. Curabitur vel pretium. Vestibulum metus pur esta
                  </p>
                </Link>
              </motion.li>
              <motion.li 
                className="wrapper"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <Link className="services_list-item d-flex flex-column" href="/service">
                  <i className="icon-cloud icon"></i>
                  <span className="title h5">Optimization</span>
                  <p className="text">
                    Phasellus fringilla dignissim diam. Duis nec tempus ligula. Curabitur vel pretium. Vestibulum metus pur esta
                  </p>
                </Link>
              </motion.li>
              <motion.li 
                className="wrapper"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Link className="services_list-item d-flex flex-column" href="/service">
                  <i className="icon-filesearch icon"></i>
                  <span className="title h5">Content Track</span>
                  <p className="text">
                    Phasellus fringilla tuc dignissim diam. Duis nec tempus ligula. Curabitur vel pretium. Vestibulum metus pur esta
                  </p>
                </Link>
              </motion.li>
              <motion.li 
                className="wrapper"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Link className="services_list-item d-flex flex-column" href="/service">
                  <i className="icon-protect icon"></i>
                  <span className="title h5">Risk Manage</span>
                  <p className="text">
                    Phasellus fringilla dignissim diam. Duis nec tempus ligula. Curabitur vel pretium. Vestibulum metus pur esta
                  </p>
                </Link>
              </motion.li>
            </ul>
          </div>
        </div>

        {/* About Tools Section */}
        <section className="about">
          <img className="about_shape" src="/svg/bg%202.svg" alt="The Right Digital Tools for Business" />
          <div className="container d-lg-flex">
            <div className="about_main">
              <div className="wrapper">
                <span className="tw-height h4">
                  <span className="text">The Right Digital Tools for Business</span>
                </span>
                <h4 className="about_main-title type" data-text="The Right Digital Tools for Business">
                  The Right Digital Tools for Business
                </h4>
              </div>
              <p className="about_main-text">
                Phasellus dapibus non sem sit amet dictum. Nunc non eros aliquam, vulputate lectus eget, cursus risus. Vestibulum nec erat et nunc eleifend finibus quis in nunc
              </p>
              <ul className="about_main-list d-flex flex-column">
                <motion.li 
                  className="about_main-list_item"
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                >
                  <span className="media">
                    <i className="icon-rabbit icon"></i>
                  </span>
                  <div className="main">
                    <h6 className="main_title">Detects your platform and makes installation on your websites a breeze</h6>
                    <p className="main_text">
                      Phasellus dapibus non sem sit amet dictum. Nunc non eros aliquam, vulputate lectus eget, cursus risus. Vestibulum nec erat et nunc eleifend finibus quis in nunc
                    </p>
                  </div>
                </motion.li>
                <motion.li 
                  className="about_main-list_item"
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  <span className="media">
                    <i className="icon-star icon"></i>
                  </span>
                  <div className="main">
                    <h6 className="main_title">Advanced catalog of top analytics and marketing services to address your business needs</h6>
                    <p className="main_text">
                      Vulputate lectus eget, cursus risus. Vestibulum nec erat et nunc eleifend finibus quis in nunc
                    </p>
                  </div>
                </motion.li>
                <motion.li 
                  className="about_main-list_item"
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <span className="media">
                    <i className="icon-moneyglass icon"></i>
                  </span>
                  <div className="main">
                    <h6 className="main_title">More users from searches using smart algorithm ASO tools</h6>
                    <p className="main_text">
                      Nunc non eros aliquam, vulputate lectus eget, cursus risus. Vestibulum nec erat et nunc eleifend finibus quis in nunc. Aliquam erat volutpat
                    </p>
                  </div>
                </motion.li>
              </ul>
              <div className="about_main-action d-flex flex-column flex-sm-row">
                <a className="about_main-action_btn btn btn--white signUpTrigger" href="#">View Demo</a>
                <a className="about_main-action_btn btn btn--neon signUpTrigger" href="#">Free Trial</a>
              </div>
            </div>
            <div className="about_media">
              <img className="about_media-main" src="/svg/illustartion%203.svg" alt="The Right Digital Tools for Business" />
              <img className="about_media-shape" src="/svg/shapes_bg3.svg" alt="The Right Digital Tools for Business" />
            </div>
          </div>
        </section>



        {/* FAQ Accordion Section */}
        <div className="faq">
          <div className="container">
            <div className="accordion" id="faq_accordion">
              {/* ACCORDION ITEM 1 */}
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
                                 Nullam elementum, magna at suscipit lobortis, dui nibh molestie enim, sed scelerisque ex odio sit amet purus. Pellentesque fermentum mauris eget ligula Praesent lacinia ligula nec ligula convallis. Duis sagittis suscipit risus vitae tincidunt
                               </p>
                            </div>
                          </li>
                          <li className="main_list-item">
                            <span className="number">02</span>
                            <div className="main">
                               <h6 className="main_title">Big Data Discover, Elaborate, Optimization</h6>
                               <p className="main_text">
                                 Nullam elementum, magna at suscipit lobortis, dui nibh molestie enim, sed scelerisque ex odio sit amet purus. Pellentesque fermentum mauris eget ligula. Praesent lacinia ligula nec ligula convallis, eu facilisis nulla lobortis. Phasellus nec gravida elit
                               </p>
                            </div>
                          </li>
                          <li className="main_list-item">
                            <span className="number">03</span>
                            <div className="main">
                               <h6 className="main_title">Support and Promote Services</h6>
                               <p className="main_text">
                                 Nullam elementum, magna at suscipit lobortis, dui nibh molestie enim, sed scelerisque ex odio sit amet purus. Pellentesque fermentum mauris eget ligula.Praesent lacinia ligula nec ligula convallis, eu facilisis nulla lobortis. Phasellus nec gravida elit. Duis sagittis suscipit risus vitae tincidunt lorem
                               </p>
                            </div>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ACCORDION ITEM 2 */}
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
                        <ul className="main_list">
                          <li className="main_list-item">
                            <span className="number">01</span>
                            <div className="main">
                               <h6 className="main_title">Choosing the optimal solution</h6>
                               <p className="main_text">
                                 Nullam elementum, magna at suscipit lobortis, dui nibh molestie enim, sed scelerisque ex odio sit amet purus. Pellentesque fermentum mauris eget ligula Praesent lacinia ligula nec ligula convallis. Duis sagittis suscipit risus vitae tincidunt
                               </p>
                            </div>
                          </li>
                          <li className="main_list-item">
                            <span className="number">02</span>
                            <div className="main">
                               <h6 className="main_title">Big Data Discover, Elaborate, Optimization</h6>
                               <p className="main_text">
                                 Nullam elementum, magna at suscipit lobortis, dui nibh molestie enim, sed scelerisque ex odio sit amet purus. Pellentesque fermentum mauris eget ligula. Praesent lacinia ligula nec ligula convallis, eu facilisis nulla lobortis. Phasellus nec gravida elit
                               </p>
                            </div>
                          </li>
                          <li className="main_list-item">
                            <span className="number">03</span>
                            <div className="main">
                               <h6 className="main_title">Support and Promote Services</h6>
                               <p className="main_text">
                                 Nullam elementum, magna at suscipit lobortis, dui nibh molestie enim, sed scelerisque ex odio sit amet purus. Pellentesque fermentum mauris eget ligula.Praesent lacinia ligula nec ligula convallis, eu facilisis nulla lobortis. Phasellus nec gravida elit. Duis sagittis suscipit risus vitae tincidunt lorem
                               </p>
                            </div>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ACCORDION ITEM 3 */}
              <div className="accordion_item">
                <div className="accordion_item-wrapper">
                  <h4
                    className={`title d-flex justify-content-between align-items-center ${activeFaq !== 'item-3' ? 'collapsed' : ''}`}
                    onClick={() => setActiveFaq(activeFaq === 'item-3' ? null : 'item-3')}
                    style={{ cursor: 'pointer' }}
                  >
                    Advanced Solutions & Prices
                    <span className={`title_icon ${activeFaq === 'item-3' ? 'transform' : ''}`}>
                      <i className="icon-arrow-left icon arrow-rotate"></i>
                    </span>
                  </h4>
                  <div className="accordion-collapse" style={{ display: activeFaq === 'item-3' ? 'block' : 'none' }}>
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
                                 Nullam elementum, magna at suscipit lobortis, dui nibh molestie enim, sed scelerisque ex odio sit amet purus. Pellentesque fermentum mauris eget ligula Praesent lacinia ligula nec ligula convallis. Duis sagittis suscipit risus vitae tincidunt
                               </p>
                            </div>
                          </li>
                          <li className="main_list-item">
                            <span className="number">02</span>
                            <div className="main">
                               <h6 className="main_title">Big Data Discover, Elaborate, Optimization</h6>
                               <p className="main_text">
                                 Nullam elementum, magna at suscipit lobortis, dui nibh molestie enim, sed scelerisque ex odio sit amet purus. Pellentesque fermentum mauris eget ligula. Praesent lacinia ligula nec ligula convallis, eu facilisis nulla lobortis. Phasellus nec gravida elit
                               </p>
                            </div>
                          </li>
                          <li className="main_list-item">
                            <span className="number">03</span>
                            <div className="main">
                               <h6 className="main_title">Support and Promote Services</h6>
                               <p className="main_text">
                                 Nullam elementum, magna at suscipit lobortis, dui nibh molestie enim, sed scelerisque ex odio sit amet purus. Pellentesque fermentum mauris eget ligula.Praesent lacinia ligula nec ligula convallis, eu facilisis nulla lobortis. Phasellus nec gravida elit. Duis sagittis suscipit risus vitae tincidunt lorem
                               </p>
                            </div>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Join Sitech banner */}
        <section className="join section">
          <div className="join_media">
            <img className="join_media-left" src="/svg/joinman.svg" alt="Join Us" />
            <div className="group">
              <img className="shape" src="/svg/bgshape_white.svg" alt="Join Us" />
              <img className="speaker" src="/svg/speaker.svg" alt="Join Us" />
            </div>
          </div>
          <div className="container d-md-flex flex-column align-items-center">
            <h3 className="join_header">
              Join <span className="join_header-wrapper"><Counter value={68000} suffix="+" /></span> growing businesses that use Sitech to drive Customer Experience
            </h3>
            <ul className="join_list d-flex flex-column flex-md-row justify-content-md-center">
              <li className="join_list-item">
                <i className="icon-check icon"></i> No credit card required
              </li>
              <li className="join_list-item">
                <i className="icon-check icon"></i> 14-day free trial
              </li>
              <li className="join_list-item">
                <i className="icon-check icon"></i> Cancel Anytime
              </li>
            </ul>
            <a className="join_btn btn btn--neon signUpTrigger" href="#">Get Started Now</a>
          </div>
        </section>

        {/* Testimonials section */}
        <section className="testimonials section">
          <div className="stripe d-flex align-items-center">
            <div className="stripe_block d-none d-sm-flex align-items-center">
              <span className="stripe_block-icon">
                <i className="icon-arrow-left icon"></i>
              </span>
              <ul className="stripe_block-list d-flex flex-column">
                <li>1000+ Partners,</li>
                <li>1700+ Investors,</li>
                <li>160+ Clients</li>
              </ul>
            </div>
            <Ticker />
          </div>
        </section>

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
                  <span className="tw-height h4">
                    <span className="text">Ask us any</span>
                  </span>
                  <h4 className="feedback_main-header_title type" data-text="Ask us any">
                    Ask us any
                  </h4>
                </div>
                <p className="feedback_main-header_text">
                  Suspendisse ligula magna, laoreet non egestas ac, lobortis at nulla. Suspendisse efficitur neque nec neque porttitor tincidunt. Donec iaculis lacus vitae velit finibus ullamcorper
                </p>
              </div>
              <form className="feedback_main-form form d-flex flex-column" action="#" method="post">
                <input className="field required" type="text" id="feedbackName" name="feedbackName" placeholder="Name" required />
                <input className="field required" type="email" id="feedbackEmail" name="feedbackEmail" placeholder="E-mail" required />
                <textarea className="field required" name="feedbackMessage" id="feedbackMessage" placeholder="Type your message here…" required></textarea>
                <button className="btn btn--neon" type="submit">Send</button>
              </form>
            </div>
            <div className="feedback_media" style={{ minHeight: '350px', width: '100%', maxWidth: '550px' }}>
              <Lottie animationData={paperplaneAnimation} loop={true} autoplay={true} style={{ width: '100%', height: '100%' }} />
            </div>
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
    </>
  );
}
