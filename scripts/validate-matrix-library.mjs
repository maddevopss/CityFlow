import { readFile, readdir } from 'node:fs/promises';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const directory = join(root, 'docs', 'matrices');
const indexPath = join(directory, 'm20-index-matrices.md');
const errors = [];

const expectedTitles = new Map([
  [1, 'Exigence'], [2, 'Exigence'], [3, 'Risque'], [4, 'Composant'], [5, 'API'],
  [6, 'Donnée'], [7, 'Phase'], [8, 'Référentiel'], [9, 'Service'], [10, 'Incident'],
  [11, 'Changement'], [12, 'Version'], [13, 'Fournisseur'], [14, 'Métrique'], [15, 'Publication'],
  [16, 'Partie prenante'], [17, 'Communication'], [18, 'Actif'], [19, 'Incident']
]);

const files = (await readdir(directory)).filter((name) => /^m\d+-.*\.md$/u.test(name));
const matrixFiles = new Map();

for (const file of files) {
  const match = file.match(/^m(\d+)-/u);
  if (!match) continue;
  const id = Number(match[1]);
  if (matrixFiles.has(id)) errors.push(`M${id}: plusieurs documents détectés`);
  matrixFiles.set(id, file);
}

for (const [id, expectedTitle] of expectedTitles) {
  const file = matrixFiles.get(id);
  if (!file) {
    errors.push(`M${id}: document absent`);
    continue;
  }

  const content = await readFile(join(directory, file), 'utf8');
  const firstLine = content.split(/\r?\n/u, 1)[0];

  if (!new RegExp(`^# M${id} — Matrice `, 'u').test(firstLine)) {
    errors.push(`M${id}: titre principal invalide dans ${file}`);
  }
  if (!firstLine.toLocaleLowerCase('fr').includes(expectedTitle.toLocaleLowerCase('fr'))) {
    errors.push(`M${id}: intitulé attendu « ${expectedTitle} » absent du titre`);
  }

  for (const section of ['## Statut', '## Objet', '## Structure minimale', '## Règles de mise à jour', '## Contrôles de cohérence', '## Gouvernance', '## Barrière finale']) {
    if (!content.includes(section)) errors.push(`M${id}: section ${section} absente dans ${file}`);
  }

  const tableRows = content.split(/\r?\n/u).filter((line) => /^\|.*\|$/u.test(line));
  if (tableRows.length < 3) errors.push(`M${id}: tableau de traçabilité absent ou incomplet dans ${file}`);
}

if (matrixFiles.has(20) && matrixFiles.get(20) !== 'm20-index-matrices.md') {
  errors.push('M20: nom de fichier inattendu');
}

const index = await readFile(indexPath, 'utf8');
for (const id of expectedTitles.keys()) {
  const file = matrixFiles.get(id);
  if (file && !index.includes(`./${file}`)) errors.push(`M20: lien vers M${id} absent ou invalide`);
}

for (const section of ['## Index', '## Règles communes', '## Gouvernance', '## Limites', '## Barrière finale']) {
  if (!index.includes(section)) errors.push(`M20: section ${section} absente`);
}

if (errors.length > 0) {
  console.error('Validation de la bibliothèque des matrices: ÉCHEC');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Validation de la bibliothèque des matrices: SUCCÈS (${expectedTitles.size + 1} documents)`);
console.log(`Index: ${relative(root, indexPath)}`);
