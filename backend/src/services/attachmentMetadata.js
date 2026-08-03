'use strict';

const MAX_ATTACHMENTS = 10;
const MAX_SIZE_BYTES = 25 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'text/plain'
]);

function normalizeAttachment(item) {
  const fileName = String(item?.fileName || '').trim();
  const mimeType = String(item?.mimeType || '').trim().toLowerCase();
  const sizeBytes = Number(item?.sizeBytes);
  const storageKey = String(item?.storageKey || '').trim();

  if (!fileName || fileName.length > 255 || fileName.includes('/') || fileName.includes('\\')) {
    throw new Error('invalid attachment file name');
  }
  if (!ALLOWED_MIME_TYPES.has(mimeType)) throw new Error('invalid attachment mime type');
  if (!Number.isInteger(sizeBytes) || sizeBytes < 1 || sizeBytes > MAX_SIZE_BYTES) {
    throw new Error('invalid attachment size');
  }
  if (!/^municipalities\/\d+\/requests\/[a-f0-9-]{36}\/[A-Za-z0-9._/-]+$/.test(storageKey)) {
    throw new Error('invalid attachment storage key');
  }

  return { fileName, mimeType, sizeBytes, storageKey };
}

function normalizeAttachments(attachments) {
  if (!Array.isArray(attachments)) return [];
  if (attachments.length > MAX_ATTACHMENTS) throw new Error('too many attachments');
  return attachments.map(normalizeAttachment);
}

module.exports = { ALLOWED_MIME_TYPES, MAX_ATTACHMENTS, MAX_SIZE_BYTES, normalizeAttachment, normalizeAttachments };
