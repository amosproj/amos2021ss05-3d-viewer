"use strict";

import { ViewerContextItem } from "./ViewerContextItem.js";


export class TestViewerAPI {

    constructor(viewerAPI) {
        this.viewerAPI = viewerAPI;
    }

    eventMeshTest(x = 0, y = 0, z = -2, exclude = ["vwr_onpointer", "vwr_ondrag"]) {
        // visual test, spawn in white sphere at first image position in scene (offset specified by parameters)
        const sphere = new this.viewerAPI.THREE.SphereGeometry(1 / 5, 10, 10);
        const testMesh = new this.viewerAPI.THREE.Mesh(sphere, new this.viewerAPI.THREE.MeshBasicMaterial());
        const startPos = this.viewerAPI.toLocal(this.viewerAPI.image.currentImage.pos);
        testMesh.position.set(startPos.x + x, startPos.y + y, startPos.z + z);

        if (!exclude.includes("vwr_onclick")) {
            testMesh.vwr_onclick = function (xy, position) {
                this.material.color.set(0xff0000); // as a test set color red
                console.log("vwr_onclick is triggered.");
                console.log("Pointer position: ", xy);
                console.log("Local coordinate for pointer position: ", position);
                return true;
            }
        }

        if (!exclude.includes("vwr_oncontext")) {
            testMesh.vwr_oncontext = function (xy, position) {
                this.material.color.set(0x00ff00); // as a test set color green
                console.log("vwr_oncontext is triggered.");
                console.log("Pointer position: ", xy);
                console.log("Local coordinate for pointer position: ", position);

                //Creating callback function for context menu item:
                let callback = function (key, options) {
                    var msg = 'clicked: ' + key;
                    (window.console && console.log(msg)) || alert(msg);
                };

                //Creating item objects
                let itemEdit = new ViewerContextItem(callback, "edit", null, "Edit");
                let itemCut = new ViewerContextItem(callback, "cut", null, "Cut");

                //Creating list of item objects.
                return [itemEdit, itemCut];
            }
        }

        if (!exclude.includes("vwr_onpointer")) {
            testMesh.vwr_onpointerenter = function () {
                this.material.color.set(0xffff00); // as a test set color yellow
                console.log("vwr_onpointerenter is triggered.");
            }
            
            testMesh.vwr_onpointerleave = function () {
                this.material.color.set(0x0000ff); // as a test set color blue
                console.log("vwr_onpointerleave is triggered.");
            }
        }

        if (!exclude.includes("vwr_ondrag")) {
            testMesh.vwr_ondragstart = function (xy, position) {
                this.material.color.set(0xff0000); // as a test set color red
                console.log("vwr_ondragstart is triggered.");
                console.log("Pointer position: ", xy);
                console.log("Local coordinate for pointer position: ", position);
                return true;
            }

            testMesh.vwr_ondrag = function (xy, position) {
                this.material.color.set(0x00ff00); // as a test set color green
                console.log("vwr_ondrag is triggered.");
                //console.log("Pointer position: " , xy);
                //console.log("Local coordinate for pointer position: " , position);
            }

            testMesh.vwr_ondragend = function () {
                this.material.color.set(0x0000ff); // as a test set color blue
                console.log("vwr_ondragend is triggered.");
            }
        }

        this.viewerAPI.pano.addLayer(testMesh);
    }

    addListeners() {
        const logIt = function (name, payload, human) {
            const h = human ? " by user" : " not by user";
            if (name == "moved") {
                console.log(name + " to " + payload + h);
            } else if (name == "viewed") {
                console.log(name + " " + payload.lonov + " " + payload.latov + " " + payload.fov + h);
            } else if (name == "floor") {
                console.log(name + " " + payload + h);
            }
        }

        this.viewerAPI.listen(logIt);
    }

}