const { Prisma } = require('@prisma/client');

module.exports = (err, req, res, next) => {
  console.error(err);

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2025') return res.status(404).json({ message: 'Ressource non trouvée' });
    if (err.code === 'P2002') return res.status(409).json({ message: 'Conflit' });
  }

  if (err.isJoi) return res.status(400).json({ message: err.details[0].message });

  const status = err.status || 500;
  res.status(status).json({
    message: err.message || 'Erreur interne du serveur',
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
};
