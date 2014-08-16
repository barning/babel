var http = require('http');
var fs = require('fs');
var path = require('path');
var app = require('express')();
//var http = require('http').Server(app);


//Index
var server = http.createServer(function (request, response) {
  console.log('request starting...');
  var filePath = '.' + request.url;
  if (filePath == './')
    filePath = './index.html';

  var extname = path.extname(filePath);
  var contentType = 'text/html';
  switch (extname) {
    case '.js':
    contentType = 'text/javascript';
    break;
    case '.css':
    contentType = 'text/css';
    break;
  }

  path.exists(filePath, function(exists) {

    if (exists) {
     fs.readFile(filePath, function(error, content) {
      if (error) {
       response.writeHead(500);
       response.end();
     }
     else {
       response.writeHead(200, { 'Content-Type': contentType });
       response.end(content, 'utf-8');
     }
   });
   }
   else {
     response.writeHead(404);
     response.end();
   }
 });

});

var io = require('socket.io').listen(server);

var players = [];
var connections = [];

function Player(socket) {
  this.socket = socket;
  this.state = 'ready';

  this.xpos = Math.floor(Math.random() * 500) + 1;
  this.ypos = Math.floor(Math.random() * 500) + 1;
  this.r = Math.floor(Math.random() * 255) + 10;
  this.g = Math.floor(Math.random() * 255) + 10;
  this.b = Math.floor(Math.random() * 255) + 10;

  this.mySound = 50;
}


Player.prototype.setReady = function () {
  this.state = 'ready';
}

Player.prototype.setPlaying = function () {
  this.state = 'playing';
}

Player.prototype.setUnready = function () {
  this.state = 'unready';
}

Player.prototype.isReady = function () {
  return this.state === 'ready';
}


io.sockets.on('connection', function (socket) {
  connections.push(socket);
  io.sockets.emit ('updateBoids', connections.length);

  //console.log("Connect " + socket.id );

  player = new Player(socket);
  players.push(player);
  console.log("socket " + player.socket.id);

  socket.on('disconnect', function () {
    var id = getSocketNrById(socket.id)

    removeConnectionById(socket.id);
    removePlayerBySocketId(socket.id);
    console.log("disconnect " + socket.id );
    console.log(connections.length);
    console.log(players.length);
    io.sockets.emit ('deletePlayer');
    io.sockets.emit ('updateBoids', connections.length);
  });

  socket.on ('who', function (msg) {
    var color = [];
    var pNr = getPlayerNrById(socket.id);
    var xpos = players[pNr].xpos;
    var ypos = players[pNr].ypos;
    var red = players[pNr].r;
    var green = players[pNr].g;
    var blue = players[pNr].b;
    io.sockets.emit ('youare',{name: pNr, posX: xpos, posY: ypos, tempr: red, tempg: green, tempb: blue});
    //io.sockets.emit('turnoff',pnr);
  });

  socket.on ('mySound', function (msg) {
    var pNr = getPlayerNrById(socket.id);
    var player = players[pNr];
    player.mySound = msg;
    io.sockets.emit('mylevel',{name: pNr, level: player.mySound});
  });


var removePlayerBySocketId = function(id) {
  var pNr = getPlayerNrById(id);
  if (pNr !== undefined) {
    var player = players[pNr];
    players.splice(pNr,1);
    console.log('Player "' + player.name + '" was removed.');
  }
}

var removeConnectionById = function(id) {
  var sNr = getSocketNrById(id);
  if (sNr !== undefined) {
    connections.splice(sNr,1);
    console.log('Connection "' + id + '" was removed.');
  }
}

var getPlayerBySocket = function(socket) {
  if (socket === undefined) return undefined;
  return players[getPlayerNrById(socket.id)];
}

var getPlayerNameBySocket = function(socket) {
  var pl = getPlayerBySocket(socket);
  if (pl !== undefined) return pl.name;
}

var getPlayerNrById = function(id) {
  //console.log("getPlayerNrById(" + id + ")")
  for (var i = 0; i < players.length; i++) {
    if(id == players[i].socket.id) {
      return i;
    }
  }
}

var getSocketNrById = function(id) {
  for (var i = 0; i < connections.length; i++) {
    if(id == connections[i].id) {
      return i;
    }
  }
}

var getSocketById = function(id) {
  return connections[getSocketNrById(id)];
}
});
server.listen(4897, function(){
  console.log('listening on *:4897');
});