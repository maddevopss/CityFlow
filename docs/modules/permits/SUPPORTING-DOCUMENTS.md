# Pièces justificatives des permis

## Portée

CityFlow conserve les métadonnées vérifiables d’une pièce et une référence vers le stockage externe. Aucun contenu binaire n’est enregistré dans le champ JSON du permis.

## Métadonnées

Chaque pièce possède un identifiant, un type, un nom de fichier, un type MIME, une taille maximale de 25 Mo, une clé de stockage, une empreinte SHA-256, une description et les informations d’auteur et de révision.

## Cycle

`PENDING → ACCEPTED | REJECTED`

Un refus exige un motif d’au moins trois caractères. Seuls les administrateurs et gestionnaires peuvent accepter ou refuser une pièce. Les agents municipaux peuvent l’ajouter au dossier. Les lecteurs peuvent consulter la liste.

## Sécurité

- l’identifiant du permis est validé;
- le permis doit appartenir à la municipalité du jeton;
- la clé de stockage est unique dans un même dossier;
- l’empreinte SHA-256 est obligatoire;
- les décisions sont inscrites dans `EventAudit`;
- aucun lien public direct n’est généré par ce bloc.

## API

- `GET /api/v1/permits/:permitId/documents`
- `POST /api/v1/permits/:permitId/documents`
- `POST /api/v1/permits/:permitId/documents/:documentId/review`

## Limite assumée

Le stockage et le téléversement binaire relèvent d’un fournisseur externe. Ce bloc reçoit seulement une référence `storageKey` déjà créée par un mécanisme d’envoi sécurisé.
