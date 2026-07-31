const http = require('http');
const app = require('./app');
const { Server } = require('socket.io');
const config = require('./config');

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: config.frontendUrl }
});

io.on('connection', (socket) => {
  console.log('Client connecté:', socket.id);
  
  socket.on('join-municipality', (municipalityId) => {
    socket.join(`municipality_${municipalityId}`);
  });
});

app.set('io', io);

server.listen(config.port, () => {
  console.log(`🚀 CityFlow API démarrée sur le port ${config.port}`);
});
