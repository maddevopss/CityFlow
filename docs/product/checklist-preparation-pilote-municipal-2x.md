---
Projet: CityFlow
Document: Checklist de préparation du pilote municipal 2.x
Version: 1.0.0
Dernière révision: 2026-07-31
Statut: Proposition
Auteur: MAD DevOps
---

# Checklist de préparation du pilote municipal 2.x

## Règle d’usage

Cette checklist sert de barrière avant toute autorisation limitée. Une case cochée doit pointer vers une preuve valide. « Prévu », « en cours » ou « probablement conforme » ne signifie pas satisfait.

## 1. Mandat et responsabilité

- [ ] Sponsor municipal nommé.
- [ ] Responsable CityFlow nommé.
- [ ] Autorité d’approbation finale identifiée.
- [ ] Responsables sécurité, vie privée, accessibilité et exploitation identifiés.
- [ ] Escalade hors heures définie.
- [ ] Durée et date de fin du pilote fixées.

## 2. Périmètre

- [ ] Municipalité unique confirmée.
- [ ] Territoire ou service borné.
- [ ] Utilisateurs et rôles nommés.
- [ ] Volumes maximaux définis.
- [ ] Données incluses et exclues inventoriées.
- [ ] Canaux de publication inclus et exclus identifiés.
- [ ] Toute extension exige une nouvelle décision.

## 3. Données et géographie

- [ ] Référentiel géographique approuvé.
- [ ] Provenance des données documentée.
- [ ] Cas limites territoriaux testés.
- [ ] Données fictives ou autorisées seulement.
- [ ] Règles de conservation définies.
- [ ] Méthode de restitution, anonymisation ou suppression définie.

## 4. Publication

- [ ] Machine d’états approuvée.
- [ ] Matrice des rôles testée.
- [ ] Approbation humaine finale obligatoire.
- [ ] Version approuvée liée à la version publiée.
- [ ] Vérification du canal cible automatisée ou documentée.
- [ ] Correction, suspension et retrait testés.
- [ ] Statut expérimental compréhensible par le public.

## 5. Isolation et accès

- [ ] Isolation intermunicipale testée côté serveur.
- [ ] Exports, recherches, caches et pièces jointes couverts.
- [ ] Tâches différées avec contexte municipal valide.
- [ ] Accès privilégiés temporaires et audités.
- [ ] Sessions et secrets révocables.
- [ ] Sauvegarde et restauration préservent les permissions.

## 6. Intégrations

- [ ] Chaque intégration a un contrat versionné.
- [ ] Propriétaire et finalité nommés.
- [ ] Idempotence démontrée.
- [ ] Quarantaine des messages invalides testée.
- [ ] Rotation des secrets testée.
- [ ] Suspension par municipalité possible.
- [ ] Réconciliation avant reprise définie.

## 7. Accessibilité et compréhension

- [ ] Parcours clavier vérifiés.
- [ ] Lecteur d’écran vérifié sur les parcours essentiels.
- [ ] Contrastes et zoom vérifiés.
- [ ] Messages d’erreur compréhensibles.
- [ ] Langage citoyen validé.
- [ ] Alternative accessible aux cartes disponible.
- [ ] Canal de signalement des obstacles actif.

## 8. Exploitation

- [ ] Tableau de bord opérationnel prêt.
- [ ] Seuils d’alerte définis.
- [ ] Procédure de soutien disponible.
- [ ] Journal de décisions et incidents prêt.
- [ ] Capacité et coûts estimés.
- [ ] Fenêtres de maintenance communiquées.
- [ ] Procédure de reprise répétée.

## 9. Incident et fermeture

- [ ] Déclencheurs d’arrêt acceptés.
- [ ] Personne autorisée à suspendre nommée.
- [ ] Contacts de notification vérifiés.
- [ ] Retrait d’une publication testé.
- [ ] Révocation des comptes et secrets testée.
- [ ] Export des preuves testé.
- [ ] Suppression des données temporaires testée.
- [ ] Rapport final préparé.

## 10. Preuves et décision

- [ ] Matrice de preuves complétée.
- [ ] Résultats négatifs consignés.
- [ ] Preuves critiques revues indépendamment.
- [ ] Risques résiduels acceptés explicitement.
- [ ] Conditions avec responsables et échéances.
- [ ] Décision d’autorisation limitée signée.
- [ ] Date de révision fixée.

## Verdict

Le pilote est :

- [ ] Non prêt;
- [ ] Prêt pour répétition sans diffusion;
- [ ] Prêt pour décision d’autorisation limitée;
- [ ] Suspendu;
- [ ] Retiré.

### Conditions ouvertes

| Condition | Responsable | Échéance | Preuve attendue | Conséquence |
|---|---|---|---|---|
| À préciser | À nommer | À fixer | À lier | Blocage / suspension |

## Principe de blocage

Toute case non satisfaite dans les domaines mandat, autorité humaine, isolation, provenance, accessibilité, publication vérifiée ou retour arrière bloque le lancement.