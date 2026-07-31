const request = require('supertest');

jest.mock('../../src/services/prometheusMetrics', () => ({
  getGlobalDiffusionMetrics: jest.fn(),
  renderPrometheusMetrics: jest.fn()
}));

const {
  getGlobalDiffusionMetrics,
  renderPrometheusMetrics
} = require('../../src/services/prometheusMetrics');
const app = require('../../src/app');

describe('GET /metrics', () => {
  const originalToken = process.env.METRICS_TOKEN;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.METRICS_TOKEN = 'metrics-secret';
    getGlobalDiffusionMetrics.mockResolvedValue({
      health: 'healthy',
      metrics: { processedCount: 2 }
    });
    renderPrometheusMetrics.mockReturnValue('cityflow_diffusion_processed_total 2\n');
  });

  afterAll(() => {
    if (originalToken === undefined) delete process.env.METRICS_TOKEN;
    else process.env.METRICS_TOKEN = originalToken;
  });

  it('refuse les requêtes sans jeton', async () => {
    const response = await request(app).get('/metrics');

    expect(response.status).toBe(401);
    expect(getGlobalDiffusionMetrics).not.toHaveBeenCalled();
  });

  it('refuse les requêtes avec un mauvais jeton', async () => {
    const response = await request(app)
      .get('/metrics')
      .set('Authorization', 'Bearer invalid');

    expect(response.status).toBe(401);
    expect(getGlobalDiffusionMetrics).not.toHaveBeenCalled();
  });

  it('retourne 503 lorsque le jeton serveur n’est pas configuré', async () => {
    delete process.env.METRICS_TOKEN;

    const response = await request(app)
      .get('/metrics')
      .set('Authorization', 'Bearer metrics-secret');

    expect(response.status).toBe(503);
    expect(getGlobalDiffusionMetrics).not.toHaveBeenCalled();
  });

  it('expose les métriques avec un jeton Bearer valide', async () => {
    const response = await request(app)
      .get('/metrics')
      .set('Authorization', 'Bearer metrics-secret');

    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toContain('text/plain');
    expect(response.text).toContain('cityflow_diffusion_processed_total 2');
    expect(getGlobalDiffusionMetrics).toHaveBeenCalledTimes(1);
    expect(renderPrometheusMetrics).toHaveBeenCalledTimes(1);
  });

  it('accepte aussi l’en-tête x-metrics-token', async () => {
    const response = await request(app)
      .get('/metrics')
      .set('x-metrics-token', 'metrics-secret');

    expect(response.status).toBe(200);
  });
});
