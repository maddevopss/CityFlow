import { beforeEach, describe, expect, it, vi } from 'vitest';
import api from './api';
import { getCitizenEscalationHistory } from './citizenRequestService';

vi.mock('./api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn()
  }
}));

const mockedGet = vi.mocked(api.get);

describe('getCitizenEscalationHistory', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('transmet la limite au point d’accès municipal', async () => {
    const payload = {
      limit: 10,
      items: [{
        id: '1',
        source: 'SCHEDULED',
        status: 'SUCCESS' as const,
        scanned: 12,
        candidates: 2,
        notificationsCreated: 4,
        durationMs: 125,
        errorMessage: null,
        startedAt: '2026-08-01T12:00:00Z',
        completedAt: '2026-08-01T12:00:00.125Z'
      }]
    };
    mockedGet.mockResolvedValue({ data: payload } as never);

    await expect(getCitizenEscalationHistory(10)).resolves.toEqual(payload);
    expect(mockedGet).toHaveBeenCalledWith(
      '/municipal/citizen-requests/escalations/history',
      { params: { limit: 10 } }
    );
  });
});
