
var boids = [];


function setup() {
  createCanvas(windowWidth, windowHeight);
playerCount ();
boidCounter();

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
  var r = constrain(50-vol*50*5, 0, 50);
  // Draw an ellipse with height based on volume

  fill(50);
  noStroke();
  ellipseMode(CENTER);

  ellipse(this.position.x, this.position.y,r,r);
  socket.emit('radius', r);
}

function playerCount (){
  socket.emit ('Update');
}

function boidCounter(){
  socket.on ('updateBoids', function (msg) {
    for (var i = 0; i < msg; i++) {
      boids[i] = new Boid(random(width), random(height));
    } 
  });
}




