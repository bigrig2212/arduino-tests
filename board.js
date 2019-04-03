var five = require("johnny-five");
var board = new five.Board();
var thisx = 0;

board.on("ready", function() {
  console.log('Starting up:')
  var accelerometer = new five.Accelerometer({
    controller: "ADXL335",
    pins: ["A0", "A1", "A2"]
  });

  accelerometer.on("change", function() {
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

module.exports = thisx;
