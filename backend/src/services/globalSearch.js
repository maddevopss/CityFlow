'use strict';

const SEARCHABLE_MODULES = new Set(['REPORTS', 'PERMITS', 'INSPECTIONS', 'WORKS', 'ASSETS', 'CITIZENS']);

function normalizeQuery(value) {
  return String(value || '').trim().toLocaleLowerCase('fr-CA').replace(/\s+/g, ' ');
}

function tokenize(value) {
  return normalizeQuery(value).split(' ').filter((token) => token.length >= 2).slice(0, 10);
}

function scoreDocument(document, tokens) {
  const title = normalizeQuery(document.title);
  const body = normalizeQuery(document.body);
  const reference = normalizeQuery(document.reference);
  return tokens.reduce((score, token) => {
    if (reference === token) return score + 50;
    if (reference.includes(token)) score += 20;
    if (title.startsWith(token)) score += 15;
    else if (title.includes(token)) score += 10;
    if (body.includes(token)) score += 3;
    return score;
  }, 0);
}

function searchGlobal({ municipalityId, query, modules, documents, limit = 20 }) {
  if (!Number.isInteger(municipalityId)) throw new Error('municipalityId required');
  const tokens = tokenize(query);
  if (!tokens.length) return [];
  const selected = (modules?.length ? modules : [...SEARCHABLE_MODULES]).map((module) => String(module).toUpperCase());
  if (selected.some((module) => !SEARCHABLE_MODULES.has(module))) throw new Error('invalid module');
  return (documents || [])
    .filter((document) => document.municipalityId === municipalityId && selected.includes(String(document.module).toUpperCase()))
    .map((document) => ({ ...document, score: scoreDocument(document, tokens) }))
    .filter((document) => document.score > 0)
    .sort((a, b) => b.score - a.score || String(a.id).localeCompare(String(b.id)))
    .slice(0, Math.min(Math.max(Number(limit) || 20, 1), 100));
}

function sanitizeSearchResult(result) {
  const { municipalityId, privateNotes, internalMetadata, ...safe } = result;
  return safe;
}

module.exports = { SEARCHABLE_MODULES, normalizeQuery, tokenize, scoreDocument, searchGlobal, sanitizeSearchResult };
