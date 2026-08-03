'use strict';

class RedisRateLimitStore {
  constructor({ client, prefix = 'cityflow:ratelimit:' }) {
    if (!client) throw new Error('redis client required');
    this.client = client;
    this.prefix = prefix;
  }
  init() {}
  async increment(key) {
    const results = await this.client.multi().incr(`${this.prefix}${key}`).pttl(`${this.prefix}${key}`).exec();
    let resetMs = Number(results[1]);
    if (resetMs < 0) {
      resetMs = 15 * 60 * 1000;
      await this.client.pexpire(`${this.prefix}${key}`, resetMs);
    }
    return { totalHits: Number(results[0]), resetTime: new Date(Date.now() + resetMs) };
  }
  async decrement(key) { await this.client.decr(`${this.prefix}${key}`); }
  async resetKey(key) { await this.client.del(`${this.prefix}${key}`); }
}

module.exports = RedisRateLimitStore;
