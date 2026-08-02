# Checklist de déploiement — CityFlow 1.0

## 1. Préparation

- [ ] La PR de livraison est fusionnée sur `main`.
- [ ] Le commit exact à déployer est consigné.
- [ ] Toutes les barrières CI sont vertes.
- [ ] Les alertes CodeQL bloquantes sont fermées.
- [ ] Une sauvegarde PostgreSQL restaurable a été produite.
- [ ] La version Redis cible est disponible.

## 2. Configuration

- [ ] `NODE_ENV=production`.
- [ ] `DATABASE_URL` pointe vers la base de production dédiée.
- [ ] `REDIS_URL` pointe vers l’instance protégée.
- [ ] `JWT_SECRET` contient au moins 32 caractères aléatoires.
- [ ] Le secret du webhook permis est distinct du secret JWT.
- [ ] `FRONTEND_URL` correspond exactement à l’origine HTTPS autorisée.
- [ ] Aucun secret n’est présent dans le dépôt ou l’image.

## 3. Base de données

- [ ] Les migrations sont examinées avant exécution.
- [ ] Les migrations ont été testées sur une copie de préproduction.
- [ ] Le client Prisma est généré pour la version livrée.
- [ ] Les données initiales nécessaires sont présentes.
- [ ] Le compte applicatif possède uniquement les permissions requises.

## 4. Backend

- [ ] L’image est construite depuis le commit consigné.
- [ ] Le processus API démarre sans avertissement critique.
- [ ] Les workers requis démarrent séparément.
- [ ] `GET /health` retourne HTTP 200.
- [ ] `/health` retourne `service: cityflow-backend`.
- [ ] `/health` retourne `version: 1.0.0`.
- [ ] Les métriques HTTP refusent les utilisateurs non administrateurs.

## 5. Frontend

- [ ] `npm run build` réussit.
- [ ] Le budget de bundle réussit.
- [ ] L’URL de l’API correspond au backend livré.
- [ ] La connexion, la navigation protégée et la déconnexion fonctionnent.
- [ ] Les parcours permis, inspection et demande citoyenne chargent sans erreur console bloquante.

## 6. Vérifications fonctionnelles minimales

- [ ] Création et consultation d’un événement routier.
- [ ] Consultation d’un permis et de ses documents.
- [ ] Création ou affectation d’une inspection.
- [ ] Consultation du calendrier d’inspection.
- [ ] Création et suivi d’une demande citoyenne.
- [ ] Consultation des notifications.
- [ ] Export GeoJSON avec paramètres valides.
- [ ] Webhook de permis signé accepté; signature incorrecte refusée.

## 7. Exploitation

- [ ] Les journaux applicatifs sont centralisés.
- [ ] Les alertes de disponibilité sont actives.
- [ ] Les sauvegardes automatiques sont configurées.
- [ ] La rétention des journaux et données est approuvée.
- [ ] Un responsable est nommé pour les incidents du pilote.

## 8. Retour arrière

- [ ] L’image précédente est conservée.
- [ ] La procédure de restauration de base a été testée.
- [ ] Le seuil déclenchant le retour arrière est défini.
- [ ] Le responsable autorisé à déclencher le retour arrière est identifié.
- [ ] Après retour arrière, `/health` et les parcours minimaux sont revérifiés.

## Verdict

La livraison est autorisée uniquement lorsque toutes les cases applicables sont cochées et que les exceptions sont documentées, approuvées et traçables.
