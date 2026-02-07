import { BRAND } from '@/data/brand';

export default function Testimonials() {
  const testimonials = [
    {
      name: 'Sarah M.',
      location: 'Austin, TX',
      medication: 'Ozempic',
      duration: '8 months',
      quote: 'I was losing hair by the handful at month 4 on Ozempic. Within 6 weeks of starting Hair + Glow, the shedding slowed dramatically. My dermatologist noticed the difference too.',
      rating: 5,
    },
    {
      name: 'Michael R.',
      location: 'Denver, CO',
      medication: 'Mounjaro',
      duration: '6 months',
      quote: 'Muscle Guard has been a game changer. My trainer and I were worried about losing muscle along with the fat, but my body comp scans show I\'ve preserved way more lean mass than expected.',
      rating: 5,
    },
    {
      name: 'Jessica T.',
      location: 'Portland, OR',
      medication: 'Wegovy',
      duration: '10 months',
      quote: 'The nausea during my dose increases was unbearable until I found Gut Ease. I take it before meals now and the difference is night and day. I actually want to eat again.',
      rating: 5,
    },
    {
      name: 'David L.',
      location: 'Chicago, IL',
      medication: 'Zepbound',
      duration: '4 months',
      quote: `The Bundle made it simple. I don't have to think about what I'm missing nutritionally — ${BRAND.name} has it covered. My energy is back, my labs improved, and my doctor is impressed.`,
      rating: 5,
    },
  ];

  return (
    <section className="py-20 sm:py-28 bg-warm-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-charcoal mb-4" style={{ fontFamily: 'var(--font-display)' }}>
            Real people. <span className="text-sage">Real results.</span>
          </h2>
          <p className="text-lg text-charcoal-light max-w-2xl mx-auto">
            Join thousands of GLP-1 patients who trust {BRAND.name} to support their journey.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {testimonials.map((t) => (
            <div key={t.name} className="bg-cream rounded-2xl p-8">
              <div className="flex gap-1 mb-4">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-accent" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>

              <p className="text-charcoal leading-relaxed mb-6 text-base">
                &ldquo;{t.quote}&rdquo;
              </p>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-charcoal text-sm">{t.name}</p>
                  <p className="text-xs text-charcoal-light">{t.location}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-medium text-sage">{t.medication}</p>
                  <p className="text-xs text-charcoal-light">{t.duration}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
