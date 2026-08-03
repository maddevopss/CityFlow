const { normalizeAttachment, normalizeAttachments } = require('../../src/services/attachmentMetadata');

const valid = {
  fileName: 'preuve.pdf',
  mimeType: 'application/pdf',
  sizeBytes: 1024,
  storageKey: 'municipalities/7/requests/11111111-1111-4111-8111-111111111111/preuve.pdf'
};

describe('attachmentMetadata', () => {
  test('normalise les métadonnées autorisées', () => {
    expect(normalizeAttachment({ ...valid, mimeType: 'APPLICATION/PDF' })).toEqual(valid);
  });

  test('refuse les chemins de fichier et clés hors municipalité', () => {
    expect(() => normalizeAttachment({ ...valid, fileName: '../secret.txt' })).toThrow('file name');
    expect(() => normalizeAttachment({ ...valid, storageKey: 'shared/secret.pdf' })).toThrow('storage key');
  });

  test('refuse les MIME ou tailles non autorisés', () => {
    expect(() => normalizeAttachment({ ...valid, mimeType: 'application/javascript' })).toThrow('mime type');
    expect(() => normalizeAttachment({ ...valid, sizeBytes: 0 })).toThrow('size');
  });

  test('limite le nombre de pièces jointes', () => {
    expect(() => normalizeAttachments(Array.from({ length: 11 }, () => valid))).toThrow('too many');
  });
});
