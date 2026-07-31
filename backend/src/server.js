const http = require('http');
const jwt = require('jsonwebtoken');
const app = require('./app');
const { Server } = require('socket.io');
const config = require('./config');

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
  console.log(`Client connecté à ${room}:`, socket.id);
});

app.set('io', io);

server.listen(config.port, () => {
  console.log(`🚀 CityFlow API démarrée sur le port ${config.port}`);
});
