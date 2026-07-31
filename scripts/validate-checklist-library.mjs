import { readFile, readdir } from 'node:fs/promises';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const directory = join(root, 'docs', 'checklists');
const indexPath = join(directory, 'c20-index-checklists.md');
const errors = [];

const expectedTitles = new Map([
  [1, 'Nouvelle fonctionnalité'],
  [2, 'Nouvelle API'],
  [3, 'Déploiement'],
  [4, 'Retour arrière'],
  [5, 'Incident'],
  [6, 'Analyse de risque'],
  [7, 'Validation'],
  [8, 'Audit'],
  [9, 'Publication'],
  [10, 'Archivage'],
  [11, 'Changement'],
  [12, 'Revue de sécurité'],
  [13, 'Gestion des données'],
  [14, 'Intégration fournisseur'],
  [15, 'Mise en production'],
  [16, 'Accessibilité'],
  [17, 'Continuité opérationnelle'],
  [18, 'Communication'],
  [19, 'Retrait de service']
]);

const files = (await readdir(directory)).filter((name) => /^c\d+-.*\.md$/u.test(name));
const checklistFiles = new Map();

for (const file of files) {
  const match = file.match(/^c(\d+)-/u);
  if (!match) continue;
  const id = Number(match[1]);
  if (checklistFiles.has(id)) errors.push(`C${id}: plusieurs documents détectés`);
  checklistFiles.set(id, file);
}

for (const [id, expectedTitle] of expectedTitles) {
  const file = checklistFiles.get(id);
  if (!file) {
    errors.push(`C${id}: document absent`);
    continue;
  }

  const path = join(directory, file);
  const content = await readFile(path, 'utf8');
  const firstLine = content.split(/\r?\n/u, 1)[0];

  if (!new RegExp(`^# C${id} — Checklist `, 'u').test(firstLine)) {
    errors.push(`C${id}: titre principal invalide dans ${file}`);
  }
  if (!firstLine.toLocaleLowerCase('fr').includes(expectedTitle.toLocaleLowerCase('fr'))) {
    errors.push(`C${id}: intitulé attendu « ${expectedTitle} » absent du titre`);
  }

  for (const section of ['## Statut', '## Objet', '## Critères d’entrée', '## Barrière finale']) {
    if (!content.includes(section)) errors.push(`C${id}: section ${section} absente dans ${file}`);
  }

  const checkboxCount = (content.match(/^- \[ \]/gmu) || []).length;
  if (checkboxCount < 10) errors.push(`C${id}: moins de 10 contrôles opérationnels dans ${file}`);
}

if (checklistFiles.has(20) && checklistFiles.get(20) !== 'c20-index-checklists.md') {
  errors.push('C20: nom de fichier inattendu');
}

const index = await readFile(indexPath, 'utf8');
for (const id of expectedTitles.keys()) {
  const file = checklistFiles.get(id);
  if (file && !index.includes(`./${file}`)) errors.push(`C20: lien vers C${id} absent ou invalide`);
}

for (const section of ['## Index', '## Règles communes', '## Gouvernance', '## Limites', '## Barrière finale']) {
  if (!index.includes(section)) errors.push(`C20: section ${section} absente`);
}

if (errors.length > 0) {
  console.error('Validation de la bibliothèque des checklists: ÉCHEC');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Validation de la bibliothèque des checklists: SUCCÈS (${expectedTitles.size + 1} documents)`);
console.log(`Index: ${relative(root, indexPath)}`);
