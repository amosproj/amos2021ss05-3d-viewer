"use strict";
import { ViewerAPI } from "./viewer/ViewerAPI.js";
import { ViewerState}  from "./viewer/ViewerState.js";
import { ViewerVersionAPI } from "./viewer/ViewerVersionAPI.js";

let trackPosLon, trackPosLat, trackPosVert = 0.0;

let trackImageID, trackFloorName = 0.0;

let viewerState = null;

let viewerAPI, viewerViewState, viewerFloorAPI;

// only call executed in this file
viewerAPI = new ViewerAPI("https://bora.bup-nbg.de/amos2floors/");

function logIt(name, payload, human) {
    if (name == "moved") {
        console.log(name + " to " + payload);
    } else if (name == "viewed") {
        console.log(name + " " + payload.lonov + " " + payload.latov + " " + payload.fov);
    } else if (name == "floor") {
        console.log(name + " " + payload);
    }
}

viewerAPI.listen(logIt);

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

function drawArrow(position  , scene ){
    console.log(position );
    direction = new THREE.Vector3(position);
    //normalize the direction vector (convert to vector of length 1)
    direction.normalize();


    //Create the arrow vetor
    const origin = new THREE.Vector3(0,0,0);
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
