import { beforeEach, describe, expect, it, vi, type MockedFunction } from 'vitest';
import api from './api';
import {
  getCitizenRequestTimeline,
  sendCitizenRequestMessage,
  updateCitizenRequestStatus,
} from './citizenRequestService';

vi.mock('./api', () => ({ default: { get: vi.fn(), post: vi.fn() } }));

const mockedGet = api.get as MockedFunction<typeof api.get>;
const mockedPost = api.post as MockedFunction<typeof api.post>;

beforeEach(() => vi.clearAllMocks());

describe('citizenRequestService détail municipal', () => {
  it('charge le contrat de chronologie', async () => {
    const payload = { request: { id: 'r1' }, events: [], messages: [] };
    mockedGet.mockResolvedValue({ data: payload } as never);

    await expect(getCitizenRequestTimeline('r1')).resolves.toEqual(payload);
    expect(mockedGet).toHaveBeenCalledWith('/citizen/requests/r1');
  });

  it('enregistre une résolution nettoyée', async () => {
    mockedPost.mockResolvedValue({ data: { id: 'r1', status: 'RESOLVED' } } as never);

    await updateCitizenRequestStatus('r1', 'RESOLVED', '  Réparé  ');
    expect(mockedPost).toHaveBeenCalledWith('/citizen/requests/r1/status', {
      status: 'RESOLVED',
      resolution: 'Réparé',
    });
  });

  it('envoie un message nettoyé', async () => {
    mockedPost.mockResolvedValue({ data: { id: 'm1', body: 'Bonjour' } } as never);

    await sendCitizenRequestMessage('r1', '  Bonjour  ');
    expect(mockedPost).toHaveBeenCalledWith('/citizen/requests/r1/messages', { body: 'Bonjour' });
  });
});
