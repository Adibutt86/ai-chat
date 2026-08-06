import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/app/context/AuthContext';
import Script from 'next/script';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Geekvista AI - Customer Support Chatbot Builder',
  description: 'Deploy custom AI chatbots that automatically learn from your website pages, manuals, files, and FAQs.',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico' }
    ],
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="alternate icon" href="/favicon.svg" />
        <link rel="apple-touch-icon" href="/favicon.svg" />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          {children}
          <Script
            src="/chatbox-widget.js"
            data-agent-id="cmrp4sl270011uwtwukg511mu"
            strategy="lazyOnload"
          />
        </AuthProvider>
      </body>
    </html>
  );
}
