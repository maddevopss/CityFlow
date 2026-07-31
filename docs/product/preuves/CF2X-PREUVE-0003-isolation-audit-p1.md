# CF2X-PREUVE-0003 — Isolation municipale et audit

## Statut

- Initiative liée : `CF2X-INIT-0003`
- Niveau visé : `P1 — preuve conceptuelle reproductible`
- État : `À exécuter`

## Question de preuve

CityFlow peut-il empêcher toute lecture, écriture, tâche différée, restauration ou assistance croisée entre municipalités tout en conservant un audit complet et intelligible?

## Hypothèses

1. Toute opération est liée à une municipalité explicite.
2. L’absence de contexte municipal entraîne un refus par défaut.
3. Les tâches différées conservent le contexte initial.
4. Les journaux ne permettent aucune fuite de contenu sensible.
5. Une restauration ne réintroduit pas de données croisées.
6. Tout accès de soutien est temporaire, motivé et vérifiable.

## Jeu synthétique

- municipalités fictives `MUN-A`, `MUN-B`, `MUN-C`;
- utilisateurs, rôles et permissions distincts;
- demandes, documents et tâches différées fictifs;
- une sauvegarde volontairement contaminée pour tester le refus.

## Scénarios

1. Lecture autorisée dans `MUN-A`.
2. Lecture croisée `MUN-A` vers `MUN-B` refusée.
3. Écriture croisée refusée sans effet partiel.
4. Requête sans contexte municipal refusée.
5. Tâche différée rejouée avec son contexte original.
6. Injection d’un identifiant d’une autre municipalité dans une route autorisée.
7. Export limité à une seule municipalité.
8. Restauration d’une sauvegarde saine.
9. Refus d’une sauvegarde contenant un mélange de municipalités.
10. Accès de soutien temporaire avec approbation, expiration et journalisation.
11. Révocation immédiate d’un accès de soutien.
12. Vérification que les journaux ne contiennent aucun secret ni contenu complet interdit.

## Résultats attendus

- refus par défaut;
- zéro résultat croisé;
- zéro écriture partielle;
- audit corrélé à l’acteur, la municipalité, l’action, le motif et l’horodatage;
- expiration effective des accès temporaires;
- restauration vérifiable et isolée.

## Critères d’échec

La preuve échoue dès qu’un objet, un décompte, un message d’erreur, un journal ou une sauvegarde révèle indirectement l’existence de données d’une autre municipalité.

## Artefacts exigés

- matrice acteurs-rôles-municipalités;
- requêtes et résultats;
- journaux expurgés;
- preuve de non-écriture;
- manifeste de sauvegarde;
- rapport de restauration;
- décision humaine.

## Décision permise

Une réussite P1 autorise uniquement la préparation de tests automatisés P2 dans un environnement isolé. Aucun accès réel, aucune sauvegarde réelle et aucun soutien en production ne sont autorisés.