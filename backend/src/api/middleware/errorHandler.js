const { Prisma } = require('@prisma/client');
const logger = require('../../logger');

// Map of error messages that are safe to expose to clients
const SAFE_ERROR_MESSAGES = new Map([
  ['ValidationError', 'Données invalides'],
  ['NotFoundError', 'Ressource non trouvée'],
  ['ConflictError', 'Conflit lors du traitement'],
  ['UnauthorizedError', 'Authentification requise'],
  ['ForbiddenError', 'Accès non autorisé'],
  ['RateLimitError', 'Trop de requêtes']
]);

function getSafeErrorMessage(err, status) {
  // Return safe error message, never the raw error message from exception
  if (err.isJoi) return 'Données invalides';
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2025') return 'Ressource non trouvée';
    if (err.code === 'P2002') return 'Conflit lors du traitement';
  }
  if (SAFE_ERROR_MESSAGES.has(err.name)) {
    return SAFE_ERROR_MESSAGES.get(err.name);
  }
  // For 5xx errors, always return generic message
  if (status >= 500) return 'Erreur interne du serveur';
  return 'Erreur lors du traitement de la requête';
}

module.exports = (err, req, res, next) => {
  // Log full error details server-side only
  logger.error(err.message, {
    stack: err.stack,
    path: req.path,
    method: req.method,
    errorName: err.name,
    errorCode: err.code,
    requestId: req.requestId
  });

  // Handle known error types with specific status codes
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2025') return res.status(404).json({ message: 'Ressource non trouvée' });
    if (err.code === 'P2002') return res.status(409).json({ message: 'Conflit lors du traitement' });
  }

  if (err.isJoi) return res.status(400).json({ message: 'Données invalides' });

  const status = err.status || 500;
  const safeMessage = getSafeErrorMessage(err, status);

  // Send only safe message to client, never expose internal error details
  res.status(status).json({
    message: safeMessage,
    ...(process.env.NODE_ENV !== 'production' && { requestId: req.requestId })
  });
};
