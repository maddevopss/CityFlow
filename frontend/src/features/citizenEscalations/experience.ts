export interface EscalationRunExperienceInput {
  completedAt: string;
  durationMs: number;
}

export interface EscalationScheduleInput {
  intervalMs: number;
  now?: Date;
}

export const estimateProgressPercent = (startedAt: number, expectedDurationMs: number, now = Date.now()): number => {
  if (expectedDurationMs <= 0) return 0;
  return Math.min(95, Math.max(0, Math.round(((now - startedAt) / expectedDurationMs) * 100)));
};

export const averageExpectedDurationMs = (runs: EscalationRunExperienceInput[]): number => {
  if (!runs.length) return 0;
  return Math.round(runs.reduce((sum, run) => sum + Math.max(0, run.durationMs), 0) / runs.length);
};

export const nextScheduledRunAt = ({ intervalMs, now = new Date() }: EscalationScheduleInput): string =>
  new Date(now.getTime() + Math.max(0, intervalMs)).toISOString();

export const loadEscalationFilters = (storage: Pick<Storage, 'getItem'>, key: string) => {
  try {
    const parsed = JSON.parse(storage.getItem(key) || '{}');
    return { source: typeof parsed.source === 'string' ? parsed.source : '', status: typeof parsed.status === 'string' ? parsed.status : '' };
  } catch {
    return { source: '', status: '' };
  }
};

export const saveEscalationFilters = (storage: Pick<Storage, 'setItem'>, key: string, filters: { source: string; status: string }) =>
  storage.setItem(key, JSON.stringify(filters));

const csvEscape = (value: unknown) => `"${String(value ?? '').replaceAll('"', '""')}"`;

export const exportEscalationRunsCsv = (runs: Array<Record<string, unknown>>): string => {
  const headers = ['completedAt', 'source', 'status', 'scanned', 'candidates', 'notificationsCreated', 'durationMs', 'errorMessage'];
  return [headers.join(','), ...runs.map((run) => headers.map((header) => csvEscape(run[header])).join(','))].join('\n');
};
