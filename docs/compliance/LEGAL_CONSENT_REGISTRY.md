# Registre légal des consentements CityFlow

> **ID Document :** CITYFLOW-LEGAL-CONSENT-001  
> **Statut :** Préparation technique — validation juridique requise  
> **Version :** 1.0.0  
> **Date :** 2026-08-03

## Intention

Conserver une preuve versionnée, horodatée et auditable du consentement obligatoire fourni pendant l’inscription publique.

## Périmètre

Le registre couvre les conditions d’utilisation `LEGAL-TERMS-001` et la politique de confidentialité `LEGAL-PRIVACY-QC-001`, version `0.1.0`, acceptées par la case unique explicite du formulaire d’inscription.

## Décisions

- identifiants et versions contrôlés côté serveur;
- horodatage produit par PostgreSQL;
- création du compte et des preuves dans une transaction unique;
- registre append-only protégé par déclencheurs;
- aucun consentement rétroactif inventé;
- aucune adresse IP ni aucun user-agent conservé sans nécessité démontrée;
- requêtes SQL paramétrées avec `$executeRaw`, sans `$executeRawUnsafe`.

## Comptes historiques

L’absence d’événement indique uniquement qu’aucune preuve versionnée n’est disponible dans ce registre.

## Conservation

La durée définitive demeure soumise au calendrier `LEGAL-RETENTION-QC-001` et à son approbation juridique.

## Audit

Les index permettent la recherche par utilisateur, municipalité, type de consentement, document et version. Aucune route publique d’audit n’est ajoutée.

## Limites

- aucune interface de retrait;
- schéma Prisma typé non ajouté;
- validation juridique et exécution sur PostgreSQL réel encore requises.

## Dérogation

Aucune collecte d’adresse IP ou de user-agent, faute de nécessité et de proportionnalité démontrées.

> Cette documentation ne remplace pas un avis juridique fourni par un professionnel autorisé au Québec.
