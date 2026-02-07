import { Ingredient } from '@/data/products';

export default function SupplementFacts({ ingredients, productName }: { ingredients: Ingredient[]; productName: string }) {
  return (
    <div className="border-2 border-charcoal rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-charcoal text-white p-4">
        <h3 className="text-xl font-bold">Supplement Facts</h3>
        <p className="text-sm text-gray-300">Serving Size: 1 Daily Serving</p>
        <p className="text-sm text-gray-300">Servings Per Container: 30</p>
      </div>

      {/* Line */}
      <div className="h-2 bg-charcoal" />

      {/* Column headers */}
      <div className="flex justify-between px-4 py-2 border-b border-charcoal text-xs font-bold">
        <span></span>
        <div className="flex gap-8">
          <span>Amount Per Serving</span>
          <span className="w-16 text-right">% DV*</span>
        </div>
      </div>

      {/* Ingredients */}
      <div className="divide-y divide-gray-200">
        {ingredients.map((ing) => (
          <div key={ing.name} className="flex justify-between items-center px-4 py-2.5 hover:bg-gray-50">
            <span className="text-sm font-medium text-charcoal pr-4">{ing.name}</span>
            <div className="flex gap-8 shrink-0">
              <span className="text-sm text-charcoal">{ing.amount} {ing.unit}</span>
              <span className="w-16 text-right text-sm text-charcoal-light">
                {ing.dailyValue || '†'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-charcoal bg-gray-50">
        <p className="text-xs text-charcoal-light leading-relaxed">
          * Percent Daily Values are based on a 2,000 calorie diet.<br />
          † Daily Value not established.
        </p>
        <p className="text-xs text-charcoal-light mt-2">
          Other Ingredients: Vegetable cellulose (capsule), microcrystalline cellulose, silicon dioxide.
        </p>
      </div>
    </div>
  );
}
