const jwt = require('jsonwebtoken');
const config = require('../../config');
const prisma = require('../../db/prisma');

async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token manquant' });
  }
  
  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, config.jwtSecret);
    const user = await prisma.user.findUnique({
      where: { id: decoded.sub },
      select: { isActive: true }
    });

    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'Session invalide' });
    }

    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token invalide' });
  }
}

function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }
    next();
  };
}

module.exports = { authenticate, authorize };
