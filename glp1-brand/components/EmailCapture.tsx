'use client';

import { useState } from 'react';
import { BRAND } from '@/data/brand';

export default function EmailCapture() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');
    try {
      const res = await fetch('/api/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setStatus('success');
        setEmail('');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  return (
    <section className="py-20 sm:py-28 bg-sage relative overflow-hidden" id="subscribe">
      <div className="absolute inset-0">
        <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute -bottom-20 -right-20 w-72 h-72 rounded-full bg-white/5 blur-3xl" />
      </div>

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4" style={{ fontFamily: 'var(--font-display)' }}>
          Be first in line.
        </h2>
        <p className="text-lg text-white/80 mb-8 max-w-xl mx-auto">
          Join the {BRAND.name} waitlist for early access, exclusive launch pricing, and the latest research on GLP-1 nutrition.
        </p>

        {status === 'success' ? (
          <div className="bg-white/10 rounded-2xl p-8 animate-fade-in">
            <div className="text-4xl mb-4">🎉</div>
            <h3 className="text-xl font-bold text-white mb-2">You&apos;re on the list!</h3>
            <p className="text-white/80">We&apos;ll be in touch soon with early access details.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="flex-1 px-6 py-4 rounded-full text-charcoal bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50 text-base"
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className="bg-charcoal hover:bg-charcoal-light text-white px-8 py-4 rounded-full font-semibold transition-all hover:shadow-xl disabled:opacity-60 whitespace-nowrap"
            >
              {status === 'loading' ? 'Joining...' : BRAND.cta.waitlist}
            </button>
          </form>
        )}

        {status === 'error' && (
          <p className="text-white/80 mt-4 text-sm">Something went wrong. Please try again.</p>
        )}

        <p className="text-white/50 text-xs mt-6">
          No spam. Unsubscribe anytime. We respect your inbox.
        </p>
      </div>
    </section>
  );
}
