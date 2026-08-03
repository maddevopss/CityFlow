const {
  INSPECTION_TYPES,
  INSPECTION_STATUSES,
  INSPECTION_OUTCOMES
} = require('../../src/domain/inspectionVocabulary');

describe('inspection vocabulary', () => {
  test('exposes the approved inspection types', () => {
    expect(INSPECTION_TYPES).toEqual(['PRE_WORK', 'IN_PROGRESS', 'FINAL', 'COMPLAINT']);
  });

  test('exposes the approved statuses and outcomes', () => {
    expect(INSPECTION_STATUSES).toEqual(['SCHEDULED', 'COMPLETED', 'CANCELLED']);
    expect(INSPECTION_OUTCOMES).toEqual(['COMPLIANT', 'NON_COMPLIANT', 'FOLLOW_UP_REQUIRED']);
  });

  test('prevents vocabulary mutation', () => {
    expect(() => INSPECTION_TYPES.push('UNKNOWN')).toThrow(TypeError);
  });
});
