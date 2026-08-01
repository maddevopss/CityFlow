const {
  normalizeDocumentTypes,
  listPermitDocumentRequirements,
  upsertPermitDocumentRequirement,
  resolveRequiredDocumentTypes
} = require('../../src/services/permitDocumentRequirementCatalog');

test('normalise et déduplique les types de documents', () => {
  expect(normalizeDocumentTypes([' plan ', 'PLAN', '', 'assurance'])).toEqual(['PLAN', 'ASSURANCE']);
  expect(normalizeDocumentTypes(null)).toEqual([]);
});

test('liste le catalogue de la municipalité', async () => {
  const db = { permitDocumentRequirement: { findMany: jest.fn().mockResolvedValue([{ permitSubtype: 'CONSTRUCTION' }]) } };
  await expect(listPermitDocumentRequirements(db, 7)).resolves.toHaveLength(1);
  expect(db.permitDocumentRequirement.findMany).toHaveBeenCalledWith({ where: { municipalityId: 7 }, orderBy: [{ permitSubtype: 'asc' }] });
});

test('crée ou met à jour une exigence normalisée', async () => {
  const db = { permitDocumentRequirement: { upsert: jest.fn().mockResolvedValue({ id: 'r1' }) } };
  await upsertPermitDocumentRequirement(db, { municipalityId: 7, permitSubtype: ' construction ', requiredDocumentTypes: ['plan', 'PLAN'], actorId: 'u1' });
  expect(db.permitDocumentRequirement.upsert).toHaveBeenCalledWith(expect.objectContaining({
    where: { municipalityId_permitSubtype: { municipalityId: 7, permitSubtype: 'CONSTRUCTION' } },
    create: expect.objectContaining({ requiredDocumentTypes: ['PLAN'] }),
    update: expect.objectContaining({ requiredDocumentTypes: ['PLAN'] })
  }));
});

test('préfère le catalogue et utilise le repli lorsqu’il est absent', async () => {
  const db = { permitDocumentRequirement: { findUnique: jest.fn().mockResolvedValueOnce({ requiredDocumentTypes: ['PLAN'] }).mockResolvedValueOnce(null) } };
  await expect(resolveRequiredDocumentTypes(db, { municipalityId: 7, permitSubtype: 'construction', fallback: ['ASSURANCE'] })).resolves.toEqual(['PLAN']);
  await expect(resolveRequiredDocumentTypes(db, { municipalityId: 7, permitSubtype: 'construction', fallback: ['assurance'] })).resolves.toEqual(['ASSURANCE']);
});
