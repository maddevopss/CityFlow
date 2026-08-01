import { access, mkdir, writeFile } from 'node:fs/promises';
import { constants } from 'node:fs';
import { dirname, isAbsolute, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

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
    values.set(key, value.trim());
    index += 1;
  }
  return { values, flags };
}

function required(values, key) {
  const value = values.get(key);
  if (!value) throw new Error(`Option obligatoire absente: --${key}`);
  return value;
}

function slugify(value) {
  const slug = value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  if (!slug) throw new Error('Le titre ne produit aucun identifiant de dossier valide.');
  return slug;
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
const title = required(values, 'title');
const owner = required(values, 'owner');
const objective = required(values, 'objective');
const slug = values.get('slug') || slugify(title);
if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new Error('Le slug doit utiliser uniquement a-z, 0-9 et des tirets simples.');

const requestedOutput = values.get('output') || `docs/feature-work/${slug}`;
if (isAbsolute(requestedOutput)) throw new Error('Le chemin de sortie doit être relatif au dépôt.');
const outputDirectory = resolve(root, requestedOutput);
const relativeOutput = relative(root, outputDirectory);
if (relativeOutput.startsWith('..') || isAbsolute(relativeOutput) || relativeOutput.startsWith('.git')) {
  throw new Error('Le chemin de sortie doit rester dans le dépôt et hors de .git.');
}
if (await exists(outputDirectory) && !flags.has('force')) {
  throw new Error(`Le dossier existe déjà: ${relativeOutput}. Utiliser --force pour le remplacer.`);
}

const date = new Date().toISOString().slice(0, 10);
const placeholders = {
  requirement: `REQ-DRAFT-${slug.toUpperCase().replaceAll('-', '_')}`,
  decision: `DEC-DRAFT-${slug.toUpperCase().replaceAll('-', '_')}`,
  risk: `RSK-DRAFT-${slug.toUpperCase().replaceAll('-', '_')}`,
  change: `CHG-DRAFT-${slug.toUpperCase().replaceAll('-', '_')}`,
  test: `TST-DRAFT-${slug.toUpperCase().replaceAll('-', '_')}`,
  proof: `PRV-DRAFT-${slug.toUpperCase().replaceAll('-', '_')}`,
  validation: `VAL-DRAFT-${slug.toUpperCase().replaceAll('-', '_')}`
};

const manifest = {
  schemaVersion: 1,
  status: 'draft-not-registered',
  title,
  slug,
  owner,
  objective,
  createdAt: date,
  identifiers: placeholders,
  governance: {
    humanApprovalRequired: true,
    catalogMutationAutomatic: false,
    mergeAllowedBeforeRegistration: false
  }
};

const traceability = `# Dossier fonctionnel — ${title}\n\n## Statut\n\n**BROUILLON NON ENREGISTRÉ — REVUE HUMAINE OBLIGATOIRE**\n\n## Objectif\n\n${objective}\n\n## Propriétaire\n\n${owner}\n\n## Chaîne proposée\n\n| Objet | Identifiant provisoire | Question à résoudre |\n|---|---|---|\n| Exigence | ${placeholders.requirement} | Quel résultat observable est requis? |\n| Décision | ${placeholders.decision} | Quelle option est retenue et pourquoi? |\n| Risque | ${placeholders.risk} | Quel dommage ou échec doit être maîtrisé? |\n| Changement | ${placeholders.change} | Quels composants et données changent? |\n| Test | ${placeholders.test} | Comment vérifier le critère d’acceptation? |\n| Preuve | ${placeholders.proof} | Quel résultat daté sera conservé? |\n| Validation | ${placeholders.validation} | Qui conclut, sur quelle portée et avec quelles réserves? |\n\n## Critères d’acceptation\n\n- À compléter.\n\n## Portée et exclusions\n\n- À compléter.\n\n## Retour arrière\n\n- À compléter.\n\n## Barrière finale\n\nCes identifiants sont provisoires. Ils ne peuvent être copiés dans une PR comme identifiants officiels avant leur enregistrement dans les catalogues du bloc E.\n`;

const prBody = `## Intention\n\n${objective}\n\n## Changements\n\n- À compléter après implémentation.\n\n## Validation\n\n- À compléter avec les commandes et résultats.\n\n## Traçabilité\n\n- Exigences : ${placeholders.requirement}\n- Décisions : ${placeholders.decision}\n- Risques : ${placeholders.risk}\n- Changements : ${placeholders.change}\n- Tests : ${placeholders.test}\n- Preuves : ${placeholders.proof}\n- Validations : ${placeholders.validation}\n\n## Impact documentaire\n\n- Impact : oui\n- Documents créés ou mis à jour : ${relativeOutput}/traceability.md\n- Registres, matrices ou checklists touchés : à confirmer pendant la revue\n\n## Dérogation\n\nAucune prévue.\n\n## Limites\n\nLes identifiants de ce brouillon doivent être remplacés par des identifiants enregistrés avant l’ouverture de la PR réelle.\n`;

const checklist = `# Revue avant enregistrement — ${title}\n\n- [ ] L’objectif est observable et compréhensible.\n- [ ] Les exclusions sont explicites.\n- [ ] Le propriétaire est confirmé.\n- [ ] La décision expose les options rejetées.\n- [ ] Le risque résiduel est visible.\n- [ ] Le retour arrière est possible ou une dérogation est documentée.\n- [ ] Les tests vérifient les critères d’acceptation.\n- [ ] La preuve est datée, attribuée et limitée à un environnement.\n- [ ] La validation humaine nomme ses réserves.\n- [ ] Les identifiants officiels ont été enregistrés dans les catalogues E.\n`;

await mkdir(outputDirectory, { recursive: true });
await writeFile(resolve(outputDirectory, 'feature-manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
await writeFile(resolve(outputDirectory, 'traceability.md'), traceability, 'utf8');
await writeFile(resolve(outputDirectory, 'pr-body.md'), prBody, 'utf8');
await writeFile(resolve(outputDirectory, 'review-checklist.md'), checklist, 'utf8');

console.log(`Dossier fonctionnel généré: ${relativeOutput}`);
console.log('Statut: brouillon non enregistré; revue humaine obligatoire.');
