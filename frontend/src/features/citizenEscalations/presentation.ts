export type CitizenEscalationSource = 'SCHEDULED' | 'MANUAL' | string;

export const citizenEscalationSourceLabel = (source: CitizenEscalationSource): string => {
  if (source === 'MANUAL') return 'Manuel';
  if (source === 'SCHEDULED') return 'Planifié';
  return source || 'Inconnue';
};

export const citizenEscalationSourceTone = (source: CitizenEscalationSource): string =>
  source === 'MANUAL'
    ? 'bg-purple-100 text-purple-800'
    : 'bg-blue-100 text-blue-800';
