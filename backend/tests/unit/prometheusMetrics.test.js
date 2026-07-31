const { renderPrometheusMetrics } = require('../../src/services/prometheusMetrics');

describe('renderPrometheusMetrics', () => {
  it('rend les compteurs, délais et l’état global au format Prometheus', () => {
    const output = renderPrometheusMetrics({
      windowHours: 24,
      health: 'critical',
      metrics: {
        pendingCount: 3,
        processingCount: 1,
        processedCount: 20,
        deadCount: 2,
        warningCount: 3,
        criticalCount: 2,
        stuckCount: 1,
        averageDeliverySeconds: 12.5,
        p95DeliverySeconds: 41,
        openWarningAlerts: 4,
        openCriticalAlerts: 2
      }
    });

    expect(output).toContain('# TYPE cityflow_diffusion_processed_total gauge');
    expect(output).toContain('cityflow_diffusion_processed_total 20');
    expect(output).toContain('cityflow_diffusion_delivery_seconds_p95 41');
    expect(output).toContain('cityflow_diffusion_health{state="critical"} 1');
    expect(output).toContain('cityflow_diffusion_health{state="healthy"} 0');
    expect(output.endsWith('\n')).toBe(true);
  });

  it('remplace les valeurs absentes ou non numériques par zéro', () => {
    const output = renderPrometheusMetrics({
      health: 'healthy',
      metrics: { processedCount: null, p95DeliverySeconds: 'invalid' }
    });

    expect(output).toContain('cityflow_diffusion_processed_total 0');
    expect(output).toContain('cityflow_diffusion_delivery_seconds_p95 0');
    expect(output).not.toContain('NaN');
  });
});
