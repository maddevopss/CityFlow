import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const directory = resolve(root, 'docs/traceability');
const reportPath = resolve(directory, 'report.md');
const errors = [];

const catalogs = {
  REQ: 'requirements.json',
  DEC: 'decisions.json',
  RSK: 'risks.json',
  CHG: 'changes.json',
  TST: 'tests.json',
  PRV: 'evidence.json',
  VAL: 'validations.json'
};

function readJson(filename) {
  const path = resolve(directory, filename);
  if (!existsSync(path)) {
    errors.push(`catalogue absent: ${filename}`);
    return { schemaVersion: 0, items: [] };
  }
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch (error) {
    errors.push(`${filename}: JSON invalide (${error.message})`);
    return { schemaVersion: 0, items: [] };
  }
}

const byId = new Map();
const itemsByPrefix = new Map();

for (const [prefix, filename] of Object.entries(catalogs)) {
  const data = readJson(filename);
  const items = Array.isArray(data.items) ? data.items : [];
  itemsByPrefix.set(prefix, items);
  if (data.schemaVersion !== 1) errors.push(`${filename}: schemaVersion 1 attendu`);

  for (const item of items) {
    if (!item || typeof item !== 'object') {
      errors.push(`${filename}: entrée invalide`);
      continue;
    }
    if (!new RegExp(`^${prefix}-[A-Z0-9-]+$`, 'u').test(item.id ?? '')) {
      errors.push(`${filename}: identifiant invalide (${item.id ?? 'absent'})`);
      continue;
    }
    if (byId.has(item.id)) errors.push(`identifiant dupliqué: ${item.id}`);
    byId.set(item.id, { ...item, prefix, filename });
    if (!item.title || !item.status) errors.push(`${item.id}: title ou status absent`);

    for (const field of ['path', 'record', 'implementation']) {
      if (!item[field]) continue;
      const localPath = resolve(root, item[field]);
      if (!localPath.startsWith(`${root}/`) || !existsSync(localPath)) {
        errors.push(`${item.id}: fichier local absent ou hors dépôt (${item[field]})`);
      }
    }
  }
}

const linksData = readJson('links.json');
const links = Array.isArray(linksData.links) ? linksData.links : [];
if (linksData.schemaVersion !== 1) errors.push('links.json: schemaVersion 1 attendu');
const linkKeys = new Set();

for (const link of links) {
  const key = `${link.from}|${link.type}|${link.to}`;
  if (linkKeys.has(key)) errors.push(`lien dupliqué: ${key}`);
  linkKeys.add(key);
  if (!byId.has(link.from)) errors.push(`lien source orpheline: ${link.from}`);
  if (!byId.has(link.to)) errors.push(`lien destination orpheline: ${link.to}`);
  if (!link.type || !/^[a-z]+(?:-[a-z]+)*$/u.test(link.type)) {
    errors.push(`type de lien invalide: ${link.type ?? 'absent'}`);
  }
}

const requiredRelations = [
  ['DEC', 'authorized-by'],
  ['RSK', 'exposed-to'],
  ['CHG', 'implemented-by'],
  ['TST', 'verified-by'],
  ['PRV', 'evidenced-by'],
  ['VAL', 'validated-by']
];

const activeRequirements = (itemsByPrefix.get('REQ') ?? []).filter((item) => item.status === 'active');
const coverageRows = [];

for (const requirement of activeRequirements) {
  const missing = [];
  for (const [targetPrefix, type] of requiredRelations) {
    const found = links.some((link) =>
      link.from === requirement.id &&
      link.type === type &&
      byId.get(link.to)?.prefix === targetPrefix
    );
    if (!found) missing.push(targetPrefix);
  }
  if (missing.length > 0) errors.push(`${requirement.id}: maillons absents (${missing.join(', ')})`);
  coverageRows.push({ id: requirement.id, covered: requiredRelations.length - missing.length, total: requiredRelations.length });
}

for (const [id, item] of byId.entries()) {
  if (item.prefix === 'REQ') continue;
  const referenced = links.some((link) => link.from === id || link.to === id);
  if (!referenced) errors.push(`${id}: objet orphelin`);
}

const coveredRequirements = coverageRows.filter((row) => row.covered === row.total).length;
const partialRequirements = coverageRows.filter((row) => row.covered > 0 && row.covered < row.total).length;
const uncoveredRequirements = coverageRows.filter((row) => row.covered === 0).length;
const coverage = activeRequirements.length === 0 ? 0 : (coveredRequirements / activeRequirements.length) * 100;

const report = `# Rapport de couverture de traçabilité\n\n## Statut\n\n**GÉNÉRÉ AUTOMATIQUEMENT — NE PAS MODIFIER MANUELLEMENT**\n\n## Résumé\n\n| Indicateur | Valeur |\n|---|---:|\n| Exigences actives | ${activeRequirements.length} |\n| Exigences couvertes | ${coveredRequirements} |\n| Exigences partielles | ${partialRequirements} |\n| Exigences non couvertes | ${uncoveredRequirements} |\n| Décisions | ${(itemsByPrefix.get('DEC') ?? []).length} |\n| Risques | ${(itemsByPrefix.get('RSK') ?? []).length} |\n| Changements | ${(itemsByPrefix.get('CHG') ?? []).length} |\n| Tests | ${(itemsByPrefix.get('TST') ?? []).length} |\n| Preuves | ${(itemsByPrefix.get('PRV') ?? []).length} |\n| Validations | ${(itemsByPrefix.get('VAL') ?? []).length} |\n| Liens | ${links.length} |\n| Couverture obligatoire | ${coverage.toFixed(1)} % |\n\n## Détail des exigences\n\n| Exigence | Maillons présents | Couverture |\n|---|---:|---:|\n${coverageRows.map((row) => `| ${row.id} | ${row.covered}/${row.total} | ${((row.covered / row.total) * 100).toFixed(1)} % |`).join('\n')}\n\n## Limites\n\nCe rapport mesure l’intégrité et la complétude structurelles des relations obligatoires. Il ne démontre pas l’exactitude métier, l’exécution réelle des tests ni la suffisance des preuves.\n`;

if (process.argv.includes('--write')) {
  writeFileSync(reportPath, report, 'utf8');
} else if (!existsSync(reportPath)) {
  errors.push('report.md absent; exécuter node scripts/validate-traceability.mjs --write');
} else if (readFileSync(reportPath, 'utf8') !== report) {
  errors.push('report.md périmé; exécuter node scripts/validate-traceability.mjs --write');
}

if (errors.length > 0) {
  console.error('Validation de la traçabilité: ÉCHEC');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Validation de la traçabilité: SUCCÈS (${activeRequirements.length} exigence(s), ${links.length} lien(s), ${coverage.toFixed(1)} %)`);
