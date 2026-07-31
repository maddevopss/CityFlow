process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://cityflow:cityflow_secret@localhost:5432/cityflow_test';
process.env.JWT_SECRET = 'test-secret';
process.env.REDIS_URL = 'redis://localhost:6379';

jest.mock('../src/services/eventAudit', () => ({
  appendEventAudit: jest.fn().mockResolvedValue('audit-1'),
  listEventAudit: jest.fn().mockResolvedValue([])
}));
