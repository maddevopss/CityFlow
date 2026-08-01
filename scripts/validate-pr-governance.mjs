import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const eventArgumentIndex = args.indexOf('--event');
const eventPath = eventArgumentIndex >= 0 ? args[eventArgumentIndex + 1] : process.env.GITHUB_EVENT_PATH;

if (!eventPath) {
  throw new Error('Événement GitHub absent. Fournir GITHUB_EVENT_PATH ou --event <fichier>.');
}

const catalogues = {
  'Exigences': { prefix: 'REQ-', path: 'docs/traceability/requirements.json' },
  'Décisions': { prefix: 'DEC-', path: 'docs/traceability/decisions.json' },
  'Risques': { prefix: 'RSK-', path: 'docs/traceability/risks.json' },
  'Changements': { prefix: 'CHG-', path: 'docs/traceability/changes.json' },
  'Tests': { prefix: 'TST-', path: 'docs/traceability/tests.json' },
  'Preuves': { prefix: 'PRV-', path: 'docs/traceability/evidence.json' },
  'Validations': { prefix: 'VAL-', path: 'docs/traceability/validations.json' }
};

const event = JSON.parse(await readFile(resolve(eventPath), 'utf8'));
const pullRequest = event.pull_request;
if (!pullRequest) throw new Error('L’événement ne contient pas de pull_request.');

const body = pullRequest.body ?? '';
const errors = [];
const warnings = [];
const resolved = {};

for (const section of ['Intention', 'Changements', 'Validation', 'Traçabilité', 'Impact documentaire', 'Dérogation', 'Limites']) {
  if (!new RegExp(`^## ${section}\\s*$`, 'mi').test(body)) {
    errors.push(`Section obligatoire absente: ## ${section}`);
  }
}

for (const [label, catalogue] of Object.entries(catalogues)) {
  const line = body.match(new RegExp(`^- ${label}\\s*:\\s*(.+)$`, 'mi'))?.[1]?.trim();
  if (!line) {
    errors.push(`Champ de traçabilité absent: ${label}`);
    continue;
  }

  if (/^N\/A\s*[—-]\s*/iu.test(line)) {
    const justification = line.replace(/^N\/A\s*[—-]\s*/iu, '').trim();
    if (justification.length < 12) {
      errors.push(`${label}: la justification N/A doit être précise (12 caractères minimum).`);
    }
    resolved[label] = { mode: 'not-applicable', justification };
    continue;
  }

  const ids = [...new Set(line.match(/[A-Z]{3}-[A-Z0-9-]+/gu) ?? [])];
  if (ids.length === 0) {
    errors.push(`${label}: aucun identifiant reconnu ni justification N/A.`);
    continue;
  }

  const json = JSON.parse(await readFile(resolve(root, catalogue.path), 'utf8'));
  const knownIds = new Set((json.items ?? []).map((item) => item.id));
  const valid = [];

  for (const id of ids) {
    if (!id.startsWith(catalogue.prefix)) {
      errors.push(`${label}: préfixe invalide pour ${id}; attendu ${catalogue.prefix}`);
    } else if (!knownIds.has(id)) {
      errors.push(`${label}: identifiant absent du catalogue: ${id}`);
    } else {
      valid.push(id);
    }
  }

  resolved[label] = { mode: 'catalogue', ids: valid };
}

const impactLine = body.match(/^- Impact\s*:\s*(.+)$/mi)?.[1]?.trim().toLowerCase();
if (!impactLine || !['oui', 'non'].includes(impactLine)) {
  errors.push('Impact documentaire: le champ « Impact » doit valoir oui ou non.');
}
if (impactLine === 'oui') {
  const documentsLine = body.match(/^- Documents créés ou mis à jour\s*:\s*(.+)$/mi)?.[1]?.trim();
  if (!documentsLine || /^n\/?a$/iu.test(documentsLine)) {
    errors.push('Impact documentaire déclaré oui, mais aucun document n’est indiqué.');
  }
}

const derogationSection = body.match(/^## Dérogation\s*$([\s\S]*?)(?=^## |$)/mi)?.[1]?.trim() ?? '';
if (!derogationSection) errors.push('La section Dérogation doit indiquer « Aucune » ou une dérogation complète.');

if ((pullRequest.changed_files ?? 0) > 100) {
  warnings.push('PR volumineuse: plus de 100 fichiers modifiés; une découpe devrait être évaluée.');
}

const reportLines = [
  '# Rapport de gouvernance de la pull request',
  '',
  `- PR : #${pullRequest.number}`,
  `- titre : ${pullRequest.title}`,
  `- auteur : ${pullRequest.user?.login ?? 'inconnu'}`,
  `- fichiers modifiés : ${pullRequest.changed_files ?? 'inconnu'}`,
  `- verdict : ${errors.length === 0 ? 'CONFORME STRUCTURELLEMENT' : 'ÉCHEC'}`,
  '',
  '## Traçabilité résolue',
  ''
];

for (const label of Object.keys(catalogues)) {
  const value = resolved[label];
  if (!value) reportLines.push(`- ${label} : non résolu`);
  else if (value.mode === 'catalogue') reportLines.push(`- ${label} : ${value.ids.join(', ') || 'aucun identifiant valide'}`);
  else reportLines.push(`- ${label} : N/A — ${value.justification}`);
}

reportLines.push('', '## Erreurs', '');
reportLines.push(...(errors.length ? errors.map((error) => `- ${error}`) : ['- Aucune.']));
reportLines.push('', '## Avertissements', '');
reportLines.push(...(warnings.length ? warnings.map((warning) => `- ${warning}`) : ['- Aucun.']));
reportLines.push('', '## Barrière', '', 'Ce rapport valide la structure et la résolution des identifiants. Il ne prouve pas la qualité du changement, des tests ou des preuves déclarées.');

const reportPath = resolve(root, process.env.PR_GOVERNANCE_REPORT ?? '.tmp/pr-governance-report.md');
await mkdir(dirname(reportPath), { recursive: true });
await writeFile(reportPath, `${reportLines.join('\n')}\n`, 'utf8');

console.log(reportLines.join('\n'));
if (process.env.GITHUB_STEP_SUMMARY) {
  await writeFile(process.env.GITHUB_STEP_SUMMARY, `${reportLines.join('\n')}\n`, { encoding: 'utf8', flag: 'a' });
}

if (errors.length > 0) process.exit(1);
