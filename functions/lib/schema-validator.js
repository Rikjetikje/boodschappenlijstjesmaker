'use strict';

const { parseIngredientLine, plainText } = require('./recipe-parser');
const { assertSafeUrl, readLimitedText } = require('./safe-fetch');

const VALIDATOR_URL = 'https://validator.schema.org/validate';

function isRecipeType(node) {
  return (node?.types || []).some(type => String(type?.value || '').split(/[\/#]/).pop().toLowerCase() === 'recipe');
}

function propertyValues(node, name) {
  return (node?.properties || [])
    .filter(property => property?.pred === name && property?.value != null)
    .map(property => plainText(property.value))
    .filter(Boolean);
}

function parseServings(values) {
  const match = String(values?.[0] || '').match(/\d+/);
  if (!match) return null;
  return Math.max(1, Math.min(99, Number(match[0])));
}

function parseValidatorRecipe(rawText, sourceUrl) {
  let data;
  try {
    data = JSON.parse(String(rawText || '').replace(/^\)\]\}'\s*/, ''));
  } catch {
    return null;
  }
  const recipes = (data?.tripleGroups || [])
    .flatMap(group => group?.nodes || [])
    .filter(isRecipeType)
    .sort((a, b) => propertyValues(b, 'recipeIngredient').length - propertyValues(a, 'recipeIngredient').length);
  const recipe = recipes[0];
  if (!recipe) return null;

  const ingredients = propertyValues(recipe, 'recipeIngredient')
    .map(parseIngredientLine)
    .filter(ingredient => ingredient.name);
  if (!ingredients.length) return null;

  return {
    name: propertyValues(recipe, 'name')[0] || 'Geïmporteerd recept',
    url: sourceUrl,
    servings: parseServings(propertyValues(recipe, 'recipeYield')),
    ingredients,
  };
}

async function fetchValidatorRecipe(value, fetchImpl = fetch) {
  const sourceUrl = await assertSafeUrl(value);
  sourceUrl.hash = '';
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);
  try {
    const response = await fetchImpl(VALIDATOR_URL, {
      method: 'POST',
      redirect: 'error',
      signal: controller.signal,
      headers: {
        accept: 'application/json',
        'content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
        'user-agent': 'Boodschappenlijstjesmaker/1.0 (recipe importer)',
      },
      body: new URLSearchParams({ url: sourceUrl.href }).toString(),
    });
    if (!response.ok) throw new Error('validator-unavailable');
    const recipe = parseValidatorRecipe(await readLimitedText(response), sourceUrl.href);
    if (!recipe) throw new Error('unreadable-recipe');
    return recipe;
  } finally {
    clearTimeout(timeout);
  }
}

module.exports = { fetchValidatorRecipe, parseValidatorRecipe };
