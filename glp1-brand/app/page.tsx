import Hero from '@/components/Hero';
import ProductShowcase from '@/components/ProductShowcase';
import WhyDifferent from '@/components/WhyDifferent';
import Testimonials from '@/components/Testimonials';
import FAQ from '@/components/FAQ';
import EmailCapture from '@/components/EmailCapture';
import { BRAND } from '@/data/brand';

export default function Home() {
  return (
    <>
      <Hero />

      {/* Stats bar */}
      <section className="bg-charcoal text-white py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { stat: '30M+', label: 'Americans on GLP-1s' },
              { stat: '40%', label: 'Weight lost as muscle' },
              { stat: '64%', label: 'Risk of B12 deficiency' },
              { stat: '44%', label: 'Experience GI issues' },
            ].map((item) => (
              <div key={item.label}>
                <div className="text-3xl sm:text-4xl font-bold text-sage-light">{item.stat}</div>
                <div className="text-sm text-gray-400 mt-1">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <WhyDifferent />
      <ProductShowcase />
      <Testimonials />

      {/* How it works */}
      <section className="py-20 sm:py-28 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-charcoal mb-4" style={{ fontFamily: 'var(--font-display)' }}>
              Simple as 1, 2, 3
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                step: '01',
                title: 'Choose your stack',
                description: 'Pick the individual products you need or grab The Bundle for complete coverage at our best price.',
              },
              {
                step: '02',
                title: 'Subscribe & save',
                description: 'Lock in your subscription price and get automatic monthly delivery. Pause, skip, or cancel anytime.',
              },
              {
                step: '03',
                title: 'Thrive on your journey',
                description: `Take your ${BRAND.name} supplements daily and feel the difference in energy, comfort, and confidence.`,
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-sage text-white font-bold text-lg mb-4">
                  {item.step}
                </div>
                <h3 className="text-lg font-bold text-charcoal mb-2">{item.title}</h3>
                <p className="text-charcoal-light leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <FAQ />
      <EmailCapture />

      {/* Final CTA */}
      <section className="py-20 sm:py-28 bg-warm-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-charcoal mb-4" style={{ fontFamily: 'var(--font-display)' }}>
            You&apos;re on the journey.{' '}
            <span className="text-sage">We&apos;ve got your back.</span>
          </h2>
          <p className="text-lg text-charcoal-light mb-8 max-w-xl mx-auto">
            30-day satisfaction guarantee. Free shipping on subscriptions. Cancel anytime.
          </p>
          <a
            href="/products"
            className="inline-block bg-sage hover:bg-sage-dark text-white px-10 py-4 rounded-full text-lg font-semibold transition-all hover:shadow-xl hover:-translate-y-0.5"
          >
            Shop Now
          </a>
        </div>
      </section>
    </>
  );
}
