const {
  MAX_SIZE_BYTES,
  sanitizeFileName,
  validateUploadMetadata,
  createUploadGrant,
  verifyUploadGrant
} = require('../../src/services/citizenUploadSecurity');

describe('citizenUploadSecurity', () => {
  const originalUploadSecret = process.env.UPLOAD_GRANT_SECRET;
  const originalJwtSecret = process.env.JWT_SECRET;

  beforeEach(() => {
    process.env.UPLOAD_GRANT_SECRET = 'upload-secret-at-least-32-characters';
    delete process.env.JWT_SECRET;
  });

  afterAll(() => {
    if (originalUploadSecret === undefined) delete process.env.UPLOAD_GRANT_SECRET;
    else process.env.UPLOAD_GRANT_SECRET = originalUploadSecret;
    if (originalJwtSecret === undefined) delete process.env.JWT_SECRET;
    else process.env.JWT_SECRET = originalJwtSecret;
  });

  test('normalise les noms et valide les métadonnées autorisées', () => {
    expect(sanitizeFileName('  preuve été (finale).PDF  ')).toBe('-preuve-ete-finale-.PDF-');
    expect(sanitizeFileName('')).toBe('preuve');
    expect(sanitizeFileName('x'.repeat(140))).toHaveLength(120);
    expect(validateUploadMetadata({ fileName: 'photo été.jpg', mimeType: 'IMAGE/JPEG', sizeBytes: 2048 }))
      .toEqual({ fileName: 'photo-ete.jpg', mimeType: 'image/jpeg', sizeBytes: 2048 });
  });

  test('refuse les types et tailles invalides', () => {
    expect(() => validateUploadMetadata({ mimeType: 'text/html', sizeBytes: 1 })).toThrow('Type de fichier interdit');
    expect(() => validateUploadMetadata({ mimeType: 'image/png', sizeBytes: 0 })).toThrow('Taille de fichier invalide');
    expect(() => validateUploadMetadata({ mimeType: 'application/pdf', sizeBytes: MAX_SIZE_BYTES + 1 })).toThrow('Taille de fichier invalide');
  });

  test('crée et vérifie une autorisation isolée par contexte', () => {
    const now = new Date('2026-08-01T12:00:00.000Z');
    const context = { userId: 'citizen-1', municipalityId: 7, requestId: 'request-1' };
    const grant = createUploadGrant({ fileName: 'preuve.pdf', mimeType: 'application/pdf', sizeBytes: 4096 }, context, now);
    expect(grant.storageKey).toContain('municipalities/7/citizen-requests/request-1/');
    expect(grant.expiresAt).toBe('2026-08-01T12:10:00.000Z');
    expect(verifyUploadGrant(grant.grant, context, new Date('2026-08-01T12:09:59.000Z'))).toMatchObject(context);
  });

  test('refuse les autorisations invalides, expirées et hors contexte', () => {
    const now = new Date('2026-08-01T12:00:00.000Z');
    const context = { userId: 'citizen-1', municipalityId: 7, requestId: 'request-1' };
    const grant = createUploadGrant({ fileName: 'preuve.jpg', mimeType: 'image/jpeg', sizeBytes: 128 }, context, now);
    expect(() => verifyUploadGrant('', context, now)).toThrow('Autorisation invalide');
    expect(() => verifyUploadGrant(grant.grant, context, new Date('2026-08-01T12:10:00.000Z'))).toThrow('Autorisation expirée');
    expect(() => verifyUploadGrant(grant.grant, { ...context, userId: 'citizen-2' }, now)).toThrow('Autorisation hors contexte');
  });
});
