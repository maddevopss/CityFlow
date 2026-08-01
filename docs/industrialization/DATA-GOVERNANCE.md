# Gouvernance des données

## Principes

- minimisation des données collectées;
- classification publique, interne, confidentielle et hautement sensible;
- propriétaire et responsable identifiés pour chaque domaine;
- durée de conservation définie par catégorie;
- archivage chiffré et traçable;
- suppression vérifiable à l’échéance;
- gel légal prioritaire sur la suppression;
- export et rectification contrôlés;
- journal d’accès pour les données sensibles;
- isolement municipal maintenu dans les archives.

## Registre minimal

Chaque catégorie précise : finalité, base d’utilisation, source, champs, propriétaire, accès, durée active, durée archivée, méthode de destruction et exceptions.

## Automatisation

Les tâches de rétention doivent fonctionner en mode simulation, produire un rapport avant suppression et être idempotentes. Toute destruction exige un identifiant de lot et une preuve horodatée.

## GO / NO-GO

NO-GO si une catégorie n’a pas de propriétaire ou de durée, si une suppression est irréversible sans rapport préalable, si un gel légal est ignoré ou si une archive mélange plusieurs municipalités.
