import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/app/context/AuthContext';
import Script from 'next/script';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ChatBox AI - Customer Support Chatbot Builder',
  description: 'Deploy custom AI chatbots that automatically learn from your website pages, manuals, files, and FAQs.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
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
