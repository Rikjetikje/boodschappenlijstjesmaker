import assert from 'node:assert/strict';
import test from 'node:test';
import { formatRecipeNeedAmounts, shoppingRecipeNameIndex } from './shoppingRecipeNeeds.js';

test('vindt namen voor recepten en geplande gerechten op dezelfde boodschappenregel', () => {
  const names = shoppingRecipeNameIndex(
    [{ id: 'r_soup', name: 'Courgettesoep' }],
    [{ id: 'mp_sauce', recipeId: 'r_sauce', recipeSnapshot: { name: 'Pastasaus' } }],
    [{ id: 'legacy', recipeId: 'r_salad', recipeName: 'Salade' }],
  );

  assert.equal(names.get('r_soup'), 'Courgettesoep');
  assert.equal(names.get('mp_sauce'), 'Pastasaus');
  assert.equal(names.get('r_sauce'), 'Pastasaus');
  assert.equal(names.get('legacy'), 'Salade');
  assert.equal(names.get('r_salad'), 'Salade');
});

test('behoudt de receptmaat, ook bij verschillende eenheden en herhaalde hoeveelheden', () => {
  assert.equal(formatRecipeNeedAmounts([{ value: 1, unit: 'st' }]), '1 st');
  assert.equal(formatRecipeNeedAmounts([
    { value: 750, unit: 'g' },
    { value: 0.5, unit: 'kg' },
    { value: 0.25, unit: 'l', times: 2 },
    { valueText: 'naar smaak', times: 2 },
  ]), '1,25 kg + 500 ml + naar smaak × 2');
  assert.equal(formatRecipeNeedAmounts([{ valueText: '', unit: 'st' }]), '');
});
