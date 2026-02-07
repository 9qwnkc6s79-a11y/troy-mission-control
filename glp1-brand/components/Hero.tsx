'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { BRAND } from '@/data/brand';

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, delay, ease: "easeInOut" as const },
});

const floatAnimation = (delay: number) => ({
  animate: {
    y: [-6, 6, -6],
    transition: {
      duration: 4,
      delay,
      repeat: Infinity,
      ease: 'easeInOut' as const,
    },
  },
});

const products = [
  { color: '#5B7B5E', name: 'Essential Multi', icon: '💊' },
  { color: '#4A6670', name: 'Muscle Guard', icon: '💪' },
  { color: '#8B7355', name: 'Gut Ease', icon: '🌿' },
  { color: '#9B6B8E', name: 'Hair + Glow', icon: '✨' },
];

export default function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center bg-gradient-to-br from-cream via-warm-white to-cream-dark overflow-hidden noise-overlay">
      {/* Animated background gradient orbs */}
      <motion.div
        className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-sage/[0.06] blur-3xl"
        animate={{
          x: [0, 30, -10, 0],
          y: [0, -20, 15, 0],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' as const }}
      />
      <motion.div
        className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-accent/[0.06] blur-3xl"
        animate={{
          x: [0, -20, 25, 0],
          y: [0, 30, -15, 0],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' as const }}
      />
      <motion.div
        className="absolute top-1/3 right-1/4 w-72 h-72 rounded-full bg-sage/[0.04] blur-2xl"
        animate={{
          x: [0, 15, -20, 0],
          y: [0, -25, 10, 0],
          scale: [1, 1.1, 0.95, 1],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' as const }}
      />

      {/* Gradient mesh overlay */}
      <div className="absolute inset-0 gradient-mesh" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            {/* Badge */}
            <motion.div {...fadeUp(0.1)}>
              <div className="inline-flex items-center gap-2 bg-sage/10 text-sage-dark px-4 py-2 rounded-full text-sm font-medium mb-6 border border-sage/10">
                <span className="w-2 h-2 rounded-full bg-sage animate-pulse" />
                Designed for the GLP-1 generation
              </div>
            </motion.div>

            {/* Headline */}
            <motion.h1
              {...fadeUp(0.25)}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] text-charcoal mb-6 font-display"
            >
              {BRAND.hero.headline}{' '}
              <motion.span
                className="text-sage inline-block"
                {...fadeUp(0.4)}
              >
                {BRAND.hero.headlineAccent}
              </motion.span>
            </motion.h1>

            {/* Subhead */}
            <motion.p
              {...fadeUp(0.5)}
              className="text-lg sm:text-xl text-charcoal-light leading-relaxed mb-8 max-w-xl"
            >
              {BRAND.hero.subhead}
            </motion.p>

            {/* CTAs */}
            <motion.div {...fadeUp(0.6)} className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/products"
                className="bg-sage hover:bg-sage-dark text-white px-8 py-4 rounded-full text-base font-semibold transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 text-center btn-shimmer"
              >
                {BRAND.cta.primary}
              </Link>
              <Link
                href="/science"
                className="border-2 border-charcoal/15 hover:border-sage text-charcoal px-8 py-4 rounded-full text-base font-semibold transition-all duration-300 hover:text-sage text-center hover:shadow-md"
              >
                {BRAND.cta.secondary}
              </Link>
            </motion.div>

            {/* Trust badges */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8, ease: "easeInOut" as const }}
              className="flex flex-wrap items-center gap-6 mt-10 text-sm text-charcoal-light"
            >
              {['3rd Party Tested', 'cGMP Certified', 'Made in USA'].map((badge, i) => (
                <motion.div
                  key={badge}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.9 + i * 0.1 }}
                  className="flex items-center gap-2"
                >
                  <svg className="w-5 h-5 text-sage" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {badge}
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Product grid */}
          <div className="hidden lg:block">
            <div className="grid grid-cols-2 gap-5">
              {products.map((product, i) => (
                <motion.div
                  key={product.name}
                  initial={{ opacity: 0, y: 40, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{
                    duration: 0.6,
                    delay: 0.3 + i * 0.12,
                    ease: "easeInOut" as const,
                  }}
                >
                  <motion.div {...floatAnimation(i * 0.6)}>
                    <div
                      className="rounded-2xl p-6 flex flex-col items-center justify-center aspect-square shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer group"
                      style={{
                        backgroundColor: product.color + '12',
                        borderColor: product.color + '25',
                        borderWidth: '1px',
                      }}
                    >
                      <motion.div
                        className="w-16 h-24 rounded-lg mb-3 shadow-md flex items-center justify-center transition-transform duration-500 group-hover:scale-105 group-hover:-translate-y-1"
                        style={{ backgroundColor: product.color }}
                        whileHover={{ rotateY: 5, rotateX: -5 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                      >
                        <div className="text-center text-white">
                          <span className="text-2xl block">{product.icon}</span>
                          <span className="text-[8px] font-bold tracking-wider uppercase block mt-1">{BRAND.name}</span>
                        </div>
                      </motion.div>
                      <span className="text-xs font-semibold text-charcoal text-center">{product.name}</span>
                    </div>
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
