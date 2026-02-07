import { Metadata } from 'next';
import Link from 'next/link';
import { BRAND } from '@/data/brand';

export const metadata: Metadata = {
  title: `The Science — ${BRAND.name} | GLP-1 Nutritional Challenges`,
  description: 'Research-backed analysis of the nutritional challenges created by GLP-1 medications, and how targeted supplementation addresses them.',
};

export default function SciencePage() {
  const challenges = [
    {
      id: 'muscle-loss',
      icon: '💪',
      title: 'Muscle Loss (Sarcopenia)',
      severity: 'HIGH',
      stat: 'Up to 40%',
      statContext: 'of total weight lost is lean body mass',
      overview:
        'The most significant nutritional concern with GLP-1 therapy is the loss of lean body mass alongside fat. Unlike targeted dietary interventions, GLP-1 medications create a caloric deficit that doesn\'t distinguish between fat and muscle tissue.',
      studies: [
        {
          name: 'STEP 1 Trial (Wilding et al., NEJM 2021)',
          finding: 'Participants on semaglutide 2.4mg lost an average of 14.9% body weight over 68 weeks. DEXA analysis showed that approximately 39% of weight lost was lean body mass.',
        },
        {
          name: 'SURMOUNT-1 Trial (Jastreboff et al., NEJM 2022)',
          finding: 'Tirzepatide users lost 20.9% body weight at the highest dose. Lean mass loss was proportional, with body composition changes showing 33-40% lean mass reduction.',
        },
        {
          name: 'Heymsfield et al., Metabolism 2023',
          finding: 'Meta-analysis of GLP-1 RA trials found lean mass loss was consistent across all agents and doses, averaging 25-40% of total weight lost.',
        },
      ],
      solution: 'Muscle Guard',
      solutionDesc:
        'Combines leucine (3g), HMB (3g), and creatine monohydrate (5g) — the three most evidence-backed compounds for muscle protein synthesis and anti-catabolic protection during caloric deficit. Vitamin D (4000 IU) supports muscle function.',
    },
    {
      id: 'nutrient-deficiency',
      icon: '📉',
      title: 'Nutrient Malabsorption & Deficiency',
      severity: 'HIGH',
      stat: '30-40%',
      statContext: 'reduction in caloric intake',
      overview:
        'GLP-1 medications reduce appetite and slow gastric emptying, leading to significantly lower food intake. While this drives weight loss, it creates a critical gap: your body needs the same micronutrients from substantially less food.',
      studies: [
        {
          name: 'Peterson et al., Nutrients 2021',
          finding: 'Analysis of bariatric and pharmacological weight loss patients found B12 deficiency in up to 64% of patients, iron deficiency in 45%, and vitamin D insufficiency in over 70% within 12 months.',
        },
        {
          name: 'Mechanick et al., Endocrine Practice 2020',
          finding: 'Clinical guidelines recommend monitoring and supplementation of vitamins B12, D, iron, calcium, folate, and zinc in all patients experiencing rapid weight loss exceeding 10% body weight.',
        },
        {
          name: 'Via & Mechanick, Current Obesity Reports 2017',
          finding: 'Identified zinc, B12, iron, folate, vitamin D, and calcium as the most commonly deficient micronutrients during pharmacologically-induced weight loss.',
        },
      ],
      solution: 'Essential Multi',
      solutionDesc:
        'Provides clinically meaningful doses of the six most at-risk nutrients in highly bioavailable forms: methylcobalamin B12 (1000mcg), ferrous bisglycinate iron (18mg), 5-MTHF folate (800mcg), zinc picolinate (30mg), D3 (5000IU), and calcium citrate (500mg).',
    },
    {
      id: 'gi-issues',
      icon: '🤢',
      title: 'Gastrointestinal Side Effects',
      severity: 'MODERATE-HIGH',
      stat: '44%',
      statContext: 'of patients report nausea',
      overview:
        'GI side effects are the most common adverse events with GLP-1 therapy and the primary reason for treatment discontinuation. They result from the medication\'s mechanism of action — delayed gastric emptying.',
      studies: [
        {
          name: 'STEP 1-5 Trials (Novo Nordisk)',
          finding: 'Across the semaglutide trial program, 44.2% reported nausea, 31.5% diarrhea, 24.8% vomiting, and 24.2% constipation. GI events were most frequent during dose escalation.',
        },
        {
          name: 'Sodhi et al., JAMA 2023',
          finding: 'Large retrospective analysis found GLP-1 RA use associated with significantly increased risk of pancreatitis, bowel obstruction, and gastroparesis compared to non-users.',
        },
        {
          name: 'Lasa et al., Systematic Review 2022',
          finding: 'Ginger supplementation (≥1g/day) significantly reduced nausea severity across 12 RCTs. Peppermint oil showed benefit in 9 trials for IBS and dyspepsia symptoms.',
        },
      ],
      solution: 'Gut Ease',
      solutionDesc:
        'Combines ginger root extract (500mg, 5% gingerols), enteric-coated peppermint oil (180mg), 20 billion CFU probiotics, digestive enzymes, fennel seed, and artichoke leaf extract for comprehensive digestive support.',
    },
    {
      id: 'hair-loss',
      icon: '💇',
      title: 'Hair Loss (Telogen Effluvium)',
      severity: 'MODERATE',
      stat: '3-6 months',
      statContext: 'typical onset after starting GLP-1 therapy',
      overview:
        'Telogen effluvium — temporary but distressing diffuse hair shedding — is a well-documented consequence of rapid weight loss. GLP-1 users face a compound effect: caloric restriction plus reduced intake of hair-critical nutrients like protein, iron, zinc, and biotin.',
      studies: [
        {
          name: 'Grover & Khurana, Indian Dermatology Online Journal 2013',
          finding: 'Comprehensive review establishing that rapid weight loss (>20 lbs in short period) is a well-documented trigger for telogen effluvium, typically appearing 3-6 months after the metabolic stress.',
        },
        {
          name: 'Almohanna et al., Dermatology and Therapy 2019',
          finding: 'Systematic review found that deficiencies in iron, zinc, biotin, vitamin D, and protein are the most significant nutritional contributors to hair loss. Correction of deficiencies improved outcomes.',
        },
        {
          name: 'FDA Adverse Event Reporting System (FAERS)',
          finding: 'Increasing reports of alopecia associated with GLP-1 RA use, though causality is difficult to establish given the confounding factor of weight loss itself.',
        },
      ],
      solution: 'Hair + Glow',
      solutionDesc:
        'Targets hair follicle nutrition with biotin (5000mcg), hydrolyzed collagen peptides (10g), zinc picolinate (25mg), ferrous bisglycinate iron (18mg), saw palmetto (320mg), and vitamins C and E for antioxidant protection.',
    },
  ];

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-cream via-warm-white to-cream-dark py-20 sm:py-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-sage/10 text-sage-dark px-4 py-2 rounded-full text-sm font-medium mb-6">
            <span className="w-2 h-2 rounded-full bg-sage" />
            Research-backed formulations
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-charcoal mb-6" style={{ fontFamily: 'var(--font-display)' }}>
            The science behind <span className="text-sage">{BRAND.name}</span>
          </h1>
          <p className="text-xl text-charcoal-light leading-relaxed max-w-2xl mx-auto">
            GLP-1 medications are revolutionary — but they create nutritional challenges that existing supplements weren&apos;t designed to solve. Here&apos;s the research that drives our formulations.
          </p>
        </div>
      </section>

      {/* Overview */}
      <section className="py-16 bg-charcoal text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-sage-light mb-2">30M+</div>
              <p className="text-gray-400">Americans currently prescribed GLP-1 medications, with projections of 50M+ by 2030</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-sage-light mb-2">$50B+</div>
              <p className="text-gray-400">Global GLP-1 market by 2030, making it the fastest-growing drug class in history</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-sage-light mb-2">70%+</div>
              <p className="text-gray-400">of GLP-1 users report at least one nutritional concern or side effect</p>
            </div>
          </div>
        </div>
      </section>

      {/* Challenges deep dive */}
      <section className="py-16 sm:py-24 bg-warm-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-charcoal mb-4 text-center" style={{ fontFamily: 'var(--font-display)' }}>
            Four challenges. Four solutions.
          </h2>
          <p className="text-charcoal-light text-center mb-16 max-w-2xl mx-auto">
            Every {BRAND.name} formula targets a specific, research-documented challenge of GLP-1 therapy.
          </p>

          <div className="space-y-16">
            {challenges.map((challenge, idx) => (
              <article key={challenge.id} id={challenge.id} className="scroll-mt-24">
                {/* Challenge header */}
                <div className="flex items-start gap-4 mb-6">
                  <span className="text-4xl">{challenge.icon}</span>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-2xl font-bold text-charcoal" style={{ fontFamily: 'var(--font-display)' }}>
                        {challenge.title}
                      </h3>
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                        challenge.severity === 'HIGH' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {challenge.severity}
                      </span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-bold text-sage">{challenge.stat}</span>
                      <span className="text-sm text-charcoal-light">{challenge.statContext}</span>
                    </div>
                  </div>
                </div>

                {/* Overview */}
                <p className="text-charcoal-light leading-relaxed mb-8 text-lg">{challenge.overview}</p>

                {/* Studies */}
                <div className="bg-cream rounded-2xl p-6 sm:p-8 mb-8">
                  <h4 className="font-bold text-charcoal mb-4 text-sm uppercase tracking-wider">📚 Clinical Evidence</h4>
                  <div className="space-y-4">
                    {challenge.studies.map((study) => (
                      <div key={study.name} className="border-l-2 border-sage pl-4">
                        <p className="text-sm font-semibold text-charcoal mb-1">{study.name}</p>
                        <p className="text-sm text-charcoal-light leading-relaxed">{study.finding}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Solution */}
                <div className="bg-sage/5 border border-sage/20 rounded-2xl p-6 sm:p-8">
                  <h4 className="font-bold text-sage-dark mb-2">
                    Our Solution: {challenge.solution}
                  </h4>
                  <p className="text-charcoal-light leading-relaxed">{challenge.solutionDesc}</p>
                  <Link
                    href={`/products/${challenge.solution.toLowerCase().replace(/\s\+\s/g, '-').replace(/\s/g, '-')}`}
                    className="inline-flex items-center gap-1 mt-4 text-sage font-semibold hover:text-sage-dark transition-colors text-sm"
                  >
                    View {challenge.solution} →
                  </Link>
                </div>

                {idx < challenges.length - 1 && (
                  <hr className="mt-16 border-gray-200" />
                )}
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Our approach */}
      <section className="py-16 sm:py-24 bg-cream">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-charcoal mb-12 text-center" style={{ fontFamily: 'var(--font-display)' }}>
            The {BRAND.name} formulation standard
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                title: 'Clinically Meaningful Doses',
                description: 'We use ingredient amounts that match or exceed those used in clinical studies. No pixie-dusting, no proprietary blends hiding underdosed ingredients.',
                icon: '🔬',
              },
              {
                title: 'Superior Bioavailability',
                description: 'We select the most bioavailable forms of every nutrient — methylcobalamin over cyanocobalamin, ferrous bisglycinate over ferrous sulfate, 5-MTHF over folic acid.',
                icon: '🧬',
              },
              {
                title: 'GI-Gentle Formulations',
                description: 'Every ingredient is chosen not just for efficacy but for gastric tolerability. Enteric coatings, gentle mineral forms, and no unnecessary fillers.',
                icon: '🌿',
              },
              {
                title: 'Third-Party Verified',
                description: 'Every batch tested by independent labs for identity, potency, purity, and contaminants. Manufactured in cGMP-certified, FDA-registered facilities.',
                icon: '✅',
              },
            ].map((item) => (
              <div key={item.title} className="bg-white rounded-xl p-6 shadow-sm">
                <span className="text-2xl mb-3 block">{item.icon}</span>
                <h3 className="font-bold text-charcoal mb-2">{item.title}</h3>
                <p className="text-sm text-charcoal-light leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-24 bg-warm-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-charcoal mb-4" style={{ fontFamily: 'var(--font-display)' }}>
            Science you can trust. Support you can feel.
          </h2>
          <p className="text-lg text-charcoal-light mb-8">
            Every {BRAND.name} product is built on published clinical research and formulated by experts in nutritional science.
          </p>
          <Link
            href="/products"
            className="inline-block bg-sage hover:bg-sage-dark text-white px-10 py-4 rounded-full text-lg font-semibold transition-all hover:shadow-xl"
          >
            Shop Products
          </Link>
        </div>
      </section>
    </>
  );
}
