import { beforeEach, describe, expect, it, vi } from 'vitest';
import api from './api';
import {
  completeInspection,
  createInspection,
  getInspectionById,
  getInspections
} from './inspectionService';

vi.mock('./api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn()
  }
}));

const mockedApi = vi.mocked(api);

beforeEach(() => {
  vi.clearAllMocks();
});

describe('inspectionService', () => {
  it('liste les inspections avec un filtre de statut', async () => {
    mockedApi.get.mockResolvedValueOnce({ data: [] });

    await getInspections('SCHEDULED');

    expect(mockedApi.get).toHaveBeenCalledWith('/inspections', {
      params: { status: 'SCHEDULED' }
    });
  });

  it('charge une inspection par identifiant', async () => {
    mockedApi.get.mockResolvedValueOnce({ data: { id: 'inspection-1' } });

    await getInspectionById('inspection-1');

    expect(mockedApi.get).toHaveBeenCalledWith('/inspections/inspection-1');
  });

  it('planifie une inspection', async () => {
    const input = {
      scheduledAt: '2026-08-02T14:00:00.000Z',
      address: '100 rue Principale',
      inspectionType: 'FINAL' as const
    };
    mockedApi.post.mockResolvedValueOnce({ data: input });

    await createInspection(input);

    expect(mockedApi.post).toHaveBeenCalledWith('/inspections', input);
  });

  it('termine une inspection', async () => {
    const input = {
      outcome: 'COMPLIANT' as const,
      findings: 'Travaux conformes.'
    };
    mockedApi.post.mockResolvedValueOnce({ data: input });

    await completeInspection('inspection-1', input);

    expect(mockedApi.post).toHaveBeenCalledWith('/inspections/inspection-1/complete', input);
  });
});
