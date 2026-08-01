import { readdir, readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const base = resolve(root, 'docs/feature-work');
const errors = [];

let directories = [];
try {
  directories = (await readdir(base, { withFileTypes: true })).filter((entry) => entry.isDirectory()).map((entry) => entry.name);
} catch (error) {
  if (error.code === 'ENOENT') {
    console.log('Validation des dossiers fonctionnels: SUCCÈS (aucun dossier présent)');
    process.exit(0);
  }
  throw error;
}

for (const directory of directories) {
  const path = resolve(base, directory);
  const requiredFiles = ['feature-manifest.json', 'traceability.md', 'pr-body.md', 'review-checklist.md'];
  const contents = new Map();

  for (const file of requiredFiles) {
    try {
      contents.set(file, await readFile(resolve(path, file), 'utf8'));
    } catch {
      errors.push(`${directory}: fichier obligatoire absent (${file})`);
    }
  }

  if (!contents.has('feature-manifest.json')) continue;
  let manifest;
  try {
    manifest = JSON.parse(contents.get('feature-manifest.json'));
  } catch {
    errors.push(`${directory}: manifeste JSON invalide`);
    continue;
  }

  if (manifest.schemaVersion !== 1) errors.push(`${directory}: schemaVersion doit valoir 1`);
  if (manifest.slug !== directory) errors.push(`${directory}: slug du manifeste incohérent`);
  if (manifest.status !== 'draft-not-registered') errors.push(`${directory}: statut non autorisé (${manifest.status})`);
  if (manifest.governance?.humanApprovalRequired !== true) errors.push(`${directory}: approbation humaine non exigée`);
  if (manifest.governance?.catalogMutationAutomatic !== false) errors.push(`${directory}: mutation automatique des catalogues interdite`);
  if (manifest.governance?.mergeAllowedBeforeRegistration !== false) errors.push(`${directory}: fusion avant enregistrement doit être interdite`);

  const prefixes = {
    requirement: 'REQ-DRAFT-', decision: 'DEC-DRAFT-', risk: 'RSK-DRAFT-', change: 'CHG-DRAFT-',
    test: 'TST-DRAFT-', proof: 'PRV-DRAFT-', validation: 'VAL-DRAFT-'
  };
  for (const [key, prefix] of Object.entries(prefixes)) {
    const value = manifest.identifiers?.[key];
    if (typeof value !== 'string' || !value.startsWith(prefix)) errors.push(`${directory}: identifiant provisoire invalide pour ${key}`);
  }

  const traceability = contents.get('traceability.md') || '';
  if (!traceability.includes('BROUILLON NON ENREGISTRÉ')) errors.push(`${directory}: barrière de brouillon absente`);
  if (!traceability.includes('## Barrière finale')) errors.push(`${directory}: section Barrière finale absente`);

  const prBody = contents.get('pr-body.md') || '';
  for (const value of Object.values(manifest.identifiers || {})) {
    if (!prBody.includes(value)) errors.push(`${directory}: identifiant absent du corps de PR (${value})`);
  }

  const checklist = contents.get('review-checklist.md') || '';
  const checks = (checklist.match(/^- \[ \]/gm) || []).length;
  if (checks < 10) errors.push(`${directory}: checklist trop courte (${checks}/10)`);
}

if (errors.length > 0) {
  console.error('Validation des dossiers fonctionnels: ÉCHEC');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Validation des dossiers fonctionnels: SUCCÈS (${directories.length} dossier(s))`);
