#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const args = new Set(process.argv.slice(2));
const requestedScope = process.argv.find((arg) => arg.startsWith('--scope='))?.split('=')[1] ?? 'changed';
const install = args.has('--install');
const baseRef = process.env.VALIDATION_BASE_REF ?? process.env.GITHUB_BASE_SHA;
const components = ['backend', 'frontend'];

function run(command, commandArgs, cwd) {
  console.log(`\n> (${cwd}) ${command} ${commandArgs.join(' ')}`);
  const result = spawnSync(command, commandArgs, {
    cwd: path.join(root, cwd),
    stdio: 'inherit',
    shell: process.platform === 'win32',
    env: process.env,
  });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}

function changedComponents() {
  if (!baseRef) {
    console.error('VALIDATION_BASE_REF ou GITHUB_BASE_SHA est requis avec --scope=changed.');
    process.exit(2);
  }
  const result = spawnSync('git', ['diff', '--name-only', `${baseRef}...HEAD`], {
    cwd: root,
    encoding: 'utf8',
    shell: process.platform === 'win32',
  });
  if (result.status !== 0) process.exit(result.status ?? 1);
  const files = result.stdout.split(/\r?\n/).filter(Boolean);
  return components.filter((component) => files.some((file) => file.startsWith(`${component}/`)));
}

function ensureComponent(component) {
  if (!components.includes(component)) {
    console.error(`Portée inconnue: ${component}. Valeurs: changed, backend, frontend, all.`);
    process.exit(2);
  }
  if (!fs.existsSync(path.join(root, component, 'package-lock.json'))) {
    console.error(`${component}/package-lock.json est absent.`);
    process.exit(2);
  }
}

const selected = requestedScope === 'all'
  ? components
  : requestedScope === 'changed'
    ? changedComponents()
    : [requestedScope];

if (selected.length === 0) {
  console.log('Aucun composant applicatif modifié; aucune validation npm requise.');
  process.exit(0);
}

for (const component of selected) {
  ensureComponent(component);
  if (install) run('npm', ['ci', '--no-audit', '--no-fund'], component);

  if (component === 'backend') {
    run('npm', ['run', 'lint', '--', '--quiet'], component);
    run('npx', ['prisma', 'validate'], component);
    run('npm', ['test', '--', '--runInBand', '--passWithNoTests'], component);
  } else {
    run('npm', ['run', 'check:lock'], component);
    run('npm', ['run', 'lint', '--', '--quiet'], component);
    run('npm', ['test', '--', '--run', '--passWithNoTests'], component);
    run('npm', ['run', 'build'], component);
  }
}
