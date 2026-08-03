# SMTP_PASSWORD_RECOVERY

> **ID Document :** OPS-AUTH-SMTP-001  
> **Statut :** À valider avant production  
> **Propriétaire :** Équipe technique CityFlow  
> **Version :** 1.0.0  
> **Dernière révision :** 2026-08-03

## Intention

Documenter la configuration SMTP requise pour la récupération du mot de passe et fournir un exemple compatible avec SMTP2GO sans exposer de secret.

## Périmètre

- route `POST /api/v1/auth/forgot-password`;
- route `POST /api/v1/auth/reset-password`;
- transport Nodemailer;
- variables d’environnement;
- validation local, test, staging et production.

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

Les identifiants SMTP2GO réels doivent être injectés par le gestionnaire de secrets de l’environnement. Ils ne doivent jamais être committés, copiés dans une capture ou écrits dans les journaux.

## Variables

| Variable | Obligatoire | Description |
|---|---:|---|
| `SMTP_HOST` | Oui | Hôte SMTP. Pour SMTP2GO : `mail.smtp2go.com`. |
| `SMTP_PORT` | Oui | Port SMTP valide. La référence utilise `587`. |
| `SMTP_SECURE` | Oui | `false` avec STARTTLS sur le port 587; `true` seulement avec un port TLS direct adapté. |
| `SMTP_USER` | Oui en production | Nom d’utilisateur SMTP2GO. |
| `SMTP_PASSWORD` | Oui avec `SMTP_USER` | Mot de passe SMTP2GO. |
| `MAIL_FROM` | Oui | Expéditeur autorisé et vérifié chez le fournisseur. |
| `PUBLIC_APP_URL` | Oui | Origine publique utilisée pour construire le lien de réinitialisation. |

## Comportement de sécurité

- la réponse demeure identique qu’un utilisateur existe ou non;
- les utilisateurs inactifs ne reçoivent aucun lien;
- le jeton expire après 30 minutes;
- le jeton contient l’identifiant utilisateur, son usage et la version temporelle du compte;
- aucune donnée dérivée du mot de passe n’est incluse dans le jeton;
- un changement de mot de passe modifie `updatedAt` et invalide les anciens jetons;
- une erreur SMTP est journalisée sans identifiant SMTP ni mot de passe;
- l’échec SMTP n’expose aucune information au demandeur.

## Validation par environnement

### Local

Utiliser les valeurs factices de `.env.example` ou un compte SMTP2GO de test. Ne pas utiliser une adresse expéditrice de production.

### Test automatisé

Nodemailer doit être simulé. Aucun courriel externe ne doit être envoyé par Jest.

### Staging

- injecter les secrets SMTP2GO de staging;
- vérifier que `MAIL_FROM` correspond à un expéditeur autorisé;
- vérifier le lien vers l’URL de staging;
- réaliser un seul essai de réception contrôlé.

### Production

- injecter les secrets par le gestionnaire de secrets;
- vérifier SPF, DKIM et l’expéditeur autorisé dans SMTP2GO;
- confirmer `PUBLIC_APP_URL` avec le domaine public final;
- ne jamais afficher les secrets dans les journaux CI/CD.

## Commande de test ciblée

```bash
cd backend
npx jest tests/integration/password-recovery.test.js --runInBand --silent
```

## Traçabilité

- **Exigences :** récupération sécurisée et configuration SMTP vérifiable.
- **Décisions :** exemple SMTP2GO sur le port 587 avec STARTTLS; secrets hors dépôt.
- **Risques :** délivrabilité dépendante du fournisseur, du domaine et des DNS.
- **Changements :** route de récupération, `.env.example`, test ciblé et présent document.
- **Tests :** `backend/tests/integration/password-recovery.test.js`.
- **Preuves :** configuration factice, assertions Nodemailer et diff de la PR.
- **Validations :** réception réelle staging/production encore requise.

## Limites

- Aucun compte SMTP2GO réel n’est accessible dans l’environnement de l’agent.
- La présence de SPF et DKIM ne peut pas être confirmée depuis le dépôt.
- Ce document ne prouve pas la délivrabilité réelle en production.

## Historique

| Version | Date | Changement |
|---|---|---|
| 1.0.0 | 2026-08-03 | Configuration initiale SMTP2GO et procédure de validation. |
