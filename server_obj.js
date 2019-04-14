const PORT = 3000
const http = require('http');
const path = require('path');
const express = require('express');

var app = express();
var server = require('http').createServer(app);

const publicPath = path.join(__dirname, '/public');
const partialsPath = path.join(__dirname, '/views/partials');

//HANDLEBARS AND PATHS
const hbs = require('hbs');
const fs = require('fs');
hbs.registerPartials(partialsPath);
app.set('view engine', 'hbs');
app.use(express.static(publicPath));

// [INDEX]
app.get('/obj', (req, res) => {
  res.render('obj.hbs', {
    pageTitle: 'obj'
  });
});


server.listen(PORT, () => {
    console.log('Obj Controls is on ',PORT)
});
