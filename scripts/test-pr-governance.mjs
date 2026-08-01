import { mkdir, rm, writeFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const temp = resolve(root, '.tmp/pr-governance-tests');
const validator = resolve(root, 'scripts/validate-pr-governance.mjs');
await rm(temp, { recursive: true, force: true });
await mkdir(temp, { recursive: true });

const validBody = `## Intention

Valider le contrat de gouvernance vivant.

## Changements

- Ajout du contrôle automatique.

## Validation

Exécution des scripts de validation.

## Traçabilité

- Exigences : REQ-CF-GOV-001
- Décisions : DEC-CF-GOV-001
- Risques : RSK-CF-GOV-001
- Changements : CHG-CF-GOV-001
- Tests : TST-CF-GOV-001
- Preuves : PRV-CF-GOV-001
- Validations : VAL-CF-GOV-001

## Impact documentaire

- Impact : oui
- Documents créés ou mis à jour : contrat et workflow de gouvernance
- Registres, matrices ou checklists touchés : aucun

## Dérogation

Aucune.

## Limites

Le contrôle reste structurel et ne remplace pas une revue humaine.
`;

async function run(name, body, expectedStatus) {
  const eventPath = resolve(temp, `${name}.json`);
  await writeFile(eventPath, JSON.stringify({
    pull_request: {
      number: 999,
      title: name,
      body,
      changed_files: 4,
      user: { login: 'ci-test' }
    }
  }), 'utf8');

  const result = spawnSync(process.execPath, [validator, '--event', eventPath], {
    cwd: root,
    encoding: 'utf8',
    env: { ...process.env, PR_GOVERNANCE_REPORT: `.tmp/pr-governance-tests/${name}.md` }
  });

  if (result.status !== expectedStatus) {
    console.error(result.stdout);
    console.error(result.stderr);
    throw new Error(`${name}: statut ${result.status}, attendu ${expectedStatus}`);
  }
}

await run('valid', validBody, 0);
await run('unknown-id', validBody.replace('REQ-CF-GOV-001', 'REQ-INCONNUE-999'), 1);
await run('missing-section', validBody.replace('## Limites', '## Autre'), 1);
await run('weak-na', validBody.replace('DEC-CF-GOV-001', 'N/A — rien'), 1);
await run('justified-na', validBody.replace('DEC-CF-GOV-001', 'N/A — aucun choix d’architecture distinct dans cette modification'), 0);

await rm(temp, { recursive: true, force: true });
console.log('Tests du contrat de gouvernance PR: SUCCÈS');
