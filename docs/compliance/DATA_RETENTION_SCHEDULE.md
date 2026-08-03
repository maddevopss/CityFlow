# DATA_RETENTION_SCHEDULE

> **ID Document :** LEGAL-RETENTION-QC-001  
> **Statut :** PROJET — APPROBATION RPRP REQUISE  
> **Version :** 0.1.0  
> **Propriétaire proposé :** Responsable de la protection des renseignements personnels  
> **Date :** 2026-08-03  
> **Périmètre :** Renseignements personnels traités par CityFlow

## Principe

Les renseignements sont conservés uniquement pendant la durée nécessaire aux finalités documentées, sous réserve d’une obligation légale ou contractuelle. À l’expiration, ils sont détruits de manière sécuritaire ou anonymisés de façon irréversible lorsque cette utilisation demeure sérieuse et légitime.

## Calendrier proposé

| Catégorie | Finalité | Déclencheur | Durée proposée | Sort final | Validation requise |
|---|---|---|---:|---|---|
| Comptes utilisateurs actifs | Accès, sécurité et administration | Fermeture ou désactivation du compte | Durée du compte | Conservation active | RPRP + direction |
| Comptes fermés | Défense des droits, audit et réactivation contrôlée | Fermeture du compte | 24 mois | Destruction ou anonymisation | Juriste + RPRP |
| Consentements légaux | Preuve d’acceptation ou de retrait | Dernier événement de consentement | 7 ans | Destruction sécuritaire | Juriste + RPRP |
| Journaux d’authentification | Sécurité et enquête | Création du journal | 12 mois | Destruction automatisée | Sécurité + RPRP |
| Journaux applicatifs contenant des identifiants | Exploitation, diagnostic et sécurité | Création du journal | 90 jours | Destruction automatisée | Exploitation + RPRP |
| Messages de contact | Traitement de la demande | Fermeture de la demande | 24 mois | Destruction ou anonymisation | Soutien + RPRP |
| Pièces jointes métier | Preuve et traitement municipal | Fermeture du dossier | Selon obligation municipale ou contrat | Destruction contrôlée | Municipalité + juriste |
| Sauvegardes | Continuité et restauration | Création de la sauvegarde | 35 jours | Rotation et destruction automatisées | Exploitation + RPRP |
| Incidents de confidentialité | Registre légal et suivi | Clôture de l’incident | Minimum légal applicable | Destruction sécuritaire | Juriste + RPRP |

## Règles d’exécution

- aucune durée ne devient normative sans approbation écrite;
- les obligations municipales ou contractuelles prévalent lorsqu’elles imposent une durée supérieure;
- une suspension de destruction peut être appliquée en cas de litige, enquête ou obligation légale;
- la destruction doit être vérifiable par un journal technique sans reproduire les données détruites;
- les sauvegardes expirées ne doivent pas être restaurées hors procédure autorisée.

## Approbation

| Rôle | Nom | Décision | Date | Preuve |
|---|---|---|---|---|
| Responsable de la protection des renseignements personnels | À désigner | En attente | — | — |
| Direction | À confirmer | En attente | — | — |
| Juriste québécois | À mandater | En attente | — | — |

## Limites

- Les durées sont des propositions opérationnelles, non un avis juridique.
- Les obligations propres aux municipalités clientes et aux contrats ne sont pas encore inventoriées.
- Le registre des incidents doit être aligné sur les délais légaux applicables lors de la révision juridique.

## Historique

| Version | Date | Changement |
|---|---|---|
| 0.1.0 | 2026-08-03 | Calendrier initial soumis à approbation |
