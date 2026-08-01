import { beforeEach, describe, expect, it, vi } from 'vitest';
import api from './api';
import { assessAsset, createAsset, getAssets } from './assetService';
vi.mock('./api', () => ({ default: { get: vi.fn(), post: vi.fn() } }));
const get = vi.mocked(api.get); const post = vi.mocked(api.post);
describe('assetService', () => {
  beforeEach(() => vi.clearAllMocks());
  it('transmet les filtres du registre', async () => { get.mockResolvedValue({ data: { items: [], pagination: { page: 1, pageSize: 25, total: 0, totalPages: 0 } } }); await getAssets({ category: 'BUILDING', criticality: 'CRITICAL', page: 2 }); expect(get).toHaveBeenCalledWith('/assets', { params: { category: 'BUILDING', criticality: 'CRITICAL', page: 2 } }); });
  it('crée et évalue un actif', async () => { post.mockResolvedValue({ data: { id: 'asset-1' } }); const input = { publicCode: 'BLD-001', name: 'Hôtel de ville', category: 'BUILDING' as const }; await createAsset(input); await assessAsset('asset-1', { condition: 'GOOD', score: 85 }); expect(post).toHaveBeenNthCalledWith(1, '/assets', input); expect(post).toHaveBeenNthCalledWith(2, '/assets/asset-1/assessments', { condition: 'GOOD', score: 85 }); });
});
