'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Product } from '@/data/products';

export default function ProductCard({ product }: { product: Product }) {
  return (
    <Link href={`/products/${product.slug}`} className="group block h-full">
      <motion.div
        className="rounded-2xl border border-gray-100 bg-white p-6 h-full flex flex-col transition-colors duration-300"
        whileHover={{
          y: -8,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.12)',
          transition: { duration: 0.3, ease: "easeInOut" as const },
        }}
      >
        {/* Product bottle mockup */}
        <div
          className="rounded-xl p-8 flex items-center justify-center mb-6 transition-all duration-500"
          style={{ backgroundColor: product.colorLight }}
        >
          <motion.div
            className="w-20 h-32 rounded-lg shadow-lg flex items-center justify-center"
            style={{ backgroundColor: product.color }}
            whileHover={{ scale: 1.05, rotateY: 5 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <span className="text-3xl">{product.icon}</span>
          </motion.div>
        </div>

        {/* Product info */}
        <div className="flex-1 flex flex-col">
          <h3 className="text-lg font-bold text-charcoal mb-1">{product.name}</h3>
          <p className="text-sm text-sage font-medium mb-3">{product.tagline}</p>
          <p className="text-sm text-charcoal-light leading-relaxed mb-4 flex-1">
            {product.description.slice(0, 120)}...
          </p>

          {/* Price */}
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-2xl font-bold text-charcoal">${product.subscriptionPrice}</span>
            <span className="text-sm text-charcoal-light">/mo</span>
            <span className="text-xs text-gray-400 line-through">${product.price}</span>
          </div>

          {/* CTA */}
          <div className="flex items-center text-sage font-semibold text-sm group-hover:text-sage-dark transition-colors duration-300">
            Learn More
            <svg className="w-4 h-4 ml-1 transition-transform duration-300 group-hover:translate-x-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
