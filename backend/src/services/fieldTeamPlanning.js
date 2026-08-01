'use strict';

function normalizeSkills(skills) {
  return new Set((skills || []).map((skill) => String(skill).trim().toUpperCase()).filter(Boolean));
}

function scoreCandidate(task, candidate) {
  if (!task || !candidate) return Number.NEGATIVE_INFINITY;
  if (task.municipalityId !== candidate.municipalityId || candidate.isActive === false) return Number.NEGATIVE_INFINITY;
  const required = normalizeSkills(task.requiredSkills);
  const available = normalizeSkills(candidate.skills);
  const missing = [...required].filter((skill) => !available.has(skill));
  if (missing.length) return Number.NEGATIVE_INFINITY;

  let score = 100;
  score -= Math.max(0, Number(candidate.activeAssignments || 0)) * 10;
  if (task.sector && candidate.sectors?.includes(task.sector)) score += 20;
  if (task.priority === 'CRITICAL') score += Math.max(0, 20 - Number(candidate.criticalAssignments || 0) * 10);
  if (Number.isFinite(candidate.distanceKm)) score -= Math.min(candidate.distanceKm, 50);
  if (candidate.availableFrom && task.scheduledAt) {
    const availableAt = new Date(candidate.availableFrom).getTime();
    const scheduledAt = new Date(task.scheduledAt).getTime();
    if (availableAt > scheduledAt) score -= 40;
  }
  return score;
}

function rankCandidates(task, candidates) {
  return (candidates || [])
    .map((candidate) => ({ candidate, score: scoreCandidate(task, candidate) }))
    .filter((entry) => Number.isFinite(entry.score))
    .sort((a, b) => b.score - a.score || String(a.candidate.id).localeCompare(String(b.candidate.id)));
}

function assignBestCandidate(task, candidates) {
  const ranked = rankCandidates(task, candidates);
  if (!ranked.length) {
    const error = new Error('no eligible candidate');
    error.status = 409;
    throw error;
  }
  return {
    taskId: task.id,
    assigneeId: ranked[0].candidate.id,
    score: ranked[0].score,
    considered: ranked.length,
    assignedAt: new Date().toISOString()
  };
}

module.exports = { scoreCandidate, rankCandidates, assignBestCandidate };
