//[SOCKET]
const socket = io();
socket.on('countUpdated', (counter) => {
  console.log('count has been updated, browser', counter);
});
socket.on('welcome', (welcomeMsg) => {
  console.log('Msg:', welcomeMsg);
})
//receive Accelerometer Values from server
var accelVals = {};
socket.on('accelVals', (vals) => {
  //console.log('accelVals:', vals);
  accelVals = vals;
})


//[GLOBALS]
var bounds = {
  "xmax":0, "xmin":0,
  "ymax":0, "ymin":0,
  "pmax":0, "pmin":0,
  "rmax":0, "rmin":0,
  "amax":0, "amin":0,
  "imax":0, "imin":0,
  "omax":0, "omin":0
}
var cWidth = 500;
var cHeight = 500;

//[PRELOAD]
function preload() {
}
//[SETUP]
function setup() {
  createCanvas(cWidth,cHeight);
  $( "#increment" ).click(function() {
    console.log('clicked');
    socket.emit('increment');
  });
}
//[DRAW]
function draw() {
  background(51);
  ellipse(mouseX, mouseY, 5, 5);
  if (Object.getOwnPropertyNames(accelVals).length > 0){
    //console.log(accelVals);
    var xloc = map(accelVals.x, bounds.xmin, bounds.xmax, 0, cWidth);
    var yloc = map(accelVals.y, bounds.ymin, bounds.ymax, 0, cHeight);
    ellipse(xloc, yloc, 15, 15);
    setbounds(accelVals);
    drawbounds();
  } else {
    console.log('No vals yet from accelerometer');
  }
}
//[BOUNDS]
function drawbounds(){

}
function setbounds(accelVals){
  if (accelVals.x > bounds.xmax){bounds.xmax = accelVals.x;}
  if (accelVals.x < bounds.xmin){bounds.xmin = accelVals.x;}

  if (accelVals.y > bounds.ymax){bounds.ymax = accelVals.y;}
  if (accelVals.y < bounds.ymin){bounds.ymin = accelVals.y;}

  if (accelVals.p > bounds.pmax){bounds.pmax = accelVals.p;}
  if (accelVals.p < bounds.pmin){bounds.pmin = accelVals.p;}

  if (accelVals.r > bounds.rmax){bounds.rmax = accelVals.r;}
  if (accelVals.r < bounds.rmin){bounds.rmin = accelVals.r;}

  if (accelVals.a > bounds.amax){bounds.amax = accelVals.a;}
  if (accelVals.a < bounds.amin){bounds.amin = accelVals.a;}

  if (accelVals.i > bounds.imax){bounds.imax = accelVals.i;}
  if (accelVals.i < bounds.imin){bounds.imin = accelVals.i;}

  if (accelVals.o > bounds.omax){bounds.omax = accelVals.o;}
  if (accelVals.o < bounds.omin){bounds.omin = accelVals.o;}
  console.log(bounds)
}
