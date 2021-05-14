"use strict";

import { getFolderNumber } from "../viewer/Globals.js";

// API provided by the viewer
export class ViewerAPI {

    constructor(viewerImageAPI, viewerPanoAPI) {
        this.min = 1;
        this.viewerImageAPI = viewerImageAPI;
        this.viewerPanoAPI = viewerPanoAPI;
    }


    //Move the view to the given position.
    move(lon, lat, z) {

        let temp = [lon, lat, z];
        let resultset = [];
        let minval;
        let minkey;

        for (let i in this.viewerImageAPI.currentFloor.viewerImages) {
            let result = Math.sqrt(
                Math.pow(this.viewerImageAPI.currentFloor.viewerImages[i].pos[0] - temp[0], 2) +
                Math.pow(this.viewerImageAPI.currentFloor.viewerImages[i].pos[1] - temp[1], 2) +
                Math.pow(this.viewerImageAPI.currentFloor.viewerImages[i].pos[2] - temp[2], 2) ); // z value probably doesnt/should matter (see WGS84distance in Globals)
            resultset.push(result);  
        }

        console.log(resultset);
        minkey = 0;
        minval = resultset[0];
        for (let i in resultset) {
            if (resultset[i] < minval) {
                minval = resultset[i];
                minkey = i;
            }
        }
        console.log(minkey);
        console.log(minval);

        this.min = minkey;

        
        // avoid duplication
        if (this.min != this.viewerImageAPI.currentImageId){

            // Create a Sphere for the image texture to be displayed on
            const sphere = new THREE.SphereGeometry(500, 60, 40);
            // invert the geometry on the x-axis so that we look out from the middle of the sphere
            sphere.scale( -1, 1, 1);

            // load the 360-panorama image data (one specific hardcoded for now)
            const texturePano = new THREE.TextureLoader().load('../assets/' + getFolderNumber(this.min) + '/' + this.min + 'r3.jpg');
            texturePano.mapping = THREE.EquirectangularReflectionMapping; // not sure if this line matters
            
            // put the texture on the spehere and add it to the scene
            const material = new THREE.MeshBasicMaterial({ map: texturePano });
            const mesh = new THREE.Mesh(sphere, material);
            this.viewerPanoAPI.scene.add(mesh);
        }
    }


}