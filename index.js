var http = require('http');
var fs = require('fs');
var path = require('path');
var app = require('express')();
//var http = require('http').Server(app);


//Index
var server = http.createServer(function (request, response) {
  //console.log('request starting...');
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
var w;
var h;

function Player(socket) {
  this.socket = socket;

  this.xpos;
  this.ypos;
  this.r = Math.floor(Math.random() * 255) + 100;
  this.g = Math.floor(Math.random() * 255) + 100;
  this.b = Math.floor(Math.random() * 255) + 100;

  this.mySound;
}


io.sockets.on('connection', function (socket) {
  connections.push(socket);

  player = new Player(socket);
  players.push(player);
  console.log('We have now '+connections.length+' Connections and ' + players.length + ' Players');

  io.sockets.emit ('updateBoids', connections.length);

  socket.on('disconnect', function () {
    var id = getSocketNrById(socket.id)
    io.sockets.emit ('deletePlayer',id);
    removeConnectionById(socket.id);
    removePlayerBySocketId(socket.id);

    console.log('We have now '+connections.length+' Connections and ' + players.length + ' Players');
  });

  socket.on ('who', function (data) {
    
    var theX = data.myX;
    var theY = data.myY;

    var color = [];
    var pNr = getPlayerNrById(socket.id);
    var red = players[pNr].r;
    var green = players[pNr].g;
    var blue = players[pNr].b;

    players[pNr].xpos = theX;
    players[pNr].ypos = theY;

    var xpos = players[pNr].xpos;
    var ypos = players[pNr].ypos;
    io.sockets.emit ('youare',{name: pNr, posX: xpos, posY: ypos, tempr: red, tempg: green, tempb: blue});
  });

  socket.on ('mySize', function (data) {
    var theWidth = data.mywidth;
    var theHeigth = data.myheight;
    w = theWidth;
    h = theHeigth - 50;
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
      player.mySound = 0;
      players.splice(pNr,1);
    }
  }

  var removeConnectionById = function(id) {
    var sNr = getSocketNrById(id);
    if (sNr !== undefined) {
      connections.splice(sNr,1);
      console.log('Connection "' + id + '" was removed.');
    }
  }


  var getPlayerNrById = function(id) {
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

});
server.listen(4897, function(){
  console.log('listening on *:4897');
});