# CF2X-PREUVE-0002 — Cycle municipal de publication

## Statut

- Initiative liée : `CF2X-INIT-0002`
- Niveau visé : `P1 — preuve conceptuelle reproductible`
- État : `À exécuter`
- Autorité finale : humaine et municipale

## Question de preuve

Un cycle municipal de publication peut-il produire, corriger, retirer et restituer une information publique sans perte de provenance, confusion de version ni modification silencieuse de l’historique?

## Hypothèses vérifiables

1. Toute publication possède une identité stable et une version explicite.
2. Une correction crée une nouvelle version sans effacer la précédente.
3. Un retrait rend le contenu indisponible au public sans supprimer sa trace d’audit.
4. Une répétition idempotente ne crée pas de publication concurrente.
5. Une tentative non autorisée est refusée et journalisée.
6. L’état public peut être reconstruit pour une date donnée.

## États contrôlés

- brouillon;
- soumis;
- approuvé;
- publié;
- corrigé;
- retiré;
- archivé.

Aucun passage d’état n’est implicite. Chaque transition exige un auteur, un horodatage, un motif et une preuve d’autorisation.

## Données synthétiques

Trois municipalités fictives, quatre avis publics, deux calendriers de collecte, une correction réglementaire et un retrait d’urgence sont utilisés. Aucun renseignement réel n’est admis.

## Scénarios reproductibles

1. Création d’un brouillon puis publication approuvée.
2. Double envoi de la même commande avec une même clé d’idempotence.
3. Correction d’une date après publication.
4. Consultation de la version antérieure.
5. Retrait immédiat avec motif obligatoire.
6. Refus d’une publication sans approbateur valide.
7. Refus d’une correction provenant d’une autre municipalité.
8. Reconstruction de l’état public à une date historique.
9. Rejeu complet du journal dans un environnement vierge.
10. Échec volontaire pendant une transition et vérification de l’absence d’état partiel.

## Résultats attendus

- une seule publication active par identité et version;
- historique append-only;
- provenance complète;
- refus déterministes;
- aucune correction silencieuse;
- état historique explicable;
- restauration identique après rejeu.

## Critères d’échec

La preuve échoue si une publication est dupliquée, si une version est écrasée, si un retrait efface sa trace, si une action non autorisée réussit ou si l’état historique ne peut être reconstruit.

## Artefacts exigés

- jeu d’entrée versionné;
- commandes exécutées;
- journal des transitions;
- résultats attendus et obtenus;
- empreintes des artefacts;
- rapport des écarts;
- décision humaine signée.

## Décision permise

Une réussite P1 permet uniquement de préparer un prototype isolé et des tests P2. Elle n’autorise ni publication municipale réelle, ni intégration de production, ni pilote.