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

    calcImagesInPanoSphere(radius, viewerAPI) {
        if (this.currentImage.imagesInRadius != null) return this.currentImage.imagesInRadius; // already calculated

        this.currentImage.imagesInRadius = [];

        const currGlobalPos = this.currentImage.pos;
        const currLocalPos = viewerAPI.toLocal([currGlobalPos[0], currGlobalPos[1], currGlobalPos[2]]);

        viewerAPI.floor.currentFloor.viewerImages.forEach(element => {
            const loopLocalPos = viewerAPI.toLocal(element.pos);
            const [dx, dy] = [currLocalPos.x - loopLocalPos.x, currLocalPos.y - loopLocalPos.y];
            const currDistance = Math.sqrt(dx * dx + dy * dy);

            if (currDistance <= radius) {
                this.currentImage.imagesInRadius.push(element);
            }
        });

        if (this.currentImage.imagesInRadius == []) {
            console.error("No other positions found in sphere radius");
        }

        return this.currentImage.imagesInRadius;
    }

}
