import api from './api';

export type SyncOperation = {
  idempotencyKey: string;
  inspectionId: string;
  action: 'COMPLETE';
  baseUpdatedAt: string;
  payload: {
    outcome: 'COMPLIANT' | 'NON_COMPLIANT' | 'FOLLOW_UP_REQUIRED';
    findings: string;
    completedAt: string;
  };
};

const STORAGE_KEY = 'cityflow.inspectionSyncQueue';

export function readInspectionSyncQueue(): SyncOperation[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') as SyncOperation[];
  } catch {
    return [];
  }
}

export function enqueueInspectionSync(operation: SyncOperation): void {
  const queue = readInspectionSyncQueue();
  if (!queue.some(item => item.idempotencyKey === operation.idempotencyKey)) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...queue, operation]));
  }
}

export async function flushInspectionSyncQueue() {
  const operations = readInspectionSyncQueue();
  if (operations.length === 0) return { results: [] };
  const { data } = await api.post('/inspection-sync/batch', { operations });
  const applied = new Set<string>(data.results.filter((item: { status: string }) => item.status === 'APPLIED').map((item: { idempotencyKey: string }) => item.idempotencyKey));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(operations.filter(item => !applied.has(item.idempotencyKey))));
  return data;
}
