import { isValidWaiverReason } from './PermitFeesPanel';

describe('motif de dispense', () => {
  test('refuse un motif trop court', () => expect(isValidWaiverReason('court')).toBe(false));
  test('accepte un motif documenté', () => expect(isValidWaiverReason('Dispense approuvée selon la politique municipale.')).toBe(true));
  test('refuse un motif de plus de 1000 caractères', () => expect(isValidWaiverReason('x'.repeat(1001))).toBe(false));
});
