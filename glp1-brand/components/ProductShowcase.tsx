'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { products, bundle } from '@/data/products';
import { BRAND } from '@/data/brand';
import ProductCard from './ProductCard';
import AnimatedSection from './AnimatedSection';
import SmoothReveal, { SmoothRevealItem } from './SmoothReveal';

export default function ProductShowcase() {
  return (
    <section className="py-24 lg:py-32 bg-warm-white" id="products">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold text-charcoal mb-4 font-display leading-tight">
            Built for your GLP-1 journey
          </h2>
          <p className="text-lg text-charcoal-light max-w-2xl mx-auto">
            Four targeted formulas. One complete system. Every product addresses a specific challenge backed by clinical research.
          </p>
        </AnimatedSection>

        <SmoothReveal className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16" staggerDelay={0.08}>
          {products.map((product) => (
            <SmoothRevealItem key={product.slug}>
              <ProductCard product={product} />
            </SmoothRevealItem>
          ))}
        </SmoothReveal>

        {/* Bundle CTA */}
        <AnimatedSection>
          <motion.div
            className="rounded-2xl bg-gradient-to-r from-charcoal to-charcoal-light text-white p-8 sm:p-12 relative overflow-hidden glow-pulse"
            whileHover={{ scale: 1.005, transition: { duration: 0.3 } }}
          >
            {/* Subtle gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-sage/10 to-transparent pointer-events-none" />

            <div className="relative flex flex-col lg:flex-row items-center justify-between gap-8">
              <div className="flex-1">
                <motion.div
                  className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full text-sm font-medium mb-4"
                  animate={{ scale: [1, 1.03, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' as const }}
                >
                  <span className="text-accent">★</span> Save {bundle.savings}
                </motion.div>
                <h3 className="text-2xl sm:text-3xl font-bold mb-3 font-display">
                  {bundle.name}
                </h3>
                <p className="text-gray-300 mb-4 max-w-xl">
                  {bundle.description}
                </p>
                <div className="flex items-center gap-3 flex-wrap">
                  {bundle.includes.map((name) => (
                    <span key={name} className="text-xs bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm">
                      {name}
                    </span>
                  ))}
                </div>
              </div>
              <div className="text-center lg:text-right shrink-0">
                <div className="mb-4">
                  <span className="text-4xl font-bold">${bundle.subscriptionPrice}</span>
                  <span className="text-gray-400">/mo</span>
                  <div className="text-sm text-gray-400 line-through">${bundle.price} one-time</div>
                </div>
                <Link
                  href="#subscribe"
                  className="inline-block bg-sage hover:bg-sage-light text-white px-8 py-4 rounded-full font-semibold transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 btn-shimmer"
                >
                  {BRAND.cta.bundle}
                </Link>
              </div>
            </div>
          </motion.div>
        </AnimatedSection>
      </div>
    </section>
  );
}
