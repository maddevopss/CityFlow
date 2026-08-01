function normalizeDocumentTypes(types) {
  if (!Array.isArray(types)) return [];
  return [...new Set(types.map((value) => String(value).trim().toUpperCase()).filter(Boolean))];
}

async function listPermitDocumentRequirements(db, municipalityId) {
  return db.permitDocumentRequirement.findMany({
    where: { municipalityId },
    orderBy: [{ permitSubtype: 'asc' }]
  });
}

async function upsertPermitDocumentRequirement(db, { municipalityId, permitSubtype, requiredDocumentTypes, actorId }) {
  const normalizedSubtype = permitSubtype.trim().toUpperCase();
  const normalizedTypes = normalizeDocumentTypes(requiredDocumentTypes);
  return db.permitDocumentRequirement.upsert({
    where: { municipalityId_permitSubtype: { municipalityId, permitSubtype: normalizedSubtype } },
    create: {
      municipalityId,
      permitSubtype: normalizedSubtype,
      requiredDocumentTypes: normalizedTypes,
      updatedBy: actorId
    },
    update: {
      requiredDocumentTypes: normalizedTypes,
      updatedBy: actorId
    }
  });
}

async function resolveRequiredDocumentTypes(db, { municipalityId, permitSubtype, fallback = [] }) {
  const requirement = await db.permitDocumentRequirement.findUnique({
    where: {
      municipalityId_permitSubtype: {
        municipalityId,
        permitSubtype: String(permitSubtype || '').trim().toUpperCase()
      }
    }
  });
  return requirement ? normalizeDocumentTypes(requirement.requiredDocumentTypes) : normalizeDocumentTypes(fallback);
}

module.exports = {
  normalizeDocumentTypes,
  listPermitDocumentRequirements,
  upsertPermitDocumentRequirement,
  resolveRequiredDocumentTypes
};
