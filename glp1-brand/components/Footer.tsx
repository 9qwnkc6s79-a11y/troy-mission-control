import Link from 'next/link';
import { BRAND } from '@/data/brand';

export default function Footer() {
  return (
    <footer className="bg-charcoal text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-sage flex items-center justify-center">
                <span className="text-white font-bold text-sm">{BRAND.name[0]}</span>
              </div>
              <span className="text-xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
                {BRAND.name}
              </span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              {BRAND.meta.description}
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider mb-4 text-gray-300">Products</h3>
            <ul className="space-y-3">
              <li><Link href="/products/essential-multi" className="text-sm text-gray-400 hover:text-white transition-colors">Essential Multi</Link></li>
              <li><Link href="/products/muscle-guard" className="text-sm text-gray-400 hover:text-white transition-colors">Muscle Guard</Link></li>
              <li><Link href="/products/gut-ease" className="text-sm text-gray-400 hover:text-white transition-colors">Gut Ease</Link></li>
              <li><Link href="/products/hair-glow" className="text-sm text-gray-400 hover:text-white transition-colors">Hair + Glow</Link></li>
              <li><Link href="/products" className="text-sm text-gray-400 hover:text-white transition-colors">The Bundle</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider mb-4 text-gray-300">Company</h3>
            <ul className="space-y-3">
              <li><Link href="/science" className="text-sm text-gray-400 hover:text-white transition-colors">The Science</Link></li>
              <li><Link href="/about" className="text-sm text-gray-400 hover:text-white transition-colors">About Us</Link></li>
              <li><a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">Blog</a></li>
              <li><a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider mb-4 text-gray-300">Support</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">FAQ</a></li>
              <li><a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">Shipping & Returns</a></li>
              <li><a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-700 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} {BRAND.name}. All rights reserved.
          </p>
          <p className="text-xs text-gray-500 text-center sm:text-right max-w-md">
            * These statements have not been evaluated by the FDA. This product is not intended to diagnose, treat, cure, or prevent any disease.
          </p>
        </div>
      </div>
    </footer>
  );
}
