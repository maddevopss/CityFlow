import { beforeEach, describe, expect, it, vi } from 'vitest';
import api from './api';
import { listPermitDocumentRequirements, savePermitDocumentRequirement } from './permitService';

vi.mock('./api', () => ({ default: { get: vi.fn(), put: vi.fn() } }));

beforeEach(() => vi.clearAllMocks());

describe('catalogue documentaire des permis', () => {
  it('charge les exigences municipales', async () => {
    const requirements = [{ id: 'r1', municipalityId: 7, permitSubtype: 'EXCAVATION', requiredDocumentTypes: ['PLAN'], createdAt: '2026-08-01', updatedAt: '2026-08-01' }];
    vi.mocked(api.get).mockResolvedValue({ data: requirements });
    await expect(listPermitDocumentRequirements()).resolves.toEqual(requirements);
    expect(api.get).toHaveBeenCalledWith('/permits/document-requirements');
  });

  it('enregistre ou désactive une exigence', async () => {
    const requirement = { id: 'r1', municipalityId: 7, permitSubtype: 'EXCAVATION', requiredDocumentTypes: [], createdAt: '2026-08-01', updatedAt: '2026-08-01' };
    vi.mocked(api.put).mockResolvedValue({ data: { requirement } });
    await expect(savePermitDocumentRequirement({ permitSubtype: 'EXCAVATION', requiredDocumentTypes: [] })).resolves.toEqual(requirement);
    expect(api.put).toHaveBeenCalledWith('/permits/document-requirements', { permitSubtype: 'EXCAVATION', requiredDocumentTypes: [] });
  });
});
