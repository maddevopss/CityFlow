import { beforeEach, describe, expect, it, vi } from 'vitest';
import api from './api';
import { addPermitDocument, getPermitDetail, listPermitDocuments, listPermits, reviewPermitDocument, transitionPermit } from './permitService';

vi.mock('./api', () => ({ default: { get: vi.fn(), post: vi.fn() } }));
const mockedGet = vi.mocked(api.get);
const mockedPost = vi.mocked(api.post);
beforeEach(() => { mockedGet.mockReset(); mockedPost.mockReset(); });

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
  it('liste et ajoute les pièces justificatives', async () => {
    mockedGet.mockResolvedValue({ data: [{ id: 'doc-1', status: 'PENDING' }] });
    await listPermitDocuments('permit-1');
    expect(mockedGet).toHaveBeenCalledWith('/permits/permit-1/documents');
    const input = { documentType: 'PLAN', fileName: 'plan.pdf', mimeType: 'application/pdf', sizeBytes: 100, storageKey: 'permits/plan.pdf', sha256: 'a'.repeat(64) };
    mockedPost.mockResolvedValue({ data: { document: { id: 'doc-1', ...input, status: 'PENDING' } } });
    const result = await addPermitDocument('permit-1', input);
    expect(mockedPost).toHaveBeenCalledWith('/permits/permit-1/documents', input);
    expect(result.status).toBe('PENDING');
  });
  it('transmet la décision et le motif de révision', async () => {
    mockedPost.mockResolvedValue({ data: { document: { id: 'doc-1', status: 'REJECTED' } } });
    await reviewPermitDocument('permit-1', 'doc-1', 'REJECTED', 'Plan illisible');
    expect(mockedPost).toHaveBeenCalledWith('/permits/permit-1/documents/doc-1/review', { status: 'REJECTED', reason: 'Plan illisible' });
  });
});
