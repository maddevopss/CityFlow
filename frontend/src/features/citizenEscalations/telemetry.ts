export type EscalationTransition =
  | 'POLLING_STARTED'
  | 'POLLING_PAUSED_HIDDEN'
  | 'POLLING_PAUSED_OFFLINE'
  | 'POLLING_RESUMED'
  | 'POLLING_COMPLETED'
  | 'POLLING_EXPIRED'
  | 'RUN_CONFLICT'
  | 'RUN_CANCELLED';

export interface EscalationTelemetryEvent {
  transition: EscalationTransition;
  at: string;
  metadata?: Record<string, string | number | boolean | null>;
}

export const createEscalationTelemetry = (limit = 100) => {
  const events: EscalationTelemetryEvent[] = [];
  const counters = new Map<EscalationTransition, number>();

  return {
    record(transition: EscalationTransition, metadata?: EscalationTelemetryEvent['metadata']) {
      events.push({ transition, at: new Date().toISOString(), metadata });
      counters.set(transition, (counters.get(transition) ?? 0) + 1);
      if (events.length > limit) events.splice(0, events.length - limit);
    },
    snapshot() {
      return {
        events: [...events],
        counters: Object.fromEntries(counters.entries()) as Partial<Record<EscalationTransition, number>>
      };
    },
    clear() {
      events.length = 0;
      counters.clear();
    }
  };
};

export const summarizeEscalationTelemetry = (events: EscalationTelemetryEvent[]) => ({
  transitions: events.length,
  conflicts: events.filter((event) => event.transition === 'RUN_CONFLICT').length,
  cancelled: events.filter((event) => event.transition === 'RUN_CANCELLED').length,
  expirations: events.filter((event) => event.transition === 'POLLING_EXPIRED').length
});
