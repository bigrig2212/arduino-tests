const PORT = 3000
const http = require('http');
const path = require('path');
const express = require('express');
const socketio = require('socket.io');

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

let count = 0;
io.on('connection', (socket) => {
  console.log('new websocket connection');
  socket.emit('countUpdated', count);
  socket.on('increment', () => {
      count++;
      //socket.emit('countUpdated', count); //emits to that specific connection
      io.emit('countUpdated', count); //emits to all connections
  })
})

server.listen(PORT, () => {
    console.log('Arduino Controls is on ',PORT)
});
