const IGNORED_WORDS = new Set([
  'a', 'aan', 'ca', 'circa', 'de', 'een', 'en', 'het', 'in', 'met', 'naar', 'of', 'ongeveer', 'op', 'optioneel', 'te', 'tot', 'uit', 'van', 'voor',
  'bio', 'biologisch', 'biologische',
  'fijngehakt', 'fijngesneden', 'gehakt', 'gepeld', 'geraspt', 'geschild', 'gesneden', 'gewassen', 'schoongemaakt',
  'groot', 'grote', 'klein', 'kleine', 'middelgroot', 'middelgrote',
  'beker', 'bekers', 'blik', 'blikken', 'blikje', 'blikjes', 'doos', 'dozen', 'fles', 'flessen', 'pak', 'pakken', 'pot', 'potten', 'sachet', 'sachets', 'stuk', 'stuks', 'zak', 'zakken',
  'bos', 'el', 'eetlepel', 'eetlepels', 'g', 'gr', 'gram', 'kg', 'kilo', 'l', 'liter', 'ml', 'snuf', 'snufje', 'tl', 'theelepel', 'theelepels',
  'teen', 'tenen', 'tak', 'takje', 'takjes',
]);

const CANONICAL_WORDS = new Map([
  ['aardappelen', 'aardappel'],
  ['appels', 'appel'],
  ['avocados', 'avocado'],
  ['bonen', 'boon'],
  ['courgettes', 'courgette'],
  ['eieren', 'ei'],
  ['gele', 'geel'],
  ['groene', 'groen'],
  ['limoenen', 'limoen'],
  ['paprikas', 'paprika'],
  ['peren', 'peer'],
  ['rode', 'rood'],
  ['tomaten', 'tomaat'],
  ['uien', 'ui'],
  ['verse', 'vers'],
  ['witte', 'wit'],
  ['wortelen', 'wortel'],
  ['zwarte', 'zwart'],
  ['zoete', 'zoet'],
]);

function normalizedWords(value) {
  const withoutNotes = String(value || '').replace(/\([^)]*\)/g, ' ');
  const normalized = withoutNotes
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[’']/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
  if (!normalized) return [];

  return normalized.split(/\s+/)
    .filter(word => word && !/\d/.test(word) && !IGNORED_WORDS.has(word))
    .map(word => CANONICAL_WORDS.get(word) || (word.length > 4 && word.endsWith('s') ? word.slice(0, -1) : word))
    .filter(word => word.length > 1 && !IGNORED_WORDS.has(word));
}

function wordSimilarity(wanted, offered) {
  if (wanted === offered) return 1;
  if (Math.min(wanted.length, offered.length) >= 4 && (wanted.includes(offered) || offered.includes(wanted))) return 0.72;
  return 0;
}

function scoreProductMatch(ingredientName, productName) {
  const wanted = normalizedWords(ingredientName);
  const offered = normalizedWords(productName);
  if (!wanted.length || !offered.length) return 0;

  const used = new Set();
  let matched = 0;
  wanted.forEach(word => {
    let bestScore = 0;
    let bestIndex = -1;
    offered.forEach((candidate, index) => {
      if (used.has(index)) return;
      const score = wordSimilarity(word, candidate);
      if (score > bestScore) {
        bestScore = score;
        bestIndex = index;
      }
    });
    matched += bestScore;
    if (bestIndex >= 0) used.add(bestIndex);
  });

  const coverage = matched / wanted.length;
  if (coverage < 0.5) return 0;
  const extraWords = Math.max(0, offered.length - used.size);
  return Math.max(0, Math.min(1, coverage - extraWords * 0.08));
}

export function rankProductMatches(ingredientName, products) {
  return (products || [])
    .map(product => ({ product, score: scoreProductMatch(ingredientName, product?.name) }))
    .filter(match => match.score > 0)
    .sort((a, b) => b.score - a.score || String(a.product?.name || '').localeCompare(String(b.product?.name || ''), 'nl'));
}

export function findBestProductMatch(ingredientName, products, options = {}) {
  const minScore = options.minScore ?? 0.94;
  const minMargin = options.minMargin ?? 0.06;
  const ranked = rankProductMatches(ingredientName, products);
  const best = ranked[0];
  if (!best || best.score < minScore) return null;
  if (ranked[1] && best.score - ranked[1].score < minMargin) return null;
  return best;
}

export { normalizedWords, scoreProductMatch };
