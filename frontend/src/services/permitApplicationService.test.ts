import { beforeEach, describe, expect, it, vi } from 'vitest';
import api from './api';
import { createPermitApplication, getPermitApplications, submitPermitApplication } from './permitApplicationService';

vi.mock('./api', () => ({ default: { get: vi.fn(), post: vi.fn() } }));
const get = vi.mocked(api.get);
const post = vi.mocked(api.post);

describe('permitApplicationService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('transmet les filtres paginés', async () => {
    get.mockResolvedValue({ data: { items: [], pagination: { page: 1, pageSize: 25, total: 0, totalPages: 0 } } });
    await getPermitApplications({ page: 2, status: 'SUBMITTED', q: 'PER-7' });
    expect(get).toHaveBeenCalledWith('/permit-applications', { params: { page: 2, status: 'SUBMITTED', q: 'PER-7' } });
  });

  it('crée puis soumet une demande', async () => {
    const input = { applicantName: 'Entreprise ABC', applicantEmail: 'a@example.com', permitType: 'CONSTRUCTION', address: '100 rue A', description: 'Travaux' };
    post.mockResolvedValue({ data: { id: 'permit-1' } });
    await createPermitApplication(input);
    await submitPermitApplication('permit-1');
    expect(post).toHaveBeenNthCalledWith(1, '/permit-applications', input);
    expect(post).toHaveBeenNthCalledWith(2, '/permit-applications/permit-1/submit');
  });
});
