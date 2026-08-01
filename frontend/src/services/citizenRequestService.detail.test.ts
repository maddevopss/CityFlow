import { beforeEach, describe, expect, it, vi } from 'vitest';
import api from './api';
import {
  getCitizenRequestTimeline,
  sendCitizenRequestMessage,
  updateCitizenRequestStatus,
} from './citizenRequestService';

vi.mock('./api', () => ({ default: { get: vi.fn(), post: vi.fn() } }));

const mockedApi = vi.mocked(api);

beforeEach(() => vi.clearAllMocks());

describe('citizenRequestService détail municipal', () => {
  it('charge le contrat de chronologie', async () => {
    const payload = { request: { id: 'r1' }, events: [], messages: [] };
    mockedApi.get.mockResolvedValue({ data: payload });

    await expect(getCitizenRequestTimeline('r1')).resolves.toEqual(payload);
    expect(mockedApi.get).toHaveBeenCalledWith('/citizen/requests/r1');
  });

  it('enregistre une résolution nettoyée', async () => {
    mockedApi.post.mockResolvedValue({ data: { id: 'r1', status: 'RESOLVED' } });

    await updateCitizenRequestStatus('r1', 'RESOLVED', '  Réparé  ');
    expect(mockedApi.post).toHaveBeenCalledWith('/citizen/requests/r1/status', {
      status: 'RESOLVED',
      resolution: 'Réparé',
    });
  });

  it('envoie un message nettoyé', async () => {
    mockedApi.post.mockResolvedValue({ data: { id: 'm1', body: 'Bonjour' } });

    await sendCitizenRequestMessage('r1', '  Bonjour  ');
    expect(mockedApi.post).toHaveBeenCalledWith('/citizen/requests/r1/messages', { body: 'Bonjour' });
  });
});
