var app = require('express')();
var sound = require('./js/p5.js');
var sound = require('./js/sound.js');
var boid = require('./js/sketch.js');
var http = require('http').Server(app);

app.get('/', function(req, res){
  res.sendfile('index.html');
  
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});