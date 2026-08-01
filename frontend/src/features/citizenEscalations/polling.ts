export interface EscalationRunIdentity {
  id: string;
}

export const latestEscalationRunId = (runs: EscalationRunIdentity[]): string | null =>
  runs[0]?.id ?? null;

export const hasNewEscalationRun = (
  previousLatestId: string | null,
  runs: EscalationRunIdentity[]
): boolean => {
  const currentLatestId = latestEscalationRunId(runs);
  return currentLatestId !== null && currentLatestId !== previousLatestId;
};
