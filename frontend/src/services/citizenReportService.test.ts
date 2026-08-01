import { beforeEach, describe, expect, it, vi } from 'vitest';
import api from './api';
import { createPublicCitizenReport, getCitizenReports, trackPublicCitizenReport, transitionCitizenReport } from './citizenReportService';
vi.mock('./api', () => ({ default: { get: vi.fn(), post: vi.fn() } }));
const get = vi.mocked(api.get); const post = vi.mocked(api.post);
describe('citizenReportService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it('crée un signalement public', async () => { const input = { municipalityId: 7, category: 'ROAD' as const, title: 'Nid-de-poule', description: 'Trou important' }; post.mockResolvedValue({ data: { publicNumber: 'REQ-7-0000001', trackingToken: 'secret' } }); await createPublicCitizenReport(input); expect(post).toHaveBeenCalledWith('/citizen-reports/public', input); });
  it('utilise le jeton de suivi dans l’en-tête', async () => { get.mockResolvedValue({ data: { status: 'RECEIVED' } }); await trackPublicCitizenReport('REQ-7-0000001', 'secret'); expect(get).toHaveBeenCalledWith('/citizen-reports/public/REQ-7-0000001', { headers: { 'x-cityflow-tracking-token': 'secret' } }); });
  it('liste et fait progresser un signalement', async () => { get.mockResolvedValue({ data: { items: [], pagination: { page: 1, pageSize: 25, total: 0, totalPages: 0 } } }); post.mockResolvedValue({ data: { id: 'report-1' } }); await getCitizenReports({ status: 'TRIAGED' }); await transitionCitizenReport('report-1', { status: 'IN_PROGRESS', reason: 'Intervention démarrée' }); expect(post).toHaveBeenCalledWith('/citizen-reports/report-1/transition', { status: 'IN_PROGRESS', reason: 'Intervention démarrée' }); });
});
