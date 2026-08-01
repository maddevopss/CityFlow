import { describe, expect, it } from 'vitest';
import { createEscalationTelemetry, summarizeEscalationTelemetry } from './telemetry';

describe('citizen escalation telemetry', () => {
  it('journalise, compte et limite les transitions', () => {
    const telemetry = createEscalationTelemetry(2);
    telemetry.record('POLLING_STARTED');
    telemetry.record('RUN_CONFLICT');
    telemetry.record('POLLING_EXPIRED');
    const snapshot = telemetry.snapshot();
    expect(snapshot.events).toHaveLength(2);
    expect(snapshot.counters.RUN_CONFLICT).toBe(1);
  });

  it('résume les conflits, annulations et expirations', () => {
    const summary = summarizeEscalationTelemetry([
      { transition: 'RUN_CONFLICT', at: 'x' },
      { transition: 'RUN_CANCELLED', at: 'x' },
      { transition: 'POLLING_EXPIRED', at: 'x' }
    ]);
    expect(summary).toEqual({ transitions: 3, conflicts: 1, cancelled: 1, expirations: 1 });
  });
});
