# SMTP_PASSWORD_RECOVERY

> **ID Document :** OPS-AUTH-SMTP-001  
> **Statut :** À valider avant production  
> **Propriétaire :** Équipe technique CityFlow  
> **Version :** 1.0.0  
> **Dernière révision :** 2026-08-03

## Intention

Documenter la configuration SMTP requise pour la récupération du mot de passe avec SMTP2GO, sans exposer de secret.

## Configuration de référence

```env
SMTP_HOST="mail.smtp2go.com"
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER="replace-with-smtp2go-username"
SMTP_PASSWORD="replace-with-smtp2go-password"
MAIL_FROM="CityFlow <no-reply@example.invalid>"
PUBLIC_APP_URL="https://cityflow.example.invalid"
```

Les identifiants réels doivent être injectés par le gestionnaire de secrets et ne doivent jamais être committés ou journalisés.

## Garanties

- réponse identique qu’un utilisateur existe ou non;
- aucun lien pour un utilisateur inactif;
- jeton limité à 30 minutes;
- aucune donnée dérivée du mot de passe dans le jeton;
- invalidation après changement du mot de passe via `updatedAt`;
- erreurs SMTP journalisées sans secret;
- exemple SMTP2GO sur le port 587 avec STARTTLS.

## Validation ciblée

```bash
cd backend
npx jest tests/integration/password-recovery.test.js --runInBand --silent
```

En staging, vérifier une réception contrôlée, l’expéditeur autorisé, `PUBLIC_APP_URL`, SPF et DKIM.

## Traçabilité

- **Exigences :** récupération sécurisée et configuration SMTP vérifiable.
- **Décisions :** SMTP2GO, port 587, STARTTLS et secrets hors dépôt.
- **Risques :** délivrabilité dépendante du fournisseur et des DNS.
- **Changements :** route, environnement, interface, tests et présent document.
- **Tests :** `backend/tests/integration/password-recovery.test.js`.
- **Preuves :** assertions Nodemailer et configuration factice.
- **Validations :** réception réelle staging/production encore requise.

## Limites

Aucun compte SMTP2GO réel ni preuve DNS n’est accessible dans l’environnement de l’agent.

## Historique

| Version | Date | Changement |
|---|---|---|
| 1.0.0 | 2026-08-03 | Configuration initiale SMTP2GO. |
