export function localDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function dateFromKey(value) {
  const [year, month, day] = String(value || '').split('-').map(Number);
  if (![year, month, day].every(Number.isFinite)) return null;
  return new Date(year, month - 1, day, 12);
}

export function shiftDateKey(value, days) {
  const date = dateFromKey(value) || new Date();
  date.setDate(date.getDate() + days);
  return localDateKey(date);
}

export function mealPlanDateChoices(startDate) {
  return Array.from({ length: 7 }, (_, index) => shiftDateKey(startDate, index));
}

export function dateInMealPlanSchedule(value, startDate) {
  const weekday = dateFromKey(value)?.getDay();
  const startWeekday = dateFromKey(startDate)?.getDay();
  if (!Number.isFinite(weekday) || !Number.isFinite(startWeekday)) return '';
  return shiftDateKey(startDate, (weekday - startWeekday + 7) % 7);
}
