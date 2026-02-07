// DRAFT: New Academy Modules for Boundaries Coffee Logbook
// Add these to TRAINING_CURRICULUM in mockData.ts

// ============================================================================
// MODULE 14: ICED DRINKS - DAY 2
// ============================================================================
{
  id: 'm-iced-drinks',
  title: 'Module 14: Iced Drinks - Day 2',
  description: 'Master the workflow differences for iced espresso drinks, including proper shaking technique and sweet cream finishing.',
  category: 'ONBOARDING',
  lessons: [
    {
      id: 'l-iced-overview',
      moduleId: 'm-iced-drinks',
      title: 'Iced Drink Fundamentals',
      type: 'CONTENT',
      content: `## Iced Drinks at Boundaries Coffee

The key difference between hot and iced drinks is **workflow** and **temperature management**.

### Why Iced Drinks Are Different
- Hot espresso hitting cold milk creates temperature shock
- Shaking integrates flavors and chills the drink properly
- Ice displacement affects milk portions
- Sweet cream is added LAST (floats on top)

### The Iced Latte Build (Two-Person Flow)

**Person 1 (Shots & Flavors):**
1. Label cup with order
2. Pull 2oz espresso shot
3. Add syrup to MIXING GLASS (not the cup)
4. Pour hot espresso into mixing glass with syrup
5. Pass to Person 2

**Person 2 (Milk & Finish):**
1. Add milk to mixing glass (fill to appropriate line)
2. Cap and SHAKE vigorously (5-7 shakes)
3. Fill cup with ice
4. Pour shaken drink over ice
5. If sweet cream requested: add 3oz sweet cream on top
6. Lid and send to Expo

### Shot Standards for Iced Drinks
| Drink | Shots |
|-------|-------|
| Iced Latte (all sizes) | 2 oz |
| Iced Americano | 3 oz (not 2!) |

### Milk Fill Lines
| Size | Fill Line |
|------|-----------|
| 16oz Iced | 11 oz line |
| 20oz Iced | 14 oz line |

### Sweet Cream Standards
- **Standard**: 3 oz cream + 0.5 oz syrup
- **Extra Sweet Cream**: 4 oz total
- Always add LAST so it floats
- Never stir after adding sweet cream`
    },
    {
      id: 'l-iced-practice',
      moduleId: 'm-iced-drinks',
      title: 'Iced Drink Practice',
      type: 'PRACTICE',
      content: 'Complete each iced drink under trainer supervision. All items must be checked before you can submit.',
      checklistItems: [
        { id: 'iced-latte-16-1', title: 'Iced Latte 16oz #1', description: 'Focus on proper shaking technique. Shot → mixing glass → syrup → milk → shake → ice → pour.', requiresPhoto: true },
        { id: 'iced-latte-16-2', title: 'Iced Latte 16oz #2', description: 'Demonstrate smooth workflow with minimal hesitation.', requiresPhoto: true },
        { id: 'iced-latte-20-1', title: 'Iced Latte 20oz #1', description: 'Note the different milk fill line for larger size.', requiresPhoto: true },
        { id: 'iced-vanilla-sc', title: 'Iced Vanilla Latte w/ Sweet Cream', description: 'Add sweet cream LAST so it floats on top. Do not stir.', requiresPhoto: true },
        { id: 'iced-mocha-1', title: 'Iced Mocha', description: 'Chocolate sauce goes in mixing glass with espresso. Shake to integrate.', requiresPhoto: true },
        { id: 'iced-americano-1', title: 'Iced Americano 16oz', description: '3 shots (not 2!) + cold water over ice. No shaking needed.', requiresPhoto: true },
        { id: 'iced-americano-2', title: 'Iced Americano 20oz', description: 'Confirm 3-shot standard for iced americanos.', requiresPhoto: true },
        { id: 'iced-original-1', title: 'Iced Texas Delight', description: 'Use TX Delight mix (Honey, Vanilla, Cinnamon). 1oz total syrup.', requiresPhoto: true },
        { id: 'iced-original-2', title: 'Iced Hill Country', description: 'Use Hill Country mix (Butter Pecan & Caramel). 1oz total syrup.', requiresPhoto: true }
      ]
    },
    {
      id: 'l-iced-quiz',
      moduleId: 'm-iced-drinks',
      title: 'Iced Drinks Knowledge Check',
      type: 'QUIZ',
      quizQuestions: [
        { id: 'iq1', type: 'MULTIPLE_CHOICE', question: 'How many shots of espresso go in an Iced Americano?', options: ['1 shot', '2 shots', '3 shots', '4 shots'], correctAnswers: ['3 shots'] },
        { id: 'iq2', type: 'MULTIPLE_CHOICE', question: 'Where do you add syrup for an iced latte?', options: ['Directly in the cup with ice', 'In the mixing glass before adding milk', 'On top after pouring', 'Mixed into the milk pitcher'], correctAnswers: ['In the mixing glass before adding milk'] },
        { id: 'iq3', type: 'MULTIPLE_CHOICE', question: 'Why do we shake iced lattes instead of just pouring over ice?', options: ['It looks more professional', 'Shaking integrates flavors and properly chills the drink', 'It creates more foam', 'It\'s faster than stirring'], correctAnswers: ['Shaking integrates flavors and properly chills the drink'] },
        { id: 'iq4', type: 'MULTIPLE_CHOICE', question: 'When should sweet cream be added to an iced drink?', options: ['First, before the ice', 'Mixed in with the milk before shaking', 'Last, so it floats on top', 'It doesn\'t matter'], correctAnswers: ['Last, so it floats on top'] },
        { id: 'iq5', type: 'MULTIPLE_CHOICE', question: 'What is the milk fill line for a 16oz iced latte?', options: ['9 oz line', '11 oz line', '14 oz line', '16 oz line'], correctAnswers: ['11 oz line'] },
        { id: 'iq6', type: 'MULTIPLE_CHOICE', question: 'What is the standard sweet cream portion?', options: ['1 oz cream + 0.25 oz syrup', '2 oz cream + 0.5 oz syrup', '3 oz cream + 0.5 oz syrup', '4 oz cream + 1 oz syrup'], correctAnswers: ['3 oz cream + 0.5 oz syrup'] },
        { id: 'iq7', type: 'MULTIPLE_CHOICE', question: 'How many espresso shots go in ALL iced lattes, regardless of size?', options: ['1 shot', '2 shots', '3 shots', 'Varies by size'], correctAnswers: ['2 shots'] },
        { id: 'iq8', type: 'MULTIPLE_CHOICE', question: 'Should you stir an iced drink after adding sweet cream?', options: ['Yes, always stir to mix', 'No, the sweet cream should float on top', 'Only if the customer asks', 'Stir halfway'], correctAnswers: ['No, the sweet cream should float on top'] },
        { id: 'iq9', type: 'MULTIPLE_CHOICE', question: 'What\'s the milk fill line for a 20oz iced latte?', options: ['11 oz line', '12 oz line', '14 oz line', '16 oz line'], correctAnswers: ['14 oz line'] },
        { id: 'iq10', type: 'MULTIPLE_CHOICE', question: 'In a two-person flow, who adds the ice to the cup?', options: ['Person 1 (Shots & Flavors)', 'Person 2 (Milk & Finish)', 'The Expo', 'Either person'], correctAnswers: ['Person 2 (Milk & Finish)'] }
      ]
    }
  ]
},

// ============================================================================
// MODULE 15: NOT COFFEE BAR - DAY 3
// ============================================================================
{
  id: 'm-not-coffee',
  title: 'Module 15: Not Coffee Bar - Day 3',
  description: 'Learn to make Energy drinks (Lotus), Bubbly, Freeze, Lemonades, and Smoothies.',
  category: 'ONBOARDING',
  lessons: [
    {
      id: 'l-notcoffee-overview',
      moduleId: 'm-not-coffee',
      title: 'Not Coffee Bar Overview',
      type: 'CONTENT',
      content: `## Not Coffee Bar at Boundaries

The "Not Coffee Bar" handles all non-espresso drinks. When staffing allows (5+ people), this is a dedicated position.

---

## ENERGY DRINKS (Lotus)

Lotus is our caffeinated energy base. Available as **Energy** (still), **Bubbly** (sparkling), or **Freeze** (frozen).

### Energy Build by Size
| Size | Lotus Concentrate | Total Syrup | Fill Line |
|------|-------------------|-------------|-----------|
| 12oz | Standard | 1 oz | 9 oz line |
| 16oz | Standard | 1.5 oz | 11 oz line |
| 20oz | Standard | 2 oz | 14 oz line |
| 24oz | Standard | 2 oz | 16 oz line |

### Energy Build Steps
1. Add ice to cup
2. Add Lotus concentrate (pour from tap)
3. Add flavor syrup(s)
4. Fill with water to appropriate line
5. Stir gently and lid

### Signature Energy Drinks
- **The Drift** - Strawberry & Pineapple
- **Electric B** - Blue Raspberry & Lime
- **Mystic Cherry** - Cherry & Coconut
- **Golden Wave** - Orange & Lime
- **Blue Haze** - Lavender, Blue Razz, Pomegranate
- **Shockwave** - Passionfruit, Strawberry, Kiwi
- **Strawberry Storm** - Strawberry & Lavender
- **Voltage** - Blackberry & Lemon

---

## BUBBLY (Sparkling Energy)

Same as Energy, but use **sparkling water** instead of still water.
- Do NOT shake or stir vigorously (preserves carbonation)
- Gently fold to mix

---

## FREEZE (Frozen Energy)

Uses the frozen energy hopper (NOT the coffee hopper).

### Frozen Energy Base (10L batch)
- 1.0 L Lotus Concentrate
- 8.0 L Water
- 350 g Sugar

**Rules:**
- No dairy in energy hopper
- No flavors in hopper (add to cup)
- SLUSH mode only
- Chill before loading

---

## LEMONADES

### Iced Lemonade Build
| Size | Lotus Lemon Conc. | Syrup | Fill with Water |
|------|-------------------|-------|-----------------|
| 12oz | 1 oz | 1 oz | Fill to line |
| 16oz | 1.5 oz | 1.5 oz | Fill to line |
| 20oz | 2 oz | 2 oz | Fill to line |
| 24oz | 2.5 oz | 2.5 oz | Fill to line |

### Signature Lemonades
- **Boundaries Lagoon** - Blue Raspberry, Coconut, Lime
- **Cherry Limeade** - Cherry, Lime, Lemon
- **Pink Paradise** - Strawberry & Vanilla
- **Sunset** - Pineapple, Mango, Strawberry (layered)

### Frozen Lemonade Build
| Size | Conc | Water | Syrup | Ice |
|------|------|-------|-------|-----|
| 12oz | 1.5 oz | 2.5 oz | 1 oz | 12oz scoop |
| 16oz | 3 oz | 4 oz | 1.5 oz | 24oz scoop |
| 20oz | 4.5 oz | 6 oz | 2 oz | 24oz + 10oz |
| 24oz | 6 oz | 8 oz | 2.5 oz | 24oz + 12oz |

Blend until smooth. Pour and serve.

---

## SMOOTHIES

100% fruit puree smoothies - no dairy, simple build.

### Smoothie Build
| Size | Puree | Water | Ice |
|------|-------|-------|-----|
| 12oz | 3 oz | 2 oz | Heaping scoop |
| 16oz | 4 oz | 3 oz | Heaping scoop |
| 20oz | 5 oz | 4 oz | Heaping scoop |
| 24oz | 6 oz | 5 oz | Heaping scoop |

### Smoothie Flavors
- **Strawberry Splash** - 100% Strawberry
- **Piña Colada** - Coconut & Pineapple
- **Perfect Peach** - 100% Peach
- **Mellow Mango** - 100% Mango

Blend until smooth. If too thick, add small amount of water.`
    },
    {
      id: 'l-notcoffee-practice',
      moduleId: 'm-not-coffee',
      title: 'Not Coffee Bar Practice',
      type: 'PRACTICE',
      content: 'Complete each drink under trainer supervision. All items must be checked before you can submit.',
      checklistItems: [
        // Energy
        { id: 'energy-drift', title: 'The Drift (Energy)', description: 'Strawberry & Pineapple. Follow size chart for syrup amounts.', requiresPhoto: true },
        { id: 'energy-blue', title: 'Electric B (Energy)', description: 'Blue Raspberry & Lime. Vibrant blue color.', requiresPhoto: true },
        { id: 'energy-custom', title: 'Custom Energy (trainer choice)', description: 'Trainer picks a random flavor combo. Build to spec.', requiresPhoto: true },
        // Bubbly
        { id: 'bubbly-1', title: 'Bubbly (Any Flavor)', description: 'Use sparkling water. Do NOT shake - gently fold.', requiresPhoto: true },
        // Freeze
        { id: 'freeze-1', title: 'Freeze (Any Flavor)', description: 'Use frozen energy hopper. Add flavor syrup to cup, not hopper.', requiresPhoto: true },
        // Lemonades
        { id: 'lemonade-lagoon', title: 'Boundaries Lagoon Lemonade', description: 'Blue Raspberry, Coconut, Lime. Our signature lemonade.', requiresPhoto: true },
        { id: 'lemonade-cherry', title: 'Cherry Limeade', description: 'Cherry, Lime, Lemon. Classic combo.', requiresPhoto: true },
        { id: 'frozen-lemonade', title: 'Frozen Lemonade (Any Flavor)', description: 'Blend with ice per size chart.', requiresPhoto: true },
        // Smoothies
        { id: 'smoothie-straw', title: 'Strawberry Splash Smoothie', description: 'Puree + water + ice. Blend until smooth.', requiresPhoto: true },
        { id: 'smoothie-pina', title: 'Piña Colada Smoothie', description: 'Coconut & Pineapple puree blend.', requiresPhoto: true }
      ]
    },
    {
      id: 'l-notcoffee-quiz',
      moduleId: 'm-not-coffee',
      title: 'Not Coffee Bar Knowledge Check',
      type: 'QUIZ',
      quizQuestions: [
        { id: 'nc1', type: 'MULTIPLE_CHOICE', question: 'What is the total syrup amount for a 16oz Energy drink?', options: ['1 oz', '1.5 oz', '2 oz', '2.5 oz'], correctAnswers: ['1.5 oz'] },
        { id: 'nc2', type: 'MULTIPLE_CHOICE', question: 'What makes a "Bubbly" different from an "Energy"?', options: ['Different Lotus concentrate', 'Uses sparkling water instead of still', 'Has less caffeine', 'Uses frozen base'], correctAnswers: ['Uses sparkling water instead of still'] },
        { id: 'nc3', type: 'MULTIPLE_CHOICE', question: 'What should you NEVER put in the frozen energy hopper?', options: ['Sugar', 'Lotus concentrate', 'Dairy or flavor syrups', 'Water'], correctAnswers: ['Dairy or flavor syrups'] },
        { id: 'nc4', type: 'MULTIPLE_CHOICE', question: 'What are the flavors in The Drift?', options: ['Orange & Lime', 'Strawberry & Pineapple', 'Cherry & Coconut', 'Blue Raspberry & Lime'], correctAnswers: ['Strawberry & Pineapple'] },
        { id: 'nc5', type: 'MULTIPLE_CHOICE', question: 'What are the three flavors in Boundaries Lagoon lemonade?', options: ['Strawberry, Vanilla, Lemon', 'Blue Raspberry, Coconut, Lime', 'Cherry, Lime, Lemon', 'Mango, Pineapple, Strawberry'], correctAnswers: ['Blue Raspberry, Coconut, Lime'] },
        { id: 'nc6', type: 'MULTIPLE_CHOICE', question: 'For a 20oz smoothie, how much puree do you use?', options: ['3 oz', '4 oz', '5 oz', '6 oz'], correctAnswers: ['5 oz'] },
        { id: 'nc7', type: 'MULTIPLE_CHOICE', question: 'Why should you NOT shake or stir a Bubbly vigorously?', options: ['It will overflow', 'It preserves the carbonation', 'It changes the color', 'It affects caffeine levels'], correctAnswers: ['It preserves the carbonation'] },
        { id: 'nc8', type: 'MULTIPLE_CHOICE', question: 'What mode should the frozen machine be set to?', options: ['ICE mode', 'BLEND mode', 'SLUSH mode', 'FROZEN mode'], correctAnswers: ['SLUSH mode'] },
        { id: 'nc9', type: 'MULTIPLE_CHOICE', question: 'For an iced lemonade, what is the lemon concentrate amount for a 24oz?', options: ['1.5 oz', '2 oz', '2.5 oz', '3 oz'], correctAnswers: ['2.5 oz'] },
        { id: 'nc10', type: 'MULTIPLE_CHOICE', question: 'What are the flavors in Blue Haze?', options: ['Blue Raspberry only', 'Lavender & Blue Raspberry', 'Lavender, Blue Razz, Pomegranate', 'Blueberry & Lavender'], correctAnswers: ['Lavender, Blue Razz, Pomegranate'] }
      ]
    }
  ]
},

// ============================================================================
// MODULE 16: KIDS DRINKS
// ============================================================================
{
  id: 'm-kids-drinks',
  title: 'Module 16: Kids Drinks',
  description: 'Learn to make caffeine-free kids drinks safely and correctly. Emphasis on NO CAFFEINE.',
  category: 'ONBOARDING',
  lessons: [
    {
      id: 'l-kids-overview',
      moduleId: 'm-kids-drinks',
      title: 'Kids Drinks - CAFFEINE-FREE Zone',
      type: 'CONTENT',
      content: `## Kids Drinks at Boundaries Coffee

### ⚠️ CRITICAL: NO CAFFEINE

Parents trust us to serve their children caffeine-free drinks. This is non-negotiable.

**Caffeine sources to AVOID:**
- Espresso (obviously)
- Lotus concentrate
- Matcha
- Chai concentrate
- Regular tea (black, green, oolong)

---

## Kids Menu Items

### 1. Unicorn Latte
**What it is:** Cotton Candy Tea Latte (Iced, 12oz only)

**Build:**
1. Add cotton candy syrup (1 oz) to cup
2. Add ROOIBOS tea (caffeine-free!) - steep if needed or use cold
3. Fill with milk
4. Add ice
5. Optional: top with whipped cream and sprinkles

**Key:** Use ROOIBOS or herbal tea only - NOT black or green tea!

---

### 2. Dino Juice
**What it is:** Blue Raspberry Pineapple Lemonade (Iced, 12oz only)

**Build:**
1. Add blue raspberry syrup (0.5 oz)
2. Add pineapple syrup (0.5 oz)
3. Add lemon concentrate (1 oz for 12oz)
4. Fill with water
5. Add ice

**Key:** No Lotus - this is just flavored lemonade!

---

### 3. Zebra Milk
**What it is:** Chocolate & Vanilla Milk (Iced, 12oz only)

**Build:**
1. Add chocolate sauce (0.5 oz)
2. Add vanilla syrup (0.5 oz)
3. Fill with cold milk
4. Stir to combine
5. Add ice

**Key:** Simple chocolate milk with vanilla twist. No espresso!

---

### 4. Kiddos Coffee
**What it is:** Any flavor steamer at KIDS TEMP (Hot, 8oz only)

**Build:**
1. Add any flavor syrup (0.75 oz for 8oz)
2. Steam milk to KIDS TEMP: **130-140°F** (NOT standard 150-160°F)
3. Pour and serve

**Key:** 
- Lower temperature = safe for kids to drink
- Any flavor the kid wants
- NO espresso, NO caffeine

---

## Temperature Standards

| Drink Type | Standard Temp | Kids Temp |
|------------|---------------|-----------|
| Hot Drinks | 150-160°F | 130-140°F |

When a parent asks for "kids temp" on any hot drink, steam to 130-140°F.

---

## Common Mistakes to Avoid

1. **Adding espresso to Kiddos Coffee** - It's just steamed milk with flavor!
2. **Using chai or matcha** - Both contain caffeine
3. **Using regular tea** - Use only herbal/rooibos
4. **Making it too hot** - Kids temp is 130-140°F
5. **Using Lotus in Dino Juice** - It's caffeine-free lemonade only`
    },
    {
      id: 'l-kids-practice',
      moduleId: 'm-kids-drinks',
      title: 'Kids Drinks Practice',
      type: 'PRACTICE',
      content: 'Complete each kids drink under trainer supervision. Verify NO CAFFEINE in each build.',
      checklistItems: [
        { id: 'kids-unicorn', title: 'Unicorn Latte', description: 'Cotton candy + ROOIBOS tea (caffeine-free!) + milk. Verify tea is herbal.', requiresPhoto: true },
        { id: 'kids-dino', title: 'Dino Juice', description: 'Blue raspberry + pineapple + lemonade. NO Lotus concentrate!', requiresPhoto: true },
        { id: 'kids-zebra', title: 'Zebra Milk', description: 'Chocolate + vanilla + milk. Simple and caffeine-free.', requiresPhoto: true },
        { id: 'kids-kiddos-van', title: 'Kiddos Coffee - Vanilla', description: 'Steam milk to KIDS TEMP (130-140°F). Verify with thermometer.', requiresPhoto: true },
        { id: 'kids-kiddos-choc', title: 'Kiddos Coffee - Chocolate', description: 'Steam milk to KIDS TEMP. Add chocolate sauce.', requiresPhoto: true },
        { id: 'kids-temp-check', title: 'Temperature Verification', description: 'Trainer verifies you can consistently hit kids temp (130-140°F).', requiresPhoto: false }
      ]
    },
    {
      id: 'l-kids-quiz',
      moduleId: 'm-kids-drinks',
      title: 'Kids Drinks Knowledge Check',
      type: 'QUIZ',
      quizQuestions: [
        { id: 'kq1', type: 'MULTIPLE_CHOICE', question: 'What is the #1 rule for kids drinks?', options: ['Make them colorful', 'No caffeine', 'Use extra syrup', 'Serve in a special cup'], correctAnswers: ['No caffeine'] },
        { id: 'kq2', type: 'MULTIPLE_CHOICE', question: 'What type of tea is used in the Unicorn Latte?', options: ['Black tea', 'Green tea', 'Rooibos (herbal) tea', 'Oolong tea'], correctAnswers: ['Rooibos (herbal) tea'] },
        { id: 'kq3', type: 'MULTIPLE_CHOICE', question: 'What are the two flavors in Zebra Milk?', options: ['Strawberry & Vanilla', 'Chocolate & Caramel', 'Chocolate & Vanilla', 'Cookies & Cream'], correctAnswers: ['Chocolate & Vanilla'] },
        { id: 'kq4', type: 'MULTIPLE_CHOICE', question: 'What is "Kids Temp" for hot drinks?', options: ['110-120°F', '130-140°F', '150-160°F', '160-170°F'], correctAnswers: ['130-140°F'] },
        { id: 'kq5', type: 'MULTIPLE_CHOICE', question: 'Does "Kiddos Coffee" contain any coffee or espresso?', options: ['Yes, decaf espresso', 'Yes, a small amount', 'No, it\'s just flavored steamed milk', 'Only if requested'], correctAnswers: ['No, it\'s just flavored steamed milk'] },
        { id: 'kq6', type: 'MULTIPLE_CHOICE', question: 'What are the flavors in Dino Juice?', options: ['Grape & Apple', 'Blue Raspberry & Pineapple', 'Strawberry & Lime', 'Orange & Mango'], correctAnswers: ['Blue Raspberry & Pineapple'] },
        { id: 'kq7', type: 'MULTIPLE_CHOICE', question: 'Which of these contains caffeine and should NEVER be used in kids drinks?', options: ['Rooibos tea', 'Vanilla syrup', 'Lotus concentrate', 'Strawberry puree'], correctAnswers: ['Lotus concentrate'] },
        { id: 'kq8', type: 'MULTIPLE_CHOICE', question: 'What size are all kids drinks served in?', options: ['8oz only', '12oz only', '16oz only', 'Any size'], correctAnswers: ['12oz only'] },
        { id: 'kq9', type: 'MULTIPLE_CHOICE', question: 'If a child wants a hot drink, what is the ONLY option?', options: ['Hot chocolate', 'Kiddos Coffee (any flavor, kids temp)', 'Decaf latte', 'Hot apple cider'], correctAnswers: ['Kiddos Coffee (any flavor, kids temp)'] },
        { id: 'kq10', type: 'TRUE_FALSE', question: 'Matcha is safe to use in kids drinks because it\'s a healthy green powder.', correctAnswers: ['False'] }
      ]
    }
  ]
},

// ============================================================================
// MODULE 17: COLD BREW & NITRO
// ============================================================================
{
  id: 'm-coldbrew-nitro',
  title: 'Module 17: Cold Brew & Nitro',
  description: 'Learn the Toddy cold brew process and nitro drink builds.',
  category: 'ONBOARDING',
  lessons: [
    {
      id: 'l-coldbrew-video',
      moduleId: 'm-coldbrew-nitro',
      title: 'Video: Toddy Cold Brew System',
      type: 'CONTENT',
      videoUrl: 'https://youtube.com/watch?v=Wb1NjY_aCww',
      content: `Watch the official Toddy Cold Brew System - Commercial Model Instructions video. This shows the exact process we use at Boundaries Coffee.`
    },
    {
      id: 'l-coldbrew-process',
      moduleId: 'm-coldbrew-nitro',
      title: 'Cold Brew Process (Toddy Method)',
      type: 'CONTENT',
      content: `## Cold Brew at Boundaries Coffee

Cold brew is our base for Nitro drinks and iced cold brew. It's brewed using the Toddy Commercial System.

### Equipment
- Toddy Commercial Cold Brew System
- 5 lb bag Cold Brew Roast coffee
- Toddy paper filter + mesh filter
- Nitro bags for storage

---

## Toddy Cold Brew Process

### Step 1: Setup
1. Insert paper filter into Toddy bucket
2. Place mesh filter on top of paper filter
3. Ensure drain plug is CLOSED

### Step 2: Add Coffee
1. Grind entire 5 lb bag of Cold Brew Roast
2. Add grounds to filter bag inside Toddy

### Step 3: Add Water (First Pour)
1. Pour 7 quarts water over grounds
2. Pour in slow, circular motion to wet all grounds evenly

### Step 4: Tie & Second Pour
1. Twist and tie the filter bag closed
2. Pour another 7 quarts water over the tied bag

### Step 5: Steep
1. **Steep time: 10 hours** (minimum)
2. Label with name and brew start time
3. Store at room temperature during steep

### Step 6: Drain & Store
1. After 10 hours, open drain plug
2. Allow concentrate to drain into carafe
3. Discard grounds carefully (compost if possible)
4. Add 7 quarts fresh water to dilute concentrate
5. Fill and crimp Nitro bags
6. Label bags with date and "COLD BREW"
7. Store FIFO in walk-in cooler

---

## Nitro Drinks

Nitro = Cold Brew infused with nitrogen for creamy, smooth texture.

### Standard Nitro Build
1. Add 1 scoop ice to cup
2. Fill with nitro from tap to 2nd-to-last line
3. Add 3 oz sweet cream
4. Add flavor syrup

### Signature Nitros
| Drink | Flavor |
|-------|--------|
| Vanilla Cream Nitro | Vanilla sweet cream |
| Salted Caramel Nitro | Salted caramel |
| Cookie Butter Nitro | White Chocolate & Biscoff |

### Nitro vs Regular Cold Brew
- **Nitro**: Served from tap, infused with nitrogen, creamy texture
- **Cold Brew**: Served over ice, not nitro-infused, less creamy

---

## Maintenance

- Clean Toddy system after each batch
- Flush nitro lines weekly with Cafiza
- Check nitro tank pressure daily`
    },
    {
      id: 'l-coldbrew-practice',
      moduleId: 'm-coldbrew-nitro',
      title: 'Cold Brew & Nitro Practice',
      type: 'PRACTICE',
      content: 'Complete these items under trainer supervision.',
      checklistItems: [
        { id: 'cb-setup', title: 'Set Up Toddy System', description: 'Insert filters, close drain, prep for brewing.', requiresPhoto: true },
        { id: 'cb-grind', title: 'Grind Cold Brew Coffee', description: 'Grind full 5 lb bag at correct setting.', requiresPhoto: true },
        { id: 'cb-firstpour', title: 'First Water Pour', description: 'Pour 7 quarts in circular motion to wet grounds evenly.', requiresPhoto: true },
        { id: 'cb-tie', title: 'Tie Filter & Second Pour', description: 'Twist, tie, and pour remaining 7 quarts.', requiresPhoto: true },
        { id: 'cb-label', title: 'Label Batch', description: 'Write name, date, and brew start time.', requiresPhoto: true },
        { id: 'cb-drain', title: 'Drain & Dilute', description: 'After steeping, drain and add 7 quarts fresh water.', requiresPhoto: true },
        { id: 'cb-bag', title: 'Fill Nitro Bags', description: 'Fill, crimp, and label nitro bags. FIFO in walk-in.', requiresPhoto: true },
        { id: 'nitro-vanilla', title: 'Vanilla Cream Nitro', description: 'Build standard nitro with vanilla sweet cream.', requiresPhoto: true },
        { id: 'nitro-salted', title: 'Salted Caramel Nitro', description: 'Build nitro with salted caramel syrup.', requiresPhoto: true },
        { id: 'nitro-cookie', title: 'Cookie Butter Nitro', description: 'White chocolate + Biscoff syrup combo.', requiresPhoto: true }
      ]
    },
    {
      id: 'l-coldbrew-quiz',
      moduleId: 'm-coldbrew-nitro',
      title: 'Cold Brew & Nitro Knowledge Check',
      type: 'QUIZ',
      quizQuestions: [
        { id: 'cb1', type: 'MULTIPLE_CHOICE', question: 'How long should cold brew steep in the Toddy system?', options: ['4 hours', '8 hours', '10 hours', '24 hours'], correctAnswers: ['10 hours'] },
        { id: 'cb2', type: 'MULTIPLE_CHOICE', question: 'How much water is used in the FIRST pour?', options: ['5 quarts', '7 quarts', '10 quarts', '14 quarts'], correctAnswers: ['7 quarts'] },
        { id: 'cb3', type: 'MULTIPLE_CHOICE', question: 'After draining the concentrate, how much fresh water do you add?', options: ['5 quarts', '7 quarts', '10 quarts', 'None'], correctAnswers: ['7 quarts'] },
        { id: 'cb4', type: 'MULTIPLE_CHOICE', question: 'What is the standard sweet cream portion for a nitro drink?', options: ['1 oz', '2 oz', '3 oz', '4 oz'], correctAnswers: ['3 oz'] },
        { id: 'cb5', type: 'MULTIPLE_CHOICE', question: 'What makes nitro coffee different from regular cold brew?', options: ['It\'s brewed differently', 'It\'s infused with nitrogen for a creamy texture', 'It has more caffeine', 'It\'s served hot'], correctAnswers: ['It\'s infused with nitrogen for a creamy texture'] },
        { id: 'cb6', type: 'MULTIPLE_CHOICE', question: 'What are the two flavors in Cookie Butter Nitro?', options: ['Chocolate & Cookie', 'White Chocolate & Biscoff', 'Caramel & Brown Sugar', 'Vanilla & Cinnamon'], correctAnswers: ['White Chocolate & Biscoff'] },
        { id: 'cb7', type: 'MULTIPLE_CHOICE', question: 'How should nitro bags be stored?', options: ['At room temperature', 'In the freezer', 'FIFO in the walk-in cooler', 'On the counter for 24 hours'], correctAnswers: ['FIFO in the walk-in cooler'] },
        { id: 'cb8', type: 'MULTIPLE_CHOICE', question: 'What weight of coffee is used per Toddy batch?', options: ['2 lbs', '3 lbs', '5 lbs', '10 lbs'], correctAnswers: ['5 lbs'] },
        { id: 'cb9', type: 'MULTIPLE_CHOICE', question: 'When building a nitro drink, what goes in the cup FIRST?', options: ['Nitro from tap', 'Sweet cream', 'Flavor syrup', 'Ice (1 scoop)'], correctAnswers: ['Ice (1 scoop)'] },
        { id: 'cb10', type: 'MULTIPLE_CHOICE', question: 'How often should nitro lines be flushed with Cafiza?', options: ['Daily', 'Weekly', 'Monthly', 'Never'], correctAnswers: ['Weekly'] }
      ]
    }
  ]
},

// ============================================================================
// MODULE 18: FOOD PREP & SAFETY
// ============================================================================
{
  id: 'm-food-prep',
  title: 'Module 18: Food Prep & Safety',
  description: 'Learn TurboChef operation, food handling, and safety standards.',
  category: 'ONBOARDING',
  lessons: [
    {
      id: 'l-food-overview',
      moduleId: 'm-food-prep',
      title: 'Food Prep Standards',
      type: 'CONTENT',
      content: `## Food at Boundaries Coffee

### Who Handles Food (By Staffing Level)
| Staff Count | Food Responsibility |
|-------------|---------------------|
| 2 | Order Taker |
| 3 | Expo |
| 4 | Person 2 on Coffee Bar |
| 5 | Not Coffee Bar |

---

## Menu Items

### Breakfast Taco
- **Options:** Bacon OR Beef Chorizo
- Served in paper sleeve
- Check internal temp if reheating

### Blueberry Muffin
- Served at room temp or warmed
- Display in pastry case

### Croissant
- **Options:** Almond OR Chocolate
- Warm in TurboChef for flaky texture

### Kolache
- Sausage, Cheese & Jalapeño
- Heat until internal temp reaches 165°F

---

## TurboChef Operation

The TurboChef is our rapid-cook oven. It uses microwave + convection for fast heating.

### Basic Operation
1. Select item on touchscreen
2. Place item on tray
3. Insert tray and close door
4. Press START
5. Wait for beep
6. Remove and serve

### Timing Reference
| Item | Approximate Time |
|------|------------------|
| Breakfast Taco | 45-60 seconds |
| Croissant | 30-45 seconds |
| Kolache | 60-90 seconds |
| Muffin (warm) | 20-30 seconds |

*Actual times may vary by TurboChef settings.*

---

## Food Safety Standards

### Temperature
- **Hot foods:** Hold above 140°F
- **Cold foods:** Hold below 40°F
- **Danger zone:** 40-140°F (bacteria grows rapidly)

### FIFO (First In, First Out)
- Always use oldest product first
- Label all items with date
- Rotate stock when restocking

### Handling
- Wash hands before handling food
- Use gloves when handling ready-to-eat items
- Never touch food with bare hands

### Storage
- Store raw items below ready-to-eat items
- Keep pastry case clean and organized
- Discard items past expiration

---

## Cleaning

### Hourly
- Wipe down TurboChef crumb tray
- Clean pastry case glass

### Closing
- Empty and wipe out pastry case (photo required)
- Record remaining inventory
- Clean TurboChef interior`
    },
    {
      id: 'l-food-practice',
      moduleId: 'm-food-prep',
      title: 'Food Prep Practice',
      type: 'PRACTICE',
      content: 'Complete each item under trainer supervision.',
      checklistItems: [
        { id: 'food-taco-bacon', title: 'Heat Breakfast Taco (Bacon)', description: 'Use TurboChef. Verify internal temp if needed.', requiresPhoto: true },
        { id: 'food-taco-chorizo', title: 'Heat Breakfast Taco (Chorizo)', description: 'Use TurboChef. Check for even heating.', requiresPhoto: true },
        { id: 'food-croissant-alm', title: 'Heat Almond Croissant', description: 'Warm until flaky. Don\'t overheat (will dry out).', requiresPhoto: true },
        { id: 'food-croissant-choc', title: 'Heat Chocolate Croissant', description: 'Warm gently. Chocolate should be soft not melted out.', requiresPhoto: true },
        { id: 'food-kolache', title: 'Heat Kolache', description: 'Must reach 165°F internal temp.', requiresPhoto: true },
        { id: 'food-fifo', title: 'Demonstrate FIFO Rotation', description: 'Show trainer proper stock rotation in pastry case.', requiresPhoto: false },
        { id: 'food-handwash', title: 'Proper Handwashing', description: 'Demonstrate 20-second handwash technique.', requiresPhoto: false },
        { id: 'food-turboclean', title: 'Clean TurboChef Crumb Tray', description: 'Remove, empty, wipe, and replace crumb tray.', requiresPhoto: true }
      ]
    },
    {
      id: 'l-food-quiz',
      moduleId: 'm-food-prep',
      title: 'Food Prep Knowledge Check',
      type: 'QUIZ',
      quizQuestions: [
        { id: 'fq1', type: 'MULTIPLE_CHOICE', question: 'What does FIFO stand for?', options: ['First In, First Out', 'Food Is For Others', 'Fresh Items First Only', 'Fast In, Fast Out'], correctAnswers: ['First In, First Out'] },
        { id: 'fq2', type: 'MULTIPLE_CHOICE', question: 'What is the "danger zone" temperature range?', options: ['0-32°F', '40-140°F', '140-165°F', '165-212°F'], correctAnswers: ['40-140°F'] },
        { id: 'fq3', type: 'MULTIPLE_CHOICE', question: 'What internal temperature should hot food items reach?', options: ['120°F', '140°F', '165°F', '200°F'], correctAnswers: ['165°F'] },
        { id: 'fq4', type: 'MULTIPLE_CHOICE', question: 'With 3 staff members, who handles food?', options: ['Order Taker', 'Expo', 'Coffee Bar', 'Not Coffee Bar'], correctAnswers: ['Expo'] },
        { id: 'fq5', type: 'MULTIPLE_CHOICE', question: 'What are the kolache fillings?', options: ['Ham & Cheese', 'Sausage, Cheese & Jalapeño', 'Bacon & Egg', 'Beef & Beans'], correctAnswers: ['Sausage, Cheese & Jalapeño'] },
        { id: 'fq6', type: 'MULTIPLE_CHOICE', question: 'How often should the TurboChef crumb tray be wiped?', options: ['Once a day', 'Hourly', 'Once a week', 'Only at closing'], correctAnswers: ['Hourly'] },
        { id: 'fq7', type: 'MULTIPLE_CHOICE', question: 'What are the two croissant options?', options: ['Plain & Butter', 'Almond & Chocolate', 'Ham & Cheese', 'Sweet & Savory'], correctAnswers: ['Almond & Chocolate'] },
        { id: 'fq8', type: 'MULTIPLE_CHOICE', question: 'Cold food should be held below what temperature?', options: ['32°F', '40°F', '50°F', '60°F'], correctAnswers: ['40°F'] },
        { id: 'fq9', type: 'TRUE_FALSE', question: 'It\'s okay to touch ready-to-eat food with bare hands if they look clean.', correctAnswers: ['False'] },
        { id: 'fq10', type: 'MULTIPLE_CHOICE', question: 'What breakfast taco options are available?', options: ['Bacon or Sausage', 'Bacon or Beef Chorizo', 'Egg or Veggie', 'Ham or Turkey'], correctAnswers: ['Bacon or Beef Chorizo'] }
      ]
    }
  ]
},

// ============================================================================
// MODULE 19: TEA & CHAI
// ============================================================================
{
  id: 'm-tea-chai',
  title: 'Module 19: Tea & Chai',
  description: 'Learn hot and iced tea preparation, plus chai latte builds.',
  category: 'ONBOARDING',
  lessons: [
    {
      id: 'l-tea-overview',
      moduleId: 'm-tea-chai',
      title: 'Tea & Chai Builds',
      type: 'CONTENT',
      content: `## Tea at Boundaries Coffee

### Hot Tea Service
1. Label cup with tea type
2. Add flavor syrup (if requested)
3. Pass to Person 2
4. Person 2 adds tea sachet + hot water
5. Lid and send to Expo

**Important:** Never stir after pouring. Let customer steep to preference.

### Iced Tea Signatures
| Tea | Flavors |
|-----|---------|
| Pomberry Punch | Pomegranate & Fresh Blueberry |
| Lavender Breeze | Rooibos, Coconut, Lavender (caffeine-free!) |
| Citrus Oolong | Taiwanese Oolong & Orange |
| Honey Bee | Black Tea, Honey, Peach & Ginger |
| Raspberry Hibiscus | Hibiscus, Raspberry (caffeine-free!) |

---

## Chai Lattes

Chai uses pre-made concentrate mixed with milk.

### Hot Chai Latte
1. Label cup
2. Add syrup if flavored (Vanilla Chai, etc.)
3. Pour HALF chai concentrate into steam pitcher
4. Add HALF milk to pitcher
5. Steam TOGETHER with mild aeration
6. Pour into cup
7. Lid and serve

**Ratio:** 1:1 (half chai, half milk)

### Iced Chai Latte
1. Label cup
2. Add syrup to mixing glass if flavored
3. Pour HALF chai concentrate into mixing glass
4. Add HALF milk
5. Shake to combine
6. Fill cup with ice
7. Pour over ice
8. Lid and serve

---

## Tea Latte (Non-Chai)

For tea lattes (like the Unicorn Latte or London Fog):

### Hot Tea Latte
1. Steep tea in small amount of hot water
2. Add syrup
3. Steam milk
4. Combine tea + syrup + steamed milk

### Iced Tea Latte
1. Steep tea and chill OR use cold tea
2. Add syrup to mixing glass
3. Add tea
4. Add milk
5. Shake
6. Pour over ice

---

## Caffeine Reference

| Tea Type | Caffeine? |
|----------|-----------|
| Black Tea | YES |
| Green Tea | YES |
| Oolong | YES |
| Chai Concentrate | YES |
| Rooibos | NO |
| Hibiscus | NO |
| Herbal | NO |

**For kids drinks:** Only use caffeine-free options!`
    },
    {
      id: 'l-tea-practice',
      moduleId: 'm-tea-chai',
      title: 'Tea & Chai Practice',
      type: 'PRACTICE',
      content: 'Complete each item under trainer supervision.',
      checklistItems: [
        { id: 'tea-hot', title: 'Hot Tea Service', description: 'Sachet + hot water. Don\'t stir - let customer steep.', requiresPhoto: true },
        { id: 'tea-honey-bee', title: 'Honey Bee Iced Tea', description: 'Black tea + honey + peach + ginger.', requiresPhoto: true },
        { id: 'tea-lavender', title: 'Lavender Breeze Iced Tea', description: 'Rooibos + coconut + lavender. Caffeine-free.', requiresPhoto: true },
        { id: 'chai-hot', title: 'Hot Chai Latte', description: 'Half chai + half milk, steamed together.', requiresPhoto: true },
        { id: 'chai-iced', title: 'Iced Chai Latte', description: 'Half chai + half milk, shaken, over ice.', requiresPhoto: true },
        { id: 'chai-vanilla', title: 'Vanilla Chai (Hot or Iced)', description: 'Add vanilla syrup to standard chai build.', requiresPhoto: true }
      ]
    },
    {
      id: 'l-tea-quiz',
      moduleId: 'm-tea-chai',
      title: 'Tea & Chai Knowledge Check',
      type: 'QUIZ',
      quizQuestions: [
        { id: 'tq1', type: 'MULTIPLE_CHOICE', question: 'What is the chai-to-milk ratio for a chai latte?', options: ['1/4 chai, 3/4 milk', '1/3 chai, 2/3 milk', '1:1 (half and half)', '3/4 chai, 1/4 milk'], correctAnswers: ['1:1 (half and half)'] },
        { id: 'tq2', type: 'MULTIPLE_CHOICE', question: 'For hot chai, do you steam the chai and milk separately or together?', options: ['Separately, then combine', 'Together in the same pitcher', 'Only steam the milk', 'Chai doesn\'t need steaming'], correctAnswers: ['Together in the same pitcher'] },
        { id: 'tq3', type: 'MULTIPLE_CHOICE', question: 'Which of these teas is caffeine-free?', options: ['Black tea', 'Green tea', 'Rooibos', 'Oolong'], correctAnswers: ['Rooibos'] },
        { id: 'tq4', type: 'MULTIPLE_CHOICE', question: 'What are the flavors in Honey Bee tea?', options: ['Honey & Lemon', 'Black Tea, Honey, Peach & Ginger', 'Green Tea & Honey', 'Chamomile & Honey'], correctAnswers: ['Black Tea, Honey, Peach & Ginger'] },
        { id: 'tq5', type: 'MULTIPLE_CHOICE', question: 'Should you stir a hot tea after serving?', options: ['Yes, always stir', 'No, let the customer steep to preference', 'Stir halfway', 'Remove the sachet first'], correctAnswers: ['No, let the customer steep to preference'] },
        { id: 'tq6', type: 'MULTIPLE_CHOICE', question: 'Does chai concentrate contain caffeine?', options: ['No, it\'s caffeine-free', 'Yes, it contains caffeine', 'Only if you add espresso', 'Depends on the brand'], correctAnswers: ['Yes, it contains caffeine'] },
        { id: 'tq7', type: 'MULTIPLE_CHOICE', question: 'What type of tea is Lavender Breeze?', options: ['Black tea', 'Green tea', 'Rooibos (caffeine-free)', 'Oolong'], correctAnswers: ['Rooibos (caffeine-free)'] },
        { id: 'tq8', type: 'MULTIPLE_CHOICE', question: 'For an iced chai, what do you do instead of steaming?', options: ['Blend with ice', 'Shake to combine', 'Just stir', 'Serve chai cold without mixing'], correctAnswers: ['Shake to combine'] },
        { id: 'tq9', type: 'MULTIPLE_CHOICE', question: 'Hibiscus tea is:', options: ['High in caffeine', 'Moderate caffeine', 'Caffeine-free', 'Only decaf available'], correctAnswers: ['Caffeine-free'] },
        { id: 'tq10', type: 'MULTIPLE_CHOICE', question: 'What oolong tea is on the menu?', options: ['Jasmine Oolong', 'Citrus Oolong', 'Peach Oolong', 'Plain Oolong'], correctAnswers: ['Citrus Oolong'] }
      ]
    }
  ]
}
