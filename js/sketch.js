
let sketch = function (p) {
    var socket = io();
    var boids = [];
    var input;
    var analyzer;

    p.preload = function() {
        underwater = p.loadSound('audio/underwater.mp3'); //Load audiofile
    }

    p.setup = function() {
    mic = new p5.AudioIn(); //Create new Mic-In
    mic.start(); //Start the recording

    underwater.loop(); //Start and loop the audiofile
    underwater.setVolume(0.5); //Set Volume of audiofile

    var thecanvas = p.createCanvas(p.windowWidth, p.windowHeight); //Create new Canvas
    thecanvas.parent('processing'); //Insert canvas into <div id="processing"></div>
    sizeforServer();
    /*
        Initialize the Particleground.js
        --------------------------------
    */
    $('#background').particleground({
        dotColor: '#374F66',
        lineColor: '#374F66',
        particleRadius: 25,
        parallaxMultiplier: 30,
        density: 35000,
        proximity: 150
    });
    }

    p.draw = function() {
        p.clear(); //Clear the image, so the background is transparent
        p.fill(100);
        p.textAlign(p.CENTER);
        p.fill(255);
        p.noStroke();
        for (var i = 0; i < boids.length; i++) {
            boids[i].run(boids); //Start the "run"function for every boid
        }
        if (boids.length == 1) { //If only one boid is visible, show text
            p.fill(255);
            p.textAlign(p.LEFT);
            p.textSize(24);
            p.text("You are alone.", p.width / 2 + 50, p.height / 2);
            p.text("Invite a friend or wait until someone", p.width / 2 + 50, p.height / 2 + 30);
            p.text("comes to this place.", p.width / 2 + 50, p.height / 2 + 60);
        }
        getSound();
    }

    /*
        Here comes the Boid
        -------------------
    */
    class Boid {
        constructor(x, y, number) {
            this.position = p.createVector(x, y);
            this.mynumber = number;
            this.r = 0;
            this.color = p.color(0, 0, 0);
            this.myname;
            this.osc = new p5.Oscillator(500); //Initialize a new OSC
            this.osc.start(); //Start the OSC
            this.osc.amp(0.2); //Set the volume of the OSC
            this.reverb = new p5.Reverb(); //Initialize a new Reverb
            this.reverb.process(this.osc, 6, 5); //Connect Reverb to the OSC
        }
        run() {
            this.render();
        }
        render() {
            p.fill(this.color);
            p.ellipseMode(p.CENTER);
            if (this.myname != undefined) { //When the user sets a name, show the name
                p.textSize(18);
                p.text(this.myname, this.position.x + 90, this.position.y + 5);
            }
            var loudness = p.map(this.r, 30, 80, 900, 1); //Map this.r between 900 and 1
            var panning = p.map(this.position.x, 0, p.width, -1, 1); //Set the Stereosound depending on the X-Position of the Boid

            this.osc.pan(panning);
            this.osc.freq(loudness); //Insert Loudness into the frequency

            p.ellipse(this.position.x, this.position.y, this.r, this.r);            
        }
    }

    document.querySelector('.submit').addEventListener('click', playerCount);

    function playerCount() {
        var htmlName = document.querySelector('.loginname').value;
        socket.emit('register', {
            name: htmlName
        });
    }

    /*
        Count msg and initialize new boids
        -----------------------------------
    */
    socket.on('updateBoids', function (msg) {
        var length = msg;
        for (var i = 0; i < length; i++) {
            var x = p.random(50, p.windowWidth - 50);
            var y = p.random(50, p.windowHeight - 130);
            boids[i] = new Boid(x, y, i);
            socket.emit('who', {
                myX: x,
                myY: y
            });
        }
    });

    /*
        Delete the Boid of the disconnected player
        ---------------------------------------------
    */
    socket.on('deletePlayer', function (msg) {        
        boids[msg].osc.stop();
        boids[msg].osc.disconnect();
        boids.splice(msg, 1);
    });

    /*
        Get the miclevel and sends it to the server
        --------------------------------------------
    */
     function getSound() {
        if (mic.enabled) {
            var vol = mic.getLevel();
            var r = p.constrain(80 - vol * 80 * 5, 0, 80);
            socket.emit('mySound', r);
        }
    }

    /*
        Send the Browsersize to the server
        -----------------------------------
    */
    function sizeforServer() {
        var _docHeight = (document.height !== undefined) ? document.height : document.body.offsetHeight;
        var _docWidth = (document.width !== undefined) ? document.width : document.body.offsetWidth;
        socket.emit('mySize', {
            mywidth: _docWidth,
            myheight: _docHeight
        });
    }

    /*
        Set the name of the boid
        -------------------------
    */
    socket.on('newName', function (data) {
        var tempName = data.name;
        var number = data.number;
        
        var theboidforname = boids[number];
        theboidforname.myname = tempName;
    });

    /*
        Set the radius of the boid
        ----------------------------
    */
    socket.on('mylevel', function (data) {
        var tempName = data.name;
        var tempSound = data.level;
        var theboidforsound = boids[tempName];
        theboidforsound.r = tempSound;
    });

    /*
        Set the position, color and name of the boid
        ----------------------------
    */
    socket.on('youare', function (data) {
        tempx = data.posX;
        tempy = data.posY;
        tempMynumber = data.name;
        tempMyname = data.registeredName;
        r = data.tempr;
        g = data.tempg;
        b = data.tempb;
        var boid = boids[tempMynumber];
        boid.position.x = tempx;
        boid.position.y = tempy;
        boid.color = p.color(r, g, b);
        boid.myname = tempMyname;
    });
};

let myp5 = new p5(sketch);

var what = document.querySelectorAll('.what');

for (let i = 0; i < what.length; i++) {
    what[i].addEventListener('click', show);
}

function show() {
    var about = document.querySelector('#about');
    if (about.style.display === 'block') {
        about.style.display = "none"; 
    } else {
        about.style.display = "block";
    }
}