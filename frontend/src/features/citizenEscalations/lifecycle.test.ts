import { describe, expect, it } from 'vitest';
import { createEscalationLaunchGuard, nextEscalationLifecycleState, shouldPollEscalationHistory } from './lifecycle';

describe('citizen escalation lifecycle', () => {
  it('suspend le sondage si la page est cachée ou hors ligne', () => {
    const initial = { visible: true, online: true, remoteCompleted: false };
    expect(shouldPollEscalationHistory(initial, true)).toBe(true);
    expect(shouldPollEscalationHistory(nextEscalationLifecycleState(initial, 'HIDDEN'), true)).toBe(false);
    expect(shouldPollEscalationHistory(nextEscalationLifecycleState(initial, 'OFFLINE'), true)).toBe(false);
  });

  it('arrête le sondage après une fin reçue d’un autre onglet', () => {
    const state = nextEscalationLifecycleState({ visible: true, online: true, remoteCompleted: false }, 'REMOTE_COMPLETED');
    expect(shouldPollEscalationHistory(state, true)).toBe(false);
  });

  it('empêche les doubles lancements', () => {
    const guard = createEscalationLaunchGuard();
    expect(guard.acquire()).toBe(true);
    expect(guard.acquire()).toBe(false);
    guard.release();
    expect(guard.acquire()).toBe(true);
  });
});
