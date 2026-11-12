'use strict';

const { load } = require('cheerio');

const FRACTIONS = new Map([
  ['¼', 0.25],
  ['½', 0.5],
  ['¾', 0.75],
  ['⅓', 1 / 3],
  ['⅔', 2 / 3],
  ['⅛', 0.125],
  ['⅜', 0.375],
  ['⅝', 0.625],
  ['⅞', 0.875],
]);

const UNIT_ALIASES = [
  ['eetlepels', 'el'], ['eetlepel', 'el'], ['theelepels', 'tl'], ['theelepel', 'tl'],
  ['milliliters', 'ml'], ['milliliter', 'ml'], ['kilogram', 'kg'], ['liters', 'l'], ['liter', 'l'],
  ['gram', 'g'], ['stuks', 'st'], ['stukken', 'st'], ['stuk', 'st'],
  ['snufjes', 'snuf'], ['snufje', 'snuf'], ['snuf', 'snuf'],
  ['blikjes', 'blik'], ['blikje', 'blik'], ['blikken', 'blik'], ['blik', 'blik'],
  ['pakjes', 'pak'], ['pakje', 'pak'], ['pakken', 'pak'], ['pak', 'pak'],
  ['zakjes', 'zak'], ['zakje', 'zak'], ['zakken', 'zak'], ['zak', 'zak'],
  ['potjes', 'pot'], ['potje', 'pot'], ['potten', 'pot'], ['pot', 'pot'],
  ['flessen', 'fles'], ['flesjes', 'fles'], ['flesje', 'fles'], ['fles', 'fles'],
  ['gr', 'g'], ['kg', 'kg'], ['ml', 'ml'], ['tl', 'tl'], ['el', 'el'], ['g', 'g'], ['l', 'l'],
];

function plainText(value) {
  if (value == null) return '';
  return load(`<body>${String(value)}</body>`).text().replace(/\s+/g, ' ').trim();
}

function normalizeLeadingFraction(value) {
  let text = String(value || '').trim();
  const fractionMatch = text.match(/^(\d+)?\s*([¼½¾⅓⅔⅛⅜⅝⅞])/);
  if (!fractionMatch) return text;
  const whole = Number(fractionMatch[1] || 0);
  const fraction = FRACTIONS.get(fractionMatch[2]) || 0;
  const number = Math.round((whole + fraction) * 1000) / 1000;
  return `${number} ${text.slice(fractionMatch[0].length).trim()}`.trim();
}

function parseAmount(value) {
  const text = normalizeLeadingFraction(value);
  const mixed = text.match(/^(\d+)\s+(\d+)\/(\d+)(?:\s+|$)/);
  if (mixed && Number(mixed[3])) {
    const amount = Number(mixed[1]) + Number(mixed[2]) / Number(mixed[3]);
    return { amount: String(Math.round(amount * 1000) / 1000), rest: text.slice(mixed[0].length).trim() };
  }
  const fraction = text.match(/^(\d+)\/(\d+)(?:\s+|$)/);
  if (fraction && Number(fraction[2])) {
    const amount = Number(fraction[1]) / Number(fraction[2]);
    return { amount: String(Math.round(amount * 1000) / 1000), rest: text.slice(fraction[0].length).trim() };
  }
  const number = text.match(/^(\d+(?:[.,]\d+)?(?:\s*[-–]\s*\d+(?:[.,]\d+)?)?)(?:\s+|$)/);
  if (!number) return { amount: '', rest: text };
  return {
    amount: number[1].replace(/\s+/g, '').replace('–', '-').replace('.', ','),
    rest: text.slice(number[0].length).trim(),
  };
}

function takeUnit(value) {
  const text = String(value || '').trim();
  const lower = text.toLocaleLowerCase('nl-NL');
  for (const [alias, unit] of UNIT_ALIASES) {
    if (lower === alias || lower.startsWith(`${alias} `)) {
      return { unit, rest: text.slice(alias.length).trim() };
    }
  }
  return { unit: '', rest: text };
}

function numericAmount(value) {
  const first = String(value || '').split('-')[0].replace(',', '.');
  const parsed = Number(first);
  return Number.isFinite(parsed) ? parsed : 1;
}

function parseIngredientLine(value) {
  const raw = plainText(value).replace(/^[•·-]\s*/, '');
  let { amount, rest } = parseAmount(raw);
  let { unit, rest: name } = takeUnit(rest);

  if (!amount) {
    const unitOnly = takeUnit(raw);
    if (unitOnly.unit && ['snuf', 'blik', 'pak', 'zak', 'pot', 'fles'].includes(unitOnly.unit)) {
      amount = '1';
      unit = unitOnly.unit;
      name = unitOnly.rest;
    }
  }

  name = String(name || rest || raw)
    .replace(/^van\s+/i, '')
    .replace(/^[,;:]\s*/, '')
    .trim();
  const normalizedUnit = unit || 'st';
  const packageUnit = ['blik', 'pak', 'zak', 'pot', 'fles'].includes(normalizedUnit);
  const buyQty = packageUnit || normalizedUnit === 'st'
    ? Math.max(1, Math.min(99, Math.ceil(numericAmount(amount))))
    : 1;

  return {
    raw,
    name: name || raw,
    amount,
    unit: normalizedUnit,
    buyQty,
  };
}

function isRecipeType(value) {
  const types = Array.isArray(value) ? value : [value];
  return types.some(type => String(type || '').split(/[\/#]/).pop().toLowerCase() === 'recipe');
}

function collectRecipeNodes(value, recipes, seen) {
  if (!value || typeof value !== 'object' || seen.has(value)) return;
  seen.add(value);
  if (Array.isArray(value)) {
    value.forEach(item => collectRecipeNodes(item, recipes, seen));
    return;
  }
  if (isRecipeType(value['@type'])) recipes.push(value);
  Object.values(value).forEach(item => collectRecipeNodes(item, recipes, seen));
}

function parseServings(value) {
  const source = Array.isArray(value) ? value[0] : value;
  const match = String(source || '').match(/\d+/);
  if (!match) return null;
  return Math.max(1, Math.min(99, Number(match[0])));
}

function parseRecipePage(html, sourceUrl) {
  const $ = load(html);
  const recipes = [];
  $('script[type="application/ld+json"]').each((_, script) => {
    const text = $(script).html()?.trim().replace(/^<!--|-->$/g, '').replace(/;\s*$/, '');
    if (!text) return;
    try {
      collectRecipeNodes(JSON.parse(text), recipes, new WeakSet());
    } catch {
      // Een pagina kan meerdere JSON-LD-blokken hebben; één ongeldig blok mag de rest niet blokkeren.
    }
  });

  const recipe = recipes.sort((a, b) => (
    (Array.isArray(b.recipeIngredient) ? b.recipeIngredient.length : 0)
    - (Array.isArray(a.recipeIngredient) ? a.recipeIngredient.length : 0)
  ))[0];
  if (!recipe) return null;

  const rawIngredients = Array.isArray(recipe.recipeIngredient)
    ? recipe.recipeIngredient
    : (recipe.recipeIngredient ? [recipe.recipeIngredient] : []);
  const ingredients = rawIngredients.map(parseIngredientLine).filter(ingredient => ingredient.name);
  if (!ingredients.length) return null;

  const canonical = $('link[rel="canonical"]').attr('href');
  const title = plainText(recipe.name)
    || plainText($('meta[property="og:title"]').attr('content'))
    || plainText($('title').text())
    || 'Geïmporteerd recept';

  return {
    name: title,
    url: canonical ? new URL(canonical, sourceUrl).href : sourceUrl,
    servings: parseServings(recipe.recipeYield),
    ingredients,
  };
}

module.exports = { parseIngredientLine, parseRecipePage };
