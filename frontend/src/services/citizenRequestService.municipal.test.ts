import { beforeEach, describe, expect, it, vi } from 'vitest';
import api from './api';
import {
  bulkAssignCitizenRequests,
  getMunicipalCitizenRequestSummary,
  getMunicipalCitizenRequests,
} from './citizenRequestService';

vi.mock('./api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

const mockedGet = vi.mocked(api.get);
const mockedPost = vi.mocked(api.post);

beforeEach(() => vi.clearAllMocks());

describe('citizenRequestService municipal', () => {
  it('charge le résumé municipal', async () => {
    mockedGet.mockResolvedValueOnce({ data: { total: 3, byStatus: {}, unassigned: 2, overdue: 1 } });

    await getMunicipalCitizenRequestSummary();

    expect(mockedGet).toHaveBeenCalledWith('/municipal/citizen-requests/summary');
  });

  it('transmet les filtres de la file municipale', async () => {
    const filters = { status: 'IN_REVIEW' as const, unassigned: true, page: 2, pageSize: 25 };
    mockedGet.mockResolvedValueOnce({ data: { items: [], pagination: { page: 2, pageSize: 25, total: 0, totalPages: 0 } } });

    await getMunicipalCitizenRequests(filters);

    expect(mockedGet).toHaveBeenCalledWith('/municipal/citizen-requests', { params: filters });
  });

  it('affecte plusieurs demandes à une équipe normalisée', async () => {
    mockedPost.mockResolvedValueOnce({ data: { updated: 2, team: 'Voirie', requestIds: ['r1', 'r2'] } });

    await bulkAssignCitizenRequests(['r1', 'r2'], '  Voirie  ');

    expect(mockedPost).toHaveBeenCalledWith('/municipal/citizen-requests/bulk-assign', {
      requestIds: ['r1', 'r2'],
      team: 'Voirie',
    });
  });
});
