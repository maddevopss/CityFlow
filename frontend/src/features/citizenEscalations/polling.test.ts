import { describe, expect, it } from 'vitest';
import {
  DEFAULT_ESCALATION_POLLING_TIMEOUT_MS,
  hasEscalationPollingExpired,
  hasNewEscalationRun,
  latestEscalationRunId
} from './polling';

describe('citizen escalation polling', () => {
  it('retourne le cycle le plus récent', () => {
    expect(latestEscalationRunId([{ id: 'run-2' }, { id: 'run-1' }])).toBe('run-2');
    expect(latestEscalationRunId([])).toBeNull();
  });

  it('détecte uniquement un nouvel enregistrement', () => {
    expect(hasNewEscalationRun('run-1', [{ id: 'run-2' }])).toBe(true);
    expect(hasNewEscalationRun('run-1', [{ id: 'run-1' }])).toBe(false);
    expect(hasNewEscalationRun(null, [])).toBe(false);
  });

  it('expire uniquement après la limite configurée', () => {
    const startedAt = 1_000;
    expect(hasEscalationPollingExpired(null, startedAt + DEFAULT_ESCALATION_POLLING_TIMEOUT_MS)).toBe(false);
    expect(hasEscalationPollingExpired(startedAt, startedAt + DEFAULT_ESCALATION_POLLING_TIMEOUT_MS - 1)).toBe(false);
    expect(hasEscalationPollingExpired(startedAt, startedAt + DEFAULT_ESCALATION_POLLING_TIMEOUT_MS)).toBe(true);
  });
});
