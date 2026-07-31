# C12 — Checklist de revue de sécurité

## Statut

**CHECKLIST DISPONIBLE — AUCUNE SÉCURITÉ ATTESTÉE**

## Objet

Vérifier les contrôles de sécurité applicables à une fonctionnalité, un service, une API, une donnée ou un changement CityFlow.

## Critères d’entrée

- [ ] la portée et la version sont figées;
- [ ] les actifs, données, utilisateurs et dépendances sont identifiés;
- [ ] les environnements et frontières de confiance sont documentés;
- [ ] les risques connus et obligations applicables sont disponibles;
- [ ] le responsable de la revue et l’autorité de décision sont nommés.

## Contrôles

- [ ] l’authentification et l’autorisation sont adaptées aux rôles;
- [ ] le moindre privilège est appliqué;
- [ ] les secrets ne sont ni exposés ni intégrés au code;
- [ ] les entrées, sorties et fichiers sont validés;
- [ ] les données sensibles sont protégées en transit et au repos;
- [ ] les journaux évitent les secrets et données non nécessaires;
- [ ] les erreurs ne divulguent pas d’information sensible;
- [ ] les dépendances et versions vulnérables sont examinées;
- [ ] les limites, quotas et protections contre les abus sont définis;
- [ ] la séparation des organisations et territoires est testée;
- [ ] les sauvegardes, restaurations et révocations sont vérifiées;
- [ ] les scénarios de défaillance et d’incident sont exercés.

## Validation

- [ ] les tests automatisés et manuels sont reliés à la portée;
- [ ] les résultats bruts et limites sont conservés;
- [ ] les constats ont une gravité, un responsable et une échéance;
- [ ] les risques résiduels sont explicitement acceptés ou refusés;
- [ ] les dérogations sont inscrites dans T5;
- [ ] T2, T6, T7, T8 et T14 sont mis à jour selon la portée.

## Verdict

- verdict : `ACCEPTABLE / ACCEPTABLE AVEC RÉSERVES / NON ACCEPTABLE / INCONCLUSIF`;
- version et environnement :
- autorité :
- date :
- preuves :
- réserves :

## Critères de sortie

- [ ] aucun constat critique non traité n’est dissimulé;
- [ ] les réserves sont visibles dans la décision de livraison;
- [ ] les actions restantes sont suivies;
- [ ] la prochaine revue est déclenchée par une date ou un événement.

## Barrière finale

Cette revue ne garantit pas l’absence de vulnérabilité. Elle décrit les contrôles exécutés, les résultats obtenus et les limites connues pour une portée précise.
