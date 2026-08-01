import { describe, expect, it } from 'vitest';
import { parseDocumentTypes } from './PermitDocumentRequirementsPanel';

describe('parseDocumentTypes', () => {
  it('normalise, déduplique et accepte plusieurs séparateurs', () => {
    expect(parseDocumentTypes('plan\n assurance,PLAN;photo ')).toEqual(['PLAN', 'ASSURANCE', 'PHOTO']);
  });

  it('retourne une liste vide pour une désactivation explicite', () => {
    expect(parseDocumentTypes('  \n , ; ')).toEqual([]);
  });
});
