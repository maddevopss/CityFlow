const { citizenTimeline } = require('../../src/services/citizenPortal');

describe('citizen persistence contract', () => {
  test('expose séparément la demande, les événements et les messages', () => {
    const result = citizenTimeline({
      id: 'request-1',
      title: 'Lampadaire brisé',
      description: 'Le lampadaire ne fonctionne plus.',
      status: 'IN_REVIEW',
      municipalityId: 7,
      citizenId: 'citizen-1',
      events: [{
        id: 'event-1',
        eventType: 'STATUS_CHANGED',
        fromStatus: 'ACKNOWLEDGED',
        toStatus: 'IN_REVIEW',
        metadata: { source: 'agent' },
        createdAt: '2026-08-01T12:00:00Z'
      }],
      messages: [{
        id: 'message-1',
        authorId: 'agent-1',
        body: 'Une équipe analyse la demande.',
        visibility: 'CITIZEN',
        createdAt: '2026-08-01T12:05:00Z'
      }]
    });

    expect(result.request).toMatchObject({ id: 'request-1', status: 'IN_REVIEW' });
    expect(result.request.events).toBeUndefined();
    expect(result.request.messages).toBeUndefined();
    expect(result.events).toEqual([expect.objectContaining({ type: 'STATUS_CHANGED', status: 'IN_REVIEW' })]);
    expect(result.messages).toEqual([expect.objectContaining({ senderId: 'agent-1', body: 'Une équipe analyse la demande.' })]);
  });

  test('ordonne chaque collection et tolère les valeurs absentes', () => {
    const result = citizenTimeline({
      id: 'request-2',
      events: [
        { id: 'late', eventType: 'LATE', createdAt: '2026-08-02T00:00:00Z' },
        null,
        { id: 'early', eventType: 'EARLY', createdAt: '2026-08-01T00:00:00Z' }
      ],
      messages: undefined
    });
    expect(result.events.map(event => event.id)).toEqual(['early', 'late']);
    expect(result.messages).toEqual([]);
  });
});
