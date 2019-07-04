var express = require('express')
var path = require('path');
var socketIO = require('socket.io');

var PORT = process.env.PORT || 3000;

var server = express()
  .use(express.static(__dirname + '/'))
  .listen(PORT, () => console.log(`Listening on ${ PORT }`));


var io = socketIO(server);
var players = [];
var connections = [];
var w;
var h;

io.on('connection', function(socket){
  console.log('a user connected');
});

/*
This is the Player Class
------------------------
*/
class Player {
  constructor(socket) {
    this.socket = socket;
    this.name;
    this.xpos;
    this.ypos;
    //Set a random color
    this.r = Math.floor(Math.random() * 255) + 100;
    this.g = Math.floor(Math.random() * 255) + 100;
    this.b = Math.floor(Math.random() * 255) + 100;
    this.mySound;
  }
}

io.sockets.on('connection', function (socket) { //Someone connects…
  connections.push(socket); //… push this connection to the connections array
  io.sockets.emit ('updateBoids', connections.length); //emit the number of connections to everyone

  console.log('We have now '+connections.length+' Connections and ' + players.length + ' Players');

  socket.on('disconnect', function () { //Someone disconnects…
    var id = getSocketNrById(socket.id) //… get his ID
    io.sockets.emit ('deletePlayer',id); // send the ID to everyone
    removeConnectionById(socket.id); //…remove the connection
    removePlayerBySocketId(socket.id); // …remove the player
    console.log('We have now '+connections.length+' Connections and ' + players.length + ' Players');
  });

  socket.on ('register', function (data) { //Someone register…
    var theName = data.name; //…get the name variable
    var pNr = getPlayerNrById(socket.id); //… get the playernumber by his ID

    players[pNr].name = theName; // Set the Playername from the name variable
    console.log('Welcome '+players[pNr].name);
    io.sockets.emit('reset');
    io.sockets.emit('newName',{number: pNr, name: players[pNr].name}); //tell everyone the name of the player
  });

  socket.on ('who', function (data) { //The Socket emits "Who am I?" and present its data
  registerPlayer();
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
  var yourName = players[pNr].name;
  // Given by the information of the socket data, the server responds with information. They're now in sync
  io.sockets.emit ('youare',{name: pNr, posX: xpos, posY: ypos, tempr: red, tempg: green, tempb: blue, registeredName: yourName});
});

socket.on ('mySize', function (data) { //The Socket sends the size of the browser
  var theWidth = data.mywidth;
  var theHeigth = data.myheight;
  w = theWidth;
  h = theHeigth - 50;
});

socket.on ('mySound', function (msg) { //The Socket sends the soundlevel…
  var pNr = getPlayerNrById(socket.id);
  var player = players[pNr];
  player.mySound = msg;
  io.sockets.emit('mylevel',{name: pNr, level: player.mySound}); //… and tells everyone else
});

/*
Here comes some Functionmagic, taken from www.zackzackboom.de:3000
------------------------------------------------------------------
*/
function registerPlayer() {
  var player = getPlayerBySocket(socket);
  if (player === undefined) {
    player = new Player(socket);
    players.push(player);
  }
  else {
    console.log("player is already registered with socket " + player.socket.id)
  }
  console.log('We have now '+connections.length+' Connections and ' + players.length + ' Players');
}
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

var getPlayerBySocket = function(socket) {
  if (socket === undefined) return undefined;
  return players[getPlayerNrById(socket.id)];
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
