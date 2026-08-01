export type EscalationMessageKind = 'success' | 'warning' | 'error' | 'loading';

export const escalationAriaRole = (kind: EscalationMessageKind): 'status' | 'alert' =>
  kind === 'error' ? 'alert' : 'status';

export const escalationAriaLive = (kind: EscalationMessageKind): 'polite' | 'assertive' =>
  kind === 'error' ? 'assertive' : 'polite';

export const escalationStatusLabel = (kind: EscalationMessageKind): string => {
  if (kind === 'loading') return 'Traitement en cours';
  if (kind === 'success') return 'Traitement terminé';
  if (kind === 'warning') return 'Attention requise';
  return 'Erreur de traitement';
};

export const escalationFocusTarget = (kind: EscalationMessageKind): 'message' | 'run-button' =>
  kind === 'error' || kind === 'warning' ? 'message' : 'run-button';

export const escalationStatusClassName = (kind: EscalationMessageKind): string => {
  if (kind === 'success') return 'border-green-300 bg-green-50 text-green-950';
  if (kind === 'warning') return 'border-amber-300 bg-amber-50 text-amber-950';
  if (kind === 'error') return 'border-red-300 bg-red-50 text-red-950';
  return 'border-blue-300 bg-blue-50 text-blue-950';
};
