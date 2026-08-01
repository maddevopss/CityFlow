'use strict';

const crypto = require('crypto');

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf'
]);
const MAX_SIZE_BYTES = 25 * 1024 * 1024;

function sanitizeFileName(value) {
  return String(value || 'preuve')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9._-]/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 120);
}

function validateUploadMetadata(input = {}) {
  const fileName = sanitizeFileName(input.fileName);
  const mimeType = String(input.mimeType || '').toLowerCase();
  const sizeBytes = Number(input.sizeBytes);
  if (!ALLOWED_MIME_TYPES.has(mimeType)) throw Object.assign(new Error('Type de fichier interdit'), { statusCode: 400 });
  if (!Number.isInteger(sizeBytes) || sizeBytes < 1 || sizeBytes > MAX_SIZE_BYTES) throw Object.assign(new Error('Taille de fichier invalide'), { statusCode: 400 });
  return { fileName, mimeType, sizeBytes };
}

function createUploadGrant(input, context, now = new Date()) {
  const metadata = validateUploadMetadata(input);
  if (!context?.userId || !context?.municipalityId || !context?.requestId) throw Object.assign(new Error('Contexte incomplet'), { statusCode: 400 });
  const expiresAt = new Date(now.getTime() + 10 * 60 * 1000);
  const nonce = crypto.randomUUID();
  const storageKey = `municipalities/${context.municipalityId}/citizen-requests/${context.requestId}/${nonce}-${metadata.fileName}`;
  const payload = JSON.stringify({ storageKey, userId: context.userId, municipalityId: context.municipalityId, requestId: context.requestId, expiresAt: expiresAt.toISOString() });
  const secret = process.env.UPLOAD_GRANT_SECRET || process.env.JWT_SECRET;
  if (!secret) throw Object.assign(new Error('Secret de téléversement absent'), { statusCode: 500 });
  const signature = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  return { ...metadata, storageKey, expiresAt: expiresAt.toISOString(), grant: Buffer.from(payload).toString('base64url') + '.' + signature };
}

function verifyUploadGrant(grant, context, now = new Date()) {
  const [encoded, signature] = String(grant || '').split('.');
  if (!encoded || !signature) throw Object.assign(new Error('Autorisation invalide'), { statusCode: 400 });
  const payloadText = Buffer.from(encoded, 'base64url').toString('utf8');
  const secret = process.env.UPLOAD_GRANT_SECRET || process.env.JWT_SECRET;
  if (!secret) throw Object.assign(new Error('Secret de téléversement absent'), { statusCode: 500 });
  const expected = crypto.createHmac('sha256', secret).update(payloadText).digest('hex');
  const valid = signature.length === expected.length && crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  if (!valid) throw Object.assign(new Error('Autorisation invalide'), { statusCode: 403 });
  const payload = JSON.parse(payloadText);
  if (new Date(payload.expiresAt) <= now) throw Object.assign(new Error('Autorisation expirée'), { statusCode: 410 });
  if (payload.userId !== context.userId || payload.municipalityId !== context.municipalityId || payload.requestId !== context.requestId) throw Object.assign(new Error('Autorisation hors contexte'), { statusCode: 403 });
  return payload;
}

module.exports = { ALLOWED_MIME_TYPES, MAX_SIZE_BYTES, sanitizeFileName, validateUploadMetadata, createUploadGrant, verifyUploadGrant };
