import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../../frontend/index.html', import.meta.url), 'utf8');
const checks = [
  ['locale fr-CA', /<html\s+lang="fr-CA"/i],
  ['encodage UTF-8', /<meta\s+charset="UTF-8"/i],
  ['viewport accessible', /name="viewport"\s+content="width=device-width, initial-scale=1\.0"/i],
  ['titre non vide', /<title>[^<]+<\/title>/i],
  ['racine applicative', /<div\s+id="root"><\/div>/i]
];

const failures = checks.filter(([, pattern]) => !pattern.test(html));
if (failures.length) {
  for (const [label] of failures) console.error(`Échec: ${label}`);
  process.exit(1);
}

console.log(`Contrat HTML accessible validé (${checks.length} contrôles).`);
