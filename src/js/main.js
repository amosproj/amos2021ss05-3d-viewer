"use strict";
import { ViewerImageAPI } from "./viewer/ViewerImageAPI.js";
import { ViewerViewState } from "./viewer/ViewerViewState.js";
import { ViewerPanoAPI } from "./viewer/ViewerPanoAPI.js";
import { MAX_FOV, DEFAULT_FOV } from "./viewer/Globals.js"
import { ViewerAPI } from "./viewer/ViewerAPI.js";
import { ViewerMapAPI } from "./viewer/ViewerMapAPI.js"
import { ViewerLibrary} from "./viewer/ViewerLibrary.js"
import {ViewerLibLicense} from "./viewer/ViewerLibLicense.js"


let viewerPanoAPI, viewerMapAPI, viewerViewState, renderer, viewerAPI, viewerImageAPI;

let onPointerDownMouseX = 0, onPointerDownMouseY = 0, onPointerDownLon = 0, onPointerDownLat = 0;

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
    setTimeout(function () { viewerAPI.move(15, 15, 1); }, 5000);
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
    viewerViewState.latov = Math.max( -85, Math.min(85, viewerViewState.latov));

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

  
// currently not supported
function onWindowResize() {

    const width = window.innerWidth;
    const height = window.innerHeight;

    viewerPanoAPI.camera.aspect = width / height;
    viewerPanoAPI.camera.updateProjectionMatrix();
    
    viewerMapAPI.camera.left = - width / 2;
    viewerMapAPI.camera.right = width / 2;
    viewerMapAPI.camera.top = height / 2;
    viewerMapAPI.camera.bottom = - height / 2;
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

function basic_api(){

    // three.js
    let Three_lic_name = 'MIT License';

    let Three_lic_text = ' \
    Copyright © 2010-2021 three.js authors \
    Permission is hereby granted, free of charge, to any person obtaining a copy\
    of this software and associated documentation files (the "Software"), to deal\
    in the Software without restriction, including without limitation the rights\
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell\
    copies of the Software, and to permit persons to whom the Software is\
    furnished to do so, subject to the following conditions:\
    \
    The above copyright notice and this permission notice shall be included in\
    all copies or substantial portions of the Software.\
    \
    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,\
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE\
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER\
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,\
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN\
    THE SOFTWARE.\
    ';

    let Three_lic = new ViewerLibLicense(Three_lic_name,Three_lic_text);

    let Three_name = 'Three.js JavaScript 3D Library';

    let Three_text = '\
    Three.js is a cross-browser JavaScript library and application programming interface (API) used to create\
    and display animated 3D computer graphics in a web browser using WebGL.\
    Three.js allows the creation of graphical processing unit (GPU)-accelerated 3D animations\
    using the JavaScript language as part of a website without relying on proprietary browser plugins.\
    This is possible due to the advent of WebGL.\
    \
    from https://en.wikipedia.org/wiki/Three.js\
    ';

    let Three_url = 'https://threejs.org/';

    viewerlibrary_Three = new ViewerLibrary(Three_lic,Three_name,Three_text,Three_url);

    // jQuery.js
    let jQuery_lic_name = 'MIT License';

    let jQuery_lic_text = '\
    Copyright OpenJS Foundation and other contributors, https://openjsf.org/\
    \
    Permission is hereby granted, free of charge, to any person obtaining\
    a copy of this software and associated documentation files (the\
    "Software"), to deal in the Software without restriction, including\
    without limitation the rights to use, copy, modify, merge, publish,\
    distribute, sublicense, and/or sell copies of the Software, and to\
    permit persons to whom the Software is furnished to do so, subject to\
    the following conditions:\
    \
    The above copyright notice and this permission notice shall be\
    included in all copies or substantial portions of the Software.\
    \
    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,\
    EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF\
    MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND\
    NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE\
    LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION\
    OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION\
    WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.\
    ';
    
    let jQuery_lic = new ViewerLibLicense(jQuery_lic_name,jQuery_lic_text);
    
    let jQuery_name = 'jQuery JavaScript Library';

    let jQuery_text = '\
    jQuery is a fast, small, and feature-rich JavaScript library.\
    It makes things like HTML document traversal and manipulation, event handling, animation,\
    and Ajax much simpler with an easy-to-use API that works across a multitude of browsers.\
    With a combination of versatility and extensibility, jQuery has changed the way that millions of people write JavaScript.\
    \
    from https://jquery.com\
    ';

    let jQuery_url = 'https://jquery.com/';

    viewerlibrary_jQuery = new ViewerLibrary(jQuery_lic,jQuery_name,jQuery_text,jQuery_url);

}