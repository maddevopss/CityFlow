export type EscalationLifecycleEvent =
  | 'VISIBLE'
  | 'HIDDEN'
  | 'ONLINE'
  | 'OFFLINE'
  | 'REMOTE_COMPLETED';

export interface EscalationLifecycleState {
  visible: boolean;
  online: boolean;
  remoteCompleted: boolean;
}

export const nextEscalationLifecycleState = (
  state: EscalationLifecycleState,
  event: EscalationLifecycleEvent
): EscalationLifecycleState => {
  switch (event) {
    case 'VISIBLE': return { ...state, visible: true };
    case 'HIDDEN': return { ...state, visible: false };
    case 'ONLINE': return { ...state, online: true };
    case 'OFFLINE': return { ...state, online: false };
    case 'REMOTE_COMPLETED': return { ...state, remoteCompleted: true };
  }
};

export const shouldPollEscalationHistory = (
  state: EscalationLifecycleState,
  waitingForCycle: boolean
): boolean => waitingForCycle && state.visible && state.online && !state.remoteCompleted;

export const createEscalationLaunchGuard = () => {
  let pending = false;
  return {
    acquire: () => {
      if (pending) return false;
      pending = true;
      return true;
    },
    release: () => { pending = false; },
    isPending: () => pending
  };
};

export const ESCALATION_CHANNEL = 'cityflow-citizen-escalations';

export const publishEscalationCompleted = (municipalityId?: number) => {
  if (typeof BroadcastChannel === 'undefined') return;
  const channel = new BroadcastChannel(ESCALATION_CHANNEL);
  channel.postMessage({ type: 'COMPLETED', municipalityId, at: Date.now() });
  channel.close();
};
