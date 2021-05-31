"use strict";
import { ViewerImageAPI } from "./viewer/ViewerImageAPI.js";
import { ViewerFloorAPI } from "./viewer/ViewerFloorAPI.js"
import { ViewerViewState } from "./viewer/ViewerViewState.js";
import { ViewerPanoAPI } from "./viewer/ViewerPanoAPI.js";
import { MAX_FOV, DEFAULT_FOV, newLocationFromPointAngle, baseURL } from "./viewer/Globals.js"
import { ViewerAPI } from "./viewer/ViewerAPI.js";
import { ViewerMapAPI } from "./viewer/ViewerMapAPI.js"
import { ViewerState } from "./viewer/ViewerState.js";
import { ViewerVersionAPI } from "./viewer/ViewerVersionAPI.js";

let trackPosLon, trackPosLat, trackPosVert = 0.0;

let trackImageID, trackFloorName = 0.0;

let viewerState = null;

let viewerPanoAPI, viewerMapAPI, viewerViewState, renderer, viewerAPI, viewerImageAPI, viewerFloorAPI;

let onPointerDownMouseX = 0,
    onPointerDownMouseY = 0,
    onPointerDownLon = 0,
    onPointerDownLat = 0;

// Load the metadata only once
$.ajax({
    url: baseURL + "data.json",
    xhrFields: {
        withCredentials: true
    }
}).done(function(data) {
    viewerImageAPI = new ViewerImageAPI(data.images);
    viewerFloorAPI = new ViewerFloorAPI(data, viewerImageAPI);

    init();
    animate();
});


function init() {

    const container = document.getElementById('pano-viewer');
    // the only html element we work with (the pano-viewer div)

    // ----- init Map scene -----
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

    // Create a function so that when the mouse is double clicked on any part of the panorama it leads to an event (change in image)
    document.addEventListener("dblclick", onDoubleClick);

    viewerAPI = new ViewerAPI(viewerImageAPI, viewerPanoAPI, viewerMapAPI, viewerFloorAPI);

    viewerFloorAPI.setViewerAndImageAPI(viewerAPI, viewerMapAPI);

    //----Control Menu (GUI)-----

    createControlMenuButtons();

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

    // keep lonov between 0 and 360
    viewerViewState.lonov = (viewerViewState.lonov + 360) % 360;

    // Draw on the map 
    //viewer. drawArrow(dir, viewerMapAPI.scene);

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

    const horizontalAngle = (viewerViewState.lonov > 270) ? 450 - viewerViewState.lonov : -(viewerViewState.lonov - 90);
    const horizontalOffset = (event.x - halfWidth) / halfWidth; // scaled between [-1,1] depending how left-right the click is
    const adjustedHorizontalAngle = horizontalAngle - (horizontalOffset * viewerViewState.fov / 2); // line from current position towards where the mouse double clicked (2D birds eye view angle)

    const cameraDir = viewerPanoAPI.camera.getWorldDirection();
    const verticalAngle = Math.abs(THREE.Math.radToDeg(Math.atan2(cameraDir.x, cameraDir.y))); // between [0,180]Deg depending on how far up/down the user looks
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

    const newPos = newLocationFromPointAngle(currentPos[0], currentPos[1], convertedAngle, distance);

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
    viewerState = new ViewerState([loc_para1, loc_para2, loc_para3], imageId, floors_name, [viewer_fov, latov_rad, lonov_rad]);
    view_para = viewerState.view;
    viewerAPI.viewerVersionAPI = new ViewerVersionAPI(vMajor, vMinor, view_para);

}


function createControlMenuButtons() {
    // Get number of Floors
    let numOfFloors = viewerFloorAPI.floors.length;

    // Show number of Floors
    $("#nof").text("Total Available Floors: " + numOfFloors + ". ");

    // Show current floor
    $("#cf").text("Current Floor: " + viewerFloorAPI.currentFloor.name + ". ");

    // push all floor names into an array
    let totalFloorsname = [];
    viewerFloorAPI.floors.forEach(function(item) {
        totalFloorsname.push(item.name);
    });

    // push totalfloors into an array
    let totalFloors = [];
    for (var i = 0; i < viewerFloorAPI.floors.length; i++) {
        totalFloors.push(i);
    }


    // Checking if the current floor is on the highest or lowest floor
    if (totalFloors.length == 1) {
        $('button[name="buttonDown"]').prop('disabled', true);
        $('button[name="buttonUp"]').prop('disabled', true);
    } else if (viewerFloorAPI.currentFloorId == totalFloors[0]) {
        $('button[name="buttonDown"]').prop('disabled', true);
    } else if (viewerFloorAPI.currentFloorId == totalFloors[totalFloors.length - 1]) {
        $('button[name="buttonUp"]').prop('disabled', true);
    }

    // Create Drop down Menus by floor names
    for (let i = 0; i < totalFloors.length; i++) {
        $('.control select').append('<option value=' + i + '>' + totalFloorsname[i] + '</option>');
    }

    // Change current floor by dropdown menu
    $('.control select').change(function() {
        $("select option:selected").each(function() {
            // conversion between currentFloorID with viewerFloorAPI.floors.name
            let index_in_floor_name = totalFloorsname.indexOf($(this).text());
            viewerFloorAPI.currentFloorId = totalFloors[index_in_floor_name];

            $("#cf").text("Current Floor: " + viewerFloorAPI.currentFloor.name + ". ");

            $('button[name="buttonUp"]').prop('disabled', false);
            $('button[name="buttonDown"]').prop('disabled', false);

            // Checking if the current floor is on the highest or lowest floor
            if (viewerFloorAPI.currentFloorId == totalFloors[0]) {
                // lowest floor
                $('button[name="buttonDown"]').prop('disabled', true);

            } else if (viewerFloorAPI.currentFloorId == totalFloors[totalFloors.length - 1]) {
                // highest floor
                $('button[name="buttonUp"]').prop('disabled', true);

            }
            // display pano from new floor and show new map
            const firstImageInFloor = viewerFloorAPI.floors[viewerFloorAPI.currentFloorId].i[0][0];
            viewerPanoAPI.display(firstImageInFloor);
            viewerMapAPI.redraw();

        });
    });

    //Up Button for changing currentfloor
    $('button[name="buttonUp"]').click(function() {

        viewerFloorAPI.currentFloorId++;
        $("#cf").text("Current Floor: " + viewerFloorAPI.currentFloor.name + ". ");

        // change to higher floor
        if (viewerFloorAPI.currentFloorId == viewerFloorAPI.floors.length - 1) {

            // disable the up button if it's already at the highest floor
            $('button[name="buttonUp"]').prop('disabled', true);

        } else {

            //enable the up button if it's not in the highest floor
            $('button[name="buttonUp"]').prop('disabled', false);

        }
        $('.control select').val(viewerFloorAPI.currentFloorId).change();

        // display pano from new floor and show new map
        const firstImageInFloor = viewerFloorAPI.floors[viewerFloorAPI.currentFloorId].i[0][0];
        viewerPanoAPI.display(firstImageInFloor);
        viewerMapAPI.redraw();

    });

    //Down Button for changing currentfloor
    $('button[name="buttonDown"]').click(function() {

        viewerFloorAPI.currentFloorId--;
        $("#cf").text("Current Floor: " + viewerFloorAPI.currentFloor.name + ". ");

        // change to lower floor
        if (viewerFloorAPI.currentFloorId < 1) {

            // disable the down button if it's already at the lowest floor
            $('button[name="buttonDown"]').prop('disabled', true);

        } else {

            //enable the down button if it's not in the lowest floor
            $('button[name="buttonDown"]').prop('disabled', false);

        }
        $('.control select').val(viewerFloorAPI.currentFloorId).change();

        // display pano from new floor and show new map
        const firstImageInFloor = viewerFloorAPI.floors[viewerFloorAPI.currentFloorId].i[0][0];
        viewerPanoAPI.display(firstImageInFloor);
        viewerMapAPI.redraw();
    });

}


function drawArrow(position, scene) {
    console.log(position);
    direction = new THREE.Vector3(position);
    //normalize the direction vector (convert to vector of length 1)
    direction.normalize();


    //Create the arrow vetor
    const origin = new THREE.Vector3(0, 0, 0);
    const length = 20;
    const hex = 0xff0000; // red color
    var arrowHelper = new THREE.ArrowHelper(direction, origin, length, hex);
    scene.add(arrowHelper);

}

function calcPosFromLatLonRad(radius, lat, lon) {

    var spherical = new THREE.Spherical(
        radius,
        THREE.Math.degToRad(90 - lon),
        THREE.Math.degToRad(lat)
    );

    var vector = new THREE.Vector3();
    vector.setFromSpherical(spherical);

    // console.log(vector.x, vector.y, vector.z);
    return vector;
}


function updateArrow(arrowHelper, direction) {
    // update the arrow position
    var newSourcePos = new THREE.Vector3(10, 10, 10);
    var newTargetPos = new THREE.Vector3(60, 10, 10);
    arrowHelper.position.set(newSourcePos);
    direction = new THREE.Vector3().sub(newTargetPos, newSourcePos);
    arrowHelper.setDirection(direction.normalize());
    arrowHelper.setLength(direction.length());
}

//Configuration File for Parameters

var config = {};

config.zooming = {};
config.rotation = {};
config.initialFOV = {};
config.MAX_FOV = {};
config.MIN_FOV = {};
config.web = {};

config.zooming.speed = process.env.loc_para1;
config.rotation.speed = process.env.loc_para2;
config.initial.FOV = '80';
config.MAX.fov = "100";
config.MIN.FOV = 10
config.web.port = process.env.WEB_PORT || 5500;

module.exports = config;