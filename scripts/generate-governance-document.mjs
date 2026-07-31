import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import { constants } from 'node:fs';
import { dirname, extname, isAbsolute, join, normalize, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const templateDirectory = join(root, 'docs', 'modeles');
const allowedTypes = new Set([
  'decision', 'adr', 'incident', 'validation',
  'deploiement', 'audit', 'rapport', 'communication'
]);

function parseArguments(argv) {
  const values = new Map();
  const flags = new Set();
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (!argument.startsWith('--')) throw new Error(`Argument inattendu: ${argument}`);
    const key = argument.slice(2);
    if (key === 'force') {
      flags.add(key);
      continue;
    }
    const value = argv[index + 1];
    if (!value || value.startsWith('--')) throw new Error(`Valeur absente pour --${key}`);
    values.set(key, value);
    index += 1;
  }
  return { values, flags };
}

function required(values, key) {
  const value = values.get(key)?.trim();
  if (!value) throw new Error(`Option obligatoire absente: --${key}`);
  return value;
}

function resolveOutput(output) {
  if (isAbsolute(output)) throw new Error('Le chemin de sortie doit être relatif au dépôt.');
  if (extname(output).toLowerCase() !== '.md') throw new Error('Le fichier de sortie doit avoir l’extension .md.');
  const resolved = resolve(root, normalize(output));
  const fromRoot = relative(root, resolved);
  if (fromRoot.startsWith('..') || isAbsolute(fromRoot)) {
    throw new Error('Le chemin de sortie ne peut pas quitter le dépôt.');
  }
  if (fromRoot.startsWith('.git/') || fromRoot === '.git') {
    throw new Error('La génération dans .git est interdite.');
  }
  return resolved;
}

async function exists(path) {
  try {
    await access(path, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

const { values, flags } = parseArguments(process.argv.slice(2));
const type = required(values, 'type').toLowerCase();
if (!allowedTypes.has(type)) {
  throw new Error(`Type inconnu: ${type}. Types permis: ${[...allowedTypes].join(', ')}`);
}

const replacements = {
  ID: required(values, 'id'),
  TITLE: required(values, 'title'),
  OWNER: required(values, 'owner'),
  DATE: values.get('date')?.trim() || new Date().toISOString().slice(0, 10),
  STATUS: values.get('status')?.trim() || 'BROUILLON — À VALIDER'
};

const outputPath = resolveOutput(required(values, 'output'));
if (await exists(outputPath) && !flags.has('force')) {
  throw new Error(`Le fichier existe déjà: ${relative(root, outputPath)}. Utiliser --force pour le remplacer.`);
}

const templatePath = join(templateDirectory, `${type}.md.tpl`);
let content = await readFile(templatePath, 'utf8');
for (const [key, value] of Object.entries(replacements)) {
  content = content.replaceAll(`{{${key}}}`, value);
}

const unresolved = [...content.matchAll(/{{([A-Z0-9_]+)}}/gu)].map((match) => match[1]);
if (unresolved.length > 0) {
  throw new Error(`Variables non remplacées: ${[...new Set(unresolved)].join(', ')}`);
}

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, content, 'utf8');
console.log(`Document généré: ${relative(root, outputPath)}`);
