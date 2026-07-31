# Registre des référentiels CityFlow — R1 à R20

## Statut

**REGISTRE ACTIF — RÉFÉRENTIELS R1 À R20 CARTOGRAPHIÉS ET CONTRÔLÉS**

## Objet

Fournir un point d’entrée unique vers les référentiels permanents de CityFlow, rendre visibles leurs limites et empêcher qu’un document de référence soit interprété comme une conformité, une approbation ou une efficacité démontrée.

## Registre

| Référentiel | Domaine | Document de référence |
|---|---|---|
| R1 | Architecture de référence | [Fermeture documentaire R1](../referentiels/r1/05-fermeture-referentiel.md) |
| R2 | Sécurité | [Fermeture documentaire R2](../referentiels/r2/05-fermeture-referentiel.md) |
| R3 | Qualité et validation | [Fermeture documentaire R3](../referentiels/r3/05-fermeture-referentiel.md) |
| R4 | Exploitation | [Fermeture documentaire R4](../referentiels/r4/05-fermeture-referentiel.md) |
| R5 | Gouvernance | [Fermeture documentaire R5](../referentiels/r5/05-fermeture-referentiel.md) |
| R6 | Déploiement | [Référentiel de déploiement](./r6-deploiement/01-referentiel-deploiement.md) |
| R7 | Documentation publique | [Référentiel de documentation](./r7-documentation/01-referentiel-documentation-publique.md) |
| R8 | Intelligence d’assistance | [Référentiel d’assistance](./r8-intelligence-assistance/01-referentiel-intelligence-assistance.md) |
| R9 | Gouvernance des données | [Référentiel des données](./r9-donnees/01-referentiel-gouvernance-donnees.md) |
| R10 | Continuité opérationnelle | [Référentiel de continuité](./r10-continuite/01-referentiel-continuite-operationnelle.md) |
| R11 | Accessibilité | [Référentiel d’accessibilité](./r11-accessibilite/01-referentiel-accessibilite.md) |
| R12 | Performance | [Référentiel de performance](./r12-performance/01-referentiel-performance.md) |
| R13 | Observabilité | [Référentiel d’observabilité](./r13-observabilite/01-referentiel-observabilite.md) |
| R14 | Gestion des changements | [Référentiel des changements](./r14-changements/01-referentiel-gestion-changements.md) |
| R15 | Gestion des risques | [Référentiel des risques](./r15-risques/01-referentiel-gestion-risques.md) |
| R16 | Conformité | [Référentiel de conformité](./r16-conformite/01-referentiel-conformite.md) |
| R17 | Vie privée | [Référentiel de vie privée](./r17-vie-privee/01-referentiel-vie-privee.md) |
| R18 | Interfaces et intégrations | [Référentiel des intégrations](./r18-integrations/01-referentiel-api-integrations.md) |
| R19 | Expérience citoyenne | [Référentiel citoyen](./r19-experience-citoyenne/01-referentiel-experience-citoyenne.md) |
| R20 | Glossaire institutionnel | [Glossaire institutionnel](./r20-glossaire/01-glossaire-institutionnel.md) |

## Règles de gouvernance

- propriétaire du registre : responsables de maintenance du dépôt CityFlow;
- modification : branche dédiée et pull request avec intention, impacts, validation et limites;
- ajout ou retrait : mise à jour simultanée du registre et du contrôle automatique;
- compatibilité : aucune migration de chemin sans redirection documentaire ou note de migration;
- historique : Git et les pull requests fusionnées constituent le registre des versions;
- revue : à chaque changement d’un référentiel et lors de la revue documentaire périodique.

## Dette de structure connue

Les référentiels R1 à R5 utilisent le chemin historique `docs/referentiels`, alors que R6 à R20 utilisent `docs/references`. Cette différence est conservée temporairement pour éviter de rompre les liens existants. Toute normalisation future devra être réalisée dans un changement séparé, avec vérification des liens et stratégie de migration.

## Contrôle automatique

Le script `scripts/validate-reference-registry.mjs` vérifie :

- la présence des vingt entrées R1 à R20;
- l’unicité de chaque identifiant;
- l’existence des documents liés;
- la présence d’un titre principal, d’un statut et d’une barrière dans chaque document;
- l’absence de champs de gouvernance vides;
- le maintien explicite de la dette de structure connue.

## Limites

- le registre confirme l’accessibilité et la structure des documents, pas leur application réelle;
- un référentiel ne constitue pas une certification, une autorisation de production ou une preuve d’efficacité;
- chaque affirmation opérationnelle doit rester reliée à des preuves, responsables, environnements et dates vérifiables.

## Barrière finale

La présence d’un référentiel signifie qu’un cadre documentaire existe. Elle ne démontre ni conformité générale, ni sécurité, ni capacité opérationnelle, ni acceptation institutionnelle.