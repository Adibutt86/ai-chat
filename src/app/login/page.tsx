'use client';

import React, { useState } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import Link from 'next/link';
import { Bot, ArrowLeft } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const success = await login(email, password);
    if (!success) {
      setError('Invalid email or password combination.');
      setLoading(false);
    }
  };

  return (
    <div 
      className="flex min-h-screen flex-col items-center justify-center bg-[#F8FAFC] px-4 py-12 text-slate-800 relative overflow-hidden font-sans"
      style={{ fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}
    >
      {/* Background Decor Shapes */}
      <div 
        className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 pointer-events-none opacity-40"
        style={{
          background: 'radial-gradient(circle at 50% 0%, rgba(30, 58, 138, 0.15) 0%, rgba(249, 115, 22, 0.05) 50%, rgba(248, 250, 252, 0) 100%)'
        }}
      />

      <div className="w-full max-w-md relative z-10">
        {/* Back to Home Link */}
        <div className="mb-6 flex items-center justify-between">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-[#1E3A8A] transition duration-150"
          >
            <ArrowLeft className="h-4 w-4 text-[#F97316]" />
            <span>Back to Home</span>
          </Link>
          <span className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase bg-slate-200/60 px-2.5 py-1 rounded-full border border-slate-300/50">
            Console Auth
          </span>
        </div>

        {/* Auth Card */}
        <div className="w-full rounded-2xl border border-slate-200/80 bg-white p-8 shadow-xl shadow-slate-200/50">
          <div className="mb-8 text-center">
            <div className="h-11 w-11 rounded-xl bg-[#F97316] flex items-center justify-center text-white border border-slate-900 shadow-sm mx-auto mb-3">
              <Bot className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Geekvista AI</h1>
            <p className="mt-1 text-xs font-semibold text-slate-500">Sign in to manage your AI workspace</p>
          </div>

          {error && (
            <div className="mb-5 rounded-lg bg-rose-50 border border-rose-200 p-3 text-xs font-semibold text-rose-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-slate-50/50 px-4 py-2.5 text-slate-900 text-sm font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent transition"
                placeholder="name@company.com"
                required
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Password
                </label>
                <a href="#" className="text-xs font-semibold text-[#F97316] hover:underline">
                  Forgot password?
                </a>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-slate-50/50 px-4 py-2.5 text-slate-900 text-sm font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent transition"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-[#1E3A8A] hover:bg-[#152a66] active:scale-[0.99] px-4 py-3 font-bold text-white shadow-md hover:shadow-lg transition duration-150 disabled:opacity-50 text-sm cursor-pointer"
            >
              {loading ? 'Authenticating...' : 'Sign In to Console'}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-600">
              New to Geekvista?{' '}
              <Link href="/register" className="text-[#F97316] font-bold hover:underline">
                Create an account
              </Link>
            </p>
          </div>
        </div>

        {/* Footer Credit */}
        <p className="mt-6 text-center text-[11px] font-medium text-slate-400">
          Protected by Geekvista AI Enterprise Security
        </p>
      </div>
    </div>
  );
}
