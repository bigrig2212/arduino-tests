const PORT = 3000

var five = require("johnny-five");
var board = new five.Board();

const path = require('path');
const publicPath = path.join(__dirname, '/public');
const partialsPath = path.join(__dirname, '/views/partials');

var express = require('express');
var app = express();
var server = require('http').createServer(app);

var bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ parameterLimit: 50000, extended: true })); // extend param limit, so that all Qs can be exported

const timestamp = new Date(); //settimestamp


//HANDLEBARS AND PATHS
const hbs = require('hbs');
const fs = require('fs');
hbs.registerPartials(partialsPath);
hbs.registerHelper('getCurrentYear', ()=>{
    return new Date().getFullYear();
});
hbs.registerHelper('screamIt', (text)=>{
    return text.toUpperCase();
})
app.set('view engine', 'hbs');
app.use(express.static(publicPath));

//LOGGING
app.use((req, res, next) => {
    var now = new Date().toString();
    var log = `${now}: ${req.method} ${req.url}`;
    console.log(log);
    fs.appendFile('server.log', log + '\n', (err) => {
        if (err){
        console.log('unable to append to server.log');
        }
    })
    next();
});

// [INDEX - show board]
app.get('/', (req, res) => {
  res.render('home.hbs', {
    pageTitle: 'Home',
    welcomeMsg: 'Hi there'
  });
});
//----------------------


server.listen(PORT, () => {
    console.log('Slime is on ',PORT)
});


board.on("ready", function() {
  console.log('Starting up:')
  var accelerometer = new five.Accelerometer({
    controller: "ADXL335",
    pins: ["A0", "A1", "A2"]
  });

  accelerometer.on("change", function() {
    // console.log("accelerometer");
    console.log("  x            : ", this.x);
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
