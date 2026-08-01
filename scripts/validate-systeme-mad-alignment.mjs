import { access, readFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const manifestPath = join(root, 'docs', 'integration-systeme-mad', 'systeme-mad-alignment.json');
const readmePath = join(root, 'docs', 'integration-systeme-mad', 'README.md');
const errors = [];

const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
const readme = await readFile(readmePath, 'utf8');

if (manifest.schemaVersion !== 1) errors.push('schemaVersion doit valoir 1');
if (manifest.source?.repository !== 'bleeband/SYSTEME_MAD') errors.push('dépôt source inattendu');
if (manifest.source?.branch !== 'main') errors.push('branche source inattendue');
if (!/^[a-f0-9]{40}$/u.test(manifest.source?.commit ?? '')) errors.push('commit source non épinglé sur 40 caractères');
if (!Array.isArray(manifest.source?.documents) || manifest.source.documents.length < 3) errors.push('documents source insuffisants');

if (manifest.policy?.automaticInheritance !== false) errors.push('automaticInheritance doit être false');
if (manifest.policy?.humanApprovalRequired !== true) errors.push('humanApprovalRequired doit être true');
if (manifest.policy?.conflictsRequireDerogation !== true) errors.push('conflictsRequireDerogation doit être true');
if (manifest.policy?.remoteContentVerifiedByCi !== false) errors.push('remoteContentVerifiedByCi doit être false');

if (!Array.isArray(manifest.mappings) || manifest.mappings.length < 8) {
  errors.push('au moins 8 correspondances sont requises');
}

const ids = new Set();
const evidenceFamilies = new Set();
for (const mapping of manifest.mappings ?? []) {
  if (!/^SMAD-[A-Z]{2,4}-\d{3}$/u.test(mapping.id ?? '')) errors.push(`identifiant invalide: ${mapping.id ?? 'absent'}`);
  if (ids.has(mapping.id)) errors.push(`identifiant dupliqué: ${mapping.id}`);
  ids.add(mapping.id);

  for (const field of ['principle', 'sourceDocument', 'adaptation', 'status']) {
    if (typeof mapping[field] !== 'string' || mapping[field].trim() === '') errors.push(`${mapping.id}: champ ${field} absent`);
  }
  if (mapping.status !== 'active') errors.push(`${mapping.id}: statut inattendu`);
  if (!manifest.source.documents.includes(mapping.sourceDocument)) errors.push(`${mapping.id}: sourceDocument non déclaré`);

  if (!Array.isArray(mapping.localDocuments) || mapping.localDocuments.length === 0) {
    errors.push(`${mapping.id}: aucun document local`);
  } else {
    for (const localPath of mapping.localDocuments) {
      try {
        await access(join(root, localPath));
      } catch {
        errors.push(`${mapping.id}: document local absent: ${localPath}`);
      }
    }
  }

  if (!Array.isArray(mapping.evidence) || mapping.evidence.length === 0) {
    errors.push(`${mapping.id}: aucune preuve déclarée`);
  } else {
    for (const evidence of mapping.evidence) {
      const family = String(evidence).match(/^([A-Z]+)/u)?.[1];
      if (family) evidenceFamilies.add(family);
    }
  }
}

for (const family of ['R', 'T', 'C', 'M']) {
  if (!evidenceFamilies.has(family)) errors.push(`famille documentaire ${family} non couverte`);
}

for (const section of ['## Source institutionnelle épinglée', '## Principes d’intégration', '## Processus de mise à jour', '## Limites', '## Barrière finale']) {
  if (!readme.includes(section)) errors.push(`README: section absente: ${section}`);
}
if (!readme.includes(manifest.source.commit)) errors.push('README: commit épinglé absent');

if (errors.length > 0) {
  console.error('Validation de l’alignement SYSTEME_MAD: ÉCHEC');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Validation de l’alignement SYSTEME_MAD: SUCCÈS (${manifest.mappings.length} correspondances)`);
console.log(`Source épinglée: ${manifest.source.repository}@${manifest.source.commit}`);
