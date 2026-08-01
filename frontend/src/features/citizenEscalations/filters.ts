export type EscalationHistoryFilter = {
  source?: string;
  status?: 'SUCCESS' | 'FAILED';
};

export const filterEscalationRuns = <T extends { source: string; status: 'SUCCESS' | 'FAILED' }>(
  runs: T[],
  filter: EscalationHistoryFilter
): T[] => runs.filter((run) =>
  (!filter.source || run.source === filter.source)
  && (!filter.status || run.status === filter.status)
);
