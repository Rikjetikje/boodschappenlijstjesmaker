'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { parseIngredientLine, parseRecipePage } = require('../lib/recipe-parser');

test('leest Nederlandse hoeveelheden en eenheden', () => {
  assert.deepEqual(parseIngredientLine('250 g kastanjechampignons'), {
    raw: '250 g kastanjechampignons', name: 'kastanjechampignons', amount: '250', unit: 'g', buyQty: 1,
  });
  assert.deepEqual(parseIngredientLine('2 rode paprika’s'), {
    raw: '2 rode paprika’s', name: 'rode paprika’s', amount: '2', unit: 'st', buyQty: 2,
  });
  assert.deepEqual(parseIngredientLine('½ tl gerookt paprikapoeder'), {
    raw: '½ tl gerookt paprikapoeder', name: 'gerookt paprikapoeder', amount: '0,5', unit: 'tl', buyQty: 1,
  });
  assert.deepEqual(parseIngredientLine('1 blik tomatenblokjes (400 g)'), {
    raw: '1 blik tomatenblokjes (400 g)', name: 'tomatenblokjes (400 g)', amount: '1', unit: 'blik', buyQty: 1,
  });
});

test('leest een Recipe uit een JSON-LD graph', () => {
  const html = `<!doctype html><html><head>
    <link rel="canonical" href="https://voorbeeld.nl/recept/soep">
    <script type="application/ld+json">{
      "@context":"https://schema.org",
      "@graph":[{"@type":"WebPage"},{"@type":"Recipe","name":"Pompoensoep","recipeYield":"4 personen","recipeIngredient":["1 kg pompoen","2 el olijfolie"]}]
    }</script>
  </head></html>`;
  assert.deepEqual(parseRecipePage(html, 'https://voorbeeld.nl/recept/soep?x=1'), {
    name: 'Pompoensoep',
    url: 'https://voorbeeld.nl/recept/soep',
    servings: 4,
    ingredients: [
      { raw: '1 kg pompoen', name: 'pompoen', amount: '1', unit: 'kg', buyQty: 1 },
      { raw: '2 el olijfolie', name: 'olijfolie', amount: '2', unit: 'el', buyQty: 1 },
    ],
  });
});

test('geeft null terug als de pagina geen recept bevat', () => {
  assert.equal(parseRecipePage('<html><title>Geen recept</title></html>', 'https://voorbeeld.nl'), null);
});
