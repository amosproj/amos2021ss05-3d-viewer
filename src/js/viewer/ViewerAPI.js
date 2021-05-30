"use strict";

import { ViewerImageAPI } from "./ViewerImageAPI.js";
import { ViewerFloorAPI } from "./ViewerFloorAPI.js"
import { ViewerPanoAPI } from "./ViewerPanoAPI.js";
import { ViewerMapAPI } from "./ViewerMapAPI.js"
import { ViewerState } from "./ViewerState.js";
import { libraryInfo } from "./LibraryInfo.js";
import { ViewerVersionAPI } from "./ViewerVersionAPI.js";
import { distanceWGS84TwoPoints } from "./Globals.js";


// API provided by the viewer
export class ViewerAPI {

    constructor(baseURL) {
        this.libs = libraryInfo();              // : [ViewerLibrary] // List of used third party libraries
        this.version = new ViewerVersionAPI(    // : ViewerVersionAPI // Version API
            0.6, // Sprint 6
            NaN,
            "three.js 0.128.0 360 pano image viewer"
        );
        this.jQuery = $;
        this.THREE = THREE;


        this.listeners = [];
        
        this.renderer;
        // Load the metadata only once
        $.ajax({
            url: baseURL + "data.json",
            context: this,
            xhrFields: {
                withCredentials: true
            }
        }).done((data) => {
            this.viewerImageAPI = new ViewerImageAPI(data.images);   // "image" in API docu
            this.viewerFloorAPI = new ViewerFloorAPI(data, this);    // "floor" in API docu

            this.viewerPanoAPI = new ViewerPanoAPI(this);                // "pano" in API docu
            this.viewerMapAPI= new ViewerMapAPI(this);                   // "map" in API docu

            // the only html element we work with (the pano-viewer div)
            const container = document.getElementById('pano-viewer');

            // create the renderer, and embed the attributed dom element in the html page
            this.renderer = new THREE.WebGLRenderer();
            this.renderer.setPixelRatio(window.devicePixelRatio);
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.renderer.autoClear = false; // To allow render overlay on top of panorama scene
            this.renderer.sortObjects = false;

            container.appendChild(this.renderer.domElement);
            
            // start animation loop
            this.animate();
        });

    }

    animate() {
        window.requestAnimationFrame(() => this.animate());
        this.viewerPanoAPI.viewInternal();
        this.renderer.clear();
        this.renderer.render(this.viewerPanoAPI.scene, this.viewerPanoAPI.camera);
        this.renderer.clearDepth();
        this.renderer.render(this.viewerMapAPI.scene, this.viewerMapAPI.camera);
    }

    //Move the view to the nearest (euclidian distance) panorama to the given position. (ignore z value because only called on same floor)
    move(lon, lat, z) {
        let minDistance = 1000000000;
        let bestImg;
        this.viewerFloorAPI.currentFloor.viewerImages.forEach(element => {
            const currDistances = distanceWGS84TwoPoints(lon, lat, element.pos[0], element.pos[1]);
            const currDistance = Math.sqrt(currDistances[0] * currDistances[0] + currDistances[1] * currDistances[1]);
            if (currDistance < minDistance) {
                minDistance = currDistance;
                bestImg = element;
            }
        });

        // avoid duplication
        if (bestImg != this.viewerImageAPI.currentImage) {
            
            this.viewerPanoAPI.display(bestImg.id);
            this.viewerMapAPI.redraw();

        }
    }

    /*
    Register a listener for events sent by the viewer.
        Parameters: - listener: Function
        Function to call for events

        This callback will be called with the arguments:
        - name (String): Event name
        - payload (Any): Event payload (see the specified event payload for the individual events)
        - human (Boolean): Event caused by human
    */
    listen(listener) {
        this.listeners.push(listener);
    }

    propagateEvent(name, payload, human) {
        this.listeners.forEach((listener) => {
            listener(name, payload, human);
        });
    }

    /*
    Get the state from the viewer.
        Parameters: - callback: Function
        Function called with state

        This callback will be called with the argument:
        - state (ViewerState): State of the viewer
    */
    state(callback) {
        const currentState = new ViewerState(
            this.viewerImageAPI.currentImage.pos,
            this.viewerImageAPI.currentImage.id,
            this.viewerFloorAPI.currentFloor.name,
            this.viewerPanoAPI.viewerViewState
        );

        callback(currentState);
    }

    // TODO: swap() and big(wanted) 
    // TODO: toGlobal / toLocal

}
