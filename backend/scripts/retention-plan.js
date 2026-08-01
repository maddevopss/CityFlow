const fs = require('fs');
const path = require('path');

const policyPath = process.env.RETENTION_POLICY_PATH || path.join(__dirname, '../config/retention-policy.json');
const policy = JSON.parse(fs.readFileSync(policyPath, 'utf8'));
const now = new Date(process.env.RETENTION_NOW || Date.now());
const execute = process.env.RETENTION_EXECUTE === '1';

if (execute && process.env.RETENTION_CONFIRM !== 'DELETE-EXPIRED-DATA') {
  throw new Error('RETENTION_CONFIRM=DELETE-EXPIRED-DATA est requis pour quitter le mode simulation.');
}

const plan = policy.categories.map((category) => ({
  category: category.name,
  owner: category.owner,
  legalHold: category.legalHold,
  action: category.legalHold ? 'review' : execute ? 'delete' : 'dry-run',
  cutoff: new Date(now.getTime() - category.retentionDays * 86400000).toISOString()
}));

process.stdout.write(`${JSON.stringify({ version: policy.version, generatedAt: now.toISOString(), execute, plan }, null, 2)}\n`);
