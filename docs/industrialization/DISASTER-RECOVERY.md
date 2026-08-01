# Sauvegardes et reprise après sinistre

## Objectifs

- RPO cible : 15 minutes pour les données transactionnelles;
- RTO cible : 4 heures pour le service complet;
- sauvegardes chiffrées, immuables et séparées de la production;
- restauration testée sur une base isolée;
- preuve horodatée de chaque exercice.

## Procédure

1. Geler les changements non essentiels.
2. Identifier le dernier point de restauration valide.
3. Restaurer dans un environnement isolé.
4. Vérifier schéma, contraintes, volumes et échantillons métier.
5. Exécuter les tests de fumée.
6. Documenter l’écart RPO/RTO.
7. Obtenir l’autorisation avant bascule.

## Interdictions

Aucun exercice automatisé ne doit viser une URL contenant `prod` ou `production`. Les secrets de sauvegarde ne doivent jamais être imprimés.

## Preuves exigées

- identifiant de sauvegarde;
- empreinte de l’artefact;
- durée de restauration;
- résultats des validations;
- décision GO/NO-GO;
- actions correctives.
