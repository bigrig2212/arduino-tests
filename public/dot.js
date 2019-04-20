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


//[SET AND INITIALIZE GLOBALS]
//sensorbounds: tracking min/max sensor values
var sensorbounds = {
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
  "currentlevel":null, //for level number
  "currentlevel_c":null, //for level label
  "currentlevel_framecount":0, //for counting where we're at when level assigned
  "lookback":25, //number of counts back that we want to evaluate the peak
  "lastlevel":0, //previous level number
  "lastlevel_c":"no level", //previous level label
  "level_same_counter": 0 //number of times same level achieved
}
var activity_tracker = {
  "count":0, //count activity points
  "0":10000, //points for a warmup routine
  "0_c": "warm up",
  "1": 100000,
  "1_c": "mega", //mega routine
  "2": 200000,
  "2_c": "ultra", //mega routine
  "current_activity": 1
}

//Debugging & screen dimensions
var cWidth;
var cHeight;
var readoutboxLoc = 350; //offset for debugging
var outputbox;

//[PRELOAD]
var myVoice;
function preload() {
  myVoice = new p5.Speech();
  lang = navigator.language || 'en-US';
  let speechRec = new p5.SpeechRec(lang, gotSpeech);
  let continuous = true;
  let interim = false;
  speechRec.start(continuous, interim);
  function gotSpeech(){
    //console.log(speechRec);
    console.log(speechRec.resultString);
  }
}

//[SETUP]
function setup() {
  cWidth = windowWidth-readoutboxLoc;
  cHeight = windowHeight;
  createCanvas(cWidth,windowHeight);
  setuproutine();

}
function setuproutine(){
  //myVoice.speak('WELCOME TO MASSIVE HIT!!!');
  //move the output box into position
  outputbox = document.getElementById('boundtext');
  outputbox.style.position = "absolute";
  outputbox.style.left = windowWidth-readoutboxLoc+'px';
  outputbox.style.height = windowHeight-20+'px';
  outputbox.style.top = 0+'px';
}

//[DRAW]
function draw() {
  background(51);
  if (Object.getOwnPropertyNames(accelVals).length > 0){
    setsensorbounds(accelVals); //set max and min vals for all sensor outputs
    trackHistory(accelVals); //store sensor readings in global objects
    showActivityProgress(); //show progress against activity goals
    graphSensorVals(); //display sensor values
  } else {
    console.log('No vals yet from accelerometer');
  }
}

//show progress against activity goals
function showActivityProgress(){
  //PROGRESS BAR
  var progBarH = 15;
  var progBarW = cWidth-50;
  var innerBarWidth = map(activity_tracker.count, 0, activity_tracker[activity_tracker.current_activity], 0, cWidth-50);
  if (innerBarWidth > progBarW){
    console.log('you did it!');
    push();
    textFont("Patua One");
    fill('yellow');
    textSize(50);
    textAlign(CENTER);
    var congratstext = "You did it!";
    text(congratstext, cWidth/2, cHeight/6);
    myVoice.speak(congratstext);
    pop();
  } else {
    stroke(255);
    noFill();
    rect(30, 50, progBarW, progBarH);
    push();
    fill(200);
    rect(30, 50, innerBarWidth, progBarH);
    pop();
  }


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
  var peakScore = arrMax(dup_array); //gets top val from lookback period
  var level = getLevel(peakScore); //gets the level for the peak score over the past N readings
  //console.log('level is:', level);

  //MAIN MESSAGE
  push();
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
    activity_tracker.count += activityboost;
    //console.log(activity_tracker.count)
    hitlevels.lastlevel_c = hitlevels.currentlevel_c;
  }


  textAlign(LEFT);
  textFont("Arial");
  textSize(18);
  text('activity points:'+activity_tracker.count, 30, 45);
  text('working on:'+activity_tracker[activity_tracker.current_activity+"_c"], 200, 45);
  pop();
}

function speakLevel(level){
  myVoice.speak(level);
}
/*
"currentlevel_framecount":0,
"lookback":20,
allpreviousAccelVals
*/
//GET LEVEL
function getLevel(peakScore){
  //loop through all levels, set current level to the highest matching level
  for (var i = 0; i<=hitlevels.total; i++){
    if ((peakScore >= hitlevels[i]) && (peakScore <= hitlevels[i+1])){
        var copy=i+"_c";
        hitlevels.currentlevel = i;
        hitlevels.currentlevel_c = hitlevels[copy];
        hitlevels.currentlevel_framecount = frameCount;
        //console.log(frameCount, accelVals.acceleration, hitlevels[copy]);
    }
    //level has changed
    //console.log(hitlevels.lastlevel, hitlevels.currentlevel, hitlevels.level_same_counter)
    if (parseInt(hitlevels.lastlevel) == parseInt(hitlevels.currentlevel)){
      //hitlevels.level_same_counter++;
      //console.log("LEVEL CHANGED",frameCount, accelVals.acceleration, hitlevels[copy]);
      //hitlevels.lastlevel_c = hitlevels.currentlevel_c;
    }
    if (parseInt(hitlevels.level_same_counter) < 3){
      //speakLevel(hitlevels.currentlevel_c);
    }

  }
  //DISPLAY LAST LEVEL
  // push();
  // textFont("Arial");
  // fill(255, 255, 255);
  // textAlign(LEFT);
  // textSize(18);
  // text('level achieved: '+hitlevels.lastlevel_c, 10, 40);
  // pop();

  return (hitlevels.currentlevel_c)
}

//GRAPH VALS
var heightDivisor = 1.3; //for line placement on graph
var accelMaxReducer = .1; //for turning accel vals into a floating point val less than 1
function graphSensorVals(){
  //https://www.youtube.com/watch?v=jEwAMgcCgOA

  //Acceleration
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
  var y = map(sensorbounds.accelerationmax*accelMaxReducer, 0, 1, height/heightDivisor, 0);
  ellipse(cWidth-20,y,15,15);
  pop();
  if (sensorbounds.newaccelmax){
    sensorbounds.newaccelmax = false;
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
} //end of graphVals



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

//SET sensorbounds
//set max and min vals for all sensor outputs
function setsensorbounds(accelVals){
  if (accelVals.x > sensorbounds.xmax){sensorbounds.xmax = accelVals.x;}
  if (accelVals.x < sensorbounds.xmin){sensorbounds.xmin = accelVals.x;}

  if (accelVals.y > sensorbounds.ymax){sensorbounds.ymax = accelVals.y;}
  if (accelVals.y < sensorbounds.ymin){sensorbounds.ymin = accelVals.y;}

  if (accelVals.z > sensorbounds.zmax){sensorbounds.zmax = accelVals.z;}
  if (accelVals.z < sensorbounds.zmin){sensorbounds.zmin = accelVals.z;}

  if (accelVals.pitch > sensorbounds.pitchmax){sensorbounds.pitchmax = accelVals.pitch;}
  if (accelVals.pitch < sensorbounds.pitchmin){sensorbounds.pitchmin = accelVals.pitch;}

  if (accelVals.roll > sensorbounds.rollmax){sensorbounds.rollmax = accelVals.roll;}
  if (accelVals.roll < sensorbounds.rollmin){sensorbounds.rollmin = accelVals.roll;}

  if (accelVals.acceleration > sensorbounds.accelerationmax){
    sensorbounds.accelerationmax = accelVals.acceleration;
    sensorbounds.newaccelmax = true;
  } else {
    sensorbounds.newaccelmax = false;
  }

  if (accelVals.acceleration < sensorbounds.accelerationmin){sensorbounds.accelerationmin = accelVals.acceleration;}

  if (accelVals.inclination > sensorbounds.inclinationmax){sensorbounds.inclinationmax = accelVals.inclination;}
  if (accelVals.inclination < sensorbounds.inclinationmin){sensorbounds.inclinationmin = accelVals.inclination;}

  if (accelVals.orientation > sensorbounds.orientationmax){sensorbounds.orientationmax = accelVals.orientation;}
  if (accelVals.orientation < sensorbounds.orientationmin){sensorbounds.orientationmin = accelVals.orientation;}

  var output = '';
  output= "<br>------max & min readings-------<br>";
  output += '<table>';
  for (var property in sensorbounds) {
    output += "<tr><td>" + property + "</td><td>" + sensorbounds[property] + "</td></tr>";
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
