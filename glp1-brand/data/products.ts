export interface Ingredient {
  name: string;
  amount: string;
  unit: string;
  dailyValue?: string;
  description: string;
}

export interface Product {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  longDescription: string;
  price: number;
  subscriptionPrice: number;
  color: string;
  colorLight: string;
  icon: string;
  ingredients: Ingredient[];
  benefits: string[];
  whyGLP1: string;
}

export const products: Product[] = [
  {
    slug: 'essential-multi',
    name: 'Essential Multi',
    tagline: 'The daily vitamin your new body needs',
    description: 'A comprehensive daily multivitamin optimized for the unique nutritional demands of GLP-1 medications. Every dose addresses the specific deficiencies research shows are most common.',
    longDescription: 'GLP-1 medications change how your body absorbs and processes nutrients. Reduced food intake means reduced nutrient intake — but your body\'s needs don\'t decrease. Essential Multi delivers clinically-studied doses of the vitamins and minerals most impacted by GLP-1 therapy, in highly bioavailable forms your body can actually use.',
    price: 49.99,
    subscriptionPrice: 44.99,
    color: '#5B7B5E',
    colorLight: '#E8F0E8',
    icon: '💊',
    ingredients: [
      { name: 'Vitamin B12 (Methylcobalamin)', amount: '1000', unit: 'mcg', dailyValue: '41,667%', description: 'The most bioavailable form of B12. GLP-1 users show significantly lower B12 levels due to reduced intrinsic factor production and decreased food intake.' },
      { name: 'Iron (Ferrous Bisglycinate)', amount: '18', unit: 'mg', dailyValue: '100%', description: 'Gentle, highly absorbable iron to prevent the anemia commonly seen with rapid weight loss and reduced red meat consumption.' },
      { name: 'Folate (5-MTHF)', amount: '800', unit: 'mcg DFE', dailyValue: '200%', description: 'Active folate that doesn\'t require conversion. Essential for cell division, DNA synthesis, and red blood cell formation.' },
      { name: 'Zinc (Zinc Picolinate)', amount: '30', unit: 'mg', dailyValue: '273%', description: 'Critical for immune function, wound healing, and taste perception — which can be altered by GLP-1 medications.' },
      { name: 'Vitamin D3 (Cholecalciferol)', amount: '5000', unit: 'IU', dailyValue: '625%', description: 'Supports calcium absorption, bone health, immune function, and mood — all areas affected during significant weight loss.' },
      { name: 'Calcium (Calcium Citrate)', amount: '500', unit: 'mg', dailyValue: '38%', description: 'Citrate form for optimal absorption. Protects bone density during the rapid body composition changes of GLP-1 therapy.' },
      { name: 'Magnesium (Glycinate)', amount: '200', unit: 'mg', dailyValue: '48%', description: 'Supports muscle function, sleep quality, and metabolic health. Highly absorbable form that\'s gentle on the stomach.' },
      { name: 'Vitamin K2 (MK-7)', amount: '100', unit: 'mcg', dailyValue: '83%', description: 'Works synergistically with D3 and calcium to direct calcium into bones rather than arteries.' },
    ],
    benefits: [
      'Fills the nutritional gaps created by reduced food intake',
      'Bioavailable forms optimized for absorption',
      'Supports energy, immunity, and bone health',
      'Gentle on sensitive GLP-1 stomachs',
    ],
    whyGLP1: 'Research shows GLP-1 users consume 30-40% fewer calories, leading to significant risk of micronutrient deficiencies. Studies in bariatric populations (which mirror GLP-1 nutritional patterns) show B12 deficiency in up to 64% of patients, iron deficiency in 45%, and vitamin D insufficiency in over 70%.',
  },
  {
    slug: 'muscle-guard',
    name: 'Muscle Guard',
    tagline: 'Protect what you\'ve built',
    description: 'A science-backed muscle preservation formula designed to combat the lean mass loss that affects up to 40% of weight lost on GLP-1 medications.',
    longDescription: 'The biggest concern in GLP-1 therapy isn\'t losing weight — it\'s losing muscle along with it. Studies show that up to 40% of weight lost on semaglutide can be lean body mass. Muscle Guard combines the most evidence-backed compounds for muscle protein synthesis and anti-catabolic protection, specifically dosed for those in a caloric deficit.',
    price: 49.99,
    subscriptionPrice: 44.99,
    color: '#4A6670',
    colorLight: '#E3EDF0',
    icon: '💪',
    ingredients: [
      { name: 'L-Leucine', amount: '3', unit: 'g', description: 'The primary amino acid trigger for muscle protein synthesis. 3g provides the threshold dose needed to maximally stimulate mTOR signaling, even in a caloric deficit.' },
      { name: 'HMB (β-Hydroxy β-Methylbutyrate)', amount: '3', unit: 'g', description: 'A leucine metabolite with strong anti-catabolic properties. Meta-analyses show HMB preserves lean mass during caloric restriction by inhibiting muscle protein breakdown.' },
      { name: 'Creatine Monohydrate', amount: '5', unit: 'g', description: 'The most studied supplement in sports nutrition. Supports muscle cell hydration, strength, and lean mass retention. Especially critical during weight loss phases.' },
      { name: 'Vitamin D3', amount: '4000', unit: 'IU', dailyValue: '500%', description: 'Low vitamin D is associated with muscle weakness and sarcopenia. Adequate levels support muscle protein synthesis and physical performance.' },
      { name: 'Collagen Peptides (Type I & III)', amount: '5', unit: 'g', description: 'Supports connective tissue integrity during rapid body composition changes. May support joint health and muscle recovery.' },
    ],
    benefits: [
      'Combats the lean mass loss seen with GLP-1 therapy',
      'Supports muscle protein synthesis in a caloric deficit',
      'Research-backed doses — no pixie dusting',
      'Unflavored powder mixes easily into any drink',
    ],
    whyGLP1: 'The STEP 1 trial showed that ~40% of weight lost on semaglutide 2.4mg was lean body mass. The SURMOUNT-1 trial for tirzepatide showed similar patterns. Preserving muscle is critical for metabolic health, physical function, and long-term weight maintenance.',
  },
  {
    slug: 'gut-ease',
    name: 'Gut Ease',
    tagline: 'Because the journey shouldn\'t hurt',
    description: 'Targeted digestive support for the nausea, bloating, and GI discomfort that affects up to 44% of GLP-1 users, especially during dose titration.',
    longDescription: 'GLP-1 medications work partly by slowing gastric emptying — which is great for appetite control but can cause nausea, bloating, constipation, and general GI distress. Gut Ease combines traditional digestive remedies backed by modern research with probiotics and enzymes to support comfortable digestion throughout your GLP-1 journey.',
    price: 49.99,
    subscriptionPrice: 44.99,
    color: '#8B7355',
    colorLight: '#F5F0E8',
    icon: '🌿',
    ingredients: [
      { name: 'Ginger Root Extract (5% Gingerols)', amount: '500', unit: 'mg', description: 'Multiple clinical trials demonstrate ginger\'s efficacy for nausea relief. Works by blocking serotonin receptors in the gut and accelerating gastric emptying.' },
      { name: 'Peppermint Oil (Enteric-Coated)', amount: '180', unit: 'mg', description: 'Enteric coating ensures release in the intestines where it relaxes smooth muscle, reducing bloating, cramping, and abdominal discomfort.' },
      { name: 'Probiotic Blend (Lactobacillus & Bifidobacterium)', amount: '20', unit: 'billion CFU', description: 'Shelf-stable strains clinically shown to support digestive regularity, reduce bloating, and maintain gut barrier integrity during dietary changes.' },
      { name: 'Digestive Enzyme Complex', amount: '150', unit: 'mg', description: 'Protease, lipase, and amylase to support the breakdown of proteins, fats, and carbs when your body\'s own digestive capacity is reduced.' },
      { name: 'Fennel Seed Extract', amount: '250', unit: 'mg', description: 'Traditional carminative herb that reduces gas and bloating by relaxing intestinal smooth muscle and promoting healthy motility.' },
      { name: 'Artichoke Leaf Extract', amount: '300', unit: 'mg', description: 'Stimulates bile production to support fat digestion and has been shown in clinical trials to reduce symptoms of dyspepsia.' },
    ],
    benefits: [
      'Reduces nausea during dose titration and beyond',
      'Supports healthy digestion with slower gastric emptying',
      'Promotes digestive comfort and regularity',
      'Gentle enough for daily, long-term use',
    ],
    whyGLP1: 'GI side effects are the #1 reason patients discontinue GLP-1 therapy. In the STEP trials, 44% of semaglutide patients reported nausea, 24% reported diarrhea, and 24% reported constipation. Supporting digestive comfort helps patients stay on therapy long enough to see results.',
  },
  {
    slug: 'hair-glow',
    name: 'Hair + Glow',
    tagline: 'Radiance from the inside out',
    description: 'A targeted beauty-from-within formula addressing the hair thinning and skin changes that many GLP-1 users experience during rapid weight loss.',
    longDescription: 'Rapid weight loss — regardless of the method — can trigger telogen effluvium (temporary hair shedding) and skin changes. GLP-1 users frequently report noticeable hair thinning 3-6 months into treatment. Hair + Glow provides the specific nutrients that support hair follicle cycling, collagen synthesis, and skin health during this transition.',
    price: 49.99,
    subscriptionPrice: 44.99,
    color: '#9B6B8E',
    colorLight: '#F3E8F0',
    icon: '✨',
    ingredients: [
      { name: 'Biotin (D-Biotin)', amount: '5000', unit: 'mcg', dailyValue: '16,667%', description: 'Essential B-vitamin for keratin production. While deficiency is the primary driver of biotin-responsive hair loss, supplementation supports hair strength and growth rate.' },
      { name: 'Collagen Peptides (Types I, II & III)', amount: '10', unit: 'g', description: 'Hydrolyzed for absorption. Provides the amino acids (proline, glycine, hydroxyproline) that are building blocks for hair, skin, and nail tissue.' },
      { name: 'Zinc (Zinc Picolinate)', amount: '25', unit: 'mg', dailyValue: '227%', description: 'Critical for hair follicle function and tissue repair. Zinc deficiency is directly linked to hair loss and is common during caloric restriction.' },
      { name: 'Iron (Ferrous Bisglycinate)', amount: '18', unit: 'mg', dailyValue: '100%', description: 'Iron deficiency is the most common nutritional cause of hair loss in women. This gentle form minimizes GI side effects.' },
      { name: 'Saw Palmetto Extract', amount: '320', unit: 'mg', description: 'May help reduce DHT-related hair thinning by inhibiting 5-alpha reductase. Studies show modest improvements in hair density.' },
      { name: 'Vitamin C (Ascorbic Acid)', amount: '500', unit: 'mg', dailyValue: '556%', description: 'Essential for collagen synthesis, iron absorption, and antioxidant protection of hair follicles from oxidative stress.' },
      { name: 'Vitamin E (Mixed Tocopherols)', amount: '134', unit: 'mg', dailyValue: '893%', description: 'Potent antioxidant that supports scalp circulation and protects skin cell membranes from damage during rapid weight changes.' },
    ],
    benefits: [
      'Addresses hair thinning associated with rapid weight loss',
      'Supports collagen production for skin elasticity',
      'Provides key nutrients for nail strength',
      'Comprehensive beauty support from within',
    ],
    whyGLP1: 'Telogen effluvium affects a significant percentage of GLP-1 users, typically appearing 3-6 months after starting medication. The combination of rapid weight loss, reduced protein intake, and micronutrient gaps creates a "perfect storm" for hair and skin changes. Targeted nutritional support can help minimize these effects.',
  },
];

export const bundle = {
  slug: 'the-bundle',
  name: 'The Bundle',
  tagline: 'Complete GLP-1 support, one subscription',
  description: 'All four Noriva formulas at our best price. Everything your body needs to thrive on GLP-1 therapy — from essential nutrients to muscle support to digestive comfort to beauty from within.',
  price: 149.99,
  subscriptionPrice: 129.99,
  savings: '35%',
  color: '#3D3D3D',
  colorLight: '#F5F5F0',
  includes: ['Essential Multi', 'Muscle Guard', 'Gut Ease', 'Hair + Glow'],
};

export function getProduct(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}
