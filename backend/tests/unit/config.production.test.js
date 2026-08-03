/* eslint-env jest */

describe('validation de configuration de production', () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
    jest.resetModules();
  });

  it('refuse une URL Waze absente en production', () => {
    process.env.NODE_ENV = 'production';
    delete process.env.WAZE_CCP_URL;
    process.env.JWT_SECRET = 'j'.repeat(32);
    process.env.PERMIT_WEBHOOK_SECRET = 'p'.repeat(32);

    expect(() => require('../../src/config')).toThrow('WAZE_CCP_URL doit être définie en production');
  });

  it('refuse une URL Waze qui n’est pas HTTP ou HTTPS', () => {
    process.env.NODE_ENV = 'production';
    process.env.WAZE_CCP_URL = 'ftp://waze.example.test/feed';
    process.env.JWT_SECRET = 'j'.repeat(32);
    process.env.PERMIT_WEBHOOK_SECRET = 'p'.repeat(32);

    expect(() => require('../../src/config')).toThrow('WAZE_CCP_URL doit être une URL HTTP ou HTTPS valide en production');
  });

  it('accepte une URL Waze HTTP ou HTTPS en production', () => {
    process.env.NODE_ENV = 'production';
    process.env.WAZE_CCP_URL = 'https://waze.example.test/feed';
    process.env.JWT_SECRET = 'j'.repeat(32);
    process.env.PERMIT_WEBHOOK_SECRET = 'p'.repeat(32);

    expect(require('../../src/config').wazeCcpUrl).toBe(process.env.WAZE_CCP_URL);
  });
});
