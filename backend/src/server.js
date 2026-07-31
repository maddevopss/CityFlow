const http = require('http');
const jwt = require('jsonwebtoken');
const app = require('./app');
const { Server } = require('socket.io');
const config = require('./config');
const logger = require('./logger');

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: config.frontendUrl }
});

io.use((socket, next) => {
  const authorization = socket.handshake.headers.authorization;
  const bearerToken = authorization?.startsWith('Bearer ')
    ? authorization.slice('Bearer '.length)
    : null;
  const token = socket.handshake.auth?.token || bearerToken;

  if (!token) {
    return next(new Error('Authentification Socket.IO requise'));
  }

  try {
    const user = jwt.verify(token, config.jwtSecret);
    if (!user.municipalityId) {
      return next(new Error('Municipalité absente du jeton'));
    }

    socket.user = user;
    next();
  } catch (error) {
    next(new Error('Jeton Socket.IO invalide'));
  }
});

io.on('connection', (socket) => {
  const room = `municipality_${socket.user.municipalityId}`;
  socket.join(room);
  logger.info(`Client connecté à ${room}`, { socketId: socket.id });
});

app.set('io', io);

process.on('unhandledRejection', (reason) => {
  logger.error('Rejet de promesse non géré', {
    error: reason instanceof Error ? reason.message : reason,
    stack: reason instanceof Error ? reason.stack : undefined
  });
});

process.on('uncaughtException', (error) => {
  logger.error('Exception non interceptée, arrêt du processus', {
    error: error.message,
    stack: error.stack
  });
  process.exit(1);
});

server.listen(config.port, () => {
  logger.info(`🚀 CityFlow API démarrée sur le port ${config.port}`);
});
