import test from 'node:test';
import assert from 'node:assert/strict';
import { dateFromKey, dateInMealPlanSchedule, mealPlanDateChoices } from './mealPlanDates.js';

test('laat een planning vanaf vrijdag doorlopen via het weekend naar maandag en dinsdag', () => {
  const dates = mealPlanDateChoices('2026-11-27');
  const weekdays = dates.map(date => dateFromKey(date).getDay());

  assert.deepEqual(weekdays, [5, 6, 0, 1, 2, 3, 4]);
});

test('toont een bestaande dinsdag na zondag wanneer de planning op vrijdag begint', () => {
  assert.equal(dateInMealPlanSchedule('2026-11-24', '2026-11-27'), '2026-12-01');
});
