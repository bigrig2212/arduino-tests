let teapot;
let img;

function preload() {
  // Load model with normalise parameter set to true
  teapot = loadModel('models//Model_D0407300A64/boxing_gloves.obj', false);
  img = loadImage('models//Model_D0407300A64/boxing_gloves_noAO.jpg');
  //img2 = loadImage('models//Model_D0407300A64/boxing_gloves_diffuse_noAO.jpg');
}

function setup() {
  createCanvas(500, 500, WEBGL);
}

function draw() {
  background(0);

  let locX = mouseX - height / 2;
  let locY = mouseY - width / 2;

  ambientLight(255,255,255, 100)
  pointLight(255, 255, 255, locX, locY, 100);

  scale(0.9); // Scaled to make model fit into canvas
  rotateX(mouseX*.01)
  rotateY(mouseY*.01)
  //normalMaterial(); // For effect
  specularMaterial(250);
  texture(img)
  //texture(img2)
  model(teapot);
}
