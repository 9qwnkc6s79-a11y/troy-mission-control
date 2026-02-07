'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BRAND } from '@/data/brand';

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 20);
      const total = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(total > 0 ? (window.scrollY / total) * 100 : 0);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const navLinks = [
    { href: '/products', label: 'Products' },
    { href: '/science', label: 'The Science' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-warm-white/95 backdrop-blur-xl shadow-sm'
          : 'bg-warm-white/80 backdrop-blur-md'
      }`}
    >
      {/* Scroll progress bar */}
      <motion.div
        className="absolute top-0 left-0 h-[2px] bg-gradient-to-r from-sage to-sage-light z-50"
        style={{ width: `${scrollProgress}%` }}
        transition={{ duration: 0 }}
      />

      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-full bg-sage flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
              <span className="text-white font-bold text-sm tracking-tight">{BRAND.name[0]}</span>
            </div>
            <span className="text-xl sm:text-2xl font-bold tracking-tight text-charcoal font-display">
              {BRAND.name}
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-charcoal-light hover:text-sage transition-colors duration-300 link-hover"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="#subscribe"
              className="bg-sage hover:bg-sage-dark text-white px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 btn-shimmer"
            >
              {BRAND.cta.getStarted}
            </Link>
          </div>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-charcoal relative z-50"
            aria-label="Toggle menu"
          >
            <div className="w-6 h-6 relative">
              <motion.span
                className="absolute left-0 w-6 h-[2px] bg-current rounded-full"
                animate={mobileOpen ? { top: '11px', rotate: 45 } : { top: '4px', rotate: 0 }}
                transition={{ duration: 0.3 }}
              />
              <motion.span
                className="absolute left-0 top-[11px] w-6 h-[2px] bg-current rounded-full"
                animate={mobileOpen ? { opacity: 0, x: -10 } : { opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
              />
              <motion.span
                className="absolute left-0 w-6 h-[2px] bg-current rounded-full"
                animate={mobileOpen ? { top: '11px', rotate: -45 } : { top: '18px', rotate: 0 }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35, ease: "easeInOut" as const }}
            className="md:hidden overflow-hidden bg-warm-white/95 backdrop-blur-xl border-t border-cream-dark"
          >
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25, delay: 0.1 }}
              className="px-4 pb-6 pt-4 flex flex-col gap-4"
            >
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.05 }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="text-base font-medium text-charcoal-light hover:text-sage transition-colors block py-2"
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Link
                  href="#subscribe"
                  onClick={() => setMobileOpen(false)}
                  className="bg-sage text-white px-6 py-3 rounded-full text-sm font-semibold text-center block mt-2"
                >
                  {BRAND.cta.getStarted}
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
