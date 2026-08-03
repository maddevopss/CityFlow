const express = require('express');
const Joi = require('joi');
const { publicReadLimiter } = require('../middleware/rateLimiters');

const router = express.Router();

const schema = Joi.object({
  name: Joi.string().trim().min(2).max(160).required(),
  email: Joi.string().trim().lowercase().email({ tlds: { allow: false } }).max(254).required(),
  organization: Joi.string().trim().max(160).allow('').default(''),
  subject: Joi.string().trim().min(2).max(160).required(),
  message: Joi.string().trim().min(10).max(4000).required(),
  website: Joi.string().allow('').max(0).default('')
});

router.post('/contact', publicReadLimiter, async (req, res) => {
  const { error, value } = schema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    return res.status(400).json({ message: 'Message invalide' });
  }

  console.info(
    JSON.stringify({
      event: 'public_contact_received',
      requestId: req.requestId,
      email: value.email,
      organization: value.organization,
      subject: value.subject,
      receivedAt: new Date().toISOString()
    })
  );

  return res.status(202).json({ message: 'Message reçu' });
});

module.exports = router;
