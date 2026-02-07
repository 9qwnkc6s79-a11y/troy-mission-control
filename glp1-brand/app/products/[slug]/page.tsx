import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { products, getProduct } from '@/data/products';
import { BRAND } from '@/data/brand';
import SupplementFacts from '@/components/SupplementFacts';

export async function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) return {};
  return {
    title: `${product.name} — ${BRAND.name} | GLP-1 Supplement Support`,
    description: product.description,
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();

  return (
    <>
      {/* Product Hero */}
      <section className="py-16 sm:py-24" style={{ backgroundColor: product.colorLight }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Product bottle mockup */}
            <div className="flex items-center justify-center">
              <div className="relative">
                <div
                  className="w-48 h-72 sm:w-56 sm:h-80 rounded-2xl shadow-2xl flex items-center justify-center"
                  style={{ backgroundColor: product.color }}
                >
                  <div className="text-center text-white">
                    <span className="text-6xl block mb-4">{product.icon}</span>
                    <div className="text-sm font-bold tracking-widest uppercase">{BRAND.name}</div>
                    <div className="text-lg font-bold mt-1">{product.name}</div>
                    <div className="text-xs mt-2 opacity-80">30 Day Supply</div>
                  </div>
                </div>
                <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full border-2 opacity-20" style={{ borderColor: product.color }} />
                <div className="absolute -bottom-6 -left-6 w-32 h-32 rounded-full border-2 opacity-10" style={{ borderColor: product.color }} />
              </div>
            </div>

            {/* Info */}
            <div>
              <Link href="/products" className="text-sm text-charcoal-light hover:text-sage transition-colors mb-4 inline-flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                All Products
              </Link>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-charcoal mb-2" style={{ fontFamily: 'var(--font-display)' }}>
                {product.name}
              </h1>
              <p className="text-lg font-medium mb-6" style={{ color: product.color }}>{product.tagline}</p>
              <p className="text-charcoal-light leading-relaxed mb-8 text-lg">{product.longDescription}</p>

              <ul className="space-y-3 mb-8">
                {product.benefits.map((benefit) => (
                  <li key={benefit} className="flex items-start gap-3">
                    <svg className="w-5 h-5 mt-0.5 shrink-0" style={{ color: product.color }} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-charcoal">{benefit}</span>
                  </li>
                ))}
              </ul>

              {/* Pricing */}
              <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
                <div className="flex items-center gap-4 mb-4">
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-charcoal">${product.subscriptionPrice}</span>
                      <span className="text-charcoal-light">/month</span>
                    </div>
                    <p className="text-sm text-charcoal-light">Subscribe & save 10%</p>
                  </div>
                  <div className="text-sm text-gray-400">or ${product.price} one-time</div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button className="flex-1 text-white px-6 py-3 rounded-full font-semibold transition-all hover:shadow-lg hover:opacity-90" style={{ backgroundColor: product.color }}>
                    Subscribe — ${product.subscriptionPrice}/mo
                  </button>
                  <button className="flex-1 border-2 px-6 py-3 rounded-full font-semibold transition-all hover:bg-gray-50" style={{ borderColor: product.color, color: product.color }}>
                    Buy Once — ${product.price}
                  </button>
                </div>

                <p className="text-xs text-gray-400 mt-3 text-center">Free shipping on subscriptions • 30-day guarantee • Cancel anytime</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ingredients Deep Dive */}
      <section className="py-16 sm:py-24 bg-warm-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-2xl font-bold text-charcoal mb-6" style={{ fontFamily: 'var(--font-display)' }}>
                Supplement Facts
              </h2>
              <SupplementFacts ingredients={product.ingredients} productName={product.name} />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-charcoal mb-6" style={{ fontFamily: 'var(--font-display)' }}>
                Why These Ingredients Matter
              </h2>
              <div className="space-y-6">
                {product.ingredients.map((ing) => (
                  <div key={ing.name} className="border-l-4 pl-4" style={{ borderColor: product.color }}>
                    <h4 className="font-semibold text-charcoal mb-1">{ing.name}</h4>
                    <p className="text-sm text-charcoal-light">{ing.amount} {ing.unit}</p>
                    <p className="text-sm text-charcoal-light leading-relaxed mt-2">{ing.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why GLP-1 */}
      <section className="py-16 sm:py-24 bg-cream">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-charcoal" style={{ fontFamily: 'var(--font-display)' }}>
              Why GLP-1 Users Need {product.name}
            </h2>
          </div>
          <div className="bg-white rounded-2xl p-8 shadow-sm">
            <p className="text-charcoal-light leading-relaxed text-lg">{product.whyGLP1}</p>
          </div>
          <div className="text-center mt-8">
            <Link href="/science" className="text-sage hover:text-sage-dark font-semibold transition-colors inline-flex items-center gap-1">
              Read the full science
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Other Products */}
      <section className="py-16 sm:py-24 bg-warm-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-charcoal mb-8 text-center" style={{ fontFamily: 'var(--font-display)' }}>
            Complete your stack
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {products.filter(p => p.slug !== product.slug).map((p) => (
              <Link key={p.slug} href={`/products/${p.slug}`} className="group">
                <div className="rounded-xl border border-gray-100 bg-white p-5 transition-all hover:shadow-lg hover:-translate-y-0.5 text-center">
                  <div className="w-14 h-20 rounded-lg mx-auto mb-3 flex items-center justify-center" style={{ backgroundColor: p.color }}>
                    <span className="text-xl">{p.icon}</span>
                  </div>
                  <h4 className="font-semibold text-charcoal text-sm">{p.name}</h4>
                  <p className="text-xs text-charcoal-light mt-1">${p.subscriptionPrice}/mo</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
