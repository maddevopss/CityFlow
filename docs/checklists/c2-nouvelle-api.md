# C2 — Checklist nouvelle API

## Statut

**CHECKLIST OPÉRATIONNELLE — AUCUNE API APPROUVÉE PAR CE DOCUMENT**

## Objet

Contrôler la création ou l’exposition d’une interface de programmation CityFlow avant son utilisation réelle.

## Critères d’entrée

- [ ] finalité, propriétaire et consommateurs identifiés;
- [ ] données lues, produites ou modifiées recensées;
- [ ] dépendances et obligations applicables connues;
- [ ] version initiale et stratégie de compatibilité définies.

## Contrat

- [ ] routes, méthodes, schémas et erreurs documentés;
- [ ] authentification et autorisation explicites;
- [ ] idempotence, pagination, limites et délais définis;
- [ ] exemples valides et invalides fournis;
- [ ] politique de dépréciation et retrait prévue.

## Sécurité et données

- [ ] validation des entrées et sorties mise en place;
- [ ] secrets et données sensibles protégés;
- [ ] contrôle d’accès testé pour chaque rôle;
- [ ] journalisation sans exposition indue;
- [ ] abus, quotas et limitation de débit traités.

## Validation

- [ ] tests de contrat et d’intégration exécutés;
- [ ] erreurs, reprise et indisponibilité simulées;
- [ ] compatibilité avec les consommateurs vérifiée;
- [ ] observabilité et alertes confirmées;
- [ ] documentation publiée avec la version exacte.

## Décision et exploitation

- [ ] responsable autorisant identifié;
- [ ] critères go/no-go examinés;
- [ ] plan de surveillance et soutien défini;
- [ ] registre T10 et dépendances associées mis à jour;
- [ ] preuve d’approbation archivée.

## Barrière finale

Une API qui satisfait cette checklist n’est pas automatiquement sécurisée, stable ou disponible. Les preuves doivent couvrir une version, un environnement, des consommateurs et une période déterminés.
