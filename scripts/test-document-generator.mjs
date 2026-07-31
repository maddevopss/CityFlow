import { rm } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const generator = join(root, 'scripts', 'generate-governance-document.mjs');
const temporaryDirectory = join(root, '.tmp-generator-tests');

function run(argumentsList) {
  return spawnSync(process.execPath, [generator, ...argumentsList], {
    cwd: root,
    encoding: 'utf8'
  });
}

function expectStatus(result, expected, label) {
  if (result.status !== expected) {
    console.error(result.stdout);
    console.error(result.stderr);
    throw new Error(`${label}: statut ${result.status}, attendu ${expected}`);
  }
}

await rm(temporaryDirectory, { recursive: true, force: true });

const common = [
  '--type', 'decision',
  '--id', 'TEST-001',
  '--title', 'Décision de test',
  '--owner', 'CI CityFlow',
  '--date', '2026-07-31',
  '--output', '.tmp-generator-tests/decision.md'
];

expectStatus(run(common), 0, 'génération nominale');
expectStatus(run(common), 1, 'écrasement sans --force');
expectStatus(run([...common, '--force']), 0, 'écrasement avec --force');
expectStatus(run(common.map((value) => value === 'decision' ? 'inconnu' : value)), 1, 'type inconnu');
expectStatus(run([
  '--type', 'decision', '--id', 'TEST-002', '--title', 'Traversal',
  '--owner', 'CI', '--output', '../hors-depot.md'
]), 1, 'traversée de chemin');

await rm(temporaryDirectory, { recursive: true, force: true });
console.log('Tests du générateur: SUCCÈS');
