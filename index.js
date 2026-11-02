const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const PORT = process.env.PORT || 3000;
const players = new Map();

app.use(express.static(__dirname));

const colors = ['#d6ff69', '#7bdff2', '#f7aef8', '#ffcb77', '#b8f2e6', '#a78bfa'];

function randomPosition() {
  return {
    x: 0.14 + Math.random() * 0.72,
    y: 0.18 + Math.random() * 0.58
  };
}

function publicPlayer(player) {
  return {
    id: player.id,
    name: player.name,
    x: player.x,
    y: player.y,
    level: player.level,
    color: player.color
  };
}

function broadcastPlayers() {
  io.emit('players:state', [...players.values()].map(publicPlayer));
}

io.on('connection', (socket) => {
  const position = randomPosition();
  const player = {
    id: socket.id,
    name: 'Stranger',
    x: position.x,
    y: position.y,
    level: 0,
    color: colors[Math.floor(Math.random() * colors.length)]
  };

  players.set(socket.id, player);
  socket.emit('session:ready', { id: socket.id });
  broadcastPlayers();

  socket.on('player:join', (data = {}) => {
    player.name = String(data.name || 'Stranger').trim().slice(0, 24) || 'Stranger';
    broadcastPlayers();
  });

  socket.on('player:sound', (level) => {
    player.level = Math.max(0, Math.min(1, Number(level) || 0));
    socket.broadcast.emit('player:sound', { id: player.id, level: player.level });
  });

  socket.on('disconnect', () => {
    players.delete(socket.id);
    io.emit('player:left', socket.id);
    broadcastPlayers();
  });
});

server.listen(PORT, () => console.log(`Listening on ${PORT}`));
