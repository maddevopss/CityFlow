const { resolveChannels, buildNotification, scheduleRetry, acknowledgeNotification } = require('../../src/services/notificationCenter');

describe('notificationCenter', () => {
  test('résout les préférences et élimine les canaux invalides', () => {
    expect(resolveChannels('REQUEST_UPDATED', { REQUEST_UPDATED: ['email', 'EMAIL', 'fax'] })).toEqual(['EMAIL']);
    expect(resolveChannels('UNKNOWN', {})).toEqual(['IN_APP']);
    expect(resolveChannels('UNKNOWN', { DEFAULT: ['sms'] })).toEqual(['SMS']);
    expect(resolveChannels('UNKNOWN', { DEFAULT: ['fax'] })).toEqual(['IN_APP']);
    expect(resolveChannels('UNKNOWN', { DEFAULT: 'email' })).toEqual(['EMAIL']);
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

  test('remplace les variables absentes et borne le contenu rendu', () => {
    const notification = buildNotification({
      municipalityId: 7,
      recipientId: 'u1',
      eventType: 'REQUEST_UPDATED',
      template: { subject: `Titre {missing}${'x'.repeat(250)}`, body: `{missing}${'y'.repeat(5100)}` },
      data: null,
      preferences: null
    });

    expect(notification.subject).toHaveLength(200);
    expect(notification.body).toHaveLength(5000);
    expect(notification.channels).toEqual(['IN_APP']);
  });

  test('refuse les entrées et rendus invalides', () => {
    expect(() => buildNotification({})).toThrow('invalid notification input');
    expect(() => buildNotification({ municipalityId: 7, recipientId: 'u1', eventType: 'REQUEST_UPDATED', template: {} }))
      .toThrow('invalid rendered notification');
    expect(() => buildNotification({ municipalityId: 7, recipientId: 'u1', eventType: 'REQUEST_UPDATED', template: { subject: 'Sujet', body: '   ' } }))
      .toThrow('invalid rendered notification');
  });

  test('applique une reprise exponentielle puis abandonne', () => {
    const first = scheduleRetry({ attempts: 0 }, new Date('2026-08-01T00:00:00Z'));
    expect(first.status).toBe('RETRYING');
    expect(first.nextAttemptAt).toBe('2026-08-01T00:02:00.000Z');

    const defaultAttempt = scheduleRetry({}, new Date('2026-08-01T00:00:00Z'));
    expect(defaultAttempt.attempts).toBe(1);

    const fifthAttempt = scheduleRetry({ attempts: 4 }, new Date('2026-08-01T00:00:00Z'));
    expect(fifthAttempt.nextAttemptAt).toBe('2026-08-01T00:32:00.000Z');

    expect(scheduleRetry({ attempts: 5 })).toMatchObject({ attempts: 6, status: 'FAILED', nextAttemptAt: null });
  });

  test('isole la lecture par destinataire et municipalité', () => {
    const notification = { recipientId: 'u1', municipalityId: 7, status: 'SENT' };
    expect(acknowledgeNotification(notification, { id: 'u1', municipalityId: 7 })).toMatchObject({ status: 'READ' });

    expect(() => acknowledgeNotification(notification, { id: 'u2', municipalityId: 7 })).toThrow('notification not found');
    expect(() => acknowledgeNotification(notification, { id: 'u1', municipalityId: 8 })).toThrow('notification not found');
    expect(() => acknowledgeNotification(notification)).toThrow('notification not found');

    try {
      acknowledgeNotification(notification, { id: 'u2', municipalityId: 7 });
    } catch (error) {
      expect(error.status).toBe(404);
    }
  });
});
