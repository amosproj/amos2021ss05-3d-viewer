"use strict";

import { ViewerImageAPI } from "./ViewerImageAPI.js";
import { ViewerFloorAPI } from "./ViewerFloorAPI.js"
import { ViewerPanoAPI } from "./ViewerPanoAPI.js";
import { ViewerMapAPI } from "./ViewerMapAPI.js"
import { ViewerState } from "./ViewerState.js";
import { libraryInfo } from "./LibraryInfo.js";
import { ViewerVersionAPI } from "./ViewerVersionAPI.js";


// API provided by the viewer
export class ViewerAPI {

    constructor(baseURL) {
        this.libs = libraryInfo();              // : [ViewerLibrary] // List of used third party libraries
        this.version = new ViewerVersionAPI(    // : ViewerVersionAPI // Version API
            0.7, // Sprint 7
            NaN,
            "three.js 0.128.0 360 pano image viewer"
        );
        this.jQuery = $;
        this.THREE = THREE;

        // globals
        this.textureLoader = new THREE.TextureLoader().setCrossOrigin('use-credentials');
        this.baseURL = baseURL;

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
            this.image = new ViewerImageAPI(data.images);
            this.floor = new ViewerFloorAPI(data, this);

            this.pano = new ViewerPanoAPI(this);
            this.map = new ViewerMapAPI(this);

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
        this.pano.viewInternal();
        this.renderer.clear();
        this.renderer.render(this.pano.scene, this.pano.camera);
        this.renderer.clearDepth();
        this.renderer.render(this.map.scene, this.map.camera);
    }

    //Move the view to the nearest (euclidian distance) panorama to the given position. (ignore z value because only called on same floor)
    move(lon, lat, z) {
        const localPos = this.toLocal([lon, lat, z]);

        let minDistance = 1000000000;
        let bestImg;
        
        this.floor.currentFloor.viewerImages.forEach(element => {
            const currLocalPos = this.toLocal(element.pos);
            const currDistances = [localPos.x - currLocalPos.x, localPos.y - currLocalPos.y];
            const currDistance = Math.sqrt(currDistances[0] * currDistances[0] + currDistances[1] * currDistances[1]);
        
            if (currDistance < minDistance) {
                minDistance = currDistance;
                bestImg = element;
            }
        
        });

        // avoid duplication
        if (bestImg != this.image.currentImage) {
            this.pano.display(bestImg.id);
            this.map.redraw();
            return bestImg;
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
        return this;
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
            this.image.currentImage.pos,
            this.image.currentImage.id,
            this.floor.currentFloor.name,
            this.pano.viewerViewState
        );

        callback(currentState);
    }

    // Convert the local metric three.js coordinates used by the viewer to WGS 84 coordinates [longitude, latitude, z].
    toGlobal(localCoords) {
        // localCoords : THREE.Vector3 // Local coordinates used by the viewer
        const globalX = this.floor.origin[0] - (localCoords.x / 71.5);
        const globalY = this.floor.origin[1] - (localCoords.y / 111.3);
        const globalZ = this.floor.currentFloor.z + localCoords.z;

        return [globalX, globalY, globalZ];
        // Returns: [Number] : WGS 84 coordinates [longitude, latitude, z] (z value is floorZ + panoZ, where localCoords is just the panoZ)
    }

    // Convert WGS 84 coordinates (globalCoords : [longitude, latitude, z]) to the local metric three.js coordinates used by the viewer.
    // z value should be the panoZ + floorZ or image
    toLocal(globalCoords) {
        // Distance calculation math taken from here https://www.mkompf.com/gps/distcalc.html
        const dx = 71.5 * (this.floor.origin[0] - globalCoords[0]);
        const dy = 111.3 * (this.floor.origin[1] - globalCoords[1]);
            
        // The more accurate calculation breaks the pixel offset on the precreated maps
        //const avgLat = (lat1 + lat2) / 2 * 0.01745;
        //dx = 111.3 * Math.cos(THREE.MathUtils.degToRad(avgLat)) * (lon1 - lon2);
        
        return new this.THREE.Vector3(dx * 1000, dy * 1000, globalCoords[2] - this.floor.currentFloor.z);
        // Returns: THREE.Vector3 : Local coordinates
    }

    // TODO: swap() and big(wanted)

}
