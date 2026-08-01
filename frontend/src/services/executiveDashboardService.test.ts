import { beforeEach, describe, expect, it, vi } from 'vitest';
import api from './api';
import { getExecutiveDashboard } from './executiveDashboardService';
vi.mock('./api', () => ({ default: { get: vi.fn() } }));
const get = vi.mocked(api.get);
describe('executiveDashboardService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it('transmet la période sélectionnée', async () => { get.mockResolvedValue({ data: { modules: {} } }); await getExecutiveDashboard({ from: '2026-08-01T00:00:00.000Z', to: '2026-08-31T23:59:59.000Z' }); expect(get).toHaveBeenCalledWith('/executive-dashboard', { params: { from: '2026-08-01T00:00:00.000Z', to: '2026-08-31T23:59:59.000Z' } }); });
});
