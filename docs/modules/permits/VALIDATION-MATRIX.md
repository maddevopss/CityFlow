# Matrice de validation — Permis municipaux

| Capacité | Chemin positif | Entrée invalide | Rôle interdit | Mauvaise municipalité | Conflit métier | Erreur interne |
|---|---:|---:|---:|---:|---:|---:|
| Ingestion | Oui | Oui | Oui | Oui | Oui | Oui |
| Registre et détail | Oui | Oui | Oui | Oui | Sans objet | Oui |
| Cycle décisionnel | Oui | Oui | Oui | Oui | Oui | Oui |
| Pièces justificatives | Oui | Oui | Oui | Oui | Oui | Oui |
| Catalogue des exigences | Oui | Oui | Oui | Oui | Oui | Oui |
| Conformité documentaire | Oui | Oui | Oui | Oui | Oui | Oui |
| Frais et paiement | Oui | Oui | Oui | Oui | Oui | Oui |
| Dispense | Oui | Oui | Oui | Oui | Oui | Oui |
| Délivrance | Oui | Oui | Oui | Oui | Oui | Oui |

## Barrières transversales

- compilation frontend TypeScript;
- tests frontend avec environnement de test séparé du build;
- tests backend avec couverture globale des branches supérieure ou égale à 70 %;
- validation des migrations Prisma et PostgreSQL;
- CodeQL sans nouvelle alerte élevée;
- gouvernance de PR avec toutes les sections obligatoires;
- documentation Markdown validée.

## Régressions à prévenir

- rôle TypeScript non déclaré;
- usage d’une API JavaScript non comprise dans la cible de compilation;
- test frontend inclus par erreur dans le build sans types du moteur de test;
- mock Prisma incomplet après ajout d’un modèle;
- route autorisée sans limiteur de débit;
- impact documentaire déclaré sans document nommé;
- ajout de branches métier faisant tomber la couverture sous le seuil.

## Critère de fermeture

Le module peut être déclaré fermé lorsque les PR de sécurité, exploitation, observabilité et validation sont fusionnées, que la comparaison finale avec `main` contient tous les documents attendus et que les vérifications obligatoires sont vertes.