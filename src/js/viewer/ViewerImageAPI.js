"use strict";
import { ViewerImage } from "./ViewerImage.js";

// Specific API for Panorama Image(s)
export class ViewerImageAPI {

    constructor(imagedata) {
        this.images = [];
        
        // iterate over images
        imagedata.forEach((elem, index) => { this.images.push(new ViewerImage(elem, index)) });

        this.currentImageId; // initially set in ViewerFloorAPI:const, updated in ViewerPanoAPI:display
    }

    get currentImage() {
        return this.images[this.currentImageId];
    }

    all(callback) {
        // Get all panorama images.
        // Parameters: Function called with all images ([ViewerImage]): Array of panorama images
        callback(this.images);
    }

    changed() {
        //  Signal changed image data (e.g. hidden flag) to the viewer.
    }

    get get() {
        // Get the currently displayed panorama image.
        return this.currentImage();
    }

}
