var app = require('express')();
var http = require('http').Server(app);

app.get('/', function(req, res){
  res.send('<h1>Hello world</h1>');
  var boids = [];


function setup() {
var myCanvas = createCanvas(500, 500);
  myCanvas.parent('processing');


  // Add an initial set of boids into the system
  for (var i = 0; i < 5; i++) {
    boids[i] = new Boid(random(width), random(height));
  }  

}

function draw() {
  background(255);
  fill(100);
  for (var i = 0; i < boids.length; i++) {
      boids[i].run(boids);
    }
}

//CLass
function Boid(x, y) {
  this.position = createVector(x, y);
  var input;
  var analyzer;
    // Create an Audio input
    mic = new p5.AudioIn();

    // start the Audio Input.
    // By default, it does not .connect() (to the computer speakers)
    mic.start();
}

Boid.prototype.run = function(boids) {
  this.render();
}

Boid.prototype.render = function() {

  // Get the overall volume (between 0 and 1.0)
  var vol = mic.getLevel();
  // Draw an ellipse with height based on volume

  fill(50);
  noStroke();
  ellipseMode(CENTER);
  ellipse(this.position.x, this.position.y, constrain(50-vol*50*5, 0, 50), constrain(50-vol*50*5, 0, 50));
}



});

http.listen(3000, function(){
  console.log('listening on *:3000');
});



