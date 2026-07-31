import { access } from 'node:fs/promises';
import { constants } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const validators = [
  'validate-reference-registry.mjs',
  'validate-live-registers.mjs',
  'validate-checklist-library.mjs',
  'validate-matrix-library.mjs',
  'validate-document-templates.mjs'
];

async function exists(path) {
  try {
    await access(path, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

const executed = [];
const failed = [];

for (const validator of validators) {
  const path = join(root, 'scripts', validator);
  if (!(await exists(path))) {
    console.log(`Validation ignorée (script absent): ${validator}`);
    continue;
  }

  console.log(`\n=== ${validator} ===`);
  const result = spawnSync(process.execPath, [path], {
    cwd: root,
    encoding: 'utf8',
    stdio: 'inherit'
  });
  executed.push(validator);
  if (result.status !== 0) failed.push(validator);
}

if (executed.length === 0) {
  console.error('Aucun validateur documentaire détecté.');
  process.exit(1);
}

if (failed.length > 0) {
  console.error(`\nSuite documentaire: ÉCHEC (${failed.join(', ')})`);
  process.exit(1);
}

console.log(`\nSuite documentaire: SUCCÈS (${executed.length} validateurs)`);
