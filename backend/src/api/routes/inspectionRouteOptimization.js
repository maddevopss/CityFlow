const express = require('express');
const Joi = require('joi');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();
const point = Joi.object({ id: Joi.string().required(), latitude: Joi.number().min(-90).max(90).required(), longitude: Joi.number().min(-180).max(180).required() });
const schema = Joi.object({ origin: point.required(), stops: Joi.array().items(point).min(1).max(100).required() });

function distance(a, b) {
  const dx = a.latitude - b.latitude;
  const dy = a.longitude - b.longitude;
  return Math.sqrt(dx * dx + dy * dy);
}

router.use(authenticate, authorize('ADMIN', 'MUNICIPAL_AGENT', 'INSPECTOR'));

router.post('/', (req, res) => {
  const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
  if (error) return res.status(400).json({ message: 'Tournée invalide', details: error.details.map(d => d.message) });

  const remaining = [...value.stops];
  const ordered = [];
  let cursor = value.origin;
  let totalDistance = 0;
  while (remaining.length) {
    let index = 0;
    for (let i = 1; i < remaining.length; i += 1) {
      if (distance(cursor, remaining[i]) < distance(cursor, remaining[index])) index = i;
    }
    const [next] = remaining.splice(index, 1);
    const legDistance = distance(cursor, next);
    totalDistance += legDistance;
    ordered.push({ ...next, legDistance });
    cursor = next;
  }

  res.json({ strategy: 'NEAREST_NEIGHBOUR', orderedStops: ordered, totalDistance });
});

module.exports = router;
