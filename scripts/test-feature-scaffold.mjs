import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const script = resolve(root, 'scripts/scaffold-feature.mjs');
const temporaryRoot = await mkdtemp(join(tmpdir(), 'cityflow-feature-'));
const relativeOutput = `tmp-feature-work-${Date.now()}`;
const output = resolve(root, relativeOutput);

function run(args) {
  return spawnSync(process.execPath, [script, ...args], { cwd: root, encoding: 'utf8' });
}

function expectStatus(result, expected, label) {
  if (result.status !== expected) {
    throw new Error(`${label}: statut ${result.status}, attendu ${expected}\n${result.stderr}\n${result.stdout}`);
  }
}

try {
  const nominal = run([
    '--title', 'Gestion des inspections',
    '--owner', 'Équipe CityFlow',
    '--objective', 'Permettre la planification et la validation des inspections municipales.',
    '--output', relativeOutput
  ]);
  expectStatus(nominal, 0, 'génération nominale');

  const manifest = JSON.parse(await readFile(resolve(output, 'feature-manifest.json'), 'utf8'));
  if (manifest.status !== 'draft-not-registered') throw new Error('statut de brouillon absent');
  if (manifest.governance?.humanApprovalRequired !== true) throw new Error('approbation humaine absente');
  if (!manifest.identifiers?.requirement?.startsWith('REQ-DRAFT-')) throw new Error('identifiant provisoire invalide');

  const duplicate = run([
    '--title', 'Gestion des inspections',
    '--owner', 'Équipe CityFlow',
    '--objective', 'Deuxième génération interdite.',
    '--output', relativeOutput
  ]);
  if (duplicate.status === 0) throw new Error('écrasement non forcé accepté');

  const traversal = run([
    '--title', 'Traversal',
    '--owner', 'Équipe CityFlow',
    '--objective', 'Test de sécurité.',
    '--output', '../hors-depot'
  ]);
  if (traversal.status === 0) throw new Error('traversée de chemin acceptée');

  const invalidSlug = run([
    '--title', 'Slug invalide',
    '--owner', 'Équipe CityFlow',
    '--objective', 'Test de validation.',
    '--slug', 'mauvais/slug',
    '--output', `${relativeOutput}-invalid`
  ]);
  if (invalidSlug.status === 0) throw new Error('slug invalide accepté');

  console.log('Tests du générateur fonctionnel: SUCCÈS');
} finally {
  await rm(output, { recursive: true, force: true });
  await rm(temporaryRoot, { recursive: true, force: true });
}
