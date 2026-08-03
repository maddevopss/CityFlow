const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const nodemailer = require('nodemailer');
const prisma = require('../../db/prisma');
const config = require('../../config');
const { loginLimiter } = require('../middleware/rateLimiters');

const router = express.Router();
const genericMessage = { message: 'Si un compte correspond, les instructions ont été envoyées' };
const emailSchema = Joi.object({
  email: Joi.string().trim().lowercase().email({ tlds: { allow: false } }).max(254).required()
});
const resetSchema = Joi.object({
  token: Joi.string().required(),
  password: Joi.string().min(12).max(128).required(),
  passwordConfirmation: Joi.ref('password')
});

function getSmtpConfig() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const secure = process.env.SMTP_SECURE === 'true';
  const user = process.env.SMTP_USER;
  const password = process.env.SMTP_PASSWORD;
  const from = process.env.MAIL_FROM;
  const publicAppUrl = process.env.PUBLIC_APP_URL;

  const missing = [
    ['SMTP_HOST', host],
    ['MAIL_FROM', from],
    ['PUBLIC_APP_URL', publicAppUrl]
  ]
    .filter(([, value]) => !value)
    .map(([name]) => name);

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('SMTP_PORT doit être un entier entre 1 et 65535');
  }
  if ((user && !password) || (!user && password)) {
    throw new Error('SMTP_USER et SMTP_PASSWORD doivent être fournis ensemble');
  }
  if (missing.length) {
    throw new Error(`Configuration SMTP incomplète: ${missing.join(', ')}`);
  }

  return {
    host,
    port,
    secure,
    auth: user ? { user, pass: password } : undefined,
    from,
    publicAppUrl
  };
}

function logMailFailure(error, userId) {
  console.error(
    JSON.stringify({
      level: 'error',
      event: 'password_recovery_email_failed',
      error: error instanceof Error ? error.message : 'Erreur SMTP inconnue',
      userId
    })
  );
}

router.post('/forgot-password', loginLimiter, async (req, res) => {
  const { error, value } = emailSchema.validate(req.body, { stripUnknown: true });
  if (error) return res.status(202).json(genericMessage);

  const user = await prisma.user.findUnique({ where: { email: value.email } });
  if (!user || !user.isActive) return res.status(202).json(genericMessage);

  try {
    const smtp = getSmtpConfig();
    const token = jwt.sign(
      {
        sub: user.id,
        purpose: 'password-reset',
        userVersion: user.updatedAt.toISOString()
      },
      config.jwtSecret,
      { expiresIn: '30m' }
    );
    const transporter = nodemailer.createTransport({
      host: smtp.host,
      port: smtp.port,
      secure: smtp.secure,
      auth: smtp.auth
    });
    await transporter.sendMail({
      from: smtp.from,
      to: user.email,
      subject: 'Réinitialisation de votre mot de passe CityFlow',
      text: `Ouvrez ce lien dans les 30 prochaines minutes : ${smtp.publicAppUrl}/reset-password/${token}`
    });
  } catch (smtpError) {
    logMailFailure(smtpError, user.id);
  }

  return res.status(202).json(genericMessage);
});

router.post('/reset-password', loginLimiter, async (req, res) => {
  const { error, value } = resetSchema.validate(req.body, { stripUnknown: true });
  if (error) return res.status(400).json({ message: 'Lien invalide ou expiré' });

  try {
    const payload = jwt.verify(value.token, config.jwtSecret);
    if (payload.purpose !== 'password-reset') throw new Error('purpose');

    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user || !user.isActive || user.updatedAt.toISOString() !== payload.userVersion) {
      throw new Error('user-version');
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { password: await bcrypt.hash(value.password, 12) }
    });
    return res.status(204).send();
  } catch {
    return res.status(400).json({ message: 'Lien invalide ou expiré' });
  }
});

module.exports = router;
