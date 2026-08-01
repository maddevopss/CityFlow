const { resolveChannels, buildNotification, scheduleRetry, acknowledgeNotification } = require('../../src/services/notificationCenter');

describe('notificationCenter', () => {
  test('résout les préférences et élimine les canaux invalides', () => {
    expect(resolveChannels('REQUEST_UPDATED', { REQUEST_UPDATED: ['email', 'EMAIL', 'fax'] })).toEqual(['EMAIL']);
    expect(resolveChannels('UNKNOWN', {})).toEqual(['IN_APP']);
  });

  test('rend un modèle de notification', () => {
    const notification = buildNotification({
      municipalityId: 7,
      recipientId: 'u1',
      eventType: 'REQUEST_UPDATED',
      template: { subject: 'Demande {reference}', body: 'Votre demande est {status}.' },
      data: { reference: 'CF-42', status: 'traitée' },
      preferences: { REQUEST_UPDATED: ['IN_APP', 'EMAIL'] }
    });
    expect(notification).toMatchObject({ subject: 'Demande CF-42', body: 'Votre demande est traitée.', status: 'PENDING' });
  });

  test('applique une reprise exponentielle puis abandonne', () => {
    const first = scheduleRetry({ attempts: 0 }, new Date('2026-08-01T00:00:00Z'));
    expect(first.status).toBe('RETRYING');
    expect(first.nextAttemptAt).toBe('2026-08-01T00:02:00.000Z');
    expect(scheduleRetry({ attempts: 5 }).status).toBe('FAILED');
  });

  test('isole la lecture par destinataire et municipalité', () => {
    const notification = { recipientId: 'u1', municipalityId: 7, status: 'SENT' };
    expect(acknowledgeNotification(notification, { id: 'u1', municipalityId: 7 }).status).toBe('READ');
    expect(() => acknowledgeNotification(notification, { id: 'u2', municipalityId: 7 })).toThrow('notification not found');
  });
});
