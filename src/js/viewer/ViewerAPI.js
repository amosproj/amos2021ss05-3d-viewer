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
        }).then(() => {
            // --- EventMesh TEST ---
            // visual test, spawn in white sphere at first image position in scene
            const sphere = new THREE.SphereGeometry(1 / 5, 10, 10);
            const testMesh = new THREE.Mesh(sphere, new THREE.MeshBasicMaterial());
            const startPos = this.toLocal(this.image.currentImage.pos);
            testMesh.position.set(startPos.x, startPos.y - 2, startPos.z);

            testMesh.vwr_onclick = function () {
                console.log("vwr_onclick is triggered.");
            }

            testMesh.vwr_oncontext = function () {
                console.log("vwr_oncontext is triggered.");
            }

            testMesh.vwr_onpointerenter = function () {
                console.log("vwr_onpointerenter is triggered.");
            }

            testMesh.vwr_onpointerleave = function () {
                console.log("vwr_onpointerleave is triggered.");
            }

            this.pano.addLayer(testMesh);
            // panoDiv.eventListener(onMove, check with raycaster if cursor over sphere, call vwr_onpointerenter or vwr_onpointerleave)
            // panoDiv.eventListener(onClick, check with raycaster if cursor over sphere, call vwr_onclick)
            // panoDiv.eventListener(onRightClick, check with raycaster if cursor over sphere, call vwr_oncontext )

            // --- ---

            // the only html element we work with (the pano-viewer div)
            const panoDiv = document.getElementById('pano-viewer');

            // create the renderer, and embed the attributed dom element in the html page
            this.renderer = new THREE.WebGLRenderer();
            this.renderer.setPixelRatio(window.devicePixelRatio);
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.renderer.autoClear = false; // To allow render overlay on top of panorama scene
            this.renderer.sortObjects = false;

            panoDiv.appendChild(this.renderer.domElement);

            // start animation loop
            this.animate();
        });
    }

    animate() {
        window.requestAnimationFrame(() => this.animate());
        this.pano.view(this.pano.viewerViewState.lonov, this.pano.viewerViewState.latov, this.pano.viewerViewState.fov);
        this.renderer.clear();
        this.renderer.render(this.pano.scene, this.pano.camera);
    }

    //Move the view to the nearest (euclidian distance) panorama to the given position. (ignore z value because only called on same floor)
    move(lon, lat, z) {
        const localPos = this.toLocal([lon, lat, z]);

        let minDistance = 1000000000;
        let bestImg;

        this.floor.currentFloor.viewerImages.forEach(element => {
            const currLocalPos = this.toLocal(element.pos);
            const [dx, dz] = [localPos.x - currLocalPos.x, localPos.z - currLocalPos.z];
            const currDistance = Math.sqrt(dx * dx + dz * dz);

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
        const globalX = this.floor.origin[0] - ((localCoords.x / 1000) / 71.5);
        const globalY = this.floor.origin[1] - ((-localCoords.z / 1000) / 111.3);
        const globalZ = localCoords.y - this.floor.currentFloor.z;

        // the three js scene sees the y axis as the up-down axis so we have to swap with z
        return [globalX, globalY, globalZ];
        // Returns: [Number] : WGS 84 coordinates [longitude, latitude, z] (z value is floorZ + panoZ, where localCoords is just the panoZ)
    }

    // Convert WGS 84 coordinates (globalCoords : [longitude, latitude, z]) to the local metric three.js coordinates used by the viewer.
    // z value should be the panoZ + floorZ of image
    toLocal(globalCoords) {
        // Distance calculation math taken from here https://www.mkompf.com/gps/distcalc.html
        // The more accurate calculation breaks the pixel offset on the pre-created maps
        const dx = 71.5 * (this.floor.origin[0] - globalCoords[0]);
        const dz = 111.3 * (this.floor.origin[1] - globalCoords[1]);

        return new this.THREE.Vector3(
            dx * 1000,
            globalCoords[2] + this.floor.currentFloor.z,
            -dz * 1000);
    }

    // TODO: swap() and big(wanted)

}
