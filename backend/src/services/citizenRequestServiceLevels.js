'use strict';

const DEFAULT_TARGET_HOURS = 168;
const TARGET_HOURS_BY_CATEGORY = Object.freeze({
  SAFETY: 4,
  WATER: 24,
  ROAD: 48,
  LIGHTING: 72,
  WASTE: 72,
  PARKS: 120,
  OTHER: DEFAULT_TARGET_HOURS
});
const TERMINAL_STATUSES = new Set(['RESOLVED', 'CLOSED']);

function targetHoursForCategory(category) {
  return TARGET_HOURS_BY_CATEGORY[String(category || 'OTHER').toUpperCase()] || DEFAULT_TARGET_HOURS;
}

function evaluateCitizenRequestServiceLevel(request, now = new Date()) {
  const createdAt = new Date(request.createdAt);
  const targetHours = targetHoursForCategory(request.category);
  const deadlineAt = new Date(createdAt.getTime() + targetHours * 60 * 60 * 1000);
  const completed = TERMINAL_STATUSES.has(request.status);
  const remainingMs = deadlineAt.getTime() - now.getTime();
  const elapsedHours = Math.max(0, (now.getTime() - createdAt.getTime()) / (60 * 60 * 1000));

  let level = 'ON_TRACK';
  if (completed) level = 'COMPLETED';
  else if (remainingMs < 0) level = 'BREACHED';
  else if (remainingMs <= 24 * 60 * 60 * 1000) level = 'AT_RISK';

  return {
    ...request,
    serviceLevel: {
      level,
      targetHours,
      elapsedHours: Number(elapsedHours.toFixed(1)),
      deadlineAt: deadlineAt.toISOString(),
      hoursRemaining: Number((remainingMs / (60 * 60 * 1000)).toFixed(1))
    }
  };
}

function summarizeCitizenRequestServiceLevels(requests, now = new Date()) {
  const items = requests.map((request) => evaluateCitizenRequestServiceLevel(request, now));
  const summary = { ON_TRACK: 0, AT_RISK: 0, BREACHED: 0, COMPLETED: 0 };
  for (const request of items) summary[request.serviceLevel.level] += 1;
  return { summary, items };
}

module.exports = {
  DEFAULT_TARGET_HOURS,
  TARGET_HOURS_BY_CATEGORY,
  targetHoursForCategory,
  evaluateCitizenRequestServiceLevel,
  summarizeCitizenRequestServiceLevels
};
