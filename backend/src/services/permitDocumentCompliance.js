function normalizeDetails(details) {
  return details && typeof details === 'object' && !Array.isArray(details) ? details : {};
}

function uniqueTypes(values) {
  if (!Array.isArray(values)) return [];
  return [...new Set(values.map((value) => String(value).trim().toUpperCase()).filter(Boolean))];
}

function evaluatePermitDocumentCompliance(details) {
  const normalized = normalizeDetails(details);
  const requiredTypes = uniqueTypes(normalized.requiredDocumentTypes);
  const documents = Array.isArray(normalized.documents) ? normalized.documents : [];
  const acceptedTypes = uniqueTypes(documents.filter((document) => document && document.status === 'ACCEPTED').map((document) => document.documentType));
  const pendingTypes = uniqueTypes(documents.filter((document) => document && document.status === 'PENDING').map((document) => document.documentType));
  const rejectedTypes = uniqueTypes(documents.filter((document) => document && document.status === 'REJECTED').map((document) => document.documentType));
  const missingTypes = requiredTypes.filter((type) => !acceptedTypes.includes(type));

  return {
    compliant: missingTypes.length === 0,
    requiredTypes,
    acceptedTypes,
    pendingTypes: pendingTypes.filter((type) => requiredTypes.includes(type)),
    rejectedTypes: rejectedTypes.filter((type) => requiredTypes.includes(type)),
    missingTypes
  };
}

function assertPermitDocumentCompliance(details) {
  const compliance = evaluatePermitDocumentCompliance(details);
  if (!compliance.compliant) {
    const error = new Error('Les pièces justificatives obligatoires ne sont pas toutes acceptées');
    error.code = 'PERMIT_DOCUMENTS_INCOMPLETE';
    error.compliance = compliance;
    throw error;
  }
  return compliance;
}

module.exports = { evaluatePermitDocumentCompliance, assertPermitDocumentCompliance };
