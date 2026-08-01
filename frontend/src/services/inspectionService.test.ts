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

const mockedGet = vi.mocked(api.get);
const mockedPost = vi.mocked(api.post);

beforeEach(() => {
  vi.clearAllMocks();
});

describe('inspectionService', () => {
  it('liste les inspections avec un filtre de statut', async () => {
    mockedGet.mockResolvedValueOnce({ data: [] });

    await getInspections('SCHEDULED');

    expect(mockedGet).toHaveBeenCalledWith('/inspections', {
      params: { status: 'SCHEDULED' }
    });
  });

  it('charge une inspection par identifiant', async () => {
    mockedGet.mockResolvedValueOnce({ data: { id: 'inspection-1' } });

    await getInspectionById('inspection-1');

    expect(mockedGet).toHaveBeenCalledWith('/inspections/inspection-1');
  });

  it('planifie une inspection', async () => {
    const input = {
      scheduledAt: '2026-08-02T14:00:00.000Z',
      address: '100 rue Principale',
      inspectionType: 'FINAL' as const
    };
    mockedPost.mockResolvedValueOnce({ data: input });

    await createInspection(input);

    expect(mockedPost).toHaveBeenCalledWith('/inspections', input);
  });

  it('termine une inspection', async () => {
    const input = {
      outcome: 'COMPLIANT' as const,
      findings: 'Travaux conformes.'
    };
    mockedPost.mockResolvedValueOnce({ data: input });

    await completeInspection('inspection-1', input);

    expect(mockedPost).toHaveBeenCalledWith('/inspections/inspection-1/complete', input);
  });
});
