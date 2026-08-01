import { beforeEach, describe, expect, it, vi } from 'vitest';
import api from './api';
import { getPermitDetail, listPermits } from './permitService';

vi.mock('./api', () => ({
  default: { get: vi.fn() }
}));

const mockedGet = vi.mocked(api.get);

beforeEach(() => {
  mockedGet.mockReset();
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
});
