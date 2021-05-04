"use strict";
import { ViewerImageAPI } from "./viewer/ViewerImageAPI.js";
import { ViewerViewState } from "./viewer/ViewerViewState.js";
// import { GUI } from './jsm/libs/dat.gui.module.js';

let camera, scene, renderer;
//var cameraOrtho, sceneOrtho, map_renderer;
var geometry, material, mesh;

let cameraOrtho, sceneOrtho;
let spriteBR;

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
    camera = new THREE.PerspectiveCamera(DEFAULT_FOV, window.innerWidth / window.innerHeight, 1, 1100);
    scene = new THREE.Scene();

    // Create a Sphere for the image texture to be displayed on
    const sphere = new THREE.SphereGeometry(500, 60, 40);
    // invert the geometry on the x-axis so that we look out from the middle of the sphere
    sphere.scale( -1, 1, 1);

    // load the 360-panorama image data (one specific hardcoded for now)
    const texture = new THREE.TextureLoader().load( '../assets/0/0r3.jpg' );
    texture.mapping = THREE.EquirectangularReflectionMapping; // not sure if this line matters
    
    // put the texture on the spehere and add it to the scene
    const material = new THREE.MeshBasicMaterial({ map: texture });
    const mesh = new THREE.Mesh(sphere, material);
    scene.add(mesh);

    
    //Create new camera for 2D display
    
    const width = window.innerWidth;
    const height = window.innerHeight;

    cameraOrtho = new THREE.OrthographicCamera( - width / 2, width / 2, height / 2, - height / 2, 1, 10 );
    cameraOrtho.position.z = 10;
    sceneOrtho = new THREE.Scene();


    //ADD MAP TEXTURE 
	//var mapTexture = THREE.ImageUtils.loadTexture( '../assets/map0.png' ); // var map = new THREE.TextureLoader().load( "../assets/map0.png" );
    // var mat = new THREE.SpriteMaterial( { map: map, color: 0xffffff } );
	//var mapMaterial = new THREE.SpriteMaterial( { map: mapTexture, useScreenCoordinates: true} ); //, alignment: THREE.SpriteAlignment.topLeft  } );
	//var sprite = new THREE.Sprite( mapMaterial );
	//sprite.position.set( 50, 50, 0 );
	//sprite.scale.set( 64, 64, 1.0 ); // imageWidth, imageHeight
	//scene.add( sprite );

    // create sprites
    const mapTexture = new THREE.TextureLoader().load( "../assets/map0.png", createHUDSprites );
    const materialMap = new THREE.SpriteMaterial( { map: mapTexture, color: 0xffffff, fog: true } );


    // create the renderer, and embed the attributed dom element in the html page
    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    //Render 2D Map
    renderer.clearDepth();
    renderer.render( sceneOrtho, cameraOrtho );
    container.appendChild(renderer.domElement);



    // link event listeners to the corresponding functions
    container.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('wheel', onDocumentMouseWheel);
    document.addEventListener('resize', onWindowResize);
    
    
    let viewerImageAPI;
    // initGui();
    
    // hardcoded to work with assets/ for now
    const jsonImageDataFilepath = "../assets/data.json";

    $.getJSON(jsonImageDataFilepath, function(data) {
        viewerImageAPI = new ViewerImageAPI(data);
    });

}

function animate() {

    requestAnimationFrame(animate);
    update();

}

function update() {

    phi = THREE.MathUtils.degToRad(90 - latitude);
    theta = THREE.MathUtils.degToRad(longitude);

    const x = 500 * Math.sin(phi) * Math.cos(theta);
    const y = 500 * Math.cos(phi);
    const z = 500 * Math.sin(phi) * Math.sin(theta);

    camera.lookAt(x, y, z);

    renderer.render(scene, camera);

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
    const fov = camera.fov + event.deltaY * 0.05;

    camera.fov = THREE.MathUtils.clamp(fov, MIN_FOV, MAX_FOV);

    camera.updateProjectionMatrix();

}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

}



function createHUDSprites( texture ) {

    const material = new THREE.SpriteMaterial( { map: texture } );

    const width = material.map.image.width;
    const height = material.map.image.height;


    spriteBR = new THREE.Sprite( material );
    spriteBR.center.set( 1.0, 0.0 );
    spriteBR.scale.set( width, height, 1 );
    sceneOrtho.add( spriteBR );

    updateHUDSprites();

}

function updateHUDSprites() {

    const width = window.innerWidth / 2;
    const height = window.innerHeight / 2;

    spriteBR.position.set( width, - height, 1 ); // bottom right
    
}