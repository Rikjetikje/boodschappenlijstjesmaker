import test from 'node:test';
import assert from 'node:assert/strict';
import { findBestProductMatch, rankProductMatches } from './productMatching.js';

const products = [
  { id: 'onion', name: 'Uien 1 kg' },
  { id: 'red-onion', name: 'Biologisch Rode Uien 3 Stuks' },
  { id: 'pickled-onion', name: 'Zoetzuur Rode Uienringen 340 g' },
  { id: 'garlic', name: 'Knoflook 100 g' },
  { id: 'naan', name: 'Mini Naan Knoflook Koriander 200 g' },
  { id: 'coriander', name: 'Verstegen Koriander Gemalen 33 g' },
];

test('koppelt een receptomschrijving aan het eenvoudige bestaande product', () => {
  assert.equal(findBestProductMatch('middelgrote uien', products)?.product.id, 'onion');
  assert.equal(findBestProductMatch('tenen knoflook', products)?.product.id, 'garlic');
});

test('houdt betekenisvolle varianten uit elkaar', () => {
  assert.equal(findBestProductMatch('rode uien', products)?.product.id, 'red-onion');
  assert.equal(findBestProductMatch('verse koriander', products), null);
});

test('geeft ook voor twijfelgevallen bruikbare suggesties', () => {
  assert.equal(rankProductMatches('verse koriander', products)[0]?.product.id, 'coriander');
});
