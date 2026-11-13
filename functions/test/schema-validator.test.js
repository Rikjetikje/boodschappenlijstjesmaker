'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { parseValidatorRecipe } = require('../lib/schema-validator');

test('leest een recept uit het resultaat van de Schema.org-validator', () => {
  const response = `)]}'
  ${JSON.stringify({
    tripleGroups: [{
      nodes: [{
        types: [{ value: 'Recipe' }],
        properties: [
          { pred: 'name', value: 'Vegan wraps' },
          { pred: 'recipeYield', value: '4 personen' },
          { pred: 'recipeIngredient', value: '100 g plantaardige yoghurt' },
          { pred: 'recipeIngredient', value: '½ courgette' },
        ],
      }],
    }],
  })}`;

  assert.deepEqual(parseValidatorRecipe(response, 'https://voorbeeld.nl/vegan-wraps'), {
    name: 'Vegan wraps',
    url: 'https://voorbeeld.nl/vegan-wraps',
    servings: 4,
    ingredients: [
      { raw: '100 g plantaardige yoghurt', name: 'plantaardige yoghurt', amount: '100', unit: 'g', buyQty: 1 },
      { raw: '½ courgette', name: 'courgette', amount: '0,5', unit: 'st', buyQty: 1 },
    ],
  });
});

test('geeft null terug zonder Recipe-gegevens', () => {
  assert.equal(parseValidatorRecipe(JSON.stringify({ tripleGroups: [] }), 'https://voorbeeld.nl'), null);
});
