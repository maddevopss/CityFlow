// Date utility functions to avoid duplication across services

/**
 * Add days to a date
 * @param {Date} date - Base date
 * @param {number} days - Number of days to add
 * @returns {Date} New date with days added
 */
function addDays(date, days) {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}

/**
 * Subtract days from a date
 * @param {Date} date - Base date
 * @param {number} days - Number of days to subtract
 * @returns {Date} New date with days subtracted
 */
function subtractDays(date, days) {
  return addDays(date, -days);
}

/**
 * Get start of day (00:00:00 UTC)
 * @param {Date} date - Input date
 * @returns {Date} Start of day
 */
function startOfDay(date) {
  const result = new Date(date);
  result.setUTCHours(0, 0, 0, 0);
  return result;
}

/**
 * Get end of day (23:59:59.999 UTC)
 * @param {Date} date - Input date
 * @returns {Date} End of day
 */
function endOfDay(date) {
  const result = new Date(date);
  result.setUTCHours(23, 59, 59, 999);
  return result;
}

/**
 * Get start of week (Monday 00:00:00 UTC)
 * @param {Date} date - Input date
 * @returns {Date} Start of week
 */
function startOfWeek(date) {
  const result = new Date(date);
  const day = result.getUTCDay();
  const diff = result.getUTCDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  result.setUTCDate(diff);
  result.setUTCHours(0, 0, 0, 0);
  return result;
}

/**
 * Get date N days in the future
 * @param {number} days - Number of days from now
 * @param {Date} now - Reference date (defaults to now)
 * @returns {Date} Date N days in future
 */
function daysFromNow(days, now = new Date()) {
  return addDays(now, days);
}

/**
 * Check if date is in past
 * @param {Date} date - Date to check
 * @param {Date} now - Reference date (defaults to now)
 * @returns {boolean} True if date is in past
 */
function isPast(date, now = new Date()) {
  return date < now;
}

/**
 * Check if date is in future
 * @param {Date} date - Date to check
 * @param {Date} now - Reference date (defaults to now)
 * @returns {boolean} True if date is in future
 */
function isFuture(date, now = new Date()) {
  return date > now;
}

module.exports = {
  addDays,
  subtractDays,
  startOfDay,
  endOfDay,
  startOfWeek,
  daysFromNow,
  isPast,
  isFuture
};
