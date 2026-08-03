const { EventEmitter } = require('events');
const logger = require('../../src/logger');
const { observabilityMiddleware } = require('../../src/api/middleware/observability');

describe('journalisation HTTP structurée', () => {
  test('journalise seulement les métadonnées corrélables', () => {
    const req = { method: 'GET', path: '/health', get: () => 'request-structured' };
    const res = new EventEmitter();
    res.statusCode = 200;
    res.setHeader = jest.fn();
    jest.spyOn(logger, 'info').mockImplementation(() => {});

    observabilityMiddleware(req, res, jest.fn());
    res.emit('finish');

    expect(logger.info).toHaveBeenCalledWith('http.request', expect.objectContaining({
      requestId: 'request-structured', method: 'GET', statusCode: 200
    }));
    logger.info.mockRestore();
  });
});
