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
  "zmax":0, "zmin":0,
  "pitchmax":0, "pitchmin":0,
  "rollmax":0, "rollmin":0,
  "accelerationmax":0, "accelerationmin":0,
  "newaccelmax":false,
  "inclinationmax":0, "inclinationmin":0,
  "orientationmax":0, "orientationmin":0
}
var hitlevels = {
  "0":0, "0_c":"keep it coming",
  "1":1.8, "1_c":"little tiny tap",
  "2":3.53, "2_c":"soft hit",
  "3":4.05, "3_c":"good hit",
  "4":6.9, "4_c":"hard hit!!",
  "5":7.5, "5_c":"MASSIVE hit!!!!!!",
  "6":8.5, "6_c":"NUUUUUUUCLEAR!!!!!!",
  "7":9.0, "7_c":"PLUTON EXPLOSION BOMB!!!!!!",
  "total":7,
  "currentlevel":null,
  "currentlevel_c":null,
  "currentlevel_framecount":0,
  "framecount_at_last_report":0,
  "lookback":25,
  "lastlevel":0,
  "lastlevel_c":"no level"
}
var hitc = {
  "hitcount":0
}

var cWidth = 500;
var cHeight = 500;
var readoutboxLoc = 350;
var outputbox;

//[PRELOAD]
function preload() {
}
//[SETUP]

function setup() {
  cWidth = windowWidth-readoutboxLoc;
  cHeight = windowHeight;
  createCanvas(cWidth,windowHeight);
  setuproutine();
}
function setuproutine(){
  //move the output box into position
  outputbox = document.getElementById('boundtext');
  outputbox.style.position = "absolute";
  outputbox.style.left = windowWidth-readoutboxLoc+'px';
  outputbox.style.height = windowHeight-20+'px';
  outputbox.style.top = 0+'px';

  //fonts

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
    //evaluateHit(accelVals);
    trackHistory(accelVals);
    graphVals();

  } else {
    console.log('No vals yet from accelerometer');
  }
}

var heightDivisor = 1.3; //for line placement on graph
var accelMaxReducer = .1; //for turning accel vals into a floating point val less than 1
function graphVals(){
  //https://www.youtube.com/watch?v=jEwAMgcCgOA

  //Acceleration
  stroke(255);
  noFill();
  beginShape();
  for (var i = 0; i<allpreviousAccelVals.length; i++){
    var y = map(allpreviousAccelVals[i]*accelMaxReducer, 0, 1, height/heightDivisor, 0);
    vertex(i,y);
  }
  endShape();
  if (allpreviousAccelVals.length > cWidth-20){
    allpreviousAccelVals.splice(0,1); //note that allpreviousAccelVals will be same length as screen width
  }

  //accelleration MAX indicator
  push();
  fill(255, 0, 0);
  var y = map(bounds.accelerationmax*accelMaxReducer, 0, 1, height/heightDivisor, 0);
  ellipse(cWidth-20,y,15,15);
  pop();
  if (bounds.newaccelmax){
    bounds.newaccelmax = false;
  }

  //X val
  push();
  stroke(100);
  noFill();
  beginShape();
  for (var i = 0; i<allpreviousXVals.length; i++){
    var y = map(allpreviousXVals[i]*.1, 0, 1, height/1.3, 0)
    vertex(i,y)
  }
  endShape();
  if (allpreviousXVals.length > cWidth-20){
    allpreviousXVals.splice(0,1);
  }
  pop();

  //LEVELS
  //look back over previous "lookback" number of readings
  //report the peak in that lookback period
  var dup_array=[];
  var len = allpreviousAccelVals.length-1;
  for(var i = 0; i < hitlevels.lookback; i++){
    if (allpreviousAccelVals[len-i] !== undefined){
      dup_array[i] = allpreviousAccelVals[len-i]; //last lookback readings are now in here
    }
  }
  var peakScore = arrMax(dup_array);
  var level = getLevel(peakScore); //gets the level for the peak score over the past N readings

  //console.log('level is:', level);
  push();

  //MAIN MESSAGE
  textFont("Patua One");
  fill(255, 255, 255);
  textSize(32);
  textAlign(CENTER)
  text(level, cWidth/2, cHeight/4);
  if (hitlevels.currentlevel != 0){
    textSize(16);
    var scoreFormatted = peakScore.toFixed(3) * 1000;
    text(scoreFormatted, cWidth/2, cHeight/4+20);
  }

  //console.log(arrMax(dup_array))
  //ACTIVITY POINTS
  if (hitlevels.currentlevel >= 3){
    var activityboost = 3 * hitlevels.currentlevel;
    hitc.hitcount += activityboost;
    //console.log(hitc.hitcount)
    hitlevels.lastlevel_c = hitlevels.currentlevel_c;
  }
  textAlign(LEFT);
  textFont("Arial");
  textSize(18);
  text('activity points:'+hitc.hitcount, 10, 18);
  pop();
} //end of graphVals

//doesnt work b/c is currentlevel_framecount is always same
function enoughDelay(){
  var framediff = frameCount - hitlevels.currentlevel_framecount;
  console.log(frameCount, hitlevels.currentlevel_framecount, framediff);
  if (framediff > 50){
    return (true);
  }
}
/*
"currentlevel_framecount":0,
"framecount_at_last_report":0,
"lookback":20,
allpreviousAccelVals
*/
function getLevel(peakScore){
  for (var i = 0; i<=hitlevels.total; i++){
    if ((peakScore >= hitlevels[i]) && (peakScore <= hitlevels[i+1])){
        var copy=i+"_c";
        hitlevels.currentlevel = i;
        hitlevels.currentlevel_c = hitlevels[copy];
        hitlevels.currentlevel_framecount = frameCount;
        //console.log(frameCount, accelVals.acceleration, hitlevels[copy]);
    }
    //level has changed
    if (hitlevels.lastlevel != hitlevels.currentlevel){
      console.log("LEVEL CHANGED",frameCount, accelVals.acceleration, hitlevels[copy]);
      hitlevels.lastlevel = hitlevels.currentlevel;
      //hitlevels.lastlevel_c = hitlevels.currentlevel_c;
    }

  }

  //LAST LEVEL
  push();
  textFont("Arial");
  fill(255, 255, 255);
  textAlign(LEFT);
  textSize(18);
  text('level achieved: '+hitlevels.lastlevel_c, 10, 40);
  pop();
  return (hitlevels.currentlevel_c)
}

//[EVALUATE HIT]
/*
We're looking for a sudden stop in acceleration, primarily in x-direction
Add newest accel val to beginning of array
If there are 10 values in the array, take the last off
If there is a sudden deceleration between values, mark it as a hit
*/
var allpreviousAccelVals = [];
var allpreviousXVals = [];
function trackHistory(accelVals){
  allpreviousAccelVals.push(accelVals.acceleration);
  allpreviousXVals.push(accelVals.x);
}


var previousAccelVals = [];
var previousXVals = [];
function evaluateHit(accelVals){
  var currentAccelVal = Math.floor(accelVals.acceleration);
  var lastAccelVal = Math.floor(previousAccelVals[previousAccelVals.length-1]);
  var diffBetweenCurAndLastAccelVal = currentAccelVal - lastAccelVal;

  if (diffBetweenCurAndLastAccelVal < 0) {
    //console.log('curval: ', currentAccelVal, 'lastval: ', lastAccelVal, 'diff: ', diffBetweenCurAndLastAccelVal);

    var sampleArray = previousAccelVals;
    sampleArray = sampleArray.map(function(each_element){
      return Number(each_element.toFixed(0));
    });
    console.log(sampleArray)
  }
  //add most recent val to array and take off last val
  previousAccelVals.unshift(accelVals.acceleration);

  if (previousAccelVals.length > 15){previousAccelVals.pop()}
}

//Array math functions
//from: https://codeburst.io/javascript-arrays-finding-the-minimum-maximum-sum-average-values-f02f1b0ce332
const arrMax = arr => Math.max(...arr);
const arrMin = arr => Math.min(...arr);
const arrSum = arr => arr.reduce((a,b) => a + b, 0)
const arrAvg = arr => arr.reduce((a,b) => a + b, 0) / arr.length

function setbounds(accelVals){
  if (accelVals.x > bounds.xmax){bounds.xmax = accelVals.x;}
  if (accelVals.x < bounds.xmin){bounds.xmin = accelVals.x;}

  if (accelVals.y > bounds.ymax){bounds.ymax = accelVals.y;}
  if (accelVals.y < bounds.ymin){bounds.ymin = accelVals.y;}

  if (accelVals.z > bounds.zmax){bounds.zmax = accelVals.z;}
  if (accelVals.z < bounds.zmin){bounds.zmin = accelVals.z;}

  if (accelVals.pitch > bounds.pitchmax){bounds.pitchmax = accelVals.pitch;}
  if (accelVals.pitch < bounds.pitchmin){bounds.pitchmin = accelVals.pitch;}

  if (accelVals.roll > bounds.rollmax){bounds.rollmax = accelVals.roll;}
  if (accelVals.roll < bounds.rollmin){bounds.rollmin = accelVals.roll;}

  if (accelVals.acceleration > bounds.accelerationmax){
    bounds.accelerationmax = accelVals.acceleration;
    bounds.newaccelmax = true;
  } else {
    bounds.newaccelmax = false;
  }

  if (accelVals.acceleration < bounds.accelerationmin){bounds.accelerationmin = accelVals.acceleration;}

  if (accelVals.inclination > bounds.inclinationmax){bounds.inclinationmax = accelVals.inclination;}
  if (accelVals.inclination < bounds.inclinationmin){bounds.inclinationmin = accelVals.inclination;}

  if (accelVals.orientation > bounds.orientationmax){bounds.orientationmax = accelVals.orientation;}
  if (accelVals.orientation < bounds.orientationmin){bounds.orientationmin = accelVals.orientation;}

  var output = '';
  output= "<br>------max & min readings-------<br>";
  output += '<table>';
  for (var property in bounds) {
    output += "<tr><td>" + property + "</td><td>" + bounds[property] + "</td></tr>";
  }
  output += "</table>";
  output += "<br>------live readings-------<br>";
  output += '<table>';
  for (var prop in accelVals) {
    output += "<tr><td>" + prop + "</td><td>" + accelVals[prop] + "</td></tr>";
  }
  output += "</table>";

  outputbox.innerHTML = output;
}

function windowResized() {
  cWidth = windowWidth-readoutboxLoc;
  cHeight = windowHeight;
  setuproutine()
  resizeCanvas(windowWidth, windowHeight);
}

Array.prototype.clone = function() {
	return this.slice(0);
};
