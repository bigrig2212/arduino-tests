//adapted from: https://electronics.stackexchange.com/questions/156352/understanding-how-to-use-an-accelerometer-to-detect-vehicle-collisions

var five = require("johnny-five");
var board = new five.Board();

board.on("ready", function() {
  console.log('Starting up:')
  var accelerometer = new five.Accelerometer({
    controller: "ADXL335",
    pins: ["A0", "A1", "A2"]
  });

  accelerometer.on("change", function() {
    // console.log("accelerometer");
    // console.log("  x            : ", this.x);
    // console.log("  y            : ", this.y);
    // console.log("  z            : ", this.z);
    // console.log("  pitch        : ", this.pitch);
    // console.log("  roll         : ", this.roll);
    // console.log("  acceleration : ", this.acceleration);
    // console.log("  inclination  : ", this.inclination);
    // console.log("  orientation  : ", this.orientation);
    // displayCounter();
    if (counter % 3 === 0){
      checkImpact(this.x,this.y,this.z,this.acceleration);
    }
    countloop();
    //console.log("--------------------------------------");
  });
});

var updateflag = false;
var deltx = 0, delty = 0, deltz = 0;
var vibration = 0, magnitude = 0, sensitivity = 1, devibrate = 50;
var oldx, oldy, oldz = 0;

function checkImpact(xaxis, yaxis, zaxis, acceleration){

  vibration--; // loop counter prevents false triggering. Vibration resets if there is an impact. Don't detect new changes until that "time" has passed.
  if(vibration < 0) vibration = 0;
  if(vibration > 0) return;
  deltx = xaxis - oldx;
  delty = yaxis - oldy;
  deltz = zaxis - oldz;

  //magnitude = Math.sqrt(Math.pow(deltx, 2) + Math.pow(delty, 2) + Math.pow(deltz, 2)); //Magnitude to calculate force of impact.
  magnitude = Math.sqrt(Math.pow(deltx, 2)); //Magnitude to calculate force of impact.
  if (magnitude >= sensitivity) //impacts detected
  {
    console.log("Impact detected!!\tMagnitude:", magnitude);
    console.log('axes', xaxis,yaxis,zaxis);
    console.log('old', oldx,oldy,oldz);
    console.log('deltas', deltx,delty,deltz);
    console.log('acceleration', acceleration);
    console.log("--------------------------------------");
    vibration = devibrate; // reset anti-vibration counter
  } else {
    magnitude=0; // reset magnitude of impact to 0
  }

  oldx = xaxis; // local variables store previous axis readings for comparison
  oldy = yaxis;
  oldz = zaxis;
}


var counter = 0;
function countloop(){
  counter++;
}
