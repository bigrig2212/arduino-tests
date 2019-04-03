const PORT = 3000
const http = require('http');
const path = require('path');
const express = require('express');
const socketio = require('socket.io');

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

// [SOCKET]
let count = 0;
var emitAccelVals;
let welcomeMessage = "Hello sockets world";
io.on('connection', (socket) => {
  console.log('new websocket connection');
  socket.emit('countUpdated', count);
  socket.emit('welcome', welcomeMessage);
  socket.on('increment', () => {
      count++;
      //socket.emit('countUpdated', count); //emits to that specific connection
      io.emit('countUpdated', count); //emits to all connections
  });
  //respond to a request from browser
  socket.on('request_x', () => {
      socket.emit('request_x', xval);
  });
  //transmit vals to browser directly
  emitAccelVals = function(vals) {
    socket.emit('accelVals', vals);
  }
});

// [SOCKET]
board.on("ready", function() {
  console.log('Starting up:')
  var accelerometer = new five.Accelerometer({
    controller: "ADXL335",
    pins: ["A0", "A1", "A2"]
  });

  accelerometer.on("change", function() {
    emitAccelVals({"x":this.x, "y":this.y, "z":this.z});
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
