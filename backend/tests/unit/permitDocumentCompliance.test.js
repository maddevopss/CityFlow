const { evaluatePermitDocumentCompliance, assertPermitDocumentCompliance } = require('../../src/services/permitDocumentCompliance');

test('considère conforme un permis sans exigence documentaire', () => {
  expect(evaluatePermitDocumentCompliance({})).toEqual({ compliant: true, requiredTypes: [], acceptedTypes: [], pendingTypes: [], rejectedTypes: [], missingTypes: [] });
});

test('normalise les types et détecte les pièces manquantes', () => {
  const result = evaluatePermitDocumentCompliance({
    requiredDocumentTypes: ['plan', 'ASSURANCE', 'plan'],
    documents: [
      { documentType: 'PLAN', status: 'ACCEPTED' },
      { documentType: 'assurance', status: 'PENDING' }
    ]
  });
  expect(result).toMatchObject({ compliant: false, requiredTypes: ['PLAN', 'ASSURANCE'], acceptedTypes: ['PLAN'], pendingTypes: ['ASSURANCE'], missingTypes: ['ASSURANCE'] });
});

test('distingue une pièce obligatoire refusée', () => {
  const result = evaluatePermitDocumentCompliance({ requiredDocumentTypes: ['PLAN'], documents: [{ documentType: 'PLAN', status: 'REJECTED' }] });
  expect(result.rejectedTypes).toEqual(['PLAN']);
  expect(result.compliant).toBe(false);
});

test('accepte toutes les pièces obligatoires approuvées', () => {
  expect(evaluatePermitDocumentCompliance({ requiredDocumentTypes: ['PLAN'], documents: [{ documentType: 'plan', status: 'ACCEPTED' }] }).compliant).toBe(true);
});

test('lève un conflit détaillé lorsque la conformité manque', () => {
  expect(() => assertPermitDocumentCompliance({ requiredDocumentTypes: ['PLAN'] })).toThrow(expect.objectContaining({ code: 'PERMIT_DOCUMENTS_INCOMPLETE' }));
});
