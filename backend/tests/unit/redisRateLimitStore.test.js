const RedisRateLimitStore = require('../../src/api/middleware/redisRateLimitStore');

describe('RedisRateLimitStore', () => {
  test('incrémente et initialise la fenêtre', async () => {
    const client = {
      multi: () => ({ incr: () => ({ pttl: () => ({ exec: async () => [2, -1] }) }) }),
      pexpire: jest.fn().mockResolvedValue(1)
    };
    const result = await new RedisRateLimitStore({ client }).increment('ip');
    expect(result.totalHits).toBe(2);
    expect(client.pexpire).toHaveBeenCalled();
  });

  test('réinitialise une clé préfixée', async () => {
    const client = { del: jest.fn().mockResolvedValue(1) };
    await new RedisRateLimitStore({ client, prefix: 'test:' }).resetKey('ip');
    expect(client.del).toHaveBeenCalledWith('test:ip');
  });
});
