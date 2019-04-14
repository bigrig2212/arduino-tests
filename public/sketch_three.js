
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
  "inclinationmax":0, "inclinationmin":0,
  "orientationmax":0, "orientationmin":0
}
var cWidth = 500;
var cHeight = 500;
var outputbox;


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

  if (accelVals.acceleration > bounds.accelerationmax){bounds.accelerationmax = accelVals.acceleration;}
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

//[THREE]
var camera, scene, renderer;
var geometry, material, mesh;
// var loader = new THREE.GLTFLoader();
init();
animate();

function init() {
	camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.01, 10 );
	camera.position.z = 1;

	scene = new THREE.Scene();

	geometry = new THREE.BoxGeometry( 0.1, 0.5, 0.5 );
	material = new THREE.MeshNormalMaterial();

	mesh = new THREE.Mesh( geometry, material );
	scene.add( mesh );

	renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.setSize( window.innerWidth, window.innerHeight );
}

var showupdate = false;
$( document ).ready(function() {
	document.body.appendChild( renderer.domElement );
	//move the output box into position
	 outputbox = document.getElementById('boundtext');
	 outputbox.style.position = "absolute";
	 outputbox.style.left = '60px';
	 outputbox.style.height = '400px';
	 outputbox.style.width = '200px';
	 outputbox.style.top = '50px';
	 showupdate = true;

    // // Load a glTF resource
    //   loader.load(
    //   	// resource URL
    //   	'/models/Duck/glTF/Duck.gltf',
    //   	// called when the resource is loaded
    //   	function ( gltf ) {
    //   		scene.add( gltf.scene );
    //   		gltf.animations; // Array<THREE.AnimationClip>
    //   		gltf.scene; // THREE.Scene
    //   		gltf.scenes; // Array<THREE.Scene>
    //   		gltf.cameras; // Array<THREE.Camera>
    //   		gltf.asset; // Object
    //   	},
    //   	// called while loading is progressing
    //   	function ( xhr ) {
    //   		console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
    //   	},
    //   	// called when loading has errors
    //   	function ( error ) {
    //   		console.log( 'An error happened' );
    //   	}
    //   );
});

function animate() {
	requestAnimationFrame( animate );
	thisy = 5.05;
	thisx = 0.01;
	thisz = 0.01;
	if (accelVals.y !== undefined){thisy = accelVals.y;}
	if (accelVals.x !== undefined){thisx = accelVals.x;}
	//if (accelVals.z !== undefined){thisz = accelVals.z;}
	mesh.rotation.x = thisx;
	mesh.rotation.y = thisy;
	mesh.rotation.z = thisz;

	renderer.render( scene, camera );

	if (showupdate){
		setbounds(accelVals);
	}
}
