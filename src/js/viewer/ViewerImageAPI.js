"use strict";
import { ViewerImage } from "./ViewerImage.js";

// Specific API for Panorama Image(s)
export class ViewerImageAPI {

    constructor( data ) {
        // The file «data.json» contains the metadata defining the panorama image locations.
            //"images" Array Images Array
            //"lon0" Number Reference longitude of model (WGS 84)
            //"lat0" Number Reference latitude of model (WGS 84)
            //"floors" Object Floors Object
    
        this.origin = [data.lon0, data.lat0];
        this.floors = data.floors;
        this.viewerImages = [];

        data.images.forEach( (element, index) => {
            this.viewerImages.push(new ViewerImage(element, index));
        });

        this.currentFloorId = 0;
        this.currentImageId = 0;

        console.log(this);
    }
    
    get currentFloor() {
        return this.floors[Object.keys(this.floors)[this.currentImageId]];
    }

    get currentImage() {
        return this.viewerImages[this.currentFloorId];
    }

    all ( callback ) {
     //    Get all panorama images.
    // Parameters:  Function called with all images ([ViewerImage]): Array of panorama images
        callback(this.viewerImages);
    }

    changed (  ) {
        //  Signal changed image data (e.g. hidden flag) to the viewer.
    }

    get get() {
        // Get the currently displayed panorama image.

        return this.currentImage;
    }
}