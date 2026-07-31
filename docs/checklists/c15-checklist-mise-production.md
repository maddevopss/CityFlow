# C15 — Checklist de mise en production

## Statut

**CHECKLIST DISPONIBLE — AUCUNE MISE EN PRODUCTION AUTORISÉE**

## Objet

Établir la décision finale autorisant ou refusant l’exposition d’une version CityFlow dans un environnement de production.

## Critères d’entrée

- [ ] la version candidate est immuable et identifiable;
- [ ] l’environnement cible est inscrit dans T11;
- [ ] les changements sont inscrits dans T4 et la version dans T12;
- [ ] les validations fonctionnelles, sécurité, données et exploitation sont terminées;
- [ ] les risques et dérogations sont visibles;
- [ ] les responsables métier, technique et opérationnel sont disponibles.

## Préparation

- [ ] les critères d’acceptation et de santé sont mesurables;
- [ ] les sauvegardes et restaurations sont vérifiées;
- [ ] le plan de déploiement et le retour arrière sont testés;
- [ ] les migrations sont réversibles ou accompagnées d’une restauration;
- [ ] les journaux, métriques, alertes et tableaux de bord sont actifs;
- [ ] les communications et canaux de soutien sont prêts;
- [ ] la capacité, les quotas et les dépendances sont confirmés;
- [ ] les parcours citoyens et opérationnels critiques sont validés.

## Décision go/no-go

- [ ] les preuves et résultats bruts sont accessibles;
- [ ] aucun échec critique n’est dissimulé;
- [ ] les réserves ont un responsable et une échéance;
- [ ] l’autorité compétente rend un verdict daté;
- [ ] le verdict est `GO`, `GO CONDITIONNEL`, `NO-GO` ou `REPORTÉ`;
- [ ] les critères d’arrêt immédiat sont rappelés.

## Après activation

- [ ] la version réellement active est vérifiée;
- [ ] la santé technique et les parcours critiques sont contrôlés;
- [ ] l’intégrité et la fraîcheur des données sont examinées;
- [ ] la surveillance renforcée couvre la période convenue;
- [ ] les incidents, anomalies et décisions sont journalisés;
- [ ] T4, T11, T12, T14 et T19 sont mis à jour;
- [ ] la revue après mise en production est planifiée.

## Verdict final

- verdict :
- version et environnement :
- autorité :
- date et heure :
- preuves :
- réserves et conditions :

## Barrière finale

Cette checklist ne constitue pas à elle seule une autorisation. Seule une décision explicite, fondée sur des preuves actuelles et limitée à une version et un environnement précis, permet la mise en production.
