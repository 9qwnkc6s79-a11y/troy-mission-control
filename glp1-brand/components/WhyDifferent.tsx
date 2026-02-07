'use client';

import { motion } from 'framer-motion';
import AnimatedSection from './AnimatedSection';
import SmoothReveal, { SmoothRevealItem } from './SmoothReveal';

const challenges = [
  {
    icon: '📉',
    title: 'Nutrient Gaps',
    stat: '30-40%',
    statLabel: 'fewer calories consumed',
    description: 'GLP-1 medications dramatically reduce food intake. Less food means fewer vitamins and minerals — but your body still needs them all.',
  },
  {
    icon: '💪',
    title: 'Muscle Loss',
    stat: 'Up to 40%',
    statLabel: 'of weight lost is lean mass',
    description: 'Clinical trials show significant lean body mass loss alongside fat loss. Without targeted support, metabolism and strength suffer.',
  },
  {
    icon: '🤢',
    title: 'GI Distress',
    stat: '44%',
    statLabel: 'report nausea',
    description: 'Slowed gastric emptying means nausea, bloating, and digestive discomfort — the #1 reason patients stop therapy.',
  },
  {
    icon: '💇',
    title: 'Hair Changes',
    stat: '3-6 months',
    statLabel: 'when hair loss typically starts',
    description: 'Rapid weight loss triggers telogen effluvium. Reduced protein and nutrient intake amplify the effect.',
  },
];

export default function WhyDifferent() {
  return (
    <section className="py-24 lg:py-32 bg-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <AnimatedSection className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold text-charcoal mb-4 font-display leading-tight">
            Why GLP-1 patients need{' '}
            <span className="text-sage">different supplements</span>
          </h2>
          <p className="text-lg text-charcoal-light max-w-2xl mx-auto">
            GLP-1 medications are transformative — but they create unique nutritional challenges that generic supplements don&apos;t address.
          </p>
        </AnimatedSection>

        {/* Challenge grid */}
        <SmoothReveal className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8" staggerDelay={0.1}>
          {challenges.map((challenge) => (
            <SmoothRevealItem key={challenge.title}>
              <motion.div
                className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all duration-500 h-full"
                whileHover={{ y: -4, transition: { duration: 0.3 } }}
              >
                <div className="flex items-start gap-4">
                  <span className="text-3xl">{challenge.icon}</span>
                  <div>
                    <h3 className="text-xl font-bold text-charcoal mb-2">{challenge.title}</h3>
                    <div className="flex items-baseline gap-2 mb-3">
                      <span className="text-2xl font-bold text-sage">{challenge.stat}</span>
                      <span className="text-sm text-charcoal-light">{challenge.statLabel}</span>
                    </div>
                    <p className="text-charcoal-light leading-relaxed">{challenge.description}</p>
                  </div>
                </div>
              </motion.div>
            </SmoothRevealItem>
          ))}
        </SmoothReveal>

        {/* Bottom note */}
        <AnimatedSection className="mt-12 text-center" delay={0.3}>
          <p className="text-sm text-charcoal-light max-w-2xl mx-auto leading-relaxed">
            Sources: STEP 1 trial (Wilding et al., NEJM 2021), SURMOUNT-1 trial (Jastreboff et al., NEJM 2022),
            nutritional analysis of bariatric populations (Mechanick et al., Endocrine Practice 2020)
          </p>
        </AnimatedSection>
      </div>
    </section>
  );
}
