import { expect, test, vi } from 'vitest';
import api from './api';
import { waivePermitFee } from './permitService';

vi.mock('./api');
const mockedApi = vi.mocked(api);

test('envoie le motif de dispense au permis ciblé', async () => {
  const fee = { id: 'f1', municipalityId: 7, permitId: 'p1', amountCents: 12500, currency: 'CAD', status: 'WAIVED' as const, assessedAt: '2026-08-01T00:00:00Z', waivedReason: 'Dispense municipale documentée', createdAt: '2026-08-01T00:00:00Z', updatedAt: '2026-08-01T00:00:00Z' };
  mockedApi.post.mockResolvedValue({ data: { fee } });

  await expect(waivePermitFee('p1', { reason: 'Dispense municipale documentée' })).resolves.toEqual(fee);
  expect(mockedApi.post).toHaveBeenCalledWith('/permits/p1/fees/waive', { reason: 'Dispense municipale documentée' });
});
