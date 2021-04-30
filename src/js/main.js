"use strict";
import { ViewerImageAPI } from "./viewer/ViewerImageAPI.js";
import { ViewerViewState } from "./viewer/ViewerViewState.js";

let camera, scene, renderer;

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

    // create the renderer, and embed the attributed dom element in the html page
    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    // link event listeners to the corresponding functions
    container.addEventListener('pointerdown', onPointerDown);

    document.addEventListener('wheel', onDocumentMouseWheel);

    document.addEventListener('resize', onWindowResize);
    
    const viewerImageAPI = new ViewerImageAPI();
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
