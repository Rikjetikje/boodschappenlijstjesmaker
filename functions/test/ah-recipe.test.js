'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  clearAlbertHeijnTokenCache,
  fetchAlbertHeijnRecipe,
  parseAlbertHeijnRecipeId,
} = require('../lib/ah-recipe');

test('herkent korte en volledige AH-receptlinks', () => {
  assert.equal(parseAlbertHeijnRecipeId('https://www.ah.nl/r/1200905'), 1200905);
  assert.equal(parseAlbertHeijnRecipeId('https://ah.nl/allerhande/recept/R-R1200905/vegan-chili'), 1200905);
  assert.equal(parseAlbertHeijnRecipeId('https://voorbeeld.nl/r/1200905'), null);
  assert.equal(parseAlbertHeijnRecipeId('http://www.ah.nl/r/1200905'), null);
});

test('haalt een AH-recept op via de anonieme app-interface', async () => {
  clearAlbertHeijnTokenCache();
  const requests = [];
  const fetchImpl = async (url, options) => {
    requests.push({ url, options });
    if (url.endsWith('/token/anonymous')) {
      return new Response(JSON.stringify({ access_token: 'test-token', expires_in: 3600 }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      });
    }
    return new Response(JSON.stringify({
      data: {
        recipe: {
          id: 1200905,
          title: 'Vegan chili &amp; rijst',
          href: '/allerhande/recept/R-R1200905/vegan-chili-sin-carne',
          servings: { number: 4, type: 'personen' },
          ingredients: [{ text: '1&#189; el picadillo' }, { text: '2 rode paprika\'s' }],
        },
      },
    }), { status: 200, headers: { 'content-type': 'application/json' } });
  };

  const recipe = await fetchAlbertHeijnRecipe('https://www.ah.nl/r/1200905', fetchImpl);

  assert.equal(requests.length, 2);
  assert.equal(requests[1].options.headers.authorization, 'Bearer test-token');
  assert.deepEqual(recipe, {
    name: 'Vegan chili & rijst',
    url: 'https://www.ah.nl/allerhande/recept/R-R1200905/vegan-chili-sin-carne',
    servings: 4,
    ingredients: [
      { raw: '1½ el picadillo', name: 'picadillo', amount: '1,5', unit: 'el', buyQty: 1 },
      { raw: "2 rode paprika's", name: "rode paprika's", amount: '2', unit: 'st', buyQty: 2 },
    ],
  });
});
