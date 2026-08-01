import { describe, expect, it } from 'vitest';
import { centsFromInput, formatMoney } from './PermitFeesPanel';

describe('PermitFeesPanel', () => {
  it('convertit les dollars en cents sans erreur flottante', () => {
    expect(centsFromInput('125.50')).toBe(12550);
    expect(centsFromInput('125,50')).toBe(12550);
    expect(centsFromInput('0')).toBe(0);
  });

  it('refuse les montants ambigus ou négatifs', () => {
    expect(centsFromInput('-1')).toBeNull();
    expect(centsFromInput('12.345')).toBeNull();
    expect(centsFromInput('abc')).toBeNull();
  });

  it('formate le montant dans la devise déclarée', () => {
    expect(formatMoney(12550, 'CAD')).toContain('125,50');
  });
});
