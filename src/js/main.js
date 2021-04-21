"use strict";
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.123/examples/jsm/controls/OrbitControls.js';
// Import this *module*, fetch it from the link where it's hosted

let camera, scene, renderer;


init();

function init() {

	const container = document.getElementById('pano-viewer');
    // the only html element we work with (the pano-viewer div)

	camera = new THREE.PerspectiveCamera(100, window.innerWidth / window.innerHeight, 1, 1100);
	camera.position.z = 0.01;

	scene = new THREE.Scene();

	const texture = new THREE.TextureLoader().load('../assets/0r3.jpg', render);
	texture.mapping = THREE.EquirectangularReflectionMapping;	
	scene.background = texture;

    // create camera and scene, put pano picture as background of the scene

	renderer = new THREE.WebGLRenderer();
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);
	container.appendChild(renderer.domElement);

    // create the renderer, and embed the attributed dom element in the html page
	
	const controls = new OrbitControls( camera, renderer.domElement );
	controls.addEventListener( 'change', render );
    // instanciate OrbitControls, and add the event listener render for change 
    // so whenever the event "change" (any use interaction at all) occurs, render() is called

}

// display the scene from the (potentially updated) angle of the camera
function render() {

    renderer.render( scene, camera );

}

/*
This first demo uses not only the Three.js framework to display the 360 pano-picture,
but it also uses an example implementation by the Three.js team to pan and zoom the picture.

References:
https://threejs.org/docs/#examples/en/controls/OrbitControls
https://jsfiddle.net/btwz3261/


Sidenote: For an implementation without OrbitControls, i.e. where the math for pan and zoom is done "manually", see here: https://codepen.io/b007/pen/oNgNxzz
*/