import { beforeEach, describe, expect, it, vi } from 'vitest';
import api from './api';
import { getPermitDetail, listPermits, transitionPermit } from './permitService';

vi.mock('./api', () => ({
  default: { get: vi.fn(), post: vi.fn() }
}));

const mockedGet = vi.mocked(api.get);
const mockedPost = vi.mocked(api.post);

beforeEach(() => {
  mockedGet.mockReset();
  mockedPost.mockReset();
});

describe('permitService', () => {
  it('liste les permis avec les filtres', async () => {
    mockedGet.mockResolvedValue({ data: { items: [], pagination: { page: 2, pageSize: 10, total: 0, totalPages: 1 } } });

    const result = await listPermits({ status: 'DRAFT', q: 'PERMIT', page: 2, pageSize: 10 });

    expect(mockedGet).toHaveBeenCalledWith('/permits', { params: { status: 'DRAFT', q: 'PERMIT', page: 2, pageSize: 10 } });
    expect(result.pagination.page).toBe(2);
  });

  it('charge le détail d’un permis', async () => {
    mockedGet.mockResolvedValue({ data: { permit: { id: 'permit-1' }, history: [], inspections: [] } });

    const result = await getPermitDetail('permit-1');

    expect(mockedGet).toHaveBeenCalledWith('/permits/permit-1');
    expect(result.permit.id).toBe('permit-1');
  });

  it('soumet un permis sans charge utile inutile', async () => {
    mockedPost.mockResolvedValue({ data: { permit: { id: 'permit-1', status: 'SUBMITTED' } } });

    const result = await transitionPermit('permit-1', 'submit');

    expect(mockedPost).toHaveBeenCalledWith('/permits/permit-1/submit', undefined);
    expect(result.status).toBe('SUBMITTED');
  });

  it('transmet le motif lors d’un refus', async () => {
    mockedPost.mockResolvedValue({ data: { permit: { id: 'permit-1', status: 'REJECTED' } } });

    await transitionPermit('permit-1', 'reject', 'Documents incomplets');

    expect(mockedPost).toHaveBeenCalledWith('/permits/permit-1/reject', { reason: 'Documents incomplets' });
  });
});
