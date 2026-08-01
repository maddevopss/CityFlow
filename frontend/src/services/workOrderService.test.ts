import { beforeEach, describe, expect, it, vi } from 'vitest';
import api from './api';
import { createWorkOrder, getWorkOrders, startWorkOrder } from './workOrderService';
vi.mock('./api', () => ({ default: { get: vi.fn(), post: vi.fn() } }));
const get = vi.mocked(api.get); const post = vi.mocked(api.post);
describe('workOrderService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it('transmet les filtres de travaux', async () => { get.mockResolvedValue({ data: { items: [], pagination: { page: 1, pageSize: 25, total: 0, totalPages: 0 } } }); await getWorkOrders({ page: 2, status: 'ASSIGNED', priority: 'URGENT' }); expect(get).toHaveBeenCalledWith('/work-orders', { params: { page: 2, status: 'ASSIGNED', priority: 'URGENT' } }); });
  it('crée et démarre un ordre', async () => { const input = { title: 'Réparer conduite', description: 'Fuite importante', workType: 'CORRECTIVE' as const }; post.mockResolvedValue({ data: { id: 'work-1' } }); await createWorkOrder(input); await startWorkOrder('work-1'); expect(post).toHaveBeenNthCalledWith(1, '/work-orders', input); expect(post).toHaveBeenNthCalledWith(2, '/work-orders/work-1/start'); });
});
