"use strict";
import { ViewerImageAPI } from "./viewer/ViewerImageAPI.js";
import { ViewerViewState } from "./viewer/ViewerViewState.js";
import { ViewerPanoAPI } from "./viewer/ViewerPanoAPI.js";
import { MAX_FOV, DEFAULT_FOV } from "./viewer/Globals.js"
import { ViewerAPI } from "./viewer/ViewerAPI.js";


let viewerPanoAPI, viewerViewState, cameraMap, sceneMap, renderer,viewerAPI;
let spriteMap; // for createHUDSprites and updateHUDSprites

let onPointerDownMouseX = 0, onPointerDownMouseY = 0, onPointerDownLon = 0, onPointerDownLat = 0;

init();
animate();

function init() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    const container = document.getElementById('pano-viewer');
    // the only html element we work with (the pano-viewer div)

    // ----- init Panorama scene -----
    viewerPanoAPI = new ViewerPanoAPI();
    viewerViewState = new ViewerViewState(DEFAULT_FOV, 0, 0)
    

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
    viewerPanoAPI.scene.add(mesh);
    // ----- -----

    // ----- init Map scene -----
    cameraMap = new THREE.OrthographicCamera( -width / 2, width / 2, height / 2, -height / 2, 1, 10 );
    cameraMap.position.z = 10;
    sceneMap = new THREE.Scene();

    //Create new camera for 2D display
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load( "../assets/map-small.jpg", createHUDSprites );
    // ----- -----

    // create the renderer, and embed the attributed dom element in the html page
    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.autoClear = false; // To allow render overlay on top of panorama scene
    
    container.appendChild(renderer.domElement);

    // link event listeners to the corresponding functions
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('wheel', onDocumentMouseWheel);
    //document.addEventListener('resize', onWindowResize);

    // Add listener for keyboard
    document.body.addEventListener('keydown', keyPressed, false);


    let viewerImageAPI;
    
    // hardcoded to work with assets/ for now
    const jsonImageDataFilepath = "../assets/data.json";

    $.getJSON(jsonImageDataFilepath, function(data) {
        viewerImageAPI = new ViewerImageAPI(data);
    });

    //viewerAPI.move(15,15,1);
    //viewerPanoAPI.scene.add(viewerAPI.mesh);

}

function animate() {

    requestAnimationFrame(animate);
    render();

}

// this event listener is called when the user *begins* moving the picture
function onPointerDown(event) {

    onPointerDownMouseX = event.clientX;
    onPointerDownMouseY = event.clientY;

    onPointerDownLon = viewerViewState.lonov;
    onPointerDownLat = viewerViewState.latov;

    // Two new event listeneres are called to handle *how far* the user drags
    document.addEventListener('pointermove', onPointerMove);
    document.addEventListener('pointerup', onPointerUp);

}

// handles continues update of the distance mouse moved
function onPointerMove(event) {

    let scalingFactor = viewerPanoAPI.camera().fov / MAX_FOV;

    viewerViewState.lonov = (onPointerDownMouseX - event.clientX) * 0.1 * scalingFactor + onPointerDownLon;
    viewerViewState.latov = (event.clientY - onPointerDownMouseY) * 0.1 * scalingFactor + onPointerDownLat;

    // keep viewerviewstate.latov within bounds because it loops back around at top and bottom
    viewerViewState.latov = Math.max( -85, Math.min(85, viewerViewState.latov));

}

// this event listener is called when the user *ends* moving the picture
function onPointerUp() {

    document.removeEventListener('pointermove', onPointerMove);
    document.removeEventListener('pointerup', onPointerUp);

}

function onDocumentMouseWheel(event) {
    // the 0.05 constant determines how quick scrolling in and out feels for the user
    viewerViewState.fov = viewerPanoAPI.camera().fov + event.deltaY * 0.05;

    viewerPanoAPI.view(viewerViewState.lonov, viewerViewState.latov, viewerViewState.fov);

    viewerPanoAPI.camera().updateProjectionMatrix();

}

function keyPressed(e){
    switch(e.key) {
        case 'm':
            viewerAPI = new ViewerAPI();
            viewerAPI.move(15,15,1);
            // Create a Sphere for the image texture to be displayed on
            const sphere = new THREE.SphereGeometry(500, 60, 40);
            // invert the geometry on the x-axis so that we look out from the middle of the sphere
            sphere.scale( -1, 1, 1);

            // load the 360-panorama image data (one specific hardcoded for now)
            const texturePano = new THREE.TextureLoader().load( '../assets/0/'+viewerAPI.min+'r3.jpg' );
            texturePano.mapping = THREE.EquirectangularReflectionMapping; // not sure if this line matters
            
            // put the texture on the spehere and add it to the scene
            const material = new THREE.MeshBasicMaterial({ map: texturePano });
            const mesh = new THREE.Mesh(sphere, material);
            viewerPanoAPI.scene.add(mesh);
    }
    e.preventDefault();
  }
  

// currently not supported
function onWindowResize() {

    const width = window.innerWidth;
    const height = window.innerHeight;

    viewerPanoAPI.camera().aspect = width / height;
    viewerPanoAPI.camera().updateProjectionMatrix();
    
    cameraMap.left = - width / 2;
    cameraMap.right = width / 2;
    cameraMap.top = height / 2;
    cameraMap.bottom = - height / 2;
    cameraMap.updateProjectionMatrix();
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
    sceneMap.add( spriteMap );
    updateHUDSprites();

}

function updateHUDSprites() {

    spriteMap.position.set(window.innerWidth / 2, -window.innerHeight / 2, 1 ); // bottom right

}

function render() {
    
    viewerPanoAPI.view(viewerViewState.lonov, viewerViewState.latov, viewerViewState.fov);

    renderer.clear();
    renderer.render( viewerPanoAPI.scene, viewerPanoAPI.camera() );
    renderer.clearDepth();
    renderer.render( sceneMap, cameraMap );

}

