"use strict";
//import * as THREE from './libs/three.module.js'
import { ViewerImageAPI } from "./viewer/ViewerImageAPI.js";
import { ViewerViewState } from "./viewer/ViewerViewState.js";

// import { GUI } from './jsm/libs/dat.gui.module.js';

let cameraPano, scenePano, cameraOrtho, sceneOrtho, renderer;
let spriteMap; // for createHUDSprites and updateHUDSprites

let onPointerDownMouseX = 0, onPointerDownMouseY = 0,
    longitude = 0, onPointerDownLon = 0,
    latitude = 0, onPointerDownLat = 0,
    phi = 0, theta = 0;

const DEFAULT_FOV = 90, MAX_FOV = 120, MIN_FOV = 5;

init();
animate();

function init() {

    const container = document.getElementById('pano-viewer');
    // the only html element we work with (the pano-viewer div)
   
    // Create the Thee.js scene
    cameraPano = new THREE.PerspectiveCamera(DEFAULT_FOV, window.innerWidth / window.innerHeight, 1, 1100);
	//camera.position.z = 500;
    scenePano = new THREE.Scene();

     // Create the Overlay scene
     
    const width = window.innerWidth;
    const height = window.innerHeight;

    cameraOrtho = new THREE.OrthographicCamera( - width / 2, width / 2, height / 2, - height / 2, 1, 10 );
    cameraOrtho.position.z = 10;
    sceneOrtho = new THREE.Scene();

    // Create a Sphere for the image texture to be displayed on
    const sphere = new THREE.SphereGeometry(500, 60, 40);
    // invert the geometry on the x-axis so that we look out from the middle of the sphere
    sphere.scale( -1, 1, 1);

    // load the 360-panorama image data (one specific hardcoded for now)
    const texturePano = new THREE.TextureLoader().load( '../assets/0/0r3.jpg' );
    texturePano.mapping = THREE.EquirectangularReflectionMapping; // not sure if this line matters
    
    // put the texture on the spehere and add it to the scene
    const material = new THREE.MeshBasicMaterial({ map: texturePano });
    const mesh = new THREE.Mesh(sphere, material);
    scenePano.add(mesh);


    //Create new camera for 2D display
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load( "../assets/map-small.jpg", createHUDSprites );

    // create the renderer, and embed the attributed dom element in the html page
    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);
    renderer.autoClear = false; // To allow render overlay on top of panorama scene
    
    container.appendChild(renderer.domElement);

    // link event listeners to the corresponding functions
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('wheel', onDocumentMouseWheel);
    //document.addEventListener('resize', onWindowResize);

    let viewerImageAPI;
    
    // hardcoded to work with assets/ for now
    const jsonImageDataFilepath = "../assets/data.json";

    $.getJSON(jsonImageDataFilepath, function(data) {
        viewerImageAPI = new ViewerImageAPI(data);
    });

}

function animate() {

    requestAnimationFrame(animate);
    update();
    render();

}
function update() {

    phi = THREE.MathUtils.degToRad(90 - latitude);
    theta = THREE.MathUtils.degToRad(longitude);

    const x = 500 * Math.sin(phi) * Math.cos(theta);
    const y = 500 * Math.cos(phi);
    const z = 500 * Math.sin(phi) * Math.sin(theta);

    cameraPano.lookAt(x, y, z);

}

// this event listener is called when the user *begins* moving the picture
function onPointerDown(event) {

    onPointerDownMouseX = event.clientX;
    onPointerDownMouseY = event.clientY;

    onPointerDownLon = longitude;
    onPointerDownLat = latitude;

    // Two new event listeneres are called to handle *how far* the user drags
    document.addEventListener('pointermove', onPointerMove);
    document.addEventListener('pointerup', onPointerUp);

}

// handles continues update of the distance mouse moved
function onPointerMove(event) {

    longitude = (onPointerDownMouseX - event.clientX) * 0.2 + onPointerDownLon;
    latitude = (event.clientY - onPointerDownMouseY) * 0.2 + onPointerDownLat;

    // keep latitude within bounds because it loops back around at top and bottom
    latitude = Math.max( -85, Math.min(85, latitude));

}

// this event listener is called when the user *ends* moving the picture
function onPointerUp() {

    document.removeEventListener('pointermove', onPointerMove);
    document.removeEventListener('pointerup', onPointerUp);

}

function onDocumentMouseWheel(event) {

    // the 0.05 constant determines how quick scrolling in and out feels for the user
    const fov = cameraPano.fov + event.deltaY * 0.05;

    cameraPano.fov = THREE.MathUtils.clamp(fov, MIN_FOV, MAX_FOV);

    cameraPano.updateProjectionMatrix();

}

// currently not supported
function onWindowResize() {

    const width = window.innerWidth;
    const height = window.innerHeight;

    cameraPano.aspect = width / height;
    cameraPano.updateProjectionMatrix();
    
    cameraOrtho.left = - width / 2;
    cameraOrtho.right = width / 2;
    cameraOrtho.top = height / 2;
    cameraOrtho.bottom = - height / 2;
    cameraOrtho.updateProjectionMatrix();
    updateHUDSprites();
    
    renderer.setSize(width, height);

}


function createHUDSprites( texture ) {
    //Texture is Map
    const material = new THREE.SpriteMaterial( { map: texture } );
    const width = material.map.image.width;
    const height = material.map.image.height;
    spriteMap = new THREE.Sprite( material );
    spriteMap.center.set( 1.0, 0.0 ); // bottom right
    spriteMap.scale.set( width, height, 1 );
    sceneOrtho.add( spriteMap );
    updateHUDSprites();

}

function updateHUDSprites() {

    const width = window.innerWidth / 2;
    const height = window.innerHeight / 2;
    spriteMap.position.set(width, -height, 1 );// bottom right

}

function render() {
    
    renderer.clear();
	renderer.render( scenePano, cameraPano );
	renderer.clearDepth();
    renderer.render( sceneOrtho, cameraOrtho );

}

