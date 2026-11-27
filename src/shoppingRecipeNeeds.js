export function shoppingRecipeNameIndex(recipes = [], mealPlans = [], legacyPlans = []) {
  const names = new Map();

  function remember(id, name) {
    const label = String(name || '').trim();
    if (id && label && !names.has(id)) names.set(id, label);
  }

  for (const recipe of recipes) {
    remember(recipe.id, recipe.name);
  }
  for (const plan of mealPlans) {
    const recipeId = plan.recipeId || plan.recipeSnapshot?.id;
    remember(plan.id, plan.name);
    remember(plan.id, plan.recipeSnapshot?.name);
    remember(plan.id, names.get(recipeId));
    remember(recipeId, names.get(plan.id));
  }
  for (const plan of legacyPlans) {
    remember(plan.id, plan.recipeName);
    remember(plan.id, names.get(plan.recipeId));
    remember(plan.recipeId, plan.recipeName);
  }

  return names;
}

export function formatRecipeNeedAmounts(needs) {
  const totals = new Map();
  const textAmounts = [];

  for (const need of needs) {
    if (!need) continue;
    const unit = String(need.unit || '').trim().toLowerCase();
    const times = Math.max(1, Number(need.times) || 1);
    const value = Number(need.value);

    if (need.value == null || !Number.isFinite(value)) {
      const amount = String(need.valueText || '').trim();
      if (amount) {
        const label = [amount, unit].filter(Boolean).join(' ');
        textAmounts.push(times > 1 ? `${label} × ${times}` : label);
      }
      continue;
    }

    const baseUnit = unit === 'l' ? 'ml' : ['kg', 'g'].includes(unit) ? 'gr' : unit;
    const scale = unit === 'l' || unit === 'kg' ? 1000 : 1;
    totals.set(baseUnit, (totals.get(baseUnit) || 0) + value * times * scale);
  }

  const amounts = Array.from(totals, ([unit, value]) => {
    const largeUnit = unit === 'gr' ? 'kg' : unit === 'ml' ? 'l' : unit;
    const convert = largeUnit !== unit && value >= 1000;
    const amount = convert ? value / 1000 : value;
    const number = String(Math.round(amount * 100) / 100).replace('.', ',');
    return `${number} ${convert ? largeUnit : unit}`.trim();
  });

  return [...amounts, ...textAmounts].join(' + ');
}
