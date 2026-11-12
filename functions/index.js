'use strict';

const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { setGlobalOptions } = require('firebase-functions/v2');
const { HttpsError, onCall } = require('firebase-functions/v2/https');
const { fetchAlbertHeijnRecipe, parseAlbertHeijnRecipeId } = require('./lib/ah-recipe');
const { parseRecipePage } = require('./lib/recipe-parser');
const { fetchRecipePage } = require('./lib/safe-fetch');

initializeApp();
setGlobalOptions({ region: 'europe-west1', maxInstances: 5 });

function importError(error) {
  if (error instanceof HttpsError) return error;
  if (error?.name === 'AbortError') return new HttpsError('deadline-exceeded', 'De receptsite reageerde niet op tijd.');
  const messages = {
    'invalid-url': ['invalid-argument', 'Vul een geldige openbare http- of https-link in.'],
    'unsafe-url': ['invalid-argument', 'Deze link kan om veiligheidsredenen niet worden opgehaald.'],
    'page-too-large': ['resource-exhausted', 'De receptpagina is te groot om te importeren.'],
    'not-found': ['not-found', 'De receptpagina is niet gevonden.'],
    'not-html': ['failed-precondition', 'Deze link verwijst niet naar een webpagina.'],
    'too-many-redirects': ['failed-precondition', 'De receptsite verwijst te vaak door.'],
    'fetch-failed': ['unavailable', 'De receptsite kon niet worden opgehaald.'],
  };
  const [code, message] = messages[error?.message] || ['internal', 'Het recept kon niet worden geïmporteerd.'];
  return new HttpsError(code, message);
}

exports.importRecipe = onCall({ timeoutSeconds: 15, memory: '256MiB' }, async request => {
  if (!request.auth?.uid) throw new HttpsError('unauthenticated', 'Log eerst in om een recept te importeren.');
  const householdId = String(request.data?.householdId || '').trim();
  const rawUrl = String(request.data?.url || '').trim();
  if (!householdId || householdId.length > 160) throw new HttpsError('invalid-argument', 'Huishouden ontbreekt.');
  if (!rawUrl || rawUrl.length > 2048) throw new HttpsError('invalid-argument', 'Vul een geldige receptlink in.');

  const membership = await getFirestore().doc(`households/${householdId}/members/${request.auth.uid}`).get();
  if (!membership.exists) throw new HttpsError('permission-denied', 'Je hebt geen toegang tot dit huishouden.');

  try {
    if (parseAlbertHeijnRecipeId(rawUrl)) {
      return await fetchAlbertHeijnRecipe(rawUrl);
    }
    const { html, finalUrl } = await fetchRecipePage(rawUrl);
    const recipe = parseRecipePage(html, finalUrl);
    if (!recipe) {
      throw new HttpsError('not-found', 'Op deze pagina zijn geen leesbare receptingrediënten gevonden.');
    }
    return recipe;
  } catch (error) {
    let hostname = 'ongeldig';
    try {
      hostname = new URL(rawUrl).hostname;
    } catch {
      // De foutmelding hieronder handelt een ongeldige URL af.
    }
    console.warn('Receptimport mislukt', { hostname, reason: error?.message || error?.name });
    throw importError(error);
  }
});
