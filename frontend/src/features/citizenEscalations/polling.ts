export interface EscalationRunIdentity {
  id: string;
}

export const DEFAULT_ESCALATION_POLLING_TIMEOUT_MS = 2 * 60 * 1000;

export const latestEscalationRunId = (runs: EscalationRunIdentity[]): string | null =>
  runs[0]?.id ?? null;

export const hasNewEscalationRun = (
  previousLatestId: string | null,
  runs: EscalationRunIdentity[]
): boolean => {
  const currentLatestId = latestEscalationRunId(runs);
  return currentLatestId !== null && currentLatestId !== previousLatestId;
};

export const hasEscalationPollingExpired = (
  startedAt: number | null,
  now: number,
  timeoutMs = DEFAULT_ESCALATION_POLLING_TIMEOUT_MS
): boolean => startedAt !== null && now - startedAt >= timeoutMs;
