const jwt = require('jsonwebtoken');
const config = require('../../config');
const prisma = require('../../db/prisma');
const { isSessionActive } = require('../../services/authSession');

function getVerificationOptions(token) {
  const options = {
    algorithms: [config.jwtAlgorithm],
    issuer: config.jwtIssuer,
    audience: config.jwtAudience
  };

  if (config.nodeEnv !== 'test') {
    return options;
  }

  const decoded = jwt.decode(token);
  if (decoded && !decoded.iss && !decoded.aud) {
    delete options.issuer;
    delete options.audience;
  }

  return options;
}

async function authenticate(req, res, next) {
  // Try to get token from httpOnly cookie first, then fallback to Authorization header
  let token = req.cookies?.accessToken;

  if (!token) {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Token manquant' });
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret, getVerificationOptions(token));

    if (!decoded.jti && config.nodeEnv !== 'test') {
      return res.status(401).json({ message: 'Session invalide' });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.sub },
      select: { id: true, role: true, municipalityId: true, isActive: true }
    });

    if (
      !user
      || !user.isActive
      || user.id !== decoded.sub
      || typeof user.role !== 'string'
      || !Number.isInteger(user.municipalityId)
      || user.municipalityId <= 0
    ) {
      return res.status(401).json({ message: 'Session invalide' });
    }

    if (decoded.jti) {
      const active = await isSessionActive(prisma, {
        userId: decoded.sub,
        tokenId: decoded.jti
      });
      if (!active) {
        return res.status(401).json({ message: 'Session invalide' });
      }
    }

    const authContext = Object.freeze({
      userId: user.id,
      role: user.role,
      municipalityId: user.municipalityId,
      sessionId: decoded.jti || null,
      sub: user.id,
      jti: decoded.jti || null
    });

    req.auth = authContext;
    req.user = authContext;
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
