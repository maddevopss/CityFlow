import { describe, expect, it } from 'vitest';
import { availableActions } from './PermitsPage';

describe('availableActions', () => {
  it('permet la soumission aux agents municipaux', () => {
    expect(availableActions('DRAFT', 'MUNICIPAL_AGENT')).toEqual(['submit']);
    expect(availableActions('REJECTED', 'MUNICIPAL_AGENT')).toEqual(['submit']);
  });

  it('réserve approbation et refus aux gestionnaires', () => {
    expect(availableActions('SUBMITTED', 'MANAGER')).toEqual(['approve', 'reject']);
    expect(availableActions('SUBMITTED', 'MUNICIPAL_AGENT')).toEqual([]);
  });

  it('permet la fermeture opérationnelle', () => {
    expect(availableActions('APPROVED', 'MUNICIPAL_AGENT')).toEqual(['close']);
    expect(availableActions('ACTIVE', 'ADMIN')).toEqual(['close']);
  });

  it('ne propose aucune action en lecture seule ou après fermeture', () => {
    expect(availableActions('DRAFT', 'VIEWER')).toEqual([]);
    expect(availableActions('CLOSED', 'ADMIN')).toEqual([]);
  });
});
