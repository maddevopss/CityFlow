'use strict';

const {
  DEFAULT_RETENTION_DAYS,
  DEFAULT_RETENTION_INTERVAL_MS,
  getCitizenEscalationRetentionConfig
} = require('../../src/services/citizenEscalationConfig');

describe('citizenEscalationConfig', () => {
  test('retourne les valeurs par défaut sans configuration', () => {
    expect(getCitizenEscalationRetentionConfig({})).toEqual({
      retentionDays: DEFAULT_RETENTION_DAYS,
      intervalMs: DEFAULT_RETENTION_INTERVAL_MS
    });
  });

  test('applique les bornes de sécurité', () => {
    expect(getCitizenEscalationRetentionConfig({
      CITIZEN_ESCALATION_RETENTION_DAYS: '99999',
      CITIZEN_ESCALATION_RETENTION_INTERVAL_MS: '100'
    })).toEqual({ retentionDays: 3650, intervalMs: 60000 });
  });
});
