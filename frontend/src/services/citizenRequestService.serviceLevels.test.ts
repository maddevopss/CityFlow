import { beforeEach, describe, expect, it, vi, type MockedFunction } from 'vitest';
import api from './api';
import { getCitizenRequestServiceLevels } from './citizenRequestService';

vi.mock('./api', () => ({ default: { get: vi.fn(), post: vi.fn() } }));

const mockedGet = api.get as MockedFunction<typeof api.get>;

beforeEach(() => vi.clearAllMocks());

describe('niveaux de service citoyens', () => {
  it('charge tous les niveaux avec la limite par défaut', async () => {
    mockedGet.mockResolvedValue({ data: { generatedAt: '2026-08-01T19:00:00Z', summary: {}, items: [] } } as never);

    await getCitizenRequestServiceLevels();

    expect(mockedGet).toHaveBeenCalledWith('/municipal/citizen-requests/service-levels', {
      params: { level: undefined, limit: 100 },
    });
  });

  it('transmet le niveau demandé', async () => {
    mockedGet.mockResolvedValue({ data: { generatedAt: '2026-08-01T19:00:00Z', summary: {}, items: [] } } as never);

    await getCitizenRequestServiceLevels('BREACHED', 25);

    expect(mockedGet).toHaveBeenCalledWith('/municipal/citizen-requests/service-levels', {
      params: { level: 'BREACHED', limit: 25 },
    });
  });
});
