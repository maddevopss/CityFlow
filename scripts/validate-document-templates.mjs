import { readFile, readdir } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const directory = join(root, 'docs', 'modeles');
const expected = [
  'decision', 'adr', 'incident', 'validation',
  'deploiement', 'audit', 'rapport', 'communication'
];
const requiredVariables = ['{{ID}}', '{{TITLE}}', '{{OWNER}}', '{{DATE}}', '{{STATUS}}'];
const requiredSections = ['## Statut', '## Identification', '## Limites', '## Barrière finale'];
const errors = [];

const files = new Set(await readdir(directory));
if (!files.has('README.md')) errors.push('Catalogue README.md absent');

for (const type of expected) {
  const file = `${type}.md.tpl`;
  if (!files.has(file)) {
    errors.push(`Modèle absent: ${file}`);
    continue;
  }
  const content = await readFile(join(directory, file), 'utf8');
  if (!content.startsWith('# {{ID}} — {{TITLE}}')) errors.push(`${file}: titre variable invalide`);
  for (const variable of requiredVariables) {
    if (!content.includes(variable)) errors.push(`${file}: variable ${variable} absente`);
  }
  for (const section of requiredSections) {
    if (!content.includes(section)) errors.push(`${file}: section ${section} absente`);
  }
}

const catalogue = await readFile(join(directory, 'README.md'), 'utf8');
for (const type of expected) {
  if (!catalogue.includes(`./${type}.md.tpl`)) errors.push(`Catalogue: lien ${type} absent`);
}

if (errors.length > 0) {
  console.error('Validation des modèles: ÉCHEC');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Validation des modèles: SUCCÈS (${expected.length} modèles)`);
