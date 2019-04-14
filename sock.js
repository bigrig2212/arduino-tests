const PORT = 3000
const http = require('http');
const path = require('path');
const express = require('express');
const socketio = require('socket.io');
var THREE = require('three');

var five = require("johnny-five");
var board = new five.Board();

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const publicPath = path.join(__dirname, '/public');
const partialsPath = path.join(__dirname, '/views/partials');

//HANDLEBARS AND PATHS
const hbs = require('hbs');
const fs = require('fs');
hbs.registerPartials(partialsPath);
app.set('view engine', 'hbs');
app.use(express.static(publicPath));

// [INDEX]
app.get('/', (req, res) => {
  res.render('home.hbs', {
    pageTitle: 'Home'
  });
});

// [CUBE]
app.get('/cube', (req, res) => {
  res.render('cube.hbs', {
    pageTitle: 'Three'
  });
});

// [GLOVE]
app.get('/glove', (req, res) => {
  res.render('glove.hbs', {
    pageTitle: 'Glove'
  });
});

// [SOCKET]
let count = 0;
var emitAccelVals; //function var
let welcomeMessage = "Hello sockets world";
io.on('connection', (socket) => {
  console.log('new websocket connection');
  socket.emit('countUpdated', count);
  socket.emit('welcome', welcomeMessage);
  //demo to transmit a val from one browser to all browsers connected
  socket.on('increment', () => {
      count++;
      //socket.emit('countUpdated', count); //emits to that specific connection
      io.emit('countUpdated', count); //emits to all connections
  });
  //respond to a request from browser (on request_x, runs function )
  socket.on('request_x', () => {
      socket.emit('request_x', xval);
  });

  //function to transmit vals to browser directly
  emitAccelVals = function(vals) {
    socket.emit('accelVals', vals);
  }

});

// [ACCELEROMETER]
board.on("ready", function() {
  console.log('Starting up:')
  var accelerometer = new five.Accelerometer({
    controller: "ADXL335",
    pins: ["A0", "A1", "A2"]
  });

  accelerometer.on("change", function() {
    emitAccelVals({"x":this.x, "y":this.y, "z":this.z, "pitch":this.pitch, "roll":this.roll, "acceleration":this.acceleration, "inclination":this.inclination, "orientation":this.orientation});
    // console.log("accelerometer");
    //console.log("  x            : ", this.x);
    // console.log("  y            : ", this.y);
    // console.log("  z            : ", this.z);
    // console.log("  pitch        : ", this.pitch);
    // console.log("  roll         : ", this.roll);
    // console.log("  acceleration : ", this.acceleration);
    // console.log("  inclination  : ", this.inclination);
    // console.log("  orientation  : ", this.orientation);
    // displayCounter();
    // if (counter % 3 === 0){
    //   checkImpact(this.x,this.y,this.z,this.acceleration);
    // }
    // countloop();
    //console.log("--------------------------------------");

  });

});






server.listen(PORT, () => {
    console.log('Arduino Controls is on ',PORT)
});
