import { Metadata } from 'next';
import Link from 'next/link';
import { products, bundle } from '@/data/products';
import ProductCard from '@/components/ProductCard';

export const metadata: Metadata = {
  title: 'Products — Noriva | GLP-1 Supplement Support',
  description: 'Four targeted supplement formulas designed for GLP-1 medication users. Essential Multi, Muscle Guard, Gut Ease, Hair + Glow, and The Bundle.',
};

export default function ProductsPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-cream via-warm-white to-cream-dark py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-5xl font-bold text-charcoal mb-6" style={{ fontFamily: 'var(--font-display)' }}>
              Targeted support for every challenge
            </h1>
            <p className="text-xl text-charcoal-light leading-relaxed">
              Each Noriva formula addresses a specific nutritional challenge of GLP-1 therapy, backed by clinical research and formulated with premium, bioavailable ingredients.
            </p>
          </div>
        </div>
      </section>

      {/* Products grid */}
      <section className="py-16 sm:py-20 bg-warm-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {products.map((product) => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </div>

          {/* Bundle */}
          <div className="rounded-2xl bg-gradient-to-r from-charcoal to-charcoal-light text-white p-8 sm:p-12 mb-16">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
              <div className="flex-1">
                <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full text-sm font-medium mb-4">
                  <span className="text-accent">★</span> Best Value — Save {bundle.savings}
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold mb-3" style={{ fontFamily: 'var(--font-display)' }}>
                  {bundle.name}
                </h2>
                <p className="text-gray-300 mb-6 max-w-xl">
                  {bundle.description}
                </p>
                {/* What's included */}
                <div className="grid grid-cols-2 gap-3">
                  {products.map((p) => (
                    <div key={p.slug} className="flex items-center gap-2">
                      <span className="text-lg">{p.icon}</span>
                      <span className="text-sm text-gray-300">{p.name}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="text-center lg:text-right shrink-0">
                <div className="mb-2">
                  <span className="text-5xl font-bold">${bundle.subscriptionPrice}</span>
                  <span className="text-gray-400 text-lg">/mo</span>
                </div>
                <div className="text-sm text-gray-400 line-through mb-6">${bundle.price} one-time</div>
                <Link
                  href="#subscribe"
                  className="inline-block bg-sage hover:bg-sage-light text-white px-10 py-4 rounded-full font-semibold text-lg transition-all hover:shadow-xl"
                >
                  Subscribe & Save
                </Link>
                <p className="text-xs text-gray-500 mt-3">Free shipping • Cancel anytime</p>
              </div>
            </div>
          </div>

          {/* Comparison */}
          <div className="bg-cream rounded-2xl p-8 sm:p-12">
            <h3 className="text-2xl font-bold text-charcoal mb-8 text-center" style={{ fontFamily: 'var(--font-display)' }}>
              How our products work together
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl p-6">
                <h4 className="font-bold text-charcoal mb-3">🏁 Just Starting GLP-1?</h4>
                <p className="text-sm text-charcoal-light mb-3">Focus on foundations and comfort.</p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2"><span className="text-sage">✓</span> Essential Multi — Fill nutritional gaps from day one</li>
                  <li className="flex items-center gap-2"><span className="text-sage">✓</span> Gut Ease — Manage nausea during dose titration</li>
                </ul>
              </div>
              <div className="bg-white rounded-xl p-6">
                <h4 className="font-bold text-charcoal mb-3">🎯 Active & Maintaining?</h4>
                <p className="text-sm text-charcoal-light mb-3">Protect your progress long-term.</p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2"><span className="text-sage">✓</span> Muscle Guard — Preserve lean mass during weight loss</li>
                  <li className="flex items-center gap-2"><span className="text-sage">✓</span> Hair + Glow — Address hair thinning and skin changes</li>
                </ul>
              </div>
              <div className="bg-white rounded-xl p-6 md:col-span-2">
                <h4 className="font-bold text-charcoal mb-3">🏆 Complete Coverage?</h4>
                <p className="text-sm text-charcoal-light mb-3">Get everything for comprehensive support.</p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2"><span className="text-sage">✓</span> The Bundle — All 4 formulas at 35% savings. The smart choice for serious results.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
