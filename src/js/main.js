"use strict";
import { ViewerImageAPI } from "./viewer/ViewerImageAPI.js";
import { ViewerFloorAPI } from "./viewer/ViewerFloorAPI.js"
import { ViewerViewState } from "./viewer/ViewerViewState.js";
import { ViewerPanoAPI } from "./viewer/ViewerPanoAPI.js";
import { MAX_FOV, DEFAULT_FOV, newLocationFromPointAngle, baseURL } from "./viewer/Globals.js"
import { ViewerAPI } from "./viewer/ViewerAPI.js";
import { ViewerMapAPI } from "./viewer/ViewerMapAPI.js"
//adding class
import {ViewerState} from "./viewer/ViewerState.js";
import {ViewerVersionAPI} from "./viewer/ViewerVersionAPI.js";

let trackPosLon,trackPosLat,trackPosVert=0.0;

let trackImageID,trackFloorName=0.0;

let viewerState=null;

let viewerPanoAPI, viewerMapAPI, viewerViewState, renderer, viewerAPI, viewerImageAPI, viewerFloorAPI;

let onPointerDownMouseX = 0, onPointerDownMouseY = 0, onPointerDownLon = 0, onPointerDownLat = 0;

// Load the metadata only once
$.ajax({
    url: baseURL + "data.json",
    xhrFields: {
        withCredentials: true
    }
}).done(function (data) {
    viewerImageAPI = new ViewerImageAPI(data.images);
    viewerFloorAPI = new ViewerFloorAPI(data, viewerImageAPI);

    init();
    animate();
});


function init() {

    const container = document.getElementById('pano-viewer');
    // the only html element we work with (the pano-viewer div)

    // ----- init Map scene -----
    //viewerMapAPI = new ViewerMapAPI("../assets/map-wb50.png", viewerImageAPI); // load in map texture 
    viewerMapAPI = new ViewerMapAPI(viewerImageAPI, viewerFloorAPI); // load in map texture 

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

    // Add listener for keyboard to test floor changing backend
    document.body.addEventListener('keydown', keyPressed, false);

    // Create a function so that when the mouse is double clicked on any part of the panorama it leads to an event (change in image)
    document.addEventListener("dblclick", onDoubleClick);

    viewerAPI = new ViewerAPI(viewerImageAPI, viewerPanoAPI, viewerMapAPI, viewerFloorAPI);

}

function keyPressed(e) {
    switch(e.key) {
        case 'u':
            // change to higher floor
            if (viewerFloorAPI.currentFloorId >= viewerFloorAPI.floors.length - 1) {
                console.log("Cant change floors alredy on highest");
            } else {
                viewerFloorAPI.currentFloorId++;
                
                const firstImageInFloor = viewerFloorAPI.floors[viewerFloorAPI.currentFloorId].i[0][0];
                viewerPanoAPI.display(firstImageInFloor);
                viewerMapAPI.redraw();
            }
            break;
        case 'd':
            // change to lower floor
            if (viewerFloorAPI.currentFloorId < 1) {
                console.log("Cant change floors alredy on lowest");
            } else {
                viewerFloorAPI.currentFloorId--;
                
                const firstImageInFloor = viewerFloorAPI.floors[viewerFloorAPI.currentFloorId].i[0][0];
                viewerPanoAPI.display(firstImageInFloor);
                viewerMapAPI.redraw();
            }
            break;
    }
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
    basicSetUp();

}

// handles continues update of the distance mouse moved
function onPointerMove(event) {

    let scalingFactor = viewerPanoAPI.camera.fov / MAX_FOV;

    viewerViewState.lonov = (onPointerDownMouseX - event.clientX) * 0.1 * scalingFactor + onPointerDownLon;
    viewerViewState.latov = (event.clientY - onPointerDownMouseY) * 0.1 * scalingFactor + onPointerDownLat;

    // keep viewerviewstate.latov within bounds because it loops back around at top and bottom
    viewerViewState.latov = Math.max(-85, Math.min(85, viewerViewState.latov));

    // Get the direction of the camera 
    var dir = new THREE.Vector3(0,0,1); 
    viewerPanoAPI.camera.getWorldDirection(dir);

    // Draw on the map 
    drawArrow(dir, viewerMapAPI.scene);

}

// this event listener is called when the user *ends* moving the picture
function onPointerUp() {

    document.removeEventListener('pointermove', onPointerMove);
    document.removeEventListener('pointerup', onPointerUp);
   // basicSetUp();

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

    viewerMapAPI.camera.left = -width / 2;
    viewerMapAPI.camera.right = width / 2;
    viewerMapAPI.camera.top = height / 2;
    viewerMapAPI.camera.bottom = -height / 2;
    viewerMapAPI.camera.updateProjectionMatrix();

    renderer.setSize(width, height);
    render();

}

function onDoubleClick(event) {
    const halfWidth = window.innerWidth / 2;
    const halfHeight = window.innerHeight / 2;

    const horizontalAngle = viewerPanoAPI.getAngle();
    const horizontalOffset = (event.x - halfWidth) / halfWidth; // scaled between [-1,1] depending how left-right the click is
    const adjustedHorizontalAngle = horizontalAngle - (horizontalOffset * viewerViewState.fov / 2); // line from current position towards where the mouse double clicked (2D birds eye view angle)

    const cameraDir = viewerPanoAPI.camera.getWorldDirection();
    const verticalAngle = Math.abs(THREE.Math.radToDeg(Math.atan2(cameraDir.x,cameraDir.y))); // between [0,180]Deg depending on how far up/down the user looks
    const verticalOffset = (event.y - halfHeight) / halfHeight; // between [-1,1] depending how up-down the mouse click is on the screen
    const adjustedVerticalAngle = verticalAngle + (verticalOffset * viewerViewState.fov / 2);
    const realVerticalOffset = (adjustedVerticalAngle - 90) / 90; // between [-1,1] depending how far up/down user looks and clicks
    
    const MEDIAN_WALKING_DISTANCE = 5; // in meter
    // distance to be walked along adjustedHorizontalAngle from current location
    const distance = MEDIAN_WALKING_DISTANCE - (realVerticalOffset * MEDIAN_WALKING_DISTANCE);
    
    // adjustedHorizontalAngle converted to represent directions like specified in newLocationFromPointAngle
    let convertedAngle = (adjustedHorizontalAngle > -90) ? adjustedHorizontalAngle - 90 : adjustedHorizontalAngle + 270;
    convertedAngle = THREE.Math.degToRad(convertedAngle);
    const currentPos = viewerImageAPI.currentImage.pos;
    
    const newPos = newLocationFromPointAngle(currentPos[0], currentPos[1], convertedAngle, distance)

    viewerAPI.move(newPos[0], newPos[1], currentPos[2]);

    trackPosLon = currentPos[0];
    trackPosLat = currentPos[1];
    trackPosVert = currentPos[2];
    trackImageID = viewerImageAPI.currentImageId;
    trackFloorName = viewerImageAPI.currentImage.floor;
}

function render() {

    viewerPanoAPI.view(viewerViewState.lonov, viewerViewState.latov, viewerViewState.fov);
    renderer.clear();
    renderer.render(viewerPanoAPI.scene, viewerPanoAPI.camera);
    renderer.clearDepth();
    renderer.render(viewerMapAPI.scene, viewerMapAPI.camera);

}


   
function basicSetUp() {
   var loc_para1;
   var loc_para2;
   var loc_para3;
   var imageId;
   var floors_name;
   if (trackPosVert == 0 && trackPosLat == null || trackPosVert == 0 && trackPosLon == null) {
      imageId = viewerFloorAPI.floors[viewerFloorAPI.currentFloorId].viewerImages[viewerFloorAPI.currentFloorId].id;
      floors_name = viewerFloorAPI.floors[viewerFloorAPI.currentFloorId].name;
      loc_para1 = viewerFloorAPI.floors[viewerFloorAPI.currentFloorId].viewerImages[viewerFloorAPI.currentFloorId].pos[0];
      loc_para2 = viewerFloorAPI.floors[viewerFloorAPI.currentFloorId].viewerImages[viewerFloorAPI.currentFloorId].pos[1];
      loc_para3 = viewerFloorAPI.floors[viewerFloorAPI.currentFloorId].viewerImages[viewerFloorAPI.currentFloorId].pos[2];
 
   } else {
     loc_para1 = trackPosLon;
     loc_para2 = trackPosLat;
     loc_para3 = trackPosVert;
     imageId = trackImageID;
     floors_name = trackFloorName;
  
   }
   var latov_rad = viewerViewState.latov * Math.PI / 180.0;
   var lonov_rad = viewerViewState.lonov * Math.PI / 180.0;
   var viewer_fov = viewerViewState.fov;
   var vMajor = viewerAPI.MAJOR;
   var vMinor = viewerAPI.MINOR;
   var view_para = [];
   viewerState = new ViewerState( [loc_para1,loc_para2,loc_para3],imageId,floors_name,[viewer_fov,latov_rad,lonov_rad] ) ;
   view_para = viewerState.view;
   viewerAPI.viewerVersionAPI = new ViewerVersionAPI(vMajor, vMinor,view_para);
 
}






function getAngle(camera){
    var vector = new THREE.Vector3( 0, 0, - 1 );
    // Get the direction of the camera 
    vector = camera.getWorldDirection();
    // Compute the viewing angle direction
    var theta = THREE.Math.atan2(vector.x,vector.z);
    // Return the angle in degrees
    var angle = THREE.Math.radToDeg( theta );
    return angle; 
}


function drawArrow(direction, scene ){

    //normalize the direction vector (convert to vector of length 1)
    direction.normalize();

    //Create the arrow vetor
    const origin = new THREE.Vector3(0,0, 0 );
    const length = 20;
    const hex = 0xff0000; // red color
    var arrowHelper = new THREE.ArrowHelper( direction, origin, length, hex );
    scene.add(arrowHelper); 

}

function updateArrow(arrowHelper, direction){
    // update the arrow position
    var newSourcePos = new THREE.Vector3(10, 10, 10);
    var newTargetPos = new THREE.Vector3(60, 10, 10);
    arrowHelper.position.set(newSourcePos);
    direction = new THREE.Vector3().sub(newTargetPos, newSourcePos);
    arrowHelper.setDirection(direction.normalize());
    arrowHelper.setLength(direction.length());
}
