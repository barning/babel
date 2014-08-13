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

  this.xpos = 0;
  this.ypos = 0;
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
  io.sockets.emit ('updatePlayer', connections.length);

  console.log("Connect " + socket.id );

  //Radius aller Boids
  socket.on('radius', function(r){
	console.log('Radius: ' + r);
  });

  socket.on ('Update', function () {
    var id = getSocketNrById(socket.id)
    io.sockets.emit ('updateBoids',{ connections: connections.length, name: id });
  });

  socket.on('disconnect', function () {
    removeConnectionById(socket.id);
    console.log("disconnect " + socket.id );
    console.log(connections.length);
  });

  socket.on('register', function (data) {
    var player = getPlayerBySocket(socket);
    if (player === undefined) {
      player = new Player(socket)
      players.push(player);
      console.log("socket " + player.socket.id)
    } else {
      console.log("player is already registered with socket " + player.socket.id)
    }
});


var removePlayerBySocketId = function(id) {
  var pNr = getPlayerNrById(id);
  if (pNr !== undefined) {
    connections.splice(pNr,1);
  }
}

var removeConnectionById = function(id) {
  var sNr = getSocketNrById(id);
  if (sNr !== undefined) {
    connections.splice(sNr,1);
    console.log('Connection "' + id + '" was removed.');
    io.sockets.emit ('deletePlayer', sNr);
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
  console.log("getPlayerNrById(" + id + ")")
  for (var i = 0; i < players.length; i++) {
    if(id == connections[i].socket.id) {
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

var getRandomPlayerExceptMe = function(socket) {
  var victim_nr = randomFromMinMax(0,(readyPlayers().length - 1) - 1);
  var myNr = getPlayerNrById(socket.id);
  console.log('myNr: ' + myNr);
  if (readyPlayers().length > 1 && victim_nr >= myNr) { victim_nr = victim_nr + 1;};
  console.log('victim_nr: ' + victim_nr);
  return readyPlayers()[victim_nr];
}

var randomFromMinMax = function(min, max) {
  var delta = (max - min) + 1;
  return Math.floor(Math.random() * delta) + min;
}
});
server.listen(3000, function(){
  console.log('listening on *:3000');
});