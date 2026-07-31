import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const templateDirectory = resolve(root, 'templates');
const indexPath = resolve(templateDirectory, 'a20-bibliotheque-modeles.md');

const expectedTemplates = [
  ['A1', 'a1-modele-decision.md'],
  ['A2', 'a2-modele-adr.md'],
  ['A3', 'a3-modele-analyse-risques.md'],
  ['A4', 'a4-modele-incident.md'],
  ['A5', 'a5-modele-probleme.md'],
  ['A6', 'a6-modele-changement.md'],
  ['A7', 'a7-modele-validation.md'],
  ['A8', 'a8-modele-revue.md'],
  ['A9', 'a9-modele-audit.md'],
  ['A10', 'a10-modele-registre.md'],
  ['A11', 'a11-modele-obligation.md'],
  ['A12', 'a12-modele-service.md'],
  ['A13', 'a13-modele-api.md'],
  ['A14', 'a14-modele-donnees.md'],
  ['A15', 'a15-modele-deploiement.md'],
  ['A16', 'a16-modele-continuite.md'],
  ['A17', 'a17-modele-communication.md'],
  ['A18', 'a18-modele-formation.md'],
  ['A19', 'a19-modele-rapport.md'],
  ['A20', 'a20-bibliotheque-modeles.md'],
];

const errors = [];

for (const [annex, filename] of expectedTemplates) {
  const path = resolve(templateDirectory, filename);
  if (!existsSync(path)) {
    errors.push(`${annex}: fichier absent (${filename})`);
    continue;
  }

  const content = readFileSync(path, 'utf8');
  if (!content.startsWith(`# ${annex} —`)) {
    errors.push(`${annex}: titre principal absent ou incohérent dans ${filename}`);
  }

  if (!content.includes('## Statut')) {
    errors.push(`${annex}: section Statut absente dans ${filename}`);
  }

  if (!/^## Barrière(?: finale)?\s*$/m.test(content)) {
    errors.push(`${annex}: section Barrière absente dans ${filename}`);
  }
}

if (!existsSync(indexPath)) {
  errors.push('A20: index principal absent');
} else {
  const index = readFileSync(indexPath, 'utf8');

  for (const [annex, filename] of expectedTemplates.slice(0, -1)) {
    const expectedLink = `[${annex}](./${filename})`;
    if (!index.includes(expectedLink)) {
      errors.push(`A20: lien absent vers ${annex} (${filename})`);
    }
  }

  const emptyGovernanceField = /^- (?:propriétaire de la bibliothèque|fréquence de revue|mécanisme de proposition|compatibilité et migration|registre des versions)\s*:\s*$/gim;
  if (emptyGovernanceField.test(index)) {
    errors.push('A20: au moins un champ de gouvernance est vide');
  }

  if (!index.includes('**INDEX VALIDÉ')) {
    errors.push('A20: le statut ne constate pas la validation de la bibliothèque');
  }
}

if (errors.length > 0) {
  console.error('Validation de la bibliothèque des modèles: ÉCHEC');
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log(`Validation de la bibliothèque des modèles: SUCCÈS (${expectedTemplates.length} annexes vérifiées)`);
