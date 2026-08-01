import { beforeEach, describe, expect, it, vi } from 'vitest';
import api from './api';
import { enqueueInspectionSync, flushInspectionSyncQueue, readInspectionSyncQueue } from './inspectionSyncQueue';

vi.mock('./api', () => ({ default: { post: vi.fn() } }));

const operation = {
  idempotencyKey: 'offline-operation-001',
  inspectionId: '33333333-3333-4333-8333-333333333333',
  action: 'COMPLETE' as const,
  baseUpdatedAt: '2026-08-01T12:00:00.000Z',
  payload: { outcome: 'COMPLIANT' as const, findings: 'Conforme', completedAt: '2026-08-01T13:00:00.000Z' }
};

describe('inspectionSyncQueue', () => {
  beforeEach(() => { localStorage.clear(); vi.clearAllMocks(); });

  it('évite les doublons par clé idempotente', () => {
    enqueueInspectionSync(operation);
    enqueueInspectionSync(operation);
    expect(readInspectionSyncQueue()).toHaveLength(1);
  });

  it('retire les opérations appliquées', async () => {
    enqueueInspectionSync(operation);
    vi.mocked(api.post).mockResolvedValue({ data: { results: [{ idempotencyKey: operation.idempotencyKey, status: 'APPLIED' }] } });
    await flushInspectionSyncQueue();
    expect(readInspectionSyncQueue()).toEqual([]);
  });
});
