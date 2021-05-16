"use strict";
import { ViewerImageAPI } from "./viewer/ViewerImageAPI.js";
import { ViewerViewState } from "./viewer/ViewerViewState.js";
import { ViewerPanoAPI } from "./viewer/ViewerPanoAPI.js";
import { MAX_FOV, DEFAULT_FOV } from "./viewer/Globals.js"
import { ViewerAPI } from "./viewer/ViewerAPI.js";
import { ViewerMapAPI } from "./viewer/ViewerMapAPI.js"
import { ViewerImage } from "./viewer/ViewerImage.js";


let viewerPanoAPI, viewerMapAPI, viewerViewState, renderer, viewerAPI, viewerImageAPI;

let onPointerDownMouseX = 0,
    onPointerDownMouseY = 0,
    onPointerDownLon = 0,
    onPointerDownLat = 0;

// Load the metadata only once
const jsonImageDataFilepath = "../assets/data.json";
$.getJSON(jsonImageDataFilepath, function(data) {
    viewerImageAPI = new ViewerImageAPI(data);

    init();
    animate();
});


function init() {

    const container = document.getElementById('pano-viewer');
    // the only html element we work with (the pano-viewer div)

    // ----- init Map scene -----
    viewerMapAPI = new ViewerMapAPI("../assets/map-wb50.png", viewerImageAPI); // load in map texture 

    // ----- init Panorama scene -----
    viewerPanoAPI = new ViewerPanoAPI(viewerImageAPI);
    viewerViewState = new ViewerViewState(DEFAULT_FOV, 0, 0)

    // create the renderer, and embed the attributed dom element in the html page
    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.autoClear = false; // To allow render overlay on top of panorama scene
    renderer.sortObjects = false;

    container.appendChild(renderer.domElement);

    // link event listeners to the corresponding functions
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('wheel', onDocumentMouseWheel);
    //document.addEventListener('resize', onWindowResize);

    // Add listener for keyboard
    //document.body.addEventListener('keydown', keyPressed, false);

    viewerAPI = new ViewerAPI(viewerImageAPI, viewerPanoAPI);
    //setTimeout(function () { viewerAPI.move(15, 15, 1); }, 5000);
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

    let scalingFactor = viewerPanoAPI.camera.fov / MAX_FOV;

    viewerViewState.lonov = (onPointerDownMouseX - event.clientX) * 0.1 * scalingFactor + onPointerDownLon;
    viewerViewState.latov = (event.clientY - onPointerDownMouseY) * 0.1 * scalingFactor + onPointerDownLat;

    // keep viewerviewstate.latov within bounds because it loops back around at top and bottom
    viewerViewState.latov = Math.max(-85, Math.min(85, viewerViewState.latov));

}

// this event listener is called when the user *ends* moving the picture
function onPointerUp() {

    document.removeEventListener('pointermove', onPointerMove);
    document.removeEventListener('pointerup', onPointerUp);

}

function onDocumentMouseWheel(event) {
    // the 0.05 constant determines how quick scrolling in and out feels for the user
    viewerViewState.fov = viewerPanoAPI.camera.fov + event.deltaY * 0.05;

    viewerPanoAPI.view(viewerViewState.lonov, viewerViewState.latov, viewerViewState.fov);

    viewerPanoAPI.camera.updateProjectionMatrix();

}

// function keyPressed(e){
//     switch(e.key) {
//         case 'm':
//             //viewerAPI.move(15,15,1);
//     }
//     e.preventDefault();
//   }


// currently not supported
function onWindowResize() {

    const width = window.innerWidth;
    const height = window.innerHeight;

    viewerPanoAPI.camera.aspect = width / height;
    viewerPanoAPI.camera.updateProjectionMatrix();

    viewerMapAPI.camera.left = -width / 2;
    viewerMapAPI.camera.right = width / 2;
    viewerMapAPI.camera.top = height / 2;
    viewerMapAPI.camera.bottom = -height / 2;
    viewerMapAPI.camera.updateProjectionMatrix();

    renderer.setSize(width, height);
    render();

}

function render() {

    viewerPanoAPI.view(viewerViewState.lonov, viewerViewState.latov, viewerViewState.fov);
    renderer.clear();
    renderer.render(viewerPanoAPI.scene, viewerPanoAPI.camera);
    renderer.clearDepth();
    renderer.render(viewerMapAPI.scene, viewerMapAPI.camera);

}
// Create a function so that when the mouse is double clicked on any part of the panorama it leads to an event (change in image)

document.getElementById(ViewerPanoAPI).addEventListener(doubleclick, function(changeimage) {

        }