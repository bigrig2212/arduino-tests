const PORT = 3000

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
// [INDEX]
app.get('/', (req, res) => {
  res.render('index.hbs', {
    pageTitle: 'Index'
  });
});
//----------------------


server.listen(PORT, () => {
    console.log('Arduino Controls is on ',PORT)
});
