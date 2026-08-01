import { beforeEach, describe, expect, it, vi } from 'vitest';
import api from './api';
import { assessPermitFee, getPermitFee, markPermitFeePaid } from './permitService';

vi.mock('./api', () => ({ default: { get: vi.fn(), put: vi.fn(), post: vi.fn() } }));

beforeEach(() => vi.clearAllMocks());

const fee = { id: 'f1', municipalityId: 7, permitId: '33333333-3333-4333-8333-333333333333', amountCents: 12500, currency: 'CAD', status: 'DUE' as const, assessedAt: '2026-08-01', createdAt: '2026-08-01', updatedAt: '2026-08-01' };

describe('frais et paiements des permis', () => {
  it('charge le frais courant', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: { fee } });
    await expect(getPermitFee(fee.permitId)).resolves.toEqual(fee);
    expect(api.get).toHaveBeenCalledWith(`/permits/${fee.permitId}/fees`);
  });

  it('enregistre une évaluation en cents', async () => {
    vi.mocked(api.put).mockResolvedValue({ data: { fee } });
    const input = { amountCents: 12500, currency: 'CAD', note: 'Occupation du domaine public' };
    await expect(assessPermitFee(fee.permitId, input)).resolves.toEqual(fee);
    expect(api.put).toHaveBeenCalledWith(`/permits/${fee.permitId}/fees`, input);
  });

  it('constate le paiement avec une référence externe', async () => {
    const paid = { ...fee, status: 'PAID' as const, paymentReference: 'RECU-2026-0001' };
    vi.mocked(api.post).mockResolvedValue({ data: { fee: paid } });
    await expect(markPermitFeePaid(fee.permitId, { paymentReference: 'RECU-2026-0001' })).resolves.toEqual(paid);
    expect(api.post).toHaveBeenCalledWith(`/permits/${fee.permitId}/fees/mark-paid`, { paymentReference: 'RECU-2026-0001' });
  });
});
