import { describe, expect, it } from 'vitest';
import { citizenRequestDetailPath } from './citizenRequestService';

describe('citizenRequestDetailPath', () => {
  it('construit le chemin municipal vers la fiche détaillée', () => {
    expect(citizenRequestDetailPath('33333333-3333-4333-8333-333333333333'))
      .toBe('/municipal/citizen-requests/33333333-3333-4333-8333-333333333333');
  });

  it('encode un identifiant avant de le placer dans le chemin', () => {
    expect(citizenRequestDetailPath('demande avec espace'))
      .toBe('/municipal/citizen-requests/demande%20avec%20espace');
  });
});
