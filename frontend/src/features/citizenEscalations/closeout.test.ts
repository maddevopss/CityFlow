import { describe, expect, it } from 'vitest';
import { createEscalationLaunchGuard, nextEscalationLifecycleState, shouldPollEscalationHistory } from './lifecycle';
import { estimateProgressPercent, exportEscalationRunsCsv, loadEscalationFilters } from './experience';
import { createEscalationTelemetry } from './telemetry';
import { escalationAriaLive, escalationAriaRole } from './accessibility';

describe('citizen escalation closeout contract', () => {
  it('couvre le parcours robuste complet', () => {
    const guard = createEscalationLaunchGuard();
    expect(guard.acquire()).toBe(true);
    expect(guard.acquire()).toBe(false);

    let state = { visible: true, online: true, remoteCompleted: false };
    state = nextEscalationLifecycleState(state, 'OFFLINE');
    expect(shouldPollEscalationHistory(state, true)).toBe(false);
    state = nextEscalationLifecycleState(state, 'ONLINE');
    expect(shouldPollEscalationHistory(state, true)).toBe(true);
  });

  it('couvre progression, filtres et export', () => {
    expect(estimateProgressPercent(0, 100, 50)).toBe(50);
    expect(loadEscalationFilters({ getItem: () => JSON.stringify({ source: 'MANUAL', status: 'SUCCESS' }) }, 'k')).toEqual({ source: 'MANUAL', status: 'SUCCESS' });
    expect(exportEscalationRunsCsv([{ completedAt: 'x', source: 'MANUAL' }])).toContain('completedAt,source');
  });

  it('couvre observabilité et accessibilité', () => {
    const telemetry = createEscalationTelemetry();
    telemetry.record('RUN_CONFLICT');
    expect(telemetry.snapshot().counters.RUN_CONFLICT).toBe(1);
    expect(escalationAriaRole('error')).toBe('alert');
    expect(escalationAriaLive('warning')).toBe('polite');
  });
});
