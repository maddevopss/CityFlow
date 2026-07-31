import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const registryPath = resolve(root, 'docs/references/index-referentiels.md');
const errors = [];

if (!existsSync(registryPath)) {
  console.error('Validation du registre des référentiels: ÉCHEC');
  console.error('- registre absent: docs/references/index-referentiels.md');
  process.exit(1);
}

const registry = readFileSync(registryPath, 'utf8');
const registryDirectory = dirname(registryPath);
const rowPattern = /^\| (R(?:[1-9]|1\d|20)) \| [^|]+ \| \[[^\]]+\]\(([^)]+)\) \|$/gm;
const entries = new Map();

for (const match of registry.matchAll(rowPattern)) {
  const [, referenceId, relativePath] = match;

  if (entries.has(referenceId)) {
    errors.push(`${referenceId}: entrée dupliquée dans le registre`);
    continue;
  }

  entries.set(referenceId, relativePath);
}

for (let index = 1; index <= 20; index += 1) {
  const referenceId = `R${index}`;
  const relativePath = entries.get(referenceId);

  if (!relativePath) {
    errors.push(`${referenceId}: entrée absente du registre`);
    continue;
  }

  const documentPath = resolve(registryDirectory, relativePath);
  if (!existsSync(documentPath)) {
    errors.push(`${referenceId}: document lié absent (${relativePath})`);
    continue;
  }

  const content = readFileSync(documentPath, 'utf8');
  if (!content.startsWith('# ')) {
    errors.push(`${referenceId}: titre principal absent dans ${relativePath}`);
  }

  if (!/^## Statut\s*$/m.test(content)) {
    errors.push(`${referenceId}: section Statut absente dans ${relativePath}`);
  }

  const hasBarrierSection = /^## Barrière(?: finale)?\s*$/m.test(content);
  const hasClosureSection = /^## Fermeture\s*$/m.test(content);
  if (!hasBarrierSection && !hasClosureSection) {
    errors.push(`${referenceId}: section Barrière ou Fermeture absente dans ${relativePath}`);
  }

  const explicitOpenVerdict = new RegExp(`\\*\\*${referenceId} NON FERMÉ\\b`, 'i');
  if (!explicitOpenVerdict.test(content)) {
    errors.push(`${referenceId}: verdict explicite « ${referenceId} NON FERMÉ » absent dans ${relativePath}`);
  }
}

if (entries.size !== 20) {
  errors.push(`registre: ${entries.size} entrée(s) reconnue(s), 20 attendues`);
}

const requiredGovernanceFields = [
  'propriétaire du registre',
  'modification',
  'ajout ou retrait',
  'compatibilité',
  'historique',
  'revue',
];

for (const field of requiredGovernanceFields) {
  const pattern = new RegExp(`^- ${field}\\s*:\\s*\\S`, 'mi');
  if (!pattern.test(registry)) {
    errors.push(`gouvernance: champ absent ou vide (${field})`);
  }
}

if (!registry.includes('docs/referentiels') || !registry.includes('docs/references')) {
  errors.push('registre: la dette de structure historique n’est pas explicitement documentée');
}

if (!registry.includes('**REGISTRE ACTIF')) {
  errors.push('registre: statut actif absent');
}

if (errors.length > 0) {
  console.error('Validation du registre des référentiels: ÉCHEC');
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log('Validation du registre des référentiels: SUCCÈS (R1 à R20 vérifiés)');
