import { beforeEach, describe, expect, it, vi } from 'vitest';
import api from './api';
import {
  assignCitizenRequest,
  createCitizenRequest,
  getCitizenRequestTimeline,
  getNotifications,
  updateCitizenRequestStatus
} from './citizenRequestService';

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

describe('citizenRequestService', () => {
  it('crée une demande citoyenne', async () => {
    const input = {
      title: 'Lampadaire brisé',
      description: 'Le lampadaire devant le 100 rue Principale ne fonctionne plus.'
    };
    mockedPost.mockResolvedValueOnce({ data: { id: 'request-1' } });

    await createCitizenRequest(input);

    expect(mockedPost).toHaveBeenCalledWith('/citizen-requests', input);
  });

  it('charge la chronologie d’une demande', async () => {
    mockedGet.mockResolvedValueOnce({ data: { request: { id: 'request-1' }, events: [], messages: [] } });

    await getCitizenRequestTimeline('request-1');

    expect(mockedGet).toHaveBeenCalledWith('/citizen-requests/request-1');
  });

  it('affecte une demande à une équipe', async () => {
    mockedPost.mockResolvedValueOnce({ data: { id: 'request-1' } });

    await assignCitizenRequest('request-1', 'Voirie');

    expect(mockedPost).toHaveBeenCalledWith('/citizen-requests/request-1/assign', { team: 'Voirie' });
  });

  it('met à jour le statut sans résolution inutile', async () => {
    mockedPost.mockResolvedValueOnce({ data: { id: 'request-1' } });

    await updateCitizenRequestStatus('request-1', 'IN_PROGRESS');

    expect(mockedPost).toHaveBeenCalledWith('/citizen-requests/request-1/status', {
      status: 'IN_PROGRESS'
    });
  });

  it('inclut la résolution lorsqu’elle est fournie', async () => {
    mockedPost.mockResolvedValueOnce({ data: { id: 'request-1' } });

    await updateCitizenRequestStatus('request-1', 'RESOLVED', 'Lampadaire remplacé.');

    expect(mockedPost).toHaveBeenCalledWith('/citizen-requests/request-1/status', {
      status: 'RESOLVED',
      resolution: 'Lampadaire remplacé.'
    });
  });

  it('liste les notifications avec filtres', async () => {
    const filters = { status: 'PENDING' as const, page: 2, pageSize: 10 };
    mockedGet.mockResolvedValueOnce({ data: { items: [], pagination: { page: 2, pageSize: 10, total: 0, totalPages: 0 } } });

    await getNotifications(filters);

    expect(mockedGet).toHaveBeenCalledWith('/notifications', { params: filters });
  });
});
