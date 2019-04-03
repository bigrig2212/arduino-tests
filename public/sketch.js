const socket = io();

socket.on('countUpdated', (counter) => {
  console.log('count has been updated, browser', counter);
});

socket.on('welcome', (welcomeMsg) => {
  console.log('Msg:', welcomeMsg);
})



function preload() {

}

function setup() {
  createCanvas(200,200);
  $( "#increment" ).click(function() {
    console.log('clicked');
    socket.emit('increment');
  });

}
function draw() {
  background(51);
  ellipse(mouseX, mouseY, 60, 60)
}
