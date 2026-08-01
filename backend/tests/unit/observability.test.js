const { EventEmitter } = require('events');
const {
  observabilityMiddleware,
  recordRequest,
  snapshotMetrics,
  resetMetrics
} = require('../../src/api/middleware/observability');

describe('observability middleware', () => {
  beforeEach(() => resetMetrics());

  test('agrège les métriques HTTP', () => {
    recordRequest({ method: 'GET', route: '/health', statusCode: 200, durationMs: 10 });
    recordRequest({ method: 'GET', route: '/health', statusCode: 200, durationMs: 30 });

    expect(snapshotMetrics()).toEqual([
      {
        method: 'GET',
        route: '/health',
        statusCode: 200,
        count: 2,
        averageDurationMs: 20,
        maxDurationMs: 30
      }
    ]);
  });

  test('propage un identifiant de requête', () => {
    const req = {
      method: 'GET',
      path: '/health',
      get: jest.fn(() => 'request-123')
    };
    const res = new EventEmitter();
    res.statusCode = 200;
    res.setHeader = jest.fn();
    const next = jest.fn();

    observabilityMiddleware(req, res, next);
    res.emit('finish');

    expect(req.requestId).toBe('request-123');
    expect(res.setHeader).toHaveBeenCalledWith('x-request-id', 'request-123');
    expect(next).toHaveBeenCalled();
    expect(snapshotMetrics()[0]).toMatchObject({ method: 'GET', route: '/health', statusCode: 200, count: 1 });
  });
});
