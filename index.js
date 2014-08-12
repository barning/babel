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

io.on('connection', function(socket){
  console.log('a user connected');
  players.push(socket);
  console.log(players.length);
  io.sockets.emit ('updatePlayer', players.length);

  //Radius aller Boids
  socket.on('radius', function(r){
	//console.log('Radius: ' + r);
  });

  socket.on ('Update', function () {
    io.sockets.emit ('updateBoids', players.length);
  });

  socket.on('disconnect', function() {
      console.log('Got disconnect!');
      var i = players.indexOf(socket);
      delete players[i];
      console.log(players.length);
      });
});

server.listen(3000, function(){
  console.log('listening on *:3000');
});





