import { describe, expect, it } from 'vitest';
import { averageExpectedDurationMs, estimateProgressPercent, exportEscalationRunsCsv, loadEscalationFilters, nextScheduledRunAt } from './experience';

describe('citizen escalation experience', () => {
  it('calcule une progression plafonnée', () => {
    expect(estimateProgressPercent(0, 1000, 500)).toBe(50);
    expect(estimateProgressPercent(0, 1000, 5000)).toBe(95);
  });

  it('calcule la durée moyenne et la prochaine exécution', () => {
    expect(averageExpectedDurationMs([{ completedAt: 'x', durationMs: 100 }, { completedAt: 'y', durationMs: 300 }])).toBe(200);
    expect(nextScheduledRunAt({ intervalMs: 60_000, now: new Date('2026-08-01T12:00:00Z') })).toBe('2026-08-01T12:01:00.000Z');
  });

  it('tolère des filtres invalides et exporte le CSV', () => {
    expect(loadEscalationFilters({ getItem: () => '{' }, 'k')).toEqual({ source: '', status: '' });
    expect(exportEscalationRunsCsv([{ completedAt: '2026-08-01', status: 'SUCCESS' }])).toContain('"SUCCESS"');
  });
});
