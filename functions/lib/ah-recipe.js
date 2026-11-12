'use strict';

const { parseIngredientLine, plainText } = require('./recipe-parser');

const AH_API_URL = 'https://api.ah.nl';
const AH_WEB_URL = 'https://www.ah.nl';
const AH_HEADERS = {
  accept: 'application/json',
  'content-type': 'application/json',
  'user-agent': 'Appie/9.48 (iPhone17,3; iPhone; CPU OS 26_1 like Mac OS X)',
  'x-application': 'AHWEBSHOP',
  'x-client-name': 'appie-ios',
  'x-client-version': '9.48',
};

let cachedToken;
let tokenRequest;

function parseAlbertHeijnRecipeId(value) {
  let url;
  try {
    url = new URL(value);
  } catch {
    return null;
  }
  if (url.protocol !== 'https:' || !['ah.nl', 'www.ah.nl'].includes(url.hostname.toLowerCase())) return null;
  const shortLink = url.pathname.match(/^\/r\/(\d+)\/?$/i);
  const recipeLink = url.pathname.match(/^\/allerhande\/recept\/R-R(\d+)(?:\/|$)/i);
  const id = Number(shortLink?.[1] || recipeLink?.[1]);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

async function requestAnonymousToken(fetchImpl, signal) {
  const response = await fetchImpl(`${AH_API_URL}/mobile-auth/v1/auth/token/anonymous`, {
    method: 'POST',
    redirect: 'error',
    signal,
    headers: AH_HEADERS,
    body: JSON.stringify({ clientId: 'appie-ios' }),
  });
  if (!response.ok) throw new Error('fetch-failed');
  const data = await response.json();
  if (!data?.access_token) throw new Error('fetch-failed');
  const lifetimeSeconds = Math.max(60, Number(data.expires_in) || 900);
  cachedToken = {
    value: data.access_token,
    expiresAt: Date.now() + Math.max(30, lifetimeSeconds - 60) * 1000,
  };
  return cachedToken.value;
}

async function getAnonymousToken(fetchImpl, signal) {
  if (cachedToken?.expiresAt > Date.now()) return cachedToken.value;
  if (!tokenRequest) {
    tokenRequest = requestAnonymousToken(fetchImpl, signal).finally(() => {
      tokenRequest = undefined;
    });
  }
  return tokenRequest;
}

function canonicalRecipeUrl(recipe, id) {
  const href = String(recipe?.href || '');
  if (href.startsWith('/allerhande/recept/')) return new URL(href, AH_WEB_URL).href;
  return `${AH_WEB_URL}/allerhande/recept/R-R${id}`;
}

async function fetchAlbertHeijnRecipe(value, fetchImpl = fetch) {
  const id = parseAlbertHeijnRecipeId(value);
  if (!id) return null;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  try {
    const token = await getAnonymousToken(fetchImpl, controller.signal);
    const query = `query Recipe($id: Int!) {
      recipe(id: $id) {
        id title href
        servings { number type }
        ingredients { text }
      }
    }`;
    const response = await fetchImpl(`${AH_API_URL}/graphql`, {
      method: 'POST',
      redirect: 'error',
      signal: controller.signal,
      headers: { ...AH_HEADERS, authorization: `Bearer ${token}` },
      body: JSON.stringify({ query, variables: { id } }),
    });
    if (!response.ok) throw new Error(response.status === 404 ? 'not-found' : 'fetch-failed');
    const data = await response.json();
    if (data?.errors?.length && !data?.data?.recipe) throw new Error('fetch-failed');
    const recipe = data?.data?.recipe;
    if (!recipe) throw new Error('not-found');

    const ingredients = (Array.isArray(recipe.ingredients) ? recipe.ingredients : [])
      .map(ingredient => parseIngredientLine(ingredient?.text))
      .filter(ingredient => ingredient.name);
    if (!ingredients.length) throw new Error('not-found');

    const servings = Number(recipe.servings?.number);
    return {
      name: plainText(recipe.title) || 'Geïmporteerd recept',
      url: canonicalRecipeUrl(recipe, id),
      servings: Number.isFinite(servings) ? Math.max(1, Math.min(99, servings)) : null,
      ingredients,
    };
  } finally {
    clearTimeout(timeout);
  }
}

function clearAlbertHeijnTokenCache() {
  cachedToken = undefined;
  tokenRequest = undefined;
}

module.exports = {
  clearAlbertHeijnTokenCache,
  fetchAlbertHeijnRecipe,
  parseAlbertHeijnRecipeId,
};
