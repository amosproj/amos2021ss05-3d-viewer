"use strict";
import { ViewerImage } from "./ViewerImage.js";

// Specific API for Panorama Image(s)
export class ViewerImageAPI {

    constructor(data) {
        // The file «data.json» contains the metadata defining the panorama image locations.
            //"images" Array Images Array
            //"lon0" Number Reference longitude of model (WGS 84)
            //"lat0" Number Reference latitude of model (WGS 84)
            //"floors" Object Floors Object
    
        this.origin = [data.lon0, data.lat0];
        this.floors = [];

        // iterate over floors
        Object.keys(data.floors).forEach((key) => {
            let currentFloor = new Floor(data.floors[key], key);

            // iterate over imageNums for this floor
            for (let i = currentFloor.i[0]; i < currentFloor.i[0]; i++) {
                // FOR NOW STOP AT 3, because only 3 images in data model
                if (i == 3) break;
                //
                let currentImage = new ViewerImage(data.images[i], i, key);
                
                currentFloor.viewerImages.push(currentImage);
            }

            this.floors.push(currentFloor);
        });

        this.currentFloorId = 0;
        this.currentImageId = 0; // inside the range of current Floors viewerImages array;
    }
    
    get currentFloor() {
        return this.floors[currentFloorId];
    }

    get currentImage() {
        return this.currentFloor().viewerImages[this.currentImageId];
    }

    all ( callback ) {
     //    Get all panorama images.
    // Parameters:  Function called with all images ([ViewerImage]): Array of panorama images
        //callback(this.viewerImages);
    }

    changed (  ) {
        //  Signal changed image data (e.g. hidden flag) to the viewer.
    }

    get get() {
        // Get the currently displayed panorama image.

        return this.currentImage();
    }

}

class Floor {
    
    constructor(floorData, key) {
        this.name = key;
        this.z = floorData.z; 
        this.viewerImages = [];
        this.mapData = floorData.map;

        this.i = floorData.i[0];
    }

}