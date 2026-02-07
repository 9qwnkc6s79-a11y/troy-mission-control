import { BRAND } from './brand';

export interface FAQItem {
  question: string;
  answer: string;
}

export const faqs: FAQItem[] = [
  {
    question: 'Why do GLP-1 users need specialized supplements?',
    answer: `GLP-1 medications like Ozempic, Wegovy, Mounjaro, and Zepbound work by reducing appetite and slowing gastric emptying. While effective for weight loss, this means significantly reduced food intake — often 30-40% fewer calories. Your body still needs the same (or more) vitamins, minerals, and nutrients, but you're getting them from less food. ${BRAND.name} formulas are designed to fill these specific gaps with highly bioavailable forms that are gentle on sensitive stomachs.`,
  },
  {
    question: `Can I take ${BRAND.name} supplements with my GLP-1 medication?`,
    answer: `${BRAND.name} supplements are nutritional support products — vitamins, minerals, amino acids, and botanical extracts. They're designed to complement your medication, not interact with it. That said, we always recommend discussing any new supplement with your prescribing physician, especially if you take other medications.`,
  },
  {
    question: `When should I take my ${BRAND.name} supplements?`,
    answer: 'Essential Multi and Hair + Glow are best taken with a meal for optimal absorption. Gut Ease can be taken 30 minutes before eating to support digestion. Muscle Guard is ideal post-workout or with a protein-rich meal. We include a detailed schedule card with every order.',
  },
  {
    question: 'Will these help with the nausea from my GLP-1 medication?',
    answer: 'Gut Ease was specifically formulated to address the GI side effects common with GLP-1 therapy. Ginger root extract, enteric-coated peppermint oil, and digestive enzymes work together to reduce nausea and support comfortable digestion. Many customers report significant improvement, especially during dose titration periods.',
  },
  {
    question: "I'm experiencing hair loss on my GLP-1 medication. Will Hair + Glow help?",
    answer: 'Hair thinning during rapid weight loss (telogen effluvium) is common regardless of the method, and GLP-1 users frequently report it 3-6 months into treatment. Hair + Glow provides the specific nutrients — biotin, collagen, zinc, iron, and saw palmetto — that support healthy hair follicle cycling and new growth. Most customers see improvement within 2-3 months of consistent use.',
  },
  {
    question: `How is ${BRAND.name} different from a regular multivitamin?`,
    answer: `Regular multivitamins are designed for general population needs. ${BRAND.name} formulas use higher doses of the specific nutrients most depleted during GLP-1 therapy (like B12 and iron), more bioavailable forms that absorb better with reduced gastric function, and additional targeted ingredients for muscle preservation, digestive comfort, and beauty support that generic multivitamins don't address.`,
  },
  {
    question: 'How does the subscription work?',
    answer: "Subscribe and save up to 10% on every order. Your supplements ship automatically every 30 days so you never run out. You can pause, skip, modify, or cancel anytime — no commitments, no contracts. We'll send you a reminder email 3 days before each shipment.",
  },
  {
    question: "What's your return policy?",
    answer: `We offer a 30-day satisfaction guarantee. If you're not happy with your ${BRAND.name} supplements for any reason, contact us within 30 days of delivery for a full refund — even if you've used the product. We believe in what we make.`,
  },
  {
    question: `Are ${BRAND.name} supplements third-party tested?`,
    answer: `Yes. Every batch of ${BRAND.name} supplements is third-party tested for purity, potency, and heavy metals. We manufacture in a cGMP-certified, FDA-registered facility in the USA. Certificates of analysis are available upon request.`,
  },
  {
    question: 'Do I need all four products?',
    answer: 'Not necessarily! While The Bundle provides comprehensive support and the best value, you can start with the products that address your most pressing concerns. Many customers begin with Essential Multi and Gut Ease, then add Muscle Guard and Hair + Glow as needed. Our team is happy to help you build your personalized stack.',
  },
];
