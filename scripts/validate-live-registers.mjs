import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const directory = resolve(root, 'docs/registres');
const indexPath = resolve(directory, 't20-index-registres.md');
const errors = [];

const expected = [
  ['T1', 't1-registre-decisions.md'],
  ['T2', 't2-registre-risques.md'],
  ['T3', 't3-registre-incidents.md'],
  ['T4', 't4-registre-changements.md'],
  ['T5', 't5-registre-derogations.md'],
  ['T6', 't6-registre-obligations.md'],
  ['T7', 't7-registre-actifs.md'],
  ['T8', 't8-registre-dependances.md'],
  ['T9', 't9-registre-donnees.md'],
  ['T10', 't10-registre-api.md'],
  ['T11', 't11-registre-environnements.md'],
  ['T12', 't12-registre-versions.md'],
  ['T13', 't13-registre-audits.md'],
  ['T14', 't14-registre-validations.md'],
  ['T15', 't15-registre-fournisseurs.md'],
  ['T16', 't16-registre-parties-prenantes.md'],
  ['T17', 't17-registre-communications.md'],
  ['T18', 't18-registre-publications.md'],
  ['T19', 't19-registre-metriques.md'],
  ['T20', 't20-index-registres.md'],
];

for (const [id, filename] of expected) {
  const path = resolve(directory, filename);
  if (!existsSync(path)) {
    errors.push(`${id}: fichier absent (${filename})`);
    continue;
  }

  const content = readFileSync(path, 'utf8');
  if (!content.startsWith(`# ${id} —`)) {
    errors.push(`${id}: titre principal incohérent dans ${filename}`);
  }

  for (const section of ['Statut', 'Objet', 'Gouvernance']) {
    if (!new RegExp(`^## ${section}\\s*$`, 'm').test(content)) {
      errors.push(`${id}: section ${section} absente dans ${filename}`);
    }
  }

  if (!/^## Barrière finale\s*$/m.test(content)) {
    errors.push(`${id}: section Barrière finale absente dans ${filename}`);
  }
}

if (!existsSync(indexPath)) {
  errors.push('T20: index absent');
} else {
  const index = readFileSync(indexPath, 'utf8');
  const seen = new Set();

  for (const [id, filename] of expected.slice(0, -1)) {
    const link = `](./${filename})`;
    const occurrences = index.split(link).length - 1;
    if (occurrences !== 1) {
      errors.push(`T20: lien vers ${id} présent ${occurrences} fois, 1 attendu`);
    }
    if (seen.has(id)) {
      errors.push(`T20: entrée dupliquée (${id})`);
    }
    seen.add(id);
  }

  const requiredFields = [
    'propriétaire de l’index',
    'modification',
    'revue',
    'compatibilité',
    'historique',
    'contrôle',
  ];

  for (const field of requiredFields) {
    const pattern = new RegExp(`^- ${field}\\s*:\\s*\\S`, 'mi');
    if (!pattern.test(index)) {
      errors.push(`T20: champ de gouvernance absent ou vide (${field})`);
    }
  }

  if (!index.includes('**INDEX ACTIF')) {
    errors.push('T20: statut actif absent');
  }
}

if (errors.length > 0) {
  console.error('Validation des registres vivants: ÉCHEC');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Validation des registres vivants: SUCCÈS (${expected.length} documents vérifiés)`);
