import fs from 'node:fs';

const policyPath = process.argv[2] || 'config/data-retention.json';
const confirm = process.env.CONFIRM_RETENTION_DELETE === 'yes';
const policy = JSON.parse(fs.readFileSync(policyPath, 'utf8'));

const statements = [];
for (const item of policy.categories || []) {
  if (item.legalHold) continue;
  if (!item.table || !item.dateColumn || !Number.isInteger(item.retentionDays)) {
    throw new Error(`Politique invalide: ${item.name || 'inconnue'}`);
  }
  const cutoff = `NOW() - INTERVAL '${item.retentionDays} days'`;
  statements.push(`DELETE FROM "${item.table}" WHERE "municipalityId" = $1 AND "${item.dateColumn}" < ${cutoff};`);
}

console.log(confirm ? statements.join('\n') : statements.map((sql) => `-- DRY-RUN ${sql}`).join('\n'));
if (!confirm) console.error('Mode simulation: aucune suppression exécutée');
