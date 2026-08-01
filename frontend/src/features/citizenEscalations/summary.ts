export interface EscalationRunSummaryInput {
  status: 'SUCCESS' | 'FAILED';
  notificationsCreated: number;
  durationMs: number;
}

export const summarizeEscalationRuns = (runs: EscalationRunSummaryInput[]) => {
  const successful = runs.filter((run) => run.status === 'SUCCESS').length;
  const failed = runs.length - successful;
  const notificationsCreated = runs.reduce((total, run) => total + run.notificationsCreated, 0);
  const averageDurationMs = runs.length
    ? Math.round(runs.reduce((total, run) => total + Math.max(0, run.durationMs), 0) / runs.length)
    : 0;

  return { total: runs.length, successful, failed, notificationsCreated, averageDurationMs };
};
