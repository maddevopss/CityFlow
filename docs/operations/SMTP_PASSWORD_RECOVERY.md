# SMTP_PASSWORD_RECOVERY

> **ID Document :** OPS-AUTH-SMTP-001  
> **Statut :** À valider avant production  
> **Propriétaire :** Équipe technique CityFlow  
> **Version :** 1.0.0  
> **Dernière révision :** 2026-08-03

## Intention

Documenter la configuration SMTP requise pour la récupération du mot de passe et fournir un exemple compatible avec SMTP2GO sans exposer de secret.

## Configuration SMTP2GO de référence

```env
SMTP_HOST="mail.smtp2go.com"
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER="replace-with-smtp2go-username"
SMTP_PASSWORD="replace-with-smtp2go-password"
MAIL_FROM="CityFlow <no-reply@example.invalid>"
PUBLIC_APP_URL="https://cityflow.example.invalid"
```

Les identifiants réels doivent être injectés par le gestionnaire de secrets de l’environnement et ne jamais être committés.

## Sécurité

- réponse identique qu’un utilisateur existe ou non;
- utilisateurs inactifs exclus;
- jeton expirant après 30 minutes;
- aucune donnée dérivée du mot de passe dans le jeton;
- invalidation après modification du compte via `updatedAt`;
- journalisation des erreurs sans secret;
- tests automatisés sans envoi externe.

## Validation ciblée

```bash
cd backend
npx jest tests/integration/password-recovery.test.js --runInBand --silent
```

## Validation par environnement

- **Local :** valeurs factices ou compte SMTP2GO de test.
- **Test :** Nodemailer simulé; aucun courriel externe.
- **Staging :** secret SMTP2GO injecté et essai unique contrôlé.
- **Production :** SPF, DKIM, DMARC, expéditeur et URL publique confirmés.

## Limites

- réception réelle non vérifiée;
- configuration DNS non démontrable depuis le dépôt;
- secrets volontairement absents.

## Historique

| Version | Date | Changement |
|---|---|---|
| 1.0.0 | 2026-08-03 | Configuration initiale SMTP2GO et procédure de validation. |
